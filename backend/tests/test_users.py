import pytest
from asgi_lifespan import LifespanManager
from httpx import AsyncClient, ASGITransport

import backend.main as main
from backend.main import app
from backend import db as db_module
from backend.config import settings


class FakeCursor:
    def __init__(self, items):
        self._iter = iter(items)

    def __aiter__(self):
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration

class FakeCollection:
    def __init__(self):
        self.docs = []

    async def find_one(self, query, projection=None):
        for d in self.docs:
            ok = True
            for k, v in query.items():
                if d.get(k) != v:
                    ok = False
                    break
            if ok:
                return d
        return None

    def find(self, query, projection=None):
        # Simplificado: retorna todos o nada, no filtra realmente en este fake básico
        # Para list_users se llama con {}
        return FakeCursor(self.docs)

    async def insert_one(self, doc):
        self.docs.append(doc)
        return {"inserted_id": doc.get("email")}

    async def delete_one(self, query):
        initial_len = len(self.docs)
        self.docs = [d for d in self.docs if not all(d.get(k) == v for k, v in query.items())]
        deleted_count = initial_len - len(self.docs)
        
        from unittest.mock import MagicMock
        res = MagicMock()
        res.deleted_count = deleted_count
        return res


class FakeDBUsers:
    def __init__(self):
        self.collections = {"usuarios": FakeCollection()}

    def __getitem__(self, name):
        return self.collections[name]


@pytest.fixture
async def client_users():
    # Prepara DB simulada y configuración de admin
    db_module.client = object()
    db_module.db_users = FakeDBUsers()
    settings.AI_DISABLED = True
    settings.ADMIN_EMAIL = "admin@test.com"
    settings.ADMIN_PASSWORD = "secret"
    # Evita conexiones reales durante startup/shutdown
    async def _noop():
        return None
    main.connect = _noop  # type: ignore
    main.disconnect = _noop  # type: ignore
    transport = ASGITransport(app=app, raise_app_exceptions=True)
    async with LifespanManager(app):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac


@pytest.mark.asyncio
async def test_seed_admin_missing_config_returns_400(client_users):
    # Desactiva config de admin temporalmente
    settings.ADMIN_EMAIL = ""
    settings.ADMIN_PASSWORD = ""
    resp = await client_users.post("/api/users/seed-admin")
    assert resp.status_code == 400
    assert "no configurados" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_seed_admin_success_and_idempotent(client_users):
    # Restaura config y crea admin, debe ser idempotente
    settings.ADMIN_EMAIL = "admin@test.com"
    settings.ADMIN_PASSWORD = "secret"
    resp1 = await client_users.post("/api/users/seed-admin")
    assert resp1.status_code == 200
    assert resp1.json()["ok"] is True
    resp2 = await client_users.post("/api/users/seed-admin")
    assert resp2.status_code == 200
    assert resp2.json()["ok"] is True
    # Solo un admin insertado
    assert len(db_module.db_users["usuarios"].docs) == 1


@pytest.mark.asyncio
async def test_register_and_login_flow(client_users):
    # Registro de usuario nuevo
    payload = {
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan@example.com",
        "telefono": "+56912345678",
        "password": "clave",
    }
    resp = await client_users.post("/api/users/register", json=payload)
    assert resp.status_code == 200
    assert resp.json()["ok"] is True

    # Registro duplicado debe fallar con 400
    resp_dup = await client_users.post("/api/users/register", json=payload)
    assert resp_dup.status_code == 400


@pytest.mark.asyncio
async def test_admin_list_and_delete_users(client_users):
    from backend.security import create_jwt
    from backend.config import settings

    # 1. Crear usuario normal
    payload = {
        "nombre": "User", "apellido": "Test", "email": "user@test.com",
        "telefono": "123", "password": "pass"
    }
    await client_users.post("/api/users/register", json=payload)

    # 2. Intentar listar sin token -> 401
    resp = await client_users.get("/api/users")
    assert resp.status_code == 401

    # 3. Intentar listar con token usuario normal -> 403
    secret = settings.ADMIN_PASSWORD or "todobaratisimo_dev_secret"
    token_user = create_jwt({"sub": "user@test.com", "role": "user"}, secret)
    headers_user = {"Authorization": f"Bearer {token_user}"}
    
    resp = await client_users.get("/api/users", headers=headers_user)
    assert resp.status_code == 403

    # 4. Listar con token admin -> 200
    token_admin = create_jwt({"sub": "admin@test.com", "role": "admin"}, secret)
    headers_admin = {"Authorization": f"Bearer {token_admin}"}
    
    resp = await client_users.get("/api/users", headers=headers_admin)
    assert resp.status_code == 200
    users = resp.json()
    assert len(users) >= 1
    found = any(u["email"] == "user@test.com" for u in users)
    assert found

    # 5. Borrar usuario (admin)
    resp = await client_users.delete("/api/users/user@test.com", headers=headers_admin)
    assert resp.status_code == 200
    assert resp.json()["deleted"] == 1

    # Verificar que ya no está
    resp = await client_users.get("/api/users", headers=headers_admin)
    users = resp.json()
    found = any(u["email"] == "user@test.com" for u in users)
    assert not found


@pytest.mark.asyncio
async def test_login_dev_mode_no_db(client_users):
    # Simular DB no disponible
    db_module.client = None
    db_module.db_users = None
    
    settings.ADMIN_EMAIL = "admin@dev.com"
    settings.ADMIN_PASSWORD = "devpass"
    
    # Login correcto
    resp = await client_users.post("/api/users/login", json={"email": "admin@dev.com", "password": "devpass"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["isAdmin"] is True
    assert "token" in data
    
    # Login incorrecto
    resp = await client_users.post("/api/users/login", json={"email": "admin@dev.com", "password": "wrong"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_standard_login_flow(client_users):
    # Registro de usuario
    payload = {
        "nombre": "Juan", "apellido": "Pérez", "email": "juan@example.com",
        "telefono": "123", "password": "clave"
    }
    await client_users.post("/api/users/register", json=payload)

    # Login incorrecto
    bad_login = await client_users.post("/api/users/login", json={"email": "juan@example.com", "password": "mala"})
    assert bad_login.status_code == 401

    # Login correcto
    good_login = await client_users.post("/api/users/login", json={"email": "juan@example.com", "password": "clave"})
    assert good_login.status_code == 200
    data = good_login.json()
    assert data["isAdmin"] is False
    assert data["user"]["email"] == "juan@example.com"


@pytest.mark.asyncio
async def test_login_admin_after_seed(client_users):
    # Asegura admin y hace login
    settings.ADMIN_EMAIL = "admin@test.com"
    settings.ADMIN_PASSWORD = "secret"
    await client_users.post("/api/users/seed-admin")
    resp = await client_users.post("/api/users/login", json={"email": "admin@test.com", "password": "secret"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["isAdmin"] is True
    assert data["user"]["email"] == "admin@test.com"

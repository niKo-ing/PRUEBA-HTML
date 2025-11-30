import pytest
from asgi_lifespan import LifespanManager
from httpx import AsyncClient, ASGITransport

import backend.main as main
from backend.main import app
from backend import db as db_module
from backend.config import settings


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

    async def insert_one(self, doc):
        self.docs.append(doc)
        return {"inserted_id": doc.get("email")}


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

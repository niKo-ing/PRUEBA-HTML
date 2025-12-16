import pytest


@pytest.mark.asyncio
async def test_products_fallback_without_db(client):
    resp = await client.get("/api/products")
    assert resp.status_code == 200
    items = resp.json()
    assert isinstance(items, list)
    assert len(items) > 0
    first = items[0]
    assert "id" in first and "nombre" in first and "precio" in first


@pytest.mark.asyncio
async def test_products_with_db_returns_items(client):
    # Simula una DB con documentos
    from backend import db as db_module

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
        def __init__(self, docs):
            self.docs = docs

        def find(self, query, projection=None):
            return FakeCursor(self.docs)

    class FakeDBMain:
        def __init__(self, docs):
            self._col = FakeCollection(docs)

        def __getitem__(self, name):
            if name == "productos":
                return self._col
            raise KeyError(name)

    fake_docs = [{"id": 1, "nombre": "Producto DB", "precio": 12345}]
    db_module.client = object()
    db_module.db_main = FakeDBMain(fake_docs)

    resp = await client.get("/api/products")
    assert resp.status_code == 200
    items = resp.json()
    assert isinstance(items, list)
    assert len(items) == 1
    assert items[0]["nombre"] == "Producto DB"


@pytest.mark.asyncio
async def test_bulk_upsert_products(client):
    from backend import db as db_module
    from backend.security import create_jwt
    from backend.config import settings
    from unittest.mock import AsyncMock, MagicMock

    # 1. Sin token -> 401
    resp = await client.post("/api/products/bulk-upsert", json=[])
    assert resp.status_code == 401

    # 2. Token inválido/no admin -> 403
    secret = settings.ADMIN_PASSWORD or "todobaratisimo_dev_secret"
    token_user = create_jwt({"sub": "user", "role": "user"}, secret)
    headers = {"Authorization": f"Bearer {token_user}"}
    resp = await client.post("/api/products/bulk-upsert", json=[], headers=headers)
    assert resp.status_code == 403

    # 3. DB no disponible -> 503
    db_module.client = None
    db_module.db_main = None
    token_admin = create_jwt({"sub": "admin", "role": "admin"}, secret)
    headers_admin = {"Authorization": f"Bearer {token_admin}"}
    
    # Payload válido
    payload = [{
        "id": 101, "nombre": "Nuevo", "precio": 9990, "stock": 10, "categoria": "cat"
    }]
    resp = await client.post("/api/products/bulk-upsert", json=payload, headers=headers_admin)
    assert resp.status_code == 503

    # 4. Éxito (Mock DB)
    db_module.client = object()
    mock_col = AsyncMock()
    mock_col.replace_one.return_value = MagicMock(matched_count=0, modified_count=0, upserted_id="123")
    
    mock_db = MagicMock()
    mock_db.__getitem__.return_value = mock_col
    db_module.db_main = mock_db

    resp = await client.post("/api/products/bulk-upsert", json=payload, headers=headers_admin)
    assert resp.status_code == 200
    assert resp.json()["upserted"] == 1


@pytest.mark.asyncio
async def test_delete_product(client):
    from backend import db as db_module
    from backend.security import create_jwt
    from backend.config import settings
    from unittest.mock import AsyncMock, MagicMock

    secret = settings.ADMIN_PASSWORD or "todobaratisimo_dev_secret"
    token_admin = create_jwt({"sub": "admin", "role": "admin"}, secret)
    headers = {"Authorization": f"Bearer {token_admin}"}

    # 1. DB no disponible -> 503
    db_module.client = None
    db_module.db_main = None
    resp = await client.delete("/api/products/123", headers=headers)
    assert resp.status_code == 503

    # 2. Éxito
    db_module.client = object()
    mock_col = AsyncMock()
    mock_col.delete_one.return_value = MagicMock(deleted_count=1)
    
    mock_db = MagicMock()
    mock_db.__getitem__.return_value = mock_col
    db_module.db_main = mock_db

    resp = await client.delete("/api/products/123", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["deleted"] == 1


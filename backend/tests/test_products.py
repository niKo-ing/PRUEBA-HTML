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

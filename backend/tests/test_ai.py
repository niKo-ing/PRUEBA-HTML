import pytest
from backend.routers.ai import detect_intent, search_products
from backend import db as db_module
from backend.config import settings


@pytest.mark.asyncio
async def test_ai_ask_returns_503_when_disabled(client):
    payload = {"question": "¿Qué teclado gamer recomiendas?", "productId": None, "context": None}
    resp = await client.post("/api/ai/ask", json=payload)
    assert resp.status_code == 503
    assert "desactivada" in resp.json()["detail"].lower()


def test_detect_intent_extracts_budget_category_and_rgb():
    info = detect_intent("Busco teclado con presupuesto hasta 40k, sin RGB")
    assert info["intent"] == "search_products"
    slots = info["slots"]
    assert slots.get("max_price") == 40000
    assert slots.get("rgb") is False
    # categoría puede normalizarse si aparece
    assert slots.get("category") == "teclado" or "teclado" in slots.values()


@pytest.mark.asyncio
async def test_search_products_fallback_without_db():
    # Forzar modo fallback (sin DB)
    db_module.db_main = None
    items = await search_products("teclado", limit=3)
    assert isinstance(items, list)
    assert len(items) >= 1
    assert any("teclado" in (i.get("slug", "") + i.get("nombre", "")).lower() for i in items)


@pytest.mark.asyncio
async def test_ai_ask_enabled_without_vertex_returns_503(client):
    # Habilita IA pero sin configurar Vertex; el endpoint debe devolver 503 explícito
    settings.AI_DISABLED = False
    db_module.db_main = None
    payload = {"question": "Busca mouse gamer", "productId": None, "context": None}
    resp = await client.post("/api/ai/ask", json=payload)
    assert resp.status_code == 503
    assert "vertex ai" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_search_products_filters_min_max_price_and_rgb():
    # Fallback, con filtros de precio y RGB
    db_module.db_main = None
    slots = {"min_price": 30000, "max_price": 70000, "rgb": True}
    items = await search_products("teclado", limit=5, slots=slots)
    assert all(isinstance(i.get("precio"), int) and 30000 <= i["precio"] <= 70000 for i in items)


@pytest.mark.asyncio
async def test_search_products_filter_category_mouse():
    # Busca por categoría mouse en fallback
    db_module.db_main = None
    items = await search_products("mouse", limit=5)
    assert len(items) >= 1
    assert any("mouse" in (i.get("slug", "") + i.get("nombre", "")).lower() for i in items)


@pytest.mark.asyncio
async def test_search_products_filter_size_switch_keywords():
    # Simula filtros de tamaño y switch para teclado
    db_module.db_main = None
    slots = {"size": "tkl", "switch": "rojos", "rgb": True}
    items = await search_products("teclado", limit=5, slots=slots)
    assert isinstance(items, list)

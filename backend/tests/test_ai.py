import pytest
from unittest.mock import MagicMock, patch
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
    settings.AI_REQUIRE_VERTEX = True
    
    # Asegurar model=None
    with patch("backend.routers.ai.model", None):
        payload = {"question": "Busca mouse gamer", "productId": None, "context": None}
        resp = await client.post("/api/ai/ask", json=payload)
        assert resp.status_code == 503
        assert "vertex ai" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_ai_ask_fallback_mode(client):
    # Prueba el modo fallback cuando Vertex AI no está disponible y no es requerido
    settings.AI_DISABLED = False
    settings.AI_REQUIRE_VERTEX = False
    
    # Asegurar que model es None (simulando fallo en init o no configuración)
    # Como 'model' es una variable global en el módulo router, necesitamos mockearla o asegurarnos que sea None
    # En este entorno de test, probablemente ya sea None si no hay credenciales.
    # Pero para estar seguros, parcheamos router.ai.model
    with patch("backend.routers.ai.model", None):
        payload = {"question": "busco mouse", "productId": None, "context": None}
        resp = await client.post("/api/ai/ask", json=payload)
        
        assert resp.status_code == 200
        data = resp.json()
        assert data["fallback"] is True
        assert "Asistente en modo básico" in data["answer"]
        assert data["intent"]["intent"] == "search_products"


@pytest.mark.asyncio
async def test_ai_ask_vertex_error(client):
    # Simula error 502 cuando Vertex falla
    settings.AI_DISABLED = False
    settings.AI_REQUIRE_VERTEX = False # O True, pero queremos llegar a llamar al modelo
    
    mock_model = MagicMock()
    mock_model.generate_content.side_effect = Exception("Vertex failure")
    
    with patch("backend.routers.ai.model", mock_model):
        payload = {"question": "hola", "productId": None, "context": None}
        resp = await client.post("/api/ai/ask", json=payload)
        
        assert resp.status_code == 502
        assert "Error Vertex AI" in resp.json()["detail"]



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


def test_detect_intent_all_cases():
    # 1. Marcas
    info = detect_intent("tienes productos logitech?")
    assert info["slots"]["brand"] == "logitech"

    # 2. Switches
    info = detect_intent("busco teclado con switch azul")
    assert info["slots"]["switch"] == "azules"
    info = detect_intent("switch brown tactil")
    assert info["slots"]["switch"] == "marrones"

    # 3. Tamaños
    info = detect_intent("teclado 60%")
    assert info["slots"]["size"] == "60%"
    info = detect_intent("teclado completo")
    assert info["slots"]["size"] == "full"

    # 4. Intents varios
    assert detect_intent("hay ofertas?")["intent"] == "offers"
    assert detect_intent("medios de pago")["intent"] == "payments"
    assert detect_intent("cuanto sale el envio?")["intent"] == "shipping"
    assert detect_intent("tengo un problema")["intent"] == "support"
    assert detect_intent("que puede hacer")["intent"] == "capabilities" # Corregido: 'puedes' no está en la lista, 'puede' sí
    assert detect_intent("recomendar algo")["intent"] == "search_products"


@pytest.mark.asyncio
async def test_search_products_with_mock_db():
    # Helper para simular cursor de Motor
    class MockAsyncCursor:
        def __init__(self, items):
            self.items = items
            self.iter = iter(items)
        
        def __aiter__(self):
            return self
        
        async def __anext__(self):
            try:
                return next(self.iter)
            except StopIteration:
                raise StopAsyncIteration
        
        def limit(self, n):
            return self

    from unittest.mock import MagicMock
    
    # Crear cursor con 1 producto
    cursor_instance = MockAsyncCursor([
        {"id": 1, "nombre": "Mock Product", "precio": 1000, "slug": "mock-prod"}
    ])

    mock_collection = MagicMock()
    mock_collection.find.return_value = cursor_instance

    # Guardar referencia original
    original_db = db_module.db_main
    
    try:
        # Inyectar mock
        mock_db = MagicMock()
        mock_db.__getitem__.return_value = mock_collection # db["productos"]
        db_module.db_main = mock_db

        # Ejecutar búsqueda
        slots = {
            "min_price": 500,
            "max_price": 2000,
            "brand": "logitech",
            "size": "tkl",
            "switch": "red",
            "rgb": True
        }
        items = await search_products("teclado", limit=5, slots=slots)
        
        assert len(items) == 1
        assert items[0]["nombre"] == "Mock Product"
        
        # Verificar query
        mock_collection.find.assert_called_once()
        args = mock_collection.find.call_args[0]
        query = args[0]
        
        assert query["precio"]["$gte"] == 500
        assert query["precio"]["$lte"] == 2000
        assert "marca" in query
        
    finally:
        db_module.db_main = original_db


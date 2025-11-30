import pytest
from httpx import AsyncClient, ASGITransport
from asgi_lifespan import LifespanManager
import sys
from pathlib import Path
import types

# Asegura que el paquete 'backend' sea importable tanto si ejecutas en raíz como dentro de /backend
ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import backend.main as main
from backend.main import app
from backend import db as db_module
from backend.config import settings


@pytest.fixture
async def client():
    # Fuerza entorno de pruebas: sin DB y AI desactivada
    db_module.client = None
    db_module.db_main = None
    db_module.db_users = None
    settings.AI_DISABLED = True
    # Evita conexiones reales durante startup/shutdown
    async def _noop():
        return None
    main.connect = _noop  # type: ignore
    main.disconnect = _noop  # type: ignore
    transport = ASGITransport(app=app, raise_app_exceptions=True)
    async with LifespanManager(app):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

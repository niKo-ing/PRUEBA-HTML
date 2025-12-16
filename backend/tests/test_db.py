import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from backend import db

@pytest.mark.asyncio
async def test_connect_success():
    with patch("backend.db.AsyncIOMotorClient") as mock_client_cls:
        mock_client = MagicMock()
        mock_client.admin.command = AsyncMock(return_value={"ok": 1})
        mock_client.__getitem__.side_effect = lambda name: MagicMock(name=name)
        mock_client_cls.return_value = mock_client
        
        await db.connect()
        
        assert db.client is not None
        assert db.db_main is not None
        assert db.db_users is not None
        assert db.db is not None
        mock_client.admin.command.assert_called_with("ping")

@pytest.mark.asyncio
async def test_connect_failure():
    with patch("backend.db.AsyncIOMotorClient") as mock_client_cls:
        mock_client = MagicMock()
        # Simula error en ping
        mock_client.admin.command = AsyncMock(side_effect=Exception("Connection failed"))
        mock_client_cls.return_value = mock_client
        
        await db.connect()
        
        # En caso de error, el código actual atrapa la excepción y pone todo en None
        assert db.client is None
        assert db.db_main is None

@pytest.mark.asyncio
async def test_disconnect():
    # Setup mock client
    db.client = MagicMock()
    
    await db.disconnect()
    
    assert db.client is None
    assert db.db_main is None
    assert db.db_users is None
    assert db.db is None

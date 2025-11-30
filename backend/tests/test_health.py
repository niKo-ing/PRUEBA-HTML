import pytest


@pytest.mark.asyncio
async def test_health_without_db(client):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["ok"] is False
    assert data["client"] is False
    assert data["db_main"] is False
    assert data["db_users"] is False

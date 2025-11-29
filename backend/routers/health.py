from fastapi import APIRouter
from .. import db as db_module

router = APIRouter(prefix="/api/health", tags=["health"])

@router.get("")
async def health():
    ok_client = db_module.client is not None
    ok_main = db_module.db_main is not None
    ok_users = db_module.db_users is not None
    return {
        "ok": ok_client and ok_main and ok_users,
        "client": bool(ok_client),
        "db_main": bool(ok_main),
        "db_users": bool(ok_users),
    }
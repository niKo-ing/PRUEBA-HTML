from fastapi import APIRouter, HTTPException
from .. import db as db_module
from ..data_fallback import productos_fallback

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("")
async def list_products():
    # Si no hay conexión a DB, devolver un dataset de fallback
    if db_module.client is None or db_module.db_main is None:
        return productos_fallback
    try:
        cursor = db_module.db_main["productos"].find({}, {"_id": 0})
        items = [doc async for doc in cursor]
        # Si la colección está vacía, usar fallback
        return items if items else productos_fallback
    except Exception:
        # Ante cualquier error de DB, usar fallback
        return productos_fallback

from fastapi import APIRouter, HTTPException
from .. import db as db_module

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("")
async def list_products():
    if db_module.client is None or db_module.db_main is None:
        raise HTTPException(status_code=500, detail="DB no inicializada")
    try:
        cursor = db_module.db_main["productos"].find({}, {"_id": 0})
        return [doc async for doc in cursor]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error DB: {e}")

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
from .. import db as db_module
from ..data_fallback import productos_fallback
from ..config import settings
from ..security import verify_jwt

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


class ProductDoc(BaseModel):
    id: int
    slug: Optional[str] = None
    nombre: str
    precio: int
    stock: int
    categoria: str | list[str]
    img: Optional[str] = None
    images: Optional[list[str]] = None
    descripcion: Optional[str] = None
    rating: Optional[float] = None
    tags: Optional[list[str]] = None


@router.post("/bulk-upsert")
async def bulk_upsert_products(items: List[ProductDoc], authorization: str | None = Header(default=None)):
    """
    Inserta o actualiza múltiples productos por `id`.
    - Requiere DB disponible; de lo contrario, retorna 503.
    - Usa `replace_one` con `upsert=True` para cada documento.
    """
    # Proteger con JWT y rol admin
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Autorización requerida")
    token = authorization.split(" ", 1)[1]
    payload = verify_jwt(token, settings.ADMIN_PASSWORD or "todobaratisimo_dev_secret")
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    if db_module.client is None or db_module.db_main is None:
        raise HTTPException(status_code=503, detail="DB no disponible para guardar productos")
    try:
        col = db_module.db_main["productos"]
        result_summary = {"matched": 0, "modified": 0, "upserted": 0}
        for item in items:
            doc = item.model_dump()
            # Asegura slug si falta
            if not doc.get("slug"):
                doc["slug"] = str(doc["id"])
            res = await col.replace_one({"id": doc["id"]}, doc, upsert=True)
            result_summary["matched"] += res.matched_count
            result_summary["modified"] += res.modified_count
            # upserted_id es None si no hubo upsert
            if getattr(res, "upserted_id", None) is not None:
                result_summary["upserted"] += 1
        return {"ok": True, **result_summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar productos: {e}")


@router.delete("/{id}")
async def delete_product(id: int, authorization: str | None = Header(default=None)):
    """Elimina un producto por id."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Autorización requerida")
    token = authorization.split(" ", 1)[1]
    payload = verify_jwt(token, settings.ADMIN_PASSWORD or "todobaratisimo_dev_secret")
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    if db_module.client is None or db_module.db_main is None:
        raise HTTPException(status_code=503, detail="DB no disponible")
    try:
        col = db_module.db_main["productos"]
        res = await col.delete_one({"id": id})
        return {"deleted": res.deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar producto: {e}")

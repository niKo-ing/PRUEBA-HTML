from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from vertexai import init as vertex_init
from vertexai.generative_models import GenerativeModel
from ..config import settings
from ..db import db_main

router = APIRouter(prefix="/api/ai", tags=["ai"])
model: GenerativeModel | None = None


class AskPayload(BaseModel):
    question: str
    productId: str | None = None
    context: dict | None = None


@router.on_event("startup")
async def init_ai():
    global model
    try:
        if settings.GOOGLE_CLOUD_PROJECT:
            vertex_init(project=settings.GOOGLE_CLOUD_PROJECT, location=settings.GOOGLE_CLOUD_LOCATION)
            model = GenerativeModel("gemini-1.5-flash")
    except Exception:
        model = None


@router.post("/ask")
async def ask_ai(payload: AskPayload):
    if not model:
        raise HTTPException(status_code=500, detail="Vertex AI no está configurado")

    product_snippet = None
    if payload.productId and db_main is not None:
        product_snippet = await db_main["productos"].find_one({"id": payload.productId}, {"_id": 0})

    parts = [
        "Eres un asistente de la tienda Todobaratisimo.",
        f"Pregunta: {payload.question}",
    ]
    if product_snippet:
        parts.append(f"Producto: {product_snippet}")
    if payload.context:
        parts.append(f"Contexto: {payload.context}")

    try:
        resp = model.generate_content(parts)
        text = resp.text if hasattr(resp, "text") else str(resp)
        return {"answer": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error Vertex AI: {e}")


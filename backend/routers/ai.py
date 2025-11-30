from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import re
from typing import Any, Dict, List, Optional
from vertexai import init as vertex_init
from vertexai.generative_models import GenerativeModel
from ..config import settings
from .. import db as db_module
from ..data_fallback import productos_fallback

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
        # Si está desactivada por configuración, no inicializar el modelo
        if settings.AI_DISABLED:
            model = None
            return
        # Usa la variable de entorno de Cloud Run si no viene en settings
        project = settings.GOOGLE_CLOUD_PROJECT or os.environ.get("GOOGLE_CLOUD_PROJECT", "")
        location = settings.GOOGLE_CLOUD_LOCATION or os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
        if project:
            vertex_init(project=project, location=location)
            model = GenerativeModel(settings.GEMINI_MODEL)
    except Exception:
        model = None


def sanitize_product(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": doc.get("id"),
        "slug": doc.get("slug"),
        "nombre": doc.get("nombre"),
        "precio": doc.get("precio"),
        "stock": doc.get("stock"),
        "categoria": doc.get("categoria"),
        "img": doc.get("img"),
        "rating": doc.get("rating"),
    }


async def search_products(query: str, limit: int = 5, slots: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    q = query.strip()
    if not q:
        return []
    regex = re.compile(re.escape(q), re.IGNORECASE)
    brand = (slots or {}).get("brand")
    min_price = (slots or {}).get("min_price")
    max_price = (slots or {}).get("max_price")
    budget = (slots or {}).get("budget")
    switch = (slots or {}).get("switch")
    size = (slots or {}).get("size")
    rgb = (slots or {}).get("rgb")
    if isinstance(budget, int) and not max_price:
        max_price = budget
    # Si hay DB, buscar; si no, usar fallback en memoria
    if db_module.db_main is not None:
        try:
            query_doc: Dict[str, Any] = {
                "$or": [
                    {"nombre": {"$regex": regex}},
                    {"slug": {"$regex": regex}},
                    {"categoria": {"$regex": regex}},
                    {"tags": {"$regex": regex}},
                    {"descripcion": {"$regex": regex}},
                ]
            }
            price_filter: Dict[str, Any] = {}
            if isinstance(min_price, int):
                price_filter["$gte"] = min_price
            if isinstance(max_price, int):
                price_filter["$lte"] = max_price
            if price_filter:
                query_doc["precio"] = price_filter
            if brand:
                query_doc["marca"] = {"$regex": re.compile(re.escape(str(brand)), re.IGNORECASE)}
            and_filters: List[Dict[str, Any]] = []
            if isinstance(size, str):
                and_filters.append({"descripcion": {"$regex": re.compile(re.escape(size), re.IGNORECASE)}})
            if isinstance(switch, str):
                and_filters.append({"descripcion": {"$regex": re.compile(re.escape(switch), re.IGNORECASE)}})
            if rgb is True:
                and_filters.append({"descripcion": {"$regex": re.compile("rgb|retroilumin", re.IGNORECASE)}})
            if rgb is False:
                and_filters.append({"descripcion": {"$regex": re.compile("sin rgb", re.IGNORECASE)}})
            if and_filters:
                query_doc["$and"] = and_filters

            cursor = db_module.db_main["productos"].find(query_doc, {"_id": 0}).limit(limit)
            items = [sanitize_product(doc) async for doc in cursor]
            return items
        except Exception:
            pass
    # Fallback local
    matches = []
    for it in productos_fallback:
        text = " ".join(
            [
                str(it.get("nombre", "")),
                str(it.get("slug", "")),
                str(it.get("categoria", "")),
                str(it.get("descripcion", "")),
            ]
        )
        if regex.search(text):
            price_ok = True
            p = it.get("precio")
            if isinstance(min_price, int):
                price_ok = price_ok and isinstance(p, int) and p >= min_price
            if isinstance(max_price, int):
                price_ok = price_ok and isinstance(p, int) and p <= max_price
            brand_ok = True
            if brand:
                brand_ok = brand in text.lower()
            spec_ok = True
            tl = text.lower()
            if isinstance(size, str):
                spec_ok = spec_ok and (size in tl)
            if isinstance(switch, str):
                spec_ok = spec_ok and (switch in tl)
            if rgb is True:
                spec_ok = spec_ok and bool(re.search(r"rgb|retroilumin", tl, re.IGNORECASE))
            if rgb is False:
                spec_ok = spec_ok and ("sin rgb" in tl)
            if price_ok and brand_ok and spec_ok:
                matches.append(sanitize_product(it))
        if len(matches) >= limit:
            break
    return matches


def detect_intent(question: str) -> Dict[str, Any]:
    q = (question or "").lower()
    intent = "general"
    slots: Dict[str, Any] = {}

    def parse_amount(txt: str) -> Optional[int]:
        txt = txt.lower().strip()
        txt = re.sub(r"[\$\s]", "", txt)
        txt = txt.replace(".", "")
        m = re.match(r"(\d+)(k)?", txt)
        if not m:
            return None
        n = int(m.group(1))
        if m.group(2):
            n *= 1000
        return n

    # Presupuesto simple
    budget_match = re.search(r"(?:presupuesto|hasta|menos de|sobre|mas de|más de|\$|clp)\s*([\d\.]+k?)", q)
    if budget_match:
        amt = parse_amount(budget_match.group(1))
        if isinstance(amt, int):
            slots["budget"] = amt

    # Rango de precio: entre X y Y / de X a Y
    range_match = re.search(r"(?:entre|de)\s*([\d\.]+k?)\s*(?:y|a)\s*([\d\.]+k?)", q)
    if range_match:
        lo = parse_amount(range_match.group(1))
        hi = parse_amount(range_match.group(2))
        if isinstance(lo, int) and isinstance(hi, int):
            slots["min_price"] = lo
            slots["max_price"] = hi

    # Hasta N / menos de N / más de N / sobre N
    if "hasta" in q or "menos de" in q:
        m = re.search(r"(?:hasta|menos de)\s*([\d\.]+k?)", q)
        amt = parse_amount(m.group(1)) if m else None
        if isinstance(amt, int):
            slots["max_price"] = amt
    if "mas de" in q or "más de" in q or "sobre" in q:
        m = re.search(r"(?:mas de|más de|sobre)\s*([\d\.]+k?)", q)
        amt = parse_amount(m.group(1)) if m else None
        if isinstance(amt, int):
            slots["min_price"] = amt

    # Categorías y sinónimos (plural/es/inglés)
    categories_map: Dict[str, List[str]] = {
        "celular": ["celular", "celulares", "telefono", "teléfono", "telefon", "smartphone"],
        "teclado": ["teclado", "teclados", "keyboard"],
        "mouse": ["mouse", "mouses", "raton", "ratón", "mouse gamer"],
        "headset": ["headset", "audifonos", "audífonos", "auriculares"],
        "audio": ["audio", "parlante", "parlantes", "altavoz", "altavoces", "bocina", "bocinas"],
        "ssd": ["ssd", "disco ssd", "unidad ssd", "nvme"],
        "webcam": ["webcam", "camara", "cámara", "camera"],
        "computación": ["computacion", "computación", "pc", "computadora"],
        "periféricos": ["periferico", "periférico", "perifericos", "periféricos"],
        "electrónica": ["electronica", "electrónica"],
    }
    for base, syns in categories_map.items():
        if any(s in q for s in syns):
            slots.setdefault("category", base)
            intent = "search_products"
            break

    # Marca
    brands = [
        "samsung", "logitech", "razer", "hp", "lenovo", "apple", "asus", "msi", "sony",
        "hyperx", "corsair", "redragon", "steelseries", "dell", "kingston", "sandisk",
    ]
    for b in brands:
        if b in q:
            slots["brand"] = b
            intent = "search_products"
            break

    # Especificaciones (principalmente teclados): switches, tamaño, RGB
    # Tipo de switch
    if any(k in q for k in ["switch", "switches"]):
        if any(k in q for k in ["rojo", "rojos", "red", "lineal", "linear"]):
            slots["switch"] = "rojos"
            intent = "search_products"
        elif any(k in q for k in ["azul", "azules", "blue", "clicky"]):
            slots["switch"] = "azules"
            intent = "search_products"
        elif any(k in q for k in ["marron", "marrones", "brown", "tactil", "táctil"]):
            slots["switch"] = "marrones"
            intent = "search_products"

    # Tamaño teclado
    if any(k in q for k in ["tkl", "tenkeyless", "60%", "75%", "completo", "full"]):
        if "tkl" in q or "tenkeyless" in q:
            slots["size"] = "tkl"
        elif "60%" in q:
            slots["size"] = "60%"
        elif "75%" in q:
            slots["size"] = "75%"
        elif "completo" in q or "full" in q:
            slots["size"] = "full"
        intent = "search_products"

    # RGB
    if any(k in q for k in ["rgb", "retroiluminacion", "retroiluminación", "iluminacion", "iluminación"]):
        slots["rgb"] = ("sin rgb" not in q)
        intent = "search_products"

    # Intenciones por palabras clave
    if any(k in q for k in ["oferta", "promocion", "descuento"]):
        intent = "offers"
    elif any(k in q for k in ["medio de pago", "pago", "tarjeta", "transferencia"]):
        intent = "payments"
    elif any(k in q for k in ["envio", "entrega", "despacho"]):
        intent = "shipping"
    elif any(k in q for k in ["problema", "error", "no funciona", "fallo"]):
        intent = "support"
    elif any(k in q for k in ["qué puede hacer", "que puede hacer", "capacidad", "funciona"]):
        intent = "capabilities"
    elif intent != "search_products" and re.search(r"\b(ver|buscar|recomendar)\b", q):
        intent = "search_products"

    return {"intent": intent, "slots": slots}


def build_actions(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    actions = []
    for p in products[:3]:
        if p.get("slug"):
            actions.append({"type": "view_product", "slug": p["slug"], "id": p.get("id")})
    if len(products) >= 2:
        actions.append({"type": "compare", "ids": [products[0].get("id"), products[1].get("id")]})
    return actions


@router.post("/ask")
async def ask_ai(payload: AskPayload):
    # Bloquear explícitamente si la IA está desactivada
    if settings.AI_DISABLED:
        raise HTTPException(status_code=503, detail="IA desactivada")
    product_snippet = None
    if payload.productId and db_module.db_main is not None:
        # Convierte a int si es numérico para coincidir con el esquema de la colección
        pid = None
        try:
            pid = int(payload.productId)
        except Exception:
            pid = payload.productId
        product_snippet = await db_module.db_main["productos"].find_one({"id": pid}, {"_id": 0})

    parts = [
        "Eres un asistente de la tienda Todobaratisimo.",
        f"Pregunta: {payload.question}",
    ]
    if product_snippet:
        parts.append(f"Producto: {product_snippet}")
    if payload.context:
        parts.append(f"Contexto: {payload.context}")


    # Detección de intención y búsqueda de productos
    intent_info = detect_intent(payload.question)
    found_products: List[Dict[str, Any]] = []
    if intent_info.get("intent") == "search_products":
        q = intent_info.get("slots", {}).get("category") or payload.question
        found_products = await search_products(q, limit=5, slots=intent_info.get("slots", {}))
        if found_products:
            parts.append(f"Candidatos: {found_products}")

    actions = build_actions(found_products)
    next_questions: List[str] = []
    # Mostrar preguntas de refinamiento aunque no haya resultados
    if intent_info.get("intent") == "search_products":
        slots_info = intent_info.get("slots", {})
        cat = (slots_info.get("category") or "").lower()
        # Comunes
        next_questions.append("¿Cuál es tu presupuesto máximo?")
        # Por categoría
        if cat == "teclado":
            next_questions.extend([
                "¿Qué tipo de switches te gustan (lineal/táctil/clicky)?",
                "¿Tamaño de teclado: completo, TKL o 60%?",
                "¿Buscas retroiluminación RGB o sin RGB?",
            ])
        elif cat == "mouse":
            next_questions.extend([
                "¿Qué tipo de agarre usas (palm, claw, fingertip)?",
                "¿Necesitas DPI alto o botones programables?",
                "¿Prefieres con o sin RGB?",
            ])
        elif cat == "celular":
            next_questions.extend([
                "¿Prefieres batería, cámara o rendimiento?",
                "¿Tamaño de pantalla deseado?",
                "¿Quieres comparar dos modelos?",
            ])

    try:
        if not model:
            # Sin fallback: devolver error explícito para que el frontend maneje correctamente
            raise HTTPException(status_code=503, detail="Vertex AI no configurado")

        parts.append(f"Intención: {intent_info}")
        resp = model.generate_content(parts)
        text = resp.text if hasattr(resp, "text") else str(resp)
        return {
            "answer": text,
            "fallback": False,
            "products": found_products,
            "actions": actions,
            "next": next_questions,
            "intent": intent_info,
        }
    except Exception as e:
        # Sin fallback: propagar error para que el cliente lo trate como fallo real
        raise HTTPException(status_code=502, detail=f"Error Vertex AI: {e}")

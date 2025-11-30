import asyncio
import random
from typing import Any, Dict, List, Tuple
from motor.motor_asyncio import AsyncIOMotorClient
from unicodedata import normalize

from config import settings


def slugify(text: str) -> str:
    s = normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    s = s.lower().strip()
    s = s.replace(" ", "-")
    s = s.replace("_", "-")
    # elimina caracteres no alfanuméricos salvo guiones
    return "".join(ch for ch in s if ch.isalnum() or ch == "-")


async def ensure_indexes(col):
    await col.create_index("id", unique=True)
    await col.create_index("slug", unique=True, sparse=True)
    await col.create_index("nombre")
    await col.create_index("precio")
    await col.create_index("categoria")
    await col.create_index("marca")
    await col.create_index("tags")


def make_images_for_slug(slug: str, count: int = 3) -> List[str]:
    return [f"/assets/img/{slug}-{i+1}.jpg" for i in range(count)]


def rand_price(category: str) -> int:
    base_ranges = {
        "Periféricos": (4990, 49990),
        "Computación": (29990, 299990),
        "Audio": (9990, 199990),
        "Accesorios": (2990, 29990),
        "Hogar": (4990, 99990),
        "Electrónica": (9990, 299990),
    }
    low, high = base_ranges.get(category, (4990, 149990))
    step = 10
    return random.randrange(low, high, step)


def rand_stock() -> int:
    return random.randint(5, 250)


def rand_rating() -> float:
    return round(random.uniform(3.5, 5.0), 1)


async def load_existing(col) -> Tuple[List[Dict[str, Any]], int, List[str]]:
    items = [doc async for doc in col.find({}, {"_id": 0})]
    max_id = max([it.get("id", 0) for it in items], default=0)
    # normaliza categorías a lista de strings únicas
    categories = set()
    for it in items:
        cat = it.get("categoria")
        if isinstance(cat, list):
            for c in cat:
                categories.add(str(c))
        elif isinstance(cat, str) and cat:
            categories.add(cat)
    return items, max_id, sorted(categories)


async def augment_existing(col, items: List[Dict[str, Any]]):
    updated = 0
    for it in items:
        pid = it.get("id")
        nombre = it.get("nombre", f"Producto {pid}")
        slug = it.get("slug") or slugify(f"{nombre}-{pid}")
        imgs = it.get("images")
        if not imgs or len(imgs) < 3:
            imgs = make_images_for_slug(slug, 3)
        cover = it.get("img") or imgs[0]
        patch: Dict[str, Any] = {"slug": slug, "images": imgs, "img": cover}
        # Enriquecer con marca/tags/descripcion si faltan
        cat = it.get("categoria")
        cat_str = cat[0] if isinstance(cat, list) and cat else (str(cat) if cat else "")
        marca = it.get("marca") or sample_brand_for_category(cat_str or "Generic")
        desc = it.get("descripcion") or f"Producto de la categoría {cat_str}. Descripción breve."
        tags = it.get("tags") or []
        if not isinstance(tags, list):
            tags = [str(tags)]
        base_tags = {cat_str.lower(): True, "nuevo": True}
        # Sinónimos por categoría
        low = cat_str.lower()
        if "mouse" in low or "perif" in low:
            base_tags.update({"raton": True, "ratón": True, "mouse gamer": True})
            if "mouse" in nombre.lower():
                base_tags.update({"mouse": True})
            desc = desc or f"Mouse gamer {marca} con iluminación RGB opcional y DPI ajustable."
        if "smart" in low or "celular" in low or "electr" in low or "telefono" in low:
            base_tags.update({"telefono": True, "teléfono": True, "smartphone": True})
            desc = desc or f"Celular {marca} con buena batería y cámara."
        if "teclado" in low:
            specs = keyboard_specs()
            base_tags.update({specs["switch"]: True, specs["size"]: True, ("rgb" if specs["rgb"] else "sin rgb"): True})
            desc = f"{specs['spec_text']}. Marca {marca}."
        # fusiona tags existentes con base_tags
        for t in list(base_tags.keys()):
            if t not in tags:
                tags.append(t)
        patch.update({"marca": marca, "tags": tags, "descripcion": desc})
        await col.update_one({"id": pid}, {"$set": patch}, upsert=False)
        updated += 1
    return updated


def keyboard_specs() -> Dict[str, Any]:
    switches = ["rojos", "azules", "marrones"]
    sizes = ["tkl", "60%", "75%", "full"]
    s = random.choice(switches)
    sz = random.choice(sizes)
    rgb = random.choice([True, False])
    spec_text = f"Teclado mecánico {sz} con switches {s}" + (" y retroiluminación RGB" if rgb else " sin RGB")
    return {"switch": s, "size": sz, "rgb": rgb, "spec_text": spec_text}


def sample_brand_for_category(cat: str) -> str:
    brands = {
        "Periféricos": ["Logitech", "Razer", "Redragon", "HyperX", "Corsair", "SteelSeries"],
        "Computación": ["HP", "Lenovo", "Asus", "MSI", "Dell"],
        "Audio": ["Sony", "JBL", "Beats", "Anker"],
        "Accesorios": ["Sandisk", "Kingston", "Generic"],
        "Electrónica": ["Samsung", "Apple", "Xiaomi", "Sony"],
        "Celular": ["Samsung", "Xiaomi", "Motorola", "Apple"],
        "Mouse": ["Logitech", "Razer", "Redragon", "HyperX"],
        "Teclado": ["Logitech", "Razer", "Redragon", "HyperX", "Corsair"],
    }
    # Elegir basada en categoría base sin acentos
    key = cat.capitalize()
    return random.choice(brands.get(key, ["Generic"]))


async def add_new_for_categories(
    col,
    categories: List[str],
    start_id: int,
    min_per_category: int = 8,
) -> int:
    inserted = 0
    # cuenta existentes por categoría
    counts = {c: 0 for c in categories}
    async for doc in col.find({}, {"_id": 0, "categoria": 1}):
        cat = doc.get("categoria")
        if isinstance(cat, list):
            for c in cat:
                counts[c] = counts.get(c, 0) + 1
        elif isinstance(cat, str) and cat:
            counts[cat] = counts.get(cat, 0) + 1

    # si no hay categorías, usa un set base
    if not categories:
        categories = ["Periféricos", "Computación", "Audio", "Accesorios", "Electrónica"]
        counts = {c: 0 for c in categories}

    next_id = start_id + 1
    for cat in categories:
        need = max(0, min_per_category - counts.get(cat, 0))
        for i in range(need):
            nombre = f"Nuevo {cat} {i+1}"
            slug = slugify(f"{nombre}-{next_id}")
            imgs = make_images_for_slug(slug, 3)
            marca = sample_brand_for_category(cat)
            desc = f"Producto de la categoría {cat}. Descripción breve."
            tags: List[str] = [cat.lower(), "nuevo"]
            # Enriquecer según categoría con sinónimos
            if "mouse" in cat.lower():
                tags += ["raton", "ratón", "mouse gamer"]
                desc = f"Mouse gamer {marca} con iluminación RGB opcional y DPI ajustable."
            if "celular" in cat.lower() or cat.lower() in ["electrónica", "electronica"]:
                tags += ["telefono", "teléfono", "smartphone"]
                desc = f"Celular {marca} con buena batería y cámara."
            if "teclado" in cat.lower() or cat.lower() in ["periféricos", "perifericos", "computación", "computacion"]:
                specs = keyboard_specs()
                tags += [specs["switch"], specs["size"], "rgb" if specs["rgb"] else "sin rgb"]
                desc = f"{specs['spec_text']}. Marca {marca}."
            doc = {
                "id": next_id,
                "slug": slug,
                "nombre": nombre,
                "precio": rand_price(cat),
                "stock": rand_stock(),
                "categoria": cat,
                "img": imgs[0],
                "images": imgs,
                "descripcion": desc,
                "rating": rand_rating(),
                "tags": tags,
                "marca": marca,
            }
            await col.update_one({"id": next_id}, {"$setOnInsert": doc}, upsert=True)
            next_id += 1
            inserted += 1
    return inserted


async def insert_curated_samples(col) -> int:
    """
    Inserta algunos productos curados para cubrir categorías clave
    que el asistente reconoce: mouse, celular, teclado.
    """
    inserted = 0
    # calcula siguiente id
    items = [doc async for doc in col.find({}, {"_id": 0, "id": 1})]
    next_id = (max([it.get("id", 0) for it in items], default=0) or 0) + 1

    samples: List[Dict[str, Any]] = [
        {
            "nombre": "Mouse Gamer Logitech G102",
            "categoria": "Mouse",
            "marca": "Logitech",
            "precio": 34990,
            "descripcion": "Mouse gamer Logitech con retroiluminación RGB y DPI ajustable.",
            "tags": ["mouse", "mouse gamer", "rgb", "logitech"],
        },
        {
            "nombre": "Mouse Gamer Redragon Cobra",
            "categoria": "Mouse",
            "marca": "Redragon",
            "precio": 29990,
            "descripcion": "Mouse gamer Redragon con iluminación RGB y 7 botones programables.",
            "tags": ["mouse", "mouse gamer", "rgb", "redragon"],
        },
        {
            "nombre": "Samsung Galaxy A15",
            "categoria": "Celular",
            "marca": "Samsung",
            "precio": 229990,
            "descripcion": "Celular Samsung con excelente batería y buena cámara.",
            "tags": ["celular", "smartphone", "telefono", "samsung"],
        },
        {
            "nombre": "Xiaomi Redmi Note 13",
            "categoria": "Celular",
            "marca": "Xiaomi",
            "precio": 219990,
            "descripcion": "Smartphone Xiaomi con gran rendimiento y pantalla AMOLED.",
            "tags": ["celular", "smartphone", "telefono", "xiaomi"],
        },
        {
            "nombre": "Teclado Mecánico TKL Redragon Kumara",
            "categoria": "Teclado",
            "marca": "Redragon",
            "precio": 39990,
            "descripcion": "Teclado mecánico TKL con switches azules y retroiluminación RGB.",
            "tags": ["teclado", "tkl", "azules", "rgb", "redragon"],
        },
        {
            "nombre": "Teclado 60% HyperX Alloy Origins",
            "categoria": "Teclado",
            "marca": "HyperX",
            "precio": 49990,
            "descripcion": "Teclado mecánico 60% con switches marrones y sin RGB.",
            "tags": ["teclado", "60%", "marrones", "sin rgb", "hyperx"],
        },
    ]

    for s in samples:
        slug = slugify(f"{s['nombre']}-{next_id}")
        imgs = make_images_for_slug(slug, 3)
        doc = {
            "id": next_id,
            "slug": slug,
            "nombre": s["nombre"],
            "precio": s["precio"],
            "stock": rand_stock(),
            "categoria": s["categoria"],
            "img": imgs[0],
            "images": imgs,
            "descripcion": s["descripcion"],
            "rating": rand_rating(),
            "tags": s["tags"],
            "marca": s["marca"],
        }
        # Evitar duplicados por nombre+marca
        existing = await col.find_one({"nombre": s["nombre"], "marca": s["marca"]}, {"_id": 0, "id": 1})
        if not existing:
            await col.update_one({"id": next_id}, {"$setOnInsert": doc}, upsert=True)
            next_id += 1
            inserted += 1
    return inserted


async def main():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB]
    col = db["productos"]

    await ensure_indexes(col)

    items, max_id, categories = await load_existing(col)
    updated = await augment_existing(col, items)
    inserted = await add_new_for_categories(col, categories, max_id, min_per_category=8)
    curated = await insert_curated_samples(col)

    print(f"Augmentados {updated} productos existentes con images/slug/cover")
    print(f"Insertados {inserted} nuevos productos en categorías: {', '.join(categories) or 'base'}")
    print(f"Insertados {curated} productos curados (mouse/celular/teclado)")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())

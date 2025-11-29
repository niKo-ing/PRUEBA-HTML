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
        patch = {"slug": slug, "images": imgs, "img": cover}
        await col.update_one({"id": pid}, {"$set": patch}, upsert=False)
        updated += 1
    return updated


async def add_new_for_categories(col, categories: List[str], start_id: int, min_per_category: int = 8) -> int:
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
            doc = {
                "id": next_id,
                "slug": slug,
                "nombre": nombre,
                "precio": rand_price(cat),
                "stock": rand_stock(),
                "categoria": cat,
                "img": imgs[0],
                "images": imgs,
                "descripcion": f"Producto de la categoría {cat}. Descripción breve.",
                "rating": rand_rating(),
                "tags": [cat.lower(), "nuevo"],
            }
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

    print(f"Augmentados {updated} productos existentes con images/slug/cover")
    print(f"Insertados {inserted} nuevos productos en categorías: {', '.join(categories) or 'base'}")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())

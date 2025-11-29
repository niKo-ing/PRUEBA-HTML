let cache = null;
let inflight = null;
// Base de API configurable por entorno con fallback en producción.
function pickApiBase() {
    const envBase = String((import.meta?.env?.VITE_API_BASE_URL ?? "")).trim().replace(/\/+$/, "");
    if (envBase)
        return envBase;
    const isProd = Boolean((import.meta?.env?.PROD));
    if (isProd && typeof window !== "undefined") {
        const origin = window.location.origin;
        // Si estamos en localhost/127.0.0.1 sin VITE_API_BASE_URL, asumir backend en :8000
        if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
            return origin.replace(/:\d+$/, ":8000");
        }
        return origin;
    }
    // En dev (Vite), usar proxy de /api
    return "";
}
const API_BASE = pickApiBase();
const endpoint = `${API_BASE}/api/products`;
function normalizeImagePath(s) {
    if (!s)
        return undefined;
    const t = s.trim();
    if (t.startsWith("http://") || t.startsWith("https://"))
        return t;
    if (t.startsWith("/"))
        return t; // ya es ruta pública
    // permitir valores como "assets/img/foo.jpg" sin slash inicial
    if (t.includes("assets/img/"))
        return t.startsWith("/") ? t : `/${t}`;
    // caso general: nombre de archivo -> prefijar carpeta pública
    return `/assets/img/${t}`;
}
async function fetchJsonWithTimeout(url, timeoutMs = 6000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: ctrl.signal });
        clearTimeout(timer);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        return await res.json();
    }
    catch {
        clearTimeout(timer);
        return [];
    }
}
function normalize(p) {
    const img = normalizeImagePath(p.img);
    const images = Array.isArray(p.images) ? p.images.map((x) => normalizeImagePath(x)) : undefined;
    return {
        id: Number(p.id ?? 0),
        // asegura que siempre haya un slug usable; si falta, usa el id como string
        slug: String(p.slug ?? p.id ?? "").trim(),
        nombre: p.nombre,
        precio: Number(p.precio ?? 0),
        stock: Number(p.stock ?? 0),
        categoria: p.categoria,
        img: img ?? "/assets/img/hero.jpg",
        images,
        descripcion: p.descripcion,
        rating: p.rating,
        tags: p.tags,
    };
}
export async function fetchProducts(force = false) {
    if (!force && cache)
        return cache;
    if (!force && inflight)
        return inflight;
    inflight = fetchJsonWithTimeout(endpoint)
        .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        cache = arr.map(normalize);
        return cache;
    });
    const out = await inflight;
    inflight = null;
    return out;
}
export async function fetchProductBySlug(slug, force = false) {
    if (!slug)
        return undefined;
    const items = await fetchProducts(force);
    // busca por slug exacto y, si no existe, por id (string)
    return items.find((p) => p.slug === slug) ?? items.find((p) => String(p.id) === slug);
}

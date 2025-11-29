// Servicio de productos: consumo de API `/api/products`
// Provee caché en memoria y helpers para obtención por slug
import type { Product } from "@domain/types";

let cache: Product[] | null = null;
let inflight: Promise<Product[]> | null = null;

// Base de API configurable por entorno con fallback en producción.
function pickApiBase(): string {
  const envBase = String(((import.meta as any)?.env?.VITE_API_BASE_URL ?? "")).trim().replace(/\/+$/, "");
  if (envBase) return envBase;
  const isProd = Boolean(((import.meta as any)?.env?.PROD));
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

function normalizeImagePath(s?: string): string | undefined {
  if (!s) return undefined;
  const t = s.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/")) return t; // ya es ruta pública
  // permitir valores como "assets/img/foo.jpg" sin slash inicial
  if (t.includes("assets/img/")) return t.startsWith("/") ? t : `/${t}`;
  // caso general: nombre de archivo -> prefijar carpeta pública
  return `/assets/img/${t}`;
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 6000): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    clearTimeout(timer);
    return [] as unknown[];
  }
}

function normalize(p: any): Product {
  const img = normalizeImagePath(p.img);
  const images = Array.isArray(p.images) ? p.images.map((x: string) => normalizeImagePath(x)!) : undefined;
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

export async function fetchProducts(force = false): Promise<Product[]> {
  if (!force && cache) return cache;
  if (!force && inflight) return inflight;
  inflight = fetchJsonWithTimeout(endpoint)
    .then((data: unknown) => {
      const arr = Array.isArray(data) ? (data as unknown[]) : [];
      cache = arr.map(normalize);
      return cache;
    });
  const out = await inflight;
  inflight = null;
  return out;
}

export async function fetchProductBySlug(slug: string, force = false): Promise<Product | undefined> {
  if (!slug) return undefined;
  const items = await fetchProducts(force);
  // busca por slug exacto y, si no existe, por id (string)
  return items.find((p) => p.slug === slug) ?? items.find((p) => String(p.id) === slug);
}

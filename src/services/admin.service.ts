// Servicios administrativos: productos y usuarios
// Conecta con backend FastAPI en /api/products y /api/users

export type AdminProduct = {
  id: number;
  slug?: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string | string[];
  img?: string;
  images?: string[];
  descripcion?: string;
  rating?: number;
  tags?: string[];
};

export type AdminUser = {
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  password?: string;
  role?: string;
  direccion?: any;
};

function pickApiBase(): string {
  const envBase = String(((import.meta as any)?.env?.VITE_API_BASE_URL ?? "")).trim().replace(/\/+$/, "");
  if (envBase) return envBase;
  const isProd = Boolean(((import.meta as any)?.env?.PROD));
  if (isProd && typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return origin.replace(/:\d+$/, ":8000");
    }
    return origin;
  }
  return ""; // dev proxy
}

const API_BASE = pickApiBase();

async function fetchJson(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Productos
export async function adminListProducts(): Promise<AdminProduct[]> {
  const data = await fetchJson(`${API_BASE}/api/products`);
  return Array.isArray(data) ? data : [];
}

export async function adminBulkUpsertProducts(items: AdminProduct[]): Promise<{ ok: boolean } & Record<string, number>> {
  const data = await fetchJson(`${API_BASE}/api/products/bulk-upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
  return data;
}

// Usuarios
export async function adminRegisterUser(user: Required<Pick<AdminUser, "nombre"|"apellido"|"email"|"telefono"|"password">> & { direccion?: any }): Promise<{ ok: boolean }>{
  const data = await fetchJson(`${API_BASE}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return data;
}

export async function adminListUsers(): Promise<AdminUser[]> {
  const data = await fetchJson(`${API_BASE}/api/users`);
  return Array.isArray(data) ? data : [];
}

export async function adminDeleteProduct(id: number): Promise<{ deleted: number }>{
  const data = await fetchJson(`${API_BASE}/api/products/${id}`, { method: "DELETE" });
  return data;
}

export async function adminDeleteUser(email: string): Promise<{ deleted: number }>{
  const data = await fetchJson(`${API_BASE}/api/users/${encodeURIComponent(email)}`, { method: "DELETE" });
  return data;
}

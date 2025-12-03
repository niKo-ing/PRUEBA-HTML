// Servicios administrativos: productos y usuarios
// Conecta con backend FastAPI en /api/products y /api/users
function pickApiBase() {
    const envBase = String((import.meta?.env?.VITE_API_BASE_URL ?? "")).trim().replace(/\/+$/, "");
    if (envBase)
        return envBase;
    const isProd = Boolean((import.meta?.env?.PROD));
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
function getToken() {
    try {
        return localStorage.getItem('sessionToken');
    }
    catch {
        return null;
    }
}
async function fetchJson(url, init) {
    const token = getToken();
    const headers = new Headers(init?.headers || {});
    if (token)
        headers.set('Authorization', `Bearer ${token}`);
    const res = await fetch(url, { ...init, headers });
    if (!res.ok)
        throw new Error(`HTTP ${res.status}`);
    return res.json();
}
// Productos
export async function adminListProducts() {
    const data = await fetchJson(`${API_BASE}/api/products`);
    return Array.isArray(data) ? data : [];
}
export async function adminBulkUpsertProducts(items) {
    const data = await fetchJson(`${API_BASE}/api/products/bulk-upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
    });
    return data;
}
// Usuarios
export async function adminRegisterUser(user) {
    const data = await fetchJson(`${API_BASE}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });
    return data;
}
export async function adminListUsers() {
    const data = await fetchJson(`${API_BASE}/api/users`);
    return Array.isArray(data) ? data : [];
}
export async function adminDeleteProduct(id) {
    const data = await fetchJson(`${API_BASE}/api/products/${id}`, { method: "DELETE" });
    return data;
}
export async function adminDeleteUser(email) {
    const data = await fetchJson(`${API_BASE}/api/users/${encodeURIComponent(email)}`, { method: "DELETE" });
    return data;
}

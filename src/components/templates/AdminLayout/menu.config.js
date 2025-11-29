// Constantes de rutas para sincronizar Layout y Router
export const ADMIN_ROOT = "/admin";
export const ADMIN_SEGMENTS = {
    dashboard: "",
    products: "products",
    categories: "categories",
    orders: "orders",
    users: "users",
    reports: "reports",
    settings: "settings",
    receipt: "receipt/:id",
};
// Menú calculado en base a los segmentos
export const adminMenu = [
    { to: `${ADMIN_ROOT}`, label: "Dashboard", end: true },
    { to: `${ADMIN_ROOT}/${ADMIN_SEGMENTS.products}`, label: "Productos" },
    { to: `${ADMIN_ROOT}/${ADMIN_SEGMENTS.categories}`, label: "Categorías" },
    { to: `${ADMIN_ROOT}/${ADMIN_SEGMENTS.orders}`, label: "Pedidos" },
    { to: `${ADMIN_ROOT}/${ADMIN_SEGMENTS.users}`, label: "Usuarios" },
    { to: `${ADMIN_ROOT}/${ADMIN_SEGMENTS.reports}`, label: "Reportes" },
    { to: `${ADMIN_ROOT}/${ADMIN_SEGMENTS.settings}`, label: "Ajustes" },
];

// Configuración del menú de navegación del panel de administración
// Centraliza las rutas y etiquetas para mantener consistencia entre layout y router.
export type AdminMenuItem = {
  to: string;
  label: string;
  end?: boolean;
};

// Constantes de rutas para sincronizar Layout y Router
export const ADMIN_ROOT = "/admin" as const;
export const ADMIN_SEGMENTS = {
  dashboard: "",
  products: "products",
  categories: "categories",
  orders: "orders",
  users: "users",
  reports: "reports",
  settings: "settings",
  receipt: "receipt/:id",
} as const;

// Menú calculado en base a los segmentos
export const adminMenu: AdminMenuItem[] = [
  { to: `${ADMIN_ROOT}`, label: "Dashboard", end: true },
  { to: `${ADMIN_ROOT}/${ADMIN_SEGMENTS.products}`, label: "Productos" },
  { to: `${ADMIN_ROOT}/${ADMIN_SEGMENTS.categories}`, label: "Categorías" },
  { to: `${ADMIN_ROOT}/${ADMIN_SEGMENTS.orders}`, label: "Pedidos" },
  { to: `${ADMIN_ROOT}/${ADMIN_SEGMENTS.users}`, label: "Usuarios" },
  { to: `${ADMIN_ROOT}/${ADMIN_SEGMENTS.reports}`, label: "Reportes" },
  { to: `${ADMIN_ROOT}/${ADMIN_SEGMENTS.settings}`, label: "Ajustes" },
];

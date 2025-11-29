import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Nombre del template: AdminLayout
 * Propósito: Proveer el shell de administración con navegación lateral, barra superior
 *            y área principal donde se renderizan rutas anidadas via <Outlet />.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; se usa como layout contenedor de páginas admin.
 *
 * Componentes/Dependencias:
 * - react-router-dom: Link, NavLink, Outlet — navegación y enrutamiento anidado.
 * - react-bootstrap: Navbar, Container, Nav — construcción de la barra superior.
 * - Estilos: '@/styles/admin.css' — estilos específicos del panel admin.
 *
 * Patrones:
 * - Layout Composition con aside + navbar + outlet.
 * - Enrutamiento anidado para secciones: dashboard, productos, categorías, pedidos, usuarios, reportes y ajustes.
 *
 * Ejemplo de uso:
 * ```tsx
 * <Route path="/admin" element={<AdminLayout />}>
 *   <Route index element={<AdminDashboard />} />
 *   <Route path="products" element={<AdminProducts />} />
 *   // ...otras rutas
 * </Route>
 * ```
 */
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link, NavLink, Outlet } from "react-router-dom";
import { adminMenu } from "./menu.config";
import "@/styles/admin.css";
export default function AdminLayout() {
    return (_jsxs("div", { className: "admin-shell d-flex", role: "region", "aria-label": "Panel de administraci\u00F3n", children: [_jsxs("aside", { className: "admin-aside", role: "navigation", "aria-label": "Navegaci\u00F3n administrativa", children: [_jsx("div", { className: "admin-brand", children: _jsx(Link, { to: "/admin", className: "text-decoration-none", children: "Admin TB" }) }), _jsx("nav", { className: "admin-nav d-grid gap-1", children: adminMenu.map((item) => (_jsx(NavLink, { to: item.to, end: item.end === true, className: ({ isActive }) => `admin-link${isActive ? " active" : ""}`, children: item.label }, item.to))) })] }), _jsxs("main", { className: "admin-main flex-grow-1", role: "main", children: [_jsx(Navbar, { bg: "light", className: "border-bottom", role: "navigation", "aria-label": "Barra superior", children: _jsxs(Container, { fluid: true, className: "justify-content-between", children: [_jsx("div", { className: "fw-semibold", children: "Panel de Administraci\u00F3n" }), _jsxs(Nav, { children: [_jsx(Link, { to: "/", className: "nav-link", children: "Ver tienda" }), _jsx("button", { type: "button", className: "btn btn-outline-secondary btn-sm", onClick: () => localStorage.removeItem("isAdmin"), title: "Cerrar sesi\u00F3n admin (mock)", "aria-label": "Cerrar sesi\u00F3n administrativa", children: "Salir" })] })] }) }), _jsx("div", { className: "p-3 p-lg-4", "aria-live": "polite", children: _jsx(Outlet, {}) })] })] }));
}

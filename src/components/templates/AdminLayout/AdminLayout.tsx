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
  return (
    <div className="admin-shell d-flex" role="region" aria-label="Panel de administración">
      <aside className="admin-aside" role="navigation" aria-label="Navegación administrativa">
        <div className="admin-brand">
          <Link to="/admin" className="text-decoration-none">Admin TB</Link>
        </div>
        <nav className="admin-nav d-grid gap-1">
          {adminMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end === true}
              className={({ isActive }) => `admin-link${isActive ? " active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-main flex-grow-1" role="main">
        <Navbar bg="light" className="border-bottom" role="navigation" aria-label="Barra superior">
          <Container fluid className="justify-content-between">
            <div className="fw-semibold">Panel de Administración</div>
            <Nav>
              <Link to="/" className="nav-link">Ver tienda</Link>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => localStorage.removeItem("isAdmin")}
                title="Cerrar sesión admin (mock)"
                aria-label="Cerrar sesión administrativa"
              >
                Salir
              </button>
            </Nav>
          </Container>
        </Navbar>

        {/* Renderiza la página admin activa mediante rutas anidadas */}
        <div className="p-3 p-lg-4" aria-live="polite">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

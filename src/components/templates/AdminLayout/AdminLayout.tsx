import { Navbar, Container, Nav } from "react-bootstrap";
import { Link, NavLink, Outlet } from "react-router-dom";
import "@/styles/admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-shell d-flex">
      <aside className="admin-aside">
        <div className="admin-brand">
          <Link to="/admin" className="text-decoration-none">Admin TB</Link>
        </div>
        <nav className="admin-nav d-grid gap-1">
          <NavLink to="/admin" end className="admin-link">Dashboard</NavLink>
          <NavLink to="/admin/products" className="admin-link">Productos</NavLink>
          <NavLink to="/admin/orders" className="admin-link">Pedidos</NavLink>
          <NavLink to="/admin/users" className="admin-link">Usuarios</NavLink>
          <NavLink to="/admin/settings" className="admin-link">Ajustes</NavLink>
        </nav>
      </aside>

      <main className="admin-main flex-grow-1">
        <Navbar bg="light" className="border-bottom">
          <Container fluid className="justify-content-between">
            <div className="fw-semibold">Panel de Administración</div>
            <Nav>
              <Link to="/" className="nav-link">Ver tienda</Link>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => localStorage.removeItem("isAdmin")}
                title="Cerrar sesión admin (mock)"
              >
                Salir
              </button>
            </Nav>
          </Container>
        </Navbar>

        <div className="p-3 p-lg-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

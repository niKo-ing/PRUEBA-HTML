import { Navbar, Container, Nav, Badge } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "@domain/cart/cart.context";
import { useCartUI } from "@app/cart-ui.context";
import { useAuth } from "@domain/auth/auth.context";

export default function Header() {
  const { count } = useCart();
  const { open } = useCartUI();
  const { user, logout } = useAuth();
  const isAdminStorage = (() => { try { return localStorage.getItem("isAdmin") === "1"; } catch { return false; } })();
  const isAdminByEmail = !!user && /^(admin|root)@/i.test(user.email);
  const isAdmin = isAdminStorage || isAdminByEmail;

  return (
    <Navbar expand="lg" className="navbar-custom border-bottom sticky-top shadow-sm">
      <Container className="py-1">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <img src="/assets/img/icono.png" alt="Todobarato" className="logo-navbar" />
        </Link>

        <Navbar.Toggle />

        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>Home</Nav.Link>
            <Nav.Link as={NavLink} to="/productos">Productos</Nav.Link>
            <Nav.Link as={NavLink} to="/blogs">Blogs</Nav.Link>
            <Nav.Link as={NavLink} to="/about">Nosotros</Nav.Link>
            <Nav.Link as={NavLink} to="/contacto">Contacto</Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-2">
            {/* Estado de sesión */}
            {user ? (
              <>
                <span className="text-body-secondary small">
                  Hola, <strong>{user.nombre}</strong>
                </span>
                {isAdmin && (
                  <Link to="/admin" className="btn btn-outline-warning btn-sm">
                    Panel admin
                  </Link>
                )}
                <button className="btn btn-outline-secondary btn-sm" onClick={logout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-secondary btn-sm">Iniciar sesión</Link>
                <Link to="/registro" className="btn btn-primary btn-sm">Registrarse</Link>
              </>
            )}

           
            <button
              type="button"
              className="btn btn-light position-relative"
              onClick={open}
              aria-label="Abrir carrito"
            >
              <i className="bi bi-cart" />
              <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                {count}
              </Badge>
            </button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
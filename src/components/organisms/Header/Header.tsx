// src/components/organisms/Header/Header.tsx
import { Navbar, Container, Nav, Button, Badge } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "@domain/cart/cart.context";
import { useCartUI } from "@app/cart-ui.context"; // ⬅️ importante: mismo contexto en toda la app

export default function Header() {
  const { count } = useCart();
  const { open } = useCartUI();

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
            <Button variant="outline-secondary" size="sm">Iniciar sesión</Button>
            <Button variant="primary" size="sm">Registrarse</Button>

            {/* Botón: abre el drawer, NO navega */}
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

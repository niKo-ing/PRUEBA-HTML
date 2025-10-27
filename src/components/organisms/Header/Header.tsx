import { Navbar, Container, Nav, Button, Badge } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "@domain/cart/cart.context";

export default function Header() {
  const { count } = useCart();

  return (
    <Navbar
      bg="light"
      expand="lg"
      className="border-bottom sticky-top shadow-sm"
      style={{ backdropFilter: "saturate(180%) blur(8px)" }}
    >
      <Container className="py-1">
        {/* Brand como <Link> con clases de Bootstrap */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <img src="/assets/img/icono.png" alt="Todobarato" className="logo-navbar"/>
        </Link>

        <Navbar.Toggle />

        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/productos">
              Productos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/blogs">
              Blogs
            </Nav.Link>
            <Nav.Link as={NavLink} to="/about">
              Nosotros
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contacto">
              Contacto
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-2">
            <Button variant="outline-secondary" size="sm">
              Iniciar sesión
            </Button>
            <Button variant="primary" size="sm">
              Registrarse
            </Button>

            {/* Carrito como <Link> con clases de botón */}
            <Link to="/carrito" className="btn btn-light position-relative">
              <i className="bi bi-cart" />
              <Badge
                bg="danger"
                pill
                className="position-absolute top-0 start-100 translate-middle"
              >
                {count}
              </Badge>
            </Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

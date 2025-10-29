import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/organisms/Header/Header.tsx
import { Navbar, Container, Nav, Button, Badge } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "@domain/cart/cart.context";
import { useCartUI } from "@app/cart-ui.context"; // ⬅️ importante: mismo contexto en toda la app
export default function Header() {
    const { count } = useCart();
    const { open } = useCartUI();
    return (_jsx(Navbar, { expand: "lg", className: "navbar-custom border-bottom sticky-top shadow-sm", children: _jsxs(Container, { className: "py-1", children: [_jsx(Link, { to: "/", className: "navbar-brand d-flex align-items-center gap-2", children: _jsx("img", { src: "/assets/img/icono.png", alt: "Todobarato", className: "logo-navbar" }) }), _jsx(Navbar.Toggle, {}), _jsxs(Navbar.Collapse, { children: [_jsxs(Nav, { className: "me-auto", children: [_jsx(Nav.Link, { as: NavLink, to: "/", end: true, children: "Home" }), _jsx(Nav.Link, { as: NavLink, to: "/productos", children: "Productos" }), _jsx(Nav.Link, { as: NavLink, to: "/blogs", children: "Blogs" }), _jsx(Nav.Link, { as: NavLink, to: "/about", children: "Nosotros" }), _jsx(Nav.Link, { as: NavLink, to: "/contacto", children: "Contacto" })] }), _jsxs("div", { className: "d-flex align-items-center gap-2", children: [_jsx(Button, { variant: "outline-secondary", size: "sm", children: "Iniciar sesi\u00F3n" }), _jsx(Button, { variant: "primary", size: "sm", children: "Registrarse" }), _jsxs("button", { type: "button", className: "btn btn-light position-relative", onClick: (e) => {
                                        console.log("open cart CLICK"); // 👈 verifica en consola
                                        e.preventDefault(); // evita navegación
                                        e.stopPropagation(); // evita burbujeo hacia un Link/Nav
                                        open(); // abre el drawer del carrito
                                    }, "aria-label": "Abrir carrito", children: [_jsx("i", { className: "bi bi-cart" }), _jsx(Badge, { bg: "danger", pill: true, className: "position-absolute top-0 start-100 translate-middle", children: count })] })] })] })] }) }));
}

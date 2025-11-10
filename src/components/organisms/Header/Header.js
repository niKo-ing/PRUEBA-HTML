import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Header: navegación principal, estado de sesión y acceso al carrito.
import { Navbar, Container, Nav, Badge } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "@domain/cart/useCart";
import { useCartUI } from "@app/cart-ui.context";
import { useAuth } from "@domain/auth/auth.context";
export default function Header() {
    // count = cantidad de ítems; open = abre el drawer del carrito
    const { count } = useCart();
    const { open } = useCartUI();
    const { user, logout } = useAuth();
    const isAdminStorage = (() => { try {
        return localStorage.getItem("isAdmin") === "1";
    }
    catch {
        return false;
    } })();
    const isAdminByEmail = !!user && /^(admin|root)@/i.test(user.email);
    const isAdmin = isAdminStorage || isAdminByEmail;
    return (_jsx(Navbar, { expand: "lg", className: "navbar-custom border-bottom sticky-top shadow-sm", children: _jsxs(Container, { className: "py-1", children: [_jsx(Link, { to: "/", className: "navbar-brand d-flex align-items-center gap-2", children: _jsx("img", { src: "/assets/img/icono.png", alt: "Todobarato", className: "logo-navbar" }) }), _jsx(Navbar.Toggle, {}), _jsxs(Navbar.Collapse, { children: [_jsxs(Nav, { className: "me-auto", children: [_jsx(Nav.Link, { as: NavLink, to: "/", end: true, children: "Home" }), _jsx(Nav.Link, { as: NavLink, to: "/productos", children: "Productos" }), _jsx(Nav.Link, { as: NavLink, to: "/categorias", children: "Categor\u00EDas" }), _jsx(Nav.Link, { as: NavLink, to: "/blogs", children: "Blogs" }), _jsx(Nav.Link, { as: NavLink, to: "/about", children: "Nosotros" }), _jsx(Nav.Link, { as: NavLink, to: "/contacto", children: "Contacto" })] }), _jsxs("div", { className: "d-flex align-items-center gap-2", children: [user ? (_jsxs(_Fragment, { children: [_jsxs("span", { className: "text-body-secondary small", children: ["Hola, ", _jsx("strong", { children: user.nombre })] }), isAdmin && (_jsx(Link, { to: "/admin", className: "btn btn-outline-warning btn-sm", children: "Panel admin" })), _jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: logout, children: "Cerrar sesi\u00F3n" })] })) : (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", className: "btn btn-outline-secondary btn-sm", children: "Iniciar sesi\u00F3n" }), _jsx(Link, { to: "/registro", className: "btn btn-primary btn-sm", children: "Registrarse" })] })), _jsxs("button", { type: "button", className: "btn btn-light position-relative", onClick: open, "aria-label": "Abrir carrito", children: [_jsx("i", { className: "bi bi-cart" }), _jsx(Badge, { bg: "danger", pill: true, className: "position-absolute top-0 start-100 translate-middle", children: count })] })] })] })] }) }));
}

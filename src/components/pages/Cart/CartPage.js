import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Nombre del componente: CartPage
 * Propósito: Mostrar la tabla del carrito con controles y resumen de compra.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; lee estado desde el contexto `useCart`.
 *
 * Métodos/funciones:
 * - No define helpers externos; calcula filas y total vía `useMemo`.
 *
 * Hooks utilizados:
 * - useCart: obtener items del carrito y acciones de cambio/eliminar/vaciar.
 * - useMemo: normalización de filas y cálculo de total.
 * - useNavigate: navegación hacia checkout.
 *
 * Ejemplo de uso:
 * ```tsx
 * <CartPage />
 * ```
 */
/**
 * Página CartPage - Tabla de carrito con resumen y acciones
 * Props: no recibe; Estado: derivado del contexto; Dependencias: react-bootstrap, react-router-dom, useCart
 */
import React, { useMemo } from "react";
import { Container, Row, Col, Table, Button, Alert, Card } from "react-bootstrap";
import { fetchProducts } from "../../../services/products.service";
import { useCart } from "@domain/cart/cart.context";
import { useNavigate, Link } from "react-router-dom";
/**
 * Renderiza la página del carrito con tabla y resumen
 * @returns {JSX.Element} Contenido del carrito
 */
export default function CartPage() {
    const { items, change, remove, clear } = useCart();
    const navigate = useNavigate();
    const [catalog, setCatalog] = React.useState([]);
    React.useEffect(() => {
        let alive = true;
        fetchProducts()
            .then((data) => { if (!alive)
            return; setCatalog(Array.isArray(data) ? data : []); })
            .catch(() => void 0);
        return () => { alive = false; };
    }, []);
    // Normaliza los datos del carrito con información del catálogo
    const rows = useMemo(() => {
        return items.map((it) => {
            const p = catalog.find((pp) => pp.id === it.id);
            return {
                id: it.id,
                qty: it.qty,
                nombre: p?.nombre ?? `Producto ${it.id}`,
                precio: p?.precio ?? 0,
                img: (p?.images?.[0] ?? p?.img) ?? "/assets/img/icono.png",
                slug: p?.slug ?? String(it.id),
                subtotal: (p?.precio ?? 0) * it.qty,
            };
        });
    }, [items, catalog]);
    // Total general del carrito
    const total = useMemo(() => rows.reduce((acc, r) => acc + r.subtotal, 0), [rows]);
    // Estado vacío: sugiere volver al catálogo
    if (rows.length === 0) {
        return (_jsx(Container, { className: "py-5", children: _jsx(Row, { children: _jsxs(Col, { lg: 8, children: [_jsx(Alert, { variant: "info", children: "Tu carrito est\u00E1 vac\u00EDo." }), _jsx(Link, { to: "/productos", className: "btn btn-warning", children: "Explorar productos" })] }) }) }));
    }
    return (_jsx(Container, { className: "py-4", children: _jsxs(Row, { children: [_jsxs(Col, { lg: 8, children: [_jsx("h2", { className: "mb-3", children: "Carrito de compras" }), _jsx(Card, { className: "shadow-sm", children: _jsxs(Card.Body, { className: "p-0", children: ["// Tabla con controles de cantidad y eliminaci\u00F3n por \u00EDtem", _jsxs(Table, { responsive: true, hover: true, className: "mb-0 align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { style: { width: 90 }, children: "Imagen" }), _jsx("th", { children: "Producto" }), _jsx("th", { style: { width: 130 }, children: "Precio" }), _jsx("th", { style: { width: 140 }, children: "Cantidad" }), _jsx("th", { style: { width: 140 }, children: "Subtotal" }), _jsx("th", { style: { width: 120 }, children: "Acciones" })] }) }), _jsx("tbody", { children: rows.map((r) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("img", { src: r.img, alt: r.nombre, style: { width: 70, height: 70, objectFit: "cover" } }) }), _jsx("td", { children: _jsx(Link, { to: `/producto/${r.slug}`, className: "text-decoration-none", children: r.nombre }) }), _jsx("td", { className: "fw-semibold", children: r.precio.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }) }), _jsx("td", { children: _jsxs("div", { className: "d-flex align-items-center gap-2", children: [_jsx(Button, { variant: "outline-secondary", size: "sm", onClick: () => change(r.id, -1), children: "-" }), _jsx("span", { className: "fw-semibold", children: r.qty }), _jsx(Button, { variant: "outline-secondary", size: "sm", onClick: () => change(r.id, +1), children: "+" })] }) }), _jsx("td", { className: "fw-semibold", children: r.subtotal.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }) }), _jsx("td", { children: _jsx(Button, { variant: "outline-danger", size: "sm", onClick: () => remove(r.id), children: "Quitar" }) })] }, r.id))) })] })] }) })] })
                // Resumen a la derecha con total y acciones principales
                , "// Resumen a la derecha con total y acciones principales", _jsx(Col, { lg: 4, className: "mt-4 mt-lg-0", children: _jsx(Card, { className: "shadow-sm", children: _jsxs(Card.Body, { children: [_jsxs("div", { className: "d-flex justify-content-between", children: [_jsx("div", { className: "text-body-secondary", children: "Total" }), _jsx("div", { className: "h5 mb-0", children: total.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }) })] }), _jsxs("div", { className: "d-grid gap-2 mt-3", children: [_jsxs(Button, { variant: "warning", className: "btn-lg", onClick: () => navigate("/checkout"), "aria-label": "Pagar", children: [_jsx("i", { className: "bi bi-credit-card me-2" }), "Pagar"] }), _jsx(Button, { variant: "outline-secondary", onClick: () => clear(), children: "Vaciar carrito" })] })] }) }) })] }) }));
}

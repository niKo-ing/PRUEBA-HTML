import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Página AdminReceipt: carga una orden desde localStorage por id y
// muestra una boleta imprimible con detalle por ítems y totales.
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Table, Button } from "react-bootstrap";
// Formatea un número como CLP, tolerando entornos sin Intl
function formatCLP(v) {
    try {
        return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
    }
    catch {
        return `$${Math.round(v)}`;
    }
}
export default function AdminReceipt() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    useEffect(() => {
        // Busca la orden en localStorage ('admin_orders') y la asigna si existe
        try {
            const saved = JSON.parse(localStorage.getItem("admin_orders") || "null") || [];
            const found = saved.find((o) => o.id === id) || null;
            setOrder(found);
        }
        catch {
            setOrder(null);
        }
    }, [id]);
    const totals = useMemo(() => {
        // Reconstruye totales si la orden es antigua y no los trae desglosados
        if (!order)
            return { subtotal: 0, iva: 0, shipping: 0, total: 0 };
        const subtotal = Number.isFinite(order.subtotal) ? order.subtotal : order.total - (order.iva || 0) - (order.shipping || 0);
        const iva = Number.isFinite(order.iva) ? order.iva : Math.round(subtotal * 0.19);
        const shipping = Number.isFinite(order.shipping) ? order.shipping : 3990;
        const total = Number.isFinite(order.total) ? order.total : subtotal + iva + shipping;
        return { subtotal, iva, shipping, total };
    }, [order]);
    const printReceipt = () => {
        // Abre el diálogo de impresión del navegador
        window.print();
    };
    if (!order) {
        return (_jsx(Container, { className: "py-4", children: _jsx(Card, { className: "shadow-sm", children: _jsxs(Card.Body, { className: "text-center", children: [_jsx("div", { className: "h5", children: "Boleta no encontrada" }), _jsx("p", { className: "text-body-secondary", children: "No existe una orden con el c\u00F3digo proporcionado." }), _jsx(Link, { to: "/admin/orders", className: "btn btn-outline-secondary", children: "Volver a pedidos" })] }) }) }));
    }
    return (_jsxs(Container, { className: "py-4", children: [_jsxs(Row, { className: "mb-3 align-items-center", children: [_jsxs(Col, { children: [_jsxs("h2", { className: "mb-0", children: ["Boleta #", order.id] }), _jsxs("div", { className: "text-body-secondary", children: [new Date(order.fecha).toLocaleString(), " \u00B7 Estado: ", order.estado] })] }), _jsxs(Col, { xs: "auto", className: "d-flex gap-2", children: [_jsx(Link, { to: "/admin/orders", className: "btn btn-outline-secondary", children: "Volver" }), _jsx(Button, { variant: "primary", onClick: printReceipt, children: "Imprimir" })] })] }), _jsx(Card, { className: "shadow-sm mb-3", children: _jsx(Card.Body, { children: _jsxs(Row, { children: [_jsxs(Col, { md: 6, children: [_jsx("div", { className: "fw-semibold mb-2", children: "Cliente" }), _jsx("div", { children: order.cliente }), _jsx("div", { className: "text-body-secondary", children: order.email })] }), _jsxs(Col, { md: 6, className: "text-md-end", children: [_jsx("div", { className: "fw-semibold mb-2", children: "Tienda" }), _jsx("div", { children: "TodoBaratisimo" }), _jsx("div", { className: "text-body-secondary", children: "ventas@todobaratisimo.cl" })] })] }) }) }), _jsxs(Card, { className: "shadow-sm", children: [_jsx(Card.Body, { className: "p-0", children: _jsxs(Table, { responsive: true, hover: true, className: "mb-0 align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "Producto" }), _jsx("th", { style: { width: 120 }, children: "Precio" }), _jsx("th", { style: { width: 120 }, children: "Cantidad" }), _jsx("th", { style: { width: 160 }, children: "Subtotal" })] }) }), _jsxs("tbody", { children: [(order.detalles || []).map((d) => (_jsxs("tr", { children: [_jsx("td", { children: d.nombre }), _jsx("td", { children: formatCLP(d.precio) }), _jsx("td", { children: d.qty }), _jsx("td", { className: "fw-semibold", children: formatCLP(d.total) })] }, `${order.id}-${d.id}`))), (order.detalles || []).length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center text-body-secondary py-4", children: "Sin detalles para esta boleta." }) }))] })] }) }), _jsx(Card.Footer, { children: _jsxs("div", { className: "d-flex flex-column align-items-end gap-1", children: [_jsxs("div", { children: ["Subtotal: ", _jsx("span", { className: "fw-semibold", children: formatCLP(totals.subtotal) })] }), _jsxs("div", { children: ["Env\u00EDo: ", _jsx("span", { className: "fw-semibold", children: formatCLP(totals.shipping) })] }), _jsxs("div", { children: ["IVA (19%): ", _jsx("span", { className: "fw-semibold", children: formatCLP(totals.iva) })] }), _jsxs("div", { className: "fs-5", children: ["Total: ", _jsx("span", { className: "fw-semibold", children: formatCLP(totals.total) })] })] }) })] })] }));
}

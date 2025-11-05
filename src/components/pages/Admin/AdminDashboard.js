import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Badge, ProgressBar, Table } from "react-bootstrap";
function formatCLP(v) {
    try {
        return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
    }
    catch {
        return `$${Math.round(v)}`;
    }
}
export default function AdminDashboard() {
    const [orders, setOrders] = useState([]);
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("admin_orders") || "null") || [];
            setOrders(saved);
        }
        catch { }
    }, []);
    const pending = useMemo(() => orders.filter(o => o.estado === "pendiente").length, [orders]);
    const today = useMemo(() => {
        const t0 = new Date();
        t0.setHours(0, 0, 0, 0);
        const t1 = new Date();
        t1.setHours(23, 59, 59, 999);
        return orders.reduce((acc, o) => {
            const d = new Date(o.fecha).getTime();
            return d >= t0.getTime() && d <= t1.getTime() ? acc + (Number.isFinite(o.total) ? o.total : 0) : acc;
        }, 0);
    }, [orders]);
    const totalProducts = productosPublicados();
    function productosPublicados() {
        try {
            // Si en el futuro guardamos productos en localStorage, tomarlos; por ahora estimado
            const raw = localStorage.getItem("admin_products");
            if (raw) {
                const arr = JSON.parse(raw);
                return Array.isArray(arr) ? arr.length : 0;
            }
        }
        catch { }
        return 24; // placeholder visual
    }
    const progressDay = Math.min(100, Math.round((today / 200000) * 100)); // meta visual
    const recent = useMemo(() => orders.slice(0, 5), [orders]);
    return (_jsxs("div", { children: [_jsx("h2", { className: "mb-3", children: "Dashboard" }), _jsxs(Row, { className: "g-3 mb-4", children: [_jsx(Col, { md: 4, children: _jsx(Card, { className: "shadow-sm", children: _jsxs(Card.Body, { children: [_jsxs("div", { className: "d-flex justify-content-between align-items-baseline", children: [_jsxs("div", { children: [_jsx("div", { className: "text-body-secondary small", children: "Ventas (hoy)" }), _jsx("div", { className: "h4 mb-1", children: formatCLP(today) })] }), _jsx(Badge, { bg: "success", children: "Meta" })] }), _jsx(ProgressBar, { now: progressDay, variant: "success", className: "mt-2" })] }) }) }), _jsx(Col, { md: 4, children: _jsx(Card, { className: "shadow-sm", children: _jsxs(Card.Body, { children: [_jsx("div", { className: "text-body-secondary small", children: "Pedidos pendientes" }), _jsx("div", { className: "h4 mb-1", children: pending }), _jsx("div", { className: "small text-body-secondary", children: "En proceso y por atender" })] }) }) }), _jsx(Col, { md: 4, children: _jsx(Card, { className: "shadow-sm", children: _jsxs(Card.Body, { children: [_jsx("div", { className: "text-body-secondary small", children: "Productos publicados" }), _jsx("div", { className: "h4 mb-1", children: totalProducts }), _jsx("div", { className: "small text-body-secondary", children: "Incluye variaciones" })] }) }) })] }), _jsx(Row, { className: "g-3", children: _jsx(Col, { md: 12, children: _jsxs(Card, { className: "shadow-sm", children: [_jsxs(Card.Header, { className: "d-flex justify-content-between align-items-center", children: [_jsx("div", { className: "fw-semibold", children: "Pedidos recientes" }), _jsx(Badge, { bg: "info", children: orders.length })] }), _jsx(Card.Body, { className: "p-0", children: _jsxs(Table, { responsive: true, hover: true, className: "mb-0 align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "C\u00F3digo" }), _jsx("th", { children: "Cliente" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Estado" })] }) }), _jsxs("tbody", { children: [recent.map((o) => (_jsxs("tr", { children: [_jsx("td", { className: "text-nowrap", children: o.id }), _jsx("td", { children: o.cliente }), _jsx("td", { className: "text-body-secondary", children: o.email }), _jsx("td", { className: "fw-semibold", children: formatCLP(o.total) }), _jsx("td", { children: _jsx(Badge, { bg: "secondary", children: o.estado }) })] }, o.id))), recent.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center text-body-secondary py-4", children: "Sin pedidos recientes." }) }))] })] }) })] }) }) })] }));
}

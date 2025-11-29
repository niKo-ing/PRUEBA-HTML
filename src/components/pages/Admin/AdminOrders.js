import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Nombre del componente: AdminOrders
 * Propósito: Administración de pedidos con filtros y edición de estado.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; carga pedidos desde localStorage con dataset por defecto.
 *
 * Métodos/funciones:
 * - formatCLP(v: number): string — Formatea CLP sin decimales.
 * - onEditEstado(idx): cambia estado de un pedido.
 * - saveAll(): guarda pedidos en localStorage.
 * - discard(): restaura últimos cambios.
 *
 * Hooks utilizados:
 * - useEffect: carga inicial desde localStorage.
 * - useState: manejo de filas y filtros.
 * - useMemo: aplica filtros de texto y estado.
 *
 * Ejemplo de uso:
 * ```tsx
 * <AdminOrders />
 * ```
 */
// Pedidos: tabla editable de estados, filtros por texto y estado, y boleta.
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
const sv = (v) => v ?? "";
const sn = (v) => (Number.isFinite(v) ? v : 0);
// Utilidad para mostrar CLP sin decimales
function formatCLP(v) {
    try {
        return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
    }
    catch {
        return `$${Math.round(v)}`;
    }
}
const defaultOrders = [
    { id: "OD-1001", cliente: "Ana Torres", email: "ana@example.com", total: 25990, fecha: new Date().toISOString(), estado: "pendiente", items: 2 },
    { id: "OD-1002", cliente: "Luis Pérez", email: "luis@example.com", total: 7990, fecha: new Date(Date.now() - 86400000).toISOString(), estado: "procesando", items: 1 },
    { id: "OD-1003", cliente: "María Silva", email: "maria@example.com", total: 139990, fecha: new Date(Date.now() - 2 * 86400000).toISOString(), estado: "enviado", items: 3 },
];
export default function AdminOrders() {
    const [rows, setRows] = useState([]);
    const [q, setQ] = useState("");
    const [estado, setEstado] = useState("");
    // Carga inicial desde localStorage o dataset por defecto
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("admin_orders") || "null") || defaultOrders;
            setRows(saved);
        }
        catch {
            setRows(defaultOrders);
        }
    }, []);
    const estados = ["pendiente", "procesando", "enviado", "completado", "cancelado"];
    // Aplica filtros de búsqueda y estado
    const filtered = useMemo(() => {
        const ql = q.trim().toLowerCase();
        return rows.filter((r) => {
            const base = `${sv(r.cliente)} ${sv(r.email)} ${sv(r.id)}`.toLowerCase();
            const okQ = !ql || base.includes(ql);
            const okE = !estado || r.estado === estado;
            return okQ && okE;
        });
    }, [rows, q, estado]);
    // Permite cambiar el estado por fila
    const onEditEstado = (idx) => (e) => {
        const val = e.target.value;
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, estado: val } : r)));
    };
    // Persistencia mock de pedidos
    const saveAll = () => {
        localStorage.setItem("admin_orders", JSON.stringify(rows));
        alert("Pedidos guardados (localStorage)");
    };
    // Recupera última versión guardada
    const discard = () => {
        try {
            const saved = JSON.parse(localStorage.getItem("admin_orders") || "null") || defaultOrders;
            setRows(saved);
        }
        catch {
            setRows(defaultOrders);
        }
    };
    return (_jsxs(Container, { className: "py-4", children: [_jsxs(Row, { className: "mb-3 align-items-end g-2", children: [_jsxs(Col, { xs: 12, md: 6, children: [_jsx("h2", { className: "mb-0", children: "Pedidos" }), _jsxs("small", { className: "text-body-secondary", children: [rows.length, " pedidos\u00A0|\u00A0", _jsxs(Badge, { bg: "info", children: [filtered.length, " visibles"] })] })] }), _jsxs(Col, { xs: 12, md: 3, children: [_jsx(Form.Label, { className: "small mb-1", children: "Buscar" }), _jsx(Form.Control, { type: "search", value: sv(q), onChange: (e) => setQ(e.target.value), placeholder: "Cliente, email o c\u00F3digo\u2026" })] }), _jsxs(Col, { xs: 12, md: 3, children: [_jsx(Form.Label, { className: "small mb-1", children: "Estado" }), _jsxs(Form.Select, { value: sv(estado), onChange: (e) => setEstado(e.target.value), children: [_jsx("option", { value: "", children: "Todos" }), estados.map((e) => (_jsx("option", { value: e, children: e }, e)))] })] })] }), _jsxs(Card, { className: "shadow-sm", children: [_jsx(Card.Body, { className: "p-0", children: _jsxs(Table, { responsive: true, hover: true, className: "mb-0 align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "C\u00F3digo" }), _jsx("th", { children: "Cliente" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Items" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Fecha" }), _jsx("th", { children: "Estado" })] }) }), _jsxs("tbody", { children: [filtered.map((r, idx) => (_jsxs("tr", { children: [_jsx("td", { className: "text-nowrap", children: r.id }), _jsx("td", { children: sv(r.cliente) }), _jsx("td", { className: "text-body-secondary", children: sv(r.email) }), _jsx("td", { children: sn(r.items) }), _jsx("td", { className: "fw-semibold", children: formatCLP(sn(r.total)) }), _jsx("td", { className: "text-nowrap", children: new Date(r.fecha).toLocaleString() }), _jsx("td", { style: { width: 240 }, children: _jsxs("div", { className: "d-flex gap-2", children: [_jsx(Form.Select, { value: r.estado, onChange: onEditEstado(idx), style: { minWidth: 150 }, children: estados.map((e) => (_jsx("option", { value: e, children: e }, e))) }), _jsx(Link, { to: `/admin/receipt/${r.id}`, className: "btn btn-outline-primary btn-sm", children: "Ver boleta" })] }) })] }, r.id))), filtered.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center text-body-secondary py-4", children: "Sin pedidos para los filtros aplicados." }) }))] })] }) }), _jsxs(Card.Footer, { className: "d-flex justify-content-end gap-2", children: [_jsx(Button, { variant: "outline-secondary", onClick: discard, children: "Descartar cambios" }), _jsx(Button, { variant: "warning", onClick: saveAll, children: "Guardar cambios" })] })] })] }));
}

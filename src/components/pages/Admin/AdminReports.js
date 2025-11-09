import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Table, Form, Button } from "react-bootstrap";
export default function AdminReports() {
    const [orders, setOrders] = useState([]);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [q, setQ] = useState("");
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("admin_orders") || "null") || [];
            setOrders(saved);
        }
        catch { }
    }, []);
    const filtered = useMemo(() => {
        const ql = q.trim().toLowerCase();
        const t0 = from ? new Date(from).getTime() : 0;
        const t1 = to ? new Date(to).getTime() : Number.MAX_SAFE_INTEGER;
        return orders.filter(o => {
            const base = `${o.id} ${o.cliente} ${o.email}`.toLowerCase();
            const okQ = !ql || base.includes(ql);
            const d = new Date(o.fecha).getTime();
            const okR = d >= t0 && d <= t1;
            return okQ && okR;
        });
    }, [orders, from, to, q]);
    const total = useMemo(() => filtered.reduce((acc, o) => acc + (Number.isFinite(o.total) ? o.total : 0), 0), [filtered]);
    const exportCSV = () => {
        const header = ["id", "cliente", "email", "total", "fecha", "estado", "items"];
        const rows = filtered.map(o => [o.id, o.cliente, o.email, String(o.total), o.fecha, o.estado, String(o.items)].join(","));
        const blob = new Blob([header.join(",") + "\n" + rows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "reporte.csv";
        a.click();
        URL.revokeObjectURL(url);
    };
    return (_jsxs(Container, { className: "py-4", children: [_jsxs(Row, { className: "mb-3 align-items-end g-2", children: [_jsxs(Col, { children: [_jsx("h2", { className: "mb-0", children: "Reportes" }), _jsxs("div", { className: "text-body-secondary", children: ["\u00D3rdenes filtradas: ", filtered.length, " \u00B7 Total: ", total.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })] })] }), _jsxs(Col, { md: 3, children: [_jsx(Form.Label, { className: "small mb-1", children: "Desde" }), _jsx(Form.Control, { type: "date", value: from, onChange: (e) => setFrom(e.target.value) })] }), _jsxs(Col, { md: 3, children: [_jsx(Form.Label, { className: "small mb-1", children: "Hasta" }), _jsx(Form.Control, { type: "date", value: to, onChange: (e) => setTo(e.target.value) })] }), _jsxs(Col, { md: 3, children: [_jsx(Form.Label, { className: "small mb-1", children: "Buscar" }), _jsx(Form.Control, { type: "search", value: q, onChange: (e) => setQ(e.target.value), placeholder: "Cliente, email o c\u00F3digo\u2026" })] }), _jsx(Col, { md: 3, className: "d-grid", children: _jsx(Button, { variant: "warning", onClick: exportCSV, children: "Exportar CSV" }) })] }), _jsx(Card, { className: "shadow-sm", children: _jsx(Card.Body, { className: "p-0", children: _jsxs(Table, { responsive: true, hover: true, className: "mb-0 align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "C\u00F3digo" }), _jsx("th", { children: "Cliente" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Items" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Fecha" }), _jsx("th", { children: "Estado" })] }) }), _jsxs("tbody", { children: [filtered.map((o) => (_jsxs("tr", { children: [_jsx("td", { className: "text-nowrap", children: o.id }), _jsx("td", { children: o.cliente }), _jsx("td", { className: "text-body-secondary", children: o.email }), _jsx("td", { children: o.items }), _jsx("td", { className: "fw-semibold", children: o.total.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }) }), _jsx("td", { className: "text-nowrap", children: new Date(o.fecha).toLocaleString() }), _jsx("td", { children: o.estado })] }, o.id))), filtered.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center text-body-secondary py-4", children: "Sin \u00F3rdenes para el rango." }) }))] })] }) }) })] }));
}

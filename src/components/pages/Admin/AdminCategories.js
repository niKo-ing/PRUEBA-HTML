import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Badge } from "react-bootstrap";
import { productos } from "@domain/data";
export default function AdminCategories() {
    const initial = useMemo(() => {
        const set = new Set();
        productos.forEach(p => {
            const cats = Array.isArray(p.categoria) ? p.categoria : [p.categoria];
            cats.filter(Boolean).forEach(c => set.add(String(c)));
        });
        const saved = (() => {
            try {
                return JSON.parse(localStorage.getItem("admin_categories") || "null") || [];
            }
            catch {
                return [];
            }
        })();
        const merged = new Set([...Array.from(set), ...saved.map(r => r.nombre)]);
        return Array.from(merged).sort().map(nombre => ({ nombre }));
    }, []);
    const [rows, setRows] = useState(initial);
    const [q, setQ] = useState("");
    const filtered = useMemo(() => {
        const ql = q.trim().toLowerCase();
        return rows.filter(r => !ql || r.nombre.toLowerCase().includes(ql));
    }, [rows, q]);
    const addRow = () => setRows(prev => [{ nombre: "Nueva categoría" }, ...prev]);
    const onEdit = (idx) => (e) => {
        const val = e.target.value;
        setRows(prev => prev.map((r, i) => (i === idx ? { nombre: val } : r)));
    };
    const onDelete = (idx) => setRows(prev => prev.filter((_, i) => i !== idx));
    const saveAll = () => { localStorage.setItem("admin_categories", JSON.stringify(rows)); alert("Categorías guardadas (localStorage)"); };
    const discard = () => {
        try {
            const saved = JSON.parse(localStorage.getItem("admin_categories") || "null") || initial;
            setRows(saved);
        }
        catch {
            setRows(initial);
        }
    };
    return (_jsxs(Container, { className: "py-4", children: [_jsxs(Row, { className: "mb-3 align-items-end g-2", children: [_jsxs(Col, { xs: 12, md: 6, children: [_jsx("h2", { className: "mb-0", children: "Categor\u00EDas" }), _jsxs("small", { className: "text-body-secondary", children: [rows.length, " \u00EDtems\u00A0|\u00A0", _jsxs(Badge, { bg: "info", children: [filtered.length, " visibles"] })] })] }), _jsxs(Col, { xs: 12, md: 4, children: [_jsx(Form.Label, { className: "small mb-1", children: "Buscar" }), _jsx(Form.Control, { type: "search", value: q, onChange: (e) => setQ(e.target.value), placeholder: "Nombre\u2026" })] }), _jsx(Col, { xs: 12, md: 2, className: "d-grid", children: _jsx(Button, { variant: "outline-secondary", onClick: addRow, children: "Nueva" }) })] }), _jsxs(Card, { className: "shadow-sm", children: [_jsx(Card.Body, { className: "p-0", children: _jsxs(Table, { responsive: true, hover: true, className: "mb-0 align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "Nombre" }), _jsx("th", { style: { width: 120 }, children: "Acciones" })] }) }), _jsxs("tbody", { children: [filtered.map((r, idx) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx(Form.Control, { value: r.nombre, onChange: onEdit(idx) }) }), _jsx("td", { children: _jsx(Button, { variant: "outline-danger", size: "sm", onClick: () => onDelete(idx), children: "Eliminar" }) })] }, idx))), filtered.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 2, className: "text-center text-body-secondary py-4", children: "Sin categor\u00EDas." }) }))] })] }) }), _jsxs(Card.Footer, { className: "d-flex justify-content-end gap-2", children: [_jsx(Button, { variant: "outline-secondary", onClick: discard, children: "Descartar" }), _jsx(Button, { variant: "warning", onClick: saveAll, children: "Guardar" })] })] })] }));
}

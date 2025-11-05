import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Container, Row, Col, Form, InputGroup, Button, Card, Badge, Pagination } from "react-bootstrap";
import { productos } from "@domain/data";
import { useCart } from "@domain/cart/cart.context";
// ————————————————————————————————————————
// Utils
// ————————————————————————————————————————
function formatCLP(v) {
    return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}
const toArr = (c) => (Array.isArray(c) ? c : [c]);
const matchCategoria = (pCat, target) => !target || toArr(pCat).some((x) => x === target);
// categorías únicas desde la data
const ALL_CATEGORIES = Array.from(new Set(productos.flatMap(p => toArr(p.categoria)))).sort();
const sorters = {
    relevancia: () => 0,
    precio_asc: (a, b) => a.precio - b.precio,
    precio_desc: (a, b) => b.precio - a.precio,
    nombre_asc: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
    nombre_desc: (a, b) => b.nombre.localeCompare(a.nombre, "es"),
};
// ————————————————————————————————————————
// Página
// ————————————————————————————————————————
export default function ProductsPage() {
    const { add } = useCart();
    const [params, setParams] = useSearchParams();
    // lee query params
    const q = params.get("q") ?? "";
    const cat = params.get("cat") ?? ""; // categoría
    const min = params.get("min") ?? ""; // precio mínimo
    const max = params.get("max") ?? ""; // precio máximo
    const sort = params.get("sort") ?? "relevancia";
    const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
    const pageSize = Math.min(48, Math.max(4, parseInt(params.get("size") ?? "12", 10))); // 12 por defecto
    // setters de params (mantienen el resto)
    const setParam = useCallback((k, v) => {
        const next = new URLSearchParams(params);
        if (v === null || v === "")
            next.delete(k);
        else
            next.set(k, v);
        // al cambiar filtros, resetear a página 1 salvo que sea size
        if (k !== "page" && k !== "size")
            next.set("page", "1");
        setParams(next, { replace: true });
    }, [params, setParams]);
    const resetFilters = () => {
        const keep = new URLSearchParams();
        // conserva page size si quieres
        if (params.get("size"))
            keep.set("size", params.get("size"));
        setParams(keep, { replace: true });
    };
    // filtrar + ordenar
    const filtered = useMemo(() => {
        const qNorm = q.trim().toLowerCase();
        const minV = min ? Number(min) : null;
        const maxV = max ? Number(max) : null;
        const items = productos.filter((p) => {
            if (qNorm) {
                const hayCoincidencia = p.nombre.toLowerCase().includes(qNorm) ||
                    (p.descripcion ?? "").toLowerCase().includes(qNorm);
                if (!hayCoincidencia)
                    return false;
            }
            if (cat && !matchCategoria(p.categoria, cat))
                return false;
            if (minV !== null && p.precio < minV)
                return false;
            if (maxV !== null && p.precio > maxV)
                return false;
            return true;
        });
        const sorter = sorters[sort] ?? sorters.relevancia;
        return [...items].sort(sorter);
    }, [q, cat, min, max, sort]);
    // paginación
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const pageSafe = Math.min(page, totalPages);
    const start = (pageSafe - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = filtered.slice(start, end);
    // render
    return (_jsxs(Container, { className: "py-4", children: [_jsxs(Row, { className: "align-items-end g-3 mb-3", children: [_jsxs(Col, { md: 4, children: [_jsx(Form.Label, { className: "fw-semibold", children: "Buscar" }), _jsxs(InputGroup, { children: [_jsx(Form.Control, { placeholder: "Nombre, descripci\u00F3n\u2026", value: q, onChange: (e) => setParam("q", e.target.value) }), _jsx(Button, { variant: "outline-secondary", onClick: () => setParam("q", ""), children: "Limpiar" })] })] }), _jsxs(Col, { md: 3, children: [_jsx(Form.Label, { className: "fw-semibold", children: "Categor\u00EDa" }), _jsxs(Form.Select, { value: cat, onChange: (e) => setParam("cat", e.target.value || null), children: [_jsx("option", { value: "", children: "Todas" }), ALL_CATEGORIES.map((c) => (_jsx("option", { value: c, children: c }, c)))] })] }), _jsxs(Col, { md: 3, children: [_jsx(Form.Label, { className: "fw-semibold", children: "Precio" }), _jsxs(InputGroup, { children: [_jsx(Form.Control, { type: "number", min: 0, placeholder: "M\u00EDn", value: min, onChange: (e) => setParam("min", e.target.value) }), _jsx(Form.Control, { type: "number", min: 0, placeholder: "M\u00E1x", value: max, onChange: (e) => setParam("max", e.target.value) })] })] }), _jsxs(Col, { md: 2, children: [_jsx(Form.Label, { className: "fw-semibold", children: "Ordenar por" }), _jsxs(Form.Select, { value: sort, onChange: (e) => setParam("sort", e.target.value), children: [_jsx("option", { value: "relevancia", children: "Relevancia" }), _jsx("option", { value: "precio_asc", children: "Precio: menor a mayor" }), _jsx("option", { value: "precio_desc", children: "Precio: mayor a menor" }), _jsx("option", { value: "nombre_asc", children: "Nombre A \u2192 Z" }), _jsx("option", { value: "nombre_desc", children: "Nombre Z \u2192 A" })] })] })] }), _jsxs(Row, { className: "g-2 mb-3", children: [_jsx(Col, { xs: "auto", children: _jsx(Button, { variant: "outline-secondary", onClick: resetFilters, children: "Reiniciar filtros" }) }), _jsx(Col, { xs: "auto", className: "ms-auto", children: _jsx(Form.Select, { value: String(pageSize), onChange: (e) => setParam("size", e.target.value), children: [8, 12, 16, 24, 32].map(s => (_jsxs("option", { value: s, children: [s, " por p\u00E1gina"] }, s))) }) })] }), _jsx("div", { className: "d-flex justify-content-between align-items-center mb-3", children: _jsxs("div", { className: "text-body-secondary", children: [total, " resultado", total !== 1 ? "s" : "", cat ? _jsxs(_Fragment, { children: [" \u00B7 categor\u00EDa: ", _jsx(Badge, { bg: "secondary", children: cat })] }) : null, q ? _jsxs(_Fragment, { children: [" \u00B7 b\u00FAsqueda: \u201C", q, "\u201D"] }) : null] }) }), _jsx(Row, { className: "g-3", children: pageItems.map((p) => (_jsx(Col, { xs: 12, sm: 6, md: 4, lg: 3, children: _jsxs(Card, { className: "h-100", children: [_jsx(Link, { to: `/producto/${p.slug}`, className: "text-decoration-none", children: _jsx(Card.Img, { variant: "top", src: (p.images?.[0] ?? p.img), alt: p.nombre, className: "card-img-fit" // asegura no recortar (tienes esta clase en app.css)
                                 }) }), _jsxs(Card.Body, { className: "d-flex flex-column", children: [_jsx(Card.Title, { className: "h6 mb-1", children: p.nombre }), _jsx("div", { className: "mb-2 text-muted small", children: Array.isArray(p.categoria) ? p.categoria.join(", ") : p.categoria }), _jsx("div", { className: "fw-bold mb-3", children: formatCLP(p.precio) }), _jsxs("div", { className: "mt-auto d-flex gap-2", children: [_jsx(Link, { to: `/producto/${p.slug}`, className: "btn btn-outline-secondary btn-sm", children: "Ver" }), _jsx("button", { className: "btn btn-warning btn-sm", onClick: () => add(p.id, 1), children: "A\u00F1adir" })] })] })] }) }, p.id))) }), totalPages > 1 && (_jsx("div", { className: "d-flex justify-content-center mt-4", children: _jsxs(Pagination, { children: [_jsx(Pagination.First, { onClick: () => setParam("page", "1"), disabled: pageSafe === 1 }), _jsx(Pagination.Prev, { onClick: () => setParam("page", String(Math.max(1, pageSafe - 1))), disabled: pageSafe === 1 }), Array.from({ length: totalPages }).map((_, i) => {
                            const n = i + 1;
                            return (_jsx(Pagination.Item, { active: n === pageSafe, onClick: () => setParam("page", String(n)), children: n }, n));
                        }), _jsx(Pagination.Next, { onClick: () => setParam("page", String(Math.min(totalPages, pageSafe + 1))), disabled: pageSafe === totalPages }), _jsx(Pagination.Last, { onClick: () => setParam("page", String(totalPages)), disabled: pageSafe === totalPages })] }) }))] }));
}

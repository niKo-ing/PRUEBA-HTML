import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Página de administración de productos: edición inline, filtros y guardado en localStorage.
// No cambia la lógica: solo añade contexto para facilitar el mantenimiento.
// src/components/pages/Admin/AdminProducts.tsx
import { useMemo, useState } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Badge } from "react-bootstrap";
import { productos } from "@domain/data";
/* ----------------------- Helpers ----------------------- */
// sv/sn: aseguran valores string/number válidos en formularios
const sv = (v) => v ?? ""; // string value (nunca undefined)
const sn = (v) => (Number.isFinite(v) ? v : 0); // number seguro
// slugify: normaliza nombres a slugs web
const slugify = (s) => sv(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
// Convierte Product del dominio a Editable para formularios
function toEditable(p) {
    const nombre = sv(p.nombre);
    const imagenBase = sv(p.img) || "/assets/img/placeholder.png";
    const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : [imagenBase];
    const categoria = Array.isArray(p.categoria) ? sv(p.categoria[0]) : sv(p.categoria);
    const slug = sv(p.slug) || slugify(nombre || `prod-${p.id}`);
    return {
        id: p.id,
        nombre,
        slug,
        precio: sn(p.precio),
        categoria,
        stock: sn(p.stock),
        img: imagenBase,
        images,
        descripcion: sv(p.descripcion),
    };
}
/* ----------------------- Componente ----------------------- */
export default function AdminProducts() {
    // Fuente normalizada desde catálogo en memoria
    const initial = useMemo(() => productos.map(toEditable), []);
    const [rows, setRows] = useState(initial);
    // Filtros básicos en cabecera
    const [q, setQ] = useState("");
    const [cat, setCat] = useState("");
    // Lista de categorías únicas para el selector
    const cats = useMemo(() => {
        const acc = new Set();
        initial.forEach((p) => acc.add(p.categoria));
        return Array.from(acc).sort();
    }, [initial]);
    // Aplica búsqueda por nombre/slug y filtro por categoría
    const filtered = useMemo(() => {
        const ql = q.trim().toLowerCase();
        return rows.filter((r) => {
            const okQ = !ql || r.nombre.toLowerCase().includes(ql) || r.slug.toLowerCase().includes(ql);
            const okC = !cat || r.categoria === cat;
            return okQ && okC;
        });
    }, [rows, q, cat]);
    // Handler genérico de edición por campo; mantiene tipos correctos
    const onEdit = (id, key) => (e) => {
        const raw = e.target.value;
        setRows((prev) => prev.map((r) => {
            if (r.id !== id)
                return r;
            // Campos numéricos guardan número, pero mostramos string
            if (key === "precio" || key === "stock") {
                const n = raw === "" ? 0 : Number(raw.replace(/[^0-9.]/g, ""));
                return { ...r, [key]: Number.isFinite(n) ? n : 0 };
            }
            // slug: autogenerable si queda vacío
            if (key === "slug") {
                const val = sv(raw);
                return { ...r, slug: val || slugify(r.nombre || `prod-${r.id}`) };
            }
            // resto string
            return { ...r, [key]: sv(raw) };
        }));
    };
    // Persistencia mock: guarda cambios en localStorage
    const saveAll = () => {
        // Aquí podrías enviar a backend; por ahora, persistimos localStorage
        localStorage.setItem("admin_products", JSON.stringify(rows));
        alert("Cambios guardados (localStorage)");
    };
    return (_jsxs(Container, { className: "py-4", children: [_jsxs(Row, { className: "mb-3 align-items-end g-2", children: [_jsxs(Col, { xs: 12, md: 6, children: [_jsx("h2", { className: "mb-0", children: "Administrar productos" }), _jsxs("small", { className: "text-body-secondary", children: [rows.length, " \u00EDtems\u00A0|\u00A0", _jsxs(Badge, { bg: "info", children: [filtered.length, " visibles"] })] })] }), _jsxs(Col, { xs: 12, md: 3, children: [_jsx(Form.Label, { className: "small mb-1", children: "Buscar" }), _jsx(Form.Control, { type: "search", value: sv(q), onChange: (e) => setQ(e.target.value), placeholder: "Nombre o slug\u2026" })] }), _jsxs(Col, { xs: 12, md: 3, children: [_jsx(Form.Label, { className: "small mb-1", children: "Categor\u00EDa" }), _jsxs(Form.Select, { value: sv(cat), onChange: (e) => setCat(e.target.value), children: [_jsx("option", { value: "", children: "Todas" }), cats.map((c) => (_jsx("option", { value: c, children: c }, c)))] })] })] }), _jsxs(Card, { className: "shadow-sm", children: [_jsx(Card.Body, { className: "p-0", children: _jsxs(Table, { responsive: true, hover: true, className: "mb-0 align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { style: { width: 60 }, children: "ID" }), _jsx("th", { style: { width: 90 }, children: "Imagen" }), _jsx("th", { children: "Nombre" }), _jsx("th", { children: "Slug" }), _jsx("th", { style: { width: 130 }, children: "Precio" }), _jsx("th", { style: { width: 120 }, children: "Stock" }), _jsx("th", { style: { width: 180 }, children: "Categor\u00EDa" })] }) }), _jsxs("tbody", { children: [filtered.map((r) => (_jsxs("tr", { children: [_jsx("td", { children: r.id }), _jsx("td", { children: _jsx("img", { src: sv(r.img), alt: r.nombre, width: 64, height: 48, style: { objectFit: "cover", borderRadius: 8 } }) }), _jsx("td", { children: _jsx(Form.Control, { type: "text", value: sv(r.nombre), onChange: onEdit(r.id, "nombre"), placeholder: "Nombre\u2026" }) }), _jsx("td", { children: _jsx(Form.Control, { type: "text", value: sv(r.slug), onChange: onEdit(r.id, "slug"), placeholder: "slug-producto" }) }), _jsx("td", { children: _jsx(Form.Control, { type: "text", inputMode: "numeric", value: String(sn(r.precio)), onChange: onEdit(r.id, "precio") }) }), _jsx("td", { children: _jsx(Form.Control, { type: "text", inputMode: "numeric", value: String(sn(r.stock)), onChange: onEdit(r.id, "stock") }) }), _jsx("td", { children: _jsx(Form.Control, { type: "text", value: sv(r.categoria), onChange: onEdit(r.id, "categoria"), placeholder: "Categor\u00EDa\u2026" }) })] }, r.id))), filtered.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center text-body-secondary py-4", children: "Sin resultados para los filtros aplicados." }) }))] })] }) }), _jsxs(Card.Footer, { className: "d-flex justify-content-end gap-2", children: [_jsx(Button, { variant: "outline-secondary", onClick: () => setRows(initial), children: "Descartar cambios" }), _jsx(Button, { variant: "warning", onClick: saveAll, children: "Guardar cambios" })] })] })] }));
}

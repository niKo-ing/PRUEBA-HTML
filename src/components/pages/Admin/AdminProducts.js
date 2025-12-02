import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Nombre del componente: AdminProducts
 * Propósito: Administración y edición inline de catálogo con filtros y persistencia local.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; carga catálogo y permite edición en tabla.
 *
 * Métodos/funciones:
 * - sv(v?): string — Normaliza strings a valor seguro.
 * - sn(v?): number — Asegura números válidos en formularios.
 * - slugify(s: string): string — Genera slugs web.
 * - toEditable(p: Product): Editable — Convierte Product a tipo editable.
 *
 * Hooks utilizados:
 * - useMemo: inicialización y filtros; categorías únicas.
 * - useState: estado de filas y filtros.
 *
 * Ejemplo de uso:
 * ```tsx
 * <AdminProducts />
 * ```
 */
// Página de administración de productos: edición inline, filtros y guardado en localStorage.
// No cambia la lógica: solo añade contexto para facilitar el mantenimiento.
// src/components/pages/Admin/AdminProducts.tsx
import { useMemo, useState } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Badge } from "react-bootstrap";
import { adminListProducts, adminBulkUpsertProducts } from "@/services/admin.service";
import { useEffect } from "react";
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
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialRows, setInitialRows] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});
    const [newProd, setNewProd] = useState({
        id: 0,
        nombre: "",
        slug: "",
        precio: 0,
        categoria: "",
        stock: 0,
        img: "/assets/img/placeholder.png",
        images: ["/assets/img/placeholder.png"],
        descripcion: "",
    });
    const [errors, setErrors] = useState({});
    // Carga inicial desde backend
    useEffect(() => {
        let alive = true;
        setLoading(true);
        adminListProducts()
            .then((items) => {
            if (!alive)
                return;
            const editable = items.map((p) => toEditable(p));
            setRows(editable);
            setInitialRows(editable);
        })
            .catch(() => void 0)
            .finally(() => alive && setLoading(false));
        return () => { alive = false; };
    }, []);
    // Filtros básicos en cabecera
    const [q, setQ] = useState("");
    const [cat, setCat] = useState("");
    // Lista de categorías únicas para el selector
    const cats = useMemo(() => {
        const acc = new Set();
        rows.forEach((p) => acc.add(p.categoria));
        return Array.from(acc).sort();
    }, [rows]);
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
        // Validación visual para campos numéricos
        if (key === "precio" || key === "stock") {
            const hasLetters = /[a-zA-Z]/.test(raw);
            const hasMinus = raw.includes("-");
            const n = raw === "" ? 0 : Number(raw.replace(/[^0-9.]/g, ""));
            const invalid = hasLetters || Number.isNaN(n) || hasMinus;
            const k = `${id}:${String(key)}`;
            setFieldErrors((prev) => {
                const next = { ...prev };
                if (invalid)
                    next[k] = hasMinus ? "Debe ser ≥ 0" : "Número inválido";
                else
                    delete next[k];
                return next;
            });
        }
        setRows((prev) => prev.map((r) => {
            if (r.id !== id)
                return r;
            // Campos numéricos guardan número, pero mostramos string
            if (key === "precio" || key === "stock") {
                const n = raw === "" ? 0 : Number(raw.replace(/[^0-9.]/g, ""));
                const safe = Number.isFinite(n) ? n : 0;
                const clamped = Math.max(0, safe);
                return { ...r, [key]: clamped };
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
    // Guarda cambios en backend (bulk upsert)
    const saveAll = async () => {
        try {
            const payload = rows.map((r) => ({
                id: r.id,
                slug: r.slug,
                nombre: r.nombre,
                precio: r.precio,
                stock: r.stock,
                categoria: r.categoria,
                img: r.img,
                images: r.images,
                descripcion: r.descripcion,
            }));
            const res = await adminBulkUpsertProducts(payload);
            alert(`Guardado: upserted=${res.upserted}, modified=${res.modified}`);
        }
        catch (e) {
            alert(`Error al guardar: ${e?.message || e}`);
        }
    };
    // Validación rápida del nuevo producto
    const validateNew = (p) => {
        const errs = {};
        if (!sv(p.nombre))
            errs.nombre = "Nombre requerido";
        if (!sn(p.precio))
            errs.precio = "Precio debe ser mayor a 0";
        if (!sv(p.categoria))
            errs.categoria = "Categoría requerida";
        if (!sn(p.stock) && sn(p.stock) < 0)
            errs.stock = "Stock no puede ser negativo";
        return errs;
    };
    const addProduct = () => {
        const baseId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
        const prepared = {
            ...newProd,
            id: baseId,
            nombre: sv(newProd.nombre),
            slug: sv(newProd.slug) || slugify(newProd.nombre || `prod-${baseId}`),
            precio: Math.max(0, sn(newProd.precio)),
            stock: Math.max(0, sn(newProd.stock)),
            categoria: sv(newProd.categoria),
            img: sv(newProd.img) || "/assets/img/placeholder.png",
            images: (newProd.images?.length ? newProd.images : [sv(newProd.img) || "/assets/img/placeholder.png"]).map(sv),
            descripcion: sv(newProd.descripcion),
        };
        const errs = validateNew(prepared);
        setErrors(errs);
        if (Object.keys(errs).length > 0)
            return;
        setRows(prev => [prepared, ...prev]);
        setInitialRows(prev => [prepared, ...prev]);
        setNewProd({
            id: 0,
            nombre: "",
            slug: "",
            precio: 0,
            categoria: "",
            stock: 0,
            img: "/assets/img/placeholder.png",
            images: ["/assets/img/placeholder.png"],
            descripcion: "",
        });
        setErrors({});
    };
    return (_jsxs(Container, { className: "py-4", children: [_jsxs(Row, { className: "mb-3 align-items-end g-2", children: [_jsxs(Col, { xs: 12, md: 6, children: [_jsx("h2", { className: "mb-0", children: "Administrar productos" }), _jsxs("small", { className: "text-body-secondary", children: [rows.length, " \u00EDtems\u00A0|\u00A0", _jsxs(Badge, { bg: "info", children: [filtered.length, " visibles"] }), loading && _jsx("span", { className: "ms-2", children: "Cargando\u2026" })] })] }), _jsxs(Col, { xs: 12, md: 3, children: [_jsx(Form.Label, { className: "small mb-1", children: "Buscar" }), _jsx(Form.Control, { type: "search", value: sv(q), onChange: (e) => setQ(e.target.value), placeholder: "Nombre o slug\u2026" })] }), _jsxs(Col, { xs: 12, md: 3, children: [_jsx(Form.Label, { className: "small mb-1", children: "Categor\u00EDa" }), _jsxs(Form.Select, { value: sv(cat), onChange: (e) => setCat(e.target.value), children: [_jsx("option", { value: "", children: "Todas" }), cats.map((c) => (_jsx("option", { value: c, children: c }, c)))] })] })] }), _jsxs(Card, { className: "shadow-sm", children: [_jsx(Card.Header, { children: _jsxs("div", { className: "d-flex align-items-end gap-3", children: [_jsxs("div", { className: "flex-grow-1", children: [_jsx(Form.Label, { className: "small mb-1", children: "Nombre" }), _jsx(Form.Control, { value: newProd.nombre, onChange: (e) => setNewProd({ ...newProd, nombre: e.target.value }), placeholder: "Nombre del producto" }), errors.nombre && _jsx("div", { className: "text-danger small mt-1", children: errors.nombre })] }), _jsxs("div", { style: { width: 140 }, children: [_jsx(Form.Label, { className: "small mb-1", children: "Precio" }), _jsx(Form.Control, { type: "number", value: String(newProd.precio), onChange: (e) => setNewProd({ ...newProd, precio: Number(e.target.value) }) }), errors.precio && _jsx("div", { className: "text-danger small mt-1", children: errors.precio })] }), _jsxs("div", { style: { width: 140 }, children: [_jsx(Form.Label, { className: "small mb-1", children: "Stock" }), _jsx(Form.Control, { type: "number", value: String(newProd.stock), onChange: (e) => setNewProd({ ...newProd, stock: Number(e.target.value) }) })] }), _jsxs("div", { style: { width: 200 }, children: [_jsx(Form.Label, { className: "small mb-1", children: "Categor\u00EDa" }), _jsx(Form.Control, { value: newProd.categoria, onChange: (e) => setNewProd({ ...newProd, categoria: e.target.value }), placeholder: "Ej: Teclado" }), errors.categoria && _jsx("div", { className: "text-danger small mt-1", children: errors.categoria })] }), _jsxs("div", { className: "d-grid", style: { width: 160 }, children: [_jsx(Form.Label, { className: "small mb-1", children: "\u00A0" }), _jsx(Button, { variant: "primary", onClick: addProduct, children: "Crear producto" })] })] }) }), _jsx(Card.Body, { className: "p-0", children: _jsxs(Table, { responsive: true, hover: true, className: "mb-0 align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { style: { width: 60 }, children: "ID" }), _jsx("th", { style: { width: 90 }, children: "Imagen" }), _jsx("th", { children: "Nombre" }), _jsx("th", { children: "Slug" }), _jsx("th", { style: { width: 130 }, children: "Precio" }), _jsx("th", { style: { width: 120 }, children: "Stock" }), _jsx("th", { style: { width: 180 }, children: "Categor\u00EDa" })] }) }), _jsxs("tbody", { children: [filtered.map((r) => (_jsxs("tr", { children: [_jsx("td", { children: r.id }), _jsx("td", { children: _jsx("img", { src: sv(r.img), alt: r.nombre, width: 64, height: 48, style: { objectFit: "cover", borderRadius: 8 } }) }), _jsx("td", { children: _jsx(Form.Control, { type: "text", value: sv(r.nombre), onChange: onEdit(r.id, "nombre"), placeholder: "Nombre\u2026" }) }), _jsx("td", { children: _jsx(Form.Control, { type: "text", value: sv(r.slug), onChange: onEdit(r.id, "slug"), placeholder: "slug-producto" }) }), _jsxs("td", { children: [_jsx(Form.Control, { type: "number", min: 0, value: String(sn(r.precio)), onChange: onEdit(r.id, "precio"), isInvalid: Boolean(fieldErrors[`${r.id}:precio`]) }), fieldErrors[`${r.id}:precio`] && (_jsx("div", { className: "text-danger small mt-1", children: fieldErrors[`${r.id}:precio`] }))] }), _jsxs("td", { children: [_jsx(Form.Control, { type: "number", min: 0, value: String(sn(r.stock)), onChange: onEdit(r.id, "stock"), isInvalid: Boolean(fieldErrors[`${r.id}:stock`]) }), fieldErrors[`${r.id}:stock`] && (_jsx("div", { className: "text-danger small mt-1", children: fieldErrors[`${r.id}:stock`] }))] }), _jsx("td", { children: _jsx(Form.Control, { type: "text", value: sv(r.categoria), onChange: onEdit(r.id, "categoria"), placeholder: "Categor\u00EDa\u2026" }) })] }, r.id))), filtered.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center text-body-secondary py-4", children: "Sin resultados para los filtros aplicados." }) }))] })] }) }), _jsxs(Card.Footer, { className: "d-flex justify-content-end gap-2", children: [_jsx(Button, { variant: "outline-secondary", onClick: () => setRows(initialRows), children: "Descartar cambios" }), _jsx(Button, { variant: "warning", onClick: saveAll, children: "Guardar cambios" })] })] })] }));
}

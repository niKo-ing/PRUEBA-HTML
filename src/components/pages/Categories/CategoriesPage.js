import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Nombre del componente: CategoriesPage
 * Propósito: Listar categorías y mostrar productos filtrados por la categoría seleccionada.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; usa query param `cat`.
 *
 * Métodos/funciones:
 * - toArr(c): normaliza categoría a arreglo.
 *
 * Hooks utilizados:
 * - useSearchParams: leer/actualizar categoría.
 * - useMemo: categorías únicas y productos filtrados.
 *
 * Ejemplo de uso:
 * ```tsx
 * <CategoriesPage />
 * ```
 */
// Página de categorías: lista todas las categorías y permite filtrar productos.
//
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { fetchProducts } from "@/services/products.service";
const toArr = (c) => (Array.isArray(c) ? c : [c]);
export default function CategoriesPage() {
    const [params, setParams] = useSearchParams();
    const cat = params.get("cat") ?? "";
    const [items, setItems] = useState([]);
    useEffect(() => {
        let alive = true;
        fetchProducts(true)
            .then((arr) => { if (alive)
            setItems(arr); })
            .catch(() => void 0);
        return () => { alive = false; };
    }, []);
    // Todas las categorías únicas presentes en el catálogo
    const ALL = useMemo(() => {
        return Array.from(new Set(items.flatMap(p => toArr(p.categoria)))).sort();
    }, [items]);
    // Filtra por categoría seleccionada (query param "cat")
    const filtered = useMemo(() => {
        if (!cat)
            return items;
        return items.filter((p) => toArr(p.categoria).some((x) => x === cat));
    }, [cat, items]);
    return (_jsxs(Container, { className: "py-4", children: [_jsxs(Row, { className: "align-items-center mb-3", children: [_jsxs(Col, { children: [_jsx("h2", { className: "mb-1", children: "Categor\u00EDas" }), _jsxs("div", { className: "text-body-secondary", children: [ALL.length, " categor\u00EDas \u00B7 ", filtered.length, " productos", cat ? (_jsxs(_Fragment, { children: [" \u00B7 categor\u00EDa: ", _jsx(Badge, { bg: "secondary", children: cat })] })) : null] })] }), _jsx(Col, { xs: "auto", children: _jsxs("select", { className: "form-select", value: cat, onChange: (e) => {
                                const v = e.target.value || null;
                                const next = new URLSearchParams(params);
                                if (v === null)
                                    next.delete("cat");
                                else
                                    next.set("cat", e.target.value);
                                setParams(next, { replace: true });
                            }, children: [_jsx("option", { value: "", children: "Todas" }), ALL.map((c) => (_jsx("option", { value: c, children: c }, c)))] }) })] }), _jsx(Row, { className: "g-3", children: filtered.map((p) => (_jsx(Col, { xs: 12, sm: 6, md: 4, lg: 3, children: _jsxs(Card, { className: "h-100", children: [_jsx(Link, { to: `/producto/${p.slug}`, className: "text-decoration-none", children: _jsx(Card.Img, { variant: "top", src: (p.images?.[0] ?? p.img), alt: p.nombre, className: "card-img-fit" }) }), _jsxs(Card.Body, { className: "d-flex flex-column", children: [_jsx(Card.Title, { className: "h6 mb-1", children: p.nombre }), _jsx("div", { className: "mb-2 text-muted small", children: Array.isArray(p.categoria) ? p.categoria.join(", ") : p.categoria }), _jsx("div", { className: "fw-bold mb-3", children: p.precio.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }) }), _jsx("div", { className: "mt-auto d-flex gap-2", children: _jsx(Link, { to: `/producto/${p.slug}`, className: "btn btn-outline-secondary btn-sm", children: "Ver" }) })] })] }) }, p.id))) })] }));
}

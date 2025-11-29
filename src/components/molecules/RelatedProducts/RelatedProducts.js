import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Muestra productos relacionados por categoría, con acciones de ver y añadir.
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/services/products.service";
import { useCart } from "@domain/cart/cart.context";
function matchCategoria(pCat, target) {
    const toArr = (c) => (Array.isArray(c) ? c : [c]);
    const a = toArr(pCat);
    const b = toArr(target);
    return a.some(x => b.includes(x));
}
export default function RelatedProducts({ categoria, excludeId, max = 4 }) {
    const { add } = useCart();
    const [items, setItems] = useState([]);
    useEffect(() => {
        let alive = true;
        fetchProducts(true)
            .then((arr) => {
            if (!alive)
                return;
            const rel = arr.filter(p => p.id !== excludeId && matchCategoria(p.categoria, categoria)).slice(0, max);
            setItems(rel);
        })
            .catch(() => void 0);
        return () => { alive = false; };
    }, [categoria, excludeId, max]);
    if (!items.length)
        return null;
    return (_jsxs("section", { className: "mt-5", children: [_jsx("h3", { className: "mb-3", children: "Productos relacionados" }), _jsx("div", { className: "row related-grid g-3", children: items.map(p => (_jsx("div", { className: "col-12 col-sm-6 col-lg-3", children: _jsxs(Card, { className: "h-100", children: [_jsx(Link, { to: `/producto/${p.slug}`, className: "text-decoration-none", children: _jsx(Card.Img, { variant: "top", src: (p.images?.[0] ?? p.img), alt: p.nombre, className: "card-img-fit" }) }), _jsxs(Card.Body, { className: "d-flex flex-column", children: [_jsx(Card.Title, { className: "h6", children: p.nombre }), _jsxs("div", { className: "mt-auto d-flex gap-2", children: [_jsx(Link, { to: `/producto/${p.slug}`, className: "btn btn-outline-secondary btn-sm", children: "Ver" }), _jsx("button", { className: "btn btn-warning btn-sm", onClick: () => add(p.id, 1), children: "A\u00F1adir" })] })] })] }) }, p.id))) })] }));
}

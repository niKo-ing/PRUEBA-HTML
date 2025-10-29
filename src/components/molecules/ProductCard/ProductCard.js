import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useCart } from "@domain/cart/cart.context";
function Stars({ rating = 0 }) {
    const r = rating ?? 0;
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    return (_jsx("div", { className: "text-warning small", children: Array.from({ length: 5 }).map((_, i) => {
            if (i < full)
                return _jsx("i", { className: "bi bi-star-fill me-1" }, i);
            if (i === full && half)
                return _jsx("i", { className: "bi bi-star-half me-1" }, i);
            return _jsx("i", { className: "bi bi-star me-1" }, i);
        }) }));
}
export default function ProductCard({ p }) {
    const { add } = useCart();
    return (_jsxs("article", { className: "card h-100 card-product product-card", children: [_jsxs("div", { className: "position-relative", children: [_jsx("img", { src: p.img, alt: p.nombre, className: "card-img-top", style: { background: "#fff" } }), _jsxs("span", { className: "badge bg-success position-absolute top-0 end-0 m-2 d-flex align-items-center gap-1", children: [_jsx("i", { className: "bi bi-check-circle" }), " Stock ", p.stock] })] }), _jsxs("div", { className: "card-body d-flex flex-column", children: [_jsx("h6", { className: "card-title mb-1", children: p.nombre }), _jsx(Stars, { rating: p.rating ?? 0 }), _jsxs("div", { className: "fw-bold my-2", children: ["$", p.precio.toLocaleString("es-CL")] }), _jsxs("div", { className: "d-flex gap-2 mt-auto", children: [_jsxs("button", { className: "btn btn-naranja", onClick: () => add(p.id), children: [_jsx("i", { className: "bi bi-cart me-1" }), "A\u00F1adir"] }), _jsx(Link, { to: `/producto/${p.slug ?? p.id}`, className: "btn btn-outline-secondary", children: "Detalle" })] })] })] }));
}

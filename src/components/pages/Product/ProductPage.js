import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Página de detalle de producto: muestra galería, información y acciones.
import { useParams, Navigate } from "react-router-dom";
import { productos } from "@domain/data";
import ProductGallery from "@organisms/ProductGallery/ProductGallery";
import RelatedProducts from "@molecules/RelatedProducts/RelatedProducts";
import { Badge, Button } from "react-bootstrap";
import { useCart } from "@domain/cart/cart.context";
import { useCartUI } from "@app/cart-ui.context";
function formatCLP(v) {
    return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}
export default function ProductPage() {
    const { slug } = useParams();
    const prod = productos.find(p => p.slug === slug);
    const { add } = useCart();
    const { open } = useCartUI();
    if (!prod)
        return _jsx(Navigate, { to: "/productos", replace: true });
    return (_jsxs("div", { id: "productDetail", className: "container py-4", children: [_jsxs("div", { className: "row g-4", children: [_jsxs("div", { className: "col-12 col-lg-6", children: [" ", _jsx(ProductGallery, { images: prod.images ?? [], cover: prod.img, alt: prod.nombre })] }, prod.id), _jsxs("div", { className: "col-12 col-lg-6", children: [_jsx("h1", { className: "pd-title h2 mb-2", children: prod.nombre }), _jsxs("div", { className: "d-flex align-items-center gap-2 mb-3", children: [_jsxs(Badge, { bg: "success", children: ["Stock ", prod.stock] }), _jsx("small", { className: "text-muted", children: prod.categoria })] }), _jsx("div", { className: "display-6 fw-bold mb-3", children: formatCLP(prod.precio) }), _jsx("p", { className: "text-body-secondary", children: prod.descripcion }), _jsxs("div", { className: "d-flex gap-2 mt-3", children: [_jsxs(Button, { variant: "warning", size: "lg", onClick: () => { add(prod.id, 1); open(); }, children: [_jsx("i", { className: "bi bi-cart-plus me-2" }), "A\u00F1adir al carrito"] }), _jsxs(Button, { variant: "outline-secondary", size: "lg", children: [_jsx("i", { className: "bi bi-heart me-2" }), "Favorito"] })] }), _jsxs("ul", { className: "mt-4 list-unstyled small text-body-secondary", children: [_jsx("li", { children: "\u2022 Env\u00EDo 24-48h" }), _jsx("li", { children: "\u2022 Garant\u00EDa 1 a\u00F1o" })] })] })] }), _jsx(RelatedProducts, { categoria: prod.categoria, excludeId: prod.id })] }));
}

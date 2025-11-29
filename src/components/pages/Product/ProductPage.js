import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Nombre del componente: ProductPage
 * Propósito: Página de detalle del producto con galería, info y acciones.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; lee `slug` desde la URL.
 *
 * Métodos/funciones:
 * - formatCLP(v: number): string — Formatea un número en CLP.
 *   Parámetros: v (number). Retorno: string con moneda.
 *   Lógica: utiliza `toLocaleString` con configuración es-CL.
 *
 * Hooks utilizados:
 * - useParams: obtiene `slug` del router.
 * - useCart: acciones para añadir al carrito.
 * - useCartUI: abrir el panel de carrito.
 *
 * Ejemplo de uso:
 * ```tsx
 * <ProductPage />
 * ```
 */
/**
 * Página ProductPage - Detalle del producto
 * Props: no recibe; Estado: none; Dependencias: react-router-dom, ProductGallery, RelatedProducts, useCart/useCartUI
 */
import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductGallery from "@organisms/ProductGallery/ProductGallery";
import RelatedProducts from "@molecules/RelatedProducts/RelatedProducts";
import { Badge, Button } from "react-bootstrap";
import { useCart } from "@domain/cart/cart.context";
import { useCartUI } from "@app/cart-ui.context";
import { fetchProductBySlug } from "@/services/products.service";
/**
 * Formatea número a CLP sin decimales
 * @param {number} v - Valor numérico
 * @returns {string} Moneda CLP
 */
function formatCLP(v) {
    return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}
/**
 * Renderiza la página de detalle con galería e info
 * @returns {JSX.Element} Contenido del producto o redirección
 */
export default function ProductPage() {
    const { slug } = useParams();
    const [prod, setProd] = useState(null);
    const [loading, setLoading] = useState(true);
    const { add } = useCart();
    const { open } = useCartUI();
    useEffect(() => {
        const s = slug ?? "";
        let alive = true;
        setLoading(true);
        fetchProductBySlug(s)
            .then((p) => {
            if (!alive)
                return;
            setProd(p ?? null);
        })
            .catch(() => {
            if (!alive)
                return;
            setProd(null);
        })
            .finally(() => {
            if (!alive)
                return;
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, [slug]);
    if (loading) {
        return _jsx("div", { className: "container py-5 text-center", children: "Cargando\u2026" });
    }
    if (!prod)
        return _jsx(Navigate, { to: "/productos", replace: true });
    return (_jsxs("div", { id: "productDetail", className: "container py-4", children: [_jsxs("div", { className: "row g-4", children: [_jsx("div", { className: "col-12 col-lg-6", children: _jsx(ProductGallery, { images: prod.images ?? [], cover: prod.img, alt: prod.nombre }) }), _jsxs("div", { className: "col-12 col-lg-6", children: [_jsx("h1", { className: "pd-title h2 mb-2", children: prod.nombre }), _jsxs("div", { className: "d-flex align-items-center gap-2 mb-3", children: [_jsxs(Badge, { bg: "success", children: ["Stock ", prod.stock] }), _jsx("small", { className: "text-muted", children: prod.categoria })] }), _jsx("div", { className: "display-6 fw-bold mb-3", children: formatCLP(prod.precio) }), _jsx("p", { className: "text-body-secondary", children: prod.descripcion }), _jsxs("div", { className: "d-flex gap-2 mt-3", children: [_jsxs(Button, { variant: "warning", size: "lg", onClick: () => { add(prod.id, 1); open(); }, children: [_jsx("i", { className: "bi bi-cart-plus me-2" }), "A\u00F1adir al carrito"] }), _jsxs(Button, { variant: "outline-secondary", size: "lg", children: [_jsx("i", { className: "bi bi-heart me-2" }), "Favorito"] })] }), _jsxs("ul", { className: "mt-4 list-unstyled small text-body-secondary", children: [_jsx("li", { children: "\u2022 Env\u00EDo 24-48h" }), _jsx("li", { children: "\u2022 Garant\u00EDa 1 a\u00F1o" })] })] })] }), _jsx(RelatedProducts, { categoria: prod.categoria, excludeId: prod.id, max: 8 })] }));
}

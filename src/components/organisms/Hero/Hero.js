import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Renderiza sección hero con overlay y CTA a destacados
 * @param {Props} props - Contenido, medios y modo full
 * @returns {JSX.Element} Sección hero
 */
export default function Hero({ image = "/assets/img/hero.jpg", title = "Precisión y velocidad", subtitle = "Periféricos de alto rendimiento", full = false, }) {
    return (_jsxs("section", { className: `hero ${full ? "hero--full" : "hero--flat"}`, children: [_jsx("img", { className: "hero-media", src: image, alt: "Hero" }), _jsx("div", { className: "hero-overlay" }), _jsx("div", { className: "hero-content text-center", children: _jsxs("div", { className: "container", children: [_jsx("h1", { className: "display-4 fw-bold text-white", children: title }), _jsx("p", { className: "lead text-white-50", children: subtitle }), _jsxs("a", { href: "#destacados", className: "btn btn-warning btn-lg mt-2", children: [_jsx("i", { className: "bi bi-cart me-2" }), "Ver productos"] })] }) })] }));
}

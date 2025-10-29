import { jsx as _jsx } from "react/jsx-runtime";
import ProductCard from "../../molecules/ProductCard/ProductCard";
export default function CatalogGrid({ items }) {
    return (_jsx("section", { id: "destacados", className: "row g-4", children: items.map((p) => (_jsx("div", { className: "col-12 col-sm-6 col-lg-3", children: _jsx(ProductCard, { p: p }) }, p.id))) }));
}

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Hero from "../../organisms/Hero/Hero";
import CatalogGrid from "../../organisms/CatalogGrid/CatalogGrid";
import { productos } from "@domain/data";
import heroVideo from "../../../assets/video/mouse.mp4";
export default function HomePage() {
    const destacados = productos.slice(0, 4);
    return (_jsxs(_Fragment, { children: [_jsx(Hero, { video: heroVideo }), _jsxs("section", { className: "container-xxl py-4", children: [_jsx("h2", { id: "destacados", className: "mb-3", children: "Destacados" }), _jsx(CatalogGrid, { items: destacados })] })] }));
}

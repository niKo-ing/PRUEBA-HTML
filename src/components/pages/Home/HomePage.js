import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Hero from "../../organisms/Hero/Hero";
import CatalogGrid from "../../organisms/CatalogGrid/CatalogGrid";
import { productos } from "@domain/data";
import { useEffect, useMemo, useState } from "react";
export default function HomePage() {
    const PAGE_SIZE = 4;
    const [startIndex, setStartIndex] = useState(0);
    useEffect(() => {
        const id = setInterval(() => {
            setStartIndex((i) => (i + PAGE_SIZE) % productos.length);
        }, 6000); // rota cada 6 segundos
        return () => clearInterval(id);
    }, []);
    const destacados = useMemo(() => {
        const total = productos.length;
        if (total === 0)
            return [];
        const items = [];
        for (let i = 0; i < Math.min(PAGE_SIZE, total); i++) {
            const p = productos[(startIndex + i) % total];
            if (p)
                items.push(p);
        }
        return items;
    }, [startIndex]);
    return (_jsxs(_Fragment, { children: [_jsx(Hero, { video: "/assets/video/mouse.mp4", poster: "/assets/video/mouse-poster.JPG" }), _jsxs("section", { className: "container-xxl py-4", children: [_jsx("h2", { id: "destacados", className: "mb-3", children: "Destacados" }), _jsx(CatalogGrid, { items: destacados })] })] }));
}

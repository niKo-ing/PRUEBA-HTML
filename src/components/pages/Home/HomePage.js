import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Nombre del componente: HomePage
 * Propósito: Portada con hero y grilla de productos destacados rotatorios.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props.
 *
 * Métodos/funciones:
 * - No aplica; renderiza secciones y calcula destacados.
 *
 * Hooks utilizados:
 * - useState: índice inicial de rotación.
 * - useEffect: temporizador para rotar destacados.
 * - useMemo: selecciona los elementos visibles.
 *
 * Ejemplo de uso:
 * ```tsx
 * <HomePage />
 * ```
 */
/**
 * Página HomePage - Portada con hero y destacados rotatorios
 * Props: no recibe; Estado: startIndex (rotación); Dependencias: Hero, CatalogGrid, productos
 */
import Hero from "../../organisms/Hero/Hero";
import CatalogGrid from "../../organisms/CatalogGrid/CatalogGrid";
import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../../../services/products.service";
/**
 * Renderiza portada con grilla de productos destacados
 * @returns {JSX.Element} Secciones hero y destacados
 */
export default function HomePage() {
    const PAGE_SIZE = 4;
    const [startIndex, setStartIndex] = useState(0);
    const [itemsApi, setItemsApi] = useState(null);
    useEffect(() => {
        const id = setInterval(() => {
            const total = (itemsApi?.length ?? 0);
            setStartIndex((i) => total > 0 ? (i + PAGE_SIZE) % total : 0);
        }, 6000); // rota cada 6 segundos
        return () => clearInterval(id);
    }, [itemsApi]);
    useEffect(() => {
        let alive = true;
        fetchProducts()
            .then((data) => {
            if (!alive)
                return;
            if (Array.isArray(data) && data.length > 0)
                setItemsApi(data);
        })
            .catch(() => void 0);
        return () => {
            alive = false;
        };
    }, []);
    const fuente = (itemsApi ?? []);
    const destacados = useMemo(() => {
        const total = fuente.length;
        if (total === 0)
            return [];
        const items = [];
        for (let i = 0; i < Math.min(PAGE_SIZE, total); i++) {
            const p = fuente[(startIndex + i) % total];
            if (p)
                items.push(p);
        }
        return items;
    }, [startIndex, fuente]);
    return (_jsxs(_Fragment, { children: [_jsx(Hero, { image: "/assets/img/mouse-poster.jpg" }), _jsxs("section", { className: "container-xxl py-4", children: [_jsx("h2", { id: "destacados", className: "mb-3", children: "Destacados" }), _jsx(CatalogGrid, { items: destacados })] })] }));
}

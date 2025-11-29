import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Componente ProductGallery - Galería con miniaturas y zoom
 * Props: { images?: string[], cover?: string, alt?: string }; Estado: current, zooming
 * Dependencias: ninguna externa (usa DOM para efecto de zoom)
 */
import { useEffect, useRef, useState } from "react";
/**
 * Renderiza galería con imagen principal y miniaturas
 * @param {Props} props - Imágenes y texto alternativo
 * @returns {JSX.Element} Contenedor de galería interactiva
 */
export default function ProductGallery({ images = [], cover, alt }) {
    // Asegura array válido y sin duplicados (si solo hay cover, igual habrá 1 thumb)
    const allImgs = Array.from(new Set([cover, ...(images ?? [])].filter(Boolean)));
    const [current, setCurrent] = useState(allImgs[0]);
    const [zooming, setZooming] = useState(false);
    const zoomRef = useRef(null);
    // Limpieza de zoom (para evitar “interposición” al navegar)
    /**
     * Restablece el estado y estilos del zoom
     */
    const resetZoom = () => {
        const el = zoomRef.current;
        if (!el)
            return;
        el.style.backgroundImage = "none";
        el.style.backgroundPosition = "center";
        el.style.backgroundSize = "contain";
        setZooming(false);
    };
    useEffect(() => {
        // si cambia el set de imágenes, resetea current y zoom
        setCurrent(allImgs[0]);
        resetZoom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(allImgs)]);
    useEffect(() => {
        // limpieza al desmontar y al ocultar la pestaña
        const onVis = () => resetZoom();
        document.addEventListener("visibilitychange", onVis);
        return () => {
            document.removeEventListener("visibilitychange", onVis);
            resetZoom();
        };
    }, []);
    /**
     * Activa el zoom al entrar al área principal
     */
    const handleEnter = () => {
        const el = zoomRef.current;
        if (!el)
            return;
        el.style.backgroundImage = `url(${current})`;
        el.style.backgroundSize = "200%"; // ajusta 180–300% a gusto
        setZooming(true);
    };
    /**
     * Posiciona el zoom según el puntero del mouse
     */
    const handleMove = (e) => {
        const el = zoomRef.current;
        if (!el || !zooming)
            return;
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        el.style.backgroundPosition = `${x}% ${y}%`;
    };
    return (_jsxs("div", { className: "pd-gallery", children: [_jsx("div", { ref: zoomRef, className: `pd-main ${zooming ? "pd-main--zoom" : ""}`, onMouseEnter: handleEnter, onMouseLeave: resetZoom, onMouseMove: handleMove, children: _jsx("img", { src: current, alt: alt, draggable: "false", className: zooming ? "is-hidden" : "" }) }), _jsx("div", { className: "pd-thumbs", children: allImgs.map((src) => (_jsx("button", { type: "button", className: `pd-thumb ${src === current ? "active" : ""}`, onClick: () => {
                        setCurrent(src);
                        // si estás con zoom, actualiza el fondo también
                        if (zoomRef.current && zooming) {
                            zoomRef.current.style.backgroundImage = `url(${src})`;
                        }
                    }, "aria-label": "Cambiar imagen", children: _jsx("img", { src: src, alt: alt }) }, src))) })] }));
}

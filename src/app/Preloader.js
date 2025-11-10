import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Componente de “pantalla de carga” simple.
// Muestra un anillo girando y el texto “Cargando…” mientras la app prepara datos.
// Úsalo como fallback de React.Suspense o durante la inicialización.
export default function Preloader() {
    return (_jsx("div", { id: "preloader", children: _jsxs("div", { className: "preloader-box", children: [_jsx("div", { className: "preloader-ring" }), _jsx("div", { className: "preloader-text", children: "Cargando\u2026" })] }) }));
}

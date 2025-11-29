import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Nombre del componente: ErrorPage
 * Propósito: Mostrar un estado de error de pago y opciones para reintentar o contactar soporte.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props.
 *
 * Métodos/funciones:
 * - No define métodos; renderiza contenido informativo y enlaces de navegación.
 *
 * Hooks utilizados:
 * - No utiliza hooks.
 *
 * Ejemplo de uso:
 * ```tsx
 * <Route path="/error-compra" element={<ErrorPage />} />
 * ```
 */
import React from 'react';
import { Link } from 'react-router-dom';
const ErrorPage = () => {
    return (_jsx("div", { className: "container py-5", children: _jsx("div", { className: "row justify-content-center", children: _jsx("div", { className: "col-lg-8", children: _jsx("div", { className: "card shadow-lg border-0", children: _jsxs("div", { className: "card-body p-5 text-center", children: [_jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-4 mb-3", children: _jsxs("svg", { width: "64", height: "64", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-danger", children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("line", { x1: "15", y1: "9", x2: "9", y2: "15" }), _jsx("line", { x1: "9", y1: "9", x2: "15", y2: "15" })] }) }), _jsx("h1", { className: "text-danger mb-2", children: "\u00A1Ups! Algo sali\u00F3 mal" }), _jsx("p", { className: "text-muted fs-5", children: "Lo sentimos, ha ocurrido un error al procesar tu pago. No se ha realizado ning\u00FAn cargo en tu tarjeta." })] }), _jsxs("div", { className: "alert alert-warning mb-4", children: [_jsxs("div", { className: "d-flex align-items-center", children: [_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "me-2", children: [_jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), _jsx("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), _jsx("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })] }), _jsx("div", { children: _jsx("strong", { children: "\u00BFQu\u00E9 puede haber pasado?" }) })] }), _jsxs("ul", { className: "mt-2 mb-0", children: [_jsx("li", { children: "Tarjeta rechazada por fondos insuficientes" }), _jsx("li", { children: "Tarjeta bloqueada o vencida" }), _jsx("li", { children: "Error en la conexi\u00F3n con el banco" }), _jsx("li", { children: "Datos de la tarjeta incorrectos" })] })] }), _jsxs("div", { className: "row mb-4", children: [_jsx("div", { className: "col-md-6 mb-3", children: _jsxs("div", { className: "bg-light rounded p-3 h-100", children: [_jsx("h6", { className: "mb-2", children: "Posibles soluciones" }), _jsxs("ul", { className: "small text-start", children: [_jsx("li", { children: "Verifica los datos de tu tarjeta" }), _jsx("li", { children: "Intenta con otro m\u00E9todo de pago" }), _jsx("li", { children: "Contacta a tu banco" }), _jsx("li", { children: "Intenta m\u00E1s tarde" })] })] }) }), _jsx("div", { className: "col-md-6 mb-3", children: _jsxs("div", { className: "bg-light rounded p-3 h-100", children: [_jsx("h6", { className: "mb-2", children: "\u00BFNecesitas ayuda?" }), _jsx("p", { className: "small mb-2", children: "Nuestro equipo de soporte est\u00E1 aqu\u00ED para ayudarte." }), _jsxs("div", { className: "small", children: [_jsx("strong", { children: "Tel\u00E9fono:" }), " +56 9 1234 5678", _jsx("br", {}), _jsx("strong", { children: "Email:" }), " soporte@todobaratisimo.cl", _jsx("br", {}), _jsx("strong", { children: "Horario:" }), " Lunes a Viernes 9:00-18:00"] })] }) })] }), _jsxs("div", { className: "d-flex flex-column flex-md-row gap-3 justify-content-center", children: [_jsx(Link, { to: "/checkout", className: "btn btn-primary btn-lg", children: "Intentar de nuevo" }), _jsx(Link, { to: "/cart", className: "btn btn-outline-secondary btn-lg", children: "Volver al carrito" }), _jsx(Link, { to: "/contact", className: "btn btn-outline-primary btn-lg", children: "Contactar soporte" })] }), _jsx("div", { className: "mt-4 text-muted", children: _jsx("small", { children: "Si el problema persiste, por favor cont\u00E1ctanos. Estaremos encantados de ayudarte." }) })] }) }) }) }) }));
};
export default ErrorPage;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Nombre del componente: AdminSettings
 * Propósito: Configurar ajustes del sitio (moneda, impuestos, envío, soporte, mantenimiento) con persistencia local.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props.
 *
 * Métodos/funciones:
 * - bind(key): vincula inputs a estado `cfg` dependiendo del tipo (text, number, checkbox).
 * - save(): guarda configuración en `localStorage`.
 * - discard(): recupera última versión guardada o valores por defecto.
 *
 * Hooks utilizados:
 * - useState: estado `cfg` basado en `defaults`.
 * - useEffect: cargar configuración inicial desde `localStorage`.
 *
 * Ejemplo de uso:
 * ```tsx
 * <Route path="/admin/settings" element={<AdminSettings />} />
 * ```
 */
// Ajustes: configuración básica del sitio con persistencia en localStorage.
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
const defaults = {
    siteName: "Todobaratisimo",
    currency: "CLP",
    taxRate: 19,
    shippingBase: 2990,
    supportEmail: "soporte@todobaratisimo.local",
    maintenance: false,
};
export default function AdminSettings() {
    const [cfg, setCfg] = useState(defaults);
    // Carga inicial desde localStorage si existe
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("admin_settings") || "null");
            if (saved)
                setCfg(saved);
        }
        catch { }
    }, []);
    // Helper genérico para vincular inputs al estado según tipo
    const bind = (key) => (e) => {
        const target = e.target;
        const val = target.type === "checkbox"
            ? target.checked
            : target.type === "number"
                ? Number(target.value)
                : target.value;
        setCfg((prev) => ({ ...prev, [key]: val }));
    };
    // Persistencia mock en localStorage
    const save = () => {
        localStorage.setItem("admin_settings", JSON.stringify(cfg));
        alert("Ajustes guardados (localStorage)");
    };
    // Recupera última versión guardada o defaults
    const discard = () => {
        try {
            const saved = JSON.parse(localStorage.getItem("admin_settings") || "null");
            setCfg(saved || defaults);
        }
        catch {
            setCfg(defaults);
        }
    };
    return (_jsxs(Container, { className: "py-4", children: [_jsx(Row, { children: _jsx(Col, { children: _jsx("h2", { className: "mb-3", children: "Ajustes" }) }) }), _jsxs(Card, { className: "shadow-sm", children: [_jsx(Card.Body, { children: _jsxs(Row, { className: "g-3", children: [_jsxs(Col, { md: 6, children: [_jsx(Form.Label, { children: "Nombre del sitio" }), _jsx(Form.Control, { type: "text", value: cfg.siteName, onChange: bind("siteName") })] }), _jsxs(Col, { md: 3, children: [_jsx(Form.Label, { children: "Moneda" }), _jsxs(Form.Select, { value: cfg.currency, onChange: bind("currency"), children: [_jsx("option", { value: "CLP", children: "CLP" }), _jsx("option", { value: "USD", children: "USD" }), _jsx("option", { value: "EUR", children: "EUR" })] })] }), _jsxs(Col, { md: 3, children: [_jsx(Form.Label, { children: "Impuesto (%)" }), _jsx(Form.Control, { type: "number", inputMode: "numeric", value: cfg.taxRate, onChange: bind("taxRate") })] }), _jsxs(Col, { md: 4, children: [_jsx(Form.Label, { children: "Costo base env\u00EDo" }), _jsx(Form.Control, { type: "number", inputMode: "numeric", value: cfg.shippingBase, onChange: bind("shippingBase") })] }), _jsxs(Col, { md: 5, children: [_jsx(Form.Label, { children: "Email de soporte" }), _jsx(Form.Control, { type: "email", value: cfg.supportEmail, onChange: bind("supportEmail") })] }), _jsx(Col, { md: 3, className: "d-flex align-items-end", children: _jsx(Form.Check, { type: "switch", id: "maintenance", label: "Modo mantenimiento", checked: cfg.maintenance, onChange: bind("maintenance") }) })] }) }), _jsxs(Card.Footer, { className: "d-flex justify-content-end gap-2", children: [_jsx(Button, { variant: "outline-secondary", onClick: discard, children: "Descartar" }), _jsx(Button, { variant: "warning", onClick: save, children: "Guardar" })] })] })] }));
}

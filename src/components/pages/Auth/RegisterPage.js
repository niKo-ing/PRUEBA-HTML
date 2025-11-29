import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Nombre del componente: RegisterPage
 * Propósito: Registro de usuarios con validaciones y autocompletado de dirección.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; persiste usuarios en localStorage.
 *
 * Métodos/funciones:
 * - handleInputChange(e): normaliza entrada (teléfono numérico, resto texto).
 * - handleSelectChange(e): actualiza `role`.
 * - handleSubmit(e): valida campos, persiste usuario y redirige a login.
 *
 * Hooks utilizados:
 * - useState: estado del formulario, dirección, validaciones y feedback.
 * - useNavigate: redirección tras registro.
 *
 * Ejemplo de uso:
 * ```tsx
 * <RegisterPage />
 * ```
 */
// src/components/pages/Auth/RegisterPage.tsx
import { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MapPreview from "@molecules/AddressAutocomplete/MapPreview";
import AddressAutocomplete from "@molecules/AddressAutocomplete/AddressAutocomplete";
export default function RegisterPage() {
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        password: "",
        confirmPassword: "",
    });
    const [direccionText, setDireccionText] = useState("");
    const [direccionParsed, setDireccionParsed] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    // Validaciones dinámicas
    const passwordStrong = form.password.length >= 8;
    const passwordsFilled = form.password.length > 0 && form.confirmPassword.length > 0;
    const passwordsMatch = form.password === form.confirmPassword;
    // Dirección válida si el usuario eligió una sugerencia (placeId y lat/lng)
    const addressSelected = !!direccionParsed?.placeId && typeof direccionParsed?.lat === "number" && typeof direccionParsed?.lng === "number";
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "telefono") {
            const numeric = value.replace(/[^0-9+]/g, "");
            setForm({ ...form, [name]: numeric });
            return;
        }
        setForm({ ...form, [name]: value });
    };
    const handleSelectChange = (_e) => { };
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        // Validaciones principales
        const required = [
            form.nombre,
            form.apellido,
            form.email,
            form.telefono,
            form.password,
            form.confirmPassword,
        ];
        if (required.some((v) => v.trim() === "")) {
            setError("Todos los campos son obligatorios");
            return;
        }
        if (!passwordStrong) {
            setError("La contraseña debe tener al menos 8 caracteres");
            return;
        }
        if (!passwordsMatch) {
            setError("Las contraseñas no coinciden");
            return;
        }
        if (!addressSelected) {
            setError("Selecciona una dirección desde las sugerencias de Google Maps");
            return;
        }
        const payload = {
            nombre: form.nombre,
            apellido: form.apellido,
            email: form.email,
            telefono: form.telefono,
            password: form.password,
            direccion: {
                fullText: direccionParsed?.fullText,
                street: direccionParsed?.street,
                number: direccionParsed?.number,
                comuna: direccionParsed?.comuna,
                city: direccionParsed?.city,
                region: direccionParsed?.region,
                country: direccionParsed?.country,
                postalCode: direccionParsed?.postalCode,
                lat: direccionParsed?.lat,
                lng: direccionParsed?.lng,
                placeId: direccionParsed?.placeId,
            },
        };
        return fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(async (resp) => {
            if (!resp.ok) {
                const data = await resp.json().catch(() => ({}));
                throw new Error(data?.detail || 'Error al registrar usuario');
            }
            return resp.json();
        })
            .then(() => {
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        })
            .catch((err) => {
            const msg = err instanceof Error ? err.message : 'No se pudo registrar';
            setError(msg);
        });
    };
    return (_jsx(Container, { className: "py-5", children: _jsx(Row, { className: "justify-content-center", children: _jsx(Col, { md: 8, lg: 6, children: _jsx(Card, { className: "shadow-sm border-0", children: _jsxs(Card.Body, { children: [_jsx("h3", { className: "mb-4 text-center", children: "Crear una cuenta" }), error && _jsx(Alert, { variant: "danger", children: error }), success && _jsx(Alert, { variant: "success", children: "Registro exitoso, redirigiendo..." }), _jsxs(Form, { onSubmit: handleSubmit, noValidate: true, children: [_jsxs(Row, { children: [_jsx(Col, { md: 6, children: _jsxs(Form.Group, { className: "mb-3", controlId: "nombre", children: [_jsx(Form.Label, { children: "Nombre" }), _jsx(Form.Control, { type: "text", name: "nombre", value: form.nombre, onChange: handleInputChange, placeholder: "Ej: Juanito", required: true })] }) }), _jsx(Col, { md: 6, children: _jsxs(Form.Group, { className: "mb-3", controlId: "apellido", children: [_jsx(Form.Label, { children: "Apellido" }), _jsx(Form.Control, { type: "text", name: "apellido", value: form.apellido, onChange: handleInputChange, placeholder: "Ej: P\u00E9rez", required: true })] }) })] }), _jsxs(Row, { children: [_jsx(Col, { md: 6, children: _jsxs(Form.Group, { className: "mb-3", controlId: "password", children: [_jsx(Form.Label, { children: "Contrase\u00F1a" }), _jsx(Form.Control, { type: "password", name: "password", value: form.password, onChange: handleInputChange, placeholder: "M\u00EDnimo 8 caracteres", autoComplete: "new-password", required: true, isInvalid: form.password.length > 0 && !passwordStrong, isValid: passwordStrong }), _jsx(Form.Control.Feedback, { type: "invalid", children: "La contrase\u00F1a debe tener al menos 8 caracteres." })] }) }), _jsx(Col, { md: 6, children: _jsxs(Form.Group, { className: "mb-3", controlId: "confirmPassword", children: [_jsx(Form.Label, { children: "Confirmar contrase\u00F1a" }), _jsx(Form.Control, { type: "password", name: "confirmPassword", value: form.confirmPassword, onChange: handleInputChange, placeholder: "********", autoComplete: "new-password", required: true, isInvalid: passwordsFilled && !passwordsMatch, isValid: passwordsFilled && passwordsMatch }), _jsx(Form.Control.Feedback, { type: "invalid", children: "Las contrase\u00F1as no coinciden." })] }) })] }), _jsxs(Form.Group, { className: "mb-3", controlId: "email", children: [_jsx(Form.Label, { children: "Correo electr\u00F3nico" }), _jsx(Form.Control, { type: "email", name: "email", value: form.email, onChange: handleInputChange, placeholder: "correo@ejemplo.com", required: true })] }), _jsxs(Form.Group, { className: "mb-3", controlId: "telefono", children: [_jsx(Form.Label, { children: "Tel\u00E9fono" }), _jsx(Form.Control, { type: "text", name: "telefono", value: form.telefono, onChange: handleInputChange, placeholder: "+56912345678", inputMode: "tel", pattern: "^\\\\+?[0-9]{8,15}$", required: true }), _jsx(Form.Text, { className: "text-muted", children: "Solo n\u00FAmeros (puede incluir + al inicio)" })] }), _jsx(AddressAutocomplete, { label: "Direcci\u00F3n", value: direccionText, onTextChange: (v) => {
                                            setDireccionText(v);
                                            setDireccionParsed(null); // si escribe a mano, invalida selección
                                        }, onAddressSelected: (addr) => setDireccionParsed(addr), required: true, error: !addressSelected ? "Selecciona una sugerencia para validar la dirección." : null, isInvalid: direccionText.length > 0 && !addressSelected, isValid: addressSelected }), _jsx("div", { className: "mb-3", children: typeof direccionParsed?.lat === "number" && typeof direccionParsed?.lng === "number" ? (_jsx(MapPreview, { lat: direccionParsed.lat, lng: direccionParsed.lng })) : (_jsx("div", { className: "bg-light rounded-4 d-flex align-items-center justify-content-center", style: { height: 240 }, children: _jsx("small", { className: "text-body-secondary", children: "Escribe y selecciona una direcci\u00F3n para ver el mapa\u2026" }) })) }), _jsx("div", { className: "d-grid mt-4", children: _jsx(Button, { variant: "warning", size: "lg", type: "submit", disabled: !passwordStrong || !passwordsMatch || !addressSelected, children: "Registrarme" }) }), _jsxs("p", { className: "mt-4 text-center mb-0", children: ["\u00BFYa tienes cuenta?", " ", _jsx(Button, { variant: "link", className: "p-0", onClick: () => navigate("/login"), children: "Inicia sesi\u00F3n" })] })] })] }) }) }) }) }));
}

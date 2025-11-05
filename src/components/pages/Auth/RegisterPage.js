import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
export default function RegisterPage() {
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        direccion: "",
        ciudad: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    // ✅ Validaciones dinámicas
    const passwordStrong = form.password.length >= 8;
    const passwordsFilled = form.password.length > 0 && form.confirmPassword.length > 0;
    const passwordsMatch = form.password === form.confirmPassword;
    const handleChange = (e) => {
        const { name, value } = e.target;
        // ✅ Restringe el teléfono a números y "+"
        if (name === "telefono") {
            const numeric = value.replace(/[^0-9+]/g, "");
            setForm({ ...form, [name]: numeric });
            return;
        }
        setForm({ ...form, [name]: value });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        if (Object.values(form).some((v) => v.trim() === "")) {
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
        const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
        if (usuarios.some((u) => u.email === form.email)) {
            setError("Ya existe un usuario registrado con este correo");
            return;
        }
        usuarios.push({
            nombre: form.nombre,
            apellido: form.apellido,
            email: form.email,
            telefono: form.telefono,
            direccion: form.direccion,
            ciudad: form.ciudad,
            password: form.password,
        });
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
    };
    return (_jsx(Container, { className: "py-5", children: _jsx(Row, { className: "justify-content-center", children: _jsx(Col, { md: 8, lg: 6, children: _jsx(Card, { className: "shadow-sm border-0", children: _jsxs(Card.Body, { children: [_jsx("h3", { className: "mb-4 text-center", children: "Crear una cuenta" }), error && _jsx(Alert, { variant: "danger", children: error }), success && _jsx(Alert, { variant: "success", children: "Registro exitoso, redirigiendo..." }), _jsxs(Form, { onSubmit: handleSubmit, children: [_jsxs(Row, { children: [_jsx(Col, { md: 6, children: _jsxs(Form.Group, { className: "mb-3", controlId: "nombre", children: [_jsx(Form.Label, { children: "Nombre" }), _jsx(Form.Control, { type: "text", name: "nombre", value: form.nombre, onChange: handleChange, placeholder: "Ej: Juanito", required: true })] }) }), _jsx(Col, { md: 6, children: _jsxs(Form.Group, { className: "mb-3", controlId: "apellido", children: [_jsx(Form.Label, { children: "Apellido" }), _jsx(Form.Control, { type: "text", name: "apellido", value: form.apellido, onChange: handleChange, placeholder: "Ej: P\u00E9rez", required: true })] }) })] }), _jsxs(Row, { children: [_jsx(Col, { md: 6, children: _jsxs(Form.Group, { className: "mb-3", controlId: "password", children: [_jsx(Form.Label, { children: "Contrase\u00F1a" }), _jsx(Form.Control, { type: "password", name: "password", value: form.password, onChange: handleChange, placeholder: "M\u00EDnimo 8 caracteres", required: true, isInvalid: form.password.length > 0 && !passwordStrong, isValid: passwordStrong }), _jsx(Form.Control.Feedback, { type: "invalid", children: "La contrase\u00F1a debe tener al menos 8 caracteres." }), _jsx(Form.Control.Feedback, { type: "valid", children: "Contrase\u00F1a segura \u2714\uFE0F" })] }) }), _jsx(Col, { md: 6, children: _jsxs(Form.Group, { className: "mb-3", controlId: "confirmPassword", children: [_jsx(Form.Label, { children: "Confirmar contrase\u00F1a" }), _jsx(Form.Control, { type: "password", name: "confirmPassword", value: form.confirmPassword, onChange: handleChange, placeholder: "********", required: true, isInvalid: passwordsFilled && !passwordsMatch, isValid: passwordsFilled && passwordsMatch }), _jsx(Form.Control.Feedback, { type: "invalid", children: "Las contrase\u00F1as no coinciden." }), _jsx(Form.Control.Feedback, { type: "valid", children: "Contrase\u00F1as coinciden \u2714\uFE0F" })] }) })] }), _jsxs(Form.Group, { className: "mb-3", controlId: "email", children: [_jsx(Form.Label, { children: "Correo electr\u00F3nico" }), _jsx(Form.Control, { type: "email", name: "email", value: form.email, onChange: handleChange, placeholder: "correo@ejemplo.com", required: true })] }), _jsxs(Form.Group, { className: "mb-3", controlId: "telefono", children: [_jsx(Form.Label, { children: "Tel\u00E9fono" }), _jsx(Form.Control, { type: "text", name: "telefono", value: form.telefono, onChange: handleChange, placeholder: "+56912345678", pattern: "^\\+?[0-9]{8,15}$", required: true }), _jsx(Form.Text, { className: "text-muted", children: "Solo n\u00FAmeros (puede incluir + al inicio)" })] }), _jsxs(Form.Group, { className: "mb-3", controlId: "ciudad", children: [_jsx(Form.Label, { children: "Ciudad" }), _jsx(Form.Control, { type: "text", name: "ciudad", value: form.ciudad, onChange: handleChange, placeholder: "Ej: Santiago", required: true })] }), _jsxs(Form.Group, { className: "mb-3", controlId: "direccion", children: [_jsx(Form.Label, { children: "Direcci\u00F3n" }), _jsx(Form.Control, { type: "text", name: "direccion", value: form.direccion, onChange: handleChange, placeholder: "Calle, n\u00FAmero, depto...", required: true })] }), _jsx("div", { className: "d-grid mt-4", children: _jsx(Button, { variant: "warning", size: "lg", type: "submit", disabled: !passwordStrong || !passwordsMatch, children: "Registrarme" }) })] }), _jsxs("p", { className: "mt-4 text-center mb-0", children: ["\u00BFYa tienes cuenta?", " ", _jsx(Button, { variant: "link", className: "p-0", onClick: () => navigate("/login"), children: "Inicia sesi\u00F3n" })] })] }) }) }) }) }));
}

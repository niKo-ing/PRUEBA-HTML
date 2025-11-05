import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@domain/auth/auth.context";
export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPass] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email.trim(), password);
            navigate("/", { replace: true });
        }
        catch (err) {
            setError(err?.message || "No se pudo iniciar sesión");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(Container, { className: "py-5", children: _jsx(Row, { className: "justify-content-center", children: _jsx(Col, { md: 6, lg: 5, children: _jsx(Card, { className: "shadow-sm border-0", children: _jsxs(Card.Body, { children: [_jsx("h3", { className: "mb-4 text-center", children: "Iniciar sesi\u00F3n" }), error && _jsx(Alert, { variant: "danger", children: error }), _jsxs(Form, { onSubmit: onSubmit, children: [_jsxs(Form.Group, { className: "mb-3", controlId: "email", children: [_jsx(Form.Label, { children: "Correo electr\u00F3nico" }), _jsx(Form.Control, { type: "email", placeholder: "correo@ejemplo.com", value: email, onChange: (e) => setEmail(e.target.value), required: true })] }), _jsxs(Form.Group, { className: "mb-4", controlId: "password", children: [_jsx(Form.Label, { children: "Contrase\u00F1a" }), _jsx(Form.Control, { type: "password", placeholder: "********", value: password, onChange: (e) => setPass(e.target.value), required: true })] }), _jsx("div", { className: "d-grid", children: _jsx(Button, { variant: "warning", size: "lg", type: "submit", disabled: loading, children: loading ? "Ingresando..." : "Ingresar" }) })] }), _jsxs("p", { className: "mt-3 text-center mb-0", children: ["\u00BFNo tienes cuenta?", " ", _jsx(Link, { to: "/registro", className: "link-primary", children: "Reg\u00EDstrate" })] })] }) }) }) }) }));
}

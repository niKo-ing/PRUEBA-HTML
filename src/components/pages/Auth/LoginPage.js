import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@domain/auth/auth.context";
export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fromAdmin = location.state?.from === "admin";
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
            const isAdmin = (() => { try {
                return localStorage.getItem("isAdmin") === "1";
            }
            catch {
                return false;
            } })();
            if (isAdmin && fromAdmin) {
                navigate("/admin", { replace: true });
            }
            else {
                navigate("/", { replace: true });
            }
        }
        catch (e) {
            setError(e?.message || "No se pudo iniciar sesión");
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(Container, { className: "py-5", children: _jsx(Row, { className: "justify-content-center", children: _jsx(Col, { md: 6, lg: 5, children: _jsx(Card, { className: "shadow-sm border-0", children: _jsxs(Card.Body, { children: [_jsx("h3", { className: "mb-4 text-center", children: "Iniciar sesi\u00F3n" }), error && _jsx(Alert, { variant: "danger", children: error }), _jsxs(Form, { onSubmit: handleSubmit, noValidate: true, children: [_jsxs(Form.Group, { className: "mb-3", controlId: "email", children: [_jsx(Form.Label, { children: "Correo electr\u00F3nico" }), _jsx(Form.Control, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "correo@ejemplo.com", required: true, autoFocus: true })] }), _jsxs(Form.Group, { className: "mb-3", controlId: "password", children: [_jsx(Form.Label, { children: "Contrase\u00F1a" }), _jsx(Form.Control, { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "********", required: true })] }), _jsx(Button, { type: "submit", disabled: loading || !email || !password, className: "w-100", children: loading ? "Ingresando…" : "Entrar" })] }), _jsx("div", { className: "mt-3 text-center", children: _jsxs("small", { className: "text-body-secondary", children: ["\u00BFNo tienes cuenta? ", _jsx(Link, { to: "/registro", children: "Reg\u00EDstrate" })] }) })] }) }) }) }) }));
}

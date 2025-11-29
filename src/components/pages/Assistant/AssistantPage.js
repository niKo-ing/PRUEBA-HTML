import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
export default function AssistantPage() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    async function ask() {
        setLoading(true);
        setError(null);
        setAnswer(null);
        try {
            const res = await fetch("/api/ai/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.detail || `HTTP ${res.status}`);
            }
            const data = await res.json();
            setAnswer(String(data.answer ?? ""));
        }
        catch (e) {
            setError(e?.message || "No se pudo consultar al asistente");
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(Container, { className: "py-5", children: _jsx(Row, { className: "justify-content-center", children: _jsx(Col, { md: 8, lg: 7, children: _jsx(Card, { className: "shadow-sm border-0", children: _jsxs(Card.Body, { children: [_jsx("h3", { className: "mb-3", children: "Asistente de Todobaratisimo" }), _jsx("p", { className: "text-body-secondary mb-4", children: "Haz preguntas sobre productos, comparativas y soporte. El asistente usa Vertex AI." }), error && _jsx(Alert, { variant: "danger", children: error }), _jsxs(Form, { onSubmit: (e) => { e.preventDefault(); ask(); }, children: [_jsxs(Form.Group, { className: "mb-3", controlId: "question", children: [_jsx(Form.Label, { children: "Tu pregunta" }), _jsx(Form.Control, { as: "textarea", rows: 4, value: question, onChange: (e) => setQuestion(e.target.value), placeholder: "\u00BFQu\u00E9 mouse recomiendas para gaming?", required: true })] }), _jsxs("div", { className: "d-flex gap-2", children: [_jsx(Button, { type: "submit", disabled: loading || !question, children: loading ? "Consultando…" : "Preguntar" }), _jsx(Button, { variant: "outline-secondary", onClick: () => { setQuestion(""); setAnswer(null); setError(null); }, children: "Limpiar" })] })] }), answer && (_jsxs("div", { className: "mt-4", children: [_jsx("h6", { children: "Respuesta" }), _jsx("pre", { className: "bg-light p-3 rounded", style: { whiteSpace: "pre-wrap" }, children: answer })] }))] }) }) }) }) }));
}

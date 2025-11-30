import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from "react-bootstrap";
import "./assistant.css";
export default function AssistantPage() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const listRef = useRef(null);
    async function ask() {
        if (!question.trim())
            return;
        const q = question.trim();
        setQuestion("");
        setMessages((prev) => [...prev, { role: "user", content: q }]);
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/ai/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: q }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.detail || `HTTP ${res.status}`);
            }
            const data = await res.json();
            const text = String(data.answer ?? "");
            setMessages((prev) => [...prev, { role: "assistant", content: text }]);
        }
        catch (e) {
            setError(e?.message || "No se pudo consultar al asistente");
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        const el = listRef.current;
        if (el)
            el.scrollTop = el.scrollHeight;
    }, [messages, loading]);
    return (_jsx(Container, { className: "py-5 assistant-container", children: _jsx(Row, { className: "justify-content-center", children: _jsx(Col, { md: 8, lg: 7, children: _jsx(Card, { className: "shadow-sm border-0 assistant-card", children: _jsxs(Card.Body, { children: [_jsxs("div", { className: "assistant-header d-flex align-items-center justify-content-between mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "mb-1", children: "Asistente" }), _jsx("small", { className: "text-body-secondary", children: "Te ayudo a elegir y comprar" })] }), _jsx(Badge, { bg: "pink", className: "assistant-badge", children: "Beta" })] }), _jsx("div", { className: "assistant-suggestions mb-3", children: [
                                    "¿Qué puede hacer este asistente?",
                                    "Cuéntame sobre sus ofertas",
                                    "Tengo un problema",
                                ].map((s) => (_jsx(Button, { size: "sm", variant: "outline-pink", className: "me-2 mb-2", onClick: () => setQuestion(s), children: s }, s))) }), error && _jsx(Alert, { variant: "danger", children: error }), _jsxs("div", { ref: listRef, className: "assistant-chatbox mb-3", children: [messages.length === 0 && (_jsx("div", { className: "assistant-empty text-body-secondary", children: "Empieza con una pregunta o usa una sugerencia." })), messages.map((m, i) => (_jsx("div", { className: `bubble ${m.role}`, children: _jsx("div", { className: "content", children: m.content }) }, i))), loading && (_jsxs("div", { className: "typing", children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {})] }))] }), _jsx(Form, { onSubmit: (e) => { e.preventDefault(); ask(); }, children: _jsxs("div", { className: "assistant-input d-flex align-items-center gap-2", children: [_jsx(Form.Control, { as: "textarea", rows: 2, value: question, onChange: (e) => setQuestion(e.target.value), placeholder: "Escribe tu pregunta\u2026" }), _jsx(Button, { type: "submit", disabled: loading || !question.trim(), className: "ask-btn", children: loading ? "Consultando…" : "Preguntar" })] }) })] }) }) }) }) }));
}

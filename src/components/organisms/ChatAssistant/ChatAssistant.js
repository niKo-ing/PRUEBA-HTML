import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export default function ChatAssistant({ open, onClose }) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const suggestions = [
        "¿Qué puede hacer este asistente?",
        "Cuéntame sobre sus ofertas",
        "Tengo un problema",
    ];
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
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setAnswer(data.answer);
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    if (!open)
        return null;
    return (_jsx("div", { className: "chat-modal", children: _jsxs("div", { className: "chat-content", children: [_jsx("h3", { children: "Asistente" }), _jsx("div", { className: "chat-suggestions", children: suggestions.map((s) => (_jsx("button", { className: "chat-suggestion", onClick: () => setQuestion(s), children: s }, s))) }), _jsx("textarea", { value: question, onChange: (e) => setQuestion(e.target.value), placeholder: "Escribe tu pregunta..." }), _jsxs("div", { children: [_jsx("button", { onClick: ask, disabled: loading || !question, children: loading ? "Consultando..." : "Preguntar" }), _jsx("button", { onClick: onClose, children: "Cerrar" })] }), error && _jsx("p", { className: "error", children: error }), answer && _jsx("pre", { className: "answer", children: answer })] }) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export default function ChatAssistant({ open, onClose }) {
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Hi there 👋\nBienvenido a Todobaratisimo!\n¿Cómo puedo ayudarte hoy?",
        },
    ]);
    const suggestions = [
        "¿Qué puede hacer este asistente?",
        "Cuéntame sobre sus ofertas",
        "Tengo un problema",
    ];
    async function ask() {
        const q = question.trim();
        if (!q)
            return;
        setLoading(true);
        setError(null);
        setMessages((prev) => [...prev, { role: "user", text: q }]);
        setQuestion("");
        try {
            const base = import.meta.env.VITE_API_BASE_URL || "";
            const url = `${base.replace(/\/$/, "")}/api/ai/ask`;
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: q }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.detail || `HTTP ${res.status}`);
            }
            const data = await res.json();
            setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
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
    return (_jsx("div", { className: "chat-modal", role: "dialog", "aria-modal": "true", "aria-label": "Asistente de la tienda", children: _jsxs("div", { className: "chat-content", children: [_jsxs("div", { className: "chat-header", children: [_jsxs("div", { className: "chat-title", children: [_jsx("strong", { children: "Asistente" }), _jsx("span", { className: "badge", children: "Beta" })] }), _jsx("button", { className: "chat-close", "aria-label": "Cerrar", onClick: onClose, children: _jsx("i", { className: "bi bi-x-lg" }) })] }), _jsx("div", { className: "chat-suggestions", children: suggestions.map((s) => (_jsx("button", { className: "chat-suggestion", onClick: () => setQuestion(s), children: s }, s))) }), _jsxs("div", { className: "chat-messages", children: [messages.map((m, idx) => (_jsx("div", { className: `bubble ${m.role}`, children: _jsx("div", { className: "content", children: m.text }) }, idx))), loading && (_jsx("div", { className: "bubble assistant", children: _jsx("div", { className: "content", children: "Consultando..." }) })), error && _jsx("p", { className: "error", children: error })] }), _jsxs("div", { className: "chat-input-row", children: [_jsx("input", { type: "text", value: question, onChange: (e) => setQuestion(e.target.value), onKeyDown: (e) => {
                                if (e.key === "Enter")
                                    ask();
                            }, placeholder: "Escribe tu pregunta..." }), _jsx("button", { className: "send-btn", onClick: ask, disabled: loading || !question.trim(), "aria-label": "Enviar", title: "Enviar", children: _jsx("i", { className: "bi bi-send" }) })] })] }) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import "./chat.css";
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
            // En desarrollo, usa proxy de Vite ("/api") para evitar CORS.
            // En producción, utiliza VITE_API_BASE_URL.
            const useProxy = import.meta.env.DEV;
            const base = useProxy ? "" : (import.meta.env.VITE_API_BASE_URL || "");
            const buildUrl = (b) => `${b.replace(/\/$/, "")}/api/ai/ask`;
            const opts = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: q }),
            };
            let res;
            try {
                res = await fetch(buildUrl(base), opts);
            }
            catch (networkErr) {
                // Fallback cruzado:
                // - En dev: si el proxy local falla, intenta la URL remota (CORS permitido)
                // - En prod: si la URL remota falla, intenta relativo "/api" (si está detrás del mismo host)
                const alt = useProxy ? (import.meta.env.VITE_API_BASE_URL || "") : "";
                if (alt !== base) {
                    res = await fetch(buildUrl(alt), opts);
                }
                else {
                    throw networkErr;
                }
            }
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
    return (_jsx("div", { className: "chat-window", role: "dialog", "aria-modal": "true", "aria-label": "Asistente de la tienda", children: _jsxs("div", { className: "chat-content", children: [_jsxs("div", { className: "chat-header", children: [_jsxs("div", { className: "chat-title", children: [_jsx("strong", { children: "Asistente" }), _jsx("span", { className: "badge", children: "Beta" })] }), _jsx("button", { className: "chat-close", "aria-label": "Cerrar", onClick: onClose, children: _jsx("i", { className: "bi bi-x-lg" }) })] }), _jsx("div", { className: "chat-suggestions", children: suggestions.map((s) => (_jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: () => setQuestion(s), title: s, children: s }, s))) }), _jsxs("div", { className: "chat-messages", role: "log", "aria-live": "polite", children: [messages.map((m, idx) => (_jsx("div", { className: `d-flex ${m.role === "user" ? "justify-content-end" : "justify-content-start"}`, children: _jsxs("div", { className: `msg-bubble ${m.role === "user" ? "user" : "assistant"}`, children: [_jsx("div", { className: "msg-meta small text-body-secondary mb-1", children: m.role === "user" ? "Tú" : "Asistente" }), _jsx("div", { className: "msg-text", children: m.text })] }) }, idx))), loading && (_jsx("div", { className: "d-flex align-items-center gap-2 text-body-secondary small", children: _jsx("span", { children: "Pensando\u2026" }) })), error && (_jsx("div", { className: "alert alert-warning mb-0 small", role: "alert", children: error }))] }), _jsxs("div", { className: "chat-input-row", children: [_jsx("input", { type: "text", className: "form-control form-control-sm", value: question, onChange: (e) => setQuestion(e.target.value), onKeyDown: (e) => {
                                if (e.key === "Enter")
                                    ask();
                            }, placeholder: "Escribe tu pregunta...", "aria-label": "Pregunta al asistente" }), _jsx("button", { className: "btn btn-dark btn-sm", onClick: ask, disabled: loading || !question.trim(), "aria-label": "Enviar", title: "Enviar", children: _jsx("i", { className: "bi bi-send" }) })] })] }) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, ListGroup, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
export default function AssistantPage() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "¡Bienvenido a Todobaratisimo! ¿Cómo puedo ayudarte hoy? Puedo buscar productos, explicar características y guiarte en compras.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastResponse, setLastResponse] = useState(null);
    const inputRef = useRef(null);
    useEffect(() => {
        inputRef.current?.focus();
    }, []);
    async function sendQuestion(q) {
        if (!q.trim())
            return;
        setError(null);
        setLoading(true);
        setMessages((m) => [...m, { role: "user", text: q }]);
        try {
            const resp = await fetch("/api/ai/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: q }),
            });
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }
            const data = await resp.json();
            setLastResponse(data);
            const answerText = data?.answer || "No recibí respuesta. Intenta nuevamente.";
            // Construye un resumen inline de resultados y sugerencias para que se vea dentro del chat
            const products = Array.isArray(data?.products) ? data.products : [];
            const suggestions = Array.isArray(data?.next) ? data.next : [];
            let inlineSummary = "";
            if (products.length > 0) {
                inlineSummary += `\n\nEncontré ${products.length} opción${products.length > 1 ? "es" : ""}:`;
                inlineSummary += "\n" + products
                    .slice(0, 3)
                    .map((p) => `• ${p.nombre ?? "Producto"}${typeof p.precio === "number" ? ` — $${p.precio.toLocaleString("es-CL")}` : ""}`)
                    .join("\n");
                inlineSummary += "\nPuedes abrirlas desde el panel derecho o pedir comparar.";
            }
            if (suggestions.length > 0) {
                inlineSummary += "\n\nPara refinar, puedes preguntar:";
                inlineSummary += "\n" + suggestions.slice(0, 3).map((s) => `• ${s}`).join("\n");
            }
            setMessages((m) => [...m, { role: "assistant", text: answerText + inlineSummary }]);
        }
        catch (e) {
            setError("Hubo un problema al responder. Revisa tu conexión o inténtalo de nuevo.");
            setMessages((m) => [
                ...m,
                {
                    role: "assistant",
                    text: "No pude comunicarme con el servidor en este momento. Intentemos otra vez en unos segundos.",
                },
            ]);
        }
        finally {
            setLoading(false);
        }
    }
    function handleSubmit(e) {
        e.preventDefault();
        const q = input.trim();
        setInput("");
        sendQuestion(q);
    }
    const quickPrompts = [
        "¿Qué puede hacer este asistente?",
        "un celular",
        "Teclado Mecánico TKL sin RGB con switches azules",
        "Cuéntame sobre sus ofertas",
        "Tengo un problema",
    ];
    return (_jsx("div", { className: "py-4", children: _jsxs(Container, { children: [_jsx(Row, { className: "mb-3", children: _jsxs(Col, { children: [_jsx("h1", { className: "h3 mb-1", children: "Asistente de la tienda" }), _jsx("p", { className: "text-body-secondary mb-0", children: "Haz una pregunta y te dar\u00E9 recomendaciones, detalles y opciones." })] }) }), _jsxs(Row, { children: [_jsx(Col, { md: 8, className: "mb-3", children: _jsxs(Card, { className: "shadow-sm", children: [_jsx(Card.Body, { children: _jsxs("div", { className: "d-flex flex-column gap-3", role: "log", "aria-live": "polite", children: [messages.map((msg, idx) => (_jsx("div", { className: `d-flex ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`, children: _jsxs("div", { className: `p-3 rounded-3 ${msg.role === "user" ? "bg-dark text-white" : "bg-light"}`, children: [_jsx("div", { className: "small text-body-secondary mb-1", children: msg.role === "user" ? "Tú" : "Asistente" }), _jsx("div", { children: msg.text })] }) }, idx))), loading && (_jsxs("div", { className: "d-flex align-items-center gap-2 text-body-secondary", children: [_jsx(Spinner, { animation: "border", size: "sm" }), _jsx("span", { children: "Pensando\u2026" })] })), error && _jsx(Alert, { variant: "warning", className: "mb-0", children: error })] }) }), _jsxs(Card.Footer, { children: [_jsxs(Form, { onSubmit: handleSubmit, className: "d-flex gap-2", children: [_jsx(Form.Control, { ref: inputRef, placeholder: "Escribe tu pregunta", value: input, onChange: (e) => setInput(e.target.value), "aria-label": "Pregunta al asistente" }), _jsx(Button, { type: "submit", disabled: loading, variant: "dark", children: "Enviar" })] }), _jsx("div", { className: "mt-2 d-flex flex-wrap gap-2", children: quickPrompts.map((p) => (_jsx("button", { type: "button", className: "btn btn-outline-secondary btn-sm", onClick: () => sendQuestion(p), title: p, children: p }, p))) })] })] }) }), _jsxs(Col, { md: 4, className: "mb-3", children: [_jsx(Card, { className: "shadow-sm", children: _jsxs(Card.Body, { children: [_jsxs("div", { className: "d-flex align-items-center justify-content-between mb-2", children: [_jsx("div", { className: "fw-semibold", children: "Sugerencias" }), _jsx(Badge, { bg: "dark", children: "AI" })] }), !lastResponse?.next || lastResponse.next.length === 0 ? (_jsx("div", { className: "text-body-secondary small", children: "Env\u00EDa una pregunta para ver refinamientos." })) : (_jsx(ListGroup, { variant: "flush", children: lastResponse.next.map((n, i) => (_jsxs(ListGroup.Item, { className: "d-flex justify-content-between align-items-center", children: [_jsx("span", { children: n }), _jsx(Button, { size: "sm", variant: "outline-dark", onClick: () => sendQuestion(n), children: "Preguntar" })] }, i))) }))] }) }), _jsx(Card, { className: "shadow-sm mt-3", children: _jsxs(Card.Body, { children: [_jsx("div", { className: "fw-semibold mb-2", children: "Resultados" }), !lastResponse?.products || lastResponse.products.length === 0 ? (_jsx("div", { className: "text-body-secondary small", children: "A\u00FAn no hay productos para mostrar." })) : (_jsx("div", { className: "d-grid gap-2", children: lastResponse.products.map((p, i) => (_jsx(Card, { className: "border-0", children: _jsxs(Card.Body, { className: "p-2 d-flex align-items-center gap-3", children: [p.img && (_jsx("img", { src: p.img, alt: p.nombre || "Producto", width: 64, height: 64, style: { objectFit: "cover", borderRadius: 8 } })), _jsxs("div", { className: "flex-grow-1", children: [_jsx("div", { className: "fw-semibold", children: p.nombre }), typeof p.precio === "number" && (_jsxs("div", { className: "text-body-secondary", children: ["$", p.precio.toLocaleString("es-CL")] }))] }), p.slug && (_jsx(Link, { to: `/producto/${p.slug}`, className: "btn btn-outline-dark btn-sm", children: "Ver" }))] }) }, i))) }))] }) })] })] })] }) }));
}

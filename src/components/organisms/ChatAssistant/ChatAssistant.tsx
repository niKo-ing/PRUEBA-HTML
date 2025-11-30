import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ChatAssistant({ open, onClose }: Props) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type Message = { role: "assistant" | "user"; text: string };
  const [messages, setMessages] = useState<Message[]>([
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
    if (!q) return;
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;
  return (
    <div className="chat-modal" role="dialog" aria-modal="true" aria-label="Asistente de la tienda">
      <div className="chat-content">
        <div className="chat-header">
          <div className="chat-title">
            <strong>Asistente</strong>
            <span className="badge">Beta</span>
          </div>
          <button className="chat-close" aria-label="Cerrar" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="chat-suggestions">
          {suggestions.map((s) => (
            <button key={s} className="chat-suggestion" onClick={() => setQuestion(s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="chat-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`bubble ${m.role}`}>
              <div className="content">{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="bubble assistant"><div className="content">Consultando...</div></div>
          )}
          {error && <p className="error">{error}</p>}
        </div>
        <div className="chat-input-row">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask();
            }}
            placeholder="Escribe tu pregunta..."
          />
          <button
            className="send-btn"
            onClick={ask}
            disabled={loading || !question.trim()}
            aria-label="Enviar"
            title="Enviar"
          >
            <i className="bi bi-send" />
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import "./chat.css";

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
      // En desarrollo, usa proxy de Vite ("/api") para evitar CORS.
      // En producción, utiliza VITE_API_BASE_URL.
      const useProxy = import.meta.env.DEV;
      const base = useProxy ? "" : (import.meta.env.VITE_API_BASE_URL || "");
      const buildUrl = (b: string) => `${b.replace(/\/$/, "")}/api/ai/ask`;
      const opts: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      };
      let res: Response;
      try {
        res = await fetch(buildUrl(base), opts);
      } catch (networkErr) {
        // Fallback cruzado:
        // - En dev: si el proxy local falla, intenta la URL remota (CORS permitido)
        // - En prod: si la URL remota falla, intenta relativo "/api" (si está detrás del mismo host)
        const alt = useProxy ? (import.meta.env.VITE_API_BASE_URL || "") : "";
        if (alt !== base) {
          res = await fetch(buildUrl(alt), opts);
        } else {
          throw networkErr;
        }
      }
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
    <div className="chat-window" role="dialog" aria-modal="true" aria-label="Asistente de la tienda">
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
            <button
              key={s}
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setQuestion(s)}
              title={s}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="chat-messages" role="log" aria-live="polite">
          {messages.map((m, idx) => (
            <div key={idx} className={`d-flex ${m.role === "user" ? "justify-content-end" : "justify-content-start"}`}>
              <div className={`msg-bubble ${m.role === "user" ? "user" : "assistant"}`}>
                <div className="msg-meta small text-body-secondary mb-1">
                  {m.role === "user" ? "Tú" : "Asistente"}
                </div>
                <div className="msg-text">{m.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="d-flex align-items-center gap-2 text-body-secondary small">
              <span>Pensando…</span>
            </div>
          )}
          {error && (
            <div className="alert alert-warning mb-0 small" role="alert">{error}</div>
          )}
        </div>
        <div className="chat-input-row">
          <input
            type="text"
            className="form-control form-control-sm"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask();
            }}
            placeholder="Escribe tu pregunta..."
            aria-label="Pregunta al asistente"
          />
          <button
            className="btn btn-dark btn-sm"
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

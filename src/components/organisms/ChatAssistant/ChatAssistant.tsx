import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ChatAssistant({ open, onClose }: Props) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAnswer(data.answer);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;
  return (
    <div className="chat-modal">
      <div className="chat-content">
        <h3>Asistente</h3>
        <div className="chat-suggestions">
          {suggestions.map((s) => (
            <button key={s} className="chat-suggestion" onClick={() => setQuestion(s)}>
              {s}
            </button>
          ))}
        </div>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Escribe tu pregunta..."
        />
        <div>
          <button onClick={ask} disabled={loading || !question}>
            {loading ? "Consultando..." : "Preguntar"}
          </button>
          <button onClick={onClose}>Cerrar</button>
        </div>
        {error && <p className="error">{error}</p>}
        {answer && <pre className="answer">{answer}</pre>}
      </div>
    </div>
  );
}

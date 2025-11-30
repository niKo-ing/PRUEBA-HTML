import { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from "react-bootstrap";
import "./assistant.css";

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  async function ask() {
    if (!question.trim()) return;
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
    } catch (e: any) {
      setError(e?.message || "No se pudo consultar al asistente");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  return (
    <Container className="py-5 assistant-container">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="shadow-sm border-0 assistant-card">
            <Card.Body>
              <div className="assistant-header d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h3 className="mb-1">Asistente</h3>
                  <small className="text-body-secondary">Te ayudo a elegir y comprar</small>
                </div>
                <Badge bg="pink" className="assistant-badge">Beta</Badge>
              </div>

              <div className="assistant-suggestions mb-3">
                {[
                  "¿Qué puede hacer este asistente?",
                  "Cuéntame sobre sus ofertas",
                  "Tengo un problema",
                ].map((s) => (
                  <Button key={s} size="sm" variant="outline-pink" className="me-2 mb-2"
                    onClick={() => setQuestion(s)}>
                    {s}
                  </Button>
                ))}
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <div ref={listRef} className="assistant-chatbox mb-3">
                {messages.length === 0 && (
                  <div className="assistant-empty text-body-secondary">
                    Empieza con una pregunta o usa una sugerencia.
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`bubble ${m.role}`}>
                    <div className="content">{m.content}</div>
                  </div>
                ))}
                {loading && (
                  <div className="typing">
                    <span></span><span></span><span></span>
                  </div>
                )}
              </div>

              <Form onSubmit={(e) => { e.preventDefault(); ask(); }}>
                <div className="assistant-input d-flex align-items-center gap-2">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Escribe tu pregunta…"
                  />
                  <Button type="submit" disabled={loading || !question.trim()} className="ask-btn">
                    {loading ? "Consultando…" : "Preguntar"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

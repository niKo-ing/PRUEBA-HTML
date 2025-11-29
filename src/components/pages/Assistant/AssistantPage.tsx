import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (e: any) {
      setError(e?.message || "No se pudo consultar al asistente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h3 className="mb-3">Asistente de Todobaratisimo</h3>
              <p className="text-body-secondary mb-4">
                Haz preguntas sobre productos, comparativas y soporte. El asistente usa Vertex AI.
              </p>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={(e) => { e.preventDefault(); ask(); }}>
                <Form.Group className="mb-3" controlId="question">
                  <Form.Label>Tu pregunta</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="¿Qué mouse recomiendas para gaming?"
                    required
                  />
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button type="submit" disabled={loading || !question}>
                    {loading ? "Consultando…" : "Preguntar"}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => { setQuestion(""); setAnswer(null); setError(null); }}>
                    Limpiar
                  </Button>
                </div>
              </Form>

              {answer && (
                <div className="mt-4">
                  <h6>Respuesta</h6>
                  <pre className="bg-light p-3 rounded" style={{ whiteSpace: "pre-wrap" }}>
                    {answer}
                  </pre>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}


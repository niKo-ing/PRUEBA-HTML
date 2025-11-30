import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, ListGroup, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

type Message = {
  role: "user" | "assistant";
  text: string;
};

type AskResponse = {
  answer: string;
  fallback?: boolean;
  reason?: string;
  products?: Array<{
    id?: number | string;
    slug?: string;
    nombre?: string;
    precio?: number;
    img?: string;
    categoria?: string;
  }>;
  actions?: Array<any>;
  next?: string[];
  intent?: any;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text:
        "¡Bienvenido a Todobaratisimo! ¿Cómo puedo ayudarte hoy? Puedo buscar productos, explicar características y guiarte en compras.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<AskResponse | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function sendQuestion(q: string) {
    if (!q.trim()) return;
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
        // Manejo específico: si IA está desactivada (503), deshabilitar UI
        if (resp.status === 503) {
          setDisabled(true);
          setError("El asistente está desactivado temporalmente.");
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              text: "El asistente está desactivado temporalmente. Vuelve más tarde.",
            },
          ]);
          return;
        }
        throw new Error(`HTTP ${resp.status}`);
      }
      const data: AskResponse = await resp.json();
      setLastResponse(data);
      const answerText = data?.answer || "No recibí respuesta. Intenta nuevamente.";
      // Construye un resumen inline de resultados y sugerencias para que se vea dentro del chat
      const products = Array.isArray(data?.products) ? data!.products! : [];
      const suggestions = Array.isArray(data?.next) ? data!.next! : [];
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
    } catch (e: any) {
      if (!disabled) {
        setError("Hubo un problema al responder. Revisa tu conexión o inténtalo de nuevo.");
      }
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: disabled
            ? "El asistente está desactivado temporalmente."
            : "No pude comunicarme con el servidor en este momento. Intentemos otra vez en unos segundos.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
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

  return (
    <div className="py-4">
      <Container>
        <Row className="mb-3">
          <Col>
            <h1 className="h3 mb-1">Asistente de la tienda</h1>
            <p className="text-body-secondary mb-0">
              Haz una pregunta y te daré recomendaciones, detalles y opciones.
            </p>
          </Col>
        </Row>

        <Row>
          <Col md={8} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex flex-column gap-3" role="log" aria-live="polite">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`d-flex ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}>
                      <div className={`p-3 rounded-3 ${msg.role === "user" ? "bg-dark text-white" : "bg-light"}`}>
                        <div className="small text-body-secondary mb-1">
                          {msg.role === "user" ? "Tú" : "Asistente"}
                        </div>
                        <div>{msg.text}</div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="d-flex align-items-center gap-2 text-body-secondary">
                      <Spinner animation="border" size="sm" />
                      <span>Pensando…</span>
                    </div>
                  )}
                  {error && <Alert variant="warning" className="mb-0">{error}</Alert>}
                </div>
              </Card.Body>
              <Card.Footer>
                <Form onSubmit={handleSubmit} className="d-flex gap-2">
                  <Form.Control
                    ref={inputRef}
                    placeholder="Escribe tu pregunta"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    aria-label="Pregunta al asistente"
                    disabled={disabled}
                  />
                  <Button type="submit" disabled={loading || disabled} variant="dark">
                    Enviar
                  </Button>
                </Form>
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {quickPrompts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => sendQuestion(p)}
                      disabled={disabled}
                      title={p}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </Card.Footer>
            </Card>
          </Col>

          <Col md={4} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="fw-semibold">Sugerencias</div>
                  <Badge bg="dark">AI</Badge>
                </div>
                {disabled ? (
                  <div className="text-body-secondary small">El asistente está desactivado.</div>
                ) : !lastResponse?.next || lastResponse.next.length === 0 ? (
                  <div className="text-body-secondary small">Envía una pregunta para ver refinamientos.</div>
                ) : (
                  <ListGroup variant="flush">
                    {lastResponse.next.map((n, i) => (
                      <ListGroup.Item key={i} className="d-flex justify-content-between align-items-center">
                        <span>{n}</span>
                        <Button size="sm" variant="outline-dark" onClick={() => sendQuestion(n)} disabled={disabled}>Preguntar</Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>

            <Card className="shadow-sm mt-3">
              <Card.Body>
                <div className="fw-semibold mb-2">Resultados</div>
                {disabled ? (
                  <div className="text-body-secondary small">El asistente está desactivado.</div>
                ) : !lastResponse?.products || lastResponse.products.length === 0 ? (
                  <div className="text-body-secondary small">Aún no hay productos para mostrar.</div>
                ) : (
                  <div className="d-grid gap-2">
                    {lastResponse.products.map((p, i) => (
                      <Card key={i} className="border-0">
                        <Card.Body className="p-2 d-flex align-items-center gap-3">
                          {p.img && (
                            <img src={p.img} alt={p.nombre || "Producto"} width={64} height={64} style={{ objectFit: "cover", borderRadius: 8 }} />
                          )}
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{p.nombre}</div>
                            {typeof p.precio === "number" && (
                              <div className="text-body-secondary">${p.precio.toLocaleString("es-CL")}</div>
                            )}
                          </div>
                          {p.slug && (
                            <Link to={`/producto/${p.slug}`} className="btn btn-outline-dark btn-sm">Ver</Link>
                          )}
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

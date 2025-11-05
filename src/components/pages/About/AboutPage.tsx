import { Container, Row, Col, Card, Badge, Accordion, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* HERO */}
      <section className="bg-light border-bottom py-5">
        <Container>
          <Row className="align-items-center g-4">
            <Col md={7}>
              <h1 className="display-5 fw-bold mb-3">Sobre Todobaratisimo</h1>
              <p className="lead text-body-secondary mb-4">
                Somos una tienda especializada en periféricos y accesorios tecnológicos. 
                Combinamos precios justos, soporte cercano y una experiencia de compra clara, 
                rápida y segura.
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <Badge bg="warning" text="dark">+5.000 pedidos</Badge>
                <Badge bg="success">Envíos 24–48h</Badge>
                <Badge bg="secondary">Garantía 12 meses</Badge>
              </div>
            </Col>
            <Col md={5}>
              <Card className="shadow-sm">
                <Card.Img
                  variant="top"
                  src="/assets/img/about/warehouse.jpg"
                  alt="Centro de distribución"
                  className="object-cover"
                  style={{ height: 220 }}
                />
                <Card.Body>
                  <Card.Title className="h5">¿Qué nos mueve?</Card.Title>
                  <Card.Text className="mb-3 text-body-secondary">
                    Hacer que elegir tecnología sea simple: fichas claras, comparativas, 
                    recomendaciones honestas y soporte real post-venta.
                  </Card.Text>
                  <Link to="/productos" className="btn btn-warning">Ver productos</Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* MÉTRICAS */}
      <section className="py-5">
        <Container>
          <Row className="text-center g-4">
            {[
              { kpi: "+4.8/5", label: "Satisfacción clientes" },
              { kpi: "98%", label: "Pedidos a tiempo" },
              { kpi: "12m", label: "Garantía promedio" },
              { kpi: "<24h", label: "Soporte inicial" },
            ].map((m, i) => (
              <Col key={i} xs={6} md={3}>
                <div className="display-6 fw-bold">{m.kpi}</div>
                <div className="text-body-secondary">{m.label}</div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* PROPUESTA DE VALOR */}
      <section className="py-5 bg-body-tertiary border-top border-bottom">
        <Container>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="mb-2"><i className="bi bi-shield-check fs-3" /></div>
                  <Card.Title>Compra segura</Card.Title>
                  <Card.Text className="text-body-secondary">
                    Pagos con tarjeta, transferencia y plataformas locales. 
                    Protección de datos y verificación antifraude.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="mb-2"><i className="bi bi-truck fs-3" /></div>
                  <Card.Title>Logística confiable</Card.Title>
                  <Card.Text className="text-body-secondary">
                    Envíos a todo Chile en 24–48h. Seguimiento en línea y embalaje seguro.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="mb-2"><i className="bi bi-headset fs-3" /></div>
                  <Card.Title>Soporte experto</Card.Title>
                  <Card.Text className="text-body-secondary">
                    Asesoría previa a la compra y acompañamiento post-venta vía correo y WhatsApp.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* TIMELINE SIMPLE */}
      <section className="py-5">
        <Container>
          <Row className="mb-4">
            <Col>
              <h2 className="h3">Nuestra historia</h2>
              <p className="text-body-secondary mb-0">
                Un resumen de hitos que explican cómo llegamos hasta aquí.
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {[
              { year: "2022", txt: "Nace la tienda con catálogo curado y enfoque en experiencia." },
              { year: "2023", txt: "Sumamos partners logísticos y extensión de garantía." },
              { year: "2024", txt: "Implementamos seguimiento de pedidos y reseñas verificadas." },
              { year: "2025", txt: "Migramos a React + TS para un sitio más rápido y estable." },
            ].map((t, i) => (
              <Col key={i} md={3}>
                <Card className="h-100 border-0">
                  <Card.Body>
                    <Badge bg="dark" className="mb-2">{t.year}</Badge>
                    <div>{t.txt}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* EQUIPO (PLACEHOLDER) */}
      <section className="py-5 bg-light border-top">
        <Container>
          <Row className="mb-4">
            <Col>
              <h2 className="h3">Equipo</h2>
              <p className="text-body-secondary mb-0">
                Pequeño, ágil y con obsesión por el detalle.
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {[1,2,3].map((i) => (
              <Col key={i} md={4}>
                <Card className="h-100 text-center shadow-sm">
                  <Card.Img
                    src={`/assets/img/team/${i}.jpg`}
                    alt={`Integrante ${i}`}
                    className="object-cover"
                    style={{ height: 220 }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/assets/img/team/placeholder.jpg"; }}
                  />
                  <Card.Body>
                    <Card.Title>Integrante {i}</Card.Title>
                    <div className="text-body-secondary">Soporte & Ventas</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-5">
        <Container>
          <Row className="mb-4">
            <Col>
              <h2 className="h3">Preguntas frecuentes</h2>
            </Col>
          </Row>
          <Row>
            <Col lg={8}>
              <Accordion alwaysOpen>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>¿Cuánto demora el envío?</Accordion.Header>
                  <Accordion.Body>
                    Nuestro compromiso es 24–48 horas hábiles según destino. 
                    Recibirás un código de seguimiento y actualizaciones por correo.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>¿Qué medios de pago aceptan?</Accordion.Header>
                  <Accordion.Body>
                    Tarjetas de crédito/débito, transferencia y pasarelas locales. 
                    Todas las transacciones viajan cifradas.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>¿Cómo funciona la garantía?</Accordion.Header>
                  <Accordion.Body>
                    12 meses por falla de fabricación. Escríbenos con tu número de pedido y el diagnóstico. 
                    Coordinamos retiro o cambio según el caso.
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA FINAL */}
      <section className="py-5 bg-body-tertiary border-top">
        <Container>
          <Row className="align-items-center g-3">
            <Col md={8}>
              <h3 className="mb-1">¿Necesitas asesoría para elegir?</h3>
              <p className="text-body-secondary mb-0">
                Cuéntanos para qué lo usarás y te ayudamos a decidir mejor.
              </p>
            </Col>
            <Col md={4} className="text-md-end">
              <Link to="/contacto" className="btn btn-dark">Contáctanos</Link>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}

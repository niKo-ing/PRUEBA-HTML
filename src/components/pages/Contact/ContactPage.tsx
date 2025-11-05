import { Container, Row, Col, Card, Button } from "react-bootstrap";

const RECIPIENTS = [
  "nic.estefania@duocuc.cl",
  "al.rosales@duocuc.cl",
];

function buildMailto(subject: string, body: string) {
  const to = RECIPIENTS.join(",");
  const encSubject = encodeURIComponent(subject);
  const encBody = encodeURIComponent(body.replace(/\n/g, "\r\n"));
  return `mailto:${to}?subject=${encSubject}&body=${encBody}`;
}

function buildGmail(subject: string, body: string) {
  const to = RECIPIENTS.join(",");
  const encTo = encodeURIComponent(to);
  const encSubject = encodeURIComponent(subject);
  const encBody = encodeURIComponent(body.replace(/\n/g, "\r\n"));
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}&su=${encSubject}&body=${encBody}`;
}

export default function ContactPage() {
  return (
    <div className="contact-page">
      <section className="bg-light border-bottom py-4">
        <Container>
          <Row className="align-items-center">
            <Col>
              <h1 className="h3 mb-2">Cómo contactarnos</h1>
              <p className="text-body-secondary mb-0">
                Escríbenos y te responderemos lo antes posible.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="container-xxl py-4">
        <Row className="g-4">
          <Col lg={{ span: 8, offset: 2 }}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="mb-3">
                  <div className="fw-semibold mb-1">Correos</div>
                  <div className="d-flex flex-column gap-1">
                    {RECIPIENTS.map((mail) => (
                      <a key={mail} href={`mailto:${mail}`} className="link-primary">{mail}</a>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="fw-semibold mb-1">Accesos rápidos</div>
                  <div className="d-flex flex-wrap gap-2">
                    {/* Copiar correos en portapapeles */}
                    <Button
                      variant="outline-secondary"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(RECIPIENTS.join(", "));
                          alert("Correos copiados al portapapeles.");
                        } catch {
                          const blob = new Blob([RECIPIENTS.join(", ")], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.target = "_blank";
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          setTimeout(() => URL.revokeObjectURL(url), 5000);
                        }
                      }}
                    >Copiar correos</Button>
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        const href = buildGmail("Consulta", "Hola, tengo una consulta…");
                        const a = document.createElement("a");
                        a.href = href;
                        a.target = "_blank";
                        a.rel = "noopener noreferrer";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                    >Abrir Gmail</Button>
                    {/* botón copiado de enlace eliminado */}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
}
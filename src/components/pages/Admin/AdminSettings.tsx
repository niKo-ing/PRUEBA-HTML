import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

type Settings = {
  siteName: string;
  currency: string; // CLP, USD, etc.
  taxRate: number;  // porcentaje
  shippingBase: number; // costo base
  supportEmail: string;
  maintenance: boolean;
};

const defaults: Settings = {
  siteName: "Todobaratisimo",
  currency: "CLP",
  taxRate: 19,
  shippingBase: 2990,
  supportEmail: "soporte@todobaratisimo.local",
  maintenance: false,
};

export default function AdminSettings() {
  const [cfg, setCfg] = useState<Settings>(defaults);

  useEffect(() => {
    try {
      const saved: Settings | null = JSON.parse(localStorage.getItem("admin_settings") || "null");
      if (saved) setCfg(saved);
    } catch {}
  }, []);

  const bind = <K extends keyof Settings>(key: K) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const val = target.type === "checkbox"
      ? (target as HTMLInputElement).checked
      : target.type === "number"
        ? Number((target as HTMLInputElement).value)
        : (target as HTMLInputElement).value;
    setCfg((prev) => ({ ...prev, [key]: val as Settings[K] }));
  };

  const save = () => {
    localStorage.setItem("admin_settings", JSON.stringify(cfg));
    alert("Ajustes guardados (localStorage)");
  };

  const discard = () => {
    try {
      const saved: Settings | null = JSON.parse(localStorage.getItem("admin_settings") || "null");
      setCfg(saved || defaults);
    } catch {
      setCfg(defaults);
    }
  };

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="mb-3">Ajustes</h2>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Nombre del sitio</Form.Label>
              <Form.Control type="text" value={cfg.siteName} onChange={bind("siteName")} />
            </Col>
            <Col md={3}>
              <Form.Label>Moneda</Form.Label>
              <Form.Select value={cfg.currency} onChange={bind("currency")}>
                <option value="CLP">CLP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Impuesto (%)</Form.Label>
              <Form.Control type="number" inputMode="numeric" value={cfg.taxRate} onChange={bind("taxRate")} />
            </Col>

            <Col md={4}>
              <Form.Label>Costo base envío</Form.Label>
              <Form.Control type="number" inputMode="numeric" value={cfg.shippingBase} onChange={bind("shippingBase")} />
            </Col>
            <Col md={5}>
              <Form.Label>Email de soporte</Form.Label>
              <Form.Control type="email" value={cfg.supportEmail} onChange={bind("supportEmail")} />
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Form.Check type="switch" id="maintenance" label="Modo mantenimiento" checked={cfg.maintenance} onChange={bind("maintenance")} />
            </Col>
          </Row>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={discard}>Descartar</Button>
          <Button variant="warning" onClick={save}>Guardar</Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}
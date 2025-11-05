import { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Badge, ProgressBar, Table } from "react-bootstrap";

type Estado = "pendiente" | "procesando" | "enviado" | "completado" | "cancelado";
type Order = { id: string; cliente: string; email: string; total: number; fecha: string; estado: Estado; items: number };

function formatCLP(v: number) {
  try { return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }); }
  catch { return `$${Math.round(v)}`; }
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const saved: Order[] = JSON.parse(localStorage.getItem("admin_orders") || "null") || [];
      setOrders(saved);
    } catch {}
  }, []);

  const pending = useMemo(() => orders.filter(o => o.estado === "pendiente").length, [orders]);
  const today = useMemo(() => {
    const t0 = new Date(); t0.setHours(0,0,0,0);
    const t1 = new Date(); t1.setHours(23,59,59,999);
    return orders.reduce((acc, o) => {
      const d = new Date(o.fecha).getTime();
      return d >= t0.getTime() && d <= t1.getTime() ? acc + (Number.isFinite(o.total) ? o.total : 0) : acc;
    }, 0);
  }, [orders]);

  const totalProducts =  productosPublicados();

  function productosPublicados() {
    try {
      // Si en el futuro guardamos productos en localStorage, tomarlos; por ahora estimado
      const raw = localStorage.getItem("admin_products");
      if (raw) {
        const arr = JSON.parse(raw) as Array<{ id: number }>; return Array.isArray(arr) ? arr.length : 0;
      }
    } catch {}
    return 24; // placeholder visual
  }

  const progressDay = Math.min(100, Math.round((today / 200000) * 100)); // meta visual

  const recent = useMemo(() => orders.slice(0, 5), [orders]);

  return (
    <div>
      <h2 className="mb-3">Dashboard</h2>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-baseline">
                <div>
                  <div className="text-body-secondary small">Ventas (hoy)</div>
                  <div className="h4 mb-1">{formatCLP(today)}</div>
                </div>
                <Badge bg="success">Meta</Badge>
              </div>
              <ProgressBar now={progressDay} variant="success" className="mt-2" />
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-body-secondary small">Pedidos pendientes</div>
              <div className="h4 mb-1">{pending}</div>
              <div className="small text-body-secondary">En proceso y por atender</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-body-secondary small">Productos publicados</div>
              <div className="h4 mb-1">{totalProducts}</div>
              <div className="small text-body-secondary">Incluye variaciones</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="fw-semibold">Pedidos recientes</div>
              <Badge bg="info">{orders.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Código</th>
                    <th>Cliente</th>
                    <th>Email</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id}>
                      <td className="text-nowrap">{o.id}</td>
                      <td>{o.cliente}</td>
                      <td className="text-body-secondary">{o.email}</td>
                      <td className="fw-semibold">{formatCLP(o.total)}</td>
                      <td><Badge bg="secondary">{o.estado}</Badge></td>
                    </tr>
                  ))}
                  {recent.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-body-secondary py-4">Sin pedidos recientes.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

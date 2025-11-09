// Reportes: filtra órdenes por rango de fechas y texto; exporta CSV.
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Table, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

type Estado = "pendiente" | "procesando" | "enviado" | "completado" | "cancelado";
type Order = { id: string; cliente: string; email: string; total: number; fecha: string; estado: Estado; items: number };

export default function AdminReports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [q, setQ] = useState<string>("");

  // Carga órdenes desde localStorage para generar reportes
  useEffect(() => {
    try { const saved: Order[] = JSON.parse(localStorage.getItem("admin_orders") || "null") || []; setOrders(saved); } catch {}
  }, []);

  // Aplica filtros de texto y rango [from, to]
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const t0 = from ? new Date(from).getTime() : 0;
    const t1 = to ? new Date(to).getTime() : Number.MAX_SAFE_INTEGER;
    return orders.filter(o => {
      const base = `${o.id} ${o.cliente} ${o.email}`.toLowerCase();
      const okQ = !ql || base.includes(ql);
      const d = new Date(o.fecha).getTime();
      const okR = d >= t0 && d <= t1;
      return okQ && okR;
    });
  }, [orders, from, to, q]);

  // Suma total del período
  const total = useMemo(() => filtered.reduce((acc, o) => acc + (Number.isFinite(o.total) ? o.total : 0), 0), [filtered]);
  // Genera un CSV en memoria y descarga vía anchor temporal
  const exportCSV = () => {
    const header = ["id","cliente","email","total","fecha","estado","items"];
    const rows = filtered.map(o => [o.id, o.cliente, o.email, String(o.total), o.fecha, o.estado, String(o.items)].join(","));
    const blob = new Blob([header.join(",") + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "reporte.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-end g-2">
        <Col>
          <h2 className="mb-0">Reportes</h2>
          <div className="text-body-secondary">Órdenes filtradas: {filtered.length} · Total: {total.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}</div>
        </Col>
        <Col md={3}>
          <Form.Label className="small mb-1">Desde</Form.Label>
          <Form.Control type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Col>
        <Col md={3}>
          <Form.Label className="small mb-1">Hasta</Form.Label>
          <Form.Control type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </Col>
        <Col md={3}>
          <Form.Label className="small mb-1">Buscar</Form.Label>
          <Form.Control type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cliente, email o código…" />
        </Col>
        <Col md={3} className="d-grid">
          <Button variant="warning" onClick={exportCSV}>Exportar CSV</Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Email</th>
                <th>Items</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="text-nowrap">{o.id}</td>
                  <td>{o.cliente}</td>
                  <td className="text-body-secondary">{o.email}</td>
                  <td>{o.items}</td>
                  <td className="fw-semibold">{o.total.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}</td>
                  <td className="text-nowrap">{new Date(o.fecha).toLocaleString()}</td>
                  <td>{o.estado}</td>
                  <td style={{ width: 140 }}>
                    <Link to={`/admin/receipt/${o.id}`} className="btn btn-outline-primary btn-sm">Ver boleta</Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-body-secondary py-4">Sin órdenes para el rango.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}
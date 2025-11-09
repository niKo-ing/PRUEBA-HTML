// Pedidos: tabla editable de estados, filtros por texto y estado, y boleta.
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

type Estado = "pendiente" | "procesando" | "enviado" | "completado" | "cancelado";

type Order = {
  id: string;
  cliente: string;
  email: string;
  total: number;
  fecha: string; // ISO date
  estado: Estado;
  items: number;
};

const sv = (v?: string | null) => v ?? "";
const sn = (v?: number | null) => (Number.isFinite(v as number) ? (v as number) : 0);

// Utilidad para mostrar CLP sin decimales
function formatCLP(v: number) {
  try {
    return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
  } catch {
    return `$${Math.round(v)}`;
  }
}

const defaultOrders: Order[] = [
  { id: "OD-1001", cliente: "Ana Torres", email: "ana@example.com", total: 25990, fecha: new Date().toISOString(), estado: "pendiente", items: 2 },
  { id: "OD-1002", cliente: "Luis Pérez", email: "luis@example.com", total: 7990, fecha: new Date(Date.now() - 86400000).toISOString(), estado: "procesando", items: 1 },
  { id: "OD-1003", cliente: "María Silva", email: "maria@example.com", total: 139990, fecha: new Date(Date.now() - 2 * 86400000).toISOString(), estado: "enviado", items: 3 },
];

export default function AdminOrders() {
  const [rows, setRows] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"" | Estado>("");

  // Carga inicial desde localStorage o dataset por defecto
  useEffect(() => {
    try {
      const saved: Order[] = JSON.parse(localStorage.getItem("admin_orders") || "null") || defaultOrders;
      setRows(saved);
    } catch {
      setRows(defaultOrders);
    }
  }, []);

  const estados: Estado[] = ["pendiente", "procesando", "enviado", "completado", "cancelado"];

  // Aplica filtros de búsqueda y estado
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return rows.filter((r) => {
      const base = `${sv(r.cliente)} ${sv(r.email)} ${sv(r.id)}`.toLowerCase();
      const okQ = !ql || base.includes(ql);
      const okE = !estado || r.estado === estado;
      return okQ && okE;
    });
  }, [rows, q, estado]);

  // Permite cambiar el estado por fila
  const onEditEstado = (idx: number) => (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as Estado;
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, estado: val } : r)));
  };

  // Persistencia mock de pedidos
  const saveAll = () => {
    localStorage.setItem("admin_orders", JSON.stringify(rows));
    alert("Pedidos guardados (localStorage)");
  };

  // Recupera última versión guardada
  const discard = () => {
    try { const saved: Order[] = JSON.parse(localStorage.getItem("admin_orders") || "null") || defaultOrders; setRows(saved); } catch { setRows(defaultOrders); }
  };

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-end g-2">
        <Col xs={12} md={6}>
          <h2 className="mb-0">Pedidos</h2>
          <small className="text-body-secondary">
            {rows.length} pedidos&nbsp;|&nbsp;
            <Badge bg="info">{filtered.length} visibles</Badge>
          </small>
        </Col>
        <Col xs={12} md={3}>
          <Form.Label className="small mb-1">Buscar</Form.Label>
          <Form.Control
            type="search"
            value={sv(q)}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cliente, email o código…"
          />
        </Col>
        <Col xs={12} md={3}>
          <Form.Label className="small mb-1">Estado</Form.Label>
          <Form.Select value={sv(estado)} onChange={(e) => setEstado(e.target.value as Estado | "") }>
            <option value="">Todos</option>
            {estados.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </Form.Select>
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id}>
                  <td className="text-nowrap">{r.id}</td>
                  <td>{sv(r.cliente)}</td>
                  <td className="text-body-secondary">{sv(r.email)}</td>
                  <td>{sn(r.items)}</td>
                  <td className="fw-semibold">{formatCLP(sn(r.total))}</td>
                  <td className="text-nowrap">{new Date(r.fecha).toLocaleString()}</td>
                  <td style={{ width: 240 }}>
                    <div className="d-flex gap-2">
                      <Form.Select value={r.estado} onChange={onEditEstado(idx)} style={{ minWidth: 150 }}>
                        {estados.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </Form.Select>
                      <Link to={`/admin/receipt/${r.id}`} className="btn btn-outline-primary btn-sm">Ver boleta</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-body-secondary py-4">
                    Sin pedidos para los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={discard}>Descartar cambios</Button>
          <Button variant="warning" onClick={saveAll}>Guardar cambios</Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}
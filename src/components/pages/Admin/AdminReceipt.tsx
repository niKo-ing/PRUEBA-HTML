/**
 * Nombre del componente: AdminReceipt
 * Propósito: Cargar una orden por `id` desde localStorage y mostrar una boleta imprimible.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; utiliza parámetro de ruta `id`.
 *
 * Métodos/funciones:
 * - formatCLP(v: number): string — Formatea números a CLP con fallback.
 * - printReceipt(): void — Abre diálogo de impresión del navegador.
 *
 * Hooks utilizados:
 * - useParams: obtener `id` de la ruta.
 * - useState: manejar estado `order`.
 * - useEffect: cargar orden desde `localStorage` al montar/cambiar `id`.
 * - useMemo: recalcular totales (subtotal, iva, shipping, total).
 *
 * Ejemplo de uso:
 * ```tsx
 * <Route path="/admin/receipt/:id" element={<AdminReceipt />} />
 * ```
 */
// Página AdminReceipt: carga una orden desde localStorage por id y
// muestra una boleta imprimible con detalle por ítems y totales.
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Table, Button } from "react-bootstrap";

type Estado = "pendiente" | "procesando" | "enviado" | "completado" | "cancelado";
type Detalle = { id: number; nombre: string; precio: number; qty: number; total: number };
type Order = { id: string; cliente: string; email: string; total: number; subtotal?: number; iva?: number; shipping?: number; fecha: string; estado: Estado; items: number; detalles?: Detalle[] };

// Formatea un número como CLP, tolerando entornos sin Intl
function formatCLP(v: number) {
  try { return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }); }
  catch { return `$${Math.round(v)}`; }
}

export default function AdminReceipt() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Busca la orden en localStorage ('admin_orders') y la asigna si existe
    try {
      const saved: Order[] = JSON.parse(localStorage.getItem("admin_orders") || "null") || [];
      const found = saved.find((o) => o.id === id) || null;
      setOrder(found);
    } catch { setOrder(null); }
  }, [id]);

  const totals = useMemo(() => {
    // Reconstruye totales si la orden es antigua y no los trae desglosados
    if (!order) return { subtotal: 0, iva: 0, shipping: 0, total: 0 };
    const subtotal = Number.isFinite(order.subtotal as number) ? (order.subtotal as number) : order.total - (order.iva || 0) - (order.shipping || 0);
    const iva = Number.isFinite(order.iva as number) ? (order.iva as number) : Math.round(subtotal * 0.19);
    const shipping = Number.isFinite(order.shipping as number) ? (order.shipping as number) : 3990;
    const total = Number.isFinite(order.total) ? order.total : subtotal + iva + shipping;
    return { subtotal, iva, shipping, total };
  }, [order]);

  const printReceipt = () => {
    // Abre el diálogo de impresión del navegador
    window.print();
  };

  if (!order) {
    return (
      <Container className="py-4">
        <Card className="shadow-sm">
          <Card.Body className="text-center">
            <div className="h5">Boleta no encontrada</div>
            <p className="text-body-secondary">No existe una orden con el código proporcionado.</p>
            <Link to="/admin/orders" className="btn btn-outline-secondary">Volver a pedidos</Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center">
        <Col>
          <h2 className="mb-0">Boleta #{order.id}</h2>
          <div className="text-body-secondary">{new Date(order.fecha).toLocaleString()} · Estado: {order.estado}</div>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Link to="/admin/orders" className="btn btn-outline-secondary">Volver</Link>
          <Button variant="primary" onClick={printReceipt}>Imprimir</Button>
        </Col>
      </Row>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="fw-semibold mb-2">Cliente</div>
              <div>{order.cliente}</div>
              <div className="text-body-secondary">{order.email}</div>
            </Col>
            <Col md={6} className="text-md-end">
              <div className="fw-semibold mb-2">Tienda</div>
              <div>TodoBaratisimo</div>
              <div className="text-body-secondary">ventas@todobaratisimo.cl</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Producto</th>
                <th style={{ width: 120 }}>Precio</th>
                <th style={{ width: 120 }}>Cantidad</th>
                <th style={{ width: 160 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.detalles || []).map((d) => (
                <tr key={`${order.id}-${d.id}`}>
                  <td>{d.nombre}</td>
                  <td>{formatCLP(d.precio)}</td>
                  <td>{d.qty}</td>
                  <td className="fw-semibold">{formatCLP(d.total)}</td>
                </tr>
              ))}
              {(order.detalles || []).length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-body-secondary py-4">Sin detalles para esta boleta.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer>
          <div className="d-flex flex-column align-items-end gap-1">
            <div>Subtotal: <span className="fw-semibold">{formatCLP(totals.subtotal)}</span></div>
            <div>Envío: <span className="fw-semibold">{formatCLP(totals.shipping)}</span></div>
            <div>IVA (19%): <span className="fw-semibold">{formatCLP(totals.iva)}</span></div>
            <div className="fs-5">Total: <span className="fw-semibold">{formatCLP(totals.total)}</span></div>
          </div>
        </Card.Footer>
      </Card>
    </Container>
  );
}

/**
 * Nombre del componente: CartPage
 * Propósito: Mostrar la tabla del carrito con controles y resumen de compra.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; lee estado desde el contexto `useCart`.
 *
 * Métodos/funciones:
 * - No define helpers externos; calcula filas y total vía `useMemo`.
 *
 * Hooks utilizados:
 * - useCart: obtener items del carrito y acciones de cambio/eliminar/vaciar.
 * - useMemo: normalización de filas y cálculo de total.
 * - useNavigate: navegación hacia checkout.
 *
 * Ejemplo de uso:
 * ```tsx
 * <CartPage />
 * ```
 */
/**
 * Página CartPage - Tabla de carrito con resumen y acciones
 * Props: no recibe; Estado: derivado del contexto; Dependencias: react-bootstrap, react-router-dom, useCart
 */
import { useMemo } from "react";
import { Container, Row, Col, Table, Button, Alert, Card } from "react-bootstrap";
import { productos } from "@domain/data";
import { useCart } from "@domain/cart/cart.context";
import { useNavigate, Link } from "react-router-dom";

/**
 * Renderiza la página del carrito con tabla y resumen
 * @returns {JSX.Element} Contenido del carrito
 */
export default function CartPage() {
  const { items, change, remove, clear } = useCart();
  const navigate = useNavigate();

  // Normaliza los datos del carrito con información del catálogo
  const rows = useMemo(() => {
    return items.map((it) => {
      const p = productos.find((pp) => pp.id === it.id);
      return {
        id: it.id,
        qty: it.qty,
        nombre: p?.nombre ?? `Producto ${it.id}`,
        precio: p?.precio ?? 0,
        img: p?.img ?? "/assets/img/icono.png",
        slug: p?.slug ?? String(it.id),
        subtotal: (p?.precio ?? 0) * it.qty,
      };
    });
  }, [items]);

  // Total general del carrito
  const total = useMemo(() => rows.reduce((acc, r) => acc + r.subtotal, 0), [rows]);

  // Estado vacío: sugiere volver al catálogo
  if (rows.length === 0) {
    return (
      <Container className="py-5">
        <Row>
          <Col lg={8}>
            <Alert variant="info">
              Tu carrito está vacío.
            </Alert>
            <Link to="/productos" className="btn btn-warning">Explorar productos</Link>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8}>
          <h2 className="mb-3">Carrito de compras</h2>
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              // Tabla con controles de cantidad y eliminación por ítem
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 90 }}>Imagen</th>
                    <th>Producto</th>
                    <th style={{ width: 130 }}>Precio</th>
                    <th style={{ width: 140 }}>Cantidad</th>
                    <th style={{ width: 140 }}>Subtotal</th>
                    <th style={{ width: 120 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <img src={r.img} alt={r.nombre} style={{ width: 70, height: 70, objectFit: "cover" }} />
                      </td>
                      <td>
                        <Link to={`/producto/${r.slug}`} className="text-decoration-none">
                          {r.nombre}
                        </Link>
                      </td>
                      <td className="fw-semibold">
                        {r.precio.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Button variant="outline-secondary" size="sm" onClick={() => change(r.id, -1)}>-</Button>
                          <span className="fw-semibold">{r.qty}</span>
                          <Button variant="outline-secondary" size="sm" onClick={() => change(r.id, +1)}>+</Button>
                        </div>
                      </td>
                      <td className="fw-semibold">
                        {r.subtotal.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}
                      </td>
                      <td>
                        <Button variant="outline-danger" size="sm" onClick={() => remove(r.id)}>Quitar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        // Resumen a la derecha con total y acciones principales
        <Col lg={4} className="mt-4 mt-lg-0">
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div className="text-body-secondary">Total</div>
                <div className="h5 mb-0">
                  {total.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="d-grid gap-2 mt-3">
                <Button variant="warning" onClick={() => navigate("/checkout")}>Ir a Checkout</Button>
                <Button variant="outline-secondary" onClick={() => clear()}>Vaciar carrito</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

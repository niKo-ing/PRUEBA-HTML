/**
 * Componente CartDrawer - Panel lateral del carrito
 * Props: { show: boolean, onHide: () => void }; Estado: sin estado propio
 * Dependencias: react-bootstrap Offcanvas; contexto de carrito useCart; datos productos
 */
import { Offcanvas } from "react-bootstrap";
import { useCart } from "@domain/cart/useCart";
import { productos } from "@domain/data";

/**
 * Formatea número a CLP sin decimales
 * @param {number | undefined} v - Valor numérico
 * @returns {string} Texto con formato de moneda CLP
 */
function formatCLP(v: number | undefined) {
  return (Number(v) || 0).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

type Props = { show: boolean; onHide: () => void };

/**
 * Muestra items del carrito con controles de cantidad y acciones
 * @param {{ show: boolean, onHide: () => void }} props - Control de visibilidad
 * @returns {JSX.Element} Panel Offcanvas con contenido de carrito
 */
export default function CartDrawer({ show, onHide }: Props) {
  // El contexto del carrito expone: items, change, remove, clear, total, count
  const { items = [], total = 0, change, remove, clear } = useCart();

  return (
    <Offcanvas placement="end" show={show} onHide={onHide} backdrop scroll>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Tu carrito</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        {items.length === 0 ? (
          <div className="text-center text-body-secondary py-5">
            <i className="bi bi-bag fs-1 d-block mb-2" />
            <p>Tu carrito está vacío.</p>
          </div>
        ) : (
          <>
            <ul className="list-unstyled d-grid gap-3 mb-4">
              {items.map((it) => {
                const prod = productos.find((p) => p.id === it.id);
                const nombre = prod?.nombre ?? "Producto";
                const img = prod?.images?.[0] ?? prod?.img ?? "/assets/img/placeholder.png";
                const precio = Number(prod?.precio) || 0;
                const qty = Number(it.qty) || 1;
                const subtotal = precio * qty;

                return (
                  <li key={it.id} className="d-flex gap-3 align-items-center">
                    <img
                      src={img}
                      alt={nombre}
                      width={72}
                      height={72}
                      style={{ objectFit: "cover", borderRadius: 12 }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{nombre}</div>
                      <div className="text-body-secondary small">{formatCLP(precio)}</div>

                      <div className="d-flex align-items-center gap-2 mt-2">
                        // Botones para ajustar cantidad; si llega a 0 se elimina
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => change(it.id, -1)}
                          aria-label="Disminuir"
                        >
                          <i className="bi bi-dash" />
                        </button>

                        <span className="px-2">{qty}</span>

                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => change(it.id, +1)}
                          aria-label="Aumentar"
                        >
                          <i className="bi bi-plus" />
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm ms-auto"
                          onClick={() => remove(it.id)}
                          aria-label="Eliminar"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </div>

                    <div className="fw-semibold">{formatCLP(subtotal)}</div>
                  </li>
                );
              })}
            </ul>

            // Total del carrito y acciones principales
            <div className="d-flex justify-content-between border-top pt-3">
              <div className="fw-semibold">Total</div>
              <div className="fs-5 fw-bold">{formatCLP(total)}</div>
            </div>

            <div className="d-grid gap-2 mt-3">
              <button className="btn btn-warning btn-lg">
                <i className="bi bi-credit-card me-2" />
                Pagar
              </button>
              <button className="btn btn-outline-secondary" onClick={() => clear()}>
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

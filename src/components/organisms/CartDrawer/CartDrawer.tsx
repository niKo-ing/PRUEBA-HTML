import { Offcanvas } from "react-bootstrap";
import { useCart } from "@domain/cart/cart.context";

type Props = { show: boolean; onHide: () => void };

export default function CartDrawer({ show, onHide }: Props) {
  const { items = [], total = 0, inc, dec, remove, clear } = useCart() as any;

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
              {items.map((it: any) => (
                <li key={it.id} className="d-flex gap-3 align-items-center">
                  <img
                    src={it.img || it.images?.[0] || "/assets/img/placeholder.png"}
                    alt={it.nombre}
                    width={72}
                    height={72}
                    style={{ objectFit: "cover", borderRadius: 12 }}
                  />
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{it.nombre}</div>
                    <div className="text-body-secondary small">
                      {it.precio.toLocaleString("es-CL")} CLP
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => dec?.(it.id)}
                      >
                        <i className="bi bi-dash" />
                      </button>
                      <span className="px-2">{it.cantidad}</span>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => inc?.(it.id)}
                      >
                        <i className="bi bi-plus" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm ms-auto"
                        onClick={() => remove?.(it.id)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                  <div className="fw-semibold">
                    {(it.precio * it.cantidad).toLocaleString("es-CL")} CLP
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-top pt-3 d-flex justify-content-between">
              <div className="fw-semibold">Total</div>
              <div className="fs-5 fw-bold">{total.toLocaleString("es-CL")} CLP</div>
            </div>

            <div className="d-grid gap-2 mt-3">
              <button className="btn btn-warning btn-lg">
                <i className="bi bi-credit-card me-2" />
                Pagar
              </button>
              <button className="btn btn-outline-secondary" onClick={() => clear?.()}>
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

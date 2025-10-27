import type { Product } from "@domain/types";
import { Link } from "react-router-dom";
import { useCart } from "@domain/cart/cart.context";

function Stars({ rating = 0 }: { rating?: number }) {
  const r = rating ?? 0;
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  return (
    <div className="text-warning small">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <i key={i} className="bi bi-star-fill me-1" />;
        if (i === full && half) return <i key={i} className="bi bi-star-half me-1" />;
        return <i key={i} className="bi bi-star me-1" />;
      })}
    </div>
  );
}

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();

  return (
    <article className="card h-100 card-product product-card">
      <div className="position-relative">
        <img
          src={p.img}
          alt={p.nombre}
          className="card-img-top"
          style={{ background: "#fff" }}
        />
        <span className="badge bg-success position-absolute top-0 end-0 m-2 d-flex align-items-center gap-1">
          <i className="bi bi-check-circle" /> Stock {p.stock}
        </span>
      </div>

      <div className="card-body d-flex flex-column">
        <h6 className="card-title mb-1">{p.nombre}</h6>
        <Stars rating={p.rating ?? 0} />
        <div className="fw-bold my-2">${p.precio.toLocaleString("es-CL")}</div>

        <div className="d-flex gap-2 mt-auto">
          <button className="btn btn-naranja" onClick={() => add(p.id)}>
            <i className="bi bi-cart me-1" />
            Añadir
          </button>
          <Link to={`/producto/${p.slug ?? p.id}`} className="btn btn-outline-secondary">
            Detalle
          </Link>
        </div>
      </div>
    </article>
  );
}

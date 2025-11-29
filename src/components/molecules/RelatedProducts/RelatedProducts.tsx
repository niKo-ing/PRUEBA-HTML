// Muestra productos relacionados por categoría, con acciones de ver y añadir.
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/services/products.service";
import { useCart } from "@domain/cart/cart.context";

type Categoria = string | string[];
type Props = { categoria: Categoria; excludeId: number; max?: number; };

function matchCategoria(pCat: Categoria, target: Categoria) {
  const toArr = (c: Categoria) => (Array.isArray(c) ? c : [c]);
  const a = toArr(pCat);
  const b = toArr(target);
  return a.some(x => b.includes(x));
}

export default function RelatedProducts({ categoria, excludeId, max = 4 }: Props) {
  const { add } = useCart();
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    let alive = true;
    fetchProducts(true)
      .then((arr) => {
        if (!alive) return;
        const rel = arr.filter(p => p.id !== excludeId && matchCategoria(p.categoria as Categoria, categoria)).slice(0, max);
        setItems(rel);
      })
      .catch(() => void 0);
    return () => { alive = false; };
  }, [categoria, excludeId, max]);

  if (!items.length) return null;

  return (
    <section className="mt-5">
      <h3 className="mb-3">Productos relacionados</h3>
      <div className="row related-grid g-3">
        {items.map(p => (
          <div key={p.id} className="col-12 col-sm-6 col-lg-3">
            <Card className="h-100">
              <Link to={`/producto/${p.slug}`} className="text-decoration-none">
                <Card.Img
                  variant="top"
                  src={(p.images?.[0] ?? p.img)!}
                  alt={p.nombre}
                  className="card-img-fit"
                />
              </Link>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="h6">{p.nombre}</Card.Title>
                <div className="mt-auto d-flex gap-2">
                  <Link to={`/producto/${p.slug}`} className="btn btn-outline-secondary btn-sm">
                    Ver
                  </Link>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => add(p.id, 1)}   // 👈 agrega desde relacionados
                  >
                    Añadir
                  </button>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}

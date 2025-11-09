// Página de categorías: lista todas las categorías y permite filtrar productos.
import { useMemo } from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import { productos } from "@domain/data";
import type { Product } from "@domain/types";

type Categoria = string | string[];
const toArr = (c: Categoria) => (Array.isArray(c) ? c : [c]);

export default function CategoriesPage() {
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") ?? "";

  // Todas las categorías únicas presentes en el catálogo
  const ALL = useMemo(() => {
    return Array.from(new Set(productos.flatMap(p => toArr(p.categoria as Categoria)))).sort();
  }, []);

  // Filtra por categoría seleccionada (query param "cat")
  const filtered: Product[] = useMemo(() => {
    if (!cat) return productos;
    return productos.filter((p) => toArr(p.categoria as Categoria).some((x) => x === cat));
  }, [cat]);

  return (
    <Container className="py-4">
      {/* Selector de categoría y contador de resultados */}
      <Row className="align-items-center mb-3">
        <Col>
          <h2 className="mb-1">Categorías</h2>
          <div className="text-body-secondary">
            {ALL.length} categorías · {filtered.length} productos
            {cat ? (
              <> · categoría: <Badge bg="secondary">{cat}</Badge></>
            ) : null}
          </div>
        </Col>
        <Col xs="auto">
          <select
            className="form-select"
            value={cat}
            onChange={(e) => {
              const v = e.target.value || null;
              const next = new URLSearchParams(params);
              if (v === null) next.delete("cat"); else next.set("cat", e.target.value);
              setParams(next, { replace: true });
            }}
          >
            <option value="">Todas</option>
            {ALL.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Col>
      </Row>

      {/* Grilla de productos por categoría */}
      <Row className="g-3">
        {filtered.map((p) => (
          <Col key={p.id} xs={12} sm={6} md={4} lg={3}>
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
                <Card.Title className="h6 mb-1">{p.nombre}</Card.Title>
                <div className="mb-2 text-muted small">
                  {Array.isArray(p.categoria) ? p.categoria.join(", ") : p.categoria}
                </div>
                <div className="fw-bold mb-3">{p.precio.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}</div>
                <div className="mt-auto d-flex gap-2">
                  <Link to={`/producto/${p.slug}`} className="btn btn-outline-secondary btn-sm">Ver</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
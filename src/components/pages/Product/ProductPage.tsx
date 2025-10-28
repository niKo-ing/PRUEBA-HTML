import { useParams, Navigate } from "react-router-dom";
import { productos } from "@domain/data";
import type { Product } from "@domain/types";
import ProductGallery from "@organisms/ProductGallery/ProductGallery";
import RelatedProducts from "@molecules/RelatedProducts/RelatedProducts";
import { Badge, Button } from "react-bootstrap";

function formatCLP(v: number) {
  return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export default function ProductPage() {
  const { slug } = useParams();
  const prod: Product | undefined = productos.find(p => p.slug === slug);

  if (!prod) return <Navigate to="/productos" replace />;

  return (
    <div id="productDetail" className="container py-4">
      <div className="row g-4">
        {/* Galería */}
        <div className="col-12 col-lg-6">
          <ProductGallery images={prod.images} cover={prod.img} alt={prod.nombre} />
        </div>

        {/* Info */}
        <div className="col-12 col-lg-6">
          <h1 className="pd-title h2 mb-2">{prod.nombre}</h1>

          <div className="d-flex align-items-center gap-2 mb-3">
            <Badge bg="success">Stock {prod.stock}</Badge>
            <small className="text-muted">{prod.categoria}</small>
          </div>

          <div className="display-6 fw-bold mb-3">{formatCLP(prod.precio)}</div>
          <p className="text-body-secondary">{prod.descripcion}</p>

          <div className="d-flex gap-2 mt-3">
            <Button variant="warning" size="lg">
              <i className="bi bi-cart-plus me-2" />
              Añadir al carrito
            </Button>
            <Button variant="outline-secondary" size="lg">
              <i className="bi bi-heart me-2" />
              Favorito
            </Button>
          </div>

          {/* Extras (si quieres características) */}
          {/* <ul className="mt-4 list-unstyled small text-body-secondary">
            <li>• Envío 24-48h</li>
            <li>• Garantía 1 año</li>
          </ul> */}
        </div>
      </div>

      {/* Relacionados */}
      <RelatedProducts categoria={prod.categoria} excludeId={prod.id} />
    </div>
  );
}

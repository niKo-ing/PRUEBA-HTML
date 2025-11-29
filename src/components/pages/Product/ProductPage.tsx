/**
 * Nombre del componente: ProductPage
 * Propósito: Página de detalle del producto con galería, info y acciones.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; lee `slug` desde la URL.
 *
 * Métodos/funciones:
 * - formatCLP(v: number): string — Formatea un número en CLP.
 *   Parámetros: v (number). Retorno: string con moneda.
 *   Lógica: utiliza `toLocaleString` con configuración es-CL.
 *
 * Hooks utilizados:
 * - useParams: obtiene `slug` del router.
 * - useCart: acciones para añadir al carrito.
 * - useCartUI: abrir el panel de carrito.
 *
 * Ejemplo de uso:
 * ```tsx
 * <ProductPage />
 * ```
 */
/**
 * Página ProductPage - Detalle del producto
 * Props: no recibe; Estado: none; Dependencias: react-router-dom, ProductGallery, RelatedProducts, useCart/useCartUI
 */
import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
// Data estática eliminada: ahora se carga desde el backend
import type { Product } from "@domain/types";
import ProductGallery from "@organisms/ProductGallery/ProductGallery";
import RelatedProducts from "@molecules/RelatedProducts/RelatedProducts";
import { Badge, Button } from "react-bootstrap";
import { useCart } from "@domain/cart/cart.context";
import { useCartUI } from "@app/cart-ui.context";
import { fetchProductBySlug } from "@/services/products.service";

/**
 * Formatea número a CLP sin decimales
 * @param {number} v - Valor numérico
 * @returns {string} Moneda CLP
 */
function formatCLP(v: number) {
  return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

/**
 * Renderiza la página de detalle con galería e info
 * @returns {JSX.Element} Contenido del producto o redirección
 */
export default function ProductPage() {
  const { slug } = useParams();
  const [prod, setProd] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { add } = useCart();
  const { open } = useCartUI();

  useEffect(() => {
    const s = slug ?? "";
    let alive = true;
    setLoading(true);
    fetchProductBySlug(s)
      .then((p) => {
        if (!alive) return;
        setProd(p ?? null);
      })
      .catch(() => {
        if (!alive) return;
        setProd(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return <div className="container py-5 text-center">Cargando…</div>;
  }

  if (!prod) return <Navigate to="/productos" replace />;

  return (
    <div id="productDetail" className="container py-4">
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <ProductGallery images={prod.images ?? []} cover={prod.img} alt={prod.nombre} />
        </div>

        {/* Info del producto: nombre, stock, categoría, precio y descripción */}
        <div className="col-12 col-lg-6">
          <h1 className="pd-title h2 mb-2">{prod.nombre}</h1>

          <div className="d-flex align-items-center gap-2 mb-3">
            <Badge bg="success">Stock {prod.stock}</Badge>
            <small className="text-muted">{prod.categoria}</small>
          </div>

          <div className="display-6 fw-bold mb-3">{formatCLP(prod.precio)}</div>
          <p className="text-body-secondary">{prod.descripcion}</p>

          <div className="d-flex gap-2 mt-3">
            <Button
              variant="warning"
              size="lg"
              onClick={() => { add(prod.id, 1); open(); }}   // agrega y abre carrito
            >
              <i className="bi bi-cart-plus me-2" />
              Añadir al carrito
            </Button>
            <Button variant="outline-secondary" size="lg">
              <i className="bi bi-heart me-2" />
              Favorito
            </Button>
          </div>

          <ul className="mt-4 list-unstyled small text-body-secondary">
            <li>• Envío 24-48h</li>
            <li>• Garantía 1 año</li>
          </ul>
        </div>
      </div>

      <RelatedProducts categoria={prod.categoria} excludeId={prod.id} max={8} />
    </div>
  );
}

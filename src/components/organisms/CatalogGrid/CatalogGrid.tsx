/**
 * Componente CatalogGrid - Grilla de productos
 * Props: { items: Product[] } listado de productos a renderizar
 * Dependencias: ProductCard; Estado: no maneja estado local
 */
import ProductCard from "../../molecules/ProductCard/ProductCard";
import type { Product } from "@domain/types";

/**
 * Renderiza grilla responsive con tarjetas de productos
 * @param {{ items: Product[] }} props - Lista de productos
 * @returns {JSX.Element} Sección con columnas
 */
export default function CatalogGrid({ items }: { items: Product[] }) {
  return (
    <section id="destacados" className="row g-4">
      {items.map((p) => (
        <div key={p.id} className="col-12 col-sm-6 col-lg-3">
          <ProductCard p={p} />
        </div>
      ))}
    </section>
  );
}
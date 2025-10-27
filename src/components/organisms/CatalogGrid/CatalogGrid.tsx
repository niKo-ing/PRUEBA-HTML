import ProductCard from "../../molecules/ProductCard/ProductCard";
import type { Product } from "@domain/types";

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
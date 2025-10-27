import { productos } from "@domain/data";
import type { Product } from "@domain/types";
import { useParams } from "react-router-dom";

export default function ProductPage() {
  const { slug } = useParams();
  const product: Product | undefined = productos.find((p) => p.slug === slug);

  if (!product) {
    return <h1>Producto no encontrado</h1>;
  }

  const images = product.images?.length ? product.images : [product.img];

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1.2fr" }}>
      <div>
        <img
          src={images[0]}
          alt={product.nombre}
          style={{ width: "100%", borderRadius: 12 }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              style={{ width: 90, height: 90, borderRadius: 8, objectFit: "cover" }}
            />
          ))}
        </div>
      </div>

      <div>
        <h1>{product.nombre}</h1>
        <p style={{ fontSize: 22, fontWeight: 600 }}>
          ${product.precio.toLocaleString("es-CL")}
        </p>
        <p>Stock: {product.stock ?? 0} unidades</p>
        {product.descripcion && <p>{product.descripcion}</p>}
        <button className="btn btn-primary">Agregar al carrito</button>
      </div>
    </div>
  );
}
/**
 * Nombre del componente: HomePage
 * Propósito: Portada con hero y grilla de productos destacados rotatorios.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props.
 *
 * Métodos/funciones:
 * - No aplica; renderiza secciones y calcula destacados.
 *
 * Hooks utilizados:
 * - useState: índice inicial de rotación.
 * - useEffect: temporizador para rotar destacados.
 * - useMemo: selecciona los elementos visibles.
 *
 * Ejemplo de uso:
 * ```tsx
 * <HomePage />
 * ```
 */
/**
 * Página HomePage - Portada con hero y destacados rotatorios
 * Props: no recibe; Estado: startIndex (rotación); Dependencias: Hero, CatalogGrid, productos
 */
import Hero from "../../organisms/Hero/Hero";
import CatalogGrid from "../../organisms/CatalogGrid/CatalogGrid";
import { productos } from "@domain/data";
import { useEffect, useMemo, useState } from "react";

/**
 * Renderiza portada con grilla de productos destacados
 * @returns {JSX.Element} Secciones hero y destacados
 */
export default function HomePage() {
  const PAGE_SIZE = 4;
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStartIndex((i) => (i + PAGE_SIZE) % productos.length);
    }, 6000); // rota cada 6 segundos
    return () => clearInterval(id);
  }, []);

  const destacados = useMemo(() => {
    const total = productos.length;
    if (total === 0) return [];
    const items = [] as typeof productos;
    for (let i = 0; i < Math.min(PAGE_SIZE, total); i++) {
      const p = productos[(startIndex + i) % total];
      if (p) items.push(p);
    }
    return items;
  }, [startIndex]);
  return (
    <>
      <Hero video="/assets/video/mouse.mp4" poster="/assets/video/mouse-poster.JPG" />
      <section className="container-xxl py-4">
        <h2 id="destacados" className="mb-3">Destacados</h2>
        <CatalogGrid items={destacados} />
      </section>
    </>
  );
}

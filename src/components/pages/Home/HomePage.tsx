import Hero from "../../organisms/Hero/Hero";
import CatalogGrid from "../../organisms/CatalogGrid/CatalogGrid";
import { productos } from "@domain/data";
import heroVideo from "../../../assets/video/mouse.mp4";

export default function HomePage() {
  const destacados = productos.slice(0, 4);
  return (
    <>
      <Hero video={heroVideo} />
      <section className="container-xxl py-4">
        <h2 id="destacados" className="mb-3">Destacados</h2>
        <CatalogGrid items={destacados} />
      </section>
    </>
  );
}
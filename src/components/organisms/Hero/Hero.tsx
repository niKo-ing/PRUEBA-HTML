/**
 * Componente Hero - Sección destacada con video opcional
 * Props: video, poster, title, subtitle, full; Estado: ninguno
 * Dependencias: HTML5 video y estilos CSS de hero
 */
type Props = {
  video?: string;
  poster?: string;
  title?: string;
  subtitle?: string;
  full?: boolean;
};

/**
 * Renderiza sección hero con overlay y CTA a destacados
 * @param {Props} props - Contenido, medios y modo full
 * @returns {JSX.Element} Sección hero
 */
export default function Hero({
  video,
  poster,
  title = "Precisión y velocidad",
  subtitle = "Periféricos de alto rendimiento",
  full = false,     
}: Props) {
  return (
    <section className={`hero ${full ? "hero--full" : "hero--flat"}`}>
      {video && (
        <video className="hero-media" autoPlay loop muted playsInline preload="metadata" poster={poster}>
          <source src={video} type="video/mp4" />
        </video>
      )}

      <div className="hero-overlay" />

      <div className="hero-content text-center">
        <div className="container">
          <h1 className="display-4 fw-bold text-white">{title}</h1>
          <p className="lead text-white-50">{subtitle}</p>
          <a href="#destacados" className="btn btn-warning btn-lg mt-2">
            <i className="bi bi-cart me-2" />
            Ver productos
          </a>
        </div>
      </div>
    </section>
  );
}

type Props = {
  video?: string;
  title?: string;
  subtitle?: string;
  full?: boolean;
};

export default function Hero({
  video,
  title = "Precisión y velocidad",
  subtitle = "Periféricos de alto rendimiento",
  full = false,     
}: Props) {
  return (
    <section className={`hero ${full ? "hero--full" : "hero--flat"}`}>
      {video && (
        <video className="hero-media" autoPlay loop muted playsInline preload="auto">
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

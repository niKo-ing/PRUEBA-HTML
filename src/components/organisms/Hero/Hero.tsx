type Props = {
  video?: string;
  title?: string;
  subtitle?: string;
};

export default function Hero({
  video,
  title = "Precisión y velocidad",
  subtitle = "Periféricos de alto rendimiento",
}: Props) {
  return (
    <section className="hero-zip rounded-4 overflow-hidden mb-4">
      {video && (
        <video className="hero-media" autoPlay loop muted playsInline>
          <source src={video} type="video/mp4" />
        </video>
      )}

      <div className="hero-overlay" />

      <div className="hero-content text-center text-white">
        <div className="container">
          <h1 className="display-5 fw-bold">{title}</h1>
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
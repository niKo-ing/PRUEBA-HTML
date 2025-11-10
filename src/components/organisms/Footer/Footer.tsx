/**
 * Componente Footer - Pie de página con enlaces y redes
 * Props: no recibe; Estado: ninguno; Dependencias: íconos Bootstrap Icons
 */
export default function Footer() {
  /**
   * Renderiza pie con enlaces, redes y copyright
   * @returns {JSX.Element} Contenido de pie de página
   */
  return (
    <footer className="border-top mt-5">
      <div className="container py-4">
        <div className="d-flex justify-content-center gap-4 mb-3 fs-4">
          <a href="#" className="text-reset"><i className="bi bi-facebook" /></a>
          <a href="#" className="text-reset"><i className="bi bi-instagram" /></a>
          <a href="#" className="text-reset"><i className="bi bi-twitter-x" /></a>
          <a href="#" className="text-reset"><i className="bi bi-envelope" /></a>
        </div>
        <ul className="nav justify-content-center small mb-2">
          <li className="nav-item"><a className="nav-link px-2 text-muted" href="#">Política de Privacidad</a></li>
          <li className="nav-item"><a className="nav-link px-2 text-muted" href="#">Términos y Condiciones</a></li>
          <li className="nav-item"><a className="nav-link px-2 text-muted" href="#">Contacto</a></li>
        </ul>
        <p className="text-center text-muted small mb-0">
          © {new Date().getFullYear()} TodoBarato – Periféricos
        </p>
      </div>
    </footer>
  );
}
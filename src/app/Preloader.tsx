// Componente de “pantalla de carga” simple.
// Muestra un anillo girando y el texto “Cargando…” mientras la app prepara datos.
// Úsalo como fallback de React.Suspense o durante la inicialización.
export default function Preloader() {
  return (
    <div id="preloader">
      <div className="preloader-box">
        <div className="preloader-ring" />
        <div className="preloader-text">Cargando…</div>
      </div>
    </div>
  );
}
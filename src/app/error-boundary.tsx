// ErrorBoundary: muestra mensajes útiles cuando una ruta falla.
// Captura errores de React Router y otros throw para ayudar al diagnóstico.
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function ErrorBoundary() {
  const err = useRouteError();
  if (isRouteErrorResponse(err)) {
    return (
      <div className="container py-5">
        <h1 className="h3">Error {err.status}</h1>
        <p className="text-body-secondary">{err.statusText}</p>
      </div>
    );
  }
  return (
    <div className="container py-5">
      <h1 className="h3">Algo salió mal</h1>
      <pre className="small text-body-secondary">{String((err as any)?.message ?? err)}</pre>
    </div>
  );
}

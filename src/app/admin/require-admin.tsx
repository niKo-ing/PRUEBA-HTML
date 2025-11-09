// Protección de rutas de administración.
// Si el usuario no es admin (según localStorage), redirige al Home.
import { Navigate, Outlet, useLocation } from "react-router-dom";

function isAdmin(): boolean {
  // Lee un flag simple desde localStorage. En producción usarías auth real.
  try { return localStorage.getItem("isAdmin") === "1"; } catch { return false; }
}

export default function RequireAdmin() {
  const loc = useLocation();
  if (!isAdmin()) {
    // Redirige a la página principal y guarda desde dónde venía el usuario
    return <Navigate to="/" replace state={{ from: loc }} />;
  }
  // Si es admin, renderiza las rutas hijas del panel
  return <Outlet />;
}
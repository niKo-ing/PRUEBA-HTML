// Protección de rutas de administración.
// Si el usuario no es admin (según localStorage), redirige al Home.
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@domain/auth/auth.context";
import { isAdminUser, isAdminByStorage } from "@domain/auth/is-admin";

// mantenemos un pequeño wrapper si fuese necesario extender
function getIsAdminByStorage(): boolean { return isAdminByStorage(); }

export default function RequireAdmin() {
  const loc = useLocation();
  // Preferir auth context si está disponible; fallback al flag en storage
  let isAdmin = false;
  try {
    const { user } = useAuth();
    // Política centralizada: emails admin/root
    const byEmail = isAdminUser(user);
    const byStorage = getIsAdminByStorage();
    isAdmin = byEmail || byStorage;
  } catch {
    isAdmin = getIsAdminByStorage();
  }

  if (!isAdmin) {
    // Redirige a la página principal y guarda desde dónde venía el usuario
    return <Navigate to="/" replace state={{ from: loc }} />;
  }
  // Si es admin, renderiza las rutas hijas del panel
  return <Outlet />;
}

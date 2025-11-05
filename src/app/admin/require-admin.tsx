import { Navigate, Outlet, useLocation } from "react-router-dom";

function isAdmin(): boolean {
  try { return localStorage.getItem("isAdmin") === "1"; } catch { return false; }
}

export default function RequireAdmin() {
  const loc = useLocation();
  if (!isAdmin()) {
    return <Navigate to="/" replace state={{ from: loc }} />;
  }
  return <Outlet />;
}
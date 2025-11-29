import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Nombre del componente: AdminLayout
 * Propósito: Proveer layout base del área de administración y cargar estilos.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - children: React.ReactNode — Contenido a renderizar dentro del layout.
 *
 * Métodos/funciones:
 * - No define métodos; inyecta hoja de estilo en head.
 *
 * Hooks utilizados:
 * - useEffect: agrega y remueve `<link rel="stylesheet" href="/src/styles/admin.css">`.
 *   Dependencias: [] (solo corre al montar/desmontar).
 *
 * Ejemplo de uso:
 * ```tsx
 * <AdminLayout>
 *   <AdminDashboard />
 * </AdminLayout>
 * ```
 */
import { useEffect } from "react";
export default function AdminLayout({ children }) {
    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/src/styles/admin.css"; // ajusta la ruta si la moviste
        document.head.appendChild(link);
        return () => { document.head.removeChild(link); };
    }, []);
    return _jsx("div", { className: "sb-wrapper", children: children });
}

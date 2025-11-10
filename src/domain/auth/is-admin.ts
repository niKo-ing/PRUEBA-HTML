/**
 * @file Política de administración.
 * @description Funciones para determinar privilegios de admin desde usuario y almacenamiento.
 * @author Equipo Todobaratisimo
 * @date 2025-11-10
 */
// Política central para determinar si un usuario tiene privilegios de admin.
// Extrae la lógica del guard para hacerla reutilizable y testeable.
import type { User } from "./auth.context";

export function isAdminUser(user: User | null): boolean {
  if (!user) return false;
  // Política actual: emails que empiezan por admin/root
  return /^(admin|root)@/i.test(user.email);
}

export function isAdminByStorage(): boolean {
  try { return localStorage.getItem("isAdmin") === "1"; } catch { return false; }
}

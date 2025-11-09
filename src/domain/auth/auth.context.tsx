// Contexto de autenticación: guarda el usuario actual, expone login/logout
// y persiste la sesión en localStorage.
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type User = {
  nombre: string;
  apellido?: string;
  email: string;
};

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

const KEY_SESSION = "sessionUser";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Restaura sesión si existe en localStorage
    try {
      const raw = localStorage.getItem(KEY_SESSION);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const login = async (email: string, password: string) => {
    // Simula la “BD” con usuarios guardados por tu registro (localStorage)
    const usuarios: any[] = JSON.parse(localStorage.getItem("usuarios") || "[]");

    // HTML-like: validación simple (igual que haría el form básico)
    const match = usuarios.find(u => u.email === email && u.password === password);
    if (!match) {
      throw new Error("Correo o contraseña incorrectos");
    }

    const current: User = { nombre: match.nombre, apellido: match.apellido, email: match.email };
    setUser(current);
    localStorage.setItem(KEY_SESSION, JSON.stringify(current));

    // Marcador de admin (mock): si el usuario tiene campo role === 'admin' o email conocido
    const isAdmin = match.role === 'admin' || /^(admin|root)@/i.test(match.email);
    try { localStorage.setItem('isAdmin', isAdmin ? '1' : '0'); } catch {}
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(KEY_SESSION);
    try { localStorage.removeItem('isAdmin'); } catch {}
  };

  const value = useMemo<AuthCtx>(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  // Hook de consumo para leer usuario y acciones. Requiere AuthProvider arriba.
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

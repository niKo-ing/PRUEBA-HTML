// Contexto de autenticación: guarda el usuario actual, expone login/logout
// y persiste la sesión en localStorage.
/**
 * @file Contexto de autenticación.
 * @description Gestiona el usuario actual, login/logout y persistencia.
 * @author Equipo Todobaratisimo
 * @date 2025-11-10
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type User = {
  nombre: string;
  apellido?: string;
  email: string;
};

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

const KEY_SESSION = "sessionUser";
const KEY_TOKEN = "sessionToken";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Restaura sesión si existe en localStorage
    try {
      const raw = localStorage.getItem(KEY_SESSION);
      if (raw) setUser(JSON.parse(raw));
      const tk = localStorage.getItem(KEY_TOKEN);
      if (tk) setToken(tk);
    } catch {}
  }, []);

  const login = async (email: string, password: string) => {
    const resp = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data?.detail || 'Correo o contraseña incorrectos');
    }
    const data = await resp.json();
    const current: User = data.user;
    setUser(current);
    setToken(data.token ?? null);
    localStorage.setItem(KEY_SESSION, JSON.stringify(current));
    if (data.token) {
      try { localStorage.setItem(KEY_TOKEN, data.token); } catch {}
    }
    try { localStorage.setItem('isAdmin', data.isAdmin ? '1' : '0'); } catch {}
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(KEY_SESSION);
    try { localStorage.removeItem(KEY_TOKEN); } catch {}
    try { localStorage.removeItem('isAdmin'); } catch {}
  };

  const value = useMemo<AuthCtx>(() => ({ user, token, login, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  // Hook de consumo para leer usuario y acciones. Requiere AuthProvider arriba.
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

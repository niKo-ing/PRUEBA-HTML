import { jsx as _jsx } from "react/jsx-runtime";
// Contexto de autenticación: guarda el usuario actual, expone login/logout
// y persiste la sesión en localStorage.
/**
 * @file Contexto de autenticación.
 * @description Gestiona el usuario actual, login/logout y persistencia.
 * @author Equipo Todobaratisimo
 * @date 2025-11-10
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
const AuthContext = createContext(null);
const KEY_SESSION = "sessionUser";
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    useEffect(() => {
        // Restaura sesión si existe en localStorage
        try {
            const raw = localStorage.getItem(KEY_SESSION);
            if (raw)
                setUser(JSON.parse(raw));
        }
        catch { }
    }, []);
    const login = async (email, password) => {
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
        const current = data.user;
        setUser(current);
        localStorage.setItem(KEY_SESSION, JSON.stringify(current));
        try {
            localStorage.setItem('isAdmin', data.isAdmin ? '1' : '0');
        }
        catch { }
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem(KEY_SESSION);
        try {
            localStorage.removeItem('isAdmin');
        }
        catch { }
    };
    const value = useMemo(() => ({ user, login, logout }), [user]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    // Hook de consumo para leer usuario y acciones. Requiere AuthProvider arriba.
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

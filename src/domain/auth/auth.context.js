import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
const AuthContext = createContext(null);
const KEY_SESSION = "sessionUser";
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY_SESSION);
            if (raw)
                setUser(JSON.parse(raw));
        }
        catch { }
    }, []);
    const login = async (email, password) => {
        // Simula la “BD” con usuarios guardados por tu registro (localStorage)
        const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
        // HTML-like: validación simple (igual que haría el form básico)
        const match = usuarios.find(u => u.email === email && u.password === password);
        if (!match) {
            throw new Error("Correo o contraseña incorrectos");
        }
        const current = { nombre: match.nombre, apellido: match.apellido, email: match.email };
        setUser(current);
        localStorage.setItem(KEY_SESSION, JSON.stringify(current));
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem(KEY_SESSION);
    };
    const value = useMemo(() => ({ user, login, logout }), [user]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

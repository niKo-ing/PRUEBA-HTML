import { jsx as _jsx } from "react/jsx-runtime";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@domain/auth/auth.context";
export default function RequireAdmin() {
    const { user } = useAuth();
    const isAdminStorage = (() => { try {
        return localStorage.getItem("isAdmin") === "1";
    }
    catch {
        return false;
    } })();
    const isAdminByEmail = !!user && /^(admin|root)@/i.test(user.email);
    const ok = isAdminStorage || isAdminByEmail;
    if (!ok)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(Outlet, {});
}

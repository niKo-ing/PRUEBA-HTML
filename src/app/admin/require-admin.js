import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from "react-router-dom";
function isAdmin() {
    try {
        return localStorage.getItem("isAdmin") === "1";
    }
    catch {
        return false;
    }
}
export default function RequireAdmin() {
    const loc = useLocation();
    if (!isAdmin()) {
        return _jsx(Navigate, { to: "/", replace: true, state: { from: loc } });
    }
    return _jsx(Outlet, {});
}

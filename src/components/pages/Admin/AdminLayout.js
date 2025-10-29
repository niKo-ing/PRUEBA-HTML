import { jsx as _jsx } from "react/jsx-runtime";
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

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Header from "@organisms/Header/Header";
import Footer from "@organisms/Footer/Footer";
import { CartUIProvider, useCartUI } from "@app"; // ⬅️ desde @app/index
import { lazy, Suspense, useState } from "react";
import ChatAssistant from "@organisms/ChatAssistant/ChatAssistant";
const CartDrawer = lazy(() => import("@organisms/CartDrawer/CartDrawer"));
function CartDrawerHost() {
    // Lee el estado del drawer y expone el componente real del carrito
    const { isOpen, close } = useCartUI();
    return (_jsx(Suspense, { fallback: null, children: _jsx(CartDrawer, { show: isOpen, onHide: close }) }));
}
/**
 * Renderiza layout principal con provider y secciones base
 * @param {{ children: ReactNode }} props - Contenido de la página
 * @returns {JSX.Element} Layout con Header/Footer y Drawer
 */
export default function MainLayout({ children }) {
    const [assistantOpen, setAssistantOpen] = useState(false);
    return (_jsxs(CartUIProvider, { children: [_jsx(Header, {}), _jsx("main", { children: children }), _jsx(Footer, {}), _jsx(CartDrawerHost, {}), _jsx("button", { className: "chat-fab", "aria-label": "Abrir asistente", onClick: () => setAssistantOpen(true), children: _jsx("i", { className: "bi bi-chat-dots" }) }), _jsx(ChatAssistant, { open: assistantOpen, onClose: () => setAssistantOpen(false) })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Header from "@organisms/Header/Header";
import Footer from "@organisms/Footer/Footer";
import { CartUIProvider, useCartUI } from "@app"; // ⬅️ desde @app/index
import CartDrawer from "@organisms/CartDrawer/CartDrawer";
function CartDrawerHost() {
    // Lee el estado del drawer y expone el componente real del carrito
    const { isOpen, close } = useCartUI();
    return _jsx(CartDrawer, { show: isOpen, onHide: close });
}
export default function MainLayout({ children }) {
    return (_jsxs(CartUIProvider, { children: [_jsx(Header, {}), _jsx("main", { children: children }), _jsx(Footer, {}), _jsx(CartDrawerHost, {})] }));
}

import { jsx as _jsx } from "react/jsx-runtime";
import AppRouter from "./app/router";
import { CartProvider } from "./domain/cart/cart.context";
export default function App() {
    return (_jsx(CartProvider, { children: _jsx(AppRouter, {}) }));
}

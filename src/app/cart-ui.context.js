import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from "react";
const CartUIContext = createContext(undefined);
export function CartUIProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(v => !v), []);
    return (_jsx(CartUIContext.Provider, { value: { isOpen, open, close, toggle }, children: children }));
}
export function useCartUI() {
    const ctx = useContext(CartUIContext);
    if (!ctx)
        throw new Error("useCartUI must be used within CartUIProvider");
    return ctx;
}

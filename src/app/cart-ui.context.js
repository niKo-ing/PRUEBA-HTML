import { jsx as _jsx } from "react/jsx-runtime";
// Contexto de UI del carrito: controla la apertura/cierre del panel lateral.
// Úsalo para mostrar/ocultar el Drawer del carrito desde cualquier componente.
import { createContext, useContext, useState, useCallback } from "react";
// Creamos el contexto para compartir estado y acciones del panel
const CartUIContext = createContext(undefined);
// Proveedor: envuelve tu layout principal para habilitar el panel del carrito
export function CartUIProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(v => !v), []);
    return (_jsx(CartUIContext.Provider, { value: { isOpen, open, close, toggle }, children: children }));
}
// Hook: accede al estado del panel y acciones (open/close/toggle)
export function useCartUI() {
    const ctx = useContext(CartUIContext);
    if (!ctx)
        throw new Error("useCartUI must be used within CartUIProvider");
    return ctx;
}

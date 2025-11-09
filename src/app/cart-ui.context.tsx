// Contexto de UI del carrito: controla la apertura/cierre del panel lateral.
// Úsalo para mostrar/ocultar el Drawer del carrito desde cualquier componente.
import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

type CartUIContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

// Creamos el contexto para compartir estado y acciones del panel
const CartUIContext = createContext<CartUIContextType | undefined>(undefined);

// Proveedor: envuelve tu layout principal para habilitar el panel del carrito
export function CartUIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open   = useCallback(() => setIsOpen(true), []);
  const close  = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);
  return (
    <CartUIContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </CartUIContext.Provider>
  );
}

// Hook: accede al estado del panel y acciones (open/close/toggle)
export function useCartUI() {
  const ctx = useContext(CartUIContext);
  if (!ctx) throw new Error("useCartUI must be used within CartUIProvider");
  return ctx;
}

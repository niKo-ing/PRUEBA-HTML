// src/components/templates/MainLayout/MainLayout.tsx
// MainLayout define el armazón común de la tienda (Header, Footer y Drawer).
// Provee el contexto de UI del carrito para abrir/cerrar el panel lateral.
import type { ReactNode } from "react";
import Header from "@organisms/Header/Header";
import Footer from "@organisms/Footer/Footer";
import { CartUIProvider, useCartUI } from "@app";          // ⬅️ desde @app/index
import CartDrawer from "@organisms/CartDrawer/CartDrawer";

function CartDrawerHost() {
  // Lee el estado del drawer y expone el componente real del carrito
  const { isOpen, close } = useCartUI();
  return <CartDrawer show={isOpen} onHide={close} />;
}

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <CartUIProvider>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawerHost />
    </CartUIProvider>
  );
}

// src/components/templates/MainLayout/MainLayout.tsx
import type { ReactNode } from "react";
import Header from "@organisms/Header/Header";
import Footer from "@organisms/Footer/Footer";
import { CartUIProvider, useCartUI } from "@app";          // ⬅️ desde @app/index
import CartDrawer from "@organisms/CartDrawer/CartDrawer";

function CartDrawerHost() {
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

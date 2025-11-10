/**
 * Nombre del template: MainLayout
 * Propósito: Proveer el armazón principal de la aplicación pública,
 *            incluyendo Header, Footer y el Drawer del carrito con su contexto.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - children: ReactNode — Contenido de la página a renderizar dentro de <main>.
 *
 * Componentes/Dependencias:
 * - Header (@organisms/Header/Header)
 * - Footer (@organisms/Footer/Footer)
 * - CartDrawer (@organisms/CartDrawer/CartDrawer)
 * - CartUIProvider/useCartUI (@app) — contexto de UI para controlar apertura/cierre del Drawer.
 *
 * Hooks utilizados:
 * - useCartUI (dentro de CartDrawerHost): obtiene { isOpen, close } para controlar el Drawer.
 *
 * Ejemplo de uso:
 * ```tsx
 * <MainLayout>
 *   <Outlet />
 * </MainLayout>
 * ```
 */
import type { ReactNode } from "react";
import Header from "@organisms/Header/Header";
import Footer from "@organisms/Footer/Footer";
import { CartUIProvider, useCartUI } from "@app";          // ⬅️ desde @app/index
import { lazy, Suspense } from "react";

const CartDrawer = lazy(() => import("@organisms/CartDrawer/CartDrawer"));

function CartDrawerHost() {
  // Lee el estado del drawer y expone el componente real del carrito
  const { isOpen, close } = useCartUI();
  return (
    <Suspense fallback={null}>
      <CartDrawer show={isOpen} onHide={close} />
    </Suspense>
  );
}

/**
 * Renderiza layout principal con provider y secciones base
 * @param {{ children: ReactNode }} props - Contenido de la página
 * @returns {JSX.Element} Layout con Header/Footer y Drawer
 */
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

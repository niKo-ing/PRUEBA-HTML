import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import MainLayout from "@templates/MainLayout/MainLayout";
import ErrorBoundary from "./error-boundary";

const HomePage     = lazy(() => import("@pages/Home/HomePage"));
const ProductPage  = lazy(() => import("@pages/Product/ProductPage"));
const ProductsPage = lazy(() => import("@pages/Product/ProductsPage"));
const AboutPage    = lazy(() => import("@pages/About/AboutPage"));
const CartPage     = lazy(() => import("@pages/Cart/CartPage"));     

function RootLayout() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="py-5 text-center">Cargando…</div>}>
        <Outlet />
      </Suspense>
    </MainLayout>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "productos", element: <ProductsPage /> },
      { path: "producto/:slug", element: <ProductPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "carrito", element: <CartPage /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
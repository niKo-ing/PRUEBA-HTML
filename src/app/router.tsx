import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import MainLayout from "@templates/MainLayout/MainLayout";
import { ErrorBoundary } from "./error-boundary";

const HomePage = lazy(() => import("@pages/Home/HomePage"));
const ProductPage = lazy(() => import("@pages/Product/ProductPage"));
const AboutPage = lazy(() => import("@pages/About/AboutPage"));

function RootLayout() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="py-5 text-center">Cargando…</div>}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Suspense>
    </MainLayout>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "producto/:slug", element: <ProductPage /> },
      { path: "about", element: <AboutPage /> }
    ]
  }
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
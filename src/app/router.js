import { jsx as _jsx } from "react/jsx-runtime";
import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import MainLayout from "@templates/MainLayout/MainLayout";
import ErrorBoundary from "./error-boundary";
const HomePage = lazy(() => import("@pages/Home/HomePage"));
const ProductPage = lazy(() => import("@pages/Product/ProductPage"));
const ProductsPage = lazy(() => import("@pages/Product/ProductsPage"));
const AboutPage = lazy(() => import("@pages/About/AboutPage"));
const CartPage = lazy(() => import("@pages/Cart/CartPage"));
function RootLayout() {
    return (_jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx("div", { className: "py-5 text-center", children: "Cargando\u2026" }), children: _jsx(Outlet, {}) }) }));
}
const router = createBrowserRouter([
    {
        path: "/",
        element: _jsx(RootLayout, {}),
        errorElement: _jsx(ErrorBoundary, {}),
        children: [
            { index: true, element: _jsx(HomePage, {}) },
            { path: "productos", element: _jsx(ProductsPage, {}) },
            { path: "producto/:slug", element: _jsx(ProductPage, {}) },
            { path: "about", element: _jsx(AboutPage, {}) },
            { path: "carrito", element: _jsx(CartPage, {}) },
        ],
    },
]);
export default function AppRouter() {
    return _jsx(RouterProvider, { router: router });
}

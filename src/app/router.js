import { jsx as _jsx } from "react/jsx-runtime";
import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import MainLayout from "@templates/MainLayout/MainLayout";
import ErrorBoundary from "./error-boundary";
import RequireAdmin from "@app/admin/require-admin";
import AdminShell from "@templates/AdminLayout/AdminLayout";
const HomePage = lazy(() => import("@pages/Home/HomePage"));
const ProductPage = lazy(() => import("@pages/Product/ProductPage"));
const ProductsPage = lazy(() => import("@pages/Product/ProductsPage"));
const AboutPage = lazy(() => import("@pages/About/AboutPage"));
const CartPage = lazy(() => import("@pages/Cart/CartPage"));
const LoginPage = lazy(() => import("@pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("@pages/Auth/RegisterPage"));
const BlogsPage = lazy(() => import("@pages/Blog/BlogsPage"));
const BlogPostPage = lazy(() => import("@pages/Blog/BlogPostPage"));
const ContactPage = lazy(() => import("@pages/Contact/ContactPage"));
const AdminDashboard = lazy(() => import("@pages/Admin/AdminDashboard"));
const AdminProducts = lazy(() => import("@pages/Admin/AdminProducts"));
const AdminUsers = lazy(() => import("@pages/Admin/AdminUsers"));
const AdminOrders = lazy(() => import("@pages/Admin/AdminOrders"));
const AdminSettings = lazy(() => import("@pages/Admin/AdminSettings"));
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
            { path: "blogs", element: _jsx(BlogsPage, {}) },
            { path: "blog/:slug", element: _jsx(BlogPostPage, {}) },
            { path: "carrito", element: _jsx(CartPage, {}) },
            { path: "contacto", element: _jsx(ContactPage, {}) },
            { path: "login", element: _jsx(LoginPage, {}) },
            { path: "registro", element: _jsx(RegisterPage, {}) },
        ],
    },
    {
        path: "/admin",
        element: _jsx(RequireAdmin, {}),
        children: [
            {
                element: _jsx(AdminShell, {}),
                children: [
                    { index: true, element: _jsx(AdminDashboard, {}) },
                    { path: "products", element: _jsx(AdminProducts, {}) },
                    { path: "users", element: _jsx(AdminUsers, {}) },
                    { path: "orders", element: _jsx(AdminOrders, {}) },
                    { path: "settings", element: _jsx(AdminSettings, {}) },
                ],
            },
        ],
    },
]);
export default function AppRouter() {
    return _jsx(RouterProvider, { router: router });
}

import { jsx as _jsx } from "react/jsx-runtime";
// Enrutador principal: define rutas públicas y admin con carga diferida (lazy).
// Usa un layout raíz con Header/Footer y un ErrorBoundary para fallos.
import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import MainLayout from "@templates/MainLayout/MainLayout";
import ErrorBoundary from "./error-boundary";
import RequireAdmin from "@app/admin/require-admin";
import AdminShell from "@templates/AdminLayout";
import { ADMIN_SEGMENTS } from "@templates/AdminLayout";
const CategoriesPage = lazy(() => import("@pages/Categories/CategoriesPage"));
import HomePage from "@pages/Home/HomePage";
const ProductPage = lazy(() => import("@pages/Product/ProductPage"));
const ProductsPage = lazy(() => import("@pages/Product/ProductsPage"));
const AboutPage = lazy(() => import("@pages/About/AboutPage"));
const CartPage = lazy(() => import("@pages/Cart/CartPage"));
const LoginPage = lazy(() => import("@pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("@pages/Auth/RegisterPage"));
const BlogsPage = lazy(() => import("@pages/Blog/BlogsPage"));
const BlogPostPage = lazy(() => import("@pages/Blog/BlogPostPage"));
const ContactPage = lazy(() => import("@pages/Contact/ContactPage"));
const CheckoutPage = lazy(() => import("@pages/Checkout/CheckoutPage"));
const SuccessPage = lazy(() => import("@pages/Success/SuccessPage"));
const ErrorPage = lazy(() => import("@pages/Error/ErrorPage"));
const OffersPage = lazy(() => import("@pages/Offers/OffersPage"));
const AssistantPage = lazy(() => import("@pages/Assistant/AssistantPage"));
const AdminDashboard = lazy(() => import("@pages/Admin/AdminDashboard"));
const AdminProducts = lazy(() => import("@pages/Admin/AdminProducts"));
const AdminUsers = lazy(() => import("@pages/Admin/AdminUsers"));
const AdminOrders = lazy(() => import("@pages/Admin/AdminOrders"));
const AdminSettings = lazy(() => import("@pages/Admin/AdminSettings"));
const AdminReports = lazy(() => import("@pages/Admin/AdminReports"));
const AdminReceipt = lazy(() => import("@pages/Admin/AdminReceipt"));
// RootLayout define el marco común (header, footer, etc.) para rutas públicas
function RootLayout() {
    return (_jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx("div", { className: "py-5 text-center", children: "Cargando\u2026" }), children: _jsx(Outlet, {}) }) }));
}
// Definición de todas las rutas de la aplicación.
// Usamos lazy() para que cada página se cargue bajo demanda (mejor rendimiento).
const router = createBrowserRouter([
    {
        path: "/",
        element: _jsx(RootLayout, {}),
        errorElement: _jsx(ErrorBoundary, {}),
        children: [
            { index: true, element: _jsx(HomePage, {}) },
            { path: "productos", element: _jsx(ProductsPage, {}) },
            { path: "producto/:slug", element: _jsx(ProductPage, {}) },
            { path: "categorias", element: _jsx(CategoriesPage, {}) },
            { path: "about", element: _jsx(AboutPage, {}) },
            { path: "blogs", element: _jsx(BlogsPage, {}) },
            { path: "blog/:slug", element: _jsx(BlogPostPage, {}) },
            { path: "carrito", element: _jsx(CartPage, {}) }, // Página dedicada del carrito
            { path: "checkout", element: _jsx(CheckoutPage, {}) },
            { path: "compra-exitosa", element: _jsx(SuccessPage, {}) },
            { path: "error-compra", element: _jsx(ErrorPage, {}) },
            { path: "ofertas", element: _jsx(OffersPage, {}) },
            { path: "contacto", element: _jsx(ContactPage, {}) },
            { path: "asistente", element: _jsx(AssistantPage, {}) },
            { path: "login", element: _jsx(LoginPage, {}) },
            { path: "registro", element: _jsx(RegisterPage, {}) },
        ],
    },
    {
        path: "/admin",
        element: _jsx(RequireAdmin, {}), // Protege las rutas administrativas
        children: [
            {
                element: _jsx(AdminShell, {}), // Layout para las pantallas de admin
                children: [
                    { index: true, element: _jsx(AdminDashboard, {}) },
                    { path: ADMIN_SEGMENTS.products, element: _jsx(AdminProducts, {}) },
                    { path: ADMIN_SEGMENTS.users, element: _jsx(AdminUsers, {}) },
                    { path: ADMIN_SEGMENTS.orders, element: _jsx(AdminOrders, {}) },
                    { path: ADMIN_SEGMENTS.reports, element: _jsx(AdminReports, {}) },
                    { path: ADMIN_SEGMENTS.receipt, element: _jsx(AdminReceipt, {}) }, // Boleta imprimible
                    { path: ADMIN_SEGMENTS.settings, element: _jsx(AdminSettings, {}) },
                ],
            },
        ],
    },
]);
export default function AppRouter() {
    return _jsx(RouterProvider, { router: router });
}

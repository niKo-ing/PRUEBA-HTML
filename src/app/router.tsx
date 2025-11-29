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
import HomePage     from "@pages/Home/HomePage";
const ProductPage  = lazy(() => import("@pages/Product/ProductPage"));
const ProductsPage = lazy(() => import("@pages/Product/ProductsPage"));
const AboutPage    = lazy(() => import("@pages/About/AboutPage"));
const CartPage     = lazy(() => import("@pages/Cart/CartPage"));     
const LoginPage    = lazy(() => import("@pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("@pages/Auth/RegisterPage"));
const BlogsPage    = lazy(() => import("@pages/Blog/BlogsPage"));
const BlogPostPage = lazy(() => import("@pages/Blog/BlogPostPage"));
const ContactPage  = lazy(() => import("@pages/Contact/ContactPage"));
const CheckoutPage = lazy(() => import("@pages/Checkout/CheckoutPage"));
const SuccessPage  = lazy(() => import("@pages/Success/SuccessPage"));
const ErrorPage    = lazy(() => import("@pages/Error/ErrorPage"));
const OffersPage   = lazy(() => import("@pages/Offers/OffersPage"));
const AssistantPage = lazy(() => import("@pages/Assistant/AssistantPage"));
const AdminDashboard = lazy(() => import("@pages/Admin/AdminDashboard"));
const AdminProducts  = lazy(() => import("@pages/Admin/AdminProducts"));
const AdminUsers     = lazy(() => import("@pages/Admin/AdminUsers"));
const AdminOrders    = lazy(() => import("@pages/Admin/AdminOrders"));
const AdminSettings  = lazy(() => import("@pages/Admin/AdminSettings"));
const AdminCategories = lazy(() => import("@pages/Admin/AdminCategories"));
const AdminReports = lazy(() => import("@pages/Admin/AdminReports"));
const AdminReceipt = lazy(() => import("@pages/Admin/AdminReceipt"));

// RootLayout define el marco común (header, footer, etc.) para rutas públicas
function RootLayout() {
  return (
    <MainLayout>
      {/* Suspense muestra “Cargando…” mientras se cargan las páginas con lazy */}
      <Suspense fallback={<div className="py-5 text-center">Cargando…</div>}>
        <Outlet />
      </Suspense>
    </MainLayout>
  );
}

// Definición de todas las rutas de la aplicación.
// Usamos lazy() para que cada página se cargue bajo demanda (mejor rendimiento).
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "productos", element: <ProductsPage /> },
      { path: "producto/:slug", element: <ProductPage /> },
      { path: "categorias", element: <CategoriesPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "blogs", element: <BlogsPage /> },
      { path: "blog/:slug", element: <BlogPostPage /> },
      { path: "carrito", element: <CartPage /> }, // Página dedicada del carrito
      { path: "checkout", element: <CheckoutPage /> },
      { path: "compra-exitosa", element: <SuccessPage /> },
      { path: "error-compra", element: <ErrorPage /> },
      { path: "ofertas", element: <OffersPage /> },
      { path: "contacto", element: <ContactPage /> },
      { path: "asistente", element: <AssistantPage /> },
      { path: "login", element: <LoginPage /> },          
      { path: "registro", element: <RegisterPage /> },
    ],
  },
  {
    path: "/admin",
    element: <RequireAdmin />, // Protege las rutas administrativas
    children: [
      {
        element: <AdminShell />, // Layout para las pantallas de admin
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: ADMIN_SEGMENTS.products, element: <AdminProducts /> },
          { path: ADMIN_SEGMENTS.categories, element: <AdminCategories /> },
          { path: ADMIN_SEGMENTS.users, element: <AdminUsers /> },
          { path: ADMIN_SEGMENTS.orders, element: <AdminOrders /> },
          { path: ADMIN_SEGMENTS.reports, element: <AdminReports /> },
          { path: ADMIN_SEGMENTS.receipt, element: <AdminReceipt /> }, // Boleta imprimible
          { path: ADMIN_SEGMENTS.settings, element: <AdminSettings /> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

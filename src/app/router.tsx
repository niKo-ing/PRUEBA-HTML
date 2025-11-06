import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import MainLayout from "@templates/MainLayout/MainLayout";
import ErrorBoundary from "./error-boundary";
import RequireAdmin from "@app/admin/require-admin";
import AdminShell from "@templates/AdminLayout/AdminLayout";

const HomePage     = lazy(() => import("@pages/Home/HomePage"));
const ProductPage  = lazy(() => import("@pages/Product/ProductPage"));
const ProductsPage = lazy(() => import("@pages/Product/ProductsPage"));
const AboutPage    = lazy(() => import("@pages/About/AboutPage"));
const CartPage     = lazy(() => import("@pages/Cart/CartPage"));     
const LoginPage    = lazy(() => import("@pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("@pages/Auth/RegisterPage"));
const BlogsPage    = lazy(() => import("@pages/Blog/BlogsPage"));
const BlogPostPage = lazy(() => import("@pages/Blog/BlogPostPage"));
const ContactPage  = lazy(() => import("@pages/Contact/ContactPage"));
const AdminDashboard = lazy(() => import("@pages/Admin/AdminDashboard"));
const AdminProducts  = lazy(() => import("@pages/Admin/AdminProducts"));
const AdminUsers     = lazy(() => import("@pages/Admin/AdminUsers"));
const AdminOrders    = lazy(() => import("@pages/Admin/AdminOrders"));
const AdminSettings  = lazy(() => import("@pages/Admin/AdminSettings"));

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
      { path: "blogs", element: <BlogsPage /> },
      { path: "blog/:slug", element: <BlogPostPage /> },
      { path: "carrito", element: <CartPage /> },
      { path: "contacto", element: <ContactPage /> },
      { path: "login", element: <LoginPage /> },          
      { path: "registro", element: <RegisterPage /> },
    ],
  },
  {
    path: "/admin",
    element: <RequireAdmin />,
    children: [
      {
        element: <AdminShell />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "products", element: <AdminProducts /> },
          { path: "users", element: <AdminUsers /> },
          { path: "orders", element: <AdminOrders /> },
          { path: "settings", element: <AdminSettings /> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

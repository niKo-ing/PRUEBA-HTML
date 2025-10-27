import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "../components/pages/Home/HomePage";
import ProductPage from "../components/pages/Product/ProductPage";
import AboutPage from "../components/pages/About/AboutPage";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/producto/:slug", element: <ProductPage /> }, // 👈 ruta SEO-friendly
  { path: "/about", element: <AboutPage /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

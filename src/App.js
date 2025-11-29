import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Raíz de la aplicación.
 *
 * Propósito
 * - Envuelve el router con `CartProvider` para exponer estado y acciones del carrito a todas las páginas.
 * - Mantiene separación de preocupaciones: proveedores en la raíz, rutas en `src/app/router.tsx`.
 *
 * Uso
 * - Renderizado desde `src/main.tsx` dentro de `AuthProvider` y `StrictMode`.
 */
// Raíz de la aplicación: envuelve el router con el proveedor de carrito
// para que cualquier página pueda leer/actualizar el estado del carrito.
import AppRouter from "./app/router";
import { CartProvider } from "./domain/cart/cart.context";
export default function App() {
    return (_jsx(CartProvider, { children: _jsx(AppRouter, {}) }));
}

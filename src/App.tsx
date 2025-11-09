// Raíz de la aplicación: envuelve el router con el proveedor de carrito
// para que cualquier página pueda leer/actualizar el estado del carrito.
import AppRouter from "./app/router";
import { CartProvider } from "./domain/cart/cart.context";

export default function App() {
  return (
    <CartProvider>
      <AppRouter />
    </CartProvider>
  );
}
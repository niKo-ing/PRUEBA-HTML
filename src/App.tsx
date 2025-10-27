import AppRouter from "./app/router";
import { CartProvider } from "./domain/cart/cart.context";

export default function App() {
  return (
    <CartProvider>
      <AppRouter />
    </CartProvider>
  );
}
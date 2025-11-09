// Archivo “barrel” (índice) para re-exportar utilidades del módulo app.
// Importa desde aquí en otras partes de la app para una ruta más limpia.
export { CartUIProvider, useCartUI } from "./cart-ui.context"; // Contexto/Hook para el panel de carrito
export { hidePreloader } from "./preloader"; // Utilidad para ocultar el preloader al inicializar
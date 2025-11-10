// Utilidad para ocultar y eliminar el preloader en aplicaciones simples.
// Llama a `hidePreloader()` cuando tu aplicación esté lista para usarse.
// Notas:
// - Añade la clase 'hidden' para activar una transición/animación CSS.
// - Tras 500ms remueve el nodo del DOM para liberar memoria.
export function hidePreloader() {
    // Busca el nodo del preloader; si no existe, sal sin romper nada
    const el = document.getElementById("preloader");
    if (!el)
        return;
    // Oculta con una clase para permitir una transición suave
    el.classList.add("hidden");
    // Opcional: remueve el elemento después de un pequeño delay
    setTimeout(() => el.remove(), 500);
}

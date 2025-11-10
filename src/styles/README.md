# Styles

Propósito
- Sistema de diseño: tokens, componentes UI y layouts.

Contenido
- `globals.css`: tipografía base, colores, reglas globales.
- `app.css`: preloader, hero, navbar, galería de producto.
- `admin.css`: shell y sidebar para panel admin.

Relación con la arquitectura
- Consumido por componentes y templates; tokens `--tb-*` permiten theming.

Variables y guía
- `--tb-preloader-bg`: fondo del preloader (varía según `data-bs-theme`).
- Overrides de Bootstrap para botones (`--bs-btn-*`).

Buenas prácticas
- Centralizar tokens en `:root`; evitar hardcodear colores.
- Usar rutas `/assets/*` servidas por Vite desde `public/`.


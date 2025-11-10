# Páginas (`src/components/pages`)

Este directorio contiene las páginas de la aplicación (públicas y administrativas), organizadas por subcarpetas. Las rutas están definidas en `src/app/router.tsx` usando React Router con carga diferida (`lazy`).

## Rutas públicas

- `/` → `Home/HomePage.tsx`
- `/productos` → `Product/ProductsPage.tsx`
- `/producto/:slug` → `Product/ProductPage.tsx`
- `/categorias` → `Categories/CategoriesPage.tsx`
- `/about` → `About/AboutPage.tsx`
- `/blogs` → `Blog/BlogsPage.tsx`
- `/blog/:slug` → `Blog/BlogPostPage.tsx`
- `/carrito` → `Cart/CartPage.tsx`
- `/checkout` → `Checkout/CheckoutPage.tsx`
- `/compra-exitosa` → `Success/SuccessPage.tsx`
- `/error-compra` → `Error/ErrorPage.tsx`
- `/ofertas` → `Offers/OffersPage.tsx`
- `/contacto` → `Contact/ContactPage.tsx`
- `/login` → `Auth/LoginPage.tsx`
- `/registro` → `Auth/RegisterPage.tsx`

## Rutas administrativas

Prefijo `/admin` protegido por `RequireAdmin` (`src/app/admin/require-admin.tsx`).

- `/admin` → `Admin/AdminDashboard.tsx`
- `/admin/products` → `Admin/AdminProducts.tsx`
- `/admin/categories` → `Admin/AdminCategories.tsx`
- `/admin/users` → `Admin/AdminUsers.tsx`
- `/admin/orders` → `Admin/AdminOrders.tsx`
- `/admin/reports` → `Admin/AdminReports.tsx`
- `/admin/receipt/:id` → `Admin/AdminReceipt.tsx`
- `/admin/settings` → `Admin/AdminSettings.tsx`

Layout de admin: `@templates/AdminLayout/AdminLayout` envuelve las rutas admin.

## Mapa de rutas (diagrama)

```mermaid
flowchart TB
  subgraph Publico [/Rutas Públicas/]
    A[/\// Home/] --> B[/productos/]
    B --> C[/producto/:slug/]
    A --> D[/categorias/]
    A --> E[/about/]
    A --> F[/blogs/]
    F --> G[/blog/:slug/]
    A --> H[/carrito/]
    A --> I[/checkout/]
    I --> J[/compra-exitosa/]
    I --> K[/error-compra/]
    A --> L[/ofertas/]
    A --> M[/contacto/]
    A --> N[/login/]
    A --> O[/registro/]
  end

  subgraph Admin [/Rutas Admin (protegidas)/]
    P[/admin/] --> Q[/admin/products/]
    P --> R[/admin/categories/]
    P --> S[/admin/users/]
    P --> T[/admin/orders/]
    P --> U[/admin/reports/]
    P --> V[/admin/receipt/:id/]
    P --> W[/admin/settings/]
  end
```

## Notas de compilación

- Los archivos `.js` en estas carpetas son artefactos compilados (Vite/TS) y no deben editarse manualmente. Usa los `.tsx` como fuente.
- Muchas páginas incluyen encabezados JSDoc al inicio describiendo propósito, hooks y helpers.

## Estilos

- Estilos principales: `src/styles/*`
- Blog: `src/styles/blog.css` y `src/styles/blog-post.css`
- Admin: `src/styles/admin.css` (inyectado por `AdminLayout.tsx`)

## Convenciones

- Importar páginas con alias `@pages/...` desde `router.tsx`.
- Preferir utilidades comunes de `src/app` y `src/domain` para datos y tipos.

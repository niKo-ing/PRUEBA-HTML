# Protección de Rutas de Administración (Admin Guard)

1. Propósito y Alcance
- Objetivo: garantizar que solo usuarios con privilegios de administrador accedan a rutas bajo `ADMIN_ROOT` (por defecto `/admin`).
- Alcance: protección en cliente mediante un componente guard en el router; sincronizado con la configuración central de rutas y menú para minimizar discrepancias.
- No cubre: emisión/verificación de roles firmados por backend, ni revocación remota de sesión.

2. Requisitos Técnicos y Dependencias
- `React` y `react-router-dom` v7: para enrutar y renderizar elementos protegidos.
- Contexto de autenticación: `AuthProvider` y `useAuth` en `src/domain/auth/auth.context.tsx`.
- Políticas de rol admin: `isAdminUser(user)` y `isAdminByStorage()` en `src/domain/auth/is-admin.ts`.
- Configuración de rutas admin: `ADMIN_ROOT` y `ADMIN_SEGMENTS` en `src/components/templates/AdminLayout/menu.config.ts`.
- Router: consumo de segmentos centralizados en `src/app/router.tsx`.
- `localStorage`: utilizado como fallback controlado; debe estar disponible (no bloqueado por navegador/privacidad).

3. Arquitectura y Flujo
```
App (main.tsx)
  └─ <AuthProvider>
      └─ <CartProvider>
          └─ <AppRouter>
               └─ Ruta /admin/*
                    └─ element: <RequireAdmin>
                         ├─ lee user via useAuth()
                         ├─ if isAdminUser(user) → renderiza <Outlet/>
                         ├─ else if isAdminByStorage() → renderiza <Outlet/>
                         └─ else → <Navigate to="/" replace/>
```

- Fuente de verdad de rutas: `ADMIN_SEGMENTS` (p. ej., `dashboard`, `orders`, `products`, etc.) y `ADMIN_ROOT` se usan tanto por el layout (`AdminLayout`) como por el router.

4. Implementación Paso a Paso
1) Envuelve la aplicación con los providers en `src/main.tsx`:
```tsx
import { AuthProvider } from "@domain/auth/auth.context";
import { CartProvider } from "./App"; // o desde @domain/cart si corresponde

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
```

2) Centraliza rutas admin en `menu.config.ts`:
```ts
export const ADMIN_ROOT = "/admin";
export const ADMIN_SEGMENTS = {
  dashboard: "dashboard",
  orders: "orders",
  products: "products",
  users: "users",
};
// adminMenu se deriva de estas constantes
```

3) Consume los segmentos en el router (`src/app/router.tsx`):
```tsx
import { ADMIN_SEGMENTS, ADMIN_ROOT } from "@templates/AdminLayout/menu.config";

<Route path={ADMIN_ROOT} element={<AdminLayout />}>
  <Route index element={<DashboardPage />} />
  <Route path={ADMIN_SEGMENTS.orders} element={<OrdersPage />} />
  {/* ... */}
</Route>
```

4) Implementa el guard `RequireAdmin` (`src/app/admin/require-admin.tsx`):
```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@domain/auth/auth.context";
import { isAdminUser, isAdminByStorage } from "@domain/auth/is-admin";

export default function RequireAdmin() {
  let user = null;
  try { user = useAuth().user; } catch {}

  const allowed = isAdminUser(user) || isAdminByStorage();
  return allowed ? <Outlet /> : <Navigate to="/" replace />;
}
```

5) Inserta el guard en el árbol de rutas admin:
```tsx
<Route path={ADMIN_ROOT} element={<RequireAdmin />}>
  {/* rutas admin anidadas */}
</Route>
```

5. Consideraciones de Seguridad y Mejores Prácticas
- No confiar únicamente en `localStorage`: es manipulable. Úsalo solo como compatibilidad/demo.
- Preferir política basada en claims del usuario (`user.roles` o `user.permissions`) emitidos por backend.
- Evitar lógica frágil como prefijos de email; considerar listas de roles y una función `isAdmin(user)` configurable.
- Minimizar fuga de superficie admin: ocultar enlaces/páginas admin a usuarios no autorizados además de bloquear el acceso.
- Manejar sesión y revocación: cerrar sesión de forma global y limpiar cualquier marcador de admin.
- SSR/Prerender: proteger el acceso también desde el servidor si se renderiza en server.

6. Ejemplos de Uso y Casos de Prueba
- Habilitar acceso admin en demo:
```js
// En consola del navegador (solo demo):
localStorage.setItem('isAdmin','1');
// Navega a /admin
```

- Pruebas unitarias (sugeridas):
```ts
import { isAdminUser } from "@domain/auth/is-admin";
it("permite correos admin/root", () => {
  expect(isAdminUser({ email: "admin@duoc.cl", nombre: "Admin" })).toBe(true);
  expect(isAdminUser({ email: "root@example.com", nombre: "Root" })).toBe(true);
});
it("rechaza usuario null o sin prefijo", () => {
  expect(isAdminUser(null)).toBe(false);
  expect(isAdminUser({ email: "user@gmail.com", nombre: "User" })).toBe(false);
});
```

- Prueba de integración del guard (con MemoryRouter):
```tsx
// Renderiza <RequireAdmin/> con contextos mock y verifica Navigate o Outlet
```

7. Solución de Problemas
- "No puedo acceder a /admin": verifica `ADMIN_ROOT` y rutas en `router.tsx` consumiendo `ADMIN_SEGMENTS` correctamente.
- "Soy admin pero me redirige": confirma que `AuthProvider` está por encima de `AppRouter` y que `useAuth()` retorna usuario.
- "localStorage no disponible": algunos modos privados bloquean almacenamiento; prueba con la política `isAdminUser(user)`.
- "Menú no coincide con rutas": actualiza `ADMIN_SEGMENTS` en un solo lugar (`menu.config.ts`), el layout y router se derivan de ahí.
- "Logs de net::ERR_ABORTED": comunes en Vite/HMR; si el servidor cambió de puerto, recarga dura y revisa que recursos apunten al puerto actual.

8. Referencias
- `src/domain/auth/auth.context.tsx` — contexto de autenticación y sesión.
- `src/domain/auth/is-admin.ts` — políticas de admin.
- `src/components/templates/AdminLayout/menu.config.ts` — rutas/menu admin centralizadas.
- `src/app/router.tsx` — consumo de segmentos admin en router.
- `src/app/admin/require-admin.tsx` — guard de administración.


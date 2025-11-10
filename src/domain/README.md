# Domain

Propósito
- Modela el negocio (productos, carrito, usuarios) y define reglas y contratos.

Contenido
- `types.ts`: entidades `Product`, `CartItem`.
- `data.ts`: catálogo estático de `productos`.
- `auth/`: contexto de autenticación y políticas de admin.
- `cart/`: contexto y utilidades del carrito.
- `validations.ts`: esquemas de entrada (email, RUN, registro).

Relación con la arquitectura
- Consumido por `src/app` (router, layouts) y componentes.
- Servicios usan contratos del dominio para validar y operar.

Ejemplos
- `isAdminUser({ email:"admin@duoc.cl", nombre:"Admin" })` → `true`.
- `calculateCartTotal([{ id:1, price:39990, quantity:2 }])` → `79980`.


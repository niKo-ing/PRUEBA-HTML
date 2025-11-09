# Todobaratisimo

Proyecto web construido con React + TypeScript + Vite. Incluye una arquitectura modular de componentes, dominio con utilidades y servicios, y un entorno de pruebas unitarias con Jasmine + Karma en JSDOM, usando webpack y ts-loader para compilar TypeScript en el entorno de test.

## Requisitos e instalación
- Requisitos: Node.js 18+ y npm.
- Instalación: `npm install`.

## Stack y herramientas
- Frontend: `React 19`, `React Router`, `React Hook Form`, `Bootstrap`.
- Lenguaje: `TypeScript 5.9` (modo estricto y opciones avanzadas).
- Bundler: `Vite 7` para desarrollo y build de la aplicación.
- Linter y formato: `ESLint 9` + `typescript-eslint`, `Prettier`.
- Pruebas: `Jasmine` + `Karma` con `jsdom` (sin Chrome real), `karma-webpack`, `babel-loader`, `ts-loader`, `karma-coverage`.
- Utilidades: `puppeteer` (disponible), helpers de test ligeros para componentes.

## Scripts
- `npm run dev`: inicia servidor de desarrollo Vite.
- `npm run build`: compila TypeScript (`tsc -b`) y genera build de producción con Vite.
- `npm run preview`: sirve el build de producción para verificación.
- `npm run lint`: ejecuta ESLint sobre `src` con reglas de TS y React; aplica `--fix`.
- `npm test`: ejecuta Karma con la configuración por defecto (auto-watch activado en `karma.conf.js`).
- `npm run test:watch`: ejecuta Karma en modo observación (`--auto-watch --no-single-run`).
- `npm run test:coverage`: ejecuta Karma generando reporte de cobertura HTML bajo `coverage/`.
- `npm run test:jasmine`: ejecuta Jasmine directamente según `spec/support/jasmine.json`.
- `node run-tests.js`: verificación básica de existencia/estructura de archivos de pruebas.

## Arquitectura del proyecto
```
src/
  app/                Entrypoints y contexto de UI; router e inicialización
  components/         Componentes (atoms, molecules, organisms, pages, templates)
  domain/             Lógica de dominio: tipos, formato y validaciones
    cart/             Utilidades del carrito (TS y JS paralelos cuando aplica)
  services/           Servicios de negocio (p.ej. pago) en TS y JS
  styles/             Hojas de estilo
  tests/              Pruebas unitarias (servicios, utilidades, helpers; componentes excluidos en Karma)
  main.tsx            Entrypoint de la app en TS
```

### Alias de paths (TypeScript)
- Configurados en `tsconfig.json` bajo `baseUrl: "src"` y `paths`:
  - `@atoms/*`, `@molecules/*`, `@organisms/*`, `@templates/*`, `@pages/*`, `@domain/*`, `@app`, `@app/*`.
- Uso: `import X from '@domain/format'` o `import MainLayout from '@templates/MainLayout/MainLayout'`.

## Pruebas unitarias
- Framework: Jasmine.
- Runner: Karma con `jsdom` (evita depender de Chrome en CI).
- Compilación: webpack con `ts-loader` para TS y `babel-loader` para JS/JSX.
- Cobertura: `karma-coverage` genera HTML en `coverage/<browser>/`.

### Estructura y configuración
- `karma.conf.js`:
  - Framework `jasmine`.
  - Archivos de prueba: `src/tests/**/*.spec.ts` y `.spec.js`.
  - Excluye specs de componentes (`src/tests/components/**`) para evitar dependencias de Jest/RTL.
  - `client.jasmine.timeoutInterval` aumentado a `120000` para pruebas async prolongadas.
  - Reporters: `progress`, `spec`, `coverage`.
  - Navegador: `jsdom`.
- `spec/support/jasmine.json`:
  - `spec_dir`: `src/tests`.
  - `spec_files`: `**/*[sS]pec.ts` y `.js`.
  - `defaultTimeoutInterval`: `20000`.

### Ejecutar pruebas
- Completo: `npm test` o `npx karma start`.
- Modo single-run (CI): `npx karma start --single-run`.
- Observación: `npm run test:watch`.
- Cobertura: `npm run test:coverage` y abrir `coverage/webkit/index.html`.

### Helpers de test
- `src/tests/helpers/test-helpers.ts`: utilidades ligeras para `render`, `screen.getByText`, `screen.getByRole`.
- `src/tests/helpers/test-helpers.js`: mocks de `localStorage`, `fetch`, Router y `waitFor` simple.

## Servicio de pagos
- Archivo: `src/services/payment.service.ts` (versión TS; hay espejo JS para compatibilidad).
- `SimulatedPaymentGateway` con parámetros ajustados para pruebas deterministas:
  - `processingDelay`: 2000 ms.
  - Validación de `CVV`: exactamente 3 dígitos.
  - Fallo periódico determinista: cada 5º intento falla, el resto pasa (evita flakiness).
- Métodos alias tipados para validaciones: `validateCardNumber`, `validateExpiryDate`.

## Utilidades del carrito
- Archivo principal: `src/domain/cart/cart-utils.ts`.
- Funciones: `addItemToCart`, `updateCartItemQuantity`, `validateQuantity`, `validatePrice`, `serializeCart`, `deserializeCart`.
- Ajustes de tipos para `exactOptionalPropertyTypes` y `noUncheckedIndexedAccess`:
  - Evitar asignar `undefined` explícitamente a opcionales (`cantidad`/`quantity`).
  - Guardas al acceder por índice y actualización condicional de la propiedad existente.

## Configuración de TypeScript
- `tsconfig.json` (raíz):
  - `strict: true`, `noImplicitAny: true`.
  - `exactOptionalPropertyTypes: true`, `noUncheckedIndexedAccess: true`.
  - `moduleResolution: Bundler`, `verbatimModuleSyntax: true`.
  - `types`: incluye `google.maps`, `jasmine` para pruebas.
  - `exclude`: se excluyen carpetas de build y archivos de tests de la compilación de la app.
- `tsconfig.app.json`: configuración para la app (sin emitir), con `jsx: react-jsx`.
- `tsconfig.node.json`: configuración para entorno Node (p.ej. `vite.config.ts`).

## ESLint y Prettier
- `eslint.config.js` usa `@eslint/js` y `typescript-eslint` junto con `react-hooks` y `react-refresh`.
- Reglas recomendadas; se puede activar perfiles más estrictos (ver notas al final del archivo).
- Prettier configurado en `.prettierrc`.

## Desarrollo y build
- Desarrollo: `npm run dev` abre Vite en `http://localhost:5173/` con HMR.
- Build: `npm run build` genera `dist/` listo para producción.
- Preview: `npm run preview` sirve `dist/` para revisar despliegue.

## Convenciones de código
- Importar usando alias de `tsconfig.json` cuando estén disponibles.
- Mantener funciones puras en `domain/*` y separar lógica UI en `components/*`.
- Tests de servicios/utilidades bajo `src/tests/{services,utils}`; componentes se probarán con Jest/RTL si se habilitan más adelante.

## Variables de entorno
- `.env.production` disponible para configuración específica de producción.
- Para desarrollo, usar archivos `.env` siguiendo las convenciones de Vite si se añaden.

## Próximos pasos recomendados
- Rehabilitar pruebas de componentes con `Jest + React Testing Library` si se requiere cobertura UI.
- Añadir más validaciones de dominio según reglas de negocio.
- Integrar CI (GitHub Actions) para lint, build y `karma --single-run`.

## Estado actual de pruebas
- Última ejecución en modo `single-run`: `TOTAL: 106 SUCCESS`.

## FAQ
- ¿Por qué `jsdom` en Karma? Evita depender de Chrome/puppeteer en CI y agiliza el entorno.
- ¿Por qué fallos periódicos en el pago? Para garantizar que las pruebas cubren casos de éxito y error sin aleatoriedad.

## Detalles de Rutas
- Enrutador: `src/app/router.tsx` (hay build JS en `router.js`).
- Páginas disponibles: Home, Categorías, Producto, Productos, About, Cart, Auth (Login/Register), Blog (lista y detalle), Contact, Checkout, Success, Error, Offers, Admin.
- Carga diferida: se usan `lazy(...)` para `pages/*` y envoltura con `Suspense`.
- Layouts: `MainLayout` para usuarios y `AdminLayout` para la sección administrativa.
- Manejo de errores: `ErrorBoundary` captura errores de UI.

## Componentes y Diseño
- Organización por niveles: `atoms`, `molecules`, `organisms`, `pages`, `templates`.
- Estilos: `src/styles/*` con CSS organizado por ámbito.
- Convención: componentes presentacionales en `atoms/molecules/organisms`, páginas en `pages`, layouts en `templates`.

## Dominio y Tipos
- `src/domain/types.ts`: define tipos de entidades (p.ej. `CartLike`).
- `src/domain/format.ts` y `validations.ts`: formato y validaciones reutilizables.
- Reglas TS:
  - Evitar asignar `undefined` a propiedades opcionales.
  - Usar guardas al acceder por índice.
  - Mantener funciones puras en `domain/*`.

## Estrategia de Tests
- Enfoque actual: pruebas de servicios y utilidades con Jasmine/Karma.
- Componentes: excluidos en Karma; si se requieren, usar Jest + React Testing Library.
- Determinismo: el servicio de pagos fuerza un fallo cada 5 llamadas y usa retardo fijo.
- Timeouts: ajustados en `karma.conf.js` (`client.jasmine.timeoutInterval = 120000`) y `spec/support/jasmine.json` (`20000`).
- Importaciones de TS en tests JS: cuando sea necesario, importar con extensión `.ts` para evitar resolución ambigua bajo webpack.

## Cobertura y Calidad
- Ejecutar `npm run test:coverage` para generar reporte HTML en `coverage/<browser>/`.
- Lint: `npm run lint` corrige automáticamente muchos problemas.
- Estricto en TS: errores por `exactOptionalPropertyTypes` y `noUncheckedIndexedAccess` se tratan como prioritarios.

## Configuración Detallada
- Karma (`karma.conf.js`):
  - `frameworks: ['jasmine']`, `browsers: ['jsdom']`.
  - Preprocesadores: `webpack` + `sourcemap` sobre `src/tests/**/*.spec.{ts,js}`.
  - Reporters: `progress`, `spec`, `coverage`.
  - Excluye `src/tests/components/**`.
- Webpack (embebido en Karma):
  - `resolve.extensions`: `.ts`, `.tsx`, `.js`, `.jsx`.
  - `module.rules`: `ts-loader` para TS/TSX y `babel-loader` para JS/JSX.

## Guía de Contribución
- Flujo de trabajo:
  - Crear rama feature desde `main`.
  - Añadir tests para nuevas utilidades/servicios.
  - Ejecutar `lint`, `build` y `karma --single-run` antes de abrir PR.
- Estilo de commits: mensajes claros con contexto (feat, fix, test, docs).
- Revisiones: mantener cambios focalizados y con cobertura de pruebas.

## CI/CD (recomendado)
- Pipeline sugerido:
  - `setup-node` y `npm ci`.
  - `npm run lint`.
  - `npm run build`.
  - `npx karma start --single-run`.
  - Publicar cobertura (artifact de `coverage/`).

## Despliegue
- Build de producción: `npm run build` genera `dist/`.
- Previsualización: `npm run preview` sirve `dist/`.
- Variables: `.env.production` para configuración de producción; usar `import.meta.env` en Vite.

## Troubleshooting
- Importaciones en tests:
  - Error “Cannot find module …”: usar rutas relativas correctas y, si el archivo es TS consumido desde JS, importar con extensión `.ts` en el entorno de Karma/webpack.
- Timeouts de pruebas async:
  - Ajustados en `karma.conf.js` y `jasmine.json`; si aún hay timeouts, revisar bucles o promesas no resueltas.
- Diagnósticos del IDE:
  - Reiniciar servidor de TypeScript o borrar `tsconfig.tsbuildinfo` si los errores persisten tras cambios.
- JSDOM y componentes:
  - JSDOM no cubre interacciones complejas; usar Jest + React Testing Library para pruebas de UI.
- LocalStorage/Fetch:
  - Usar mocks en `src/tests/helpers/test-helpers.js`.

## Ejemplos de Uso
- Servicio de pago:
  - `processPayment` retorna éxito con `transactionId` en 4 de cada 5 llamadas y falla en la 5ª.
  - Validaciones: `validateCardNumber`, `validateExpiryDate`, `validateCVV` (3 dígitos).
- Carrito:
  - `addItemToCart` y `updateCartItemQuantity` actualizan la propiedad existente (`cantidad` o `quantity`).
  - `serializeCart` y `deserializeCart` convierten entre JSON y estructura segura.
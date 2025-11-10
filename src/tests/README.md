# Tests

Propósito
- Validar la lógica de negocio y servicios con pruebas unitarias confiables.
- Mantener ejemplos mínimos de componentes React bajo JSDOM.

Estrategia
- Unitarias de dominio: `validations`, `format`, `cart-utils`.
- Unitarias de servicios: `payment.service`.
- Ejemplos ligeros de componentes (sin RTL) para ilustrar render/props/eventos.
- Cobertura sugerida ≥ 80% para `domain` y `services`.

Herramientas
- `Karma` + `Jasmine` con `jsdom` y `webpack`.
- Reportes en `coverage/` (HTML).

Guías
- [Guía para Estudiantes](./GUIA_ESTUDIANTES.md): pasos prácticos para configurar entorno y ejecutar pruebas en Linux/EC2 usando la configuración real de este proyecto.

Qué pruebas se realizan
- Dominio
  - `src/tests/utils/cart-utils.spec.ts` y `.js`: cálculos de total/subtotal, conteo de ítems, adición/actualización/eliminación, validaciones y (de)serialización.
  - `src/domain/validations` y `src/domain/format`: se añaden pruebas cuando cambia la lógica (ver ejemplos en la guía).
- Servicios
  - `src/tests/services/payment.service.spec.ts` y `.js`: gateway simulado con retardo fijo, caso de éxito y fallo periódico, validaciones de CVV y número de tarjeta.
- Componentes (ejemplos con JSDOM)
  - `src/tests/examples/button.spec.tsx`: render de texto, recepción de props y evento `click` con `createRoot`.
- Nota: `src/tests/components/**` puede estar excluido en `karma.conf.js` para evitar depender de Jest/RTL. Si se necesita cobertura UI más rica, habilitar esa carpeta o usar Jest + RTL.

Ejecución
- `npm run test` — correr suite.
- `npm run test:watch` — observar cambios.
- `npm run test:coverage` — generar reporte de cobertura.
- `npm run test:ci` — ejecución única rápida (sin cobertura, reporter `spec`).
- `npm run test:coverage:ci` — ejecución única con cobertura y salida inmediata.

Casos cubiertos
- Carrito: cálculos, mutaciones puras, validaciones y persistencia segura.
- Pago: éxito/fallo determinista, validación de datos de tarjeta.
- Componentes: render básico, props y eventos (ejemplos).

Notas
- Navegador: se usa `jsdom` (no requiere Chrome).
- Cobertura: revisar `coverage/jsdom/index.html`.
- Alias en tests: el IDE puede marcar alias como desconocidos si `src/tests/**` está excluido en `tsconfig.json`. Usar rutas relativas o crear un `tsconfig.tests.json` que incluya la carpeta.


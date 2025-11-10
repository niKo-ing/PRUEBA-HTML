# Tests

Estrategia
- Unitarias: dominio (`validations`, `cart-utils`), servicios (`payment.service`).
- Integración ligera: componentes (requiere Jest/RTL para cobertura completa).
- Cobertura sugerida ≥ 80% para `domain` y `services`.

Herramientas
- `Karma` + `Jasmine` con `jsdom` y `webpack`.
- Reportes en `coverage/` (HTML).

Ejecución
- `npm run test` — correr suite.
- `npm run test:watch` — observar cambios.
- `npm run test:coverage` — generar reporte de cobertura.

Casos cubiertos
- Validación de tarjetas y fracaso periódico en gateway simulado.
- Cálculos de carrito y mutaciones puras.

Notas
- Los specs de componentes bajo `src/tests/components/**` están excluidos de Karma; se recomienda Jest + RTL.


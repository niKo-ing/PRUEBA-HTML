# Guía para Estudiantes

Objetivo
- Explicar cómo configurar y ejecutar pruebas unitarias en este proyecto usando Karma + Jasmine y JSDOM, con ejemplos prácticos y comandos listos para copiar.

Paso 1: Preparar Ubuntu EC2 (o cualquier Linux)
- Actualiza el sistema y herramientas básicas:
  - `sudo apt update && sudo apt upgrade -y`
  - `sudo apt install -y git build-essential curl`
- Nota sobre navegadores: este proyecto usa `karma-jsdom-launcher`, no requiere Chrome/Chromium en CI. Si prefieres ejecutar en Chrome localmente, instala `chromium-browser` y exporta `CHROME_BIN=$(which chromium-browser)`.

Paso 2: Instalar Node.js y npm
- Instala Node 18+ (recomendado 18 LTS):
  - `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
  - `sudo apt install -y nodejs`
  - Verifica: `node -v` y `npm -v`

Paso 3: Obtener y entrar al proyecto
- Clona y entra al repo:
  - `git clone <URL-del-repo> todobaratisimo`
  - `cd todobaratisimo`

Paso 4: Instalar dependencias
- Instala paquetes del proyecto:
  - `npm install`
- Si trabajas en CI, usa instalación limpia:
  - `npm ci`

Paso 5: Ejecutar pruebas
- Suite completa: `npm test`
- Observación continua: `npm run test:watch`
- Modo CI (una sola corrida): `npx karma start --single-run`

Paso 6: Cobertura de código
- Generar reporte: `npm run test:coverage`
- Ubicación del reporte HTML: `coverage/<browser>/index.html` (por defecto `coverage/jsdom/index.html`)
- Consejos: apunta a ≥ 80% en `domain` y `services`. La cobertura de UI suele ser menor si no se prueban componentes.

Paso 7: Estructura de pruebas en este proyecto
- Carpeta principal: `src/tests`
- Subcarpetas habituales:
  - `utils/` y `services/` para pruebas unitarias de lógica pura y servicios.
  - `helpers/` con utilidades de prueba (mocks de `localStorage`, funciones de consulta sencilla).
  - `components/` y `examples/` contienen ejemplos. Por defecto, `components/**` puede estar excluido para evitar depender de Jest/RTL, pero los ejemplos bajo `examples/` sí se ejecutan con JSDOM.
- Archivos incluidos por Karma: `src/tests/**/*.spec.ts` y `.spec.js`.

Paso 8: Tu primera prueba (ejemplo real de este repo)
- Crea `src/tests/utils/mi-ejemplo.spec.ts` con contenido minimal usando Jasmine:
```
import { calculateCartTotal } from '@domain/cart/cart-utils';

describe('mi ejemplo de carrito', () => {
  it('suma precios y cantidades', () => {
    const items = [
      { id: 1, price: 10, quantity: 2 },
      { id: 2, precio: 5, cantidad: 3 }
    ];
    expect(calculateCartTotal(items)).toBe(35);
  });
});
```
- Ejecuta `npm test` y verifica que pasa.

Paso 9: Prueba de componente React (opcional)
- Por defecto puedes usar los ejemplos de `src/tests/examples/**` que corren con JSDOM.
- Si quieres moverlas a `src/tests/components/**`, elimina las líneas de `exclude` para esa carpeta en `karma.conf.js`.
- Asegúrate de tener soporte para `.tsx` en `webpack.resolve.extensions` (ya está configurado).
- Ejemplo muy simple sin RTL (ya disponible como `src/tests/examples/button.spec.tsx`):
```
import React from 'react';
import { createRoot } from 'react-dom/client';
import Button from '@atoms/Button/Button';

describe('Button', () => {
  it('renderiza texto y reacciona a click', (done) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const handleClick = () => {
      expect(container.textContent).toContain('Comprar');
      done();
    };
    root.render(<Button onClick={handleClick}>Comprar</Button>);
    const btn = container.querySelector('button');
    btn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
});
```
- Si necesitas utilidades de consulta sencillas, usa `src/tests/helpers/test-helpers.ts`.

Paso 10: Babel y TypeScript
- Este proyecto ya está configurado para compilar TS/TSX con `ts-loader` y JS/JSX con `babel-loader` dentro de Karma.
- No necesitas crear `.babelrc` adicional; si lo agregas, usa:
```
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

Troubleshooting
- Error “Cannot find module …” en tests: usa alias definidos en `tsconfig.json` (`@domain/*`, `@atoms/*`, etc.) o rutas relativas correctas.
- Timeouts en async: este proyecto eleva `client.jasmine.timeoutInterval` a 120s; revisa promesas no resueltas.
- JSDOM y eventos: algunos comportamientos de UI complejos no se replican; para cobertura completa de componentes, considera Jest + React Testing Library.
- CI sin navegador: usa `npx karma start --single-run` con el launcher `jsdom`.

Referencias rápidas
- Ejecutar pruebas: `npm test`
- Modo observación: `npm run test:watch`
- Coverage: `npm run test:coverage`
- Abrir reporte: `coverage/jsdom/index.html`
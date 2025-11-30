# Sistema de Pruebas Unitarias

Este documento describe de forma detallada cómo están diseñadas, configuradas y ejecutadas las pruebas unitarias del proyecto, tanto para el frontend (React) como para el backend (FastAPI).

## 1. Introducción

- Propósito: validar el comportamiento de funciones y endpoints de manera aislada y repetible, detectar regresiones temprano y servir como documentación viva del sistema.
- Beneficios:
  - Acelera el desarrollo al proporcionar feedback inmediato.
  - Mejora el mantenimiento con confianza en cambios y refactorizaciones.
  - Facilita la integración continua (CI) y calidad consistente.
- Tecnologías utilizadas:
  - Frontend: `Karma` + `Jasmine` + `Webpack` (entorno `jsdom`).
  - Backend: `Pytest` (+ `pytest-asyncio`, `httpx`, `asgi-lifespan`, `pytest-cov`, `pytest-mock`).

## 2. Configuración

### Requisitos previos

- Node.js 20+ y npm 10+.
- Python 3.11+ (idealmente 3.12) con `venv`.

### Instalación de dependencias

- Frontend (desde la raíz del repo):

```bash
npm install
```

- Backend (desde `./backend`):

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
pip install pytest pytest-asyncio httpx asgi-lifespan pytest-cov pytest-mock
```

### Configuración inicial

- Frontend:
  - `karma.conf.js` ya incluye el entorno `jsdom`, alias de paths y compilación con `ts-loader`/`babel-loader`.
  - Scripts npm disponibles en `package.json` (`test`, `test:ci`, `test:watch`, `test:coverage`).
- Backend:
  - `backend/pytest.ini` configura `asyncio_mode`, opciones generales y (opcional) supresión de warnings.
  - Tests aislados del mundo externo: sin conexión real a DB ni Vertex AI por defecto.

## 3. Ejecución

### Comando unificado (todo el proyecto)

```bash
npm run test:all
```

- Ejecuta primero `pytest` en `backend/` y luego `karma` en modo CI para el frontend.

### Frontend

- Modo interactivo/watch:

```bash
npm test
npm run test:watch
```

- Modo CI y cobertura:

```bash
npm run test:ci
npm run test:coverage
```

### Backend

- Sin activar la venv explícitamente:

```bash
cd backend
.venv/bin/python -m pytest -q
```

- Con cobertura:

```bash
cd backend
.venv/bin/python -m pytest --cov=backend --cov-report=term-missing
```

### Interpretación de resultados

- Frontend (Karma): muestra número de specs ejecutados y estado SUCCESS/FAILED; cobertura se genera en `coverage/jsdom`.
- Backend (Pytest): muestra conteo de tests, fallos y resumen; con `pytest-cov` imprime porcentaje por archivo y líneas no cubiertas.

## 4. Estructura

- Frontend:
  - Raíz: `src/tests/`
  - Subcarpetas: `components/`, `services/`, `utils/`, `helpers/`, `examples/`, `setup/`.
  - Convención de nombres: `*.spec.ts` / `*.spec.js`.
- Backend:
  - Carpeta: `backend/tests/`
  - Archivos: `test_health.py`, `test_products.py`, `test_ai.py`, `test_users.py`, `conftest.py`.
  - Convención de nombres: `test_*.py`.

## 5. Alcance

- Frontend: pruebas de utilidades, servicios y algunos componentes; ejecutadas en `jsdom` (sin navegador real).
- Backend:
  - Health: endpoints de salud sin DB.
  - Products: listado con fallback y con DB simulada.
  - AI: `detect_intent`, `search_products` (fallback + filtros), `/api/ai/ask` con IA deshabilitada o sin Vertex.
  - Users: registro/login con colección en memoria y siembra de administrador bajo `lifespan`.
- Cobertura:
  - Objetivo recomendado: ≥ 80% por módulo crítico (no bloqueante).
  - Reporte Frontend: `coverage/jsdom`.
  - Reporte Backend: `pytest --cov`.
- Limitaciones conocidas:
  - No se ejercitan conexiones reales a MongoDB ni Vertex AI por defecto.
  - Algunas rutas secundarias pueden tener cobertura parcial.

## 6. Mejores Prácticas

- Escribir pruebas pequeñas, independientes y determinísticas.
- Usar fixtures/mocks para aislar dependencias externas (DB, red, servicios IA).
- Nombrar claramente `describe/it` (frontend) y funciones `test_*` (backend) indicando el comportamiento esperado.
- Cobertura útil: probar casos base, límites y errores; evitar pruebas frágiles dependientes de implementation details.
- Qué evitar:
  - Pruebas que requieren red/servicios reales sin necesidad.
  - Asunciones no verificadas sobre estado global compartido.
  - Acoplarse a detalles internos en vez de contratos públicos.

### Ejemplo Bien Formado (Backend, Pytest)

```python
import pytest
from backend.routers.ai import search_products
from backend import db as db_module

@pytest.mark.asyncio
async def test_search_products_filters_min_max_price_and_rgb():
    db_module.db_main = None
    slots = {"min_price": 30000, "max_price": 70000, "rgb": True}
    items = await search_products("teclado", limit=5, slots=slots)
    assert all(isinstance(i.get("precio"), int) and 30000 <= i["precio"] <= 70000 for i in items)
```

### Ejemplo Mal Formado (Backend)

```python
import pytest

def test_teclado():
    # Demasiado genérico, sin asserts útiles ni aislamiento
    assert True
```

### Ejemplo Bien Formado (Frontend, Jasmine)

```ts
describe('utils: formatPrice', () => {
  it('formatea números a CLP', () => {
    const value = 19990;
    const result = formatPrice(value);
    expect(result).toBe('$19.990');
  });
});
```

### Ejemplo Mal Formado (Frontend)

```ts
describe('algo', () => {
  it('pasa sin validar nada', () => {
    // sin expect, no valida comportamiento
  });
});
```

## 7. Mantenimiento

- Añadir nuevas pruebas:
  - Frontend: crear `*.spec.ts` bajo `src/tests/` respetando estructura y alias.
  - Backend: crear `test_nuevo_modulo.py` bajo `backend/tests/`, usar fixtures de `conftest.py` cuando aplique.
- Actualización de pruebas existentes:
  - Mantener contratos y evitar romper pruebas estables; ajustar mocks/fixtures si cambian dependencias.
- Integración con CI/CD:
  - Workflow recomendado: ejecutar `npm ci` (frontend) y preparar venv (backend), luego `npm run test:all`.
  - Publicar cobertura: subir `coverage/jsdom` y reporte de `pytest --cov` como artefactos.

---

### Referencias rápidas

- Ejecutar todo: `npm run test:all`
- Frontend interactivo: `npm test`
- Frontend CI: `npm run test:ci`
- Backend con cobertura: `cd backend && .venv/bin/python -m pytest --cov=backend --cov-report=term-missing`


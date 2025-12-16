# Documento de Cobertura de Testing

Este documento detalla la estrategia, herramientas y procedimientos para medir, analizar y asegurar la cobertura de pruebas (*code coverage*) en el proyecto **TodoBaratisimo**.

---

## 1. Visión General y Arquitectura de Calidad

El proyecto utiliza una estrategia de "Calidad en Capas" para asegurar la robustez tanto del Frontend como del Backend.

### Matriz de Herramientas

| Capa | Framework de Test | Herramienta de Cobertura | Reporte Generado | CI Gate |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** (React) | Karma + Jasmine | `karma-coverage` (Istanbul) | HTML (`coverage/jsdom/`) | ⚠️ Soft Gate |
| **Backend** (FastAPI) | Pytest | `pytest-cov` | Terminal + XML/HTML | ⚠️ Soft Gate |

---

## 2. Estrategia de Cobertura "Smart Coverage"

Nuestro objetivo no es el 100% de cobertura ciega (vanity metric), sino asegurar la **calidad en los caminos críticos**. Priorizamos el testeo de comportamiento sobre detalles de implementación.

### 2.1. Pirámide de Cobertura Frontend

Nos enfocamos en cubrir **≥ 80%** de los módulos agnósticos del framework:

1.  **Dominio (`src/domain/`)**: 🛡️ **Prioridad Alta**. Contiene la lógica pura de negocio (validaciones, cálculos de carrito). *Debe estar testeadas exhaustivamente.*
2.  **Servicios (`src/services/`)**: 🛡️ **Prioridad Alta**. Integraciones con APIs y adaptadores. Se deben mockear las respuestas de red.
3.  **Utilidades (`src/utils/`)**: 🔧 **Prioridad Media**. Helpers de formateo, fechas, etc.

> **Nota sobre Componentes UI**: Los componentes (`src/components/`) tienen una cobertura unitaria menor intencional. Validamos su funcionamiento mediante *Snapshot Testing* o pruebas E2E (Playwright/Cypress) en lugar de tests unitarios frágiles.

### 2.2. Pirámide de Cobertura Backend

1.  **Casos de Uso / Servicios**: Lógica de negocio independiente de HTTP.
2.  **Routers**: Validación de contratos (Input/Output) y códigos de estado HTTP.
3.  **Seguridad**: Flujos de autenticación (JWT) y autorización (Roles).

---

## 3. Ejecución y Generación de Reportes

### Frontend (Karma + Jasmine)

Ejecuta la suite en entorno `jsdom` (sin navegador gráfico) para velocidad en CI.

```bash
npm run test:coverage
```

*   **Ver reporte visual**: Abrir `coverage/jsdom/index.html` en un navegador.
*   **Métricas Clave**:
    *   **Statements**: Ejecución de sentencias.
    *   **Branches**: Cobertura de decisiones (`if`, `switch`, ternarios). *Es la métrica más importante para lógica compleja.*

### Backend (Pytest)

Ejecuta las pruebas con reporte en terminal y detección de líneas perdidas.

```bash
cd backend
. .venv/bin/activate
python -m pytest --cov=. --cov-report=term-missing
```

*   **Salida**: Tabla en terminal con % por archivo.
*   **Missing**: Números de línea exactos no ejecutados (ej. `25-28, 40`).

---

## 4. Quality Gates y Umbrales (Propuesta)

Para profesionalizar el flujo, se recomienda configurar umbrales mínimos que fallen el build si no se cumplen.

### Configuración sugerida para `karma.conf.js`

```javascript
coverageReporter: {
  check: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80
    }
  }
}
```

### Configuración sugerida para `pytest.ini`

```ini
[pytest]
addopts = --cov=. --cov-fail-under=80
```

---

## 5. Mejores Prácticas y Siguientes Pasos

### 5.1. Qué NO testear (Exclusiones)
Para mantener el ruido bajo, excluimos explícitamente:
*   Archivos de configuración (`vite.config.ts`, `karma.conf.js`).
*   Definiciones de tipos (`*.d.ts`).
*   Archivos de barril (`index.ts` que solo re-exportan).
*   Código de librerías de terceros.

### 5.2. Mutation Testing (Nivel Experto)
Una cobertura alta no garantiza ausencia de bugs. El siguiente nivel de madurez es implementar **Mutation Testing** (ej. Stryker para JS, mutmut para Python).
*   *Concepto*: La herramienta introduce errores adrede ("mutantes") en tu código. Si tus tests siguen pasando (verde), significa que tu test es débil. Si el test falla (mata al mutante), el test es robusto.

### 5.3. Integración con SonarQube / Codecov
En un entorno empresarial, estos reportes locales se envían a herramientas SAAS:
*   **Codecov**: Visualización de delta en Pull Requests (ej. "Este PR baja la cobertura un 2%").
*   **SonarQube**: Análisis estático + Cobertura + Deuda técnica.

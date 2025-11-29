import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Punto de entrada de la aplicación.
 *
 * Propósito
 * - Monta React en `#root` y registra estilos globales.
 * - Envuelve la app con `AuthProvider` para estado global de autenticación.
 * - Activa `StrictMode` para detectar efectos secundarios y patrones no seguros.
 * - Gestiona el preloader inicial ocultándolo tras el primer render estable.
 *
 * Dependencias clave
 * - `bootstrap`, `bootstrap-icons`, `globals.css`, `app.css`, `blog.css`.
 * - `@app/preloader` y `@domain/auth/auth.context`.
 */
// src/main.tsx
// Punto de entrada de la aplicación. Aquí montamos React dentro del elemento #root
// y cargamos estilos globales. También activamos el proveedor de autenticación
// para que el resto de componentes pueda conocer al usuario logueado.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/globals.css";
import "./styles/app.css";
import "./styles/blog.css";
import App from "./App";
import { hidePreloader } from "@app/preloader";
import { AuthProvider } from "@domain/auth/auth.context";
const container = document.getElementById("root");
// Si no existe el contenedor, detenemos la app con un error visible
if (!container)
    throw new Error(" No se encontró el elemento #root");
const root = createRoot(container);
root.render(_jsx(StrictMode, { children: _jsx(AuthProvider, { children: _jsx(App, {}) }) }));
// Ocultamos el preloader de la pantalla inicial una vez montada la app
setTimeout(() => hidePreloader(), 300);

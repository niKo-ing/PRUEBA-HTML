import { jsx as _jsx } from "react/jsx-runtime";
// src/main.tsx
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
if (!container)
    throw new Error(" No se encontró el elemento #root");
const root = createRoot(container);
root.render(_jsx(StrictMode, { children: _jsx(AuthProvider, { children: _jsx(App, {}) }) }));
setTimeout(() => hidePreloader(), 300);

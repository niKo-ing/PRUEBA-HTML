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


const container = document.getElementById("root");
if (!container) throw new Error(" No se encontró el elemento #root");

const root = createRoot(container);


root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

setTimeout(() => hidePreloader(), 300);
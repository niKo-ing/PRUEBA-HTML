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
if (!container) throw new Error(" No se encontró el elemento #root");

const root = createRoot(container);


root.render(
  <StrictMode>
    {/* AuthProvider entrega el contexto de usuario a toda la app */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

// Ocultamos el preloader de la pantalla inicial una vez montada la app
setTimeout(() => hidePreloader(), 300);
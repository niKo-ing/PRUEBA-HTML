import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/globals.css";
import "./styles/app.css";
import "./styles/blog.css";
import App from "./App";
import { hidePreloader } from "./app/preloader";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

hidePreloader();
window.addEventListener("load", hidePreloader, { once: true });

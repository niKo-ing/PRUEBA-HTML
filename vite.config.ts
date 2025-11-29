import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@atoms": path.resolve(__dirname, "src/components/atoms"),
      "@molecules": path.resolve(__dirname, "src/components/molecules"),
      "@organisms": path.resolve(__dirname, "src/components/organisms"),
      "@templates": path.resolve(__dirname, "src/components/templates"),
      "@pages": path.resolve(__dirname, "src/components/pages"),
      "@domain": path.resolve(__dirname, "src/domain"),
      "@app": path.resolve(__dirname, "src/app"),
      "@assets": path.resolve(__dirname, "src/assets"),
    },
  },
  server: {
    watch: {
      // Evita que Vite intente observar la venv de Python y otras carpetas pesadas
      ignored: [
        "**/.venv/**",
        "**/backend/.venv/**",
        "**/coverage/**",
      ],
    },
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});

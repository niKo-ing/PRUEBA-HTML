// src/app/gmaps-loader.ts
import type { Libraries } from "@react-google-maps/api";

// Librerías necesarias — "places" incluye Autocomplete y mapas base
export const GMAPS_LIBRARIES: Libraries = ["places"];

// Configuración única y reusable
export const GMAPS_LOADER_OPTIONS = {
  id: "gmaps-core", // 👈 usa un solo ID global, no lo cambies en ningún otro sitio
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  libraries: GMAPS_LIBRARIES as any, // evita conflicto de tipos Readonly
};

// Carga y configuración de Google Maps para el Autocomplete y mapas.
// Exporta opciones compartidas para inicializar el loader una sola vez.
// src/app/gmaps-loader.ts
import type { Libraries } from "@react-google-maps/api";

// Librerías necesarias — "places" incluye Autocomplete y mapas base
export const GMAPS_LIBRARIES: Libraries = ["places"];

// Configuración única y reusable: evita cargar múltiples instancias del script
export const GMAPS_LOADER_OPTIONS = {
  id: "gmaps-core", // 👈 usa un solo ID global, no lo cambies en ningún otro sitio
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  libraries: GMAPS_LIBRARIES as any, // evita conflicto de tipos Readonly
};

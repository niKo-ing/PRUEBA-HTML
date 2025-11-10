// Librerías necesarias — "places" incluye Autocomplete y mapas base
export const GMAPS_LIBRARIES = ["places"];
// Configuración única y reusable: evita cargar múltiples instancias del script
export const GMAPS_LOADER_OPTIONS = {
    id: "gmaps-core", // 👈 usa un solo ID global, no lo cambies en ningún otro sitio
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GMAPS_LIBRARIES, // evita conflicto de tipos Readonly
};

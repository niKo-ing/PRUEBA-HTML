/**
 * Componente MapPreview - Mapa estático con marcador
 * Props: lat, lng, zoom (15 por defecto), height (220 por defecto)
 * Dependencias: @react-google-maps/api; Estado: sin estado local
 */
import { useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { GMAPS_LOADER_OPTIONS } from "@app/gmaps-loader";

type Props = { lat?: number; lng?: number; zoom?: number; height?: number };

/**
 * Renderiza mapa centrado en lat/lng con marcador
 * @param {Props} props - Coordenadas y opciones de visualización
 * @returns {JSX.Element} Contenedor del mapa
 */
export default function MapPreview({ lat, lng, zoom = 15, height = 220 }: Props) {
  const { isLoaded } = useJsApiLoader(GMAPS_LOADER_OPTIONS); // Usa el mismo loader
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || typeof lat !== "number" || typeof lng !== "number") return;

    const center = { lat, lng };
    // Crea mapa con controles mínimos y marcador en el centro
    const map = new google.maps.Map(mapRef.current, { center, zoom, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
    new google.maps.Marker({ position: center, map });
  }, [isLoaded, lat, lng, zoom]);

  return <div ref={mapRef} style={{ width: "100%", height }} />;
}

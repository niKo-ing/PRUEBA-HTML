// src/components/molecules/AddressAutocomplete/MapPreview.tsx
import { useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { GMAPS_LOADER_OPTIONS } from "@app/gmaps-loader";

type Props = { lat?: number; lng?: number; zoom?: number; height?: number };

export default function MapPreview({ lat, lng, zoom = 15, height = 220 }: Props) {
  const { isLoaded } = useJsApiLoader(GMAPS_LOADER_OPTIONS); // 👈 mismo loader
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || typeof lat !== "number" || typeof lng !== "number") return;

    const center = { lat, lng };
    const map = new google.maps.Map(mapRef.current, { center, zoom, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
    new google.maps.Marker({ position: center, map });
  }, [isLoaded, lat, lng, zoom]);

  return <div ref={mapRef} style={{ width: "100%", height }} />;
}

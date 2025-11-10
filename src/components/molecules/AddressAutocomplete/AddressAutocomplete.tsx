// src/components/molecules/AddressAutocomplete/AddressAutocomplete.tsx
import { useRef, useEffect, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { useJsApiLoader } from "@react-google-maps/api";
import { GMAPS_LOADER_OPTIONS } from "@app/gmaps-loader";

export type ParsedAddress = {
  fullText: string;
  street?: string;
  number?: string;
  comuna?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
};

type Props = {
  label?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onTextChange: (v: string) => void;
  onAddressSelected: (addr: ParsedAddress) => void;
  error?: string | null;
  isInvalid?: boolean;
  isValid?: boolean;
};

export default function AddressAutocomplete({
  label = "Dirección",
  placeholder = "Ej: Av. Apoquindo 1234, Las Condes",
  required = true,
  value,
  onTextChange,
  onAddressSelected,
  error,
  isInvalid,
  isValid,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [ready, setReady] = useState(false);

  // 👇 SIEMPRE el mismo objeto de loader
  const { isLoaded, loadError } = useJsApiLoader(GMAPS_LOADER_OPTIONS);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || ready) return;

    const input = inputRef.current!;
    const autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ["address_components", "geometry", "formatted_address", "place_id"],
      componentRestrictions: { country: ["cl"] },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place || !place.address_components) return;

      const parsed = parseAddress(place);
      onTextChange(place.formatted_address ?? value);
      onAddressSelected(parsed);
    });

    setReady(true);
  }, [isLoaded, ready, onAddressSelected, onTextChange, value]);

  return (
    <Form.Group className="mb-3" controlId="direccion">
      <Form.Label>{label}{required && " *"}</Form.Label>

      <div className="position-relative">
        <Form.Control
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onTextChange(e.target.value)}
          required={required}
          isInvalid={!!isInvalid}
          isValid={!!isValid}
        />
        {!isLoaded && (
          <Spinner animation="border" size="sm" className="position-absolute" style={{ right: 10, top: 10 }} />
        )}
      </div>

      {loadError && (
        <Form.Text className="text-danger">
          Error al cargar Google Maps. Revisa tu API Key/configuración.
        </Form.Text>
      )}
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
    </Form.Group>
  );
}

function parseAddress(place: google.maps.places.PlaceResult): ParsedAddress {
  const comps = place.address_components ?? [];
  const get = (type: string) => comps.find((c) => c.types.includes(type))?.long_name;

  const comunaCandidate =
    get("sublocality") ||
    get("sublocality_level_1") ||
    get("administrative_area_level_3");

  const city = get("locality");
  const region = get("administrative_area_level_1");
  const country = get("country");
  const postalCode = get("postal_code");
  const street = get("route");
  const number = get("street_number");

  const lat = place.geometry?.location?.lat();
  const lng = place.geometry?.location?.lng();

  const out: ParsedAddress = { fullText: place.formatted_address ?? "" };
  if (street) out.street = street;
  if (number) out.number = number;
  if (comunaCandidate ?? city) out.comuna = (comunaCandidate ?? city)!;
  if (city) out.city = city;
  if (region) out.region = region;
  if (country) out.country = country;
  if (postalCode) out.postalCode = postalCode;
  if (typeof lat === "number") out.lat = lat;
  if (typeof lng === "number") out.lng = lng;
  if (place.place_id) out.placeId = place.place_id;

  return out;
}

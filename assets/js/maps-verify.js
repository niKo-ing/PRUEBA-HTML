
// Google Maps: verificación de dirección y mapa en Registro
// Requiere selects con id="region", id="comuna" y input name="direccion"

let gmaps = {
  map: null,
  marker: null,
  geocoder: null,
  autocomplete: null,
  els: {}
};

function setGmapsStatus(msg, ok=false) {
  const el = gmaps.els.status;
  if (!el) return;
  el.textContent = msg;
  el.className = ok ? "text-success small" : "text-danger small";
}

function showMap(show) {
  if (gmaps.els.map) {
    gmaps.els.map.style.display = show ? "block" : "none";
  }
}

function buildFullAddress() {
  const dir = (document.querySelector('input[name="direccion"]')?.value || "").trim();
  const comuna = (document.getElementById("comuna")?.value || "").trim();
  const region = (document.getElementById("region")?.value || "").trim();
  // Construye dirección priorizando campos seleccionados
  const parts = [dir, comuna, region, "Chile"].filter(Boolean);
  return parts.join(", ");
}

function updateMap(latLng, formattedAddress) {
  if (!gmaps.map || !gmaps.marker) return;
  gmaps.map.setCenter(latLng);
  gmaps.map.setZoom(16);
  gmaps.marker.setPosition(latLng);

  if (gmaps.els.formatted) {
    gmaps.els.formatted.textContent = "Dirección oficial: " + formattedAddress;
  }
  showMap(true);
}

function initAutocomplete() {
  const dirInput = document.querySelector('input[name="direccion"]');
  if (!dirInput) return;
  try {
    gmaps.autocomplete = new google.maps.places.Autocomplete(dirInput, {
      fields: ["formatted_address", "geometry"],
      types: ["geocode"],
      componentRestrictions: { country: "CL" }
    });
    gmaps.autocomplete.addListener("place_changed", () => {
      const place = gmaps.autocomplete.getPlace();
      if (!place || !place.geometry) return;
      updateMap(place.geometry.location, place.formatted_address || "");
      setGmapsStatus("Dirección válida (Autocomplete).", true);
    });
  } catch(e) {
    // Ignorar si no está Places
    console.warn("Autocomplete no disponible:", e);
  }
}

function initMapCore() {
  setGmapsStatus("Escribe y selecciona una dirección del Autocomplete.", false);
  gmaps.els.map = document.getElementById("gmapsMap");
  gmaps.els.status = document.getElementById("gmapsStatus");
  gmaps.els.formatted = document.getElementById("gmapsFormatted");
  const mapDiv = gmaps.els.map;

  gmaps.geocoder = new google.maps.Geocoder();
  gmaps.map = new google.maps.Map(mapDiv, {
    center: { lat: -33.45, lng: -70.6667 }, // Santiago
    zoom: 12
  });
  gmaps.marker = new google.maps.Marker({ map: gmaps.map, draggable: false });

  initAutocomplete();
}

// Callback para el script async de Google Maps
function initRegistroMap() {
  try {
    initMapCore();
  } catch (e) {
    console.error("Error inicializando Google Maps:", e);
  }
}

// Si el script de Google ya estaba cargado, intenta inicializar
if (window.google && window.google.maps) {
  initRegistroMap();
}

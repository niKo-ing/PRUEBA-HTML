// Google Maps: verificación de dirección y mapa en REGISTRO
// Requiere selects con id="region", id="comuna" y input name="direccion"
// Contenedores opcionales: #gmapsMap, #gmapsStatus, #gmapsFormatted

let gmapsR = {
  map: null,
  marker: null,
  geocoder: null,
  autocomplete: null,
  els: {}
};

function setGmapsStatus(msg, ok = false) {
  const el = gmapsR.els.status;
  if (!el) return;
  el.textContent = msg;
  el.className = ok ? "text-success small" : "text-danger small";
}

function showMap(show) {
  if (gmapsR.els.map) {
    gmapsR.els.map.style.display = show ? "block" : "none";
  }
}

function buildFullAddress() {
  const dir    = (document.querySelector('form#formRegistro input[name="direccion"]')?.value || "").trim();
  const comuna = (document.getElementById("comuna")?.value || "").trim();
  const region = (document.getElementById("region")?.value || "").trim();
  const parts = [dir, comuna, region, ""].filter(Boolean);
  return parts.join(", ");
}

function updateMap(latLng, formattedAddress) {
  if (!gmapsR.map || !gmapsR.marker) return;
  gmapsR.map.setCenter(latLng);
  gmapsR.map.setZoom(16);
  gmapsR.marker.setPosition(latLng);

  if (gmapsR.els.formatted) {
    gmapsR.els.formatted.textContent = "Dirección oficial: " + (formattedAddress || "");
  }
  showMap(true);
}

function rehydrateFromInputs() {
  const full = buildFullAddress();
  if (!full || !gmapsR.geocoder) return;

  gmapsR.geocoder.geocode({ address: full }, (results, status) => {
    if (status === "OK" && results?.[0]) {
      const loc   = results[0].geometry.location;
      const faddr = results[0].formatted_address || full;
      const dirInput = document.querySelector('form#formRegistro input[name="direccion"]');
      if (dirInput && !dirInput.value) dirInput.value = faddr;
      updateMap(loc, faddr);
      setGmapsStatus("Dirección válida (Geocoder).", true);
    } else {
      setGmapsStatus("No se pudo validar la dirección.", false);
      showMap(false);
    }
  });
}

function initAutocomplete() {
  const dirInput = document.querySelector('form#formRegistro input[name="direccion"]');
  if (!dirInput) return;

  try {
    gmapsR.autocomplete = new google.maps.places.Autocomplete(dirInput, {
      fields: ["formatted_address", "geometry"],
      types: ["geocode"],
      componentRestrictions: { country: "CL" },
      strictBounds: true
      // sin componentRestrictions para permitir direcciones globales
    });

    gmapsR.autocomplete.addListener("place_changed", () => {
      const place = gmapsR.autocomplete.getPlace();
      if (!place || !place.geometry) {
        setGmapsStatus("La dirección no es válida.", false);
        dirInput.setCustomValidity("La dirección no es válida.");
        return;
      }
      dirInput.setCustomValidity("");

      const faddr = place.formatted_address || dirInput.value.trim();
      updateMap(place.geometry.location, faddr);
      setGmapsStatus("Dirección válida (Autocomplete).", true);
    });
  } catch (e) {
    console.warn("Autocomplete no disponible (Registro):", e);
  }

  // UX: si escribe manual, limpia estado y oculta el mapa hasta validar
  dirInput.addEventListener("input", () => {
    setGmapsStatus("Escribe y selecciona una dirección del Autocomplete.", false);
    showMap(false);
  });

  // Si deja texto y no eligió sugerencia, intenta validar con Geocoder
  dirInput.addEventListener("blur", () => {
    const v = (dirInput.value || "").trim();
    if (v) rehydrateFromInputs();
    else { setGmapsStatus("", false); showMap(false); }
  });
}

function initMapCore() {
  setGmapsStatus("Escribe y selecciona una dirección del Autocomplete.", false);

  gmapsR.els.map       = document.getElementById("gmapsMap");
  gmapsR.els.status    = document.getElementById("gmapsStatus");
  gmapsR.els.formatted = document.getElementById("gmapsFormatted");

  // asegurar alto mínimo para que renderice
  if (gmapsR.els.map && (!gmapsR.els.map.style.height && gmapsR.els.map.clientHeight === 0)) {
    gmapsR.els.map.style.minHeight = "280px";
  }

  gmapsR.geocoder = new google.maps.Geocoder();
  // Límites aproximados de Chile para sesgar el Autocomplete y el mapa
  const CHILE_BOUNDS = new google.maps.LatLngBounds(
    new google.maps.LatLng(-56.0, -76.0), // SW
    new google.maps.LatLng(-17.0, -66.0)  // NE
  );

  gmapsR.map = new google.maps.Map(gmapsR.els.map, {
    center: { lat: -33.45, lng: -70.6667 }, // fallback (Santiago)
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false
  });
  gmapsR.marker = new google.maps.Marker({ map: gmapsR.map, draggable: false });

  try {
    if (gmapsR.autocomplete) {
      gmapsR.autocomplete.setBounds(CHILE_BOUNDS);
    }
  } catch(e) {}


  initAutocomplete();

  // Rehidratar al cargar (F5) si ya hay valores
  rehydrateFromInputs();

  // Re-geocodificar cuando cambian Región/Comuna
  document.getElementById("region")?.addEventListener("change", rehydrateFromInputs);
  document.getElementById("comuna")?.addEventListener("change", rehydrateFromInputs);
}

// Callback global para el script async de Google Maps
function initRegistroMap() {
  try {
    initMapCore();
  } catch (e) {
    console.error("Error inicializando Google Maps (Registro):", e);
  }
}

// Si el script de Google ya estaba cargado, intenta inicializar
if (window.google && window.google.maps) {
  initRegistroMap();
}

// Exponer global para &callback=initRegistroMap
window.initRegistroMap = initRegistroMap;
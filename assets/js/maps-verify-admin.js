// Google Maps: verificación de dirección y mapa en NUEVO USUARIO (Admin)
// Requiere selects con id="regionAdmin", id="comunaAdmin" y input name="direccion"

let gmapsA = {
  map: null,
  marker: null,
  geocoder: null,
  autocomplete: null,
  els: {}
};

function setGmapsStatusAdmin(msg, ok = false) {
  const el = gmapsA.els.status;
  if (!el) return;
  el.textContent = msg;
  el.className = ok ? "text-success small" : "text-danger small";
}

function showMapAdmin(show) {
  if (gmapsA.els.map) {
    gmapsA.els.map.style.display = show ? "block" : "none";
  }
}

function buildFullAddressAdmin() {
  const dir    = (document.querySelector('form#formUsuarioAdmin input[name="direccion"]')?.value || "").trim();
  const comuna = (document.getElementById("comunaAdmin")?.value || "").trim();
  const region = (document.getElementById("regionAdmin")?.value || "").trim();

  const parts = [dir, comuna, region, ""].filter(Boolean);
  return parts.join(", ");
}

function updateMapAdmin(latLng, formattedAddress) {
  if (!gmapsA.map || !gmapsA.marker) return;
  gmapsA.map.setCenter(latLng);
  gmapsA.map.setZoom(16);
  gmapsA.marker.setPosition(latLng);

  if (gmapsA.els.formatted) {
    gmapsA.els.formatted.textContent = "Dirección oficial: " + (formattedAddress || "");
  }
  showMapAdmin(true);
}

// Rehidrata al cargar/recargar o cuando cambian Región/Comuna
function rehydrateFromInputsAdmin() {
  const full = buildFullAddressAdmin();
  if (!full || !gmapsA.geocoder) return;

  gmapsA.geocoder.geocode({ address: full }, (results, status) => {
    if (status === "OK" && results?.[0]) {
      const loc = results[0].geometry.location;
      const faddr = results[0].formatted_address || full;
      // si el input de dirección está vacío, al menos deja el oficial
      const dirInput = document.querySelector('form#formUsuarioAdmin input[name="direccion"]');
      if (dirInput && !dirInput.value) dirInput.value = faddr;
      updateMapAdmin(loc, faddr);
      setGmapsStatusAdmin("Dirección válida (Geocoder).", true);
    } else {
      setGmapsStatusAdmin("No se pudo validar la dirección.", false);
      showMapAdmin(false);
    }
  });
}

function initAutocompleteAdmin() {
  const dirInput = document.querySelector('form#formUsuarioAdmin input[name="direccion"]');
  if (!dirInput) return;

  try {
    gmapsA.autocomplete = new google.maps.places.Autocomplete(dirInput, {
      fields: ["formatted_address", "geometry"],
      types: ["geocode"],
      componentRestrictions: { country: "CL" } 
    });

    gmapsA.autocomplete.addListener("place_changed", () => {
      const place = gmapsA.autocomplete.getPlace();
      if (!place || !place.geometry) {
        setGmapsStatusAdmin("La dirección no es válida.", false);
        dirInput.setCustomValidity("La dirección no es válida.");
        return;
      }
      dirInput.setCustomValidity("");

      const faddr = place.formatted_address || dirInput.value.trim();
      updateMapAdmin(place.geometry.location, faddr);
      setGmapsStatusAdmin("Dirección válida (Autocomplete).", true);
    });
  } catch (e) {
    // Ignorar si no está Places
    console.warn("Autocomplete no disponible (Admin):", e);
  }

  // UX: si escribe manualmente, limpia estado y oculta el mapa hasta validar
  dirInput.addEventListener("input", () => {
    setGmapsStatusAdmin("Escribe y selecciona una dirección del Autocomplete.", false);
    showMapAdmin(false);
  });

  // Si deja texto y no eligió sugerencia, intenta validar con Geocoder
  dirInput.addEventListener("blur", () => {
    const v = (dirInput.value || "").trim();
    if (v) rehydrateFromInputsAdmin();
    else { setGmapsStatusAdmin("", false); showMapAdmin(false); }
  });
}

function initMapCoreAdmin() {
  setGmapsStatusAdmin("Escribe y selecciona una dirección del Autocomplete.", false);

  gmapsA.els.map       = document.getElementById("gmapsMapAdmin");
  gmapsA.els.status    = document.getElementById("gmapsStatusAdmin");
  gmapsA.els.formatted = document.getElementById("gmapsFormattedAdmin");

  gmapsA.geocoder = new google.maps.Geocoder();
  gmapsA.map = new google.maps.Map(gmapsA.els.map, {
    center: { lat: -33.45, lng: -70.6667 }, // Santiago
    zoom: 12,
    mapTypeControl: false
  });
  gmapsA.marker = new google.maps.Marker({ map: gmapsA.map, draggable: false });

  initAutocompleteAdmin();

  // 🔁 Rehidratar al cargar (F5)
  rehydrateFromInputsAdmin();

  // 🔁 Re-geocodificar cuando cambian Región/Comuna
  document.getElementById("regionAdmin")?.addEventListener("change", rehydrateFromInputsAdmin);
  document.getElementById("comunaAdmin")?.addEventListener("change", rehydrateFromInputsAdmin);
}

// Callback para el script async de Google Maps
function initAdminUserMap() {
  try {
    initMapCoreAdmin();
  } catch (e) {
    console.error("Error inicializando Google Maps (Admin):", e);
  }
}

// Si el script de Google ya estaba cargado, intenta inicializar
if (window.google && window.google.maps) {
  initAdminUserMap();
}

// Exponer la función como global para el callback=&callback=initAdminUserMap
window.initAdminUserMap = initAdminUserMap;
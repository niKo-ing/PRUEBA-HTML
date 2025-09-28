
// Google Maps: verificación automática por Autocomplete en Admin > Nuevo Usuario
// Campos esperados: select#regionAdmin, select#comunaAdmin, input[name="direccion"]

let gmapsAdmin = {
  map: null,
  marker: null,
  geocoder: null,
  autocomplete: null,
  els: {}
};

function adminStatus(msg, ok=false) {
  const el = gmapsAdmin.els.status;
  if (!el) return;
  el.textContent = msg;
  el.className = ok ? "text-success small" : "text-danger small";
}

function adminShowMap(show) {
  if (gmapsAdmin.els.map) {
    gmapsAdmin.els.map.style.display = show ? "block" : "none";
  }
}

function adminFullAddress() {
  const dir = (document.querySelector('input[name="direccion"]')?.value || "").trim();
  const comuna = (document.getElementById("comunaAdmin")?.value || "").trim();
  const region = (document.getElementById("regionAdmin")?.value || "").trim();
  const parts = [dir, comuna, region, "Chile"].filter(Boolean);
  return parts.join(", ");
}

function adminUpdateMap(latLng, formattedAddress) {
  if (!gmapsAdmin.map || !gmapsAdmin.marker) return;
  gmapsAdmin.map.setCenter(latLng);
  gmapsAdmin.map.setZoom(16);
  gmapsAdmin.marker.setPosition(latLng);

  if (gmapsAdmin.els.formatted) {
    gmapsAdmin.els.formatted.textContent = "Dirección oficial: " + formattedAddress;
  }
  adminShowMap(true);
}

function adminInitAutocomplete() {
  const dirInput = document.querySelector('input[name="direccion"]');
  if (!dirInput) return;
  try {
    gmapsAdmin.autocomplete = new google.maps.places.Autocomplete(dirInput, {
      fields: ["formatted_address", "geometry"],
      types: ["geocode"],
      componentRestrictions: { country: "CL" }
    });
    gmapsAdmin.autocomplete.addListener("place_changed", () => {
      const place = gmapsAdmin.autocomplete.getPlace();
      if (!place || !place.geometry) return;
      adminUpdateMap(place.geometry.location, place.formatted_address || "");
      adminStatus("Dirección válida (Autocomplete).", true);
    });
  } catch(e) {
    console.warn("Autocomplete no disponible en Admin:", e);
  }
}

function adminInitMapCore() {
  gmapsAdmin.els.map = document.getElementById("gmapsMapAdmin");
  gmapsAdmin.els.status = document.getElementById("gmapsStatusAdmin");
  gmapsAdmin.els.formatted = document.getElementById("gmapsFormattedAdmin");

  gmapsAdmin.geocoder = new google.maps.Geocoder();
  gmapsAdmin.map = new google.maps.Map(gmapsAdmin.els.map, {
    center: { lat: -33.45, lng: -70.6667 },
    zoom: 12
  });
  gmapsAdmin.marker = new google.maps.Marker({ map: gmapsAdmin.map, draggable: false });

  adminStatus("Escribe y selecciona una dirección del Autocomplete.", false);
  adminInitAutocomplete();
}

function initAdminUserMap() {
  try {
    adminInitMapCore();
  } catch (e) {
    console.error("Error inicializando Google Maps (Admin Nuevo Usuario):", e);
  }
}

if (window.google && window.google.maps) {
  initAdminUserMap();
}

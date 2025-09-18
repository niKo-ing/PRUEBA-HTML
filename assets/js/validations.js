// === Reglas de e-mail permitidas ===
const MSG_DOMINIO = "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com";
const validarCorreoDominios = (correo) =>
  /@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test((correo || "").trim());

// === RUN chileno ===
const validarRUN = (run) => {
  if (!/^[0-9]{7,8}[0-9kK]$/.test(run || "")) return false;
  const body = run.slice(0, -1);
  let dv = run.slice(-1).toUpperCase();
  let sum = 0, m = 2;
  for (let i = body.length - 1; i >= 0; i--) { sum += parseInt(body[i]) * m; m = m === 7 ? 2 : m + 1; }
  const r = 11 - (sum % 11); const dvCalc = r === 11 ? "0" : r === 10 ? "K" : String(r);
  return dvCalc === dv;
};

// === Bootstrap validation wrapper ===
const applyBootstrapValidation = (form, customChecks = () => true) => {
  form.addEventListener("submit", (e) => {
    if (!form.checkValidity() || !customChecks()) { e.preventDefault(); e.stopPropagation(); }
    form.classList.add("was-validated");
  }, false);
};

// === Live validation para correo (opcional pero recomendado) ===
const attachEmailLiveValidation = (form) => {
  if (!form?.correo) return;
  form.correo.addEventListener("input", () => {
    const ok = validarCorreoDominios(form.correo.value);
    form.correo.setCustomValidity(ok ? "" : MSG_DOMINIO);
  });
};

// ----- LOGIN -----
function initLogin() {
  const form = document.getElementById("formLogin");
  applyBootstrapValidation(form, () => {
    const okEmail = validarCorreoDominios(form.correo.value);
    form.correo.setCustomValidity(okEmail ? "" : MSG_DOMINIO);

    const len = form.clave.value.trim().length;
    form.clave.setCustomValidity(len >= 4 && len <= 10 ? "" : "Largo inválido");

    const ok = okEmail && len >= 4 && len <= 10;
    if (ok) {
      localStorage.setItem("session", JSON.stringify({ correo: form.correo.value.trim() }));
      // Login está en /pages/, por eso volvemos a la raíz:
      location.href = "../index.html";
    }
    return ok;
  });
  attachEmailLiveValidation(form);
}

// ----- REGISTRO -----
function initRegistro() {
  const reg = document.getElementById("region");
  const com = document.getElementById("comuna");

  // Placeholders iniciales
  reg.innerHTML = "";
  reg.append(new Option("--- seleccione región ---", "", true, true));
  reg.options[0].disabled = true;

  com.innerHTML = "";
  com.append(new Option("--- seleccione comuna ---", "", true, true));
  com.options[0].disabled = true;

  // Cargar regiones
  App.regiones.forEach(r => reg.append(new Option(r.nombre, r.nombre)));

  // Al cambiar región, reponer placeholder de comuna y luego cargar comunas
  reg.addEventListener("change", () => {
    com.innerHTML = "";
    com.append(new Option("--- seleccione comuna ---", "", true, true));
    com.options[0].disabled = true;

    const r = App.regiones.find(x => x.nombre === reg.value);
    (r?.comunas || []).forEach(c => com.append(new Option(c, c)));
    if (!r) com.selectedIndex = 0;
  });

  const form = document.getElementById("formRegistro");
  // --- Google Places Autocomplete para Direccion ---
const dirInput = form.querySelector("input[name='direccion']");

// (opcional) guardo lat/lng en inputs hidden sin tocar el HTML
const latInput = document.createElement("input");
latInput.type = "hidden"; latInput.name = "lat";
const lngInput = document.createElement("input");
lngInput.type = "hidden"; lngInput.name = "lng";
form.append(latInput, lngInput);

if (window.google?.maps?.places && dirInput) {
  const autocomplete = new google.maps.places.Autocomplete(dirInput, {
    types: ["address"],
    componentRestrictions: { country: "cl" }
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      dirInput.setCustomValidity("La dirección no es válida.");
    } else {
      dirInput.setCustomValidity("");
      // normaliza el texto mostrado
      if (place.formatted_address) dirInput.value = place.formatted_address;
      // guarda coordenadas si quieres usarlas luego
      latInput.value = place.geometry.location.lat();
      lngInput.value = place.geometry.location.lng();
    }
  });

  // si el usuario escribe y no elige una sugerencia
  dirInput.addEventListener("blur", () => {
    if (!dirInput.value.trim()) {
      dirInput.setCustomValidity("Obligatorio");
    }
  });
} else {
  console.warn("Google Places no disponible. ¿Cargaste el script con tu API key?");
}
  applyBootstrapValidation(form, () => {
    const okRun = validarRUN(form.run.value.trim());
    form.run.setCustomValidity(okRun ? "" : "RUN inválido");

    const okCorreo = validarCorreoDominios(form.correo.value);
    form.correo.setCustomValidity(okCorreo ? "" : MSG_DOMINIO);

    const ok = okRun && okCorreo;
    if (ok) {
      const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
      usuarios.push(Object.fromEntries(new FormData(form)));
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
      alert("Usuario registrado");
      // registro.html está en /pages/, login también:
      location.href = "login.html";
    }
    return ok;
  });
  attachEmailLiveValidation(form);
}

// ----- CONTACTO -----
function initContacto() {
  const form = document.getElementById("formContacto");
  applyBootstrapValidation(form, () => {
    const okCorreo = validarCorreoDominios(form.correo.value);
    form.correo.setCustomValidity(okCorreo ? "" : MSG_DOMINIO);

    const ok = okCorreo && form.nombre.value.trim() && form.comentario.value.trim();
    if (ok) {
      const mensajes = JSON.parse(localStorage.getItem("mensajes") || "[]");
      mensajes.push(Object.fromEntries(new FormData(form)));
      localStorage.setItem("mensajes", JSON.stringify(mensajes));
      alert("Mensaje enviado");
      form.reset();
      form.classList.remove("was-validated");
    }
    return ok;
  });
  attachEmailLiveValidation(form);
}
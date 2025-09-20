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

    
    // Correo: requerido, max 100, dominios válidos
    const email = form.correo.value.trim();
    const okLenMail = email.length > 0 && email.length <= 100;
    const okDom = validarCorreoDominios(email);
    form.correo.setCustomValidity(okLenMail && okDom ? "" : MSG_DOMINIO);
    // Clave: 4 a 10
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
    const run = form.run.value.trim();
    const nombres = form.nombres.value.trim();
    const apellidos = form.apellidos.value.trim();
    const correo = form.correo.value.trim();
    const region = form.region.value.trim();
    const comuna = form.comuna.value.trim();
    const direccion = form.direccion.value.trim();

    // RUN: 7-9 y DV válido
    const okRunLen = run.length >= 7 && run.length <= 9;
    const okRunDv = validarRUN(run);
    form.run.setCustomValidity(okRunLen && okRunDv ? "" : "RUN inválido");

    // Nombres/apellidos
    const okNom = nombres.length > 0 && nombres.length <= 50;
    const okApe = apellidos.length > 0 && apellidos.length <= 100;
    form.nombres.setCustomValidity(okNom ? "" : "Nombres (máx 50)");
    form.apellidos.setCustomValidity(okApe ? "" : "Apellidos (máx 100)");

    // Correo
    const okCorLen = correo.length > 0 && correo.length <= 100;
    const okCorDom = validarCorreoDominios(correo);
    form.correo.setCustomValidity(okCorLen && okCorDom ? "" : MSG_DOMINIO);

    // Región/comuna
    const okReg = !!region;
    const okCom = !!comuna;
    form.region.setCustomValidity(okReg ? "" : "Seleccione región");
    form.comuna.setCustomValidity(okCom ? "" : "Seleccione comuna");

    // Dirección
    const okDir = direccion.length > 0 && direccion.length <= 300;
    form.direccion.setCustomValidity(okDir ? "" : "Dirección (máx 300)");

    const ok = okRunLen && okRunDv && okNom && okApe && okCorLen && okCorDom && okReg && okCom && okDir;
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
    const nombre = form.nombre.value.trim();
    const email = form.correo.value.trim();
    const comentario = form.comentario.value.trim();

    // Nombre: requerido, max 100
    const okNombre = nombre.length > 0 && nombre.length <= 100;
    form.nombre.setCustomValidity(okNombre ? "" : "Nombre requerido (máx 100)");

    // Correo: opcional, pero si viene => max 100 + dominio válido
    const okCorreoLen = email.length === 0 || email.length <= 100;
    const okCorreoDom = email.length === 0 || validarCorreoDominios(email);
    form.correo.setCustomValidity(okCorreoLen && okCorreoDom ? "" : MSG_DOMINIO);

    // Comentario: req., max 500
    const okComent = comentario.length > 0 && comentario.length <= 500;
    form.comentario.setCustomValidity(okComent ? "" : "Comentario requerido (máx 500)");

    const ok = okNombre && okCorreoLen && okCorreoDom && okComent;
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

// === Validaciones Admin: Producto ===
document.addEventListener("DOMContentLoaded", () => {
  const formP = document.getElementById("formProducto");
  if (formP) {
    formP.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;

      const codigo = formP.codigo?.value?.trim() || "";
      const nombre = formP.nombre?.value?.trim() || "";
      const precio = parseFloat(formP.precio?.value || "0");
      const stock = parseInt(formP.stock?.value || "0");
      const stockCritico = formP.stockCritico?.value ? parseInt(formP.stockCritico.value) : null;
      const categoria = formP.categoria?.value || "";

      // Código: requerido, texto, min 3
      if (codigo.length < 3) { ok = false; alert("Código: mínimo 3 caracteres"); }

      // Nombre: requerido, max 100
      if (!nombre || nombre.length > 100) { ok = false; alert("Nombre: requerido y máximo 100 caracteres"); }

      // Precio: requerido, min 0 (FREE posible)
      if (isNaN(precio) || precio < 0) { ok = false; alert("Precio: número válido (>= 0)"); }

      // Stock: requerido entero >= 0
      if (!Number.isInteger(stock) || stock < 0) { ok = false; alert("Stock: entero válido (>= 0)"); }

      // Stock crítico: opcional entero >= 0
      if (stockCritico !== null && (!Number.isInteger(stockCritico) || stockCritico < 0)) {
        ok = false; alert("Stock crítico: entero válido (>= 0)");
      }

      // Categoría: requerido
      if (!categoria) { ok = false; alert("Seleccione una categoría"); }

      if (ok) {
        // Guardar en localStorage como simulación de persistencia
        const productos = JSON.parse(localStorage.getItem("productosAdmin") || "[]");
        productos.push({
          codigo, nombre, precio, stock, stockCritico, categoria,
          descripcion: formP.descripcion?.value?.trim() || "",
          imagen: formP.imagen?.value || ""
        });
        localStorage.setItem("productosAdmin", JSON.stringify(productos));
        alert("Producto guardado (demo localStorage).");
        formP.reset();
      }
    });
  }

  // === Validaciones Admin: Usuario ===
  const formU = document.getElementById("formUsuario");
  if (formU) {
    formU.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;

      const run = (formU.run?.value || "").trim();
      const nombres = (formU.nombres?.value || "").trim();
      const apellidos = (formU.apellidos?.value || "").trim();
      const correo = (formU.correo?.value || "").trim();
      const tipo = formU.tipo?.value || "";
      const region = formU.region?.value || "";
      const comuna = formU.comuna?.value || "";
      const direccion = (formU.direccion?.value || "").trim();

      // RUN
      if (!validarRUN(run)) { ok = false; alert("RUN inválido. Ej: 19011022K (sin puntos ni guion)"); }
      if (run.length < 7 || run.length > 9) { ok = false; alert("RUN: 7 a 9 caracteres"); }

      // Nombres/apellidos
      if (!nombres || nombres.length > 50) { ok = false; alert("Nombres: requerido, máx 50"); }
      if (!apellidos || apellidos.length > 100) { ok = false; alert("Apellidos: requerido, máx 100"); }

      // Correo
      if (!correo || correo.length > 100 || !validarCorreoDominios(correo)) {
        ok = false; alert(MSG_DOMINIO);
      }

      // Tipo: Admin/Cliente/Vendedor
      if (!tipo) { ok = false; alert("Seleccione un tipo de usuario"); }

      // Región/comuna
      if (!region) { ok = false; alert("Seleccione región"); }
      if (!comuna) { ok = false; alert("Seleccione comuna"); }

      // Dirección
      if (!direccion || direccion.length > 300) { ok = false; alert("Dirección: requerida, máx 300"); }

      if (ok) {
        const usuarios = JSON.parse(localStorage.getItem("usuariosAdmin") || "[]");
        usuarios.push({ run, nombres, apellidos, correo, tipo, region, comuna, direccion });
        localStorage.setItem("usuariosAdmin", JSON.stringify(usuarios));
        alert("Usuario guardado (demo localStorage).");
        formU.reset();
      }
    });
  }
});

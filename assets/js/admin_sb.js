// Admin scripts (sidebar + páginas Admin)
document.addEventListener("DOMContentLoaded", () => {
  // ===== Sidebar toggle (si existe) =====
  document.querySelectorAll("[data-action='toggle-sidebar']").forEach((btn) => {
    btn.addEventListener("click", () => document.body.classList.toggle("sidebar-open"));
  });

  // ========================================================================
  // NUEVO USUARIO: placeholders Región/Comuna + guardado básico
  // ========================================================================
  const formU = document.getElementById("formUsuario");
  if (formU) {
    const reg = document.getElementById("regionAdmin");
    const com = document.getElementById("comunaAdmin");

    // PLACEHOLDERS y carga de regiones
    if (reg) {
      reg.innerHTML = "";
      reg.append(new Option("-- Seleccionar región --", "", true, true));
      (window.App?.regiones || []).forEach((r) => reg.append(new Option(r.nombre, r.nombre)));
    }
    if (com) {
      com.innerHTML = "";
      com.append(new Option("-- Seleccionar comuna --", "", true, true));
    }

    // Al cambiar región -> comunas
    reg?.addEventListener("change", () => {
      com.innerHTML = "";
      com.append(new Option("-- Seleccionar comuna --", "", true, true));
      const r = (window.App?.regiones || []).find((x) => x.nombre === reg.value);
      (r?.comunas || []).forEach((c) => com.append(new Option(c, c)));
    });

    // Guardar usuario (localStorage demo)
    formU.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!formU.checkValidity()) {
        formU.classList.add("was-validated");
        return;
      }
      const usuarios = JSON.parse(localStorage.getItem("usuariosAdmin") || "[]");
      usuarios.push(Object.fromEntries(new FormData(formU)));
      localStorage.setItem("usuariosAdmin", JSON.stringify(usuarios));
      alert("Usuario guardado");
      location.href = "usuarios.html";
    });
  }

  // ========================================================================
  // NUEVO PRODUCTO: categorías múltiples + normalización de imagen + guardado
  // ========================================================================
  const formP = document.getElementById("formProducto");
  if (formP) {
    // Poblar select de categorías (usa App.categorias)
    const selCat = formP.querySelector("#categoria");
    if (selCat) {
      selCat.innerHTML = "";
      (window.App?.categorias || []).forEach((c) => selCat.append(new Option(c, c)));
    }

    formP.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!formP.checkValidity()) {
        formP.classList.add("was-validated");
        return;
      }

      // Productos existentes (base de ejemplo + añadidos)
      const base = window.App?.productos || [];
      const extra = JSON.parse(localStorage.getItem("productosAdmin") || "[]");
      const productos = [...base, ...extra];

      // Construir objeto desde el form
      const obj = Object.fromEntries(new FormData(formP));

      // Categoría múltiple -> string o array según selección
      if (selCat) {
        const seleccionadas = Array.from(selCat.selectedOptions).map((o) => o.value);
        obj.categoria = seleccionadas.length <= 1 ? (seleccionadas[0] || "") : seleccionadas;
      }

      // Normalizar ruta de imagen (si no es absoluta ni empieza con assets/)
      if (obj.img) {
        const raw = String(obj.img).trim().replace(/^\/+/, "");
        if (!/^https?:\/\//i.test(raw) && !raw.toLowerCase().startsWith("assets/")) {
          obj.img = "assets/img/" + raw;
        } else {
          obj.img = raw;
        }
      }

      // Conversión de numéricos básicos (opcional)
      if (obj.precio) obj.precio = Number(obj.precio) || 0;
      if (obj.stock) obj.stock = Number(obj.stock) || 0;
      if (obj.stock_critico) obj.stock_critico = Number(obj.stock_critico) || 0;

      // Guardar en productosAdmin (localStorage)
      extra.push(obj);
      localStorage.setItem("productosAdmin", JSON.stringify(extra));

      alert("Producto guardado");
      location.href = "productos.html";
    });
  }

  // ========================================================================
  // (Opcional) Dashboard/tabla productos si tu plantilla lo usa
  // ========================================================================
  const dashTbody = document.querySelector("#tblProductosDash tbody");
  if (dashTbody) {
    const rows = (window.App?.productos || [])
      .slice(-5)
      .map((p) => ({
        codigo: p.codigo,
        nombre: p.nombre,
        precio: p.precio,
        stock: p.stock,
        categoria: Array.isArray(p.categoria) ? p.categoria.join(" / ") : p.categoria,
      }));
    dashTbody.innerHTML = rows
      .map(
        (r) => `<tr>
      <td>${r.codigo}</td><td>${r.nombre}</td>
      <td>$${Number(r.precio || 0).toLocaleString()}</td>
      <td>${r.stock ?? 0}</td><td>${r.categoria ?? ""}</td>
    </tr>`
      )
      .join("");
  }

  const tbodyP = document.querySelector("#tblProductos tbody");
  if (tbodyP) {
    const base = (window.App?.productos || []).map((p) => ({
      codigo: p.codigo,
      nombre: p.nombre,
      precio: p.precio,
      stock: p.stock,
      categoria: Array.isArray(p.categoria) ? p.categoria.join(" / ") : p.categoria,
    }));
    const extra = JSON.parse(localStorage.getItem("productosAdmin") || "[]").map((p) => ({
      codigo: p.codigo,
      nombre: p.nombre,
      precio: p.precio,
      stock: p.stock,
      categoria: Array.isArray(p.categoria) ? p.categoria.join(" / ") : p.categoria,
    }));
    const rows = [...base, ...extra];
    tbodyP.innerHTML = rows
      .map(
        (r) => `<tr>
      <td>${r.codigo}</td><td>${r.nombre}</td>
      <td>$${Number(r.precio || 0).toLocaleString()}</td>
      <td>${r.stock ?? 0}</td><td>${r.categoria ?? ""}</td>
    </tr>`
      )
      .join("");
  }
});

// Render helpers
const currency = (v) => "$" + Number(v || 0).toLocaleString();

const stockBadge = (s) => {
  if (s <= 0)
    return '<span class="badge text-bg-secondary d-inline-flex align-items-center gap-1"><span class="material-symbols-outlined">do_not_disturb</span>Sin stock</span>';
  if (s <= 5)
    return `<span class="badge text-bg-danger d-inline-flex align-items-center gap-1"><span class="material-symbols-outlined">warning</span>Quedan ${s}</span>`;
  return `<span class="badge text-bg-success d-inline-flex align-items-center gap-1"><span class="material-symbols-outlined">check_circle</span>Stock ${s}</span>`;
};

const ratingStars = (r = 0) => {
  const full = Math.floor(r);
  const half = r - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const icon = (name, filled = false) =>
    `<span class="material-symbols-outlined${filled ? " icon-star" : ""}">${name}</span>`;
  return (
    icon("star", true).repeat(full) +
    (half ? icon("star_half", true) : "") +
    icon("star_border").repeat(empty)
  );
};

// ==== Helpers de rutas ====
// asset("assets/img/archivo.jpg") -> resuelve bien en /pages/* y en / (http y file://)
const asset = (path) => {
  const clean = String(path || "").replace(/^\/+/, "");
  if (location.protocol.startsWith("http")) {
    return "/" + clean;
  }
  const inPages = location.pathname.includes("/pages/");
  return (inPages ? "../" : "./") + clean;
};

// Link robusto al detalle
const detailHref = (id) => {
  if (location.protocol.startsWith("http")) return `/pages/producto.html?id=${id}`;
  const inPages = location.pathname.includes("/pages/");
  return (inPages ? "./producto.html?id=" : "pages/producto.html?id=") + id;
};

// ===== PRELOADER (inyectado + control robusto) =====
function injectPreloader(){
  if(document.getElementById('preloader')) return;
  const div = document.createElement('div');
  div.id = 'preloader';
  div.innerHTML = `
    <div class="preloader-box">
      <div class="preloader-ring"></div>
      <div class="preloader-text">Cargando…</div>
    </div>`;
  document.body.prepend(div);
}

function hidePreloader(){ document.getElementById('preloader')?.classList.add('hidden'); }
function showPreloader(){ document.getElementById('preloader')?.classList.remove('hidden'); }

// Mostrar preloader al navegar por links internos (no modales/offcanvas/externos)
function enableNavPreloader(){
  document.addEventListener('click', (ev)=>{
    const a = ev.target.closest('a');
    if(!a) return;
    const href = a.getAttribute('href') || '';
    const target = a.getAttribute('target');
    const isAnchor = href.startsWith('#');
    const isExternal = /^https?:\/\//i.test(href) && !href.includes(location.host);
    const isMailTel = href.startsWith('mailto:') || href.startsWith('tel:');
    const hasBsToggle = a.hasAttribute('data-bs-toggle');
    if(target === '_blank' || isAnchor || isExternal || isMailTel || hasBsToggle) return;
    // tapa la salida antes de navegar
    showPreloader();
  }, true);
}

function cardProductHTML(p) {
  const disabled = p.stock <= 0 ? "disabled" : "";
  return `
  <div class="col">
    <div class="card card-product h-100">
      <img src="${asset(p.img)}" alt="${p.nombre}" class="thumb card-img-top"
           onerror="this.onerror=null; this.src='${asset("assets/img/placeholder.png")}';">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <small class="text-secondary">${p.brand ?? ""}</small>
          ${stockBadge(p.stock)}
        </div>
        <a class="stretched-link text-decoration-none text-reset" href="${detailHref(p.id)}">
          <h6 class="card-title mb-1">${p.nombre}</h6>
        </a>
        <div class="small text-warning mb-2" aria-label="Valoración">${ratingStars(p.rating)}</div>
        <div class="fw-bold mb-3">${currency(p.precio)}</div>
        <div class="mt-auto d-flex gap-2">
          <button class="btn btn-naranja btn-sm d-flex align-items-center gap-1" data-add="${p.id}" ${disabled}>
            <span class="material-symbols-outlined">add_shopping_cart</span> Añadir
          </button>
          <a class="btn btn-outline-secondary btn-sm" href="${detailHref(p.id)}">Detalle</a>
        </div>
      </div>
    </div>
  </div>`;
}

function renderProductFilters() {
  const sel = document.getElementById("filterCategory");
  if (!sel) return;
  App.categorias.forEach((c) => sel.append(new Option(c, c)));
  sel.addEventListener("change", renderProductList);
  document.getElementById("searchInput")?.addEventListener("input", renderProductList);
  document.getElementById("sortSelect")?.addEventListener("change", renderProductList);
}

function sortProducts(arr) {
  const by = document.getElementById("sortSelect")?.value || "relevance";
  if (by === "price-asc") return [...arr].sort((a, b) => a.precio - b.precio);
  if (by === "price-desc") return [...arr].sort((a, b) => b.precio - a.precio);
  if (by === "stock-desc") return [...arr].sort((a, b) => b.stock - a.stock);
  return arr;
}

function renderProductList() {
  const wrap = document.getElementById("productList");
  if (!wrap) return;
  wrap.classList.add('row','g-3','row-cols-1','row-cols-sm-2','row-cols-md-3','row-cols-lg-4');

  const term = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const cat = document.getElementById("filterCategory")?.value || "";
  const filtered = App.productos.filter(
    (p) => (!cat || p.categoria === cat) && (!term || p.nombre.toLowerCase().includes(term))
  );
  const sorted = sortProducts(filtered);
  wrap.innerHTML = sorted.map(cardProductHTML).join("");
}

function renderFeatured() {
  const el = document.getElementById("featuredProducts");
  if (!el) return;
  el.classList.add('row','g-3','row-cols-2','row-cols-md-3','row-cols-lg-4');
  el.innerHTML = App.productos.slice(0, 4).map(cardProductHTML).join("");
}

function renderProductDetail() {
  const params = new URLSearchParams(location.search);
  const id = Number(params.get("id"));
  const p = App.productos.find((x) => x.id === id) || App.productos[0];
  const imgMain = (p.images && p.images[0]) || p.img;

  const disabled = p.stock <= 0 ? "disabled" : "";
  const detail = document.getElementById("productDetail");
  if (!detail) return;

  const imgs = (p.images && p.images.length ? p.images : [p.img]).map(asset);

  detail.innerHTML = `
    <div class="col-lg-6">
      <img id="bigImg" src="${asset(imgMain)}" class="img-fluid rounded-4 mb-3" alt="${p.nombre}"
           onerror="this.onerror=null; this.src='${asset("assets/img/placeholder.png")}';">
      <div class="thumbs-row">
        ${imgs.map((src, i) => `
          <img src="${src}" class="pthumb ${i === 0 ? "active" : ""} rounded-2" data-src="${src}" alt="thumb">
        `).join("")}
      </div>
    </div>
    <div class="col-lg-6">
      <div class="text-secondary small">${p.brand ?? ""} • SKU: ${p.sku ?? "-"}</div>
      <h1 class="h3 mt-1">${p.nombre}</h1>
      <div class="small text-warning mb-1">${ratingStars(p.rating)}</div>
      <div class="mb-2">${stockBadge(p.stock)}</div>
      <div class="fs-3 fw-bold mb-3">${currency(p.precio)}</div>
      <p class="text-secondary">${p.descripcion || ""}</p>

      <div class="d-flex align-items-center gap-2 mb-3">
        <div class="input-group" style="width: 140px;">
          <button class="btn btn-outline-secondary" id="qtyDec" ${disabled}>
            <span class="material-symbols-outlined">remove</span>
          </button>
          <input class="form-control text-center" id="qtyInput" value="1" min="1" type="number" ${p.stock <= 0 ? "disabled" : ""}>
          <button class="btn btn-outline-secondary" id="qtyInc" ${disabled}>
            <span class="material-symbols-outlined">add</span>
          </button>
        </div>
        <button class="btn btn-naranja d-flex align-items-center gap-1" id="addDetail" ${disabled} data-id="${p.id}">
          <span class="material-symbols-outlined">add_shopping_cart</span> Añadir al carrito
        </button>
      </div>

      <div class="d-flex flex-wrap gap-2">
        ${(p.tags || []).map((t) => `<span class="badge text-bg-light border">${t}</span>`).join("")}
      </div>
    </div>
  `;

  // Mini-galería
  let current = 0;
  const thumbs = Array.from(detail.querySelectorAll(".pthumb"));
  thumbs.forEach((th, i) => {
    th.addEventListener("click", () => {
      detail.querySelectorAll(".pthumb").forEach((x) => x.classList.remove("active"));
      th.classList.add("active");
      detail.querySelector("#bigImg").src = th.dataset.src;
      current = i;
    });
  });
  document.addEventListener("keydown", (ev)=>{
    if (!document.getElementById("productDetail") || !thumbs.length) return;
    if (ev.key === "ArrowRight"){ current = (current+1) % thumbs.length; thumbs[current].click(); }
    if (ev.key === "ArrowLeft"){  current = (current-1+thumbs.length) % thumbs.length; thumbs[current].click(); }
  });

  // Cantidad + añadir
  const qtyInput = detail.querySelector("#qtyInput");
  detail.querySelector("#qtyDec")?.addEventListener("click", () => {
    qtyInput.value = Math.max(1, (parseInt(qtyInput.value) || 1) - 1);
  });
  detail.querySelector("#qtyInc")?.addEventListener("click", () => {
    qtyInput.value = (parseInt(qtyInput.value) || 1) + 1;
  });
  detail.querySelector("#addDetail")?.addEventListener("click", () => {
    addToCart(p.id, parseInt(qtyInput.value) || 1);
  });

  // Relacionados
  const related = App.productos
    .filter(
      (x) =>
        x.id !== p.id && (x.categoria === p.categoria || x.tags?.some((t) => p.tags?.includes(t)))
    )
    .slice(0, 4);
  document.getElementById("relatedWrap").innerHTML = related.length
    ? related.map(cardProductHTML).join("")
    : `<div class="text-secondary small">No hay relacionados.</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  // ===== PRELOADER GLOBAL =====
  injectPreloader();
  showPreloader(); // asegúrate de que quede visible al entrar
  // Ocultarlo con varias garantías
  window.addEventListener('load', () => setTimeout(hidePreloader, 150));
  document.addEventListener('readystatechange', () => {
    if(document.readyState === 'interactive') setTimeout(hidePreloader, 1200);
  });
  setTimeout(hidePreloader, 4000); // failsafe final
  enableNavPreloader();

  // THEME TOGGLE
  const btnTheme = document.getElementById("toggleTheme");
  const setIcon = (mode) => {
    if (!btnTheme) return;
    if (mode === "dark") {
      btnTheme.className = "btn btn-light";
      btnTheme.innerHTML = '<span class="material-symbols-outlined">light_mode</span>';
    } else {
      btnTheme.className = "btn btn-dark";
      btnTheme.innerHTML = '<span class="material-symbols-outlined">dark_mode</span>';
    }
  };
  const preferDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const saved = localStorage.getItem("theme") || (preferDark ? "dark" : "light");
  document.documentElement.setAttribute("data-bs-theme", saved);
  setIcon(saved);
  btnTheme?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-bs-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-bs-theme", next);
    localStorage.setItem("theme", next);
    setIcon(next);
  });

  // FEATURED + LISTADO + DETALLE
  renderFeatured();
  renderProductFilters();
  renderProductList();
  if (document.getElementById("productDetail")) renderProductDetail();

  // Delegación: Añadir al carrito desde cards
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (btn) addToCart(Number(btn.dataset.add), 1);
  });
});
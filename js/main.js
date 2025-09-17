// Render helpers
const currency = (v)=> "$"+ Number(v||0).toLocaleString();

const stockBadge = (s) => {
  if(s <= 0) return '<span class="badge text-bg-secondary d-inline-flex align-items-center gap-1"><span class="material-symbols-outlined">do_not_disturb</span>Sin stock</span>';
  if(s <= 5) return `<span class="badge text-bg-danger d-inline-flex align-items-center gap-1"><span class="material-symbols-outlined">warning</span>Quedan ${s}</span>`;
  return `<span class="badge text-bg-success d-inline-flex align-items-center gap-1"><span class="material-symbols-outlined">check_circle</span>Stock ${s}</span>`;
};
const ratingStars = (r=0) => {
  const full = Math.floor(r);
  const half = r - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const icon = (name, filled=false)=> `<span class="material-symbols-outlined${filled?' icon-star':''}">${name}</span>`;
  return (
    icon('star', true).repeat(full) +
    (half ? icon('star_half', true) : '') +
    icon('star_border').repeat(empty)
  );
};

function cardProductHTML(p){
  const disabled = p.stock<=0 ? 'disabled' : '';
  return `
  <div class="col-12 col-sm-6 col-md-4 col-lg-3">
    <div class="card card-product h-100">
      <img src="${p.img}" alt="${p.nombre}" class="thumb card-img-top" onerror="this.style.display='none'">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <small class="text-secondary">${p.brand ?? ''}</small>
          ${stockBadge(p.stock)}
        </div>
        <a class="stretched-link text-decoration-none text-reset" href="producto.html?id=${p.id}">
          <h6 class="card-title mb-1">${p.nombre}</h6>
        </a>
        <div class="small text-warning mb-2" aria-label="Valoración">${ratingStars(p.rating)}</div>
        <div class="fw-bold mb-3">${currency(p.precio)}</div>
        <div class="mt-auto d-flex gap-2">
          <button class="btn btn-naranja btn-sm d-flex align-items-center gap-1" data-add="${p.id}" ${disabled}>
            <span class="material-symbols-outlined">add_shopping_cart</span> Añadir
          </button>
          <a class="btn btn-outline-secondary btn-sm" href="producto.html?id=${p.id}">Detalle</a>
        </div>
      </div>
    </div>
  </div>`;
}

function renderProductFilters(){
  const sel = document.getElementById("filterCategory");
  if(!sel) return;
  App.categorias.forEach(c=> sel.append(new Option(c,c)));
  sel.addEventListener("change", renderProductList);
  document.getElementById("searchInput")?.addEventListener("input", renderProductList);
  document.getElementById("sortSelect")?.addEventListener("change", renderProductList);
}

function sortProducts(arr){
  const by = document.getElementById("sortSelect")?.value || "relevance";
  if(by === "price-asc")   return [...arr].sort((a,b)=> a.precio-b.precio);
  if(by === "price-desc")  return [...arr].sort((a,b)=> b.precio-a.precio);
  if(by === "stock-desc")  return [...arr].sort((a,b)=> b.stock-a.stock);
  return arr; // relevancia simple
}

function renderProductList(){
  const wrap = document.getElementById("productList");
  const term = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const cat = (document.getElementById("filterCategory")?.value || "");
  const filtered = App.productos.filter(p => (!cat || p.categoria===cat) && (!term || p.nombre.toLowerCase().includes(term)));
  const sorted = sortProducts(filtered);
  wrap.innerHTML = sorted.map(cardProductHTML).join("");
}

function renderFeatured(){
  const el = document.getElementById("featuredProducts");
  if(!el) return;
  el.innerHTML = App.productos.slice(0,4).map(cardProductHTML).join("");
}

function renderProductDetail(){
  const params = new URLSearchParams(location.search);
  const id = Number(params.get("id"));
  const p = App.productos.find(x=>x.id===id) || App.productos[0];
  const imgMain = (p.images && p.images[0]) || p.img;

  const disabled = p.stock<=0 ? 'disabled' : '';
  const detail = document.getElementById("productDetail");
  detail.innerHTML = `
    <div class="col-lg-6">
      <img id="bigImg" src="${imgMain}" class="img-fluid rounded-4 mb-3" alt="${p.nombre}">
      <div class="d-flex flex-wrap gap-2">
        ${(p.images||[p.img]).map((src,i)=>`
          <img src="${src}" class="pthumb ${i===0?'active':''} rounded-2" data-src="${src}" alt="thumb">
        `).join("")}
      </div>
    </div>
    <div class="col-lg-6">
      <div class="text-secondary small">${p.brand ?? ''} • SKU: ${p.sku ?? '-'}</div>
      <h1 class="h3 mt-1">${p.nombre}</h1>
      <div class="small text-warning mb-1">${ratingStars(p.rating)}</div>
      <div class="mb-2">${stockBadge(p.stock)}</div>
      <div class="fs-3 fw-bold mb-3">${currency(p.precio)}</div>
      <p class="text-secondary">${p.descripcion||""}</p>

      <div class="d-flex align-items-center gap-2 mb-3">
        <div class="input-group" style="width: 140px;">
          <button class="btn btn-outline-secondary" id="qtyDec" ${disabled}><span class="material-symbols-outlined">remove</span></button>
          <input class="form-control text-center" id="qtyInput" value="1" min="1" type="number" ${p.stock<=0?'disabled':''}>
          <button class="btn btn-outline-secondary" id="qtyInc" ${disabled}><span class="material-symbols-outlined">add</span></button>
        </div>
        <button class="btn btn-naranja d-flex align-items-center gap-1" id="addDetail" ${disabled} data-id="${p.id}">
          <span class="material-symbols-outlined">add_shopping_cart</span> Añadir al carrito
        </button>
      </div>

      <div class="d-flex flex-wrap gap-2">
        ${(p.tags||[]).map(t=>`<span class="badge text-bg-light border">${t}</span>`).join("")}
      </div>
    </div>
  `;

  // Mini-galería
  detail.querySelectorAll(".pthumb").forEach(th=>{
    th.addEventListener("click", ()=>{
      detail.querySelectorAll(".pthumb").forEach(x=>x.classList.remove("active"));
      th.classList.add("active");
      detail.querySelector("#bigImg").src = th.dataset.src;
    });
  });

  // Cantidad + añadir
  const qtyInput = detail.querySelector("#qtyInput");
  detail.querySelector("#qtyDec")?.addEventListener("click", ()=> qtyInput.value = Math.max(1, (parseInt(qtyInput.value)||1)-1));
  detail.querySelector("#qtyInc")?.addEventListener("click", ()=> qtyInput.value = (parseInt(qtyInput.value)||1)+1);
  detail.querySelector("#addDetail")?.addEventListener("click", (e)=>{
    addToCart(p.id, parseInt(qtyInput.value)||1);
  });

  // Relacionados (misma categoría y/o tags)
  const related = (App.productos
    .filter(x=> x.id!==p.id && (x.categoria===p.categoria || x.tags?.some(t=> p.tags?.includes(t))))
    .slice(0,4));
  document.getElementById("relatedWrap").innerHTML = related.length
    ? related.map(cardProductHTML).join("")
    : `<div class="text-secondary small">No hay relacionados.</div>`;
}

document.addEventListener("DOMContentLoaded", ()=>{
  // ====== THEME TOGGLE ======
  const btnTheme = document.getElementById("toggleTheme");
  const setIcon = (mode) => {
    if(!btnTheme) return;
    if(mode === "dark"){
      btnTheme.className = "btn btn-light"; // botón claro en modo oscuro
      btnTheme.innerHTML = '<span class="material-symbols-outlined">light_mode</span>';
    } else {
      btnTheme.className = "btn btn-dark"; // botón oscuro en modo claro
      btnTheme.innerHTML = '<span class="material-symbols-outlined">dark_mode</span>';
    }
  };
  const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('theme') || (preferDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-bs-theme', saved);
  setIcon(saved);
  btnTheme?.addEventListener('click', ()=>{
    const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', next);
    localStorage.setItem('theme', next);
    setIcon(next);
  });

  // ====== FEATURED ======
  renderFeatured();

  // ====== ADD TO CART (desde cards) ======
  document.body.addEventListener("click",(e)=>{
    const btn = e.target.closest("[data-add]");
    if(btn){ addToCart(Number(btn.dataset.add),1); }
  });
});
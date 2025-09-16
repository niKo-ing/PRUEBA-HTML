// Render helpers
const currency = (v)=> "$"+ Number(v||0).toLocaleString();

function renderFeatured(){
  const el = document.getElementById("featuredProducts");
  if(!el) return;
  el.innerHTML = App.productos.slice(0,3).map(p=> cardProductHTML(p)).join("");
}

function renderProductFilters(){
  const sel = document.getElementById("filterCategory");
  if(!sel) return;
  App.categorias.forEach(c=> sel.append(new Option(c,c)));
  sel.addEventListener("change", renderProductList);
  document.getElementById("searchInput")?.addEventListener("input", renderProductList);
}

function cardProductHTML(p){
  return `
  <div class="col-12 col-sm-6 col-md-4 col-lg-3">
    <div class="card h-100">
      <img src="${p.img}" class="card-img-top" alt="${p.nombre}" onerror="this.style.display='none'">
      <div class="card-body d-flex flex-column">
        <h6 class="card-title">${p.nombre}</h6>
        <div class="text-secondary small mb-2">${p.categoria}</div>
        <div class="fw-bold mb-3">${currency(p.precio)}</div>
        <div class="mt-auto d-flex gap-2">
          <button class="btn btn-primary btn-sm" data-add="${p.id}">Añadir</button>
          <a class="btn btn-outline-secondary btn-sm" href="producto.html?id=${p.id}">Detalle</a>
        </div>
      </div>
    </div>
  </div>`;
}

function renderProductList(){
  const wrap = document.getElementById("productList");
  const term = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const cat = (document.getElementById("filterCategory")?.value || "");
  const filtered = App.productos.filter(p=> (!cat || p.categoria===cat) && (!term || p.nombre.toLowerCase().includes(term)));
  wrap.innerHTML = filtered.map(p=> cardProductHTML(p)).join("");
}

function renderProductDetail(){
  const params = new URLSearchParams(location.search);
  const id = Number(params.get("id"));
  const p = App.productos.find(x=>x.id===id) || App.productos[0];
  const el = document.getElementById("productDetail");
  el.innerHTML = `
    <div class="col-md-5">
      <img src="${p.img}" class="img-fluid rounded-4" alt="${p.nombre}" onerror="this.style.display='none'">
    </div>
    <div class="col-md-7">
      <h1 class="h3">${p.nombre}</h1>
      <p class="text-secondary">${p.descripcion||""}</p>
      <div class="fs-4 fw-bold mb-3">${currency(p.precio)}</div>
      <button class="btn btn-primary" data-add="${p.id}">Añadir al carrito</button>
    </div>`;
}

document.addEventListener("DOMContentLoaded", ()=>{
  renderFeatured();
  document.body.addEventListener("click",(e)=>{
    const btn = e.target.closest("[data-add]");
    if(btn){ addToCart(Number(btn.dataset.add),1); }
  });
});

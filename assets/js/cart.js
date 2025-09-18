// Carrito simplificado usando localStorage + Material Icons
const CART_KEY = "cart";
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");
const setCart = (arr) => { localStorage.setItem(CART_KEY, JSON.stringify(arr)); updateCartUI(); };
const addToCart = (id, qty=1) => {
  const cart = getCart();
  const i = cart.findIndex(x=>x.id===id);
  i>-1 ? cart[i].qty+=qty : cart.push({id, qty});
  setCart(cart);
};
const changeQty = (id, delta) => {
  const cart = getCart().map(x=> x.id===id ? ({...x, qty:Math.max(0, x.qty+delta)}) : x).filter(x=>x.qty>0);
  setCart(cart);
};
const removeFromCart = (id) => setCart(getCart().filter(x=>x.id!==id));
const clearCart = () => setCart([]);

function updateCartUI(){
  const count = getCart().reduce((a,x)=>a+x.qty,0);
  const badge = document.getElementById("cartCount");
  if(badge) badge.textContent = String(count);
  const itemsWrap = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if(!itemsWrap || !totalEl) return;
  itemsWrap.innerHTML = "";
  let total = 0;
  getCart().forEach(it=>{
    const p = App.productos.find(p=>p.id===it.id);
    const line = (p?.precio||0)*it.qty; total+=line;
    const li = document.createElement("div");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div>
        <div class="fw-semibold">${p?.nombre||"Producto"}</div>
        <small class="text-secondary">$${(p?.precio||0).toLocaleString()}</small>
      </div>
      <div class="btn-group btn-group-sm" role="group">
        <button class="btn btn-outline-secondary" data-act="dec" data-id="${it.id}" aria-label="Disminuir">
          <span class="material-symbols-outlined">remove</span>
        </button>
        <button class="btn btn-light disabled" tabindex="-1">${it.qty}</button>
        <button class="btn btn-outline-secondary" data-act="inc" data-id="${it.id}" aria-label="Aumentar">
          <span class="material-symbols-outlined">add</span>
        </button>
        <button class="btn btn-outline-danger" data-act="del" data-id="${it.id}" aria-label="Eliminar" title="Eliminar">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>`;
    itemsWrap.appendChild(li);
  });
  totalEl.textContent = "$"+ total.toLocaleString();
}

document.addEventListener("click",(e)=>{
  const btn = e.target.closest("[data-act]");
  if(!btn) return;
  const id = Number(btn.dataset.id);
  if(btn.dataset.act==="inc") changeQty(id,1);
  if(btn.dataset.act==="dec") changeQty(id,-1);
  if(btn.dataset.act==="del") removeFromCart(id);
});
document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("clearCart")?.addEventListener("click", clearCart);
  document.getElementById("checkoutBtn")?.addEventListener("click", ()=>alert("Checkout de ejemplo"));
  updateCartUI();
});

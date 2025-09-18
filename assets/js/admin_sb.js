
document.addEventListener("DOMContentLoaded", ()=>{
  // Sidebar toggle (mobile)
  document.querySelectorAll("[data-action='toggle-sidebar']").forEach(btn=>{
    btn.addEventListener("click", ()=> document.body.classList.toggle("sidebar-open"));
  });

  // Fill dashboard latest products
  const dashTbody = document.querySelector("#tblProductosDash tbody");
  if(dashTbody){
    const rows = (window.App?.productos || []).slice(-5).map(p=>({codigo:p.codigo,nombre:p.nombre,precio:p.precio,stock:p.stock,categoria:p.categoria}));
    dashTbody.innerHTML = rows.map(r=>`<tr>
      <td>${r.codigo}</td><td>${r.nombre}</td><td>$${Number(r.precio).toLocaleString()}</td><td>${r.stock}</td><td>${r.categoria}</td>
    </tr>`).join("");
  }

  // Productos table
  const tbodyP = document.querySelector("#tblProductos tbody");
  if(tbodyP){
    const base = (window.App?.productos || []).map(p=>({codigo:p.codigo,nombre:p.nombre,precio:p.precio,stock:p.stock,categoria:p.categoria}));
    const extra = JSON.parse(localStorage.getItem("productosAdmin")||"[]");
    const rows = [...base, ...extra];
    tbodyP.innerHTML = rows.map(r=>`<tr>
      <td>${r.codigo}</td><td>${r.nombre}</td><td>$${Number(r.precio).toLocaleString()}</td><td>${r.stock}</td><td>${r.categoria}</td>
    </tr>`).join("");
  }

  // Usuarios table
  const tbodyU = document.querySelector("#tblUsuarios tbody");
  if(tbodyU){
    const rows = JSON.parse(localStorage.getItem("usuariosAdmin")||"[]");
    tbodyU.innerHTML = rows.map(r=>`<tr>
      <td>${r.run}</td><td>${r.nombres} ${r.apellidos}</td><td>${r.correo}</td><td>${r.tipo}</td><td>${r.region}</td><td>${r.comuna}</td>
    </tr>`).join("");
  }

  // Nuevo producto
  const formP = document.getElementById("formProducto");
  if(formP){
    const sel = formP.categoria;
    (window.App?.categorias || []).forEach(c=> sel.append(new Option(c,c)));
    formP.addEventListener("submit",(e)=>{
      e.preventDefault();
      if(!formP.checkValidity()){ formP.classList.add("was-validated"); return; }
      const productos = JSON.parse(localStorage.getItem("productosAdmin")||"[]");
      productos.push(Object.fromEntries(new FormData(formP)));
      localStorage.setItem("productosAdmin", JSON.stringify(productos));
      alert("Producto guardado");
      location.href="productos.html";
    });
  }

  // Nuevo usuario
  const formU = document.getElementById("formUsuarioAdmin");
  if(formU){
    const reg = document.getElementById("regionAdmin");
    const com = document.getElementById("comunaAdmin");
    (window.App?.regiones || []).forEach(r=> reg.append(new Option(r.nombre, r.nombre)));
    reg.addEventListener("change", ()=>{
      com.innerHTML=""; const r=(window.App?.regiones || []).find(x=>x.nombre===reg.value);
      (r?.comunas||[]).forEach(c=> com.append(new Option(c,c)));
    });
    formU.addEventListener("submit",(e)=>{
      e.preventDefault();
      if(!formU.checkValidity()){ formU.classList.add("was-validated"); return; }
      const usuarios = JSON.parse(localStorage.getItem("usuariosAdmin")||"[]");
      usuarios.push(Object.fromEntries(new FormData(formU)));
      localStorage.setItem("usuariosAdmin", JSON.stringify(usuarios));
      alert("Usuario guardado");
      location.href="usuarios.html";
    });
  }
});

// Datos simulados y catálogos
window.App = window.App || {};
App.categorias = ["Bebidas","Snacks","Lácteos","Tecnología"];
App.productos = [
  {id:1, codigo:"P-001", nombre:"Leche Entera 1L", precio:1290, stock:20, categoria:"Lácteos", img:"img/leche.jpg", descripcion:"Leche entera larga vida."},
  {id:2, codigo:"P-002", nombre:"Galletas Choco", precio:990, stock:50, categoria:"Snacks", img:"img/galletas.jpg", descripcion:"Galletas de chocolate."},
  {id:3, codigo:"P-003", nombre:"Bebida Cola 1.5L", precio:1890, stock:35, categoria:"Bebidas", img:"img/cola.jpg", descripcion:"Bebida cola 1.5 litros."},
  {id:4, codigo:"P-004", nombre:"Audífonos USB", precio:9990, stock:10, categoria:"Tecnología", img:"img/audifonos.jpg", descripcion:"Audífonos económicos con micrófono."}
];
App.regiones = [
  { nombre: "Región Metropolitana", comunas:["Santiago","Maipú","Puente Alto","Ñuñoa"]},
  { nombre: "Valparaíso", comunas:["Valparaíso","Viña del Mar","Quilpué"]},
  { nombre: "Biobío", comunas:["Concepción","Talcahuano","Los Ángeles"]}
];

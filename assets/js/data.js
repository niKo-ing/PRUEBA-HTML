// Periféricos y catálogos
window.App = window.App || {};
App.categorias = ["Teclados","Mouses","Audio","Streaming","Almacenamiento"];
App.productos = [
  {id:1, codigo:"P-KEY-001", nombre:"Teclado Mecánico RGB", precio:39990, stock:20, categoria:"Teclados", img:"img/teclado_rgb.jpg", descripcion:"Switches rojos, anti-ghosting, iluminación dinámica."},
  {id:2, codigo:"P-MOU-002", nombre:"Mouse Gamer 6 Botones", precio:19990, stock:35, categoria:"Mouses", img:"img/mouse_gamer.jpg", descripcion:"800–6400 DPI, sensor óptico, ergonomía ambidiestra."},
  {id:3, codigo:"P-AUD-003", nombre:"Headset 7.1 con Mic", precio:34990, stock:18, categoria:"Audio", img:"img/headset.jpg", descripcion:"Sonido envolvente, cancelación de ruido, almohadillas suaves."},
  {id:4, codigo:"P-STR-004", nombre:"Webcam Full HD 1080p", precio:29990, stock:25, categoria:"Streaming", img:"img/webcam.jpg", descripcion:"Autofoco, micrófono integrado, clip universal."},
  {id:5, codigo:"P-STR-005", nombre:"Micrófono USB Cardioide", precio:32990, stock:15, categoria:"Streaming", img:"img/microfono.jpg", descripcion:"Ideal para streaming y videollamadas."},
  {id:6, codigo:"P-AUD-006", nombre:"Parlantes 2.1 Compactos", precio:27990, stock:12, categoria:"Audio", img:"img/parlantes.jpg", descripcion:"Bajos potentes, control de volumen frontal."},
  {id:7, codigo:"P-MOU-007", nombre:"Mousepad XL RGB", precio:14990, stock:40, categoria:"Mouses", img:"img/mousepad.jpg", descripcion:"Superficie speed, bordes cosidos, 10 modos RGB."},
  {id:8, codigo:"P-ALM-008", nombre:"SSD Externo 1TB USB-C", precio:89990, stock:10, categoria:"Almacenamiento", img:"img/ssd_externo.jpg", descripcion:"Velocidad hasta 1.000 MB/s, carcasa metálica."}
];
App.regiones = [
  { nombre: "Región Metropolitana", comunas:["Santiago","Maipú","Puente Alto","Ñuñoa"]},
  { nombre: "Valparaíso", comunas:["Valparaíso","Viña del Mar","Quilpué"]},
  { nombre: "Biobío", comunas:["Concepción","Talcahuano","Los Ángeles"]}
];

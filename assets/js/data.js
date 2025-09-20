// assets/js/data.js

// Categorías de la tienda
window.App = window.App || {};
App.categorias = ["Teclados", "Mouses", "Audio", "Streaming", "Almacenamiento"];

// Productos de ejemplo
App.productos = [
  {
    id: 1,
    codigo: "P-KEY-001",
    nombre: "Teclado Mecánico RGB",
    precio: 39990,
    stock: 20,
    categoria: "Teclados",
    img: "assets/img/teclado_rgb.jpg",
    descripcion: "Switches rojos, anti-ghosting, iluminación dinámica."
  },
  {
    id: 2,
    codigo: "P-MOU-002",
    nombre: "Mouse Gamer 6 Botones",
    precio: 19990,
    stock: 35,
    categoria: "Mouses",
    img: "assets/img/mouse_gamer.jpg",
    images: [
      "assets/img/mouse_gamer.jpg",
      "assets/img/mouse_gamer_izq.png",
      "assets/img/mouse_gamer_der.jpg",
      "assets/img/mouse_gamer_trasero.jpg"
    ],
    descripcion: "800–6400 DPI, sensor óptico, ergonomía ambidiestra."
  },
  {
    id: 3,
    codigo: "P-AUD-003",
    nombre: "Headset 7.1 Surround",
    precio: 29990,
    stock: 12,
    categoria: "Audio",
    img: "assets/img/headset.jpg",
    descripcion: "Sonido envolvente, micrófono retráctil con cancelación de ruido."
  },
  {
    id: 4,
    codigo: "P-STR-004",
    nombre: "Micrófono Streaming USB",
    precio: 45990,
    stock: 8,
    categoria: "Streaming",
    img: "assets/img/microfono.jpg",
    descripcion: "Micrófono cardioide con soporte antivibración y pop filter."
  },
  {
    id: 5,
    codigo: "P-ALM-005",
    nombre: "SSD Externo 1TB",
    precio: 74990,
    stock: 15,
    categoria: "Almacenamiento",
    img: "assets/img/ssd_externo.jpg",
    descripcion: "Conexión USB 3.2, compacto y resistente a golpes."
  },
  {
  id: 6,
  codigo: "P-STR-006",
  nombre: "Webcam Full HD 1080p",
  precio: 32990,
  stock: 18,
  categoria: "Streaming",              // así tendrá relacionados con el micrófono
  img: "assets/img/webcam.jpg",        // pon el archivo en assets/img/webcam.jpg
  images: [
    "assets/img/webcam.jpg"
  ],
  descripcion: "Webcam 1080p con autoenfoque y micrófono integrado, ideal para streaming y clases online."
  }
];

// Regiones y comunas de Chile
App.regiones = [
  {
    nombre: "Arica y Parinacota",
    comunas: ["Arica", "Camarones", "Putre", "General Lagos"]
  },
  {
    nombre: "Tarapacá",
    comunas: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"]
  },
  {
    nombre: "Antofagasta",
    comunas: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"]
  },
  {
    nombre: "Atacama",
    comunas: ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"]
  },
  {
    nombre: "Coquimbo",
    comunas: ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"]
  },
  {
    nombre: "Valparaíso",
    comunas: ["Valparaíso", "Viña del Mar", "Concón", "Quilpué", "Villa Alemana", "Casablanca", "Quintero", "Puchuncaví", "Juan Fernández", "San Antonio", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "Quillota", "La Calera", "Hijuelas", "La Cruz", "Nogales", "San Felipe", "Llaillay", "Catemu", "Panquehue", "Putaendo", "Santa María", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "Petorca", "Cabildo", "La Ligua", "Papudo", "Zapallar"]
  },
  {
    nombre: "Metropolitana de Santiago",
    comunas: ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Til Til", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"]
  },
  {
    nombre: "O'Higgins",
    comunas: ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"]
  },
  {
    nombre: "Maule",
    comunas: ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"]
  },
  {
    nombre: "Ñuble",
    comunas: ["Chillán", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Chillán Viejo", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"]
  },
  {
    nombre: "Biobío",
    comunas: ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"]
  },
  {
    nombre: "La Araucanía",
    comunas: ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"]
  },
  {
    nombre: "Los Ríos",
    comunas: ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"]
  },
  {
    nombre: "Los Lagos",
    comunas: ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"]
  },
  {
    nombre: "Aysén",
    comunas: ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"]
  },
  {
    nombre: "Magallanes",
    comunas: ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
  }
];
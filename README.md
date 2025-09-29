# 🖥️ Sistema de Venta de Periféricos

Proyecto académico desarrollado como parte de la asignatura **DSY1104 - Evaluación Parcial 1**, bajo la guía de la Escuela de Informática y Telecomunicaciones - DUOC UC.  

Autores:  
- Nicolás Estefanía  
- Alexsander Rosales  
- Valentina Morales  

---

## 📌 Descripción
Este sistema es una **aplicación web para la venta de periféricos de computadora**.  
Permite a los usuarios navegar por un catálogo de productos (mouse, teclados, audífonos, etc.), agregarlos al carrito de compras y realizar pedidos en línea de manera rápida, sencilla y segura.  

---

## 🚀 Funcionalidades Principales
- **Registro y autenticación de usuarios** (Clientes y Administradores).  
- **Gestión de productos**: alta, baja y modificación de periféricos.  
- **Carrito de compras** con cálculo dinámico de totales.  
- **Gestión de pedidos** y control de stock.  
- **Panel de administración** para la gestión de usuarios, productos y ventas.  
- **Reportes básicos** de ventas para administrador.  

---

## 🛠️ Tecnologías Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5.  
- **Backend**: JavaScript (validaciones, lógica de negocio).  
- **Base de Datos**: Relacional (ejemplo: MySQL o SQLite).  
- **APIs Externas**: Google Maps API (para ubicación de la tienda o clientes).  

---

## 👥 Perfiles de Usuario
- **Cliente**: navega por el catálogo, agrega productos al carrito y realiza compras.  
- **Administrador**: gestiona productos, controla inventario, administra usuarios y revisa reportes de ventas.  

---

## 📂 Estructura del Proyecto
```
/proyecto
│── /admin           # Módulos de administración (usuarios, productos, ventas)
│── /assets
│   ├── /css         # Estilos globales y de administración
│   ├── /js          # Scripts de validación y lógica
│   └── /img         # Imágenes de productos y recursos gráficos
│── /pages           # Páginas visibles (login, registro, catálogo, carrito)
│── index.html       # Página principal con catálogo de productos
│── README.md        # Documentación del proyecto
```

---

## ✅ Requisitos
- Navegador moderno (Chrome, Firefox, Edge).  
- Servidor web local (ej. XAMPP, WAMP, Live Server de VSCode).  
- Conexión a internet (para APIs externas como Google Maps).  

---

## 🔒 Buenas Prácticas Aplicadas
- Validación de formularios en cliente y servidor.  
- Encriptación de contraseñas (hash).  
- Diseño **responsive** para PC y dispositivos móviles.  
- Código modular y documentado.  
- Cumplimiento con normas básicas de accesibilidad (alt en imágenes, contraste, semántica HTML).  

---

## 🚧 Requisitos Futuros
- Integración con pasarelas de pago en línea.  
- Sistema de cupones de descuento.  
- Reportes avanzados de ventas y estadísticas.  
- Aplicación móvil para clientes.  

---

## 📜 Licencia
Proyecto académico – uso educativo.  


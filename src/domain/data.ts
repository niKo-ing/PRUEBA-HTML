import type { Product } from "./types";

export const productos: Product[] = [
  { id: 1, slug: "teclado-mecanico-rgb", nombre: "Teclado Mecánico RGB", precio: 39990, stock: 20, categoria: "Teclados", img: "/assets/img/teclado_rgb.jpg", rating: 4.5 },
  { id: 2, slug: "mouse-gamer-6-botones", nombre: "Mouse Gamer 6 Botones", precio: 19990, stock: 35, categoria: "Mouses", img: "/assets/img/mouse_gamer.jpg", rating: 4.2 },
  { id: 3, slug: "headset-7-1-surround", nombre: "Headset 7.1 Surround", precio: 29990, stock: 12, categoria: "Audio", img: "/assets/img/headset.jpg", rating: 4.4 },
  { id: 4, slug: "microfono-streaming-usb", nombre: "Micrófono Streaming USB", precio: 45990, stock: 8,  categoria: "Streaming", img: "/assets/img/microfono.jpg", rating: 4.6 }
];
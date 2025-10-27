export type Product = {
  id: number;
  slug?: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string | string[];
  img: string;
  images?: string[];
  descripcion?: string;
  rating?: number;
  tags?: string[];
};

export type CartItem = { id: number; qty: number };
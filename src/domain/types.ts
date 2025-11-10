/**
 * @file Modelos del dominio: Product y CartItem.
 * @description Define las entidades principales usadas en catálogo y carrito.
 * @author Equipo Todobaratisimo
 * @date 2025-11-10
 */
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

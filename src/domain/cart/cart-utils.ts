/**
 * Utilidades del carrito para pruebas y lógica de dominio.
 *
 * Propósito
 * - Proveer funciones puras para operar sobre estructuras tipo carrito sin dependencias de UI.
 * - Acepta campos bilingües: `precio|price` y `cantidad|quantity`, normalizados internamente.
 *
 * Tipos
 * - `CartLike`: estructura mínima con `id` y opcionales bilingües para nombre, precio y cantidad.
 *
 * API
 * - `calculateCartTotal(items)`: total del carrito en base a precio*cantidad.
 * - `calculateItemSubtotal(item)`: subtotal por ítem.
 * - `getCartItemCount(items)`: suma de cantidades.
 * - `addItemToCart(items, newItem)`: añade o acumula cantidad del ítem existente.
 * - `updateCartItemQuantity(items, id, newQty)`: fija nueva cantidad respetando la propiedad presente.
 * - `removeItemFromCart(items, id)`: elimina ítem por id.
 * - `findItemInCart(items, id)`: busca y retorna ítem.
 * - `validateQuantity(q)`, `validatePrice(p)`: validaciones básicas.
 * - `serializeCart(items)`, `deserializeCart(json)`: conversión segura a/desde JSON.
 *
 * Consideraciones de TypeScript
 * - Evita asignar `undefined` a opcionales por `exactOptionalPropertyTypes`.
 * - Usa guardas al acceder por índice debido a `noUncheckedIndexedAccess`.
 */

export type CartLike = {
  id: number;
  // nombres opcionales en ambos idiomas
  nombre?: string;
  name?: string;
  // precio/cantidad en ambos idiomas
  precio?: number;
  price?: number;
  cantidad?: number;
  quantity?: number;
  // medios opcionales
  img?: string;
  image?: string;
};

const getQty = (it: CartLike) => (it.cantidad ?? it.quantity ?? 0);
const getPrice = (it: CartLike) => (it.precio ?? it.price ?? 0);

export function calculateCartTotal(items: CartLike[]): number {
  return items.reduce((sum, it) => sum + getPrice(it) * getQty(it), 0);
}

export function calculateItemSubtotal(item: CartLike): number {
  return getPrice(item) * getQty(item);
}

export function getCartItemCount(items: CartLike[]): number {
  return items.reduce((sum, it) => sum + getQty(it), 0);
}

export function addItemToCart(items: CartLike[], newItem: CartLike): CartLike[] {
  const idx = items.findIndex((i) => i.id === newItem.id);
  if (idx === -1) {
    return [...items, newItem];
  }
  const updated = [...items];
  const existing = updated[idx];
  if (!existing) {
    // índice fuera de rango por configuración estricta; devuelve original sin cambios
    return items;
  }
  const mergedQty = getQty(existing) + getQty(newItem);
  const next: CartLike = { ...existing };
  // Actualiza solo la propiedad existente sin asignar undefined explícito
  if (existing.cantidad !== undefined) {
    next.cantidad = mergedQty;
  } else {
    next.quantity = mergedQty;
  }
  updated[idx] = next;
  return updated;
}

export function updateCartItemQuantity(items: CartLike[], id: number, newQty: number): CartLike[] {
  return items.map((it) => {
    if (it.id !== id) return it;
    const next: CartLike = { ...it };
    if (it.cantidad !== undefined) {
      next.cantidad = newQty;
    } else {
      next.quantity = newQty;
    }
    return next;
  });
}

export function removeItemFromCart(items: CartLike[], id: number): CartLike[] {
  return items.filter((it) => it.id !== id);
}

export function findItemInCart(items: CartLike[], id: number): CartLike | undefined {
  return items.find((it) => it.id === id);
}

export function validateQuantity(q: number): boolean {
  return Number.isInteger(q) && q > 0;
}

export function validatePrice(p: number): boolean {
  return p > 0;
}

export function serializeCart(items: CartLike[]): string {
  return JSON.stringify(items);
}

export function deserializeCart(json: string): CartLike[] {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

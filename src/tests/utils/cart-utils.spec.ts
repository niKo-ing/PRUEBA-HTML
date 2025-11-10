// src/tests/utils/cart-utils.spec.ts
// Pruebas unitarias de utilidades del carrito (Jasmine + Karma en JSDOM)
import {
  calculateCartTotal,
  calculateItemSubtotal,
  getCartItemCount,
  addItemToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  findItemInCart,
  validateQuantity,
  validatePrice,
  serializeCart,
  deserializeCart,
  type CartLike,
} from "../../domain/cart/cart-utils";

describe("cart-utils", () => {
  it("calcula el total del carrito con campos bilingües", () => {
    const items: CartLike[] = [
      { id: 1, price: 10, quantity: 2 },
      { id: 2, precio: 5, cantidad: 3 },
    ];
    expect(calculateCartTotal(items)).toBe(35);
  });

  it("calcula el subtotal por ítem", () => {
    const item: CartLike = { id: 1, price: 12, quantity: 4 };
    expect(calculateItemSubtotal(item)).toBe(48);
  });

  it("suma correctamente las cantidades totales", () => {
    const items: CartLike[] = [
      { id: 1, quantity: 2 },
      { id: 2, cantidad: 3 },
      { id: 3, quantity: 1 },
    ];
    expect(getCartItemCount(items)).toBe(6);
  });

  it("añade nuevo ítem cuando no existe", () => {
    const items: CartLike[] = [];
    const after = addItemToCart(items, { id: 1, quantity: 2, price: 10 });
    expect(after.length).toBe(1);
    expect(after[0]?.id).toBe(1);
    expect(after[0]?.quantity).toBe(2);
  });

  it("acumula cantidad respetando la propiedad existente (cantidad)", () => {
    const items: CartLike[] = [{ id: 1, cantidad: 1, precio: 9 }];
    const after = addItemToCart(items, { id: 1, quantity: 2 });
    expect(after[0]?.cantidad).toBe(3);
    expect("quantity" in (after[0] as object)).toBe(false);
  });

  it("acumula cantidad respetando la propiedad existente (quantity)", () => {
    const items: CartLike[] = [{ id: 2, quantity: 2, price: 4 }];
    const after = addItemToCart(items, { id: 2, cantidad: 3 });
    expect(after[0]?.quantity).toBe(5);
    expect("cantidad" in (after[0] as object)).toBe(false);
  });

  it("actualiza cantidad de un ítem sin cambiar la clave presente", () => {
    const items: CartLike[] = [{ id: 1, cantidad: 1 }];
    const after = updateCartItemQuantity(items, 1, 10);
    expect(after[0]?.cantidad).toBe(10);
    expect("quantity" in (after[0] as object)).toBe(false);
  });

  it("elimina ítems por id", () => {
    const items: CartLike[] = [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 3 },
    ];
    const after = removeItemFromCart(items, 1);
    expect(after.length).toBe(1);
    expect(after[0]?.id).toBe(2);
  });

  it("encuentra ítems existentes por id", () => {
    const items: CartLike[] = [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 3 },
    ];
    const found = findItemInCart(items, 2);
    expect(found?.id).toBe(2);
  });

  it("valida cantidad y precio correctamente", () => {
    expect(validateQuantity(1)).toBeTrue();
    expect(validateQuantity(0)).toBeFalse();
    expect(validateQuantity(1.5)).toBeFalse();
    expect(validatePrice(0.01)).toBeTrue();
    expect(validatePrice(0)).toBeFalse();
  });

  it("serializa y deserializa el carrito de forma segura", () => {
    const items: CartLike[] = [
      { id: 1, price: 10, quantity: 2 },
      { id: 2, precio: 5, cantidad: 3 },
    ];
    const json = serializeCart(items);
    const roundtrip = deserializeCart(json);
    expect(roundtrip.length).toBe(2);
    expect(roundtrip[0]?.id).toBe(1);
    // Deserialización robusta sobre JSON inválido
    expect(deserializeCart("not-json")).toEqual([]);
  });
});

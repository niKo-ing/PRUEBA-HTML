// Utilidades del carrito para pruebas y lógica básica.
// Estas funciones aceptan items con campos en inglés o en español.
// Normalización: precio/price y cantidad/quantity se interpretan de forma equivalente.
const getQty = (it) => (it.cantidad ?? it.quantity ?? 0);
const getPrice = (it) => (it.precio ?? it.price ?? 0);
export function calculateCartTotal(items) {
    return items.reduce((sum, it) => sum + getPrice(it) * getQty(it), 0);
}
export function calculateItemSubtotal(item) {
    return getPrice(item) * getQty(item);
}
export function getCartItemCount(items) {
    return items.reduce((sum, it) => sum + getQty(it), 0);
}
export function addItemToCart(items, newItem) {
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
    const next = { ...existing };
    // Actualiza solo la propiedad existente sin asignar undefined explícito
    if (existing.cantidad !== undefined) {
        next.cantidad = mergedQty;
    }
    else {
        next.quantity = mergedQty;
    }
    updated[idx] = next;
    return updated;
}
export function updateCartItemQuantity(items, id, newQty) {
    return items.map((it) => {
        if (it.id !== id)
            return it;
        const next = { ...it };
        if (it.cantidad !== undefined) {
            next.cantidad = newQty;
        }
        else {
            next.quantity = newQty;
        }
        return next;
    });
}
export function removeItemFromCart(items, id) {
    return items.filter((it) => it.id !== id);
}
export function findItemInCart(items, id) {
    return items.find((it) => it.id === id);
}
export function validateQuantity(q) {
    return Number.isInteger(q) && q > 0;
}
export function validatePrice(p) {
    return p > 0;
}
export function serializeCart(items) {
    return JSON.stringify(items);
}
export function deserializeCart(json) {
    try {
        const arr = JSON.parse(json);
        return Array.isArray(arr) ? arr : [];
    }
    catch {
        return [];
    }
}

import { calculateCartTotal, calculateItemSubtotal, getCartItemCount, addItemToCart, updateCartItemQuantity, removeItemFromCart, findItemInCart, validateQuantity, validatePrice, serializeCart, deserializeCart } from '../../domain/cart/cart-utils.ts';
describe('Cart Utilities', () => {
    const mockCartItems = [
        { id: 1, name: 'Product 1', price: 10000, quantity: 2, image: '/img1.jpg' },
        { id: 2, name: 'Product 2', price: 15000, quantity: 1, image: '/img2.jpg' }
    ];
    describe('calculateCartTotal', () => {
        it('should calculate total for multiple items', () => {
            const total = calculateCartTotal(mockCartItems);
            expect(total).toBe(35000); // (10000 * 2) + (15000 * 1)
        });
        it('should return 0 for empty cart', () => {
            const total = calculateCartTotal([]);
            expect(total).toBe(0);
        });
        it('should handle single item cart', () => {
            const singleItem = [{ id: 1, name: 'Product', price: 5000, quantity: 1, image: '/img.jpg' }];
            const total = calculateCartTotal(singleItem);
            expect(total).toBe(5000);
        });
    });
    describe('calculateItemSubtotal', () => {
        it('should calculate subtotal for item', () => {
            const item = { id: 1, name: 'Product', price: 10000, quantity: 3, image: '/img.jpg' };
            const subtotal = calculateItemSubtotal(item);
            expect(subtotal).toBe(30000);
        });
        it('should handle zero quantity', () => {
            const item = { id: 1, name: 'Product', price: 10000, quantity: 0, image: '/img.jpg' };
            const subtotal = calculateItemSubtotal(item);
            expect(subtotal).toBe(0);
        });
    });
    describe('getCartItemCount', () => {
        it('should count total items in cart', () => {
            const count = getCartItemCount(mockCartItems);
            expect(count).toBe(3); // 2 + 1
        });
        it('should return 0 for empty cart', () => {
            const count = getCartItemCount([]);
            expect(count).toBe(0);
        });
        it('should handle single item', () => {
            const singleItem = [{ id: 1, name: 'Product', price: 5000, quantity: 5, image: '/img.jpg' }];
            const count = getCartItemCount(singleItem);
            expect(count).toBe(5);
        });
    });
    describe('addItemToCart', () => {
        it('should add new item to empty cart', () => {
            const newItem = { id: 1, name: 'New Product', price: 20000, quantity: 1, image: '/new.jpg' };
            const result = addItemToCart([], newItem);
            expect(result.length).toBe(1);
            expect(result[0]).toEqual(newItem);
        });
        it('should add new item to existing cart', () => {
            const newItem = { id: 3, name: 'New Product', price: 20000, quantity: 1, image: '/new.jpg' };
            const result = addItemToCart(mockCartItems, newItem);
            expect(result.length).toBe(3);
            expect(result[2]).toEqual(newItem);
        });
        it('should merge existing item by increasing quantity', () => {
            const existingItem = { id: 1, name: 'Product 1', price: 10000, quantity: 1, image: '/img1.jpg' };
            const result = addItemToCart(mockCartItems, existingItem);
            expect(result.length).toBe(2);
            expect(result[0].quantity).toBe(3); // 2 + 1
        });
    });
    describe('updateCartItemQuantity', () => {
        it('should update quantity for existing item', () => {
            const result = updateCartItemQuantity(mockCartItems, 1, 5);
            expect(result[0].quantity).toBe(5);
            expect(result[1].quantity).toBe(1); // Unchanged
        });
        it('should not modify cart if item not found', () => {
            const result = updateCartItemQuantity(mockCartItems, 99, 5);
            expect(result).toEqual(mockCartItems);
        });
        it('should handle zero quantity', () => {
            const result = updateCartItemQuantity(mockCartItems, 1, 0);
            expect(result[0].quantity).toBe(0);
        });
    });
    describe('removeItemFromCart', () => {
        it('should remove item from cart', () => {
            const result = removeItemFromCart(mockCartItems, 1);
            expect(result.length).toBe(1);
            expect(result[0].id).toBe(2);
        });
        it('should not modify cart if item not found', () => {
            const result = removeItemFromCart(mockCartItems, 99);
            expect(result).toEqual(mockCartItems);
        });
        it('should handle removing from single item cart', () => {
            const singleItem = [{ id: 1, name: 'Product', price: 5000, quantity: 1, image: '/img.jpg' }];
            const result = removeItemFromCart(singleItem, 1);
            expect(result.length).toBe(0);
        });
    });
    describe('findItemInCart', () => {
        it('should find existing item', () => {
            const item = findItemInCart(mockCartItems, 1);
            expect(item).toBeDefined();
            expect(item?.id).toBe(1);
            expect(item?.name).toBe('Product 1');
        });
        it('should return undefined for non-existing item', () => {
            const item = findItemInCart(mockCartItems, 99);
            expect(item).toBeUndefined();
        });
        it('should handle empty cart', () => {
            const item = findItemInCart([], 1);
            expect(item).toBeUndefined();
        });
    });
    describe('validateQuantity', () => {
        it('should validate positive quantities', () => {
            expect(validateQuantity(1)).toBe(true);
            expect(validateQuantity(5)).toBe(true);
            expect(validateQuantity(100)).toBe(true);
        });
        it('should reject invalid quantities', () => {
            expect(validateQuantity(0)).toBe(false);
            expect(validateQuantity(-1)).toBe(false);
            expect(validateQuantity(-5)).toBe(false);
        });
        it('should reject non-integer quantities', () => {
            expect(validateQuantity(1.5)).toBe(false);
            expect(validateQuantity(0.5)).toBe(false);
        });
    });
    describe('validatePrice', () => {
        it('should validate positive prices', () => {
            expect(validatePrice(1000)).toBe(true);
            expect(validatePrice(50000)).toBe(true);
            expect(validatePrice(1)).toBe(true);
        });
        it('should reject invalid prices', () => {
            expect(validatePrice(0)).toBe(false);
            expect(validatePrice(-1000)).toBe(false);
            expect(validatePrice(-1)).toBe(false);
        });
        it('should handle decimal prices', () => {
            expect(validatePrice(1000.50)).toBe(true);
            expect(validatePrice(0.99)).toBe(true);
        });
    });
    describe('serializeCart', () => {
        it('should serialize cart to JSON string', () => {
            const json = serializeCart(mockCartItems);
            expect(typeof json).toBe('string');
            expect(json).toContain('Product 1');
            expect(json).toContain('Product 2');
        });
        it('should handle empty cart', () => {
            const json = serializeCart([]);
            expect(json).toBe('[]');
        });
        it('should produce valid JSON', () => {
            const json = serializeCart(mockCartItems);
            expect(() => JSON.parse(json)).not.toThrow();
        });
    });
    describe('deserializeCart', () => {
        it('should deserialize JSON string to cart', () => {
            const json = JSON.stringify(mockCartItems);
            const cart = deserializeCart(json);
            expect(cart.length).toBe(2);
            expect(cart[0].name).toBe('Product 1');
            expect(cart[1].name).toBe('Product 2');
        });
        it('should handle empty JSON array', () => {
            const cart = deserializeCart('[]');
            expect(cart.length).toBe(0);
        });
        it('should handle invalid JSON gracefully', () => {
            const cart = deserializeCart('invalid json');
            expect(cart.length).toBe(0);
        });
        it('should handle cart with special characters in names', () => {
            const specialItems = [
                { id: 1, name: 'Producto "Especial"', price: 10000, quantity: 1, image: '/img.jpg' },
                { id: 2, name: "Producto 'Con Comillas'", price: 15000, quantity: 1, image: '/img.jpg' }
            ];
            const json = serializeCart(specialItems);
            const cart = deserializeCart(json);
            expect(cart.length).toBe(2);
            expect(cart[0].name).toBe('Producto "Especial"');
            expect(cart[1].name).toBe("Producto 'Con Comillas'");
        });
    });
});

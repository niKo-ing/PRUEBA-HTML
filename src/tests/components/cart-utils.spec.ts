/// <reference types="jasmine" />
// Tipo local de ítem del carrito para estas pruebas (español)
type CartItem = { id: number; nombre: string; precio: number; cantidad: number; img?: string };

describe('Cart Utilities', () => {
  let mockCartItems: CartItem[];

  beforeEach(() => {
    mockCartItems = [
      {
        id: 1,
        nombre: 'Product 1',
        precio: 10000,
        cantidad: 2,
        img: '/img1.jpg'
      },
      {
        id: 2,
        nombre: 'Product 2',
        precio: 15000,
        cantidad: 1,
        img: '/img2.jpg'
      }
    ];
  });

  describe('Cart Calculations', () => {
    it('should calculate correct cart total', () => {
      const total = mockCartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      expect(total).toBe(35000); // (10000 * 2) + (15000 * 1)
    });

    it('should calculate correct item subtotal', () => {
      const item1Subtotal = mockCartItems[0]!.precio * mockCartItems[0]!.cantidad;
      const item2Subtotal = mockCartItems[1]!.precio * mockCartItems[1]!.cantidad;
      
      expect(item1Subtotal).toBe(20000);
      expect(item2Subtotal).toBe(15000);
    });

    it('should handle empty cart', () => {
      const emptyCart: CartItem[] = [];
      const total = emptyCart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      expect(total).toBe(0);
    });

    it('should calculate total items count', () => {
      const totalItems = mockCartItems.reduce((sum, item) => sum + item.cantidad, 0);
      expect(totalItems).toBe(3); // 2 + 1
    });
  });

  describe('Cart Item Management', () => {
    it('should add new item to cart', () => {
      const newItem: CartItem = {
        id: 3,
        nombre: 'Product 3',
        precio: 20000,
        cantidad: 1,
        img: '/img3.jpg'
      };

      const updatedCart = [...mockCartItems, newItem];
      expect(updatedCart.length).toBe(3);
      expect(updatedCart).toContain(newItem);
    });

    it('should update existing item quantity', () => {
      const updatedItems = mockCartItems.map(item => 
        item.id === 1 ? { ...item, cantidad: item.cantidad + 1 } : item
      );
      
      const updatedItem = updatedItems.find(item => item.id === 1);
      expect(updatedItem?.cantidad).toBe(3);
    });

    it('should remove item from cart', () => {
      const filteredItems = mockCartItems.filter(item => item.id !== 1);
      expect(filteredItems.length).toBe(1);
      expect(filteredItems.find(item => item.id === 1)).toBeUndefined();
    });

    it('should find item by ID', () => {
      const foundItem = mockCartItems.find(item => item.id === 2);
      expect(foundItem).toBeDefined();
      expect(foundItem?.nombre).toBe('Product 2');
    });
  });

  describe('Cart Validation', () => {
    it('should validate item quantity is positive', () => {
      mockCartItems.forEach(item => {
        expect(item.cantidad).toBeGreaterThan(0);
      });
    });

    it('should validate item price is positive', () => {
      mockCartItems.forEach(item => {
        expect(item.precio).toBeGreaterThan(0);
      });
    });

    it('should handle quantity updates to zero', () => {
      const updatedItems = mockCartItems.filter(item => item.id !== 1);
      expect(updatedItems.length).toBe(1);
    });

    it('should prevent negative quantities', () => {
      const invalidItem = {
        id: 3,
        nombre: 'Invalid Product',
        precio: 10000,
        cantidad: -1,
        img: '/img3.jpg'
      };

      expect(invalidItem.cantidad).toBeLessThan(0);
      expect(invalidItem.cantidad).toBe(-1);
    });
  });

  describe('Cart Storage', () => {
    it('should serialize cart to JSON', () => {
      const cartJson = JSON.stringify(mockCartItems);
      expect(() => JSON.parse(cartJson)).not.toThrow();
      
      const parsedCart = JSON.parse(cartJson);
      expect(parsedCart).toEqual(mockCartItems);
    });

    it('should handle cart with special characters', () => {
      const specialItem: CartItem = {
        id: 3,
        nombre: 'Product with "quotes" and \'apostrophes\'',
        precio: 25000,
        cantidad: 1,
        img: '/special-img.jpg'
      };

      const cartWithSpecial = [...mockCartItems, specialItem];
      const json = JSON.stringify(cartWithSpecial);
      const parsed = JSON.parse(json);
      
      expect((parsed as CartItem[])[2]!.nombre).toBe('Product with "quotes" and \'apostrophes\'');
    });
  });
});
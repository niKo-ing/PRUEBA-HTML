
/*! cart.js - Bootstrap 5 demo cart (vanilla JS) */
(function () {
  'use strict';

  var CART_KEY = 'demo_cart_items';

  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }

  function setCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateBadge();
  }

  function updateBadge() {
    var badge = document.getElementById('cartBadge');
    if (!badge) return;
    var items = getCart();
    var count = items.reduce(function (acc, it) { return acc + (it.qty || 1); }, 0);
    badge.textContent = String(count);
  }

  function addToCart(product) {
    var items = getCart();
    var idx = items.findIndex(function (i) { return i.id === product.id; });
    if (idx >= 0) {
      items[idx].qty = (items[idx].qty || 1) + 1;
    } else {
      items.push({ id: product.id, name: product.name, price: Number(product.price || 0), qty: 1 });
    }
    setCart(items);
  }

  function bindAddToCartButtons() {
    var buttons = document.querySelectorAll('.btn-add-to-cart');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = {
          id: String(btn.dataset.productId || ''),
          name: btn.dataset.name || 'Producto',
          price: Number(btn.dataset.price || 0)
        };
        addToCart(p);
        // Feedback visual no intrusivo
        var original = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Agregado';
        setTimeout(function () {
          btn.disabled = false;
          btn.textContent = original;
        }, 700);
      });
    });
  }

  function bindCartButton() {
    var btn = document.getElementById('btnCart');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var items = getCart();
      if (!items.length) {
        alert('Tu carrito está vacío');
        return;
      }
      var lines = items.map(function (i) {
        var subtotal = (i.qty || 1) * Number(i.price || 0);
        return i.name + ' x' + i.qty + ' — $' + subtotal.toFixed(2);
      });
      var total = items.reduce(function (acc, i) { return acc + (i.qty || 1) * Number(i.price || 0); }, 0);
      lines.push('----------------------');
      lines.push('Total: $' + total.toFixed(2));
      alert(lines.join('\n'));
    });
  }

  // Public API (optional, for future pages like cart.html)
  window.SimpleCart = {
    get: getCart,
    set: setCart,
    clear: function () { setCart([]); },
    remove: function (id) {
      var items = getCart().filter(function (i) { return i.id !== id; });
      setCart(items);
    },
    updateQty: function (id, qty) {
      var items = getCart();
      var idx = items.findIndex(function (i) { return i.id === id; });
      if (idx >= 0) {
        items[idx].qty = Math.max(0, Number(qty) || 0);
        if (items[idx].qty === 0) items.splice(idx, 1);
        setCart(items);
      }
    }
  };

  // Init
  ready(function () {
    updateBadge();
    bindAddToCartButtons();
    bindCartButton();
  });
})();

import React, { useState } from 'react';
import CartItem from '../../components/CartItem';
import './Cart.css';

const initialCart = [
  { id: 1, name: 'WELL SHOES SNEAKERS WHITE - 001', size: 40, price: 100, qty: 1 },
  { id: 2, name: 'Casual Sneakers brown - 015', size: 42, price: 100, qty: 1 },
  { id: 3, name: 'WS High SNEAKERS Tosca - 002', size: 41, price: 200, qty: 2 }
];

const Cart = () => {
  const [items, setItems] = useState(initialCart);

  const updateQty = (id, qty) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty } : it)));
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <div className="cart-page">
      <div className="cart-breadcrumb">Catalog &gt; Shopping cart</div>

      <h1 className="cart-title">Shopping Cart</h1>

      <div className="cart-content">
        <div className="cart-items">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQtyChange={(qty) => updateQty(item.id, qty)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>

        <aside className="cart-summary">
          <div className="summary-row">
            <div className="summary-label">Total Item</div>
            <div className="summary-value">{items.length}</div>
          </div>
          <div className="summary-row">
            <div className="summary-label">Total</div>
            <div className="summary-value">${subtotal}</div>
          </div>

          <div className="summary-actions">
            <button className="btn cancel">Cancel</button>
            <button className="btn checkout">Checkout</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;



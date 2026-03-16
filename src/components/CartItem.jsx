import React from 'react';
import './CartItem.css';

const CartItem = ({ item, onQtyChange, onRemove }) => {
  const increment = () => onQtyChange(item.qty + 1);
  const decrement = () => onQtyChange(Math.max(1, item.qty - 1));

  return (
    <div className="cart-item">
      <div className="ci-image">
        <div className="ci-placeholder" />
      </div>
      <div className="ci-details">
        <div className="ci-title">{item.name}</div>
        <div className="ci-meta">
          <span className="ci-size">Size : {item.size}</span>
          <span className="ci-gender">Man</span>
        </div>
        <div className="ci-bottom">
          <div className="ci-price">${item.price}</div>
          <div className="ci-qty">
            <button onClick={decrement} className="qty-btn">-</button>
            <div className="qty-val">{item.qty}X</div>
            <button onClick={increment} className="qty-btn">+</button>
          </div>
          <button className="ci-remove" onClick={onRemove}>Xóa</button>
        </div>
      </div>
      <div className="ci-subtotal">
        <div className="ci-sub-label">SubTotal</div>
        <div className="ci-sub-value">${item.price * item.qty}</div>
      </div>
    </div>
  );
};

export default CartItem;



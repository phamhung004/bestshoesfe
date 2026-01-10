import React, { useState } from 'react';
import CartItem from '../../components/CartItem';
import './Checkout.css';

const sampleReview = [
  { id: 1, name: 'WELL SHOES SNEAKERS WHITE - 001', qty: 1, price: 100 },
  { id: 2, name: 'Casual Sneakers brown - 015', qty: 1, price: 100 },
  { id: 3, name: 'WS High SNEAKERS Tosca - 002', qty: 2, price: 200 }
];

export default function Checkout() {
  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [zip, setZip] = useState('');
  const [discount, setDiscount] = useState('');

  const subtotal = sampleReview.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = 5;
  const tax = 0;
  const discountVal = discount ? 15 : 0;
  const total = subtotal + shipping + tax - discountVal;

  return (
    <div className="checkout-page">
      <div className="breadcrumb">Catalog &gt; Shopping cart &gt; Checkout</div>
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-grid">
        <section className="shipping-panel">
          <h2 className="panel-title">Shipping Information</h2>

          <div className="delivery-toggle">
            <button
              className={`toggle-btn ${deliveryMode === 'delivery' ? 'active' : ''}`}
              onClick={() => setDeliveryMode('delivery')}
            >
              Delivery
            </button>
            <button
              className={`toggle-btn ${deliveryMode === 'pickup' ? 'active' : ''}`}
              onClick={() => setDeliveryMode('pickup')}
            >
              Pickup
            </button>
          </div>

          <form className="shipping-form" onSubmit={(e) => e.preventDefault()}>
            <label className="field">
              <span className="label">Full Name <span className="required">*</span></span>
              <input value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder="Enter your fullname" />
            </label>

            <label className="field">
              <span className="label">Email Address <span className="required">*</span></span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" />
            </label>

            <label className="field">
              <span className="label">Phone Number <span className="required">*</span></span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
            </label>

            <label className="field">
              <span className="label">Country <span className="required">*</span></span>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">Choose your country</option>
                <option>United States</option>
                <option>Indonesia</option>
                <option>United Kingdom</option>
              </select>
            </label>

            <div className="row-3">
              <label className="field small">
                <span className="label">City</span>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter City" />
              </label>
              <label className="field small">
                <span className="label">State</span>
                <input value={stateVal} onChange={(e) => setStateVal(e.target.value)} placeholder="Enter State" />
              </label>
              <label className="field small">
                <span className="label">Zip Code</span>
                <input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Enter Zipcode" />
              </label>
            </div>
          </form>
        </section>

        <aside className="review-panel">
          <h2 className="panel-title">Review Your Cart</h2>

          <div className="review-list">
            {sampleReview.map((it) => (
              <div key={it.id} className="review-row">
                <div className="rev-left">
                  <div className="rev-thumb" />
                  <div className="rev-meta">
                    <div className="rev-name">{it.name}</div>
                    <div className="rev-qty">{it.qty}x</div>
                  </div>
                </div>
                <div className="rev-price">${it.price * it.qty}</div>
              </div>
            ))}
          </div>

          <div className="discount-row">
            <label className="field">
              <span className="label">Dicount Code</span>
              <div className="discount-controls">
                <input value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Enter discount code" />
                <button className="apply-btn" onClick={() => {}}>Apply</button>
              </div>
            </label>
          </div>

          <div className="totals">
            <div className="tot-row"><div>Sub total</div><div>${subtotal.toFixed(2)}</div></div>
            <div className="tot-row"><div>Shipping</div><div>${shipping.toFixed(2)}</div></div>
            <div className="tot-row"><div>Tax</div><div>${tax.toFixed(2)}</div></div>
            <div className="tot-row"><div>Discount</div><div>-${discountVal.toFixed(2)}</div></div>
            <div className="tot-row total"><div>Total</div><div>${total.toFixed(2)}</div></div>
          </div>

          <div className="payment-actions">
            <button className="btn back">Back</button>
            <button className="btn primary">Payment Method</button>
          </div>
        </aside>
      </div>
    </div>
  );
}



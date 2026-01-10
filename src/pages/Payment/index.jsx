import React, { useState } from 'react';
import './Payment.css';

export default function Payment() {
  const [method, setMethod] = useState('debit');
  const [name, setName] = useState('Jhon Well');
  const [cardNumber, setCardNumber] = useState('1234 1234 1234 1234');
  const [exp, setExp] = useState('06/2025');
  const [cvv, setCvv] = useState('123');

  const total = 390.0;

  return (
    <div className="payment-page">
      <div className="breadcrumb">Catalog &gt; Shopping cart &gt; Checkout &gt; Payment Method</div>
      <h1 className="payment-title">Payment method</h1>

      {/* <div className="payment-top">
        <div className="total-panel">
          <div className="total-label">Total payment</div>
          <div className="total-value">${total.toFixed(3)}</div>
        </div>
      </div> */}

      <div className="payment-grid">
        <main className="methods-column">
          <h2 className="section-title">Choose your payment method</h2>

          <div className="methods-list">
            <div
              className={`method-card ${method === 'debit' ? 'selected' : ''}`}
              onClick={() => setMethod('debit')}
            >
              <div className="method-left">
                <div className="method-illustration debit" />
                <div className="method-info">
                  <div className="method-name">Debit Card</div>
                  <div className="method-desc">Send from your Visa or Master Card should Arrive in seconds.</div>
                </div>
              </div>
              <div className="method-action" />
            </div>

            <div
              className={`method-card ${method === 'credit' ? 'selected' : ''}`}
              onClick={() => setMethod('credit')}
            >
              <div className="method-left">
                <div className="method-illustration" />
                <div className="method-info">
                  <div className="method-name">Credit Card</div>
                  <div className="method-desc">Send from your Visa or Master Card should Arrive in seconds.</div>
                </div>
              </div>
              <div className="method-action" />
            </div>

            <div
              className={`method-card ${method === 'transfer' ? 'selected' : ''}`}
              onClick={() => setMethod('transfer')}
            >
              <div className="method-left">
                <div className="method-illustration" />
                <div className="method-info">
                  <div className="method-name">Bank Transfer</div>
                  <div className="method-desc">Transfer the money using your bank account. Should arrive in seconds</div>
                </div>
              </div>
              <div className="method-action" />
            </div>
          </div>

          {method === 'debit' && (
            <section className="debit-details">
              <h3 className="section-title">Debit Card Detail</h3>
              <div className="field">
                <label>Name on card <span className="required">*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>Card Number <span className="required">*</span></label>
                <div className="card-row">
                  <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                  <div className="card-icon" />
                </div>
              </div>
              <div className="field-row">
                <div className="field small">
                  <label>Exp</label>
                  <input value={exp} onChange={(e) => setExp(e.target.value)} />
                </div>
                <div className="field small">
                  <label>Cvv</label>
                  <input value={cvv} onChange={(e) => setCvv(e.target.value)} />
                </div>
              </div>
            </section>
          )}
        </main>

        <aside className="payment-summary">
          <h2 className="section-title">Review Your Cart</h2>
          <div className="review-item">
            <div className="rev-left">
              <div className="rev-thumb" />
              <div className="rev-meta">
                <div className="rev-name">WELL SHOES SNEAKERS WHITE - 001</div>
                <div className="rev-sub">1x</div>
              </div>
            </div>
            <div className="rev-price">$100</div>
          </div>
          <div className="review-item">
            <div className="rev-left">
              <div className="rev-thumb" />
              <div className="rev-meta">
                <div className="rev-name">Casual Sneakers brown - 015</div>
                <div className="rev-sub">1x</div>
              </div>
            </div>
            <div className="rev-price">$100</div>
          </div>
          <div className="review-item">
            <div className="rev-left">
              <div className="rev-thumb" />
              <div className="rev-meta">
                <div className="rev-name">WS High SNEAKERS Tosca - 002</div>
                <div className="rev-sub">2x</div>
              </div>
            </div>
            <div className="rev-price">$200</div>
          </div>

          <div className="discount">
            <label>Dicount Code</label>
            <div className="discount-row">
              <input placeholder="Enter discount code" />
              <button className="apply">Apply</button>
            </div>
          </div>

          <div className="totals">
            <div className="tot-row"><div>Sub total</div><div>$400.00</div></div>
            <div className="tot-row"><div>Shipping</div><div>$5.00</div></div>
            <div className="tot-row"><div>Tax</div><div>$0.00</div></div>
            <div className="tot-row"><div>Discount</div><div>-$15.00</div></div>
            <div className="tot-row total"><div>Total</div><div>$390.00</div></div>
          </div>

          <div className="actions-row">
            <button className="btn back">Back</button>
            <button className="btn pay">Payment now</button>
          </div>
        </aside>
      </div>
    </div>
  );
}



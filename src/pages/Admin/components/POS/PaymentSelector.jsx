import React, { useState } from 'react';
import { formatVND } from './mockPOSData';

/**
 * PaymentSelector — payment method toggle + cash change calculation.
 */
const METHODS = [
    { key: 'cash', label: 'Tiền mặt', icon: '💵' },
    { key: 'card', label: 'Thẻ/Chuyển khoản', icon: '💳' },
    { key: 'ewallet', label: 'Ví điện tử', icon: '📱' },
];

const PaymentSelector = ({ paymentMethod, setPaymentMethod, totalAmount, cashReceived, setCashReceived }) => {
    const change = cashReceived ? cashReceived - totalAmount : 0;

    return (
        <div className="pos-payment-section">
            <div className="pos-payment-label">Phương thức thanh toán</div>
            <div className="pos-payment-methods">
                {METHODS.map(m => (
                    <button
                        key={m.key}
                        className={`pos-payment-btn${paymentMethod === m.key ? ' active' : ''}`}
                        onClick={() => setPaymentMethod(m.key)}
                    >
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                    </button>
                ))}
            </div>

            {paymentMethod === 'cash' && (
                <div className="pos-cash-section">
                    <input
                        className="pos-cash-input"
                        type="number"
                        placeholder="Khách đưa"
                        value={cashReceived || ''}
                        onChange={e => setCashReceived(Number(e.target.value) || 0)}
                        autoFocus
                        aria-label="Số tiền khách đưa"
                    />
                    {change > 0 && (
                        <div className="pos-cash-change">
                            Tiền thừa: {formatVND(change)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PaymentSelector;

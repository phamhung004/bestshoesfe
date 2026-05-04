import React from 'react';
import { Banknote, CreditCard, Building2 } from 'lucide-react';
import { formatVND } from './posUtils';

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Tiền mặt', icon: Banknote },
    { value: 'card', label: 'Thẻ', icon: CreditCard },
    { value: 'bank_transfer', label: 'Chuyển khoản', icon: Building2 },
];

const PaymentSelector = ({ paymentMethod, setPaymentMethod, totalAmount, cashReceived, setCashReceived }) => {
    const change = cashReceived ? cashReceived - totalAmount : 0;
    const isCash = paymentMethod === 'cash';

    const handleSelect = (method) => {
        setPaymentMethod(method);
        if (method !== 'cash') {
            setCashReceived(0);
        }
    };

    return (
        <div className="pos-payment-section">
            <div className="pos-payment-label">Phương thức thanh toán</div>
            <div className="pos-payment-methods">
                {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        type="button"
                        className={`pos-payment-btn ${paymentMethod === value ? 'active' : ''}`}
                        onClick={() => handleSelect(value)}
                    >
                        <Icon size={16} />
                        <span>{label}</span>
                    </button>
                ))}
            </div>

            {isCash && <div className="pos-cash-section">
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
            </div>}
        </div>
    );
};

export default PaymentSelector;

import React from 'react';
import { Banknote, CreditCard, Building2 } from 'lucide-react';
import { formatVND } from './posUtils';

/**
 * PaymentSelector — cash-only payment with change calculation.
 */
const PaymentSelector = ({ paymentMethod, setPaymentMethod, totalAmount, cashReceived, setCashReceived }) => {
    const change = cashReceived ? cashReceived - totalAmount : 0;

    return (
        <div className="pos-payment-section">
            <div className="pos-payment-label">Phương thức thanh toán</div>
            <div className="pos-payment-methods">
                <button className="pos-payment-btn active">
                    <Banknote size={16} />
                    <span>Tiền mặt</span>
                </button>
                <button className="pos-payment-btn" disabled title="Sắp ra mắt">
                    <CreditCard size={16} />
                    <span>Thẻ</span>
                </button>
                <button className="pos-payment-btn" disabled title="Sắp ra mắt">
                    <Building2 size={16} />
                    <span>Chuyển khoản</span>
                </button>
            </div>

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
        </div>
    );
};

export default PaymentSelector;

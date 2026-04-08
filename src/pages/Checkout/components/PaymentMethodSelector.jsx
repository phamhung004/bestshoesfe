import React from 'react';
import { PAYMENT_METHODS } from '../checkoutConstants';

const PaymentMethodSelector = ({
    selectedMethod,
    onSelect,
    onCopyBankAccount,
}) => {

    return (
        <div className="co-card co-stagger-6">
            <h3 className="co-card-title">Phương thức thanh toán</h3>

            <div className="co-pay-grid">
                {PAYMENT_METHODS.map((method) => (
                    <div
                        key={method.id}
                        className={`co-pay-card ${selectedMethod === method.id ? 'selected' : ''}`}
                        onClick={() => onSelect(method.id)}
                    >
                        <div className="co-pay-card-header">
                            <span className="co-pay-card-icon">{method.icon}</span>
                            <div className="co-pay-card-text">
                                <h4>{method.label}</h4>
                                <p>{method.desc}</p>
                            </div>
                            <div className="co-pay-card-radio" />
                        </div>

                        {/* Bank transfer details with SePay QR */}
                        {selectedMethod === 'bank' && method.id === 'bank' && (
                            <div className="co-pay-expand">
                                <div className="co-pay-bank-info">
                                    <h5>Thông tin chuyển khoản:</h5>
                                    <div className="co-pay-bank-row">
                                        <span className="co-pay-bank-label">Ngân hàng:</span>
                                        <span className="co-pay-bank-value">MB Bank</span>
                                    </div>
                                    <div className="co-pay-bank-row">
                                        <span className="co-pay-bank-label">Số TK:</span>
                                        <span className="co-pay-bank-value">927092004333</span>
                                        <button
                                            className="co-pay-copy-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyBankAccount('927092004333');
                                            }}
                                        >
                                            Sao chép
                                        </button>
                                    </div>
                                    <div className="co-pay-bank-row">
                                        <span className="co-pay-bank-label">Chủ TK:</span>
                                        <span className="co-pay-bank-value">PHAM TRONG HUNG</span>
                                    </div>
                                    <div className="co-pay-bank-row">
                                        <span className="co-pay-bank-label">Nội dung CK:</span>
                                        <span className="co-pay-bank-value co-pay-bank-highlight">[Mã đơn hàng]</span>
                                    </div>
                                    <p className="co-pay-bank-note">
                                        💡 Sau khi đặt hàng, bạn sẽ nhận được <strong>mã QR chuyển khoản</strong> và <strong>mã đơn hàng</strong> cụ thể.
                                        <br />Hệ thống sẽ <strong>tự động xác nhận</strong> thanh toán trong vài phút.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethodSelector;

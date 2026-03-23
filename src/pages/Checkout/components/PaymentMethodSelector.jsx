import React, { useState } from 'react';
import { PAYMENT_METHODS } from '../checkoutConstants';

const PaymentMethodSelector = ({
    selectedMethod,
    onSelect,
    cardForm,
    onCardChange,
    errors,
    touched,
    onBlur,
    onCopyBankAccount,
}) => {
    const [cardType, setCardType] = useState('');

    const detectCardType = (num) => {
        const n = num.replace(/\s/g, '');
        if (n.startsWith('4')) return 'visa';
        if (/^5[1-5]/.test(n)) return 'mastercard';
        return '';
    };

    const formatCardNumber = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) {
            return digits.slice(0, 2) + '/' + digits.slice(2);
        }
        return digits;
    };

    const getFieldClass = (field) => {
        if (errors[field] && touched[field]) return 'co-form-input error';
        if (touched[field] && !errors[field] && cardForm[field]) return 'co-form-input valid';
        return 'co-form-input';
    };

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

                        {/* MoMo details */}
                        {selectedMethod === 'momo' && method.id === 'momo' && (
                            <div className="co-pay-expand">
                                <div className="co-pay-momo-qr">QR</div>
                                <div className="co-form-group">
                                    <label className="co-form-label">Hoặc nhập SĐT MoMo:</label>
                                    <input
                                        type="tel"
                                        className="co-form-input"
                                        placeholder="0912 345 678"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <p className="co-pay-momo-note">
                                    Ứng dụng MoMo → Quét mã → Xác nhận
                                </p>
                            </div>
                        )}

                        {/* Credit/debit card form */}
                        {selectedMethod === 'card' && method.id === 'card' && (
                            <div className="co-pay-expand" onClick={(e) => e.stopPropagation()}>
                                <div className="co-pay-card-form">
                                    {/* Card number */}
                                    <div className="co-form-group">
                                        <label className="co-form-label">
                                            Số thẻ <span className="required">*</span>
                                        </label>
                                        <div className="co-pay-card-input-wrap">
                                            <input
                                                type="text"
                                                className={getFieldClass('cardNumber')}
                                                placeholder="1234 5678 9012 3456"
                                                value={cardForm.cardNumber}
                                                onChange={(e) => {
                                                    const formatted = formatCardNumber(e.target.value);
                                                    onCardChange('cardNumber', formatted);
                                                    setCardType(detectCardType(formatted));
                                                }}
                                                onBlur={() => onBlur('cardNumber')}
                                                maxLength={19}
                                            />
                                            {cardType && (
                                                <span className={`co-pay-card-type-icon ${cardType}`}>
                                                    {cardType === 'visa' ? 'VISA' : 'MC'}
                                                </span>
                                            )}
                                        </div>
                                        {errors.cardNumber && touched.cardNumber && (
                                            <p className="co-form-error">⚠ {errors.cardNumber}</p>
                                        )}
                                    </div>

                                    {/* Expiry + CVV */}
                                    <div className="co-form-row">
                                        <div className="co-form-group">
                                            <label className="co-form-label">
                                                MM/YY <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={getFieldClass('cardExpiry')}
                                                placeholder="MM/YY"
                                                value={cardForm.cardExpiry}
                                                onChange={(e) => {
                                                    onCardChange('cardExpiry', formatExpiry(e.target.value));
                                                }}
                                                onBlur={() => onBlur('cardExpiry')}
                                                maxLength={5}
                                            />
                                            {errors.cardExpiry && touched.cardExpiry && (
                                                <p className="co-form-error">⚠ {errors.cardExpiry}</p>
                                            )}
                                        </div>
                                        <div className="co-form-group">
                                            <label className="co-form-label">
                                                CVV <span className="required">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className={getFieldClass('cardCvv')}
                                                placeholder="•••"
                                                value={cardForm.cardCvv}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                    onCardChange('cardCvv', v);
                                                }}
                                                onBlur={() => onBlur('cardCvv')}
                                                maxLength={4}
                                            />
                                            {errors.cardCvv && touched.cardCvv && (
                                                <p className="co-form-error">⚠ {errors.cardCvv}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cardholder name */}
                                    <div className="co-form-group">
                                        <label className="co-form-label">
                                            Tên chủ thẻ <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={getFieldClass('cardName')}
                                            placeholder="NGUYEN VAN A"
                                            value={cardForm.cardName}
                                            onChange={(e) => {
                                                onCardChange('cardName', e.target.value.toUpperCase());
                                            }}
                                            onBlur={() => onBlur('cardName')}
                                        />
                                        {errors.cardName && touched.cardName && (
                                            <p className="co-form-error">⚠ {errors.cardName}</p>
                                        )}
                                    </div>

                                    <p className="co-pay-security-note">
                                        🔒 Thông tin thẻ được mã hóa SSL 256-bit
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

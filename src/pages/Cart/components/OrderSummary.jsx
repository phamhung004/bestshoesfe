import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatVND } from '../mockCartData';

const OrderSummary = ({
    subtotal,
    itemCount,
    selectedCount = 0,
    selectedItems = [],
}) => {
    const navigate = useNavigate();
    const total = subtotal;

    const handleCheckoutSelected = () => {
        if (selectedCount === 0) return;
        navigate('/checkout', {
            state: {
                selectedCartItemIds: selectedItems.map(i => i.cart_item_id),
            },
        });
    };

    return (
        <div className="cart-summary-card">
            <h2 className="cart-summary-title">Tóm tắt đơn hàng</h2>

            {/* Price Breakdown */}
            <div className="cart-summary-row">
                <span className="cart-summary-label">Tạm tính ({itemCount} sản phẩm)</span>
                <span className="cart-summary-value">{formatVND(subtotal)}</span>
            </div>
            <div className="cart-summary-divider" />

            <div className="cart-summary-total-row">
                <span className="cart-summary-total-label">TỔNG CỘNG</span>
                <span className="cart-summary-total-value">{formatVND(total)}</span>
            </div>
            <div className="cart-summary-total-accent" />
            <div className="cart-summary-vat">Đã bao gồm VAT (nếu có)</div>

            {/* Checkout Button */}
            <div className="cart-checkout-link">
                <button
                    className="cart-checkout-btn"
                    onClick={handleCheckoutSelected}
                    disabled={selectedCount === 0}
                    title={selectedCount === 0 ? 'Vui lòng chọn ít nhất 1 sản phẩm để thanh toán' : 'Thanh toán sản phẩm đã chọn'}
                >
                    {selectedCount === 0
                        ? 'Chọn sản phẩm để thanh toán'
                        : `Thanh toán ${selectedCount} sản phẩm đã chọn →`}
                </button>
            </div>
            <div className="cart-checkout-secure">🔒 Thanh toán an toàn & bảo mật</div>

            {/* Help */}
            <div className="cart-help-section">
                Cần hỗ trợ?{' '}
                <button className="cart-help-link" onClick={() => { }}>Chat ngay →</button>
            </div>
        </div>
    );
};

export default OrderSummary;

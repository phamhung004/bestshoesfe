import React from 'react';
import { formatVND } from '../checkoutConstants';
import './PriceChangeModal.css';

const PriceChangeModal = ({
    open,
    changedItems = [],
    loading = false,
    onCancel,
    onConfirm,
}) => {
    if (!open || changedItems.length === 0) return null;

    return (
        <div className="pcm-overlay" onClick={onCancel}>
            <div className="pcm-dialog" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="pcm-header">
                    <div className="pcm-icon">⚠️</div>
                    <h3 className="pcm-title">Giá sản phẩm đã thay đổi</h3>
                    <p className="pcm-desc">
                        Một số sản phẩm trong đơn hàng đã được cập nhật giá. Vui lòng xem lại trước khi tiếp tục.
                    </p>
                </div>

                {/* Changed items list */}
                <div className="pcm-items">
                    {changedItems.map((item, idx) => (
                        <div key={item.variantId || idx} className="pcm-item">
                            <div className="pcm-item-info">
                                <span className="pcm-item-name">{item.productName}</span>
                                <span className="pcm-item-variant">
                                    {[
                                        item.sizeName ? `Size ${item.sizeName}` : '',
                                        item.colorName || '',
                                    ].filter(Boolean).join(' · ')}
                                </span>
                            </div>
                            <div className="pcm-item-prices">
                                <span className="pcm-old-price">{formatVND(item.oldPrice)}</span>
                                <span className="pcm-arrow">→</span>
                                <span className="pcm-new-price">{formatVND(item.newPrice)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="pcm-actions">
                    <button
                        type="button"
                        className="pcm-btn pcm-btn-cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Huỷ
                    </button>
                    <button
                        type="button"
                        className="pcm-btn pcm-btn-confirm"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Xác nhận giá mới & Đặt hàng'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PriceChangeModal;

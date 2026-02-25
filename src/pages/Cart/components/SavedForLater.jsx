import React, { useState } from 'react';
import { formatVND, getColorInfo, getSizeName } from '../mockCartData';

const SavedForLater = ({ savedItems, onMoveToCart, onRemoveSaved }) => {
    const [isOpen, setIsOpen] = useState(savedItems.length > 0);

    if (savedItems.length === 0 && !isOpen) return null;

    return (
        <div className="cart-saved-section">
            <div className="cart-saved-header" onClick={() => setIsOpen(!isOpen)}>
                <span className="cart-saved-header-title">
                    Đã lưu lại ({savedItems.length} sản phẩm)
                </span>
                <span className={`cart-saved-chevron ${isOpen ? 'open' : ''}`}>
                    ▼
                </span>
            </div>

            {isOpen && savedItems.length > 0 && (
                <div className="cart-saved-grid">
                    {savedItems.map(item => {
                        const colorInfo = getColorInfo(item.variant.color_id);
                        const sizeName = getSizeName(item.variant.size_id);
                        return (
                            <div key={item.saved_item_id} className="cart-saved-item">
                                <img
                                    className="cart-saved-item-img"
                                    src={item.image_url}
                                    alt={item.product.name}
                                />
                                <div className="cart-saved-item-info">
                                    <h4 className="cart-saved-item-name">{item.product.name}</h4>
                                    <div className="cart-saved-item-price">{formatVND(item.variant.price)}</div>
                                    <div className="cart-saved-item-actions">
                                        <button
                                            className="cart-saved-add-btn"
                                            onClick={() => onMoveToCart(item)}
                                        >
                                            Thêm vào giỏ
                                        </button>
                                        <button
                                            className="cart-saved-remove-btn"
                                            onClick={() => onRemoveSaved(item.saved_item_id)}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SavedForLater;

import React, { useState } from 'react';
import { formatVND, getItemSubtotal, getItemPrice } from '../checkoutConstants';

const OrderItemList = ({ items }) => {
    const [expanded, setExpanded] = useState(false);
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <div>
            <div className="co-items-toggle" onClick={() => setExpanded(!expanded)}>
                <span className="co-items-toggle-text">
                    {totalQty} sản phẩm
                </span>
                <span className={`co-items-toggle-icon ${expanded ? 'open' : ''}`}>
                    ▼
                </span>
            </div>
            <div className={`co-items-list ${expanded ? 'expanded' : 'collapsed'}`}>
                {items.map((item) => {
                    const basePrice = (item.variant?.price || 0) * item.quantity;
                    const effectivePrice = getItemSubtotal(item);
                    const hasPromo = item.promotion && effectivePrice < basePrice;
                    return (
                        <div key={item.cart_item_id} className="co-item-row">
                            <div className="co-item-img-wrap">
                                <img src={item.image_url} alt={item.product.name} />
                                {item.quantity > 1 && (
                                    <span className="co-item-qty-badge">{item.quantity}</span>
                                )}
                            </div>
                            <div className="co-item-info">
                                <p className="co-item-name">{item.product.name}</p>
                                <p className="co-item-variant">
                                    Size {item.variant.size_name} · {item.variant.color_name}
                                </p>
                                {hasPromo && (
                                    <p className="co-item-promo-label">🏷️ {item.promotion.name}</p>
                                )}
                            </div>
                            <div className="co-item-price-wrap">
                                {hasPromo && (
                                    <span className="co-item-price-original">{formatVND(basePrice)}</span>
                                )}
                                <span className={`co-item-price${hasPromo ? ' promo' : ''}`}>
                                    {formatVND(effectivePrice)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderItemList;

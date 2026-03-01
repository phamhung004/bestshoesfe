import React, { useState } from 'react';
import { formatVND, getItemSubtotal } from '../checkoutConstants';

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
                    const subtotal = getItemSubtotal(item);
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
                            </div>
                            <span className="co-item-price">{formatVND(subtotal)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderItemList;

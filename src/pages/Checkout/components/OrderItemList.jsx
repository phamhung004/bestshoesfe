// --- MODIFIED: OrderItemList ---
// Now accepts `outOfStockItems` and `onRemoveItem` props.
// Delegates per-item rendering to the reusable <OrderSummaryItem />.

import React, { useState } from 'react';
import OrderSummaryItem from './OrderSummaryItem';

/**
 * OrderItemList
 *
 * @param {Array}    items            - Cart items to display
 * @param {Array}    outOfStockItems  - [{ productId, name, remaining }] from parent state
 * @param {function} onRemoveItem     - Called with the cart item when user clicks inline [Xóa]
 */
const OrderItemList = ({ items, outOfStockItems = [], onRemoveItem }) => {
    const [expanded, setExpanded] = useState(false);
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

    // Build a fast lookup set of out-of-stock productIds
    const oosIds = new Set(outOfStockItems.map((o) => String(o.productId)));

    return (
        <div>
            <div className="co-items-toggle" onClick={() => setExpanded(!expanded)}>
                <span className="co-items-toggle-text">
                    {totalQty} sản phẩm
                    {/* Show count badge when there are out-of-stock items */}
                    {outOfStockItems.length > 0 && (
                        <span className="co-items-oos-count" aria-label="sản phẩm hết hàng">
                            {outOfStockItems.length} hết hàng
                        </span>
                    )}
                </span>
                <span className={`co-items-toggle-icon ${expanded ? 'open' : ''}`}>
                    ▼
                </span>
            </div>
            <div className={`co-items-list ${expanded ? 'expanded' : 'collapsed'}`}>
                {items.map((item) => {
                    // Match by productId stored on item.product.product_id (or product_id)
                    const productId = String(item.product?.product_id || item.product_id || '');
                    const isOutOfStock = oosIds.has(productId);
                    return (
                        <OrderSummaryItem
                            key={item.cart_item_id}
                            item={item}
                            isOutOfStock={isOutOfStock}
                            onRemove={onRemoveItem}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default OrderItemList;

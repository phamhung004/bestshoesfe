import React, { useState, useEffect } from 'react';
import { Plus, X, ShoppingBag, Clock, AlertCircle } from 'lucide-react';
import { formatVND } from './posUtils';

/**
 * HoldOrderTabBar — browser-tab-style bar above the POS layout.
 * Shows the current "new order" tab + all hold orders as tabs.
 * Switching tabs auto-saves the current order.
 */
const HoldOrderTabBar = ({
    holdOrders,
    activeOrderId, // null = new order, orderId = editing a hold
    onSwitchTab,   // (holdOrder | null) => void  — null = new order
    onNewOrder,    // () => void — create brand new order
    onDiscardHold, // (orderId) => void
    cartItemCount, // number of items in current cart
    isSavingHold,
}) => {
    const [now, setNow] = useState(Date.now());

    // Update "time ago" every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(interval);
    }, []);

    const getTimeAgo = (createdAt) => {
        if (!createdAt) return '';
        const diffMs = now - new Date(createdAt).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'Vừa tạo';
        if (mins < 60) return `${mins} phút`;
        const hours = Math.floor(mins / 60);
        return `${hours}h${mins % 60 > 0 ? mins % 60 + 'p' : ''}`;
    };

    const getTabColor = (createdAt) => {
        if (!createdAt) return '';
        const diffMs = now - new Date(createdAt).getTime();
        const mins = diffMs / 60000;
        if (mins >= 10) return 'pos-tab--danger';
        if (mins >= 5) return 'pos-tab--warning';
        return '';
    };

    return (
        <div className="pos-tab-bar">
            <div className="pos-tab-bar-scroll">
                {/* Current new order tab */}
                <button
                    className={`pos-tab ${activeOrderId === null ? 'pos-tab--active' : ''}`}
                    onClick={() => onSwitchTab(null)}
                    disabled={activeOrderId === null || isSavingHold}
                    title="Đơn hàng hiện tại"
                >
                    <ShoppingBag size={14} />
                    <span className="pos-tab-label">Đơn mới</span>
                    {cartItemCount > 0 && activeOrderId === null && (
                        <span className="pos-tab-badge-count">{cartItemCount}</span>
                    )}
                </button>

                {/* Hold order tabs */}
                {holdOrders.map((h, idx) => {
                    const isActive = activeOrderId === h.orderId;
                    const tabColor = getTabColor(h.createdAt);
                    const timeAgo = getTimeAgo(h.createdAt);

                    return (
                        <div
                            key={h.orderId}
                            className={`pos-tab ${isActive ? 'pos-tab--active' : ''} ${tabColor}`}
                            title={`${h.customerName} • ${h.itemCount} sản phẩm • ${formatVND(h.totalAmount)} • ${timeAgo}`}
                        >
                            <button
                                className="pos-tab-main"
                                onClick={() => onSwitchTab(h)}
                                disabled={isActive || isSavingHold}
                            >
                                <span className="pos-tab-idx">{idx + 1}</span>
                                <span className="pos-tab-label">
                                    {h.customerName || 'Khách lẻ'}
                                </span>
                                <span className="pos-tab-meta">
                                    {formatVND(h.totalAmount)} · {h.itemCount}sp
                                </span>
                                {tabColor && (
                                    <span className="pos-tab-time">
                                        <Clock size={10} />
                                        {timeAgo}
                                    </span>
                                )}
                            </button>
                            <button
                                className="pos-tab-close"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDiscardHold(h.orderId);
                                }}
                                title="Xóa hóa đơn chờ"
                                disabled={isSavingHold}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    );
                })}

                {/* New order button */}
                <button
                    className="pos-tab pos-tab--new"
                    onClick={onNewOrder}
                    disabled={isSavingHold || holdOrders.length >= 10}
                    title={holdOrders.length >= 10 ? 'Tối đa 10 hóa đơn chờ' : 'Tạo đơn mới (F2)'}
                >
                    <Plus size={14} />
                    <span className="pos-tab-label">Đơn mới</span>
                </button>
            </div>

            {holdOrders.length >= 8 && (
                <div className="pos-tab-bar-warning">
                    <AlertCircle size={12} />
                    {holdOrders.length}/10 hóa đơn chờ
                </div>
            )}
        </div>
    );
};

export default HoldOrderTabBar;

import React, { useState, useRef, useEffect } from 'react';
import { recentOrders, formatVND, formatDateTime } from './mockPOSData';

/**
 * RecentOrdersDropdown — shows last 5 completed POS orders.
 */
const RecentOrdersDropdown = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                className="pos-icon-btn"
                onClick={() => setOpen(!open)}
                aria-label="Đơn gần đây"
                title="Đơn gần đây"
            >
                📋
            </button>
            {open && (
                <div className="pos-recent-dropdown">
                    <div className="pos-recent-header">Đơn gần đây</div>
                    {recentOrders.map(o => (
                        <div key={o.order_id} className="pos-recent-item">
                            <div>
                                <div className="pos-recent-order-num">{o.order_number}</div>
                                <div className="pos-recent-name">{o.customer_name}</div>
                            </div>
                            <div>
                                <div className="pos-recent-amount">{formatVND(o.total_amount)}</div>
                                <div className="pos-recent-time">{formatDateTime(o.created_at)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentOrdersDropdown;

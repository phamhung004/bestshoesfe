import React, { useState, useRef, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import { formatVND, formatDateTime } from './posUtils';
import { posAPI } from '../../../../services/api';

/**
 * RecentOrdersDropdown — shows last 5 completed POS orders from API.
 */
const RecentOrdersDropdown = () => {
    const [open, setOpen] = useState(false);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Fetch recent orders when dropdown opens
    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await posAPI.getRecentOrders(5);
                if (!cancelled) setRecentOrders(res.data || []);
            } catch (err) {
                console.error('Failed to load recent orders:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchOrders();
        return () => { cancelled = true; };
    }, [open]);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                className="pos-icon-btn"
                onClick={() => setOpen(!open)}
                aria-label="Đơn gần đây"
                title="Đơn gần đây"
            >
                <ClipboardList size={16} />
            </button>
            {open && (
                <div className="pos-recent-dropdown">
                    <div className="pos-recent-header">Đơn gần đây</div>
                    {loading ? (
                        <div style={{ padding: '12px', textAlign: 'center', color: '#888' }}>Đang tải...</div>
                    ) : recentOrders.length === 0 ? (
                        <div style={{ padding: '12px', textAlign: 'center', color: '#888' }}>Chưa có đơn hàng</div>
                    ) : (
                        recentOrders.map(o => (
                            <div key={o.orderId} className="pos-recent-item">
                                <div>
                                    <div className="pos-recent-order-num">{o.orderNumber}</div>
                                    <div className="pos-recent-name">{o.customerName}</div>
                                </div>
                                <div>
                                    <div className="pos-recent-amount">{formatVND(o.totalAmount)}</div>
                                    <div className="pos-recent-time">{formatDateTime(o.createdAt)}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default RecentOrdersDropdown;

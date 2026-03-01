import React, { useState, useEffect } from 'react';
import { formatVND } from './mockOrders';
import { orderAPI } from '../../../../services/api';

/**
 * OrderKpiCards: 4 KPI summary cards (today's orders, revenue, pending, cancelled)
 * Fetches data from backend /api/admin/orders/kpi
 */
const OrderKpiCards = () => {
    const [kpi, setKpi] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await orderAPI.getKpi();
                if (!cancelled && res?.data) setKpi(res.data);
            } catch (err) {
                console.error('Failed to load KPI:', err);
            }
        };
        load();
        // Auto-refresh every 60s
        const interval = setInterval(load, 60_000);
        return () => { cancelled = true; clearInterval(interval); };
    }, []);

    // Placeholder while loading
    if (!kpi) {
        return (
            <div className="om-kpi-grid">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="om-kpi-card kpi-loading">
                        <div className="om-kpi-header"><div className="om-kpi-icon">⏳</div></div>
                        <div className="om-kpi-value">—</div>
                        <div className="om-kpi-label">Đang tải...</div>
                    </div>
                ))}
            </div>
        );
    }

    // Delta helper — formats the percentage from backend
    const formatDelta = (pct) => {
        if (pct == null) return { pct: '0%', dir: 'up' };
        const rounded = Math.round(pct);
        return {
            pct: `${rounded >= 0 ? '+' : ''}${rounded}%`,
            dir: rounded >= 0 ? 'up' : 'down',
        };
    };

    const cards = [
        {
            key: 'orders',
            className: 'kpi-orders',
            icon: '📦',
            value: kpi.todayOrders ?? 0,
            label: 'Tổng đơn hôm nay',
            delta: formatDelta(kpi.ordersDelta),
        },
        {
            key: 'revenue',
            className: 'kpi-revenue',
            icon: '💰',
            value: formatVND(kpi.todayRevenue ?? 0),
            label: 'Doanh thu hôm nay',
            delta: formatDelta(kpi.revenueDelta),
        },
        {
            key: 'pending',
            className: 'kpi-pending',
            icon: '⏳',
            value: kpi.pendingCount ?? 0,
            label: 'Chờ xác nhận',
            delta: { pct: `${kpi.pendingCount ?? 0}`, dir: (kpi.pendingCount ?? 0) > 2 ? 'down' : 'up' },
        },
        {
            key: 'cancelled',
            className: 'kpi-cancelled',
            icon: '❌',
            value: kpi.cancelledCount ?? 0,
            label: 'Đã hủy',
            delta: { pct: `${kpi.cancelledCount ?? 0}`, dir: (kpi.cancelledCount ?? 0) > 1 ? 'down' : 'up' },
        },
    ];

    return (
        <div className="om-kpi-grid">
            {cards.map((card) => (
                <div key={card.key} className={`om-kpi-card ${card.className}`}>
                    <div className="om-kpi-header">
                        <div className="om-kpi-icon">{card.icon}</div>
                        <span className={`om-kpi-delta ${card.delta.dir}`}>
                            {card.delta.dir === 'up' ? '↑' : '↓'} {card.delta.pct}
                        </span>
                    </div>
                    <div className="om-kpi-value">{card.value}</div>
                    <div className="om-kpi-label">{card.label}</div>
                </div>
            ))}
        </div>
    );
};

export default OrderKpiCards;

import React from 'react';
import { formatVND } from './mockOrders';

/**
 * OrderKpiCards: 4 KPI summary cards (today's orders, revenue, pending, cancelled)
 * Props: orders — full array of mock orders
 */
const OrderKpiCards = ({ orders }) => {
    // Determine "today" from static reference date
    const todayStr = '2026-02-24';
    const yesterdayStr = '2026-02-23';

    const isDay = (order, dayStr) => order.created_at.startsWith(dayStr);

    const todayOrders = orders.filter((o) => isDay(o, todayStr));
    const yesterdayOrders = orders.filter((o) => isDay(o, yesterdayStr));

    // KPI calculations
    const todayCount = todayOrders.length;
    const yesterdayCount = yesterdayOrders.length;
    const todayRevenue = todayOrders.reduce((s, o) => s + o.total_amount, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + o.total_amount, 0);
    const pendingCount = orders.filter((o) => o.status === 'Chờ xác nhận').length;
    const cancelledCount = orders.filter((o) => o.status === 'Đã hủy').length;

    // Delta helper
    const delta = (current, previous) => {
        if (previous === 0) return current > 0 ? { pct: '+100%', dir: 'up' } : { pct: '0%', dir: 'up' };
        const pct = (((current - previous) / previous) * 100).toFixed(0);
        return { pct: `${pct >= 0 ? '+' : ''}${pct}%`, dir: pct >= 0 ? 'up' : 'down' };
    };

    const cards = [
        {
            key: 'orders',
            className: 'kpi-orders',
            icon: '📦',
            value: todayCount,
            label: 'Tổng đơn hôm nay',
            delta: delta(todayCount, yesterdayCount),
        },
        {
            key: 'revenue',
            className: 'kpi-revenue',
            icon: '💰',
            value: formatVND(todayRevenue),
            label: 'Doanh thu hôm nay',
            delta: delta(todayRevenue, yesterdayRevenue),
        },
        {
            key: 'pending',
            className: 'kpi-pending',
            icon: '⏳',
            value: pendingCount,
            label: 'Chờ xác nhận',
            delta: { pct: pendingCount > 0 ? `${pendingCount}` : '0', dir: pendingCount > 2 ? 'down' : 'up' },
        },
        {
            key: 'cancelled',
            className: 'kpi-cancelled',
            icon: '❌',
            value: cancelledCount,
            label: 'Đã hủy',
            delta: { pct: cancelledCount > 0 ? `${cancelledCount}` : '0', dir: cancelledCount > 1 ? 'down' : 'up' },
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

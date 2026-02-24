import React from 'react';
import { formatVND } from './mockReturns';

/**
 * ReturnKpiCards — 5 KPI summary cards for return management.
 * Props: returns (array of all return requests)
 */
const ReturnKpiCards = ({ returns }) => {
    const totalReturns = returns.length;
    const pendingCount = returns.filter(r => r.return_status === 'Chờ duyệt').length;
    const approvedCount = returns.filter(r => r.return_status === 'Đã duyệt').length;
    const refundedTotal = returns
        .filter(r => r.return_status === 'Hoàn tiền')
        .reduce((sum, r) => sum + r.total_amount, 0);

    // Mock total orders for rate calculation
    const totalOrders = 120;
    const returnRate = totalOrders > 0 ? ((totalReturns / totalOrders) * 100).toFixed(1) : 0;

    const cards = [
        {
            key: 'total',
            className: 'kpi-total',
            icon: '📦',
            value: totalReturns,
            label: 'Tổng yêu cầu trả hàng',
            delta: '+12%',
            deltaDir: 'up',
        },
        {
            key: 'pending',
            className: 'kpi-pending',
            icon: '⏳',
            value: pendingCount,
            label: 'Chờ duyệt',
            delta: '+2',
            deltaDir: 'up',
        },
        {
            key: 'approved',
            className: 'kpi-approved',
            icon: '✅',
            value: approvedCount,
            label: 'Đã duyệt',
            delta: '-1',
            deltaDir: 'down',
        },
        {
            key: 'refunded',
            className: 'kpi-refunded',
            icon: '💰',
            value: formatVND(refundedTotal),
            label: 'Tổng tiền hoàn',
            delta: '+8%',
            deltaDir: 'up',
        },
        {
            key: 'rate',
            className: 'kpi-rate',
            icon: '📊',
            value: `${returnRate}%`,
            label: 'Tỷ lệ trả hàng',
            delta: '-0.5%',
            deltaDir: 'down',
        },
    ];

    return (
        <div className="rm-kpi-grid">
            {cards.map(card => (
                <div key={card.key} className={`rm-kpi-card ${card.className}`}>
                    <div className="rm-kpi-header">
                        <div className="rm-kpi-icon">{card.icon}</div>
                        <span className={`rm-kpi-delta ${card.deltaDir}`}>
                            {card.deltaDir === 'up' ? '↑' : '↓'} {card.delta}
                        </span>
                    </div>
                    <div className="rm-kpi-value">{card.value}</div>
                    <div className="rm-kpi-label">{card.label}</div>
                </div>
            ))}
        </div>
    );
};

export default ReturnKpiCards;

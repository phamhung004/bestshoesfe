import React, { useState, useEffect } from 'react';
import { formatVND } from './mockReturns';
import { returnAPI } from '../../../../services/api';

/**
 * ReturnKpiCards — 5 KPI summary cards for return management.
 * Self-fetching from backend /api/admin/returns/kpi
 */
const ReturnKpiCards = () => {
    const [kpi, setKpi] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await returnAPI.getKpi();
                if (!cancelled && res?.data) setKpi(res.data);
            } catch (err) {
                console.error('Failed to load Return KPI:', err);
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
            <div className="rm-kpi-grid">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="rm-kpi-card kpi-loading">
                        <div className="rm-kpi-header"><div className="rm-kpi-icon">⏳</div></div>
                        <div className="rm-kpi-value">—</div>
                        <div className="rm-kpi-label">Đang tải...</div>
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
            key: 'total',
            className: 'kpi-total',
            icon: '📦',
            value: kpi.totalReturns ?? 0,
            label: 'Tổng yêu cầu trả hàng',
            delta: formatDelta(kpi.totalReturnsDelta),
        },
        {
            key: 'pending',
            className: 'kpi-pending',
            icon: '⏳',
            value: kpi.pendingCount ?? 0,
            label: 'Chờ duyệt',
            delta: formatDelta(kpi.pendingDelta),
        },
        {
            key: 'approved',
            className: 'kpi-approved',
            icon: '✅',
            value: kpi.approvedCount ?? 0,
            label: 'Đã duyệt',
            delta: formatDelta(kpi.approvedDelta),
        },
        {
            key: 'refunded',
            className: 'kpi-refunded',
            icon: '💰',
            value: formatVND(kpi.refundedAmount ?? 0),
            label: 'Tổng tiền hoàn',
            delta: formatDelta(kpi.refundedAmountDelta),
        },
        {
            key: 'rejected',
            className: 'kpi-rate',
            icon: '❌',
            value: kpi.rejectedCount ?? 0,
            label: 'Đã từ chối',
            delta: formatDelta(kpi.rejectedDelta),
        },
    ];

    return (
        <div className="rm-kpi-grid">
            {cards.map(card => (
                <div key={card.key} className={`rm-kpi-card ${card.className}`}>
                    <div className="rm-kpi-header">
                        <div className="rm-kpi-icon">{card.icon}</div>
                        <span className={`rm-kpi-delta ${card.delta.dir}`}>
                            {card.delta.dir === 'up' ? '↑' : '↓'} {card.delta.pct}
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

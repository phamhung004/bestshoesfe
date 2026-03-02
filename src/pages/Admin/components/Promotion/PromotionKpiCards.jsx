import React, { useState, useEffect } from 'react';
import { Tag, Zap, Clock, XCircle } from 'lucide-react';
import { promotionAPI } from '../../../../services/api';

const PromotionKpiCards = ({ refreshKey }) => {
    const [kpi, setKpi] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const [all, running, expiring, expired] = await Promise.all([
                    promotionAPI.getAll(),
                    promotionAPI.getCurrentlyRunning(),
                    promotionAPI.getExpiringSoon(7),
                    promotionAPI.getExpired(),
                ]);
                if (!cancelled) {
                    setKpi({
                        total: Array.isArray(all) ? all.length : 0,
                        running: Array.isArray(running) ? running.length : 0,
                        expiring: Array.isArray(expiring) ? expiring.length : 0,
                        expired: Array.isArray(expired) ? expired.length : 0,
                    });
                }
            } catch (err) {
                console.error('Failed to load promotion KPI:', err);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [refreshKey]);

    if (!kpi) {
        return (
            <div className="pm-kpi-grid">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="pm-skeleton-block pm-skeleton-kpi" />
                ))}
            </div>
        );
    }

    const cards = [
        {
            key: 'total',
            className: 'kpi-total',
            icon: <Tag size={20} color="var(--primary-600)" />,
            value: kpi.total,
            label: 'Tổng đợt giảm giá',
        },
        {
            key: 'running',
            className: 'kpi-running',
            icon: <Zap size={20} color="var(--success-600)" />,
            value: kpi.running,
            label: 'Đang chạy',
        },
        {
            key: 'expiring',
            className: 'kpi-expiring',
            icon: <Clock size={20} color="var(--warning-600)" />,
            value: kpi.expiring,
            label: 'Sắp hết hạn',
        },
        {
            key: 'expired',
            className: 'kpi-expired',
            icon: <XCircle size={20} color="var(--danger-600)" />,
            value: kpi.expired,
            label: 'Đã hết hạn',
        },
    ];

    return (
        <div className="pm-kpi-grid">
            {cards.map((card) => (
                <div key={card.key} className={`pm-kpi-card ${card.className}`}>
                    <div className="pm-kpi-header">
                        <div className="pm-kpi-icon">{card.icon}</div>
                    </div>
                    <div className="pm-kpi-value">{card.value}</div>
                    <div className="pm-kpi-label">{card.label}</div>
                </div>
            ))}
        </div>
    );
};

export default PromotionKpiCards;

import React, { useState, useEffect } from 'react';
import { Ticket, Zap, Clock, XCircle } from 'lucide-react';
import { couponAPI } from '../../../../services/api';

/* ── helpers ─────────────────────────────────────────────────────── */

const getCouponStatusKey = (coupon) => {
    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.endDate);
    if (!coupon.status) return 'inactive';
    if (now > end) return 'expired';
    if (now < start) return 'upcoming';
    const diff = end - now;
    const daysLeft = diff / (1000 * 60 * 60 * 24);
    if (daysLeft <= 7) return 'expiring';
    return 'active';
};

const getAvgUsageRate = (coupons) => {
    const withLimit = coupons.filter((c) => c.usageLimit && c.usageLimit > 0);
    if (withLimit.length === 0) return 0;
    const totalRate = withLimit.reduce((sum, c) => sum + ((c.usedCount || 0) / c.usageLimit), 0);
    return Math.round((totalRate / withLimit.length) * 100);
};

/* ── component ───────────────────────────────────────────────────── */

const CouponKpiCards = ({ coupons = [], loading }) => {
    const kpi = React.useMemo(() => {
        if (!coupons.length) return null;
        const counts = { total: coupons.length, active: 0, expiring: 0, usageRate: 0 };
        coupons.forEach((c) => {
            const key = getCouponStatusKey(c);
            if (key === 'active' || key === 'expiring') counts.active++;
            if (key === 'expiring') counts.expiring++;
        });
        counts.usageRate = getAvgUsageRate(coupons);
        return counts;
    }, [coupons]);

    if (loading || !kpi) {
        return (
            <div className="cm-kpi-grid">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="cm-skeleton-block cm-skeleton-kpi" />
                ))}
            </div>
        );
    }

    const cards = [
        {
            key: 'total',
            className: 'kpi-total',
            icon: <Ticket size={20} color="var(--primary-600)" />,
            value: kpi.total,
            label: 'Tổng mã giảm giá',
        },
        {
            key: 'active',
            className: 'kpi-running',
            icon: <Zap size={20} color="var(--success-600)" />,
            value: kpi.active,
            label: 'Đang hoạt động',
        },
        {
            key: 'expiring',
            className: 'kpi-expiring',
            icon: <Clock size={20} color="var(--warning-600)" />,
            value: kpi.expiring,
            label: 'Sắp hết hạn',
        },
        {
            key: 'usageRate',
            className: 'kpi-expired',
            icon: <XCircle size={20} color="var(--danger-600)" />,
            value: `${kpi.usageRate}%`,
            label: 'Tỷ lệ sử dụng TB',
        },
    ];

    return (
        <div className="cm-kpi-grid">
            {cards.map((card) => (
                <div key={card.key} className={`cm-kpi-card ${card.className}`}>
                    <div className="cm-kpi-header">
                        <div className="cm-kpi-icon">{card.icon}</div>
                    </div>
                    <div className="cm-kpi-value">{card.value}</div>
                    <div className="cm-kpi-label">{card.label}</div>
                </div>
            ))}
        </div>
    );
};

export default CouponKpiCards;

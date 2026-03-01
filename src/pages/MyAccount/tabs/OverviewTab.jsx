import React, { useState, useEffect } from 'react';
import { ArrowRight, Package, DollarSign, Star, Award, User, MapPin, Lock } from 'lucide-react';
import { MEMBERSHIP_TIERS, formatVND, formatDate, getTierFromSpend, getTierEmoji } from '../mockAccountData';
import { getMyOrders } from '../../../api/accountApi';

const CountUp = ({ target, duration = 600 }) => {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = null;
        const step = (ts) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            setVal(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration]);
    return val;
};

const statusBadgeClass = (status) => {
    const map = {
        'Chờ xác nhận': 'acc-badge-yellow',
        'Đã xác nhận': 'acc-badge-blue',
        'Đang giao': 'acc-badge-purple',
        'Đã giao': 'acc-badge-green',
        'Trả hàng/Hoàn tiền': 'acc-badge-orange',
        'Đã hủy': 'acc-badge-red',
    };
    return map[status] || '';
};

const OverviewTab = ({ onTabChange, customer, stats }) => {
    const [barWidth, setBarWidth] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);

    const totalSpend = stats?.totalSpend || 0;
    const tier = getTierFromSpend(totalSpend);
    const nextTierIdx = MEMBERSHIP_TIERS.findIndex(t => t.id === tier.id) + 1;
    const nextTier = MEMBERSHIP_TIERS[nextTierIdx];
    const progressPct = nextTier
        ? Math.min((totalSpend / nextTier.threshold) * 100, 100)
        : 100;
    const remaining = nextTier ? nextTier.threshold - totalSpend : 0;

    useEffect(() => {
        const timer = setTimeout(() => setBarWidth(progressPct), 150);
        return () => clearTimeout(timer);
    }, [progressPct]);

    useEffect(() => {
        const fetchRecentOrders = async () => {
            try {
                const res = await getMyOrders();
                setRecentOrders((res.data?.data || []).slice(0, 3));
            } catch (err) {
                console.error('Failed to fetch recent orders:', err);
            }
        };
        fetchRecentOrders();
    }, []);

    return (
        <div className="acc-tab-content">
            {/* Welcome Banner */}
            <div className="acc-welcome-banner">
                <div className="acc-welcome-left">
                    <h2 className="acc-welcome-title">Xin chào, {(customer?.fullName || '').split(' ').pop()}! 👋</h2>
                    <p className="acc-welcome-sub">Chào mừng bạn quay trở lại BestShoes</p>
                </div>
                <button className="acc-welcome-cta" onClick={() => onTabChange('orders')}>
                    Xem đơn hàng mới nhất →
                </button>
            </div>

            {/* Quick Stats */}
            <div className="acc-stats-grid">
                <div className="acc-stat-card">
                    <div className="acc-stat-icon acc-stat-icon-indigo"><Package size={22} /></div>
                    <div className="acc-stat-num-big"><CountUp target={stats?.totalOrders || 0} /></div>
                    <div className="acc-stat-label-sm">đơn hàng</div>
                    <div className="acc-stat-sub acc-sub-indigo">{stats?.activeOrders || 0} đang giao</div>
                </div>
                <div className="acc-stat-card">
                    <div className="acc-stat-icon acc-stat-icon-green"><DollarSign size={22} /></div>
                    <div className="acc-stat-num-big acc-stat-num-sm-text">{formatVND(totalSpend)}</div>
                    <div className="acc-stat-label-sm">tổng chi tiêu</div>
                    <div className="acc-stat-sub acc-sub-green">Hạng {tier.label}</div>
                </div>
                <div className="acc-stat-card">
                    <div className="acc-stat-icon acc-stat-icon-amber"><Star size={22} /></div>
                    <div className="acc-stat-num-big"><CountUp target={stats?.loyaltyPoints || 0} duration={800} /></div>
                    <div className="acc-stat-label-sm">điểm thưởng</div>
                    <div className="acc-stat-sub acc-sub-amber">≈ {formatVND((stats?.loyaltyPoints || 0) * 100)} giá trị</div>
                </div>
                <div className="acc-stat-card">
                    <div className="acc-stat-icon acc-stat-icon-purple"><Award size={22} /></div>
                    <div className="acc-stat-num-big"><CountUp target={stats?.reviewCount || 0} /></div>
                    <div className="acc-stat-label-sm">đánh giá</div>
                    <div className="acc-stat-sub acc-sub-purple">{stats?.pendingReviews || 0} chờ đánh giá</div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="acc-section-header">
                <h3 className="acc-section-title">Đơn hàng gần đây</h3>
                <button className="acc-link-btn" onClick={() => onTabChange('orders')}>Xem tất cả →</button>
            </div>
            <div className="acc-recent-orders">
                {recentOrders.map(order => (
                    <div key={order.orderId} className="acc-recent-order-card">
                        <div className="acc-recent-order-left">
                            <span className="acc-order-num">{order.orderNumber}</span>
                            <span className="acc-recent-order-date">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="acc-recent-order-center">
                            <div className="acc-recent-thumb" style={{ background: order.items?.[0]?.thumbColor || '#eee' }}>
                                <span>{order.items?.[0]?.thumbEmoji || '👟'}</span>
                            </div>
                            <div className="acc-recent-item-info">
                                <span className="acc-recent-item-name">{order.items?.[0]?.productName}</span>
                                {order.items?.length > 1 && (
                                    <span className="acc-recent-more">+{order.items.length - 1} sản phẩm khác</span>
                                )}
                            </div>
                        </div>
                        <div className="acc-recent-order-right">
                            <span className="acc-recent-total">{formatVND(order.totalAmount)}</span>
                            <span className={`acc-status-badge ${statusBadgeClass(order.status)}`}>{order.status}</span>
                        </div>
                    </div>
                ))}
                {recentOrders.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#888', padding: '20px 0' }}>Bạn chưa có đơn hàng nào</p>
                )}
            </div>

            {/* Membership Progress */}
            <div className="acc-membership-card">
                <h3 className="acc-membership-title">Hạng thành viên của bạn</h3>
                <div className="acc-tier-progress-wrap">
                    {MEMBERSHIP_TIERS.map((t, i) => {
                        const isActive = t.id === tier.id;
                        return (
                            <div key={t.id} className="acc-tier-col">
                                {isActive && <div className="acc-tier-you-label">BẠN</div>}
                                <div className={`acc-tier-dot${isActive ? ' active' : ''}`}>
                                    {getTierEmoji(t.id)}
                                </div>
                                <div className={`acc-tier-name${isActive ? ' active' : ''}`}>{t.label}</div>
                                <div className="acc-tier-threshold">
                                    {t.threshold === 0 ? '0₫' : `${(t.threshold / 1000000).toFixed(0)}tr`}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="acc-progress-bar-wrap">
                    <div
                        className="acc-progress-bar-fill"
                        style={{ width: `${barWidth}%`, transition: 'width 700ms ease-out' }}
                    />
                </div>
                {nextTier && (
                    <p className="acc-tier-remaining">
                        Còn {formatVND(remaining)} nữa để đạt hạng <strong>{nextTier.label}</strong> 🏆
                    </p>
                )}
            </div>

            {/* Quick Actions */}
            <h3 className="acc-section-title" style={{ marginBottom: '12px' }}>Thao tác nhanh</h3>
            <div className="acc-quick-actions">
                {[
                    { icon: Package, label: 'Theo dõi đơn hàng', tab: 'orders' },
                    { icon: User, label: 'Cập nhật hồ sơ', tab: 'profile' },
                    { icon: MapPin, label: 'Quản lý địa chỉ', tab: 'addresses' },
                    { icon: Lock, label: 'Đổi mật khẩu', tab: 'password' },
                ].map(({ icon: Icon, label, tab }) => (
                    <button key={tab} className="acc-quick-action-card" onClick={() => onTabChange(tab)}>
                        <Icon size={24} className="acc-quick-action-icon" />
                        <span className="acc-quick-action-label">{label}</span>
                        <ArrowRight size={16} className="acc-quick-action-arrow" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OverviewTab;

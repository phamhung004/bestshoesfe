import React, { useState } from 'react';
import {
    LayoutDashboard, Package, User, MapPin, Lock, Star, LogOut, ChevronRight, X
} from 'lucide-react';
import { MOCK_CUSTOMER, ACCOUNT_STATS, formatMemberSince, getTierFromSpend, getTierEmoji } from './mockAccountData';

const NAV_ITEMS = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard, count: null },
    { id: 'orders', label: 'Đơn hàng của tôi', icon: Package, count: 'totalOrders' },
    { id: 'profile', label: 'Thông tin cá nhân', icon: User, count: null },
    { id: 'addresses', label: 'Địa chỉ của tôi', icon: MapPin, count: 'addressCount' },
    { id: 'password', label: 'Đổi mật khẩu', icon: Lock, count: null },
    { id: 'reviews', label: 'Đánh giá của tôi', icon: Star, count: 'reviewCount' },
];

const AccountSidebar = ({ activeTab, onTabChange, customerName }) => {
    const [showLogout, setShowLogout] = useState(false);
    const tier = getTierFromSpend(ACCOUNT_STATS.totalSpend);
    const tierEmoji = getTierEmoji(tier.id);
    const tierLabel = `${tierEmoji} Thành viên ${tier.label}`;
    const displayName = customerName || MOCK_CUSTOMER.full_name;
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <>
            <aside className="acc-sidebar">
                {/* User Profile Card */}
                <div className="acc-profile-card">
                    <div className="acc-avatar-wrap">
                        <div className="acc-avatar">
                            <span className="acc-avatar-initial">{initial}</span>
                        </div>
                        <button className="acc-avatar-camera" title="Thay đổi ảnh">📷</button>
                    </div>
                    <div className="acc-profile-name">{displayName}</div>
                    <div className="acc-profile-email">{MOCK_CUSTOMER.email}</div>
                    <div className="acc-tier-badge">{tierLabel}</div>
                    <div className="acc-member-since">{formatMemberSince(MOCK_CUSTOMER.created_at)}</div>

                    <div className="acc-stats-row">
                        <div className="acc-stat-item">
                            <span className="acc-stat-num">{ACCOUNT_STATS.totalOrders}</span>
                            <span className="acc-stat-lbl">Đơn hàng</span>
                        </div>
                        <div className="acc-stat-divider" />
                        <div className="acc-stat-item">
                            <span className="acc-stat-num">{ACCOUNT_STATS.reviewCount}</span>
                            <span className="acc-stat-lbl">Đánh giá</span>
                        </div>
                        <div className="acc-stat-divider" />
                        <div className="acc-stat-item">
                            <span className="acc-stat-num">{ACCOUNT_STATS.addressCount}</span>
                            <span className="acc-stat-lbl">Địa chỉ</span>
                        </div>
                    </div>
                </div>

                {/* Nav Menu */}
                <nav className="acc-nav-card">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const count = item.count ? ACCOUNT_STATS[item.count] : null;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                className={`acc-nav-item${isActive ? ' active' : ''}`}
                                onClick={() => onTabChange(item.id)}
                            >
                                <Icon size={20} className="acc-nav-icon" />
                                <span className="acc-nav-label">{item.label}</span>
                                {count != null && (
                                    <span className="acc-nav-count">{count}</span>
                                )}
                                <ChevronRight size={16} className="acc-nav-chevron" />
                            </button>
                        );
                    })}
                    <div className="acc-nav-divider" />
                    <button className="acc-nav-item acc-nav-logout" onClick={() => setShowLogout(true)}>
                        <LogOut size={20} className="acc-nav-icon" />
                        <span className="acc-nav-label">Đăng xuất</span>
                    </button>
                </nav>
            </aside>

            {/* Mobile Horizontal Tabs */}
            <div className="acc-mobile-tabs">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`acc-mobile-tab${isActive ? ' active' : ''}`}
                            onClick={() => onTabChange(item.id)}
                        >
                            <Icon size={16} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
                <button
                    className="acc-mobile-tab acc-mobile-tab-logout"
                    onClick={() => setShowLogout(true)}
                >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                </button>
            </div>

            {/* Logout Confirm Modal */}
            {showLogout && (
                <div className="acc-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowLogout(false)}>
                    <div className="acc-modal-card acc-modal-sm">
                        <div className="acc-modal-header">
                            <h3 className="acc-modal-title">Đăng xuất</h3>
                            <button className="acc-modal-close" onClick={() => setShowLogout(false)}><X size={20} /></button>
                        </div>
                        <div className="acc-modal-body">
                            <p className="acc-logout-msg">Bạn có chắc muốn đăng xuất khỏi tài khoản?</p>
                        </div>
                        <div className="acc-modal-footer">
                            <button className="acc-btn-ghost" onClick={() => setShowLogout(false)}>Hủy</button>
                            <button className="acc-btn-danger" onClick={() => setShowLogout(false)}>Đăng xuất</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AccountSidebar;

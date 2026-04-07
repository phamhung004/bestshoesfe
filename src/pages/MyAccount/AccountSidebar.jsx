import React, { useState } from 'react';
import {
    LayoutDashboard, Package, User, MapPin, Lock, Star, LogOut, ChevronRight, X, RotateCcw, Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatMemberSince, getTierFromSpend, getTierEmoji } from './mockAccountData';

const NAV_ITEMS = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard, count: null },
    { id: 'orders', label: 'Đơn hàng của tôi', icon: Package, count: 'totalOrders' },
    { id: 'returns', label: 'Yêu cầu trả hàng', icon: RotateCcw, count: null },
    { id: 'wishlist', label: 'Sản phẩm yêu thích', icon: Heart, count: null },
    { id: 'profile', label: 'Thông tin cá nhân', icon: User, count: null },
    { id: 'addresses', label: 'Địa chỉ của tôi', icon: MapPin, count: 'addressCount' },
    { id: 'password', label: 'Đổi mật khẩu', icon: Lock, count: null },
    { id: 'reviews', label: 'Đánh giá của tôi', icon: Star, count: 'reviewCount' },
];

const AccountSidebar = ({ activeTab, onTabChange, customer, stats }) => {
    const [showLogout, setShowLogout] = useState(false);
    const { logout } = useAuth();
    const totalSpend = stats?.totalSpend || 0;
    const tier = getTierFromSpend(totalSpend);
    const tierEmoji = getTierEmoji(tier.id);
    const tierLabel = `${tierEmoji} Thành viên ${tier.label}`;
    const displayName = customer?.fullName || 'Khách hàng';
    const initial = displayName.charAt(0).toUpperCase();
    const email = customer?.email || '';
    const createdAt = customer?.createdAt || '';
    const sidebarStats = {
        totalOrders: stats?.totalOrders || 0,
        reviewCount: stats?.reviewCount || 0,
        addressCount: stats?.addressCount || 0,
    };

    const handleLogout = () => {
        setShowLogout(false);
        logout();
        window.location.href = '/login';
    };

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
                    <div className="acc-profile-email">{email}</div>
                    <div className="acc-tier-badge">{tierLabel}</div>
                    <div className="acc-member-since">{formatMemberSince(createdAt)}</div>

                    <div className="acc-stats-row">
                        <div className="acc-stat-item">
                            <span className="acc-stat-num">{sidebarStats.totalOrders}</span>
                            <span className="acc-stat-lbl">Đơn hàng</span>
                        </div>
                        <div className="acc-stat-divider" />
                        <div className="acc-stat-item">
                            <span className="acc-stat-num">{sidebarStats.reviewCount}</span>
                            <span className="acc-stat-lbl">Đánh giá</span>
                        </div>
                        <div className="acc-stat-divider" />
                        <div className="acc-stat-item">
                            <span className="acc-stat-num">{sidebarStats.addressCount}</span>
                            <span className="acc-stat-lbl">Địa chỉ</span>
                        </div>
                    </div>
                </div>

                {/* Nav Menu */}
                <nav className="acc-nav-card">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const count = item.count ? sidebarStats[item.count] : null;
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
                            <button className="acc-btn-danger" onClick={handleLogout}>Đăng xuất</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AccountSidebar;

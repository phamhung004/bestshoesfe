import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AccountSidebar from './AccountSidebar';
import OverviewTab from './tabs/OverviewTab';
import OrdersTab from './tabs/OrdersTab';
import ProfileTab from './tabs/ProfileTab';
import AddressTab from './tabs/AddressTab';
import PasswordTab from './tabs/PasswordTab';
import ReviewsTab from './tabs/ReviewsTab';
import ReturnsTab from './tabs/ReturnsTab';
import { getProfile } from '../../api/accountApi';
import './MyAccountPage.css';

const TAB_HASHES = {
    overview: 'overview',
    orders: 'orders',
    returns: 'returns',
    profile: 'profile',
    addresses: 'addresses',
    password: 'password',
    reviews: 'reviews',
};

const TAB_TITLES = {
    overview: 'Tổng quan',
    orders: 'Đơn hàng',
    returns: 'Trả hàng',
    profile: 'Thông tin cá nhân',
    addresses: 'Địa chỉ',
    password: 'Đổi mật khẩu',
    reviews: 'Đánh giá',
};

const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    return Object.keys(TAB_HASHES).includes(hash) ? hash : 'overview';
};

const MyAccountPage = () => {
    const [activeTab, setActiveTab] = useState(getInitialTab);
    const [customer, setCustomer] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await getProfile();
            const data = res.data;
            setCustomer({
                customerId: data.customerId,
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender,
                createdAt: data.createdAt,
            });
            if (data.stats) {
                setStats({
                    totalOrders: data.stats.totalOrders || 0,
                    totalSpend: data.stats.totalSpend || 0,
                    reviewCount: data.stats.reviewCount || 0,
                    addressCount: data.stats.addressCount || 0,
                    pendingReviews: data.stats.pendingReviews || 0,
                    activeOrders: data.stats.activeOrders || 0,
                    loyaltyPoints: data.stats.loyaltyPoints || 0,
                    memberTier: data.stats.memberTier || 'bronze',
                });
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        window.location.hash = TAB_HASHES[activeTab];
        document.title = `Tài khoản · ${TAB_TITLES[activeTab]} | BestShoes`;
    }, [activeTab]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab]);

    const handleTabChange = (tab) => setActiveTab(tab);

    const handleNameChange = (newName) => {
        setCustomer(prev => prev ? { ...prev, fullName: newName } : prev);
    };

    if (loading) {
        return (
            <div className="acc-page-wrapper">
                <div className="acc-container" style={{ textAlign: 'center', padding: '80px 0' }}>
                    <span className="acc-spinner" /> Đang tải...
                </div>
            </div>
        );
    }

    return (
        <div className="acc-page-wrapper">
            {/* Breadcrumb */}
            <div className="acc-breadcrumb-bar">
                <div className="acc-container">
                    <div className="acc-breadcrumb">
                        <Link to="/" className="acc-breadcrumb-link">Trang chủ</Link>
                        <span className="acc-breadcrumb-sep">/</span>
                        <span className="acc-breadcrumb-current">Tài khoản của tôi</span>
                    </div>
                </div>
            </div>

            <div className="acc-container">
                <div className="acc-page-layout">
                    {/* Sidebar */}
                    <AccountSidebar
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        customer={customer}
                        stats={stats}
                    />

                    {/* Main Content */}
                    <main className="acc-main-content">
                        {activeTab === 'overview' && <OverviewTab onTabChange={handleTabChange} customer={customer} stats={stats} />}
                        {activeTab === 'orders' && <OrdersTab onOpenReturns={() => handleTabChange('returns')} />}
                        {activeTab === 'returns' && <ReturnsTab />}
                        {activeTab === 'profile' && <ProfileTab customer={customer} stats={stats} onNameChange={handleNameChange} onProfileUpdate={fetchProfile} />}
                        {activeTab === 'addresses' && <AddressTab />}
                        {activeTab === 'password' && <PasswordTab />}
                        {activeTab === 'reviews' && <ReviewsTab />}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MyAccountPage;

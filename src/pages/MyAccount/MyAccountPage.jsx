import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AccountSidebar from './AccountSidebar';
import OverviewTab from './tabs/OverviewTab';
import OrdersTab from './tabs/OrdersTab';
import ProfileTab from './tabs/ProfileTab';
import AddressTab from './tabs/AddressTab';
import PasswordTab from './tabs/PasswordTab';
import ReviewsTab from './tabs/ReviewsTab';
import './MyAccountPage.css';

const TAB_HASHES = {
    overview: 'overview',
    orders: 'orders',
    profile: 'profile',
    addresses: 'addresses',
    password: 'password',
    reviews: 'reviews',
};

const TAB_TITLES = {
    overview: 'Tổng quan',
    orders: 'Đơn hàng',
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
    const [customerName, setCustomerName] = useState(null);

    useEffect(() => {
        window.location.hash = TAB_HASHES[activeTab];
        document.title = `Tài khoản · ${TAB_TITLES[activeTab]} | BestShoes`;
    }, [activeTab]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab]);

    const handleTabChange = (tab) => setActiveTab(tab);

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
                        customerName={customerName}
                    />

                    {/* Main Content */}
                    <main className="acc-main-content">
                        {activeTab === 'overview' && <OverviewTab onTabChange={handleTabChange} />}
                        {activeTab === 'orders' && <OrdersTab />}
                        {activeTab === 'profile' && <ProfileTab onNameChange={setCustomerName} />}
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

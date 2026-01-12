import React from 'react';
import './AdminHeader.css';

const AdminHeader = () => {
  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="admin-header-left">
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Chào mừng bạn đến với trang quản trị</p>
        </div>

        <div className="admin-header-right">
          <div className="admin-user-info">
            <div className="admin-avatar">
              👤
            </div>
            <div className="admin-user-details">
              <div className="admin-user-name">Admin User</div>
              <div className="admin-user-role">Quản trị viên</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

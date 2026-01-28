import React from 'react';

const AdminStats = () => {
  return (
    <div className="admin-stats">
      <h2>Thống kê</h2>
      <div className="stats-container">
        <div className="stat-card">
          <h3>Tổng sản phẩm</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Tổng đơn hàng</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Tổng doanh thu</h3>
          <p className="stat-value">$0</p>
        </div>
        <div className="stat-card">
          <h3>Người dùng hoạt động</h3>
          <p className="stat-value">0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;

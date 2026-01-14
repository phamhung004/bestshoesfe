import React, { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import BrandList from './components/BrandList';
import BrandForm from './components/BrandForm';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('statistics');
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [refreshBrandList, setRefreshBrandList] = useState(false);

  const handleAddBrand = () => {
    setEditingBrand(null);
    setShowBrandForm(true);
  };

  const handleEditBrand = (brand) => {
    setEditingBrand(brand);
    setShowBrandForm(true);
  };

  const handleSaveBrand = () => {
    setShowBrandForm(false);
    setEditingBrand(null);
    // Trigger refresh cho BrandList
    setRefreshBrandList(prev => !prev);
  };

  const handleCancelBrandForm = () => {
    setShowBrandForm(false);
    setEditingBrand(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'statistics':
        return (
          <div className="admin-content-section">
            <h2 className="section-title">Thống kê tổng quan</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-number">1,234</div>
                  <div className="stat-label">Tổng đơn hàng</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <div className="stat-number">$45,678</div>
                  <div className="stat-label">Doanh thu</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-number">567</div>
                  <div className="stat-label">Khách hàng</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <div className="stat-number">89</div>
                  <div className="stat-label">Sản phẩm</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'product-management/products':
        return (
          <div className="admin-content-section">
            <div className="section-header">
              <h2 className="section-title">Quản lý sản phẩm</h2>
              <button className="btn-primary">Thêm sản phẩm mới</button>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>001</td>
                    <td>WELL SHOES SNEAKERS WHITE</td>
                    <td>$100</td>
                    <td>25</td>
                    <td><span className="status-active">Còn hàng</span></td>
                    <td>
                      <button className="btn-edit">Sửa</button>
                      <button className="btn-delete">Xóa</button>
                    </td>
                  </tr>
                  <tr>
                    <td>002</td>
                    <td>Casual Sneakers brown</td>
                    <td>$120</td>
                    <td>15</td>
                    <td><span className="status-active">Còn hàng</span></td>
                    <td>
                      <button className="btn-edit">Sửa</button>
                      <button className="btn-delete">Xóa</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'product-management/colors':
        return (
          <div className="admin-content-section">
            <div className="section-header">
              <h2 className="section-title">Quản lý màu sắc</h2>
              <button className="btn-primary">Thêm màu sắc mới</button>
            </div>
            <div className="color-grid">
              <div className="color-item">
                <div className="color-preview" style={{ backgroundColor: '#FFFFFF' }}></div>
                <div className="color-info">
                  <div className="color-name">Trắng</div>
                  <div className="color-code">#FFFFFF</div>
                </div>
                <div className="color-actions">
                  <button className="btn-edit">Sửa</button>
                  <button className="btn-delete">Xóa</button>
                </div>
              </div>
              <div className="color-item">
                <div className="color-preview" style={{ backgroundColor: '#000000' }}></div>
                <div className="color-info">
                  <div className="color-name">Đen</div>
                  <div className="color-code">#000000</div>
                </div>
                <div className="color-actions">
                  <button className="btn-edit">Sửa</button>
                  <button className="btn-delete">Xóa</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'product-management/sizes':
        return (
          <div className="admin-content-section">
            <div className="section-header">
              <h2 className="section-title">Quản lý kích cỡ</h2>
              <button className="btn-primary">Thêm kích cỡ mới</button>
            </div>
            <div className="size-grid">
              <div className="size-item">
                <div className="size-value">36</div>
                <div className="size-actions">
                  <button className="btn-edit">Sửa</button>
                  <button className="btn-delete">Xóa</button>
                </div>
              </div>
              <div className="size-item">
                <div className="size-value">37</div>
                <div className="size-actions">
                  <button className="btn-edit">Sửa</button>
                  <button className="btn-delete">Xóa</button>
                </div>
              </div>
              <div className="size-item">
                <div className="size-value">38</div>
                <div className="size-actions">
                  <button className="btn-edit">Sửa</button>
                  <button className="btn-delete">Xóa</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'product-management/materials':
        return (
          <div className="admin-content-section">
            <div className="section-header">
              <h2 className="section-title">Quản lý chất liệu</h2>
              <button className="btn-primary">Thêm chất liệu mới</button>
            </div>
            <div className="material-grid">
              <div className="material-item">
                <div className="material-name">Da tổng hợp</div>
                <div className="material-description">Chất liệu bền, dễ vệ sinh</div>
                <div className="material-actions">
                  <button className="btn-edit">Sửa</button>
                  <button className="btn-delete">Xóa</button>
                </div>
              </div>
              <div className="material-item">
                <div className="material-name">Vải canvas</div>
                <div className="material-description">Thân thiện với môi trường</div>
                <div className="material-actions">
                  <button className="btn-edit">Sửa</button>
                  <button className="btn-delete">Xóa</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'in-store-sales':
        return (
          <div className="admin-content-section">
            <h2 className="section-title">Bán hàng tại quầy</h2>
            <div className="placeholder-content">
              <div className="placeholder-icon">🏪</div>
              <h3>Chức năng bán hàng tại quầy</h3>
              <p>Đang phát triển...</p>
            </div>
          </div>
        );

      case 'order-management':
        return (
          <div className="admin-content-section">
            <h2 className="section-title">Quản lý đơn hàng</h2>
            <div className="placeholder-content">
              <div className="placeholder-icon">📋</div>
              <h3>Quản lý đơn hàng</h3>
              <p>Đang phát triển...</p>
            </div>
          </div>
        );

      case 'user-management':
        return (
          <div className="admin-content-section">
            <h2 className="section-title">Quản lý người dùng</h2>
            <div className="placeholder-content">
              <div className="placeholder-icon">👥</div>
              <h3>Quản lý người dùng</h3>
              <p>Đang phát triển...</p>
            </div>
          </div>
        );

      case 'returns':
        return (
          <div className="admin-content-section">
            <h2 className="section-title">Quản lý trả hàng</h2>
            <div className="placeholder-content">
              <div className="placeholder-icon">↩️</div>
              <h3>Quản lý trả hàng</h3>
              <p>Đang phát triển...</p>
            </div>
          </div>
        );

      case 'product-management/brands':
        return (
          <BrandList
            onEdit={handleEditBrand}
            onAdd={handleAddBrand}
            refreshTrigger={refreshBrandList}
          />
        );

      default:
        return (
          <div className="admin-content-section">
            <h2 className="section-title">Chào mừng đến trang quản trị</h2>
            <p>Chọn một mục từ sidebar để bắt đầu.</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="admin-main">
        <AdminHeader />
        <main className="admin-content">
          {renderContent()}
        </main>
      </div>

      {showBrandForm && (
        <BrandForm
          brand={editingBrand}
          onSave={handleSaveBrand}
          onCancel={handleCancelBrandForm}
          isEditing={!!editingBrand}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

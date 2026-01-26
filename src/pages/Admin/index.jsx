import React, { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import BrandList from './components/BrandList';
import BrandForm from './components/BrandForm';
import CategoryList from './components/CategoryList';
import CategoryForm from './components/CategoryForm';
import MaterialList from './components/MaterialList';
import MaterialForm from './components/MaterialForm';
import SizeList from './components/SizeList';
import SizeForm from './components/SizeForm';
import ColorList from './components/ColorList';
import ColorForm from './components/ColorForm';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import CouponList from './components/CouponList';
import CouponForm from './components/CouponForm';
import PromotionList from './components/PromotionList';
import PromotionForm from './components/PromotionForm';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('statistics');
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [refreshBrandList, setRefreshBrandList] = useState(false);
  // Category state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [refreshCategoryList, setRefreshCategoryList] = useState(false);
  // Material state
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [refreshMaterialList, setRefreshMaterialList] = useState(false);
  // Size state
  const [showSizeForm, setShowSizeForm] = useState(false);
  const [editingSize, setEditingSize] = useState(null);
  const [refreshSizeList, setRefreshSizeList] = useState(false);
  // Color state
  const [showColorForm, setShowColorForm] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [refreshColorList, setRefreshColorList] = useState(false);

  const handleAddBrand = () => {
    setEditingBrand(null);
    setShowBrandForm(true);
  };

  const handleEditBrand = (brand) => {
    setEditingBrand(brand);
    setShowBrandForm(true);
  };

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };
  const handleSaveCategory = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setRefreshCategoryList(prev => !prev);
  };
  const handleCancelCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  // Material handlers
  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setShowMaterialForm(true);
  };
  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setShowMaterialForm(true);
  };
  const handleSaveMaterial = () => {
    setShowMaterialForm(false);
    setEditingMaterial(null);
    setRefreshMaterialList(prev => !prev);
  };
  const handleCancelMaterialForm = () => {
    setShowMaterialForm(false);
    setEditingMaterial(null);
  };

  // Size handlers
  const handleAddSize = () => {
    setEditingSize(null);
    setShowSizeForm(true);
  };
  const handleEditSize = (size) => {
    setEditingSize(size);
    setShowSizeForm(true);
  };
  const handleSaveSize = () => {
    setShowSizeForm(false);
    setEditingSize(null);
    setRefreshSizeList(prev => !prev);
  };
  const handleCancelSizeForm = () => {
    setShowSizeForm(false);
    setEditingSize(null);
  };

  // Color handlers
  const handleAddColor = () => {
    setEditingColor(null);
    setShowColorForm(true);
  };
  const handleEditColor = (color) => {
    setEditingColor(color);
    setShowColorForm(true);
  };
  const handleSaveColor = () => {
    setShowColorForm(false);
    setEditingColor(null);
    setRefreshColorList(prev => !prev);
  };
  const handleCancelColorForm = () => {
    setShowColorForm(false);
    setEditingColor(null);
  };

  // Product handlers
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [refreshProductList, setRefreshProductList] = useState(false);
  // Coupon handlers
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [refreshCouponList, setRefreshCouponList] = useState(false);
  // Promotion handlers
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [refreshPromotionList, setRefreshPromotionList] = useState(false);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleSaveProduct = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setRefreshProductList(prev => !prev);
  };

  const handleCancelProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  // Coupon handlers
  const handleAddCoupon = () => {
    setEditingCoupon(null);
    setShowCouponForm(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setShowCouponForm(true);
  };

  const handleSaveCoupon = () => {
    setShowCouponForm(false);
    setEditingCoupon(null);
    setRefreshCouponList(prev => !prev);
  };

  const handleCancelCouponForm = () => {
    setShowCouponForm(false);
    setEditingCoupon(null);
  };

  // Promotion handlers
  const handleAddPromotion = () => {
    setEditingPromotion(null);
    setShowPromotionForm(true);
  };

  const handleEditPromotion = (promotion) => {
    setEditingPromotion(promotion);
    setShowPromotionForm(true);
  };

  const handleSavePromotion = () => {
    setShowPromotionForm(false);
    setEditingPromotion(null);
    setRefreshPromotionList(prev => !prev);
  };

  const handleCancelPromotionForm = () => {
    setShowPromotionForm(false);
    setEditingPromotion(null);
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
          <ProductList
            onEdit={handleEditProduct}
            onAdd={handleAddProduct}
            refreshTrigger={refreshProductList}
          />
        );

      case 'product-management/colors':
        return (
          <ColorList
            onEdit={handleEditColor}
            onAdd={handleAddColor}
            refreshTrigger={refreshColorList}
          />
        );

      case 'product-management/sizes':
        return (
          <SizeList
            onEdit={handleEditSize}
            onAdd={handleAddSize}
            refreshTrigger={refreshSizeList}
          />
        );

      case 'product-management/materials':
        return (
          <MaterialList
            onEdit={handleEditMaterial}
            onAdd={handleAddMaterial}
            refreshTrigger={refreshMaterialList}
          />
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
      case 'product-management/categories':
        return (
          <CategoryList
            onEdit={handleEditCategory}
            onAdd={handleAddCategory}
            refreshTrigger={refreshCategoryList}
          />
        );

      case 'sales-management/coupons':
        return (
          <CouponList
            onEdit={handleEditCoupon}
            onAdd={handleAddCoupon}
            refreshTrigger={refreshCouponList}
          />
        );

      case 'sales-management/promotions':
        return (
          <PromotionList
            onEdit={handleEditPromotion}
            onAdd={handleAddPromotion}
            refreshTrigger={refreshPromotionList}
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
      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={handleCancelCategoryForm}
          isEditing={!!editingCategory}
        />
      )}
      {showMaterialForm && (
        <MaterialForm
          material={editingMaterial}
          onSave={handleSaveMaterial}
          onCancel={handleCancelMaterialForm}
          isEditing={!!editingMaterial}
        />
      )}
      {showSizeForm && (
        <SizeForm
          size={editingSize}
          onSave={handleSaveSize}
          onCancel={handleCancelSizeForm}
          isEditing={!!editingSize}
        />
      )}
      {showColorForm && (
        <ColorForm
          color={editingColor}
          onSave={handleSaveColor}
          onCancel={handleCancelColorForm}
          isEditing={!!editingColor}
        />
      )}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={handleCancelProductForm}
          isEditing={!!editingProduct}
        />
      )}
      {showCouponForm && (
        <CouponForm
          coupon={editingCoupon}
          onSave={handleSaveCoupon}
          onCancel={handleCancelCouponForm}
          isEditing={!!editingCoupon}
        />
      )}
      {showPromotionForm && (
        <PromotionForm
          promotion={editingPromotion}
          onSave={handleSavePromotion}
          onCancel={handleCancelPromotionForm}
          isEditing={!!editingPromotion}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

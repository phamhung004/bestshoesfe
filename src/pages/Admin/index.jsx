import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import DashboardOverview from './components/DashboardOverview';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import CouponList from './components/CouponList';
import CouponForm from './components/CouponForm';
import PromotionManagement from './components/Promotion/PromotionManagement';
// import ErrorBoundary from './components/ErrorBoundary';
// import BrandList from './components/Brand/BrandList';
// import BrandForm from './components/Brand/BrandForm';
// import CategoryList from './components/Category/CategoryList';
// import CategoryForm from './components/Category/CategoryForm';
// import MaterialList from './components/Material/MaterialList';
// import MaterialForm from './components/Material/MaterialForm';
// import SizeList from './components/SizeList';
// import SizeForm from './components/SizeForm';
// import ColorList from './components/ColorList';
// import ColorForm from './components/ColorForm';
// import ProductList from './components/Product/ProductList';
// import ProductForm from './components/Product/ProductForm';
import AdminStats from "./components/AdminStats";
import CustomerList from "./components/User/CustomerList";
import CustomerForm from "./components/User/CustomerForm";
import EmployeeList from "./components/User/EmployeeList";
import EmployeeForm from "./components/User/EmployeeForm";
import ErrorBoundary from "./components/ErrorBoundary";
import BrandList from "./components/Brand/BrandList";
import BrandForm from "./components/Brand/BrandForm";
import CategoryList from "./components/Category/CategoryList";
import CategoryForm from "./components/Category/CategoryForm";
import MaterialList from "./components/Material/MaterialList";
import MaterialForm from "./components/Material/MaterialForm";
import SizeList from "./components/SizeList";
import SizeForm from "./components/SizeForm";
import ColorList from "./components/ColorList";
import ColorForm from "./components/ColorForm";
import ProductList from "./components/Product/ProductList";
import ProductForm from "./components/Product/ProductForm";
import OrderManagement from "./components/Order/OrderManagement";
import POSPage from "./components/POS/POSPage";
import ReturnManagement from "./components/Return/ReturnManagement";
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  // User management state
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
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

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

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
    setRefreshCategoryList((prev) => !prev);
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
    setRefreshMaterialList((prev) => !prev);
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
    setRefreshSizeList((prev) => !prev);
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
    setRefreshColorList((prev) => !prev);
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

  // Promotion management is now self-contained in PromotionManagement component

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
    setRefreshProductList((prev) => !prev);
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



  const handleSidebarSectionChange = (sectionId) => {
    if (sectionId === 'account-management') {
      navigate('/admin/tai-khoan');
      return;
    }

    if (sectionId === 'products') {
      navigate('/admin/san-pham');
      return;
    }

    setActiveSection(sectionId);
  };

  const handleSaveBrand = () => {
    setShowBrandForm(false);
    setEditingBrand(null);
    // Trigger refresh for BrandList
    setRefreshBrandList((prev) => !prev);
  };

  const handleCancelBrandForm = () => {
    setShowBrandForm(false);
    setEditingBrand(null);
  };

  // Get page title based on active section
  const getPageTitle = () => {
    const titles = {
      'dashboard': 'Tổng quan',
      'analytics': 'Phân tích nâng cao',
      'product-management/products': 'Quản lý sản phẩm',
      'product-management/brands': 'Quản lý thương hiệu',
      'product-management/categories': 'Quản lý danh mục',
      'product-management/colors': 'Quản lý màu sắc',
      'product-management/sizes': 'Quản lý kích cỡ',
      'product-management/materials': 'Quản lý chất liệu',
      'order-management': 'Quản lý đơn hàng',
      'user-management/customers': 'Quản lý khách hàng',
      'user-management/employees': 'Quản lý nhân viên',
      'returns': 'Quản lý trả hàng',
      'in-store-sales': 'Bán hàng tại quầy',
      'promotions/promotions-list': 'Đợt giảm giá',
      'promotions/coupons': 'Mã giảm giá',
    };
    return titles[activeSection] || 'Dashboard';
  };

  // Get page subtitle based on active section
  const getPageSubtitle = () => {
    const subtitles = {
      'dashboard': 'Chào mừng bạn trở lại! Dưới đây là thống kê doanh nghiệp của bạn.',
      'analytics': 'Theo dõi và phân tích hiệu suất kinh doanh chi tiết.',
      'product-management/products': 'Quản lý và cập nhật thông tin sản phẩm.',
      'product-management/brands': 'Thêm và chỉnh sửa thương hiệu sản phẩm.',
      'product-management/categories': 'Phân loại và quản lý danh mục sản phẩm.',
      'product-management/colors': 'Quản lý các màu sắc có sẵn.',
      'product-management/sizes': 'Quản lý các kích cỡ giày.',
      'product-management/materials': 'Quản lý chất liệu sản phẩm.',
      'order-management': 'Theo dõi và xử lý đơn hàng.',
      'user-management/customers': 'Quản lý thông tin khách hàng.',
      'user-management/employees': 'Quản lý thông tin nhân viên.',
      'returns': 'Xử lý yêu cầu trả hàng.',
      'in-store-sales': 'Bán hàng trực tiếp tại cửa hàng.',
      'promotions/promotions-list': 'Tạo và quản lý đợt giảm giá.',
      'promotions/coupons': 'Tạo và quản lý mã giảm giá.',
    };
    return subtitles[activeSection] || 'Quản lý và điều hành';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'analytics':
        return <AnalyticsDashboard />;

      case 'dashboard':
        return <DashboardOverview />;

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

      case 'in-store-sales':
        return <POSPage />;

      case 'order-management':
        return <OrderManagement />;

      // case 'user-management':
      //   return (
      //     <div className="admin-content-section">
      //       <h2 className="section-title">Quản lý khách hàng</h2>
      //       <div className="placeholder-content">
      //         <div className="placeholder-icon">👥</div>
      //         <h3>Quản lý người dùng</h3>
      //         <p>Đang phát triển...</p>
      //       </div>
      //     </div>
      case "user-management/customers":
        return (
          <CustomerList
            onEdit={(c) => { setEditingCustomer(c); setShowCustomerForm(true); }}
            onAdd={() => { setEditingCustomer(null); setShowCustomerForm(true); }}
          />
        );

      case "user-management/employees":
        return (
          <EmployeeList
            onEdit={(e) => { setEditingEmployee(e); setShowEmployeeForm(true); }}
            onAdd={() => { setEditingEmployee(null); setShowEmployeeForm(true); }}
          />
        );

      case 'returns':
        return <ReturnManagement />;

      case 'promotions/promotions-list':
        return <PromotionManagement />;

      case 'promotions/coupons':
        return (
          <CouponList
            onEdit={handleEditCoupon}
            onAdd={handleAddCoupon}
            refreshTrigger={refreshCouponList}
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
    // <div className={`admin-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
    //   <AdminSidebar
    //     activeSection={activeSection}
    //     onSectionChange={setActiveSection}
    //     isCollapsed={sidebarCollapsed}
    //     onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
    //   />
    //   <div className="admin-main">
    //     <AdminHeader
    //       title={getPageTitle()}
    //       subtitle={getPageSubtitle()}
    //       darkMode={darkMode}
    //       onToggleDarkMode={() => setDarkMode(!darkMode)}
    //     />
    //     <main className="admin-content">
    //       <ErrorBoundary>
    //         {renderContent()}
    //       </ErrorBoundary>
    //     </main>
    //   </div>

    //   {showBrandForm && (
    //     <BrandForm
    //       brand={editingBrand}
    //       onSave={handleSaveBrand}
    //       onCancel={handleCancelBrandForm}
    //       isEditing={!!editingBrand}
    //     />
    //   )}

    //   {showCategoryForm && (
    //     <CategoryForm
    //       category={editingCategory}
    //       onSave={handleSaveCategory}
    //       onCancel={handleCancelCategoryForm}
    //       isEditing={!!editingCategory}
    //     />
    //   )}

    //   {showMaterialForm && (
    //     <MaterialForm
    //       material={editingMaterial}
    //       onSave={handleSaveMaterial}
    //       onCancel={handleCancelMaterialForm}
    //       isEditing={!!editingMaterial}
    //     />
    //   )}

    //   {showSizeForm && (
    //     <SizeForm
    //       size={editingSize}
    //       onSave={handleSaveSize}
    //       onCancel={handleCancelSizeForm}
    //       isEditing={!!editingSize}
    //     />
    //   )}

    //   {showColorForm && (
    //     <ColorForm
    //       color={editingColor}
    //       onSave={handleSaveColor}
    //       onCancel={handleCancelColorForm}
    //       isEditing={!!editingColor}
    //     />
    //   )}

    //   {showProductForm && (
    //     <ErrorBoundary>
    //       <ProductForm
    //         product={editingProduct}
    //         onSave={handleSaveProduct}
    //         onCancel={handleCancelProductForm}
    //         isEditing={!!editingProduct}
    //       />
    //     </ErrorBoundary>
    //   )}

    //   {showCouponForm && (
    //     <CouponForm
    //       coupon={editingCoupon}
    //       onSave={handleSaveCoupon}
    //       onCancel={handleCancelCouponForm}
    //       isEditing={!!editingCoupon}
    //     />
    //   )}

    //   {showPromotionForm && (
    //     <PromotionForm
    //       promotion={editingPromotion}
    //       onSave={handleSavePromotion}
    //       onCancel={handleCancelPromotionForm}
    //       isEditing={!!editingPromotion}
    //     />
    //   )}
    // </div>
    <div className="admin-dashboard">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={handleSidebarSectionChange}
      />
      <div className="admin-main">
        <AdminHeader />
        <main className="admin-content">{renderContent()}</main>
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
        <ErrorBoundary>
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={handleCancelProductForm}
            isEditing={!!editingProduct}
          />
        </ErrorBoundary>
      )}
      {showCouponForm && (
        <CouponForm
          coupon={editingCoupon}
          onSave={handleSaveCoupon}
          onCancel={handleCancelCouponForm}
          isEditing={!!editingCoupon}
        />
      )}


      {showCustomerForm && (
        <CustomerForm
          customer={editingCustomer}
          onSave={() => { setShowCustomerForm(false); setEditingCustomer(null); }}
          onCancel={() => { setShowCustomerForm(false); setEditingCustomer(null); }}
          isEditing={!!editingCustomer}
        />
      )}

      {showEmployeeForm && (
        <EmployeeForm
          employee={editingEmployee}
          onSave={() => { setShowEmployeeForm(false); setEditingEmployee(null); }}
          onCancel={() => { setShowEmployeeForm(false); setEditingEmployee(null); }}
          isEditing={!!editingEmployee}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

import React, { useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import AdminStats from "./components/AdminStats";
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
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("statistics");
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

  const handleSaveBrand = () => {
    setShowBrandForm(false);
    setEditingBrand(null);
    // Trigger refresh cho BrandList
    setRefreshBrandList((prev) => !prev);
  };

  const handleCancelBrandForm = () => {
    setShowBrandForm(false);
    setEditingBrand(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "statistics":
        return <AdminStats />;

      case "product-management/products":
        return (
          <ProductList
            onEdit={handleEditProduct}
            onAdd={handleAddProduct}
            refreshTrigger={refreshProductList}
          />
        );

      case "product-management/colors":
        return (
          <ColorList
            onEdit={handleEditColor}
            onAdd={handleAddColor}
            refreshTrigger={refreshColorList}
          />
        );

      case "product-management/sizes":
        return (
          <SizeList
            onEdit={handleEditSize}
            onAdd={handleAddSize}
            refreshTrigger={refreshSizeList}
          />
        );

      case "product-management/materials":
        return (
          <MaterialList
            onEdit={handleEditMaterial}
            onAdd={handleAddMaterial}
            refreshTrigger={refreshMaterialList}
          />
        );

      case "product-management/brands":
        return (
          <BrandList
            onEdit={handleEditBrand}
            onAdd={handleAddBrand}
            refreshTrigger={refreshBrandList}
          />
        );

      case "product-management/categories":
        return (
          <CategoryList
            onEdit={handleEditCategory}
            onAdd={handleAddCategory}
            refreshTrigger={refreshCategoryList}
          />
        );

      case "in-store-sales":
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

      case "order-management":
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

      case "user-management":
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

      case "returns":
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

      case "product-management/brands":
        return (
          <BrandList
            onEdit={handleEditBrand}
            onAdd={handleAddBrand}
            refreshTrigger={refreshBrandList}
          />
        );
      case "product-management/categories":
        return (
          <CategoryList
            onEdit={handleEditCategory}
            onAdd={handleAddCategory}
            refreshTrigger={refreshCategoryList}
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
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
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
    </div>
  );
};

export default AdminDashboard;

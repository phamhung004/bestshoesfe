import React from 'react';
import { Download, Plus, Home } from 'lucide-react';

/**
 * ProductPageHeader
 * Props: onAdd(), onExportExcel()
 */
const ProductPageHeader = ({ onAdd, onExportExcel }) => {
  return (
    <div className="pm-card pm-page-header">
      {/* Left: breadcrumb + title */}
      <div>
        <nav className="pm-breadcrumb" aria-label="breadcrumb">
          <Home size={12} />
          <span>Admin</span>
          <span className="pm-breadcrumb-sep">/</span>
          <span className="pm-breadcrumb-current">Sản phẩm</span>
        </nav>
        <h1 className="pm-page-title">Quản lý Sản phẩm</h1>
        <p className="pm-page-subtitle">Quản lý toàn bộ danh mục sản phẩm của cửa hàng</p>
      </div>

      {/* Right: action buttons */}
      <div className="pm-header-actions">
        <button
          className="pm-btn pm-btn-outline"
          onClick={onExportExcel}
          title="Xuất dữ liệu ra Excel"
          type="button"
        >
          <Download size={15} />
          Xuất Excel
        </button>

        <button
          className="pm-btn pm-btn-primary"
          onClick={onAdd}
          type="button"
        >
          <Plus size={15} />
          Thêm sản phẩm
        </button>
      </div>
    </div>
  );
};

export default ProductPageHeader;

import React from 'react';
import { Download, Plus } from 'lucide-react';

const AccountPageHeader = ({ activeTab, onAdd, onExportExcel }) => {
  return (
    <div className="am-card am-page-header">
      <div>
        <div className="am-breadcrumb">
          <span>Admin</span>
          <span className="am-breadcrumb-sep">/</span>
          <span className="am-breadcrumb-current">Tài khoản</span>
        </div>
        <h1 className="am-page-title">Quản lý Tài khoản</h1>
        <p className="am-page-subtitle">Quản lý khách hàng và nhân viên hệ thống</p>
      </div>
      <div className="am-header-actions">
        <button className="am-btn am-btn-outline" onClick={onExportExcel}>
          <Download size={16} />
          Xuất Excel
        </button>
        <button className="am-btn am-btn-primary" onClick={onAdd}>
          <Plus size={16} />
          + Thêm tài khoản
        </button>
      </div>
    </div>
  );
};

export default AccountPageHeader;

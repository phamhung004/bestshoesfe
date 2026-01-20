import React, { useState, useEffect } from 'react';
import './AdminSidebar.css';

const AdminSidebar = ({ activeSection, onSectionChange }) => {
  const [expandedItems, setExpandedItems] = useState({
    'product-management': false
  });

  const menuItems = [
    {
      id: 'statistics',
      label: 'Thống kê',
      icon: '📊',
      type: 'single'
    },
    {
      id: 'product-management',
      label: 'Quản lý sản phẩm',
      icon: '📦',
      type: 'parent',
      children: [
        { id: 'products', label: 'Sản phẩm' },
        { id: 'brands', label: 'Thương hiệu' },
        { id: 'categories', label: 'Danh mục' },
        { id: 'colors', label: 'Màu sắc' },
        { id: 'sizes', label: 'Kích cỡ' },
        { id: 'materials', label: 'Chất liệu' }
      ]
    },
    {
      id: 'in-store-sales',
      label: 'Bán hàng tại quầy',
      icon: '🏪',
      type: 'single'
    },
    {
      id: 'order-management',
      label: 'Quản lý đơn hàng',
      icon: '📋',
      type: 'single'
    },
    {
      id: 'user-management',
      label: 'Quản lý người dùng',
      icon: '👥',
      type: 'single'
    },
    {
      id: 'returns',
      label: 'Trả hàng',
      icon: '↩️',
      type: 'single'
    },
    {
      id: 'sales-management',
      label: 'Giảm giá',
      icon: '📦',
      type: 'parent',
      children: [
        { id: 'promotions', label: 'Đợt giảm giá' },
        { id: 'coupons', label: 'Mã giảm giá' }
        
      ]
    }
  ];

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Auto-expand parent menus when activeSection is inside them
  useEffect(() => {
    const newExpanded = { ...expandedItems };
    menuItems.forEach((item) => {
      if (item.type === 'parent') {
        newExpanded[item.id] = activeSection.startsWith(`${item.id}/`);
      }
    });
    setExpandedItems(newExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const handleItemClick = (itemId, type, parentId = null) => {
    if (type === 'parent') {
      toggleExpanded(itemId);
    } else {
      const finalId = parentId ? `${parentId}/${itemId}` : itemId;
      onSectionChange(finalId);
    }
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">ADMIN PANEL</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-item-container">
            <div
              className={`menu-item ${item.type === 'parent' ? 'menu-item-parent' : ''} ${
                activeSection === item.id || activeSection.startsWith(`${item.id}/`) ? 'menu-item-active' : ''
              }`}
              onClick={() => handleItemClick(item.id, item.type)}
            >
              <div className="menu-item-content">
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                {item.type === 'parent' && (
                  <span className={`menu-arrow ${expandedItems[item.id] ? 'expanded' : ''}`}>
                    ▼
                  </span>
                )}
              </div>
            </div>

        {item.type === 'parent' && expandedItems[item.id] && (
              <div className="submenu">
                {item.children.map((child) => (
                  <div
                    key={child.id}
                    className={`submenu-item ${
                      activeSection === `${item.id}/${child.id}` ? 'submenu-item-active' : ''
                    }`}
                    onClick={() => handleItemClick(child.id, 'child', item.id)}
                  >
                    <span className="submenu-label">{child.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;

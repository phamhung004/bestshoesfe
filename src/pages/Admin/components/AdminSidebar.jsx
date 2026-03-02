import React, { useState, useEffect } from 'react';
import './AdminSidebar.css';

// SVG Icons as components for better visual quality
const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Analytics: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Products: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Box: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
  Tag: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Orders: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Returns: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
    </svg>
  ),
  POS: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  Discount: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Logo: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#logo-gradient)"/>
      <path d="M8 22V14C8 12.8954 8.89543 12 10 12H14C15.1046 12 16 12.8954 16 14V22M22 22V14C22 12.8954 21.1046 12 20 12H18C16.8954 12 16 12.8954 16 14V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="10" r="2" fill="white"/>
      <circle cx="20" cy="10" r="2" fill="white"/>
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1"/>
          <stop offset="1" stopColor="#4F46E5"/>
        </linearGradient>
      </defs>
    </svg>
  ),
};

const menuStructure = [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    icon: Icons.Dashboard,
    type: 'single',
  },
  {
    id: 'analytics',
    label: 'Phân tích',
    icon: Icons.Analytics,
    type: 'single',
  },{
    id: 'products',
    label: 'Sản phẩm',
    icon: Icons.Analytics,
    type: 'single',
  },
  {
    id: 'product-management',
    label: 'Quản lý sản phẩm',
    icon: Icons.Products,
    type: 'parent',
    children: [
      { id: 'products', label: 'Sản phẩm', icon: Icons.Box },
      { id: 'brands', label: 'Thương hiệu', icon: Icons.Tag },
      { id: 'categories', label: 'Danh mục', icon: Icons.Tag },
      { id: 'colors', label: 'Màu sắc', icon: Icons.Tag },
      { id: 'sizes', label: 'Kích cỡ', icon: Icons.Tag },
      { id: 'materials', label: 'Chất liệu', icon: Icons.Tag },
    ],
  },
  {
    id: 'order-management',
    label: 'Đơn hàng',
    icon: Icons.Orders,
    type: 'single',
  },
  {
    id: 'user-management',
    label: 'Tài khoản',
    icon: Icons.Users,
    type: 'parent',
    children: [
      { id: 'customers', label: 'Khách hàng', icon: Icons.Users },
      { id: 'employees', label: 'Nhân viên', icon: Icons.Users },
    ],
  },
  {
    id: 'account-management',
    label: 'Quản lý tài khoản',
    icon: Icons.Returns,
    type: 'single',
  },
  {
    id: 'returns',
    label: 'Trả hàng',
    icon: Icons.Returns,
    type: 'single',
  },
  {
    id: 'in-store-sales',
    label: 'Bán hàng tại quầy',
    icon: Icons.POS,
    type: 'single',
  },
  {
    id: 'promotions',
    label: 'Khuyến mãi',
    icon: Icons.Discount,
    type: 'parent',
    children: [
      { id: 'promotions-list', label: 'Đợt giảm giá', icon: Icons.Tag },
      { id: 'coupons', label: 'Mã giảm giá', icon: Icons.Tag },
    ],
  },
];

const AdminSidebar = ({ activeSection, onSectionChange, isCollapsed, onToggleCollapse }) => {
  const [expandedItems, setExpandedItems] = useState({
    'product-management': activeSection.startsWith('product-management/'),
    'user-management': activeSection.startsWith('user-management/'),
    'promotions': activeSection.startsWith('promotions/'),
  });


  // Auto-expand parent menus when activeSection is inside them
  useEffect(() => {
    const newExpanded = { ...expandedItems };
    menuStructure.forEach((item) => {
      if (item.type === 'parent') {
        newExpanded[item.id] = activeSection.startsWith(`${item.id}/`);
      }
    });
    setExpandedItems(newExpanded);
  }, [activeSection]);

  // const menuItems = [
  //   {
  //     id: 'statistics',
  //     label: 'Thống kê',
  //     icon: '📊',
  //     type: 'single'
  //   },
  //   {
  //     id: 'product-management',
  //     label: 'Quản lý sản phẩm',
  //     icon: '📦',
  //     type: 'parent',
  //     children: [
  //       { id: 'products', label: 'Sản phẩm' },
  //       { id: 'brands', label: 'Thương hiệu' },
  //       { id: 'categories', label: 'Danh mục' },
  //       { id: 'colors', label: 'Màu sắc' },
  //       { id: 'sizes', label: 'Kích cỡ' },
  //       { id: 'materials', label: 'Chất liệu' }
  //     ]
  //   },
  //   {
  //     id: 'in-store-sales',
  //     label: 'Bán hàng tại quầy',
  //     icon: '🏪',
  //     type: 'single'
  //   },
  //   {
  //     id: 'order-management',
  //     label: 'Quản lý đơn hàng',
  //     icon: '📋',
  //     type: 'single'
  //   },
  //   {
  //     id: 'user-management',
  //     label: 'Quản lý người dùng',
  //     icon: '👥',
  //     type: 'parent',
  //     children: [
  //       { id: 'customers', label: 'Khách hàng' },
  //       { id: 'employees', label: 'Nhân viên' }
  //     ]
  //   },
  //   {
  //     id: 'returns',
  //     label: 'Trả hàng',
  //     icon: '↩️',
  //     type: 'single'
  //   },
  //   {
  //     id: 'sales-management',
  //     label: 'Giảm giá',
  //     icon: '📦',
  //     type: 'parent',
  //     children: [
  //       { id: 'promotions', label: 'Đợt giảm giá' },
  //       { id: 'coupons', label: 'Mã giảm giá' }

  //     ]
  //   }
  // ];


  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleItemClick = (itemId, type, parentId = null) => {
    if (type === 'parent') {
      toggleExpanded(itemId);
    } else {
      const finalId = parentId ? `${parentId}/${itemId}` : itemId;
      onSectionChange(finalId);
    }
  };

  const renderMenuItem = (item, index) => {
    const isActive = item.type === 'single'
      ? activeSection === item.id
      : activeSection.startsWith(`${item.id}/`);

    const Icon = item.icon;
    const isExpanded = expandedItems[item.id];

    return (
      <div key={item.id} className="menu-item-container">
        <div
          className={`menu-item ${isActive ? 'menu-item-active' : ''} ${item.type === 'parent' ? 'menu-item-parent' : ''}`}
          onClick={() => handleItemClick(item.id, item.type)}
        >
          <div className="menu-item-content">
            <span className="menu-icon-wrapper">
              <Icon />
            </span>
            <span className="menu-label">{item.label}</span>
            {item.type === 'parent' && (
              <span className={`menu-arrow ${isExpanded ? 'expanded' : ''}`}>
                <Icons.ChevronDown />
              </span>
            )}
          </div>
        </div>

        {item.type === 'parent' && isExpanded && (
          <div className="submenu">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              const isChildActive = activeSection === `${item.id}/${child.id}`;

              return (
                <div
                  key={child.id}
                  className={`submenu-item ${isChildActive ? 'submenu-item-active' : ''}`}
                  onClick={() => handleItemClick(child.id, 'child', item.id)}
                >
                  <div className="submenu-icon">
                    <ChildIcon />
                  </div>
                  <span className="submenu-label">{child.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-wrapper">
          <Icons.Logo />
        </div>
        {!isCollapsed && (
          <div className="sidebar-title-wrapper">
            <h2 className="sidebar-title">BestShoes</h2>
            <p className="sidebar-subtitle">Admin Panel</p>
          </div>
        )}
      </div>

      <button
        className="collapse-toggle"
        onClick={onToggleCollapse}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Icons.ChevronRight />
      </button>

      <nav className="sidebar-nav">
        {menuStructure.map((item, index) => renderMenuItem(item, index))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-item">
          <span className="footer-icon">
            <Icons.Settings />
          </span>
          {!isCollapsed && <span className="footer-label">Cài đặt</span>}
        </div>
      </div>
    </aside>
  // return (
  //     <div className="admin-sidebar">
  //       <div className="sidebar-header">
  //         <h2 className="sidebar-title">ADMIN PANEL</h2>
  //       </div>

  //       <nav className="sidebar-nav">
  //         {menuItems.map((item) => (
  //             <div key={item.id} className="menu-item-container">
  //               <div
  //                   className={`menu-item ${item.type === 'parent' ? 'menu-item-parent' : ''} ${
  //                       activeSection === item.id || activeSection.startsWith(`${item.id}/`) ? 'menu-item-active' : ''
  //                   }`}
  //                   onClick={() => handleItemClick(item.id, item.type)}
  //               >
  //                 <div className="menu-item-content">
  //                   <span className="menu-icon">{item.icon}</span>
  //                   <span className="menu-label">{item.label}</span>
  //                   {item.type === 'parent' && (
  //                       <span className={`menu-arrow ${expandedItems[item.id] ? 'expanded' : ''}`}>
  //                   ▼
  //                 </span>
  //                   )}
  //                 </div>
  //               </div>

  //               {item.type === 'parent' && expandedItems[item.id] && (
  //                   <div className="submenu">
  //                     {item.children.map((child) => (
  //                         <div
  //                             key={child.id}
  //                             className={`submenu-item ${
  //                                 activeSection === `${item.id}/${child.id}` ? 'submenu-item-active' : ''
  //                             }`}
  //                             onClick={() => handleItemClick(child.id, 'child', item.id)}
  //                         >
  //                           <span className="submenu-label">{child.label}</span>
  //                         </div>
  //                     ))}
  //                   </div>
  //               )}
  //             </div>
  //         ))}
  //       </nav>
  //     </div>
  );
};

export default AdminSidebar;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

/**
 * AdminLayout — shared wrapper for standalone admin route pages.
 * Provides sidebar + header + scrollable main content area.
 *
 * Props:
 *   activeSection  string   The sidebar section ID to highlight.
 *   title          string   Page title shown in AdminHeader.
 *   subtitle       string   Page subtitle shown in AdminHeader.
 *   children       node     Page content.
 */
const AdminLayout = ({ activeSection, title, subtitle, children }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Map sidebar section IDs → routes
  const handleSectionChange = (sectionId) => {
    switch (sectionId) {
      case 'products':
        navigate('/admin/san-pham');
        break;
      case 'product-management/products':
        navigate('/admin/san-pham');
        break;
      case 'account-management':
        navigate('/admin/tai-khoan');
        break;
      case 'user-management':
        navigate('/admin/tai-khoan');
        break;
      case 'dashboard':
        navigate('/admin');
        break;
      case 'analytics':
        navigate('/admin/analytics');
        break;
      default:
        // All other sections live inside AdminDashboard SPA
        navigate('/admin');
        break;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#F8FAFC',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((c) => !c)}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <AdminHeader
          title={title}
          subtitle={subtitle}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
        />

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

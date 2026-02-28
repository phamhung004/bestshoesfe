import React from 'react';
import { Users, Briefcase } from 'lucide-react';

const AccountTabSwitcher = ({ activeTab, customerCount, employeeCount, onTabChange }) => {
  return (
    <div className="am-card am-tab-bar">
      <button
        className={`am-tab ${activeTab === 'customers' ? 'active' : ''}`}
        onClick={() => onTabChange('customers')}
      >
        <Users size={16} />
        Khách hàng
        <span className="am-tab-count">{customerCount}</span>
      </button>
      <button
        className={`am-tab ${activeTab === 'employees' ? 'active' : ''}`}
        onClick={() => onTabChange('employees')}
      >
        <Briefcase size={16} />
        Nhân viên
        <span className="am-tab-count">{employeeCount}</span>
      </button>
    </div>
  );
};

export default AccountTabSwitcher;

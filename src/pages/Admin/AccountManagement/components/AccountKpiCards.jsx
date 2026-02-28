import React from 'react';
import {
  Users, UserCheck, UserX, MailWarning,
  Briefcase, Shield, UserCog, User
} from 'lucide-react';

const AccountKpiCards = ({ activeTab, customerKpis, employeeKpis }) => {
  if (activeTab === 'customers') {
    return (
      <div className="am-kpi-grid am-fade-in" key="customer-kpi">
        {/* Tổng khách hàng */}
        <div className="am-card am-kpi-card">
          <div className="am-kpi-top">
            <span className="am-kpi-label">Tổng khách hàng</span>
            <div className="am-kpi-icon indigo">
              <Users size={20} />
            </div>
          </div>
          <div className="am-kpi-value">{customerKpis.total}</div>
          <div className="am-kpi-bottom green">↑ {customerKpis.newThisMonth} khách mới tháng này</div>
        </div>

        {/* Đang hoạt động */}
        <div className="am-card am-kpi-card">
          <div className="am-kpi-top">
            <span className="am-kpi-label">Đang hoạt động</span>
            <div className="am-kpi-icon green">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="am-kpi-value green">{customerKpis.active}</div>
          <div className="am-kpi-bottom">{customerKpis.activePercent}% tổng tài khoản</div>
        </div>

        {/* Bị khóa */}
        <div className="am-card am-kpi-card">
          <div className="am-kpi-top">
            <span className="am-kpi-label">Bị khóa</span>
            <div className="am-kpi-icon red">
              <UserX size={20} />
            </div>
          </div>
          <div className="am-kpi-value red">{customerKpis.locked}</div>
          <div className="am-kpi-bottom red">⚠ Cần xem xét</div>
        </div>

        {/* Chưa xác thực email */}
        <div className="am-card am-kpi-card">
          <div className="am-kpi-top">
            <span className="am-kpi-label">Chưa xác thực email</span>
            <div className="am-kpi-icon yellow">
              <MailWarning size={20} />
            </div>
          </div>
          <div className="am-kpi-value yellow">{customerKpis.unverified}</div>
          <div className="am-kpi-bottom">Chưa xác nhận email</div>
        </div>
      </div>
    );
  }

  // Employee KPIs
  return (
    <div className="am-kpi-grid am-fade-in" key="employee-kpi">
      {/* Tổng nhân viên */}
      <div className="am-card am-kpi-card">
        <div className="am-kpi-top">
          <span className="am-kpi-label">Tổng nhân viên</span>
          <div className="am-kpi-icon indigo">
            <Briefcase size={20} />
          </div>
        </div>
        <div className="am-kpi-value">{employeeKpis.total}</div>
        <div className="am-kpi-bottom">Đang hoạt động trong hệ thống</div>
      </div>

      {/* Admin */}
      <div className="am-card am-kpi-card">
        <div className="am-kpi-top">
          <span className="am-kpi-label">Admin</span>
          <div className="am-kpi-icon purple">
            <Shield size={20} />
          </div>
        </div>
        <div className="am-kpi-value purple">{employeeKpis.admins}</div>
        <div className="am-kpi-bottom">Quyền cao nhất</div>
      </div>

      {/* Manager */}
      <div className="am-card am-kpi-card">
        <div className="am-kpi-top">
          <span className="am-kpi-label">Manager</span>
          <div className="am-kpi-icon blue">
            <UserCog size={20} />
          </div>
        </div>
        <div className="am-kpi-value blue">{employeeKpis.managers}</div>
        <div className="am-kpi-bottom">Quản lý cửa hàng</div>
      </div>

      {/* Staff */}
      <div className="am-card am-kpi-card">
        <div className="am-kpi-top">
          <span className="am-kpi-label">Staff</span>
          <div className="am-kpi-icon green">
            <User size={20} />
          </div>
        </div>
        <div className="am-kpi-value green">{employeeKpis.staff}</div>
        <div className="am-kpi-bottom">Nhân viên bán hàng</div>
      </div>
    </div>
  );
};

export default AccountKpiCards;

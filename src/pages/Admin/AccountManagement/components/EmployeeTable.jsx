import React, { useState, useRef, useEffect } from 'react';
import { Pencil, MoreHorizontal, KeyRound, Lock, Unlock, Trash2 } from 'lucide-react';
import {
  CURRENT_EMPLOYEE_ID,
  getInitials,
  getAvatarColor,
  formatDate,
  relativeTime,
} from '../mockAccountData';

import { ROLE_ICON_LABEL } from '../../../../constants/vi';

/* ── Role badge ───────────────────────────────────────────── */
const RoleBadge = ({ roleName }) => {
  const map = {
    ADMIN:   { cls: 'am-role-admin',   label: ROLE_ICON_LABEL.ADMIN },
    MANAGER: { cls: 'am-role-manager', label: ROLE_ICON_LABEL.MANAGER },
    STAFF:   { cls: 'am-role-staff',   label: ROLE_ICON_LABEL.STAFF },
  };
  const cfg = map[roleName] || map.STAFF;
  return <span className={`am-badge ${cfg.cls}`}>{cfg.label}</span>;
};

/* ── Status badge ─────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  if (status === 1) return <span className="am-badge am-badge-active"><span className="am-badge-dot" /> Hoạt động</span>;
  return <span className="am-badge am-badge-locked"><span className="am-badge-dot" /> Bị khóa</span>;
};

/* ── Role cell w/ inline dropdown ─────────────────────────── */
const RoleCell = ({ employee, onChangeRole }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isSelf = employee.employeeId === CURRENT_EMPLOYEE_ID;

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div className="am-status-toggle" ref={ref}>
      <div
        onClick={() => !isSelf && setOpen(!open)}
        title={isSelf ? 'Không thể thay đổi vai trò của chính mình' : 'Thay đổi vai trò'}
        style={{ cursor: isSelf ? 'not-allowed' : 'pointer' }}
      >
        <RoleBadge roleName={employee.roleName} />
      </div>
      {open && (
        <div className="am-status-dropdown">
          {['ADMIN', 'MANAGER', 'STAFF'].map((r) => (
            <button
              key={r}
              className={`am-dropdown-item ${employee.roleName === r ? 'success' : ''}`}
              onClick={() => { setOpen(false); onChangeRole(employee, r); }}
            >
              <RoleBadge roleName={r} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Status cell w/ inline toggle ─────────────────────────── */
const StatusCell = ({ employee, onLock, onUnlock }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowDropdown(false);
        setShowConfirm(false);
      }
    };
    if (showDropdown || showConfirm) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showDropdown, showConfirm]);

  const handleSelect = (action) => {
    if (action === 'lock') {
      setShowDropdown(false);
      setShowConfirm(true);
    } else {
      setShowDropdown(false);
      onUnlock(employee);
    }
  };

  return (
    <div className="am-status-toggle" ref={ref}>
      <div onClick={() => setShowDropdown(!showDropdown)}>
        <StatusBadge status={employee.status} />
      </div>
      {showDropdown && (
        <div className="am-status-dropdown">
          {employee.status === 0 ? (
            <button className="am-dropdown-item" onClick={() => handleSelect('unlock')}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              Mở khóa
            </button>
          ) : (
            <>
              <button className="am-dropdown-item" onClick={() => setShowDropdown(false)}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                Hoạt động
              </button>
              <button className="am-dropdown-item danger" onClick={() => handleSelect('lock')}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                Khóa tài khoản
              </button>
            </>
          )}
        </div>
      )}
      {showConfirm && (
        <div className="am-confirm-tooltip">
          <p>Khóa tài khoản {employee.fullName}? Họ sẽ không thể đăng nhập.</p>
          <div className="am-confirm-tooltip-actions">
            <button className="am-btn am-btn-ghost am-btn-sm" onClick={() => setShowConfirm(false)}>Hủy</button>
            <button className="am-btn am-btn-danger am-btn-sm" onClick={() => { setShowConfirm(false); onLock(employee); }}>
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Row actions ──────────────────────────────────────────── */
const RowActions = ({ employee, onEdit, onResetPassword, onLock, onUnlock, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isSelf = employee.employeeId === CURRENT_EMPLOYEE_ID;

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div className="am-actions">
      <button className="am-btn-icon" title="Chỉnh sửa" onClick={() => onEdit(employee)}>
        <Pencil size={16} />
      </button>
      <div className="am-dropdown-wrapper" ref={ref}>
        <button className="am-btn-icon" onClick={() => setOpen(!open)}>
          <MoreHorizontal size={16} />
        </button>
        {open && (
          <div className="am-dropdown">
            <button className="am-dropdown-item" onClick={() => { setOpen(false); onResetPassword(employee); }}>
              <KeyRound size={14} /> Đặt lại mật khẩu
            </button>
            <div className="am-dropdown-sep" />
            {employee.status === 1 ? (
              <button className="am-dropdown-item danger" onClick={() => { setOpen(false); onLock(employee); }}>
                <Lock size={14} /> Khóa tài khoản
              </button>
            ) : (
              <button className="am-dropdown-item success" onClick={() => { setOpen(false); onUnlock(employee); }}>
                <Unlock size={14} /> Mở khóa
              </button>
            )}
            <button
              className="am-dropdown-item danger"
              onClick={() => { setOpen(false); onDelete(employee); }}
            >
              <Trash2 size={14} /> Xóa nhân viên
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════ */
/* ── EmployeeTable ────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════ */
const EmployeeTable = ({
  employees,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onEdit,
  onResetPassword,
  onLock,
  onUnlock,
  onDelete,
  onChangeRole,
}) => {
  const allSelected = employees.length > 0 && selectedIds.size === employees.length;
  const someSelected = selectedIds.size > 0;

  return (
    <>
      {someSelected && (
        <div className="am-bulk-bar">
          <span>{selectedIds.size} nhân viên được chọn</span>
          <div className="am-bulk-actions">
            <button className="am-bulk-btn" onClick={() => onLock(null)}>Khóa tất cả</button>
            <button className="am-bulk-btn" onClick={() => onUnlock(null)}>Mở khóa tất cả</button>
            <button className="am-bulk-btn" onClick={onClearSelection}>Hủy chọn</button>
          </div>
        </div>
      )}

      <div className="am-card am-table-wrap am-fade-in">
        <table className="am-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  className="am-checkbox"
                  checked={allSelected}
                  onChange={(e) => {
                    if (e.target.checked) onSelectAll(employees.map((emp) => emp.employeeId));
                    else onClearSelection();
                  }}
                />
              </th>
              <th>Nhân viên</th>
              <th style={{ width: 200 }}>Email</th>
              <th className="am-col-phone" style={{ width: 130 }}>Điện thoại</th>
              <th style={{ width: 130 }}>Vai trò</th>
              <th style={{ width: 130 }}>Trạng thái</th>
              <th className="am-col-date" style={{ width: 120 }}>Ngày tạo</th>
              <th style={{ width: 100 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const color = getAvatarColor(emp.employeeId);
              const isSelf = emp.employeeId === CURRENT_EMPLOYEE_ID;

              return (
                <tr key={emp.employeeId} style={{ height: 72 }}>
                  <td>
                    <input
                      type="checkbox"
                      className="am-checkbox"
                      checked={selectedIds.has(emp.employeeId)}
                      onChange={() => onToggleSelect(emp.employeeId)}
                    />
                  </td>

                  {/* Avatar + Name */}
                  <td>
                    <div className="am-cell-user">
                      <div className="am-avatar" style={{ background: color.bg, color: color.text }}>
                        {emp.avatar ? <img src={emp.avatar} alt={emp.fullName} /> : getInitials(emp.fullName)}
                      </div>
                      <div className="am-cell-user-info">
                        <div className="am-cell-user-name">
                          {emp.fullName}
                          {isSelf && <span className="am-badge-you">Bạn</span>}
                        </div>
                        <div className="am-cell-user-id">ID: #EMP{String(emp.employeeId).padStart(3, '0')}</div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td>
                    <span className="am-cell-email">{emp.email}</span>
                  </td>

                  {/* Phone */}
                  <td className="am-col-phone">
                    {emp.phone ? (
                      <span className="am-cell-phone">{emp.phone}</span>
                    ) : (
                      <span className="am-cell-empty">Chưa cập nhật</span>
                    )}
                  </td>

                  {/* Role */}
                  <td>
                    <RoleCell employee={emp} onChangeRole={onChangeRole} />
                  </td>

                  {/* Status */}
                  <td>
                    <StatusCell employee={emp} onLock={onLock} onUnlock={onUnlock} />
                  </td>

                  {/* Date */}
                  <td className="am-col-date">
                    <span className="am-cell-date" title={relativeTime(emp.createdAt)}>
                      {formatDate(emp.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <RowActions
                      employee={emp}
                      onEdit={onEdit}
                      onResetPassword={onResetPassword}
                      onLock={onLock}
                      onUnlock={onUnlock}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              );
            })}

            {employees.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="am-empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    <p>Không tìm thấy nhân viên nào</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EmployeeTable;

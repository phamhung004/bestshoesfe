import React, { useState, useRef, useEffect } from 'react';
import { Eye, Pencil, MoreHorizontal, Check, AlertTriangle, History, KeyRound, Lock, Unlock } from 'lucide-react';
import {
  getCustomerStatus,
  getMemberTier,
  getInitials,
  getAvatarColor,
  formatVND,
  formatDate,
  relativeTime,
  isNewCustomer,
} from '../mockAccountData';

/* ── Status badge helper ──────────────────────────────────── */
const StatusBadge = ({ customer }) => {
  const s = getCustomerStatus(customer);
  if (s === 'active') return <span className="am-badge am-badge-active"><span className="am-badge-dot" /> Hoạt động</span>;
  if (s === 'locked') return <span className="am-badge am-badge-locked"><span className="am-badge-dot" /> Bị khóa</span>;
  return <span className="am-badge am-badge-unverified"><span className="am-badge-dot" /> Chưa xác thực</span>;
};

/* ── Tier badge helper ────────────────────────────────────── */
const TierBadge = ({ spending }) => {
  const tier = getMemberTier(spending);
  const cls = {
    'Đồng': 'am-tier-dong',
    'Bạc': 'am-tier-bac',
    'Vàng': 'am-tier-vang',
    'Bạch Kim': 'am-tier-bachkim',
  }[tier];
  return <span className={`am-badge ${cls}`}>{tier}</span>;
};

/* ── Row actions dropdown ─────────────────────────────────── */
const RowActions = ({ customer, onViewDetail, onEdit, onViewOrders, onResetPassword, onLock, onUnlock }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const status = getCustomerStatus(customer);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div className="am-actions">
      <button className="am-btn-icon" title="Xem chi tiết" onClick={() => onViewDetail(customer)}>
        <Eye size={16} />
      </button>
      <button className="am-btn-icon" title="Chỉnh sửa" onClick={() => onEdit(customer)}>
        <Pencil size={16} />
      </button>
      <div className="am-dropdown-wrapper" ref={ref}>
        <button className="am-btn-icon" title="Thêm" onClick={() => setOpen(!open)}>
          <MoreHorizontal size={16} />
        </button>
        {open && (
          <div className="am-dropdown">
            <button className="am-dropdown-item" onClick={() => { setOpen(false); onViewOrders(customer); }}>
              <History size={14} /> Xem lịch sử đơn hàng
            </button>
            <button className="am-dropdown-item" onClick={() => { setOpen(false); onResetPassword(customer); }}>
              <KeyRound size={14} /> Đặt lại mật khẩu
            </button>
            <div className="am-dropdown-sep" />
            {status !== 'locked' ? (
              <button className="am-dropdown-item danger" onClick={() => { setOpen(false); onLock(customer); }}>
                <Lock size={14} /> Khóa tài khoản
              </button>
            ) : (
              <button className="am-dropdown-item success" onClick={() => { setOpen(false); onUnlock(customer); }}>
                <Unlock size={14} /> Mở khóa
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Status cell with inline toggle ──────────────────────── */
const StatusCell = ({ customer, onLock, onUnlock }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const ref = useRef(null);
  const status = getCustomerStatus(customer);

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
      onUnlock(customer);
    }
  };

  return (
    <div className="am-status-toggle" ref={ref}>
      <div onClick={() => setShowDropdown(!showDropdown)}>
        <StatusBadge customer={customer} />
      </div>
      {showDropdown && (
        <div className="am-status-dropdown">
          <button
            className="am-dropdown-item"
            onClick={() => handleSelect(status === 'locked' ? 'unlock' : 'active')}
          >
            <span className="am-badge-dot" style={{ background: '#22c55e', width: 6, height: 6, borderRadius: '50%' }} />
            {status === 'locked' ? 'Mở khóa' : 'Hoạt động'}
          </button>
          {status !== 'locked' && (
            <button className="am-dropdown-item danger" onClick={() => handleSelect('lock')}>
              <span className="am-badge-dot" style={{ background: '#ef4444', width: 6, height: 6, borderRadius: '50%' }} />
              Khóa tài khoản
            </button>
          )}
        </div>
      )}
      {showConfirm && (
        <div className="am-confirm-tooltip">
          <p>Khóa tài khoản {customer.fullName}? Họ sẽ không thể đăng nhập.</p>
          <div className="am-confirm-tooltip-actions">
            <button className="am-btn am-btn-ghost am-btn-sm" onClick={() => setShowConfirm(false)}>Hủy</button>
            <button
              className="am-btn am-btn-danger am-btn-sm"
              onClick={() => { setShowConfirm(false); onLock(customer); }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════ */
/* ── CustomerTable ────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════ */
const CustomerTable = ({
  customers,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onViewDetail,
  onEdit,
  onViewOrders,
  onResetPassword,
  onLock,
  onUnlock,
}) => {
  const allSelected = customers.length > 0 && selectedIds.size === customers.length;
  const someSelected = selectedIds.size > 0;

  return (
    <>
      {/* Bulk action bar */}
      {someSelected && (
        <div className="am-bulk-bar">
          <span>{selectedIds.size} tài khoản được chọn</span>
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
                    if (e.target.checked) onSelectAll(customers.map((c) => c.customerId));
                    else onClearSelection();
                  }}
                />
              </th>
              <th>Khách hàng</th>
              <th style={{ width: 200 }}>Email</th>
              <th className="am-col-phone" style={{ width: 130 }}>Điện thoại</th>
              <th style={{ width: 100 }}>Hạng</th>
              <th style={{ width: 150 }}>Đơn hàng & Chi tiêu</th>
              <th style={{ width: 130 }}>Trạng thái</th>
              <th className="am-col-date" style={{ width: 120 }}>Ngày đăng ký</th>
              <th style={{ width: 100 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const color = getAvatarColor(c.customerId);
              const isNew = isNewCustomer(c.createdAt);
              const verified = !!c.verifiedAt;

              return (
                <tr key={c.customerId} style={{ height: 72 }}>
                  {/* Checkbox */}
                  <td>
                    <input
                      type="checkbox"
                      className="am-checkbox"
                      checked={selectedIds.has(c.customerId)}
                      onChange={() => onToggleSelect(c.customerId)}
                    />
                  </td>

                  {/* Avatar + Name */}
                  <td>
                    <div className="am-cell-user">
                      <div
                        className="am-avatar"
                        style={{ background: color.bg, color: color.text }}
                      >
                        {c.avatar ? (
                          <img src={c.avatar} alt={c.fullName} />
                        ) : (
                          getInitials(c.fullName)
                        )}
                      </div>
                      <div className="am-cell-user-info">
                        <div className="am-cell-user-name">
                          {c.fullName}
                          {isNew && <span className="am-badge-new">MỚI</span>}
                        </div>
                        <div className="am-cell-user-id">ID: #{String(c.customerId).padStart(5, '0')}</div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td>
                    <div className="am-cell-email">
                      <span>
                        {c.email}
                        {verified && (
                          <span className="am-verified" title="Đã xác thực">
                            <Check size={12} />
                          </span>
                        )}
                      </span>
                      {!verified && (
                        <div className="am-unverified-text">
                          <AlertTriangle size={11} /> Chưa xác thực
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="am-col-phone">
                    {c.phone ? (
                      <span className="am-cell-phone">{c.phone}</span>
                    ) : (
                      <span className="am-cell-empty">Chưa cập nhật</span>
                    )}
                  </td>

                  {/* Tier */}
                  <td>
                    <TierBadge spending={c.totalSpending} />
                  </td>

                  {/* Orders & Spending */}
                  <td>
                    <div className="am-cell-orders">
                      <span className="am-cell-orders-count">{c.totalOrders} đơn hàng</span>
                      <span className="am-cell-orders-spending">{formatVND(c.totalSpending)}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <StatusCell customer={c} onLock={onLock} onUnlock={onUnlock} />
                  </td>

                  {/* Date */}
                  <td className="am-col-date">
                    <span className="am-cell-date" title={relativeTime(c.createdAt)}>
                      {formatDate(c.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <RowActions
                      customer={c}
                      onViewDetail={onViewDetail}
                      onEdit={onEdit}
                      onViewOrders={onViewOrders}
                      onResetPassword={onResetPassword}
                      onLock={onLock}
                      onUnlock={onUnlock}
                    />
                  </td>
                </tr>
              );
            })}

            {customers.length === 0 && (
              <tr>
                <td colSpan={9}>
                  <div className="am-empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    <p>Không tìm thấy khách hàng nào</p>
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

export default CustomerTable;

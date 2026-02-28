import React, { useState, useEffect } from 'react';
import { X, MapPin, ShoppingBag, Check, AlertTriangle, Loader } from 'lucide-react';
import {
  getCustomerStatus,
  getMemberTier,
  getInitials,
  getAvatarColor,
  formatVND,
  formatDate,
  formatDateTime,
} from '../mockAccountData';
import { adminCustomerAPI } from '../accountApi';

/* ── Helper badges ────────────────────────────────────────── */
const StatusBadge = ({ customer }) => {
  const s = getCustomerStatus(customer);
  if (s === 'active') return <span className="am-badge am-badge-active"><span className="am-badge-dot" /> Hoạt động</span>;
  if (s === 'locked') return <span className="am-badge am-badge-locked"><span className="am-badge-dot" /> Bị khóa</span>;
  return <span className="am-badge am-badge-unverified"><span className="am-badge-dot" /> Chưa xác thực</span>;
};

const TierBadge = ({ spending }) => {
  const tier = getMemberTier(spending);
  const cls = { 'Đồng': 'am-tier-dong', 'Bạc': 'am-tier-bac', 'Vàng': 'am-tier-vang', 'Bạch Kim': 'am-tier-bachkim' }[tier];
  return <span className={`am-badge ${cls}`}>{tier}</span>;
};

const OrderStatusBadge = ({ status }) => {
  const map = {
    'Đã giao': 'am-order-delivered',
    'Đang giao': 'am-order-shipping',
    'Đã hủy': 'am-order-cancelled',
    'Đang xử lý': 'am-order-processing',
  };
  return <span className={`am-badge ${map[status] || 'am-order-processing'}`}>{status}</span>;
};

/* ── Tab: Thông tin ───────────────────────────────────────── */
const InfoTab = ({ customer, onToggleStatus }) => {
  const age = customer.dateOfBirth
    ? Math.floor((Date.now() - new Date(customer.dateOfBirth)) / (365.25 * 86400000))
    : null;

  return (
    <div className="am-fade-in">
      {/* Personal info */}
      <div className="am-detail-section">
        <div className="am-detail-section-title">Thông tin cá nhân</div>
        <div className="am-detail-grid">
          <div className="am-detail-item">
            <label>Họ và tên</label>
            <span>{customer.fullName}</span>
          </div>
          <div className="am-detail-item">
            <label>Email</label>
            <span>
              {customer.email}
              {customer.verifiedAt ? (
                <span className="am-verified"><Check size={12} /></span>
              ) : (
                <span style={{ color: '#ca8a04', marginLeft: 4, fontSize: 11 }}>
                  <AlertTriangle size={11} /> Chưa xác thực
                </span>
              )}
            </span>
          </div>
          <div className="am-detail-item">
            <label>Số điện thoại</label>
            <span>{customer.phone || <span style={{ color: '#cbd5e1' }}>Chưa cập nhật</span>}</span>
          </div>
          <div className="am-detail-item">
            <label>Giới tính</label>
            <span>{customer.gender || '—'}</span>
          </div>
          <div className="am-detail-item">
            <label>Ngày sinh</label>
            <span>
              {customer.dateOfBirth ? `${formatDate(customer.dateOfBirth)}${age != null ? ` (${age} tuổi)` : ''}` : '—'}
            </span>
          </div>
          <div className="am-detail-item">
            <label>Ngày đăng ký</label>
            <span>{formatDateTime(customer.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Account status */}
      <div className="am-detail-section">
        <div className="am-detail-section-title">Trạng thái tài khoản</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusBadge customer={customer} />
          <button
            className={`am-toggle ${customer.status === 1 ? 'on' : 'off'}`}
            onClick={() => onToggleStatus(customer)}
          />
        </div>
        {customer.status === 0 && customer.lockReason && (
          <div style={{ marginTop: 12, background: '#fef2f2', borderRadius: 10, padding: 12, fontSize: 13, color: '#b91c1c' }}>
            <strong>Lý do khóa:</strong> {customer.lockReason}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="am-stats-row">
        <div className="am-stat-card">
          <div className="am-stat-value" style={{ color: '#4f46e5' }}>{customer.totalOrders}</div>
          <div className="am-stat-label">Tổng đơn</div>
        </div>
        <div className="am-stat-card">
          <div className="am-stat-value" style={{ color: '#16a34a' }}>{formatVND(customer.totalSpending)}</div>
          <div className="am-stat-label">Chi tiêu</div>
        </div>
        <div className="am-stat-card">
          <div className="am-stat-value" style={{ color: '#ca8a04' }}>0</div>
          <div className="am-stat-label">Đánh giá</div>
        </div>
      </div>
    </div>
  );
};

/* ── Tab: Đơn hàng ────────────────────────────────────────── */
const OrdersTab = ({ orders = [], onToast }) => {
  const delivered = orders.filter((o) => o.status === 'Đã giao').length;
  const shipping = orders.filter((o) => o.status === 'Đang giao').length;
  const cancelled = orders.filter((o) => o.status === 'Đã hủy').length;

  return (
    <div className="am-fade-in">
      <div className="am-order-summary">
        <div className="am-order-summary-card">
          <div className="am-order-summary-value" style={{ color: '#0f172a' }}>{orders.length}</div>
          <div className="am-order-summary-label">Tổng đơn</div>
        </div>
        <div className="am-order-summary-card">
          <div className="am-order-summary-value" style={{ color: '#16a34a' }}>{delivered}</div>
          <div className="am-order-summary-label">Đã giao</div>
        </div>
        <div className="am-order-summary-card">
          <div className="am-order-summary-value" style={{ color: '#2563eb' }}>{shipping}</div>
          <div className="am-order-summary-label">Đang xử lý</div>
        </div>
        <div className="am-order-summary-card">
          <div className="am-order-summary-value" style={{ color: '#ef4444' }}>{cancelled}</div>
          <div className="am-order-summary-label">Đã hủy</div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="am-empty-state">
          <ShoppingBag size={48} strokeWidth={1.2} />
          <p>Chưa có đơn hàng nào</p>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order.orderId}
            className="am-order-card"
            onClick={() => onToast && onToast('Tính năng xem chi tiết đơn hàng sẽ ra mắt sớm!', 'info')}
          >
            <div className="am-order-card-header">
              <span className="am-order-number">#{order.orderNumber}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <OrderStatusBadge status={order.status} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{formatDate(order.createdAt)}</span>
              </div>
            </div>
            <div className="am-order-items">
              {order.items.slice(0, 3).map((item, i) => (
                <div key={i} className="am-order-thumb" title={item.name}>
                  {item.thumbnail ? <img src={item.thumbnail} alt="" /> : item.name.charAt(0)}
                </div>
              ))}
              {order.items.length > 3 && (
                <span style={{ fontSize: 12, color: '#64748b' }}>+{order.items.length - 3} thêm</span>
              )}
            </div>
            <div className="am-order-footer">
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{order.itemCount} sản phẩm</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#4f46e5' }}>{formatVND(order.totalAmount)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

/* ── Tab: Địa chỉ ─────────────────────────────────────────── */
const AddressesTab = ({ addresses = [] }) => {
  if (addresses.length === 0) {
    return (
      <div className="am-empty-state am-fade-in">
        <MapPin size={48} strokeWidth={1.2} />
        <p>Chưa có địa chỉ nào</p>
      </div>
    );
  }

  return (
    <div className="am-fade-in">
      {addresses.map((addr) => (
        <div key={addr.addressId} className="am-address-card">
          <div className="am-address-header">
            <div>
              <div className="am-address-name">{addr.recipientName}</div>
              <div className="am-address-phone">{addr.phone}</div>
            </div>
            {addr.isDefault && <span className="am-badge-default">Mặc định</span>}
          </div>
          <div className="am-address-text">
            {[addr.line1, addr.line2, addr.city, addr.state].filter(Boolean).join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════ */
/* ── CustomerDetailSlideOver ──────────────────────────────── */
/* ══════════════════════════════════════════════════════════ */
const CustomerDetailSlideOver = ({ customer, onClose, onEdit, onLock, onUnlock, onToast, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'info');
  const [closing, setClosing] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab || 'info');
  }, [initialTab, customer]);

  // Fetch full customer detail (with addresses) from API
  useEffect(() => {
    if (!customer?.customerId) return;
    let cancelled = false;
    setLoadingDetail(true);
    adminCustomerAPI.getById(customer.customerId)
      .then((res) => {
        if (!cancelled) {
          const d = res?.data ?? res;
          setDetail({
            ...d,
            status: d.status === true ? 1 : d.status === false ? 0 : d.status,
          });
        }
      })
      .catch(() => { /* use summary data from list */ })
      .finally(() => { if (!cancelled) setLoadingDetail(false); });
    return () => { cancelled = true; };
  }, [customer?.customerId]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 250);
  };

  const handleToggleStatus = (c) => {
    if (c.status === 1) onLock(c);
    else onUnlock(c);
  };

  if (!customer) return null;

  // Use detail data when available, fallback to list-level customer prop
  const displayCustomer = detail || {
    ...customer,
    status: customer.status === true ? 1 : customer.status === false ? 0 : customer.status,
  };
  const addresses = detail?.addresses ?? [];
  const orders = detail?.recentOrders ?? [];

  const color = getAvatarColor(customer.customerId);
  const orderCount = displayCustomer.totalOrders ?? orders.length;
  const addressCount = addresses.length;

  return (
    <>
      <div className="am-slideover-backdrop" onClick={handleClose} />
      <div className={`am-slideover ${closing ? 'closing' : ''}`} style={{ width: 680 }}>
        {/* Header */}
        <div className="am-slideover-header">
          <div className="am-slideover-header-info">
            <div className="am-slideover-avatar" style={{ background: color.bg, color: color.text }}>
              {displayCustomer.avatar ? <img src={displayCustomer.avatar} alt="" /> : getInitials(displayCustomer.fullName)}
            </div>
            <div>
              <h2 className="am-slideover-name">{displayCustomer.fullName}</h2>
              <div className="am-slideover-meta">
                ID: #{String(displayCustomer.customerId).padStart(5, '0')} · Đăng ký {formatDate(displayCustomer.createdAt)}
              </div>
              <div className="am-slideover-badges">
                <StatusBadge customer={displayCustomer} />
                <TierBadge spending={displayCustomer.totalSpending} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <button className="am-btn am-btn-outline am-btn-sm" onClick={() => onEdit(displayCustomer)}>Chỉnh sửa</button>
            <button className="am-slideover-close" onClick={handleClose}><X size={18} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="am-slideover-tabs">
          <button
            className={`am-slideover-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            📋 Thông tin
          </button>
          <button
            className={`am-slideover-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Đơn hàng ({orderCount})
          </button>
          <button
            className={`am-slideover-tab ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            📍 Địa chỉ ({addressCount})
          </button>
        </div>

        {/* Content */}
        <div className="am-slideover-content">
          {loadingDetail && (
            <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
              <Loader size={24} className="am-spin" /> Đang tải...
            </div>
          )}
          {activeTab === 'info' && <InfoTab customer={displayCustomer} onToggleStatus={handleToggleStatus} />}
          {activeTab === 'orders' && <OrdersTab orders={orders} onToast={onToast} />}
          {activeTab === 'addresses' && <AddressesTab addresses={addresses} />}
        </div>

        {/* Footer */}
        <div className="am-slideover-footer">
          <div>
            {displayCustomer.status === 1 ? (
              <button className="am-btn am-btn-outline am-btn-sm" style={{ color: '#ef4444', borderColor: '#fecaca' }} onClick={() => onLock(displayCustomer)}>
                Khóa tài khoản
              </button>
            ) : (
              <button className="am-btn am-btn-outline am-btn-sm" style={{ color: '#16a34a', borderColor: '#bbf7d0' }} onClick={() => onUnlock(displayCustomer)}>
                Mở khóa
              </button>
            )}
          </div>
          <button className="am-btn am-btn-outline am-btn-sm" onClick={handleClose}>Đóng</button>
        </div>
      </div>
    </>
  );
};

export default CustomerDetailSlideOver;

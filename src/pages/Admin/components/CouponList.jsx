import React, { useState, useEffect, useCallback } from 'react';
import { couponAPI } from '../../../services/api';
import './CouponList.css';

// Mock data for demonstration
const mockCoupons = [
  {
    couponId: 1,
    code: 'SUMMER2024',
    name: 'Khuyến mãi mùa hè',
    description: 'Giảm giá đặc biệt cho các sản phẩm mùa hè',
    type: 'Percentage',
    value: 20,
    minimumAmount: 500000,
    maximumDiscount: null,
    usageLimit: 100,
    usedCount: 45,
    startDate: '2024-06-01T00:00:00.000Z',
    endDate: '2024-08-31T23:59:59.000Z',
    status: true,
    createdAt: '2024-05-15T10:30:00.000Z'
  },
  {
    couponId: 2,
    code: 'NEWUSER',
    name: 'Ưu đãi khách hàng mới',
    description: 'Giảm 50k cho đơn hàng đầu tiên',
    type: 'Fixed Amount',
    value: 50000,
    minimumAmount: null,
    maximumDiscount: null,
    usageLimit: null,
    usedCount: 23,
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-12-31T23:59:59.000Z',
    status: true,
    createdAt: '2024-01-01T08:00:00.000Z'
  },
  {
    couponId: 3,
    code: 'FLASH50',
    name: 'Flash Sale 50%',
    description: 'Giảm 50% cho tất cả sản phẩm trong 24h',
    type: 'Percentage',
    value: 50,
    minimumAmount: 200000,
    maximumDiscount: 200000,
    usageLimit: 50,
    usedCount: 50,
    startDate: '2024-03-15T00:00:00.000Z',
    endDate: '2024-03-15T23:59:59.000Z',
    status: false,
    createdAt: '2024-03-10T09:15:00.000Z'
  },
  {
    couponId: 4,
    code: 'BLACKFRIDAY',
    name: 'Black Friday Sale',
    description: 'Siêu sale Black Friday - giảm đến 70%',
    type: 'Percentage',
    value: 70,
    minimumAmount: 1000000,
    maximumDiscount: 500000,
    usageLimit: 200,
    usedCount: 87,
    startDate: '2024-11-24T00:00:00.000Z',
    endDate: '2024-11-30T23:59:59.000Z',
    status: true,
    createdAt: '2024-11-01T12:00:00.000Z'
  },
  {
    couponId: 5,
    code: 'EXPIRED',
    name: 'Mã hết hạn',
    description: 'Mã giảm giá đã hết hạn',
    type: 'Fixed Amount',
    value: 30000,
    minimumAmount: null,
    maximumDiscount: null,
    usageLimit: null,
    usedCount: 5,
    startDate: '2023-12-01T00:00:00.000Z',
    endDate: '2023-12-31T23:59:59.000Z',
    status: true,
    createdAt: '2023-11-15T14:20:00.000Z'
  },
  {
    couponId: 6,
    code: 'UPCOMING',
    name: 'Khuyến mãi sắp tới',
    description: 'Mã giảm giá sẽ có hiệu lực vào tháng tới',
    type: 'Percentage',
    value: 15,
    minimumAmount: 300000,
    maximumDiscount: null,
    usageLimit: 150,
    usedCount: 0,
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-01-31T23:59:59.000Z',
    status: true,
    createdAt: '2024-12-01T16:45:00.000Z'
  },
  {
    couponId: 7,
    code: 'VIP100K',
    name: 'VIP Member Discount',
    description: 'Ưu đãi đặc biệt cho thành viên VIP',
    type: 'Fixed Amount',
    value: 100000,
    minimumAmount: 800000,
    maximumDiscount: null,
    usageLimit: 25,
    usedCount: 12,
    startDate: '2024-07-01T00:00:00.000Z',
    endDate: '2024-12-31T23:59:59.000Z',
    status: true,
    createdAt: '2024-06-20T11:30:00.000Z'
  },
  {
    couponId: 8,
    code: 'WELCOME10',
    name: 'Chào mừng khách hàng',
    description: 'Giảm 10% cho đơn hàng từ 200k',
    type: 'Percentage',
    value: 10,
    minimumAmount: 200000,
    maximumDiscount: null,
    usageLimit: null,
    usedCount: 156,
    startDate: '2024-04-01T00:00:00.000Z',
    endDate: '2024-12-31T23:59:59.000Z',
    status: true,
    createdAt: '2024-03-25T13:15:00.000Z'
  }
];

const CouponList = ({ onEdit, onAdd, refreshTrigger }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [filteredCoupons, setFilteredCoupons] = useState([]);

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      // For demonstration, use mock data instead of API call
      // const data = await couponAPI.getAll();
      const data = mockCoupons;
      setCoupons(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách mã giảm giá');
      console.error('Error loading coupons:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons, refreshTrigger]);

  useEffect(() => {
    // Filter coupons based on search term and filters
    let filtered = coupons;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(coupon =>
        statusFilter === 'active' ? coupon.status : !coupon.status
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(coupon => coupon.type === typeFilter);
    }

    // Search term filter
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(coupon =>
        coupon.code.toLowerCase().includes(searchLower) ||
        coupon.name?.toLowerCase().includes(searchLower) ||
        coupon.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredCoupons(filtered);
  }, [coupons, searchTerm, statusFilter, typeFilter]);

  const handleDelete = async (couponId, couponCode) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${couponCode}"?`)) {
      try {
        // For demonstration, remove from local state instead of API call
        // await couponAPI.delete(couponId);
        setCoupons(prevCoupons => prevCoupons.filter(coupon => coupon.couponId !== couponId));
        alert('Xóa mã giảm giá thành công!');
      } catch (err) {
        alert('Không thể xóa mã giảm giá. Vui lòng thử lại.');
        console.error('Error deleting coupon:', err);
      }
    }
  };

  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
      // For demonstration, update local state instead of API call
      // await couponAPI.toggleStatus(couponId);
      setCoupons(prevCoupons =>
        prevCoupons.map(coupon =>
          coupon.couponId === couponId
            ? { ...coupon, status: !coupon.status }
            : coupon
        )
      );
    } catch (err) {
      alert('Không thể thay đổi trạng thái mã giảm giá. Vui lòng thử lại.');
      console.error('Error toggling coupon status:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    const isExpired = now > endDate;
    const isUpcoming = now < startDate;
    const isActive = coupon.status && !isExpired && !isUpcoming;

    if (!coupon.status) return <span className="status-badge inactive">Ẩn</span>;
    if (isExpired) return <span className="status-badge expired">Hết hạn</span>;
    if (isUpcoming) return <span className="status-badge upcoming">Sắp tới</span>;
    if (isActive) return <span className="status-badge active">Hoạt động</span>;
    return <span className="status-badge unknown">Không xác định</span>;
  };

  const getUsageInfo = (usedCount, usageLimit) => {
    if (!usageLimit) return `${usedCount} lần`;
    return `${usedCount}/${usageLimit} lần`;
  };

  if (loading) {
    return (
      <div className="coupon-list-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách mã giảm giá...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coupon-list-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => loadCoupons()} className="btn-retry">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="coupon-list">
      <div className="coupon-list-header">
        <div className="header-left">
          <h2 className="section-title">Quản lý mã giảm giá</h2>
          <div className="coupon-count">
            Tổng cộng: {filteredCoupons.length} mã giảm giá
          </div>
        </div>
        <div className="header-right">
          <div className="filters-section">
            <div className="filter-group">
              <label htmlFor="status-filter" className="filter-label">Trạng thái:</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Ẩn</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="type-filter" className="filter-label">Loại:</label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả</option>
                <option value="Percentage">Phần trăm</option>
                <option value="Fixed Amount">Số tiền cố định</option>
              </select>
            </div>
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm mã giảm giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
          <button onClick={onAdd} className="btn-primary">
            Thêm mã giảm giá mới
          </button>
        </div>
      </div>

      <div className="coupon-table-container">
        <table className="coupon-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã giảm giá</th>
              <th>Tên</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Đơn tối thiểu</th>
              <th>Giảm tối đa</th>
              <th>Sử dụng</th>
              <th>Thời hạn</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan="12" className="no-data">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Không tìm thấy mã giảm giá nào phù hợp'
                    : 'Chưa có mã giảm giá nào'}
                </td>
              </tr>
            ) : (
              filteredCoupons.map((coupon) => (
                <tr key={coupon.couponId}>
                  <td>{coupon.couponId}</td>
                  <td className="coupon-code">
                    <code>{coupon.code}</code>
                  </td>
                  <td className="coupon-name">
                    {coupon.name || <span className="no-name">Chưa đặt tên</span>}
                  </td>
                  <td>
                    <span className={`coupon-type ${coupon.type.toLowerCase().replace(' ', '-')}`}>
                      {coupon.type === 'Percentage' ? 'Phần trăm' : 'Số tiền cố định'}
                    </span>
                  </td>
                  <td className="coupon-value">
                    {coupon.type === 'Percentage'
                      ? `${coupon.value}%`
                      : formatCurrency(coupon.value)
                    }
                  </td>
                  <td>
                    {coupon.minimumAmount
                      ? formatCurrency(coupon.minimumAmount)
                      : 'Không giới hạn'
                    }
                  </td>
                  <td>
                    {coupon.maximumDiscount
                      ? formatCurrency(coupon.maximumDiscount)
                      : 'Không giới hạn'
                    }
                  </td>
                  <td className="usage-info">
                    {getUsageInfo(coupon.usedCount || 0, coupon.usageLimit)}
                  </td>
                  <td className="date-range">
                    <div className="date-start">
                      <small>Từ:</small> {formatDate(coupon.startDate)}
                    </div>
                    <div className="date-end">
                      <small>Đến:</small> {formatDate(coupon.endDate)}
                    </div>
                  </td>
                  <td>{getStatusBadge(coupon)}</td>
                  <td>{formatDate(coupon.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onEdit(coupon)}
                        className="btn-edit"
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleStatus(coupon.couponId, coupon.status)}
                        className="btn-toggle"
                        title={coupon.status ? 'Ẩn mã giảm giá' : 'Kích hoạt mã giảm giá'}
                      >
                        {coupon.status ? '👁️' : '🙈'}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.couponId, coupon.code)}
                        className="btn-delete"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponList;

import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { productAPI, orderAPI, returnAPI } from '../../../services/api';
import { adminCustomerAPI, adminEmployeeAPI } from '../AccountManagement/accountApi';
import './DashboardOverview.css';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="tooltip-value" style={{ color: entry.color }}>
          {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

// Format currency (VND)
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format number with commas
const formatNumber = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280', '#06B6D4', '#EF4444'];

const mapRangeFromUI = (range) => {
  if (range === '7d' || range === '30d' || range === '90d') return range;
  return '30d';
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const normalizeOrderStatus = (status) => {
  const s = String(status || '').toLowerCase();
  if (s.includes('hủy') || s.includes('cancel')) return { key: 'cancelled', icon: '❌', label: 'Đã hủy' };
  if (s.includes('hoàn') || s.includes('delivered') || s.includes('đã giao')) return { key: 'delivered', icon: '✅', label: 'Hoàn thành' };
  if (s.includes('xử lý') || s.includes('confirm')) return { key: 'processing', icon: '⚙️', label: 'Đang xử lý' };
  if (s.includes('chờ')) return { key: 'pending', icon: '⏳', label: 'Chờ xử lý' };
  if (s.includes('giao') || s.includes('ship')) return { key: 'shipped', icon: '🚚', label: 'Đang giao' };
  return { key: 'pending', icon: '⏳', label: status || 'Chờ xử lý' };
};

// Stat Card Component
const StatCard = ({ title, value, change, changeLabel, icon, type, formatter }) => {
  const isPositive = change >= 0;

  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-card-header">
        <div className="stat-icon">{icon}</div>
        <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      </div>
      <div className="stat-value">{formatter ? formatter(value) : value}</div>
      <div className="stat-label">{title}</div>
      <div className="stat-comparison">{changeLabel}</div>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ icon, title, description, onClick }) => {
  return (
    <div className="action-card" onClick={onClick}>
      <div className="action-icon">{icon}</div>
      <div className="action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
};

// Alert Card Component
const AlertCard = ({ type, icon, title, message, time }) => {
  return (
    <div className={`alert-card ${type}`}>
      <div className="alert-icon">{icon}</div>
      <div className="alert-content">
        <div className="alert-title">{title}</div>
        <div className="alert-message">{message}</div>
        <div className="alert-time">{time}</div>
      </div>
    </div>
  );
};

// DashboardOverview Component
const DashboardOverview = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState({ threshold: 10, totalLowStockVariants: 0, items: [] });
  const [activeProductCount, setActiveProductCount] = useState(null);
  const [orderKpi, setOrderKpi] = useState(null);
  const [returnKpi, setReturnKpi] = useState(null);
  const [customerKpi, setCustomerKpi] = useState(null);
  const [employeeKpi, setEmployeeKpi] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    let cancelled = false;
    const range = mapRangeFromUI(timeRange);

    const load = async () => {
      setLoading(true);
      setDashboardError('');

      const results = await Promise.allSettled([
        productAPI.countActive(),
        orderAPI.getKpi(),
        returnAPI.getKpi(),
        adminCustomerAPI.getKpis(),
        adminEmployeeAPI.getKpis(),
        orderAPI.getKpiTimeseries(range, 'net'),
        orderAPI.getRevenueByCategory(range, 8),
        orderAPI.getRevenueByBrand(range, 10),
        orderAPI.getRecent({ page: 0, size: 10 }),
        productAPI.getLowStockKpi(10, 5),
      ]);

      if (cancelled) return;

      const [
        activeCountRes,
        orderRes,
        returnRes,
        customerRes,
        employeeRes,
        timeseriesRes,
        byCategoryRes,
        byBrandRes,
        recentRes,
        lowStockRes,
      ] = results;

      if (activeCountRes.status === 'fulfilled') {
        const count = activeCountRes.value?.data ?? activeCountRes.value;
        if (typeof count === 'number') setActiveProductCount(count);
      }

      if (orderRes.status === 'fulfilled') setOrderKpi(orderRes.value?.data ?? orderRes.value ?? null);
      if (returnRes.status === 'fulfilled') setReturnKpi(returnRes.value?.data ?? returnRes.value ?? null);
      if (customerRes.status === 'fulfilled') setCustomerKpi(customerRes.value?.data ?? customerRes.value ?? null);
      if (employeeRes.status === 'fulfilled') setEmployeeKpi(employeeRes.value?.data ?? employeeRes.value ?? null);

      if (timeseriesRes.status === 'fulfilled') {
        const ts = timeseriesRes.value?.data ?? timeseriesRes.value ?? {};
        const points = Array.isArray(ts.points) ? ts.points : [];
        setRevenueData(points.map(p => ({
          date: formatDateLabel(p.date),
          revenue: Number(p.revenue || 0),
          orders: Number(p.orders || 0),
        })));
      } else {
        setRevenueData([]);
      }

      if (byCategoryRes.status === 'fulfilled') {
        const data = byCategoryRes.value?.data ?? byCategoryRes.value ?? {};
        const items = Array.isArray(data.items) ? data.items : [];
        setCategoryData(items.map((it, idx) => ({
          name: it.categoryName,
          value: Number(it.ratioPercent || 0),
          revenue: Number(it.revenue || 0),
          color: PIE_COLORS[idx % PIE_COLORS.length],
        })));
      } else {
        setCategoryData([]);
      }

      if (byBrandRes.status === 'fulfilled') {
        const data = byBrandRes.value?.data ?? byBrandRes.value ?? {};
        const items = Array.isArray(data.items) ? data.items : [];
        setBrandData(items.map((it) => ({
          name: it.brandName,
          revenue: Number(it.revenue || 0),
          units: Number(it.unitsSold || 0),
        })));
      } else {
        setBrandData([]);
      }

      if (recentRes.status === 'fulfilled') {
        const data = recentRes.value?.data ?? recentRes.value ?? {};
        const content = Array.isArray(data.content) ? data.content : [];
        setRecentOrders(content.map((o) => ({
          id: o.orderNumber,
          customer: {
            name: o.customerName || 'Khách hàng',
            email: o.customerEmail || o.customerPhone || '—',
            avatar: (o.customerName || 'KH').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
          },
          product: {
            name: o.firstItem?.productName || o.productName || '—',
            image: o.firstItem?.imageUrl || o.imageUrl || null,
            variant: `Size ${o.firstItem?.sizeName || o.sizeName || '—'} • ${o.firstItem?.colorName || o.colorName || '—'}`,
          },
          total: Number(o.totalAmount || 0),
          status: normalizeOrderStatus(o.orderStatus),
          date: o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : '—',
        })));
      } else {
        setRecentOrders([]);
      }

      if (lowStockRes.status === 'fulfilled') {
        setLowStock(lowStockRes.value?.data ?? lowStockRes.value ?? { threshold: 10, totalLowStockVariants: 0, items: [] });
      } else {
        setLowStock({ threshold: 10, totalLowStockVariants: 0, items: [] });
      }

      const allRejected = results.every(r => r.status === 'rejected');
      if (allRejected) {
        setDashboardError('Không thể tải dữ liệu dashboard từ máy chủ.');
      }

      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [timeRange]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalRevenue = Number(orderKpi?.todayRevenue ?? revenueData.reduce((sum, item) => sum + item.revenue, 0));
    const totalOrders = Number(orderKpi?.todayOrders ?? revenueData.reduce((sum, item) => sum + item.orders, 0));
    const revenueChange = Number(orderKpi?.revenueDelta ?? 0);
    const orderChange = Number(orderKpi?.ordersDelta ?? 0);

    const productCount = activeProductCount ?? 0;
    const productChange = 0;

    const userCount = Number(customerKpi?.totalCustomers ?? 0);
    const userChange = userCount > 0
      ? Number((((customerKpi?.newCustomersThisMonth ?? 0) / userCount) * 100).toFixed(1))
      : 0;

    const pendingCount = Number(orderKpi?.pendingCount ?? 0);
    const cancelledCount = Number(orderKpi?.cancelledCount ?? 0);
    const returnRate = Number(returnKpi?.returnRate ?? 0);

    return {
      totalRevenue,
      totalOrders,
      revenueChange,
      orderChange,
      productCount,
      productChange,
      userCount,
      userChange,
      pendingCount,
      cancelledCount,
      returnRate,
      customerKpi,
      employeeKpi,
      returnKpi,
    };
  }, [revenueData, activeProductCount, orderKpi, customerKpi, employeeKpi, returnKpi]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      {/* Filters */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Tổng quan</h1>
          <p>Chào mừng bạn trở lại! Dưới đây là thống kê doanh nghiệp của bạn.</p>
        </div>
        <div className="header-actions">
          <div className="filter-controls">
            <select
              className="filter-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
              <option value="90d">90 ngày qua</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid animate-fade-in">
        <StatCard
          title="Doanh thu hôm nay (chưa gồm ship)"
          value={stats.totalRevenue}
          change={stats.revenueChange}
          changeLabel="Theo KPI đơn hàng"
          icon="💰"
          type="revenue"
          formatter={formatCurrency}
        />
        <StatCard
          title="Đơn hàng hôm nay"
          value={stats.totalOrders}
          change={stats.orderChange}
          changeLabel={`Chờ xác nhận: ${stats.pendingCount}`}
          icon="📦"
          type="orders"
          formatter={formatNumber}
        />
        <StatCard
          title="Tổng khách hàng"
          value={stats.userCount}
          change={stats.userChange}
          changeLabel={`Active: ${stats.customerKpi?.activeCustomers ?? 0} • Locked: ${stats.customerKpi?.lockedCustomers ?? 0}`}
          icon="👥"
          type="users"
          formatter={formatNumber}
        />
        <StatCard
          title="Tổng nhân viên"
          value={stats.employeeKpi?.totalEmployees ?? 0}
          change={0}
          changeLabel={`Admin: ${stats.employeeKpi?.adminCount ?? 0} • Manager: ${stats.employeeKpi?.managerCount ?? 0} • Staff: ${stats.employeeKpi?.staffCount ?? 0}`}
          icon="🧑‍💼"
          type="products"
          formatter={formatNumber}
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section animate-fade-in">
        <h3 className="section-title">Thao tác nhanh</h3>
        <div className="quick-actions">
          <QuickActionCard
            icon="➕"
            title="Thêm sản phẩm"
            description="Thêm sản phẩm mới vào kho"
            onClick={() => {}}
          />
          <QuickActionCard
            icon="🏷️"
            title="Tạo khuyến mãi"
            description="Tạo mã giảm giá mới"
            onClick={() => {}}
          />
          <QuickActionCard
            icon="📋"
            title="Xem đơn hàng"
            description="Xem đơn hàng đang chờ"
            onClick={() => {}}
          />
          <QuickActionCard
            icon="⚠️"
            title="Cảnh báo tồn kho"
            description={`${lowStock.totalLowStockVariants || 0} biến thể dưới ngưỡng ${lowStock.threshold || 10}`}
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid animate-fade-in">
        {/* Revenue Chart */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Doanh thu & Đơn hàng</h3>
              <p className="chart-subtitle">Thống kê doanh thu và đơn hàng trong {timeRange === '7d' ? '7 ngày' : timeRange === '30d' ? '30 ngày' : '90 ngày'} qua</p>
            </div>
            <div className="chart-actions">
              <button className="chart-btn active">Doanh thu</button>
              <button className="chart-btn">Đơn hàng</button>
            </div>
          </div>
          <div className="chart-wrapper large">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip content={<CustomTooltip formatter={(value) => formatCurrency(value)} />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  name="Đơn hàng"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="chart-card half-width">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Doanh thu theo danh mục</h3>
              <p className="chart-subtitle">Phân bổ doanh thu sản phẩm theo danh mục</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brand Performance */}
        <div className="chart-card half-width">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Hiệu suất thương hiệu</h3>
              <p className="chart-subtitle">Doanh thu theo từng thương hiệu</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  width={80}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar
                  dataKey="revenue"
                  name="Doanh thu"
                  fill="#6366F1"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="alerts-section animate-fade-in">
        <h3 className="section-title">Cảnh báo & Thông báo</h3>
        <div className="alerts-grid">
          <AlertCard
            type="warning"
            icon="↩️"
            title="KPI Trả hàng"
            message={`Yêu cầu trả hôm nay: ${stats.returnKpi?.todayReturnRequests ?? 0} • Tỷ lệ trả: ${stats.returnRate}%`}
            time="Dữ liệu realtime"
          />
          <AlertCard
            type="danger"
            icon="📦"
            title="Đơn hàng chờ xử lý"
            message={`Đơn chờ xác nhận: ${stats.pendingCount} • Đã hủy: ${stats.cancelledCount}`}
            time="Dữ liệu realtime"
          />
          <AlertCard
            type="success"
            icon="⚠️"
            title="Tồn kho thấp"
            message={`Biến thể sắp hết: ${lowStock.totalLowStockVariants ?? 0}${lowStock.items?.[0] ? ` • Nổi bật: ${lowStock.items[0].productName} (${lowStock.items[0].stock})` : ''}`}
            time="Dữ liệu realtime"
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="orders-section animate-fade-in">
        <div className="section-header">
          <h3 className="section-title">Đơn hàng gần đây</h3>
          <span className="view-all">Xem tất cả →</span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className="order-id">{order.id}</span>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar">{order.customer.avatar}</div>
                      <div className="customer-info">
                        <h4>{order.customer.name}</h4>
                        <p>{order.customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="product-cell">
                      <div className="product-image">
                        {order.product.image ? (
                          <img
                            src={order.product.image}
                            alt={order.product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextSibling;
                              if (fallback) fallback.style.display = 'inline';
                            }}
                          />
                        ) : null}
                        <span style={{ display: order.product.image ? 'none' : 'inline' }}>👟</span>
                      </div>
                      <div className="product-info">
                        <h4>{order.product.name}</h4>
                        <p>{order.product.variant}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="order-total">{formatCurrency(order.total)}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${order.status?.key || 'pending'}`}>
                      {order.status?.icon} {order.status?.label}
                    </span>
                  </td>
                  <td>
                    <span className="order-date">{order.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

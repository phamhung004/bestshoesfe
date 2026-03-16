import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { productAPI } from '../../../services/api';
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

// Generate mock data for charts
const generateRevenueData = () => {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseRevenue = isWeekend ? 8000000 + Math.random() * 5000000 : 5000000 + Math.random() * 4000000;

    data.push({
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      revenue: Math.floor(baseRevenue),
      orders: Math.floor(baseRevenue / (150000 + Math.random() * 50000)),
      visitors: Math.floor(500 + Math.random() * 1500),
    });
  }

  return data;
};

const generateCategoryData = () => [
  { name: 'Running', value: 35, revenue: 125000000, color: '#6366F1' },
  { name: 'Casual', value: 28, revenue: 100000000, color: '#10B981' },
  { name: 'Basketball', value: 18, revenue: 65000000, color: '#F59E0B' },
  { name: 'Training', value: 12, revenue: 42000000, color: '#8B5CF6' },
  { name: 'Other', value: 7, revenue: 25000000, color: '#6B7280' },
];

const generateBrandData = () => [
  { name: 'Nike', revenue: 85000000, units: 425, growth: 15.2 },
  { name: 'Adidas', revenue: 62000000, units: 310, growth: 8.5 },
  { name: 'New Balance', revenue: 45000000, units: 225, growth: 22.3 },
  { name: 'Puma', revenue: 28000000, units: 140, growth: -3.2 },
  { name: 'Converse', revenue: 22000000, units: 110, growth: 5.8 },
];

const generateRecentOrders = () => [
  {
    id: 'ORD-001',
    customer: { name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', avatar: 'NA' },
    product: { name: 'Nike Air Max 90', image: null, variant: 'Size 42' },
    total: 4500000,
    status: 'delivered',
    date: '2024-01-15 14:30',
  },
  {
    id: 'ORD-002',
    customer: { name: 'Trần Thị B', email: 'tranthib@email.com', avatar: 'TB' },
    product: { name: 'Adidas Ultraboost 22', image: null, variant: 'Size 40' },
    total: 5800000,
    status: 'processing',
    date: '2024-01-15 13:45',
  },
  {
    id: 'ORD-003',
    customer: { name: 'Lê Hoàng C', email: 'lehoangc@email.com', avatar: 'LC' },
    product: { name: 'New Balance 574', image: null, variant: 'Size 43' },
    total: 3200000,
    status: 'shipped',
    date: '2024-01-15 12:20',
  },
  {
    id: 'ORD-004',
    customer: { name: 'Phạm Minh D', email: 'phamminhd@email.com', avatar: 'PD' },
    product: { name: 'Puma Suede Classic', image: null, variant: 'Size 41' },
    total: 2800000,
    status: 'pending',
    date: '2024-01-15 11:15',
  },
  {
    id: 'ORD-005',
    customer: { name: 'Hoàng Thu E', email: 'hoangthue@email.com', avatar: 'HE' },
    product: { name: 'Converse Chuck 70', image: null, variant: 'Size 39' },
    total: 2500000,
    status: 'delivered',
    date: '2024-01-15 10:30',
  },
  {
    id: 'ORD-006',
    customer: { name: 'Đặng Quốc F', email: 'dangquocf@email.com', avatar: 'DF' },
    product: { name: 'Nike Air Force 1', image: null, variant: 'Size 44' },
    total: 3800000,
    status: 'cancelled',
    date: '2024-01-15 09:45',
  },
];

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
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeProductCount, setActiveProductCount] = useState(null);

  // Fetch real product count
  useEffect(() => {
    productAPI.countActive()
      .then((res) => {
        const count = res?.data ?? res;
        if (typeof count === 'number') setActiveProductCount(count);
      })
      .catch(() => {/* keep null – falls back to mock in stats */});
  }, []);

  // Initialize data
  useEffect(() => {
    const timer = setTimeout(() => {
      setRevenueData(generateRevenueData());
      setCategoryData(generateCategoryData());
      setBrandData(generateBrandData());
      setRecentOrders(generateRecentOrders());
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [timeRange]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = revenueData.reduce((sum, item) => sum + item.orders, 0);
    const totalVisitors = revenueData.reduce((sum, item) => sum + item.visitors, 0);
    const previousRevenue = totalRevenue * (0.85 + Math.random() * 0.1);
    const revenueChange = ((totalRevenue - previousRevenue) / previousRevenue * 100);
    const orderChange = 12 + Math.random() * 8;
    const productCount = activeProductCount ?? 0;
    const productChange = 5 + Math.random() * 3;
    const userCount = 1847;
    const userChange = 18 + Math.random() * 5;

    return {
      totalRevenue,
      totalOrders,
      totalVisitors,
      revenueChange,
      orderChange,
      productCount,
      productChange,
      userCount,
      userChange,
    };
  }, [revenueData, activeProductCount]);

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
          title="Tổng doanh thu"
          value={stats.totalRevenue}
          change={stats.revenueChange}
          changeLabel="so với kỳ trước"
          icon="💰"
          type="revenue"
          formatter={formatCurrency}
        />
        <StatCard
          title="Tổng đơn hàng"
          value={stats.totalOrders}
          change={stats.orderChange}
          changeLabel="so với kỳ trước"
          icon="📦"
          type="orders"
          formatter={formatNumber}
        />
        <StatCard
          title="Sản phẩm"
          value={stats.productCount}
          change={stats.productChange}
          changeLabel="sản phẩm mới tháng này"
          icon="👟"
          type="products"
          formatter={formatNumber}
        />
        <StatCard
          title="Khách hàng"
          value={stats.userCount}
          change={stats.userChange}
          changeLabel="khách hàng mới tháng này"
          icon="👥"
          type="users"
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
            description="5 sản phẩm sắp hết hàng"
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
            icon="⚠️"
            title="Sắp hết hàng"
            message="5 sản phẩm đang có nguy cơ hết hàng trong 7 ngày tới"
            time="5 phút trước"
          />
          <AlertCard
            type="danger"
            icon="📦"
            title="Đơn hàng chưa xử lý"
            message="3 đơn hàng đang chờ xử lý từ 2 giờ trước"
            time="15 phút trước"
          />
          <AlertCard
            type="success"
            icon="📈"
            title="Doanh thu tăng mạnh"
            message="Doanh thu tăng 18.5% so với tuần trước"
            time="1 giờ trước"
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
                        <span>👟</span>
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
                    <span className={`status-badge ${order.status}`}>
                      {order.status === 'pending' && '⏳'}
                      {order.status === 'processing' && '⚙️'}
                      {order.status === 'shipped' && '🚚'}
                      {order.status === 'delivered' && '✅'}
                      {order.status === 'cancelled' && '❌'}
                      {order.status === 'pending' && 'Chờ xử lý'}
                      {order.status === 'processing' && 'Đang xử lý'}
                      {order.status === 'shipped' && 'Đã giao hàng'}
                      {order.status === 'delivered' && 'Hoàn thành'}
                      {order.status === 'cancelled' && 'Đã hủy'}
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

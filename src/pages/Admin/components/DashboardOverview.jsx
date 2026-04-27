import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { productAPI, orderAPI, returnAPI } from '../../../services/api';
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

const buildDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
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
  const todayStr = buildDateString(new Date());
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState(todayStr);
  const [appliedEndDate, setAppliedEndDate] = useState(todayStr);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [lowStock, setLowStock] = useState({ threshold: 10, totalLowStockVariants: 0, items: [] });
  const [returnKpi, setReturnKpi] = useState(null);

  useEffect(() => {
    setStartDate(todayStr);
    setEndDate(todayStr);
    setAppliedStartDate(todayStr);
    setAppliedEndDate(todayStr);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    let cancelled = false;
    const hasCustomRange = Boolean(appliedStartDate && appliedEndDate);

    const load = async () => {
      setLoading(true);
      setDashboardError('');

      const results = await Promise.allSettled([
        returnAPI.getKpi(),
        orderAPI.getKpiTimeseries({
          metric: 'net',
          ...(hasCustomRange
            ? { startDate: buildDateString(appliedStartDate), endDate: buildDateString(appliedEndDate) }
            : { range: '30d' }),
        }),
        orderAPI.getRevenueByCategory(
          hasCustomRange
            ? { startDate: buildDateString(appliedStartDate), endDate: buildDateString(appliedEndDate), limit: 8 }
            : { range: '30d', limit: 8 }
        ),
        orderAPI.getRevenueByBrand(
          hasCustomRange
            ? { startDate: buildDateString(appliedStartDate), endDate: buildDateString(appliedEndDate), limit: 10 }
            : { range: '30d', limit: 10 }
        ),
        orderAPI.getBestSellingProducts(
          hasCustomRange
            ? { startDate: buildDateString(appliedStartDate), endDate: buildDateString(appliedEndDate), limit: 10 }
            : { range: '30d', limit: 10 }
        ),
        productAPI.getLowStockKpi(10, 5),
      ]);

      if (cancelled) return;

      const [
        returnRes,
        timeseriesRes,
        byCategoryRes,
        byBrandRes,
        bestSellingRes,
        lowStockRes,
      ] = results;

      if (returnRes.status === 'fulfilled') setReturnKpi(returnRes.value?.data ?? returnRes.value ?? null);

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
        const items = Array.isArray(data)
          ? data
          : (Array.isArray(data.items) ? data.items : []);
        setCategoryData(items.map((it, idx) => ({
          name: it.categoryName || it.name || '—',
          value: Number(it.ratioPercent ?? it.value ?? 0),
          revenue: Number(it.revenue || 0),
          color: PIE_COLORS[idx % PIE_COLORS.length],
        })));
      } else {
        setCategoryData([]);
      }

      if (byBrandRes.status === 'fulfilled') {
        const data = byBrandRes.value?.data ?? byBrandRes.value ?? {};
        const items = Array.isArray(data)
          ? data
          : (Array.isArray(data.items) ? data.items : []);
        setBrandData(items.map((it) => ({
          name: it.brandName || it.name || '—',
          revenue: Number(it.revenue || 0),
          units: Number(it.quantitySold ?? it.unitsSold ?? 0),
        })));
      } else {
        setBrandData([]);
      }

      if (bestSellingRes.status === 'fulfilled') {
        const data = bestSellingRes.value?.data ?? bestSellingRes.value ?? [];
        const items = Array.isArray(data) ? data : [];
        setBestSellingProducts(items.map((it, idx) => ({
          rank: idx + 1,
          name: it.productName || '—',
          quantitySold: Number(it.quantitySold || 0),
          revenue: Number(it.revenue || 0),
        })));
      } else {
        setBestSellingProducts([]);
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
  }, [appliedStartDate, appliedEndDate]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalRevenue = Number(revenueData.reduce((sum, item) => sum + item.revenue, 0));
    const totalOrders = Number(revenueData.reduce((sum, item) => sum + item.orders, 0));
    const revenueChange = 0;
    const orderChange = 0;

    const pendingCount = 0;
    const cancelledCount = 0;
    const returnRate = Number(returnKpi?.returnRate ?? 0);

    return {
      totalRevenue,
      totalOrders,
      revenueChange,
      orderChange,
      pendingCount,
      cancelledCount,
      returnRate,
      returnKpi,
    };
  }, [revenueData, returnKpi]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Đang tải dữ liệu...</div>
      </div>
    );
  }

  const handleApplyRange = () => {
    if (!startDate || !endDate) return;
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const handleQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    setStartDate(buildDateString(start));
    setEndDate(buildDateString(end));
    setAppliedStartDate(buildDateString(start));
    setAppliedEndDate(buildDateString(end));
  };

  return (
    <div className="dashboard-overview">
      {/* Filters */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Tổng quan</h1>
          <p>Chào mừng bạn trở lại! Dưới đây là thống kê doanh nghiệp của bạn.</p>
        </div>
        <div className="header-actions">
          <div className="filter-controls date-range-controls">
            <input
              type="date"
              className="filter-select date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="filter-select date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button className="chart-btn active" onClick={handleApplyRange}>
              Áp dụng
            </button>
          </div>
          <div className="quick-range-buttons">
            <button className="chart-btn" onClick={() => handleQuickRange(7)}>7 ngày</button>
            <button className="chart-btn" onClick={() => handleQuickRange(30)}>30 ngày</button>
            <button className="chart-btn" onClick={() => handleQuickRange(90)}>90 ngày</button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid animate-fade-in">
        <StatCard
          title="Doanh thu trong khoảng ngày"
          value={stats.totalRevenue}
          change={stats.revenueChange}
          changeLabel={`Khoảng: ${appliedStartDate} → ${appliedEndDate}`}
          icon="💰"
          type="revenue"
          formatter={formatCurrency}
        />
        <StatCard
          title="Đơn hàng trong khoảng ngày"
          value={stats.totalOrders}
          change={stats.orderChange}
          changeLabel={`Khoảng: ${appliedStartDate} → ${appliedEndDate}`}
          icon="📦"
          type="orders"
          formatter={formatNumber}
        />
      </div>

      {/* Charts */}
      <div className="charts-grid animate-fade-in">
        {/* Revenue Chart */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Doanh thu & Đơn hàng</h3>
              <p className="chart-subtitle">Thống kê doanh thu và đơn hàng trong {appliedStartDate && appliedEndDate ? `${appliedStartDate} → ${appliedEndDate}` : '30 ngày gần nhất'}</p>
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
            message={`Tỷ lệ trả: ${stats.returnRate}%`}
            time={appliedStartDate && appliedEndDate ? `${appliedStartDate} → ${appliedEndDate}` : 'Khoảng ngày hiện tại'}
          />
          <AlertCard
            type="danger"
            icon="📦"
            title="Đơn hàng trong khoảng"
            message={`Đơn chờ xác nhận: ${stats.pendingCount} • Đã hủy: ${stats.cancelledCount}`}
            time={appliedStartDate && appliedEndDate ? `${appliedStartDate} → ${appliedEndDate}` : 'Khoảng ngày hiện tại'}
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

      {/* Best Selling Products */}
      <div className="orders-section animate-fade-in">
        <div className="section-header">
          <h3 className="section-title">Sản phẩm bán chạy</h3>
          <span className="view-all">Xem tất cả →</span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Sản phẩm</th>
                <th>Số lượng bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {bestSellingProducts.map((item) => (
                <tr key={`${item.rank}-${item.name}`}>
                  <td><span className="order-id">{item.rank}</span></td>
                  <td>{item.name}</td>
                  <td>{formatNumber(item.quantitySold)}</td>
                  <td><span className="order-total">{formatCurrency(item.revenue)}</span></td>
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

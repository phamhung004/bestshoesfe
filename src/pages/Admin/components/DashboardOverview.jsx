import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
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
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentMonthRange = () => {
  const now = new Date();
  const today = buildDateString(now);
  return {
    startDate: today,
    endDate: today,
    label: `${now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
  };
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

// Stat Card Component
const StatCard = ({ title, value, icon, type, formatter }) => {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-card-header">
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="stat-value">{formatter ? formatter(value) : value}</div>
      <div className="stat-label">{title}</div>
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
  const currentMonthRange = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(currentMonthRange.startDate);
  const [endDate, setEndDate] = useState(currentMonthRange.endDate);
  const [loading, setLoading] = useState(true);
  const [appliedStartDate, setAppliedStartDate] = useState(currentMonthRange.startDate);
  const [appliedEndDate, setAppliedEndDate] = useState(currentMonthRange.endDate);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [lowStock, setLowStock] = useState({ threshold: 10, totalLowStockVariants: 0, items: [] });
  const [returnKpi, setReturnKpi] = useState(null);
  const [monthlyKpi, setMonthlyKpi] = useState({ revenue: 0, deliveredOrders: 0, cancelledOrders: 0, soldQuantity: 0 });
  const [rangeKpi, setRangeKpi] = useState({ revenue: 0, soldQuantity: 0 });
  const [refreshTick, setRefreshTick] = useState(0);
  const triggerRefresh = useCallback(() => setRefreshTick((v) => v + 1), []);

  useEffect(() => {
    setStartDate(currentMonthRange.startDate);
    setEndDate(currentMonthRange.endDate);
    setAppliedStartDate(currentMonthRange.startDate);
    setAppliedEndDate(currentMonthRange.endDate);
  }, [currentMonthRange.startDate, currentMonthRange.endDate]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        triggerRefresh();
      }
    };

    window.addEventListener('focus', triggerRefresh);
    document.addEventListener('visibilitychange', handleVisibility);
    const intervalId = window.setInterval(triggerRefresh, 60000);

    return () => {
      window.removeEventListener('focus', triggerRefresh);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.clearInterval(intervalId);
    };
  }, [triggerRefresh]);

  // Fetch dashboard data
  useEffect(() => {
    let cancelled = false;
    const hasCustomRange = Boolean(appliedStartDate && appliedEndDate);

    const load = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        returnAPI.getKpi(),
        orderAPI.getMonthSummary(currentMonthRange.startDate.slice(0, 7)),
        orderAPI.getKpiTimeseries({
          metric: 'net',
          ...(hasCustomRange
            ? { startDate: buildDateString(appliedStartDate), endDate: buildDateString(appliedEndDate) }
            : { startDate: currentMonthRange.startDate, endDate: currentMonthRange.endDate }),
        }),
        orderAPI.getRevenueByCategory(
          hasCustomRange
            ? { startDate: buildDateString(appliedStartDate), endDate: buildDateString(appliedEndDate), limit: 8 }
            : { startDate: currentMonthRange.startDate, endDate: currentMonthRange.endDate, limit: 8 }
        ),
        orderAPI.getRevenueByBrand(
          hasCustomRange
            ? { startDate: buildDateString(appliedStartDate), endDate: buildDateString(appliedEndDate), limit: 10 }
            : { startDate: currentMonthRange.startDate, endDate: currentMonthRange.endDate, limit: 10 }
        ),
        orderAPI.getBestSellingProducts({
          startDate: hasCustomRange ? buildDateString(appliedStartDate) : currentMonthRange.startDate,
          endDate: hasCustomRange ? buildDateString(appliedEndDate) : currentMonthRange.endDate,
          limit: 10,
        }),
        productAPI.getLowStockKpi(10, 5),
      ]);

      if (cancelled) return;

      const [
        returnRes,
        monthSummaryRes,
        timeseriesRes,
        byCategoryRes,
        byBrandRes,
        bestSellingRes,
        lowStockRes,
      ] = results;

      if (returnRes.status === 'fulfilled') setReturnKpi(returnRes.value?.data ?? returnRes.value ?? null);

      if (monthSummaryRes.status === 'fulfilled') {
        const data = monthSummaryRes.value?.data ?? monthSummaryRes.value ?? {};
        setMonthlyKpi({
          revenue: Number(data.revenue || 0),
          deliveredOrders: Number(data.deliveredOrders || 0),
          cancelledOrders: Number(data.cancelledOrders || 0),
          soldQuantity: Number(data.soldQuantity || 0),
        });
      } else {
        setMonthlyKpi({ revenue: 0, deliveredOrders: 0, cancelledOrders: 0, soldQuantity: 0 });
      }

      let rangeRevenue = 0;
      let rangeSoldQuantity = 0;

      if (timeseriesRes.status === 'fulfilled') {
        const ts = timeseriesRes.value?.data ?? timeseriesRes.value ?? {};
        const points = Array.isArray(ts.points) ? ts.points : [];
        const mappedRevenueData = points.map(p => ({
          date: formatDateLabel(p.date),
          revenue: Number(p.revenue || 0),
          orders: Number(p.orderCount || 0),
        }));
        rangeRevenue = mappedRevenueData.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
        setRevenueData(mappedRevenueData);
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
        const mappedBestSelling = items.map((it, idx) => ({
          rank: idx + 1,
          name: it.productName || '—',
          quantitySold: Number(it.quantitySold || 0),
          revenue: Number(it.revenue || 0),
        }));
        rangeSoldQuantity = mappedBestSelling.reduce((sum, item) => sum + Number(item.quantitySold || 0), 0);
        setBestSellingProducts(mappedBestSelling);
      } else {
        setBestSellingProducts([]);
      }

      if (lowStockRes.status === 'fulfilled') {
        setLowStock(lowStockRes.value?.data ?? lowStockRes.value ?? { threshold: 10, totalLowStockVariants: 0, items: [] });
      } else {
        setLowStock({ threshold: 10, totalLowStockVariants: 0, items: [] });
      }

      setRangeKpi({
        revenue: rangeRevenue,
        soldQuantity: rangeSoldQuantity,
      });

      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [appliedStartDate, appliedEndDate, refreshTick]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalRevenue = Number(monthlyKpi.revenue || 0);
    const totalOrders = Number(monthlyKpi.deliveredOrders || 0);
    const revenueChange = 0;
    const orderChange = 0;

    const pendingCount = 0;
    const cancelledCount = Number(monthlyKpi.cancelledOrders || 0);
    const returnRate = Number(returnKpi?.returnRate ?? 0);
    const soldQuantity = Number(monthlyKpi.soldQuantity || 0);

    return {
      totalRevenue,
      totalOrders,
      revenueChange,
      orderChange,
      pendingCount,
      cancelledCount,
      returnRate,
      returnKpi,
      soldQuantity,
    };
  }, [monthlyKpi, returnKpi]);

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
      {/* KPI Cards */}
      <div className="stats-grid animate-fade-in">
        <StatCard title="Doanh thu tháng này" value={monthlyKpi.revenue || 0} icon="💰" type="revenue" formatter={formatCurrency} />
        <StatCard title="Đơn đã giao tháng này" value={monthlyKpi.deliveredOrders || 0} icon="📦" type="orders" formatter={formatNumber} />
        <StatCard title="Đơn đã hủy tháng này" value={monthlyKpi.cancelledOrders || 0} icon="❌" type="cancelled" formatter={formatNumber} />
        <StatCard title="Số lượng đã bán tháng này" value={monthlyKpi.soldQuantity || 0} icon="🛍️" type="sold" formatter={formatNumber} />
      </div>

      {/* Filters */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Tổng quan</h1>
          <p>Tháng hiện tại: {currentMonthRange.label}</p>
        </div>
      </div>

      <div className="header-actions" style={{ marginBottom: 20 }}>
        <button className="chart-btn" onClick={triggerRefresh}>
          Làm mới dữ liệu
        </button>
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

      {/* Range KPI Cards */}
      <div className="stats-grid animate-fade-in" style={{ marginTop: 16 }}>
        <StatCard title="Doanh thu theo khoảng ngày" value={rangeKpi.revenue || 0} icon="📈" type="revenue" formatter={formatCurrency} />
        <StatCard title="Số lượng đã bán theo khoảng ngày" value={rangeKpi.soldQuantity || 0} icon="🛒" type="sold" formatter={formatNumber} />
      </div>

      {/* Charts */}
      <div className="charts-grid animate-fade-in">
        {/* Revenue Chart */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Doanh thu</h3>
              <p className="chart-subtitle">Thống kê doanh thu trong {appliedStartDate && appliedEndDate ? `${appliedStartDate} → ${appliedEndDate}` : '30 ngày gần nhất'}</p>
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
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="chart-card half-width">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Doanh thu theo danh mục</h3>
              <p className="chart-subtitle">Phân bổ doanh thu sản phẩm theo danh mục trong khoảng ngày đã chọn</p>
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
            time=""
          />
        </div>
      </div>

      {/* Best Selling Products */}
      <div className="orders-section animate-fade-in">
        <div className="section-header">
          <h3 className="section-title">Sản phẩm bán chạy</h3>
          <span className="view-all">Mặc định theo tháng hiện tại</span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Sản phẩm</th>
                <th>Số lượng bán</th>
              </tr>
            </thead>
            <tbody>
              {bestSellingProducts.map((item) => (
                <tr key={`${item.rank}-${item.name}`}>
                  <td><span className="order-id">{item.rank}</span></td>
                  <td>{item.name}</td>
                  <td>{formatNumber(item.quantitySold)}</td>
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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadialBarChart, RadialBar,
  Treemap, Scatter, ScatterChart, ZAxis
} from 'recharts';
import {
  generateSalesData, generateProductPerformanceData, generateCategoryData,
  generateBrandData, generateSizeData, generateColorData, generateCustomerData,
  generateFunnelData, generateHourlyData, generateWeeklyPattern, generateForecastData,
  generateInsights, generateInventoryHealth, generateKPIData, generateComparisonData
} from './analyticsData';
import './AnalyticsDashboard.css';

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

// Format currency
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

// KPI Card Component
const KPICard = ({ title, value, change, icon, type, comparison }) => {
  const changeType = change >= 0 ? 'positive' : 'negative';
  const absChange = Math.abs(change);

  return (
    <div className={`kpi-card ${type}`}>
      <div className="kpi-card-header">
        <div className="kpi-icon">{icon}</div>
        <div className={`kpi-change ${changeType}`}>
          {change >= 0 ? '↑' : '↓'} {absChange}%
        </div>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{title}</div>
      {comparison && (
        <div className="kpi-comparison">vs {comparison}</div>
      )}
    </div>
  );
};

// Sales Trend Chart
const SalesTrendChart = ({ data, timeRange }) => {
  const [activeMetric, setActiveMetric] = useState('revenue');

  const metrics = [
    { key: 'revenue', label: 'Doanh thu', color: '#10B981' },
    { key: 'orders', label: 'Đơn hàng', color: '#3B82F6' },
    { key: 'visitors', label: 'Khách truy cập', color: '#8B5CF6' },
  ];

  return (
    <div className="chart-container full-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Xu hướng bán hàng</h3>
          <p className="chart-subtitle">Biến động doanh thu và đơn hàng theo thời gian</p>
        </div>
        <div className="chart-actions">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              className={`chart-action-btn ${activeMetric === metric.key ? 'active' : ''}`}
              onClick={() => setActiveMetric(metric.key)}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-wrapper large">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={activeMetric === 'revenue' ? formatCurrency : formatNumber}
            />
            <Tooltip content={<CustomTooltip formatter={activeMetric === 'revenue' ? formatCurrency : formatNumber} />} />
            <Legend />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={metrics.find(m => m.key === activeMetric)?.color}
              fillOpacity={1}
              fill={`url(#color${activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2 }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Revenue Comparison Chart
const RevenueComparisonChart = ({ data }) => {
  const combinedData = [...data.thisPeriod, ...data.previousPeriod];

  return (
    <div className="chart-container half-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">So sánh doanh thu</h3>
          <p className="chart-subtitle">Kỳ hiện tại vs kỳ trước</p>
        </div>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combinedData.slice(-14)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit' })}
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
            <Legend />
            <Bar
              dataKey="revenue"
              name="Kỳ hiện tại"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Line
              type="monotone"
              dataKey={(d) => d.revenue * 0.9}
              name="Kỳ trước"
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <span style={{
          fontSize: '24px',
          fontWeight: '700',
          color: data.growth >= 0 ? '#10B981' : '#EF4444'
        }}>
          {data.growth >= 0 ? '+' : ''}{data.growth}%
        </span>
        <span style={{ color: '#6B7280', marginLeft: '8px' }}>so với kỳ trước</span>
      </div>
    </div>
  );
};

// Category Distribution Pie Chart
const CategoryPieChart = ({ data }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <div className="chart-container third-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Doanh thu theo danh mục</h3>
          <p className="chart-subtitle">Phân bổ doanh thu sản phẩm</p>
        </div>
      </div>
      <div className="chart-wrapper small">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="revenue"
              nameKey="name"
              onMouseEnter={(_, index) => setActiveCategory(index)}
              onMouseLeave={() => setActiveCategory(null)}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="none"
                  opacity={activeCategory === null || activeCategory === index ? 1 : 0.4}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
        {data.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: entry.color }} />
            <span style={{ fontSize: '12px', color: '#6B7280' }}>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Brand Performance Bar Chart
const BrandPerformanceChart = ({ data }) => {
  const [sortBy, setSortBy] = useState('revenue');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data, sortBy]);

  return (
    <div className="chart-container half-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Hiệu suất thương hiệu</h3>
          <p className="chart-subtitle">Doanh thu theo từng thương hiệu</p>
        </div>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '6px 12px' }}
        >
          <option value="revenue">Doanh thu</option>
          <option value="units">Số lượng bán</option>
          <option value="growth">Tăng trưởng</option>
        </select>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
            <XAxis type="number" tickFormatter={formatCurrency} stroke="#9CA3AF" fontSize={12} />
            <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={12} width={80} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar
              dataKey="revenue"
              fill="#6366F1"
              radius={[0, 4, 4, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Size Distribution Chart
const SizeDistributionChart = ({ data }) => {
  return (
    <div className="chart-container third-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Phân bổ kích cỡ</h3>
          <p className="chart-subtitle">Số lượng bán theo từng size</p>
        </div>
      </div>
      <div className="chart-wrapper small">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="size" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip formatter={(value) => formatNumber(value)} />
            <Bar dataKey="units" fill="#3B82F6" radius={[4, 4, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Color Distribution Chart
const ColorDistributionChart = ({ data }) => {
  return (
    <div className="chart-container third-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Phân bổ màu sắc</h3>
          <p className="chart-subtitle">Doanh thu theo từng màu</p>
        </div>
      </div>
      <div className="chart-wrapper small">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              nameKey="name"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.hex} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Conversion Funnel Chart
const ConversionFunnelChart = ({ data }) => {
  const maxValue = data[0].value;

  return (
    <div className="chart-container full-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Phễu chuyển đổi</h3>
          <p className="chart-subtitle">Tỷ lệ chuyển đổi qua từng giai đoạn</p>
        </div>
      </div>
      <div className="funnel-container">
        {data.map((stage, index) => {
          const width = (stage.value / maxValue) * 100;
          const prevValue = index > 0 ? data[index - 1].value : stage.value;
          const dropOff = ((prevValue - stage.value) / prevValue * 100).toFixed(1);

          return (
            <div key={stage.stage} className="funnel-stage">
              <div className="funnel-label">{stage.stage}</div>
              <div className="funnel-bar-container">
                <div
                  className="funnel-bar"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(135deg, ${stage.color}, ${stage.color}dd)`,
                    minWidth: '120px'
                  }}
                >
                  {formatNumber(stage.value)}
                </div>
              </div>
              <div className="funnel-value">{formatCurrency(stage.value * 150)}</div>
              <div className="funnel-percentage">{stage.percentage}%</div>
              {index > 0 && (
                <div style={{
                  fontSize: '12px',
                  color: '#EF4444',
                  width: '50px',
                  textAlign: 'right'
                }}>
                  -{dropOff}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Hourly Traffic Chart
const HourlyTrafficChart = ({ data }) => {
  const peakHours = data
    .map((d, i) => ({ ...d, index: i }))
    .filter(d => d.traffic > 600)
    .map(d => d.hour);

  return (
    <div className="chart-container half-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Lưu lượng truy cập theo giờ</h3>
          <p className="chart-subtitle">Mô hình hoạt động trong ngày</p>
        </div>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="hour"
              stroke="#9CA3AF"
              fontSize={11}
              interval={2}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="traffic"
              stroke="#F59E0B"
              fillOpacity={1}
              fill="url(#colorTraffic)"
              strokeWidth={2}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
        <strong>Giờ cao điểm:</strong> {peakHours.join(', ') || '18:00 - 22:00'}
      </div>
    </div>
  );
};

// Weekly Pattern Chart
const WeeklyPatternChart = ({ data }) => {
  return (
    <div className="chart-container half-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Mô hình theo ngày trong tuần</h3>
          <p className="chart-subtitle">Doanh thu trung bình theo ngày</p>
        </div>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Sales Forecast Chart
const SalesForecastChart = ({ data }) => {
  const historical = data.filter(d => !d.isForecast);
  const forecast = data.filter(d => d.isForecast);

  return (
    <div className="chart-container full-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Dự đoán bán hàng</h3>
          <p className="chart-subtitle">Dự báo doanh thu 30 ngày tới với AI</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
            <div style={{ width: '12px', height: '3px', background: '#10B981' }} />
            Thực tế
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
            <div style={{ width: '12px', height: '3px', background: '#6366F1' }} />
            Dự đoán
          </div>
        </div>
      </div>
      <div className="chart-wrapper large">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="#6366F1"
              fillOpacity={0.1}
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="none"
              fill="#fff"
              fillOpacity={1}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              animationDuration={1500}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey={(d) => d.isForecast ? d.revenue : null}
              stroke="#6366F1"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 6 }}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Customer Analytics Chart
const CustomerAnalyticsChart = ({ data }) => {
  const pieData = [
    { name: 'Khách mới', value: data.newCustomers, fill: '#10B981' },
    { name: 'Khách quen', value: data.returningCustomers, fill: '#6366F1' },
  ];

  return (
    <div className="chart-container half-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Phân tích khách hàng</h3>
          <p className="chart-subtitle">Khách hàng mới vs khách quen</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
        <div className="chart-wrapper small" style={{ width: '200px', height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="90%"
              data={pieData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                minAngle={15}
                label={{ fill: '#666', position: 'outside' }}
                background
                clockWise={true}
                dataKey="value"
                animationDuration={1500}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10B981' }} />
              <span style={{ fontSize: '14px', color: '#374151' }}>Khách hàng mới</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
              {formatNumber(data.newCustomers)}
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>
              ({data.newVsReturningRatio}% tổng)
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#6366F1' }} />
              <span style={{ fontSize: '14px', color: '#374151' }}>Khách hàng quen</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
              {formatNumber(data.returningCustomers)}
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>
              ({(100 - parseFloat(data.newVsReturningRatio)).toFixed(1)}% tổng)
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{data.averageOrdersPerCustomer}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Đơn hàng TB</div>
        </div>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{data.customerLifetimeValue}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Giá trị LTV (Nghìn)</div>
        </div>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{data.averageCustomerLifetime}</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Năm làm KH</div>
        </div>
      </div>
    </div>
  );
};

// Geographic Distribution Chart
const GeographicChart = ({ data }) => {
  return (
    <div className="chart-container half-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Phân bố địa lý</h3>
          <p className="chart-subtitle">Khách hàng theo tỉnh/thành phố</p>
        </div>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
            <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickFormatter={formatNumber} />
            <YAxis type="category" dataKey="region" stroke="#9CA3AF" fontSize={11} width={100} />
            <Tooltip formatter={(value) => formatNumber(value)} />
            <Bar
              dataKey="customers"
              fill="#3B82F6"
              radius={[0, 4, 4, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Product Performance Table
const ProductPerformanceTable = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return (
    <div className="chart-container full-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Hiệu suất sản phẩm</h3>
          <p className="chart-subtitle">Top 10 sản phẩm bán chạy nhất</p>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Sản phẩm</th>
              <th>Thương hiệu</th>
              <th>Doanh thu</th>
              <th>Đã bán</th>
              <th>Tồn kho</th>
              <th>Chuyển đổi</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((product, index) => (
              <tr key={product.id}>
                <td>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: index < 3 ? '#FEF3C7' : '#F3F4F6',
                    color: index < 3 ? '#92400E' : '#6B7280',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}>
                    {index + 1}
                  </span>
                </td>
                <td style={{ fontWeight: '500' }}>{product.name}</td>
                <td>{product.brand}</td>
                <td style={{ fontWeight: '600', color: '#10B981' }}>{formatCurrency(product.revenue)}</td>
                <td>{formatNumber(product.unitsSold)}</td>
                <td>
                  <span className={`badge ${
                    product.inventory > 50 ? 'badge-success' :
                    product.inventory > 20 ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {product.inventory}
                  </span>
                </td>
                <td>{product.conversionRate}%</td>
                <td>
                  {product.inventory > 20 ? (
                    <span className="badge badge-success">Còn hàng</span>
                  ) : product.inventory > 0 ? (
                    <span className="badge badge-warning">Sắp hết</span>
                  ) : (
                    <span className="badge badge-danger">Hết hàng</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// AI Insights Component
const AIInsights = ({ insights }) => {
  return (
    <div className="insights-grid">
      {insights.map((insight) => (
        <div key={insight.id} className={`insight-card ${insight.type}`}>
          <div className="insight-icon">{insight.icon}</div>
          <div className="insight-content">
            <div className="insight-header">
              <h4 className="insight-title">{insight.title}</h4>
              <span className="insight-metric">{insight.metric}</span>
            </div>
            <p className="insight-message">{insight.message}</p>
            <div className="insight-timestamp">
              {new Date(insight.timestamp).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Inventory Health Component
const InventoryHealth = ({ data }) => {
  return (
    <div className="chart-container full-width">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Sức khỏe kho hàng</h3>
          <p className="chart-subtitle">Tổng quan tồn kho và cảnh báo</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          padding: '20px',
          background: '#ECFDF5',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10B981' }}>{data.healthy}</div>
          <div style={{ fontSize: '13px', color: '#059669' }}>Kho khỏe</div>
        </div>
        <div style={{
          padding: '20px',
          background: '#FEF3C7',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B' }}>{data.warning}</div>
          <div style={{ fontSize: '13px', color: '#D97706' }}>Cảnh báo</div>
        </div>
        <div style={{
          padding: '20px',
          background: '#FEF2F2',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#EF4444' }}>{data.critical}</div>
          <div style={{ fontSize: '13px', color: '#DC2626' }}>Nguy hiểm</div>
        </div>
        <div style={{
          padding: '20px',
          background: '#FEE2E2',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#B91C1C' }}>{data.outOfStock}</div>
          <div style={{ fontSize: '13px', color: '#991B1B' }}>Hết hàng</div>
        </div>
        <div style={{
          padding: '20px',
          background: '#F3F4F6',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#6B7280' }}>{data.deadStock}</div>
          <div style={{ fontSize: '13px', color: '#4B5563' }}>Dead Stock</div>
        </div>
      </div>
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Khuyến nghị</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {data.recommendations.map((rec, index) => (
            <li key={index} style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Generate initial mock data
const initialSalesData = generateSalesData(30);
const initialProductData = generateProductPerformanceData();
const initialCategoryData = generateCategoryData();
const initialBrandData = generateBrandData();
const initialSizeData = generateSizeData();
const initialColorData = generateColorData();
const initialCustomerData = generateCustomerData();
const initialFunnelData = generateFunnelData();
const initialHourlyData = generateHourlyData();
const initialWeeklyData = generateWeeklyPattern();
const initialForecastData = generateForecastData(30);
const initialInsights = generateInsights();
const initialInventoryHealth = generateInventoryHealth();
const initialKPIData = generateKPIData();
const initialComparisonData = generateComparisonData('month');

// Main Analytics Dashboard Component
const AnalyticsDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [filters, setFilters] = useState({
    brand: 'all',
    category: 'all',
    size: 'all',
  });

  // Initialize with mock data
  const [salesData, setSalesData] = useState(initialSalesData);
  const [productData, setProductData] = useState(initialProductData);
  const [categoryData, setCategoryData] = useState(initialCategoryData);
  const [brandData, setBrandData] = useState(initialBrandData);
  const [sizeData, setSizeData] = useState(initialSizeData);
  const [colorData, setColorData] = useState(initialColorData);
  const [customerData, setCustomerData] = useState(initialCustomerData);
  const [funnelData, setFunnelData] = useState(initialFunnelData);
  const [hourlyData, setHourlyData] = useState(initialHourlyData);
  const [weeklyData, setWeeklyData] = useState(initialWeeklyData);
  const [forecastData, setForecastData] = useState(initialForecastData);
  const [insights, setInsights] = useState(initialInsights);
  const [inventoryHealth, setInventoryHealth] = useState(initialInventoryHealth);
  const [kpiData, setKpiData] = useState(initialKPIData);
  const [comparisonData, setComparisonData] = useState(initialComparisonData);

  // Load data on mount
  useEffect(() => {
    // Simulate loading for animation effect
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const refreshData = () => {
    setRefreshing(true);
    // Generate new random data on refresh
    setTimeout(() => {
      setSalesData(generateSalesData(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
      setProductData(generateProductPerformanceData());
      setCategoryData(generateCategoryData());
      setBrandData(generateBrandData());
      setSizeData(generateSizeData());
      setColorData(generateColorData());
      setCustomerData(generateCustomerData());
      setFunnelData(generateFunnelData());
      setHourlyData(generateHourlyData());
      setWeeklyData(generateWeeklyPattern());
      setForecastData(generateForecastData(30));
      setInsights(generateInsights());
      setInventoryHealth(generateInventoryHealth());
      setKpiData(generateKPIData());
      setComparisonData(generateComparisonData(timeRange === '7d' ? 'week' : 'month'));
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="chart-loading">
          <div className="loading-spinner" />
          <div className="loading-text">Đang tải dữ liệu analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-title-section">
          <div>
            <h1 className="analytics-title">📊 Thống kê & Phân tích</h1>
            <p className="analytics-subtitle">
              Tổng quan về doanh số, khách hàng và hiệu suất kinh doanh
            </p>
          </div>
        </div>
        <div className="analytics-header-actions">
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
            <select
              className="filter-select"
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            >
              <option value="all">Tất cả thương hiệu</option>
              <option value="nike">Nike</option>
              <option value="adidas">Adidas</option>
              <option value="newbalance">New Balance</option>
            </select>
            <select
              className="filter-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              <option value="running">Running</option>
              <option value="casual">Casual</option>
              <option value="basketball">Basketball</option>
            </select>
          </div>
          <button
            className={`refresh-btn ${refreshing ? 'loading' : ''}`}
            onClick={refreshData}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <div className="spinner" />
                Đang tải...
              </>
            ) : (
              <>
                🔄 Tải lại
              </>
            )}
          </button>
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {kpiData && (
        <div className="kpi-grid">
          <KPICard
            title="Tổng doanh thu"
            value={formatCurrency(kpiData.totalRevenue)}
            change={kpiData.revenueGrowth}
            icon="💰"
            type="revenue"
            comparison="kỳ trước"
          />
          <KPICard
            title="Tổng đơn hàng"
            value={formatNumber(kpiData.totalOrders)}
            change={kpiData.ordersGrowth}
            icon="📦"
            type="orders"
            comparison="kỳ trước"
          />
          <KPICard
            title="Giá trị đơn TB"
            value={formatCurrency(kpiData.averageOrderValue)}
            change={Math.random() * 20 - 5}
            icon="💳"
            type="aov"
            comparison="kỳ trước"
          />
          <KPICard
            title="Tỷ lệ chuyển đổi"
            value={`${kpiData.conversionRate}%`}
            change={Math.random() * 15 - 3}
            icon="📈"
            type="conversion"
            comparison="kỳ trước"
          />
        </div>
      )}

      {/* AI Insights */}
      <AIInsights insights={insights} />

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Sales Trend */}
        <SalesTrendChart data={salesData} timeRange={timeRange} />

        {/* Revenue Comparison */}
        {comparisonData && <RevenueComparisonChart data={comparisonData} />}

        {/* Category Pie Chart */}
        <CategoryPieChart data={categoryData} />

        {/* Brand Performance */}
        <BrandPerformanceChart data={brandData} />

        {/* Size Distribution */}
        <SizeDistributionChart data={sizeData} />

        {/* Color Distribution */}
        <ColorDistributionChart data={colorData} />

        {/* Conversion Funnel */}
        <ConversionFunnelChart data={funnelData} />

        {/* Hourly Traffic */}
        <HourlyTrafficChart data={hourlyData} />

        {/* Weekly Pattern */}
        <WeeklyPatternChart data={weeklyData} />

        {/* Customer Analytics */}
        {customerData && <CustomerAnalyticsChart data={customerData} />}

        {/* Geographic Distribution */}
        {customerData && (
          <GeographicChart data={customerData.geographicDistribution} />
        )}

        {/* Sales Forecast */}
        <SalesForecastChart data={forecastData} />
      </div>

      {/* Inventory Health */}
      {inventoryHealth && <InventoryHealth data={inventoryHealth} />}

      {/* Product Performance Table */}
      <ProductPerformanceTable data={productData} />
    </div>
  );
};

export default AnalyticsDashboard;

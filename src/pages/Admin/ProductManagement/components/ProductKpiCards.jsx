import React from 'react';
import { Package, TrendingUp, AlertTriangle, Layers, ArrowUpRight, AlertCircle } from 'lucide-react';

/**
 * ProductKpiCards
 * Props: stats { total, active, outOfStock, inactive, comingSoon, totalVariants, newThisMonth }
 */
const ProductKpiCards = ({ stats }) => {
  const cards = [
    {
      label: 'Tổng sản phẩm',
      value: stats.total,
      icon: Package,
      iconClass: 'indigo',
      valueClass: '',
      bottom: (
        <span className="pm-kpi-bottom positive">
          <ArrowUpRight size={12} style={{ display: 'inline', marginRight: 2 }} />
          {stats.newThisMonth ?? 0} sản phẩm tháng này
        </span>
      ),
    },
    {
      label: 'Đang bán',
      value: stats.active,
      icon: TrendingUp,
      iconClass: 'green',
      valueClass: 'green',
      bottom: (
        <span className="pm-kpi-bottom">
          {stats.total ? Math.round((stats.active / stats.total) * 100) : 0}% tổng danh mục
        </span>
      ),
    },
    {
      label: 'Hết hàng',
      value: stats.outOfStock,
      icon: AlertTriangle,
      iconClass: 'red',
      valueClass: 'red',
      bottom: (
        <span className="pm-kpi-bottom warning">
          {stats.outOfStock > 0 ? '⚠ Cần nhập hàng sớm' : 'Tồn kho ổn định'}
        </span>
      ),
    },
    {
      label: 'Tổng biến thể',
      value: (stats.totalVariants ?? 0).toLocaleString('vi-VN'),
      icon: Layers,
      iconClass: 'purple',
      valueClass: 'purple',
      bottom: (
        <span className="pm-kpi-bottom">
          Trung bình{' '}
          {stats.total
            ? ((stats.totalVariants ?? 0) / stats.total).toFixed(1)
            : 0}{' '}
          biến thể/sản phẩm
        </span>
      ),
    },
  ];

  return (
    <div className="pm-kpi-grid" style={{ marginBottom: 20 }}>
      {cards.map(({ label, value, icon: Icon, iconClass, valueClass, bottom }) => (
        <div key={label} className="pm-card pm-kpi-card">
          <div className="pm-kpi-top">
            <span className="pm-kpi-label">{label}</span>
            <div className={`pm-kpi-icon ${iconClass}`}>
              <Icon size={20} />
            </div>
          </div>
          <div className={`pm-kpi-value ${valueClass}`}>{value}</div>
          <div>{bottom}</div>
        </div>
      ))}
    </div>
  );
};

export default ProductKpiCards;

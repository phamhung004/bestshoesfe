import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, RefreshCw, Package, Users } from 'lucide-react';
import { couponAPI } from '../../../../services/api';
import './CouponUsageHistory.css';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
};

const formatCurrency = (amount) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getStatusLabel = (status) => {
    const map = {
        'pending': 'Chờ xử lý',
        'confirmed': 'Đã xác nhận',
        'processing': 'Đang xử lý',
        'shipped': 'Đã giao hàng',
        'delivering': 'Đang giao',
        'delivered': 'Đã nhận',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy',
        'returned': 'Đã trả',
    };
    return map[status?.toLowerCase()] || status || '-';
};

const UsageItem = ({ usage, index }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="cm-usage-item">
            <div
                className="cm-usage-item-header"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="cm-usage-customer">
                    <span className="cm-usage-customer-name">
                        {index + 1}. {usage.customerName || 'Khách hàng'}
                    </span>
                    <span className="cm-usage-customer-email">
                        {usage.customerEmail || usage.customerPhone || '-'}
                    </span>
                </div>
                <div className="cm-usage-meta">
                    <span className="cm-usage-order-badge">
                        #{usage.orderNumber}
                    </span>
                    <span className="cm-usage-discount">
                        -{formatCurrency(usage.couponDiscountAmount)}
                    </span>
                    <span className="cm-usage-date">
                        {formatDate(usage.usedAt)}
                    </span>
                    <ChevronDown
                        size={14}
                        className={`cm-usage-expand-icon ${expanded ? 'expanded' : ''}`}
                    />
                </div>
            </div>

            {expanded && (
                <div className="cm-usage-detail">
                    <div className="cm-usage-detail-row">
                        <span className="cm-usage-detail-label">Khách hàng</span>
                        <span className="cm-usage-detail-value">{usage.customerName}</span>
                    </div>
                    {usage.customerPhone && (
                        <div className="cm-usage-detail-row">
                            <span className="cm-usage-detail-label">Số điện thoại</span>
                            <span className="cm-usage-detail-value">{usage.customerPhone}</span>
                        </div>
                    )}
                    {usage.customerEmail && (
                        <div className="cm-usage-detail-row">
                            <span className="cm-usage-detail-label">Email</span>
                            <span className="cm-usage-detail-value">{usage.customerEmail}</span>
                        </div>
                    )}
                    <div className="cm-usage-detail-row">
                        <span className="cm-usage-detail-label">Mã đơn hàng</span>
                        <span className="cm-usage-detail-value">#{usage.orderNumber}</span>
                    </div>
                    <div className="cm-usage-detail-row">
                        <span className="cm-usage-detail-label">Tổng đơn hàng</span>
                        <span className="cm-usage-detail-value">{formatCurrency(usage.orderTotal)}</span>
                    </div>
                    <div className="cm-usage-detail-row">
                        <span className="cm-usage-detail-label">Giảm giá</span>
                        <span className="cm-usage-detail-value cm-usage-discount">
                            -{formatCurrency(usage.couponDiscountAmount)}
                        </span>
                    </div>
                    <div className="cm-usage-detail-row">
                        <span className="cm-usage-detail-label">Thanh toán</span>
                        <span className="cm-usage-detail-value">{usage.paymentMethod || '-'}</span>
                    </div>
                    <div className="cm-usage-detail-row">
                        <span className="cm-usage-detail-label">Trạng thái đơn</span>
                        <span className={`cm-usage-status ${(usage.orderStatus || '').toLowerCase()}`}>
                            {getStatusLabel(usage.orderStatus)}
                        </span>
                    </div>
                    <div className="cm-usage-detail-row">
                        <span className="cm-usage-detail-label">Thời gian sử dụng</span>
                        <span className="cm-usage-detail-value">{formatDate(usage.usedAt)}</span>
                    </div>

                    {usage.orderItems && usage.orderItems.length > 0 && (
                        <>
                            <div className="cm-usage-items-title">Sản phẩm trong đơn hàng</div>
                            <table className="cm-usage-items-table">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>SL</th>
                                        <th>Đơn giá</th>
                                        <th>Tổng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usage.orderItems.map((item, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div className="cm-usage-item-product">
                                                    {item.productName || 'Sản phẩm'}
                                                </div>
                                                {(item.sizeName || item.colorName) && (
                                                    <div className="cm-usage-item-variant">
                                                        {[item.sizeName, item.colorName].filter(Boolean).join(' / ')}
                                                    </div>
                                                )}
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>{formatCurrency(item.unitPrice)}</td>
                                            <td>{formatCurrency(item.totalPrice)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const CouponUsageHistory = ({ couponId }) => {
    const [usages, setUsages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsages = useCallback(async () => {
        if (!couponId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await couponAPI.getUsageHistory(couponId);
            setUsages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load coupon usage history:', err);
            setError('Không thể tải lịch sử sử dụng');
        } finally {
            setLoading(false);
        }
    }, [couponId]);

    useEffect(() => { fetchUsages(); }, [fetchUsages]);

    if (loading) {
        return (
            <div className="cm-usage-history">
                <div className="cm-usage-loading">
                    <RefreshCw size={16} /> Đang tải lịch sử...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cm-usage-history">
                <div className="cm-usage-error">
                    {error}
                    <br />
                    <button onClick={fetchUsages}>Thử lại</button>
                </div>
            </div>
        );
    }

    if (usages.length === 0) {
        return (
            <div className="cm-usage-history">
                <div className="cm-usage-empty">
                    <Package size={32} />
                    <p>Chưa có lượt sử dụng nào</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cm-usage-history">
            <div className="cm-usage-list">
                {usages.map((usage, index) => (
                    <UsageItem key={usage.usageId} usage={usage} index={index} />
                ))}
            </div>
        </div>
    );
};

export default CouponUsageHistory;

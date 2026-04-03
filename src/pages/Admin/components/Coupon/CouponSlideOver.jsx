import React from 'react';
import {
    X, Pencil, Trash2, Eye, EyeOff, Copy,
    FileText, Clock, Timer, Ticket, DollarSign, History,
} from 'lucide-react';
import CouponUsageHistory from './CouponUsageHistory';

/* ── helpers ─────────────────────────────────────────────────────── */

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

const getStatusInfo = (coupon) => {
    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.endDate);
    if (!coupon.status) return { label: 'Ẩn', className: 'inactive' };
    if (now > end) return { label: 'Hết hạn', className: 'expired' };
    if (now < start) return { label: 'Sắp tới', className: 'upcoming' };
    return { label: 'Hoạt động', className: 'active' };
};

const getCountdown = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days} ngày ${hours} giờ còn lại`;
    if (hours > 0) return `${hours} giờ ${minutes} phút còn lại`;
    return `${minutes} phút còn lại`;
};

const getUsagePercent = (usedCount, usageLimit) => {
    if (!usageLimit || usageLimit <= 0) return 0;
    return Math.min(100, Math.round(((usedCount || 0) / usageLimit) * 100));
};

/* ── component ───────────────────────────────────────────────────── */

const CouponSlideOver = ({
    coupon,
    onClose,
    onEdit,
    onToggleStatus,
    onDelete,
}) => {
    if (!coupon) return null;

    const statusInfo = getStatusInfo(coupon);
    const countdown = statusInfo.className === 'active' ? getCountdown(coupon.endDate) : null;
    const usagePct = getUsagePercent(coupon.usedCount, coupon.usageLimit);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(coupon.code).catch(() => {});
    };

    return (
        <>
            {/* overlay */}
            <div className="cm-overlay" onClick={onClose} />

            {/* panel */}
            <div className="cm-slideover" role="dialog" aria-label="Chi tiết mã giảm giá">
                {/* ── header ── */}
                <div className="cm-so-header">
                    <div className="cm-so-title">
                        <h2>
                            {coupon.name || 'Mã giảm giá'}
                            <span className={`cm-status-badge ${statusInfo.className}`} style={{ marginLeft: 8 }}>
                                <span className="cm-badge-dot" style={{
                                    background: statusInfo.className === 'active' ? 'var(--success-500)'
                                        : statusInfo.className === 'inactive' ? 'var(--danger-500)'
                                            : statusInfo.className === 'expired' ? 'var(--warning-500)'
                                                : 'var(--primary-500)',
                                }} />
                                {statusInfo.label}
                            </span>
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                            <span className="cm-so-code-badge">
                                <Ticket size={12} />
                                {coupon.code}
                            </span>
                            <button
                                className="cm-so-copy-btn"
                                onClick={handleCopyCode}
                                title="Sao chép mã"
                            >
                                <Copy size={12} />
                            </button>
                            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>ID: {coupon.couponId}</span>
                        </div>
                    </div>
                    <button className="cm-so-close" onClick={onClose} aria-label="Đóng">
                        <X size={18} />
                    </button>
                </div>

                {/* ── body ── */}
                <div className="cm-so-body">
                    {/* Section 1: Thông tin chung */}
                    <div className="cm-so-card">
                        <h3><FileText size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Thông tin chung</h3>

                        {coupon.description && (
                            <div className="cm-so-info-row">
                                <span className="cm-so-info-label">Mô tả</span>
                                <span className="cm-so-info-value" style={{ maxWidth: 280, textAlign: 'right' }}>
                                    {coupon.description}
                                </span>
                            </div>
                        )}
                        <div className="cm-so-info-row">
                            <span className="cm-so-info-label">Loại giảm giá</span>
                            <span className="cm-so-info-value">
                                <span className={`cm-type-badge ${coupon.type === 'Percentage' ? 'percentage' : 'fixed'}`}>
                                    {coupon.type === 'Percentage' ? 'Phần trăm' : 'Số tiền cố định'}
                                </span>
                            </span>
                        </div>
                        <div className="cm-so-info-row">
                            <span className="cm-so-info-label">Giá trị giảm</span>
                            <span className="cm-so-info-value cm-discount-value">
                                {coupon.type === 'Percentage'
                                    ? `${coupon.value}%`
                                    : formatCurrency(coupon.value)
                                }
                            </span>
                        </div>
                        <div className="cm-so-info-row">
                            <span className="cm-so-info-label">Đơn hàng tối thiểu</span>
                            <span className="cm-so-info-value">
                                {coupon.minimumAmount ? formatCurrency(coupon.minimumAmount) : 'Không giới hạn'}
                            </span>
                        </div>
                        {coupon.type === 'Percentage' && (
                            <div className="cm-so-info-row">
                                <span className="cm-so-info-label">Giảm tối đa</span>
                                <span className="cm-so-info-value">
                                    {coupon.maximumDiscount ? formatCurrency(coupon.maximumDiscount) : 'Không giới hạn'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Sử dụng */}
                    <div className="cm-so-card">
                        <h3><DollarSign size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Tình trạng sử dụng</h3>

                        <div className="cm-so-info-row">
                            <span className="cm-so-info-label">Đã sử dụng</span>
                            <span className="cm-so-info-value">{coupon.usedCount || 0} lần</span>
                        </div>
                        <div className="cm-so-info-row">
                            <span className="cm-so-info-label">Giới hạn</span>
                            <span className="cm-so-info-value">
                                {coupon.usageLimit ? `${coupon.usageLimit} lần` : 'Không giới hạn'}
                            </span>
                        </div>
                        <div className="cm-so-info-row">
                            <span className="cm-so-info-label">Giới hạn mỗi khách</span>
                            <span className="cm-so-info-value">
                                {coupon.perCustomerLimit ? `${coupon.perCustomerLimit} lần` : 'Không giới hạn'}
                            </span>
                        </div>

                        {coupon.usageLimit > 0 && (
                            <div className="cm-so-usage-progress">
                                <div className="cm-so-usage-bar">
                                    <div
                                        className="cm-so-usage-bar-fill"
                                        style={{
                                            width: `${usagePct}%`,
                                            background: usagePct >= 90
                                                ? 'var(--danger-500)'
                                                : usagePct >= 50
                                                    ? 'var(--warning-500)'
                                                    : 'var(--success-500)',
                                        }}
                                    />
                                </div>
                                <span className="cm-so-usage-pct">{usagePct}% đã dùng</span>
                            </div>
                        )}
                    </div>

                    {/* Section 3: Timeline / Countdown */}
                    <div className="cm-so-card">
                        <h3><Clock size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Timeline</h3>

                        <div className="cm-so-info-row">
                            <span className="cm-so-info-label">Bắt đầu</span>
                            <span className="cm-so-info-value">{formatDate(coupon.startDate)}</span>
                        </div>
                        <div className="cm-so-info-row">
                            <span className="cm-so-info-label">Kết thúc</span>
                            <span className="cm-so-info-value">{formatDate(coupon.endDate)}</span>
                        </div>
                        {coupon.createdAt && (
                            <div className="cm-so-info-row">
                                <span className="cm-so-info-label">Ngày tạo</span>
                                <span className="cm-so-info-value">{formatDate(coupon.createdAt)}</span>
                            </div>
                        )}

                        {countdown && (
                            <div className="cm-so-countdown">
                                <Timer size={18} className="countdown-icon" />
                                {countdown}
                            </div>
                        )}
                    </div>

                    {/* Section 4: Lịch sử sử dụng */}
                    <div className="cm-so-card">
                        <h3><History size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Lịch sử sử dụng
                            <span className="cm-usage-count">({coupon.usedCount || 0})</span>
                        </h3>
                        <CouponUsageHistory couponId={coupon.couponId} />
                    </div>
                </div>

                {/* ── footer ── */}
                <div className="cm-so-footer">
                    <button className="cm-btn cm-btn-primary" onClick={() => onEdit?.(coupon)}>
                        <Pencil size={14} /> Chỉnh sửa
                    </button>
                    <button
                        className={`cm-btn ${coupon.status ? 'cm-btn-outline' : 'cm-btn-success'}`}
                        onClick={() => onToggleStatus?.(coupon)}
                    >
                        {coupon.status ? <><EyeOff size={14} /> Ẩn</> : <><Eye size={14} /> Bật</>}
                    </button>
                    <button className="cm-btn cm-btn-danger-outline" onClick={() => onDelete?.(coupon)}>
                        <Trash2 size={14} /> Xóa
                    </button>
                </div>
            </div>
        </>
    );
};

export default CouponSlideOver;

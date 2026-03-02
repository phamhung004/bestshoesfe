import React, { useState, useEffect, useCallback } from 'react';
import {
    X, Pencil, Trash2, Eye, EyeOff, Package,
    FileText, Clock, Zap, Snowflake, Tag, Star,
    ImageIcon, AlertTriangle, Timer,
} from 'lucide-react';
import { promotionAPI } from '../../../../services/api';

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

const TYPE_CONFIG = {
    flash_sale: { label: 'Flash Sale', icon: Zap, className: 'flash-sale' },
    seasonal: { label: 'Theo mùa', icon: Snowflake, className: 'seasonal' },
    clearance: { label: 'Thanh lý', icon: Tag, className: 'clearance' },
    special: { label: 'Đặc biệt', icon: Star, className: 'special' },
};

const getStatusInfo = (promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    if (!promotion.isActive) return { label: 'Đã tắt', className: 'inactive' };
    if (now > end) return { label: 'Hết hạn', className: 'expired' };
    if (now < start) return { label: 'Sắp tới', className: 'upcoming' };
    return { label: 'Đang chạy', className: 'active' };
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

/* ── component ───────────────────────────────────────────────────── */

const PromotionSlideOver = ({
    promotion,
    onClose,
    onEdit,
    onToggleStatus,
    onDelete,
    onManageVariants,
}) => {
    const [variants, setVariants] = useState([]);
    const [loadingVariants, setLoadingVariants] = useState(false);

    const loadVariants = useCallback(async () => {
        if (!promotion?.promotionId) return;
        setLoadingVariants(true);
        try {
            const data = await promotionAPI.getVariants(promotion.promotionId);
            setVariants(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load variants:', err);
            setVariants([]);
        } finally {
            setLoadingVariants(false);
        }
    }, [promotion?.promotionId]);

    useEffect(() => {
        loadVariants();
    }, [loadVariants]);

    if (!promotion) return null;

    const typeCfg = TYPE_CONFIG[promotion.type] || {};
    const TypeIcon = typeCfg.icon || Tag;
    const statusInfo = getStatusInfo(promotion);
    const countdown = statusInfo.className === 'active' ? getCountdown(promotion.endDate) : null;

    return (
        <>
            {/* overlay */}
            <div className="pm-overlay" onClick={onClose} />

            {/* panel */}
            <div className="pm-slideover" role="dialog" aria-label="Chi tiết đợt giảm giá">
                {/* ── header ── */}
                <div className="pm-so-header">
                    <div className="pm-so-title">
                        <h2>
                            {promotion.name}
                            <span className={`pm-status-badge ${statusInfo.className}`} style={{ marginLeft: 8 }}>
                                <span className="pm-badge-dot" style={{
                                    background: statusInfo.className === 'active' ? 'var(--success-500)'
                                        : statusInfo.className === 'inactive' ? 'var(--danger-500)'
                                        : statusInfo.className === 'expired' ? 'var(--warning-500)'
                                        : 'var(--primary-500)',
                                }} />
                                {statusInfo.label}
                            </span>
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>ID: {promotion.promotionId}</span>
                            <span className={`pm-type-badge ${typeCfg.className || ''}`}>
                                <TypeIcon size={12} />
                                {typeCfg.label || promotion.type}
                            </span>
                        </div>
                    </div>
                    <button className="pm-so-close" onClick={onClose} aria-label="Đóng">
                        <X size={18} />
                    </button>
                </div>

                {/* ── body ── */}
                <div className="pm-so-body">
                    {/* Section 1: Thông tin chung */}
                    <div className="pm-so-card">
                        <h3><FileText size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Thông tin chung</h3>

                        {promotion.description && (
                            <div className="pm-so-info-row">
                                <span className="pm-so-info-label">Mô tả</span>
                                <span className="pm-so-info-value" style={{ maxWidth: 280, textAlign: 'right' }}>
                                    {promotion.description}
                                </span>
                            </div>
                        )}
                        <div className="pm-so-info-row">
                            <span className="pm-so-info-label">Loại đợt giảm giá</span>
                            <span className="pm-so-info-value">
                                <span className={`pm-type-badge ${typeCfg.className || ''}`}>
                                    <TypeIcon size={12} />
                                    {typeCfg.label || promotion.type}
                                </span>
                            </span>
                        </div>
                        {promotion.discountPercentage != null && promotion.discountPercentage > 0 && (
                            <div className="pm-so-info-row">
                                <span className="pm-so-info-label">Phần trăm giảm</span>
                                <span className="pm-so-info-value pm-discount">{promotion.discountPercentage}%</span>
                            </div>
                        )}
                        {promotion.discountAmount != null && promotion.discountAmount > 0 && (
                            <div className="pm-so-info-row">
                                <span className="pm-so-info-label">Số tiền giảm</span>
                                <span className="pm-so-info-value pm-discount">{formatCurrency(promotion.discountAmount)}</span>
                            </div>
                        )}
                        <div className="pm-so-info-row">
                            <span className="pm-so-info-label">Bắt đầu</span>
                            <span className="pm-so-info-value">{formatDate(promotion.startDate)}</span>
                        </div>
                        <div className="pm-so-info-row">
                            <span className="pm-so-info-label">Kết thúc</span>
                            <span className="pm-so-info-value">{formatDate(promotion.endDate)}</span>
                        </div>
                        {promotion.createdAt && (
                            <div className="pm-so-info-row">
                                <span className="pm-so-info-label">Ngày tạo</span>
                                <span className="pm-so-info-value">{formatDate(promotion.createdAt)}</span>
                            </div>
                        )}
                        {promotion.updatedAt && (
                            <div className="pm-so-info-row">
                                <span className="pm-so-info-label">Cập nhật lần cuối</span>
                                <span className="pm-so-info-value">{formatDate(promotion.updatedAt)}</span>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Sản phẩm áp dụng */}
                    <div className="pm-so-card">
                        <h3>
                            <Package size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                            Sản phẩm áp dụng ({loadingVariants ? '…' : variants.length})
                        </h3>

                        {loadingVariants ? (
                            <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 13, color: 'var(--gray-400)' }}>
                                Đang tải danh sách sản phẩm...
                            </div>
                        ) : variants.length === 0 ? (
                            <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 13, color: 'var(--gray-400)' }}>
                                Chưa có sản phẩm nào được gán.
                            </div>
                        ) : (
                            <>
                                {variants.slice(0, 5).map((v) => (
                                    <div key={v.promotionDetailId} className="pm-so-variant-item">
                                        {v.productImageUrl ? (
                                            <img
                                                className="pm-so-variant-thumb"
                                                src={v.productImageUrl}
                                                alt={v.productName}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="pm-so-variant-thumb" style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--gray-400)',
                                            }}>
                                                <ImageIcon size={18} />
                                            </div>
                                        )}
                                        <div className="pm-so-variant-info">
                                            <span className="pm-so-variant-name">{v.productName}</span>
                                            <span className="pm-so-variant-detail">
                                                {v.sizeName} / {v.colorName}
                                                {v.colorCode && (
                                                    <span
                                                        className="pm-color-dot"
                                                        style={{ backgroundColor: v.colorCode, marginLeft: 6 }}
                                                    />
                                                )}
                                            </span>
                                        </div>
                                        <div className="pm-so-variant-prices">
                                            {v.originalPrice != null && (
                                                <span className="original-price">{formatCurrency(v.originalPrice)}</span>
                                            )}
                                            <span className="promo-price">
                                                {v.promotionPrice != null
                                                    ? formatCurrency(v.promotionPrice)
                                                    : v.fixedPrice != null
                                                        ? formatCurrency(v.fixedPrice)
                                                        : '-'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {variants.length > 5 && (
                                    <div style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center', paddingTop: 8 }}>
                                        ...và {variants.length - 5} sản phẩm khác
                                    </div>
                                )}
                            </>
                        )}

                        <button
                            className="pm-btn pm-btn-outline pm-btn-sm"
                            style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                            onClick={() => onManageVariants?.(promotion)}
                        >
                            <Package size={14} /> Quản lý sản phẩm
                        </button>
                    </div>

                    {/* Section 3: Timeline / Countdown */}
                    <div className="pm-so-card">
                        <h3><Clock size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Timeline</h3>

                        <div className="pm-so-info-row">
                            <span className="pm-so-info-label">Ngày tạo</span>
                            <span className="pm-so-info-value">{formatDate(promotion.createdAt)}</span>
                        </div>
                        <div className="pm-so-info-row">
                            <span className="pm-so-info-label">Trạng thái hiện tại</span>
                            <span className="pm-so-info-value">
                                <span className={`pm-status-badge ${statusInfo.className}`}>
                                    <span className="pm-badge-dot" style={{
                                        background: statusInfo.className === 'active' ? 'var(--success-500)'
                                            : statusInfo.className === 'inactive' ? 'var(--danger-500)'
                                            : statusInfo.className === 'expired' ? 'var(--warning-500)'
                                            : 'var(--primary-500)',
                                    }} />
                                    {statusInfo.label}
                                </span>
                            </span>
                        </div>

                        {countdown && (
                            <div className="pm-so-countdown">
                                <Timer size={18} className="countdown-icon" />
                                {countdown}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── footer ── */}
                <div className="pm-so-footer">
                    <button className="pm-btn pm-btn-primary" onClick={() => onEdit?.(promotion)}>
                        <Pencil size={14} /> Chỉnh sửa
                    </button>
                    <button
                        className={`pm-btn ${promotion.isActive ? 'pm-btn-outline' : 'pm-btn-success'}`}
                        onClick={() => onToggleStatus?.(promotion)}
                    >
                        {promotion.isActive ? <><EyeOff size={14} /> Tắt</> : <><Eye size={14} /> Bật</>}
                    </button>
                    <button className="pm-btn pm-btn-danger-outline" onClick={() => onDelete?.(promotion)}>
                        <Trash2 size={14} /> Xóa
                    </button>
                </div>
            </div>
        </>
    );
};

export default PromotionSlideOver;

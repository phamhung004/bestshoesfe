import React, { useState } from 'react';
import {
    RETURN_STATUS_CONFIG, REASON_CONFIG, REFUND_METHODS,
    formatVND, formatDateTime, getInitials,
} from './mockReturns';
import { updateReturnRefundMethod } from '../../../../api/returnApi';

/**
 * ReturnDetailSlideOver — right drawer with full return detail,
 * timeline, refund breakdown, notes, and contextual action buttons.
 */
const ReturnDetailSlideOver = ({
    returnItem,
    onClose,
    onStatusChange,
    onCopyReturnCode,
    onApprove,
    onReject,
    onPrint,
}) => {
    const [notes, setNotes] = useState(returnItem?.notes || '');
    const [autoSaved, setAutoSaved] = useState(false);
    const [lightboxImg, setLightboxImg] = useState(null);
    const [refundMethod, setRefundMethod] = useState(returnItem?.refund_method || '');
    const [savingMethod, setSavingMethod] = useState(false);
    const [methodSaved, setMethodSaved] = useState(false);

    const handleRefundMethodChange = async (newMethod) => {
        setRefundMethod(newMethod);
        if (!returnItem?.return_id) return;
        setSavingMethod(true);
        setMethodSaved(false);
        try {
            await updateReturnRefundMethod(returnItem.return_id, newMethod);
            setMethodSaved(true);
            setTimeout(() => setMethodSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save refund method:', err);
        } finally {
            setSavingMethod(false);
        }
    };

    if (!returnItem) return null;

    const statusCfg = RETURN_STATUS_CONFIG[returnItem.return_status] || {};
    const reasonCfg = REASON_CONFIG[returnItem.return_reason] || {};

    // Calculate refund breakdown
    const itemsTotal = (returnItem.items || []).reduce((sum, item) => sum + (item.total_price || 0), 0);
    const shippingRefund = returnItem.shipping_cost_refund || 0;
    const deduction = returnItem.deduction || 0;
    const refundTotal = itemsTotal + shippingRefund - deduction;

    // Evidence images from API
    const evidenceImages = (returnItem.images || []).map(img => img.image_url || img.imageUrl).filter(Boolean);

    const handleNoteChange = (val) => {
        setNotes(val);
        setAutoSaved(false);
        // Simulate auto-save
        setTimeout(() => setAutoSaved(true), 1000);
    };

    return (
        <>
            {/* Backdrop */}
            <div className="rm-slideover-backdrop" onClick={onClose}></div>

            {/* Panel */}
            <div className="rm-slideover" role="dialog" aria-label="Chi tiết yêu cầu trả hàng">
                {/* Header */}
                <div className="rm-slideover-header">
                    <div className="rm-slideover-header-left">
                        <span className="rm-slideover-code">{returnItem.return_code}</span>
                        <button
                            className="rm-slideover-copy"
                            title="Sao chép mã"
                            onClick={() => onCopyReturnCode(returnItem.return_code)}
                        >
                            📋
                        </button>
                        <span className="rm-badge" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                            <span className="rm-badge-dot" style={{ background: statusCfg.color }}></span>
                            {statusCfg.label}
                        </span>
                    </div>
                    <button className="rm-slideover-close" onClick={onClose} aria-label="Đóng">×</button>
                </div>

                {/* Body */}
                <div className="rm-slideover-body">
                    {/* Linked Order Info */}
                    <div className="rm-so-section">
                        <div className="rm-so-section-title">📦 Đơn hàng gốc</div>
                        <div className="rm-so-row">
                            <span className="label">Mã đơn:</span>
                            <span className="value rm-order-chip">{returnItem.order_number}</span>
                        </div>
                        <div className="rm-so-row">
                            <span className="label">Ngày đặt:</span>
                            <span className="value">{formatDateTime(returnItem.order_created_at)}</span>
                        </div>
                        <div className="rm-so-row">
                            <span className="label">Loại đơn:</span>
                            <span className={`rm-type-chip ${returnItem.order_type === 'Online' ? 'online' : 'instore'}`}>
                                {returnItem.order_type}
                            </span>
                        </div>
                        <div className="rm-so-row">
                            <span className="label">Tổng đơn gốc:</span>
                            <span className="value" style={{ fontWeight: 700 }}>{formatVND(returnItem.original_total)}</span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="rm-so-section">
                        <div className="rm-so-section-title">👤 Thông tin khách hàng</div>
                        <div className="rm-so-row">
                            <div className="rm-avatar" style={{ marginRight: 8 }}>{getInitials(returnItem.customer_name)}</div>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: 14 }}>{returnItem.customer_name}</div>
                                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{returnItem.customer_phone}</div>
                            </div>
                        </div>
                    </div>

                    {/* Returned Items */}
                    <div className="rm-so-section">
                        <div className="rm-so-section-title">
                            👟 Sản phẩm trả hàng
                            {returnItem.is_partial && (
                                <span className="rm-badge" style={{ background: '#FEF9C3', color: '#EAB308', fontSize: 10, marginLeft: 8 }}>
                                    Trả một phần
                                </span>
                            )}
                        </div>
                        {(returnItem.items || []).map(item => (
                            <div key={item.order_item_id} className="rm-so-item">
                                <img
                                    src={item.product?.image_url}
                                    alt={item.product?.name}
                                    className="rm-so-item-thumb"
                                />
                                <div className="rm-so-item-info">
                                    <div className="rm-so-item-name">{item.product?.name}</div>
                                    <div className="rm-so-item-variant">
                                        Size: {item.size?.size_name} / Màu: {item.color?.color_name}
                                    </div>
                                    <div className="rm-so-item-variant">
                                        Số lượng trả: {item.quantity} &nbsp;|&nbsp; Đơn giá: {formatVND(item.unit_price)}
                                    </div>
                                </div>
                                <div className="rm-so-item-price">
                                    {formatVND(item.total_price)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Return Reason */}
                    <div className="rm-so-section">
                        <div className="rm-so-section-title">📋 Lý do trả hàng</div>
                        <div className="rm-so-row" style={{ marginBottom: 10 }}>
                            <span className="rm-reason-badge" style={{ background: reasonCfg.bg, color: reasonCfg.color }}>
                                {reasonCfg.icon} {returnItem.return_reason}
                            </span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5, marginBottom: 12 }}>
                            <strong style={{ fontSize: 12, color: 'var(--gray-500)' }}>Mô tả chi tiết:</strong>
                            <br />
                            {returnItem.description}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>Ảnh minh chứng:</div>
                        <div className="rm-evidence-images">
                            {evidenceImages.length > 0 ? evidenceImages.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`Minh chứng ${i + 1}`}
                                    className="rm-evidence-thumb"
                                    onClick={() => setLightboxImg(img)}
                                />
                            )) : (
                                <div style={{ fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>Chưa có ảnh minh chứng</div>
                            )}
                        </div>
                    </div>

                    {/* Rejection reason (if rejected) */}
                    {returnItem.return_status === 'Từ chối' && returnItem.reject_reason && (
                        <div className="rm-so-section" style={{ background: '#FEF2F2' }}>
                            <div className="rm-so-section-title" style={{ color: 'var(--danger-600)' }}>❌ Lý do từ chối</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger-600)', marginBottom: 4 }}>
                                {returnItem.reject_reason}
                            </div>
                            {returnItem.reject_note && (
                                <div style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5 }}>
                                    {returnItem.reject_note}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Refund Breakdown */}
                    <div className="rm-so-section">
                        <div className="rm-so-section-title">💰 Chi tiết hoàn tiền</div>
                        <div className="rm-refund-breakdown">
                            <div className="rm-refund-line">
                                <span>Giá trị hàng trả:</span>
                                <span>{formatVND(itemsTotal)}</span>
                            </div>
                            <div className="rm-refund-line">
                                <span>Phí vận chuyển hoàn:</span>
                                <span>{formatVND(shippingRefund)}</span>
                            </div>
                            {deduction > 0 && (
                                <div className="rm-refund-line">
                                    <span>Khấu trừ (nếu có):</span>
                                    <span className="deduction">-{formatVND(deduction)}</span>
                                </div>
                            )}
                            <div className="rm-refund-line total">
                                <span>TỔNG HOÀN TIỀN:</span>
                                <span>{formatVND(refundTotal)}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: 14 }}>
                            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>Phương thức hoàn tiền:</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <select
                                    className="rm-method-select"
                                    value={refundMethod}
                                    onChange={e => handleRefundMethodChange(e.target.value)}
                                    disabled={savingMethod}
                                >
                                    {REFUND_METHODS.map(m => (
                                        <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                                    ))}
                                </select>
                                {savingMethod && <span style={{ fontSize: 12, color: '#6b7280' }}>Đang lưu...</span>}
                                {methodSaved && <span style={{ fontSize: 12, color: '#16a34a' }}>✓ Đã lưu</span>}
                            </div>
                            {refundMethod === 'Chuyển khoản' && (
                                <div style={{ marginTop: 10, padding: '10px 12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, fontSize: 13 }}>
                                    <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: 6 }}>📋 Thông tin tài khoản nhận hoàn tiền:</div>
                                    {returnItem.bank_account ? (
                                        <>
                                            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                                                <span style={{ color: '#6b7280', minWidth: 80 }}>STK:</span>
                                                <span style={{ fontWeight: 600, color: '#111827' }}>{returnItem.bank_account}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <span style={{ color: '#6b7280', minWidth: 80 }}>Ngân hàng:</span>
                                                <span style={{ fontWeight: 600, color: '#111827' }}>{returnItem.bank_name || '—'}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ color: '#f59e0b', fontSize: 12 }}>⚠ Khách hàng chưa cung cấp thông tin tài khoản</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="rm-so-section">
                        <div className="rm-so-section-title">📅 Tiến trình xử lý</div>
                        <div className="rm-timeline">
                            {returnItem.timeline.map((step, i) => (
                                <div
                                    key={i}
                                    className={`rm-timeline-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`}
                                >
                                    <div className="rm-timeline-dot"></div>
                                    <div className="rm-timeline-label">{step.label}</div>
                                    {step.timestamp && (
                                        <div className="rm-timeline-time">{formatDateTime(step.timestamp)}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="rm-so-section">
                        <div className="rm-so-section-title">📝 Ghi chú nội bộ</div>
                        <textarea
                            className="rm-notes-textarea"
                            placeholder="Ghi chú nội bộ (chỉ nhân viên thấy)..."
                            value={notes}
                            onChange={e => handleNoteChange(e.target.value)}
                        />
                        {autoSaved && (
                            <div className="rm-autosave">✓ Đã lưu tự động</div>
                        )}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="rm-slideover-footer">
                    {returnItem.return_status === 'Chờ duyệt' && (
                        <>
                            <button
                                className="rm-btn rm-btn-success"
                                onClick={() => onApprove(returnItem)}
                            >
                                ✅ Duyệt yêu cầu
                            </button>
                            <button
                                className="rm-btn rm-btn-danger-outline"
                                onClick={() => onReject(returnItem)}
                            >
                                ❌ Từ chối
                            </button>
                        </>
                    )}
                    {returnItem.return_status === 'Đã duyệt' && (
                        <button
                            className="rm-btn rm-btn-primary"
                            onClick={() => onStatusChange(returnItem.return_id, 'Đã nhận hàng')}
                        >
                            📦 Xác nhận đã nhận hàng
                        </button>
                    )}
                    {returnItem.return_status === 'Đã nhận hàng' && (
                        <button
                            className="rm-btn rm-btn-success"
                            onClick={() => onStatusChange(returnItem.return_id, 'Hoàn tiền')}
                        >
                            💰 Xác nhận hoàn tiền ({formatVND(refundTotal)})
                        </button>
                    )}
                    {(returnItem.return_status === 'Hoàn tiền' || returnItem.return_status === 'Từ chối') && (
                        <button className="rm-btn rm-btn-outline" onClick={onPrint}>
                            🖨 In phiếu trả hàng
                        </button>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImg && (
                <div className="rm-lightbox" onClick={() => setLightboxImg(null)}>
                    <img src={lightboxImg} alt="Ảnh minh chứng" />
                </div>
            )}
        </>
    );
};

export default ReturnDetailSlideOver;

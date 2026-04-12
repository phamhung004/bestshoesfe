import React, { useEffect, useMemo, useState } from 'react';
import {
    RETURN_STATUS_CONFIG, REASON_CONFIG, REFUND_METHODS,
    formatVND, formatDateTime, getInitials,
} from './mockReturns';
import { updateReturnRefundMethod } from '../../../../api/returnApi';
import { getVietQrUrl, findBankByName } from '../../../../constants/bankConstants';
import ConfirmDialog from '../../../../components/common/ConfirmDialog';

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
    onInspect,
}) => {
    const [notes, setNotes] = useState(returnItem?.notes || '');
    const [autoSaved, setAutoSaved] = useState(false);
    const [lightboxImg, setLightboxImg] = useState(null);
    const [refundMethod, setRefundMethod] = useState(returnItem?.refund_method || returnItem?.refundMethod || '');
    const [savingMethod, setSavingMethod] = useState(false);
    const [methodSaved, setMethodSaved] = useState(false);
    const [qrError, setQrError] = useState(false);
    const [inspectionRows, setInspectionRows] = useState([]);
    const [inspectionErrors, setInspectionErrors] = useState({});
    const [confirmState, setConfirmState] = useState({
        open: false,
        title: 'Xác nhận',
        message: '',
        confirmText: 'Xác nhận',
        cancelText: 'Hủy',
        variant: 'primary',
        onConfirm: null,
    });

    // Bank info — API may return snake_case or camelCase
    const bankAccount = returnItem?.bank_account || returnItem?.bankAccount || null;
    const bankName = returnItem?.bank_name || returnItem?.bankName || null;

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

    useEffect(() => {
        const rows = (returnItem?.items || []).map((item) => ({
            returnItemId: item.return_item_id,
            quantity: Number(item.quantity || 0),
            restockedQty: Number(item.restocked_qty || 0),
            scrappedQty: Number(item.scrapped_qty || 0),
            inspectionNote: item.inspection_note || '',
        }));
        setInspectionRows(rows);
        setInspectionErrors({});
    }, [returnItem]);

    const inspectionErrorCount = useMemo(() => Object.keys(inspectionErrors).length, [inspectionErrors]);

    const displayTimeline = useMemo(() => {
        const ordered = ['Chờ duyệt', 'Đã duyệt', 'Đã nhận hàng', 'Đã kiểm định', 'Hoàn tiền'];
        const statusIndex = ordered.indexOf(returnItem?.return_status);

        const apiTimeline = Array.isArray(returnItem?.timeline) ? returnItem.timeline : [];
        const hasUsefulApiTimeline = apiTimeline.length > 0 && apiTimeline.some((s) => s?.completed || s?.current || s?.timestamp);

        if (hasUsefulApiTimeline) {
            const normalizedApi = apiTimeline.map((s) => ({
                label: s?.label,
                completed: !!s?.completed,
                current: !!s?.current,
                timestamp: s?.timestamp || null,
            }));

            // If API timeline appears stale vs current status, fallback to status-based timeline
            const apiCurrentIndex = normalizedApi.findIndex((s) => s.current);
            if (statusIndex >= 0 && apiCurrentIndex >= 0 && apiCurrentIndex !== statusIndex) {
                // continue to fallback below
            } else {
                return normalizedApi;
            }
        }

        return ordered.map((label, idx) => ({
            label,
            completed: statusIndex >= 0 ? idx <= statusIndex : idx === 0,
            current: statusIndex >= 0 ? idx === statusIndex : idx === 0,
            timestamp: idx === 0 ? (returnItem?.created_at || null) : null,
        }));
    }, [returnItem]);

    const openLocalConfirm = (options) => {
        setConfirmState({
            open: true,
            title: options.title || 'Xác nhận',
            message: options.message || 'Bạn có chắc chắn muốn tiếp tục?',
            confirmText: options.confirmText || 'Xác nhận',
            cancelText: options.cancelText || 'Hủy',
            variant: options.variant || 'primary',
            onConfirm: options.onConfirm || null,
        });
    };

    const closeLocalConfirm = () => {
        setConfirmState((prev) => ({ ...prev, open: false, onConfirm: null }));
    };

    const updateInspectionRow = (returnItemId, field, value) => {
        setInspectionRows((prev) => prev.map((row) => {
            if (row.returnItemId !== returnItemId) return row;
            return {
                ...row,
                [field]: field === 'inspectionNote' ? value : Math.max(0, Number(value || 0)),
            };
        }));
    };

    const validateInspection = () => {
        const nextErrors = {};
        inspectionRows.forEach((row) => {
            if (row.restockedQty < 0 || row.scrappedQty < 0) {
                nextErrors[row.returnItemId] = 'Số lượng không được âm';
                return;
            }
            if (Number(row.restockedQty) + Number(row.scrappedQty) !== Number(row.quantity)) {
                nextErrors[row.returnItemId] = `Tổng nhập kho + hỏng phải bằng ${row.quantity}`;
            }
        });
        setInspectionErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleInspectSubmit = async () => {
        if (!onInspect) return;
        const ok = validateInspection();
        if (!ok) return;
        const payload = {
            items: inspectionRows.map((row) => ({
                returnItemId: row.returnItemId,
                restockedQty: Number(row.restockedQty || 0),
                scrappedQty: Number(row.scrappedQty || 0),
                inspectionNote: row.inspectionNote || '',
            })),
        };

        openLocalConfirm({
            title: 'Xác nhận lưu kiểm định',
            message: 'Bạn có chắc muốn lưu kiểm định? Hệ thống sẽ chuyển sang trạng thái "Đã kiểm định".',
            confirmText: 'Lưu kiểm định',
            cancelText: 'Hủy',
            variant: 'primary',
            onConfirm: async () => {
                closeLocalConfirm();
                await onInspect(returnItem.return_id, payload);
            },
        });
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

                    {/* Inspection */}
                    {returnItem.return_status === 'Đã nhận hàng' && (
                        <div className="rm-so-section">
                            <div className="rm-so-section-title">🧪 Kiểm định hàng trả</div>
                            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 10 }}>
                                Nhập đúng số lượng: Nhập kho + Hỏng = Số lượng trả.
                            </div>
                            {(returnItem.items || []).map((item) => {
                                const row = inspectionRows.find((r) => r.returnItemId === item.return_item_id);
                                const err = inspectionErrors[item.return_item_id];
                                return (
                                    <div key={item.return_item_id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 6 }}>{item.product?.name}</div>
                                        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
                                            Size {item.size?.size_name} • {item.color?.color_name} • SL trả: {item.quantity}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                                            <div>
                                                <label style={{ fontSize: 12, color: '#6B7280' }}>Nhập lại kho</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="rm-method-select"
                                                    value={row?.restockedQty ?? 0}
                                                    onChange={(e) => updateInspectionRow(item.return_item_id, 'restockedQty', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: 12, color: '#6B7280' }}>Hàng hỏng</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="rm-method-select"
                                                    value={row?.scrappedQty ?? 0}
                                                    onChange={(e) => updateInspectionRow(item.return_item_id, 'scrappedQty', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, color: '#6B7280' }}>Ghi chú kiểm định</label>
                                            <input
                                                type="text"
                                                className="rm-method-select"
                                                value={row?.inspectionNote ?? ''}
                                                onChange={(e) => updateInspectionRow(item.return_item_id, 'inspectionNote', e.target.value)}
                                                placeholder="VD: Trầy đế"
                                            />
                                        </div>
                                        {err && <div style={{ color: '#DC2626', fontSize: 12, marginTop: 6 }}>⚠ {err}</div>}
                                    </div>
                                );
                            })}
                            {inspectionErrorCount > 0 && (
                                <div style={{ color: '#DC2626', fontSize: 12 }}>
                                    Có {inspectionErrorCount} dòng chưa hợp lệ.
                                </div>
                            )}
                        </div>
                    )}

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
                                    <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: 8 }}>📋 Thông tin tài khoản nhận hoàn tiền:</div>
                                    {bankAccount ? (
                                        <>
                                            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                                                <span style={{ color: '#6b7280', minWidth: 90 }}>STK:</span>
                                                <span style={{ fontWeight: 600, color: '#111827' }}>{bankAccount}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                                                <span style={{ color: '#6b7280', minWidth: 90 }}>Ngân hàng:</span>
                                                <span style={{ fontWeight: 600, color: '#111827' }}>{bankName || '—'}</span>
                                            </div>
                                            {/* VietQR code */}
                                            {(() => {
                                                const bank = findBankByName(bankName);
                                                if (!bank) return null;
                                                const qrUrl = getVietQrUrl(bank.bin, bankAccount, Math.round(refundTotal), `Hoan tien ${returnItem?.return_code || ''}`);
                                                return (
                                                    <div style={{ textAlign: 'center' }}>
                                                        {!qrError ? (
                                                            <img
                                                                src={qrUrl}
                                                                alt="VietQR"
                                                                onError={() => setQrError(true)}
                                                                style={{ width: 180, height: 'auto', borderRadius: 8, border: '1px solid #bae6fd' }}
                                                            />
                                                        ) : (
                                                            <div style={{ fontSize: 12, color: '#9ca3af' }}>Không tải được mã QR</div>
                                                        )}
                                                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Quét QR để chuyển khoản hoàn tiền</div>
                                                    </div>
                                                );
                                            })()}
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
                            {displayTimeline.map((step, i) => (
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
                                onClick={() => {
                                    openLocalConfirm({
                                        title: 'Xác nhận duyệt yêu cầu',
                                        message: 'Bạn có chắc muốn duyệt yêu cầu trả hàng này?',
                                        confirmText: 'Duyệt',
                                        cancelText: 'Hủy',
                                        variant: 'primary',
                                        onConfirm: async () => {
                                            closeLocalConfirm();
                                            await onApprove(returnItem);
                                        },
                                    });
                                }}
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
                            onClick={() => {
                                openLocalConfirm({
                                    title: 'Xác nhận đã nhận hàng',
                                    message: 'Bạn có chắc đã nhận hàng về kho?',
                                    confirmText: 'Xác nhận',
                                    cancelText: 'Hủy',
                                    variant: 'primary',
                                    onConfirm: async () => {
                                        closeLocalConfirm();
                                        await onStatusChange(returnItem.return_id, 'Đã nhận hàng');
                                    },
                                });
                            }}
                        >
                            📦 Xác nhận đã nhận hàng
                        </button>
                    )}
                    {returnItem.return_status === 'Đã nhận hàng' && (
                        <button
                            className="rm-btn rm-btn-primary"
                            onClick={handleInspectSubmit}
                        >
                            🧪 Lưu kiểm định
                        </button>
                    )}
                    {returnItem.return_status === 'Đã kiểm định' && (
                        <button
                            className="rm-btn rm-btn-success"
                            onClick={() => {
                                openLocalConfirm({
                                    title: 'Xác nhận hoàn tiền',
                                    message: `Bạn có chắc muốn xác nhận hoàn tiền ${formatVND(refundTotal)}?`,
                                    confirmText: 'Xác nhận hoàn tiền',
                                    cancelText: 'Hủy',
                                    variant: 'primary',
                                    onConfirm: async () => {
                                        closeLocalConfirm();
                                        await onStatusChange(returnItem.return_id, 'Hoàn tiền');
                                    },
                                });
                            }}
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

            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                cancelText={confirmState.cancelText}
                variant={confirmState.variant}
                align="right"
                onCancel={closeLocalConfirm}
                onConfirm={async () => {
                    if (confirmState.onConfirm) await confirmState.onConfirm();
                }}
            />

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

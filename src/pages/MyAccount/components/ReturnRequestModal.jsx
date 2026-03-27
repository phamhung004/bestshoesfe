import React, { useState, useRef } from 'react';
import { X, Upload, Loader, AlertCircle } from 'lucide-react';
import { formatVND } from '../mockAccountData';
import { RETURN_REASONS, MAX_RETURN_IMAGES, RETURN_WINDOW_DAYS, REASON_TO_CATEGORY } from '../../../constants/returnConstants';
import { VIETNAM_BANKS } from '../../../constants/bankConstants';
import { uploadReturnImages, createReturnRequest } from '../../../api/returnApi';

const STEPS = [
    { id: 1, label: 'Chọn sản phẩm' },
    { id: 2, label: 'Lý do & Ảnh' },
    { id: 3, label: 'Hoàn tiền' },
    { id: 4, label: 'Xác nhận' },
];

const REFUND_METHODS = [
    { value: 'Tiền mặt', label: 'Tiền mặt', icon: '💵', desc: 'Nhận tiền mặt khi trả hàng' },
    { value: 'Chuyển khoản', label: 'Chuyển khoản', icon: '🏦', desc: 'Hoàn tiền qua tài khoản ngân hàng' },
];

const ReturnRequestModal = ({ order, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);

    // Step 1 — item selection
    const [selectedItems, setSelectedItems] = useState(
        (order.items || []).map(item => ({ ...item, selected: false, returnQty: 1 }))
    );

    // Step 2 — reason & images
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [imageFiles, setImageFiles] = useState([]); // [{file, preview, url, uploading, error}]
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Submit
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const checkedItems = selectedItems.filter(i => i.selected);
    const uploadedUrls = imageFiles.filter(f => f.url).map(f => f.url);
    const anyUploading = imageFiles.some(f => f.uploading);

    // Coupon-aware refund calculation (matches backend paymentRatio logic)
    const paymentRatio = (order.couponDiscountAmount && order.subtotal && order.subtotal > 0)
        ? (order.subtotal - order.couponDiscountAmount) / order.subtotal
        : 1;
    const hasCoupon = paymentRatio < 1;
    const totalRefundRaw = checkedItems.reduce((sum, i) => sum + (i.unitPrice || 0) * (i.returnQty || 1), 0);
    const totalRefund = Math.floor(totalRefundRaw * paymentRatio);

    // Refund method selection
    const defaultRefundMethod = !['Tiền mặt', 'COD', 'cod', 'cash', 'Cash'].includes(order.paymentMethod)
        ? 'Chuyển khoản' : 'Tiền mặt';
    const [refundMethod, setRefundMethod] = useState(defaultRefundMethod);
    const isBankTransfer = refundMethod === 'Chuyển khoản';
    const [bankAccount, setBankAccount] = useState('');
    const [bankName, setBankName] = useState('');

    // Calculate days since delivery
    const daysSince = order.updatedAt
        ? Math.floor((Date.now() - new Date(order.updatedAt)) / 86400000)
        : 0;
    const withinWindow = daysSince <= RETURN_WINDOW_DAYS;

    // ── Handlers ────────────────────────────────────────────────
    const toggleItem = (id) => {
        setSelectedItems(prev => prev.map(i =>
            i.orderItemId === id ? { ...i, selected: !i.selected } : i
        ));
    };

    const changeQty = (id, delta) => {
        setSelectedItems(prev => prev.map(i => {
            if (i.orderItemId !== id) return i;
            const next = Math.min(Math.max(1, (i.returnQty || 1) + delta), i.quantity);
            return { ...i, returnQty: next };
        }));
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const remaining = MAX_RETURN_IMAGES - imageFiles.length;
        const toProcess = files.slice(0, remaining);

        const previews = toProcess.map(f => ({
            file: f,
            preview: URL.createObjectURL(f),
            url: null,
            uploading: true,
            error: null,
        }));
        setImageFiles(prev => [...prev, ...previews]);
        setUploading(true);

        const formData = new FormData();
        toProcess.forEach(f => formData.append('files', f));
        try {
            const res = await uploadReturnImages(formData);
            const urls = res.data || [];
            setImageFiles(prev => {
                const updated = [...prev];
                const start = updated.length - toProcess.length;
                urls.forEach((url, i) => {
                    if (updated[start + i]) updated[start + i] = { ...updated[start + i], url, uploading: false };
                });
                return updated;
            });
        } catch {
            setImageFiles(prev => {
                const updated = [...prev];
                const start = updated.length - toProcess.length;
                for (let i = start; i < updated.length; i++) {
                    updated[i] = { ...updated[i], uploading: false, error: 'Lỗi upload' };
                }
                return updated;
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (idx) => {
        setImageFiles(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[idx].preview);
            updated.splice(idx, 1);
            return updated;
        });
    };

    // ── Validation & Navigation ──────────────────────────────────
    const handleNext = () => {
        setError('');
        if (step === 1) {
            if (checkedItems.length === 0) { setError('Vui lòng chọn ít nhất 1 sản phẩm cần trả'); return; }
        }
        if (step === 2) {
            if (!reason.trim()) { setError('Vui lòng chọn lý do trả hàng'); return; }
            if (uploadedUrls.length === 0) { setError('Vui lòng tải lên ít nhất 1 ảnh bằng chứng'); return; }
            if (anyUploading) { setError('Đang tải ảnh lên, vui lòng chờ...'); return; }
        }
        if (step === 3) {
            if (!refundMethod) { setError('Vui lòng chọn hình thức hoàn tiền'); return; }
            if (isBankTransfer && !bankAccount.trim()) { setError('Vui lòng nhập số tài khoản ngân hàng để nhận hoàn tiền'); return; }
            if (isBankTransfer && !bankName) { setError('Vui lòng chọn ngân hàng'); return; }
        }
        setStep(s => s + 1);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            await createReturnRequest({
                orderNumber: order.orderNumber,
                items: checkedItems.map(i => ({ orderItemId: i.orderItemId, quantity: i.returnQty })),
                returnReason: reason,
                returnReasonCategory: REASON_TO_CATEGORY[reason] || 'OTHER',
                description: description.trim() || undefined,
                imageUrls: uploadedUrls,
                refundMethod,
                bankAccount: isBankTransfer ? bankAccount.trim() : undefined,
                bankName: isBankTransfer ? bankName.trim() : undefined,
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

    // ── Render ──────────────────────────────────────────────────
    return (
        <div className="acc-modal-backdrop" onClick={handleBackdrop}>
            <div className="acc-modal-card acc-modal-lg" style={{ maxWidth: 640, overflow: 'hidden' }}>
                {/* Header */}
                <div className="acc-modal-header">
                    <div>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>Yêu cầu trả hàng</h3>
                        <p className="acc-modal-sub">Đơn #{order.orderNumber} · Còn {Math.max(0, RETURN_WINDOW_DAYS - daysSince)} ngày trong thời hạn</p>
                    </div>
                    <button className="acc-modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                {/* Step Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px 0', gap: 6 }}>
                    {STEPS.map((s, idx) => (
                        <React.Fragment key={s.id}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                    width: 26, height: 26, borderRadius: '50%', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                                    background: step > s.id ? '#22c55e' : step === s.id ? '#111827' : '#e5e7eb',
                                    color: step >= s.id ? '#fff' : '#6b7280', transition: 'all .2s',
                                }}>
                                    {step > s.id ? '✓' : s.id}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: step === s.id ? 600 : 400, color: step === s.id ? '#111827' : '#9ca3af' }}>
                                    {s.label}
                                </span>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: step > s.id ? '#22c55e' : '#e5e7eb', borderRadius: 2, minWidth: 20 }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Body */}
                <div className="acc-modal-body" style={{ minHeight: 200, maxHeight: 'calc(90vh - 180px)', overflowY: 'auto' }}>

                    {/* ── Step 1: Select items ── */}
                    {step === 1 && (
                        <div>
                            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                                Chọn sản phẩm muốn trả và nhập số lượng:
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {selectedItems.map(item => (
                                    <div
                                        key={item.orderItemId}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                                            borderRadius: 10, border: '1.5px solid', cursor: 'pointer',
                                            borderColor: item.selected ? '#111827' : '#e5e7eb',
                                            background: item.selected ? '#f9fafb' : '#fff', transition: 'all .15s',
                                        }}
                                        onClick={() => toggleItem(item.orderItemId)}
                                    >
                                        <input
                                            type="checkbox" checked={item.selected}
                                            onChange={() => toggleItem(item.orderItemId)}
                                            onClick={e => e.stopPropagation()}
                                            style={{ width: 18, height: 18, accentColor: '#111827', flexShrink: 0, cursor: 'pointer' }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {item.productName}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#6b7280' }}>
                                                {item.variant} · Đã mua: {item.quantity}
                                            </div>
                                        </div>
                                        <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                            {hasCoupon ? (
                                                <div style={{ marginBottom: 4 }}>
                                                    <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>
                                                        {formatVND(item.unitPrice)}
                                                    </div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>
                                                        {formatVND(Math.floor(item.unitPrice * paymentRatio))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                                                    {formatVND(item.unitPrice)}
                                                </div>
                                            )}
                                            {item.selected && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                                                    <button
                                                        style={{ width: 24, height: 24, borderRadius: 6, border: '1.5px solid #d1d5db', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
                                                        onClick={() => changeQty(item.orderItemId, -1)}
                                                        disabled={item.returnQty <= 1}
                                                    >−</button>
                                                    <span style={{ fontSize: 14, fontWeight: 600, minWidth: 18, textAlign: 'center' }}>{item.returnQty}</span>
                                                    <button
                                                        style={{ width: 24, height: 24, borderRadius: 6, border: '1.5px solid #d1d5db', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
                                                        onClick={() => changeQty(item.orderItemId, 1)}
                                                        disabled={item.returnQty >= item.quantity}
                                                    >+</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {checkedItems.length > 0 && (
                                <div style={{ marginTop: 14, padding: '10px 14px', background: '#f3f4f6', borderRadius: 8, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span>Dự kiến hoàn: <strong style={{ color: '#16a34a' }}>{formatVND(totalRefund)}</strong></span>
                                        {checkedItems.length < selectedItems.length && (
                                            <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>⚠ Trả một phần</span>
                                        )}
                                    </div>
                                    {hasCoupon && (
                                        <div style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '4px 8px' }}>
                                            💡 Đơn hàng đã dùng mã giảm giá {order.couponCode ? `"${order.couponCode}"` : ''} (-{formatVND(order.couponDiscountAmount)}). Số tiền hoàn đã được điều chỉnh tương ứng.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 2: Reason + Images ── */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Reason */}
                            <div>
                                <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'block' }}>
                                    Lý do trả hàng <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {RETURN_REASONS.map(r => (
                                        <label key={r} style={{
                                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                            borderRadius: 8, border: '1.5px solid', cursor: 'pointer',
                                            borderColor: reason === r ? '#111827' : '#e5e7eb',
                                            background: reason === r ? '#f9fafb' : '#fff',
                                            fontSize: 14, fontWeight: reason === r ? 600 : 400, transition: 'all .15s',
                                        }}>
                                            <input
                                                type="radio" name="returnReason" value={r}
                                                checked={reason === r} onChange={() => setReason(r)}
                                                style={{ accentColor: '#111827' }}
                                            />
                                            {r}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: 'block' }}>
                                    Mô tả thêm <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 12 }}>(tùy chọn)</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Mô tả chi tiết vấn đề gặp phải..."
                                    rows={3}
                                    style={{
                                        width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb',
                                        fontSize: 14, resize: 'vertical', fontFamily: 'inherit', outline: 'none',
                                        boxSizing: 'border-box', transition: 'border-color .15s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#111827'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'block' }}>
                                    Ảnh bằng chứng <span style={{ color: '#ef4444' }}>*</span>
                                    <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6, fontSize: 12 }}>
                                        ({imageFiles.length}/{MAX_RETURN_IMAGES})
                                    </span>
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                    {imageFiles.map((img, idx) => (
                                        <div key={idx} style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1.5px solid #e5e7eb', position: 'relative', flexShrink: 0 }}>
                                            <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            {img.uploading && (
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Loader size={18} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                                                </div>
                                            )}
                                            {img.error && (
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                                                    <AlertCircle size={18} color="#fff" />
                                                    <span style={{ fontSize: 9, color: '#fff' }}>Lỗi</span>
                                                </div>
                                            )}
                                            {!img.uploading && !img.error && img.url && (
                                                <button
                                                    onClick={() => removeImage(idx)}
                                                    style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.65)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >×</button>
                                            )}
                                        </div>
                                    ))}
                                    {imageFiles.length < MAX_RETURN_IMAGES && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            style={{ width: 80, height: 80, borderRadius: 8, border: '1.5px dashed #d1d5db', background: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'not-allowed' : 'pointer', gap: 4, color: '#9ca3af', fontSize: 12, flexShrink: 0, opacity: uploading ? 0.6 : 1 }}
                                        >
                                            <Upload size={20} />
                                            <span>Thêm ảnh</span>
                                        </button>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
                                <p style={{ marginTop: 6, fontSize: 12, color: '#9ca3af' }}>
                                    Ảnh chụp rõ sản phẩm bị lỗi hoặc sai so với mô tả. Tối đa {MAX_RETURN_IMAGES} ảnh.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Refund Method ── */}
                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Refund method selection */}
                            <div>
                                <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, display: 'block' }}>
                                    Hình thức hoàn tiền <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {REFUND_METHODS.map(m => (
                                        <label key={m.value} style={{
                                            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                                            borderRadius: 10, border: '1.5px solid', cursor: 'pointer',
                                            borderColor: refundMethod === m.value ? '#111827' : '#e5e7eb',
                                            background: refundMethod === m.value ? '#f9fafb' : '#fff',
                                            transition: 'all .15s',
                                        }}>
                                            <input
                                                type="radio" name="refundMethod" value={m.value}
                                                checked={refundMethod === m.value}
                                                onChange={() => setRefundMethod(m.value)}
                                                style={{ accentColor: '#111827' }}
                                            />
                                            <span style={{ fontSize: 20 }}>{m.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: refundMethod === m.value ? 700 : 500, fontSize: 14, color: '#111827' }}>{m.label}</div>
                                                <div style={{ fontSize: 12, color: '#9ca3af' }}>{m.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Banking info (required for bank transfer) */}
                            {isBankTransfer && (
                                <div style={{ padding: '14px 16px', background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: 10 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0369a1', marginBottom: 12 }}>
                                        🏦 Thông tin tài khoản nhận hoàn tiền <span style={{ color: '#ef4444' }}>*</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div>
                                            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Số tài khoản *</label>
                                            <input
                                                type="text"
                                                value={bankAccount}
                                                onChange={e => setBankAccount(e.target.value)}
                                                placeholder="VD: 0123456789"
                                                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #bae6fd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Ngân hàng *</label>
                                            <select
                                                value={bankName}
                                                onChange={e => setBankName(e.target.value)}
                                                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #bae6fd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', background: 'white', cursor: 'pointer' }}
                                            >
                                                <option value="">-- Chọn ngân hàng --</option>
                                                {VIETNAM_BANKS.map(b => (
                                                    <option key={b.bin} value={b.name}>{b.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <p style={{ marginTop: 8, fontSize: 12, color: '#0369a1' }}>Hoàn tiền sẽ được chuyển vào tài khoản trên sau khi đơn hàng được xác nhận hoàn.</p>
                                </div>
                            )}

                            {/* Refund summary */}
                            <div style={{ padding: '12px 14px', background: '#f3f4f6', borderRadius: 8, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Dự kiến hoàn tiền:</span>
                                <span style={{ fontWeight: 700, color: '#16a34a', fontSize: 16 }}>{formatVND(totalRefund)}</span>
                            </div>
                        </div>
                    )}

                    {/* ── Step 4: Confirmation ── */}
                    {step === 4 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Items summary */}
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#374151' }}>Sản phẩm trả hàng</p>
                                {checkedItems.map(item => {
                                    const rawTotal = (item.unitPrice || 0) * (item.returnQty || 1);
                                    const refundTotal = Math.floor(rawTotal * paymentRatio);
                                    return (
                                        <div key={item.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
                                            <div>
                                                <span style={{ fontWeight: 500, color: '#111827' }}>{item.productName}</span>
                                                <span style={{ color: '#9ca3af', marginLeft: 8, fontSize: 12 }}>
                                                    {item.variant} × {item.returnQty}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                {hasCoupon && (
                                                    <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>{formatVND(rawTotal)}</div>
                                                )}
                                                <span style={{ fontWeight: 600, color: hasCoupon ? '#16a34a' : '#111827' }}>{formatVND(refundTotal)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Summary box */}
                            <div style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: 10, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Lý do trả hàng</span>
                                    <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: 240 }}>{reason}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Hình thức hoàn tiền</span>
                                    <span style={{ fontWeight: 600 }}>{refundMethod}</span>
                                </div>
                                {isBankTransfer && bankAccount && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#6b7280' }}>Tài khoản nhận</span>
                                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{bankAccount} — {bankName}</span>
                                    </div>
                                )}
                                {hasCoupon && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#6b7280' }}>Mã giảm giá đã dùng</span>
                                        <span style={{ fontWeight: 600, color: '#d97706' }}>{order.couponCode || 'Có'} (-{formatVND(order.couponDiscountAmount)})</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #e5e7eb' }}>
                                    <span style={{ fontWeight: 700, fontSize: 15 }}>Dự kiến hoàn tiền</span>
                                    <span style={{ fontWeight: 700, color: '#16a34a', fontSize: 16 }}>{formatVND(totalRefund)}</span>
                                </div>
                            </div>

                            {/* Images preview */}
                            <div>
                                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#374151' }}>Ảnh bằng chứng</p>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {imageFiles.filter(f => f.url).map((img, idx) => (
                                        <img key={idx} src={img.preview} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e5e7eb' }} />
                                    ))}
                                </div>
                            </div>

                            {/* Notice */}
                            <div style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                                📋 Sau khi gửi, yêu cầu sẽ được admin xem xét trong 1–3 ngày làm việc. Bạn sẽ thấy tiến trình ở tab "Yêu cầu trả hàng".
                            </div>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div style={{ margin: '0 24px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>
                        {error}
                    </div>
                )}

                {/* Footer */}
                <div className="acc-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <button
                        className="acc-btn-outline-sm"
                        style={{ padding: '8px 20px', fontSize: 14 }}
                        onClick={step === 1 ? onClose : () => { setError(''); setStep(s => s - 1); }}
                        disabled={submitting}
                    >
                        {step === 1 ? 'Hủy' : '← Quay lại'}
                    </button>
                    {step < 4 ? (
                        <button className="acc-btn-primary" style={{ padding: '8px 24px', fontSize: 14 }} onClick={handleNext}>
                            Tiếp theo →
                        </button>
                    ) : (
                        <button
                            className="acc-btn-primary"
                            style={{ padding: '8px 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                            {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReturnRequestModal;

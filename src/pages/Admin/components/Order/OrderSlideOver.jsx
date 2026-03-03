import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatVND } from '../../../../utils/formatPrice';
import {
    formatDate, getInitials,
} from './orderHelpers';
import { STATUS_CONFIG, PAYMENT_CONFIG, ALL_STATUSES, getValidNextStatuses, isTerminalStatus } from './orderConstants';
import { useProvinces } from '../../../../hooks/useProvinces';
import { shippingApi } from '../../../../api/shippingApi';

/**
 * OrderSlideOver: right drawer showing full order details
 * Props:
 *  - order: normalized order object from API (null = hidden)
 *  - onClose: () => void
 *  - onStatusChange: (orderId, newStatus) => void
 *  - onCopyOrderNum: (orderNumber) => void
 *  - onCancelOrder: (order) => void
 *  - onPrintOrder: (order) => void
 */
const OrderSlideOver = ({
    order,
    onClose,
    onStatusChange,
    onCopyOrderNum,
    onCancelOrder,
    onPrintOrder,
    onAddressUpdate,
    onItemsUpdate,
}) => {
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [saved, setSaved] = useState(false);
    const saveTimeout = useRef(null);

    // ── Address edit state ────────────────────────────────────
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [addressForm, setAddressForm] = useState({
        shippingProvince: '',
        shippingDistrict: '',
        shippingWard: '',
        shippingAddress: '',
        ghnProvinceId: '',
        ghnDistrictId: '',
        ghnWardCode: '',
    });
    const [newShippingFee, setNewShippingFee] = useState(null);
    const [loadingFee, setLoadingFee] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);

    const {
        provinces, districts, wards,
        loadingProvinces, loadingDistricts, loadingWards,
        fetchProvinces, fetchDistricts, fetchWards,
    } = useProvinces();

    // Fetch provinces when edit mode opens
    useEffect(() => {
        if (isEditingAddress) {
            fetchProvinces();
        }
    }, [isEditingAddress, fetchProvinces]);

    // Reset edit state when order changes
    useEffect(() => {
        setIsEditingAddress(false);
        setNewShippingFee(null);
    }, [order?.order_id]);

    const handleStartEdit = useCallback(() => {
        setAddressForm({
            shippingProvince: order.shipping_province || '',
            shippingDistrict: order.shipping_district || '',
            shippingWard: order.shipping_ward || '',
            shippingAddress: order.shipping_address || '',
            ghnProvinceId: order.ghn_province_id || '',
            ghnDistrictId: order.ghn_district_id || '',
            ghnWardCode: order.ghn_ward_code || '',
        });
        setNewShippingFee(null);
        setIsEditingAddress(true);
    }, [order]);

    const handleCancelEdit = useCallback(() => {
        setIsEditingAddress(false);
        setNewShippingFee(null);
    }, []);

    const handleProvinceChange = useCallback((e) => {
        const selected = provinces.find((p) => String(p.code) === e.target.value);
        setAddressForm((prev) => ({
            ...prev,
            ghnProvinceId: e.target.value,
            shippingProvince: selected ? selected.name : '',
            ghnDistrictId: '',
            shippingDistrict: '',
            ghnWardCode: '',
            shippingWard: '',
        }));
        setNewShippingFee(null);
        if (e.target.value) fetchDistricts(e.target.value);
    }, [provinces, fetchDistricts]);

    const handleDistrictChange = useCallback((e) => {
        const selected = districts.find((d) => String(d.code) === e.target.value);
        setAddressForm((prev) => ({
            ...prev,
            ghnDistrictId: e.target.value,
            shippingDistrict: selected ? selected.name : '',
            ghnWardCode: '',
            shippingWard: '',
        }));
        setNewShippingFee(null);
        if (e.target.value) fetchWards(e.target.value);
    }, [districts, fetchWards]);

    const handleWardChange = useCallback(async (e) => {
        const selected = wards.find((w) => w.code === e.target.value);
        const newForm = {
            ...addressForm,
            ghnWardCode: e.target.value,
            shippingWard: selected ? selected.name : '',
        };
        setAddressForm(newForm);

        // Auto-calculate fee preview
        if (newForm.ghnDistrictId && e.target.value) {
            setLoadingFee(true);
            setNewShippingFee(null);
            try {
                const res = await shippingApi.calculateFee({
                    toDistrictId: Number(newForm.ghnDistrictId),
                    toWardCode: e.target.value,
                });
                const total = res?.data?.data?.total ?? res?.data?.total;
                setNewShippingFee(total ?? null);
            } catch {
                setNewShippingFee(null);
            } finally {
                setLoadingFee(false);
            }
        }
    }, [addressForm, wards]);

    const handleSaveAddress = useCallback(async () => {
        if (!addressForm.shippingProvince || !addressForm.shippingDistrict
            || !addressForm.shippingWard || !addressForm.shippingAddress.trim()) {
            return;
        }
        setSavingAddress(true);
        try {
            await onAddressUpdate(order.order_id, {
                shippingProvince: addressForm.shippingProvince,
                shippingDistrict: addressForm.shippingDistrict,
                shippingWard: addressForm.shippingWard,
                shippingAddress: addressForm.shippingAddress.trim(),
                ghnDistrictId: addressForm.ghnDistrictId ? Number(addressForm.ghnDistrictId) : null,
                ghnWardCode: addressForm.ghnWardCode || null,
            });
            setIsEditingAddress(false);
            setNewShippingFee(null);
        } catch {
            // error toast handled by parent
        } finally {
            setSavingAddress(false);
        }
    }, [order, addressForm, onAddressUpdate]);

    // ── Item edit state & handlers ──────────────────────────────────
    const [isEditingItems, setIsEditingItems] = useState(false);
    const [editItems, setEditItems] = useState([]);
    const [savingItems, setSavingItems] = useState(false);

    // Reset item edit when order changes
    useEffect(() => {
        setIsEditingItems(false);
        setEditItems([]);
    }, [order?.order_id]);

    const handleStartEditItems = useCallback(() => {
        setEditItems((order.items || []).map((item) => ({ ...item })));
        setIsEditingItems(true);
    }, [order]);

    const handleCancelEditItems = useCallback(() => {
        setIsEditingItems(false);
        setEditItems([]);
    }, []);

    const handleItemQtyChange = useCallback((orderItemId, delta) => {
        setEditItems((prev) =>
            prev.map((item) =>
                item.order_item_id === orderItemId
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    }, []);

    const handleItemQtyInput = useCallback((orderItemId, value) => {
        const qty = parseInt(value, 10);
        if (!isNaN(qty) && qty >= 1) {
            setEditItems((prev) =>
                prev.map((item) =>
                    item.order_item_id === orderItemId
                        ? { ...item, quantity: qty }
                        : item
                )
            );
        }
    }, []);

    const handleRemoveItem = useCallback((orderItemId) => {
        setEditItems((prev) => prev.filter((item) => item.order_item_id !== orderItemId));
    }, []);

    const handleSaveItems = useCallback(async () => {
        if (editItems.length === 0) return;
        setSavingItems(true);
        try {
            await onItemsUpdate(order.order_id, {
                items: editItems.map((item) => ({
                    orderItemId: item.order_item_id,
                    quantity: item.quantity,
                })),
            });
            setIsEditingItems(false);
            setEditItems([]);
        } catch {
            // error toast handled by parent
        } finally {
            setSavingItems(false);
        }
    }, [order, editItems, onItemsUpdate]);

    // Auto-save notes with debounce
    useEffect(() => {
        if (!notes) return;
        setSaved(false);
        clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => setSaved(true), 1200);
        return () => clearTimeout(saveTimeout.current);
    }, [notes]);

    if (!order) return null;

    const statusCfg = STATUS_CONFIG[order.status] || {};
    const paymentCfg = PAYMENT_CONFIG[order.payment_status] || {};
    const validNextStatuses = getValidNextStatuses(order.status);
    const isTerminal = isTerminalStatus(order.status);

    // Build full address
    const fullAddress = [
        order.shipping_address,
        order.shipping_ward,
        order.shipping_district,
        order.shipping_province,
    ].filter(Boolean).join(', ');

    // Timeline steps and progress
    const timelineSteps = [
        'Đặt hàng',
        'Xác nhận',
        'Đóng gói',
        'Bàn giao ĐVVC',
        'Đang giao',
        'Đã giao',
    ];

    // Map order status to timeline progress index
    const statusProgress = {
        'Chờ xác nhận': 0,
        'Đã xác nhận': 1,
        'Đang giao': 4,
        'Đã giao': 5,
        'Trả hàng/Hoàn tiền': 5,
        'Đã hủy': -1,
    };
    const currentStepIdx = statusProgress[order.status] ?? 0;

    return (
        <>
            {/* Backdrop overlay */}
            <div className="om-overlay" onClick={onClose} />

            {/* Slide-over panel */}
            <div className="om-slideover" role="dialog" aria-label="Chi tiết đơn hàng">
                {/* ── HEADER ── */}
                <div className="om-so-header">
                    <div className="om-so-header-left">
                        <span className="om-so-order-num">#{order.order_number}</span>
                        <button
                            className="om-so-copy-btn"
                            onClick={() => onCopyOrderNum(order.order_number)}
                            aria-label="Sao chép mã đơn"
                            title="Sao chép"
                        >
                            📋
                        </button>

                        {/* Editable status badge */}
                        <div className="om-status-dropdown-wrap">
                            <span
                                className="om-badge"
                                style={{
                                    background: statusCfg.bg,
                                    color: statusCfg.color,
                                    cursor: isTerminal ? 'default' : 'pointer',
                                    opacity: isTerminal ? 0.8 : 1,
                                }}
                                onClick={() => !isTerminal && setStatusDropdownOpen(!statusDropdownOpen)}
                                title={isTerminal ? 'Trạng thái cuối - không thể thay đổi' : 'Click để cập nhật trạng thái'}
                            >
                                <span className="om-badge-dot" style={{ background: statusCfg.color }} />
                                {order.status}
                                {!isTerminal && <span style={{ marginLeft: 4, fontSize: 10 }}>▼</span>}
                            </span>

                            {statusDropdownOpen && validNextStatuses.length > 0 && (
                                <div className="om-status-dropdown">
                                    {validNextStatuses.map((s) => {
                                        const cfg = STATUS_CONFIG[s] || {};
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => {
                                                    onStatusChange(order.order_id, s);
                                                    setStatusDropdownOpen(false);
                                                }}
                                            >
                                                <span
                                                    className="om-badge-dot"
                                                    style={{ background: cfg.color, width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }}
                                                />
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <button className="om-so-close" onClick={onClose} aria-label="Đóng">
                        ✕
                    </button>
                </div>

                {/* ── BODY ── */}
                <div className="om-so-body">
                    {/* Customer info card */}
                    <div className="om-so-card">
                        <h3>Thông tin khách hàng</h3>
                        <div className="om-so-customer">
                            <div className="om-avatar">{getInitials(order.customer_name)}</div>
                            <div className="om-so-customer-details">
                                <strong>{order.customer_name}</strong>
                                <span>📱 {order.customer_phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery address */}
                    <div className="om-so-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <h3 style={{ margin: 0 }}>Địa chỉ giao hàng</h3>
                            {order.status === 'Chờ xác nhận' && !isEditingAddress && (
                                <button
                                    className="om-btn om-btn-outline om-btn-sm"
                                    onClick={handleStartEdit}
                                    style={{ fontSize: 12, padding: '3px 10px' }}
                                >
                                    ✏️ Sửa địa chỉ
                                </button>
                            )}
                        </div>

                        {isEditingAddress ? (
                            <div className="om-so-address-edit">
                                {/* Province */}
                                <div className="om-so-addr-field">
                                    <label>Tỉnh / Thành phố</label>
                                    <select
                                        value={addressForm.ghnProvinceId}
                                        onChange={handleProvinceChange}
                                        disabled={loadingProvinces}
                                    >
                                        <option value="">{loadingProvinces ? 'Đang tải...' : '-- Chọn tỉnh/thành --'}</option>
                                        {provinces.map((p) => (
                                            <option key={p.code} value={p.code}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* District */}
                                <div className="om-so-addr-field">
                                    <label>Quận / Huyện</label>
                                    <select
                                        value={addressForm.ghnDistrictId}
                                        onChange={handleDistrictChange}
                                        disabled={!addressForm.ghnProvinceId || loadingDistricts}
                                    >
                                        <option value="">{loadingDistricts ? 'Đang tải...' : '-- Chọn quận/huyện --'}</option>
                                        {districts.map((d) => (
                                            <option key={d.code} value={d.code}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Ward */}
                                <div className="om-so-addr-field">
                                    <label>Phường / Xã</label>
                                    <select
                                        value={addressForm.ghnWardCode}
                                        onChange={handleWardChange}
                                        disabled={!addressForm.ghnDistrictId || loadingWards}
                                    >
                                        <option value="">{loadingWards ? 'Đang tải...' : '-- Chọn phường/xã --'}</option>
                                        {wards.map((w) => (
                                            <option key={w.code} value={w.code}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Street address */}
                                <div className="om-so-addr-field">
                                    <label>Số nhà / Đường</label>
                                    <input
                                        type="text"
                                        placeholder="VD: 123 Nguyễn Huệ"
                                        value={addressForm.shippingAddress}
                                        onChange={(e) => setAddressForm((prev) => ({ ...prev, shippingAddress: e.target.value }))}
                                    />
                                </div>

                                {/* Shipping fee preview */}
                                {loadingFee && (
                                    <div className="om-so-fee-preview" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                                        ⏳ Đang tính phí vận chuyển...
                                    </div>
                                )}
                                {!loadingFee && newShippingFee !== null && (
                                    <div className="om-so-fee-preview" style={{ color: 'var(--success-600)', fontSize: 13, fontWeight: 600 }}>
                                        🚚 Phí ship mới: {formatVND(newShippingFee)}
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <button
                                        className="om-btn om-btn-primary om-btn-sm"
                                        onClick={handleSaveAddress}
                                        disabled={savingAddress || !addressForm.shippingProvince || !addressForm.shippingDistrict || !addressForm.shippingWard || !addressForm.shippingAddress.trim()}
                                    >
                                        {savingAddress ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                                    </button>
                                    <button
                                        className="om-btn om-btn-outline om-btn-sm"
                                        onClick={handleCancelEdit}
                                        disabled={savingAddress}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="om-so-address">
                                <p style={{ marginBottom: 8 }}>{fullAddress}</p>
                                <span className={`om-type-chip ${order.order_type === 'Online' ? 'online' : 'instore'}`}>
                                    {order.order_type}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Order items */}
                    <div className="om-so-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <h3 style={{ margin: 0 }}>Sản phẩm ({(isEditingItems ? editItems : order.items)?.length || 0})</h3>
                            {order.status === 'Chờ xác nhận' && !isEditingItems && (
                                <button
                                    className="om-btn om-btn-outline om-btn-sm"
                                    onClick={handleStartEditItems}
                                    style={{ fontSize: 12, padding: '3px 10px' }}
                                >
                                    ✏️ Sửa sản phẩm
                                </button>
                            )}
                        </div>

                        {isEditingItems ? (
                            <>
                                {editItems.map((item) => (
                                    <div key={item.order_item_id} className="om-so-item om-so-item-edit">
                                        <img
                                            className="om-so-item-thumb"
                                            src={item.product?.image_url}
                                            alt={item.product?.name}
                                            loading="lazy"
                                        />
                                        <div className="om-so-item-info" style={{ flex: 1 }}>
                                            <span className="om-so-item-name">{item.product?.name}</span>
                                            <span className="om-so-item-variant">
                                                Size: {item.size?.size_name} / Màu: {item.color?.color_name}
                                            </span>
                                            <span className="om-so-item-unit-price">{formatVND(item.unit_price)} / đôi</span>
                                        </div>
                                        <div className="om-so-item-edit-right">
                                            {/* Quantity stepper */}
                                            <div className="om-qty-ctrl">
                                                <button
                                                    className="om-qty-btn"
                                                    onClick={() => handleItemQtyChange(item.order_item_id, -1)}
                                                    disabled={item.quantity <= 1}
                                                >−</button>
                                                <input
                                                    className="om-qty-input"
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemQtyInput(item.order_item_id, e.target.value)}
                                                />
                                                <button
                                                    className="om-qty-btn"
                                                    onClick={() => handleItemQtyChange(item.order_item_id, 1)}
                                                >+</button>
                                            </div>
                                            <div className="om-so-item-total" style={{ marginTop: 4 }}>
                                                {formatVND(item.unit_price * item.quantity)}
                                            </div>
                                            {/* Delete button — disabled when only one item remains */}
                                            <button
                                                className="om-item-delete-btn"
                                                onClick={() => handleRemoveItem(item.order_item_id)}
                                                disabled={editItems.length <= 1}
                                                title={editItems.length <= 1 ? 'Đơn hàng phải có ít nhất 1 sản phẩm' : 'Xóa sản phẩm'}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Edit mode subtotal preview */}
                                <div className="om-so-edit-subtotal">
                                    <span>Tạm tính (dự kiến)</span>
                                    <span>{formatVND(editItems.reduce((s, i) => s + i.unit_price * i.quantity, 0))}</span>
                                </div>

                                {/* Validation warning */}
                                {editItems.length === 0 && (
                                    <div style={{ color: 'var(--danger-500)', fontSize: 13, marginTop: 8 }}>
                                        ⚠️ Đơn hàng phải có ít nhất 1 sản phẩm
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <button
                                        className="om-btn om-btn-primary om-btn-sm"
                                        onClick={handleSaveItems}
                                        disabled={savingItems || editItems.length === 0}
                                    >
                                        {savingItems ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                                    </button>
                                    <button
                                        className="om-btn om-btn-outline om-btn-sm"
                                        onClick={handleCancelEditItems}
                                        disabled={savingItems}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </>
                        ) : (
                            order.items?.map((item) => (
                                <div key={item.order_item_id} className="om-so-item">
                                    <img
                                        className="om-so-item-thumb"
                                        src={item.product?.image_url}
                                        alt={item.product?.name}
                                        loading="lazy"
                                    />
                                    <div className="om-so-item-info">
                                        <span className="om-so-item-name">{item.product?.name}</span>
                                        <span className="om-so-item-variant">
                                            Size: {item.size?.size_name} / Màu: {item.color?.color_name}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="om-so-item-qty">
                                            {item.quantity} × {formatVND(item.unit_price)}
                                        </div>
                                        <div className="om-so-item-total">{formatVND(item.total_price)}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pricing breakdown */}
                    <div className="om-so-card">
                        <h3>Chi tiết giá</h3>
                        <div className="om-so-pricing-row">
                            <span>Tạm tính</span>
                            <span>{formatVND(order.subtotal)}</span>
                        </div>
                        <div className="om-so-pricing-row">
                            <span>Phí vận chuyển</span>
                            <span>{formatVND(order.shipping_cost)}</span>
                        </div>
                        {order.coupon_discount_amount > 0 && (
                            <div className="om-so-pricing-row discount">
                                <span>Giảm giá (Mã giảm giá)</span>
                                <span>−{formatVND(order.coupon_discount_amount)}</span>
                            </div>
                        )}
                        <div className="om-so-pricing-total">
                            <span>TỔNG CỘNG</span>
                            <span>{formatVND(order.total_amount)}</span>
                        </div>
                    </div>

                    {/* Payment info */}
                    <div className="om-so-card">
                        <h3>Thanh toán</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <span>Trạng thái TT:</span>
                            <span
                                className="om-badge"
                                style={{ background: paymentCfg.bg, color: paymentCfg.color }}
                            >
                                <span className="om-badge-dot" style={{ background: paymentCfg.color }} />
                                {order.payment_status}
                            </span>
                        </div>
                    </div>

                    {/* Order timeline */}
                    <div className="om-so-card">
                        <h3>Tiến trình đơn hàng</h3>
                        {order.status === 'Đã hủy' ? (
                            <div style={{ fontSize: 13, color: 'var(--danger-500)', fontWeight: 600 }}>
                                ❌ Đơn hàng đã bị hủy
                            </div>
                        ) : (
                            <div className="om-timeline">
                                {timelineSteps.map((step, idx) => {
                                    let stepClass = 'future';
                                    if (idx < currentStepIdx) stepClass = 'completed';
                                    else if (idx === currentStepIdx) stepClass = 'current completed';
                                    return (
                                        <div key={step} className={`om-timeline-step ${stepClass}`}>
                                            <span className="step-label">{step}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Internal notes */}
                    <div className="om-so-card om-so-notes">
                        <h3>Ghi chú nội bộ (chỉ nhân viên thấy)</h3>
                        <textarea
                            placeholder="Nhập ghi chú..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        {saved && (
                            <div className="om-so-saved-indicator">
                                ✅ Đã lưu
                            </div>
                        )}
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="om-so-footer">
                    {!isTerminal && (
                        <button
                            className="om-btn om-btn-primary"
                            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                        >
                            Cập nhật trạng thái
                        </button>
                    )}
                    <button
                        className="om-btn om-btn-outline"
                        onClick={() => onPrintOrder(order)}
                    >
                        🖨️ In hóa đơn
                    </button>
                    {!isTerminal && (
                        <button
                            className="om-btn om-btn-danger-outline"
                            onClick={() => onCancelOrder(order)}
                        >
                            Hủy đơn
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default OrderSlideOver;

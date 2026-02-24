import React, { useState, useMemo } from 'react';
import {
    mockDeliverableOrders, ALL_REASONS, REFUND_METHODS,
    formatVND, formatDate, getInitials,
} from './mockReturns';

/**
 * CreateReturnModal — 3-step wizard to create a new return request.
 * Step 1: Search and select an eligible order
 * Step 2: Pick items and quantities to return
 * Step 3: Fill return info (reason, description, refund method)
 */
const CreateReturnModal = ({ onClose, onCreate }) => {
    const [step, setStep] = useState(1);

    // Step 1 state
    const [searchQuery, setSearchQuery] = useState('');

    // Step 2 state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [checkedItems, setCheckedItems] = useState({});  // { order_item_id: qty }

    // Step 3 state
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [refundMethod, setRefundMethod] = useState('Chuyển khoản');

    // Filter orders by search
    const filteredOrders = useMemo(() => {
        if (!searchQuery) return mockDeliverableOrders;
        const q = searchQuery.toLowerCase();
        return mockDeliverableOrders.filter(o =>
            o.order_number.toLowerCase().includes(q) ||
            o.customer_name.toLowerCase().includes(q) ||
            o.customer_phone.includes(q)
        );
    }, [searchQuery]);

    // Toggle item selection
    const handleToggleItem = (item) => {
        setCheckedItems(prev => {
            const next = { ...prev };
            if (next[item.order_item_id]) {
                delete next[item.order_item_id];
            } else {
                next[item.order_item_id] = item.quantity;
            }
            return next;
        });
    };

    // Update item qty
    const handleItemQty = (itemId, delta, maxQty) => {
        setCheckedItems(prev => {
            const current = prev[itemId] || 1;
            const newQty = Math.max(1, Math.min(maxQty, current + delta));
            return { ...prev, [itemId]: newQty };
        });
    };

    // Calculate refund preview
    const selectedItemsList = selectedOrder
        ? selectedOrder.items.filter(item => checkedItems[item.order_item_id])
        : [];
    const refundPreview = selectedItemsList.reduce(
        (sum, item) => sum + item.unit_price * (checkedItems[item.order_item_id] || 0), 0
    );

    const canProceed1 = !!selectedOrder;
    const canProceed2 = Object.keys(checkedItems).length > 0;
    const canSubmit = reason && description;

    const handleSelectOrder = (order) => {
        setSelectedOrder(order);
        setCheckedItems({});
        setStep(2);
    };

    const handleSubmit = () => {
        // Generate return code
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const returnCode = `RTN-${dateStr}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

        const newReturn = {
            return_id: Date.now(),
            return_code: returnCode,
            order_id: selectedOrder.order_id,
            order_number: selectedOrder.order_number,
            customer_id: selectedOrder.customer_id,
            customer_name: selectedOrder.customer_name,
            customer_phone: selectedOrder.customer_phone,
            order_type: 'Online',
            total_amount: refundPreview,
            original_total: selectedOrder.total_amount,
            return_status: 'Chờ duyệt',
            return_reason: reason,
            refund_method: refundMethod,
            description: description,
            shipping_cost_refund: 0,
            deduction: 0,
            reject_reason: null,
            notes: '',
            is_partial: Object.keys(checkedItems).length < selectedOrder.items.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            order_created_at: selectedOrder.created_at,
            items: selectedItemsList.map(item => ({
                ...item,
                quantity: checkedItems[item.order_item_id],
                total_price: item.unit_price * checkedItems[item.order_item_id],
            })),
            timeline: [
                { label: 'Yêu cầu trả hàng', key: 'requested', completed: true, current: false, timestamp: new Date().toISOString() },
                { label: 'Duyệt yêu cầu', key: 'approved', completed: false, current: true, timestamp: null },
                { label: 'Nhận hàng về kho', key: 'received', completed: false, current: false, timestamp: null },
                { label: 'Kiểm tra hàng hóa', key: 'inspected', completed: false, current: false, timestamp: null },
                { label: 'Hoàn tiền', key: 'refunded', completed: false, current: false, timestamp: null },
            ],
        };

        onCreate(newReturn);
    };

    // Step indicator
    const renderStepIndicator = () => (
        <div className="rm-step-indicator">
            {[1, 2, 3].map((s, i) => (
                <React.Fragment key={s}>
                    <div className={`rm-step ${step === s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
                        <div className="rm-step-num">{step > s ? '✓' : s}</div>
                        <span className="rm-step-label">
                            {s === 1 ? 'Tìm đơn hàng' : s === 2 ? 'Chọn sản phẩm' : 'Thông tin trả'}
                        </span>
                    </div>
                    {i < 2 && <div className={`rm-step-line ${step > s ? 'done' : ''}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="rm-modal-overlay" onClick={onClose}>
            <div className="rm-modal rm-create-modal" onClick={e => e.stopPropagation()}>
                <h3>Tạo yêu cầu trả hàng</h3>
                {renderStepIndicator()}

                {/* Step 1: Search order */}
                {step === 1 && (
                    <div>
                        <label className="rm-modal-label">Tìm đơn hàng đã giao:</label>
                        <div className="rm-search-box" style={{ marginBottom: 8 }}>
                            <span className="rm-search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Tìm theo mã đơn, tên KH, SĐT..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="rm-order-results">
                            {filteredOrders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 20, color: 'var(--gray-400)' }}>
                                    Không tìm thấy đơn hàng phù hợp
                                </div>
                            ) : (
                                filteredOrders.map(order => (
                                    <div
                                        key={order.order_id}
                                        className="rm-order-result-card"
                                        onClick={() => handleSelectOrder(order)}
                                    >
                                        <div className="rm-order-result-info">
                                            <span className="order-num">{order.order_number}</span>
                                            <span className="order-detail">
                                                {order.customer_name} • {formatVND(order.total_amount)} • {formatDate(order.created_at)}
                                            </span>
                                        </div>
                                        <span className="rm-badge" style={{ background: '#DCFCE7', color: '#22C55E', fontSize: 10 }}>
                                            <span className="rm-badge-dot" style={{ background: '#22C55E' }}></span>
                                            {order.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Select items */}
                {step === 2 && selectedOrder && (
                    <div>
                        <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--gray-600)' }}>
                            Đơn hàng: <strong>{selectedOrder.order_number}</strong> — {selectedOrder.customer_name}
                        </div>
                        <label className="rm-modal-label">Chọn sản phẩm muốn trả:</label>
                        <div className="rm-item-checklist">
                            {selectedOrder.items.map(item => {
                                const isChecked = !!checkedItems[item.order_item_id];
                                return (
                                    <div key={item.order_item_id} className={`rm-item-check ${isChecked ? 'checked' : ''}`}>
                                        <input
                                            type="checkbox"
                                            className="rm-checkbox"
                                            checked={isChecked}
                                            onChange={() => handleToggleItem(item)}
                                        />
                                        <img src={item.product.image_url} alt={item.product.name} className="rm-item-check-thumb" />
                                        <div className="rm-item-check-info">
                                            <div className="name">{item.product.name}</div>
                                            <div className="variant">Size: {item.size.size_name} / Màu: {item.color.color_name}</div>
                                            <div className="price">{formatVND(item.unit_price)} × {item.quantity}</div>
                                        </div>
                                        {isChecked && (
                                            <div className="rm-qty-stepper">
                                                <button onClick={() => handleItemQty(item.order_item_id, -1, item.quantity)}>−</button>
                                                <span>{checkedItems[item.order_item_id]}</span>
                                                <button onClick={() => handleItemQty(item.order_item_id, 1, item.quantity)}>+</button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {canProceed2 && (
                            <div className="rm-refund-preview">
                                <h4>Tóm tắt hoàn tiền</h4>
                                {selectedItemsList.map(item => (
                                    <div key={item.order_item_id} className="rm-refund-line" style={{ fontSize: 12 }}>
                                        <span>{item.product.name} × {checkedItems[item.order_item_id]}</span>
                                        <span>{formatVND(item.unit_price * checkedItems[item.order_item_id])}</span>
                                    </div>
                                ))}
                                <div className="rm-refund-line total" style={{ fontSize: 14 }}>
                                    <span>Tổng hoàn tiền:</span>
                                    <span>{formatVND(refundPreview)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Return info */}
                {step === 3 && (
                    <div>
                        <label className="rm-modal-label">Lý do trả hàng:</label>
                        <select
                            className="rm-filter-select"
                            style={{ width: '100%', marginBottom: 12 }}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        >
                            <option value="">Chọn lý do...</option>
                            {ALL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>

                        <label className="rm-modal-label">Mô tả chi tiết:</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Mô tả lý do trả hàng..."
                        />

                        <label className="rm-modal-label" style={{ marginTop: 12 }}>Upload ảnh minh chứng:</label>
                        <div className="rm-file-upload">
                            📷 Kéo thả hoặc click để chọn ảnh
                        </div>

                        <label className="rm-modal-label" style={{ marginTop: 12 }}>Phương thức hoàn tiền:</label>
                        <select
                            className="rm-filter-select"
                            style={{ width: '100%', marginBottom: 12 }}
                            value={refundMethod}
                            onChange={e => setRefundMethod(e.target.value)}
                        >
                            {REFUND_METHODS.map(m => (
                                <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                            ))}
                        </select>

                        <div className="rm-refund-preview">
                            <h4>Tóm tắt hoàn tiền</h4>
                            <div className="rm-refund-line total">
                                <span>Tổng hoàn tiền:</span>
                                <span>{formatVND(refundPreview)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation buttons */}
                <div className="rm-modal-nav">
                    <div>
                        {step > 1 && (
                            <button className="rm-btn rm-btn-outline" onClick={() => setStep(s => s - 1)}>
                                ← Quay lại
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="rm-btn rm-btn-outline" onClick={onClose}>Hủy</button>
                        {step < 3 ? (
                            <button
                                className="rm-btn rm-btn-primary"
                                disabled={step === 1 ? !canProceed1 : !canProceed2}
                                onClick={() => setStep(s => s + 1)}
                            >
                                Tiếp theo →
                            </button>
                        ) : (
                            <button
                                className="rm-btn rm-btn-primary"
                                disabled={!canSubmit}
                                onClick={handleSubmit}
                            >
                                ✅ Tạo yêu cầu
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateReturnModal;

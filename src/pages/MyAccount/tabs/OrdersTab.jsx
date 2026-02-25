import React, { useState, useMemo } from 'react';
import { Search, Copy, ChevronRight, ShoppingBag, Star, Truck, X, Package } from 'lucide-react';
import { MOCK_ORDERS, formatVND, formatDate } from '../mockAccountData';
import OrderDetailModal from '../components/OrderDetailModal';

const ALL_STATUSES = ['Tất cả', 'Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Trả hàng/Hoàn tiền', 'Đã hủy'];

const statusBadgeClass = (status) => {
    const map = {
        'Chờ xác nhận': 'acc-badge-yellow',
        'Đã xác nhận': 'acc-badge-blue',
        'Đang giao': 'acc-badge-purple',
        'Đã giao': 'acc-badge-green',
        'Trả hàng/Hoàn tiền': 'acc-badge-orange',
        'Đã hủy': 'acc-badge-red',
    };
    return map[status] || '';
};

const payBadgeClass = (status) => status === 'Đã thanh toán' ? 'acc-pay-badge acc-pay-paid' : 'acc-pay-badge acc-pay-unpaid';

const OrdersTab = () => {
    const [activeStatus, setActiveStatus] = useState('Tất cả');
    const [search, setSearch] = useState('');
    const [detailOrder, setDetailOrder] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const statusCounts = useMemo(() => {
        const counts = { 'Tất cả': MOCK_ORDERS.length };
        ALL_STATUSES.slice(1).forEach(s => {
            counts[s] = MOCK_ORDERS.filter(o => o.status === s).length;
        });
        return counts;
    }, []);

    const filtered = useMemo(() => {
        let orders = MOCK_ORDERS;
        if (activeStatus !== 'Tất cả') orders = orders.filter(o => o.status === activeStatus);
        if (search.trim()) orders = orders.filter(o => o.order_number.toLowerCase().includes(search.toLowerCase().trim()));
        return orders;
    }, [activeStatus, search]);

    const handleCopy = (orderNum) => {
        navigator.clipboard.writeText(orderNum).catch(() => { });
        showToast(`Đã sao chép ${orderNum}`);
    };

    return (
        <div className="acc-tab-content">
            <div className="acc-tab-header">
                <div>
                    <h2 className="acc-tab-title">Đơn hàng của tôi</h2>
                    <p className="acc-tab-sub">Theo dõi và quản lý tất cả đơn hàng</p>
                </div>
            </div>

            {/* Status Filter Pills */}
            <div className="acc-status-pills">
                {ALL_STATUSES.map(s => (
                    <button
                        key={s}
                        className={`acc-status-pill${activeStatus === s ? ' active' : ''}`}
                        onClick={() => setActiveStatus(s)}
                    >
                        {s} {statusCounts[s] > 0 && <span className="acc-pill-count">({statusCounts[s]})</span>}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="acc-search-wrap">
                <Search size={18} className="acc-search-icon" />
                <input
                    className="acc-search-input"
                    placeholder="Tìm theo mã đơn hàng..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && (
                    <button className="acc-search-clear" onClick={() => setSearch('')}><X size={16} /></button>
                )}
            </div>

            {/* Order Cards */}
            {filtered.length === 0 ? (
                <div className="acc-empty-state">
                    <Package size={48} className="acc-empty-icon" />
                    <h3>Chưa có đơn hàng nào</h3>
                    <p>Bắt đầu mua sắm tại BestShoes ngay hôm nay!</p>
                    <a href="/catalog" className="acc-btn-primary">Bắt đầu mua sắm →</a>
                </div>
            ) : (
                <div className="acc-orders-list">
                    {filtered.map(order => (
                        <div key={order.order_id} className="acc-order-card">
                            {/* Header */}
                            <div className="acc-order-card-header">
                                <div className="acc-order-card-header-left">
                                    <span className="acc-order-num">{order.order_number}</span>
                                    <button className="acc-copy-btn" onClick={() => handleCopy(order.order_number)} title="Sao chép mã đơn">
                                        <Copy size={14} />
                                    </button>
                                    <span className="acc-order-date">{formatDate(order.created_at)}</span>
                                </div>
                                <span className={`acc-status-badge ${statusBadgeClass(order.status)}`}>{order.status}</span>
                            </div>

                            {/* Items */}
                            <div className="acc-order-items-row">
                                {order.items.map((item, idx) => (
                                    idx < 3 && (
                                        <div key={item.order_item_id} className="acc-order-item-chip">
                                            <div className="acc-order-item-thumb" style={{ background: item.thumb_color }}>
                                                <span className="acc-item-emoji">{item.thumb_emoji}</span>
                                            </div>
                                            <div className="acc-order-item-detail">
                                                <span className="acc-order-item-name">{item.product_name}</span>
                                                <span className="acc-order-item-variant">{item.variant}</span>
                                            </div>
                                        </div>
                                    )
                                ))}
                                {order.items.length > 3 && (
                                    <div className="acc-order-more-chip">+{order.items.length - 3} sản phẩm</div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="acc-order-card-footer">
                                <div className="acc-order-footer-left">
                                    <span className={payBadgeClass(order.payment_status)}>{order.payment_status}</span>
                                    <span className={`acc-type-chip${order.order_type === 'In-store' ? ' teal' : ''}`}>{order.order_type}</span>
                                </div>
                                <div className="acc-order-total-center">
                                    Tổng: <strong>{formatVND(order.total_amount)}</strong>
                                </div>
                                <div className="acc-order-actions">
                                    {order.status === 'Đang giao' && (
                                        <button className="acc-btn-primary-sm"><Truck size={14} /> Theo dõi</button>
                                    )}
                                    {order.status === 'Đã giao' && (
                                        <>
                                            <button className="acc-btn-outline-sm"><Star size={14} /> Đánh giá</button>
                                            <button className="acc-btn-primary-sm"><ShoppingBag size={14} /> Mua lại</button>
                                        </>
                                    )}
                                    {order.status === 'Chờ xác nhận' && (
                                        <button className="acc-btn-danger-sm">Hủy đơn</button>
                                    )}
                                    <button className="acc-btn-ghost-sm" onClick={() => setDetailOrder(order)}>
                                        Chi tiết <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {detailOrder && (
                <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
            )}

            {/* Toast */}
            {toast && <div className="acc-toast acc-toast-info">{toast}</div>}
        </div>
    );
};

export default OrdersTab;

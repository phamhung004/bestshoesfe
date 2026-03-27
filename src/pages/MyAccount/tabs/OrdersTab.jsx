import React, { useState, useMemo, useEffect } from 'react';
import { Search, Copy, ChevronRight, ShoppingBag, Star, Truck, X, Package, Loader, RotateCcw, ChevronLeft } from 'lucide-react';
import { formatVND, formatDate } from '../mockAccountData';
import { getMyOrders, cancelOrder } from '../../../api/accountApi';
import { getMyReturns } from '../../../api/returnApi';
import { RETURN_WINDOW_DAYS } from '../../../constants/returnConstants';
import OrderDetailModal from '../components/OrderDetailModal';
import ReturnRequestModal from '../components/ReturnRequestModal';

const ALL_STATUSES = ['Tất cả', 'Chờ xác nhận', 'Đã xác nhận', 'Đang đóng gói', 'Bàn giao ĐVVC', 'Đang giao', 'Đã giao', 'Trả hàng/Hoàn tiền', 'Đã hủy'];

const statusBadgeClass = (status) => {
    const map = {
        'Chờ xác nhận': 'acc-badge-yellow',
        'Đã xác nhận': 'acc-badge-blue',
        'Đang đóng gói': 'acc-badge-orange',
        'Bàn giao ĐVVC': 'acc-badge-cyan',
        'Đang giao': 'acc-badge-purple',
        'Đã giao': 'acc-badge-green',
        'Trả hàng/Hoàn tiền': 'acc-badge-orange',
        'Đã hủy': 'acc-badge-red',
    };
    return map[status] || '';
};

const payBadgeClass = (status) => status === 'Đã thanh toán' ? 'acc-pay-badge acc-pay-paid' : 'acc-pay-badge acc-pay-unpaid';

const OrdersTab = ({ onOpenReturns }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState('Tất cả');
    const [search, setSearch] = useState('');
    const [detailOrder, setDetailOrder] = useState(null);
    const [returnOrder, setReturnOrder] = useState(null);
    const [myReturns, setMyReturns] = useState([]);
    const [toast, setToast] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const TERMINAL_RETURN_STATUSES = ['Hoàn tiền', 'Từ chối'];

    const hasActiveReturn = (orderNumber) =>
        myReturns.some(r => r.orderNumber === orderNumber && !TERMINAL_RETURN_STATUSES.includes(r.returnStatus));

    const isWithinReturnWindow = (order) => {
        if (!order.updatedAt) return false;
        const days = Math.floor((Date.now() - new Date(order.updatedAt)) / 86400000);
        return days <= RETURN_WINDOW_DAYS;
    };

    const showToast = (msg, type = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await getMyOrders();
                setOrders(res.data || []);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
                showToast('Không thể tải đơn hàng', 'error');
            } finally {
                setLoading(false);
            }
        };
        const fetchReturns = async () => {
            try {
                const res = await getMyReturns();
                setMyReturns(res.data || []);
            } catch { /* silent */ }
        };
        fetchOrders();
        fetchReturns();
    }, []);

    const statusCounts = useMemo(() => {
        const counts = { 'Tất cả': orders.length };
        ALL_STATUSES.slice(1).forEach(s => {
            counts[s] = orders.filter(o => o.status === s).length;
        });
        return counts;
    }, [orders]);

    const filtered = useMemo(() => {
        let result = orders;
        if (activeStatus !== 'Tất cả') result = result.filter(o => o.status === activeStatus);
        if (search.trim()) result = result.filter(o => o.orderNumber.toLowerCase().includes(search.toLowerCase().trim()));
        return result;
    }, [orders, activeStatus, search]);

    // Reset page on filter/search change
    useEffect(() => { setCurrentPage(1); }, [activeStatus, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginatedOrders = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const handleCopy = (orderNum) => {
        navigator.clipboard.writeText(orderNum).catch(() => { });
        showToast(`Đã sao chép ${orderNum}`);
    };

    const handleCancel = async (orderNumber) => {
        if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
        setCancellingId(orderNumber);
        try {
            await cancelOrder(orderNumber);
            setOrders(prev => prev.map(o => o.orderNumber === orderNumber ? { ...o, status: 'Đã hủy' } : o));
            showToast('Đã hủy đơn hàng thành công');
        } catch (err) {
            showToast(err.response?.data?.message || 'Không thể hủy đơn hàng', 'error');
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) {
        return (
            <div className="acc-tab-content" style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <Loader size={32} className="acc-spinner" />
            </div>
        );
    }

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
                    {paginatedOrders.map(order => (
                        <div key={order.orderId} className="acc-order-card">
                            {/* Header */}
                            <div className="acc-order-card-header">
                                <div className="acc-order-card-header-left">
                                    <span className="acc-order-num">{order.orderNumber}</span>
                                    <button className="acc-copy-btn" onClick={() => handleCopy(order.orderNumber)} title="Sao chép mã đơn">
                                        <Copy size={14} />
                                    </button>
                                    <span className="acc-order-date">{formatDate(order.createdAt)}</span>
                                </div>
                                <span className={`acc-status-badge ${statusBadgeClass(order.status)}`}>{order.status}</span>
                            </div>

                            {/* Items */}
                            <div className="acc-order-items-row">
                                {order.items.map((item, idx) => (
                                    idx < 3 && (
                                        <div key={item.orderItemId} className="acc-order-item-chip">
                                            {item.imageUrl ? (
                                                <img
                                                    className="acc-order-item-thumb"
                                                    src={item.imageUrl}
                                                    alt={item.productName}
                                                    loading="lazy"
                                                    style={{ objectFit: 'cover', borderRadius: 6 }}
                                                />
                                            ) : (
                                                <div className="acc-order-item-thumb" style={{ background: item.thumbColor }}>
                                                    <span className="acc-item-emoji">{item.thumbEmoji}</span>
                                                </div>
                                            )}
                                            <div className="acc-order-item-detail">
                                                <span className="acc-order-item-name">{item.productName}</span>
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
                                    <span className={payBadgeClass(order.paymentStatus)}>{order.paymentStatus}</span>
                                    <span className={`acc-type-chip${order.orderType === 'In-store' ? ' teal' : ''}`}>{order.orderType}</span>
                                </div>
                                <div className="acc-order-total-center">
                                    Tổng: <strong>{formatVND(order.totalAmount)}</strong>
                                </div>
                                <div className="acc-order-actions">
                                    {order.status === 'Đang đóng gói' && (
                                        <span style={{ fontSize: 13, color: '#EA580C', fontWeight: 500 }}>
                                            📦 Đang soạn hàng
                                        </span>
                                    )}
                                    {order.status === 'Bàn giao ĐVVC' && (
                                        <span style={{ fontSize: 13, color: '#0284C7', fontWeight: 500 }}>
                                            🚚 Đã bàn giao cho shipper
                                        </span>
                                    )}
                                    {order.status === 'Đang giao' && (
                                        <button className="acc-btn-primary-sm"><Truck size={14} /> Theo dõi</button>
                                    )}
                                    {order.status === 'Đã giao' && (
                                        <>
                                            <button className="acc-btn-outline-sm"><Star size={14} /> Đánh giá</button>
                                            <button className="acc-btn-primary-sm"><ShoppingBag size={14} /> Mua lại</button>
                                            {isWithinReturnWindow(order) && !hasActiveReturn(order.orderNumber) && (
                                                <button
                                                    className="acc-btn-outline-sm"
                                                    style={{ borderColor: '#f59e0b', color: '#d97706' }}
                                                    onClick={() => setReturnOrder(order)}
                                                >
                                                    <RotateCcw size={14} /> Trả hàng
                                                </button>
                                            )}
                                            {hasActiveReturn(order.orderNumber) && (
                                                <span style={{ fontSize: 12, color: '#080808ff', fontWeight: 600, padding: '4px 8px', background: '#fffbeb', borderRadius: 6, border: '1px solid #fde68a' }}>
                                                    ⏳ Đang xử lý
                                                </span>
                                            )}
                                            {!isWithinReturnWindow(order) && !hasActiveReturn(order.orderNumber) && (
                                                <span style={{ fontSize: 12, color: '#9ca3af', padding: '4px 8px' }}>Hết hạn trả</span>
                                            )}
                                        </>
                                    )}
                                    {order.status === 'Trả hàng/Hoàn tiền' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{
                                                fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                                                background: myReturns.find(r => r.orderNumber === order.orderNumber)?.returnStatus === 'Hoàn tiền' ? '#dcfce7' : '#fef9c3',
                                                color: myReturns.find(r => r.orderNumber === order.orderNumber)?.returnStatus === 'Hoàn tiền' ? '#16a34a' : '#d97706',
                                                border: `1px solid ${myReturns.find(r => r.orderNumber === order.orderNumber)?.returnStatus === 'Hoàn tiền' ? '#bbf7d0' : '#fde68a'}`,
                                            }}>
                                                {myReturns.find(r => r.orderNumber === order.orderNumber)?.returnStatus === 'Hoàn tiền' ? '✅ Đã hoàn tiền' : '↩ Đang xử lý hoàn tiền'}
                                            </span>
                                            <button
                                                className="acc-btn-ghost-sm"
                                                onClick={() => onOpenReturns?.()}
                                                style={{ fontSize: 12 }}
                                            >
                                                Xem yêu cầu →
                                            </button>
                                        </div>
                                    )}
                                    {order.status === 'Chờ xác nhận' && (
                                        <button
                                            className="acc-btn-danger-sm"
                                            onClick={() => handleCancel(order.orderNumber)}
                                            disabled={cancellingId === order.orderNumber}
                                        >
                                            {cancellingId === order.orderNumber ? 'Đang hủy...' : 'Hủy đơn'}
                                        </button>
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

            {/* Pagination */}
            {filtered.length > 0 && (
                <div className="acc-pagination">
                    <div className="acc-pagination-info">
                        Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}–{Math.min(currentPage * itemsPerPage, filtered.length)} / {filtered.length} đơn hàng
                        <select
                            value={itemsPerPage}
                            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="acc-pagination-select"
                        >
                            {[5, 10, 20].map(n => <option key={n} value={n}>{n} / trang</option>)}
                        </select>
                    </div>
                    {totalPages > 1 && (
                        <div className="acc-pagination-buttons">
                            <button
                                className="acc-page-btn"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {getPageNumbers().map((p, i) =>
                                p === '...' ? (
                                    <span key={`e-${i}`} className="acc-page-ellipsis">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        className={`acc-page-btn ${currentPage === p ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(p)}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                            <button
                                className="acc-page-btn"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {detailOrder && (
                <OrderDetailModal
                    order={detailOrder}
                    onClose={() => setDetailOrder(null)}
                    onOrderUpdated={(updated) => {
                        setOrders(prev => prev.map(o =>
                            o.orderNumber === updated.orderNumber ? { ...o, ...updated } : o
                        ));
                        setDetailOrder(prev => prev ? { ...prev, ...updated } : prev);
                        showToast('Đã cập nhật địa chỉ giao hàng thành công', 'success');
                    }}
                />
            )}

            {/* Return Request Modal */}
            {returnOrder && (
                <ReturnRequestModal
                    order={returnOrder}
                    onClose={() => setReturnOrder(null)}
                    onSuccess={() => {
                        setReturnOrder(null);
                        showToast('Gửi yêu cầu trả hàng thành công! Admin sẽ phản hồi trong 1-3 ngày.', 'success');
                        // Refresh returns list so button state updates
                        getMyReturns().then(res => setMyReturns(res.data || [])).catch(() => {});
                        onOpenReturns?.();
                    }}
                />
            )}

            {/* Toast */}
            {toast && <div className={`acc-toast acc-toast-${toast.type || 'info'}`}>{toast.msg}</div>}
        </div>
    );
};

export default OrdersTab;

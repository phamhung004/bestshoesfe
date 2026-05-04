import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { normalizeOrder } from './orderMappers';
import { STATUS_CONFIG } from './orderConstants';
import { orderAPI } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import OrderKpiCards from './OrderKpiCards';
import OrderFilters from './OrderFilters';
import OrderTable from './OrderTable';
import OrderSlideOver from './OrderSlideOver';
import OrderPagination from './OrderPagination';
import CancelOrderDialog from './CancelOrderDialog';
import './OrderManagement.css';

/**
 * OrderManagement — parent orchestrator component.
 * Connects to backend API for all data operations.
 */
const OrderManagement = () => {
    const { isManager } = useAuth();

    // ── State ─────────────────────────────────────────────────────
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Filter state
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        paymentStatus: '',
        orderType: '',
        dateFrom: '',
        dateTo: '',
    });
    const [activeTab, setActiveTab] = useState('Tất cả');

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', dir: 'desc' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

    // Toast state
    const [toast, setToast] = useState(null);

    const [statusCounts, setStatusCounts] = useState({ 'Tất cả': 0 });

    // Ref to prevent race conditions
    const fetchIdRef = useRef(0);

    // ── Today's date string for the subtitle ──────────────────────
    const todayLabel = useMemo(() => {
        const d = new Date();
        const days = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        return `${days[d.getDay()]}, ${d.getDate()} tháng ${months[d.getMonth()]}, ${d.getFullYear()}`;
    }, []);

    // ── Fetch orders from backend ─────────────────────────────────
    const fetchOrders = useCallback(async () => {
        const fetchId = ++fetchIdRef.current;
        setLoading(true);

        try {
            // Build request body for the search API
            const requestBody = {
                search: filters.search || undefined,
                status: activeTab !== 'Tất cả' ? activeTab : (filters.status || undefined),
                paymentStatus: filters.paymentStatus || undefined,
                orderType: filters.orderType || undefined,
                dateFrom: filters.dateFrom || undefined,
                dateTo: filters.dateTo || undefined,
                sortBy: sortConfig.key || 'created_at',
                sortDir: sortConfig.dir || 'desc',
                pageNum: currentPage - 1,  // backend is 0-based
                pageSize: rowsPerPage,
            };

            const response = await orderAPI.search(requestBody);

            // Only apply if this is still the latest fetch
            if (fetchId !== fetchIdRef.current) return;

            const pageData = response?.data;
            if (pageData) {
                const normalized = (pageData.content || []).map(normalizeOrder);
                setOrders(normalized);
                setTotalPages(pageData.totalPages || 1);
                setTotalElements(pageData.totalElements || 0);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            if (fetchId === fetchIdRef.current) {
                setOrders([]);
                setTotalPages(1);
                setTotalElements(0);
            }
        } finally {
            if (fetchId === fetchIdRef.current) {
                setLoading(false);
            }
        }
    }, [filters, activeTab, sortConfig, currentPage, rowsPerPage]);

    // ── Fetch status counts for tabs ──────────────────────────────
    const fetchStatusCounts = useCallback(async () => {
        try {
            const res = await orderAPI.getStatusCounts();
            const counts = res?.data || {};
            setStatusCounts(counts);
        } catch (err) {
            console.error('Failed to fetch status counts:', err);
        }
    }, []);

    // ── Trigger fetch on filter/sort/page changes ─────────────────
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Fetch status counts on mount and after mutations
    useEffect(() => {
        fetchStatusCounts();
    }, [fetchStatusCounts]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, activeTab, rowsPerPage]);

    // ── Fetch order detail for slide-over ─────────────────────────
    const fetchOrderDetail = useCallback(async (order) => {
        setSelectedOrder(order); // show slide-over immediately with summary data
        try {
            const response = await orderAPI.getById(order.order_id);
            if (response?.data) {
                setSelectedOrderDetail(normalizeOrder(response.data));
            }
        } catch (err) {
            console.error('Failed to fetch order detail:', err);
            // Keep the summary data as fallback
            setSelectedOrderDetail(order);
        }
    }, []);

    // ── Handlers ──────────────────────────────────────────────────
    const handleFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters({ search: '', status: '', paymentStatus: '', orderType: '', dateFrom: '', dateTo: '' });
        setActiveTab('Tất cả');
    }, []);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setFilters((prev) => ({ ...prev, status: '' }));
    }, []);

    const handleSort = useCallback((key) => {
        setSortConfig((prev) => ({
            key,
            dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
        }));
    }, []);

    const showToast = useCallback((message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2500);
    }, []);

    const handleCopyOrderNum = useCallback((orderNum) => {
        navigator.clipboard?.writeText(orderNum).then(() => {
            showToast('✅ Đã sao chép!');
        }).catch(() => {
            showToast('Đã sao chép: ' + orderNum);
        });
    }, [showToast]);

    const handlePrintOrder = useCallback(() => {
        window.print();
    }, []);

    // ── Cancel order (API) ────────────────────────────────────────
    const [cancelDialogOrder, setCancelDialogOrder] = useState(null);
    const [inactiveOrderIssue, setInactiveOrderIssue] = useState(null);

    const handleCancelOrder = useCallback((order) => {
        setCancelDialogOrder(order);
    }, []);

    const handleConfirmCancel = useCallback(async (cancelReason) => {
        const order = cancelDialogOrder;
        if (!order) return;
        try {
            await orderAPI.cancel(order.order_id, { cancelReason });
            showToast(`Hủy đơn thành công #${order.order_number}`);
            setCancelDialogOrder(null);
            setSelectedOrder(null);
            setSelectedOrderDetail(null);
            fetchOrders();
            fetchStatusCounts();
        } catch (err) {
            const backendMsg = err?.response?.data?.message;
            showToast('❌ Lỗi: ' + (backendMsg || 'Không thể hủy đơn hàng'));
        }
    }, [cancelDialogOrder, showToast, fetchOrders, fetchStatusCounts]);

    const findOrderById = useCallback((orderId) => (
        selectedOrderDetail?.order_id === orderId ? selectedOrderDetail
            : selectedOrder?.order_id === orderId ? selectedOrder
                : orders.find((order) => order.order_id === orderId)
    ), [orders, selectedOrder, selectedOrderDetail]);

    // ── Update status (API) ───────────────────────────────────────
    const handleStatusChange = useCallback(async (orderId, newStatus) => {
        try {
            await orderAPI.updateStatus(orderId, { status: newStatus });
            showToast(`Đã cập nhật trạng thái → ${newStatus}`);
            // Refresh the detail if open
            if (selectedOrderDetail && selectedOrderDetail.order_id === orderId) {
                setSelectedOrderDetail((prev) => prev ? { ...prev, status: newStatus } : prev);
            }
            fetchOrders();
            fetchStatusCounts();
        } catch (err) {
            const data = err?.response?.data;
            if (err?.response?.status === 422 && data?.errorCode === 'ORDER_ITEM_INACTIVE') {
                setInactiveOrderIssue({
                    mode: 'single',
                    order: findOrderById(orderId),
                    items: data.items || [],
                });
                return;
            }
            const backendMsg = err?.response?.data?.message;
            showToast('❌ Lỗi: ' + (backendMsg || 'Không thể cập nhật trạng thái'));
        }
    }, [showToast, fetchOrders, fetchStatusCounts, selectedOrderDetail, findOrderById]);

    // ── Confirm payment (REM-04A) ───────────────────────────────────────
    const handleConfirmPayment = useCallback(async (orderId) => {
        try {
            const response = await orderAPI.confirmPayment(orderId);
            showToast('✅ Đã xác nhận thanh toán');
            if (response?.data) {
                const updated = normalizeOrder(response.data);
                setSelectedOrderDetail(updated);
                setSelectedOrder((prev) => prev ? { ...prev, ...updated } : prev);
            }
            fetchOrders();
        } catch (err) {
            const backendMsg = err?.response?.data?.message;
            showToast('❌ Lỗi: ' + (backendMsg || 'Không thể xác nhận thanh toán'));
        }
    }, [showToast, fetchOrders]);

    // ── Confirm refund (V3-07) ──────────────────────────────────────
    const handleConfirmRefund = useCallback(async (orderId) => {
        try {
            const response = await orderAPI.confirmRefund(orderId);
            showToast('✅ Đã xác nhận hoàn tiền');
            if (response?.data) {
                const updated = normalizeOrder(response.data);
                setSelectedOrderDetail(updated);
                setSelectedOrder((prev) => prev ? { ...prev, ...updated } : prev);
            }
            fetchOrders();
        } catch (err) {
            const backendMsg = err?.response?.data?.message;
            showToast('❌ Lỗi: ' + (backendMsg || 'Không thể xác nhận hoàn tiền'));
        }
    }, [showToast, fetchOrders]);

    const handleAddressUpdate = useCallback(async (orderId, addressData) => {
        try {
            const response = await orderAPI.updateAddress(orderId, addressData);
            if (response?.data) {
                const updated = normalizeOrder(response.data);
                setSelectedOrderDetail(updated);
                setSelectedOrder((prev) => prev ? { ...prev, ...updated } : prev);
            }
            showToast('✅ Đã cập nhật địa chỉ giao hàng');
            fetchOrders();
        } catch (err) {
            const backendMsg = err?.response?.data?.message || err?.message;
            showToast('❌ Lỗi: ' + (backendMsg || 'Không thể cập nhật địa chỉ'));
            throw err; // re-throw so OrderSlideOver can exit loading state
        }
    }, [showToast, fetchOrders]);
    // ── Update order items (API) ───────────────────────────────────────
    const handleItemsUpdate = useCallback(async (orderId, itemsData) => {
        try {
            // Remember old coupon state before update
            const oldCouponId = selectedOrderDetail?.coupon_id || selectedOrder?.coupon_id;
            const oldCouponDiscount = selectedOrderDetail?.coupon_discount_amount || selectedOrder?.coupon_discount_amount || 0;

            const response = await orderAPI.updateItems(orderId, itemsData);
            if (response?.data) {
                const updated = normalizeOrder(response.data);
                setSelectedOrderDetail(updated);
                setSelectedOrder((prev) => prev ? { ...prev, ...updated } : prev);

                // Detect coupon changes after recalculation
                if (oldCouponId && !updated.coupon_id) {
                    showToast('⚠️ Mã giảm giá đã bị gỡ do đơn hàng không còn đủ điều kiện');
                } else if (oldCouponId && updated.coupon_discount_amount !== oldCouponDiscount) {
                    showToast('✅ Đã cập nhật sản phẩm — giá trị mã giảm giá đã được tính lại');
                } else {
                    showToast('✅ Đã cập nhật sản phẩm');
                }
            } else {
                showToast('✅ Đã cập nhật sản phẩm');
            }
            fetchOrders();
        } catch (err) {
            const backendMsg = err?.response?.data?.message || err?.message;
            showToast('❌ Lỗi: ' + (backendMsg || 'Không thể cập nhật sản phẩm'));
            throw err;
        }
    }, [showToast, fetchOrders, selectedOrderDetail, selectedOrder]);
    // ── Export CSV (API) ──────────────────────────────────────────
    const handleExportCsv = useCallback(async () => {
        try {
            const requestBody = {
                search: filters.search || undefined,
                status: activeTab !== 'Tất cả' ? activeTab : (filters.status || undefined),
                paymentStatus: filters.paymentStatus || undefined,
                orderType: filters.orderType || undefined,
                dateFrom: filters.dateFrom || undefined,
                dateTo: filters.dateTo || undefined,
            };
            const response = await fetch('http://localhost:8080/api/admin/orders/export-csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) throw new Error('Export failed');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'orders.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showToast('✅ Đã xuất CSV thành công');
        } catch {
            showToast('❌ Lỗi khi xuất CSV');
        }
    }, [filters, activeTab, showToast]);

    // ── Render ────────────────────────────────────────────────────
    return (
        <div className="order-mgmt">
            {/* Page header */}
            <div className="om-page-header">
                <div className="header-left">
                    <h1>🛍️ Quản lý đơn hàng</h1>
                    <p>{todayLabel}</p>
                </div>
                <div className="om-header-actions">
                    <button className="om-btn om-btn-outline" onClick={handleExportCsv}>
                        📥 Xuất CSV
                    </button>
                    <button className="om-btn om-btn-primary">
                        ➕ Tạo đơn thủ công
                    </button>
                </div>
            </div>

            {/* KPI cards — now fetches its own data from backend */}
            <OrderKpiCards />

            {/* Filters & tabs */}
            <OrderFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                statusCounts={statusCounts}
                resultCount={totalElements}
            />

            {/* Orders table */}
            <OrderTable
                orders={orders}
                onRowClick={fetchOrderDetail}
                sortConfig={sortConfig}
                onSort={handleSort}
                onCopyOrderNum={handleCopyOrderNum}
                onPrintOrder={handlePrintOrder}
                onCancelOrder={handleCancelOrder}
                loading={loading}
                isManager={isManager}
            />

            {/* Pagination */}
            {!loading && orders.length > 0 && (
                <OrderPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            )}

            {/* Slide-over detail panel */}
            <OrderSlideOver
                order={selectedOrderDetail || selectedOrder}
                onClose={() => { setSelectedOrder(null); setSelectedOrderDetail(null); }}
                onStatusChange={handleStatusChange}
                onCopyOrderNum={handleCopyOrderNum}
                onCancelOrder={handleCancelOrder}
                onPrintOrder={handlePrintOrder}
                onAddressUpdate={handleAddressUpdate}
                onItemsUpdate={handleItemsUpdate}
                onConfirmPayment={handleConfirmPayment}
                onConfirmRefund={handleConfirmRefund}
                isManager={isManager}
            />

            {/* Toast notification */}
            {toast && (
                <div className="om-toast">{toast}</div>
            )}

            {inactiveOrderIssue && (
                <div className="om-confirm-overlay">
                    <div className="om-confirm-dialog om-inactive-modal">
                        <h3>Không thể xác nhận đơn hàng</h3>
                        <p>Có sản phẩm hoặc biến thể đã ngừng bán. Kiểm tra danh sách dưới đây trước khi xử lý tiếp.</p>

                        {inactiveOrderIssue.mode === 'bulk' ? (
                            <div className="om-inactive-list">
                                {(inactiveOrderIssue.orders || []).map((order) => (
                                    <div className="om-inactive-order" key={order.orderId}>
                                        <strong>#{order.orderNumber || order.orderId}</strong>
                                        {(order.items || []).map((item) => (
                                            <div className="om-inactive-item" key={`${order.orderId}-${item.orderItemId || item.variantId}`}>
                                                <span>{item.productName || 'Sản phẩm'} · {item.sku || 'N/A'}</span>
                                                <small>Biến thể: {item.variantStatus || '-'} · Sản phẩm: {item.productStatus || '-'}</small>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="om-inactive-list">
                                {(inactiveOrderIssue.items || []).map((item) => (
                                    <div className="om-inactive-item" key={item.orderItemId || item.variantId}>
                                        <span>{item.productName || 'Sản phẩm'} · {item.sku || 'N/A'}</span>
                                        <small>Biến thể: {item.variantStatus || '-'} · Sản phẩm: {item.productStatus || '-'}</small>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="om-confirm-actions">
                            <button className="om-btn om-btn-outline" onClick={() => setInactiveOrderIssue(null)}>
                                Đóng
                            </button>
                            {inactiveOrderIssue.mode === 'single' && (
                                <>
                                    <button
                                        className="om-btn om-btn-outline"
                                        onClick={() => {
                                            const phone = inactiveOrderIssue.order?.customer_phone || inactiveOrderIssue.order?.customerPhone;
                                            if (phone) navigator.clipboard?.writeText(phone);
                                            showToast(phone ? `Đã sao chép SĐT: ${phone}` : 'Không có số điện thoại khách hàng');
                                        }}
                                    >
                                        Liên hệ khách hàng
                                    </button>
                                    <button
                                        className="om-btn om-btn-danger-outline"
                                        onClick={() => {
                                            const order = inactiveOrderIssue.order;
                                            setInactiveOrderIssue(null);
                                            if (order) setCancelDialogOrder(order);
                                        }}
                                    >
                                        Hủy đơn hàng
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel order dialog */}
            <CancelOrderDialog
                order={cancelDialogOrder}
                onConfirm={handleConfirmCancel}
                onCancel={() => setCancelDialogOrder(null)}
            />

        </div>
    );
};

export default OrderManagement;

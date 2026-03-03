import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { formatVND } from '../../../../utils/formatPrice';
import { normalizeOrder } from './orderMappers';
import { STATUS_CONFIG } from './orderConstants';
import { orderAPI } from '../../../../services/api';
import OrderKpiCards from './OrderKpiCards';
import OrderFilters from './OrderFilters';
import OrderTable from './OrderTable';
import OrderSlideOver from './OrderSlideOver';
import OrderPagination from './OrderPagination';
import './OrderManagement.css';

/**
 * OrderManagement — parent orchestrator component.
 * Connects to backend API for all data operations.
 */
const OrderManagement = () => {
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

    // Selection state
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Slide-over state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

    // Toast state
    const [toast, setToast] = useState(null);

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState(null);

    // Status counts (computed from a separate full query or tracked)
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
            // Fetch total count (no filters)
            const allRes = await orderAPI.search({ pageNum: 0, pageSize: 1 });
            const allTotal = allRes?.data?.totalElements || 0;

            const statuses = ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Trả hàng/Hoàn tiền', 'Đã hủy'];
            const counts = { 'Tất cả': allTotal };

            // Fetch counts per status in parallel
            const results = await Promise.all(
                statuses.map((s) =>
                    orderAPI.search({ status: s, pageNum: 0, pageSize: 1 })
                        .then((res) => ({ status: s, count: res?.data?.totalElements || 0 }))
                        .catch(() => ({ status: s, count: 0 }))
                )
            );

            results.forEach(({ status, count }) => {
                counts[status] = count;
            });

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

    const handleToggleSelect = useCallback((id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleToggleSelectAll = useCallback(() => {
        if (selectedIds.size === orders.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(orders.map((o) => o.order_id)));
        }
    }, [orders, selectedIds]);

    const handleDeselectAll = useCallback(() => {
        setSelectedIds(new Set());
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
    const handleCancelOrder = useCallback((order) => {
        setConfirmDialog({
            title: 'Hủy đơn hàng?',
            message: `Bạn có chắc chắn muốn hủy đơn #${order.order_number}? Thao tác này không thể hoàn tác.`,
            onConfirm: async () => {
                try {
                    await orderAPI.cancel(order.order_id);
                    showToast(`Đã hủy đơn #${order.order_number}`);
                    setConfirmDialog(null);
                    setSelectedOrder(null);
                    setSelectedOrderDetail(null);
                    fetchOrders();
                    fetchStatusCounts();
                } catch (err) {
                    const backendMsg = err?.response?.data?.message;
                    showToast('❌ Lỗi: ' + (backendMsg || 'Không thể hủy đơn hàng'));
                    setConfirmDialog(null);
                }
            },
            onCancel: () => setConfirmDialog(null),
        });
    }, [showToast, fetchOrders, fetchStatusCounts]);

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
            const backendMsg = err?.response?.data?.message;
            showToast('❌ Lỗi: ' + (backendMsg || 'Không thể cập nhật trạng thái'));
        }
    }, [showToast, fetchOrders, fetchStatusCounts, selectedOrderDetail]);

    // ── Bulk confirm (API) ────────────────────────────────────────
    const handleBulkConfirm = useCallback(async () => {
        try {
            await orderAPI.bulkConfirm({ orderIds: [...selectedIds] });
            showToast(`Đã xác nhận ${selectedIds.size} đơn hàng`);
            setSelectedIds(new Set());
            fetchOrders();
            fetchStatusCounts();
        } catch (err) {
            const backendMsg = err?.response?.data?.message;
            showToast('❌ Lỗi: ' + (backendMsg || 'Không thể xác nhận hàng loạt'));
        }
    }, [selectedIds, showToast, fetchOrders, fetchStatusCounts]);

    // ── Bulk cancel (API) ─────────────────────────────────────────
    const handleBulkCancel = useCallback(() => {
        setConfirmDialog({
            title: 'Hủy nhiều đơn hàng?',
            message: `Bạn có chắc chắn muốn hủy ${selectedIds.size} đơn hàng đã chọn?`,
            onConfirm: async () => {
                try {
                    await orderAPI.bulkCancel({ orderIds: [...selectedIds] });
                    showToast(`Đã hủy ${selectedIds.size} đơn hàng`);
                    setSelectedIds(new Set());
                    setConfirmDialog(null);
                    fetchOrders();
                    fetchStatusCounts();
                } catch (err) {
                    const backendMsg = err?.response?.data?.message;
                    showToast('❌ Lỗi: ' + (backendMsg || 'Không thể hủy hàng loạt'));
                    setConfirmDialog(null);
                }
            },
            onCancel: () => setConfirmDialog(null),
        });
    }, [selectedIds, showToast, fetchOrders, fetchStatusCounts]);

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
        } catch (err) {
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

            {/* Bulk actions bar */}
            {selectedIds.size > 0 && (
                <div className="om-bulk-bar">
                    <span className="om-bulk-label">Đã chọn {selectedIds.size} đơn hàng</span>
                    <button className="om-btn om-btn-primary om-btn-sm" onClick={handleBulkConfirm}>
                        ✅ Xác nhận hàng loạt
                    </button>
                    <button className="om-btn om-btn-outline om-btn-sm" onClick={handlePrintOrder}>
                        🖨️ In hóa đơn
                    </button>
                    <button className="om-btn om-btn-outline om-btn-sm" onClick={handleExportCsv}>
                        📊 Xuất Excel
                    </button>
                    <button className="om-btn om-btn-danger-outline om-btn-sm" onClick={handleBulkCancel}>
                        ❌ Hủy đơn
                    </button>
                    <button className="om-clear-link" onClick={handleDeselectAll}>
                        Bỏ chọn tất cả
                    </button>
                </div>
            )}

            {/* Orders table */}
            <OrderTable
                orders={orders}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onRowClick={fetchOrderDetail}
                sortConfig={sortConfig}
                onSort={handleSort}
                onCopyOrderNum={handleCopyOrderNum}
                onPrintOrder={handlePrintOrder}
                onCancelOrder={handleCancelOrder}
                allSelected={selectedIds.size > 0 && selectedIds.size === orders.length}
                loading={loading}
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
            />

            {/* Toast notification */}
            {toast && (
                <div className="om-toast">{toast}</div>
            )}

            {/* Confirm dialog */}
            {confirmDialog && (
                <div className="om-confirm-overlay">
                    <div className="om-confirm-dialog">
                        <h3>{confirmDialog.title}</h3>
                        <p>{confirmDialog.message}</p>
                        <div className="om-confirm-actions">
                            <button className="om-btn om-btn-outline" onClick={confirmDialog.onCancel}>
                                Hủy bỏ
                            </button>
                            <button className="om-btn om-btn-danger-outline" onClick={confirmDialog.onConfirm}>
                                Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;

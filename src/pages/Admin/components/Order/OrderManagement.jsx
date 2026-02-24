import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { mockOrders, STATUS_CONFIG, formatVND } from './mockOrders';
import OrderKpiCards from './OrderKpiCards';
import OrderFilters from './OrderFilters';
import OrderTable from './OrderTable';
import OrderSlideOver from './OrderSlideOver';
import OrderPagination from './OrderPagination';
import './OrderManagement.css';

/**
 * OrderManagement — parent orchestrator component.
 * Manages filters, sorting, pagination, selection, slide-over,
 * toast notifications, and cancel confirmations.
 */
const OrderManagement = () => {
    // ── State ─────────────────────────────────────────────────────
    const [orders, setOrders] = useState(mockOrders);
    const [loading, setLoading] = useState(true);

    // Simulate initial loading
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(t);
    }, []);

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

    // Toast state
    const [toast, setToast] = useState(null);

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState(null);

    // ── Today's date string for the subtitle ──────────────────────
    const todayLabel = (() => {
        const d = new Date('2026-02-24T10:00:00+07:00');
        const days = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        return `${days[d.getDay()]}, ${d.getDate()} tháng ${months[d.getMonth()]}, ${d.getFullYear()}`;
    })();

    // ── Filter logic ──────────────────────────────────────────────
    const filteredOrders = useMemo(() => {
        let result = [...orders];

        // Tab filter (overrides status dropdown when not "Tất cả")
        if (activeTab !== 'Tất cả') {
            result = result.filter((o) => o.status === activeTab);
        }

        // Search filter
        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((o) =>
                o.order_number.toLowerCase().includes(q) ||
                o.customer_name.toLowerCase().includes(q) ||
                o.customer_phone.includes(q)
            );
        }

        // Dropdown filters
        if (filters.status) {
            result = result.filter((o) => o.status === filters.status);
        }
        if (filters.paymentStatus) {
            result = result.filter((o) => o.payment_status === filters.paymentStatus);
        }
        if (filters.orderType) {
            result = result.filter((o) => o.order_type === filters.orderType);
        }

        // Date range filter
        if (filters.dateFrom) {
            result = result.filter((o) => o.created_at >= filters.dateFrom);
        }
        if (filters.dateTo) {
            const endDate = filters.dateTo + 'T23:59:59';
            result = result.filter((o) => o.created_at <= endDate);
        }

        return result;
    }, [orders, filters, activeTab]);

    // ── Status counts for tabs ────────────────────────────────────
    const statusCounts = useMemo(() => {
        const counts = { 'Tất cả': orders.length };
        Object.keys(STATUS_CONFIG).forEach((s) => {
            counts[s] = orders.filter((o) => o.status === s).length;
        });
        return counts;
    }, [orders]);

    // ── Sorting logic ─────────────────────────────────────────────
    const sortedOrders = useMemo(() => {
        const result = [...filteredOrders];
        if (!sortConfig.key) return result;

        result.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            // Handle numeric vs string comparison
            if (typeof aVal === 'number') {
                return sortConfig.dir === 'asc' ? aVal - bVal : bVal - aVal;
            }
            aVal = String(aVal || '').toLowerCase();
            bVal = String(bVal || '').toLowerCase();
            if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [filteredOrders, sortConfig]);

    // ── Pagination logic ──────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(sortedOrders.length / rowsPerPage));
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return sortedOrders.slice(start, start + rowsPerPage);
    }, [sortedOrders, currentPage, rowsPerPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, activeTab, rowsPerPage]);

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
        // Clear dropdown status filter when using tabs
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
        if (selectedIds.size === paginatedOrders.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedOrders.map((o) => o.order_id)));
        }
    }, [paginatedOrders, selectedIds]);

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

    const handleCancelOrder = useCallback((order) => {
        setConfirmDialog({
            title: 'Hủy đơn hàng?',
            message: `Bạn có chắc chắn muốn hủy đơn #${order.order_number}? Thao tác này không thể hoàn tác.`,
            onConfirm: () => {
                setOrders((prev) =>
                    prev.map((o) => o.order_id === order.order_id ? { ...o, status: 'Đã hủy' } : o)
                );
                showToast(`Đã hủy đơn #${order.order_number}`);
                setConfirmDialog(null);
                setSelectedOrder(null);
            },
            onCancel: () => setConfirmDialog(null),
        });
    }, [showToast]);

    const handleStatusChange = useCallback((orderId, newStatus) => {
        setOrders((prev) =>
            prev.map((o) => o.order_id === orderId ? { ...o, status: newStatus } : o)
        );
        // Update selected order if open in slide-over
        setSelectedOrder((prev) =>
            prev && prev.order_id === orderId ? { ...prev, status: newStatus } : prev
        );
        showToast(`Đã cập nhật trạng thái → ${newStatus}`);
    }, [showToast]);

    const handleBulkConfirm = useCallback(() => {
        setOrders((prev) =>
            prev.map((o) => selectedIds.has(o.order_id) && o.status === 'Chờ xác nhận'
                ? { ...o, status: 'Đã xác nhận' }
                : o
            )
        );
        showToast(`Đã xác nhận ${selectedIds.size} đơn hàng`);
        setSelectedIds(new Set());
    }, [selectedIds, showToast]);

    const handleBulkCancel = useCallback(() => {
        setConfirmDialog({
            title: 'Hủy nhiều đơn hàng?',
            message: `Bạn có chắc chắn muốn hủy ${selectedIds.size} đơn hàng đã chọn?`,
            onConfirm: () => {
                setOrders((prev) =>
                    prev.map((o) => selectedIds.has(o.order_id) ? { ...o, status: 'Đã hủy' } : o)
                );
                showToast(`Đã hủy ${selectedIds.size} đơn hàng`);
                setSelectedIds(new Set());
                setConfirmDialog(null);
            },
            onCancel: () => setConfirmDialog(null),
        });
    }, [selectedIds, showToast]);

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
                    <button className="om-btn om-btn-outline">
                        📥 Xuất CSV
                    </button>
                    <button className="om-btn om-btn-primary">
                        ➕ Tạo đơn thủ công
                    </button>
                </div>
            </div>

            {/* KPI cards */}
            <OrderKpiCards orders={orders} />

            {/* Filters & tabs */}
            <OrderFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                statusCounts={statusCounts}
                resultCount={filteredOrders.length}
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
                    <button className="om-btn om-btn-outline om-btn-sm">
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
                orders={paginatedOrders}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onRowClick={setSelectedOrder}
                sortConfig={sortConfig}
                onSort={handleSort}
                onCopyOrderNum={handleCopyOrderNum}
                onPrintOrder={handlePrintOrder}
                onCancelOrder={handleCancelOrder}
                allSelected={selectedIds.size > 0 && selectedIds.size === paginatedOrders.length}
                loading={loading}
            />

            {/* Pagination */}
            {!loading && sortedOrders.length > 0 && (
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
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
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

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    mockReturns as initialReturns,
    RETURN_STATUS_CONFIG, ALL_RETURN_STATUSES, formatVND,
} from './mockReturns';
import ReturnKpiCards from './ReturnKpiCards';
import ReturnFilters from './ReturnFilters';
import ReturnTable from './ReturnTable';
import ReturnDetailSlideOver from './ReturnDetailSlideOver';
import ReturnPagination from './ReturnPagination';
import RejectReasonModal from './RejectReasonModal';
import CreateReturnModal from './CreateReturnModal';
import './ReturnManagement.css';

/**
 * ReturnManagement — parent orchestrator component.
 * Manages filters, sorting, pagination, selection, slide-over,
 * modals, toast notifications, and all return lifecycle actions.
 */
const ReturnManagement = () => {
    // ── State ─────────────────────────────────────────────────────
    const [returns, setReturns] = useState(initialReturns);
    const [loading, setLoading] = useState(true);

    // Simulate initial loading
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(t);
    }, []);

    // Filter state
    const [filters, setFilters] = useState({
        search: '',
        returnStatus: '',
        reason: '',
        refundMethod: '',
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
    const [selectedReturn, setSelectedReturn] = useState(null);

    // Modal state
    const [rejectTarget, setRejectTarget] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Toast state
    const [toast, setToast] = useState(null);

    // ── Today's date string ───────────────────────────────────────
    const todayLabel = (() => {
        const d = new Date('2026-02-24T10:00:00+07:00');
        const days = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        return `${days[d.getDay()]}, ${d.getDate()} tháng ${months[d.getMonth()]}, ${d.getFullYear()}`;
    })();

    // ── Filter logic ──────────────────────────────────────────────
    const filteredReturns = useMemo(() => {
        let result = [...returns];

        // Tab filter
        if (activeTab !== 'Tất cả') {
            result = result.filter(r => r.return_status === activeTab);
        }

        // Search filter
        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(r =>
                r.return_code.toLowerCase().includes(q) ||
                r.order_number.toLowerCase().includes(q) ||
                r.customer_name.toLowerCase().includes(q) ||
                r.customer_phone.includes(q)
            );
        }

        // Dropdown filters
        if (filters.returnStatus) result = result.filter(r => r.return_status === filters.returnStatus);
        if (filters.reason) result = result.filter(r => r.return_reason === filters.reason);
        if (filters.refundMethod) result = result.filter(r => r.refund_method === filters.refundMethod);
        if (filters.orderType) result = result.filter(r => r.order_type === filters.orderType);

        // Date range filter
        if (filters.dateFrom) result = result.filter(r => r.created_at >= filters.dateFrom);
        if (filters.dateTo) {
            const end = filters.dateTo + 'T23:59:59';
            result = result.filter(r => r.created_at <= end);
        }

        return result;
    }, [returns, filters, activeTab]);

    // ── Status counts for tabs ────────────────────────────────────
    const statusCounts = useMemo(() => {
        const counts = { 'Tất cả': returns.length };
        Object.keys(RETURN_STATUS_CONFIG).forEach(s => {
            counts[s] = returns.filter(r => r.return_status === s).length;
        });
        return counts;
    }, [returns]);

    // ── Sorting logic ─────────────────────────────────────────────
    const sortedReturns = useMemo(() => {
        const result = [...filteredReturns];
        if (!sortConfig.key) return result;
        result.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if (typeof aVal === 'number') return sortConfig.dir === 'asc' ? aVal - bVal : bVal - aVal;
            aVal = String(aVal || '').toLowerCase();
            bVal = String(bVal || '').toLowerCase();
            if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
            return 0;
        });
        return result;
    }, [filteredReturns, sortConfig]);

    // ── Pagination logic ──────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(sortedReturns.length / rowsPerPage));
    const paginatedReturns = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return sortedReturns.slice(start, start + rowsPerPage);
    }, [sortedReturns, currentPage, rowsPerPage]);

    useEffect(() => { setCurrentPage(1); }, [filters, activeTab, rowsPerPage]);

    // ── Handlers ──────────────────────────────────────────────────
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters({ search: '', returnStatus: '', reason: '', refundMethod: '', orderType: '', dateFrom: '', dateTo: '' });
        setActiveTab('Tất cả');
    }, []);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setFilters(prev => ({ ...prev, returnStatus: '' }));
    }, []);

    const handleSort = useCallback((key) => {
        setSortConfig(prev => ({
            key,
            dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
        }));
    }, []);

    const handleToggleSelect = useCallback((id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    const handleToggleSelectAll = useCallback(() => {
        if (selectedIds.size === paginatedReturns.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedReturns.map(r => r.return_id)));
        }
    }, [paginatedReturns, selectedIds]);

    const handleDeselectAll = useCallback(() => { setSelectedIds(new Set()); }, []);

    const showToast = useCallback((message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2500);
    }, []);

    const handleCopyReturnCode = useCallback((code) => {
        navigator.clipboard?.writeText(code).then(() => {
            showToast('✅ Đã sao chép!');
        }).catch(() => {
            showToast('Đã sao chép: ' + code);
        });
    }, [showToast]);

    const handlePrint = useCallback(() => { window.print(); }, []);

    const handleStatusChange = useCallback((returnId, newStatus) => {
        setReturns(prev => prev.map(r => r.return_id === returnId ? { ...r, return_status: newStatus } : r));
        setSelectedReturn(prev => prev && prev.return_id === returnId ? { ...prev, return_status: newStatus } : prev);
        showToast(`Đã cập nhật trạng thái → ${newStatus}`);
    }, [showToast]);

    const handleApprove = useCallback((ret) => {
        handleStatusChange(ret.return_id, 'Đã duyệt');
    }, [handleStatusChange]);

    const handleRejectConfirm = useCallback((ret, reason, message) => {
        setReturns(prev => prev.map(r =>
            r.return_id === ret.return_id
                ? { ...r, return_status: 'Từ chối', reject_reason: reason, reject_note: message }
                : r
        ));
        setSelectedReturn(prev =>
            prev && prev.return_id === ret.return_id
                ? { ...prev, return_status: 'Từ chối', reject_reason: reason, reject_note: message }
                : prev
        );
        showToast(`Đã từ chối yêu cầu ${ret.return_code}`);
        setRejectTarget(null);
    }, [showToast]);

    const handleBulkApprove = useCallback(() => {
        setReturns(prev => prev.map(r =>
            selectedIds.has(r.return_id) && r.return_status === 'Chờ duyệt'
                ? { ...r, return_status: 'Đã duyệt' }
                : r
        ));
        showToast(`Đã duyệt ${selectedIds.size} yêu cầu trả hàng`);
        setSelectedIds(new Set());
    }, [selectedIds, showToast]);

    const handleBulkReject = useCallback(() => {
        setReturns(prev => prev.map(r =>
            selectedIds.has(r.return_id) && r.return_status === 'Chờ duyệt'
                ? { ...r, return_status: 'Từ chối', reject_reason: 'Từ chối hàng loạt' }
                : r
        ));
        showToast(`Đã từ chối ${selectedIds.size} yêu cầu trả hàng`);
        setSelectedIds(new Set());
    }, [selectedIds, showToast]);

    const handleCreateReturn = useCallback((newReturn) => {
        setReturns(prev => [newReturn, ...prev]);
        setShowCreateModal(false);
        showToast(`✅ Đã tạo yêu cầu ${newReturn.return_code}`);
    }, [showToast]);

    // ── Render ────────────────────────────────────────────────────
    return (
        <div className="return-mgmt">
            {/* Page header */}
            <div className="rm-page-header">
                <div className="header-left">
                    <h1>↩️ Quản lý trả hàng</h1>
                    <p>{todayLabel}</p>
                </div>
                <div className="rm-header-actions">
                    <button className="rm-btn rm-btn-outline">
                        📥 Xuất báo cáo
                    </button>
                    <button
                        className="rm-btn rm-btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        ➕ Tạo yêu cầu trả hàng
                    </button>
                </div>
            </div>

            {/* KPI cards */}
            <ReturnKpiCards returns={returns} />

            {/* Filters & tabs */}
            <ReturnFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                statusCounts={statusCounts}
                resultCount={filteredReturns.length}
            />

            {/* Bulk actions bar */}
            {selectedIds.size > 0 && (
                <div className="rm-bulk-bar">
                    <span className="rm-bulk-label">Đã chọn {selectedIds.size} yêu cầu</span>
                    <button className="rm-btn rm-btn-primary rm-btn-sm" onClick={handleBulkApprove}>
                        ✅ Duyệt hàng loạt
                    </button>
                    <button className="rm-btn rm-btn-danger-outline rm-btn-sm" onClick={handleBulkReject}>
                        ❌ Từ chối hàng loạt
                    </button>
                    <button className="rm-btn rm-btn-outline rm-btn-sm">
                        📊 Xuất Excel
                    </button>
                    <button className="rm-btn rm-btn-outline rm-btn-sm" onClick={handlePrint}>
                        🖨 In phiếu trả
                    </button>
                    <button className="rm-clear-link" onClick={handleDeselectAll}>
                        Bỏ chọn tất cả
                    </button>
                </div>
            )}

            {/* Return table */}
            <ReturnTable
                returns={paginatedReturns}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onRowClick={setSelectedReturn}
                sortConfig={sortConfig}
                onSort={handleSort}
                onCopyReturnCode={handleCopyReturnCode}
                onApprove={handleApprove}
                onReject={(ret) => setRejectTarget(ret)}
                onPrint={handlePrint}
                allSelected={selectedIds.size > 0 && selectedIds.size === paginatedReturns.length}
                loading={loading}
            />

            {/* Pagination */}
            {!loading && sortedReturns.length > 0 && (
                <ReturnPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            )}

            {/* Slide-over detail panel */}
            {selectedReturn && (
                <ReturnDetailSlideOver
                    returnItem={selectedReturn}
                    onClose={() => setSelectedReturn(null)}
                    onStatusChange={handleStatusChange}
                    onCopyReturnCode={handleCopyReturnCode}
                    onApprove={handleApprove}
                    onReject={(ret) => { setSelectedReturn(null); setRejectTarget(ret); }}
                    onPrint={handlePrint}
                />
            )}

            {/* Reject reason modal */}
            {rejectTarget && (
                <RejectReasonModal
                    returnItem={rejectTarget}
                    onConfirm={handleRejectConfirm}
                    onCancel={() => setRejectTarget(null)}
                />
            )}

            {/* Create return modal */}
            {showCreateModal && (
                <CreateReturnModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateReturn}
                />
            )}

            {/* Toast notification */}
            {toast && <div className="rm-toast">{toast}</div>}
        </div>
    );
};

export default ReturnManagement;

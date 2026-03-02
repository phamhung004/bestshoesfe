import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
    RETURN_STATUS_CONFIG, formatVND,
} from './mockReturns';
import { returnAPI } from '../../../../services/api';
import { normalizeReturn } from './returnMappers';
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
 * Connects to backend API for all data operations.
 */
const ReturnManagement = () => {
    // ── State ─────────────────────────────────────────────────────
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

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
    const [selectedReturnDetail, setSelectedReturnDetail] = useState(null);

    // Modal state
    const [rejectTarget, setRejectTarget] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Toast state
    const [toast, setToast] = useState(null);

    // Status counts (fetched from backend)
    const [statusCounts, setStatusCounts] = useState({ 'Tất cả': 0 });

    // Ref to prevent race conditions
    const fetchIdRef = useRef(0);

    // ── Today's date string ───────────────────────────────────────
    const todayLabel = useMemo(() => {
        const d = new Date();
        const days = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        return `${days[d.getDay()]}, ${d.getDate()} tháng ${months[d.getMonth()]}, ${d.getFullYear()}`;
    }, []);

    // ── Fetch returns from backend ────────────────────────────────
    const fetchReturns = useCallback(async () => {
        const fetchId = ++fetchIdRef.current;
        setLoading(true);

        try {
            // Map frontend sortConfig key to backend field name
            const sortKeyMap = {
                'created_at': 'createdAt',
                'updated_at': 'updatedAt',
                'total_amount': 'totalAmount',
                'return_code': 'returnCode',
                'customer_name': 'customerName',
                'order_number': 'orderNumber',
            };

            const requestBody = {
                search: filters.search || undefined,
                returnStatus: activeTab !== 'Tất cả' ? activeTab : (filters.returnStatus || undefined),
                reason: filters.reason || undefined,
                refundMethod: filters.refundMethod || undefined,
                orderType: filters.orderType || undefined,
                dateFrom: filters.dateFrom || undefined,
                dateTo: filters.dateTo || undefined,
                sortBy: sortKeyMap[sortConfig.key] || sortConfig.key || 'createdAt',
                sortDir: sortConfig.dir || 'desc',
                pageNum: currentPage - 1,  // backend is 0-based
                pageSize: rowsPerPage,
            };

            const response = await returnAPI.search(requestBody);

            // Only apply if this is still the latest fetch
            if (fetchId !== fetchIdRef.current) return;

            const pageData = response?.data;
            if (pageData) {
                const normalized = (pageData.content || []).map(normalizeReturn);
                setReturns(normalized);
                setTotalPages(pageData.totalPages || 1);
                setTotalElements(pageData.totalElements || 0);
            }
        } catch (err) {
            console.error('Failed to fetch returns:', err);
            if (fetchId === fetchIdRef.current) {
                setReturns([]);
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
            const allRes = await returnAPI.search({ pageNum: 0, pageSize: 1 });
            const allTotal = allRes?.data?.totalElements || 0;

            const statuses = Object.keys(RETURN_STATUS_CONFIG);
            const counts = { 'Tất cả': allTotal };

            // Fetch counts per status in parallel
            const results = await Promise.all(
                statuses.map((s) =>
                    returnAPI.search({ returnStatus: s, pageNum: 0, pageSize: 1 })
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
        fetchReturns();
    }, [fetchReturns]);

    // Fetch status counts on mount and after mutations
    useEffect(() => {
        fetchStatusCounts();
    }, [fetchStatusCounts]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, activeTab, rowsPerPage]);

    // ── Fetch return detail for slide-over ────────────────────────
    const fetchReturnDetail = useCallback(async (ret) => {
        setSelectedReturn(ret); // show slide-over immediately with summary data
        try {
            const response = await returnAPI.getById(ret.return_id);
            if (response?.data) {
                setSelectedReturnDetail(normalizeReturn(response.data));
            }
        } catch (err) {
            console.error('Failed to fetch return detail:', err);
            // Keep the summary data as fallback
            setSelectedReturnDetail(ret);
        }
    }, []);

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
        if (selectedIds.size === returns.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(returns.map(r => r.return_id)));
        }
    }, [returns, selectedIds]);

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

    // ── Update status (API) ───────────────────────────────────────
    const handleStatusChange = useCallback(async (returnId, newStatus) => {
        try {
            await returnAPI.updateStatus(returnId, { status: newStatus });
            showToast(`Đã cập nhật trạng thái → ${newStatus}`);
            // Refresh the detail if open
            if (selectedReturnDetail && selectedReturnDetail.return_id === returnId) {
                setSelectedReturnDetail(prev => prev ? { ...prev, return_status: newStatus } : prev);
            }
            fetchReturns();
            fetchStatusCounts();
        } catch (err) {
            showToast('❌ Lỗi: ' + (err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái'));
        }
    }, [showToast, fetchReturns, fetchStatusCounts, selectedReturnDetail]);

    // ── Approve (API) ─────────────────────────────────────────────
    const handleApprove = useCallback(async (ret) => {
        await handleStatusChange(ret.return_id, 'Đã duyệt');
    }, [handleStatusChange]);

    // ── Reject (API) ──────────────────────────────────────────────
    const handleRejectConfirm = useCallback(async (ret, reason, message) => {
        try {
            await returnAPI.reject(ret.return_id, { rejectReason: reason, rejectNote: message });
            showToast(`Đã từ chối yêu cầu ${ret.return_code}`);
            setRejectTarget(null);
            setSelectedReturn(null);
            setSelectedReturnDetail(null);
            fetchReturns();
            fetchStatusCounts();
        } catch (err) {
            showToast('❌ Lỗi: ' + (err?.response?.data?.message || err?.message || 'Không thể từ chối'));
        }
    }, [showToast, fetchReturns, fetchStatusCounts]);

    // ── Bulk approve (API) ────────────────────────────────────────
    const handleBulkApprove = useCallback(async () => {
        try {
            await returnAPI.bulkApprove({ returnIds: [...selectedIds] });
            showToast(`Đã duyệt ${selectedIds.size} yêu cầu trả hàng`);
            setSelectedIds(new Set());
            fetchReturns();
            fetchStatusCounts();
        } catch (err) {
            showToast('❌ Lỗi: ' + (err?.response?.data?.message || err?.message || 'Không thể duyệt hàng loạt'));
        }
    }, [selectedIds, showToast, fetchReturns, fetchStatusCounts]);

    // ── Bulk reject (API) ─────────────────────────────────────────
    const handleBulkReject = useCallback(async () => {
        try {
            await returnAPI.bulkReject({ returnIds: [...selectedIds] });
            showToast(`Đã từ chối ${selectedIds.size} yêu cầu trả hàng`);
            setSelectedIds(new Set());
            fetchReturns();
            fetchStatusCounts();
        } catch (err) {
            showToast('❌ Lỗi: ' + (err?.response?.data?.message || err?.message || 'Không thể từ chối hàng loạt'));
        }
    }, [selectedIds, showToast, fetchReturns, fetchStatusCounts]);

    // ── Create return callback ────────────────────────────────────
    const handleCreateReturn = useCallback(() => {
        setShowCreateModal(false);
        showToast('✅ Đã tạo yêu cầu trả hàng');
        fetchReturns();
        fetchStatusCounts();
    }, [showToast, fetchReturns, fetchStatusCounts]);

    // ── Export CSV (API) ──────────────────────────────────────────
    const handleExportCsv = useCallback(async () => {
        try {
            const requestBody = {
                search: filters.search || undefined,
                returnStatus: activeTab !== 'Tất cả' ? activeTab : (filters.returnStatus || undefined),
                reason: filters.reason || undefined,
                refundMethod: filters.refundMethod || undefined,
                orderType: filters.orderType || undefined,
                dateFrom: filters.dateFrom || undefined,
                dateTo: filters.dateTo || undefined,
            };
            const response = await fetch('http://localhost:8080/api/admin/returns/export-csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) throw new Error('Export failed');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'returns.csv';
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
        <div className="return-mgmt">
            {/* Page header */}
            <div className="rm-page-header">
                <div className="header-left">
                    <h1>↩️ Quản lý trả hàng</h1>
                    <p>{todayLabel}</p>
                </div>
                <div className="rm-header-actions">
                    <button className="rm-btn rm-btn-outline" onClick={handleExportCsv}>
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

            {/* KPI cards — self-fetching from backend */}
            <ReturnKpiCards />

            {/* Filters & tabs */}
            <ReturnFilters
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
                <div className="rm-bulk-bar">
                    <span className="rm-bulk-label">Đã chọn {selectedIds.size} yêu cầu</span>
                    <button className="rm-btn rm-btn-primary rm-btn-sm" onClick={handleBulkApprove}>
                        ✅ Duyệt hàng loạt
                    </button>
                    <button className="rm-btn rm-btn-danger-outline rm-btn-sm" onClick={handleBulkReject}>
                        ❌ Từ chối hàng loạt
                    </button>
                    <button className="rm-btn rm-btn-outline rm-btn-sm" onClick={handleExportCsv}>
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
                returns={returns}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onRowClick={fetchReturnDetail}
                sortConfig={sortConfig}
                onSort={handleSort}
                onCopyReturnCode={handleCopyReturnCode}
                onApprove={handleApprove}
                onReject={(ret) => setRejectTarget(ret)}
                onPrint={handlePrint}
                allSelected={selectedIds.size > 0 && selectedIds.size === returns.length}
                loading={loading}
            />

            {/* Pagination */}
            {!loading && returns.length > 0 && (
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
                    returnItem={selectedReturnDetail || selectedReturn}
                    onClose={() => { setSelectedReturn(null); setSelectedReturnDetail(null); }}
                    onStatusChange={handleStatusChange}
                    onCopyReturnCode={handleCopyReturnCode}
                    onApprove={handleApprove}
                    onReject={(ret) => { setSelectedReturn(null); setSelectedReturnDetail(null); setRejectTarget(ret); }}
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

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, RefreshCw, Ticket, AlertTriangle } from 'lucide-react';
import { couponAPI } from '../../../../services/api';
import CouponKpiCards from './CouponKpiCards';
import CouponFilters from './CouponFilters';
import CouponTable from './CouponTable';
import CouponSlideOver from './CouponSlideOver';
import CouponPagination from './CouponPagination';
import CouponForm from './CouponForm';
import './CouponManagement.css';

/* ── status helpers ──────────────────────────────────────────────── */

const getCouponStatusKey = (coupon) => {
    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.endDate);
    if (!coupon.status) return 'inactive';
    if (now > end) return 'expired';
    if (now < start) return 'upcoming';
    const diff = end - now;
    const daysLeft = diff / (1000 * 60 * 60 * 24);
    if (daysLeft <= 7) return 'expiring';
    return 'active';
};

/* ── component ───────────────────────────────────────────────────── */

const CouponManagement = () => {
    /* ── data state ── */
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    /* ── filters ── */
    const [filters, setFilters] = useState({ search: '', type: '', dateFrom: '', dateTo: '' });
    const [activeTab, setActiveTab] = useState('all');

    /* ── sort ── */
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', dir: 'desc' });

    /* ── pagination ── */
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    /* ── slide-over ── */
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    /* ── form modal ── */
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    /* ── confirm dialog ── */
    const [confirmDialog, setConfirmDialog] = useState(null);

    /* ── toast ── */
    const [toast, setToast] = useState(null);
    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2500);
    }, []);

    /* ── fetch all coupons ── */
    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await couponAPI.getAll();
            setCoupons(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load coupons:', err);
            setError('Không thể tải danh sách mã giảm giá');
            setCoupons([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCoupons(); }, [fetchCoupons, refreshKey]);

    const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

    /* ── tab counts ── */
    const tabCounts = useMemo(() => {
        const counts = { all: 0, active: 0, upcoming: 0, expiring: 0, expired: 0, inactive: 0 };
        coupons.forEach((c) => {
            counts.all++;
            const key = getCouponStatusKey(c);
            if (key === 'expiring') { counts.active++; counts.expiring++; }
            else if (key === 'active') counts.active++;
            else if (counts[key] !== undefined) counts[key]++;
        });
        return counts;
    }, [coupons]);

    /* ── filtered list ── */
    const filteredCoupons = useMemo(() => {
        let list = [...coupons];

        // tab filter
        if (activeTab !== 'all') {
            list = list.filter((c) => {
                const key = getCouponStatusKey(c);
                if (activeTab === 'active') return key === 'active' || key === 'expiring';
                if (activeTab === 'expiring') {
                    const now = new Date();
                    const end = new Date(c.endDate);
                    const daysLeft = (end - now) / (1000 * 60 * 60 * 24);
                    return c.status && daysLeft > 0 && daysLeft <= 7;
                }
                return key === activeTab;
            });
        }

        // type filter
        if (filters.type) list = list.filter((c) => c.type === filters.type);

        // search
        if (filters.search.trim()) {
            const q = filters.search.toLowerCase();
            list = list.filter((c) =>
                c.code?.toLowerCase().includes(q) ||
                c.name?.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q)
            );
        }

        // date range
        if (filters.dateFrom) {
            const from = new Date(filters.dateFrom);
            list = list.filter((c) => new Date(c.startDate) >= from);
        }
        if (filters.dateTo) {
            const to = new Date(filters.dateTo);
            to.setHours(23, 59, 59, 999);
            list = list.filter((c) => new Date(c.endDate) <= to);
        }

        // sort
        if (sortConfig.key) {
            list.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];
                if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate' || sortConfig.key === 'createdAt') {
                    valA = new Date(valA || 0).getTime();
                    valB = new Date(valB || 0).getTime();
                }
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortConfig.dir === 'asc' ? valA - valB : valB - valA;
                }
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
                if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return list;
    }, [coupons, activeTab, filters, sortConfig]);

    /* ── paginated list ── */
    const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / rowsPerPage));
    const paginatedCoupons = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredCoupons.slice(start, start + rowsPerPage);
    }, [filteredCoupons, currentPage, rowsPerPage]);

    /* reset page on filter change */
    useEffect(() => { setCurrentPage(1); }, [filters, activeTab, rowsPerPage]);

    /* ── handlers ── */
    const handleFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters({ search: '', type: '', dateFrom: '', dateTo: '' });
        setActiveTab('all');
    }, []);

    const handleSort = useCallback((key) => {
        setSortConfig((prev) => ({
            key,
            dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
        }));
    }, []);

    /* row click → slide-over */
    const handleRowClick = useCallback((coupon) => {
        setSelectedCoupon(coupon);
    }, []);

    /* form */
    const handleAddNew = useCallback(() => {
        setEditingCoupon(null);
        setShowForm(true);
    }, []);

    const handleEdit = useCallback((coupon) => {
        setEditingCoupon(coupon);
        setShowForm(true);
    }, []);

    const handleFormSave = useCallback(() => {
        setShowForm(false);
        setEditingCoupon(null);
        setSelectedCoupon(null);
        showToast(editingCoupon ? 'Đã cập nhật mã giảm giá' : 'Đã thêm mã giảm giá mới');
        refresh();
    }, [editingCoupon, refresh, showToast]);

    const handleFormCancel = useCallback(() => {
        setShowForm(false);
        setEditingCoupon(null);
    }, []);

    /* toggle status */
    const handleToggleStatus = useCallback(async (coupon) => {
        try {
            await couponAPI.toggleStatus(coupon.couponId);
            showToast(coupon.status ? 'Đã ẩn mã giảm giá' : 'Đã kích hoạt mã giảm giá');
            refresh();
            if (selectedCoupon?.couponId === coupon.couponId) {
                setSelectedCoupon((prev) => prev ? { ...prev, status: !prev.status } : prev);
            }
        } catch (err) {
            showToast('Lỗi: Không thể thay đổi trạng thái', 'error');
            console.error(err);
        }
    }, [refresh, showToast, selectedCoupon]);

    /* delete */
    const handleDelete = useCallback((coupon) => {
        setConfirmDialog({
            title: 'Xóa mã giảm giá?',
            message: `Bạn có chắc chắn muốn xóa "${coupon.code}"? Thao tác này không thể hoàn tác.`,
            onConfirm: async () => {
                try {
                    await couponAPI.delete(coupon.couponId);
                    showToast('Đã xóa mã giảm giá');
                    setConfirmDialog(null);
                    if (selectedCoupon?.couponId === coupon.couponId) setSelectedCoupon(null);
                    refresh();
                } catch (err) {
                    showToast('Lỗi: Không thể xóa mã giảm giá', 'error');
                    setConfirmDialog(null);
                    console.error(err);
                }
            },
            onCancel: () => setConfirmDialog(null),
        });
    }, [refresh, showToast, selectedCoupon]);

    /* ── error state ── */
    if (error && !loading && coupons.length === 0) {
        return (
            <div className="cm-management">
                <div className="cm-empty">
                    <div className="cm-empty-icon"><AlertTriangle size={48} /></div>
                    <h3>{error}</h3>
                    <p>Vui lòng thử tải lại trang</p>
                    <button className="cm-btn cm-btn-primary" onClick={refresh}>
                        <RefreshCw size={14} /> Thử lại
                    </button>
                </div>
            </div>
        );
    }

    /* ── render ── */
    return (
        <div className="cm-management">
            {/* page header */}
            <div className="cm-page-header">
                <div className="header-left">
                    <h1><Ticket size={22} /> Quản lý mã giảm giá</h1>
                    <p>Tạo và quản lý các mã giảm giá cho khách hàng</p>
                </div>
                <div className="cm-header-actions">
                    <button className="cm-btn cm-btn-outline" onClick={refresh}>
                        <RefreshCw size={14} /> Làm mới
                    </button>
                    <button className="cm-btn cm-btn-primary" onClick={handleAddNew}>
                        <Plus size={14} /> Thêm mã giảm giá
                    </button>
                </div>
            </div>

            {/* KPI cards */}
            <CouponKpiCards coupons={coupons} loading={loading} />

            {/* Filters + tabs */}
            <CouponFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabCounts={tabCounts}
                resultCount={filteredCoupons.length}
            />

            {/* Table */}
            <CouponTable
                coupons={paginatedCoupons}
                loading={loading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                sortConfig={sortConfig}
                onSort={handleSort}
                selectedCouponId={selectedCoupon?.couponId}
                pageOffset={(currentPage - 1) * rowsPerPage}
            />

            {/* Pagination */}
            {!loading && filteredCoupons.length > 0 && (
                <CouponPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            )}

            {/* Slide-over */}
            {selectedCoupon && (
                <CouponSlideOver
                    coupon={selectedCoupon}
                    onClose={() => setSelectedCoupon(null)}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                />
            )}

            {/* Form modal */}
            {showForm && (
                <CouponForm
                    coupon={editingCoupon}
                    onSave={handleFormSave}
                    onCancel={handleFormCancel}
                    isEditing={!!editingCoupon}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`cm-toast ${toast.type || 'success'}`}>
                    {toast.message}
                </div>
            )}

            {/* Confirm dialog */}
            {confirmDialog && (
                <div className="cm-confirm-overlay">
                    <div className="cm-confirm-dialog">
                        <div className="cm-confirm-icon"><AlertTriangle size={48} color="var(--warning-500)" /></div>
                        <h3>{confirmDialog.title}</h3>
                        <p>{confirmDialog.message}</p>
                        <div className="cm-confirm-actions">
                            <button className="cm-btn cm-btn-outline" onClick={confirmDialog.onCancel}>
                                Hủy bỏ
                            </button>
                            <button className="cm-btn cm-btn-danger-outline" onClick={confirmDialog.onConfirm}>
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManagement;

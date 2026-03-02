import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, RefreshCw, Tag, AlertTriangle } from 'lucide-react';
import { promotionAPI } from '../../../../services/api';
import PromotionKpiCards from './PromotionKpiCards';
import PromotionFilters from './PromotionFilters';
import PromotionTable from './PromotionTable';
import PromotionSlideOver from './PromotionSlideOver';
import PromotionPagination from './PromotionPagination';
import PromotionForm from './PromotionForm';
import PromotionVariantPicker from './PromotionVariantPicker';
import './PromotionManagement.css';

/* ── status helpers ──────────────────────────────────────────────── */

const getPromotionStatusKey = (promo) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    if (!promo.isActive) return 'inactive';
    if (now > end) return 'expired';
    if (now < start) return 'upcoming';

    // check expiring within 7 days
    const diff = end - now;
    const daysLeft = diff / (1000 * 60 * 60 * 24);
    if (daysLeft <= 7) return 'expiring'; // also "running"

    return 'running';
};

/* ── component ───────────────────────────────────────────────────── */

const PromotionManagement = () => {
    /* ── data state ── */
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    /* ── filters ── */
    const [filters, setFilters] = useState({ search: '', type: '', dateFrom: '', dateTo: '' });
    const [activeTab, setActiveTab] = useState('all');

    /* ── sort ── */
    const [sortConfig, setSortConfig] = useState({ key: 'startDate', dir: 'desc' });

    /* ── pagination ── */
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    /* ── slide-over ── */
    const [selectedPromotion, setSelectedPromotion] = useState(null);

    /* ── form modal ── */
    const [showForm, setShowForm] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);

    /* ── variant picker modal ── */
    const [pickerPromotion, setPickerPromotion] = useState(null);

    /* ── confirm dialog ── */
    const [confirmDialog, setConfirmDialog] = useState(null);

    /* ── toast ── */
    const [toast, setToast] = useState(null);
    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2500);
    }, []);

    /* ── fetch all promotions ── */
    const fetchPromotions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await promotionAPI.getAll();
            setPromotions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load promotions:', err);
            setError('Không thể tải danh sách đợt giảm giá');
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPromotions(); }, [fetchPromotions, refreshKey]);

    const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

    /* ── tab counts ── */
    const tabCounts = useMemo(() => {
        const counts = { all: 0, running: 0, upcoming: 0, expiring: 0, expired: 0, inactive: 0 };
        promotions.forEach((p) => {
            counts.all++;
            const key = getPromotionStatusKey(p);
            if (key === 'expiring') { counts.running++; counts.expiring++; }
            else if (counts[key] !== undefined) counts[key]++;
        });
        return counts;
    }, [promotions]);

    /* ── filtered list ── */
    const filteredPromotions = useMemo(() => {
        let list = [...promotions];

        // tab filter
        if (activeTab !== 'all') {
            list = list.filter((p) => {
                const key = getPromotionStatusKey(p);
                if (activeTab === 'running') return key === 'running' || key === 'expiring';
                if (activeTab === 'expiring') {
                    const now = new Date();
                    const end = new Date(p.endDate);
                    const daysLeft = (end - now) / (1000 * 60 * 60 * 24);
                    return p.isActive && daysLeft > 0 && daysLeft <= 7;
                }
                return key === activeTab;
            });
        }

        // type filter
        if (filters.type) list = list.filter((p) => p.type === filters.type);

        // search
        if (filters.search.trim()) {
            const q = filters.search.toLowerCase();
            list = list.filter((p) =>
                p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
            );
        }

        // date range
        if (filters.dateFrom) {
            const from = new Date(filters.dateFrom);
            list = list.filter((p) => new Date(p.startDate) >= from);
        }
        if (filters.dateTo) {
            const to = new Date(filters.dateTo);
            to.setHours(23, 59, 59, 999);
            list = list.filter((p) => new Date(p.endDate) <= to);
        }

        // sort
        if (sortConfig.key) {
            list.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];
                if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
                    valA = new Date(valA || 0).getTime();
                    valB = new Date(valB || 0).getTime();
                }
                if (sortConfig.key === 'variantCount') {
                    valA = a.variantCount ?? a.promotionDetails?.length ?? 0;
                    valB = b.variantCount ?? b.promotionDetails?.length ?? 0;
                }
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
                if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return list;
    }, [promotions, activeTab, filters, sortConfig]);

    /* ── paginated list ── */
    const totalPages = Math.max(1, Math.ceil(filteredPromotions.length / rowsPerPage));
    const paginatedPromotions = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredPromotions.slice(start, start + rowsPerPage);
    }, [filteredPromotions, currentPage, rowsPerPage]);

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
    const handleRowClick = useCallback((promo) => {
        setSelectedPromotion(promo);
    }, []);

    /* form */
    const handleAddNew = useCallback(() => {
        setEditingPromotion(null);
        setShowForm(true);
    }, []);

    const handleEdit = useCallback((promo) => {
        setEditingPromotion(promo);
        setShowForm(true);
    }, []);

    const handleFormSave = useCallback(() => {
        setShowForm(false);
        setEditingPromotion(null);
        setSelectedPromotion(null);
        showToast(editingPromotion ? 'Đã cập nhật đợt giảm giá' : 'Đã thêm đợt giảm giá mới');
        refresh();
    }, [editingPromotion, refresh, showToast]);

    const handleFormCancel = useCallback(() => {
        setShowForm(false);
        setEditingPromotion(null);
    }, []);

    /* toggle status */
    const handleToggleStatus = useCallback(async (promo) => {
        try {
            await promotionAPI.toggleStatus(promo.promotionId);
            showToast(promo.isActive ? 'Đã tắt đợt giảm giá' : 'Đã bật đợt giảm giá');
            refresh();
            // update slide-over if open
            if (selectedPromotion?.promotionId === promo.promotionId) {
                setSelectedPromotion((prev) => prev ? { ...prev, isActive: !prev.isActive } : prev);
            }
        } catch (err) {
            showToast('Lỗi: Không thể thay đổi trạng thái', 'error');
            console.error(err);
        }
    }, [refresh, showToast, selectedPromotion]);

    /* delete */
    const handleDelete = useCallback((promo) => {
        setConfirmDialog({
            title: 'Xóa đợt giảm giá?',
            message: `Bạn có chắc chắn muốn xóa "${promo.name}"? Thao tác này không thể hoàn tác.`,
            onConfirm: async () => {
                try {
                    await promotionAPI.delete(promo.promotionId);
                    showToast('Đã xóa đợt giảm giá');
                    setConfirmDialog(null);
                    if (selectedPromotion?.promotionId === promo.promotionId) setSelectedPromotion(null);
                    refresh();
                } catch (err) {
                    showToast('Lỗi: Không thể xóa đợt giảm giá', 'error');
                    setConfirmDialog(null);
                    console.error(err);
                }
            },
            onCancel: () => setConfirmDialog(null),
        });
    }, [refresh, showToast, selectedPromotion]);

    /* manage variants */
    const handleManageVariants = useCallback((promo) => {
        setPickerPromotion(promo);
    }, []);

    const handlePickerSaved = useCallback(() => {
        showToast('Đã cập nhật sản phẩm trong đợt giảm giá');
        refresh();
    }, [refresh, showToast]);

    /* ── error state ── */
    if (error && !loading && promotions.length === 0) {
        return (
            <div className="pm-management">
                <div className="pm-empty">
                    <div className="pm-empty-icon"><AlertTriangle size={48} /></div>
                    <h3>{error}</h3>
                    <p>Vui lòng thử tải lại trang</p>
                    <button className="pm-btn pm-btn-primary" onClick={refresh}>
                        <RefreshCw size={14} /> Thử lại
                    </button>
                </div>
            </div>
        );
    }

    /* ── render ── */
    return (
        <div className="pm-management">
            {/* page header */}
            <div className="pm-page-header">
                <div className="header-left">
                    <h1><Tag size={22} /> Quản lý đợt giảm giá</h1>
                    <p>Tạo và quản lý các chương trình khuyến mãi</p>
                </div>
                <div className="pm-header-actions">
                    <button className="pm-btn pm-btn-outline" onClick={refresh}>
                        <RefreshCw size={14} /> Làm mới
                    </button>
                    <button className="pm-btn pm-btn-primary" onClick={handleAddNew}>
                        <Plus size={14} /> Thêm đợt giảm giá
                    </button>
                </div>
            </div>

            {/* KPI cards */}
            <PromotionKpiCards refreshKey={refreshKey} />

            {/* Filters + tabs */}
            <PromotionFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabCounts={tabCounts}
                resultCount={filteredPromotions.length}
            />

            {/* Table */}
            <PromotionTable
                promotions={paginatedPromotions}
                loading={loading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onManageVariants={handleManageVariants}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                sortConfig={sortConfig}
                onSort={handleSort}
                selectedPromotionId={selectedPromotion?.promotionId}
                pageOffset={(currentPage - 1) * rowsPerPage}
            />

            {/* Pagination */}
            {!loading && filteredPromotions.length > 0 && (
                <PromotionPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setRowsPerPage}
                />
            )}

            {/* Slide-over */}
            {selectedPromotion && (
                <PromotionSlideOver
                    promotion={selectedPromotion}
                    onClose={() => setSelectedPromotion(null)}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                    onManageVariants={handleManageVariants}
                />
            )}

            {/* Form modal */}
            {showForm && (
                <PromotionForm
                    promotion={editingPromotion}
                    onSave={handleFormSave}
                    onCancel={handleFormCancel}
                    isEditing={!!editingPromotion}
                />
            )}

            {/* Variant picker modal */}
            {pickerPromotion && (
                <PromotionVariantPicker
                    promotionId={pickerPromotion.promotionId}
                    onClose={() => setPickerPromotion(null)}
                    onSaved={handlePickerSaved}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`pm-toast ${toast.type || 'success'}`}>
                    {toast.message}
                </div>
            )}

            {/* Confirm dialog */}
            {confirmDialog && (
                <div className="pm-confirm-overlay">
                    <div className="pm-confirm-dialog">
                        <div className="pm-confirm-icon"><AlertTriangle size={48} color="var(--warning-500)" /></div>
                        <h3>{confirmDialog.title}</h3>
                        <p>{confirmDialog.message}</p>
                        <div className="pm-confirm-actions">
                            <button className="pm-btn pm-btn-outline" onClick={confirmDialog.onCancel}>
                                Hủy bỏ
                            </button>
                            <button className="pm-btn pm-btn-danger-outline" onClick={confirmDialog.onConfirm}>
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionManagement;

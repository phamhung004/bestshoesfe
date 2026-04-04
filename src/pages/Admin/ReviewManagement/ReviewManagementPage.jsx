import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getAdminReviews, replyToReview, adminDeleteReview } from '../../../api/reviewApi';
import './ReviewManagementPage.css';

const ReviewManagementPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // Reply
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);

    // Toast
    const [toast, setToast] = useState(null);
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: 20 };
            if (ratingFilter) params.rating = ratingFilter;
            if (search) params.search = search;
            const res = await getAdminReviews(params);
            const data = res.data || res;
            setReviews(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error('Failed to load reviews:', err);
            showToast('Lỗi tải danh sách đánh giá', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, ratingFilter, search]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const handleSearch = () => {
        setPage(0);
        setSearch(searchInput);
    };

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) return;
        setReplyLoading(true);
        try {
            await replyToReview(reviewId, replyText.trim());
            showToast('Phản hồi thành công!');
            setReplyingId(null);
            setReplyText('');
            fetchReviews();
        } catch (err) {
            showToast('Phản hồi thất bại', 'error');
        } finally {
            setReplyLoading(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
        try {
            await adminDeleteReview(reviewId);
            showToast('Đã xóa đánh giá');
            fetchReviews();
        } catch (err) {
            showToast('Xóa thất bại', 'error');
        }
    };

    const renderStars = (rating) => (
        <span className="rv-stars">
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={i <= rating ? 'rv-star filled' : 'rv-star'}>★</span>
            ))}
        </span>
    );

    return (
        <AdminLayout section="reviews">
            <div className="rv-page">
                <div className="rv-page-header">
                    <div>
                        <h1 className="rv-page-title">Quản lý đánh giá</h1>
                        <p className="rv-page-subtitle">{totalElements} đánh giá</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="rv-filters">
                    <div className="rv-search-wrap">
                        <Search size={16} className="rv-search-icon" />
                        <input
                            className="rv-search-input"
                            placeholder="Tìm theo sản phẩm, khách hàng, nội dung..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <select
                        className="rv-filter-select"
                        value={ratingFilter}
                        onChange={e => { setRatingFilter(e.target.value); setPage(0); }}
                    >
                        <option value="">Tất cả sao</option>
                        <option value="5">5 sao</option>
                        <option value="4">4 sao</option>
                        <option value="3">3 sao</option>
                        <option value="2">2 sao</option>
                        <option value="1">1 sao</option>
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="rv-loading">Đang tải...</div>
                ) : reviews.length === 0 ? (
                    <div className="rv-empty">
                        <Star size={40} />
                        <p>Không tìm thấy đánh giá nào</p>
                    </div>
                ) : (
                    <div className="rv-table-wrap">
                        <table className="rv-table">
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Khách hàng</th>
                                    <th>Đánh giá</th>
                                    <th>Nội dung</th>
                                    <th>Phản hồi</th>
                                    <th>Ngày</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map(review => (
                                    <React.Fragment key={review.reviewId}>
                                        <tr>
                                            <td>
                                                <div className="rv-product-name">{review.productName}</div>
                                                {review.variant && <div className="rv-variant">{review.variant}</div>}
                                            </td>
                                            <td>
                                                <div className="rv-customer-name">{review.customerName}</div>
                                                <div className="rv-customer-email">{review.customerEmail}</div>
                                            </td>
                                            <td>{renderStars(review.rating)}</td>
                                            <td>
                                                {review.title && <div className="rv-review-title">{review.title}</div>}
                                                <div className="rv-review-content">{review.content}</div>
                                            </td>
                                            <td>
                                                {review.shopReply ? (
                                                    <div className="rv-reply-badge replied">Đã phản hồi</div>
                                                ) : (
                                                    <div className="rv-reply-badge pending">Chưa phản hồi</div>
                                                )}
                                            </td>
                                            <td className="rv-date">
                                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td>
                                                <div className="rv-actions">
                                                    <button
                                                        className="rv-action-btn rv-reply-btn"
                                                        title="Phản hồi"
                                                        onClick={() => {
                                                            setReplyingId(replyingId === review.reviewId ? null : review.reviewId);
                                                            setReplyText(review.shopReply || '');
                                                        }}
                                                    >
                                                        <MessageSquare size={16} />
                                                    </button>
                                                    <button
                                                        className="rv-action-btn rv-delete-btn"
                                                        title="Xóa"
                                                        onClick={() => handleDelete(review.reviewId)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {replyingId === review.reviewId && (
                                            <tr className="rv-reply-row">
                                                <td colSpan={7}>
                                                    <div className="rv-reply-form">
                                                        <textarea
                                                            className="rv-reply-textarea"
                                                            value={replyText}
                                                            onChange={e => setReplyText(e.target.value)}
                                                            placeholder="Nhập phản hồi..."
                                                            rows={3}
                                                        />
                                                        <div className="rv-reply-form-actions">
                                                            <button
                                                                className="rv-btn-cancel"
                                                                onClick={() => { setReplyingId(null); setReplyText(''); }}
                                                            >
                                                                Hủy
                                                            </button>
                                                            <button
                                                                className="rv-btn-submit"
                                                                onClick={() => handleReply(review.reviewId)}
                                                                disabled={replyLoading || !replyText.trim()}
                                                            >
                                                                {replyLoading ? 'Đang gửi...' : 'Gửi phản hồi'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="rv-pagination">
                        <button
                            className="rv-page-btn"
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="rv-page-info">Trang {page + 1} / {totalPages}</span>
                        <button
                            className="rv-page-btn"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}

                {toast && (
                    <div className={`rv-toast ${toast.type === 'error' ? 'rv-toast-error' : 'rv-toast-success'}`}>
                        {toast.msg}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ReviewManagementPage;

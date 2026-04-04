import React, { useEffect, useState, useCallback } from 'react';
import { getProductReviews } from '../../../api/reviewApi';
import StarSelector from '../../MyAccount/components/StarSelector';

const RatingBar = ({ star, count, total }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="pdp-rating-bar-row">
            <span className="pdp-rating-bar-label">{star} ★</span>
            <div className="pdp-rating-bar-track">
                <div className="pdp-rating-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="pdp-rating-bar-count">{count}</span>
        </div>
    );
};

const ProductReviewsSection = ({ productId }) => {
    const [data, setData] = useState(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async (p) => {
        setLoading(true);
        try {
            const res = await getProductReviews(productId, p, 5);
            setData(res.data);
        } catch (err) {
            console.error('Failed to load reviews:', err);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => { fetchReviews(0); }, [fetchReviews]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchReviews(newPage);
    };

    if (loading && !data) {
        return (
            <section className="pdp-reviews-section">
                <h2 className="pdp-reviews-title">Đánh giá sản phẩm</h2>
                <div className="pdp-reviews-loading">Đang tải đánh giá...</div>
            </section>
        );
    }

    if (!data) return null;

    const { summary, reviews, totalPages, totalElements } = data;

    return (
        <section className="pdp-reviews-section">
            <h2 className="pdp-reviews-title">Đánh giá sản phẩm ({summary.totalCount})</h2>

            {summary.totalCount > 0 ? (
                <>
                    {/* Summary bar */}
                    <div className="pdp-reviews-summary">
                        <div className="pdp-reviews-avg">
                            <span className="pdp-reviews-avg-number">{summary.averageRating}</span>
                            <StarSelector value={Math.round(summary.averageRating)} readOnly size={22} />
                            <span className="pdp-reviews-avg-count">{summary.totalCount} đánh giá</span>
                        </div>
                        <div className="pdp-reviews-distribution">
                            {[5, 4, 3, 2, 1].map(star => (
                                <RatingBar
                                    key={star}
                                    star={star}
                                    count={summary.ratingDistribution?.[star] || 0}
                                    total={summary.totalCount}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Review list */}
                    <div className="pdp-reviews-list">
                        {reviews.map(review => (
                            <div key={review.reviewId} className="pdp-review-card">
                                <div className="pdp-review-header">
                                    <div className="pdp-review-avatar">
                                        {review.customerName?.charAt(0)?.toUpperCase() || 'K'}
                                    </div>
                                    <div className="pdp-review-meta">
                                        <span className="pdp-review-author">{review.customerName}</span>
                                        <span className="pdp-review-date">
                                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="pdp-review-stars">
                                        <StarSelector value={review.rating} readOnly size={16} />
                                    </div>
                                </div>

                                {review.variant && (
                                    <div className="pdp-review-variant">Phân loại: {review.variant}</div>
                                )}

                                {review.title && (
                                    <div className="pdp-review-title-text">{review.title}</div>
                                )}

                                <p className="pdp-review-content">{review.content}</p>

                                {/* Sub-ratings */}
                                {(review.qualityRating || review.sizeRating || review.deliveryRating) && (
                                    <div className="pdp-review-subratings">
                                        {review.qualityRating && (
                                            <span>Chất lượng: <StarSelector value={review.qualityRating} readOnly size={13} /></span>
                                        )}
                                        {review.sizeRating && (
                                            <span>Size: <StarSelector value={review.sizeRating} readOnly size={13} /></span>
                                        )}
                                        {review.deliveryRating && (
                                            <span>Giao hàng: <StarSelector value={review.deliveryRating} readOnly size={13} /></span>
                                        )}
                                    </div>
                                )}

                                {/* Shop reply */}
                                {review.shopReply && (
                                    <div className="pdp-review-shop-reply">
                                        <strong>💬 Phản hồi từ BestShoes:</strong>
                                        <p>{review.shopReply}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pdp-reviews-pagination">
                            <button
                                className="pdp-reviews-page-btn"
                                disabled={page === 0 || loading}
                                onClick={() => handlePageChange(page - 1)}
                            >
                                ← Trước
                            </button>
                            <span className="pdp-reviews-page-info">
                                Trang {page + 1} / {totalPages}
                            </span>
                            <button
                                className="pdp-reviews-page-btn"
                                disabled={page >= totalPages - 1 || loading}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                Sau →
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="pdp-reviews-empty">
                    <span>⭐</span>
                    <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                    <p className="pdp-reviews-empty-hint">Hãy là người đầu tiên đánh giá!</p>
                </div>
            )}
        </section>
    );
};

export default ProductReviewsSection;

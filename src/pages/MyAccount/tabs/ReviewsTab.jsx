import React, { useState, useEffect } from 'react';
import { Star, Loader } from 'lucide-react';
import { formatDate } from '../mockAccountData';
import { getMyReviews, getPendingReviews, createReview, deleteReview } from '../../../api/accountApi';
import WriteReviewModal from '../components/WriteReviewModal';
import StarSelector from '../components/StarSelector';

const ReviewsTab = () => {
    const [activeSubTab, setActiveSubTab] = useState('written');
    const [writtenReviews, setWrittenReviews] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [writeModal, setWriteModal] = useState(null);
    const [expandedReplies, setExpandedReplies] = useState({});
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const fetchReviews = async () => {
        try {
            const [writtenRes, pendingRes] = await Promise.all([
                getMyReviews(),
                getPendingReviews(),
            ]);
            setWrittenReviews(writtenRes.data || []);
            setPendingReviews(pendingRes.data || []);
        } catch (err) {
            console.error('Failed to load reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    const toggleReply = (id) => setExpandedReplies(prev => ({ ...prev, [id]: !prev[id] }));

    const handleWriteReview = async (pendingItem, data) => {
        try {
            await createReview({
                orderItemId: pendingItem.pendingId,
                rating: data.rating,
                title: data.title || null,
                content: data.content,
                qualityRating: data.qualityRating || null,
                sizeRating: data.sizeRating || null,
                deliveryRating: data.deliveryRating || null,
            });
            await fetchReviews();
            setActiveSubTab('written');
            showToast('✓ Đánh giá đã được gửi thành công!');
        } catch (err) {
            showToast('✗ ' + (err.response?.data?.message || 'Gửi đánh giá thất bại'));
        }
    };

    const handleDeleteReview = async (id) => {
        try {
            await deleteReview(id);
            setWrittenReviews(prev => prev.filter(r => r.reviewId !== id));
            showToast('Đã xóa đánh giá!');
        } catch (err) {
            showToast('✗ ' + (err.response?.data?.message || 'Xóa thất bại'));
        }
    };

    if (loading) {
        return (
            <div className="acc-tab-content" style={{ textAlign: 'center', padding: '60px 0' }}>
                <Loader size={24} className="acc-spinner" /> Đang tải...
            </div>
        );
    }

    return (
        <div className="acc-tab-content">
            <div className="acc-tab-header">
                <div>
                    <h2 className="acc-tab-title">Đánh giá của tôi</h2>
                    <p className="acc-tab-sub">Cảm ơn bạn đã chia sẻ trải nghiệm!</p>
                </div>
            </div>

            {/* Sub-tabs */}
            <div className="acc-review-subtabs">
                <button
                    className={`acc-review-subtab${activeSubTab === 'written' ? ' active' : ''}`}
                    onClick={() => setActiveSubTab('written')}
                >
                    Đã đánh giá ({writtenReviews.length})
                </button>
                <button
                    className={`acc-review-subtab${activeSubTab === 'pending' ? ' active' : ''}`}
                    onClick={() => setActiveSubTab('pending')}
                >
                    Chờ đánh giá ({pendingReviews.length})
                </button>
            </div>

            {/* Written Reviews */}
            {activeSubTab === 'written' && (
                <div className="acc-reviews-list">
                    {writtenReviews.length === 0 ? (
                        <div className="acc-empty-state">
                            <Star size={48} className="acc-empty-icon" />
                            <h3>Chưa có đánh giá nào</h3>
                            <p>Mua hàng và chia sẻ trải nghiệm của bạn!</p>
                        </div>
                    ) : (
                        writtenReviews.map(review => (
                            <div key={review.reviewId} className="acc-review-card">
                                <div className="acc-review-thumb" style={{ background: review.thumbColor }}>
                                    <span>👟</span>
                                </div>
                                <div className="acc-review-body">
                                    <div className="acc-review-product">{review.productName}</div>
                                    <div className="acc-review-variant">{review.variant}</div>
                                    <div className="acc-review-stars-row">
                                        <StarSelector value={review.rating} readOnly size={18} />
                                        <span className="acc-review-date">{formatDate(review.createdAt)}</span>
                                    </div>
                                    {review.title && <div className="acc-review-title">{review.title}</div>}
                                    <p className="acc-review-content">{review.content}</p>
                                    <div className="acc-review-actions">
                                        <button className="acc-review-edit-btn">Chỉnh sửa</button>
                                        <button className="acc-review-delete-btn" onClick={() => handleDeleteReview(review.reviewId)}>Xóa</button>
                                    </div>
                                    {review.shopReply && (
                                        <div className="acc-review-reply-wrap">
                                            <button className="acc-review-reply-toggle" onClick={() => toggleReply(review.reviewId)}>
                                                💬 Phản hồi từ BestShoes
                                            </button>
                                            {expandedReplies[review.reviewId] && (
                                                <div className="acc-review-reply-content">{review.shopReply}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Pending Reviews */}
            {activeSubTab === 'pending' && (
                <div className="acc-reviews-list">
                    {pendingReviews.length === 0 ? (
                        <div className="acc-empty-state">
                            <Star size={48} className="acc-empty-icon" />
                            <h3>Không có sản phẩm chờ đánh giá</h3>
                            <p>Tất cả sản phẩm đã được đánh giá!</p>
                        </div>
                    ) : (
                        pendingReviews.map(item => (
                            <div key={item.pendingId} className="acc-review-card acc-review-card-pending">
                                <div className="acc-review-thumb" style={{ background: item.thumbColor }}>
                                    <span>👟</span>
                                </div>
                                <div className="acc-review-body">
                                    <div className="acc-review-product">{item.productName}</div>
                                    <div className="acc-review-variant">{item.variant}</div>
                                    <div className="acc-review-order-ref">Từ đơn hàng #{item.orderNumber}</div>
                                    <button
                                        className="acc-btn-primary-sm acc-write-review-btn"
                                        onClick={() => setWriteModal(item)}
                                    >
                                        ⭐ Viết đánh giá
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Write Review Modal */}
            {writeModal && (
                <WriteReviewModal
                    product={writeModal}
                    onClose={() => setWriteModal(null)}
                    onSubmit={(data) => handleWriteReview(writeModal, data)}
                />
            )}

            {toast && <div className="acc-toast acc-toast-success">{toast}</div>}
        </div>
    );
};

export default ReviewsTab;

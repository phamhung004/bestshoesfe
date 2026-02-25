import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { MOCK_REVIEWS_WRITTEN, MOCK_REVIEWS_PENDING, formatDate } from '../mockAccountData';
import WriteReviewModal from '../components/WriteReviewModal';
import StarSelector from '../components/StarSelector';

const ReviewsTab = () => {
    const [activeSubTab, setActiveSubTab] = useState('written');
    const [writtenReviews, setWrittenReviews] = useState(MOCK_REVIEWS_WRITTEN);
    const [pendingReviews, setPendingReviews] = useState(MOCK_REVIEWS_PENDING);
    const [writeModal, setWriteModal] = useState(null);
    const [expandedReplies, setExpandedReplies] = useState({});
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const toggleReply = (id) => setExpandedReplies(prev => ({ ...prev, [id]: !prev[id] }));

    const handleWriteReview = (pendingItem, data) => {
        const newReview = {
            review_id: Date.now(),
            product_name: pendingItem.product_name,
            variant: pendingItem.variant,
            rating: data.rating,
            title: data.title,
            content: data.content,
            created_at: new Date().toISOString(),
            thumb_color: pendingItem.thumb_color,
            shop_reply: null,
        };
        setWrittenReviews(prev => [newReview, ...prev]);
        setPendingReviews(prev => prev.filter(p => p.pending_id !== pendingItem.pending_id));
        setActiveSubTab('written');
        showToast('✓ Đánh giá đã được gửi thành công!');
    };

    const handleDeleteReview = (id) => {
        setWrittenReviews(prev => prev.filter(r => r.review_id !== id));
        showToast('Đã xóa đánh giá!');
    };

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
                            <div key={review.review_id} className="acc-review-card">
                                <div className="acc-review-thumb" style={{ background: review.thumb_color }}>
                                    <span>👟</span>
                                </div>
                                <div className="acc-review-body">
                                    <div className="acc-review-product">{review.product_name}</div>
                                    <div className="acc-review-variant">{review.variant}</div>
                                    <div className="acc-review-stars-row">
                                        <StarSelector value={review.rating} readOnly size={18} />
                                        <span className="acc-review-date">{formatDate(review.created_at)}</span>
                                    </div>
                                    {review.title && <div className="acc-review-title">{review.title}</div>}
                                    <p className="acc-review-content">{review.content}</p>
                                    <div className="acc-review-actions">
                                        <button className="acc-review-edit-btn">Chỉnh sửa</button>
                                        <button className="acc-review-delete-btn" onClick={() => handleDeleteReview(review.review_id)}>Xóa</button>
                                    </div>
                                    {review.shop_reply && (
                                        <div className="acc-review-reply-wrap">
                                            <button className="acc-review-reply-toggle" onClick={() => toggleReply(review.review_id)}>
                                                💬 Phản hồi từ BestShoes
                                            </button>
                                            {expandedReplies[review.review_id] && (
                                                <div className="acc-review-reply-content">{review.shop_reply}</div>
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
                            <div key={item.pending_id} className="acc-review-card acc-review-card-pending">
                                <div className="acc-review-thumb" style={{ background: item.thumb_color }}>
                                    <span>👟</span>
                                </div>
                                <div className="acc-review-body">
                                    <div className="acc-review-product">{item.product_name}</div>
                                    <div className="acc-review-variant">{item.variant}</div>
                                    <div className="acc-review-order-ref">Từ đơn hàng #{item.order_number}</div>
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

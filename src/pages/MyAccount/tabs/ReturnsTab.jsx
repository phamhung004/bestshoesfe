import React, { useState, useEffect } from 'react';
import { Loader, RotateCcw, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { formatVND, formatDate } from '../mockAccountData';
import { RETURN_STATUS_CONFIG } from '../../../constants/returnConstants';
import { getMyReturns } from '../../../api/returnApi';

const ALL_STATUSES = ['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Đã nhận hàng', 'Hoàn tiền', 'Từ chối'];

const StatusBadge = ({ status }) => {
    const cfg = RETURN_STATUS_CONFIG[status] || { cls: '', label: status };
    return <span className={`acc-status-badge ${cfg.cls}`}>{cfg.label}</span>;
};

const TimelineBar = ({ timeline }) => {
    if (!timeline || timeline.length === 0) return null;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 12 }}>
            {timeline.map((step, idx) => (
                <div key={step.stepKey || idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    {/* Dot + connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                        <div style={{
                            width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                            background: step.completed ? '#22c55e' : step.current ? '#111827' : '#e5e7eb',
                            border: '2px solid',
                            borderColor: step.completed ? '#22c55e' : step.current ? '#111827' : '#d1d5db',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {step.completed && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900 }}>✓</span>}
                        </div>
                        {idx < timeline.length - 1 && (
                            <div style={{ width: 2, flex: 1, minHeight: 20, background: step.completed ? '#22c55e' : '#e5e7eb', marginTop: 2 }} />
                        )}
                    </div>
                    {/* Label + timestamp */}
                    <div style={{ paddingBottom: idx < timeline.length - 1 ? 14 : 0 }}>
                        <p style={{
                            margin: 0, fontSize: 13, fontWeight: step.current ? 700 : step.completed ? 500 : 400,
                            color: step.completed || step.current ? '#111827' : '#9ca3af',
                        }}>
                            {step.label}
                        </p>
                        {step.timestamp && (
                            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                                {formatDate(step.timestamp)}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const ReturnCard = ({ ret }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
            {/* Header */}
            <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{ret.returnCode}</span>
                        <StatusBadge status={ret.returnStatus} />
                        {ret.isPartial && (
                            <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                                Trả một phần
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                        Đơn #{ret.orderNumber} · {formatDate(ret.createdAt)}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>Dự kiến hoàn</div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#16a34a' }}>{formatVND(ret.totalAmount)}</div>
                    </div>
                    <button
                        onClick={() => setExpanded(v => !v)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}
                        className="acc-btn-ghost-sm"
                    >
                        {expanded ? 'Thu gọn' : 'Chi tiết'}
                        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                </div>
            </div>

            {/* Expandable detail */}
            {expanded && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 18px', background: '#fafafa', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    {/* Left: items + reason */}
                    <div style={{ flex: 2, minWidth: 220 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 8 }}>Sản phẩm trả hàng</p>
                        {(ret.items || []).map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <div>
                                    <span style={{ color: '#111827', fontWeight: 500 }}>{item.product?.name || '—'}</span>
                                    <span style={{ color: '#9ca3af', marginLeft: 8 }}>
                                        {item.size?.sizeName && `Size ${item.size.sizeName}`}
                                        {item.color?.colorName && ` · ${item.color.colorName}`}
                                        {' × '}{item.quantity}
                                    </span>
                                </div>
                                <span style={{ fontWeight: 600 }}>{formatVND(item.totalPrice)}</span>
                            </div>
                        ))}

                        <div style={{ marginTop: 12, padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                                <span style={{ color: '#9ca3af', minWidth: 80 }}>Lý do:</span>
                                <span style={{ fontWeight: 600, color: '#111827' }}>{ret.returnReason}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                                <span style={{ color: '#9ca3af', minWidth: 80 }}>Hoàn tiền:</span>
                                <span style={{ fontWeight: 600, color: '#111827' }}>{ret.refundMethod}</span>
                            </div>
                            {ret.description && (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <span style={{ color: '#9ca3af', minWidth: 80 }}>Mô tả:</span>
                                    <span style={{ color: '#374151' }}>{ret.description}</span>
                                </div>
                            )}
                        </div>

                        {ret.returnStatus === 'Từ chối' && ret.rejectReason && (
                            <div style={{ marginTop: 10, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13 }}>
                                <span style={{ fontWeight: 600, color: '#dc2626' }}>Lý do từ chối: </span>
                                <span style={{ color: '#7f1d1d' }}>{ret.rejectReason}</span>
                                {ret.rejectNote && <p style={{ margin: '4px 0 0', color: '#991b1b', fontSize: 12 }}>{ret.rejectNote}</p>}
                            </div>
                        )}

                        {/* Evidence images */}
                        {ret.images && ret.images.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                                <p style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 8 }}>Ảnh bằng chứng</p>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {ret.images.map((img, idx) => (
                                        <a key={idx} href={img.imageUrl} target="_blank" rel="noopener noreferrer">
                                            <img src={img.imageUrl} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e5e7eb' }} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: timeline */}
                    <div style={{ minWidth: 180 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 4 }}>Tiến trình xử lý</p>
                        <TimelineBar timeline={ret.timeline} />
                    </div>
                </div>
            )}
        </div>
    );
};

const ReturnsTab = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState('Tất cả');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    useEffect(() => {
        const fetchReturns = async () => {
            try {
                const res = await getMyReturns();
                setReturns(res.data || []);
            } catch {
                showToast('Không thể tải danh sách yêu cầu trả hàng', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchReturns();
    }, []);

    const statusCounts = ALL_STATUSES.reduce((acc, s) => {
        acc[s] = s === 'Tất cả' ? returns.length : returns.filter(r => r.returnStatus === s).length;
        return acc;
    }, {});

    const filtered = activeStatus === 'Tất cả' ? returns : returns.filter(r => r.returnStatus === activeStatus);

    if (loading) {
        return (
            <div className="acc-tab-content" style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <Loader size={32} className="acc-spinner" />
            </div>
        );
    }

    return (
        <div className="acc-tab-content">
            <div className="acc-tab-header">
                <div>
                    <h2 className="acc-tab-title">Yêu cầu trả hàng</h2>
                    <p className="acc-tab-sub">Theo dõi tình trạng các yêu cầu trả hàng / hoàn tiền</p>
                </div>
            </div>

            {/* Status Filter */}
            <div className="acc-status-pills">
                {ALL_STATUSES.map(s => {
                    const cfg = RETURN_STATUS_CONFIG[s] || {};
                    return (
                        <button
                            key={s}
                            className={`acc-status-pill${activeStatus === s ? ' active' : ''}`}
                            onClick={() => setActiveStatus(s)}
                        >
                            {s} {statusCounts[s] > 0 && <span className="acc-pill-count">({statusCounts[s]})</span>}
                        </button>
                    );
                })}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="acc-empty-state">
                    <RotateCcw size={48} className="acc-empty-icon" />
                    <h3>Chưa có yêu cầu trả hàng nào</h3>
                    <p>Bạn chưa gửi yêu cầu trả hàng nào. Vào tab "Đơn hàng" để yêu cầu trả hàng cho đơn đã giao.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map(ret => (
                        <ReturnCard key={ret.returnId || ret.returnCode} ret={ret} />
                    ))}
                </div>
            )}

            {toast && <div className={`acc-toast acc-toast-${toast.type || 'info'}`}>{toast.msg}</div>}
        </div>
    );
};

export default ReturnsTab;

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getInitials } from './posUtils';
import { posAPI } from '../../../../services/api';
import QuickCreateCustomerModal from './QuickCreateCustomerModal';

/**
 * CustomerLookup — walk-in toggle + customer search/select + quick-create.
 * Uses real API for customer search.
 */
const CustomerLookup = ({ isWalkIn, setIsWalkIn, selectedCustomer, setSelectedCustomer, guestName, setGuestName, guestPhone, setGuestPhone }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchDone, setSearchDone] = useState(false); // true after a search completes
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [savingWalkIn, setSavingWalkIn] = useState(false);
    const wrapRef = useRef(null);

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSuggestions(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Debounced search when query changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFiltered([]);
            setSearchDone(false);
            return;
        }
        setSearching(true);
        setSearchDone(false);
        const timer = setTimeout(async () => {
            try {
                const res = await posAPI.searchCustomers(searchQuery);
                setFiltered(res.data || []);
            } catch (err) {
                console.error('Customer search failed:', err);
                setFiltered([]);
            } finally {
                setSearching(false);
                setSearchDone(true);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelect = (customer) => {
        setSelectedCustomer(customer);
        setSearchQuery('');
        setShowSuggestions(false);
    };

    // Called after QuickCreateCustomerModal creates a customer
    const handleCustomerCreated = (customer) => {
        setSelectedCustomer(customer);
        setShowCreateModal(false);
        setSearchQuery('');
        setShowSuggestions(false);
        // If was in walk-in mode, switch to registered mode
        if (isWalkIn) {
            setIsWalkIn(false);
            setGuestName('');
            setGuestPhone('');
        }
    };

    // Save walk-in guest as a registered customer
    const handleSaveWalkIn = async () => {
        if (!guestName.trim() || !guestPhone.trim()) return;
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(guestPhone.trim())) {
            alert('Số điện thoại phải có 10 chữ số và bắt đầu bằng 0');
            return;
        }
        setSavingWalkIn(true);
        try {
            const res = await posAPI.quickCreateCustomer({
                fullName: guestName.trim(),
                phone: guestPhone.trim(),
            });
            const customer = res.data;
            setSelectedCustomer(customer);
            setIsWalkIn(false);
            setGuestName('');
            setGuestPhone('');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Lưu khách hàng thất bại';
            alert(msg);
        } finally {
            setSavingWalkIn(false);
        }
    };

    return (
        <div className="pos-customer-section">
            {/* Toggle */}
            <div className="pos-customer-toggle">
                <label>Khách lẻ (không cần tài khoản)</label>
                <div
                    className={`pos-switch${isWalkIn ? ' on' : ''}`}
                    onClick={() => { setIsWalkIn(!isWalkIn); setSelectedCustomer(null); }}
                    role="switch"
                    aria-checked={isWalkIn}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setIsWalkIn(!isWalkIn)}
                >
                    <div className="pos-switch-knob" />
                </div>
            </div>

            {isWalkIn ? (
                /* Walk-in guest mode */
                <>
                    <div className="pos-walkin-inputs">
                        <input
                            placeholder="Tên khách hàng"
                            value={guestName}
                            onChange={e => setGuestName(e.target.value)}
                            aria-label="Tên khách hàng"
                        />
                        <input
                            placeholder="Số điện thoại"
                            value={guestPhone}
                            onChange={e => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            aria-label="Số điện thoại"
                        />
                    </div>
                    <div className="pos-walkin-footer">
                        <span className="pos-walkin-hint">Không bắt buộc — bỏ qua nếu khách không muốn</span>
                        {guestName.trim() && guestPhone.trim() && (
                            <button
                                className="pos-save-walkin-btn"
                                onClick={handleSaveWalkIn}
                                disabled={savingWalkIn}
                                title="Lưu thông tin thành tài khoản khách hàng"
                            >
                                {savingWalkIn ? '...' : '💾 Lưu thành KH'}
                            </button>
                        )}
                    </div>
                </>
            ) : selectedCustomer ? (
                /* Selected customer card */
                <div className="pos-selected-customer">
                    <div className="pos-customer-avatar">{getInitials(selectedCustomer.fullName)}</div>
                    <div className="pos-customer-info">
                        <h4>{selectedCustomer.fullName}</h4>
                        <p>{selectedCustomer.phone} · {selectedCustomer.email}</p>
                    </div>
                    <button
                        className="pos-deselect-btn"
                        onClick={() => setSelectedCustomer(null)}
                        aria-label="Bỏ chọn khách hàng"
                    >×</button>
                </div>
            ) : (
                /* Customer search */
                <div className="pos-customer-search" ref={wrapRef}>
                    <input
                        placeholder="Tìm khách hàng theo tên, SĐT, email..."
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                        onFocus={() => searchQuery && setShowSuggestions(true)}
                        aria-label="Tìm khách hàng"
                    />
                    {showSuggestions && (
                        <div className="pos-customer-suggestions">
                            {searching && (
                                <div className="pos-customer-searching">Đang tìm...</div>
                            )}
                            {filtered.map(c => (
                                <div key={c.customerId} className="pos-customer-option" onClick={() => handleSelect(c)}>
                                    <div className="pos-customer-avatar">{getInitials(c.fullName)}</div>
                                    <div className="pos-customer-info">
                                        <h4>{c.fullName}</h4>
                                        <p>{c.phone} · {c.email}</p>
                                    </div>
                                </div>
                            ))}
                            {!searching && searchDone && filtered.length === 0 && searchQuery.trim() && (
                                <div className="pos-customer-empty-result">
                                    <p>Không tìm thấy khách hàng</p>
                                    <button
                                        className="pos-create-customer-btn"
                                        onClick={() => { setShowCreateModal(true); setShowSuggestions(false); }}
                                    >
                                        + Tạo khách hàng mới
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Always-visible create button below search */}
                    <button
                        className="pos-create-customer-link"
                        onClick={() => setShowCreateModal(true)}
                    >
                        + Thêm khách hàng mới
                    </button>
                </div>
            )}

            {/* Quick-create customer modal */}
            {showCreateModal && (
                <QuickCreateCustomerModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleCustomerCreated}
                    initialName={isWalkIn ? guestName : searchQuery}
                    initialPhone={isWalkIn ? guestPhone : ''}
                />
            )}
        </div>
    );
};

export default CustomerLookup;

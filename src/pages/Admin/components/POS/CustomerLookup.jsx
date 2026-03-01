import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getInitials } from './posUtils';
import { posAPI } from '../../../../services/api';

/**
 * CustomerLookup — walk-in toggle + customer search/select.
 * Uses real API for customer search.
 */
const CustomerLookup = ({ isWalkIn, setIsWalkIn, selectedCustomer, setSelectedCustomer, guestName, setGuestName, guestPhone, setGuestPhone }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const [searching, setSearching] = useState(false);
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
            return;
        }
        setSearching(true);
        const timer = setTimeout(async () => {
            try {
                const res = await posAPI.searchCustomers(searchQuery);
                setFiltered(res.data || []);
            } catch (err) {
                console.error('Customer search failed:', err);
                setFiltered([]);
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelect = (customer) => {
        setSelectedCustomer(customer);
        setSearchQuery('');
        setShowSuggestions(false);
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
                            onChange={e => setGuestPhone(e.target.value)}
                            aria-label="Số điện thoại"
                        />
                    </div>
                    <div className="pos-walkin-hint">Không bắt buộc — bỏ qua nếu khách không muốn</div>
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
                    {showSuggestions && filtered.length > 0 && (
                        <div className="pos-customer-suggestions">
                            {filtered.map(c => (
                                <div key={c.customerId} className="pos-customer-option" onClick={() => handleSelect(c)}>
                                    <div className="pos-customer-avatar">{getInitials(c.fullName)}</div>
                                    <div className="pos-customer-info">
                                        <h4>{c.fullName}</h4>
                                        <p>{c.phone} · {c.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerLookup;

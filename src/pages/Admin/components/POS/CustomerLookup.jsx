import React, { useState, useMemo, useRef, useEffect } from 'react';
import { customers, getInitials } from './mockPOSData';

/**
 * CustomerLookup — walk-in toggle + customer search/select.
 */
const CustomerLookup = ({ isWalkIn, setIsWalkIn, selectedCustomer, setSelectedCustomer, guestName, setGuestName, guestPhone, setGuestPhone }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapRef = useRef(null);

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSuggestions(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return customers.filter(c =>
            c.full_name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.email.toLowerCase().includes(q)
        );
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
                    <div className="pos-customer-avatar">{getInitials(selectedCustomer.full_name)}</div>
                    <div className="pos-customer-info">
                        <h4>{selectedCustomer.full_name}</h4>
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
                                <div key={c.customer_id} className="pos-customer-option" onClick={() => handleSelect(c)}>
                                    <div className="pos-customer-avatar">{getInitials(c.full_name)}</div>
                                    <div className="pos-customer-info">
                                        <h4>{c.full_name}</h4>
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

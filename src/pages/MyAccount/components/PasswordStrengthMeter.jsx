import React, { useMemo } from 'react';

const RULES = [
    { key: 'length', label: 'Ít nhất 8 ký tự', test: (pw) => pw.length >= 8 },
    { key: 'upper', label: 'Có chữ hoa (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
    { key: 'number', label: 'Có chữ số (0-9)', test: (pw) => /[0-9]/.test(pw) },
    { key: 'special', label: 'Có ký tự đặc biệt (!@#$...)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const STRENGTH_LABELS = ['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
const STRENGTH_COLORS = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E'];
const SEG_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];

const PasswordStrengthMeter = ({ password, visible }) => {
    const results = useMemo(() => RULES.map(r => ({ ...r, passed: r.test(password) })), [password]);
    const score = results.filter(r => r.passed).length;

    if (!visible || !password) return null;

    return (
        <div className="acc-strength-wrap">
            {/* Segmented bar */}
            <div className="acc-strength-bar">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="acc-strength-seg"
                        style={{ background: i < score ? SEG_COLORS[Math.max(0, score - 1)] : '#E5E7EB' }}
                    />
                ))}
            </div>
            <span className="acc-strength-label" style={{ color: STRENGTH_COLORS[score] || '#9CA3AF' }}>
                {score > 0 ? STRENGTH_LABELS[score] : 'Rất yếu'}
            </span>

            {/* Checklist */}
            <div className="acc-strength-checklist">
                {results.map(r => (
                    <div key={r.key} className={`acc-strength-rule${r.passed ? ' passed' : ''}`}>
                        <span className="acc-strength-icon">{r.passed ? '✓' : '✗'}</span>
                        <span>{r.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export { RULES };
export default PasswordStrengthMeter;

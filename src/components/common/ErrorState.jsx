import React from 'react';

/**
 * ErrorState — displays an error message with a retry button.
 *
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {Function} [props.onRetry] - Callback when "Thử lại" is clicked
 * @param {string} [props.title] - Optional title override
 */
const ErrorState = ({ message, onRetry, title = 'Không thể tải dữ liệu' }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      textAlign: 'center',
      gap: 16,
    }}
  >
    {/* Warning icon */}
    <div
      style={{
        width: 64, height: 64,
        borderRadius: '50%',
        background: '#fee2e2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
      }}
    >
      ⚠️
    </div>

    <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1.1rem', fontWeight: 600 }}>
      {title}
    </h3>

    {message && (
      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', maxWidth: 400 }}>
        {message}
      </p>
    )}

    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          padding: '10px 24px',
          background: '#4f46e5',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: 8,
        }}
      >
        Thử lại
      </button>
    )}
  </div>
);

export default ErrorState;

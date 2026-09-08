import React, { useEffect } from 'react';

/**
 * NotificationModal – thay thế window.alert() bằng modal thông báo đẹp.
 *
 * Props:
 *  - isOpen    {boolean}  – hiển thị / ẩn modal
 *  - type      {string}   – 'success' | 'error' | 'warning' | 'info'
 *  - title     {string}   – tiêu đề (tuỳ chọn)
 *  - message   {string}   – nội dung thông báo
 *  - onClose   {function} – callback khi đóng
 */
export default function NotificationModal({ isOpen, type = 'info', title, message, onClose }) {
  // Đóng bằng phím Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Khoá scroll body khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const config = {
    success: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="9 12 11.5 14.5 15.5 9.5" />
        </svg>
      ),
      defaultTitle: 'Thành công',
      colorVar: '#22c55e',
      bgVar: '#f0fdf4',
      borderVar: '#bbf7d0',
    },
    error: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      defaultTitle: 'Lỗi',
      colorVar: '#ef4444',
      bgVar: '#fef2f2',
      borderVar: '#fecaca',
    },
    warning: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      defaultTitle: 'Cảnh báo',
      colorVar: '#f59e0b',
      bgVar: '#fffbeb',
      borderVar: '#fde68a',
    },
    info: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      defaultTitle: 'Thông báo',
      colorVar: '#3b82f6',
      bgVar: '#eff6ff',
      borderVar: '#bfdbfe',
    },
  };

  const { icon, defaultTitle, colorVar, bgVar, borderVar } = config[type] || config.info;
  const displayTitle = title || defaultTitle;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 15, 0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'notif-overlay-in 0.2s ease',
        }}
      />

      {/* Modal card */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="notif-title"
        aria-describedby="notif-message"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          width: 'min(420px, calc(100vw - 32px))',
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          animation: 'notif-modal-in 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: '4px', background: colorVar }} />

        {/* Content */}
        <div style={{ padding: '28px 28px 24px' }}>
          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: bgVar,
                border: `1.5px solid ${borderVar}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colorVar,
                flexShrink: 0,
              }}
            >
              <div style={{ width: '26px', height: '26px' }}>{icon}</div>
            </div>
            <h3
              id="notif-title"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#1C261F',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {displayTitle}
            </h3>
          </div>

          {/* Message */}
          <p
            id="notif-message"
            style={{
              fontSize: '0.95rem',
              color: '#5C6B61',
              lineHeight: 1.65,
              margin: '0 0 22px',
              paddingLeft: '62px',
            }}
          >
            {message}
          </p>

          {/* Action button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              id="notif-ok-btn"
              onClick={onClose}
              style={{
                background: colorVar,
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 28px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'filter 0.2s ease, transform 0.15s ease',
                letterSpacing: '0.01em',
              }}
              onMouseOver={(e) => { e.target.style.filter = 'brightness(1.1)'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseOut={(e) => { e.target.style.filter = ''; e.target.style.transform = ''; }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes notif-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes notif-modal-in {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}

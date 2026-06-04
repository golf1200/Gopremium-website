// ============================================================
// GO PREMIUM — Floating quote cart button (bottom-right)
// ============================================================
import { useNavigate } from 'react-router-dom';
import { useQuoteCtx } from '../contexts/QuoteContext';

export default function QuoteFab() {
  const { count } = useQuoteCtx();
  const navigate = useNavigate();

  if (count === 0) return null;

  return (
    <button
      onClick={() => navigate('/quote')}
      aria-label={`ดูใบขอราคา ${count} รายการ`}
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 20px',
        borderRadius: 50,
        background: 'var(--gp-navy)',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(31,58,95,.4)',
        fontFamily: 'var(--gp-font-head)',
        fontWeight: 600,
        fontSize: 14.5,
        transition: 'transform .2s, box-shadow .2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(31,58,95,.5)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(31,58,95,.4)'; }}
    >
      {/* Cart icon */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      ใบขอราคา
      {/* Badge */}
      <span style={{
        background: 'var(--gp-mustard)',
        color: 'var(--gp-navy)',
        borderRadius: '50%',
        width: 22,
        height: 22,
        fontSize: 12,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>{count}</span>
    </button>
  );
}

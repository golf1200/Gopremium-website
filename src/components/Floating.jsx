import { useState, useEffect } from 'react';
import GpIcon from './shared/GpIcon';
import GpSpark from './shared/GpSpark';
import { gpScrollTo } from '../utils/scroll';

export default function Floating({ onQuote }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 620);
    h();
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ position: 'fixed', right: 'clamp(16px,2.5vw,28px)', bottom: 'clamp(16px,2.5vw,28px)', zIndex: 45, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end', opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(16px)', pointerEvents: show ? 'auto' : 'none', transition: '.3s' }}>
      <button onClick={() => gpScrollTo('ai')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: 'var(--gp-navy)', border: '1px solid var(--gp-grey-200)', borderRadius: 99, padding: '11px 17px', fontFamily: 'var(--gp-font-head)', fontWeight: 500, fontSize: 14, boxShadow: 'var(--gp-shadow-md)', cursor: 'pointer' }}>
        <GpSpark size={15} style={{ color: 'var(--gp-mustard-deep)' }} /> ถาม AI
      </button>
      <button onClick={onQuote} aria-label="chat" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#06C755', color: '#fff', border: 'none', borderRadius: 99, padding: '13px 20px', fontFamily: 'var(--gp-font-head)', fontWeight: 600, fontSize: 15, boxShadow: '0 14px 30px -10px rgba(6,199,85,.6)', cursor: 'pointer' }}>
        <GpIcon name="chat" size={20} stroke="#fff" sw={2} /> แชต LINE
      </button>
    </div>
  );
}

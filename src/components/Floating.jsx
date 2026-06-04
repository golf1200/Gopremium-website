import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GpIcon from './shared/GpIcon';
import GpSpark from './shared/GpSpark';
import { gpScrollTo } from '../utils/scroll';
import { track } from '../utils/analytics';
import { site } from '../config';

export default function Floating() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const h = () => setShow(window.scrollY > 400);
    h();
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  function goAI() {
    if (isHome) gpScrollTo('ai');
    else navigate('/', { state: { scrollTo: 'ai' } });
  }

  return (
    <div style={{
      position: 'fixed', right: 'clamp(16px,2.5vw,28px)', bottom: 'clamp(16px,2.5vw,28px)',
      zIndex: 45, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end',
      opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(16px)',
      pointerEvents: show ? 'auto' : 'none', transition: '.3s',
    }}>
      <button onClick={goAI} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: '#fff', color: 'var(--gp-navy)',
        border: '1px solid var(--gp-grey-200)', borderRadius: 99,
        padding: '11px 17px', fontFamily: 'var(--gp-font-head)', fontWeight: 500,
        fontSize: 14, boxShadow: 'var(--gp-shadow-md)', cursor: 'pointer',
      }}>
        <GpSpark size={15} style={{ color: 'var(--gp-mustard-deep)' }} /> ถาม AI
      </button>

      {site.lineUrl ? (
        <a href={site.lineUrl} target="_blank" rel="noopener noreferrer"
          onClick={() => track('contact_line', { source: 'floating' })}
          aria-label="แชต LINE GO PREMIUM"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#06C755', color: '#fff', borderRadius: 99, padding: '13px 20px', fontFamily: 'var(--gp-font-head)', fontWeight: 600, fontSize: 15, boxShadow: '0 14px 30px -10px rgba(6,199,85,.6)', textDecoration: 'none', border: 'none' }}>
          <GpIcon name="chat" size={20} stroke="#fff" sw={2} /> แชต LINE
        </a>
      ) : (
        <button onClick={() => navigate('/quote')}
          aria-label="ขอใบเสนอราคา"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'var(--gp-navy)', color: '#fff', border: 'none', borderRadius: 99, padding: '13px 20px', fontFamily: 'var(--gp-font-head)', fontWeight: 600, fontSize: 15, boxShadow: '0 14px 30px -10px rgba(31,58,95,.5)', cursor: 'pointer' }}>
          <GpIcon name="arrow" size={18} stroke="#fff" sw={2} /> ขอราคา
        </button>
      )}
    </div>
  );
}

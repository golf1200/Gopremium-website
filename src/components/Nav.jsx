import { useState, useEffect } from 'react';
import GpLogo from './shared/GpLogo';
import { gpScrollTo } from '../utils/scroll';

const NAV_LINKS = [
  { l: 'AI Concierge', id: 'ai' },
  { l: 'สินค้าพร้อมส่ง', id: 'products' },
  { l: 'เลือกตามโอกาส', id: 'occasion' },
  { l: 'เลือกตามงบ', id: 'budget' },
  { l: 'ผลงานของเรา', id: 'portfolio' },
];

export default function Nav({ onQuote }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 16);
    h();
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, transition: '.25s' }}>
      <div style={{
        background: scrolled ? 'rgba(255,255,255,.82)' : 'rgba(255,255,255,0)',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--gp-grey-200)' : '1px solid transparent',
        boxShadow: scrolled ? '0 6px 24px -18px rgba(31,58,95,.5)' : 'none',
        transition: '.25s',
      }}>
        <div className="gp-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ display: 'flex', alignItems: 'center' }}>
            <GpLogo width={150} />
          </a>
          <nav className="gp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            {NAV_LINKS.map((x) => (
              <a key={x.id} href={`#${x.id}`}
                onClick={(e) => { e.preventDefault(); gpScrollTo(x.id); }}
                style={{ fontFamily: 'var(--gp-font-head)', fontSize: 14.5, fontWeight: 500, color: 'var(--gp-navy)', cursor: 'pointer', transition: '.15s', whiteSpace: 'nowrap' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gp-mustard-deep)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gp-navy)'}>{x.l}</a>
            ))}
            <button className="gp-btn gp-btn-primary gp-btn-sm" onClick={onQuote}>ขอใบเสนอราคา</button>
          </nav>
          <button className="gp-nav-burger" onClick={() => setOpen((o) => !o)} aria-label="menu"
            style={{ display: 'none', background: 'none', border: 'none', padding: 8 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gp-navy)" strokeWidth="2">
              <path d={open ? 'M6 6l12 12M6 18 18 6' : 'M3 6h18M3 12h18M3 18h18'} />
            </svg>
          </button>
        </div>
        {open && (
          <div className="gp-wrap" style={{ paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_LINKS.map((x) => (
              <a key={x.id} href={`#${x.id}`}
                onClick={(e) => { e.preventDefault(); setOpen(false); gpScrollTo(x.id); }}
                style={{ fontFamily: 'var(--gp-font-head)', fontSize: 16, fontWeight: 500, color: 'var(--gp-navy)', padding: '11px 4px', borderBottom: '1px solid var(--gp-grey-200)' }}>{x.l}</a>
            ))}
            <button className="gp-btn gp-btn-primary" style={{ marginTop: 10 }}
              onClick={() => { setOpen(false); onQuote && onQuote(); }}>ขอใบเสนอราคา</button>
          </div>
        )}
      </div>
    </header>
  );
}

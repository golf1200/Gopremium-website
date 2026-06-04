// ============================================================
// GO PREMIUM — Nav with mega-menu + router awareness
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GpLogo from './shared/GpLogo';
import { useQuoteCtx } from '../contexts/QuoteContext';
import { CATEGORY_GROUPS, OCCASIONS, BUDGET_TIERS } from '../data/products';
import { gpScrollTo } from '../utils/scroll';

export default function Nav() {
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [megaOpen, setMegaOpen]       = useState(false);
  const [megaTimer, setMegaTimer]     = useState(null);
  const megaRef                        = useRef(null);
  const location                       = useLocation();
  const navigate                       = useNavigate();
  const { count }                      = useQuoteCtx();
  const isHome                         = location.pathname === '/';

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 16);
    h();
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Close mega on route change
  useEffect(() => { setMegaOpen(false); setMobileOpen(false); }, [location.pathname]);

  function openMega()  { if (megaTimer) clearTimeout(megaTimer); setMegaOpen(true);  }
  function closeMega() { const t = setTimeout(() => setMegaOpen(false), 120); setMegaTimer(t); }

  function goHome() {
    if (isHome) { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else navigate('/');
  }

  function scrollOrGo(id) {
    if (isHome) gpScrollTo(id);
    else navigate('/', { state: { scrollTo: id } });
    setMobileOpen(false);
  }

  const showSolid = scrolled || !isHome;

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
      {/* Top bar */}
      <div style={{
        background: showSolid ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,0)',
        backdropFilter: showSolid ? 'blur(16px)' : 'none',
        borderBottom: showSolid ? '1px solid var(--gp-grey-200)' : '1px solid transparent',
        boxShadow: showSolid ? '0 4px 24px -16px rgba(31,58,95,.35)' : 'none',
        transition: '.25s',
      }}>
        <div className="gp-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <button onClick={goHome} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <GpLogo width={150} />
          </button>

          {/* Desktop nav */}
          <nav className="gp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Catalog mega-trigger */}
            <div style={{ position: 'relative' }}
              onMouseEnter={openMega} onMouseLeave={closeMega}>
              <button
                style={{ ...navLinkStyle, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', background: 'none', border: 'none', padding: '6px 10px', borderRadius: 8 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gp-mustard-deep)'; e.currentTarget.style.background = 'var(--gp-cloud)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gp-navy)'; e.currentTarget.style.background = 'none'; }}
                aria-expanded={megaOpen}
              >
                แคตตาล็อก
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: megaOpen ? 'rotate(180deg)' : 'none', transition: '.2s' }}><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>

            <NavLink label="AI Concierge"    onClick={() => scrollOrGo('ai')} />
            <NavLink label="เลือกตามโอกาส" onClick={() => scrollOrGo('occasion')} />
            <NavLink label="เลือกตามงบ"    onClick={() => scrollOrGo('budget')} />
            <NavLink label="ผลงานของเรา"   onClick={() => scrollOrGo('portfolio')} />

            {/* Quote button with badge */}
            <Link to="/quote" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
              <div style={{ position: 'relative' }}>
                <button className="gp-btn gp-btn-primary gp-btn-sm">ขอใบเสนอราคา</button>
                {count > 0 && (
                  <span style={{
                    position: 'absolute', top: -8, right: -8,
                    background: 'var(--gp-mustard)', color: 'var(--gp-navy)',
                    borderRadius: '50%', width: 18, height: 18,
                    fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #fff',
                  }}>{count}</span>
                )}
              </div>
            </Link>
          </nav>

          {/* Mobile burger */}
          <button className="gp-nav-burger" onClick={() => setMobileOpen((o) => !o)} aria-label="menu"
            style={{ display: 'none', background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gp-navy)" strokeWidth="2">
              <path d={mobileOpen ? 'M6 6l12 12M6 18 18 6' : 'M3 6h18M3 12h18M3 18h18'} />
            </svg>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MEGA MENU                                                            */}
      {/* ------------------------------------------------------------------ */}
      {megaOpen && (
        <div
          ref={megaRef}
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: '#fff',
            boxShadow: '0 16px 48px rgba(31,58,95,.18)',
            borderTop: '1px solid var(--gp-grey-200)',
            animation: 'gpFadeSlide .18s ease',
          }}
        >
          <div className="gp-wrap" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: 0, padding: '28px 0' }}>
            {/* Column A: Categories */}
            <div style={{ paddingRight: 28, borderRight: '1px solid var(--gp-grey-200)' }}>
              <MegaHeading>เลือกตามหมวดหมู่</MegaHeading>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
                {CATEGORY_GROUPS.map((g) => (
                  <div key={g.group} style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11.5, color: 'var(--gp-grey)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>
                      {g.icon} {g.group}
                    </p>
                    {g.categories.map((c) => (
                      <Link key={c.slug} to={`/category/${c.slug}`}
                        style={{ display: 'block', fontSize: 13.5, color: 'var(--gp-navy)', textDecoration: 'none', padding: '3px 0 3px 10px', borderRadius: 5, transition: '.12s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gp-mustard-deep)'; e.currentTarget.style.background = 'var(--gp-cloud)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gp-navy)'; e.currentTarget.style.background = 'none'; }}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
              <Link to="/products" style={{ display: 'inline-block', marginTop: 8, fontSize: 13, color: 'var(--gp-mustard-deep)', textDecoration: 'none', fontWeight: 500 }}>
                ดูสินค้าทั้งหมด →
              </Link>
            </div>

            {/* Column B: Occasions */}
            <div style={{ padding: '0 28px', borderRight: '1px solid var(--gp-grey-200)' }}>
              <MegaHeading>เลือกตามโอกาส</MegaHeading>
              {OCCASIONS.map((o) => (
                <Link key={o.slug} to={`/occasion/${o.slug}`}
                  style={{ display: 'block', fontSize: 13.5, color: 'var(--gp-navy)', textDecoration: 'none', padding: '5px 8px', borderRadius: 6, transition: '.12s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gp-mustard-deep)'; e.currentTarget.style.background = 'var(--gp-cloud)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gp-navy)'; e.currentTarget.style.background = 'none'; }}
                >
                  {o.label}
                </Link>
              ))}
            </div>

            {/* Column C: Budget */}
            <div style={{ paddingLeft: 28 }}>
              <MegaHeading>เลือกตามงบ</MegaHeading>
              {BUDGET_TIERS.map((b) => (
                <Link key={b.slug} to={`/budget/${b.slug}`}
                  style={{ display: 'block', fontSize: 13.5, color: 'var(--gp-navy)', textDecoration: 'none', padding: '5px 8px', borderRadius: 6, transition: '.12s', marginBottom: 2 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gp-mustard-deep)'; e.currentTarget.style.background = 'var(--gp-cloud)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gp-navy)'; e.currentTarget.style.background = 'none'; }}
                >
                  {b.label}
                </Link>
              ))}

              <div style={{ marginTop: 20, background: 'var(--gp-cloud)', borderRadius: 10, padding: '14px 14px' }}>
                <p style={{ fontSize: 12.5, color: 'var(--gp-navy)', fontWeight: 600, marginBottom: 6 }}>ไม่แน่ใจ?</p>
                <p style={{ fontSize: 12, color: 'var(--gp-grey)', marginBottom: 10, lineHeight: 1.5 }}>ให้ AI Concierge แนะนำสินค้าตามโจทย์ของคุณ</p>
                <button className="gp-btn gp-btn-primary gp-btn-sm" style={{ width: '100%' }}
                  onClick={() => scrollOrGo('ai')}>AI Concierge</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE DRAWER                                                        */}
      {/* ------------------------------------------------------------------ */}
      {mobileOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid var(--gp-grey-200)', boxShadow: '0 8px 24px rgba(0,0,0,.1)', maxHeight: 'calc(100vh - 68px)', overflowY: 'auto' }}>
          <div className="gp-wrap" style={{ paddingTop: 12, paddingBottom: 24 }}>
            <Link to="/products" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '12px 4px', borderBottom: '1px solid var(--gp-grey-200)', fontSize: 16, fontWeight: 600, color: 'var(--gp-navy)', textDecoration: 'none' }}>
              🗂 แคตตาล็อกสินค้าทั้งหมด
            </Link>
            <p style={{ fontSize: 12, color: 'var(--gp-grey)', margin: '12px 0 6px', fontWeight: 600, textTransform: 'uppercase' }}>หมวดหมู่</p>
            {CATEGORY_GROUPS.flatMap((g) => g.categories).map((c) => (
              <Link key={c.slug} to={`/category/${c.slug}`} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '9px 4px', borderBottom: '1px solid var(--gp-grey-200)', fontSize: 14.5, color: 'var(--gp-navy)', textDecoration: 'none' }}>
                {c.label}
              </Link>
            ))}
            <p style={{ fontSize: 12, color: 'var(--gp-grey)', margin: '12px 0 6px', fontWeight: 600, textTransform: 'uppercase' }}>โอกาส</p>
            {OCCASIONS.map((o) => (
              <Link key={o.slug} to={`/occasion/${o.slug}`} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '9px 4px', borderBottom: '1px solid var(--gp-grey-200)', fontSize: 14.5, color: 'var(--gp-navy)', textDecoration: 'none' }}>
                {o.label}
              </Link>
            ))}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/quote" onClick={() => setMobileOpen(false)} className="gp-btn gp-btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
                ขอใบเสนอราคา {count > 0 && `(${count})`}
              </Link>
              <button className="gp-btn gp-btn-ghost" onClick={() => { setMobileOpen(false); scrollOrGo('ai'); }}>AI Concierge</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function NavLink({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ ...navLinkStyle, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 8 }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gp-mustard-deep)'; e.currentTarget.style.background = 'var(--gp-cloud)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gp-navy)'; e.currentTarget.style.background = 'none'; }}
    >
      {label}
    </button>
  );
}

function MegaHeading({ children }) {
  return (
    <p style={{ fontSize: 12, color: 'var(--gp-grey)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 12 }}>
      {children}
    </p>
  );
}

const navLinkStyle = {
  fontFamily: 'var(--gp-font-head)',
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--gp-navy)',
  whiteSpace: 'nowrap',
  transition: '.15s',
};

// ============================================================
// GO PREMIUM — Mobile sticky CTA bar (brief §9.10)
// LINE (primary TH B2B channel) + ขอใบเสนอราคา, always within thumb reach.
// Visibility is controlled by CSS (.gp-mobile-cta shows ≤760px only);
// here we just fade it in once the user scrolls past the hero.
// ============================================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GpIcon from './shared/GpIcon';
import { track } from '../utils/analytics';
import { site } from '../config';

export default function MobileCTABar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const h = () => setShow(window.scrollY > 380);
    h();
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div
      className="gp-mobile-cta"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'none' : 'translateY(100%)',
        pointerEvents: show ? 'auto' : 'none',
        transition: 'opacity .25s, transform .25s',
      }}
    >
      {site.lineUrl ? (
        <a href={site.lineUrl} target="_blank" rel="noopener noreferrer"
          onClick={() => track('contact_line', { source: 'mobile-bar' })}
          className="gp-btn gp-btn-line" style={{ textDecoration: 'none' }}>
          <GpIcon name="chat" size={17} stroke="#fff" sw={2.2} /> LINE {site.lineId}
        </a>
      ) : <span />}
      <Link to="/quote" className="gp-btn gp-btn-primary" style={{ textDecoration: 'none' }}>
        ขอใบเสนอราคา
      </Link>
    </div>
  );
}

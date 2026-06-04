// ============================================================
// GO PREMIUM — GA4 analytics (config-driven, single source)
// initGA() loads gtag.js only when `gaId` is set in config.js.
// track() fires events and safely no-ops when GA isn't loaded,
// so call sites never need to guard for it.
// ============================================================
import { gaId } from '../config';

let started = false;

export function initGA() {
  if (started || !gaId || typeof window === 'undefined') return;
  started = true;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', gaId);
}

/**
 * Fire a GA4 event. No-ops if GA isn't loaded (gaId empty).
 * @param {string} name   - event name, e.g. 'generate_lead' | 'contact_line'
 * @param {object} params - optional event params
 */
export function track(name, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

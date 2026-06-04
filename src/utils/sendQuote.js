// ============================================================
// GO PREMIUM — central quote/RFQ submitter
// Sends lead payloads to Formspree (JSON), or falls back to a
// pre-filled mailto: when no Formspree ID is configured.
// ============================================================
import { site, formspreeId } from '../config';

/**
 * Submit a quote/RFQ payload.
 * @param {Record<string, any>} payload - flat key/value fields (Formspree uses _subject, _gotcha specially)
 * @returns {Promise<{ ok: boolean }>}
 */
export async function sendQuote(payload) {
  // --- Path A: real Formspree backend ---
  if (formspreeId) {
    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  }

  // --- Path B: mailto fallback (no backend configured) ---
  try {
    const subject = payload._subject || 'ขอใบเสนอราคา — GO PREMIUM';
    const bodyLines = Object.entries(payload)
      .filter(([k]) => k !== '_subject' && k !== '_gotcha')
      .map(([k, v]) => `${k}: ${v}`);
    const body = encodeURIComponent(bodyLines.join('\n'));
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

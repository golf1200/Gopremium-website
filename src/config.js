// ============================================================
// GO PREMIUM — central site config
// Edit contact details here; every CTA reads from this file.
// ============================================================

export const site = {
  brand: 'GO PREMIUM',
  legalName: 'PASSION GROW TRADING CO., LTD.',
  // --- Contact ---
  phone: '02-096-6465',
  phoneIntl: '+6620966465',          // used for tel: link
  email: 'info@passiongrow.co.th',
  // --- LINE Official Account ---
  // TODO(golf): replace with the real LINE OA link, e.g. https://lin.ee/xxxxxxx
  // Until then the LINE button falls back to the quote form (no dead link shipped).
  lineUrl: '',                        // e.g. 'https://lin.ee/XXXXXXX'
  lineId: '@gopremium',
  // --- Social / web ---
  facebook: '',                       // e.g. 'https://facebook.com/gopremium'
  instagram: '',
  siteUrl: 'https://gopremium-website.vercel.app',
};

// LINE click handler target: real LINE link if set, else null (caller routes to form)
export const lineHref = site.lineUrl || null;

// ---------------------------------------------------------------------------
// Formspree — RFQ email backend
// 1. Go to https://formspree.io, sign up free, create a form
// 2. Set the form email to info@passiongrow.co.th
// 3. Paste the form ID here (the part after /f/ in the endpoint URL)
// ---------------------------------------------------------------------------
export const formspreeId = ''; // e.g. 'xyzabcde'

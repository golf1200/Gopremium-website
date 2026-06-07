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
  lineUrl: 'https://lin.ee/z1GT1KR',  // real LINE OA link

  lineId: '@gopremium',
  // --- Social / web ---
  facebook: '',                       // e.g. 'https://facebook.com/gopremium'
  instagram: '',
  // --- Canonical domain (SINGLE SOURCE OF TRUTH) ---
  // This is the ONE place to change the production domain. On change:
  //   • index.html canonical/OG/JSON-LD auto-follow at build (vite.config.js plugin)
  //   • runtime <head> (useMeta) follows automatically
  //   • sitemap.xml + robots.txt: rerun `node generate-sitemap.js` to regenerate
  // No trailing slash.
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
export const formspreeId = 'xbdejbyr'; // https://formspree.io/f/xbdejbyr → info@passiongrow.co.th

// ---------------------------------------------------------------------------
// GA4 — Google Analytics 4 (single source of truth)
// Paste your Measurement ID here (Analytics → Admin → Data Streams → "G-XXXXXXXXXX").
// While empty, GA does NOT load and tracking calls safely no-op — so the
// generate_lead / contact_line plumbing is live and starts measuring the
// moment a real ID is added. No other file needs editing.
// ---------------------------------------------------------------------------
export const gaId = 'G-JTMVQM245Y'; // GA4 Measurement ID → GoPremium Website stream

// GO PREMIUM — first-party marketing attribution for RFQ handoff.
// Raw click IDs stay in the form/CRM payload and are never sent to GA4.

export const ATTRIBUTION_KEYS = [
  'gclid',
  'gbraid',
  'wbraid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
];

const STORAGE_KEY = 'gp_attribution_v1';
const LEAD_ID_KEY = 'gp_lead_id';

function readStored() {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function makeLeadId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function captureAttribution() {
  if (typeof window === 'undefined') return {};

  const stored = readStored();
  const params = new URLSearchParams(window.location.search);

  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key);
    if (value) stored[key] = value;
  }

  if (!stored.landing_path) stored.landing_path = window.location.pathname || '/';
  if (!stored.referrer_host && document.referrer) {
    try { stored.referrer_host = new URL(document.referrer).hostname; } catch { /* ignore invalid referrer */ }
  }

  let leadId = window.sessionStorage.getItem(LEAD_ID_KEY);
  if (!leadId) {
    leadId = makeLeadId();
    window.sessionStorage.setItem(LEAD_ID_KEY, leadId);
  }
  stored.lead_id = leadId;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return { ...stored };
}

export function getAttributionSummary(attribution = captureAttribution()) {
  if (attribution.gclid || attribution.gbraid || attribution.wbraid) return 'paid_click';
  if (attribution.utm_source) return 'utm';
  if (/google\./i.test(attribution.referrer_host || '')) return 'organic_search';
  if (attribution.referrer_host) return 'referral';
  return 'direct';
}

export function getAttributionPayload() {
  const attribution = captureAttribution();
  return {
    ...Object.fromEntries(ATTRIBUTION_KEYS.map((key) => [key, attribution[key] || ''])),
    landing_path: attribution.landing_path || '/',
    lead_id: attribution.lead_id || '',
    marketing_source: getAttributionSummary(attribution),
  };
}

export function buildAttributedPath(path) {
  const attribution = captureAttribution();
  const params = new URLSearchParams();
  for (const key of ATTRIBUTION_KEYS) {
    if (attribution[key]) params.set(key, attribution[key]);
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

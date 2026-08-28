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
const SUBMISSION_ID_PREFIX = 'gp_rfq_submission_id_';
const SUBMITTED_AT_PREFIX = 'gp_rfq_submitted_at_';

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

function makeSubmissionId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index++) bytes[index] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function submissionStorageKey(formType) {
  return `${SUBMISSION_ID_PREFIX}${String(formType || 'rfq').replace(/[^a-z0-9_-]/gi, '_')}`;
}

function submittedAtStorageKey(formType) {
  return `${SUBMITTED_AT_PREFIX}${String(formType || 'rfq').replace(/[^a-z0-9_-]/gi, '_')}`;
}

export function captureAttribution() {
  if (typeof window === 'undefined') return {};

  const stored = readStored();
  const params = new URLSearchParams(window.location.search);

  // landing_path is the legacy lock marker. Once a session has a landing path,
  // every click/UTM/referrer field is frozen as one first-touch envelope,
  // including fields that were empty on that first page.
  const envelopeLocked = Object.prototype.hasOwnProperty.call(stored, 'landing_path');
  if (!envelopeLocked) {
    for (const key of ATTRIBUTION_KEYS) stored[key] = stored[key] || params.get(key) || '';
    stored.landing_path = window.location.pathname || '/';
    stored.referrer_host = '';
    if (document.referrer) {
      try { stored.referrer_host = new URL(document.referrer).hostname; } catch { /* ignore invalid referrer */ }
    }
  } else {
    for (const key of ATTRIBUTION_KEYS) {
      if (typeof stored[key] !== 'string') stored[key] = '';
    }
    if (typeof stored.referrer_host !== 'string') stored.referrer_host = '';
    if (!stored.landing_path) stored.landing_path = '/';
  }
  stored.first_touch_locked = true;

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
    referrer_host: attribution.referrer_host || '',
    lead_id: attribution.lead_id || '',
    marketing_source: getAttributionSummary(attribution),
  };
}

// A submission ID identifies one logical submit attempt. It stays stable across
// network/server retries, then rotates only after the backend confirms success.
export function getOrCreateSubmissionId(formType) {
  if (typeof window === 'undefined') return '';
  const key = submissionStorageKey(formType);
  let submissionId = window.sessionStorage.getItem(key);
  if (!submissionId) {
    submissionId = makeSubmissionId();
    window.sessionStorage.setItem(key, submissionId);
  }
  return submissionId;
}

export function getOrCreateSubmittedAt(formType) {
  if (typeof window === 'undefined') return '';
  const key = submittedAtStorageKey(formType);
  let submittedAt = window.sessionStorage.getItem(key);
  if (!submittedAt) {
    submittedAt = new Date().toISOString();
    window.sessionStorage.setItem(key, submittedAt);
  }
  return submittedAt;
}

export function rotateSubmissionId(formType) {
  if (typeof window === 'undefined') return '';
  const submissionId = makeSubmissionId();
  window.sessionStorage.setItem(submissionStorageKey(formType), submissionId);
  window.sessionStorage.removeItem(submittedAtStorageKey(formType));
  return submissionId;
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

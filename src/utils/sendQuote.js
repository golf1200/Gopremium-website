// GO PREMIUM — deterministic first-party RFQ submitter.
// The browser talks only to the same-origin /api/rfq proxy. Formspree and CRM
// delivery happen downstream, where retries can be reconciled by submission_id.
import {
  ATTRIBUTION_KEYS,
  getAttributionPayload,
  getOrCreateSubmissionId,
  getOrCreateSubmittedAt,
  rotateSubmissionId,
} from './attribution.js';

export const RFQ_CONTRACT_VERSION = 'rfq-attribution-v1';
export const RFQ_CONSENT_VERSION = 'privacy-2026-08-28';

function text(value) {
  return value === null || value === undefined ? '' : String(value);
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    sku: text(item?.sku),
    name: text(item?.name),
    qty: text(item?.qty),
  }));
}

export function buildQuotePayload({
  formType,
  contact,
  rfq,
  websiteQualified = false,
  consent = false,
  honeypot = '',
}) {
  const captured = getAttributionPayload();
  return {
    contractVersion: RFQ_CONTRACT_VERSION,
    submission_id: getOrCreateSubmissionId(formType),
    lead_id: captured.lead_id,
    form_type: formType,
    submitted_at: getOrCreateSubmittedAt(formType),
    contact: {
      name: text(contact?.name),
      company: text(contact?.company),
      email: text(contact?.email),
      phone: text(contact?.phone),
    },
    rfq: {
      occasion: text(rfq?.occasion),
      qty: text(rfq?.qty),
      date: text(rfq?.date),
      budget: text(rfq?.budget),
      source: text(rfq?.source),
      source_auto: text(rfq?.source_auto),
      product: text(rfq?.product),
      details: text(rfq?.details),
      items: normalizeItems(rfq?.items),
    },
    attribution: {
      ...Object.fromEntries(ATTRIBUTION_KEYS.map((key) => [key, text(captured[key])])),
      landing_path: text(captured.landing_path || '/'),
      referrer_host: text(captured.referrer_host),
      marketing_source: text(captured.marketing_source),
    },
    website_qualified: Boolean(websiteQualified),
    consent: {
      accepted: Boolean(consent),
      version: RFQ_CONSENT_VERSION,
    },
    honeypot: text(honeypot),
  };
}

/**
 * Submit one canonical RFQ payload. Reusing the same payload on retry keeps the
 * same submission_id; callers rotate it only after an acknowledged completion.
 */
export async function sendQuote(payload) {
  try {
    const response = await fetch('/api/rfq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    let body = null;
    try { body = await response.json(); } catch { /* keep a generic safe result */ }
    const completed = response.ok && body?.ok === true && body?.status === 'completed';
    return {
      ok: completed,
      processing: response.status === 202 && body?.ok === true && body?.status === 'processing',
      status: response.status,
      error: typeof body?.error === 'string' ? body.error : '',
      submission_id: typeof body?.submission_id === 'string' ? body.submission_id : payload.submission_id,
      rfq_id: typeof body?.rfq_id === 'string' ? body.rfq_id : '',
    };
  } catch {
    return { ok: false, processing: false, status: 0, error: 'network_error', submission_id: payload.submission_id, rfq_id: '' };
  }
}

export function completeQuoteSubmission(formType) {
  return rotateSubmissionId(formType);
}

export function restartQuoteSubmission(formType) {
  return rotateSubmissionId(formType);
}

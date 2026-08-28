import { createHmac } from 'node:crypto';

const MAX_BODY_BYTES = 32 * 1024;
const CONTRACT_VERSION = 'rfq-attribution-v1';
const CONSENT_VERSION = 'privacy-2026-08-28';
const FORM_TYPES = new Set(['v2_quote_form', 'home_rfq', 'quote_page']);
const ATTRIBUTION_KEYS = new Set([
  'gclid',
  'gbraid',
  'wbraid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'landing_path',
  'referrer_host',
  'marketing_source',
]);
const TOP_LEVEL_KEYS = new Set([
  'contractVersion',
  'submission_id',
  'lead_id',
  'form_type',
  'submitted_at',
  'contact',
  'rfq',
  'attribution',
  'website_qualified',
  'consent',
  'honeypot',
]);
const CONTACT_KEYS = new Set(['name', 'company', 'email', 'phone']);
const RFQ_KEYS = new Set([
  'occasion',
  'qty',
  'date',
  'budget',
  'source',
  'source_auto',
  'product',
  'details',
  'items',
]);
const ITEM_KEYS = new Set(['sku', 'name', 'qty']);
const SAFE_RESPONSE_KEYS = new Set([
  'ok',
  'error',
  'code',
  'status',
  'rfq_id',
  'submission_id',
  'deduplicated',
  'duplicate',
  'processed_at',
]);

function firstHeader(value) {
  return String(Array.isArray(value) ? value[0] : value || '').split(',')[0].trim();
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasOnlyKeys(value, allowed) {
  return isPlainObject(value) && Object.keys(value).every((key) => allowed.has(key));
}

function isString(value, maxLength, { required = false } = {}) {
  if (typeof value !== 'string' || value.length > maxLength) return false;
  return !required || value.trim().length > 0;
}

function validUuid(value) {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validContact(contact) {
  if (!hasOnlyKeys(contact, CONTACT_KEYS)) return false;
  if (!isString(contact.name, 200, { required: true })) return false;
  if (!isString(contact.company, 240)) return false;
  if (!isString(contact.email, 254) || !isString(contact.phone, 80)) return false;
  const email = contact.email.trim();
  const phone = contact.phone.trim();
  if (!email && !phone) return false;
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return false;
  if (phone && !/^[\d\s+\-()]{8,}$/.test(phone)) return false;
  return true;
}

function validItems(items) {
  if (!Array.isArray(items) || items.length > 50) return false;
  return items.every((item) => hasOnlyKeys(item, ITEM_KEYS)
    && isString(item.sku, 80, { required: true })
    && isString(item.name, 300, { required: true })
    && isString(item.qty, 80));
}

function expectedWebsiteQualification(payload) {
  const present = (value) => typeof value === 'string' && value.trim().length > 0;
  if (payload.form_type === 'home_rfq') {
    return present(payload.rfq.qty) && present(payload.rfq.date) && present(payload.rfq.budget);
  }
  if (payload.form_type === 'quote_page') {
    return present(payload.contact.company) && present(payload.rfq.date) && present(payload.rfq.budget) && payload.rfq.items.length > 0;
  }
  return present(payload.contact.company) && present(payload.rfq.qty) && present(payload.rfq.date) && present(payload.rfq.budget);
}

function validRfq(rfq) {
  if (!hasOnlyKeys(rfq, RFQ_KEYS)) return false;
  const limits = {
    occasion: 240,
    qty: 100,
    date: 80,
    budget: 120,
    source: 240,
    source_auto: 240,
    product: 500,
    details: 5000,
  };
  for (const [key, maxLength] of Object.entries(limits)) {
    if (!isString(rfq[key], maxLength)) return false;
  }
  return validItems(rfq.items);
}

function validAttribution(attribution) {
  if (!hasOnlyKeys(attribution, ATTRIBUTION_KEYS)) return false;
  for (const key of ATTRIBUTION_KEYS) {
    const maxLength = key === 'landing_path'
      ? 1200
      : key === 'referrer_host'
        ? 255
        : ['gclid', 'gbraid', 'wbraid'].includes(key)
          ? 512
          : 300;
    if (!isString(attribution[key], maxLength)) return false;
  }
  return attribution.landing_path.startsWith('/')
    && !attribution.landing_path.startsWith('//');
}

export function validateCanonicalPayload(payload) {
  if (!hasOnlyKeys(payload, TOP_LEVEL_KEYS)) return { ok: false, error: 'invalid_payload' };
  if (payload.contractVersion !== CONTRACT_VERSION) return { ok: false, error: 'unsupported_contract' };
  if (!validUuid(payload.submission_id)) return { ok: false, error: 'invalid_submission_id' };
  if (!isString(payload.lead_id, 128, { required: true }) || !/^[A-Za-z0-9_-]+$/.test(payload.lead_id)) {
    return { ok: false, error: 'invalid_lead_id' };
  }
  if (!FORM_TYPES.has(payload.form_type)) return { ok: false, error: 'invalid_form_type' };
  if (!isString(payload.submitted_at, 40, { required: true }) || !Number.isFinite(Date.parse(payload.submitted_at))) {
    return { ok: false, error: 'invalid_submitted_at' };
  }
  if (!validContact(payload.contact)) return { ok: false, error: 'invalid_contact' };
  if (!validRfq(payload.rfq)) return { ok: false, error: 'invalid_rfq' };
  if (!validAttribution(payload.attribution)) return { ok: false, error: 'invalid_attribution' };
  if (typeof payload.website_qualified !== 'boolean' || payload.website_qualified !== expectedWebsiteQualification(payload)) {
    return { ok: false, error: 'invalid_qualification' };
  }
  if (!hasOnlyKeys(payload.consent, new Set(['accepted', 'version']))
      || payload.consent.accepted !== true
      || payload.consent.version !== CONSENT_VERSION) {
    return { ok: false, error: 'consent_required' };
  }
  if (!isString(payload.honeypot, 200)) return { ok: false, error: 'invalid_honeypot' };
  if (payload.honeypot.trim()) return { ok: false, error: 'bot_detected', status: 422 };
  return { ok: true };
}

export function getValidatedOrigin(req) {
  const suppliedOrigin = firstHeader(req.headers?.origin);
  if (!suppliedOrigin) return null;

  let normalizedOrigin;
  try { normalizedOrigin = new URL(suppliedOrigin).origin; } catch { return null; }

  const host = firstHeader(req.headers?.host);
  const localHost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
  const proto = localHost ? 'http' : 'https';
  const allowed = new Set();
  if (host) {
    try { allowed.add(new URL(`${proto}://${host}`).origin); } catch { return null; }
  }

  return allowed.has(normalizedOrigin) ? normalizedOrigin : null;
}

function parseBody(req) {
  const declaredLength = Number(firstHeader(req.headers?.['content-length']));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: 'payload_too_large' };
  }

  let payload = req.body;
  if (Buffer.isBuffer(payload)) payload = payload.toString('utf8');
  if (typeof payload === 'string') {
    if (Buffer.byteLength(payload, 'utf8') > MAX_BODY_BYTES) {
      return { ok: false, status: 413, error: 'payload_too_large' };
    }
    try { payload = JSON.parse(payload); } catch { return { ok: false, status: 400, error: 'invalid_json' }; }
  }

  if (!isPlainObject(payload)) return { ok: false, status: 400, error: 'invalid_json' };
  if (Buffer.byteLength(JSON.stringify(payload), 'utf8') > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: 'payload_too_large' };
  }
  return { ok: true, payload };
}

function safeResponse(value, fallbackOk) {
  if (!isPlainObject(value)) return { ok: fallbackOk };
  const safe = {};
  for (const [key, item] of Object.entries(value)) {
    if (SAFE_RESPONSE_KEYS.has(key) && ['string', 'number', 'boolean'].includes(typeof item)) safe[key] = item;
  }
  if (typeof safe.ok !== 'boolean') safe.ok = fallbackOk;
  return safe;
}

function sendJson(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(payload);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  const contentType = firstHeader(req.headers?.['content-type']).toLowerCase();
  if (!contentType.startsWith('application/json')) {
    return sendJson(res, 415, { ok: false, error: 'unsupported_media_type' });
  }

  const sourceOrigin = getValidatedOrigin(req);
  if (!sourceOrigin) return sendJson(res, 403, { ok: false, error: 'origin_not_allowed' });

  const parsed = parseBody(req);
  if (!parsed.ok) return sendJson(res, parsed.status, { ok: false, error: parsed.error });

  const validation = validateCanonicalPayload(parsed.payload);
  if (!validation.ok) {
    return sendJson(res, validation.status || 400, { ok: false, error: validation.error });
  }

  const ingestSecret = process.env.RFQ_INGEST_SECRET;
  if (!ingestSecret) return sendJson(res, 503, { ok: false, error: 'service_unavailable' });

  // Origin is an anti-spam/browser boundary, not authentication. The shared
  // secret stays server-only. Never forward or log the raw client IP.
  const forwardedFor = firstHeader(req.headers?.['x-forwarded-for']) || 'unavailable';
  const clientFingerprint = createHmac('sha256', ingestSecret).update(forwardedFor).digest('hex');

  const ingestUrl = process.env.RFQ_INGEST_URL
    || 'https://gopremium-platform.vercel.app/api/pm?action=rfq-ingest';

  try {
    const upstream = await fetch(ingestUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-rfq-ingest-key': ingestSecret,
        'x-rfq-source-origin': sourceOrigin,
        'x-rfq-client-fingerprint': clientFingerprint,
      },
      body: JSON.stringify(parsed.payload),
      signal: AbortSignal.timeout(12_000),
    });

    let upstreamBody = null;
    try { upstreamBody = await upstream.json(); } catch { /* return a safe generic body */ }
    return sendJson(res, upstream.status, safeResponse(upstreamBody, upstream.ok));
  } catch {
    return sendJson(res, 502, { ok: false, error: 'upstream_unavailable' });
  }
}

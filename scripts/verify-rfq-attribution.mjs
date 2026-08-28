import assert from 'node:assert/strict';
import { createHmac, webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import handler, { validateCanonicalPayload } from '../api/rfq.js';
import {
  captureAttribution,
  getOrCreateSubmissionId,
  getOrCreateSubmittedAt,
} from '../src/utils/attribution.js';
import {
  buildQuotePayload,
  completeQuoteSubmission,
  sendQuote,
} from '../src/utils/sendQuote.js';

const checks = [];
function check(name, fn) {
  try {
    fn();
    checks.push({ name, pass: true });
  } catch (error) {
    checks.push({ name, pass: false, error });
  }
}

async function checkAsync(name, fn) {
  try {
    await fn();
    checks.push({ name, pass: true });
  } catch (error) {
    checks.push({ name, pass: false, error });
  }
}

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

function makePayload(overrides = {}) {
  return {
    contractVersion: 'rfq-attribution-v1',
    submission_id: '8ecafdc7-f8b7-4dce-94df-8ed5acdd7f36',
    lead_id: 'lead_9ad2bf97-8b22-4217-9248-80dfdcfb492c',
    form_type: 'v2_quote_form',
    submitted_at: '2026-08-28T10:00:00.000Z',
    contact: { name: 'QA', company: 'GO PREMIUM QA', email: 'qa@example.com', phone: '' },
    rfq: {
      occasion: 'QA', qty: '200', date: '2026-09-30', budget: '300', source: 'Google ค้นหา',
      source_auto: 'google_ads (click_id)', product: 'EX001', details: 'Synthetic test', items: [],
    },
    attribution: {
      gclid: 'test-click', gbraid: '', wbraid: '', utm_source: 'google', utm_medium: 'cpc',
      utm_campaign: 'qa', utm_content: '', utm_term: '', landing_path: '/quote',
      referrer_host: 'www.google.com', marketing_source: 'paid_click',
    },
    website_qualified: true,
    consent: { accepted: true, version: 'privacy-2026-08-28' },
    honeypot: '',
    ...overrides,
  };
}

function makeReq(payload, headers = {}, method = 'POST') {
  return {
    method,
    headers: {
      origin: 'https://shop.example.com',
      host: 'shop.example.com',
      'x-forwarded-host': 'shop.example.com',
      'x-forwarded-proto': 'https',
      'x-forwarded-for': '203.0.113.42, 10.0.0.1',
      'content-type': 'application/json; charset=utf-8',
      ...headers,
    },
    body: payload,
  };
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(statusCode) { this.statusCode = statusCode; return this; },
    json(body) { this.body = body; return this; },
  };
}

const sessionStorage = new MemoryStorage();
globalThis.window = {
  location: { search: '?gclid=first-click&utm_source=google&utm_medium=cpc', pathname: '/first-landing' },
  sessionStorage,
  crypto: webcrypto,
};
globalThis.document = { referrer: 'https://www.google.com/search?q=gifts' };

check('first-touch attribution captures the original click and landing path', () => {
  const first = captureAttribution();
  assert.equal(first.gclid, 'first-click');
  assert.equal(first.utm_source, 'google');
  assert.equal(first.landing_path, '/first-landing');
  assert.equal(first.referrer_host, 'www.google.com');

  window.location = { search: '?gclid=later-click&utm_source=facebook&utm_medium=social', pathname: '/later-page' };
  document.referrer = 'https://facebook.com/';
  const later = captureAttribution();
  assert.equal(later.gclid, 'first-click');
  assert.equal(later.utm_source, 'google');
  assert.equal(later.utm_medium, 'cpc');
  assert.equal(later.landing_path, '/first-landing');
  assert.equal(later.referrer_host, 'www.google.com');
});

check('first-touch envelope prevents later click IDs from hybridizing a newsletter visit', () => {
  sessionStorage.clear();
  window.location = { search: '?utm_source=newsletter&utm_medium=email', pathname: '/newsletter-landing' };
  document.referrer = '';
  const newsletter = captureAttribution();
  assert.equal(newsletter.gclid, '');
  assert.equal(newsletter.utm_source, 'newsletter');
  assert.equal(newsletter.first_touch_locked, true);

  window.location = { search: '?gclid=later-paid-click&utm_source=google&utm_medium=cpc', pathname: '/later-paid-page' };
  document.referrer = 'https://www.google.com/';
  const laterPaid = captureAttribution();
  assert.equal(laterPaid.gclid, '');
  assert.equal(laterPaid.utm_source, 'newsletter');
  assert.equal(laterPaid.utm_medium, 'email');
  assert.equal(laterPaid.landing_path, '/newsletter-landing');
  assert.equal(laterPaid.referrer_host, '');
});

check('legacy stored landing_path is treated as an already-locked envelope', () => {
  sessionStorage.clear();
  sessionStorage.setItem('gp_attribution_v1', JSON.stringify({ landing_path: '/legacy-first', utm_source: 'newsletter' }));
  window.location = { search: '?gclid=must-not-attach&utm_medium=cpc', pathname: '/later' };
  document.referrer = 'https://www.google.com/';
  const legacy = captureAttribution();
  assert.equal(legacy.gclid, '');
  assert.equal(legacy.utm_source, 'newsletter');
  assert.equal(legacy.utm_medium, '');
  assert.equal(legacy.landing_path, '/legacy-first');
  assert.equal(legacy.referrer_host, '');
});

check('one logical submission keeps submission_id and submitted_at stable', () => {
  const firstId = getOrCreateSubmissionId('home_rfq');
  const firstTime = getOrCreateSubmittedAt('home_rfq');
  assert.equal(getOrCreateSubmissionId('home_rfq'), firstId);
  assert.equal(getOrCreateSubmittedAt('home_rfq'), firstTime);
});

const baseBuildArgs = {
  formType: 'home_rfq',
  contact: { name: 'QA', company: '', email: 'qa@example.com', phone: '' },
  rfq: { occasion: 'QA', qty: '100', date: '2026-09-30', budget: '250', source: '', source_auto: '', product: '', details: '', items: [] },
  websiteQualified: true,
  consent: true,
  honeypot: '',
};

await checkAsync('processing retry reuses byte-identical canonical payload', async () => {
  const payload = buildQuotePayload(baseBuildArgs);
  const sentBodies = [];
  let hit = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    sentBodies.push(options.body);
    hit++;
    return new Response(JSON.stringify(hit === 1
      ? { ok: true, status: 'processing', submission_id: payload.submission_id }
      : { ok: true, status: 'completed', submission_id: payload.submission_id, rfq_id: '7feee989-b36b-4893-bdec-72955fca398b' }), {
      status: hit === 1 ? 202 : 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  try {
    const first = await sendQuote(payload);
    const retry = await sendQuote(payload);
    assert.equal(first.ok, false);
    assert.equal(first.processing, true);
    assert.equal(retry.ok, true);
    assert.equal(sentBodies.length, 2);
    assert.equal(sentBodies[0], sentBodies[1]);
    const firstWire = JSON.parse(sentBodies[0]);
    const retryWire = JSON.parse(sentBodies[1]);
    assert.equal(firstWire.submission_id, retryWire.submission_id);
    assert.equal(firstWire.submitted_at, retryWire.submitted_at);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await checkAsync('acknowledged completion rotates submission_id and timestamp lifecycle', async () => {
  const before = buildQuotePayload(baseBuildArgs);
  completeQuoteSubmission('home_rfq');
  await new Promise((resolve) => setTimeout(resolve, 2));
  const after = buildQuotePayload(baseBuildArgs);
  assert.notEqual(after.submission_id, before.submission_id);
  assert.notEqual(after.submitted_at, before.submitted_at);
});

check('canonical validator accepts the v1 contract', () => {
  assert.deepEqual(validateCanonicalPayload(makePayload()), { ok: true });
});

check('canonical validator rejects honeypot and unknown fields', () => {
  assert.equal(validateCanonicalPayload(makePayload({ honeypot: 'bot' })).error, 'bot_detected');
  assert.equal(validateCanonicalPayload({ ...makePayload(), delivery_mode: 'crm_only' }).error, 'invalid_payload');
});

check('qualification semantics treat whitespace as missing', () => {
  const payload = makePayload({
    contact: { name: 'QA', company: '   ', email: 'qa@example.com', phone: '' },
    website_qualified: true,
  });
  assert.equal(validateCanonicalPayload(payload).error, 'invalid_qualification');
});

check('proxy field maxima never exceed the Platform contract', () => {
  const emailTooLong = makePayload({ contact: { name: 'QA', company: 'Company', email: `${'a'.repeat(243)}@example.com`, phone: '' } });
  assert.equal(emailTooLong.contact.email.length, 255);
  assert.equal(validateCanonicalPayload(emailTooLong).error, 'invalid_contact');

  const productTooLong = makePayload({ rfq: { ...makePayload().rfq, product: 'p'.repeat(501) } });
  assert.equal(validateCanonicalPayload(productTooLong).error, 'invalid_rfq');

  const landingTooLong = makePayload({ attribution: { ...makePayload().attribution, landing_path: `/${'x'.repeat(1200)}` } });
  assert.equal(validateCanonicalPayload(landingTooLong).error, 'invalid_attribution');

  const utmTooLong = makePayload({ attribution: { ...makePayload().attribution, utm_source: 'u'.repeat(301) } });
  assert.equal(validateCanonicalPayload(utmTooLong).error, 'invalid_attribution');

  assert.equal(validateCanonicalPayload(makePayload({ submitted_at: '2'.repeat(41) })).error, 'invalid_submitted_at');
  assert.equal(validateCanonicalPayload(makePayload({ honeypot: 'h'.repeat(201) })).error, 'invalid_honeypot');
  assert.equal(validateCanonicalPayload(makePayload({ lead_id: `lead_${'x'.repeat(124)}` })).error, 'invalid_lead_id');
});

check('primary v2 and both legacy React forms use only the first-party RFQ endpoint', () => {
  const sources = [
    readFileSync(new URL('../public/v2.html', import.meta.url), 'utf8'),
    readFileSync(new URL('../src/utils/sendQuote.js', import.meta.url), 'utf8'),
    readFileSync(new URL('../src/components/RFQ.jsx', import.meta.url), 'utf8'),
    readFileSync(new URL('../src/pages/QuotePage.jsx', import.meta.url), 'utf8'),
  ];
  assert(sources[0].includes("fetch('/api/rfq'"));
  assert(sources[1].includes("fetch('/api/rfq'"));
  assert(sources[2].includes('buildQuotePayload'));
  assert(sources[3].includes('buildQuotePayload'));
  assert(sources.every((source) => !source.includes('formspree.io')));
});

check('v2 and React expose the current privacy notice and real privacy routes', () => {
  const v2 = readFileSync(new URL('../public/v2.html', import.meta.url), 'utf8');
  const privacy = readFileSync(new URL('../src/pages/Privacy.jsx', import.meta.url), 'utf8');
  assert(v2.includes("if(p==='/privacy')return '/privacy'"));
  assert(v2.includes("else if(h==='/privacy')"));
  assert(v2.includes('data-privacy-version="2026-08-28"'));
  assert(privacy.includes('data-privacy-version="2026-08-28"'));
  for (const source of [v2, privacy]) {
    assert(source.includes('submission_id'));
    assert(source.includes('HMAC fingerprint'));
    assert(source.includes('Vercel'));
    assert(source.includes('Supabase'));
    assert(source.includes('Pipedrive'));
    assert(source.includes('Formspree'));
    assert(source.includes('ยังไม่ส่งผลการขาย'));
    assert(source.includes('นอกประเทศไทย'));
  }
});

await checkAsync('proxy enforces method, JSON, size, and same-origin boundaries', async () => {
  const methodRes = makeRes();
  await handler(makeReq(makePayload(), {}, 'GET'), methodRes);
  assert.equal(methodRes.statusCode, 405);

  const typeRes = makeRes();
  await handler(makeReq(makePayload(), { 'content-type': 'text/plain' }), typeRes);
  assert.equal(typeRes.statusCode, 415);

  const originRes = makeRes();
  await handler(makeReq(makePayload(), { origin: 'https://attacker.example' }), originRes);
  assert.equal(originRes.statusCode, 403);

  const spoofedForwardedHostRes = makeRes();
  await handler(makeReq(makePayload(), {
    origin: 'https://attacker.example',
    host: 'shop.example.com',
    'x-forwarded-host': 'attacker.example',
    'x-forwarded-proto': 'https',
  }), spoofedForwardedHostRes);
  assert.equal(spoofedForwardedHostRes.statusCode, 403);

  const sizeRes = makeRes();
  await handler(makeReq(makePayload(), { 'content-length': String(33 * 1024) }), sizeRes);
  assert.equal(sizeRes.statusCode, 413);

  const botRes = makeRes();
  await handler(makeReq(makePayload({ honeypot: 'filled' })), botRes);
  assert.equal(botRes.statusCode, 422);
});

await checkAsync('proxy forwards only canonical JSON plus HMAC fingerprint and returns a safe response', async () => {
  const originalFetch = globalThis.fetch;
  const oldSecret = process.env.RFQ_INGEST_SECRET;
  const oldUrl = process.env.RFQ_INGEST_URL;
  const secret = 'unit-test-secret-not-for-production';
  let forwarded = null;
  process.env.RFQ_INGEST_SECRET = secret;
  process.env.RFQ_INGEST_URL = 'https://platform.example/api/pm?action=rfq-ingest';
  globalThis.fetch = async (url, options) => {
    forwarded = { url, options };
    return new Response(JSON.stringify({
      ok: true,
      status: 'completed',
      rfq_id: '7feee989-b36b-4893-bdec-72955fca398b',
      submission_id: makePayload().submission_id,
      deduplicated: true,
      duplicate: false,
      processed_at: '2026-08-28T10:00:01.000Z',
      message: 'must not reach the browser',
      pipedrive_deal_id: 12345,
      contact: { email: 'must-not-leak@example.com' },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  try {
    const response = makeRes();
    await handler(makeReq(makePayload()), response);
    assert.equal(response.statusCode, 200);
    assert.equal(forwarded.url, process.env.RFQ_INGEST_URL);
    assert.equal(forwarded.options.headers['x-rfq-ingest-key'], secret);
    assert.equal(forwarded.options.headers['x-rfq-source-origin'], 'https://shop.example.com');
    assert.equal(
      forwarded.options.headers['x-rfq-client-fingerprint'],
      createHmac('sha256', secret).update('203.0.113.42').digest('hex'),
    );
    assert(!JSON.stringify(forwarded).includes('203.0.113.42'));
    assert(!Object.hasOwn(response.body, 'message'));
    assert(!Object.hasOwn(response.body, 'pipedrive_deal_id'));
    assert(!Object.hasOwn(response.body, 'contact'));
    assert.equal(response.body.status, 'completed');
    assert.equal(response.body.deduplicated, true);
  } finally {
    globalThis.fetch = originalFetch;
    if (oldSecret === undefined) delete process.env.RFQ_INGEST_SECRET; else process.env.RFQ_INGEST_SECRET = oldSecret;
    if (oldUrl === undefined) delete process.env.RFQ_INGEST_URL; else process.env.RFQ_INGEST_URL = oldUrl;
  }
});

let passed = 0;
console.log('\n============= RFQ ATTRIBUTION VERIFICATION =============');
for (const result of checks) {
  if (result.pass) passed++;
  console.log(`${result.pass ? 'PASS' : 'FAIL'}  ${result.name}${result.error ? ` — ${result.error.message}` : ''}`);
}
console.log('---------------------------------------------------------');
console.log(`${passed}/${checks.length} checks passed`);
console.log('=========================================================\n');
process.exitCode = passed === checks.length ? 0 : 1;

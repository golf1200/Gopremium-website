import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/contact-line-tracking.js', import.meta.url), 'utf8');

function createHarness() {
  const storage = new Map();
  const listeners = new Map();
  const calls = [];
  const window = {
    location: { pathname: '/express' },
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000001' },
    sessionStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, String(value)),
    },
    gtag: (...args) => calls.push(args),
  };
  const document = {
    addEventListener: (name, handler) => listeners.set(name, handler),
  };
  vm.runInNewContext(source, { window, document, Date, Math, Object });
  return { window, listeners, calls };
}

function lineClick(harness) {
  harness.listeners.get('click')({
    target: { closest: (selector) => selector.includes('lin.ee') ? { href: 'https://lin.ee/z1GT1KR' } : null },
  });
}

const firstSession = createHarness();
lineClick(firstSession);
lineClick(firstSession);
firstSession.window.gpTrackContactLine({ source: 'floating' });

assert.equal(firstSession.calls.length, 1, 'contact_line must fire at most once in one tab session');
assert.equal(firstSession.calls[0][0], 'event');
assert.equal(firstSession.calls[0][1], 'contact_line');
assert.deepEqual({ ...firstSession.calls[0][2] }, {
  source: '/express',
  measurement_stage: 'outbound_click',
  dedupe_scope: 'browser_tab_session',
  dedupe_version: 'contact-line-v1',
  event_id: '00000000-0000-4000-8000-000000000001',
});

const nextSession = createHarness();
lineClick(nextSession);
assert.equal(nextSession.calls.length, 1, 'a new tab session must be able to fire once');

console.log('PASS contact_line dedupe: one event per browser-tab session with stable non-PII event_id');

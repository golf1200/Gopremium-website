(function initContactLineTracking(window, document) {
  'use strict';

  var GLOBAL_KEY = '__gpContactLineTrackingV1';
  var SENT_KEY = 'gp_contact_line_sent_v1';
  var EVENT_ID_KEY = 'gp_contact_line_event_id_v1';

  if (window[GLOBAL_KEY]) {
    window.gpTrackContactLine = window[GLOBAL_KEY].track;
    return;
  }

  var sentInMemory = false;
  var eventIdInMemory = '';

  function getSessionValue(key) {
    try {
      return window.sessionStorage.getItem(key) || '';
    } catch (_error) {
      return '';
    }
  }

  function setSessionValue(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function correlationId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'line_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12);
  }

  function track(params) {
    if (typeof window.gtag !== 'function') return false;
    if (sentInMemory || getSessionValue(SENT_KEY) === '1') return false;

    sentInMemory = true;
    setSessionValue(SENT_KEY, '1');

    var eventId = getSessionValue(EVENT_ID_KEY) || eventIdInMemory || correlationId();
    eventIdInMemory = eventId;
    setSessionValue(EVENT_ID_KEY, eventId);

    var payload = Object.assign({}, params || {}, {
      source: (params && params.source) || window.location.pathname || '/',
      measurement_stage: 'outbound_click',
      dedupe_scope: 'browser_tab_session',
      dedupe_version: 'contact-line-v1',
      event_id: eventId,
    });

    window.gtag('event', 'contact_line', payload);
    return true;
  }

  function onDocumentClick(event) {
    var target = event.target;
    var link = target && target.closest && target.closest('a[href*="lin.ee"]');
    if (!link) return;
    track({ source: window.location.pathname || '/' });
  }

  window[GLOBAL_KEY] = { track: track };
  window.gpTrackContactLine = track;
  document.addEventListener('click', onDocumentClick);
})(window, document);

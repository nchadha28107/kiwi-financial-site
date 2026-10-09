/* ==========================================================================
   Analytics: GA4 + Microsoft Clarity loaders and the KFS event vocabulary.
   Both tags stay dormant until an ID is set in config.js, so local and
   staging builds generate no traffic.
   ========================================================================== */
(function (w, d) {
  'use strict';

  var CFG = w.KFS_CONFIG || {};
  var GA = CFG.ga4MeasurementId;
  var CLARITY = CFG.clarityProjectId;

  /* ---------------------------------------------------------------- GA4 */
  w.dataLayer = w.dataLayer || [];
  function gtag() { w.dataLayer.push(arguments); }

  if (GA) {
    var s = d.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA);
    d.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA);
  }

  /* ---------------------------------------------------------------- Clarity */
  if (CLARITY) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(w, d, 'clarity', 'script', CLARITY);
  }

  /* ---------------------------------------------------------------- UTM capture */
  // First-touch attribution survives the session so a lead can be credited
  // to the campaign that brought the visitor in, not the last page they saw.
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
  function captureUtm() {
    try {
      var params = new URLSearchParams(location.search);
      var found = {};
      UTM_KEYS.forEach(function (k) { if (params.get(k)) found[k] = params.get(k); });
      if (Object.keys(found).length) {
        found.landing_page = location.pathname;
        found.referrer = d.referrer || '(direct)';
        found.captured_at = new Date().toISOString();
        sessionStorage.setItem('kfs_utm', JSON.stringify(found));
      }
    } catch (e) { /* storage blocked */ }
  }
  function utm() {
    try { return JSON.parse(sessionStorage.getItem('kfs_utm') || '{}'); } catch (e) { return {}; }
  }
  captureUtm();

  /* ---------------------------------------------------------------- events */
  function event(name, params) {
    var payload = params || {};
    gtag('event', name, payload);
    if (w.clarity) w.clarity('event', name);
    if (CFG.debugEvents) console.debug('[KFS event]', name, payload);
  }

  var Track = {
    event: event,
    utm: utm,

    step: function (n, goal) {
      if (n === 2) event('apply_step_2', { goal: goal || '' });
      if (n === 3) event('apply_step_3', { goal: goal || '' });
      Track._step = n;
      Track._goal = goal;
    },

    submitted: function (payload) {
      Track._submitted = true;
      event('apply_submitted', {
        goal: payload.goal,
        value: payload.details && (payload.details.budget || payload.details.amount || payload.details.balance || 0),
        currency: 'NZD'
      });
    },

    calculator: function (type) { event('calculator_used', { type: type }); }
  };
  w.KFSTrack = Track;

  /* ---------------------------------------------------------------- auto events */
  d.addEventListener('kfs:ready', function () {
    var page = d.documentElement.getAttribute('data-page') || '';

    if (page === 'services') {
      var slug = location.pathname.split('/').pop().replace('.html', '');
      if (slug && slug !== 'index') event('service_page_viewed', { service: slug.replace(/-/g, '_') });
    }

    // Apply CTA clicks anywhere on the site
    d.addEventListener('click', function (e) {
      var a = e.target.closest('a[href*="apply.html"], [data-track]');
      if (!a) return;
      var name = a.getAttribute('data-track') || 'apply_started';
      event(name, { from: a.getAttribute('data-track-from') || page || 'unknown' });
    });

    // Phone taps
    d.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="tel:"]');
      if (a) event('phone_clicked', { from: page });
    });

    // Rates section reaching the viewport
    var rates = d.getElementById('rates') || d.getElementById('ratesTable');
    if (rates && 'IntersectionObserver' in w) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          event('rates_viewed', { from: page });
          io.disconnect();
        });
      }, { threshold: 0.3 });
      io.observe(rates);
    }

    // Calculator interaction, fired once per calculator per page
    var fired = {};
    d.addEventListener('input', function (e) {
      var box = e.target.closest('[data-calc]');
      if (!box) return;
      var type = box.getAttribute('data-calc');
      if (fired[type]) return;
      fired[type] = true;
      Track.calculator(type);
    });

    // Abandonment: the form was started but never submitted
    if (page === 'apply') {
      w.addEventListener('pagehide', function () {
        if (Track._submitted || !Track._step) return;
        event('apply_abandoned', { step: Track._step, goal: Track._goal || '' });
      });
    }
  });
})(window, document);

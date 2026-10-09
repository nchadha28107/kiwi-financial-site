/* ==========================================================================
   Kiwi Financial Solutions - shared layout + interactions
   ========================================================================== */
(function () {
  'use strict';

  var R = document.documentElement.getAttribute('data-root') || '';
  var PAGE = document.documentElement.getAttribute('data-page') || '';
  var PHONE = '027 303 0000';
  var TEL = 'tel:+64273030000';
  var EMAIL = 'info@kiwifinancial.co.nz';

  /* ---------------------------------------------------------------- icons */
  var I = {
    phone: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mail: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    pin: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    chev: '<svg class="chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    spark: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/></svg>',
    calc: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v4"/></svg>',
    home: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
    refresh: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"/></svg>',
    build: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V8l7-5 7 5v13"/><path d="M10 21v-6h4v6"/></svg>',
    truck: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16V6a1 1 0 0 1 1-1h11v11H3z"/><path d="M15 9h4l2 3v4h-6z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    brief: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    chart: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 15 4-5 3 3 5-7"/></svg>',
    table: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>',
    fb: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V5h-3c-2.2 0-4 1.8-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1z"/></svg>',
    li: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.76-1.95C21.3 8.75 22 11.1 22 14.2V21h-4v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V21h-4z"/></svg>',
    ig: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>'
  };
  window.KFS_ICONS = I;

  /* ---------------------------------------------------------------- phone */
  // Accepts NZ mobiles (02x) and landlines (03/04/06/07/09), typed locally or
  // as +64/0064. Rejecting landlines loses commercial enquiries.
  var KFSPhone = {
    digits: function (v) {
      var d = String(v || '').replace(/\D/g, '');
      if (d.indexOf('0064') === 0) d = '0' + d.slice(4);
      else if (d.indexOf('64') === 0 && d.length > 9) d = '0' + d.slice(2);
      return d;
    },
    format: function (v) {
      var d = KFSPhone.digits(v).slice(0, 11);
      if (d.length > 6) return d.slice(0, 3) + ' ' + d.slice(3, 6) + ' ' + d.slice(6);
      if (d.length > 3) return d.slice(0, 3) + ' ' + d.slice(3);
      return d;
    },
    isValid: function (v) {
      var d = KFSPhone.digits(v);
      return /^02[0-9]\d{6,8}$/.test(d) || /^0[34679]\d{7}$/.test(d);
    },
    e164: function (v) {
      var d = KFSPhone.digits(v);
      return d ? '+64' + d.replace(/^0/, '') : '';
    }
  };
  window.KFSPhone = KFSPhone;

  /* ---------------------------------------------------------------- CRO furniture */
  function buildCro() {
    if (document.body.hasAttribute('data-no-cro')) return;
    var el = document.createElement('div');
    el.innerHTML =
      '<button class="fab" id="fabConsult" type="button">' + I.spark + '<span class="fab__label">Book Free Consultation</span></button>' +
      '<div class="mobile-bar">' +
        '<a class="btn btn--outline" href="' + TEL + '">' + I.phone + 'Call Now</a>' +
        '<a class="btn btn--cta" href="' + R + 'apply.html" data-track="apply_started" data-track-from="mobile-bar">Apply Free</a>' +
      '</div>' +
      '<div class="modal" id="leadModal" role="dialog" aria-modal="true" aria-labelledby="croModalTitle">' +
        '<div class="modal__card">' +
          '<button class="modal__close" id="leadClose" aria-label="Close">&times;</button>' +
          '<span class="eyebrow">' + I.spark + 'No obligation</span>' +
          '<h3 id="croModalTitle">Not sure where to start?</h3>' +
          '<p>Leave your name and number - an adviser will call you back within one business day. No credit check, no cost.</p>' +
          '<form id="croForm" novalidate>' +
            '<div class="field" style="margin-bottom:14px"><label for="croName">Your name</label>' +
              '<input class="txt" type="text" id="croName" name="name" autocomplete="name" required><p class="err">Please enter your name.</p></div>' +
            '<div class="field" style="margin-bottom:18px"><label for="croPhone">Phone number</label>' +
              '<input type="tel" id="croPhone" name="phone" autocomplete="tel" required><p class="err">Please enter a valid NZ phone number.</p></div>' +
            '<button class="btn btn--cta btn--block" type="submit">Request my call back</button>' +
            '<p class="trust-row" style="margin-top:16px;justify-content:center">' +
              '<span>' + I.check + 'Free service</span><span>' + I.check + '100% independent</span></p>' +
          '</form>' +
          '<div id="croDone" hidden style="text-align:center">' +
            '<div class="success__ring">' + I.check + '</div>' +
            '<h3>Thanks - we\u2019ll be in touch.</h3><p>One of our advisers will call you within one business day.</p></div>' +
        '</div>' +
      '</div>';
    while (el.firstChild) document.body.appendChild(el.firstChild);
  }

  /* ---------------------------------------------------------------- behaviour */
  function initHeaderBehaviour() {
    var header = document.getElementById('siteHeader');
    var nav = document.getElementById('mobileNav');
    var scrim = document.getElementById('navScrim');
    var burger = document.getElementById('hamburger');
    var close = document.getElementById('navClose');

    if (header) {
      var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 80); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    function setNav(open) {
      if (!nav) return;
      nav.classList.toggle('open', open);
      scrim.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) { var f = nav.querySelector('a, button'); if (f) f.focus(); }
    }
    if (burger) burger.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
    if (close) close.addEventListener('click', function () { setNav(false); burger.focus(); });
    if (scrim) scrim.addEventListener('click', function () { setNav(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      setNav(false);
      closeModal();
    });

    [].forEach.call(document.querySelectorAll('.m-toggle'), function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        btn.nextElementSibling.classList.toggle('open', !open);
      });
    });
  }

  /* reveal on scroll */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      [].forEach.call(items, function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var d = parseInt(en.target.getAttribute('data-reveal'), 10) || 0;
        setTimeout(function () { en.target.classList.add('in'); }, d);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    [].forEach.call(items, function (n) { io.observe(n); });
  }

  /* animated counters */
  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dur = 1600, t0 = null;
      var step = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-NZ');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { [].forEach.call(els, run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    [].forEach.call(els, function (n) { io.observe(n); });
  }

  /* accordions */
  function initAccordions() {
    [].forEach.call(document.querySelectorAll('.acc-btn'), function (btn) {
      // The button is wrapped in a heading, so resolve the panel via aria-controls.
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.style.maxHeight = open ? '0px' : panel.scrollHeight + 'px';
      });
    });
  }

  /* testimonial carousel (mobile) */
  function initCarousel() {
    var wrap = document.querySelector('[data-carousel]');
    if (!wrap) return;
    var cards = wrap.querySelectorAll('.tcard');
    var dots = document.querySelector('[data-carousel-dots]');
    if (!dots) return;
    var i = 0;
    cards.forEach(function (c, n) {
      c.classList.toggle('show', n === 0);
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Testimonial ' + (n + 1));
      b.setAttribute('aria-selected', String(n === 0));
      b.addEventListener('click', function () { go(n); });
      dots.appendChild(b);
    });
    function go(n) {
      i = n;
      cards.forEach(function (c, k) { c.classList.toggle('show', k === n); });
      [].forEach.call(dots.children, function (d, k) { d.setAttribute('aria-selected', String(k === n)); });
    }
    setInterval(function () { if (window.innerWidth <= 900) go((i + 1) % cards.length); }, 6000);
  }

  /* lead modal: 60s dwell or exit intent, once per session */
  var modal;
  function openModal() {
    if (!modal || modal.classList.contains('open')) return;
    if (sessionStorage.getItem('kfs_lead_seen')) return;
    sessionStorage.setItem('kfs_lead_seen', '1');
    modal.classList.add('open');
    var f = document.getElementById('croName');
    if (f) setTimeout(function () { f.focus(); }, 320);
  }
  function closeModal() { if (modal) modal.classList.remove('open'); }

  function initModal() {
    modal = document.getElementById('leadModal');
    if (!modal) return;
    var closeBtn = document.getElementById('leadClose');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

    var fab = document.getElementById('fabConsult');
    if (fab) fab.addEventListener('click', function () {
      sessionStorage.removeItem('kfs_lead_seen');
      openModal();
    });

    if (!sessionStorage.getItem('kfs_lead_seen')) {
      setTimeout(openModal, 60000);
      document.addEventListener('mouseout', function onOut(e) {
        if (e.clientY <= 0 && !e.relatedTarget) { openModal(); document.removeEventListener('mouseout', onOut); }
      });
    }

    var form = document.getElementById('croForm');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      ['croName', 'croPhone'].forEach(function (id) {
        var input = document.getElementById(id);
        var field = input.closest('.field');
        var valid = id === 'croPhone'
          ? window.KFSPhone.isValid(input.value)
          : input.value.trim().length > 1;
        field.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      });
      if (!ok) return;
      form.hidden = true;
      document.getElementById('croDone').hidden = false;
    });
  }

  /* inline tick icons for trust rows */
  function initTicks() {
    [].forEach.call(document.querySelectorAll('[data-tick]'), function (el) {
      if (el.querySelector('svg')) return;
      el.insertAdjacentHTML('afterbegin', I.check);
    });
  }

  /* touch/drag panning for the lender marquee, pausing the auto-scroll */
  function initMarquee() {
    var el = document.getElementById('lenderMarquee');
    if (!el) return;
    var down = false, startX = 0, startLeft = 0;
    el.addEventListener('pointerdown', function (e) {
      down = true; startX = e.clientX; startLeft = el.scrollLeft;
      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (!down) return;
      el.scrollLeft = startLeft - (e.clientX - startX);
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      el.addEventListener(ev, function () { down = false; el.classList.remove('is-dragging'); });
    });
  }

  /* smooth in-page anchors */
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  }

  /* ---------------------------------------------------------------- boot */
  // Header, footer and content grids are baked in by tools-build/prerender.js,
  // so this only attaches behaviour to markup that already exists.
  function boot() {
    buildCro();
    initHeaderBehaviour();
    initReveal();
    initCounters();
    initAccordions();
    initCarousel();
    initModal();
    initTicks();
    initMarquee();
    initAnchors();
    document.dispatchEvent(new CustomEvent('kfs:ready'));
  }

  // Deferred scripts run at readyState 'interactive'; waiting for DOMContentLoaded
  // guarantees every module has registered its kfs:ready listener first.
  if (document.readyState === 'complete') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();

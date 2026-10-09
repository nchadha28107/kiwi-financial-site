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

  /* ---------------------------------------------------------------- data */
  var SERVICES = [
    { slug: 'home-loans', name: 'Home Loans', icon: 'home', blurb: 'First home or next home - structured to save you interest.' },
    { slug: 'refinance', name: 'Refinance & Refix', icon: 'refresh', blurb: 'Rolling off a fixed rate? We re-shop your whole mortgage.' },
    { slug: 'construction-loans', name: 'Construction & Development', icon: 'build', blurb: 'Progressive drawdown lending for new builds and projects.' },
    { slug: 'asset-finance', name: 'Asset Finance', icon: 'truck', blurb: 'Vehicles, plant and equipment funded fast.' },
    { slug: 'commercial-loans', name: 'Commercial & Business', icon: 'brief', blurb: 'Working capital, premises and business acquisition lending.' },
    { slug: 'investment-property', name: 'Investment Property', icon: 'chart', blurb: 'Build your portfolio with the right lender and structure.' }
  ];
  var TOOLS = [
    { slug: 'repayment-calculator', name: 'Repayment Calculator', icon: 'calc', blurb: 'See your weekly, fortnightly or monthly repayments.' },
    { slug: 'refinance-calculator', name: 'Refinance Savings', icon: 'refresh', blurb: 'Find out what switching lenders could save you.' },
    { slug: 'amortisation-calculator', name: 'Amortisation Schedule', icon: 'table', blurb: 'Year-by-year breakdown of your loan balance.' }
  ];
  window.KFS_SERVICES = SERVICES;
  window.KFS_TOOLS = TOOLS;

  var LENDERS = ['ANZ', 'ASB', 'BNZ', 'Westpac', 'Kiwibank', 'SBS Bank', 'TSB', 'ICBC', 'Bank of China', 'Heartland', 'Co-operative Bank', 'Resimac'];
  window.KFS_LENDERS = LENDERS;

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

  var TEAM = [
    {
      slug: 'pankaj', name: 'Pankaj Chhabra', initials: 'PC',
      role: 'Director & Principal Adviser',
      short: 'Close to 10 years in lending \u2014 including one of the big four banks \u2014 now giving genuinely independent advice.',
      bio: 'After spending close to 10 years in the lending industry gaining experience in consumer and commercial loans, ' +
        'along with working for one of the big four banks, Pankaj decided to go out on his own to provide independent ' +
        'financial advice to clients. His passion for property and construction/development, combined with deep knowledge ' +
        'of the lending industry, is what makes him stand out \u2014 he can provide insights and find solutions for complex ' +
        'cases to get the best result for his clients. He believes that \u201CEveryone deserves a home\u201D and genuinely ' +
        'loves helping his clients, as his client reviews make clear.',
      tags: ['Residential lending', 'Construction & development', 'Commercial', 'Complex cases']
    },
    {
      slug: 'rishabh', name: 'Rishabh Rastogi', initials: 'RR',
      role: 'Client Relationship Manager',
      short: 'Over 11 years in sales and customer service, focused on making the lending journey feel effortless.',
      bio: 'With over 11 years of experience in sales and customer service, Rishabh is skilled in identifying customer ' +
        'needs and building client relationships to ease their overall journey. Coming from a payments background, he ' +
        'understands the importance of a hand-holding process to support clients and achieve the desired result. He ' +
        'believes sales and service go hand in hand and that communication is the key \u2014 but customer satisfaction ' +
        'is paramount.',
      tags: ['Client care', 'Applications', 'Settlement support']
    }
  ];
  window.KFS_TEAM = TEAM;

  /* ---------------------------------------------------------------- header */
  function logo(width) {
    return '<a class="logo-link" href="' + R + 'index.html" aria-label="Kiwi Financial Solutions - home">' +
      '<img src="' + R + 'assets/images/logo.png"' +
      ' srcset="' + R + 'assets/images/logo.png 1x, ' + R + 'assets/images/logo@2x.png 2x, ' + R + 'assets/images/logo@3x.png 3x"' +
      ' width="200" height="104" style="width:' + width + 'px"' +
      ' alt="Kiwi Financial Solutions - Auckland Mortgage Advisers"></a>';
  }

  function dropdownItems(list, base) {
    return list.map(function (s) {
      return '<a href="' + R + base + '/' + s.slug + '.html"><span class="ico">' + I[s.icon] + '</span>' +
        '<span><strong>' + s.name + '</strong><span>' + s.blurb + '</span></span></a>';
    }).join('');
  }

  function buildHeader() {
    var host = document.querySelector('[data-component="header"]');
    if (!host) return;
    var cur = function (p) { return PAGE === p ? ' aria-current="page"' : ''; };
    var act = function (p) { return PAGE === p ? ' is-active' : ''; };

    host.outerHTML =
      '<header class="site-header" id="siteHeader">' +
        '<div class="topbar"><div class="wrap topbar__inner">' +
          '<div class="topbar__links">' +
            '<a href="' + TEL + '">' + I.phone + PHONE + '</a>' +
            '<a href="mailto:' + EMAIL + '">' + I.mail + EMAIL + '</a>' +
            '<span style="display:inline-flex;gap:7px;align-items:center;color:#857fa8">' + I.pin + 'Auckland, New Zealand</span>' +
          '</div>' +
          '<a class="topbar__pill" href="' + R + 'contact.html">' + I.spark + 'Book a free consultation</a>' +
        '</div></div>' +

        '<nav class="navbar" aria-label="Main"><div class="wrap navbar__inner">' +
          logo(160) +
          '<ul class="navbar__menu">' +
            '<li class="nav-item"><a class="nav-link" href="' + R + 'index.html"' + cur('home') + '>Home</a></li>' +
            '<li class="nav-item"><a class="nav-link" href="' + R + 'services/index.html"' + cur('services') + '>Services' + I.chev + '</a>' +
              '<div class="dropdown">' + dropdownItems(SERVICES, 'services') + '</div></li>' +
            '<li class="nav-item"><a class="nav-link" href="' + R + 'tools/index.html"' + cur('tools') + '>Tools' + I.chev + '</a>' +
              '<div class="dropdown">' + dropdownItems(TOOLS, 'tools') +
                '<a href="' + R + 'tools/rates.html"><span class="ico">' + I.chart + '</span>' +
                '<span><strong>Today\u2019s rates</strong><span>Compare advertised rates across 11 NZ lenders.</span></span></a>' +
              '</div></li>' +
            '<li class="nav-item"><a class="nav-link" href="' + R + 'about.html"' + cur('about') + '>About</a></li>' +
            '<li class="nav-item"><a class="nav-link" href="' + R + 'contact.html"' + cur('contact') + '>Contact</a></li>' +
          '</ul>' +
          '<span class="nav-proof">' + I.check + '500+ Kiwis helped</span>' +
          '<a class="btn btn--cta btn--sm" href="' + R + 'apply.html">Apply Now' + I.arrow + '</a>' +
          '<button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav"><span></span><span></span><span></span></button>' +
        '</div></nav>' +
      '</header>' +

      '<div class="nav-scrim" id="navScrim"></div>' +
      '<aside class="mobile-nav" id="mobileNav" aria-label="Mobile menu">' +
        '<div class="mobile-nav__top">' + logo(120) +
          '<button class="mobile-nav__close" id="navClose" aria-label="Close menu">&times;</button></div>' +
        '<div class="m-group' + act('home') + '"><a href="' + R + 'index.html"' + cur('home') + '>Home</a></div>' +
        '<div class="m-group' + act('services') + '"><button class="m-toggle" aria-expanded="false">Services' + I.chev + '</button>' +
          '<div class="m-sub">' + SERVICES.map(function (s) { return '<a href="' + R + 'services/' + s.slug + '.html">' + s.name + '</a>'; }).join('') +
          '<a href="' + R + 'services/index.html">All services</a></div></div>' +
        '<div class="m-group' + act('tools') + '"><button class="m-toggle" aria-expanded="false">Tools' + I.chev + '</button>' +
          '<div class="m-sub">' + TOOLS.map(function (s) { return '<a href="' + R + 'tools/' + s.slug + '.html">' + s.name + '</a>'; }).join('') +
          '<a href="' + R + 'tools/rates.html">Today\u2019s rates</a></div></div>' +
        '<div class="m-group' + act('about') + '"><a href="' + R + 'about.html"' + cur('about') + '>About</a></div>' +
        '<div class="m-group' + act('contact') + '"><a href="' + R + 'contact.html"' + cur('contact') + '>Contact</a></div>' +
        '<a class="btn btn--cta btn--block" href="' + R + 'apply.html" data-track="apply_started" data-track-from="mobile-nav">Apply Now' + I.arrow + '</a>' +
        '<a class="btn btn--outline btn--block" href="' + TEL + '" style="margin-top:12px">' + I.phone + 'Call ' + PHONE + '</a>' +
      '</aside>';
  }

  /* ---------------------------------------------------------------- footer */
  function buildFooter() {
    var host = document.querySelector('[data-component="footer"]');
    if (!host) return;
    var year = new Date().getFullYear();

    host.outerHTML =
      '<footer class="site-footer footer">' +
        '<div class="wrap">' +
          '<div class="footer__grid">' +
            '<div class="footer__brand">' + logo(160) +
              '<p>Independent mortgage advisers in Auckland. We compare 15+ lenders so you get the right loan - not just the one your bank sells.</p>' +
              '<div class="socials">' +
                '<a href="https://www.facebook.com/" aria-label="Facebook" rel="noopener noreferrer" target="_blank">' + I.fb + '</a>' +
                '<a href="https://www.linkedin.com/" aria-label="LinkedIn" rel="noopener noreferrer" target="_blank">' + I.li + '</a>' +
                '<a href="https://www.instagram.com/" aria-label="Instagram" rel="noopener noreferrer" target="_blank">' + I.ig + '</a>' +
              '</div>' +
            '</div>' +
            '<div><h5>Services</h5>' + SERVICES.map(function (s) { return '<a href="' + R + 'services/' + s.slug + '.html">' + s.name + '</a>'; }).join('') + '</div>' +
            '<div><h5>Tools</h5>' + TOOLS.map(function (s) { return '<a href="' + R + 'tools/' + s.slug + '.html">' + s.name + '</a>'; }).join('') +
              '<a href="' + R + 'tools/rates.html">Today\u2019s Rates</a>' +
              '<a href="' + R + 'apply.html">Apply Online</a></div>' +
            '<div><h5>Get in touch</h5><ul class="footer__contact">' +
              '<li>' + I.phone + '<a href="' + TEL + '" style="padding:0">' + PHONE + '</a></li>' +
              '<li>' + I.mail + '<a href="mailto:' + EMAIL + '" style="padding:0">' + EMAIL + '</a></li>' +
              '<li>' + I.pin + '<span>Auckland, New Zealand</span></li>' +
              '<li>' + I.clock + '<span>Mon-Fri 8:30am-6pm<br>Sat by appointment</span></li>' +
            '</ul></div>' +
          '</div>' +

          '<div class="footer__lenders"><strong>Lenders we compare</strong><span>' + LENDERS.join(' &middot; ') + '</span></div>' +

          '<div class="footer__legal">' +
            '<div class="links">' +
              '<a href="' + R + 'legal/disclaimer.html">Website Disclaimer</a>' +
              '<a href="' + R + 'legal/privacy.html">Privacy Policy</a>' +
              '<a href="' + R + 'legal/important-information.html">Important Information</a>' +
              '<a href="' + R + 'legal/disclosure.html">Disclosure Statement</a>' +
            '</div>' +
            '<p>Kiwi Financial Solutions is a registered Financial Advice Provider under the Financial Markets Conduct Act 2013. ' +
            'A copy of our disclosure statement is available free of charge on request. Information on this website is general in nature ' +
            'and does not take your personal circumstances into account. It is not personalised financial advice. ' +
            'All lending is subject to lender criteria, responsible lending obligations under the CCCFA, and approval. ' +
            'Calculator results are estimates only and do not constitute financial advice.</p>' +
            '<div class="footer__bottom"><span>&copy; ' + year + ' Kiwi Financial Solutions. All rights reserved.</span>' +
            '<span>Let\u2019s grow together.</span></div>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  /* ---------------------------------------------------------------- team */
  function buildTeam() {
    [].forEach.call(document.querySelectorAll('[data-team]'), function (host) {
      var full = host.getAttribute('data-team') === 'full';
      var px = full ? 200 : 140;

      host.innerHTML = TEAM.map(function (p, i) {
        // 2x source constrained by CSS keeps the crop sharp on retina displays
        var photo = '<img class="team-card__photo" src="' + R + 'assets/images/team/' + p.slug + '-280.jpg"' +
          ' srcset="' + R + 'assets/images/team/' + p.slug + '-280.jpg 1x, ' + R + 'assets/images/team/' + p.slug + '-400.jpg 2x"' +
          ' width="' + px + '" height="' + px + '" style="width:' + px + 'px;height:' + px + 'px"' +
          ' loading="lazy" decoding="async" alt="' + p.name + ' \u2014 ' + p.role + ' at Kiwi Financial Solutions"' +
          ' onerror="this.classList.add(\'is-missing\')">';

        return '<article class="team-card' + (full ? ' team-card--full' : '') + '" data-reveal="' + i * 110 + '">' +
          '<span class="team-card__ring" style="width:' + (px + 8) + 'px;height:' + (px + 8) + 'px">' + photo +
          '<span class="team-card__fallback" aria-hidden="true">' + p.initials + '</span></span>' +
          '<h3 class="team-card__name">' + p.name + '</h3>' +
          '<p class="team-card__role">' + p.role + '</p>' +
          '<p class="team-card__bio">' + (full ? p.bio : p.short) + '</p>' +
          '<ul class="team-card__tags">' + p.tags.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
          '</article>';
      }).join('');
    });
  }

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
  function boot() {
    buildHeader();
    buildFooter();
    buildTeam();
    buildCro();
    initHeaderBehaviour();
    initReveal();
    initCounters();
    initAccordions();
    initCarousel();
    initModal();
    initTicks();
    initAnchors();
    document.dispatchEvent(new CustomEvent('kfs:ready'));
  }

  // Deferred scripts run at readyState 'interactive'; waiting for DOMContentLoaded
  // guarantees every module has registered its kfs:ready listener first.
  if (document.readyState === 'complete') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();

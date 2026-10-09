/**
 * Single source of truth for markup that must exist in the HTML before any
 * JavaScript runs - header, footer, and the content grids.
 *
 * Previously these were built client-side, which left crawlers looking at
 * pages with zero navigation links. prerender.js bakes this into every page;
 * site.js only attaches behaviour to it.
 */
const fs = require('fs');
const path = require('path');

const PHONE = '027 303 0000';
const TEL = 'tel:+64273030000';
const EMAIL = 'info@kiwifinancial.co.nz';
const ORIGIN = 'https://kiwifinancial.co.nz';

const I = {
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

const SERVICES = [
  { slug: 'home-loans', name: 'Home Loans', icon: 'home', blurb: 'First home or next home - structured to save you interest.' },
  { slug: 'refinance', name: 'Refinance & Refix', icon: 'refresh', blurb: 'Rolling off a fixed rate? We re-shop your whole mortgage.' },
  { slug: 'construction-loans', name: 'Construction & Development', icon: 'build', blurb: 'Progressive drawdown lending for new builds and projects.' },
  { slug: 'asset-finance', name: 'Asset Finance', icon: 'truck', blurb: 'Vehicles, plant and equipment funded fast.' },
  { slug: 'commercial-loans', name: 'Commercial & Business', icon: 'brief', blurb: 'Working capital, premises and business acquisition lending.' },
  { slug: 'investment-property', name: 'Investment Property', icon: 'chart', blurb: 'Build your portfolio with the right lender and structure.' }
];

const TOOLS = [
  { slug: 'repayment-calculator', name: 'Repayment Calculator', icon: 'calc', blurb: 'See your weekly, fortnightly or monthly repayments.' },
  { slug: 'refinance-calculator', name: 'Refinance Savings', icon: 'refresh', blurb: 'Find out what switching lenders could save you.' },
  { slug: 'amortisation-calculator', name: 'Amortisation Schedule', icon: 'table', blurb: 'Year-by-year breakdown of your loan balance.' }
];

const TOOL_BLURB_LONG = {
  'repayment-calculator': 'Weekly, fortnightly or monthly repayments, LVR, total interest and a full amortisation table.',
  'refinance-calculator': 'Compare your current rate to today\u2019s best, including break fees and break-even point.',
  'amortisation-calculator': 'Year-by-year principal, interest and closing balance, plus a balance decline chart.'
};

const TEAM = [
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

const WHY_POINTS = [
  ['We are not owned by a bank', 'No lending targets, no in-house product to push. We recommend what fits you.'],
  ['One application, every lender', 'We do the shopping around so your credit file is not hit repeatedly.'],
  ['Jargon-free, in plain English', 'You will always understand what you are signing and why.'],
  ['You pay us nothing', 'We are paid by the lender you choose, and we disclose exactly how.']
];

const INDEPENDENCE_POINTS = [
  ['A decline is not the end', 'Every lender scores income, debt and credit differently. We go to the next one.'],
  ['Your credit file is protected', 'One adviser, one set of enquiries - not five banks hitting your file.'],
  ['Niche lenders included', 'Non-bank and specialist funders handle what the big five will not touch.'],
  ['Commission fully disclosed', 'You see what we are paid, and it never changes your rate.']
];

function lenders() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'lenders.json'), 'utf8'));
}

/* ------------------------------------------------------------------ parts */
function logo(R, width) {
  return `<a class="logo-link" href="${R}index.html" aria-label="Kiwi Financial Solutions - home">` +
    `<img src="${R}assets/images/logo.png"` +
    ` srcset="${R}assets/images/logo.png 1x, ${R}assets/images/logo@2x.png 2x, ${R}assets/images/logo@3x.png 3x"` +
    ` width="200" height="104" style="width:${width}px"` +
    ' alt="Kiwi Financial Solutions - Auckland Mortgage Advisers"></a>';
}

function dropdown(R, list, base) {
  return list.map((s) =>
    `<a href="${R}${base}/${s.slug}.html"><span class="ico">${I[s.icon]}</span>` +
    `<span><strong>${s.name}</strong><span>${s.blurb}</span></span></a>`).join('');
}

function header(R, page) {
  const cur = (p) => (page === p ? ' aria-current="page"' : '');
  const act = (p) => (page === p ? ' is-active' : '');

  return '<header class="site-header" id="siteHeader">' +
      '<div class="topbar"><div class="wrap topbar__inner">' +
        '<div class="topbar__links">' +
          `<a href="${TEL}">${I.phone}${PHONE}</a>` +
          `<a href="mailto:${EMAIL}">${I.mail}${EMAIL}</a>` +
          `<span style="display:inline-flex;gap:7px;align-items:center;color:#857fa8">${I.pin}Auckland, New Zealand</span>` +
        '</div>' +
        `<a class="topbar__pill" href="${R}contact.html">${I.spark}Book a free consultation</a>` +
      '</div></div>' +

      '<nav class="navbar" aria-label="Main"><div class="wrap navbar__inner">' +
        logo(R, 160) +
        '<ul class="navbar__menu">' +
          `<li class="nav-item"><a class="nav-link" href="${R}index.html"${cur('home')}>Home</a></li>` +
          `<li class="nav-item"><a class="nav-link" href="${R}services/index.html"${cur('services')}>Services${I.chev}</a>` +
            `<div class="dropdown">${dropdown(R, SERVICES, 'services')}</div></li>` +
          `<li class="nav-item"><a class="nav-link" href="${R}tools/index.html"${cur('tools')}>Tools${I.chev}</a>` +
            `<div class="dropdown">${dropdown(R, TOOLS, 'tools')}` +
            `<a href="${R}tools/rates.html"><span class="ico">${I.chart}</span>` +
            '<span><strong>Today\u2019s Rates</strong><span>Compare advertised rates across 11 NZ lenders.</span></span></a>' +
            '</div></li>' +
          `<li class="nav-item"><a class="nav-link" href="${R}about.html"${cur('about')}>About</a></li>` +
          `<li class="nav-item"><a class="nav-link" href="${R}contact.html"${cur('contact')}>Contact</a></li>` +
        '</ul>' +
        `<span class="nav-proof">${I.check}500+ Kiwis helped</span>` +
        `<a class="btn btn--cta btn--sm" href="${R}apply.html">Apply Now${I.arrow}</a>` +
        '<button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav"><span></span><span></span><span></span></button>' +
      '</div></nav>' +
    '</header>' +

    '<div class="nav-scrim" id="navScrim"></div>' +
    '<aside class="mobile-nav" id="mobileNav" aria-label="Mobile menu">' +
      `<div class="mobile-nav__top">${logo(R, 120)}` +
        '<button class="mobile-nav__close" id="navClose" aria-label="Close menu">&times;</button></div>' +
      `<div class="m-group${act('home')}"><a href="${R}index.html"${cur('home')}>Home</a></div>` +
      `<div class="m-group${act('services')}"><button class="m-toggle" aria-expanded="false">Services${I.chev}</button>` +
        `<div class="m-sub">${SERVICES.map((s) => `<a href="${R}services/${s.slug}.html">${s.name}</a>`).join('')}` +
        `<a href="${R}services/index.html">All services</a></div></div>` +
      `<div class="m-group${act('tools')}"><button class="m-toggle" aria-expanded="false">Tools${I.chev}</button>` +
        `<div class="m-sub">${TOOLS.map((s) => `<a href="${R}tools/${s.slug}.html">${s.name}</a>`).join('')}` +
        `<a href="${R}tools/rates.html">Today\u2019s rates</a></div></div>` +
      `<div class="m-group${act('about')}"><a href="${R}about.html"${cur('about')}>About</a></div>` +
      `<div class="m-group${act('contact')}"><a href="${R}contact.html"${cur('contact')}>Contact</a></div>` +
      `<a class="btn btn--cta btn--block" href="${R}apply.html" data-track="apply_started" data-track-from="mobile-nav">Apply Now${I.arrow}</a>` +
      `<a class="btn btn--outline btn--block" href="${TEL}" style="margin-top:12px">${I.phone}Call ${PHONE}</a>` +
    '</aside>';
}

function footer(R) {
  const year = new Date().getFullYear();
  const lenderNames = lenders().map((l) => l.name).join(' &middot; ');

  return '<footer class="site-footer footer">' +
      '<div class="wrap">' +
        '<div class="footer__grid">' +
          `<div class="footer__brand">${logo(R, 160)}` +
            '<p>Independent mortgage advisers in Auckland. We compare 15+ lenders so you get the right loan - not just the one your bank sells.</p>' +
            '<div class="socials">' +
              `<a href="https://www.facebook.com/" aria-label="Facebook" rel="noopener noreferrer" target="_blank">${I.fb}</a>` +
              `<a href="https://www.linkedin.com/" aria-label="LinkedIn" rel="noopener noreferrer" target="_blank">${I.li}</a>` +
              `<a href="https://www.instagram.com/" aria-label="Instagram" rel="noopener noreferrer" target="_blank">${I.ig}</a>` +
            '</div>' +
          '</div>' +
          `<div><h5>Services</h5>${SERVICES.map((s) => `<a href="${R}services/${s.slug}.html">${s.name}</a>`).join('')}</div>` +
          `<div><h5>Tools</h5>${TOOLS.map((s) => `<a href="${R}tools/${s.slug}.html">${s.name}</a>`).join('')}` +
            `<a href="${R}tools/rates.html">Today\u2019s Rates</a>` +
            `<a href="${R}apply.html">Apply Online</a></div>` +
          '<div><h5>Get in touch</h5><ul class="footer__contact">' +
            `<li>${I.phone}<a href="${TEL}" style="padding:0">${PHONE}</a></li>` +
            `<li>${I.mail}<a href="mailto:${EMAIL}" style="padding:0">${EMAIL}</a></li>` +
            `<li>${I.pin}<span>Auckland, New Zealand</span></li>` +
            `<li>${I.clock}<span>Mon-Fri 8:30am-6pm<br>Sat by appointment</span></li>` +
          '</ul></div>' +
        '</div>' +

        `<div class="footer__lenders"><strong>Lenders we compare</strong><span>${lenderNames}</span></div>` +

        '<div class="footer__legal">' +
          '<div class="links">' +
            `<a href="${R}legal/disclaimer.html">Website Disclaimer</a>` +
            `<a href="${R}legal/privacy.html">Privacy Policy</a>` +
            `<a href="${R}legal/important-information.html">Important Information</a>` +
            `<a href="${R}legal/disclosure.html">Disclosure Statement</a>` +
          '</div>' +
          '<p>Kiwi Financial Solutions is a registered Financial Advice Provider under the Financial Markets Conduct Act 2013. ' +
          'A copy of our disclosure statement is available free of charge on request. Information on this website is general in nature ' +
          'and does not take your personal circumstances into account. It is not personalised financial advice. ' +
          'All lending is subject to lender criteria, responsible lending obligations under the CCCFA, and approval. ' +
          'Calculator results are estimates only and do not constitute financial advice.</p>' +
          `<div class="footer__bottom"><span>&copy; ${year} Kiwi Financial Solutions. All rights reserved.</span>` +
          '<span>Let\u2019s grow together.</span></div>' +
        '</div>' +
      '</div>' +
    '</footer>';
}

/* ------------------------------------------------------------------ grids */
function servicesGrid(R, style) {
  return SERVICES.map((s, i) => {
    const cta = style === 'button'
      ? `<a class="btn btn--outline btn--sm" href="${R}services/${s.slug}.html">Learn more${I.arrow}</a>`
      : `<a class="link-arrow" href="${R}services/${s.slug}.html">Learn more${I.arrow}</a>`;
    return `<article class="card" data-reveal="${(i % 3) * 90}">` +
      `<div class="card__icon">${I[s.icon]}</div>` +
      `<h3>${s.name}</h3><p>${s.blurb}</p>${cta}</article>`;
  }).join('');
}

function toolsGrid(R) {
  return TOOLS.map((t, i) =>
    `<article class="card" data-reveal="${i * 90}">` +
    `<div class="card__icon">${I[t.icon]}</div>` +
    `<h3>${t.name}</h3><p>${TOOL_BLURB_LONG[t.slug]}</p>` +
    `<a class="btn btn--outline btn--sm" href="${R}tools/${t.slug}.html">Open calculator${I.arrow}</a></article>`).join('');
}

function teamGrid(R, variant) {
  const full = variant === 'full';
  const px = full ? 200 : 140;
  return TEAM.map((p, i) => {
    const photo = `<img class="team-card__photo" src="${R}assets/images/team/${p.slug}-280.jpg"` +
      ` srcset="${R}assets/images/team/${p.slug}-280.jpg 1x, ${R}assets/images/team/${p.slug}-400.jpg 2x"` +
      ` width="${px}" height="${px}" style="width:${px}px;height:${px}px"` +
      ` loading="lazy" decoding="async" alt="${p.name} \u2014 ${p.role} at Kiwi Financial Solutions">`;
    return `<article class="team-card${full ? ' team-card--full' : ''}" data-reveal="${i * 110}">` +
      `<span class="team-card__ring" style="width:${px + 8}px;height:${px + 8}px">${photo}` +
      `<span class="team-card__fallback" aria-hidden="true">${p.initials}</span></span>` +
      `<h3 class="team-card__name">${p.name}</h3>` +
      `<p class="team-card__role">${p.role}</p>` +
      `<p class="team-card__bio">${full ? p.bio : p.short}</p>` +
      `<ul class="team-card__tags">${p.tags.map((t) => `<li>${t}</li>`).join('')}</ul>` +
      '</article>';
  }).join('');
}

function tickList(points) {
  return points.map(([h, d]) =>
    `<li><span class="tick">${I.check}</span><span><b>${h}</b><span>${d}</span></span></li>`).join('');
}

function lenderMarquee(R) {
  const items = lenders().map((l) =>
    `<div class="lender"><img src="${R}${l.logo}" width="120" height="48" loading="lazy"` +
    `${l.invert ? ' class="is-inverted"' : ''} alt="${l.name} \u2014 NZ home loan rates"></div>`).join('');
  return items + items; // duplicated so the -50% marquee keyframe loops seamlessly
}

module.exports = {
  I, SERVICES, TOOLS, TEAM, WHY_POINTS, INDEPENDENCE_POINTS,
  PHONE, TEL, EMAIL, ORIGIN,
  lenders, logo, header, footer,
  servicesGrid, toolsGrid, teamGrid, tickList, lenderMarquee
};

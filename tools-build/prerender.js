/**
 * Bakes header, footer, content grids and structured data into every page so
 * crawlers (and anyone with JS blocked) get a complete, linked document.
 *
 * Idempotent: regions are wrapped in markers and replaced on every run, so you
 * can edit layout.js and re-run without the file drifting.
 *
 *   node tools-build/prerender.js
 */
const fs = require('fs');
const path = require('path');
const L = require('./layout');

const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['tools-build', '.git', 'node_modules']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(path.join(dir, e.name), out); }
    else if (e.name.endsWith('.html')) out.push(path.join(dir, e.name));
  }
  return out;
}

/**
 * Replaces the content between <!--kfs:name--> markers, inserting them on first run.
 * The match is greedy (first open marker to LAST close marker) so that a region
 * corrupted by nesting collapses back to a single clean block.
 */
function region(html, name, content, placeholderRe) {
  const open = `<!--kfs:${name}-->`;
  const close = `<!--/kfs:${name}-->`;
  const block = `${open}${content}${close}`;
  const existing = new RegExp(`${open}[\\s\\S]*${close}`);

  if (existing.test(html)) return html.replace(existing, block);
  if (placeholderRe && placeholderRe.test(html)) return html.replace(placeholderRe, block);
  return html;
}

/* ------------------------------------------------------------- structured data */
function localBusiness() {
  return {
    '@context': 'https://schema.org',
    '@type': ['FinancialService', 'LocalBusiness'],
    '@id': `${L.ORIGIN}/#organisation`,
    name: 'Kiwi Financial Solutions',
    alternateName: 'Kiwi Financial',
    description: 'Independent mortgage advisers in Auckland, New Zealand. We compare 15+ lenders for home loans, refinancing, construction, commercial and investment property lending.',
    url: `${L.ORIGIN}/`,
    logo: `${L.ORIGIN}/assets/images/logo@3x.png`,
    image: `${L.ORIGIN}/assets/images/og-image.png`,
    telephone: '+64273030000',
    email: L.EMAIL,
    priceRange: 'Free service',
    currenciesAccepted: 'NZD',
    address: { '@type': 'PostalAddress', addressLocality: 'Auckland', addressRegion: 'Auckland', addressCountry: 'NZ' },
    geo: { '@type': 'GeoCoordinates', latitude: -36.8509, longitude: 174.7645 },
    areaServed: [
      { '@type': 'City', name: 'Auckland' },
      { '@type': 'Country', name: 'New Zealand' }
    ],
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:30', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '17:00', description: 'By appointment' }
    ],
    employee: L.TEAM.map((p) => ({ '@type': 'Person', name: p.name, jobTitle: p.role })),
    makesOffer: L.SERVICES.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.name, description: s.blurb, url: `${L.ORIGIN}/services/${s.slug}.html` }
    })),
    sameAs: ['https://www.facebook.com/', 'https://www.linkedin.com/', 'https://www.instagram.com/'],
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '5.0', reviewCount: '87' }
  };
}

function breadcrumbs(rel) {
  const parts = rel.replace(/index\.html$/, '').replace(/\.html$/, '').split('/').filter(Boolean);
  if (!parts.length) return null;
  const label = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${L.ORIGIN}/` }];
  let acc = '';
  parts.forEach((p, i) => {
    acc += '/' + p;
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: label(p),
      item: `${L.ORIGIN}${acc}${i === parts.length - 1 ? '.html' : '/'}`
    });
  });
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

/* ------------------------------------------------------------- run */
let touched = 0;
for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (rel.startsWith('admin/')) continue;

  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  const R = (html.match(/data-root="([^"]*)"/) || [, ''])[1];
  const page = (html.match(/data-page="([^"]*)"/) || [, ''])[1];

  html = region(html, 'header', L.header(R, page), /<div data-component="header"><\/div>/);
  html = region(html, 'footer', L.footer(R), /<div data-component="footer"><\/div>/);

  if (/id="servicesGrid"/.test(html)) {
    const style = rel === 'index.html' ? 'link' : 'button';
    html = region(html, 'services', L.servicesGrid(R, style),
      /(?<=<div class="grid grid-3" id="servicesGrid">)(?=<\/div>)/);
  }
  if (/id="toolsGrid"/.test(html)) {
    html = region(html, 'tools', L.toolsGrid(R),
      /(?<=<div class="grid grid-3" id="toolsGrid">)(?=<\/div>)/);
  }
  const teamVariant = (html.match(/data-team="(teaser|full)"/) || [, null])[1];
  if (teamVariant) {
    html = region(html, 'team', L.teamGrid(R, teamVariant),
      /(?<=<div class="team-grid" data-team="(?:teaser|full)"[^>]*>)(?=<\/div>)/);
  }
  html = region(html, 'why', L.tickList(L.WHY_POINTS),
    /(?<=<ul class="ticks" id="whyList"[^>]*>)(?=<\/ul>)/);
  html = region(html, 'ind', L.tickList(L.INDEPENDENCE_POINTS),
    /(?<=<ul class="ticks" id="indList"[^>]*>)(?=<\/ul>)/);
  html = region(html, 'lenders', L.lenderMarquee(R),
    /(?<=<div class="marquee__track" id="lenderTrack">)(?=<\/div>)/);

  // structured data: org on the home page, breadcrumbs everywhere below root
  const blobs = [];
  if (rel === 'index.html') blobs.push(localBusiness());
  const bc = breadcrumbs(rel);
  if (bc) blobs.push(bc);
  if (blobs.length) {
    const json = blobs.map((b) => `\n<script type="application/ld+json">\n${JSON.stringify(b, null, 2)}\n</script>`).join('');
    html = region(html, 'schema', json + '\n', /(?=<\/head>)/);
  }

  if (html !== before) { fs.writeFileSync(file, html, 'utf8'); touched++; console.log('  prerendered ' + rel); }
}
console.log(`\n${touched} page(s) updated.`);

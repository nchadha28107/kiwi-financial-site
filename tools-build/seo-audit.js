/* SEO audit: inspects the raw HTML as a non-rendering crawler would see it. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['tools-build', '.git', 'node_modules', 'admin']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(path.join(dir, e.name), out); }
    else if (e.name.endsWith('.html')) out.push(path.join(dir, e.name));
  }
  return out;
}

const grab = (html, re) => (html.match(re) || [, null])[1];
const rows = [];
const titles = new Map();
const descs = new Map();

for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');

  const title = grab(html, /<title>([\s\S]*?)<\/title>/);
  const desc = grab(html, /<meta name="description" content="([^"]*)"/);
  const canonical = grab(html, /<link rel="canonical" href="([^"]*)"/);
  const robots = grab(html, /<meta name="robots" content="([^"]*)"/);

  // what a crawler sees before any JavaScript runs
  const noJs = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const bodyLinks = (html.match(/<a\s[^>]*href="(?!#|mailto:|tel:)/gi) || []).length;
  const imgs = (html.match(/<img\s/gi) || []).length;
  const imgsAlt = (html.match(/<img\s[^>]*\balt="/gi) || []).length;
  const jsonLd = (html.match(/application\/ld\+json/gi) || []).length;
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;

  rows.push({
    page: rel,
    titleLen: title ? title.length : 0,
    descLen: desc ? desc.length : 0,
    words: noJs.split(' ').filter(Boolean).length,
    links: bodyLinks,
    imgNoAlt: imgs - imgsAlt,
    jsonLd,
    h1,
    canonical: canonical ? 'yes' : 'MISSING',
    robots: robots || '-'
  });

  if (title) titles.set(title, (titles.get(title) || 0) + 1);
  if (desc) descs.set(desc, (descs.get(desc) || 0) + 1);
}

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('page', 42) + pad('title', 6) + pad('desc', 6) + pad('words', 7) +
  pad('links', 7) + pad('noAlt', 7) + pad('ld', 4) + pad('h1', 4) + pad('canon', 8) + 'robots');
console.log('-'.repeat(110));
rows.forEach((r) => console.log(
  pad(r.page, 42) + pad(r.titleLen, 6) + pad(r.descLen, 6) + pad(r.words, 7) +
  pad(r.links, 7) + pad(r.imgNoAlt, 7) + pad(r.jsonLd, 4) + pad(r.h1, 4) + pad(r.canonical, 8) + r.robots));

console.log('\n--- issues ---');
const bad = [];
rows.forEach((r) => {
  if (r.titleLen < 30 || r.titleLen > 60) bad.push(`${r.page}: title ${r.titleLen} chars (aim 30-60)`);
  if (r.descLen < 70 || r.descLen > 160) bad.push(`${r.page}: description ${r.descLen} chars (aim 70-160)`);
  if (r.h1 !== 1) bad.push(`${r.page}: ${r.h1} h1 tags`);
  if (r.imgNoAlt > 0) bad.push(`${r.page}: ${r.imgNoAlt} img without alt`);
  if (r.canonical === 'MISSING') bad.push(`${r.page}: no canonical`);
  if (r.words < 300 && r.robots.indexOf('noindex') === -1) bad.push(`${r.page}: only ${r.words} words visible without JS`);
});
[...titles].filter(([, n]) => n > 1).forEach(([t, n]) => bad.push(`duplicate title x${n}: ${t.slice(0, 50)}`));
[...descs].filter(([, n]) => n > 1).forEach(([d, n]) => bad.push(`duplicate description x${n}: ${d.slice(0, 50)}`));
console.log(bad.length ? bad.map((b) => '  ' + b).join('\n') : '  none');

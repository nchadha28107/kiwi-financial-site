/* QA sweep: resolves every local link/asset reference and checks logo + meta coverage. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['tools-build', '.git', 'node_modules']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(path.join(dir, e.name), out);
    } else if (e.name.endsWith('.html')) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

const files = walk(ROOT);
let errors = 0;
const warn = (f, msg) => { console.log('  [!] ' + path.relative(ROOT, f) + ': ' + msg); errors++; };

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');

  // local href / src references (inline scripts build URLs at runtime, so exclude them)
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const refs = [...markup.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]);
  for (const r of refs) {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(r)) continue;
    const target = path.join(dir, r.split('#')[0].split('?')[0]);
    if (!fs.existsSync(target)) warn(file, 'broken reference -> ' + r);
  }

  // every page must carry the logo; the internal dashboard uses its own chrome
  const isAdmin = rel.startsWith('admin/');
  if (!isAdmin && !html.includes('data-component="header"')) warn(file, 'missing shared header/logo');
  if (!isAdmin && !html.includes('data-component="footer"')) warn(file, 'missing shared footer');
  if (isAdmin && !html.includes('logo-link')) warn(file, 'missing logo');

  // no-JS logo fallback with correct alt text
  if (!html.includes('alt="Kiwi Financial Solutions - Auckland Mortgage Advisers"')) {
    warn(file, 'missing logo alt text fallback');
  }

  // meta coverage
  for (const tag of ['<title>', 'name="description"', 'property="og:image"', 'rel="icon"', 'rel="apple-touch-icon"']) {
    if (!html.includes(tag)) warn(file, 'missing ' + tag);
  }

  // script path depth must match data-root
  const root = (html.match(/data-root="([^"]*)"/) || [, null])[1];
  if (root === null) warn(file, 'missing data-root attribute');
  else {
    const expected = '../'.repeat(rel.split('/').length - 1);
    if (root !== expected) warn(file, `data-root "${root}" should be "${expected}"`);
  }
}

console.log(`\nChecked ${files.length} pages. ${errors ? errors + ' issue(s) found.' : 'No issues found.'}`);

/* ---------------------------------------------------- sitemap + robots */
const BASE = 'https://kiwifinancial.co.nz/';
const urls = files
  .map(f => path.relative(ROOT, f).replace(/\\/g, '/'))
  .filter(u => !/apply\.html$/.test(u) && !u.startsWith('admin/'))
  .map(u => u.replace(/(^|\/)index\.html$/, '$1'))
  .sort();

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${BASE}${u}</loc><changefreq>monthly</changefreq></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');

fs.writeFileSync(path.join(ROOT, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /apply.html\nDisallow: /admin/\n\nSitemap: ${BASE}sitemap.xml\n`, 'utf8');

fs.writeFileSync(path.join(ROOT, 'site.webmanifest'), JSON.stringify({
  name: 'Kiwi Financial Solutions',
  short_name: 'Kiwi Financial',
  description: "Auckland's independent mortgage advisers",
  start_url: './',
  display: 'standalone',
  background_color: '#0C0634',
  theme_color: '#0C0634',
  // relative so the site also works from a GitHub Pages subdirectory
  icons: [
    { src: 'assets/images/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: 'assets/images/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
  ]
}, null, 2), 'utf8');

console.log('Wrote sitemap.xml, robots.txt, site.webmanifest');
process.exit(errors ? 1 : 0);

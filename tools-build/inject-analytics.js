/* Injects the shared config + analytics tags into every page, ahead of site.js. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['tools-build', '.git', 'node_modules']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(path.join(dir, e.name), out); }
    else if (e.name.endsWith('.html')) out.push(path.join(dir, e.name));
  }
  return out;
}

let changed = 0;
for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  const root = (html.match(/data-root="([^"]*)"/) || [, ''])[1];

  if (html.includes('assets/js/config.js')) continue;

  const tags =
    `<script src="${root}assets/js/config.js"></script>\n` +
    `<script src="${root}assets/js/analytics.js" defer></script>\n`;

  // must run before site.js so kfs:ready listeners are registered in time
  const marker = `<script src="${root}assets/js/site.js" defer></script>`;
  if (!html.includes(marker)) { console.log('  ? no site.js tag in ' + path.relative(ROOT, file)); continue; }

  html = html.replace(marker, tags + marker);
  fs.writeFileSync(file, html, 'utf8');
  changed++;
  console.log('  patched ' + path.relative(ROOT, file).replace(/\\/g, '/'));
}
console.log(`\n${changed} page(s) updated.`);

/* Trims titles/descriptions that exceed SERP limits and removes the one
   render-blocking script. Idempotent. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Service page titles/descriptions are owned by gen-services.js - do not set them here.
const DESCS = {
  'about.html': 'Kiwi Financial Solutions is a 100% independent mortgage adviser in Auckland. No bank owns us, so we compare 15+ NZ lenders and recommend what fits.',
  'contact.html': 'Talk to an independent mortgage adviser in Auckland. Call 027 303 0000, email us, or send a message and we\u2019ll reply within one business day.',
  'tools/rates.html': 'Compare today\u2019s advertised home loan rates across 11 NZ lenders - floating, 6 month, 1, 2, 3 and 5 year fixed, with cash contributions.'
};

let n = 0;
function edit(rel, fn) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) { console.log(`  ! missing ${rel}`); return; }
  const src = fs.readFileSync(p, 'utf8');
  const out = fn(src);
  if (out !== src) { fs.writeFileSync(p, out, 'utf8'); n++; console.log(`  updated ${rel}`); }
}

for (const [rel, desc] of Object.entries(DESCS)) {
  edit(rel, (s) => s
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`));
}

// config.js only defines an object - no reason for it to block rendering.
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!['tools-build', '.git', 'node_modules'].includes(e.name)) walk(path.join(dir, e.name), out); }
    else if (e.name.endsWith('.html')) out.push(path.join(dir, e.name));
  }
  return out;
}
for (const f of walk(ROOT)) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  edit(rel, (s) => s.replace(/(<script src="[^"]*assets\/js\/config\.js")><\/script>/, '$1 defer></script>'));
}

console.log(`\n${n} file edit(s).`);

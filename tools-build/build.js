/**
 * Full site build. Order matters: generators write pages from scratch, so
 * pre-rendering and meta fixes have to run after them.
 *
 *   node tools-build/build.js
 */
const { execFileSync } = require('child_process');
const path = require('path');

const STEPS = [
  ['gen-services.js', 'generate service pages'],
  ['gen-legal.js', 'generate legal pages'],
  ['prerender.js', 'bake in header, footer, grids, schema'],
  ['fix-meta.js', 'trim meta, defer config.js'],
  ['qa.js', 'link + meta QA, sitemap, robots, manifest'],
  ['seo-audit.js', 'SEO report']
];

for (const [script, label] of STEPS) {
  console.log(`\n=== ${label} (${script})`);
  try {
    const out = execFileSync(process.execPath, [path.join(__dirname, script)], { encoding: 'utf8' });
    process.stdout.write(out);
  } catch (err) {
    process.stdout.write(err.stdout || '');
    process.stderr.write(err.stderr || '');
    console.error(`\nBuild stopped at ${script}`);
    process.exit(1);
  }
}
console.log('\nBuild complete.');

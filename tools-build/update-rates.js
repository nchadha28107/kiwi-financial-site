/**
 * Refreshes data/rates.json.
 *
 *   node tools-build/update-rates.js --touch
 *       Re-stamps last_updated without changing any rate (use after a manual edit).
 *
 *   node tools-build/update-rates.js --set anz.fixed_1y=4.89 asb.floating=6.49
 *       Updates individual values and re-stamps.
 *
 * NOTE ON AUTOMATED SOURCES
 * There is no free official NZ mortgage rate API. Scraping interest.co.nz or a
 * bank's site is a licensing decision for the business, not a technical one -
 * wire an approved feed into fetchFromSource() below and run this on a daily
 * cron. Until then rates.json is the source of truth and is edited by hand.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'rates.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const args = process.argv.slice(2);

function nzIsoNow() {
  // NZ is UTC+13 during daylight saving, UTC+12 otherwise.
  const now = new Date();
  const offsetName = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', timeZoneName: 'longOffset' })
    .formatToParts(now).find((p) => p.type === 'timeZoneName').value;
  const offset = offsetName.replace('GMT', '') || '+12:00';
  const local = new Date(now.toLocaleString('en-US', { timeZone: 'Pacific/Auckland' }));
  const pad = (n) => String(n).padStart(2, '0');
  return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}` +
    `T${pad(local.getHours())}:${pad(local.getMinutes())}:00${offset}`;
}

/** Point this at an approved rate feed, then schedule this script daily at 8am NZST. */
async function fetchFromSource() {
  return null;
}

async function main() {
  const setters = args.filter((a) => a.includes('='));
  setters.forEach((pair) => {
    const [lhs, value] = pair.split('=');
    const [slug, field] = lhs.split('.');
    const row = data.rates.find((r) => r.slug === slug);
    if (!row) { console.log(`  ! unknown lender: ${slug}`); return; }
    if (!(field in row)) { console.log(`  ! unknown field: ${field}`); return; }
    row[field] = value === 'null' ? null : parseFloat(value);
    console.log(`  set ${slug}.${field} = ${row[field]}`);
  });

  const fetched = await fetchFromSource();
  if (fetched) {
    data.rates = fetched;
    data.source = 'feed';
    console.log(`  pulled ${fetched.length} lenders from feed`);
  } else if (setters.length) {
    data.source = 'manual';
  }

  data.last_updated = nzIsoNow();
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');

  const best = data.rates.reduce((a, r) => (r.fixed_1y && r.fixed_1y < a.fixed_1y ? r : a), data.rates[0]);
  console.log(`\nStamped ${data.last_updated}`);
  console.log(`Best 1-year fixed: ${best.bank} at ${best.fixed_1y}%`);
}

main();

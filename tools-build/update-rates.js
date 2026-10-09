/**
 * Refreshes data/rates.json.
 *
 *   node tools-build/update-rates.js --pull
 *       Pulls live advertised rates from ratesapi.nz and re-stamps.
 *
 *   node tools-build/update-rates.js --touch
 *       Re-stamps last_updated without changing any rate (use after a manual edit).
 *
 *   node tools-build/update-rates.js --set anz.fixed_1y=4.89 asb.floating=6.49
 *       Overrides individual values and re-stamps.
 *
 * SOURCE
 * ratesapi.nz collects advertised rates directly from each institution's own
 * website and serves them as JSON. We pull on demand and commit the result, so
 * the site carries no runtime dependency on a third party and keeps working on
 * static hosting.
 *
 * Cash contributions are not in the feed - those stay manual and are preserved
 * across a pull.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'rates.json');
const SOURCE = 'https://www.ratesapi.nz/api/v1/mortgage-rates';
const UA = 'Mozilla/5.0 (compatible; KiwiFinancialSolutions/1.0; +https://kiwifinancial.co.nz)';

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const args = process.argv.slice(2);

/* Our lender slug -> institution name in the feed, plus which of that
   institution's products carries its headline owner-occupier rate.
   Product names are matched case-insensitively as substrings, in priority order. */
const INSTITUTIONS = {
  anz:         { api: 'ANZ',               products: ['Special', 'Standard'] },
  asb:         { api: 'ASB',               products: ['Standard'] },
  bnz:         { api: 'BNZ',               products: ['Standard'] },
  westpac:     { api: 'Westpac',           products: ['Special', 'Standard'] },
  kiwibank:    { api: 'Kiwibank',          products: ['Special', 'Standard'] },
  tsb:         { api: 'TSB Bank',          products: ['Special', 'Standard'] },
  sbs:         { api: 'SBS Bank',          products: ['Special', 'Residential'] },
  cooperative: { api: 'Co-operative Bank', products: ['Owner Occupied', 'Standard'] },
  heartland:   { api: 'Heartland Bank',    products: ['Residential'] },
  icbc:        { api: 'ICBC',              products: ['Standard'] },
  boc:         { api: 'Bank of China',     products: ['Special', 'Standard'] },
  resimac:     { api: 'Resimac',           products: ['Prime Full Doc'] }
};

const TERMS = {
  floating: { months: null },
  fixed_6m: { months: 6 },
  fixed_1y: { months: 12 },
  fixed_2y: { months: 24 },
  fixed_3y: { months: 36 },
  fixed_5y: { months: 60 }
};

function nzIsoNow() {
  const now = new Date();
  const offset = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', timeZoneName: 'longOffset' })
    .formatToParts(now).find((p) => p.type === 'timeZoneName').value.replace('GMT', '') || '+12:00';
  const local = new Date(now.toLocaleString('en-US', { timeZone: 'Pacific/Auckland' }));
  const pad = (n) => String(n).padStart(2, '0');
  return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}` +
    `T${pad(local.getHours())}:${pad(local.getMinutes())}:00${offset}`;
}

/**
 * Picks one term's rate for an institution.
 *
 * Fixed terms are tier-strict: they come from the first matching product only.
 * Falling back to a different product would compare a "special" (20% equity)
 * against a "standard" in the same row, which reads as though a lender is
 * uncompetitive when it simply does not offer a special at that term.
 * A missing term is therefore reported as null and rendered as an em dash.
 *
 * Floating is the exception - it is a single product per lender, so if the
 * preferred product has no floating rate we take the lowest the lender lists.
 */
function pickRate(node, preference, termKey) {
  const months = TERMS[termKey].months;
  const isFloating = months === null;
  const matches = (r) => (isFloating
    ? /floating/i.test(r.term || '')
    : r.termInMonths === months);

  for (const wanted of preference) {
    const product = node.products.find((p) => p.name.toLowerCase().includes(wanted.toLowerCase()));
    if (!product) continue;
    const hit = product.rates.find((r) => matches(r) && r.rateType === 'advertised');
    if (hit) return { rate: hit.rate, product: product.name, sourceUrl: hit.sourceUrl };
    if (!isFloating) return null; // preferred tier exists but has no rate for this term
  }

  if (!isFloating) return null;

  const all = node.products.flatMap((p) =>
    p.rates.filter((r) => matches(r) && r.rateType === 'advertised').map((r) => ({ r, p })));
  if (!all.length) return null;
  const low = all.reduce((a, x) => (x.r.rate < a.r.rate ? x : a));
  return { rate: low.r.rate, product: low.p.name, sourceUrl: low.r.sourceUrl };
}

async function fetchFromSource() {
  const res = await fetch(SOURCE, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`ratesapi.nz returned HTTP ${res.status}`);
  const feed = await res.json();

  const rows = [];
  const warnings = [];

  for (const row of data.rates) {
    const cfg = INSTITUTIONS[row.slug];
    const node = cfg && feed.data.find((d) => d.name === cfg.api);
    if (!node) {
      warnings.push(`${row.slug}: not matched in feed, left unchanged`);
      rows.push(row);
      continue;
    }

    const next = Object.assign({}, row);
    let product = null;
    let sourceUrl = null;

    for (const termKey of Object.keys(TERMS)) {
      const hit = pickRate(node, cfg.products, termKey);
      next[termKey] = hit ? hit.rate : null;
      // name the tier from a fixed term, not floating, since that is what the table compares
      if (hit && termKey !== 'floating' && !product) { product = hit.product; sourceUrl = hit.sourceUrl; }
      if (hit && !sourceUrl) sourceUrl = hit.sourceUrl;
    }

    next.product = product;
    next.source_url = sourceUrl;
    rows.push(next);
  }

  return { rows, feedUpdated: feed.lastUpdated, terms: feed.termsOfUse, warnings };
}

async function main() {
  if (args.includes('--pull')) {
    console.log(`Pulling ${SOURCE} ...`);
    const { rows, feedUpdated, terms, warnings } = await fetchFromSource();

    const changed = [];
    rows.forEach((next, i) => {
      const prev = data.rates[i];
      Object.keys(TERMS).forEach((k) => {
        if (prev[k] !== next[k]) changed.push(`  ${prev.slug}.${k}: ${prev[k]} -> ${next[k]}`);
      });
    });

    data.rates = rows;
    data.source = 'ratesapi.nz';
    data.source_url = SOURCE;
    data.source_collected_at = feedUpdated;
    data.note = `Advertised rates collected from each institution's own website via ratesapi.nz. ${terms}`;

    warnings.forEach((w) => console.log(`  ! ${w}`));
    console.log(changed.length ? `\n${changed.length} rate change(s):\n${changed.join('\n')}` : '\nNo rate changes.');
  }

  args.filter((a) => a.includes('=')).forEach((pair) => {
    const [lhs, value] = pair.split('=');
    const [slug, field] = lhs.split('.');
    const row = data.rates.find((r) => r.slug === slug);
    if (!row) { console.log(`  ! unknown lender: ${slug}`); return; }
    if (!(field in row)) { console.log(`  ! unknown field: ${field}`); return; }
    row[field] = value === 'null' ? null : parseFloat(value);
    console.log(`  set ${slug}.${field} = ${row[field]}`);
    data.source = 'manual override';
  });

  data.last_updated = nzIsoNow();
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');

  const withRate = data.rates.filter((r) => r.fixed_1y != null);
  const best = withRate.reduce((a, r) => (r.fixed_1y < a.fixed_1y ? r : a), withRate[0]);
  console.log(`\nStamped ${data.last_updated}`);
  console.log(`Best 1-year fixed: ${best.bank} at ${best.fixed_1y}%`);
}

main().catch((err) => { console.error('FAILED:', err.message); process.exit(1); });

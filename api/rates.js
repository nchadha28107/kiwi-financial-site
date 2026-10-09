/**
 * GET /api/rates
 *
 * Serves the lender rate table with a 24h cache header. Works as-is on
 * Vercel / Netlify Functions / any Node handler.
 *
 * The site falls back to /data/rates.json directly if this endpoint is not
 * deployed, so static hosting keeps working.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'rates.json');
const DAY = 24 * 60 * 60 * 1000;

let cache = null;
let cachedAt = 0;

function load() {
  if (cache && Date.now() - cachedAt < DAY) return cache;
  cache = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  cachedAt = Date.now();
  return cache;
}

function payload() {
  const data = load();
  const ageDays = (Date.now() - new Date(data.last_updated).getTime()) / DAY;
  return Object.assign({}, data, {
    stale: ageDays > 7,
    age_days: Math.floor(ageDays),
    lenders: data.rates.map((r) => Object.assign({ logo: `/assets/logos/${r.slug}.svg` }, r))
  });
}

module.exports = function handler(req, res) {
  try {
    const body = payload();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800, stale-while-revalidate=86400');
    res.statusCode = 200;
    res.end(JSON.stringify(body));
  } catch (err) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'rates_unavailable' }));
  }
};

module.exports.payload = payload;

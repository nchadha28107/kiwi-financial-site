/**
 * GET /api/analytics   (requires header: x-kfs-admin-token)
 *
 * Aggregates lead rows for the internal dashboard.
 *
 * SECURITY: a token header is a convenience gate, not real authentication.
 * Put this route behind your host's access control as well - Netlify
 * "Password protection" / Vercel "Deployment Protection" / Cloudflare Access.
 * Never rely on the client-side PIN alone.
 *
 * Env:
 *   ADMIN_TOKEN        shared secret the dashboard must send
 *   SHEETS_READ_URL    Apps Script web-app URL returning the lead rows as JSON
 *   SHEETS_WEBHOOK_TOKEN
 */
const env = process.env;

function emptySummary() {
  return { week: {}, month: {}, all: {}, daily: [], goals: {}, sources: {}, funnel: {}, leads: [] };
}

async function fetchRows() {
  if (!env.SHEETS_READ_URL) return null;
  const url = `${env.SHEETS_READ_URL}?token=${encodeURIComponent(env.SHEETS_WEBHOOK_TOKEN || '')}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`sheet_read_${res.status}`);
  const body = await res.json();
  return Array.isArray(body) ? body : body.rows || [];
}

function summarise(rows) {
  const now = Date.now();
  const DAY = 86400000;
  const out = emptySummary();

  const inWindow = (r, days) => now - new Date(r.timestamp).getTime() <= days * DAY;
  const count = (list) => list.length;
  const money = (list) => {
    const vals = list.map((r) => Number(String(r.loan_amount).replace(/[^0-9.]/g, ''))).filter(Boolean);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  };
  const topOf = (list, key) => {
    const tally = {};
    list.forEach((r) => { const v = r[key] || '(unknown)'; tally[v] = (tally[v] || 0) + 1; });
    return Object.entries(tally).sort((a, b) => b[1] - a[1])[0] || ['(none)', 0];
  };

  const week = rows.filter((r) => inWindow(r, 7));
  const month = rows.filter((r) => inWindow(r, 30));

  out.week = { applications: count(week), topGoal: topOf(week, 'goal')[0] };
  out.month = { applications: count(month), topGoal: topOf(month, 'goal')[0], avgLoan: money(month) };
  out.all = { applications: count(rows), avgLoan: money(rows), topGoal: topOf(rows, 'goal')[0] };

  for (let i = 29; i >= 0; i--) {
    const day = new Date(now - i * DAY).toISOString().slice(0, 10);
    out.daily.push({ date: day, count: rows.filter((r) => String(r.timestamp).slice(0, 10) === day).length });
  }

  month.forEach((r) => {
    const g = r.goal || '(unknown)';
    out.goals[g] = (out.goals[g] || 0) + 1;
    const s = r.utm_source || '(direct)';
    out.sources[s] = (out.sources[s] || 0) + 1;
  });

  out.leads = rows.slice(-25).reverse();
  return out;
}

module.exports = async function handler(req, res) {
  const json = (code, obj) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(obj));
  };

  const token = req.headers['x-kfs-admin-token'];
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) return json(401, { error: 'unauthorised' });

  try {
    const rows = await fetchRows();
    if (!rows) return json(200, Object.assign(emptySummary(), { configured: false }));
    return json(200, Object.assign(summarise(rows), { configured: true }));
  } catch (err) {
    return json(502, { error: 'source_unavailable', detail: err.message });
  }
};

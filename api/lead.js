/**
 * POST /api/lead
 *
 * Fans a submitted enquiry out to three channels. Every channel is optional -
 * configure only what you need and the rest are skipped. The adviser email is
 * treated as the primary channel: if it fails the request fails, so the browser
 * shows the retry UI rather than silently dropping a lead.
 *
 * Environment variables (set these in Netlify / Vercel / your host - never in
 * client-side code):
 *
 *   RESEND_API_KEY        Resend.com key for transactional email
 *   LEAD_FROM_EMAIL       Verified sender, e.g. "KFS <no-reply@kiwifinancial.co.nz>"
 *   LEAD_TO_EMAIL         Adviser inbox (default info@kiwifinancial.co.nz)
 *
 *   SHEETS_WEBHOOK_URL    Google Apps Script web-app URL that appends a row
 *   SHEETS_WEBHOOK_TOKEN  Shared secret the Apps Script checks
 *
 *   SMS_PROVIDER          "clicksend" | "twilio"
 *   SMS_TO                Adviser mobile in E.164, e.g. +64273030000
 *   CLICKSEND_USERNAME / CLICKSEND_API_KEY
 *   TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM
 */

const env = process.env;
const TO_EMAIL = env.LEAD_TO_EMAIL || 'info@kiwifinancial.co.nz';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/* ------------------------------------------------------------------ email */
async function sendAdviserEmail(p) {
  if (!env.RESEND_API_KEY) return { skipped: 'email' };

  const html = `<div style="font-family:Inter,Segoe UI,Arial,sans-serif;color:#1C2B3A">
    <h2 style="color:#1A3C5E;margin:0 0 4px">${esc(p.goal)} enquiry</h2>
    <p style="color:#6B8099;margin:0 0 18px">Submitted ${esc(p.submittedAt)}</p>
    <pre style="background:#F4F8FB;border:1px solid #E3EBF3;border-radius:12px;padding:18px;
      font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;white-space:pre-wrap">${esc(p.notification.emailBody)}</pre>
    <p><a href="tel:${esc(p.notification.tel)}"
      style="display:inline-block;background:#FF6B35;color:#fff;text-decoration:none;
      padding:12px 22px;border-radius:999px;font-weight:700">Call ${esc(p.contact.name)}</a></p>
  </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.LEAD_FROM_EMAIL || 'Kiwi Financial <no-reply@kiwifinancial.co.nz>',
      to: [TO_EMAIL],
      reply_to: p.contact.email || undefined,
      subject: p.notification.subject,
      text: p.notification.emailBody,
      html
    })
  });
  if (!res.ok) throw new Error(`email_failed_${res.status}`);
  return { ok: 'email' };
}

async function sendAutoReply(p) {
  if (!env.RESEND_API_KEY || !p.contact.email) return { skipped: 'auto_reply' };
  const first = (p.contact.name || '').split(' ')[0] || 'there';

  const html = `<div style="font-family:Inter,Segoe UI,Arial,sans-serif;color:#1C2B3A;max-width:560px">
    <h2 style="color:#1A3C5E">Thanks ${esc(first)} — we've got it.</h2>
    <p>One of our advisers will call you <strong>within one business day</strong>${
      p.contact.callTime && p.contact.callTime !== 'Anytime'
        ? ` (you asked for ${esc(p.contact.callTime.toLowerCase())})` : ''}.</p>
    <p style="color:#6B8099">Here's what you told us:</p>
    <pre style="background:#F4F8FB;border:1px solid #E3EBF3;border-radius:12px;padding:16px;
      font-size:13px;white-space:pre-wrap">${esc(p.notification.emailBody.split('---')[1] || p.goal)}</pre>
    <p>Can't wait? Call us on <a href="tel:+64273030000" style="color:#00B89C"><strong>027 303 0000</strong></a>.</p>
    <p style="color:#6B8099;font-size:12px;line-height:1.6;border-top:1px solid #E3EBF3;padding-top:14px">
      Kiwi Financial Solutions is a registered Financial Advice Provider under the Financial Markets
      Conduct Act 2013. This enquiry is not a loan application and no credit check has been performed.
      Lending criteria apply.</p>
  </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.LEAD_FROM_EMAIL || 'Kiwi Financial <no-reply@kiwifinancial.co.nz>',
      to: [p.contact.email],
      subject: "We've received your enquiry — Kiwi Financial Solutions",
      html
    })
  });
  if (!res.ok) throw new Error(`auto_reply_failed_${res.status}`);
  return { ok: 'auto_reply' };
}

/* ------------------------------------------------------------------ sheet */
async function appendToSheet(p) {
  if (!env.SHEETS_WEBHOOK_URL) return { skipped: 'sheet' };
  const d = p.details || {};
  const res = await fetch(env.SHEETS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: env.SHEETS_WEBHOOK_TOKEN || '',
      row: [
        p.submittedAt,
        p.contact.name,
        p.contact.phone,
        p.contact.email || '',
        p.goal,
        d.budget || d.amount || d.balance || d.projectValue || d.price || '',
        d.deposit || '',
        d._lvr != null ? `${d._lvr}%` : '',
        'New',
        p.contact.callTime,
        (p.utm && p.utm.utm_source) || '(direct)',
        (p.utm && p.utm.utm_campaign) || '',
        p.device
      ]
    })
  });
  if (!res.ok) throw new Error(`sheet_failed_${res.status}`);
  return { ok: 'sheet' };
}

/* ------------------------------------------------------------------ sms */
async function sendSms(p) {
  const to = env.SMS_TO;
  if (!to || !env.SMS_PROVIDER) return { skipped: 'sms' };
  const body = p.notification.sms;

  if (env.SMS_PROVIDER === 'clicksend') {
    const auth = Buffer.from(`${env.CLICKSEND_USERNAME}:${env.CLICKSEND_API_KEY}`).toString('base64');
    const res = await fetch('https://rest.clicksend.com/v3/sms/send', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ source: 'web', to, body }] })
    });
    if (!res.ok) throw new Error(`sms_failed_${res.status}`);
    return { ok: 'sms' };
  }

  if (env.SMS_PROVIDER === 'twilio') {
    const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64');
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: to, From: env.TWILIO_FROM, Body: body })
      });
    if (!res.ok) throw new Error(`sms_failed_${res.status}`);
    return { ok: 'sms' };
  }

  return { skipped: 'sms' };
}

/* ------------------------------------------------------------------ handler */
function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 64 * 1024) reject(new Error('payload_too_large'));
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch (e) { reject(new Error('bad_json')); }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  const json = (code, obj) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(obj));
  };

  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  let p;
  try {
    p = await readBody(req);
  } catch (e) {
    return json(400, { error: e.message });
  }

  if (!p || !p.contact || !p.contact.name || !p.contact.phone || !p.notification) {
    return json(400, { error: 'missing_fields' });
  }
  // Honeypot / obvious junk guard
  if (String(p.contact.name).length > 120 || !/^[0-9 +()-]{8,20}$/.test(p.contact.phone)) {
    return json(400, { error: 'invalid_contact' });
  }

  // Fail loudly rather than returning a false success that loses the lead.
  if (!env.RESEND_API_KEY && !env.SHEETS_WEBHOOK_URL && !env.SMS_PROVIDER) {
    return json(501, { error: 'no_channel_configured' });
  }

  try {
    await sendAdviserEmail(p); // primary channel - failure surfaces to the user
  } catch (err) {
    return json(502, { error: 'notify_failed', detail: err.message });
  }

  // Secondary channels must never block the confirmation.
  const secondary = await Promise.allSettled([sendAutoReply(p), appendToSheet(p), sendSms(p)]);

  return json(200, {
    ok: true,
    channels: secondary.map((r) => (r.status === 'fulfilled' ? r.value : { failed: r.reason.message }))
  });
};

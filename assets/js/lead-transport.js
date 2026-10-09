/* ==========================================================================
   Lead transport.

   Preferred path:  POST /api/lead  -> serverless fan-out (email + auto-reply
                    + Google Sheet row + SMS alert). All credentials live in
                    server environment variables.

   Fallback path:   EmailJS direct from the browser, for static hosting with
                    no backend. Only a public key is exposed, which is what
                    EmailJS is designed for.

   If neither is configured the payload is logged so a lead is never lost
   silently during development.
   ========================================================================== */
(function (w, d) {
  'use strict';

  var CFG = (w.KFS_CONFIG && w.KFS_CONFIG.lead) || {};
  var EJS = CFG.emailjs || {};
  var emailjsReady = null;

  function hasServerless() { return !!CFG.endpoint; }
  function hasEmailJs() { return !!(EJS.publicKey && EJS.serviceId && EJS.adviserTemplateId); }

  function loadEmailJs() {
    if (emailjsReady) return emailjsReady;
    emailjsReady = new Promise(function (resolve, reject) {
      var s = d.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      s.onload = function () {
        w.emailjs.init({ publicKey: EJS.publicKey });
        resolve(w.emailjs);
      };
      s.onerror = function () { reject(new Error('emailjs_load_failed')); };
      d.head.appendChild(s);
    });
    return emailjsReady;
  }

  /** Flattens the wizard payload into the template variables the email uses. */
  function templateVars(p) {
    var det = p.details || {};
    return {
      to_email: CFG.adviserEmail,
      subject: p.notification.subject,
      name: p.contact.name,
      phone: p.contact.phone,
      phone_e164: p.notification.tel,
      email: p.contact.email || '(not supplied)',
      call_time: p.contact.callTime,
      loan_goal: p.goal,
      budget: det.budget || det.amount || det.balance || det.projectValue || det.price || '',
      deposit: det.deposit || '',
      lvr: det._lvr != null ? det._lvr + '%' : '',
      details_block: p.notification.emailBody,
      timestamp: p.submittedAt,
      source: p.source,
      device: p.device,
      utm_source: (p.utm && p.utm.utm_source) || '(direct)',
      utm_campaign: (p.utm && p.utm.utm_campaign) || ''
    };
  }

  function viaServerless(p) {
    return fetch(CFG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    }).then(function (r) {
      if (!r.ok) throw new Error('lead_endpoint_' + r.status);
      return r.json().catch(function () { return {}; });
    });
  }

  function viaEmailJs(p) {
    var vars = templateVars(p);
    return loadEmailJs().then(function (ejs) {
      return ejs.send(EJS.serviceId, EJS.adviserTemplateId, vars).then(function () {
        // Applicant confirmation is best-effort - never fail the lead over it.
        if (!EJS.autoReplyTemplateId || !p.contact.email) return;
        return ejs.send(EJS.serviceId, EJS.autoReplyTemplateId, Object.assign({}, vars, {
          to_email: p.contact.email
        })).catch(function () {});
      });
    });
  }

  w.KFSLead = {
    send: function (payload) {
      payload.utm = (w.KFSTrack && w.KFSTrack.utm()) || {};

      if (hasServerless()) {
        return viaServerless(payload).catch(function (err) {
          if (hasEmailJs()) return viaEmailJs(payload);
          throw err;
        });
      }
      if (hasEmailJs()) return viaEmailJs(payload);

      console.info('[KFS lead - no transport configured]\n' + payload.notification.subject +
        '\n\n' + payload.notification.emailBody + '\n\nSMS: ' + payload.notification.sms);
      return new Promise(function (res) { setTimeout(res, 600); });
    }
  };
})(window, document);

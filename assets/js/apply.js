/* ==========================================================================
   Lead capture wizard - 3 steps, 7 fields max, target under 90 seconds.
   Step 2 is rendered from GOALS so each goal only ever shows its own 3 fields.
   ========================================================================== */
document.addEventListener('kfs:ready', function () {
  var form = document.getElementById('leadWizard');
  if (!form) return;

  var I = window.KFS_ICONS;
  var STORE_KEY = 'kfs_lead_draft';
  var DRAFT_TTL = 24 * 60 * 60 * 1000;
  var ENDPOINT = (window.KFS_CONFIG && window.KFS_CONFIG.lead && window.KFS_CONFIG.lead.endpoint) ||
    window.KFS_LEAD_ENDPOINT || null;

  var nf = new Intl.NumberFormat('en-NZ');
  var money = function (n) { return '$' + nf.format(Math.round(n)); };
  var toNum = function (v) { var n = parseFloat(String(v).replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };

  /* ------------------------------------------------------------- config */
  var GOALS = {
    fhb: {
      emoji: '\u{1F3E0}', label: 'Buy my first home', short: 'First Home Buyer',
      fields: [
        { k: 'budget', type: 'slider', label: 'Property budget', min: 300000, max: 2000000, step: 10000, val: 650000 },
        { k: 'deposit', type: 'slider', label: 'Deposit saved', min: 0, max: 500000, step: 5000, val: 130000, lvrAgainst: 'budget' },
        { k: 'timeframe', type: 'pills', label: 'Timeframe', options: ['Ready now', '3 months', '6 months', 'Just exploring'] }
      ]
    },
    refinance: {
      emoji: '\u{1F504}', label: 'Refinance / Refix', short: 'Refinance',
      fields: [
        { k: 'balance', type: 'slider', label: 'Approximate loan balance remaining', min: 100000, max: 2000000, step: 10000, val: 600000 },
        { k: 'expiry', type: 'pills', label: 'Fixed rate expiry', options: ['Expired', '< 3 months', '3\u20136 months', '6\u201312 months'] },
        { k: 'reason', type: 'pills', label: 'Main reason', options: ['Better rate', 'Release equity', 'Consolidate debt', 'Unhappy with bank', 'Just reviewing options'] }
      ]
    },
    construct: {
      emoji: '\u{1F3D7}\uFE0F', label: 'Build or construct', short: 'Construction',
      fields: [
        { k: 'projectValue', type: 'slider', label: 'Total project value (land + build)', min: 300000, max: 3000000, step: 10000, val: 900000 },
        { k: 'stage', type: 'pills', label: 'Stage you\u2019re at', options: ['Have land, need build loan', 'Need land + build', 'Have builder, need finance', 'Still in planning'] },
        { k: 'deposit', type: 'slider', label: 'Deposit / equity available', min: 0, max: 500000, step: 5000, val: 180000, lvrAgainst: 'projectValue' }
      ]
    },
    investment: {
      emoji: '\u{1F3D8}\uFE0F', label: 'Investment property', short: 'Investment Property',
      fields: [
        { k: 'budget', type: 'slider', label: 'Purchase price range', min: 300000, max: 3000000, step: 10000, val: 850000 },
        { k: 'deposit', type: 'slider', label: 'Deposit / equity available', min: 0, max: 1000000, step: 5000, val: 255000, lvrAgainst: 'budget' },
        { k: 'portfolio', type: 'pills', label: 'How many investment properties do you own?', options: ['0 \u2014 first one', '1\u20132', '3\u20135', '5+'] }
      ]
    },
    asset: {
      emoji: '\u{1F697}', label: 'Asset finance', short: 'Asset Finance',
      fields: [
        { k: 'assetType', type: 'pills', label: 'Asset type', options: ['\u{1F697} Car / Ute', '\u{1F69B} Truck / Commercial vehicle', '\u2699\uFE0F Machinery', '\u{1F6A4} Marine / Boat', 'Other'] },
        { k: 'price', type: 'slider', label: 'Purchase price', min: 5000, max: 500000, step: 1000, val: 45000 },
        { k: 'condition', type: 'pills', label: 'New or used?', options: ['New', 'Used \u2014 dealer', 'Used \u2014 private sale'] }
      ]
    },
    business: {
      emoji: '\u{1F4BC}', label: 'Business loan', short: 'Business Loan',
      fields: [
        { k: 'amount', type: 'slider', label: 'Amount needed', min: 50000, max: 5000000, step: 10000, val: 350000 },
        { k: 'purpose', type: 'pills', label: 'What for?', options: ['Buy commercial property', 'Business expansion', 'Equipment / vehicles', 'Working capital', 'Refinance existing debt', 'Other'] },
        { k: 'timeframe', type: 'pills', label: 'Timeframe', options: ['ASAP', '1 month', '3 months', 'Just planning'] }
      ]
    }
  };
  var ORDER = ['fhb', 'refinance', 'construct', 'investment', 'asset', 'business'];

  /* ------------------------------------------------------------- state */
  var state = { goal: null, details: {}, contact: {} };
  var step = 1;

  /* ------------------------------------------------------------- trust list */
  var aside = document.getElementById('asideTicks');
  if (aside) {
    aside.innerHTML = [
      ['No credit check to enquire', 'This leaves no mark on your credit file.'],
      ['Free service', 'The lender pays us, and we disclose exactly how.'],
      ['100% independent', 'No bank owns us, so no product gets pushed.'],
      ['15+ lenders compared', 'One conversation, the whole market.']
    ].map(function (p) {
      return '<li><span class="tick">' + I.check + '</span><span><b>' + p[0] + '</b><span>' + p[1] + '</span></span></li>';
    }).join('');
  }

  /* ------------------------------------------------------------- step 1 */
  var grid = document.getElementById('goalGrid');
  grid.innerHTML = ORDER.map(function (id) {
    var g = GOALS[id];
    return '<button class="goal-card" type="button" data-goal="' + id + '" aria-pressed="false">' +
      '<span class="emo" aria-hidden="true">' + g.emoji + '</span>' + g.label +
      '<span class="tick-slot" aria-hidden="true">' + I.check + '</span></button>';
  }).join('');

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.goal-card');
    if (!btn) return;
    selectGoal(btn.dataset.goal);
    setTimeout(function () { go(2); }, 220); // let the tick animation land before advancing
  });

  function selectGoal(id) {
    if (state.goal !== id) state.details = {};
    state.goal = id;
    [].forEach.call(grid.children, function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.goal === id));
    });
    renderDetails();
    save();
  }

  /* ------------------------------------------------------------- step 2 */
  var detailHost = document.getElementById('detailFields');

  function renderDetails() {
    var g = GOALS[state.goal];
    if (!g) { detailHost.innerHTML = ''; return; }

    detailHost.innerHTML = g.fields.map(function (f) {
      if (f.type === 'slider') {
        var v = state.details[f.k] != null ? state.details[f.k] : f.val;
        return '<div class="slider-field" data-k="' + f.k + '">' +
          '<label for="sl_' + f.k + '">' + f.label + '</label>' +
          '<div class="live"><output id="out_' + f.k + '" for="sl_' + f.k + '"></output>' +
          (f.lvrAgainst ? '<span class="lvr-badge" id="lvr_' + f.k + '"></span>' : '') + '</div>' +
          '<input type="range" id="sl_' + f.k + '" min="' + f.min + '" max="' + f.max + '" step="' + f.step + '"' +
          ' value="' + v + '" aria-label="' + f.label + '">' +
          '<div class="range-ends"><span>' + shortMoney(f.min) + '</span><span>' + shortMoney(f.max) + '+</span></div>' +
          '</div>';
      }
      var sel = state.details[f.k];
      return '<div class="pill-field" data-k="' + f.k + '">' +
        '<label id="lb_' + f.k + '">' + f.label + '</label>' +
        '<div class="toggle-row" role="radiogroup" aria-labelledby="lb_' + f.k + '">' +
        f.options.map(function (o, i) {
          var id = 'p_' + f.k + '_' + i;
          return '<input type="radio" name="' + f.k + '" id="' + id + '" value="' + esc(o) + '"' +
            (sel === o ? ' checked' : '') + '><label for="' + id + '">' + o + '</label>';
        }).join('') + '</div></div>';
    }).join('');

    g.fields.forEach(function (f) {
      if (f.type === 'slider') {
        var el = document.getElementById('sl_' + f.k);
        if (state.details[f.k] == null) state.details[f.k] = toNum(el.value);
        el.addEventListener('input', function () {
          state.details[f.k] = toNum(el.value);
          paintSliders();
          save();
        });
      } else {
        [].forEach.call(detailHost.querySelectorAll('input[name="' + f.k + '"]'), function (r) {
          r.addEventListener('change', function () { state.details[f.k] = r.value; save(); });
        });
      }
    });
    paintSliders();
  }

  function paintSliders() {
    var g = GOALS[state.goal];
    if (!g) return;
    g.fields.forEach(function (f) {
      if (f.type !== 'slider') return;
      var el = document.getElementById('sl_' + f.k);
      var out = document.getElementById('out_' + f.k);
      if (!el || !out) return;
      var v = toNum(el.value);
      out.textContent = money(v) + (v >= f.max ? '+' : '');

      if (!f.lvrAgainst) return;
      var badge = document.getElementById('lvr_' + f.k);
      var total = state.details[f.lvrAgainst] || 0;
      if (!badge || !total) return;
      var lvr = Math.max(0, Math.min(100, (total - v) / total * 100));
      var tier = lvr < 70 ? ['is-excellent', 'excellent']
        : lvr <= 80 ? ['is-good', 'good']
        : lvr <= 85 ? ['is-ok', 'manageable']
        : ['is-talk', 'let\u2019s talk'];
      badge.className = 'lvr-badge ' + tier[0];
      badge.textContent = 'LVR ' + Math.round(lvr) + '% \u2014 ' + tier[1];
      state.details._lvr = Math.round(lvr);
    });
  }

  function shortMoney(n) {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(n % 1000000 ? 1 : 0) + 'M';
    if (n >= 1000) return '$' + Math.round(n / 1000) + 'k';
    return '$' + n;
  }
  function esc(s) { return String(s).replace(/"/g, '&quot;'); }

  /* ------------------------------------------------------------- step 3 inputs */
  var nameEl = document.getElementById('leadName');
  var phoneEl = document.getElementById('leadPhone');
  var emailEl = document.getElementById('leadEmail');

  nameEl.addEventListener('input', function () {
    var pos = nameEl.selectionStart;
    nameEl.value = nameEl.value.replace(/(^|[\s'-])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); });
    nameEl.setSelectionRange(pos, pos);
    save();
  });

  phoneEl.addEventListener('input', function () {
    phoneEl.value = window.KFSPhone.format(phoneEl.value);
    phoneEl.closest('.field').classList.remove('invalid');
    save();
  });
  emailEl.addEventListener('input', save);
  [].forEach.call(form.querySelectorAll('input[name="callTime"]'), function (r) {
    r.addEventListener('change', save);
  });

  function validPhone(v) { return window.KFSPhone.isValid(v); }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }

  function validateContact(shake) {
    var ok = true;
    var checks = [
      [nameEl, nameEl.value.trim().length > 1],
      [phoneEl, validPhone(phoneEl.value)],
      [emailEl, !emailEl.value.trim() || validEmail(emailEl.value)]
    ];
    checks.forEach(function (c) {
      var field = c[0].closest('.field');
      field.classList.toggle('invalid', !c[1]);
      if (!c[1] && shake) {
        field.classList.remove('shake');
        void field.offsetWidth;
        field.classList.add('shake');
      }
      if (!c[1]) ok = false;
    });
    if (!ok) {
      var bad = form.querySelector('.field.invalid input');
      if (bad) bad.focus();
    }
    return ok;
  }

  /** Step 2 requires every pill group for the chosen goal to be answered. */
  function validateDetails() {
    var g = GOALS[state.goal];
    if (!g) return false;
    var ok = true;
    g.fields.forEach(function (f) {
      if (f.type !== 'pills') return;
      var group = detailHost.querySelector('.pill-field[data-k="' + f.k + '"]');
      var answered = !!state.details[f.k];
      group.classList.toggle('invalid', !answered);
      var err = group.querySelector('.err');
      if (!answered) {
        ok = false;
        if (!err) {
          err = document.createElement('p');
          err.className = 'err';
          err.textContent = 'Please pick one so we know how to help.';
          err.style.display = 'block';
          group.appendChild(err);
        }
        err.style.display = 'block';
        group.classList.remove('shake');
        void group.offsetWidth;
        group.classList.add('shake');
      } else if (err) {
        err.style.display = 'none';
      }
    });
    if (!ok) {
      var first = detailHost.querySelector('.pill-field.invalid');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return ok;
  }

  /* ------------------------------------------------------------- navigation */
  var panels = [].slice.call(form.querySelectorAll('.step-panel'));
  var nav = document.getElementById('wizardNav');
  var btnBack = document.getElementById('btnBack');
  var btnNext = document.getElementById('btnNext');
  var caption = document.getElementById('stepCaption');
  var stepItems = [].slice.call(document.querySelectorAll('#stepper li'));
  var submitSlot = document.getElementById('submitSlot');
  var submitTpl = document.getElementById('submitTemplate');
  var furthest = 1;

  /* The submit control only exists in the DOM on the final step. */
  function renderButtons(n) {
    var last = n === 3;
    btnNext.hidden = n !== 2;
    if (last && !submitSlot.firstElementChild) {
      submitSlot.appendChild(submitTpl.content.cloneNode(true));
    } else if (!last && submitSlot.firstElementChild) {
      submitSlot.innerHTML = '';
    }
  }

  function go(n, silent) {
    step = n;
    furthest = Math.max(furthest, n);
    panels.forEach(function (p) { p.classList.toggle('active', +p.dataset.step === n); });
    stepItems.forEach(function (li, i) {
      var num = i + 1;
      li.classList.toggle('done', num < n);
      li.classList.toggle('current', num === n);
      li.classList.toggle('locked', num > n);
      // only visited steps can be jumped back to - forward is always locked
      li.querySelector('.stepper__btn').disabled = num >= n;
    });
    var g = GOALS[state.goal];
    caption.innerHTML = (g && n > 1 ? '<b>' + g.short + '</b> &mdash; ' : '') + 'Step ' + n + ' of 3';

    nav.hidden = n === 1;
    renderButtons(n);
    if (!silent) document.querySelector('.wizard__main').scrollIntoView({ behavior: 'smooth', block: 'start' });
    save();
    if (window.KFSTrack) window.KFSTrack.step(n, state.goal);
  }

  btnNext.addEventListener('click', function () {
    if (!validateDetails()) return;
    go(3);
  });
  btnBack.addEventListener('click', function () { go(Math.max(1, step - 1)); });

  stepItems.forEach(function (li) {
    li.querySelector('.stepper__btn').addEventListener('click', function () {
      var target = +li.dataset.s;
      if (target < step) go(target);
    });
  });

  /* ------------------------------------------------------------- draft persistence */
  function save() {
    state.contact = {
      name: nameEl.value.trim(),
      phone: phoneEl.value.trim(),
      email: emailEl.value.trim(),
      callTime: (form.querySelector('input[name="callTime"]:checked') || {}).value || 'Anytime'
    };
    try {
      if (!state.goal) return; // never clobber a saved draft with an empty one
      localStorage.setItem(STORE_KEY, JSON.stringify({ t: Date.now(), step: step, state: state }));
    } catch (e) { /* private browsing - draft saving is best-effort */ }
  }

  function clearDraft() { try { localStorage.removeItem(STORE_KEY); } catch (e) {} }

  function loadDraft() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || Date.now() - d.t > DRAFT_TTL || !d.state || !d.state.goal) { clearDraft(); return null; }
      return d;
    } catch (e) { return null; }
  }

  function restore(d) {
    state = d.state;
    // Fill the contact inputs first - selectGoal() re-saves from the DOM.
    var c = state.contact || {};
    nameEl.value = c.name || '';
    phoneEl.value = c.phone || '';
    emailEl.value = c.email || '';
    var ct = form.querySelector('input[name="callTime"][value="' + (c.callTime || 'Anytime') + '"]');
    if (ct) ct.checked = true;
    selectGoal(state.goal);
    go(Math.min(d.step || 2, 3));
  }

  var draft = loadDraft();
  var banner = document.getElementById('resumeBanner');
  if (draft) {
    banner.hidden = false;
    document.getElementById('resumeYes').addEventListener('click', function () {
      banner.hidden = true;
      restore(draft);
    });
    document.getElementById('resumeNo').addEventListener('click', function () {
      banner.hidden = true;
      clearDraft();
      state = { goal: null, details: {}, contact: {} };
      go(1);
    });
  }

  /* ------------------------------------------------------------- notification payload */
  function device() {
    var ua = navigator.userAgent;
    var mobile = /Mobi|Android|iPhone|iPad/i.test(ua);
    var os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android'
      : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : 'Other';
    var br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome'
      : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : 'Other';
    return (mobile ? 'Mobile' : 'Desktop') + ' (' + os + ', ' + br + ')';
  }

  function summary() {
    var g = GOALS[state.goal];
    var rows = [];
    var headline = '';
    var urgency = '';

    g.fields.forEach(function (f) {
      var v = state.details[f.k];
      if (v == null || v === '') return;
      if (f.type === 'slider') {
        var txt = money(v) + (v >= f.max ? '+' : '');
        if (f.lvrAgainst && state.details._lvr != null) txt += '  (LVR: ' + state.details._lvr + '%)';
        rows.push([f.label.toUpperCase(), txt]);
        if (!headline) headline = shortMoney(v);
      } else {
        rows.push([f.label.toUpperCase(), v]);
        if (/timeframe|expiry|stage/i.test(f.label)) urgency = v;
      }
    });
    if (!urgency && rows.length) urgency = rows[rows.length - 1][1];
    return { rows: rows, headline: headline || '—', urgency: urgency };
  }

  function buildPayload() {
    var g = GOALS[state.goal];
    var s = summary();
    var c = state.contact;
    var when = new Date().toLocaleString('en-NZ', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZone: 'Pacific/Auckland'
    });

    var subject = g.emoji + ' ' + g.short + ' \u2014 ' + c.name + ' \u2014 ' + s.headline + ' \u2014 ' + s.urgency;

    var rule = null;
    var pairs = [
      ['NAME', c.name],
      ['PHONE', c.phone],
      ['EMAIL', c.email || '(not supplied)'],
      ['CALL TIME', c.callTime],
      rule,
      ['GOAL', g.short]
    ].concat(s.rows, [
      rule,
      ['SUBMITTED', when + ' NZT'],
      ['SOURCE', location.origin + location.pathname],
      ['DEVICE', device()]
    ]);

    var pad = Math.max.apply(null, pairs.filter(Boolean).map(function (p) { return p[0].length; })) + 2;
    var body = pairs.map(function (p) {
      return p ? (p[0] + ':').padEnd(pad) + p[1] : '-'.repeat(58);
    }).join('\n');

    var sms = g.emoji + ' New lead: ' + c.name + ' | ' + g.short + ' | ' + s.headline +
      (state.details._lvr != null ? ' | ' + state.details._lvr + '% LVR' : '') +
      (s.urgency ? ' | ' + s.urgency : '') +
      ' | Call: ' + c.phone + ' | ' + c.callTime;

    return {
      goal: g.short,
      goalId: state.goal,
      details: state.details,
      contact: c,
      submittedAt: new Date().toISOString(),
      source: location.origin + location.pathname,
      device: device(),
      notification: { subject: subject, emailBody: body, sms: sms, tel: window.KFSPhone.e164(c.phone) }
    };
  }

  /* ------------------------------------------------------------- submit */
  var errBox = document.getElementById('formError');

  function send(payload) {
    if (window.KFSLead && window.KFSLead.send) return window.KFSLead.send(payload);
    if (!ENDPOINT) {
      // No transport configured - log the adviser payload so nothing is silently lost.
      console.info('[KFS lead]\n' + payload.notification.subject + '\n\n' + payload.notification.emailBody + '\n\nSMS: ' + payload.notification.sms);
      return new Promise(function (res) { setTimeout(res, 700); });
    }
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); });
  }

  function doSubmit() {
    if (!validateContact(true)) return;
    var submitBtn = document.getElementById('leadSubmit');
    var submitLabel = document.getElementById('submitLabel');
    if (!submitBtn) return;

    errBox.classList.remove('show');
    submitBtn.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Sending\u2026';

    var payload = buildPayload();
    send(payload).then(function () {
      clearDraft();
      if (window.KFSTrack) window.KFSTrack.submitted(payload);
      var first = state.contact.name.split(' ')[0] || 'there';
      var when = state.contact.callTime === 'Anytime'
        ? 'shortly' : 'in the ' + state.contact.callTime.replace(/\s\d.*$/, '').toLowerCase();
      document.getElementById('doneHeading').innerHTML = 'You\u2019re all set, ' + first + '! \u{1F389}';
      document.getElementById('doneSub').textContent =
        'We\u2019ll call you ' + when + ' \u2014 usually within a few hours during business days.' +
        (state.contact.email ? ' Check your email for a confirmation.' : '');
      form.hidden = true;
      document.getElementById('wizardHead').hidden = true;
      document.getElementById('leadDone').hidden = false;
      document.querySelector('.wizard__main').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function () {
      errBox.classList.add('show');
      if (window.KFSTrack) window.KFSTrack.event('apply_submit_failed');
    }).then(function () {
      if (!submitBtn.isConnected) return;
      submitBtn.removeAttribute('aria-busy');
      submitLabel.innerHTML = '\u{1F680}&nbsp; Get My Free Advice \u2192';
    });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); doSubmit(); });
  document.getElementById('retryBtn').addEventListener('click', doSubmit);

  go(1, true);
});

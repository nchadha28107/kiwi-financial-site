/* ==========================================================================
   Kiwi Financial Solutions - calculator engine
   Pure JS maths. Chart.js is used only for rendering.
   ========================================================================== */
(function (w) {
  'use strict';

  var FREQ = { weekly: 52, fortnightly: 26, monthly: 12 };
  var FREQ_LABEL = { weekly: 'per week', fortnightly: 'per fortnight', monthly: 'per month' };

  var money = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 });
  var money2 = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var num = new Intl.NumberFormat('en-NZ');

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function parseNum(v) { var n = parseFloat(String(v).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? 0 : n; }

  /**
   * Standard amortising payment.
   * M = P * [r(1+r)^n] / [(1+r)^n - 1]   with r = annual rate / periods per year
   */
  function payment(principal, annualRatePct, years, periodsPerYear) {
    var n = Math.round(years * periodsPerYear);
    if (principal <= 0 || n <= 0) return 0;
    var r = (annualRatePct / 100) / periodsPerYear;
    if (r === 0) return principal / n;
    var f = Math.pow(1 + r, n);
    return principal * (r * f) / (f - 1);
  }

  /** Per-period schedule aggregated into years. */
  function schedule(principal, annualRatePct, years, periodsPerYear) {
    var n = Math.round(years * periodsPerYear);
    var r = (annualRatePct / 100) / periodsPerYear;
    var pay = payment(principal, annualRatePct, years, periodsPerYear);
    var bal = principal, totalInterest = 0, rows = [], yInt = 0, yPrin = 0;

    for (var i = 1; i <= n; i++) {
      var interest = bal * r;
      var princ = Math.min(pay - interest, bal);
      bal = Math.max(0, bal - princ);
      totalInterest += interest;
      yInt += interest;
      yPrin += princ;

      if (i % periodsPerYear === 0 || i === n) {
        rows.push({
          year: Math.ceil(i / periodsPerYear),
          interest: yInt,
          principal: yPrin,
          balance: bal
        });
        yInt = 0; yPrin = 0;
      }
    }
    return { payment: pay, periods: n, totalInterest: totalInterest, totalRepaid: principal + totalInterest, rows: rows };
  }

  /* ------------------------------------------------------------- UI helpers */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel)); }

  function setText(sel, value, ctx) { var el = $(sel, ctx); if (el) el.textContent = value; }

  /** Keeps a range slider and a text box in sync and calls back on change. */
  function link(rangeEl, textEl, onChange, format) {
    if (!rangeEl || !textEl) return;
    format = format || function (v) { return num.format(v); };

    function fromRange() {
      textEl.value = format(parseNum(rangeEl.value));
      onChange();
    }
    function fromText() {
      var v = clamp(parseNum(textEl.value), parseNum(rangeEl.min), parseNum(rangeEl.max));
      rangeEl.value = v;
      textEl.value = format(parseNum(rangeEl.value)); // resync so junk input cannot linger
      onChange();
    }
    rangeEl.addEventListener('input', fromRange);
    textEl.addEventListener('input', function () {
      var v = parseNum(textEl.value);
      rangeEl.value = clamp(v, parseNum(rangeEl.min), parseNum(rangeEl.max));
      onChange();
    });
    textEl.addEventListener('blur', fromText);
    textEl.value = format(parseNum(rangeEl.value));
  }

  function radioValue(name, ctx) {
    var el = $('input[name="' + name + '"]:checked', ctx || document);
    return el ? el.value : null;
  }

  /* ------------------------------------------------------------- charts */
  var CHART_COLORS = { principal: '#1A3C5E', interest: '#FF6B35', accent: '#00B89C', line: '#E3EBF3' };

  function chartReady() { return typeof w.Chart !== 'undefined'; }

  function doughnut(canvas, principal, interest) {
    if (!canvas || !chartReady()) return null;
    if (canvas._chart) {
      canvas._chart.data.datasets[0].data = [principal, interest];
      canvas._chart.update('none');
      return canvas._chart;
    }
    canvas._chart = new w.Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Principal', 'Interest'],
        datasets: [{
          data: [principal, interest],
          backgroundColor: [CHART_COLORS.principal, CHART_COLORS.interest],
          borderColor: '#fff', borderWidth: 3, hoverOffset: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '64%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: function (c) { return c.label + ': ' + money.format(c.parsed); } },
            backgroundColor: '#0C0634', padding: 12, cornerRadius: 10, titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' }
          }
        }
      }
    });
    return canvas._chart;
  }

  function lineChart(canvas, labels, balances) {
    if (!canvas || !chartReady()) return null;
    if (canvas._chart) {
      canvas._chart.data.labels = labels;
      canvas._chart.data.datasets[0].data = balances;
      canvas._chart.update('none');
      return canvas._chart;
    }
    var ctx = canvas.getContext('2d');
    var grad = ctx.createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0, 'rgba(0,184,156,.32)');
    grad.addColorStop(1, 'rgba(0,184,156,0)');

    canvas._chart = new w.Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Loan balance', data: balances,
          borderColor: CHART_COLORS.accent, backgroundColor: grad,
          borderWidth: 3, fill: true, tension: .35, pointRadius: 0, pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: function (c) { return 'Balance: ' + money.format(c.parsed.y); } },
            backgroundColor: '#0C0634', padding: 12, cornerRadius: 10
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B8099', font: { family: 'Inter' }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }, title: { display: true, text: 'Year', color: '#6B8099' } },
          y: { grid: { color: CHART_COLORS.line }, ticks: { color: '#6B8099', font: { family: 'Inter' }, callback: function (v) { return '$' + (v / 1000) + 'k'; } } }
        }
      }
    });
    return canvas._chart;
  }

  function barChart(canvas, labels, oldData, newData) {
    if (!canvas || !chartReady()) return null;
    if (canvas._chart) {
      canvas._chart.data.datasets[0].data = oldData;
      canvas._chart.data.datasets[1].data = newData;
      canvas._chart.update('none');
      return canvas._chart;
    }
    canvas._chart = new w.Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'Current loan', data: oldData, backgroundColor: '#6B8099', borderRadius: 8, maxBarThickness: 56 },
          { label: 'After refinancing', data: newData, backgroundColor: CHART_COLORS.accent, borderRadius: 8, maxBarThickness: 56 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, boxHeight: 12, usePointStyle: true, pointStyle: 'circle', color: '#6B8099', font: { family: 'Inter' } } },
          tooltip: { callbacks: { label: function (c) { return c.dataset.label + ': ' + money.format(c.parsed.y); } }, backgroundColor: '#0C0634', padding: 12, cornerRadius: 10 }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B8099', font: { family: 'Inter' } } },
          y: { grid: { color: CHART_COLORS.line }, ticks: { color: '#6B8099', callback: function (v) { return '$' + num.format(v / 1000) + 'k'; } } }
        }
      }
    });
    return canvas._chart;
  }

  /* ------------------------------------------------------------- repayment calc */
  function initRepayment(root) {
    root = root || document;
    var box = $('[data-calc="repayment"]', root);
    if (!box) return;

    var priceR = $('#priceRange', box), priceT = $('#priceText', box);
    var depR = $('#depositRange', box), depT = $('#depositText', box);
    var rateR = $('#rateRange', box), rateT = $('#rateText', box);
    var termR = $('#termRange', box), termT = $('#termText', box);
    var tableBody = $('#amortBody', box);
    var tableToggle = $('#amortToggle', box);
    var tableWrap = $('#amortWrap', box);

    function render() {
      var price = parseNum(priceR.value);
      var deposit = Math.min(parseNum(depR.value), price);
      if (parseNum(depR.value) > price) { depR.value = price; depT.value = num.format(price); }

      var loan = Math.max(0, price - deposit);
      var lvr = price > 0 ? (loan / price) * 100 : 0;
      var rate = parseNum(rateR.value);
      var years = parseNum(termR.value);
      var freq = radioValue('freq', box) || 'fortnightly';
      var pp = FREQ[freq];

      var res = schedule(loan, rate, years, pp);

      setText('#outPayment', money2.format(res.payment), box);
      setText('#outFreq', FREQ_LABEL[freq], box);
      setText('#outLoan', money.format(loan), box);
      setText('#outLvr', lvr.toFixed(1) + '%', box);
      setText('#outInterest', money.format(res.totalInterest), box);
      setText('#outTotal', money.format(res.totalRepaid), box);
      setText('#outPeriods', num.format(res.periods) + ' payments', box);
      setText('#depositPct', (price > 0 ? (deposit / price * 100).toFixed(1) : '0') + '% deposit', box);

      var lvrNote = $('#lvrNote', box);
      if (lvrNote) {
        if (lvr > 80) {
          lvrNote.textContent = 'Above 80% LVR - low-equity margins or Kainga Ora / First Home Loan options may apply. We can help.';
          lvrNote.hidden = false;
        } else { lvrNote.hidden = true; }
      }

      doughnut($('#chartSplit', box), loan, res.totalInterest);
      setText('#legendPrincipal', money.format(loan), box);
      setText('#legendInterest', money.format(res.totalInterest), box);

      if (tableBody) {
        tableBody.innerHTML = res.rows.map(function (r) {
          return '<tr><td>Year ' + r.year + '</td><td>' + money.format(r.principal) + '</td><td>' +
            money.format(r.interest) + '</td><td>' + money.format(r.balance) + '</td></tr>';
        }).join('');
      }
    }

    link(priceR, priceT, render);
    link(depR, depT, render);
    link(rateR, rateT, render, function (v) { return v.toFixed(2); });
    link(termR, termT, render, function (v) { return String(Math.round(v)); });
    $$('input[name="freq"]', box).forEach(function (el) { el.addEventListener('change', render); });

    if (tableToggle && tableWrap) {
      tableToggle.addEventListener('click', function () {
        var open = tableToggle.getAttribute('aria-expanded') === 'true';
        tableToggle.setAttribute('aria-expanded', String(!open));
        tableWrap.hidden = open;
        tableToggle.querySelector('span').textContent = open ? 'Show amortisation table' : 'Hide amortisation table';
      });
    }

    render();
  }

  /* ------------------------------------------------------------- refinance calc */
  function initRefinance(root) {
    root = root || document;
    var box = $('[data-calc="refinance"]', root);
    if (!box) return;

    var balR = $('#rfBalanceRange', box), balT = $('#rfBalanceText', box);
    var curR = $('#rfCurrentRange', box), curT = $('#rfCurrentText', box);
    var termR = $('#rfTermRange', box), termT = $('#rfTermText', box);
    var newR = $('#rfNewRange', box), newT = $('#rfNewText', box);
    var feeR = $('#rfFeeRange', box), feeT = $('#rfFeeText', box);

    function render() {
      var bal = parseNum(balR.value);
      var years = parseNum(termR.value);
      var oldRate = parseNum(curR.value);
      var newRate = parseNum(newR.value);
      var fees = parseNum(feeR.value);

      var oldRes = schedule(bal, oldRate, years, 12);
      var newRes = schedule(bal, newRate, years, 12);

      var monthlySaving = oldRes.payment - newRes.payment;
      var annualSaving = monthlySaving * 12;
      var lifetimeSaving = (oldRes.totalRepaid - newRes.totalRepaid) - fees;
      var breakEven = monthlySaving > 0 ? fees / monthlySaving : Infinity;

      setText('#rfOldPay', money2.format(oldRes.payment), box);
      setText('#rfNewPay', money2.format(newRes.payment), box);
      setText('#rfMonthly', money2.format(Math.max(0, monthlySaving)), box);
      setText('#rfAnnual', money.format(Math.max(0, annualSaving)), box);
      setText('#rfLifetime', money.format(Math.max(0, lifetimeSaving)), box);
      setText('#rfInterestSaved', money.format(Math.max(0, oldRes.totalInterest - newRes.totalInterest)), box);
      setText('#rfBreakEven', isFinite(breakEven) && breakEven > 0
        ? Math.ceil(breakEven) + (Math.ceil(breakEven) === 1 ? ' month' : ' months')
        : (fees === 0 ? 'Immediate' : 'No saving at this rate'), box);

      var verdict = $('#rfVerdict', box);
      if (verdict) {
        if (monthlySaving <= 0) {
          verdict.textContent = 'Your current rate is already lower. Talk to us about restructuring instead of switching.';
          verdict.className = 'disclaimer';
        } else {
          verdict.textContent = 'Switching could put ' + money.format(annualSaving) + ' a year back in your pocket. Cash-back offers from lenders may improve this further.';
          verdict.className = 'nudge';
        }
      }

      barChart($('#rfChart', box),
        ['Total interest', 'Total repaid'],
        [oldRes.totalInterest, oldRes.totalRepaid],
        [newRes.totalInterest, newRes.totalRepaid + fees]);
    }

    link(balR, balT, render);
    link(curR, curT, render, function (v) { return v.toFixed(2); });
    link(termR, termT, render, function (v) { return String(Math.round(v)); });
    link(newR, newT, render, function (v) { return v.toFixed(2); });
    link(feeR, feeT, render);
    render();
  }

  /* ------------------------------------------------------------- amortisation calc */
  function initAmortisation(root) {
    root = root || document;
    var box = $('[data-calc="amortisation"]', root);
    if (!box) return;

    var amtR = $('#amAmountRange', box), amtT = $('#amAmountText', box);
    var rateR = $('#amRateRange', box), rateT = $('#amRateText', box);
    var termR = $('#amTermRange', box), termT = $('#amTermText', box);
    var body = $('#amBody', box);

    function render() {
      var amount = parseNum(amtR.value);
      var rate = parseNum(rateR.value);
      var years = parseNum(termR.value);
      var res = schedule(amount, rate, years, 12);

      setText('#amPayment', money2.format(res.payment), box);
      setText('#amInterest', money.format(res.totalInterest), box);
      setText('#amTotal', money.format(res.totalRepaid), box);
      setText('#amRatio', (res.totalInterest / amount * 100).toFixed(0) + '%', box);

      var cumP = 0, cumI = 0;
      body.innerHTML = res.rows.map(function (r) {
        cumP += r.principal; cumI += r.interest;
        return '<tr><td>Year ' + r.year + '</td><td>' + money.format(r.principal) + '</td><td>' +
          money.format(r.interest) + '</td><td>' + money.format(cumI) + '</td><td>' + money.format(r.balance) + '</td></tr>';
      }).join('');

      lineChart($('#amChart', box),
        [0].concat(res.rows.map(function (r) { return r.year; })),
        [amount].concat(res.rows.map(function (r) { return r.balance; })));
    }

    link(amtR, amtT, render);
    link(rateR, rateT, render, function (v) { return v.toFixed(2); });
    link(termR, termT, render, function (v) { return String(Math.round(v)); });
    render();
  }

  w.KFSCalc = {
    payment: payment,
    schedule: schedule,
    money: money,
    money2: money2,
    parseNum: parseNum,
    init: function () {
      initRepayment();
      initRefinance();
      initAmortisation();
    }
  };

  document.addEventListener('kfs:ready', function () { w.KFSCalc.init(); });
})(window);

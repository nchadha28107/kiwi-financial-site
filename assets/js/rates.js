/* ==========================================================================
   Live lender rates - shared loader, ticker, table and calculator wiring.
   Tries /api/rates first, falls back to the static data/rates.json so the
   site keeps working on plain static hosting.
   ========================================================================== */
(function (w) {
  'use strict';

  var R = document.documentElement.getAttribute('data-root') || '';
  var DAY = 24 * 60 * 60 * 1000;
  var TERMS = [
    { key: 'floating', label: 'Floating' },
    { key: 'fixed_6m', label: '6 months' },
    { key: 'fixed_1y', label: '1 year' },
    { key: 'fixed_2y', label: '2 years' },
    { key: 'fixed_3y', label: '3 years' },
    { key: 'fixed_5y', label: '5 years' }
  ];

  var state = { data: null, error: false };
  var listeners = [];

  function onReady(fn) {
    listeners.push(fn);
    if (state.data || state.error) fn(state);
  }

  function emit() { listeners.forEach(function (fn) { fn(state); }); }

  /* ---------------------------------------------------------------- load */
  var lenderIndex = {};

  function normalise(json) {
    var rows = json.lenders || json.rates || [];
    var age = (Date.now() - new Date(json.last_updated).getTime()) / DAY;
    return {
      lastUpdated: new Date(json.last_updated),
      ageDays: Math.floor(age),
      stale: json.stale != null ? json.stale : age > 7,
      rows: rows.map(function (r) {
        var meta = lenderIndex[r.slug] || {};
        return {
          bank: r.bank, slug: r.slug,
          logo: meta.logo ? R + meta.logo : R + 'assets/logos/' + r.slug + '.svg',
          invert: !!meta.invert,
          floating: r.floating, fixed_6m: r.fixed_6m, fixed_1y: r.fixed_1y,
          fixed_2y: r.fixed_2y, fixed_3y: r.fixed_3y, fixed_5y: r.fixed_5y,
          cashPct: r.cash_contribution_pct || 0,
          minEquity: r.min_equity_pct != null ? r.min_equity_pct : 20
        };
      })
    };
  }

  function fetchFirst(urls) {
    var i = 0;
    return new Promise(function (resolve, reject) {
      (function next() {
        if (i >= urls.length) { reject(new Error('all_sources_failed')); return; }
        fetch(urls[i++], { cache: 'no-cache' })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(resolve)
          .catch(next);
      })();
    });
  }

  function load() {
    // Logo paths come from the lender manifest because the official assets are a
    // mix of .svg, .png and .jpg - the slug alone is not enough.
    fetch(R + 'data/lenders.json')
      .then(function (r) { return r.json(); })
      .catch(function () { return []; })
      .then(function (lenders) {
        lenders.forEach(function (l) { lenderIndex[l.slug] = l; });
        return fetchFirst([R + 'api/rates', R + 'data/rates.json']);
      })
      .then(function (json) { state.data = normalise(json); emit(); })
      .catch(function () { state.error = true; emit(); });
  }

  /* ---------------------------------------------------------------- ranking */
  /**
   * "Market low" = the lowest advertised rate for that term across every lender
   * that publishes one. Nulls are ignored and ties are all flagged. That is the
   * only criterion - it deliberately says nothing about which deal is best for
   * a given borrower, because fees, cash contributions and equity bands change
   * the answer. See bestValue() for a cost-based ranking.
   */
  function marketLow(rows, key) {
    return rows.reduce(function (a, r) {
      if (r[key] == null) return a;
      return (!a || r[key] < a[key]) ? r : a;
    }, null);
  }

  /**
   * Total cost of a term, net of the lender's cash contribution:
   *   interest paid over the fixed period  -  cash contribution
   * Interest-only approximation is deliberate: it keeps lenders comparable
   * without assuming a repayment structure the borrower has not chosen yet.
   */
  function bestValue(rows, key, loan, years) {
    return rows
      .filter(function (r) { return r[key] != null; })
      .map(function (r) {
        var interest = loan * (r[key] / 100) * years;
        var cash = loan * (r.cashPct / 100);
        return { row: r, rate: r[key], interest: interest, cash: cash, net: interest - cash };
      })
      .sort(function (a, b) { return a.net - b.net; });
  }

  var best = marketLow;
  w.KFSRates = {
    onReady: onReady,
    terms: TERMS,
    best: marketLow,
    marketLow: marketLow,
    bestValue: bestValue,
    get data() { return state.data; }
  };

  function fmt(v) { return v == null ? '\u2014' : v.toFixed(2) + '%'; }

  /** Trims country qualifiers so names fit the narrow hero rows. */
  function shortName(name) {
    return String(name)
      .replace(/^The\s+/i, '')
      .replace(/\s+(New Zealand|NZ)$/i, '');
  }

  function stamp(d, stale, ageDays) {
    var txt = d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });
    return stale
      ? '<span class="rate-stale" title="Rates have not been refreshed for ' + ageDays + ' days">&#9888; Using recent data &middot; ' + txt + '</span>'
      : 'Last updated <time datetime="' + d.toISOString().slice(0, 10) + '">' + txt + '</time>';
  }

  function logoTile(row, cls) {
    return '<img class="' + cls + (row.invert ? ' is-inverted' : '') + '" src="' + row.logo +
      '" width="120" height="48" loading="lazy" alt="' + row.bank + ' \u2014 NZ home loan rates">';
  }

  /* ---------------------------------------------------------------- ticker */
  function skeleton(n, markup) {
    var out = '';
    for (var i = 0; i < n; i++) out += markup;
    return out;
  }

  function renderTicker(host, st) {
    if (st.error) {
      host.innerHTML = '<div class="rate-error">Rates temporarily unavailable &mdash; ' +
        '<a href="tel:+64273030000">call 027 303 0000</a> for today\u2019s best rates.</div>';
      return;
    }
    var rows = st.data.rows.slice().sort(function (a, b) { return (a.fixed_1y || 99) - (b.fixed_1y || 99); });
    var chips = rows.map(function (r) {
      return '<div class="rate-chip">' + logoTile(r, 'rate-chip__logo') +
        '<span><b>' + r.bank + '</b><small>1 yr fixed special</small></span>' +
        '<span class="val">' + fmt(r.fixed_1y) + '</span></div>';
    }).join('');
    host.innerHTML = '<div class="ticker__track">' + chips + chips + '</div>';
  }

  function initStamp() {
    var meta = document.getElementById('rateStamp');
    if (!meta) return;
    onReady(function (st) {
      meta.innerHTML = st.error ? '' : stamp(st.data.lastUpdated, st.data.stale, st.data.ageDays);
    });
  }

  function initTicker() {
    var host = document.getElementById('rateTicker');
    if (!host) return;
    host.innerHTML = '<div class="ticker__track">' +
      skeleton(6, '<div class="rate-chip is-skeleton"><span class="sk sk--logo"></span><span class="sk sk--text"></span><span class="sk sk--val"></span></div>') +
      '</div>';

    onReady(function (st) { renderTicker(host, st); });
  }

  /* ---------------------------------------------------------------- table */
  function initTable() {
    var host = document.getElementById('ratesTable');
    if (!host) return;

    host.innerHTML = '<div class="table-wrap"><table class="amort rates-table"><tbody>' +
      skeleton(6, '<tr><td colspan="7"><span class="sk sk--row"></span></td></tr>') +
      '</tbody></table></div>';

    onReady(function (st) {
      if (st.error) {
        host.innerHTML = '<div class="rate-error">Rates temporarily unavailable &mdash; ' +
          '<a href="tel:+64273030000">call 027 303 0000</a> for today\u2019s best rates.</div>';
        return;
      }
      var cols = TERMS;
      var lowByCol = {};
      cols.forEach(function (c) { var b = marketLow(st.data.rows, c.key); if (b) lowByCol[c.key] = b[c.key]; });

      host.innerHTML = '<div class="table-wrap"><table class="amort rates-table">' +
        '<caption class="sr-only">Indicative advertised home loan rates by lender. ' +
        'Cells marked as the market low are the lowest advertised rate for that term.</caption>' +
        '<thead><tr><th scope="col">Lender</th>' +
        cols.map(function (c) { return '<th scope="col">' + c.label + '</th>'; }).join('') +
        '<th scope="col">Cash back</th><th scope="col">Min equity</th>' +
        '</tr></thead><tbody>' +
        st.data.rows.map(function (r) {
          return '<tr><td class="rates-table__bank">' + logoTile(r, 'rates-table__logo') +
            '<span>' + r.bank + '</span></td>' +
            cols.map(function (c) {
              var low = r[c.key] != null && r[c.key] === lowByCol[c.key];
              return '<td' + (low ? ' class="is-best"' : '') + '>' +
                (low ? '<span class="sr-only">Market low for ' + c.label + ': </span>' : '') +
                fmt(r[c.key]) + '</td>';
            }).join('') +
            '<td>' + (r.cashPct ? r.cashPct.toFixed(2) + '%' : '\u2014') + '</td>' +
            '<td>' + r.minEquity + '%</td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<p class="rates-legend"><span class="rates-legend__key">Market low</span>' +
        'The lowest advertised rate for that term across the lenders we compare. Ties are all marked. ' +
        'It is based on the published rate only \u2014 it does not account for cash contributions, fees, ' +
        'your equity band or loan structure, which routinely change which lender is actually cheapest.</p>' +
        '<p class="rates-legend"><span class="rates-legend__key">&mdash;</span>' +
        'That lender does not advertise a rate for this term on the product shown. It is not a high rate, ' +
        'it is no rate &mdash; Heartland, for example, publishes floating only.</p>';
    });
  }

  /* ---------------------------------------------------------------- best value */
  function initBestValue() {
    var host = document.getElementById('bestValue');
    if (!host) return;

    var loanEl = document.getElementById('bvLoan');
    var termEl = document.getElementById('bvTerm');

    onReady(function (st) {
      if (st.error) { host.innerHTML = ''; return; }

      termEl.innerHTML = TERMS.filter(function (t) { return t.key !== 'floating'; })
        .map(function (t) {
          return '<option value="' + t.key + '"' + (t.key === 'fixed_2y' ? ' selected' : '') + '>' + t.label + '</option>';
        }).join('');

      function years(key) {
        return { fixed_6m: 0.5, fixed_1y: 1, fixed_2y: 2, fixed_3y: 3, fixed_5y: 5 }[key] || 1;
      }

      function render() {
        var loan = Math.max(50000, Math.min(5000000, parseNum(loanEl.value)));
        var key = termEl.value;
        var yrs = years(key);
        var ranked = bestValue(st.data.rows, key, loan, yrs);
        if (!ranked.length) { host.innerHTML = ''; return; }

        var cheapestRate = ranked.slice().sort(function (a, b) { return a.rate - b.rate; })[0];
        var winner = ranked[0];

        host.innerHTML =
          '<div class="table-wrap"><table class="amort rates-table">' +
          '<caption class="sr-only">Lenders ranked by total cost over the fixed period after cash contribution</caption>' +
          '<thead><tr><th scope="col">#</th><th scope="col">Lender</th><th scope="col">Rate</th>' +
          '<th scope="col">Interest over ' + termEl.options[termEl.selectedIndex].text.toLowerCase() + '</th>' +
          '<th scope="col">Cash back</th><th scope="col">Net cost</th></tr></thead><tbody>' +
          ranked.slice(0, 6).map(function (x, i) {
            return '<tr' + (i === 0 ? ' class="is-winner"' : '') + '><td>' + (i + 1) + '</td>' +
              '<td class="rates-table__bank">' + logoTile(x.row, 'rates-table__logo') + '<span>' + x.row.bank + '</span></td>' +
              '<td>' + fmt(x.rate) + '</td><td>' + money(x.interest) + '</td>' +
              '<td>' + (x.cash ? '&minus;' + money(x.cash) : '\u2014') + '</td>' +
              '<td><b>' + money(x.net) + '</b></td></tr>';
          }).join('') + '</tbody></table></div>' +
          (winner.row.slug !== cheapestRate.row.slug
            ? '<p class="nudge" style="margin-top:16px">On a ' + money(loan) + ' loan, <b>' + winner.row.bank +
              '</b> works out cheaper over this term than <b>' + cheapestRate.row.bank +
              '</b> despite a higher rate, because of the cash contribution. This is exactly why the lowest ' +
              'advertised rate is not always the best deal.</p>'
            : '<p class="disclaimer" style="margin-top:16px">On a ' + money(loan) + ' loan the lowest advertised ' +
              'rate also happens to be the cheapest overall for this term.</p>');
      }

      loanEl.addEventListener('input', render);
      termEl.addEventListener('change', render);
      render();
    });
  }

  function money(n) { return '$' + Math.round(n).toLocaleString('en-NZ'); }
  function parseNum(v) { var n = parseFloat(String(v).replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; }

  /* ---------------------------------------------------------------- calculator wiring */
  function initRatePicker() {
    var picker = document.getElementById('ratePicker');
    if (!picker) return;

    picker.innerHTML = TERMS.map(function (t) {
      return '<option value="' + t.key + '"' + (t.key === 'fixed_1y' ? ' selected' : '') + '>' + t.label + '</option>';
    }).join('');

    onReady(function (st) {
      if (st.error || !st.data) {
        picker.disabled = true;
        return;
      }
      var apply = function () {
        var b = best(st.data.rows, picker.value);
        if (!b) return;
        var text = document.getElementById('rateText');
        var range = document.getElementById('rateRange');
        if (!text || !range) return;
        range.value = b[picker.value];
        text.value = b[picker.value].toFixed(2);
        range.dispatchEvent(new Event('input', { bubbles: true }));
        var note = document.getElementById('rateSource');
        if (note) note.textContent = 'Best ' + picker.options[picker.selectedIndex].text.toLowerCase() +
          ' \u2014 ' + b.bank + ' at ' + b[picker.value].toFixed(2) + '%';
      };
      picker.addEventListener('change', apply);
      apply();
    });
  }

  /* ---------------------------------------------------------------- hero panel */
  function initHeroPanel() {
    var list = document.getElementById('heroRatesList');
    if (!list) return;

    onReady(function (st) {
      var stampEl = document.getElementById('heroRatesStamp');
      if (st.error) {
        list.innerHTML = '<li class="hero-rates__row"><span class="hero-rates__err">Rates unavailable &mdash; ' +
          '<a href="tel:+64273030000">call us</a> for today\u2019s best.</span></li>';
        if (stampEl) stampEl.textContent = '';
        return;
      }

      var rows = st.data.rows.filter(function (r) { return r.fixed_1y != null; })
        .sort(function (a, b) { return a.fixed_1y - b.fixed_1y; });
      var top = rows.slice(0, 3);

      list.innerHTML = top.map(function (r, i) {
        return '<li class="hero-rates__row">' +
          '<span class="hero-rates__chip"><img class="hero-rates__logo' + (r.invert ? ' is-inverted' : '') +
          '" src="' + r.logo + '" width="120" height="48" alt="' + r.bank + ' \u2014 NZ home loan rates"></span>' +
          '<span class="hero-rates__meta">' +
          '<b class="hero-rates__bank">' + shortName(r.bank) + '</b>' +
          '<span class="hero-rates__term">1 yr fixed special</span></span>' +
          '<b class="hero-rates__val' + (i === 0 ? ' is-best' : '') + '">' + fmt(r.fixed_1y) + '</b></li>';
      }).join('');

      if (stampEl) {
        stampEl.textContent = st.data.stale
          ? 'Updated ' + st.data.ageDays + 'd ago'
          : 'Updated ' + st.data.lastUpdated.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });
      }

      // Difference between the sharpest and the dearest 1-year rate, on a $750k loan.
      var spread = rows[rows.length - 1].fixed_1y - rows[0].fixed_1y;
      var saving = Math.round(750000 * spread / 100);
      var label = document.getElementById('heroSaveLabel');
      var out = document.getElementById('heroSpread');
      if (out && saving > 0) {
        if (label) label.textContent = 'Gap between best and worst on a $750,000 loan';
        out.innerHTML = '$' + saving.toLocaleString('en-NZ') + '<span> / year</span>';
      } else if (out) {
        out.innerHTML = '';
      }
    });
  }

  document.addEventListener('kfs:ready', function () {
    initStamp();
    initTicker();
    initHeroPanel();
    initTable();
    initBestValue();
    initRatePicker();
    load();
  });
})(window);

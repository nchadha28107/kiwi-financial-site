/* Internal lead dashboard. The token is only a convenience gate - the server
   validates it and the route should also sit behind host-level access control. */
document.addEventListener('kfs:ready', function () {
  var gate = document.getElementById('gate');
  var board = document.getElementById('board');
  if (!gate) return;

  var KEY = 'kfs_admin_token';
  var nf = new Intl.NumberFormat('en-NZ');
  var money = function (n) { return n ? '$' + nf.format(n) : '\u2013'; };

  function fetchData(token) {
    return fetch('../api/analytics', { headers: { 'x-kfs-admin-token': token } })
      .then(function (r) {
        if (r.status === 401) throw new Error('unauthorised');
        if (!r.ok) throw new Error('no_backend');
        return r.json();
      })
      .catch(function (err) {
        // Static hosting (e.g. GitHub Pages) has no serverless runtime at all.
        if (err.message === 'unauthorised') throw err;
        throw new Error('no_backend');
      });
  }

  function text(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

  function chart(id, cfg) {
    var el = document.getElementById(id);
    if (!el || typeof Chart === 'undefined') return;
    if (el._c) el._c.destroy();
    el._c = new Chart(el, cfg);
  }

  var FONT = { family: 'Inter' };
  var PALETTE = ['#00B89C', '#1A3C5E', '#FF6B35', '#6B8099', '#FF4948', '#4fe3cb', '#b45309'];

  function render(d) {
    document.getElementById('notConfigured').hidden = d.configured !== false;
    text('boardMeta', 'Refreshed ' + new Date().toLocaleString('en-NZ'));

    text('wkApps', d.week.applications || 0);
    text('wkGoal', d.week.topGoal || '\u2013');
    text('moApps', d.month.applications || 0);
    text('moGoal', d.month.topGoal || '\u2013');
    text('moAvg', money(d.month.avgLoan));
    text('allApps', d.all.applications || 0);
    text('allAvg', money(d.all.avgLoan));
    text('allGoal', d.all.topGoal || '\u2013');

    chart('chartDaily', {
      type: 'line',
      data: {
        labels: (d.daily || []).map(function (x) { return x.date.slice(5); }),
        datasets: [{
          data: (d.daily || []).map(function (x) { return x.count; }),
          borderColor: '#00B89C', backgroundColor: 'rgba(0,184,156,.16)',
          borderWidth: 3, fill: true, tension: .35, pointRadius: 0, pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B8099', font: FONT, maxTicksLimit: 8, maxRotation: 0 } },
          y: { beginAtZero: true, ticks: { precision: 0, color: '#6B8099', font: FONT }, grid: { color: '#E3EBF3' } }
        }
      }
    });

    var goals = Object.entries(d.goals || {});
    chart('chartGoals', {
      type: 'doughnut',
      data: {
        labels: goals.map(function (g) { return g[0]; }),
        datasets: [{ data: goals.map(function (g) { return g[1]; }), backgroundColor: PALETTE, borderColor: '#fff', borderWidth: 3 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '58%',
        plugins: { legend: { position: 'bottom', labels: { color: '#6B8099', font: FONT, boxWidth: 12, usePointStyle: true, pointStyle: 'circle' } } }
      }
    });

    var src = Object.entries(d.sources || {});
    chart('chartSources', {
      type: 'bar',
      data: {
        labels: src.map(function (s) { return s[0]; }),
        datasets: [{ data: src.map(function (s) { return s[1]; }), backgroundColor: '#1A3C5E', borderRadius: 8, maxBarThickness: 44 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B8099', font: FONT } },
          y: { beginAtZero: true, ticks: { precision: 0, color: '#6B8099', font: FONT }, grid: { color: '#E3EBF3' } }
        }
      }
    });

    var f = d.funnel || {};
    chart('chartFunnel', {
      type: 'bar',
      data: {
        labels: ['Started', 'Step 2', 'Step 3', 'Submitted'],
        datasets: [{
          data: [f.started || 0, f.step2 || 0, f.step3 || 0, f.submitted || 0],
          backgroundColor: ['#6B8099', '#1A3C5E', '#FF6B35', '#00B89C'], borderRadius: 8, maxBarThickness: 48
        }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { precision: 0, color: '#6B8099', font: FONT }, grid: { color: '#E3EBF3' } },
          y: { grid: { display: false }, ticks: { color: '#6B8099', font: FONT } }
        }
      }
    });

    var rows = d.leads || [];
    document.getElementById('leadRows').innerHTML = rows.length
      ? rows.map(function (r) {
          var cell = function (v) { return String(v == null ? '\u2013' : v).replace(/[<>]/g, ''); };
          return '<tr><td>' + cell(String(r.timestamp).slice(0, 16).replace('T', ' ')) + '</td><td>' + cell(r.name) +
            '</td><td><a href="tel:' + cell(r.phone).replace(/\s/g, '') + '">' + cell(r.phone) + '</a></td><td>' +
            cell(r.goal) + '</td><td>' + cell(r.loan_amount) + '</td><td>' + cell(r.lvr) + '</td><td>' +
            cell(r.utm_source) + '</td></tr>';
        }).join('')
      : '<tr><td colspan="7">No leads yet.</td></tr>';
  }

  function unlock(token) {
    return fetchData(token).then(function (d) {
      sessionStorage.setItem(KEY, token);
      gate.hidden = true;
      board.hidden = false;
      document.getElementById('signOut').hidden = false;
      render(d);
    });
  }

  document.getElementById('gateForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = document.getElementById('token');
    unlock(input.value.trim()).catch(function (err) {
      var field = input.closest('.field');
      var msg = field.querySelector('.err');
      if (err.message === 'no_backend') {
        msg.textContent = 'No analytics backend is reachable. This dashboard needs /api/analytics deployed ' +
          '(it does not run on static hosting such as GitHub Pages).';
      } else {
        msg.textContent = 'That token was not accepted.';
      }
      field.classList.add('invalid');
      input.focus();
    });
  });

  document.getElementById('signOut').addEventListener('click', function () {
    sessionStorage.removeItem(KEY);
    location.reload();
  });

  var saved = sessionStorage.getItem(KEY);
  if (saved) unlock(saved).catch(function () { sessionStorage.removeItem(KEY); });
});

/* Home page content modules (services grid, lender marquee, why-us list). */
document.addEventListener('kfs:ready', function () {
  var I = window.KFS_ICONS;
  var R = document.documentElement.getAttribute('data-root') || '';

  /* ---------------------------------------------------- services grid */
  var grid = document.getElementById('servicesGrid');
  if (grid) {
    grid.innerHTML = window.KFS_SERVICES.map(function (s, i) {
      return '<article class="card" data-reveal="' + (i % 3) * 90 + '">' +
        '<div class="card__icon">' + I[s.icon] + '</div>' +
        '<h3>' + s.name + '</h3><p>' + s.blurb + '</p>' +
        '<a class="link-arrow" href="services/' + s.slug + '.html">Learn more' + I.arrow + '</a>' +
        '</article>';
    }).join('');
  }

  /* ---------------------------------------------------- lender marquee */
  var lt = document.getElementById('lenderTrack');
  if (lt) {
    fetch(R + 'data/lenders.json')
      .then(function (r) { return r.json(); })
      .then(function (lenders) {
        var items = lenders.map(function (l) {
          return '<div class="lender"><img src="' + R + l.logo + '" width="120" height="48" loading="lazy"' +
            (l.invert ? ' class="is-inverted"' : '') +
            ' alt="' + l.name + ' \u2014 NZ home loan rates"></div>';
        }).join('');
        lt.innerHTML = items + items; // duplicated so the -50% keyframe loops seamlessly
        enableDragScroll(document.getElementById('lenderMarquee'));
      })
      .catch(function () {
        var items = window.KFS_LENDERS.map(function (n) { return '<div class="lender">' + n + '</div>'; }).join('');
        lt.innerHTML = items + items;
      });
  }

  /* Touch/drag panning pauses the auto-scroll while the user is in control. */
  function enableDragScroll(el) {
    if (!el) return;
    var down = false, startX = 0, startLeft = 0;
    el.addEventListener('pointerdown', function (e) {
      down = true; startX = e.clientX; startLeft = el.scrollLeft;
      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (!down) return;
      el.scrollLeft = startLeft - (e.clientX - startX);
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      el.addEventListener(ev, function () { down = false; el.classList.remove('is-dragging'); });
    });
  }

  /* ---------------------------------------------------- why-us list */
  var why = document.getElementById('whyList');
  if (why) {
    var POINTS = [
      ['We are not owned by a bank', 'No lending targets, no in-house product to push. We recommend what fits you.'],
      ['One application, every lender', 'We do the shopping around so your credit file is not hit repeatedly.'],
      ['Jargon-free, in plain English', 'You will always understand what you are signing and why.'],
      ['You pay us nothing', 'We are paid by the lender you choose, and we disclose exactly how.']
    ];
    why.innerHTML = POINTS.map(function (p) {
      return '<li><span class="tick">' + I.check + '</span><span><b>' + p[0] + '</b><span>' + p[1] + '</span></span></li>';
    }).join('');
  }

  /* newly injected nodes still need reveal + tick treatment */
  document.querySelectorAll('[data-reveal]:not(.in)').forEach(function (el) {
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return; }
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      setTimeout(function () { en.target.classList.add('in'); }, parseInt(en.target.getAttribute('data-reveal'), 10) || 0);
      io.unobserve(en.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px' });
  document.querySelectorAll('[data-reveal]:not(.in)').forEach(function (el) { io.observe(el); });
});

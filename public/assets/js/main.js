/* JNUS — site interactions & motion
   Depends on: gsap, ScrollTrigger, Lenis (all optional; site degrades gracefully). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  if (/[?&]nomotion\b/.test(location.search)) html.classList.add('reduced');
  if (/[?&]shot\b/.test(location.search)) { // QA helper: freeze viewport-height sections for full-page captures
    var st = document.createElement('style');
    st.textContent = '.lg\\:h-screen{height:900px!important}.lg\\:h-\\[92vh\\]{height:830px!important}.h-\\[62vh\\]{height:560px!important}.min-h-screen{min-height:900px!important}.min-h-\\[88vh\\]{min-height:780px!important}.min-h-\\[70vh\\]{min-height:620px!important}';
    document.head.appendChild(st);
  }
  var reduced = html.classList.contains('reduced');
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var motion = !!(gsap && ST) && !reduced;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  window.JN_READY = true;
  if (motion) gsap.registerPlugin(ST); else html.classList.add('reduced');

  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------------- Icons ---------------- */
  function renderIcons(root) {
    var icons = window.JN_ICONS || {}, ns = 'http://www.w3.org/2000/svg';
    $$('i[data-icon]', root).forEach(function (el) {
      var def = icons[el.getAttribute('data-icon')];
      if (!def) return;
      var svg = d.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', el.getAttribute('data-stroke') || '2');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.setAttribute('class', el.getAttribute('class') || '');
      def.forEach(function (node) {
        var c = d.createElementNS(ns, node[0]);
        Object.keys(node[1]).forEach(function (k) { if (k !== 'key') c.setAttribute(k, node[1][k]); });
        svg.appendChild(c);
      });
      el.parentNode.replaceChild(svg, el);
    });
  }
  renderIcons(d);

  /* ---------------- Smooth scroll ---------------- */
  var lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function headerOffset() { return -(($('#site-header') || {}).offsetHeight || 80) - 12; }
  function scrollToTarget(target, immediate) {
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: headerOffset(), immediate: !!immediate, duration: 1.4 });
    else {
      var top = (typeof target === 'number') ? target : target.getBoundingClientRect().top + window.pageYOffset + headerOffset();
      window.scrollTo({ top: top, behavior: immediate || reduced ? 'auto' : 'smooth' });
    }
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]');
    if (!a) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
    var t = d.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!t) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(t);
    history.pushState(null, '', url.hash);
  });
  $$('[data-to-top]').forEach(function (b) { b.addEventListener('click', function () { scrollToTarget(0); }); });

  /* ---------------- Header & progress ---------------- */
  var header = $('#site-header'), progress = $('#scroll-progress'), lastY = 0, menuOpen = false;
  if (header && body.getAttribute('data-theme') === 'dark') header.classList.add('on-dark');
  function onScroll() {
    var y = window.pageYOffset || html.scrollTop;
    if (header) {
      header.classList.toggle('is-scrolled', y > 40);
      if (y > lastY && y > 320 && !menuOpen) header.classList.add('is-hidden');
      else if (y < lastY - 4) header.classList.remove('is-hidden');
    }
    if (progress) {
      var max = html.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    }
    lastY = y;
  }
  if (lenis) lenis.on('scroll', onScroll); else window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile menu ---------------- */
  var menu = $('#mobile-menu'), openBtn = $('[data-menu-open]');
  $$('#mobile-menu .m-link').forEach(function (l, i) { l.style.transitionDelay = (0.25 + i * 0.05) + 's'; });
  function openMenu() {
    if (!menu) return;
    menuOpen = true; menu.classList.add('is-open');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    if (lenis) lenis.stop(); else body.style.overflow = 'hidden';
    setTimeout(function () { var c = $('[data-menu-close]'); if (c) c.focus(); }, 300);
  }
  function closeMenu() {
    if (!menu || !menuOpen) return;
    menuOpen = false; menu.classList.remove('is-open');
    if (openBtn) { openBtn.setAttribute('aria-expanded', 'false'); openBtn.focus({ preventScroll: true }); }
    if (lenis) lenis.start(); else body.style.overflow = '';
  }
  if (openBtn) openBtn.addEventListener('click', openMenu);
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', closeMenu); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------------- Split text ---------------- */
  function splitWords(el) {
    if (el.getAttribute('data-split-done')) return $$('.split-word', el);
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/), frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(' ')); return; }
            var mask = d.createElement('span'); mask.className = 'split-mask';
            mask.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.12em;margin-bottom:-.12em;padding-right:.04em;margin-right:-.04em';
            var w = d.createElement('span'); w.className = 'split-word'; w.textContent = p;
            mask.appendChild(w); frag.appendChild(mask); words.push(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR' && child.tagName !== 'svg') {
          walk(child);
        }
      });
    })(el);
    el.setAttribute('data-split-done', '1');
    return words;
  }

  /* ---------------- Counters ---------------- */
  function fmt(n, dec) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  function initCounters() {
    $$('[data-count]').forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
      if (!motion) { el.textContent = pre + fmt(end, dec) + suf; return; }
      var o = { v: 0 }; el.textContent = pre + fmt(0, dec) + suf;
      onVisible([el], function () {
        gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: function () { el.textContent = pre + fmt(o.v, dec) + suf; } });
      });
    });
  }

  /* Fire a callback (batched, in document order) the first time elements enter the viewport.
     IntersectionObserver is independent of scroll engines, so reveals never get "stuck". */
  function onVisible(els, cb, margin) {
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { cb(els); return; }
    var queue = [], timer = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { queue.push(en.target); io.unobserve(en.target); } });
      if (queue.length && !timer) {
        timer = setTimeout(function () {
          var batch = queue.slice(); queue.length = 0; timer = null;
          batch.sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
          cb(batch);
        }, 40);
      }
    }, { rootMargin: margin || '0px 0px -8% 0px', threshold: 0 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------------- Scroll animations ---------------- */
  function initMotion() {
    // Headlines
    $$('[data-split]').forEach(function (el) {
      var words = splitWords(el);
      gsap.set(words, { yPercent: 115 });
      var play = function () { gsap.to(words, { yPercent: 0, duration: 1.25, ease: 'expo.out', stagger: 0.045, delay: parseFloat(el.getAttribute('data-delay') || 0) }); };
      if (el.hasAttribute('data-split-hero')) play(); else onVisible([el], play);
    });

    // Fade-up reveals (batched for natural stagger)
    var fades = $$('[data-reveal]:not([data-reveal="img"])');
    gsap.set(fades, { y: 48 });
    onVisible(fades, function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, overwrite: true }); });

    // Image curtain reveals
    onVisible($$('[data-reveal="img"]'), function (batch) {
      batch.forEach(function (el, i) {
        var img = $('img', el), tl = gsap.timeline({ delay: i * 0.12 });
        tl.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut' });
        if (img) tl.from(img, { scale: 1.35, duration: 1.8, ease: 'expo.out' }, 0);
      });
    });

    // Parallax
    $$('[data-parallax]').forEach(function (el) {
      var s = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      gsap.fromTo(el, { yPercent: -s * 50 }, { yPercent: s * 50, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Expanding media (hero image grows to full-bleed)
    $$('[data-expand]').forEach(function (el) {
      var img = $('img', el);
      gsap.fromTo(el, { clipPath: 'inset(0% 5% 0% 5% round 48px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'top 10%', scrub: true } });
      if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Scroll-highlighted statement text
    $$('[data-highlight]').forEach(function (el) {
      var words = splitWords(el);
      $$('.split-mask', el).forEach(function (m) { m.style.overflow = 'visible'; });
      gsap.set(words, { opacity: 0.14 });
      gsap.to(words, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    });

    // Horizontal pinned scroller (desktop)
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', function () {
      $$('[data-hscroll]').forEach(function (sec) {
        var track = $('.hscroll-track', sec);
        if (!track) return;
        var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 48); };
        gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
            onUpdate: function (self) { var bar = $('.hscroll-bar', sec); if (bar) bar.style.transform = 'scaleX(' + self.progress + ')'; } } });
      });
    });

    // Stacking cards
    $$('[data-stack]').forEach(function (wrap) {
      var cards = $$('.stack-card', wrap);
      cards.forEach(function (card, i) {
        if (i === cards.length - 1) return;
        gsap.to(card, { scale: 0.9 + i * 0.01, filter: 'brightness(0.75)', ease: 'none',
          scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true } });
      });
    });

    // Rotating spin on scroll
    $$('[data-rotate]').forEach(function (el) {
      gsap.to(el, { rotate: 180, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Line draw
    $$('[data-draw]').forEach(function (el) {
      gsap.set(el, { scaleX: 0, transformOrigin: 'left center' });
      onVisible([el], function () { gsap.to(el, { scaleX: 1, duration: 1.4, ease: 'expo.out' }); });
    });

    initCounters();

    // Magnetic buttons
    if (finePointer) {
      $$('[data-magnetic]').forEach(function (el) {
        var xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' }), yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        el.addEventListener('mousemove', function (e) { var r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.3); yTo((e.clientY - r.top - r.height / 2) * 0.4); });
        el.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
      });
      initCursor();
    }

    window.addEventListener('load', function () { ST.refresh(); });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { ST.refresh(); });
  }

  /* ---------------- Cursor ---------------- */
  function initCursor() {
    var c = $('.cursor'); if (!c) return;
    var label = $('.cursor-label', c);
    var xTo = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' }), yTo = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
    gsap.set(c, { opacity: 0 });
    window.addEventListener('mousemove', function (e) { gsap.to(c, { opacity: 1, duration: 0.3, overwrite: 'auto' }); xTo(e.clientX); yTo(e.clientY); });
    d.addEventListener('mouseleave', function () { gsap.to(c, { opacity: 0, duration: 0.3 }); });
    d.addEventListener('mouseover', function (e) {
      var v = e.target.closest('[data-cursor]');
      if (v) { c.classList.add('is-view'); c.classList.remove('is-hover'); label.textContent = v.getAttribute('data-cursor') || 'View'; return; }
      c.classList.remove('is-view');
      c.classList.toggle('is-hover', !!e.target.closest('a, button, [role="tab"], label, summary, input, select, textarea'));
    });
  }

  /* ---------------- Tabs ---------------- */
  $$('[data-tabs]').forEach(function (wrap) {
    var tabs = $$('[role="tab"]', wrap);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab, panel = d.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
        if (panel) {
          panel.hidden = !on;
          if (on && motion) gsap.fromTo(panel.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08 });
        }
      });
      if (focus) tab.focus();
      if (motion) ST.refresh();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (n) { e.preventDefault(); select(tabs[(i + n + tabs.length) % tabs.length], true); }
      });
    });
  });

  /* ---------------- Filters ---------------- */
  $$('[data-filter-group]').forEach(function (group) {
    var target = $(group.getAttribute('data-filter-group'));
    if (!target) return;
    var btns = $$('[data-filter]', group), items = $$('[data-cat]', target), empty = $('[data-filter-empty]', target.parentElement);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-filter'), shown = [];
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        items.forEach(function (it) {
          var ok = f === 'all' || (' ' + it.getAttribute('data-cat') + ' ').indexOf(' ' + f + ' ') > -1;
          it.hidden = !ok; if (ok) shown.push(it);
        });
        if (empty) empty.hidden = shown.length > 0;
        if (motion) { gsap.fromTo(shown, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05, overwrite: true }); ST.refresh(); }
      });
    });
  });

  /* ---------------- Quote slider ---------------- */
  $$('[data-slider]').forEach(function (s) {
    var slides = $$('[data-slide]', s), dots = $$('[data-dot]', s), i = 0, timer;
    if (slides.length < 2) return;
    function go(n) {
      slides[i].hidden = true; if (dots[i]) dots[i].setAttribute('aria-current', 'false');
      i = (n + slides.length) % slides.length;
      slides[i].hidden = false; if (dots[i]) dots[i].setAttribute('aria-current', 'true');
      if (motion) gsap.fromTo(slides[i], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' });
    }
    function auto() { clearInterval(timer); if (!reduced) timer = setInterval(function () { go(i + 1); }, 7000); }
    dots.forEach(function (dot, n) { dot.addEventListener('click', function () { go(n); auto(); }); });
    $$('[data-prev]', s).forEach(function (b) { b.addEventListener('click', function () { go(i - 1); auto(); }); });
    $$('[data-next]', s).forEach(function (b) { b.addEventListener('click', function () { go(i + 1); auto(); }); });
    auto();
  });

  /* ---------------- Donation widget ---------------- */
  var IMPACT = [
    [10, 'could provide a menstrual hygiene and dignity kit for a woman in the camps.'],
    [25, 'could fund a confidential psychosocial counselling session for a survivor of violence.'],
    [50, 'could cover a month of tailoring or handicraft training materials for one woman.'],
    [100, 'could help a survivor access legal aid, referrals and safe transport.'],
    [250, 'could give a woman her own sewing machine and start-up stock to earn an income.'],
    [500, 'could run a Young Women Leaders Forum session series for 25 girls and young women.'],
    [1000, 'could help sustain a Women-Friendly Space for a month — a safe place for hundreds of women.']
  ];
  function impactFor(a) { var t = IMPACT[0][1]; IMPACT.forEach(function (row) { if (a >= row[0]) t = row[1]; }); return t; }
  $$('[data-donate]').forEach(function (w) {
    var amtBtns = $$('[data-amount]', w), custom = $('[data-custom]', w), freqBtns = $$('[data-freq]', w);
    var impact = $('[data-impact]', w), sumAmt = $$('[data-sum-amount]'), sumFreq = $$('[data-sum-freq]');
    var state = { amount: 50, freq: 'once' };
    function render() {
      var a = state.amount || 0;
      if (impact) {
        impact.innerHTML = a > 0 ? '<strong class="text-brand-600">$' + fmt(a, 0) + (state.freq === 'monthly' ? '/month' : '') + '</strong> ' + impactFor(a) : 'Choose an amount to see the difference it makes.';
        if (motion) gsap.fromTo(impact, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      }
      sumAmt.forEach(function (el) { el.textContent = '$' + fmt(a, 0); });
      sumFreq.forEach(function (el) { el.textContent = state.freq === 'monthly' ? 'monthly gift' : 'one-time gift'; });
      store.set('jn-gift', JSON.stringify(state));
    }
    amtBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        state.amount = parseFloat(b.getAttribute('data-amount'));
        amtBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (custom) custom.value = '';
        render();
      });
    });
    if (custom) custom.addEventListener('input', function () {
      var v = parseFloat(custom.value.replace(/[^0-9.]/g, ''));
      amtBtns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      state.amount = isNaN(v) ? 0 : v; render();
    });
    freqBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        state.freq = b.getAttribute('data-freq');
        freqBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        render();
      });
    });
    var qp = (location.search.match(/[?&]amount=(\d+(?:\.\d+)?)/) || [])[1];
    var qf = (location.search.match(/[?&]freq=(once|monthly)/) || [])[1];
    if (qf) { var fb = freqBtns.filter(function (b) { return b.getAttribute('data-freq') === qf; })[0]; if (fb) fb.click(); }
    if (qp) {
      var match = amtBtns.filter(function (b) { return b.getAttribute('data-amount') === qp; })[0];
      if (match) match.click(); else if (custom) { custom.value = qp; custom.dispatchEvent(new Event('input')); }
    } else render();
  });

  /* ---------------- Copy to clipboard ---------------- */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var txt = b.getAttribute('data-copy'), lbl = $('[data-copy-label]', b) || b, prev = lbl.textContent;
      var done = function () { lbl.textContent = 'Copied'; b.classList.add('text-brand-600'); setTimeout(function () { lbl.textContent = prev; b.classList.remove('text-brand-600'); }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () {});
      else { var ta = d.createElement('textarea'); ta.value = txt; body.appendChild(ta); ta.select(); try { d.execCommand('copy'); done(); } catch (e) {} body.removeChild(ta); }
    });
  });

  /* ---------------- Forms (no backend: compose an email) ---------------- */
  var ORG_MAIL = 'jagonariunnayon@gmail.com';
  function mailto(subject, lines) {
    location.href = 'mailto:' + ORG_MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
  }
  function validate(form) {
    var ok = true;
    $$('[required]', form).forEach(function (f) {
      var bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.setAttribute('aria-invalid', bad ? 'true' : 'false');
      f.classList.toggle('!border-brand-500', bad);
      if (bad && ok) { f.focus(); ok = false; }
    });
    return ok;
  }
  function msg(form, text) { var m = $('.form-msg', form); if (m) m.textContent = text; }
  $$('.js-newsletter').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(f)) { msg(f, 'Please add your first name and a valid email.'); return; }
      mailto('Newsletter sign-up', ['Please add me to the JNUS newsletter.', '', 'Name: ' + f.first.value + ' ' + (f.last ? f.last.value : ''), 'Email: ' + f.email.value]);
      msg(f, 'Thank you! Your email app will open to confirm your sign-up.'); f.reset();
    });
  });
  var topic = (location.search.match(/[?&]topic=(\w+)/) || [])[1];
  if (topic) $$('select[name="subject"] option').forEach(function (o) { if (o.value.toLowerCase().indexOf(topic.toLowerCase()) === 0) o.parentNode.value = o.value; });
  $$('.js-contact').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(f)) { msg(f, 'Please complete the required fields.'); return; }
      var data = new FormData(f), lines = [];
      data.forEach(function (v, k) { if (k !== 'subject') lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ': ' + v); });
      mailto((data.get('subject') || 'Website enquiry') + ' — ' + (data.get('name') || ''), lines);
      msg(f, 'Thank you! Your email app will open with your message ready to send.');
    });
  });

  /* ---------------- Preloader & start ---------------- */
  var started = false;
  function start() {
    if (started) return; started = true;
    if (motion) initMotion(); else initCounters();
    var at = (location.search.match(/[?&]at=([\w-]+)/) || [])[1] || (location.hash && decodeURIComponent(location.hash.slice(1)));
    if (at) { var t = d.getElementById(at); if (t) setTimeout(function () { scrollToTarget(t, true); }, 60); }
  }
  var pre = $('#preloader');
  var seen = store.get('jn-pre') === '1'; store.set('jn-pre', '1');
  if (!pre) start();
  else if (!motion || seen) { pre.parentNode.removeChild(pre); start(); }
  else {
    if (lenis) lenis.stop();
    var tl = gsap.timeline({ onComplete: function () { pre.parentNode && pre.parentNode.removeChild(pre); if (lenis) lenis.start(); } });
    tl.to('.preloader-logo', { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 0.1)
      .fromTo('.preloader-text', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 0.35)
      .to('.preloader-bar span', { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0.3)
      .to(pre, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '+=0.15')
      .add(start, '-=0.55');
    // Fail-safe: never let the intro block the page
    setTimeout(function () {
      if (pre.parentNode) { tl.kill(); pre.parentNode.removeChild(pre); if (lenis) lenis.start(); start(); }
    }, 6000);
  }
})();

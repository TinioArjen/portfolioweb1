/* Portfolio script: theme, menu, tabs, lightbox (images + video), typing, reveal, nav highlight, progress, back-to-top */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ICON_CLOSE = '<svg class="ico" aria-hidden="true"><use href="#i-close"/></svg>';

  /* Footer year */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* Theme toggle */
  var themeBtn = document.getElementById('theme-toggle');
  function syncThemeLabel() {
    if (!themeBtn) return;
    var dark = root.dataset.theme === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeBtn.setAttribute('title', dark ? 'Light mode' : 'Dark mode');
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', dark ? '#1a1615' : '#efe6d2');
  }
  if (themeBtn) {
    syncThemeLabel();
    themeBtn.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncThemeLabel();
    });
  }

  /* Mobile menu */
  var menuBtn = document.getElementById('menu-toggle');
  var navLinks = document.getElementById('nav-links');
  function setMenu(open) {
    navLinks.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () { setMenu(!navLinks.classList.contains('is-open')); });
    navLinks.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (navLinks.classList.contains('is-open') && !e.target.closest('.site-header')) setMenu(false);
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* Skill tabs */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.skills-col'));
  function showTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (p) {
      p.hidden = p.id !== tab.getAttribute('aria-controls');
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showTab(t); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') n = tabs[0];
      else if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); showTab(n, true); }
    });
  });

  /* Lightbox (images and video) */
  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Enlarged view');
  box.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close">' + ICON_CLOSE + '</button><div class="lightbox-body"></div>';
  document.body.appendChild(box);
  var boxBody = box.querySelector('.lightbox-body');
  var boxClose = box.querySelector('.lightbox-close');
  var lastFocus = null;

  function openBox(node) {
    lastFocus = document.activeElement;
    boxBody.innerHTML = '';
    boxBody.appendChild(node);
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    boxClose.focus();
  }
  function closeBox() {
    if (!box.classList.contains('is-open')) return;
    var v = boxBody.querySelector('video');
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { if (!box.classList.contains('is-open')) boxBody.innerHTML = ''; }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('[data-zoom]').forEach(function (z) {
    z.addEventListener('click', function () {
      var img = z.querySelector('img');
      if (!img) return;
      var big = document.createElement('img');
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      openBox(big);
    });
  });

  var video = document.getElementById('project-video');
  var zoomVideoBtn = document.querySelector('[data-zoom-video]');
  var vWrap = document.querySelector('.video-wrap');
  var vFailed = false;
  function showVideoError() {
    if (vFailed || !vWrap) return;
    vFailed = true;
    vWrap.classList.add('is-broken');
    var note = document.createElement('p');
    note.textContent = 'This video is unavailable right now. Please check back soon.';
    vWrap.appendChild(note);
    console.warn('Video failed to load. Put an MP4 (H.264 + AAC) at assets/web1video1.mp4');
  }
  if (video && zoomVideoBtn) {
    var srcEl = video.querySelector('source');
    srcEl.addEventListener('error', showVideoError);
    video.addEventListener('error', showVideoError);
    zoomVideoBtn.addEventListener('click', function () {
      var big = document.createElement('video');
      big.controls = true; big.playsInline = true; big.autoplay = true; big.preload = 'auto';
      big.src = srcEl.src.split('#')[0];
      big.addEventListener('error', function () { closeBox(); showVideoError(); });
      big.addEventListener('loadedmetadata', function () {
        if (!big.videoWidth) {
          big.pause();
          var msg = document.createElement('p');
          msg.className = 'lightbox-msg';
          msg.textContent = 'This video format is not supported by your browser. It needs to be re-exported as H.264 (MP4).';
          boxBody.replaceChildren(msg);
          console.warn('web1video1.mp4 has no decodable video track (likely H.265/HEVC or 10-bit). Re-encode to H.264 yuv420p.');
        }
      });
      openBox(big);
      var p = big.play(); if (p && p.catch) p.catch(function () {});
    });
  }

  box.addEventListener('click', function (e) {
    if (e.target === box || e.target === boxBody) closeBox();
  });
  boxClose.addEventListener('click', closeBox);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeBox();
    if (e.key === 'Tab' && box.classList.contains('is-open')) {
      var focusables = box.querySelectorAll('button, video[controls]');
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Typing effect in the hero */
  var typed = document.getElementById('typed');
  var roles = ['student developer', 'video editor', 'graphic designer', 'hard worker'];
  if (typed) {
    if (reduce) { typed.textContent = roles[0]; }
    else {
      var r = 0, c = 0, del = false;
      (function tick() {
        var word = roles[r];
        typed.textContent = word.slice(0, c);
        var wait = del ? 45 : 95;
        if (!del && c === word.length) { del = true; wait = 1400; }
        else if (del && c === 0) { del = false; r = (r + 1) % roles.length; wait = 350; }
        else c += del ? -1 : 1;
        setTimeout(tick, wait);
      })();
    }
  }

  /* Scroll reveal */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 90 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Scroll-based: header shadow, nav highlight, progress bar, back-to-top */
  var header = document.getElementById('header');
  var bar = document.getElementById('progress');
  var toTop = document.getElementById('to-top');
  var linkById = {};
  document.querySelectorAll('.nav-links a').forEach(function (a) { linkById[a.getAttribute('href').slice(1)] = a; });
  var targets = ['home', 'about', 'skills', 'projects', 'education', 'achievements', 'contact']
    .map(function (id) { return document.getElementById(id); }).filter(Boolean);

  function update() {
    var top = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-solid', top > 40);
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? top / max : 0) + ')';
    if (toTop) toTop.classList.toggle('is-visible', top > 500);

    var line = header.offsetHeight + 80, current = targets[0].id;
    targets.forEach(function (el) { if (el.getBoundingClientRect().top <= line) current = el.id; });
    if (window.innerHeight + top >= document.documentElement.scrollHeight - 4) current = targets[targets.length - 1].id;
    Object.keys(linkById).forEach(function (k) {
      if (k === current) linkById[k].setAttribute('aria-current', 'true');
      else linkById[k].removeAttribute('aria-current');
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(function () { update(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();

  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
})();

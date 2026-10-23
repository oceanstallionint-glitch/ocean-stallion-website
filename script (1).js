/* Ocean Stallion International - site script
   Hash-based page router, mobile menu, hero slider, loader, contact form. */
(function () {
  'use strict';

  var PAGES = ['home', 'products', 'certificates', 'gallery', 'trade', 'contact'];
  var TITLES = {
    home: 'Ocean Stallion International — Agricultural Commodity Export',
    products: 'Products — Ocean Stallion International',
    certificates: 'Certificates — Ocean Stallion International',
    gallery: 'Gallery — Ocean Stallion International',
    trade: 'Trade Progress — Ocean Stallion International',
    contact: 'Contact — Ocean Stallion International'
  };
  var CONTACT_EMAIL = 'oceanstallionint@gmail.com';

  var nav = document.getElementById('navMenu');
  var menuToggle = document.getElementById('menuToggle');

  /* ---------- Router ---------- */
  function showPage(id) {
    var i;
    var pages = document.querySelectorAll('.page-section');
    for (i = 0; i < pages.length; i++) pages[i].classList.remove('active');

    var links = document.querySelectorAll('.nav a');
    for (i = 0; i < links.length; i++) {
      links[i].classList.remove('active');
      links[i].removeAttribute('aria-current');
    }

    var page = document.getElementById('page-' + id);
    if (page) page.classList.add('active');

    var link = document.getElementById('nav-' + id);
    if (link) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }

    document.title = TITLES[id] || TITLES.home;
    closeMenu();
    window.scrollTo(0, 0);
  }

  function route() {
    var id = (window.location.hash || '').replace('#', '');
    if (PAGES.indexOf(id) === -1) id = 'home';
    showPage(id);
  }

  window.addEventListener('hashchange', route);
  route();

  /* ---------- Mobile menu ---------- */
  function closeMenu() {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- Hero slider ---------- */
  var slides = document.querySelectorAll('.hero-slide');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = 0;
  if (slides.length > 1 && !reduceMotion) {
    setInterval(function () {
      if (document.hidden) return;
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 5000);
  }

  /* ---------- Loader (with fallback so it can never get stuck) ---------- */
  var loader = document.getElementById('loader');
  function hideLoader() {
    if (loader) loader.classList.add('hidden');
  }
  window.addEventListener('load', function () { setTimeout(hideLoader, 1800); });
  setTimeout(hideLoader, 5000);

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Contact form ---------- */
  var form = document.getElementById('quoteForm');
  var statusEl = document.getElementById('formStatus');

  function setStatus(msg, isError) {
    statusEl.textContent = msg; // textContent only: never inject user input as HTML
    statusEl.className = 'form-status full' + (isError ? ' error' : '');
  }

  function mailtoFallback(data) {
    var body = [
      'Name: ' + data.get('name'),
      'Email: ' + data.get('email'),
      'Country: ' + data.get('country'),
      'Product: ' + data.get('product'),
      '',
      data.get('message') || ''
    ].join('\n');
    window.location.href = 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent('Inquiry: ' + data.get('product')) +
      '&body=' + encodeURIComponent(body);
  }

  if (form && statusEl) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      if (data.get('bot-field')) return; // honeypot filled: silently drop bots

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      setStatus('Sending…', false);

      var request = fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          country: data.get('country'),
          product: data.get('product'),
          message: data.get('message') || '',
          website: data.get('bot-field') || ''
        })
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (r) {
          if (!res.ok || !r.ok) throw new Error('Send failed');
        });
      });

      request
        .then(function () {
          form.reset();
          setStatus('Thank you. We have received your inquiry and will reply shortly.', false);
        })
        .catch(function () {
          // Server unavailable: open the visitor's email app instead.
          setStatus('Opening your email app to send this inquiry to ' + CONTACT_EMAIL + '…', false);
          mailtoFallback(data);
        })
        .then(function () { btn.disabled = false; });
    });
  }
})();

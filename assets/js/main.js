/* ==========================================================================
   yukumgaranti.com — site davranışı
   Yayına almadan önce yalnızca aşağıdaki SITE bloğunu düzenlemeniz yeterli.
   ========================================================================== */
(function () {
  'use strict';

  var SITE = {
    // WhatsApp numarası: ülke kodu dahil, sadece rakam. Örn. 905321234567
    whatsapp: '905451332859',

    // Form gönderim adresi (Formspree, Basin, kendi API'niz…).
    // Boş bırakılırsa form içeriği WhatsApp mesajı olarak açılır — sunucu gerekmez.
    formEndpoint: ''
  };

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------- WhatsApp bağlantıları */
  function waUrl(text) {
    return 'https://wa.me/' + SITE.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  $$('.js-wa').forEach(function (a) {
    a.href = waUrl(a.dataset.waText || '');
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------------------------------------------------------- tema */
  var root = document.documentElement;
  var themeBtn = $('#theme-toggle');

  function currentTheme() {
    return root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('yg-theme', next); } catch (e) {}
      themeBtn.setAttribute('aria-label',
        next === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç');
    });
  }

  /* ---------------------------------------------------------- mobil menü */
  var navToggle = $('#nav-toggle');
  var drawer    = $('#nav-drawer');

  function setDrawer(open) {
    if (!drawer || !navToggle) return;
    drawer.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  }

  if (navToggle && drawer) {
    navToggle.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('open'));
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setDrawer(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        setDrawer(false);
        navToggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------- form sekmeleri */
  var tabs = $$('.tab');

  function selectTab(tab, moveFocus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (moveFocus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      selectTab(tabs[(i + d + tabs.length) % tabs.length], true);
    });
  });

  // "Tırım var, yük arıyorum" bağlantıları tırcı sekmesini açsın
  $$('a[href="#tirci"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var tir = $('#tab-tir');
      if (tir) selectTab(tir);
    });
  });

  /* ---------------------------------------------------------- form gönderimi */
  var LABELS = {
    yuk_cinsi: 'Yük cinsi', koridor: 'Koridor', cikis: 'Çıkış', varis: 'Varış',
    tonaj: 'Tonaj/adet', yukleme_tarihi: 'Yükleme tarihi', telefon: 'Telefon',
    ad_firma: 'Ad/firma', plaka: 'Plaka', arac_tipi: 'Araç tipi',
    kapasite: 'Kapasite', donus_bolgeleri: 'Dönüş bölgeleri', not: 'Not'
  };

  function messageFrom(form) {
    var baslik = form.id === 'panel-tir'
      ? 'Tırcı kaydı — yukumgaranti.com'
      : 'Yük teklif talebi — yukumgaranti.com';
    var lines = [baslik, ''];
    new FormData(form).forEach(function (value, key) {
      if (key === '_gotcha' || !String(value).trim()) return;
      lines.push((LABELS[key] || key) + ': ' + value);
    });
    return lines.join('\n');
  }

  function showSuccess(form) {
    var ok = $('.success', form);
    $$('.fgrid, .intro, .form-note, button[type=submit]', form)
      .forEach(function (el) { el.hidden = true; });
    if (ok) {
      ok.classList.add('on');
      ok.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  $$('form.panel').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (form.querySelector('[name="_gotcha"]').value) return; // bot
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var btn = $('button[type=submit]', form);
      if (btn) btn.disabled = true;

      if (SITE.formEndpoint) {
        fetch(SITE.formEndpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          showSuccess(form);
        }).catch(function () {
          if (btn) btn.disabled = false;
          window.open(waUrl(messageFrom(form)), '_blank', 'noopener');
        });
      } else {
        // Sunucusuz mod: doldurulan bilgiler hazır WhatsApp mesajı olarak açılır.
        window.open(waUrl(messageFrom(form)), '_blank', 'noopener');
        showSuccess(form);
      }
    });
  });

  /* ---------------------------------------------------------- menüde aktif bölüm */
  var links = $$('.nav-links a[href^="#"]');
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.setAttribute('aria-current',
            a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------- görüşe girme */
  root.classList.add('js'); // gizleme kuralı ancak JS varken devreye girer
  var revealables = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------------------------------------------------- yıl */
  var yil = $('#yil');
  if (yil) yil.textContent = new Date().getFullYear();
})();

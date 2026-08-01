/* =====================================================================
   Oasis — Moteur cinématographique de la page d'accueil
   « Du désert digital à l'oasis de croissance »

   - Timeline maîtresse liée au scroll (scrub) et épinglée (pin).
   - 4 actes : désert nocturne → lueur turquoise → source d'eau → oasis.
   - Réversible : remonter rejoue l'animation en sens inverse (scrub).
   - Repli propre si GSAP absent ou prefers-reduced-motion : la scène
     reste sur son état lumineux statique défini en CSS.
   ===================================================================== */
(function () {
  var cine = document.getElementById('cine');
  if (!cine) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Génère les étoiles (toujours, même en repli : décor discret) ---- */
  (function stars() {
    var box = document.getElementById('cineStars');
    if (!box) return;
    var n = window.innerWidth < 720 ? 46 : 90, html = '';
    for (var i = 0; i < n; i++) {
      var x = (Math.random() * 100).toFixed(2);
      var y = (Math.random() * 68).toFixed(2);        // étoiles surtout en haut
      var s = (Math.random() * 1.8 + 0.6).toFixed(2);
      var tw = (Math.random() * 4 + 2.5).toFixed(2);
      var d = (Math.random() * 4).toFixed(2);
      html += '<i style="left:' + x + '%;top:' + y + '%;width:' + s + 'px;height:' + s +
        'px;--tw:' + tw + 's;animation-delay:' + d + 's"></i>';
    }
    box.innerHTML = html;
  })();

  /* ---- Génère les motes lumineuses de l'oasis ---- */
  (function motes() {
    var box = document.getElementById('cineMotes');
    if (!box) return;
    var n = window.innerWidth < 720 ? 10 : 20, html = '';
    for (var i = 0; i < n; i++) {
      var x = (Math.random() * 100).toFixed(2);
      var dur = (Math.random() * 10 + 11).toFixed(2);
      var d = (Math.random() * 14).toFixed(2);
      var dx = (Math.random() * 80 - 40).toFixed(0);
      html += '<i style="left:' + x + '%;--dur:' + dur + 's;--dx:' + dx +
        'px;animation-delay:' + d + 's"></i>';
    }
    box.innerHTML = html;
  })();

  /* Garde le header lisible tant que la scène occupe le haut de page */
  function headerToggle() {
    document.body.classList.toggle('cine-active', window.scrollY < cine.offsetHeight - 80);
  }

  if (reduce || !window.gsap || !window.ScrollTrigger) {
    /* Repli statique (scène lumineuse figée définie en CSS) */
    headerToggle();
    window.addEventListener('scroll', headerToggle, { passive: true });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  var q = gsap.utils.selector(cine);

  /* ---- État initial : nuit profonde ---- */
  gsap.set('.sky-night', { opacity: 1 });
  gsap.set('.sky-dawn',  { opacity: 0 });
  gsap.set('.sky-day',   { opacity: 0 });
  gsap.set('.cine-stars', { opacity: 1 });
  gsap.set('.cine-motes', { opacity: 0 });

  gsap.set('.cine-halo', { opacity: 0, scale: 0.25, yPercent: 26 });
  gsap.set('.cine-sun',  { yPercent: 62, opacity: 0, scale: 0.7 });
  gsap.set('.cine-sun-warm', { opacity: 1 });   // lever doré au départ

  gsap.set('.dune-far', { color: '#0a1220', yPercent: 6 });
  gsap.set('.dune-mid', { color: '#070c16', yPercent: 10 });
  gsap.set('.dune-near',{ color: '#03050a', yPercent: 4 });

  gsap.set('.water', { opacity: 0 });
  gsap.set('.water .pool-group', { scaleY: 0 });
  gsap.set('.oasis g', { scaleY: 0, opacity: 0 });

  gsap.set(q('.cine-act'), { opacity: 0, y: 34 });
  gsap.set('.act-1', { opacity: 1, y: 0 });

  /* ---- Pastilles de progression ---- */
  var dots = q('.cine-progress span');
  function activate(i) {
    dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
  }

  /* ---- Timeline maîtresse (liée au scroll) ----
     Durées relatives ; scrub assure la réversibilité. */
  var tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: cine,
      start: 'top top',
      end: '+=' + Math.round(window.innerHeight * 4.4),
      scrub: 0.8,
      pin: '.cine-stage',
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: function (self) {
        var p = self.progress;
        activate(p < 0.24 ? 0 : p < 0.5 ? 1 : p < 0.74 ? 2 : 3);
      }
    }
  });

  /* ===== ACTE 1 → 2 : la lueur turquoise apparaît à l'horizon ===== */
  tl.to('.cine-hint', { opacity: 0, duration: 0.4 }, 0.02)
    .to('.act-1', { opacity: 0, y: -34, duration: 0.6, ease: 'power2.in' }, 0.6)

    .to('.cine-halo', { opacity: 0.85, scale: 1, yPercent: 0, duration: 1.6, ease: 'power2.out' }, 0.5)
    .to('.cine-sun',  { yPercent: 6, opacity: 1, scale: 1, duration: 1.7, ease: 'power2.out' }, 0.5)
    .to('.cine-sun-warm', { opacity: 0, duration: 1.4 }, 0.9)  // doré → turquoise
    .to('.sky-night', { opacity: 0, duration: 1.4 }, 0.7)
    .to('.sky-dawn',  { opacity: 1, duration: 1.4 }, 0.7)
    .to('.cine-stars',{ opacity: 0.35, duration: 1.2 }, 0.7)
    .to('.dune-far',  { color: '#1a2c47', duration: 1.4 }, 0.8)
    .to('.dune-mid',  { color: '#111d31', duration: 1.4 }, 0.8)
    .fromTo('.act-2', { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.4)

  /* ===== ACTE 2 → 3 : révélation de la source d'eau ===== */
    .to('.act-2', { opacity: 0, y: -34, duration: 0.6, ease: 'power2.in' }, 2.5)
    .to('.sky-dawn', { opacity: 0, duration: 1.6 }, 2.6)
    .to('.sky-day',  { opacity: 1, duration: 1.6 }, 2.6)
    .to('.cine-stars', { opacity: 0, duration: 1.0 }, 2.6)
    .to('.water', { opacity: 1, duration: 0.5 }, 2.6)
    .to('.water .pool-group', { scaleY: 1, duration: 1.7, ease: 'power2.out' }, 2.6)
    .to('.dune-far', { color: '#2a4162', duration: 1.6 }, 2.7)
    .to('.dune-mid', { color: '#1b2c46', duration: 1.6 }, 2.7)
    .to('.cine-halo', { scale: 1.1, opacity: 0.7, duration: 1.6 }, 2.7)
    .fromTo('.act-3', { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 3.4)

  /* ===== ACTE 3 → 4 : l'oasis végétale et lumineuse ===== */
    .to('.act-3', { opacity: 0, y: -34, duration: 0.6, ease: 'power2.in' }, 4.4)
    .to('.oasis g', { scaleY: 1, opacity: 1, duration: 1.6, stagger: 0.18, ease: 'back.out(1.4)' }, 4.4)
    .to('.cine-motes', { opacity: 1, duration: 1.2 }, 4.8)
    .to('.dune-near', { color: '#0a1420', duration: 1.4 }, 4.5)
    .to('.dune-mid',  { color: '#123a3a', duration: 1.4 }, 4.5)
    .to('.sky-day', { filter: 'saturate(1.15) brightness(1.06)', duration: 1.2 }, 4.6)
    .to('.cine-sun', { yPercent: -4, scale: 1.06, duration: 1.4 }, 4.5)
    .fromTo('.act-4', { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 5.2);

  /* ---- Parallaxe légère au pointeur (profondeur, non liée au scroll) ---- */
  if (window.matchMedia('(pointer:fine)').matches) {
    var qToFar  = gsap.quickTo('.dune-far',  'xPercent', { duration: 0.6, ease: 'power3' });
    var qToMid  = gsap.quickTo('.dune-mid',  'xPercent', { duration: 0.6, ease: 'power3' });
    var qToNear = gsap.quickTo('.dune-near', 'xPercent', { duration: 0.6, ease: 'power3' });
    var qToSun  = gsap.quickTo('.cine-sun',  'xPercent', { duration: 0.8, ease: 'power3' });
    cine.addEventListener('pointermove', function (e) {
      var dx = (e.clientX / window.innerWidth - 0.5);
      qToFar(dx * 1.4); qToMid(dx * 2.6); qToNear(dx * 4.2); qToSun(dx * -1.6);
    });
  }

  document.body.classList.add('cine-loaded');

  /* ---- Header lisible tant que la scène est visible ---- */
  ScrollTrigger.create({
    trigger: cine,
    start: 'top top',
    end: '+=' + Math.round(window.innerHeight * 4.4),
    onToggle: function (self) { document.body.classList.toggle('cine-active', self.isActive); }
  });
  document.body.classList.add('cine-active');

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();

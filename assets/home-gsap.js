/* Oasis — animations GSAP de la page d'accueil (ScrollTrigger).
   - Entrée du hero en timeline
   - Barre de progression de scroll
   - Reveals au scroll (batch) + entrée dédiée des cartes réalisations
   - "Pop" des chiffres des stats
   - Parallax léger du contenu du hero
   Robuste : si GSAP échoue ou si prefers-reduced-motion, on retombe sur le
   reveal CSS/IO existant (la classe .gsap n'est pas/plus posée). */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !window.gsap || !window.ScrollTrigger) {
    clearTimeout(window.__gsapFail);
    root.classList.remove('gsap');
    return;
  }
  clearTimeout(window.__gsapFail);
  gsap.registerPlugin(ScrollTrigger);

  /* 1) Entrée du hero — timeline au chargement */
  var heroEls = ['.hero .hero-badge', '.hero h1', '.hero .hero-sub', '.hero .hero-cta', '.hero .marquee'];
  gsap.set(heroEls, { opacity: 0, y: 24 });
  gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } })
    .to('.hero .hero-badge', { opacity: 1, y: 0, duration: 0.6 }, 0.10)
    .to('.hero h1',        { opacity: 1, y: 0 },                 0.20)
    .to('.hero .hero-sub', { opacity: 1, y: 0 },                 0.42)
    .to('.hero .hero-cta', { opacity: 1, y: 0 },                 0.56)
    .to('.hero .marquee',  { opacity: 1, y: 0, duration: 0.7 },  0.70);

  /* 2) Barre de progression de scroll (injectée, décorative) */
  var bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:100%;z-index:200;transform:scaleX(0);' +
    'transform-origin:0 50%;background:linear-gradient(90deg,#6BEEDC,#E8B65A);pointer-events:none';
  document.body.appendChild(bar);
  gsap.to(bar, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
  });

  /* 3) Reveals au scroll — batch (hors cartes réalisations, traitées à part) */
  gsap.set('.reveal:not(.work)', { opacity: 0, y: 40 });
  ScrollTrigger.batch('.reveal:not(.work)', {
    start: 'top 88%',
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, overwrite: true });
    }
  });

  /* 4) Cartes réalisations — entrée dédiée (léger zoom + stagger) */
  gsap.set('.work.reveal', { opacity: 0, y: 50, scale: 0.94 });
  ScrollTrigger.batch('.work.reveal', {
    start: 'top 90%',
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out', stagger: 0.1, overwrite: true });
    }
  });

  /* 5) "Pop" des chiffres des stats (transform seul — n'interfère pas avec le comptage) */
  var nums = gsap.utils.toArray('.stat .num');
  if (nums.length) {
    gsap.from(nums, {
      scale: 0.55, ease: 'back.out(1.7)', duration: 0.7, stagger: 0.09,
      scrollTrigger: { trigger: '.stats', start: 'top 82%', once: true }
    });
  }

  /* 6) Parallax léger : le contenu du hero glisse/estompe au scroll */
  gsap.to('.hero .wrap', {
    yPercent: -8, opacity: 0.55, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* Recalcul quand les polices embarquées sont prêtes (le layout bouge) */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();

/* Oasis — animations GSAP de la page d'accueil (ScrollTrigger).
   - Entrée du hero en timeline
   - Reveals au scroll en batch (alternative recommandée à IntersectionObserver)
   - Parallax léger du contenu du hero
   Robuste : si GSAP échoue ou si prefers-reduced-motion, on retombe sur le
   reveal CSS/IO existant (la classe .gsap n'est pas/plus posée). */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Bail out proprement : contenu visible via le CSS de base + reveal IO
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    clearTimeout(window.__gsapFail);
    root.classList.remove('gsap');
    return;
  }
  clearTimeout(window.__gsapFail);
  gsap.registerPlugin(ScrollTrigger);

  // 1) Entrée du hero — timeline au chargement
  var heroEls = ['.hero .hero-badge', '.hero h1', '.hero .hero-sub', '.hero .hero-cta', '.hero .marquee'];
  gsap.set(heroEls, { opacity: 0, y: 24 });
  gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } })
    .to('.hero .hero-badge', { opacity: 1, y: 0, duration: 0.6 }, 0.10)
    .to('.hero h1',        { opacity: 1, y: 0 },                 0.20)
    .to('.hero .hero-sub', { opacity: 1, y: 0 },                 0.42)
    .to('.hero .hero-cta', { opacity: 1, y: 0 },                 0.56)
    .to('.hero .marquee',  { opacity: 1, y: 0, duration: 0.7 },  0.70);

  // 2) Reveals au scroll — batch avec stagger par groupe entrant
  gsap.set('.reveal', { opacity: 0, y: 40 });
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        stagger: 0.12, overwrite: true
      });
    }
  });

  // 3) Parallax léger : le contenu du hero glisse/estompe quand on scrolle
  gsap.to('.hero .wrap', {
    yPercent: -8, opacity: 0.55, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  // Recalcul quand les polices embarquées sont prêtes (le layout bouge)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();

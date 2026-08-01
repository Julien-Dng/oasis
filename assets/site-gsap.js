/* Oasis — socle d'animations GSAP partagé (pages internes).
   Version allégée : barre de progression, entrée douce de l'en-tête de page,
   et reveals au scroll. Le hero animé + parallax reste exclusif à la home
   (home-gsap.js). Robuste : prefers-reduced-motion + failsafe. */
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

  /* Barre de progression de scroll */
  var bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:100%;z-index:200;transform:scaleX(0);' +
    'transform-origin:0 50%;background:linear-gradient(90deg,#6BEEDC,#E8B65A);pointer-events:none';
  document.body.appendChild(bar);
  gsap.to(bar, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
  });

  /* Entrée douce de l'en-tête de page */
  var headEls = gsap.utils.toArray('.page-hero .breadcrumb, .page-hero .eyebrow, .page-hero h1, .page-hero .lead, .page-hero .hero-cta');
  if (headEls.length) {
    gsap.set(headEls, { opacity: 0, y: 22 });
    gsap.to(headEls, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.05 });
  }

  /* Reveals au scroll (batch) */
  gsap.set('.reveal', { opacity: 0, y: 40 });
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, overwrite: true });
    }
  });

  /* Recalcul quand les polices embarquées sont prêtes */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();

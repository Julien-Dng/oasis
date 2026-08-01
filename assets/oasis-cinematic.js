/* =====================================================================
   Oasis Web Agency — timeline scrollée du hero de la page d’accueil.
   Le DOM/CSS reste une oasis statique si GSAP est absent ou si l’utilisateur
   préfère réduire les animations.
   ===================================================================== */
(function () {
  'use strict';

  var journey = document.querySelector('.oasis-journey');
  if (!journey) return;

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia('(pointer:coarse)').matches;
  var lowPower = (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  if (lowPower) root.classList.add('oasis-lite');

  function randomFactory(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function populate(containerId, count, seed, isStar) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var random = randomFactory(seed);
    var fragment = document.createDocumentFragment();

    for (var index = 0; index < count; index += 1) {
      var particle = document.createElement('i');
      var x = (random() * 100).toFixed(2) + '%';
      var y = (random() * (isStar ? 58 : 72) + (isStar ? 1 : 12)).toFixed(2) + '%';
      var size = (random() * (isStar ? 1.5 : 2.5) + (isStar ? .7 : 1.5)).toFixed(2) + 'px';
      particle.style.left = x;
      particle.style.top = y;
      particle.style.setProperty('--size', size);
      particle.style.setProperty('--duration', (random() * 5 + (isStar ? 3 : 6)).toFixed(2) + 's');
      particle.style.setProperty('--delay', (-random() * 7).toFixed(2) + 's');
      particle.style.setProperty('--drift', (random() * 32 - 16).toFixed(1) + 'px');
      fragment.appendChild(particle);
    }
    container.appendChild(fragment);
  }

  var mobile = window.matchMedia('(max-width:760px)').matches;
  var particleFactor = lowPower ? .55 : 1;
  populate('oasisStars', Math.round((mobile ? 30 : 56) * particleFactor), 4871, true);
  populate('oasisParticlesDark', Math.round((mobile ? 7 : 14) * particleFactor), 7319, false);
  populate('oasisParticlesLight', Math.round((mobile ? 8 : 18) * particleFactor), 9151, false);

  function staticHeaderObserver() {
    document.body.classList.add('oasis-active');
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      document.body.classList.toggle('oasis-active', entries[0].isIntersecting);
    }, { threshold: .05 });
    observer.observe(journey);
  }

  if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
    root.classList.add('oasis-static');
    staticHeaderObserver();
    return;
  }

  clearTimeout(window.__gsapFail);
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('oasis-motion-ready');

  var select = gsap.utils.selector(journey);
  var progressSteps = select('.oasis-progress span');
  var media = gsap.matchMedia();

  function setProgress(activeIndex) {
    progressSteps.forEach(function (step, index) {
      step.classList.toggle('is-active', index === activeIndex);
    });
  }

  media.add({
    isDesktop: '(min-width:761px)',
    isMobile: '(max-width:760px)'
  }, function (context) {
    var isDesktop = context.conditions.isDesktop;
    var depth = isDesktop ? 1 : .56;
    var scrollScreens = isDesktop ? 3.6 : 2.7;
    var pointerHandler;

    gsap.set(select('.oasis-sky-night'), { autoAlpha: 1 });
    gsap.set(select('.oasis-sky-dawn, .oasis-sky-day'), { autoAlpha: 0 });
    gsap.set(select('.oasis-stars'), { autoAlpha: 1 });
    gsap.set(select('.oasis-horizon-glow'), { autoAlpha: .2, scale: .42, xPercent: -50, yPercent: -34 });
    gsap.set(select('.oasis-orb'), { autoAlpha: .68, scale: .34, xPercent: -50, yPercent: -20 });
    gsap.set(select('.oasis-orb-warm'), { autoAlpha: 0 });
    gsap.set(select('.oasis-world'), { scale: 1, transformOrigin: '50% 64%' });
    gsap.set(select('.oasis-dunes-far'), { yPercent: 4 * depth });
    gsap.set(select('.oasis-dunes-mid'), { yPercent: 7 * depth });
    gsap.set(select('.oasis-dunes-near'), { yPercent: 10 * depth });
    gsap.set(select('.oasis-dune-light'), { autoAlpha: 0 });
    gsap.set(select('.oasis-water'), { autoAlpha: 0, scaleY: .08, yPercent: 4 });
    gsap.set(select('.oasis-plant, .oasis-reeds'), { autoAlpha: 0, scaleY: .2, y: 32 * depth });
    gsap.set(select('.oasis-particles-dark'), { autoAlpha: .48 });
    gsap.set(select('.oasis-particles-light'), { autoAlpha: 0 });
    gsap.set(select('.oasis-atmosphere'), { autoAlpha: .08 });
    gsap.set(select('.oasis-service-bridge'), { autoAlpha: 0, yPercent: 28 });
    gsap.set(select('.oasis-intro'), { autoAlpha: 1, y: 0 });
    gsap.set(select('.oasis-reveal'), { autoAlpha: 0, y: 32 });

    var timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'oasis-journey',
        trigger: journey,
        start: 'top top',
        end: function () {
          return '+=' + Math.round(document.documentElement.clientHeight * scrollScreens);
        },
        pin: select('.oasis-scene')[0],
        pinSpacing: true,
        anticipatePin: 1,
        scrub: isDesktop ? .75 : .45,
        invalidateOnRefresh: true,
        refreshPriority: -10,
        onToggle: function (self) {
          document.body.classList.toggle('oasis-active', self.isActive);
        },
        onUpdate: function (self) {
          var progress = self.progress;
          setProgress(progress < .24 ? 0 : progress < .5 ? 1 : progress < .76 ? 2 : 3);
        }
      }
    });

    timeline
      .addLabel('desert', 0)
      .to(select('.oasis-scroll-hint'), { autoAlpha: 0, duration: .45 }, 'desert+=.12')

      .addLabel('approach', .45)
      .to(select('.oasis-intro'), { autoAlpha: 0, y: -42 * depth, duration: .9, ease: 'power2.in' }, 'approach+=.7')
      .to(select('.oasis-orb'), { autoAlpha: 1, scale: .88, xPercent: -50, yPercent: -42, duration: 2.25, ease: 'power2.inOut' }, 'approach')
      .to(select('.oasis-horizon-glow'), { autoAlpha: .78, scale: .94, xPercent: -50, yPercent: -48, duration: 2.2, ease: 'power2.out' }, 'approach')
      .to(select('.oasis-sky-night'), { autoAlpha: .18, duration: 2 }, 'approach+=.25')
      .to(select('.oasis-sky-dawn'), { autoAlpha: 1, duration: 2 }, 'approach+=.25')
      .to(select('.oasis-stars'), { autoAlpha: .24, duration: 1.7 }, 'approach+=.35')
      .to(select('.oasis-world'), { scale: 1 + .055 * depth, yPercent: -1.4 * depth, duration: 2.3, ease: 'power1.inOut' }, 'approach')
      .to(select('.oasis-dunes-far'), { yPercent: -1.5 * depth, duration: 2.3 }, 'approach')
      .to(select('.oasis-dunes-mid'), { yPercent: -3.5 * depth, duration: 2.3 }, 'approach')
      .to(select('.oasis-dunes-near'), { yPercent: -6.5 * depth, duration: 2.3 }, 'approach')

      .addLabel('transformation', 2.55)
      .to(select('.oasis-sky-night'), { autoAlpha: 0, duration: 1.75 }, 'transformation')
      .to(select('.oasis-sky-dawn'), { autoAlpha: .34, duration: 1.9 }, 'transformation')
      .to(select('.oasis-sky-day'), { autoAlpha: 1, duration: 1.9 }, 'transformation')
      .to(select('.oasis-stars'), { autoAlpha: 0, duration: 1.1 }, 'transformation')
      .to(select('.oasis-dune-light'), { autoAlpha: 1, duration: 1.9, stagger: .12 }, 'transformation+=.15')
      .to(select('.oasis-water'), { autoAlpha: 1, scaleY: 1, yPercent: 0, duration: 1.7, ease: 'power2.out' }, 'transformation+=.28')
      .to(select('.oasis-particles-dark'), { autoAlpha: 0, y: -18, duration: 1.25 }, 'transformation+=.2')
      .to(select('.oasis-particles-light'), { autoAlpha: .72, duration: 1.45 }, 'transformation+=.72')
      .to(select('.oasis-atmosphere'), { autoAlpha: .54, duration: 1.7 }, 'transformation+=.35')
      .to(select('.oasis-plant, .oasis-reeds'), {
        autoAlpha: 1,
        scaleY: 1,
        y: 0,
        duration: 1.35,
        stagger: .13,
        ease: 'power3.out'
      }, 'transformation+=1.02')
      .to(select('.oasis-orb-warm'), { autoAlpha: .76, duration: 1.5 }, 'transformation+=.8')
      .to(select('.oasis-orb'), { scale: 1.08, xPercent: -50, yPercent: -50, duration: 1.8, ease: 'power2.out' }, 'transformation+=.4')
      .to(select('.oasis-world'), { scale: 1 + .095 * depth, yPercent: -2.4 * depth, duration: 2.1 }, 'transformation')

      .addLabel('reveal', 5.05)
      .fromTo(select('.oasis-reveal'),
        { autoAlpha: 0, y: 32 * depth },
        { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out', immediateRender: false },
        'reveal')
      .to(select('.oasis-horizon-glow'), { autoAlpha: .92, scale: 1.08, duration: 1.25 }, 'reveal')

      .addLabel('exit', 6.45)
      .to(select('.oasis-reveal'), { autoAlpha: 0, y: -30 * depth, duration: .72, ease: 'power2.in' }, 'exit+=.42')
      .to(select('.oasis-service-bridge'), { autoAlpha: 1, yPercent: 0, duration: 1.2, ease: 'power1.in' }, 'exit+=.15')
      .to(select('.oasis-world'), { yPercent: -4 * depth, scale: 1 + .11 * depth, duration: 1.2 }, 'exit+=.15')
      .to({}, { duration: .35 });

    document.body.classList.add('oasis-active');

    if (isDesktop && !lowPower && !coarsePointer) {
      var farX = gsap.quickTo(select('.oasis-dunes-far')[0], 'xPercent', { duration: .7, ease: 'power3.out' });
      var midX = gsap.quickTo(select('.oasis-dunes-mid')[0], 'xPercent', { duration: .7, ease: 'power3.out' });
      var nearX = gsap.quickTo(select('.oasis-dunes-near')[0], 'xPercent', { duration: .7, ease: 'power3.out' });
      var orbX = gsap.quickTo(select('.oasis-orb')[0], 'x', { duration: .9, ease: 'power3.out' });
      pointerHandler = function (event) {
        var offset = event.clientX / window.innerWidth - .5;
        farX(offset * 1.2);
        midX(offset * 2.2);
        nearX(offset * 3.5);
        orbX(offset * -8);
      };
      journey.addEventListener('pointermove', pointerHandler, { passive: true });
    }

    return function () {
      if (pointerHandler) journey.removeEventListener('pointermove', pointerHandler);
      document.body.classList.remove('oasis-active');
      setProgress(0);
    };
  });

  function refreshScene() {
    ScrollTrigger.refresh();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshScene);
  }
  window.addEventListener('load', refreshScene, { once: true });
}());

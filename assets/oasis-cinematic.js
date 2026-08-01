/* =====================================================================
   Oasis Web Agency — transition photographique liée au scroll.

   Un seul wrapper porte les deux images maîtresses afin de garder l’horizon
   et la dune droite parfaitement stables. GSAP pilote uniquement le masque,
   les transforms, les opacités et les voiles atmosphériques.
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

  function observeStaticHeader() {
    document.body.classList.add('oasis-active');
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      document.body.classList.toggle('oasis-active', entries[0].isIntersecting);
    }, { threshold: .05 });
    observer.observe(journey);
  }

  if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
    root.classList.add('oasis-static');
    clearTimeout(window.__gsapFail);
    observeStaticHeader();
    return;
  }

  clearTimeout(window.__gsapFail);
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('oasis-motion-ready');

  var select = gsap.utils.selector(journey);
  var mediaLayer = select('.oasis-media')[0];
  var desertFrame = select('.oasis-frame-desert')[0];
  var oasisFrame = select('.oasis-frame-oasis')[0];
  var atmosphere = select('.oasis-atmosphere-group')[0];
  var horizonLight = select('.oasis-horizon-light')[0];
  var mist = select('.oasis-mist')[0];
  var colorWash = select('.oasis-color-wash')[0];
  var particles = select('.oasis-particles')[0];
  var vignette = select('.oasis-vignette')[0];
  var intro = select('.oasis-intro')[0];
  var finalCopy = select('.oasis-reveal')[0];
  var bridge = select('.oasis-service-bridge')[0];
  var progressSteps = select('.oasis-progress span');
  var matchMedia = gsap.matchMedia();

  function setProgress(activeIndex) {
    progressSteps.forEach(function (step, index) {
      step.classList.toggle('is-active', index === activeIndex);
    });
  }

  function seededRandom(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function populateParticles() {
    if (!particles || lowPower || coarsePointer || window.innerWidth <= 760) return;

    var random = seededRandom(7283);
    var fragment = document.createDocumentFragment();
    for (var index = 0; index < 10; index += 1) {
      var particle = document.createElement('i');
      particle.style.setProperty('--x', (24 + random() * 52).toFixed(2) + '%');
      particle.style.setProperty('--y', (43 + random() * 30).toFixed(2) + '%');
      particle.style.setProperty('--size', (.7 + random() * 1.25).toFixed(2) + 'px');
      particle.style.setProperty('--duration', (6 + random() * 5).toFixed(2) + 's');
      particle.style.setProperty('--delay', (-random() * 8).toFixed(2) + 's');
      particle.style.setProperty('--drift', (-7 + random() * 14).toFixed(1) + 'px');
      fragment.appendChild(particle);
    }
    particles.appendChild(fragment);
  }

  populateParticles();

  matchMedia.add({
    isDesktop: '(min-width:761px)',
    isMobile: '(max-width:760px)'
  }, function (context) {
    var isDesktop = context.conditions.isDesktop;
    var depth = isDesktop ? 1 : .62;
    var scrollScreens = isDesktop ? 3 : 2.3;
    var finalMaskX = isDesktop ? '170%' : '160%';
    var finalMaskY = isDesktop ? '150%' : '145%';
    var pointerHandler;

    gsap.set(mediaLayer, {
      autoAlpha: 1,
      scale: 1,
      yPercent: 0,
      transformOrigin: '50% 56%'
    });
    gsap.set(desertFrame, { autoAlpha: 1 });
    gsap.set(oasisFrame, {
      autoAlpha: 0,
      '--oasis-mask-x': '3%',
      '--oasis-mask-y': '3%'
    });
    gsap.set(atmosphere, { autoAlpha: 1, x: 0, y: 0 });
    gsap.set(horizonLight, { autoAlpha: .06, scale: .74, xPercent: -50, yPercent: -50 });
    gsap.set(mist, { autoAlpha: 0, y: 12 * depth });
    gsap.set(colorWash, { autoAlpha: 0 });
    gsap.set(particles, { autoAlpha: 0, y: 8 * depth });
    gsap.set(vignette, { autoAlpha: 1 });
    gsap.set(intro, { autoAlpha: 1, y: 0 });
    gsap.set(finalCopy, { autoAlpha: 0, y: 26 * depth });
    gsap.set(bridge, { autoAlpha: 0, yPercent: 26 });

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
        scrub: isDesktop ? .8 : .45,
        invalidateOnRefresh: true,
        refreshPriority: -10,
        onToggle: function (self) {
          document.body.classList.toggle('oasis-active', self.isActive);
        },
        onUpdate: function (self) {
          var progress = self.progress;
          setProgress(progress < .2 ? 0 : progress < .45 ? 1 : progress < .75 ? 2 : 3);
        }
      }
    });

    timeline
      .addLabel('desert', 0)
      .to(select('.oasis-scroll-hint'), { autoAlpha: 0, duration: 1.05 }, .35)
      .to(mediaLayer, {
        scale: 1 + .012 * depth,
        yPercent: -.22 * depth,
        duration: 2,
        ease: 'power1.inOut'
      }, 'desert')

      .addLabel('approach', 2)
      .to(horizonLight, {
        autoAlpha: .7,
        scale: 1,
        xPercent: -50,
        yPercent: -50,
        duration: 2.5,
        ease: 'power2.out'
      }, 'approach')
      .to(mist, {
        autoAlpha: .34,
        y: 0,
        duration: 2.15,
        ease: 'power2.out'
      }, 'approach+=.35')
      .to(colorWash, { autoAlpha: .13, duration: 2 }, 'approach+=.5')
      .to(particles, { autoAlpha: .16, y: 0, duration: 1.45 }, 'approach+=1.1')
      .to(intro, {
        autoAlpha: 0,
        y: -34 * depth,
        duration: 1.3,
        ease: 'power2.in'
      }, 'approach+=1.05')
      .to(mediaLayer, {
        scale: 1 + .022 * depth,
        yPercent: -.45 * depth,
        duration: 2.5,
        ease: 'power1.inOut'
      }, 'approach')

      .addLabel('transformation', 4.5)
      .to(oasisFrame, {
        autoAlpha: 1,
        '--oasis-mask-x': isDesktop ? '92%' : '108%',
        '--oasis-mask-y': isDesktop ? '82%' : '96%',
        duration: 3,
        ease: 'power1.inOut'
      }, 'transformation')
      .to(horizonLight, {
        autoAlpha: .92,
        scale: 1.08,
        xPercent: -50,
        yPercent: -50,
        duration: 2.2,
        ease: 'power1.out'
      }, 'transformation')
      .to(mist, { autoAlpha: .62, y: -4 * depth, duration: 2.35 }, 'transformation')
      .to(colorWash, { autoAlpha: .32, duration: 2.5 }, 'transformation+=.15')
      .to(particles, { autoAlpha: .45, y: -6 * depth, duration: 2 }, 'transformation+=.35')
      .to(mediaLayer, {
        scale: 1 + .036 * depth,
        yPercent: -.9 * depth,
        duration: 3,
        ease: 'power1.inOut'
      }, 'transformation')

      .addLabel('oasis', 7.5)
      .to(oasisFrame, {
        '--oasis-mask-x': finalMaskX,
        '--oasis-mask-y': finalMaskY,
        duration: .55,
        ease: 'power1.out'
      }, 'oasis')
      .to(horizonLight, {
        autoAlpha: .58,
        scale: 1.04,
        xPercent: -50,
        yPercent: -50,
        duration: 1.25
      }, 'oasis+=.15')
      .to(mist, { autoAlpha: .43, duration: 1.15 }, 'oasis+=.15')
      .to(finalCopy, {
        autoAlpha: 1,
        y: 0,
        duration: .85,
        ease: 'power3.out'
      }, 'oasis+=.22')
      .to(mediaLayer, {
        scale: 1 + .04 * depth,
        yPercent: -1.05 * depth,
        duration: 1.5,
        ease: 'power1.inOut'
      }, 'oasis')

      .addLabel('exit', 9)
      .to(finalCopy, {
        autoAlpha: 0,
        y: -24 * depth,
        duration: .65,
        ease: 'power2.in'
      }, 'exit+=.08')
      .to(bridge, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 1,
        ease: 'power1.in'
      }, 'exit')
      .to(atmosphere, { autoAlpha: 0, y: -8 * depth, duration: .85 }, 'exit+=.08')
      .to(vignette, { autoAlpha: .48, duration: .8 }, 'exit+=.08')
      .to(mediaLayer, {
        autoAlpha: .38,
        scale: 1 + .05 * depth,
        yPercent: -1.8 * depth,
        duration: 1,
        ease: 'power1.in'
      }, 'exit')
      .to({}, { duration: .01 }, 9.99);

    document.body.classList.add('oasis-active');

    if (isDesktop && !lowPower && !coarsePointer) {
      var atmosphereX = gsap.quickTo(atmosphere, 'x', { duration: 1.15, ease: 'power3.out' });
      var atmosphereY = gsap.quickTo(atmosphere, 'y', { duration: 1.15, ease: 'power3.out' });
      pointerHandler = function (event) {
        var xOffset = event.clientX / window.innerWidth - .5;
        var yOffset = event.clientY / window.innerHeight - .5;
        atmosphereX(xOffset * 6);
        atmosphereY(yOffset * 3);
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

  select('.oasis-frame img').forEach(function (image) {
    if (!image.complete) image.addEventListener('load', refreshScene, { once: true });
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshScene);
  }
  window.addEventListener('load', refreshScene, { once: true });
}());

/* ═══════════════════════════════════════════════════════════
   AVENTUS — Main JS
   Lenis smooth scroll + GSAP ScrollTrigger animations
═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // ═══ LENIS SMOOTH SCROLL ═══
  // Creates the premium "slight resistance" scroll feel
  let lenis = null;

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  // ═══ NAV SCROLL STATE ═══
  const nav = document.getElementById('nav');
  ScrollTrigger.create({
    start: 100,
    end: 99999,
    onUpdate: (self) => {
      nav.classList.toggle('scrolled', self.scroll() > 100);
    }
  });

  // ═══ REVEAL ANIMATIONS ═══
  gsap.utils.toArray('.reveal').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => {
        el.classList.add('visible');
        el.querySelectorAll('.counter').forEach(animateCounter);
      },
      once: true
    });
  });

  // ═══ SCATTER PHOTOS REVEAL ═══
  gsap.utils.toArray('.scatter-img').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 95%',
      onEnter: () => el.classList.add('visible'),
      once: true
    });
  });

  gsap.utils.toArray('.counter').forEach((el) => {
    const parent = el.closest('.reveal');
    if (!parent) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => animateCounter(el),
        once: true
      });
    }
  });

  // ═══ COUNTER ANIMATION ═══
  function animateCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimal || '0');

    gsap.to(el, {
      innerText: target,
      duration: 2.2,
      ease: 'power3.out',
      onUpdate: function() {
        const val = parseFloat(el.innerText);
        if (decimals > 0) {
          el.innerText = val.toFixed(decimals);
        } else {
          el.innerText = Math.round(val).toLocaleString();
        }
      }
    });
  }

  // ═══ HORIZONTAL MARQUEE SCROLL ═══
  // Marquee text strips that move horizontally as user scrolls vertically
  gsap.utils.toArray('.marquee-track').forEach((track) => {
    const direction = track.dataset.direction === 'right' ? 1 : -1;
    const speed = parseFloat(track.dataset.speed || '1');

    gsap.to(track, {
      xPercent: direction * 100 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: track.closest('.marquee'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  });

  // ═══ PARALLAX ELEMENTS ═══
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0.3');
    gsap.to(el, {
      yPercent: speed * -30,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  // ═══ PINNED SECTIONS — Initialized after window load ═══
  function initPinnedSections() {

    // ─── TIME SHIFT DEMO: Daylight → Golden → Twilight ───
    const tsPin = document.getElementById('tsPin');
    const tsGolden = document.getElementById('tsGolden');
    const tsTwilight = document.getElementById('tsTwilight');
    const tsLabelDay = document.getElementById('tsLabelDay');
    const tsLabelGolden = document.getElementById('tsLabelGolden');
    const tsLabelTwilight = document.getElementById('tsLabelTwilight');

    if (tsPin && tsGolden && tsTwilight) {
      const tsSticky = tsPin.querySelector('.pin-sticky');
      const tsHeader = tsPin.querySelector('.pin-header');

      const tsTl = gsap.timeline({
        scrollTrigger: {
          trigger: tsPin,
          start: 'top top',
          end: '+=2400',
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
          onEnter: () => tsPin.classList.add('is-pinned'),
          onEnterBack: () => tsPin.classList.add('is-pinned'),
          onLeave: () => tsPin.classList.remove('is-pinned'),
          onLeaveBack: () => tsPin.classList.remove('is-pinned'),
          onUpdate: (self) => {
            const p = self.progress;
            if (tsSticky) tsSticky.style.setProperty('--progress', (p * 100) + '%');
            if (tsHeader) tsHeader.style.transform = `translateY(${p * -20}px)`;

            let active = 'day';
            if (p >= 0.6) active = 'twilight';
            else if (p >= 0.28) active = 'golden';
            tsLabelDay.classList.toggle('active', active === 'day');
            tsLabelGolden.classList.toggle('active', active === 'golden');
            tsLabelTwilight.classList.toggle('active', active === 'twilight');
          }
        }
      });

      // Smoother fade timing - more gradual transitions, less "snap"
      tsTl
        .to({}, { duration: 0.12 })
        .to(tsGolden, { opacity: 1, duration: 0.38, ease: 'sine.inOut' })
        .to({}, { duration: 0.10 })
        .to(tsTwilight, { opacity: 1, duration: 0.38, ease: 'sine.inOut' })
        .to({}, { duration: 0.12 });
    }

    // ─── STAGING DEMO: Empty → Styled ───
    const sgPin = document.getElementById('sgPin');
    const sgStaged = document.getElementById('sgStaged');
    const sgFill = document.getElementById('sgProgressFill');
    const sgLabelEmpty = document.getElementById('sgLabelEmpty');
    const sgLabelStaged = document.getElementById('sgLabelStaged');

    if (sgPin && sgStaged) {
      const sgSticky = sgPin.querySelector('.pin-sticky');
      const sgHeader = sgPin.querySelector('.pin-header');

      gsap.to(sgStaged, {
        opacity: 1,
        ease: 'sine.inOut',
        scrollTrigger: {
          trigger: sgPin,
          start: 'top top',
          end: '+=1800',
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
          onEnter: () => sgPin.classList.add('is-pinned'),
          onEnterBack: () => sgPin.classList.add('is-pinned'),
          onLeave: () => sgPin.classList.remove('is-pinned'),
          onLeaveBack: () => sgPin.classList.remove('is-pinned'),
          onUpdate: (self) => {
            const p = self.progress;
            if (sgSticky) sgSticky.style.setProperty('--progress', (p * 100) + '%');
            if (sgHeader) sgHeader.style.transform = `translateY(${p * -20}px)`;
            if (sgFill) sgFill.style.width = (p * 100) + '%';
            if (sgLabelEmpty) sgLabelEmpty.classList.toggle('active', p < 0.5);
            if (sgLabelStaged) sgLabelStaged.classList.toggle('active', p >= 0.5);
          }
        }
      });
    }
  }

  if (document.readyState === 'complete') {
    initPinnedSections();
  } else {
    window.addEventListener('load', initPinnedSections);
  }

  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });

})();

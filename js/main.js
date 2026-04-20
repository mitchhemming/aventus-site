/* ═══════════════════════════════════════════════════════════
   AVENTUS — Main JS
   Lenis smooth scroll + GSAP ScrollTrigger animations
   + clickable pin state labels + scan line sync
═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // ═══ LENIS SMOOTH SCROLL ═══
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
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

  // ═══ SCATTER PHOTOS REVEAL ═══
  gsap.utils.toArray('.scatter-img').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 95%',
      onEnter: () => el.classList.add('visible'),
      once: true
    });
  });

  // ═══ COUNTER ANIMATION ═══
  function animateCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimal || '0');

    gsap.to(el, {
      innerText: target,
      duration: 2.4,
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

  // ═══ MARQUEE ═══
  gsap.utils.toArray('.marquee-track').forEach((track) => {
    const direction = track.dataset.direction === 'right' ? 1 : -1;
    const speed = parseFloat(track.dataset.speed || '0.5');

    gsap.to(track, {
      xPercent: direction * 60 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: track.closest('.marquee'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2.5,
      }
    });
  });

  // ═══ PARALLAX ═══
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

  // ═══ PINNED SECTIONS ═══
  function initPinnedSections() {

    // ─── TIME SHIFT DEMO: Daylight → Golden → Twilight ───
    const tsPin = document.getElementById('tsPin');
    const tsGolden = document.getElementById('tsGolden');
    const tsTwilight = document.getElementById('tsTwilight');
    const tsScan = document.getElementById('tsScan');
    const tsLabelDay = document.getElementById('tsLabelDay');
    const tsLabelGolden = document.getElementById('tsLabelGolden');
    const tsLabelTwilight = document.getElementById('tsLabelTwilight');

    if (tsPin && tsGolden && tsTwilight) {
      const tsSticky = tsPin.querySelector('.pin-sticky');
      const tsHeader = tsPin.querySelector('.pin-header');

      // Scroll-driven timeline
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
          onLeave: () => {
            tsPin.classList.remove('is-pinned');
            tsPin.classList.add('pin-complete');
          },
          onLeaveBack: () => tsPin.classList.remove('is-pinned'),
          onUpdate: (self) => {
            const p = self.progress;
            if (tsSticky) tsSticky.style.setProperty('--progress', (p * 100) + '%');
            if (tsHeader) tsHeader.style.transform = `translateY(${p * -20}px)`;

            // State labels
            let active = 'day';
            if (p >= 0.60) active = 'twilight';
            else if (p >= 0.28) active = 'golden';
            tsLabelDay.classList.toggle('active', active === 'day');
            tsLabelGolden.classList.toggle('active', active === 'golden');
            tsLabelTwilight.classList.toggle('active', active === 'twilight');

            // Sync scan line with transition windows
            // Transition 1: day → golden (0.15 to 0.35)
            // Transition 2: golden → twilight (0.50 to 0.70)
            if (tsScan) {
              let scanOpacity = 0;
              let scanPos = 0;
              if (p >= 0.15 && p <= 0.35) {
                scanOpacity = 1;
                scanPos = ((p - 0.15) / 0.20) * 100;
              } else if (p >= 0.50 && p <= 0.70) {
                scanOpacity = 1;
                scanPos = ((p - 0.50) / 0.20) * 100;
              }
              tsScan.style.opacity = scanOpacity;
              tsScan.style.transform = `translateX(${scanPos}%)`;
            }
          }
        }
      });

      tsTl
        .to({}, { duration: 0.15 })
        .to(tsGolden, { opacity: 1, duration: 0.35, ease: 'sine.inOut' })
        .to({}, { duration: 0.15 })
        .to(tsTwilight, { opacity: 1, duration: 0.35, ease: 'sine.inOut' })
        .to({}, { duration: 0.15 });

      // Click interactions - only active after pin is complete
      function setTsState(state) {
        if (!tsPin.classList.contains('pin-complete')) return;

        tsLabelDay.classList.toggle('active', state === 'day');
        tsLabelGolden.classList.toggle('active', state === 'golden');
        tsLabelTwilight.classList.toggle('active', state === 'twilight');

        const goldenOp = state === 'day' ? 0 : 1;
        const twilightOp = state === 'twilight' ? 1 : 0;

        gsap.to(tsGolden, { opacity: goldenOp, duration: 0.6, ease: 'sine.inOut' });
        gsap.to(tsTwilight, { opacity: twilightOp, duration: 0.6, ease: 'sine.inOut' });

        // Brief scan line sweep for visual feedback
        if (tsScan) {
          gsap.fromTo(tsScan,
            { opacity: 1, x: '0%' },
            {
              opacity: 0, x: (tsScan.parentElement.offsetWidth) + 'px',
              duration: 0.6, ease: 'sine.inOut'
            }
          );
        }
      }

      tsLabelDay.addEventListener('click', () => setTsState('day'));
      tsLabelGolden.addEventListener('click', () => setTsState('golden'));
      tsLabelTwilight.addEventListener('click', () => setTsState('twilight'));
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
          onLeave: () => {
            sgPin.classList.remove('is-pinned');
            sgPin.classList.add('pin-complete');
          },
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

      // Click interactions - only active after pin is complete
      function setSgState(state) {
        if (!sgPin.classList.contains('pin-complete')) return;

        sgLabelEmpty.classList.toggle('active', state === 'empty');
        sgLabelStaged.classList.toggle('active', state === 'staged');

        gsap.to(sgStaged, {
          opacity: state === 'staged' ? 1 : 0,
          duration: 0.6,
          ease: 'sine.inOut'
        });
        if (sgFill) {
          gsap.to(sgFill, {
            width: state === 'staged' ? '100%' : '0%',
            duration: 0.6,
            ease: 'sine.inOut'
          });
        }
      }

      sgLabelEmpty.addEventListener('click', () => setSgState('empty'));
      sgLabelStaged.addEventListener('click', () => setSgState('staged'));
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

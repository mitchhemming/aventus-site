/* ═══════════════════════════════════════════════════════════
   AVENTUS — Main JS
   GSAP + ScrollTrigger scroll animations
   + ambient motion during pinned sections
═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

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
          end: '+=2000',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          onEnter: () => tsPin.classList.add('is-pinned'),
          onEnterBack: () => tsPin.classList.add('is-pinned'),
          onLeave: () => tsPin.classList.remove('is-pinned'),
          onLeaveBack: () => tsPin.classList.remove('is-pinned'),
          onUpdate: (self) => {
            const p = self.progress;

            // Progress bar at top of sticky
            if (tsSticky) tsSticky.style.setProperty('--progress', (p * 100) + '%');

            // Subtle header drift
            if (tsHeader) tsHeader.style.transform = `translateY(${p * -16}px)`;

            // State labels
            let active = 'day';
            if (p >= 0.6) active = 'twilight';
            else if (p >= 0.25) active = 'golden';
            tsLabelDay.classList.toggle('active', active === 'day');
            tsLabelGolden.classList.toggle('active', active === 'golden');
            tsLabelTwilight.classList.toggle('active', active === 'twilight');
          }
        }
      });

      tsTl
        .to({}, { duration: 0.15 })
        .to(tsGolden, { opacity: 1, duration: 0.3, ease: 'power1.inOut' })
        .to({}, { duration: 0.15 })
        .to(tsTwilight, { opacity: 1, duration: 0.3, ease: 'power1.inOut' })
        .to({}, { duration: 0.1 });
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
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: sgPin,
          start: 'top top',
          end: '+=1600',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          onEnter: () => sgPin.classList.add('is-pinned'),
          onEnterBack: () => sgPin.classList.add('is-pinned'),
          onLeave: () => sgPin.classList.remove('is-pinned'),
          onLeaveBack: () => sgPin.classList.remove('is-pinned'),
          onUpdate: (self) => {
            const p = self.progress;

            if (sgSticky) sgSticky.style.setProperty('--progress', (p * 100) + '%');
            if (sgHeader) sgHeader.style.transform = `translateY(${p * -16}px)`;
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

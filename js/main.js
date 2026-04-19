/* ═══════════════════════════════════════════════════════════
   AVENTUS — Main JS
   GSAP + ScrollTrigger scroll animations
═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // Register GSAP plugins
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

  // ═══ HERO — PORSCHE DAY → TWILIGHT ═══
  const heroDay = document.getElementById('heroDay');
  const heroBadge = document.getElementById('heroBadgeState');

  if (heroDay) {
    gsap.to(heroDay, {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
        onUpdate: (self) => {
          if (heroBadge) {
            heroBadge.textContent = self.progress > 0.5 ? 'Twilight' : 'Daylight';
          }
        }
      }
    });
  }

  // ═══ REVEAL ANIMATIONS ═══
  gsap.utils.toArray('.reveal').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        el.classList.add('visible');
        // Fire counters if present
        el.querySelectorAll('.counter').forEach(animateCounter);
      },
      once: true
    });
  });

  // Also observe counters inside stat items and foundation
  gsap.utils.toArray('.counter').forEach((el) => {
    const parent = el.closest('.reveal') || el.closest('section');
    if (!parent) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
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
    const duration = 2.2;

    gsap.to(el, {
      innerText: target,
      duration: duration,
      ease: 'power3.out',
      snap: decimals === 0 ? { innerText: 1 } : undefined,
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

  // ═══ TIME SHIFT DEMO (Daylight → Golden → Twilight) ═══
  const tsPin = document.getElementById('tsPin');
  const tsGolden = document.getElementById('tsGolden');
  const tsTwilight = document.getElementById('tsTwilight');
  const tsLabelDay = document.getElementById('tsLabelDay');
  const tsLabelGolden = document.getElementById('tsLabelGolden');
  const tsLabelTwilight = document.getElementById('tsLabelTwilight');

  if (tsPin && tsGolden && tsTwilight) {
    // Set wrapper height to allow scroll distance (3x viewport)
    tsPin.style.height = '300vh';

    // Create a timeline tied to scroll
    const tsTl = gsap.timeline({
      scrollTrigger: {
        trigger: tsPin,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        pin: '.pin-sticky',
        pinType: 'fixed',
        anticipatePin: 1
      }
    });

    // Phases: day hold → fade to golden → golden hold → fade to twilight → twilight hold
    tsTl
      .to({}, { duration: 0.2 }) // hold day
      .to(tsGolden, { opacity: 1, duration: 0.2, ease: 'power1.inOut' })
      .to({}, { duration: 0.2 }) // hold golden
      .to(tsTwilight, { opacity: 1, duration: 0.2, ease: 'power1.inOut' })
      .to({}, { duration: 0.2 }); // hold twilight

    // Update labels based on scroll progress
    ScrollTrigger.create({
      trigger: tsPin,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        let active = 'day';
        if (p >= 0.6) active = 'twilight';
        else if (p >= 0.25) active = 'golden';

        tsLabelDay.classList.toggle('active', active === 'day');
        tsLabelGolden.classList.toggle('active', active === 'golden');
        tsLabelTwilight.classList.toggle('active', active === 'twilight');
      }
    });
  }

  // ═══ STAGING DEMO (Empty → Styled) ═══
  const sgPin = document.getElementById('sgPin');
  const sgStaged = document.getElementById('sgStaged');
  const sgFill = document.getElementById('sgProgressFill');
  const sgLabelEmpty = document.getElementById('sgLabelEmpty');
  const sgLabelStaged = document.getElementById('sgLabelStaged');

  if (sgPin && sgStaged) {
    sgPin.style.height = '250vh';

    gsap.to(sgStaged, {
      opacity: 1,
      ease: 'power1.inOut',
      scrollTrigger: {
        trigger: sgPin,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        pin: sgPin.querySelector('.pin-sticky'),
        pinType: 'fixed',
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          // Start staging fade at 20%, complete by 70%
          const staged = Math.max(0, Math.min(1, (p - 0.2) / 0.5));
          if (sgFill) sgFill.style.width = (staged * 100) + '%';
          if (sgLabelEmpty) sgLabelEmpty.classList.toggle('active', staged < 0.5);
          if (sgLabelStaged) sgLabelStaged.classList.toggle('active', staged >= 0.5);
        }
      }
    });
  }

  // ═══ REFRESH ON LOAD (images may have loaded after initial measurement) ═══
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

})();

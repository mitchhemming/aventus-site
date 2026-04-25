/* ═══════════════════════════════════════════════════════════
   AVENTUS — Main JS
   Native browser scroll + GSAP ScrollTrigger animations
═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // ═══ NAV SCROLL STATE ═══
  const nav = document.getElementById('nav');
  ScrollTrigger.create({
    start: 50,
    end: 99999,
    onUpdate: (self) => {
      const scrolled = self.scroll() > 50;
      nav.classList.toggle('scrolled', scrolled);
      document.body.classList.toggle('scrolled', scrolled);
    }
  });

  // ═══ LOGO CLICK — instant scroll to top ═══
  const navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    navLogo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo(0, 0);
    });
  }

  // ═══ REVEAL ANIMATIONS — re-triggerable only when scrolling back up past element ═══
  gsap.utils.toArray('.reveal').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      onEnter: () => {
        el.classList.add('visible');
        el.querySelectorAll('.counter').forEach(animateCounter);
      },
      onEnterBack: () => {
        el.classList.add('visible');
        el.querySelectorAll('.counter').forEach(animateCounter);
      },
      onLeaveBack: () => {
        el.classList.remove('visible');
        el.querySelectorAll('.counter').forEach(c => {
          delete c.dataset.done;
          c.innerText = '0';
        });
      }
    });

    // Show immediately if already in viewport on page load
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      el.classList.add('visible');
    }
  });

  gsap.utils.toArray('.counter').forEach((el) => {
    const parent = el.closest('.reveal');
    if (!parent) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        onEnter: () => animateCounter(el),
        onLeaveBack: () => {
          delete el.dataset.done;
          el.innerText = '0';
        }
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

  // ═══ UNIFIED HEADING — cinematic entrance (4 directions staggered) ═══
  const unifiedHeading = document.getElementById('unifiedHeading');
  if (unifiedHeading) {
    ScrollTrigger.create({
      trigger: unifiedHeading,
      start: 'top 78%',
      onEnter: () => unifiedHeading.classList.add('visible'),
      once: true
    });
  }

  // ═══ INTRO STATEMENT — cinematic 3-line entrance ═══
  const introBlock = document.getElementById('introBlock');
  if (introBlock) {
    ScrollTrigger.create({
      trigger: introBlock,
      start: 'top 85%',
      onEnter: () => introBlock.classList.add('visible'),
      onEnterBack: () => introBlock.classList.add('visible'),
      onLeaveBack: () => introBlock.classList.remove('visible')
    });

    // If already in viewport at load, trigger immediately with slight delay for drama
    const rect = introBlock.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
      setTimeout(() => introBlock.classList.add('visible'), 200);
    }
  }

  // Marquees are auto-scrolling via CSS animation, no JS needed

  // ═══ MOBILE MOMENT — fade-in entry, gold halo glow ═══
  // Phone and side text use simple .reveal class for fade-in.
  // No parallax — keeps the phone in its natural padded position.
  const mobileMoment = document.getElementById('mobileMoment');
  if (mobileMoment) {
    ScrollTrigger.create({
      trigger: mobileMoment,
      start: 'top 75%',
      end: 'bottom 25%',
      onEnter: () => mobileMoment.classList.add('in-view'),
      onEnterBack: () => mobileMoment.classList.add('in-view'),
      onLeave: () => mobileMoment.classList.remove('in-view'),
      onLeaveBack: () => mobileMoment.classList.remove('in-view')
    });
  }

  // ═══ AGENCY OFFER — sequenced Path 1 then Path 2 reveal ═══
  // DEFENSIVE PATTERN: cards are visible by default in CSS. JS opts them
  // into the load animation by adding .needs-reveal to the section. If JS
  // throws or fails to run, cards stay visible — never invisible.
  const offerSection = document.querySelector('.agency-offer');
  if (offerSection) {
    const offerCards = Array.from(offerSection.querySelectorAll('.offer-card'));
    const PATH_GAP = 700; // ms between Path 1 and Path 2 starting

    // Step 1: opt into the animation. CSS hides cards from this moment.
    offerSection.classList.add('needs-reveal');

    const runOfferReveal = () => {
      offerCards.forEach((card, i) => {
        if (card._revealTimer) clearTimeout(card._revealTimer);
        card._revealTimer = setTimeout(() => {
          card.classList.add('revealed');
        }, i * PATH_GAP);
      });
    };

    const resetOfferReveal = () => {
      offerCards.forEach((card) => {
        if (card._revealTimer) clearTimeout(card._revealTimer);
        card.classList.remove('revealed');
        void card.offsetHeight;
      });
    };

    ScrollTrigger.create({
      trigger: offerSection,
      start: 'top 85%',
      end: 'bottom 15%',
      onEnter: runOfferReveal,
      onEnterBack: runOfferReveal,
      onLeave: resetOfferReveal,
      onLeaveBack: resetOfferReveal
    });

    // SAFETY NET: if section is in viewport at page load, fire immediately.
    const rect = offerSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
      runOfferReveal();
    }

    // FAILSAFE: after 3s, force-reveal anything still hidden. Last line of
    // defence. Combined with the visible-by-default CSS, users will never
    // see permanently empty cards.
    setTimeout(() => {
      offerCards.forEach((card) => {
        if (!card.classList.contains('revealed')) {
          card.classList.add('revealed');
        }
      });
    }, 3000);
  }

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

    // Capabilities grid uses pure CSS hover — no JS needed

    // ─── TIME SHIFT DEMO: Daylight → Golden → Twilight (clip-path reveal, like the hero) ───
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

      // Start state: golden and twilight both fully clipped from left (hidden)
      // As scroll progresses, we unclip them in sequence to reveal
      gsap.set(tsGolden, { opacity: 1, clipPath: 'inset(0 100% 0 0)' });
      gsap.set(tsTwilight, { opacity: 1, clipPath: 'inset(0 100% 0 0)' });

      ScrollTrigger.create({
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

          // Stage 1 (0.15-0.40): Golden reveals via clip wipe left→right
          // Stage 2 (0.55-0.80): Twilight reveals via clip wipe left→right
          let goldenReveal = 0;
          let twilightReveal = 0;
          let scanActive = false;
          let scanPos = 0;

          if (p < 0.15) {
            goldenReveal = 0;
            twilightReveal = 0;
          } else if (p < 0.40) {
            goldenReveal = (p - 0.15) / 0.25;
            scanActive = true;
            scanPos = goldenReveal * 100;
          } else if (p < 0.55) {
            goldenReveal = 1;
            twilightReveal = 0;
          } else if (p < 0.80) {
            goldenReveal = 1;
            twilightReveal = (p - 0.55) / 0.25;
            scanActive = true;
            scanPos = twilightReveal * 100;
          } else {
            goldenReveal = 1;
            twilightReveal = 1;
          }

          // Apply clip-path reveals
          tsGolden.style.clipPath = `inset(0 ${(1 - goldenReveal) * 100}% 0 0)`;
          tsTwilight.style.clipPath = `inset(0 ${(1 - twilightReveal) * 100}% 0 0)`;

          // Scan line follows the reveal edge
          if (tsScan) {
            tsScan.style.opacity = scanActive ? 1 : 0;
            tsScan.style.left = scanPos + '%';
          }

          // Labels
          let active = 'day';
          if (p >= 0.60) active = 'twilight';
          else if (p >= 0.28) active = 'golden';
          tsLabelDay.classList.toggle('active', active === 'day');
          tsLabelGolden.classList.toggle('active', active === 'golden');
          tsLabelTwilight.classList.toggle('active', active === 'twilight');
        }
      });

      // Click-to-preview after pin complete
      function setTsState(state) {
        if (!tsPin.classList.contains('pin-complete')) return;

        tsLabelDay.classList.toggle('active', state === 'day');
        tsLabelGolden.classList.toggle('active', state === 'golden');
        tsLabelTwilight.classList.toggle('active', state === 'twilight');

        const goldenClip = state === 'day' ? 'inset(0 100% 0 0)' : 'inset(0 0% 0 0)';
        const twilightClip = state === 'twilight' ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)';

        gsap.to(tsGolden, { clipPath: goldenClip, duration: 0.7, ease: 'sine.inOut' });
        gsap.to(tsTwilight, { clipPath: twilightClip, duration: 0.7, ease: 'sine.inOut' });
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
          end: '+=800',
          scrub: 1,
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

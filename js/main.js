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
        // Reset counters so they re-animate next time they enter
        el.querySelectorAll('.counter').forEach(c => {
          delete c.dataset.done;
          c.innerText = '0';
        });
      }
      // NOTE: no onLeave - once shown on scroll down, stays shown
    });
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

  // ═══ METRIC ROWS — staggered reveal + vertical scan line growth ═══
  const metricsSection = document.querySelector('.agency-metrics');
  const metricScan = document.querySelector('.metric-scan');
  if (metricsSection) {
    // Stagger row visibility on scroll
    const metricRows = metricsSection.querySelectorAll('.metric-row');
    metricRows.forEach((row) => {
      ScrollTrigger.create({
        trigger: row,
        start: 'top 85%',
        onEnter: () => {
          row.classList.add('visible');
          row.querySelectorAll('.counter').forEach(animateCounter);
        },
        once: true
      });
    });

    // Vertical scan line grows as scroll passes through section
    if (metricScan) {
      ScrollTrigger.create({
        trigger: metricsSection,
        start: 'top 70%',
        end: 'bottom 80%',
        scrub: 0.5,
        onUpdate: (self) => {
          metricScan.style.height = (self.progress * 100) + '%';
        }
      });
    }
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

  // ═══ INTRO STATEMENT — word-by-word reveal ═══
  const introText = document.getElementById('introText');
  if (introText) {
    // Wrap every text word in a span, preserving child element structure (em tags)
    function wrapWords(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const frag = document.createDocumentFragment();
        const tokens = text.split(/(\s+)/);
        tokens.forEach(token => {
          if (token.trim() === '') {
            frag.appendChild(document.createTextNode(token));
          } else {
            const span = document.createElement('span');
            span.className = 'intro-word';
            span.textContent = token;
            frag.appendChild(span);
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(wrapWords);
      }
    }
    wrapWords(introText);

    const words = introText.querySelectorAll('.intro-word');
    words.forEach((w, i) => {
      w.style.transitionDelay = (i * 0.04) + 's';
    });

    ScrollTrigger.create({
      trigger: introText,
      start: 'top 82%',
      onEnter: () => introText.classList.add('words-in'),
      once: true
    });
  }

  // Marquees are auto-scrolling via CSS animation, no JS needed

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

    // ─── CAPABILITIES: Staggered before/after reveal on scroll (no pin) ───
    const capPin = document.getElementById('capPin');
    if (capPin) {
      const capItems = Array.from(capPin.querySelectorAll('.cap-item'));
      const totalTiles = capItems.length;
      const tileData = capItems.map((item) => ({
        item,
        after: item.querySelector('.cap-after'),
        scan: item.querySelector('.cap-scan')
      }));

      // Fade in the tile images as the capabilities section enters viewport (re-triggerable on scroll-up only)
      capItems.forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 90%',
          onEnter: () => item.classList.add('image-visible'),
          onEnterBack: () => item.classList.add('image-visible'),
          onLeaveBack: () => item.classList.remove('image-visible')
        });
      });

      // Scroll-driven clip-path reveal (after fade-in)
      ScrollTrigger.create({
        trigger: capPin,
        start: 'top 60%',
        end: 'bottom 30%',
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          const activeP = Math.max(0, Math.min(1, (p - 0.1) / 0.8));
          const tileShare = 1 / totalTiles;

          tileData.forEach(({ after, scan }, i) => {
            const tileStart = i * tileShare;
            const tileEnd = (i + 1) * tileShare;

            let local = 0;
            if (activeP >= tileEnd) local = 1;
            else if (activeP > tileStart) local = (activeP - tileStart) / tileShare;

            if (after) {
              after.style.clipPath = `inset(0 ${(1 - local) * 100}% 0 0)`;
            }

            if (scan) {
              if (local > 0 && local < 1) {
                scan.style.opacity = 1;
                scan.style.left = (local * 100) + '%';
              } else {
                scan.style.opacity = 0;
                scan.style.left = (local * 100) + '%';
              }
            }
          });
        }
      });
    }

    // ─── TIME SHIFT DEMO: Daylight → Golden → Twilight (clip-path reveal, like the hero) ───

    // ─── TIME SHIFT DEMO: Daylight → Golden → Twilight (clip-path reveal, like the hero) ───

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
          end: '+=1200',
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

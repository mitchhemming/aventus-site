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

  // ═══ CONTACT FORM — soft-highlight sequence + Formspree submission ═══
  // All questions render at once. JS marks the next-uncompleted one as
  // .is-active so it glows, and adds .is-complete to answered questions.
  // Submission goes via fetch so the user stays on-page and we show a
  // thank-you state without a redirect.
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const questions = Array.from(contactForm.querySelectorAll('.cf-q'));
    const statusEl = contactForm.querySelector('.cf-status');
    const submitBtn = contactForm.querySelector('.cf-submit');

    // Determine if a question is "answered".
    // Radios: complete when one is checked.
    // Text/textarea: complete only when the user has EXPLICITLY confirmed
    //   (clicked Next, pressed Enter, or submitted). Just typing isn't enough.
    //   We track confirmed state via a data attribute on the question.
    const isQuestionAnswered = (q) => {
      const radios = q.querySelectorAll('input[type="radio"]');
      if (radios.length) return Array.from(radios).some(r => r.checked);
      // Text question — must be confirmed AND have content
      if (q.dataset.confirmed === 'true') {
        const textInputs = q.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
        return Array.from(textInputs).every(el => el.value.trim().length > 0);
      }
      return false;
    };

    // Refresh active/complete classes across all questions.
    // The first unanswered question becomes .is-active.
    const refreshState = () => {
      let activeFound = false;
      questions.forEach((q) => {
        const answered = isQuestionAnswered(q);
        q.classList.toggle('is-complete', answered);
        if (!answered && !activeFound) {
          q.classList.add('is-active');
          activeFound = true;
        } else {
          q.classList.remove('is-active');
        }
      });
      // If everything is answered, mark the last question active for visual continuity
      if (!activeFound && questions.length) {
        questions[questions.length - 1].classList.add('is-active');
      }
    };

    // Helper: mark a text question as confirmed and refresh state
    const confirmTextQuestion = (q) => {
      const field = q.querySelector('input:not([type="radio"]), textarea');
      if (!field || field.value.trim().length === 0) {
        // Empty: don't confirm. Just focus the field so user knows what to do.
        if (field) field.focus();
        return false;
      }
      q.dataset.confirmed = 'true';
      refreshState();
      return true;
    };

    // Helper: advance from a question to the next .cf-q
    // Scrolls it into view and focuses its first interactive field.
    const advanceFrom = (currentQ) => {
      if (!currentQ) return;
      const nextQ = currentQ.nextElementSibling;
      if (nextQ && nextQ.classList && nextQ.classList.contains('cf-q')) {
        nextQ.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const firstField = nextQ.querySelector('input:not([type="radio"]), textarea');
          if (firstField) firstField.focus({ preventScroll: true });
        }, 350);
      } else {
        if (submitBtn) submitBtn.focus({ preventScroll: true });
      }
    };

    // Wire events on form fields
    contactForm.querySelectorAll('input, textarea').forEach((el) => {
      // Radio: selecting an option auto-advances and marks complete
      if (el.type === 'radio') {
        el.addEventListener('change', () => {
          refreshState();
          advanceFrom(el.closest('.cf-q'));
        });
      }

      // Text/email/tel: only listen to Enter for advance.
      // No 'input' listener — typing does NOT change state.
      // If user edits a previously-confirmed field, un-confirm it so they
      // have to press Next/Enter again to lock it back in.
      if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'email' || el.type === 'tel')) {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const q = el.closest('.cf-q');
            if (confirmTextQuestion(q)) {
              advanceFrom(q);
            }
          }
        });
        el.addEventListener('input', () => {
          const q = el.closest('.cf-q');
          if (q.dataset.confirmed === 'true') {
            q.dataset.confirmed = 'false';
            refreshState();
          }
        });
      }

      // Textarea: same un-confirm behaviour on input. Enter doesn't advance
      // (Enter inserts a newline, which is normal textarea UX). User clicks
      // the Next button to advance.
      if (el.tagName === 'TEXTAREA') {
        el.addEventListener('input', () => {
          const q = el.closest('.cf-q');
          if (q.dataset.confirmed === 'true') {
            q.dataset.confirmed = 'false';
            refreshState();
          }
        });
      }
    });

    // Next button click: confirm and advance
    contactForm.querySelectorAll('.cf-next').forEach((btn) => {
      btn.addEventListener('click', () => {
        const q = btn.closest('.cf-q');
        if (confirmTextQuestion(q)) {
          advanceFrom(q);
        }
      });
    });

    // Set initial state
    refreshState();

    // Submit via fetch so we can show inline success/error without redirect
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Native validity check first
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        statusEl.textContent = 'Please complete all questions before submitting.';
        statusEl.className = 'cf-status is-error';
        return;
      }

      submitBtn.disabled = true;
      const originalText = submitBtn.querySelector('.cf-submit-text').textContent;
      submitBtn.querySelector('.cf-submit-text').textContent = 'Sending…';
      statusEl.textContent = '';
      statusEl.className = 'cf-status';

      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          contactForm.classList.add('is-submitted');
          // Scroll the thanks block into view
          const thanks = contactForm.querySelector('.cf-thanks');
          if (thanks) {
            thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          const data = await response.json().catch(() => ({}));
          const msg = (data.errors && data.errors[0] && data.errors[0].message)
            ? data.errors[0].message
            : 'Something went wrong. Please try again or email bookings@aventusmedia.com.au directly.';
          statusEl.textContent = msg;
          statusEl.className = 'cf-status is-error';
          submitBtn.disabled = false;
          submitBtn.querySelector('.cf-submit-text').textContent = originalText;
        }
      } catch (err) {
        statusEl.textContent = 'Network error. Please try again or email bookings@aventusmedia.com.au directly.';
        statusEl.className = 'cf-status is-error';
        submitBtn.disabled = false;
        submitBtn.querySelector('.cf-submit-text').textContent = originalText;
      }
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

  // Agency offer cards are visible by default — no JS load animation needed.
  // The section-heading and subhead use the standard .reveal class which
  // handles their fade-in on scroll alongside everything else on the site.

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

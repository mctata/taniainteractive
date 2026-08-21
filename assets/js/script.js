// ============================================
  // ANALYTICS: UMAMI
  // Single helper used by every tracked interaction below.
  // Umami is cookie-free and loads unconditionally via the
  // <script data-website-id> tags in <head>, so there is no
  // consent gate to check here.
  // ============================================
  function trackEvent(name, data) {
    data = data || {};
    if (window.umami) window.umami.track(name, data);
  }

  // ============================================
  // THEME TOGGLE
  // CSS handles icon visibility via [data-theme]
  // JS handles persistence, aria-label, and Umami tracking
  // ============================================
  const themeToggle = document.querySelector('.theme-toggle');

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.setAttribute('aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
    document.querySelector('meta[name="theme-color"]').setAttribute('content',
      theme === 'dark' ? '#0D0D0D' : '#FFFFFF'
    );
  }

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    trackEvent('theme_toggle', { theme: newTheme });
  });

  // Listen for OS preference changes (if no manual override)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Set initial aria-label
  const initTheme = document.documentElement.getAttribute('data-theme');
  themeToggle.setAttribute('aria-label',
    initTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );

  // ============================================
  // SCROLL REVEALS
  // ============================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  // ============================================
  // NAV: Scroll border
  // ============================================
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ============================================
  // NAV: Mobile hamburger
  // ============================================
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-links');
  const navOverlay = document.querySelector('.nav-overlay');

  function openNav() {
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    navMenu.classList.add('open');
    navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    navMenu.classList.remove('open');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });

  navOverlay.addEventListener('click', closeNav);
  navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      closeNav();
      navToggle.focus();
    }
  });

  // ============================================
  // EMAIL OBFUSCATION
  // Assemble email from data attributes at runtime
  // ============================================
  (function() {
    const el = document.getElementById('email-link');
    if (el) {
      const name = el.getAttribute('data-name');
      const domain = el.getAttribute('data-domain');
      const addr = name + '@' + domain;
      el.href = 'mai' + 'lto:' + addr;
      el.textContent = addr;
      el.removeAttribute('data-name');
      el.removeAttribute('data-domain');
    }
  })();

  // ============================================
  // CONTACT FORM (deferred - below fold)
  // Per-field validation + async Formspree submission
  // ============================================
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusEl = document.getElementById('form-status');
    if (!form) return;

    function validateField(input, errorId) {
      const error = document.getElementById(errorId);
      let msg = '';

      if (!input.value.trim()) {
        msg = input.name.charAt(0).toUpperCase() + input.name.slice(1) + ' is required.';
      } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        msg = 'Please enter a valid email address.';
      }

      error.textContent = msg;
      input.classList.toggle('invalid', !!msg);
      input.setAttribute('aria-invalid', !!msg);
      return !msg;
    }

    // Validate on blur
    ['contact-name', 'contact-email', 'contact-message'].forEach(id => {
      const input = document.getElementById(id);
      const errorId = id.replace('contact-', '') + '-error';
      input.addEventListener('blur', () => validateField(input, errorId));
      input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) validateField(input, errorId);
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot check
      if (document.getElementById('c-website').value) return;

      // Validate all fields
      const nameValid = validateField(document.getElementById('contact-name'), 'name-error');
      const emailValid = validateField(document.getElementById('contact-email'), 'email-error');
      const msgValid = validateField(document.getElementById('contact-message'), 'message-error');

      if (!nameValid || !emailValid || !msgValid) {
        const firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Submit
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      try {
        const data = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          statusEl.textContent = 'Message sent. Thank you!';
          statusEl.className = 'form-status success';
          trackEvent('form_submit', { form_name: 'contact' });
          form.reset();
          form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
          form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        statusEl.textContent = 'Something went wrong. Please try again or email me directly.';
        statusEl.className = 'form-status error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      }
    });
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initContactForm);
  } else {
    setTimeout(initContactForm, 1000);
  }

  // ============================================
  // ANALYTICS EVENTS: UMAMI (deferred to idle)
  // ============================================

  // Known ventures linked from this site. Fired as a dedicated
  // venture_click event (in addition to the generic outbound_click)
  // so click-through to each business can be its own Umami Goal.
  const VENTURES = {
    'stepify.it': 'stepify',
    'landingpad.digital': 'landingpad',
    'tangible-studios.com': 'tangible-studios'
  };

  function initTracking() {
    // Outbound link clicks
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      if (!link.href.includes('taniainteractive.co.uk')) {
        link.addEventListener('click', () => {
          trackEvent('outbound_click', {
            link_url: link.href,
            link_text: link.textContent.trim().substring(0, 100)
          });

          const ventureHost = Object.keys(VENTURES).find(host => link.href.includes(host));
          if (ventureHost) {
            trackEvent('venture_click', { venture: VENTURES[ventureHost] });
          }
          if (link.href.includes('linkedin.com')) {
            trackEvent('linkedin_click', {});
          }
        });
      }
    });

    // Email link click
    const emailLink = document.getElementById('email-link');
    if (emailLink) {
      emailLink.addEventListener('click', () => {
        trackEvent('email_click', {});
      });
    }

    // Section visibility tracking
    const sections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          trackEvent('section_view', { section_id: entry.target.id });

          // Dedicated event for the Ventures section specifically,
          // since it's the highest-value funnel step on this site.
          if (entry.target.id === 'ventures') {
            trackEvent('viewed_ventures', {});
          }

          sectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    sections.forEach(section => sectionObserver.observe(section));

    // CTA button clicks
    document.querySelectorAll('.btn, .nav-cta').forEach(btn => {
      btn.addEventListener('click', () => {
        trackEvent('cta_click', {
          cta_text: btn.textContent.trim(),
          cta_url: btn.href || btn.closest('a')?.href || ''
        });
      });
    });
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initTracking);
  } else {
    setTimeout(initTracking, 2000);
  }

// ============================================
// VIDEO: Lazy load + click to play/pause + Umami tracking
// ============================================
(function() {
  const video = document.getElementById('landingpad-video');
  const playBtn = document.getElementById('landingpad-play');
  if (!video || !playBtn) return;

  // Skip on mobile or reduced-motion (CSS hides video, shows poster)
  const isMobile = window.innerWidth <= 680;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isMobile || prefersReduced) return;

  // Lazy-load video source when scrolled near
  let videoLoaded = false;
  function loadVideo() {
    if (videoLoaded) return;
    const source = video.querySelector('source[data-src]');
    if (source) {
      source.src = source.getAttribute('data-src');
      source.removeAttribute('data-src');
      video.load();
      videoLoaded = true;
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadVideo();
        observer.unobserve(video);
      }
    });
  }, { rootMargin: '200px' });
  observer.observe(video);

  function play() {
    loadVideo();
    video.play().catch(() => {});
    playBtn.classList.add('hidden');
    playBtn.setAttribute('aria-label', 'Pause video');
    trackEvent('video_play', { video_name: 'landingpad-builder-demo' });
  }

  function pause() {
    video.pause();
    playBtn.classList.remove('hidden');
    playBtn.setAttribute('aria-label', 'Play video');
    trackEvent('video_pause', { video_name: 'landingpad-builder-demo' });
  }

  playBtn.addEventListener('click', play);

  video.addEventListener('click', () => {
    video.paused ? play() : pause();
  });

  video.addEventListener('ended', () => {
    playBtn.classList.remove('hidden');
    playBtn.setAttribute('aria-label', 'Play video');
    trackEvent('video_complete', { video_name: 'landingpad-builder-demo' });
  });
})();
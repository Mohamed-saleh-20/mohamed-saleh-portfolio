const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

function initNavigation() {
  const menu = document.getElementById('nav-menu');
  const toggle = document.getElementById('nav-burger');

  if (!menu || !toggle) return;

  const setMenuOpen = (isOpen) => {
    menu.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', isOpen);
  };

  toggle.addEventListener('click', () => {
    setMenuOpen(!menu.classList.contains('is-open'));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
}

function initTheme() {
  const button = document.getElementById('theme-toggle');
  const icon = button?.querySelector('i');

  const updateThemeControls = () => {
    const isLight = document.documentElement.dataset.theme === 'light';
    if (icon) icon.className = isLight ? 'ri-moon-line' : 'ri-sun-line';
    button?.setAttribute('aria-pressed', String(isLight));
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      isLight ? '#f5f5f7' : '#000000',
    );
  };

  updateThemeControls();
  button?.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;

    try {
      localStorage.setItem('theme', nextTheme);
    } catch {
      // Theme switching still works when browser storage is unavailable.
    }

    updateThemeControls();
  });
}

function initRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  if (REDUCED_MOTION.matches || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });

  elements.forEach((element) => observer.observe(element));
}

function initCountUps() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  counters.forEach((counter) => {
    const target = Number(counter.dataset.count);
    if (!Number.isFinite(target)) return;

    if (REDUCED_MOTION.matches || !('IntersectionObserver' in window)) {
      counter.textContent = String(target);
      return;
    }

    const observer = new IntersectionObserver(([entry], currentObserver) => {
      if (!entry.isIntersecting) return;

      const startTime = performance.now();
      const duration = 900;
      const animateCount = (time) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        counter.textContent = String(Math.round(target * easedProgress));

        if (progress < 1) requestAnimationFrame(animateCount);
      };

      requestAnimationFrame(animateCount);
      currentObserver.disconnect();
    }, { threshold: 0.7 });

    observer.observe(counter);
  });
}

function initAboutWordHighlight() {
  const paragraph = document.querySelector('[data-words]');
  if (!paragraph) return;

  const words = paragraph.textContent.trim().split(/\s+/);
  paragraph.replaceChildren(...words.map((word, index) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = `${word}${index < words.length - 1 ? ' ' : ''}`;
    return span;
  }));

  const wordSpans = [...paragraph.querySelectorAll('.word')];
  if (REDUCED_MOTION.matches) {
    wordSpans.forEach((word) => word.classList.add('is-lit'));
    return;
  }

  let framePending = false;
  const highlightVisibleWords = () => {
    framePending = false;
    const paragraphBottom = paragraph.getBoundingClientRect().bottom;
    const highlightLine = Math.min(window.innerHeight * 0.68, paragraphBottom);

    wordSpans.forEach((word, index) => {
      const threshold = window.innerHeight * (0.78 + (index / wordSpans.length) * 0.2);
      if (highlightLine > threshold) word.classList.add('is-lit');
    });
  };

  const scheduleHighlight = () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(highlightVisibleWords);
  };

  window.addEventListener('scroll', scheduleHighlight, { passive: true });
  window.addEventListener('resize', scheduleHighlight);
  highlightVisibleWords();
}

function initScrollStory() {
  if (REDUCED_MOTION.matches) return;

  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const heroVisual = document.querySelector('.hero__visual');
  const heroGlow = document.querySelector('.hero__glow');
  const projects = [...document.querySelectorAll('.project')];
  const sections = [...document.querySelectorAll('main > .section')];
  let framePending = false;

  const updateScrollStory = () => {
    framePending = false;
    const scrollableHeight = root.scrollHeight - window.innerHeight;
    const pageProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    root.style.setProperty('--scroll-progress', `${Math.min(pageProgress, 1) * 100}%`);

    sections.forEach((section) => {
      const bounds = section.getBoundingClientRect();
      const travel = Math.max(1, window.innerHeight + bounds.height);
      const progress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / travel));
      section.style.setProperty('--scene-progress', `${Math.round(progress * 100)}%`);
    });

    if (hero && heroVisual) {
      const heroProgress = Math.min(
        1,
        Math.max(0, -hero.getBoundingClientRect().top / Math.max(1, hero.offsetHeight)),
      );
      heroVisual.style.setProperty('--hero-shift', `${-34 * heroProgress}px`);
      heroVisual.style.setProperty('--hero-scale', String(1 - 0.045 * heroProgress));
      heroGlow?.style.setProperty('--glow-shift', `${28 * heroProgress}px`);
    }

    projects.forEach((project) => {
      const bounds = project.getBoundingClientRect();
      const distanceFromCenter = (bounds.top + bounds.height / 2 - window.innerHeight / 2)
        / window.innerHeight;
      const imageShift = Math.max(-34, Math.min(34, distanceFromCenter * -34));
      const cardTilt = Math.max(-8, Math.min(8, distanceFromCenter * 8));
      const focus = Math.max(0, 1 - Math.abs(distanceFromCenter) * 0.42);
      project.style.setProperty('--image-shift', `${imageShift}px`);
      project.style.setProperty('--card-tilt', `${cardTilt}deg`);
      project.style.setProperty('--card-focus', String(focus));
      project.style.setProperty('--card-scale', String(0.9 + focus * 0.1));
    });
  };

  const scheduleScrollStory = () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(updateScrollStory);
  };

  window.addEventListener('scroll', scheduleScrollStory, { passive: true });
  window.addEventListener('resize', scheduleScrollStory);
  updateScrollStory();
}

function initPageUtilities() {
  const backToTop = document.getElementById('to-top');
  const updateBackToTop = () => {
    backToTop?.classList.toggle('is-visible', window.scrollY > 500);
  };

  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();
  backToTop?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: REDUCED_MOTION.matches ? 'instant' : 'smooth',
    });
  });

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    status.textContent = 'Thanks for your message. Please email me directly at the address listed on my original site.';
    form.reset();
  });
}

function initPortfolio() {
  initNavigation();
  initTheme();
  initRevealAnimations();
  initCountUps();
  initAboutWordHighlight();
  initScrollStory();
  initPageUtilities();
  initContactForm();
}

document.addEventListener('DOMContentLoaded', initPortfolio);

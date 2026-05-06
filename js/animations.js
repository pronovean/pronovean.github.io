/* ============================================
   PRONOVEAN — animations.js
   GSAP + ScrollTrigger reveals, parallax, counters
   ============================================ */

(() => {
  'use strict';

  if (typeof gsap === 'undefined') return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-revealed'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Generic reveal on scroll ---------- */
  document.querySelectorAll('.reveal').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleClass: { targets: el, className: 'is-revealed' },
        once: true,
      },
    });
  });

  /* ---------- Stagger service cards ---------- */
  const cards = gsap.utils.toArray('.cards .card');
  if (cards.length) {
    gsap.set(cards, { opacity: 0, y: 32 });
    ScrollTrigger.create({
      trigger: '.cards',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.12,
        });
      },
    });
  }

  /* ---------- Stat counters ---------- */
  document.querySelectorAll('.stat__num [data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val); },
        });
      },
    });
  });

  /* ---------- Testimonials watermark parallax ---------- */
  const watermark = document.querySelector('.testimonials__quote-mark');
  if (watermark) {
    gsap.to(watermark, {
      yPercent: -25,
      ease: 'none',
      scrollTrigger: {
        trigger: '.testimonials',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  /* ---------- Hero panel content stagger on snap ---------- */
  // Set initial state on all hero panel content
  const heroPanels = gsap.utils.toArray('.hero__panel');
  heroPanels.forEach((panel, i) => {
    const items = panel.querySelectorAll('.eyebrow, .hero__title, .hero__sub, .hero__ctas, .hero__visual');
    // First panel: animate immediately on load
    if (i === 0) {
      gsap.from(items, {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.2,
      });
    } else {
      // Other panels: animate when they snap into view
      gsap.set(items, { opacity: 0, y: 30 });
    }
  });

  // Use IntersectionObserver on each panel to trigger entrance
  const heroPanelObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        const items = entry.target.querySelectorAll('.eyebrow, .hero__title, .hero__sub, .hero__ctas, .hero__visual');
        // Skip first panel (already animated)
        if (entry.target === heroPanels[0]) return;
        if (entry.target.dataset.revealed) return;
        entry.target.dataset.revealed = 'true';
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.08,
        });
      }
    });
  }, {
    root: document.getElementById('heroPanels'),
    threshold: [0, 0.5, 1],
  });
  heroPanels.forEach(panel => heroPanelObserver.observe(panel));

  /* ---------- Subtle parallax on hero orbs (mouse movement) ---------- */
  const hero = document.querySelector('.hero');
  const orbs = document.querySelectorAll('.hero__orb');
  if (hero && orbs.length && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 18;
        gsap.to(orb, { x: x * factor, y: y * factor, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
      });
    });
  }

  /* ---------- Refresh ScrollTrigger after fonts load ---------- */
  if (document.fonts) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();

/* ============================================
   PRONOVEAN — main.js
   Nav, mobile menu, hero scroll-snap progress,
   testimonial carousel, forms, CTA cursor glow
   ============================================ */

(() => {
  'use strict';

  /* ---------- Sticky nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 80) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenu = () => {
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.classList.toggle('is-open', isOpen);
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  /* ---------- Hero scroll-snap progress rail ---------- */
  const heroPanels = document.getElementById('heroPanels');
  const railFill = document.getElementById('heroRailFill');
  const railNum = document.getElementById('heroRailNum');
  const rail = document.querySelector('.hero__rail');
  const totalPanels = 4;

  if (heroPanels) {
    const updateRail = () => {
      const scrollTop = heroPanels.scrollTop;
      const panelH = heroPanels.clientHeight;
      const idx = Math.min(totalPanels - 1, Math.round(scrollTop / panelH));
      const progress = ((idx + 1) / totalPanels) * 100;
      railFill.style.height = progress + '%';
      railNum.textContent = String(idx + 1).padStart(2, '0');
    };
    heroPanels.addEventListener('scroll', updateRail, { passive: true });
    updateRail();

    // Show rail only while hero is in view
    const heroEl = document.querySelector('.hero');
    const heroObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        rail.classList.toggle('is-active', e.isIntersecting && e.intersectionRatio > 0.4);
      });
    }, { threshold: [0, 0.4, 1] });
    heroObs.observe(heroEl);
  }

  /* ---------- Testimonial carousel ---------- */
  const carousel = document.getElementById('testimonialCarousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.testimonial');
    const dotsContainer = document.getElementById('testimonialDots');
    const btns = carousel.querySelectorAll('.carousel-btn');
    let current = 0;
    let auto;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    const goTo = (i) => {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === current));
      dots.forEach((d, idx) => d.classList.toggle('is-active', idx === current));
      restartAuto();
    };

    btns.forEach(btn => btn.addEventListener('click', () => {
      goTo(current + (btn.dataset.dir === 'next' ? 1 : -1));
    }));

    const startAuto = () => { auto = setInterval(() => goTo(current + 1), 7000); };
    const restartAuto = () => { clearInterval(auto); startAuto(); };

    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(auto));
    carousel.addEventListener('mouseleave', startAuto);

    // Touch swipe
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 50) goTo(current + (diff < 0 ? 1 : -1));
    }, { passive: true });

    goTo(0);
    startAuto();
  }

  /* ---------- CTA cursor glow ---------- */
  const ctaStrip = document.querySelector('.cta-strip');
  if (ctaStrip && window.matchMedia('(hover: hover)').matches) {
    ctaStrip.addEventListener('mousemove', (e) => {
      const rect = ctaStrip.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      ctaStrip.style.setProperty('--mx', x + '%');
      ctaStrip.style.setProperty('--my', y + '%');
    });
  }

  /* ---------- Forms — mailto relay (no backend) ---------- */
  // Both forms compose a mailto: URL and open the user's default mail client.
  // Replace with a real form-relay (Formspree / Netlify / Capsule) once a host is in place.
  const MAIL_TO = 'hello@pronovean.com';

  // Contact form
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      const data = new FormData(contactForm);
      const name    = (data.get('name')    || '').toString().trim();
      const email   = (data.get('email')   || '').toString().trim();
      const company = (data.get('company') || '').toString().trim();
      const topic   = (data.get('topic')   || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      const subject = `New enquiry from ${name}${topic ? ` — ${topic}` : ''}`;
      const bodyLines = [
        `Name: ${name}`,
        `Email: ${email}`,
      ];
      if (company) bodyLines.push(`Company: ${company}`);
      if (topic)   bodyLines.push(`Topic: ${topic}`);
      bodyLines.push('', 'Message:', message);

      const mailtoUrl = `mailto:${MAIL_TO}`
        + `?subject=${encodeURIComponent(subject)}`
        + `&body=${encodeURIComponent(bodyLines.join('\n'))}`;

      window.location.href = mailtoUrl;

      contactSuccess.hidden = false;
      contactSuccess.textContent = "We've opened your email client — please send the pre-filled message to complete your enquiry.";
      setTimeout(() => { contactSuccess.hidden = true; }, 9000);
    });
  }

  // Newsletter form
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterSuccess = document.getElementById('newsletterSuccess');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!newsletterForm.checkValidity()) {
        newsletterForm.reportValidity();
        return;
      }
      const email = (new FormData(newsletterForm).get('email') || '').toString().trim();
      const subject = 'Newsletter signup';
      const body = `Please add me to the Pronovean newsletter.\n\nEmail: ${email}`;

      const mailtoUrl = `mailto:${MAIL_TO}`
        + `?subject=${encodeURIComponent(subject)}`
        + `&body=${encodeURIComponent(body)}`;

      window.location.href = mailtoUrl;

      newsletterSuccess.hidden = false;
      newsletterSuccess.textContent = "We've opened your email client — please hit send to confirm your subscription.";
      setTimeout(() => { newsletterSuccess.hidden = true; }, 9000);
    });
  }

  /* ---------- Smooth scroll for internal links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

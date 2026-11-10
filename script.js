// ============ Menú móvil ============
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ============ Marcar link activo según la página actual ============
(function highlightActiveNav() {
  // "/nosotros", "/nosotros.html" y "/nosotros/" cuentan como la misma página
  const clean = p => '/' + p.replace(/\.html$/, '').replace(/^\/+|\/+$/g, '').replace(/^index$/, '');
  const current = clean(window.location.pathname);
  document.querySelectorAll('.main-nav a').forEach(link => {
    if (clean(link.getAttribute('href')) === current) {
      link.classList.add('is-active');
    }
  });
})();

// ============ Sombra del header al bajar ============
(function initHeaderShadow() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ============ Aparición suave al hacer scroll ============
(function initReveal() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const selectors = [
    '.section-head', '.category-card', '.catalog-cta', '.stats-item',
    '.trust-item', '.process-step', '.faq-item', '.cta-band-inner',
    '.timeline-item', '.value-card', '.cert-banner', '.fv-banner',
    '.product-line-inner', '.product-row-inner', '.contact-info-card'
  ];
  const items = document.querySelectorAll(selectors.join(','));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible');
      observer.unobserve(el);
      // Al terminar, quitar las clases para no interferir con los efectos hover
      setTimeout(() => {
        el.classList.remove('reveal', 'is-visible');
        el.style.transitionDelay = '';
      }, 900 + (parseFloat(el.style.transitionDelay) || 0) * 1000);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => {
    // Escalonar las tarjetas hermanas para que entren una tras otra
    const siblings = Array.from(el.parentElement.children).filter(s => s.matches(selectors.join(',')));
    const index = siblings.indexOf(el);
    if (index > 0) el.style.transitionDelay = Math.min(index, 6) * 0.08 + 's';
    el.classList.add('reveal');
    observer.observe(el);
  });
})();

// ============ Carrusel del inicio ============
(function initCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const dotsContainer = document.querySelector('.carousel-dots');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  let current = 0;
  let autoplayTimer;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
    });
  }

  // Crear los puntos de navegación
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
    dot.addEventListener('click', () => {
      goTo(i);
      restartAutoplay();
    });
    dotsContainer.appendChild(dot);
  });

  prevBtn.addEventListener('click', () => { goTo(current - 1); restartAutoplay(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); restartAutoplay(); });

  function startAutoplay() {
    autoplayTimer = setInterval(() => goTo(current + 1), 6000);
  }
  function restartAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  startAutoplay();
})();

// ============ Count-up animation ============
(function initCountUp() {
  const numbers = document.querySelectorAll('.stats-number');
  if (!numbers.length) return;

  const duration = 2800; // 2.8 segundos

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateNumber(el) {
    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = Math.round(eased * target);

      // Formatear con punto de miles
      el.textContent = prefix + current.toLocaleString('es-EC') + suffix;

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // Solo animar cuando la sección entra en pantalla
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        numbers.forEach(animateNumber);
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const section = document.querySelector('.stats-section');
  if (section) observer.observe(section);
})();

// ============ Formulario de contacto (Formspree) ============
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const success = document.getElementById('formSuccess');

    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.reset();
        success.style.display = 'block';
        btn.textContent = '¡Enviado!';
      } else {
        btn.textContent = 'Error — intenta de nuevo';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Error — intenta de nuevo';
      btn.disabled = false;
    }
  });
})();

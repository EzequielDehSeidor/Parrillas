// === Configuración WhatsApp ===
const WHATSAPP_NUMBER = '5491168090361'; // 11 6809-0361 (Argentina)
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

function whatsappLink(message) {
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

// Enlaces de WhatsApp generales (botón de contacto y botón flotante)
document.querySelectorAll('[data-whatsapp]').forEach((el) => {
  el.href = whatsappLink('Hola! Quería hacer una consulta sobre sus trabajos de herrería.');
});

// === Carrusel ===
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, idx) => slide.classList.toggle('active', idx === index));
  dots.forEach((dot, idx) => dot.classList.toggle('active', idx === index));
  currentSlide = index;
}

function nextSlide() {
  showSlide((currentSlide + 1) % slides.length);
}

dots.forEach((dot) => {
  dot.addEventListener('click', () => showSlide(Number(dot.dataset.index)));
});

if (slides.length > 1) {
  setInterval(nextSlide, 4500);
}

// === Carrusel destacado (Glide.js) ===
// En desktop (>640px) se monta Glide (coverflow). En mobile (<=640px) se DESTRUYE
// y la sección queda como slider nativo con scroll-snap por CSS (más cómodo al tacto).
// Se sincroniza al cruzar el límite para que redimensionar/rotar no rompa nada.
const featured = document.querySelector('.featured-glide');

if (featured && typeof Glide !== 'undefined') {
  const desktopMQ = window.matchMedia('(min-width: 641px)');
  const track = featured.querySelector('.glide__track');
  let glide = null;

  // Marca como "centrada" la tarjeta más cercana al centro del carrusel,
  // sin depender de la clase --active de Glide (que en esta config no coincide
  // con la que queda visualmente en el medio). El coverflow se basa en .is-mid.
  const markMid = () => {
    if (!glide) return;
    const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
    let best = null;
    let bestDist = Infinity;
    featured.querySelectorAll('.glide__slide').forEach((s) => {
      s.classList.remove('is-mid');
      const r = s.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = s;
      }
    });
    if (best) best.classList.add('is-mid');
  };

  // Recalcula el centro DESPUÉS de que el movimiento se asiente. En el borde,
  // Glide anima hacia un clon y luego hace un reset instantáneo (sin transición):
  // por eso no se usa 'transitionend' (dispara antes del reset y deja el
  // resaltado pegado en el clon). El timer corre pasada la animación + el reset.
  let midTimer;
  const scheduleMid = () => {
    clearTimeout(midTimer);
    midTimer = setTimeout(markMid, 480);
  };

  // En resize: sincronizar montar/destruir (por si matchMedia 'change' no dispara)
  // y recalcular el centro.
  window.addEventListener('resize', () => {
    sync();
    markMid();
  });

  const buildGlide = () => {
    glide = new Glide(featured, {
      type: 'carousel',
      perView: 3,
      focusAt: 'center',
      gap: 22,
      peek: { before: 70, after: 70 },
      autoplay: 5000,
      hoverpause: true,
      animationDuration: 420,
      breakpoints: {
        900: { perView: 3, gap: 14, peek: { before: 24, after: 24 } },
      },
    });
    glide.on('mount.after', markMid);
    glide.on('run', scheduleMid);
    glide.mount();
  };

  const destroyGlide = () => {
    glide.destroy();
    glide = null;
    // Limpiar restos que Glide/nuestro código dejaron en el DOM.
    featured.querySelectorAll('.is-mid').forEach((s) => s.classList.remove('is-mid'));
  };

  const sync = () => {
    if (desktopMQ.matches && !glide) buildGlide();
    else if (!desktopMQ.matches && glide) destroyGlide();
  };

  sync();
  desktopMQ.addEventListener('change', sync);
}

// === Menú mobile ===
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle?.addEventListener('click', () => {
  const open = navLinks?.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// Cerrar el menú al tocar un enlace (mobile)
navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

// === Modal de productos ===
const serviceCards = document.querySelectorAll('.service-card');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalImage = document.getElementById('modalImage');

function openModal(title, description, image) {
  modalTitle.textContent = title;
  modalDescription.textContent = description;
  modalImage.src = image;
  modalImage.alt = title;
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModalWindow() {
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

serviceCards.forEach((card) => {
  card.addEventListener('click', () => {
    openModal(card.dataset.title, card.dataset.description, card.dataset.image);
  });
});

closeModal?.addEventListener('click', closeModalWindow);

// Cerrar solo si se hace clic fuera de la tarjeta (en el overlay)
modalOverlay?.addEventListener('click', (event) => {
  if (event.target === modalOverlay) closeModalWindow();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
    closeModalWindow();
  }
});

// === Scroll reveal ===
// Añadimos la clase por JS: si no hay JS o IntersectionObserver, todo queda visible.
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll(
  '.section-header, .category-title, .service-card'
);

if ('IntersectionObserver' in window && !prefersReduced) {
  // Delay escalonado según la posición dentro de cada grilla
  document.querySelectorAll('.card-grid, .work-grid, .contact-grid').forEach((grid) => {
    Array.from(grid.children).forEach((child, index) => {
      child.style.transitionDelay = `${(index % 3) * 90}ms`;
    });
  });

  revealTargets.forEach((el) => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));
}

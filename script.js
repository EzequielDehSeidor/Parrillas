const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === index);
  });
  dots.forEach((dot, idx) => dot.classList.toggle('active', idx === index));
  currentSlide = index;
}

function nextSlide() {
  const nextIndex = (currentSlide + 1) % slides.length;
  showSlide(nextIndex);
}

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const index = Number(dot.dataset.index);
    showSlide(index);
  });
});

setInterval(nextSlide, 4500);

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
});

const serviceCards = document.querySelectorAll('.service-card');
const modal = document.getElementById('serviceModal');
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
  modal.classList.remove('hidden');
  modalOverlay.classList.remove('hidden');
}

function closeModalWindow() {
  modal.classList.add('hidden');
  modalOverlay.classList.add('hidden');
}

serviceCards.forEach((card) => {
  card.addEventListener('click', () => {
    openModal(
      card.dataset.title,
      card.dataset.description,
      card.dataset.image
    );
  });
});

closeModal?.addEventListener('click', closeModalWindow);
modalOverlay?.addEventListener('click', closeModalWindow);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModalWindow();
  }
});

/**
 * Карусель hero без import — работает при открытии index.html по file://.
 * Сборка Webpack подключает тот же код через assets/js/main.js.
 */
const AUTOPLAY_MS = 4000;

function getSlides(root) {
  return Array.from(root.querySelectorAll('.slide'));
}

function mountHeroCarousel() {
  const root = document.getElementById('hero');
  if (!root) {
    return;
  }

  const slides = getSlides(root);
  if (slides.length < 2) {
    return;
  }

  let index = slides.findIndex((s) => s.classList.contains('active'));
  if (index < 0) {
    index = 0;
  }

  let timer = null;
  let touchStartX = null;

  const live = root.querySelector('[data-carousel-live]');

  function slideAnnouncement(i, total) {
    const lang = document.documentElement.getAttribute('lang') || 'ru';
    if (lang.startsWith('en')) {
      return `Slide ${i + 1} of ${total}`;
    }
    if (lang.startsWith('zh')) {
      return `第 ${i + 1} 张，共 ${total} 张`;
    }
    return `Слайд ${i + 1} из ${total}`;
  }

  function announce(i, total) {
    if (live) {
      live.textContent = slideAnnouncement(i, total);
    }
  }

  function showSlide(nextIndex) {
    const i = ((nextIndex % slides.length) + slides.length) % slides.length;
    slides.forEach((slide, j) => {
      slide.classList.toggle('active', j === i);
    });
    index = i;
    announce(i, slides.length);
  }

  function next() {
    showSlide(index + 1);
  }

  function prev() {
    showSlide(index - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = window.setInterval(next, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  const clickPrev = root.querySelector('.hero-click-prev');
  if (clickPrev) {
    clickPrev.addEventListener('click', () => {
      prev();
      startAutoplay();
    });
  }

  const clickNext = root.querySelector('.hero-click-next');
  if (clickNext) {
    clickNext.addEventListener('click', () => {
      next();
      startAutoplay();
    });
  }

  const arrowPrev = root.querySelector('.hero-arrow-prev');
  if (arrowPrev) {
    arrowPrev.addEventListener('click', () => {
      prev();
      startAutoplay();
    });
  }

  const arrowNext = root.querySelector('.hero-arrow-next');
  if (arrowNext) {
    arrowNext.addEventListener('click', () => {
      next();
      startAutoplay();
    });
  }

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
      startAutoplay();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
      startAutoplay();
    }
  });

  root.addEventListener('touchstart', (e) => {
    if (e.changedTouches.length === 0) {
      return;
    }
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  root.addEventListener('touchend', (e) => {
    if (touchStartX === null || e.changedTouches.length === 0) {
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) < 40) {
      return;
    }
    if (dx < 0) {
      next();
    } else {
      prev();
    }
    startAutoplay();
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  startAutoplay();
}

mountHeroCarousel();

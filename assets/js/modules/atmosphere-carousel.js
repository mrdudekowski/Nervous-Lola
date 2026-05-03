import { imagePath } from '../config/assets-paths.js';
import { attachCarouselSwipe } from './carousel-swipe.js';

export function initAtmosphereCarousel(root, slides, options = {}) {
  if (!root || !slides || !slides.length) return () => {};

  const intervalMs = options.intervalMs ?? 5500;

  const viewport = document.createElement('div');
  viewport.className = 'atmosphere__viewport';
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-roledescription', 'carousel');
  if (options.ariaLabel) {
    viewport.setAttribute('aria-label', options.ariaLabel);
  }

  const live = document.createElement('div');
  live.className = 'sr-only';
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');

  const controls = document.createElement('div');
  controls.className = 'atmosphere__controls';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'atmosphere__btn';
  prev.setAttribute('aria-label', 'Предыдущий слайд');
  prev.textContent = '‹';
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'atmosphere__btn';
  next.setAttribute('aria-label', 'Следующий слайд');
  next.textContent = '›';
  controls.append(prev, next);

  const dots = document.createElement('div');
  dots.className = 'atmosphere__dots';
  dots.setAttribute('aria-label', 'Выбор слайда');

  const figures = slides.map((slide, i) => {
    const figure = document.createElement('figure');
    figure.className = 'atmosphere__slide';
    if (i === 0) figure.classList.add('is-active');

    const img = document.createElement('img');
    img.src = imagePath(slide.image);
    img.alt = slide.alt;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.sizes = options.imgSizes ?? '100vw';

    const caption = document.createElement('figcaption');
    caption.className = 'atmosphere__caption';
    caption.textContent = slide.caption;

    figure.append(img, caption);
    return figure;
  });

  const dotButtons = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'atmosphere__dot';
    b.setAttribute('aria-label', `Слайд ${i + 1}`);
    b.setAttribute('aria-current', i === 0 ? 'true' : 'false');
    b.addEventListener('click', () => {
      index = i;
      apply();
      restart();
    });
    dots.appendChild(b);
    return b;
  });

  figures.forEach((f) => viewport.append(f));
  viewport.append(controls, live);

  root.append(viewport, dots);

  let index = 0;
  let timer = null;

  const announce = () => {
    const s = slides[index];
    live.textContent = `${s.caption}`;
  };

  const apply = () => {
    figures.forEach((figure, i) => {
      const active = i === index;
      figure.classList.toggle('is-active', active);
    });
    dotButtons.forEach((b, i) => {
      b.setAttribute('aria-current', i === index ? 'true' : 'false');
    });
    announce();
  };

  const go = (delta) => {
    index = (index + delta + figures.length) % figures.length;
    apply();
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => go(1), intervalMs);
  };

  const restart = () => {
    stop();
    start();
  };

  prev.addEventListener('click', () => {
    go(-1);
    restart();
  });
  next.addEventListener('click', () => {
    go(1);
    restart();
  });

  viewport.addEventListener('mouseenter', stop);
  viewport.addEventListener('mouseleave', start);
  viewport.addEventListener('focusin', stop);
  viewport.addEventListener('focusout', start);

  const detachSwipe = attachCarouselSwipe(viewport, {
    onSwipeNext: () => {
      go(1);
      restart();
    },
    onSwipePrev: () => {
      go(-1);
      restart();
    }
  });

  apply();
  start();

  return () => {
    detachSwipe();
    stop();
  };
}

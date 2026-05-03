import { imagePath } from '../config/assets-paths.js';
import { attachCarouselSwipe } from './carousel-swipe.js';

const DEFAULT_INTRINSIC_W = 1920;
const DEFAULT_INTRINSIC_H = 1080;

function heroResponsiveSizes() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--hero-max-width').trim();
  const cap = raw || '88rem';
  return `(max-width: 47.9375rem) 100vw, min(100vw, ${cap})`;
}

function heroSrcsetDescriptors(url, intrinsicWidth) {
  const w = intrinsicWidth > 0 ? intrinsicWidth : DEFAULT_INTRINSIC_W;
  const candidates = [Math.min(1200, w), Math.min(1920, w), ...(w > 1920 ? [w] : [])];
  const seen = new Set();
  const parts = [];
  for (const cw of candidates) {
    if (cw < 1 || seen.has(cw)) continue;
    seen.add(cw);
    parts.push(`${url} ${cw}w`);
  }
  return parts.join(', ');
}

function setHeroImageSources(img, slide) {
  const url = imagePath(slide.image);
  const iw = typeof slide.width === 'number' ? slide.width : DEFAULT_INTRINSIC_W;
  img.src = url;
  img.srcset = heroSrcsetDescriptors(url, iw);
}

export function initHeroCarousel(root, slides, options = {}) {
  if (!root || !slides || !slides.length) return () => {};

  root.classList.add('hero__shell');

  const intervalMs = options.intervalMs ?? 4000;
  const track = document.createElement('div');
  track.className = 'hero__track';
  track.setAttribute('role', 'group');
  track.setAttribute('aria-roledescription', 'carousel');
  track.setAttribute('aria-label', options.ariaLabel || 'Галерея изображений');

  const live = document.createElement('div');
  live.className = 'hero__live';
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');

  const controls = document.createElement('div');
  controls.className = 'hero__controls';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'hero__btn';
  prev.setAttribute('aria-label', 'Предыдущий слайд');
  prev.textContent = '‹';
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'hero__btn';
  next.setAttribute('aria-label', 'Следующий слайд');
  next.textContent = '›';
  controls.append(prev, next);

  const figures = slides.map((slide, index) => {
    const figure = document.createElement('figure');
    figure.className = 'hero__slide';
    figure.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
    if (index === 0) figure.classList.add('is-active');

    const img = document.createElement('img');
    img.alt = slide.alt;
    img.decoding = 'async';
    img.width = typeof slide.width === 'number' ? slide.width : DEFAULT_INTRINSIC_W;
    img.height = typeof slide.height === 'number' ? slide.height : DEFAULT_INTRINSIC_H;
    img.sizes = heroResponsiveSizes();
    setHeroImageSources(img, slide);
    if (typeof slide.objectPosition === 'string' && slide.objectPosition.trim()) {
      img.style.setProperty('--hero-img-object-position', slide.objectPosition.trim());
    }
    img.loading = index === 0 ? 'eager' : 'lazy';
    img.fetchPriority = index === 0 ? 'high' : 'low';
    figure.append(img);
    return figure;
  });

  figures.forEach((f) => track.appendChild(f));
  root.append(track, live, controls);

  let index = 0;
  let timer = null;

  const announce = () => {
    const s = slides[index];
    live.textContent = `Слайд ${index + 1} из ${slides.length}: ${s.alt}`;
  };

  const apply = () => {
    figures.forEach((figure, i) => {
      const active = i === index;
      figure.classList.toggle('is-active', active);
      figure.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    announce();
  };

  const go = (delta) => {
    index = (index + delta + figures.length) % figures.length;
    apply();
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => go(1), intervalMs);
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  prev.addEventListener('click', () => {
    go(-1);
    start();
  });
  next.addEventListener('click', () => {
    go(1);
    start();
  });

  track.addEventListener('mouseenter', stop);
  track.addEventListener('mouseleave', start);
  track.addEventListener('focusin', stop);
  track.addEventListener('focusout', start);

  const detachSwipe = attachCarouselSwipe(track, {
    onSwipeNext: () => {
      go(1);
      start();
    },
    onSwipePrev: () => {
      go(-1);
      start();
    }
  });

  apply();
  start();

  return () => {
    detachSwipe();
    stop();
  };
}

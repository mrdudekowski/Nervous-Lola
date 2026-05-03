import { imagePath } from '../config/assets-paths.js';
import { attachCarouselSwipe } from './carousel-swipe.js';

/** Ниже 768px — по одному фото на слайд (duo раскладывается в два full). */
const ABOUT_CAROUSEL_NARROW_MQL = '(max-width: 767px)';

function slideLiveText(slide) {
  if (slide.layout === 'duo') {
    const parts = [slide.caption, slide.left?.alt, slide.right?.alt].filter(Boolean);
    return parts.join(' — ');
  }
  return slide.caption || slide.alt || '';
}

function expandSlidesForNarrowViewport(slides) {
  const out = [];
  for (const s of slides) {
    if (s.layout === 'duo' && s.left?.image) {
      out.push({
        layout: 'full',
        image: s.left.image,
        alt: s.left.alt ?? '',
        caption: s.caption ?? ''
      });
      if (s.right?.image) {
        out.push({
          layout: 'full',
          image: s.right.image,
          alt: s.right.alt ?? '',
          caption: ''
        });
      }
    } else {
      out.push(s);
    }
  }
  return out;
}

function normalizeSlidesForViewport(rawSlides, isNarrow) {
  if (!isNarrow) return rawSlides;
  return expandSlidesForNarrowViewport(rawSlides);
}

function createImg(src, alt, loading, sizes) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.loading = loading;
  img.decoding = 'async';
  img.sizes = sizes;
  return img;
}

function buildFullSlide(slide, index, imgSizes) {
  const figure = document.createElement('figure');
  figure.className = 'about-carousel__slide';

  const img = createImg(imagePath(slide.image), slide.alt, index === 0 ? 'eager' : 'lazy', imgSizes);
  img.className = 'about-carousel__img about-carousel__img--full';

  const caption = document.createElement('figcaption');
  caption.className = 'about-carousel__caption';
  caption.textContent = slide.caption ?? '';

  figure.append(img, caption);
  return figure;
}

function buildDuoSlide(slide, index, imgSizes) {
  const figure = document.createElement('figure');
  figure.className = 'about-carousel__slide';

  const duo = document.createElement('div');
  duo.className = 'about-carousel__duo';
  if (!slide.right) {
    duo.classList.add('about-carousel__duo--single');
  }

  const loading = index === 0 ? 'eager' : 'lazy';

  const leftWrap = document.createElement('div');
  leftWrap.className = 'about-carousel__cell';
  const leftImg = createImg(imagePath(slide.left.image), slide.left.alt, loading, imgSizes);
  leftImg.className = 'about-carousel__img';
  leftWrap.append(leftImg);
  duo.append(leftWrap);

  if (slide.right) {
    const rightWrap = document.createElement('div');
    rightWrap.className = 'about-carousel__cell';
    const rightImg = createImg(imagePath(slide.right.image), slide.right.alt, loading, imgSizes);
    rightImg.className = 'about-carousel__img';
    rightWrap.append(rightImg);
    duo.append(rightWrap);
  }

  const caption = document.createElement('figcaption');
  caption.className = 'about-carousel__caption';
  caption.textContent = slide.caption ?? '';

  figure.append(duo, caption);
  return figure;
}

function buildSlide(slide, index, imgSizesFull, imgSizesDuo) {
  if (slide.layout === 'duo' && slide.left?.image) {
    return buildDuoSlide(slide, index, imgSizesDuo);
  }
  return buildFullSlide(slide, index, imgSizesFull);
}

/**
 * Одна инкарнация карусели (DOM + таймер). Возвращает destroy().
 */
function mountCarouselInstance(root, slides, about, options) {
  const intervalMs = options.intervalMs ?? 5500;
  const imgSizesFull =
    options.imgSizesFull ?? '(max-width: 47.9375rem) 100vw, min(52vw, 42rem)';
  const imgSizesDuo =
    options.imgSizesDuo ?? '(max-width: 47.9375rem) 42vw, min(28vw, 24rem)';

  root.replaceChildren();

  const viewport = document.createElement('div');
  viewport.className = 'about-carousel__viewport';
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-roledescription', 'carousel');
  if (about.carouselAria) {
    viewport.setAttribute('aria-label', about.carouselAria);
  }

  const live = document.createElement('div');
  live.className = 'sr-only';
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');

  const dots = document.createElement('div');
  dots.className = 'atmosphere__dots';
  dots.setAttribute('aria-label', 'Выбор слайда');

  const figures = slides.map((slide, i) => buildSlide(slide, i, imgSizesFull, imgSizesDuo));

  let index = 0;
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
  viewport.append(live);
  root.append(viewport, dots);

  let timer = null;

  const announce = () => {
    live.textContent = slideLiveText(slides[index]);
  };

  const apply = () => {
    figures.forEach((figure, i) => {
      figure.classList.toggle('is-active', i === index);
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

  const ac = new AbortController();
  const { signal } = ac;

  viewport.addEventListener('mouseenter', stop, { signal });
  viewport.addEventListener('mouseleave', start, { signal });
  viewport.addEventListener('focusin', stop, { signal });
  viewport.addEventListener('focusout', start, { signal });

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
    ac.abort();
    stop();
    root.replaceChildren();
  };
}

/**
 * Карусель «О нас»: от 768px — full + duo (2 фото вертикально); уже 767px — по одному full, duo раскладывается.
 */
export function initAboutCarousel(root, about, options = {}) {
  const rawSlides = about?.slides ?? [];
  if (!root || !rawSlides.length) return () => {};

  const mql = window.matchMedia(ABOUT_CAROUSEL_NARROW_MQL);
  let destroyInstance = () => {};

  const sync = () => {
    destroyInstance();
    const slides = normalizeSlidesForViewport(rawSlides, mql.matches);
    if (!slides.length) return;
    destroyInstance = mountCarouselInstance(root, slides, about, options);
  };

  sync();
  mql.addEventListener('change', sync);

  return () => {
    mql.removeEventListener('change', sync);
    destroyInstance();
  };
}

/**
 * Горизонтальный свайп для каруселей на устройствах с касанием / узком вьюпорте.
 * Свайп влево — следующий слайд, вправо — предыдущий; вертикальный скролл не перехватываем.
 */

const SWIPE_DEFAULT_MIN_PX = 50;
const SWIPE_VERTICAL_RATIO = 1.35;

function swipeEnabled() {
  return window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
}

/**
 * @param {HTMLElement} el — трек или вьюпорт карусели
 * @param {{ onSwipeNext: () => void; onSwipePrev: () => void }} handlers
 * @returns {() => void} отписка от touch-событий
 */
export function attachCarouselSwipe(el, handlers) {
  if (!el || typeof handlers?.onSwipeNext !== 'function' || typeof handlers?.onSwipePrev !== 'function') {
    return () => {};
  }

  let startX = 0;
  let startY = 0;
  let active = false;

  const onTouchStart = (e) => {
    if (!swipeEnabled()) return;
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    active = true;
  };

  const onTouchEnd = (e) => {
    if (!active) return;
    active = false;
    if (!swipeEnabled()) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) < SWIPE_DEFAULT_MIN_PX) return;
    if (Math.abs(dy) * SWIPE_VERTICAL_RATIO > Math.abs(dx)) return;
    if (dx < 0) {
      handlers.onSwipeNext();
    } else {
      handlers.onSwipePrev();
    }
  };

  const onTouchCancel = () => {
    active = false;
  };

  const opts = { passive: true };
  el.addEventListener('touchstart', onTouchStart, opts);
  el.addEventListener('touchend', onTouchEnd, opts);
  el.addEventListener('touchcancel', onTouchCancel, opts);

  return () => {
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchend', onTouchEnd);
    el.removeEventListener('touchcancel', onTouchCancel);
  };
}

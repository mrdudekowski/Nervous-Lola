/**
 * Инициализация Lenis в одном месте: start/stop по reduced motion и флагу отключения,
 * сигнализация через CustomEvent SCROLL_ENGINE_CHANGED.
 */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {
  SCROLL_ENGINE_CHANGED,
  LENIS_PACKAGE_VERSION,
  SCROLL_LENIS_OPTIONS
} from '../config/scroll.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let lenisInstance = null;
/** Программное отключение (например проверка после обновления пакета). */
let userDisabled = false;

function emit(reason) {
  window.dispatchEvent(
    new CustomEvent(SCROLL_ENGINE_CHANGED, {
      detail: {
        ...getScrollEngineSnapshot(),
        reason
      }
    })
  );
}

export function getScrollEngineSnapshot() {
  return {
    engine: lenisInstance ? 'lenis' : 'native',
    lenisActive: Boolean(lenisInstance && !lenisInstance.isStopped),
    reducedMotion: prefersReducedMotion.matches,
    userDisabled,
    lenisPackageVersion: LENIS_PACKAGE_VERSION,
    lenisRuntimeVersion: typeof window.lenisVersion === 'string' ? window.lenisVersion : null
  };
}

function destroyLenis(reason) {
  if (!lenisInstance) return;
  lenisInstance.destroy();
  lenisInstance = null;
  emit(reason);
}

function shouldUseLenis() {
  return !prefersReducedMotion.matches && !userDisabled;
}

function createLenis(reason) {
  if (lenisInstance || !shouldUseLenis()) return;

  lenisInstance = new Lenis({
    ...SCROLL_LENIS_OPTIONS,
    autoRaf: true,
    anchors: true
  });

  emit(reason);
}

function onReducedMotionChange() {
  if (prefersReducedMotion.matches) {
    destroyLenis('prefers-reduced-motion');
  } else {
    createLenis('prefers-reduced-motion-ended');
  }
}

/**
 * Включить или выключить Lenis (например после обновления зависимости или A/B).
 * При false — destroy и нативный скролл; при true — создать, если нет reduce.
 */
export function setScrollEngineEnabled(enabled) {
  userDisabled = !enabled;
  if (!enabled) {
    if (lenisInstance) destroyLenis('setScrollEngineEnabled:false');
    else emit('setScrollEngineEnabled:false');
    return;
  }
  createLenis('setScrollEngineEnabled:true');
}

/**
 * Плавный/мгновенный переход к элементу секции. Scroll-padding на `html` учитывает Lenis сам.
 */
export function scrollToAnchorElement(target, { onComplete } = {}) {
  if (!target) return;

  if (lenisInstance && shouldUseLenis()) {
    lenisInstance.scrollTo(target, {
      onComplete: () => {
        onComplete?.();
      }
    });
    return;
  }

  target.scrollIntoView({ behavior: 'auto', block: 'start' });
  onComplete?.();
}

export function initSmoothScroll() {
  prefersReducedMotion.addEventListener('change', onReducedMotionChange);
  if (shouldUseLenis()) {
    createLenis('init');
  } else {
    emit(prefersReducedMotion.matches ? 'init:reduced-motion' : 'init:native');
  }
}

export function destroySmoothScroll() {
  prefersReducedMotion.removeEventListener('change', onReducedMotionChange);
  destroyLenis('destroySmoothScroll');
}

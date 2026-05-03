/**
 * Единая конфигурация скролл-движка (Lenis + политика reduced motion).
 * Числовые параметры Lenis — здесь; версию синхронизировать с package.json dependencies.lenis.
 */

/** Имя CustomEvent для сигнализации смены режима (подписка из тестов / телеметрии). */
export const SCROLL_ENGINE_CHANGED = 'scrollEngineChanged';

/**
 * Политика при prefers-reduced-motion: reduce — только «стоп» (Lenis не создаётся).
 * Режим «ослабить» не используется по решению заказчика.
 */
export const REDUCED_MOTION_LENIS_POLICY = 'stop';

/** Версия пакета lenis (дублирует package.json при обновлении зависимости). */
export const LENIS_PACKAGE_VERSION = '1.3.23';

/** Параметры конструктора Lenis (без autoRaf / anchors — задаются в модуле). */
export const SCROLL_LENIS_OPTIONS = {
  lerp: 0.1,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  smoothWheel: true,
  stopInertiaOnNavigate: true
};

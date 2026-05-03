/**
 * Единый источник правды: поддерживаемые локали лендинга.
 * Навбар, переключатель и слой переводов импортируют только отсюда.
 */

export const STORAGE_KEY = 'lola.lang';

/** Локаль по умолчанию, если ни storage, ни html, ни браузер не дали совпадения */
export const DEFAULT_LOCALE = 'ru';

/**
 * @typedef {{ code: string, label: string, menuLabel: string, direction: 'ltr' | 'rtl' }} SiteLocale
 */

/** @type {readonly SiteLocale[]} */
export const LOCALES = Object.freeze([
  { code: 'ru', label: 'RU', menuLabel: 'Русский', direction: 'ltr' },
  { code: 'en', label: 'EN', menuLabel: 'English', direction: 'ltr' },
  { code: 'zh', label: 'ZH', menuLabel: '中文', direction: 'ltr' },
  { code: 'ko', label: 'KO', menuLabel: '한국어', direction: 'ltr' },
  { code: 'ja', label: 'JA', menuLabel: '日本語', direction: 'ltr' }
]);

const codes = new Set(LOCALES.map((l) => l.code));

export function isLocaleSupported(code) {
  return typeof code === 'string' && codes.has(code);
}

/** BCP 47 для <html lang> при смене контента */
export function getHtmlLangForLocale(code) {
  if (!isLocaleSupported(code)) {
    return DEFAULT_LOCALE;
  }
  if (code === 'zh') {
    return 'zh-Hans';
  }
  return code;
}

export function getLocaleConfig(code) {
  return LOCALES.find((l) => l.code === code) ?? null;
}

export function readStoredLocale() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isLocaleSupported(v) ? v : null;
  } catch {
    return null;
  }
}

function normalizeHtmlLangToCode(raw) {
  if (!raw || typeof raw !== 'string') {
    return null;
  }
  const lower = raw.trim().toLowerCase();
  if (!lower) {
    return null;
  }
  const primary = lower.split('-')[0];
  if (isLocaleSupported(primary)) {
    return primary;
  }
  if (lower.startsWith('zh')) {
    return 'zh';
  }
  return null;
}

function localeFromDocumentHtml() {
  const attr = document.documentElement.getAttribute('lang');
  return normalizeHtmlLangToCode(attr);
}

function localeFromNavigator() {
  const list =
    typeof navigator !== 'undefined' && Array.isArray(navigator.languages)
      ? navigator.languages
      : typeof navigator !== 'undefined' && navigator.language
        ? [navigator.language]
        : [];
  for (const raw of list) {
    const hit = normalizeHtmlLangToCode(raw);
    if (hit) {
      return hit;
    }
  }
  return null;
}

/**
 * Язык для первой отрисовки: явный выбор в storage → <html lang> → Accept-Language.
 * Не записывает в storage (запись только по явному клику в переключателе).
 */
export function getInitialLocale() {
  const stored = readStoredLocale();
  if (stored) {
    return stored;
  }
  return localeFromDocumentHtml() || localeFromNavigator() || DEFAULT_LOCALE;
}

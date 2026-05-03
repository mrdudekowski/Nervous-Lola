import { isLocaleSupported, getInitialLocale, getHtmlLangForLocale } from './i18n/config.js';

(function initTranslationApplier() {
  const EMBEDDED = {
    ru: {
      'page.title': 'Нервная Лола — кофейня',
      'page.h1': 'Нервная Лола',
      'page.description': 'Нервная Лола — уникальная кофейня с характером.',
      'hero.slide1.alt': 'Изысканная композиция кофейни',
      'hero.slide2.alt': 'Освежающий кофе со льдом',
      'a11y.carousel': 'Галерея изображений кофейни',
      'a11y.carouselLive': 'Объявления карусели'
    },
    en: {
      'page.title': 'Nervous Lola — café',
      'page.h1': 'Nervous Lola',
      'page.description': 'Nervous Lola — a café with character.',
      'hero.slide1.alt': 'Café interior composition',
      'hero.slide2.alt': 'Refreshing iced coffee',
      'a11y.carousel': 'Café image gallery',
      'a11y.carouselLive': 'Carousel announcements'
    },
    zh: {
      'page.title': '紧张的洛拉 — 咖啡馆',
      'page.h1': '紧张的洛拉',
      'page.description': '紧张的洛拉 — 有个性的咖啡馆。',
      'hero.slide1.alt': '咖啡馆环境',
      'hero.slide2.alt': '冰咖啡',
      'a11y.carousel': '咖啡馆图片展示',
      'a11y.carouselLive': '轮播提示'
    },
    ko: {
      'page.title': 'Nervous Lola — 카페',
      'page.h1': 'Nervous Lola',
      'page.description': 'Nervous Lola — 개성 있는 카페.',
      'hero.slide1.alt': '카페 인테리어',
      'hero.slide2.alt': '아이스 커피',
      'a11y.carousel': '카페 이미지 갤러리',
      'a11y.carouselLive': '캐러셀 안내'
    },
    ja: {
      'page.title': 'Nervous Lola — カフェ',
      'page.h1': 'Nervous Lola',
      'page.description': 'Nervous Lola — 個性あるカフェ。',
      'hero.slide1.alt': 'カフェの内装',
      'hero.slide2.alt': 'アイスコーヒー',
      'a11y.carousel': 'カフェのギャラリー',
      'a11y.carouselLive': 'カルーセルの案内'
    }
  };

  async function loadMap(lang) {
    if (window.__LOLA_I18N_FILE_PROTOCOL) {
      return EMBEDDED[lang] || EMBEDDED.ru;
    }
    try {
      const res = await fetch(`assets/data/translations/${lang}.json`, { cache: 'no-store' });
      if (!res.ok) {
        return EMBEDDED[lang] || EMBEDDED.ru;
      }
      return await res.json();
    } catch {
      return EMBEDDED[lang] || EMBEDDED.ru;
    }
  }

  function applyMap(map) {
    const t = (key) => (map && map[key]) || '';

    if (map['page.title']) {
      document.title = map['page.title'];
    }

    const metaDesc = document.getElementById('meta-description');
    if (metaDesc && map['page.description']) {
      metaDesc.setAttribute('content', map['page.description']);
    }
    const ogTitle = document.getElementById('meta-og-title');
    if (ogTitle && map['page.title']) {
      ogTitle.setAttribute('content', map['page.title']);
    }
    const ogDesc = document.getElementById('meta-og-description');
    if (ogDesc && map['page.description']) {
      ogDesc.setAttribute('content', map['page.description']);
    }

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) {
        return;
      }
      const val = t(key);
      if (!val) {
        return;
      }
      if (el.tagName === 'IMG') {
        el.setAttribute('alt', val);
      } else {
        el.textContent = val;
      }
    });

    const hero = document.getElementById('hero');
    if (hero && map['a11y.carousel']) {
      hero.setAttribute('aria-label', map['a11y.carousel']);
    }
    const live = document.querySelector('[data-carousel-live]');
    if (live && map['a11y.carouselLive']) {
      live.setAttribute('aria-label', map['a11y.carouselLive']);
    }
  }

  async function applyLanguage(lang) {
    const code = isLocaleSupported(lang) ? lang : 'ru';
    const map = await loadMap(code);
    document.documentElement.lang = getHtmlLangForLocale(code);
    applyMap(map);
  }

  window.addEventListener('languageChanged', (e) => {
    const lang = e.detail && e.detail.lang;
    if (isLocaleSupported(lang)) {
      void applyLanguage(lang);
    }
  });

  function onReady() {
    void applyLanguage(getInitialLocale());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
}());

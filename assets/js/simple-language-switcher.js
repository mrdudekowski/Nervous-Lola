/**
 * @deprecated Для продакшена используйте бандл Webpack: `main.js` подключает
 * `modules/language-switcher.js` и `i18n/config.js` (единый список локалей).
 * Этот файл оставлен для совместимости со старыми HTML-демо без сборщика.
 */
(function initLanguageSwitcherLegacy() {
  const LANGS = [
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
    { code: 'zh', label: 'ZH' },
    { code: 'ko', label: 'KO' },
    { code: 'ja', label: 'JA' }
  ];

  const STORAGE_KEY = 'lola.lang';

  function readStoredLang() {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      return v && LANGS.some((l) => l.code === v) ? v : 'ru';
    } catch {
      return 'ru';
    }
  }

  function buildUi(root) {
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    root.classList.add('language-switcher');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'language-switcher-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const menu = document.createElement('ul');
    menu.className = 'language-switcher-menu';
    menu.setAttribute('role', 'listbox');

    let current = readStoredLang();

    function setTriggerLabel() {
      const item = LANGS.find((l) => l.code === current);
      trigger.textContent = item ? item.label : 'RU';
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
      menu.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function selectLang(code) {
      current = code;
      try {
        window.localStorage.setItem(STORAGE_KEY, code);
      } catch {
        /* ignore */
      }
      setTriggerLabel();
      menu.querySelectorAll('.language-switcher-option').forEach((btn) => {
        const isAct = btn.getAttribute('data-lang-code') === code;
        btn.classList.toggle('is-active', isAct);
        btn.setAttribute('aria-selected', isAct ? 'true' : 'false');
      });
      closeMenu();
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: code } }));
    }

    LANGS.forEach((lang) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'none');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'language-switcher-option';
      btn.setAttribute('role', 'option');
      btn.setAttribute('data-lang-code', lang.code);
      btn.textContent = lang.label;
      btn.addEventListener('click', () => selectLang(lang.code));
      li.appendChild(btn);
      menu.appendChild(li);
    });

    trigger.addEventListener('click', () => {
      if (menu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) {
        closeMenu();
      }
    });

    root.appendChild(trigger);
    root.appendChild(menu);
    selectLang(current);
  }

  function run() {
    const root = document.getElementById('language-switcher-root');
    if (!root) {
      return;
    }
    buildUi(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}());

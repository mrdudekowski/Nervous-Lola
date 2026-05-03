/**
 * Компактный переключатель языка для навбара: кнопка + listbox (APG-совместимая клавиатура).
 */
import {
  LOCALES,
  STORAGE_KEY,
  isLocaleSupported,
  getLocaleConfig,
  getInitialLocale
} from '../i18n/config.js';

const MENU_ID_PREFIX = 'language-switcher-menu-';

function uid() {
  return `${MENU_ID_PREFIX}${Math.random().toString(36).slice(2, 9)}`;
}

function persistLocale(code) {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
}

function dispatchLanguageChanged(code) {
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: code } }));
}

function positionMenu(trigger, menu) {
  const rect = trigger.getBoundingClientRect();
  const margin = 8;
  menu.style.position = 'fixed';
  const estHeight = menu.offsetHeight || 200;
  const spaceBelow = window.innerHeight - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  const openUp = spaceBelow < estHeight && spaceAbove > spaceBelow;

  let top = openUp ? rect.top - estHeight - margin : rect.bottom + margin;
  let left = rect.right - menu.offsetWidth;
  left = Math.max(margin, Math.min(left, window.innerWidth - menu.offsetWidth - margin));
  top = Math.max(margin, Math.min(top, window.innerHeight - menu.offsetHeight - margin));

  menu.style.top = `${Math.round(top)}px`;
  menu.style.left = `${Math.round(left)}px`;
  menu.style.right = 'auto';
  menu.style.bottom = 'auto';
  menu.dataset.placement = openUp ? 'up' : 'down';
}

/**
 * @param {HTMLElement} root
 */
export function initNavbarLanguageSwitcher(root) {
  if (!root || root.dataset.langSwitcherInit === '1') {
    return;
  }
  root.dataset.langSwitcherInit = '1';
  root.classList.add('language-switcher');
  root.innerHTML = '';

  const menuId = uid();
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'language-switcher-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', menuId);
  trigger.setAttribute('aria-label', 'Выбор языка интерфейса');

  const menu = document.createElement('ul');
  menu.id = menuId;
  menu.className = 'language-switcher-menu';
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-label', 'Доступные языки');
  menu.hidden = true;
  menu.tabIndex = -1;

  /** @type {HTMLButtonElement[]} */
  const optionButtons = [];

  LOCALES.forEach((locale) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'language-switcher-option';
    btn.setAttribute('role', 'option');
    btn.setAttribute('data-lang-code', locale.code);
    btn.id = `${menuId}-opt-${locale.code}`;
    btn.textContent = locale.menuLabel;
    btn.setAttribute('aria-selected', 'false');
    li.appendChild(btn);
    menu.appendChild(li);
    optionButtons.push(btn);
  });

  let isOpen = false;
  let current = getInitialLocale();
  if (!isLocaleSupported(current)) {
    current = 'ru';
  }

  function getOptionIndex(el) {
    return optionButtons.indexOf(el);
  }

  function focusOptionAt(index) {
    const len = optionButtons.length;
    if (!len) {
      return;
    }
    const i = ((index % len) + len) % len;
    optionButtons[i].focus();
  }

  function setTriggerSurface() {
    const cfg = getLocaleConfig(current);
    trigger.textContent = cfg ? cfg.label : current.toUpperCase().slice(0, 2);
    trigger.setAttribute(
      'aria-label',
      cfg ? `Язык: ${cfg.menuLabel}. Открыть список языков` : 'Выбор языка интерфейса'
    );
  }

  function syncOptionsSelected() {
    optionButtons.forEach((btn) => {
      const code = btn.getAttribute('data-lang-code');
      const sel = code === current;
      btn.classList.toggle('is-active', sel);
      btn.setAttribute('aria-selected', sel ? 'true' : 'false');
    });
  }

  function applyChoice(code, { persist } = { persist: false }) {
    if (!isLocaleSupported(code)) {
      return;
    }
    current = code;
    setTriggerSurface();
    syncOptionsSelected();
    if (persist) {
      persistLocale(code);
      dispatchLanguageChanged(code);
    }
  }

  function closeMenu() {
    if (!isOpen) {
      return;
    }
    isOpen = false;
    menu.classList.remove('is-open');
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    window.removeEventListener('resize', onResizeOrScroll);
    window.removeEventListener('scroll', onResizeOrScroll, true);
    document.removeEventListener('click', onOutside, true);
    document.removeEventListener('keydown', onDocEscape, true);
  }

  function openMenu() {
    if (isOpen) {
      return;
    }
    isOpen = true;
    menu.hidden = false;
    menu.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => {
      positionMenu(trigger, menu);
      const activeBtn = optionButtons.find((b) => b.getAttribute('data-lang-code') === current);
      (activeBtn || optionButtons[0]).focus();
    });
    window.addEventListener('resize', onResizeOrScroll);
    window.addEventListener('scroll', onResizeOrScroll, { passive: true, capture: true });
    document.addEventListener('click', onOutside, true);
    document.addEventListener('keydown', onDocEscape, true);
  }

  function toggleMenu() {
    if (isOpen) {
      closeMenu();
      trigger.focus();
    } else {
      openMenu();
    }
  }

  function onResizeOrScroll() {
    if (isOpen) {
      positionMenu(trigger, menu);
    }
  }

  function onOutside(event) {
    if (!root.contains(event.target)) {
      closeMenu();
    }
  }

  function onDocEscape(event) {
    if (event.key === 'Escape' && isOpen) {
      event.stopPropagation();
      closeMenu();
      trigger.focus();
    }
  }

  trigger.addEventListener('click', () => {
    toggleMenu();
  });

  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMenu();
    } else if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault();
      openMenu();
    } else if (event.key === 'ArrowUp' && !isOpen) {
      event.preventDefault();
      openMenu();
      focusOptionAt(optionButtons.length - 1);
    }
  });

  menu.addEventListener('keydown', (event) => {
    const focused = document.activeElement;
    const idx = focused instanceof HTMLButtonElement ? getOptionIndex(focused) : -1;

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
      trigger.focus();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusOptionAt(idx < 0 ? 0 : idx + 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusOptionAt(idx < 0 ? optionButtons.length - 1 : idx - 1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusOptionAt(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusOptionAt(optionButtons.length - 1);
    }
  });

  optionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-lang-code');
      if (!code) {
        return;
      }
      applyChoice(code, { persist: true });
      closeMenu();
      trigger.focus();
    });
  });

  root.appendChild(trigger);
  root.appendChild(menu);

  applyChoice(current, { persist: false });
}

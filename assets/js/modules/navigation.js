import { scrollToAnchorElement } from './smooth-scroll.js';

function focusFirstHeading(section) {
  const h = section && section.querySelector('h1, h2');
  if (h && typeof h.focus === 'function') {
    try {
      h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
    } catch {
      /* noop */
    }
  }
}

const MOBILE_NAV_QUERY = '(max-width: 47.9375rem)';

function isMobileNavViewport() {
  return window.matchMedia(MOBILE_NAV_QUERY).matches;
}

function getMobileNavElements() {
  return {
    checkbox: document.querySelector('.site-nav-checkbox'),
    toggleLabel: document.querySelector('.site-nav-toggle'),
    nav: document.getElementById('site-nav')
  };
}

function syncMobileNavOverlay() {
  const { checkbox, toggleLabel, nav } = getMobileNavElements();
  if (!checkbox || !toggleLabel || !nav) return;

  const mobile = isMobileNavViewport();
  const open = mobile && checkbox.checked;

  toggleLabel.setAttribute('aria-expanded', mobile ? String(open) : 'false');

  if (!mobile) {
    nav.removeAttribute('inert');
    checkbox.checked = false;
    return;
  }

  if (open) {
    nav.removeAttribute('inert');
  } else {
    nav.setAttribute('inert', '');
  }
}

function setupMobileNavOverlay() {
  const { checkbox } = getMobileNavElements();
  if (!checkbox) return;

  const mq = window.matchMedia(MOBILE_NAV_QUERY);
  const onMq = () => syncMobileNavOverlay();

  checkbox.addEventListener('change', syncMobileNavOverlay);
  mq.addEventListener('change', onMq);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && checkbox.checked) {
      checkbox.checked = false;
      syncMobileNavOverlay();
    }
  });

  window.addEventListener(
    'scroll',
    () => {
      closeMobileNavIfOpen();
    },
    { passive: true, capture: true }
  );

  document.addEventListener(
    'pointerdown',
    (event) => {
      if (!isMobileNavViewport()) return;
      if (!checkbox.checked) return;
      const shell = document.querySelector('.site-header-shell');
      if (shell?.contains(event.target)) return;
      checkbox.checked = false;
      syncMobileNavOverlay();
    },
    true
  );

  syncMobileNavOverlay();
}

function closeMobileNavIfOpen() {
  const { checkbox } = getMobileNavElements();
  if (!checkbox || !checkbox.checked) return;
  checkbox.checked = false;
  syncMobileNavOverlay();
}

export function initNavigation() {
  const links = document.querySelectorAll('#site-nav a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      closeMobileNavIfOpen();
      scrollToAnchorElement(target, {
        onComplete: () => focusFirstHeading(target)
      });
    });
  });

  setupMobileNavOverlay();
}

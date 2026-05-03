import { CONTACT_LINKS } from '../config/contact-links.js';

const ICONS = {
  telegram:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21.944 3.017c-.18-.725-.75-1.22-1.44-1.22-.18 0-.36.03-.54.09L2.64 9.27c-.9.33-1.05 1.62-.24 2.19l4.2 3.03 1.62 5.01c.21.66.96.9 1.47.45l2.22-1.83 4.35 3.18c.57.42 1.38.27 1.74-.33l6.9-12.93c.33-.63.03-1.41-.6-1.74zM17.4 6.9 9.9 14.1 7.5 11.7l8.7-5.55-1.8.75z"/></svg>',
  whatsapp:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.52 3.48A11.86 11.86 0 0 0 12.05 0C5.42 0 .06 5.36.06 11.99c0 2.11.55 4.17 1.6 5.99L0 24l6.19-1.62a11.9 11.9 0 0 0 5.86 1.5h.01c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.54-8.4zM12.04 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.67.96.98-3.57-.22-.35a9.43 9.43 0 0 1-1.44-5.03c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.24 9.44-9.45 9.44zm5.46-7.43c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.67-1.61-.92-2.2-.24-.56-.49-.48-.67-.48-.17 0-.38-.02-.58-.02-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5 0 1.48 1.09 2.91 1.24 3.11.15.2 2.14 3.27 5.18 4.59.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z"/></svg>',
  phone:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6.6 10.8c1.65 3.3 4.5 6.12 7.8 7.77l2.6-2.6c.4-.4 1-.5 1.5-.3 1.05.35 2.18.54 3.3.54.84 0 1.5.66 1.5 1.5V21c0 .84-.66 1.5-1.5 1.5C10.56 22.5 1.5 13.44 1.5 3C1.5 2.16 2.16 1.5 3 1.5H6c.84 0 1.5.66 1.5 1.5 0 1.14.2 2.26.55 3.3.18.5.08 1.1-.32 1.5L6.6 10.8z"/></svg>'
};

function isReadyHref(href) {
  if (typeof href !== 'string') return false;
  const t = href.trim();
  return /^https?:\/\//i.test(t) || /^tel:/i.test(t) || /^tg:/i.test(t);
}

function resolveHref(fromContent, fallback) {
  const c = typeof fromContent === 'string' ? fromContent.trim() : '';
  if (c && isReadyHref(c)) return c;
  const f = typeof fallback === 'string' ? fallback.trim() : '';
  return f && isReadyHref(f) ? f : '';
}

function buildAction(className, label, href, iconHtml, iconOnly) {
  const ready = isReadyHref(href);
  if (ready) {
    const a = document.createElement('a');
    a.className = `contact-action ${className}`;
    a.href = href.trim();
    const trimmed = href.trim();
    if (/^https?:/i.test(trimmed)) {
      a.rel = 'noopener noreferrer';
      a.target = '_blank';
    }
    if (iconOnly) {
      a.setAttribute('aria-label', label);
      a.innerHTML = iconHtml;
    } else {
      a.innerHTML = `${iconHtml}<span>${label}</span>`;
    }
    return a;
  }
  const span = document.createElement('span');
  span.className = `contact-action contact-action--disabled ${className}`;
  span.setAttribute('role', 'note');
  span.title = 'Подставить из заказчика';
  if (iconOnly) {
    span.setAttribute('aria-label', label);
    span.innerHTML = iconHtml;
  } else {
    span.innerHTML = `${iconHtml}<span>${label}</span>`;
  }
  return span;
}

/** @param {{ showHint?: boolean; iconOnly?: boolean }} [options] */
export function renderContacts(container, contacts, options = {}) {
  if (!container || !contacts) return;
  const { showHint = true, iconOnly = false } = options;
  container.replaceChildren();

  const wrap = document.createElement('div');
  wrap.className = iconOnly ? 'contacts__actions contacts__actions--icon-only' : 'contacts__actions';

  const tgHref = resolveHref(contacts.telegram?.href, CONTACT_LINKS.telegram);
  const waHref = resolveHref(contacts.whatsapp?.href, CONTACT_LINKS.whatsapp);
  const phoneHref = resolveHref(contacts.phone?.href, CONTACT_LINKS.phone);

  wrap.appendChild(buildAction('contact-action--tg', contacts.telegram.label, tgHref, ICONS.telegram, iconOnly));
  wrap.appendChild(buildAction('contact-action--wa', contacts.whatsapp.label, waHref, ICONS.whatsapp, iconOnly));
  wrap.appendChild(buildAction('contact-action--phone', contacts.phone.label, phoneHref, ICONS.phone, iconOnly));

  container.appendChild(wrap);

  if (showHint && contacts.hint) {
    const hint = document.createElement('p');
    hint.className = 'section__lead';
    hint.style.marginTop = '1rem';
    hint.textContent = contacts.hint;
    container.appendChild(hint);
  }
}

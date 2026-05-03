/**
 * Точка входа: стили + инициализация секций лендинга.
 */
import '../css/tokens.css';
import '../css/base.css';
import '../css/layout.css';
import '../css/utilities.css';
import '../css/components/navbar.css';
import '../css/components/language-switcher.css';
import '../css/components/carousel-controls.css';
import '../css/components/hero.css';
import '../css/components/intro.css';
import '../css/components/atmosphere.css';
import '../css/components/about.css';
import '../css/components/menu.css';
import '../css/components/map-section.css';
import '../css/components/contacts.css';
import '../css/components/site-footer.css';

import siteContent from '../data/site-content.json';
import menuCatalog from '../data/menu.json';
import { CAFE_LOCATION } from './config/location.js';
import { iconPath } from './config/assets-paths.js';
import './fallback.js';
import './translation-applier.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initNavigation } from './modules/navigation.js';
import { initNavbarLanguageSwitcher } from './modules/language-switcher.js';
import { initHeroCarousel } from './modules/hero-carousel.js';
import { initAboutCarousel } from './modules/about-carousel.js';
import { mountAboutAmbientVideo } from './modules/about-ambient-video.js';
import { renderMenu } from './modules/menu-renderer.js';
import { initYandexMap } from './modules/yandex-map.js';
import { renderContacts } from './modules/contacts.js';

function applyMeta() {
  document.title = siteContent.meta.title;
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', siteContent.meta.description);
}

/**
 * Логотипы: пути из site-content.json → brand (+ iconPath).
 * Шапка и hero: logoFile; при необходимости шапка — navbarLogoFile (переопределение).
 */
function applyBrandLogoSources() {
  const brand = siteContent.brand;
  if (!brand) return;

  const navFile = brand.navbarLogoFile || brand.logoFile;
  const heroFile = brand.logoFile;
  const navW = brand.navbarLogoIntrinsicWidth ?? brand.logoIntrinsicWidth;
  const navH = brand.navbarLogoIntrinsicHeight ?? brand.logoIntrinsicHeight;
  const heroW = brand.logoIntrinsicWidth;
  const heroH = brand.logoIntrinsicHeight;

  const navImg = document.querySelector('.site-logo img');
  if (navImg && navFile) {
    navImg.src = iconPath(navFile);
    if (typeof navW === 'number' && Number.isFinite(navW)) navImg.width = navW;
    if (typeof navH === 'number' && Number.isFinite(navH)) navImg.height = navH;
  }

  const heroLogo = document.querySelector('.hero__logo');
  if (heroLogo && heroFile) {
    heroLogo.src = iconPath(heroFile);
    if (typeof heroW === 'number' && Number.isFinite(heroW)) heroLogo.width = heroW;
    if (typeof heroH === 'number' && Number.isFinite(heroH)) heroLogo.height = heroH;
  }
}

function mountAbout() {
  const h = document.getElementById('privet-heading');
  const body = document.getElementById('privet-body');
  const about = siteContent.about;
  if (!about) return;

  if (h) h.textContent = about.heading;
  if (body) {
    const p = document.createElement('p');
    p.textContent = about.body;
    body.replaceChildren(p);
  }
}

function mountSectionCopy() {
  const mh = document.getElementById('menu-heading');
  const mc = document.getElementById('menu-callout');
  const calloutWrap = document.querySelector('.menu-section__aside-callout');
  if (mh) mh.textContent = menuCatalog.section?.heading ?? 'Меню';
  const calloutText = typeof menuCatalog.section?.calloutRu === 'string' ? menuCatalog.section.calloutRu.trim() : '';
  if (mc) mc.textContent = calloutText;
  if (calloutWrap) calloutWrap.hidden = !calloutText;

  const mapH = document.getElementById('map-heading');
  const mapN = document.getElementById('map-note');
  const mapAddr = document.getElementById('map-address');
  if (mapH) mapH.textContent = siteContent.map.heading;
  if (mapN) mapN.textContent = siteContent.map.note;
  if (mapAddr) mapAddr.textContent = CAFE_LOCATION.addressLine;

  const ch = document.getElementById('contacts-heading');
  if (ch) ch.textContent = siteContent.contacts.heading;
}

function mountFooter() {
  const el = document.getElementById('footer-copy');
  if (!el) return;
  el.textContent = `${siteContent.footer.brand} · ${CAFE_LOCATION.addressLine}`;
}

function readCssMs(varName, fallback) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

function boot() {
  applyMeta();
  applyBrandLogoSources();
  mountAbout();
  mountAboutAmbientVideo(
    document.getElementById('about-video-mount'),
    document.getElementById('privet'),
    siteContent.videos?.items ?? []
  );
  mountSectionCopy();
  mountFooter();

  initSmoothScroll();
  initNavigation();

  const langRoot = document.getElementById('language-switcher-root');
  if (langRoot) {
    initNavbarLanguageSwitcher(langRoot);
  }

  const heroRoot = document.getElementById('hero-mount');
  const heroMs = readCssMs('--hero-interval-ms', 4000);
  const heroSlides = siteContent.hero?.slides ?? [];
  if (heroRoot && heroSlides.length) {
    initHeroCarousel(heroRoot, heroSlides, {
      intervalMs: heroMs,
      ariaLabel: siteContent.hero?.ariaLabel
    });
  }

  const aboutCarouselRoot = document.getElementById('about-carousel-mount');
  const atmoMs = readCssMs('--atmo-interval-ms', 5500);
  if (aboutCarouselRoot && siteContent.about?.slides?.length) {
    initAboutCarousel(aboutCarouselRoot, siteContent.about, {
      intervalMs: atmoMs,
      imgSizesFull: '(max-width: 47.9375rem) 100vw, min(52vw, 42rem)',
      imgSizesDuo: '(max-width: 47.9375rem) 42vw, min(28vw, 24rem)'
    });
  }

  const menuMount = document.getElementById('menu-mount');
  renderMenu(menuMount, menuCatalog);

  const mapRoot = document.getElementById('yandex-map-root');
  void initYandexMap(mapRoot);

  const contactsMount = document.getElementById('contacts-mount');
  renderContacts(contactsMount, siteContent.contacts, { showHint: false, iconOnly: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

import { CAFE_LOCATION } from '../config/location.js';

function readApiKey() {
  if (typeof window === 'undefined') return '';
  const fromEnv = window.__NL_ENV && window.__NL_ENV.YANDEX_MAP_API_KEY;
  return typeof fromEnv === 'string' ? fromEnv.trim() : '';
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Yandex Maps script failed'));
    document.head.appendChild(s);
  });
}

export async function initYandexMap(container) {
  if (!container) return;

  const address = document.createElement('p');
  address.className = 'map-address';
  address.textContent = CAFE_LOCATION.addressLine;
  container.insertAdjacentElement('beforebegin', address);

  const key = readApiKey();
  if (!key) {
    const fb = document.createElement('div');
    fb.className = 'map-root__fallback';
    fb.setAttribute('role', 'status');
    fb.innerHTML =
      '<p>Карта не загружена: не задан API-ключ Яндекс.Карт.</p>' +
      '<p>Скопируйте <code>.env.example</code> в <code>.env</code>, укажите <code>YANDEX_MAP_API_KEY</code> и выполните сборку — ключ подставится из одного места (см. отчёт).</p>';
    container.appendChild(fb);
    return;
  }

  const mapDiv = document.createElement('div');
  mapDiv.id = 'yandex-map-canvas';
  container.appendChild(mapDiv);

  const url = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;
  try {
    await loadScript(url);
  } catch {
    const fb = document.createElement('div');
    fb.className = 'map-root__fallback';
    fb.textContent = 'Не удалось загрузить API Яндекс.Карт. Проверьте ключ и сеть.';
    container.appendChild(fb);
    return;
  }

  const center = [CAFE_LOCATION.lat, CAFE_LOCATION.lon];
  window.ymaps.ready(() => {
    const map = new window.ymaps.Map(
      mapDiv.id,
      {
        center,
        zoom: 16,
        controls: ['zoomControl', 'fullscreenControl']
      },
      { suppressMapOpenBlock: true }
    );
    const placemark = new window.ymaps.Placemark(
      center,
      {
        balloonContent: `Нервная Лола<br>${CAFE_LOCATION.addressLine}`
      },
      { preset: 'islands#redDotIcon' }
    );
    map.geoObjects.add(placemark);
  });
}

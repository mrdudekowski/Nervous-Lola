/**
 * Единообразные атрибуты для растровых изображений в hero (без сетевых запросов).
 */
(function enforceImageAttributes() {
  function run() {
    document.querySelectorAll('#hero img[src$=".png"], #hero img[src$=".jpg"], #hero img[src$=".jpeg"], #hero img[src$=".webp"]').forEach((img) => {
      if (!img.getAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}());

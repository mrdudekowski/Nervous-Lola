/**
 * При открытии через file:// fetch к JSON часто недоступен — помечаем режим для translation-applier.
 */
(function markFileProtocol() {
  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return;
  }
  if (window.location.protocol === 'file:') {
    window.__LOLA_I18N_FILE_PROTOCOL = true;
  }
}());

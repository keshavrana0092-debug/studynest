/* ============================================================
   StudyNest – Google Analytics 4 setup
   ------------------------------------------------------------
   STEP: Replace G-XXXXXXXXXX below with YOUR Measurement ID
   (GA4 > Admin > Data streams > your web stream > Measurement ID).
   This is the ONLY line you need to change. Every page loads this file.
   ============================================================ */
var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

(function () {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };

  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.indexOf('XXXX') !== -1) {
    console.warn('[StudyNest] GA4 Measurement ID not set yet – events are only logged to the console.');
    window.snTrack = function (name, params) { console.log('[StudyNest event]', name, params || {}); };
    return;
  }

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(s);

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);

  /* Helper used by main.js to send custom events */
  window.snTrack = function (name, params) {
    gtag('event', name, params || {});
  };
})();

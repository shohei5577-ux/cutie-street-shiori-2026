/* Service Worker for 旅のしおり (CUTIE STREET 東京遠征 2026) */
/* Strategy:
 *   - Precache: app shell (HTML / JS / CSS / fonts / icons / cover image)
 *   - HTML & trip-data.js: network-first (avoid stale itinerary)
 *   - Other same-origin: cache-first (immutable-like assets)
 *   - Google Fonts: stale-while-revalidate
 *   - Offline fallback: cached index.html
 */

const VERSION = 'shiori-v2-2026-06';
const PRECACHE = `${VERSION}-precache`;
const RUNTIME = `${VERSION}-runtime`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './override.css',
  './enhance.js',
  './booklet.compiled.js',
  './trip-data.js',
  './vendor/react.production.min.js',
  './vendor/react-dom.production.min.js',
  './kawaii-pro/dist/atoms.js',
  './kawaii-pro/dist/pages.js',
  './kawaii-pro/dist/main.js',
  './kawaii-pro/dist/tweaks-panel.js',
  './assets/cover-oshi-trip.png',
  './assets/og-image.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== PRECACHE && key !== RUNTIME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigations: network-first (with offline fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Google Fonts: stale-while-revalidate
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request, RUNTIME));
    return;
  }

  // Same-origin: split network-first (fresh content) vs cache-first (static assets)
  if (url.origin === self.location.origin) {
    const isFreshContent =
      url.pathname.endsWith('/trip-data.js') ||
      url.pathname.endsWith('/index.html') ||
      url.pathname === '/' ||
      url.pathname.endsWith('/manifest.webmanifest');
    if (isFreshContent) {
      event.respondWith(networkFirst(request, RUNTIME));
    } else {
      event.respondWith(cacheFirst(request, RUNTIME));
    }
    return;
  }
});

function cacheFirst(request, cacheName) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        const clone = response.clone();
        caches.open(cacheName).then((cache) => cache.put(request, clone));
      }
      return response;
    });
  });
}

function networkFirst(request, cacheName) {
  return fetch(request).then((response) => {
    if (response && response.status === 200) {
      const clone = response.clone();
      caches.open(cacheName).then((cache) => cache.put(request, clone));
    }
    return response;
  }).catch(() => caches.match(request));
}

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
}

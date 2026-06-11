/* Service Worker — CUTIE STREET 有明遠征しおり 2026 */
/* Strategy:
 *   - Precache: app shell(HTML / JS / CSS / icons のみ。大型画像は入れない)
 *   - HTML / manifest: network-first(行程の鮮度を優先)
 *   - CSS / JS: stale-while-revalidate(即表示しつつ裏で更新)
 *   - その他同一オリジン: cache-first
 *   - Google Fonts: stale-while-revalidate
 *   - オフライン時: キャッシュした index.html
 *
 *   ★デプロイのたびに VERSION を必ず上げること。
 *    上げ忘れると既存訪問者に旧 CSS/JS が配信され続ける。
 */

const VERSION = 'shiori-v12-2026-06';
const PRECACHE = `${VERSION}-precache`;
const RUNTIME = `${VERSION}-runtime`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './styles.css',
  './app.js',
  './image-slot.js',
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

  // ナビゲーション: network-first(オフライン時は index.html)
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('./index.html')));
    return;
  }

  // Google Fonts: stale-while-revalidate
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request, RUNTIME));
    return;
  }

  if (url.origin === self.location.origin) {
    const path = url.pathname;
    // HTML / manifest: 常に最新を取りに行く
    if (path.endsWith('/index.html') || path.endsWith('/') || path.endsWith('/manifest.webmanifest')) {
      event.respondWith(networkFirst(request, RUNTIME));
      return;
    }
    // CSS / JS: 即表示 + 裏で更新(デザイン刷新が確実に届く)
    if (path.endsWith('.css') || path.endsWith('.js')) {
      event.respondWith(staleWhileRevalidate(request, RUNTIME));
      return;
    }
    // その他(画像・アイコンなど): cache-first
    event.respondWith(cacheFirst(request, RUNTIME));
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

/* Minimal service worker:
   - Cache static assets on demand (icons/manifest/og + built assets under /assets/)
   - Network-first for HTML, cache fallback
*/

const CACHE_NAME = 'used-book-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        '/',
        '/index.html',
        '/manifest.webmanifest',
        '/og.png',
        '/favicon.png',
        '/icons/icon-180.png',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
      ])
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isHtml =
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html') ||
    url.pathname === '/';

  const isCacheFirst =
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/og.png' ||
    url.pathname === '/favicon.png';

  if (isHtml) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          return cached || (await caches.match('/index.html')) || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  if (isCacheFirst) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const fresh = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, fresh.clone());
        return fresh;
      })()
    );
    return;
  }

  // Default: try network, fall back to cache.
  event.respondWith(
    (async () => {
      try {
        return await fetch(request);
      } catch {
        const cached = await caches.match(request);
        return cached || new Response('Offline', { status: 503 });
      }
    })()
  );
});


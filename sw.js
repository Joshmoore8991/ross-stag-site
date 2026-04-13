// Minimal service worker — caches the app shell for offline read access.
const CACHE = 'stag-shell-v2';
const SHELL = ['/', '/index.html', '/rossstag.css', '/rossstag.js', '/manifest.webmanifest', '/404.html'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(SHELL); }).catch(function () {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only handle same-origin + known font/stylesheet CDN reads.
  if (url.origin !== location.origin) return;
  // Bypass Supabase or API calls if ever hosted same-origin.
  if (url.pathname.indexOf('/rest/v1') !== -1) return;
  event.respondWith(
    fetch(req)
      .then(function (res) {
        // Cache successful responses opportunistically.
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); }).catch(function () {});
        }
        return res;
      })
      .catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('/index.html');
        });
      })
  );
});

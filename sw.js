// Minimal service worker — caches the app shell for offline read access.
const CACHE = 'stag-shell-v16';
const SHELL = [
  './',
  './index.html',
  './rossstag.css?v=20260415-4',
  './rossstag.js?v=20260415-4',
  './404.html'
];
// The manifest is intentionally NOT pre-cached — iOS reads it fresh every
// time the user installs to Home Screen, and a stale cached copy would pin
// the old start_url even after we fix it server-side.

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
  // Bypass Supabase or API calls if ever hosted same-origin.
  if (url.pathname.indexOf('/rest/v1') !== -1) return;

  const isSameOrigin = url.origin === location.origin;
  // Always fetch the manifest from the network — it steers the PWA's
  // start_url on install, so serving a stale cached copy strands users
  // at the old URL.
  if (isSameOrigin && url.pathname.endsWith('/manifest.webmanifest')) return;
  const isStaticAsset = /\.(css|js|png|jpg|jpeg|webp|svg|woff2?|ttf|ico)$/i.test(url.pathname);
  const isImageCDN = /images\.unsplash\.com|fonts\.(?:googleapis|gstatic)\.com/.test(url.host);

  // Cache-first for static assets (own domain or known image/font CDNs).
  if ((isSameOrigin && isStaticAsset) || isImageCDN) {
    event.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) {
          // Revalidate in the background.
          fetch(req).then(function (res) {
            if (res && (res.status === 200 || res.type === 'opaque')) {
              caches.open(CACHE).then(function (cache) { cache.put(req, res.clone()); }).catch(function () {});
            }
          }).catch(function () {});
          return hit;
        }
        return fetch(req).then(function (res) {
          if (res && (res.status === 200 || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE).then(function (cache) { cache.put(req, copy); }).catch(function () {});
          }
          return res;
        }).catch(function () { return caches.match('./index.html'); });
      })
    );
    return;
  }

  // Network-first for everything else same-origin, with cache fallback.
  if (!isSameOrigin) return;
  event.respondWith(
    fetch(req)
      .then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); }).catch(function () {});
        }
        return res;
      })
      .catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('./index.html');
        });
      })
  );
});

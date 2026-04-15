const CACHE_NAME = 'deutsch-party-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/design-tokens.css',
  './css/base.css',
  './css/components.css',
  './js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Service Worker deliberately disabled.
// All caching was causing reload loops and breaking navigation.
// This file is intentionally empty.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
// Pass-through: no caching, no reload loops.
self.addEventListener('fetch', event => event.respondWith(fetch(event.request)));

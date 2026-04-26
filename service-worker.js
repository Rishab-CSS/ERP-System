const CACHE_NAME = "erp-v2";

const urlsToCache = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/navbar.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match("/") || caches.match("/index.html");
    })
  );
});
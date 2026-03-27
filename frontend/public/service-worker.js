// Axiom OS Service Worker — network-first for HTML, cache-first for hashed assets
const CACHE_NAME = 'axiom-v4';

// On install, immediately take over from any old SW
self.addEventListener('install', () => self.skipWaiting());

// On activate, delete all old caches and claim clients immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) =>
            Promise.all(
                names
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only handle same-origin GET requests
    if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

    // Hashed assets (e.g. /assets/index-abc123.js) — cache-first, immutable
    if (url.pathname.startsWith('/assets/')) {
        event.respondWith(
            caches.match(event.request).then((cached) =>
                cached || fetch(event.request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
            )
        );
        return;
    }

    // HTML and everything else — network-first so deployments are never stale
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful HTML responses as offline fallback
                if (response.ok && event.request.mode === 'navigate') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

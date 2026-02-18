const CACHE_NAME = 'bible-app-v7';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './js/app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './data/bible_ko.json',
    './data/bible_en_niv.json',
    './data/bible_en_nlt.json',
    './data/bible_en_esv.json',
    './data/book_name_mapping.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache, adding assets...');
                // We use a more resilient approach: add each one individually so if one fails, others might still work.
                // Or at least log which one fails.
                return Promise.allSettled(
                    ASSETS_TO_CACHE.map(url =>
                        cache.add(url).catch(err => console.error(`Failed to cache ${url}:`, err))
                    )
                );
            })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // 1. Skip caching for API calls (CORS or direct API path)
    if (event.request.url.includes('/api/') || event.request.url.includes('api-')) {
        return; // Let browser handle it normally
    }

    // 2. Optimized Strategy: Network First for all other assets
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If network is OK, update cache and return
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // If network fails (offline), try cache
                return caches.match(event.request);
            })
    );
});

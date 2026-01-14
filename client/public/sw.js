const CACHE_NAME = 'shulkwisec-v8-media';
const STATIC_CACHE = 'shulkwisec-static-v8';
const MEDIA_CACHE = 'shulkwisec-media-v8';
const DOCUMENT_CACHE = 'shulkwisec-docs-v8';

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.png',
    '/rug.svg'
];

// Install event: cache initial assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate event: cleanup old caches
self.addEventListener('activate', (event) => {
    const currentCaches = [STATIC_CACHE, MEDIA_CACHE, DOCUMENT_CACHE];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!currentCaches.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Helper: Determine cache strategy based on request
function getCacheStrategy(request) {
    const url = new URL(request.url);
    const extension = url.pathname.split('.').pop().toLowerCase();

    // Media files (images, videos, GIFs)
    const mediaExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'ogg', 'mov'];
    if (mediaExtensions.includes(extension)) {
        return { cache: MEDIA_CACHE, strategy: 'cache-first', maxAge: 30 * 24 * 60 * 60 * 1000 }; // 30 days
    }

    // Documents (PDFs, Office files)
    const docExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
    if (docExtensions.includes(extension)) {
        return { cache: DOCUMENT_CACHE, strategy: 'cache-first', maxAge: 7 * 24 * 60 * 60 * 1000 }; // 7 days
    }

    // External embeds (YouTube, Vimeo, Google Slides) - don't cache
    if (url.hostname.includes('youtube.com') ||
        url.hostname.includes('vimeo.com') ||
        url.hostname.includes('docs.google.com')) {
        return { cache: null, strategy: 'network-only' };
    }

    // Static assets (JS, CSS, fonts)
    const staticExtensions = ['js', 'css', 'woff', 'woff2', 'ttf', 'eot'];
    if (staticExtensions.includes(extension)) {
        // Specifically for template.json-related JS, use network-first to ensure data freshness
        if (url.pathname.includes('template')) {
            return { cache: STATIC_CACHE, strategy: 'network-first', maxAge: 5 * 60 * 1000 }; // 5 minutes
        }
        return { cache: STATIC_CACHE, strategy: 'stale-while-revalidate', maxAge: 7 * 24 * 60 * 60 * 1000 }; // 7 days
    }

    // HTML pages
    if (request.mode === 'navigate' || extension === 'html') {
        return { cache: STATIC_CACHE, strategy: 'network-first', maxAge: 60 * 60 * 1000 }; // 1 hour (reduced from 1 day)
    }

    // Default: stale-while-revalidate
    return { cache: STATIC_CACHE, strategy: 'stale-while-revalidate', maxAge: 24 * 60 * 60 * 1000 };
}

// Helper: Check if cached response is still fresh
function isFresh(response, maxAge) {
    if (!response) return false;
    const cachedDate = response.headers.get('date');
    if (!cachedDate) return false;
    const age = Date.now() - new Date(cachedDate).getTime();
    return age < maxAge;
}

// Cache-first strategy: Use cache if available, otherwise fetch
async function cacheFirst(request, cacheName, maxAge) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && isFresh(cachedResponse, maxAge)) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Return stale cache if network fails
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Network-first strategy: Try network, fallback to cache
async function networkFirst(request, cacheName, maxAge) {
    const cache = await caches.open(cacheName);

    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Fallback to index.html for navigation requests
        if (request.mode === 'navigate') {
            return cache.match('/index.html');
        }
        throw error;
    }
}

// Stale-while-revalidate strategy: Return cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
}

// Fetch event: Route to appropriate strategy
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests (except for known CDNs)
    const url = new URL(event.request.url);
    if (!url.origin.startsWith(self.location.origin) &&
        !url.hostname.includes('cdn') &&
        !url.hostname.includes('cloudflare')) {
        return;
    }

    const { cache, strategy, maxAge } = getCacheStrategy(event.request);

    // Network-only strategy (embeds)
    if (strategy === 'network-only') {
        return;
    }

    event.respondWith(
        (async () => {
            try {
                switch (strategy) {
                    case 'cache-first':
                        return await cacheFirst(event.request, cache, maxAge);
                    case 'network-first':
                        return await networkFirst(event.request, cache, maxAge);
                    case 'stale-while-revalidate':
                        return await staleWhileRevalidate(event.request, cache);
                    default:
                        return await fetch(event.request);
                }
            } catch (error) {
                console.error('Fetch failed:', error);
                // Return offline page for navigation requests
                if (event.request.mode === 'navigate') {
                    const cache = await caches.open(STATIC_CACHE);
                    return cache.match('/index.html');
                }
                return new Response('Offline', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            }
        })()
    );
});

// Message event: Allow clients to skip waiting
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

const CACHE_NAME = 'katleho-mytutor-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  // Add DBE resources for offline caching
  'https://www.education.gov.za/Portals/0/CDNE/NSC%202023/2023%20NSC%20Exams/Mathematics/P1/2023%20NSC%20Mathematics%20P1%20Nov%202023%20Eng.pdf',
  'https://www.education.gov.za/Portals/0/CDNE/CAPS%20FET/Life%20Orientation%20CAPS.pdf',
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request).catch(() => {
        // Fallback for offline PDF access
        if (event.request.url.includes('.pdf')) {
          return caches.match('/index.html'); // Fallback to app
        }
      }))
  );
});
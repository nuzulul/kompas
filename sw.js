// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHENAME = "pwabuilder-page";

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "offline.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHENAME)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

// 2. Clear old caches automatically on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHENAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

/*self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {

        const cache = await caches.open(CACHENAME);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});*/

/*
// Intercept network requests
self.addEventListener('fetch', (event) => {
  // Only handle standard GET requests (avoid caching POST/PUT/DELETE)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Check if the response is valid before caching
        if (networkResponse.ok) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHENAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed (offline), check the cache fallback
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Optional: Return a generic fallback offline page for HTML navigations
          if (event.request.mode === 'navigate') {
            return caches.match(offlineFallbackPage);
          }
        });
      })
  );
});
*/


//https://developer.chrome.com/docs/workbox/caching-strategies-overview#stale-while-revalidate
self.addEventListener('fetch', (event) => {
	
	if (event.request.method !== 'GET') return;
	
	if (event.request.referrer === 'http://127.0.0.1:8080/') return;
	
    event.respondWith(caches.open(CACHENAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
			if (networkResponse.ok) {
				cache.put(event.request, networkResponse.clone());
			}

          return networkResponse;
        });

        return cachedResponse || fetchedResponse;
      });
    }));
	
});
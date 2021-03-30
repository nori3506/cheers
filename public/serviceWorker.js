importScripts('/cache-polyfill.js')

const staticCache = 'static'
const dynamicCache = 'dynamic'
const appShell = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
]

self.addEventListener('install', e => {
  console.log('[Service Worker] Installing Service Worker ...', e)

  e.waitUntil(
    caches.open(staticCache).then(cache => {
      console.log('[Service Worker] Precaching App Shell')
      return cache.addAll(appShell)
    })
  )
})

self.addEventListener('activate', e => {
  console.log('[Service Worker] Activating Service Worker ....', e)
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.forEach(key => {
          if (key !== staticCache && key !== dynamicCache) {
            console.log('[Service Worker] Removing old cache', key)
            return caches.delete(key)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

self.addEventListener('fetch', e =>
  e.respondWith(
    caches.match(e.request).then(
      cacheRes =>
        cacheRes ||
        fetch(e.request)
          .then(fetchRes => {
            return caches.open(dynamicCache).then(cache => {
              cache.put(e.request.url, fetchRes.clone())
              return fetchRes
            })
          })
          .catch(err => {})
    )
  )
)

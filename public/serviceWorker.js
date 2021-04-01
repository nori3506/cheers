importScripts('/cache-polyfill.js')

const staticCache = 'static'
const dynamicCache = 'dynamic'
const appShell = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/icons/favicon.ico',
  '/icons/app-icon-48x48.png',
  '/icons/app-icon-96x96.png',
  '/icons/app-icon-144x144.png',
  '/icons/app-icon-192x192.png',
  '/icons/app-icon-512x512.png',
  '../src/assets/images/cheers-bg-8.png',
  '../src/assets/icons/add-review.svg',
  '../src/assets/icons/back-arrow.svg',
  '../src/assets/icons/beer.svg',
  '../src/assets/icons/def-drink.svg',
  '../src/assets/icons/def-profile.svg',
  '../src/assets/icons/empty-star.svg',
  '../src/assets/icons/full-star.svg',
  '../src/assets/icons/home.svg',
  '../src/assets/icons/location.svg',
  '../src/assets/icons/logo.svg',
  '../src/assets/icons/logout.svg',
  '../src/assets/icons/pin.svg',
  '../src/assets/icons/profile.svg',
  '../src/assets/icons/rest-icon.svg',
  '../src/assets/icons/restaurant.svg',
  '../src/assets/icons/store.svg',
  '../src/assets/icons/thick-borders.svg',
  'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://maps.googleapis.com/maps/api/js?key=AIzaSyDD0yhWzFyyF-ipcWomUf39xmycbnf1zSw&libraries=places&language=en',
  'https://cdn.jsdelivr.net/npm/pwacompat@2.0.9/pwacompat.min.js',
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

self.addEventListener('fetch', e => {
  if (e.request.url.indexOf('firestore.googleapis.com') === -1) {
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
  }
})

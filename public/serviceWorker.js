importScripts('/cache-polyfill.js')

const staticCache = 'static-v5'
const dynamicCache = 'dynamic'
const appShell = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/static/media/add-review.78b7250b.svg',
  '/static/media/back-arrow.d69a5e18.svg',
  '/static/media/beer.43c22158.svg',
  '/static/media/cheers-bg-8.0357a917.png',
  '/static/media/def-profile.a9e8aa5d.svg',
  '/static/media/home.c9e48f85.svg',
  '/static/media/logout.977be19e.svg',
  '/static/media/pin.caa4ab85.svg',
  '/static/media/profile.5d5a5aaf.svg',
  '/static/media/restaurant.fab91764.svg',
  '/static/media/store.aded2d57.svg',
  '/static/media/thick-borders.5cafabd3.svg',
  '/favicon.ico',
  '/icons/app-icon-48x48.png',
  '/icons/app-icon-96x96.png',
  '/icons/app-icon-144x144.png',
  '/icons/app-icon-192x192.png',
  '/icons/app-icon-512x512.png',
  'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  // 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDD0yhWzFyyF-ipcWomUf39xmycbnf1zSw&libraries=places&language=en',
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

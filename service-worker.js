// Nome della cache statica (risorse dell'app)
const CACHE_NAME = 'burraco-points-pwa-v1';

// Risorse essenziali da mettere in cache, INCLUSA L'IMMAGINE ICONA
const urlsToCache = [
    'index.html',
    'manifest.json',
    'https://cdn.tailwindcss.com',
    '1763141985824.jpg' // L'immagine che hai caricato, usata come icona
];

// 1. Installazione del Service Worker
self.addEventListener('install', (event) => {
    // Forza l'attivazione immediata del service worker
    self.skipWaiting();
   
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                // Aggiungi tutte le risorse all'array di cache
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Cache addAll failed:', err);
            })
    );
});

// 2. Attivazione del Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Elimina le vecchie cache che non corrispondono al nome corrente
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. Intercettazione delle Richieste (Strategia Cache-First per le risorse base)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Se la risorsa è in cache, la serviamo immediatamente
                if (response) {
                    return response;
                }
               
                // Altrimenti, andiamo alla rete
                return fetch(event.request).then(
                    (response) => {
                        // Controlliamo se abbiamo ricevuto una risposta valida
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cloniamo la risposta. La risposta è uno stream e può essere consumata solo una volta.
                        const responseToCache = response.clone();

                        // Opzionale: mettiamo in cache dinamicamente nuove risorse (ad esempio immagini)
                        if (urlsToCache.includes(event.request.url) || event.request.url.includes('1763141985824.jpg')) {
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return response;
                    }
                );
            })
            .catch(() => {
                // In caso di fallimento della rete (utile per l'offline, ma la cache serve già la maggior parte)
            })
    );
});
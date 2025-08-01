// Define o nome do cache
const CACHE_NAME = 'financeiro-familia-v1';
// Lista de ficheiros a serem colocados em cache (com os caminhos corrigidos para o repositório)
const urlsToCache = [
  '/Controle-de-financas-JN/',
  '/Controle-de-financas-JN/index.html',
  '/Controle-de-financas-JN/manifest.json',
  '/Controle-de-financas-JN/icon-192x192.png',
  '/Controle-de-financas-JN/icon-512x512.png'
];

// Evento de instalação: abre o cache e adiciona os ficheiros da lista
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de fetch: interceta os pedidos
self.addEventListener('fetch', event => {
  // Ignora pedidos que não são GET (ex: POST para o Firebase)
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignora pedidos para o Firebase para não colocar em cache dados de API
  if (event.request.url.includes('firebase') || event.request.url.includes('googleapis')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrar na cache, retorna o ficheiro em cache
        if (response) {
          return response;
        }
        // Se não, busca na rede, clona e guarda na cache para a próxima vez
        return fetch(event.request).then(
          networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        );
      })
  );
});

// Evento de ativação: limpa caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

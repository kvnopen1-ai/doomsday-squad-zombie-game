// 屍蹤Q PWA Service Worker
// 快取版本號：更新遊戲檔案後，把 CACHE_NAME 後面的數字改一下，
// 讓已安裝的玩家下次開啟時能抓到新版本，不會卡在舊快取。
const CACHE_NAME = 'doomsday-squad-cache-v1';
const FILES_TO_CACHE = [
  './Doomsday-Squad-Game-release.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

// 安裝階段：把主要檔案都抓進快取
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 啟用階段：清掉舊版本快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 攔截請求：快取優先，快取沒有才連網抓，連網也失敗就算了（離線時遊戲本體仍可用）
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});

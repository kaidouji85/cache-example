/** キャッシュのバージョン */
const CACHE_NAME = 'cache-v1';

/** プリキャッシュするリソース */
const PRE_CACHE_URL = [
  './index.html',
  './main.js',
  './style.css'
];

/** インストールイベント */
self.addEventListener('install', event => {
  // Service Worker 更新時に waiting 状態をスキップしたい場合
  // event.waitUntil(self.skipWaiting());

  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRE_CACHE_URL);
  })());
});

/** アクティベート */
self.addEventListener('activate', event => {
  // すぐにControllerになって欲しい時は claim を呼ぶ
  // event.waitUntil(self.clients.claim());

  event.waitUntil((async () => {
    const allCache = await caches.keys();
    const deleteTarget = allCache.filter(cacheName => cacheName !== CACHE_NAME);
    await Promise.all(
      deleteTarget.map(cacheName => caches.delete(cacheName))
    );
  })());
});

/** ブラウザが通信する際のイベント */
self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    // リクエスト内容がキャッシュにあるかを調べる
    // キャッシュから見つかった場合、それをブラウザに返す
    const cacheResponse = await caches.match(event.request);
    if (cacheResponse) {
      return cacheResponse;
    }

    // キャッシュに見つからない場合は、サービスワーカー内で通信を行う
    const fetchRequest = event.request.clone();
    const fetchResponse = await fetch(fetchRequest);

    // 通信が正常に行われた場合、キャッシュにそれを保存する
    if (!!fetchResponse && fetchResponse.status === 200 && fetchResponse.type === 'basic') {
      const responseToCache = fetchResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, responseToCache);
    }

    // 通信結果をブラウザに返す
    return fetchResponse;
  })());
});

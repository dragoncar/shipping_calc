/* 离线缓存（PWA） */

const CACHE_NAME = "shipping-h5-v2.8";
// 首次打开就把全部资源存到本地（含 860KB 的 xlsx），之后断网也能完整使用。
// 清单里必须全是同源文件：一旦混入第三方 CDN 地址，它拉取失败会让 cache.addAll
// 整体 reject，Service Worker 直接装不上，离线功能全废。
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./vendor/xlsx.full.min.js",
  "./使用说明.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // 逐个添加并容忍失败：缺一个资源也不影响 SW 安装
      .then((cache) =>
        Promise.all(
          PRECACHE_URLS.map((u) => cache.add(u).catch(() => null))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 只处理同源请求
  if (url.origin !== self.location.origin) return;

  // 对导航请求优先返回 index（适配 iOS 主屏模式）
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((cached) => cached || fetch(req).catch(() => caches.match("./index.html")))
    );
    return;
  }

  // 静态资源：cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => cached);
    })
  );
});

/* 离线缓存（PWA） */

const CACHE_NAME = "shipping-h5-v3.0";
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

  if (req.mode === "navigate") {
    // 只有打开应用外壳（/ 或 /index.html）才回退到 index，这是为了适配 iOS 主屏模式。
    // 以前这里对所有导航都返回 index，把别的页面全吞了 —— 别改回去。
    if (/^\/(index\.html)?$/.test(url.pathname)) {
      event.respondWith(
        caches.match("./index.html").then((cached) => cached || fetch(req).catch(() => caches.match("./index.html")))
      );
      return;
    }
    // 其它页面正常走缓存优先，断网时用预缓存兜底
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).catch(() => caches.match(req)))
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

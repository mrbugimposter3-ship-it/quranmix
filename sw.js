// QuranMix service worker: offline app shell
const CACHE = "quranmix-v1";
const SHELL = ["index.html", "manifest.json", "icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // App shell: cache-first. Quran text API: network-first with cache fallback (offline reading).
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  } else if (url.hostname.includes("alquran.cloud")) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
  }
  // Audio streams pass straight through (browser HTTP cache handles repeats)
});

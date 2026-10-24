/* Cuffin's Word Quest: offline cache. Pages load fresh when online, so updates arrive automatically. */
const VER = 'cuffin-5523defc39';
const ASSETS = ["./", "index.html", "app.js?v=5523defc39", "manifest.webmanifest", "img/cuffin-front.webp", "img/cuffin-lie.webp", "img/cuffin-side.webp", "img/mirror-front.webp", "img/mirror-lie.webp", "img/mirror-side.webp", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "audio/c01.mp3?v=5523defc39", "audio/c02.mp3?v=5523defc39", "audio/c03.mp3?v=5523defc39", "audio/c04.mp3?v=5523defc39", "audio/c05.mp3?v=5523defc39", "audio/c06.mp3?v=5523defc39", "audio/c07.mp3?v=5523defc39", "audio/c08.mp3?v=5523defc39", "audio/c09.mp3?v=5523defc39", "audio/c10.mp3?v=5523defc39", "audio/c11.mp3?v=5523defc39", "audio/c12.mp3?v=5523defc39", "audio/c13.mp3?v=5523defc39", "audio/c14.mp3?v=5523defc39", "audio/c15.mp3?v=5523defc39", "audio/c16.mp3?v=5523defc39", "audio/c17.mp3?v=5523defc39", "audio/c18.mp3?v=5523defc39", "audio/c19.mp3?v=5523defc39", "audio/c20.mp3?v=5523defc39", "audio/c21.mp3?v=5523defc39", "audio/c22.mp3?v=5523defc39", "audio/c23.mp3?v=5523defc39", "audio/c24.mp3?v=5523defc39", "audio/c25.mp3?v=5523defc39", "audio/c26.mp3?v=5523defc39", "audio/c27.mp3?v=5523defc39", "audio/c28.mp3?v=5523defc39", "audio/c29.mp3?v=5523defc39", "audio/c30.mp3?v=5523defc39", "audio/c31.mp3?v=5523defc39", "audio/m01.mp3?v=5523defc39", "audio/m02.mp3?v=5523defc39", "audio/m03.mp3?v=5523defc39", "audio/m04.mp3?v=5523defc39", "audio/m05.mp3?v=5523defc39", "audio/m06.mp3?v=5523defc39", "audio/m07.mp3?v=5523defc39", "audio/m08.mp3?v=5523defc39", "audio/m09.mp3?v=5523defc39", "audio/m10.mp3?v=5523defc39", "audio/m11.mp3?v=5523defc39", "audio/m12.mp3?v=5523defc39", "audio/m13.mp3?v=5523defc39", "audio/m14.mp3?v=5523defc39", "audio/m15.mp3?v=5523defc39"];
self.addEventListener('install', e => { e.waitUntil(caches.open(VER).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('googleapis.com') && url.pathname.includes('/google.firestore')) return;   // live sync traffic
  if (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html')){
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VER).then(x => x.put('index.html', c)); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok && (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com|gstatic\.com\/firebasejs/.test(url.href))){ const c = r.clone(); caches.open(VER).then(x => x.put(req, c)); }
    return r; })));
});

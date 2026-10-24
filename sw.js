/* Cuffin's Word Quest: offline cache. Pages load fresh when online, so updates arrive automatically. */
const VER = 'cuffin-565b25c5d9';
const ASSETS = ["./", "index.html", "app.js?v=565b25c5d9", "manifest.webmanifest", "img/cuffin-front.webp", "img/cuffin-lie.webp", "img/cuffin-side.webp", "img/mirror-front.webp", "img/mirror-lie.webp", "img/mirror-side.webp", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "audio/c01.mp3?v=565b25c5d9", "audio/c02.mp3?v=565b25c5d9", "audio/c03.mp3?v=565b25c5d9", "audio/c04.mp3?v=565b25c5d9", "audio/c05.mp3?v=565b25c5d9", "audio/c06.mp3?v=565b25c5d9", "audio/c07.mp3?v=565b25c5d9", "audio/c08.mp3?v=565b25c5d9", "audio/c09.mp3?v=565b25c5d9", "audio/c10.mp3?v=565b25c5d9", "audio/c11.mp3?v=565b25c5d9", "audio/c12.mp3?v=565b25c5d9", "audio/c13.mp3?v=565b25c5d9", "audio/c14.mp3?v=565b25c5d9", "audio/c15.mp3?v=565b25c5d9", "audio/c16.mp3?v=565b25c5d9", "audio/c17.mp3?v=565b25c5d9", "audio/c18.mp3?v=565b25c5d9", "audio/c19.mp3?v=565b25c5d9", "audio/m01.mp3?v=565b25c5d9", "audio/m02.mp3?v=565b25c5d9", "audio/m03.mp3?v=565b25c5d9", "audio/m04.mp3?v=565b25c5d9", "audio/m05.mp3?v=565b25c5d9", "audio/m06.mp3?v=565b25c5d9", "audio/m07.mp3?v=565b25c5d9", "audio/m08.mp3?v=565b25c5d9", "audio/m09.mp3?v=565b25c5d9", "audio/m10.mp3?v=565b25c5d9"];
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

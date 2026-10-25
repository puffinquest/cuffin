/* Cuffin's Word Quest: offline cache. Pages load fresh when online, so updates arrive automatically. */
const VER = 'cuffin-c963a7fe36';
const ASSETS = ["./", "index.html", "app.js?v=c963a7fe36", "manifest.webmanifest", "img/cuffin-front.webp", "img/cuffin-lie.webp", "img/cuffin-side.webp", "img/mirror-front.webp", "img/mirror-lie.webp", "img/mirror-side.webp", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "audio/c01.mp3?v=c963a7fe36", "audio/c02.mp3?v=c963a7fe36", "audio/c03.mp3?v=c963a7fe36", "audio/c04.mp3?v=c963a7fe36", "audio/c05.mp3?v=c963a7fe36", "audio/c06.mp3?v=c963a7fe36", "audio/c07.mp3?v=c963a7fe36", "audio/c08.mp3?v=c963a7fe36", "audio/c09.mp3?v=c963a7fe36", "audio/c10.mp3?v=c963a7fe36", "audio/c11.mp3?v=c963a7fe36", "audio/c12.mp3?v=c963a7fe36", "audio/c13.mp3?v=c963a7fe36", "audio/c14.mp3?v=c963a7fe36", "audio/c15.mp3?v=c963a7fe36", "audio/c16.mp3?v=c963a7fe36", "audio/c17.mp3?v=c963a7fe36", "audio/c18.mp3?v=c963a7fe36", "audio/c19.mp3?v=c963a7fe36", "audio/c20.mp3?v=c963a7fe36", "audio/c21.mp3?v=c963a7fe36", "audio/c22.mp3?v=c963a7fe36", "audio/c23.mp3?v=c963a7fe36", "audio/c24.mp3?v=c963a7fe36", "audio/c25.mp3?v=c963a7fe36", "audio/c26.mp3?v=c963a7fe36", "audio/c27.mp3?v=c963a7fe36", "audio/c28.mp3?v=c963a7fe36", "audio/c29.mp3?v=c963a7fe36", "audio/c30.mp3?v=c963a7fe36", "audio/c31.mp3?v=c963a7fe36", "audio/m01.mp3?v=c963a7fe36", "audio/m02.mp3?v=c963a7fe36", "audio/m03.mp3?v=c963a7fe36", "audio/m04.mp3?v=c963a7fe36", "audio/m05.mp3?v=c963a7fe36", "audio/m06.mp3?v=c963a7fe36", "audio/m07.mp3?v=c963a7fe36", "audio/m08.mp3?v=c963a7fe36", "audio/m09.mp3?v=c963a7fe36", "audio/m10.mp3?v=c963a7fe36", "audio/m11.mp3?v=c963a7fe36", "audio/m12.mp3?v=c963a7fe36", "audio/m13.mp3?v=c963a7fe36", "audio/m14.mp3?v=c963a7fe36", "audio/m15.mp3?v=c963a7fe36"];
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

/* the 4pm nudge */
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { data:{ body:e.data && e.data.text() } }; }
  const m = Object.assign({}, d.notification || {}, d.data || {});
  e.waitUntil(self.registration.showNotification(m.title || 'Cuffin’s Word Quest', { body:m.body || 'Cuffin is waiting. The Mirror is not.', icon:'icons/icon-192.png', badge:'icons/icon-192.png', tag:m.tag || 'cuffin-daily', data:{ url:m.url || './' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(cs => { for (const c of cs){ if (url !== './'){ try { return c.navigate(url).then(w => w ? w.focus() : self.clients.openWindow(url)).catch(() => self.clients.openWindow(url)); } catch (x) { return self.clients.openWindow(url); } } if ('focus' in c) return c.focus(); } return self.clients.openWindow(url); }));
});

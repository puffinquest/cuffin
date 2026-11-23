/* ---------- family sync through Firebase (app version) ---------- */
const FIREBASE_CONFIG = {"apiKey": "AIzaSyDuMhwC18PE-xUUGg2wCl6nnQHh7aUNlF4", "authDomain": "cuffin-18ac1.firebaseapp.com", "projectId": "cuffin-18ac1", "storageBucket": "cuffin-18ac1.firebasestorage.app", "messagingSenderId": "774135872665", "appId": "1:774135872665:web:4332c6fa25e59813eecc08"};
const FB_VER = '10.12.2';
const FAMKEY = KEY + '-family';
const VAPID = 'BA0SEXTIs1175Cf8RHBq-G-8x61xoYcTiaxgvZtnhvby8Ef201mxs30VyJ83FDn6kuTAQN2etu688vhHJR67F74';
let FBAPP = null;
function familyCode(){ try { return localStorage.getItem(FAMKEY) || ''; } catch (e) { return ''; } }
const famId = c => String(c || '').toLowerCase().replace(/[^a-z0-9]/g, '');
function setFamily(c){ try { if (c) localStorage.setItem(FAMKEY, c); else localStorage.removeItem(FAMKEY); } catch (e) {} }
async function fbInit(){
  const base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
  const [appM, authM, fsM] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]);
  const app = appM.initializeApp(FIREBASE_CONFIG); FBAPP = app;
  await authM.signInAnonymously(authM.getAuth(app));
  const fs = fsM.getFirestore(app);
  const mapPath = p => p.replace(/^data\/users\/([^/]+)\/progress/, 'families/$1/state/progress');
  const docRef = p => { const path = mapPath(p); return {
    get: async () => { const s = await fsM.getDoc(fsM.doc(fs, path)); return { exists: s.exists(), data: () => s.data() }; },
    set: d => fsM.setDoc(fsM.doc(fs, path), d),
    /* save only if nobody else saved since we looked (all-or-nothing): otherwise report a clash so we can merge first */
    setIf: (expectUpd, d) => fsM.runTransaction(fs, async t => { const ref = fsM.doc(fs, path), cur = await t.get(ref); const u = cur.exists() ? (cur.data().upd || 0) : 0; if (u !== (expectUpd || 0)) throw { code:'clash' }; t.set(ref, d); }),
    delete: () => fsM.deleteDoc(fsM.doc(fs, path)),
    collection: c => colRef(p + '/' + c) }; };
  const colRef = p => { const path = mapPath(p);
    const run = (ob, lim) => async () => { const parts = []; if (ob) parts.push(fsM.orderBy(ob[0], ob[1])); if (lim) parts.push(fsM.limit(lim));
      const c = fsM.collection(fs, path); const snap = await fsM.getDocs(parts.length ? fsM.query(c, ...parts) : c);
      return { docs: snap.docs.map(d => ({ id:d.id, data:() => d.data() })) }; };
    return { add: d => fsM.addDoc(fsM.collection(fs, path), d), doc: id => docRef(p + '/' + id), get: run(),
      orderBy: (f, dir) => ({ get: run([f, dir || 'asc']), limit: n => ({ get: run([f, dir || 'asc'], n) }) }) }; };
  return { doc: docRef, collection: colRef };
}
async function syncStart(){
  setSync('check');
  const fam = famId(familyCode());
  if (!fam || !FIREBASE_CONFIG.apiKey){ setSync('local'); return; }
  /* connect; if there is no internet yet, keep trying in the background (Wi-Fi back, app reopened) */
  const connect = async () => {
    if (SYNC.db) return true;
    try { SYNC.db = await withTimeout(fbInit(), 15000); SYNC.uid = fam; return true; } catch (e) { SYNC.db = null; setSync('local'); return false; }
  };
  if (await connect()) await pull(true);
  const again = async () => { if (await connect()) pull(false); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') again(); else if (SYNC.db && S.upd > getBase()) pull(false); });   // also try to send on the way out
  window.addEventListener('online', again);
  window.addEventListener('pageshow', again);
  setInterval(() => { if (document.visibilityState === 'visible' && (!SYNC.db || !(R && R.queue && R.queue.length) || S.upd > getBase())) again(); }, 45000);
}
/* first launch on a device: join the family */
function familyScreen(done){
  const inp = h('input', { class:'fld', id:'famin', type:'text', autocomplete:'off', autocapitalize:'characters', autocorrect:'off', spellcheck:'false', placeholder:'PUFFIN-XXXX-XXXX', 'aria-label':'Family code', style:'font:800 1.3rem var(--font-body);text-align:center;letter-spacing:.06em' });
  const msg = h('p', { class:'small', 'aria-live':'polite' });
  const go = h('button', { class:'btn kick', type:'submit' }, 'JOIN THE RACE');
  mount([h('div', { class:'boot' },
    cimg(IMG.hello, 'float', 130, 'Cuffin'),
    h('h2', { class:'center', text:'Welcome to Cuffin’s Word Quest' }),
    h('p', { class:'center muted', style:'max-width:30ch', text:'Ask a grown-up to type the family code. Then everyone’s progress stays in sync on every phone and iPad.' }),
    h('form', { style:'display:flex;flex-direction:column;gap:12px;width:100%;max-width:340px', onsubmit:ev => {
      ev.preventDefault(); const c = inp.value.trim().toUpperCase();
      if (famId(c).length < 12){ msg.style.color = 'var(--miss)'; msg.textContent = 'That doesn’t look like a family code. It looks like PUFFIN-XXXX-XXXX.'; return; }
      setFamily(c); SND.prime(); done(); } }, inp, go, msg))], null);
  setTimeout(() => inp.focus(), 60);
}

/* ---------- 4pm reminders (push notifications) ---------- */
const REMKEY = KEY + '-remind';
const GROWNKEY = KEY + '-grownup';
const isGrownupDev = () => { try { return localStorage.getItem(GROWNKEY) === '1'; } catch (e) { return false; } };
async function setGrownupDev(v){
  try { localStorage.setItem(GROWNKEY, v ? '1' : '0'); } catch (e) {}
  const id = remindState(), fam = famId(familyCode()); if (!id || !fam || !FBAPP) return;
  try { const fsM = await import('https://www.gstatic.com/firebasejs/' + FB_VER + '/firebase-firestore.js'); await fsM.setDoc(fsM.doc(fsM.getFirestore(FBAPP), 'families/' + fam + '/tokens/' + id), { grownup:!!v }, { merge:true }); } catch (e) {}
}
const remindState = () => { try { return localStorage.getItem(REMKEY) || ''; } catch (e) { return ''; } };
const pushCapable = () => 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
async function sha(t){ const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].slice(0, 12).map(x => x.toString(16).padStart(2, '0')).join(''); }
async function turnOnReminders(){
  if (!pushCapable()) throw new Error('unsupported');
  const perm = await Notification.requestPermission();   // must be the first thing after the tap (iPhone rule)
  if (perm !== 'granted') throw new Error('denied');
  const fam = famId(familyCode()); if (!fam || !FBAPP) throw new Error('nosync');
  const base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
  const [mM, fsM] = await Promise.all([import(base + 'firebase-messaging.js'), import(base + 'firebase-firestore.js')]);
  if (mM.isSupported && !(await mM.isSupported())) throw new Error('unsupported');
  const reg = await navigator.serviceWorker.ready;
  const token = await mM.getToken(mM.getMessaging(FBAPP), { vapidKey:VAPID, serviceWorkerRegistration:reg });
  if (!token) throw new Error('notoken');
  const id = await sha(token);
  await fsM.setDoc(fsM.doc(fsM.getFirestore(FBAPP), 'families/' + fam + '/tokens/' + id), { t:token, at:Date.now(), dev:(isIOS() ? 'iPhone/iPad' : navigator.platform || 'device'), grownup:isGrownupDev() });
  try { localStorage.setItem(REMKEY, id); } catch (e) {}
  return true;
}
async function testNotice(){
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification('Cuffin’s Word Quest', { body:'Test from Cuffin. If you can read this, reminders work. I would like that noted.', icon:'icons/icon-192.png', badge:'icons/icon-192.png', tag:'cuffin-test' });
}
function remindBlock(){
  const box = h('div', { class:'set', style:'flex-wrap:wrap' });
  const draw = (msg, warn) => {
    const on = remindState() && pushCapable() && Notification.permission === 'granted';
    const lbl = h('div', { class:'lbl' }, h('b', { text:'4pm reminder' + (on ? ': on ✓' : '') }),
      h('span', { class:'small muted', text: on ? 'This device gets one nudge at 4pm on days ' + S.name + ' hasn’t played yet.' : 'One nudge at 4pm, only on days ' + S.name + ' hasn’t played. Turn it on on each device that should get it.' }),
      msg ? h('span', { class:'small', style:'color:' + (warn ? 'var(--miss)' : 'var(--win)'), text:msg }) : null);
    let btn;
    if (!pushCapable() || (isIOS() && !standalone())) btn = null;
    else if (on) btn = h('button', { class:'btn alt small', type:'button', onclick:async () => { try { await testNotice(); draw('Test sent.'); } catch (e) { draw('Could not show a test.', true); } } }, 'Send a test');
    else btn = h('button', { class:'btn small', type:'button', onclick:async () => {
      btn.disabled = true; put(btn, 'Turning on…');
      try { await turnOnReminders(); SND.fx('fish'); draw('Reminders on.'); }
      catch (e){ const m = String(e && e.message || e); draw(m === 'denied' ? 'Notifications are blocked. Settings → Notifications → Cuffin → Allow, then try again.' : m === 'nosync' ? 'Needs the family code and a connection. Try again in a moment.' : 'Couldn’t turn on: ' + m, true); }
    } }, '🔔 Turn on');
    const extra = !pushCapable() || (isIOS() && !standalone()) ? h('span', { class:'small', style:'color:var(--miss);flex-basis:100%', text: isIOS() ? 'On iPhone/iPad: open the game from its home-screen icon (needs iOS 16.4 or newer) to turn this on.' : 'This browser can’t do reminders.' }) : null;
    const gsw = h('button', { class:'switch', type:'button', role:'switch', 'aria-checked':String(isGrownupDev()), 'aria-label':'Grown-up’s device', onclick:() => { const v = gsw.getAttribute('aria-checked') !== 'true'; gsw.setAttribute('aria-checked', String(v)); setGrownupDev(v); toast(v ? 'This device gets the Sunday report' : 'No Sunday report on this device'); } });
    const grow = h('div', { class:'set', style:'flex-basis:100%;border:0;padding:6px 0 0' }, h('div', { class:'lbl' }, h('b', { text:'This is a grown-up’s phone or iPad' }), h('span', { class:'small muted', text:'Gets the Sunday 6pm weekly report' + (on ? '' : ' (turn on reminders first)') + '.' })), gsw);
    put(box, lbl, btn, extra, grow);
  };
  draw();
  return box;
}


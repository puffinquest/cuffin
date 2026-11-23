/* the Rabbit's words: every word from the school lists. They are their own challenge (Stop the Rabbit), separate from the words for Leader */
const RABBIT_KEYS = new Set(SCHOOL_PACKS.flatMap(pk => pk.rows.map(r => norm(r[0]))));
const isRabbitItem = x => !!(x && !x.card && RABBIT_KEYS.has(norm(x.w)));
const isRabbitWord = x => isRabbitItem(x);   // any word the Rabbit sneaked in
function applySchoolPacks(o){
  o.packs = Array.isArray(o.packs) ? o.packs : [];
  for (const pk of SCHOOL_PACKS){
    if (o.packs.includes(pk.d)) continue;
    const keys = [];
    for (const [w, m, s] of pk.rows){
      const k = norm(w), ex = o.words.find(x => norm(x.w) === k);
      if (ex){ if (!ex.m) ex.m = m; if (!ex.s) ex.s = s; } else o.words.push({ w, m, s });   // (none of these are similar-and-opposite cards)
      keys.push(k);
    }
    if (!o.school || !o.school.d || o.school.d < pk.d) o.school = { d:pk.d, list:keys };
    o.packs.push(pk.d);
  }
}
function migrate(o, restoring){
  const f = fresh();
  if (!o.fishV){ o.points = Math.round((o.points || 0) / 10); (o.history || []).forEach(x => { x.p = Math.round((x.p || 0) / 10); }); o.fishV = 1; }
  if (!o.race && o.mv === 2) o.race = { mf:0, mm:0, ms:0 };   // a current save with a damaged race: don't treat it as a pre-race save
  if (!o.race){
    if (restoring){
      const m = Object.values(o.prog || {}).filter(r => r && r.streak >= 3).length;
      o.race = { mf:Math.max(0, (o.points || 0) - 3), mm:Math.max(0, m - 2), ms:0 };
      if (o.intro === undefined) o.intro = true;
    } else {
      try { if (!localStorage.getItem(ARCH)) localStorage.setItem(ARCH, JSON.stringify(o)); } catch (e) {}
      const keep = { words:Array.isArray(o.words) && o.words.length ? o.words : f.words, bank:o.bank || f.bank,
        prizes:(o.prizes || []).map(p => Object.assign({}, p, { announced:false, given:false })), name:o.name || 'Aaron', pin:o.pin || '' };
      o = Object.assign(fresh(), keep);
    }
  }
  if (o.mv !== 2){ for (const k in (o.prog || {})){ const r = (o.prog || {})[k]; if (r){ r.ty = r.ty || []; r.dy = r.dy || []; r.m = r.streak >= 3 && r.ty.length >= 2 && r.dy.length >= 2 && (!k.startsWith('card:') || r.ty.includes('sim')); } } o.mv = 2; }
  for (const k in f) if (o[k] === undefined || o[k] === null) o[k] = f[k];
  for (const k of ['stats', 'race', 'settings', 'book', 'badges', 'prog']) if (typeof o[k] !== 'object' || Array.isArray(o[k])) o[k] = f[k];
  if (!Array.isArray(o.history)) o.history = []; o.history = o.history.filter(x => x && typeof x === 'object' && x.d);
  if (Array.isArray(o.rounds)) o.rounds = o.rounds.filter(x => x && typeof x === 'object');
  if (o.settings && !o.settings.sound) o.settings.music = false; if (!Array.isArray(o.rounds)) o.rounds = []; if (!Array.isArray(o.words) || !o.words.length) o.words = f.words; if (!Array.isArray(o.prizes)) o.prizes = []; if (!Array.isArray(o.book.list)) o.book.list = []; if (!Array.isArray(o.book.next)) o.book.next = [];
  for (const k in f.stats) if (o.stats[k] === undefined) o.stats[k] = 0;
  for (const k in f.race) if (o.race[k] === undefined) o.race[k] = 0;
  for (const k in f.settings) if (o.settings[k] === undefined) o.settings[k] = f.settings[k];
  const sent = {}; SAMPLE.forEach(([w, m, s]) => { sent[norm(w)] = s; });
  o.words.forEach(x => { if (!x.s && sent[norm(x.w)]) x.s = sent[norm(x.w)]; });
  delete o.tomatoes;
  applySchoolPacks(o);
  return o;
}
function load(){
  try {
    localStorage.setItem(KEY + '-test', '1'); localStorage.removeItem(KEY + '-test');
    const raw = localStorage.getItem(KEY);
    if (raw){
      try { const o = migrate(JSON.parse(raw), false); localStorage.setItem(KEY, JSON.stringify(o)); return o; }
      catch (e) { try { localStorage.setItem(KEY + '-unreadable-' + Date.now(), raw); } catch (e2) {} }
    }
  } catch (e) { storageOK = false; }
  return fresh();
}
function saveLocal(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { storageOK = false; } }
function save(){ S.upd = Date.now(); saveLocal(); pushSoon(); }
function archived(){ try { return localStorage.getItem(ARCH); } catch (e) { return null; } }
let S = load();

/* ---------- family sync + save points ---------- */
/* the last version both this device and the family copy agreed on, so we can tell when BOTH have changed */
const BASEKEY = KEY + '-base';
const getBase = () => { try { return +localStorage.getItem(BASEKEY) || 0; } catch (e) { return 0; } };
const setBase = v => { try { localStorage.setItem(BASEKEY, String(v || 0)); } catch (e) {} };
/* what the family copy looked like when this device last agreed with it: lets a merge add up both devices' gains */
const BASESKEY = KEY + '-basestate';
const getBaseState = () => { try { return JSON.parse(localStorage.getItem(BASESKEY) || 'null'); } catch (e) { return null; } };
function setBaseAll(o){ setBase(o.upd || 0); try { localStorage.setItem(BASESKEY, JSON.stringify({ points:o.points || 0, custard:o.custard || 0, stats:o.stats || {}, race:{ mf:(o.race || {}).mf || 0, mm:(o.race || {}).mm || 0 }, tstat:o.tstat || {}, carrots:o.carrots || 0, prizes:(o.prizes || []).map(p => ({ at:p.at, text:p.text || '' })) })); } catch (e) {} }
const roundKey = x => x.id || (x.d + '|' + x.a + '|' + x.r + '|' + x.n);
/* two devices played while apart: add up what each one gained since they last agreed, so no answers are lost */
function mergeStates(a, b, base){
  if (a.demo !== b.demo) return JSON.parse(JSON.stringify(a.demo ? b : a));
  const o = JSON.parse(JSON.stringify(a)), r = b;
  const add = (av, bv, bs) => Math.max(0, base ? (bv || 0) + (av || 0) - (bs || 0) : Math.max(av || 0, bv || 0));
  for (const k in (r.prog || {})){ const x = r.prog[k], y = o.prog[k]; if (!y || (x.seen || 0) > (y.seen || 0)) o.prog[k] = x; }
  o.points = add(a.points, r.points, base && base.points); o.custard = add(a.custard, r.custard, base && base.custard); { const P = Object.assign({}, r.practice || {}); for (const [k, v] of Object.entries(a.practice || {})) if (!P[k] || (v.u || 0) >= (P[k].u || 0)) P[k] = v; o.practice = P; }   // newest change to each marked word wins
  o.rabbitLocks = Math.max(a.rabbitLocks || 0, r.rabbitLocks || 0); if (r.rabbitLock && (!a.rabbitLock || r.rabbitLock.d > a.rabbitLock.d)) o.rabbitLock = r.rabbitLock; o.rtrophy = Object.assign({}, r.rtrophy || {}, a.rtrophy || {});
    o.carrots = base && base.carrots != null ? add(a.carrots, r.carrots, base.carrots) : Math.max(a.carrots || 0, r.carrots || 0);
  o.stats = o.stats || {};
  for (const k of new Set(Object.keys(r.stats || {}).concat(Object.keys(a.stats || {})))){
    o.stats[k] = k === 'best' ? Math.max((a.stats || {})[k] || 0, (r.stats || {})[k] || 0) : add((a.stats || {})[k], (r.stats || {})[k], base && (base.stats || {})[k]);
  }
  o.race = o.race || {};
  for (const k of ['mf', 'mm']) o.race[k] = add((a.race || {})[k], (r.race || {})[k], base && (base.race || {})[k]);
  o.badges = Object.assign({}, r.badges || {}, o.badges || {});
  const hist = {}; (r.history || []).concat(o.history || []).forEach(x => { const c = hist[x.d]; if (!c || (x.p || 0) >= (c.p || 0)) hist[x.d] = x; });
  o.history = Object.values(hist).sort((x, y) => x.d < y.d ? -1 : 1).slice(-400);
  const seenR = new Set((o.rounds || []).map(roundKey)); o.rounds = (o.rounds || []).concat((r.rounds || []).filter(x => !seenR.has(roundKey(x)))).sort((x, y) => x.d < y.d ? -1 : x.d > y.d ? 1 : 0).slice(-200);
  const bl = {}; ((r.book || {}).list || []).concat((o.book || {}).list || []).forEach(e => { const c = bl[e.k]; bl[e.k] = c ? Object.assign({}, c, e, { ok:c.ok || e.ok, pinky:c.pinky || e.pinky, chk:c.chk || e.chk, s:e.s || c.s, o:e.o || c.o }) : e; });
  o.book = { list:Object.values(bl).sort((x, y) => x.d < y.d ? 1 : -1).slice(0, 200), next:[...new Set(((o.book || {}).next || []).concat((r.book || {}).next || []))].slice(-20) };
  o.freeze = [...new Set((o.freeze || []).concat(r.freeze || []))];
  o.pieDay = [a.pieDay || '', r.pieDay || ''].sort().pop();
  if (base && Array.isArray(base.prizes)){   // three-way: keep prizes on both sides, plus ones newly added on either side (a prize edited or deleted on one side stays that way)
    const pk = p => p.at + '|' + (p.text || ''), inB = new Set((base.prizes || []).map(pk)), inA = new Set((a.prizes || []).map(pk)), inR = new Set((r.prizes || []).map(pk));
    o.prizes = (o.prizes || []).filter(p => inR.has(pk(p)) || !inB.has(pk(p))).concat(JSON.parse(JSON.stringify((r.prizes || []).filter(p => !inA.has(pk(p)) && !inB.has(pk(p)))))).sort((x, y) => x.at - y.at);
    const kept = new Set(o.prizes.map(pk));
    (a.prizes || []).concat(r.prizes || []).filter(d => !kept.has(pk(d))).forEach(d => o.prizes.filter(p => p.at === d.at).forEach(n => { n.announced = n.announced || d.announced; n.seen = n.seen || d.seen; n.kidSeen = n.kidSeen || d.kidSeen; }));   // text tidied on either device: already celebrated stays celebrated
  }
  (o.prizes || []).forEach(p => { const q = (r.prizes || []).find(x => x.at === p.at && (x.text || '') === (p.text || '')); if (q){ p.announced = p.announced || q.announced; p.seen = p.seen || q.seen; p.kidSeen = p.kidSeen || q.kidSeen; p.given = p.given || q.given; } });
  for (const k of ['pieN', 'pieBonus']){ const x = a[k], y = r[k]; o[k] = !x ? y : !y ? x : x.d !== y.d ? (x.d > y.d ? x : y) : { d:x.d, n:Math.max(x.n || 0, y.n || 0) }; }
  if ((a.bank || '') === (r.bank || '')){ const wm = {}; (r.words || []).concat(o.words || []).forEach(w => { const k = norm(w.w), c = wm[k]; wm[k] = !c || (!c.m && w.m) ? w : c; }); o.words = Object.values(wm); }
  if (r.school && (!o.school || (r.school.d || '') > (o.school.d || ''))) o.school = r.school;
  else if (r.school && o.school && r.school.d === o.school.d) o.school = { d:o.school.d, list:[...new Set((o.school.list || []).concat(r.school.list || []))] };
  o.tstat = {}; for (const k of new Set(Object.keys(a.tstat || {}).concat(Object.keys(r.tstat || {})))){ const x = (a.tstat || {})[k] || [0, 0], y = (r.tstat || {})[k] || [0, 0], z = base && base.tstat && base.tstat[k]; o.tstat[k] = [0, 1].map(i => add(x[i], y[i], z ? z[i] : 0)); }
  o.tstatFrom = [a.tstatFrom, r.tstatFrom].filter(Boolean).sort()[0] || '';
  if (!o.leader && r.leader) o.leader = r.leader;
  o.intro = o.intro || r.intro;
  o.upd = Math.max(o.upd || 0, r.upd || 0) + 1;
  return o;
}
const SYNC = { mode:'local', ready:false, db:null, uid:null, busy:false, again:false, timer:null, pending:null, tries:0 };
function setSync(m){ SYNC.mode = m; const el = $('#syncchip'); if (el) drawSync(el); }
function drawSync(el){
  const map = { local:['This device', ''], cloud:['Family synced', 'ok'], saving:['Saving…', ''], error:['Not synced', ''], check:['Connecting…', ''] };
  const [t, c] = map[SYNC.mode] || map.local;
  el.className = 'sync ' + c; put(el, icon(SYNC.mode === 'cloud' ? 'cloud' : SYNC.mode === 'local' ? 'phone' : 'cloud'), t);
  el.title = SYNC.mode === 'cloud' ? 'Progress is synced with the family, so it is the same on every device.' : SYNC.mode === 'local' ? 'Progress is saved in this browser only.' : '';
}
const progRef = () => SYNC.db.doc('data/users/' + SYNC.uid + '/progress');
const savesCol = () => progRef().collection('saves');
/* every sync step runs one at a time: read the family copy, then decide */
const inRoundNow = () => !!(R && R.queue && R.queue.length);
const answered = o => ((o && o.stats) || {}).answered || 0;
/* a network step that takes too long (lost Wi-Fi, phone asleep) is abandoned so it can never block later saves */
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({ code:'timeout' }), ms))]);
function syncStep(first){ SYNC.chain = (SYNC.chain || Promise.resolve()).then(() => withTimeout(syncOnce(first), 30000)).catch(() => { setSync('error'); syncRetry(); }); return SYNC.chain; }
/* not saved to the family yet: keep trying quietly until it works */
function syncRetry(){ clearTimeout(SYNC.retryT); SYNC.retryT = setTimeout(() => { if (SYNC.db) syncStep(false); }, 20000); }
function syncNote(ok){ try { localStorage.setItem(KEY + '-synclog', JSON.stringify({ at:Date.now(), ok })); } catch (e) {} }
async function fetchRemote(){ const snap = await withTimeout(progRef().get(), 12000); let remote = null; if (snap.exists){ try { remote = JSON.parse(snap.data().s); } catch (e) {} } return remote; }
async function syncOnce(first){
  let remote;
  try { remote = await fetchRemote(); } catch (e) { setSync(first && !SYNC.ready ? 'local' : 'error'); syncNote(false); syncRetry(); return; }
  SYNC.ready = true; SYNC.remoteReal = !!remote && !isBlank(remote);
  await decide(remote, first);
}
async function decide(remote, first){
  if (!remote) return isBlank(S) ? setSync('cloud') : write(remote);
  /* demo progress never beats real progress */
  if (remote.demo && !S.demo && !isBlank(S)){ keepCopy(S, 'Real progress (rescued)'); S.upd = Date.now(); saveLocal(); return write(remote); }
  const ru = remote.upd || 0, lu = S.upd || 0, base = getBase();
  if (ru === lu){ setBaseAll(S); syncNote(true); return setSync('cloud'); }
  /* a Restart, Restore or Go back is deliberate: the newest one wins outright */
  const re = remote.epoch || 0, le = S.epoch || 0;
  if (re !== le){
    if (le > re){ if (answered(remote) > answered(S)) keepCopy(remote, 'Before the restart reached the family'); return write(remote); }
    if (inRoundNow()){ SYNC.pending = true; return setSync('cloud'); }
    return adopt(remote, first, null, 'Before a restart on another device');
  }
  if (isBlank(S)) return SYNC.remoteReal ? adopt(remote, first) : write(remote);
  if (!base){   // this device has never agreed with the family copy: the one with more answers wins, the other is kept as a save point
    if (answered(remote) >= answered(S)){ if (inRoundNow()){ SYNC.pending = true; return setSync('cloud'); } return adopt(remote, first, null, 'Before sync'); }
    keepCopy(remote, 'Before sync'); return write(remote);
  }
  const localChanged = lu > base, remoteChanged = ru > base;
  if (localChanged && remoteChanged){
    if (inRoundNow()){ SYNC.pending = true; return setSync('cloud'); }
    const merged = mergeStates(S, remote, getBaseState());
    adopt(remote, true, merged); return write(remote);
  }
  if (remoteChanged){ if (inRoundNow() && localChanged){ SYNC.pending = true; return setSync('cloud'); } return adopt(remote, first); }
  return write(remote);
}
async function write(remote, again){
  if (isBlank(S) && remote && !isBlank(remote) && !((S.epoch || 0) > (remote.epoch || 0))) return setSync('cloud');   // never let a fresh start overwrite real progress
  /* check nobody else saved since we looked; if they did, decide again rather than overwrite them */
  if (!again){ try { const now = await fetchRemote(); if ((now && now.upd || 0) !== (remote && remote.upd || 0)) return decide(now, false); } catch (e) {} }
  setSync('saving');
  const snap = JSON.parse(JSON.stringify(S));
  for (let t = 0; t < 3; t++){
    try { const ref = progRef(), data = { s:JSON.stringify(snap), upd:snap.upd || 0, fish:snap.points, words:masteredCount(), played:snap.last || '' };
      await withTimeout(ref.setIf ? ref.setIf(remote ? remote.upd || 0 : 0, data) : ref.set(data), 15000); setBaseAll(snap); setSync('cloud'); syncNote(true); clearTimeout(SYNC.retryT); return; }
    catch (e){ if (e && e.code === 'clash'){ const now = await fetchRemote().catch(() => null); if (now) return decide(now, false); }
      if (!(e && (e.code === 'unavailable' || e.code === 'timeout')) || t === 2){ setSync('error'); syncNote(false); syncRetry(); return; } await new Promise(r => setTimeout(r, 1500 + Math.random() * 1500)); }
  }
}
const pull = first => syncStep(first);
function pushSoon(){ if (!SYNC.db) return; clearTimeout(SYNC.timer); SYNC.timer = setTimeout(() => syncStep(false), 1500); }
const push = () => syncStep(false);
/* a cloud save point of a state, so nothing replaced by sync is ever lost */
function keepCopy(o, why){
  if (!SYNC.ready || isBlank(o)) return;
  try { savesCol().add({ name:why + ' · ' + stamp(), at:Date.now(), a:o.points, m:(o.race || {}).mf || 0, w:Object.values(o.prog || {}).filter(r => r && r.m).length, mw:(o.race || {}).mm || 0, s:JSON.stringify(o) }); } catch (e) {}
}
/* take the family copy (or a merge of it with this device), keeping a save point if this device had more */
function adopt(remote, quiet, merged, why){
  const next = merged || remote;
  if (!merged && !S.demo && !isBlank(S) && (why || answered(remote) < answered(S))) keepCopy(S, why || 'Before sync');
  try { S = migrate(JSON.parse(JSON.stringify(next)), true); raceFix(); saveLocal(); setBaseAll(remote); } catch (e) { return; }
  SYNC.pending = null;
  setSync('cloud');
  if (!quiet && !merged) toast('Progress synced from the family');
  if (['home','progress','trophies','grownups'].includes(screen)) SCREENS[screen]();
  else if (screen === 'intro' && S.intro){ R = null; SND.stop(); home.recapDone = true; home(); }
}
const stamp = () => { const d = new Date(); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
function localSaves(){ try { return JSON.parse(localStorage.getItem(LSAVES) || '[]'); } catch (e) { return []; } }
async function listSaves(){
  if (SYNC.ready){ try { const q = await savesCol().orderBy('at', 'desc').limit(60).get(); return q.docs.map(d => Object.assign({ id:d.id, cloud:true }, d.data())); } catch (e) {} }
  return localSaves();
}
async function addSave(name){
  const row = { name, at:Date.now(), a:S.points, m:S.race.mf, w:masteredCount(), mw:S.race.mm, s:JSON.stringify(S) };
  if (SYNC.ready){
    try { await savesCol().add(row); pruneSaves(); return true; }
    catch (e){ if (e && e.code === 'quota_exceeded'){ toast('No room for more save points. Delete an old one first.'); return false; } }
  }
  try { const arr = localSaves(); arr.unshift(Object.assign({ id:'l' + row.at }, row)); localStorage.setItem(LSAVES, JSON.stringify(arr.slice(0, 12))); return true; }
  catch (e){ toast('Could not make a save point here.'); return false; }
}
/* keep the last 14 daily save points and the last 12 others */
async function pruneSaves(){
  try { const rows = await listSaves(), daily = rows.filter(r => /^Daily/.test(r.name || '')), other = rows.filter(r => !/^Daily/.test(r.name || ''));
    for (const r of daily.slice(14).concat(other.slice(12))) if (r.cloud) await savesCol().doc(r.id).delete(); } catch (e) {}
}
/* one automatic save point a day, the first time the game opens */
async function autoDaily(){
  if (!SYNC.ready || isBlank(S) || S.demo || S.autoSave === today()) return;
  S.autoSave = today(); save();
  await addSave('Daily · ' + longDate(today()));
}
async function deleteSave(row){
  if (row.cloud){ try { await savesCol().doc(row.id).delete(); } catch (e) { toast('Could not delete that save point.'); } }
  else { try { localStorage.setItem(LSAVES, JSON.stringify(localSaves().filter(x => x.id !== row.id))); } catch (e) {} }
}
async function restoreSave(row){
  await addSave('Before going back · ' + stamp());
  S = migrate(JSON.parse(row.s), true); S.epoch = Date.now(); raceFix(); save();
}

/* ---------- dates ---------- */
const pad = n => String(n).padStart(2,'0');
const dstr = d => d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
let SIMDAY = null;
const today = () => SIMDAY || dstr(new Date());
function parseD(s){ const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d, 12); }
function addDays(s, n){ const d = parseD(s); d.setDate(d.getDate()+n); return dstr(d); }
function daysSince(s){ if (!s) return 999; return Math.round((parseD(today()) - parseD(s)) / 864e5); }
function dayStreak(){
  const days = new Set(S.history.map(x => x.d).concat(S.freeze || []));
  let d = today(); if (!days.has(d)) d = addDays(d, -1);
  let n = 0; while (days.has(d)){ n++; d = addDays(d, -1); }
  return n;
}
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const longDate = s => { const d = parseD(s); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); };
const shortDate = s => { const d = parseD(s); return d.getDate() + ' ' + MONTHS[d.getMonth()]; };
const matchDay = () => { const days = new Set(S.history.map(x => x.d)); days.add(today()); return days.size; };

/* ---------- words, progress and mastery ----------
   A word becomes MASTERED when the current run of right answers is at least 3 long, came in at least
   2 different kinds of question, on at least 2 different days, with no hint used. A wrong answer knocks
   the run back by 2. If the word was mastered, one slip makes it 'wobbly' (one right answer re-secures it);
   a second slip un-masters it and clears the kinds and days, so it must be earned again. */
const CARD_ITEMS = CARDS.map(c => ({ w:c.w, m:(XW[c.w] || {}).m || 'Similar and opposite card', card:c }));
const allItems = () => S.words.concat(CARD_ITEMS);
const mainItems = () => allItems().filter(x => !isRabbitItem(x));   // the words that count for Leader, prizes and the race
const rabbitItems = () => S.words.filter(isRabbitItem);
const rabbitMastered = () => rabbitItems().filter(isMastered).length;
const rabbitAllDone = () => { const t = rabbitItems(); return t.length > 0 && t.every(isMastered); };
const pk = x => x.card ? 'card:' + (x.card.id || norm(x.w)) : norm(x.w);
/* ---------- words a grown-up marked for more practice: proven again in 3 steps, easy to hard, one step per day ---------- */
const PRAC_STEPS = 3;
const pracOn = x => { const p = (S.practice || {})[pk(x)]; return !!(p && p.on); };
function pracSteps(x){   // the question type for each step: meaning from 4, then word from meaning, then the hardest one it has
  const ts = typesFor(x), has = t => ts.includes(t);
  const a = has('w2m') ? 'w2m' : ts[0];
  const c = x.card && has('sim') ? 'sim' : has('gap') ? 'gap' : has('spell') ? 'spell' : a;
  const b = has('m2w') ? 'm2w' : has('gap') && c !== 'gap' ? 'gap' : has('scram') ? 'scram' : a;
  return [a, b, c];
}
function setPractice(x, on){
  S.practice = S.practice || {};
  const k = pk(x), p = S.practice[k];
  S.practice[k] = on ? { on:true, st:0, d:'', u:Date.now(), at:today() } : Object.assign({}, p || {}, { on:false, u:Date.now(), cleared:'grown-up' });
  save();
}
function pracDue(pool){ return pool.filter(x => { const p = (S.practice || {})[pk(x)]; return p && p.on && p.d !== today(); }); }
function pracResult(item, ok, hinted){   // called after each answer on a practice word
  const p = S.practice && S.practice[pk(item.w)];
  if (!p || !p.on || item.prac == null) return;
  if (ok && !hinted && !item.retry){ p.st = (p.st || 0) + 1; p.d = today(); if (p.st >= PRAC_STEPS){ p.on = false; p.done = today(); const r = rec(item.w); if (!r.m || r.wob){ r.m = true; r.wob = false; r.md = r.md || today(); } } }   // re-proven: definitely mastered
  else if (!ok && !item.retry){ p.st = Math.max(0, (p.st || 0) - 1); p.d = today(); }
  else if (!item.retry) p.d = today();   // right with a hint: same step, try again tomorrow
  p.u = Date.now();
}
function rec(x){ const k = pk(x); return S.prog[k] || (S.prog[k] = { streak:0, seen:0, right:0, miss:0, fixed:0, last:'', ty:[], dy:[] }); }
const peek = x => S.prog[pk(x)];
/* cards also need a hint-free, fully right similar & opposite answer in the current run */
const meetsMastery = (r, card, nTypes) => r.streak >= 3 && (r.ty || []).length >= Math.min(2, nTypes || 2) && (r.dy || []).length >= 2 && (!card || (r.ty || []).includes('sim'));
const isMasteredRec = r => !!r && !!r.m && !r.wob;
const isMastered = x => isMasteredRec(peek(x));
const masteredCount = () => mainItems().filter(isMastered).length;
/* almost mastered: on a run of 2+, or mastered-then-slipped once */
const isAlmost = r => !!r && r.seen > 0 && !isMasteredRec(r) && (r.wob || r.streak >= 2);
const almostCount = () => mainItems().filter(x => isAlmost(peek(x))).length;
function status(x){
  const r = peek(x);
  if (!r || !r.seen) return 'new';
  if (isMasteredRec(r)) return 'mastered';
  if (isAlmost(r)) return 'lock';
  return 'learning';
}
const trickyWords = () => mainItems().filter(x => { const r = peek(x); return r && r.miss > 0 && !isMasteredRec(r) && (r.wob || r.streak < 2); })
  .sort((a,b) => peek(b).miss - peek(a).miss);
function counts(){ const c = { mastered:0, lock:0, learning:0, new:0 }; for (const x of mainItems()) c[status(x)]++; return c; }
const lockReadyToday = () => mainItems().filter(x => { const r = peek(x); return r && !isMasteredRec(r) && (r.wob || (r.streak >= 3 && !(r.dy || []).includes(today()))); }).length;
function accuracy(){ return S.stats.answered ? Math.round(100 * S.stats.right / S.stats.answered) : 0; }
const info = w => XW[w] || XW[norm(w)] || { m:'', f:'' };
const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function gapFor(x){
  const s = x.card ? (info(x.w).f || '') : (x.s || '');
  if (!s) return null;
  const re = new RegExp('\\b' + esc(x.w) + '\\b', 'i'), m = re.exec(s);
  if (!m) return null;
  return { before:s.slice(0, m.index), word:m[0], after:s.slice(m.index + m[0].length) };
}

/* ranks scale with the size of the word bank; Leader needs everything mastered */
const RANK_NAMES = ['Egg','Hatchling','Fledgling','Beak Cadet','Fish Fetcher','Burrow Boss','Wave Rider','Atlantic Crosser','Puffin Elder','Puffin Legend','Honorary Member of the Puffin Community','Leader of the Puffin Community'];
const RANK_PCT = [0,.02,.05,.10,.18,.28,.40,.55,.72,.86,.95,1];
function ranks(){
  const n = Math.max(1, mainItems().length); let prev = -1;
  return RANK_NAMES.map((name, i) => {
    let at = i===0 ? 0 : Math.max(prev+1, Math.round(RANK_PCT[i]*n));
    if (i === RANK_NAMES.length - 1) at = n; else at = Math.min(at, n - (RANK_NAMES.length - 1 - i));
    prev = at; return {name, at};
  });
}
function rankInfo(m){ const t = ranks(); let i = 0; while (i+1 < t.length && t[i+1].at <= m) i++; return { cur:t[i], next:t[i+1] || null, i, table:t }; }

/* ---------- the race: the Mirror ----------
   His guesses look random but are steered: more likely right when he is behind, a big catch when he is well behind,
   never more than LEAD_CAP fish or MAST_CAP words ahead, never every word, and in the last END_ZONE words
   he must stay strictly behind. Aaron's own scoring is never touched. */
const LEAD_CAP = 3, MAST_CAP = 0, END_ZONE = 10;
const MC = { base:.6, slope:.08, catchStart:3, catchStep:3, catchMax:4 };
function raceCaps(){
  const T = mainItems().length, aM = masteredCount(), A = S.points, end = T - aM <= END_ZONE;
  return { T, aM, A, end, fishMax: end ? A - 1 : A + LEAD_CAP, mastMax: Math.max(0, Math.min(T - 1, end ? aM - 1 : aM + MAST_CAP)) };
}
/* how far ahead Aaron is allowed to pull: 3 fish normally, up to 20 when he is answering really well */
const leadTarget = () => { const ra = S.race.ta != null ? S.race.ta : S.race.ra == null ? .6 : S.race.ra; return Math.max(3, Math.min(20, 3 + (ra - .6) * 42.5)); };
const mirrorChance = () => { const base = Math.max(.3, Math.min(MC.base, (S.race.ra == null ? .6 : S.race.ra) - .05)); return Math.max(.15, Math.min(.9, base + MC.slope * (S.points - S.race.mf - (leadTarget() - 3)))); };
function mirrorTry(gain){
  const c = raceCaps(), r = S.race, d = c.A - r.mf;
  let ok = Math.random() < mirrorChance();
  const tgt = leadTarget(), start = MC.catchStart + (tgt - 3);
  if (d > tgt + 2){ ok = true; gain = Math.max(gain, Math.min(3, Math.round(d - tgt))); }   // past the lead he has earned: the Mirror closes in (never past him in a perfect round)
  if (ok && d >= start) gain += Math.min(MC.catchMax, 1 + Math.floor((d - start) / MC.catchStep));
  gain = Math.min(gain, c.fishMax - r.mf);
  /* a round Aaron is getting all right: the Mirror can't out-fish him in it */
  if (R && R.queue && R.firstTry === R.idx && !R.results.some(v => v === 'bad')) gain = Math.min(gain, Math.max(0, R.points - R.mfish));
  if (gain < 1) ok = false;
  if (ok){ r.mf += gain; r.ms++; } else r.ms = 0;
  return { ok, fish: ok ? gain : 0 };
}
const mirrorGain = type => 1 + (S.race.ms >= 2 ? 1 : 0) + (type === 'spell' || type === 'scram' || type === 'hear' ? 1 : 0);
function mirrorMastery(ok){
  const r = S.race, c = raceCaps();
  const day2 = (S.history || []).some(x => x.d < today());
  if (ok && day2 && r.mm < c.aM && Math.random() < Math.max(.05, Math.min(.6, .12 + .1 * (c.aM - r.mm - 1)))) r.mm++;   // the Mirror trails Aaron on words, and catches up slowly
  else if (!ok && r.mm > c.aM && Math.random() < .5) r.mm--;
  r.mm = Math.max(0, Math.min(r.mm, raceCaps().mastMax));
}
function raceFix(){ const c = raceCaps(); S.race.mf = Math.min(S.race.mf, c.A + LEAD_CAP); if (c.end) S.race.mf = Math.min(S.race.mf, Math.max(0, c.A - 1)); S.race.mm = Math.min(S.race.mm, c.mastMax); }
const allDone = () => { const T = mainItems().length; return T > 0 && masteredCount() >= T; };
function misspell(w){
  const s = [...w], V = 'aeiou', tries = [
    () => { const i = 1 + rnd(Math.max(1, s.length - 2)); if (s[i] === s[i+1] || !s[i+1]) return null; const t = s.slice(); [t[i], t[i+1]] = [t[i+1], t[i]]; return t; },
    () => { const i = 1 + rnd(Math.max(1, s.length - 1)); if (!/[a-z]/i.test(s[i] || '')) return null; const t = s.slice(); t.splice(i, 0, s[i]); return t; },
    () => { const i = s.findIndex((c, j) => j > 0 && V.includes(c)); if (i < 0) return null; const t = s.slice(); t[i] = V[(V.indexOf(t[i]) + 1 + rnd(4)) % 5]; return t; },
    () => { if (s.length < 4) return null; const i = 1 + rnd(s.length - 2); const t = s.slice(); t.splice(i, 1); return t; }
  ];
  for (let k = 0; k < 12; k++){ const t = tries[rnd(tries.length)](); if (t && norm(t.join('')) !== norm(w)) return t.join(''); }
  return w + 'e';
}
const raceLine = () => { const d = S.points - S.race.mf; return d > 0 ? 'behind' : d < 0 ? 'ahead' : 'level'; };

/* ---------- badges ---------- */
const BADGES = [
  { id:'first',  n:'First Catch',     d:'Get your first answer right.',               ic:'fish',   t:c => c.S.stats.right >= 1 },
  { id:'s5',     n:'Hot Streak',      d:'5 right in a row.',                          ic:'flame',  t:c => c.S.stats.best >= 5 },
  { id:'s10',    n:'Unstoppable',     d:'10 right in a row.',                         ic:'bolt',   t:c => c.S.stats.best >= 10 },
  { id:'perf',   n:'Perfect Match',   d:'A whole round right first time.',            ic:'star',   t:c => c.S.stats.perfect >= 1 },
  { id:'fix5',   n:'Comeback Kid',    d:'Fix 5 tricky words.',                        ic:'wave',   t:c => c.S.stats.fixed >= 5 },
  { id:'spell10',n:'Spelling Star',   d:'Spell or unscramble 10 words.',              ic:'pen',    t:c => c.S.stats.spell >= 10 },
  { id:'m10',    n:'Ten Locked In',   d:'Master 10 words.',                           ic:'book',   t:c => c.m >= 10 },
  { id:'clear',  n:'Clear Water',     d:'Get 10 fish ahead of the Mirror.',           ic:'fish',   t:c => c.S.points - c.S.race.mf >= 10 },
  { id:'half',   n:'Half-Way Hero',   d:'Master half of all the words.',              ic:'trophy', t:c => c.total >= 10 && c.m >= c.total/2 },
  { id:'d3',     n:'Three-Day Flyer', d:'Play 3 days in a row.',                      ic:'wave',   t:c => c.days >= 3 },
  { id:'d7',     n:'Perfect Week',    d:'Play 7 days in a row.',                      ic:'trophy', t:c => c.days >= 7 },
  { id:'r10',    n:'Regular',         d:'Finish 10 rounds.',                          ic:'flame',  t:c => c.S.stats.rounds >= 10 },
  { id:'rmatch1', n:'Rabbit Spotter', d:'Play your first Stop the Rabbit match.', em:'🐰', t:c => (c.S.stats.rmatch || 0) >= 1 },
  { id:'rab1', n:'Paw Print', d:'Master your first Rabbit word.', em:'🐾', t:c => c.rm >= 1 },
  { id:'rab5', n:'Carrot Guard', d:'Master 5 Rabbit words.', em:'🛡️', t:c => c.rm >= 5 },
  { id:'rperf', n:'Not Today, Rabbit', d:'Get every answer right first time in a Stop the Rabbit match.', em:'🙅', t:c => (c.S.stats.rperf || 0) >= 1 },
  { id:'lock1', n:'Gate Keeper', d:'Lock the Rabbit out: master every Rabbit word.', em:'🔒', t:c => (c.S.rabbitLocks || 0) >= 1 },
  { id:'rab15', n:'Rabbit Tamer', d:'Master 15 Rabbit words.', em:'🥇', t:c => c.rm >= 15 },
  { id:'rmatch10', n:'Rabbit Chaser', d:'Play 10 Stop the Rabbit matches.', em:'🏃', t:c => (c.S.stats.rmatch || 0) >= 10 },
  { id:'carrot150', n:'Carrot Mountain', d:'Win 150 carrots back from the Rabbit.', em:'⛰️', t:c => (c.S.carrots || 0) >= 150 },
  { id:'lock3', n:'Rabbit-Proof Fence', d:'Lock the Rabbit out 3 times.', em:'🚧', t:c => (c.S.rabbitLocks || 0) >= 3 },
  { id:'carrot1',  n:'Carrot Snatcher', d:'Win a carrot back from the Rabbit.', em:'🥕', t:c => (c.S.carrots || 0) >= 1 },
  { id:'carrot25', n:'Bunch of Carrots', d:'Win 25 carrots back from the Rabbit.', em:'🥕', t:c => (c.S.carrots || 0) >= 25 },
  { id:'carrot75', n:'Rabbit Foiled', d:'Win 75 carrots back from the Rabbit.', em:'🐰', t:c => (c.S.carrots || 0) >= 75 },
  { id:'cust5',  n:'Custard Collector', d:'Win 5 pots of custard.',             ic:'custard', t:c => Math.max(c.S.custard || 0, c.S.stats.cwon || 0) >= 5 },
  { id:'leader', n:'Crowned',         d:'Beat the Mirror and become Leader.',         ic:'crown',  t:c => !!c.S.leader },
  /* more to chase */
  { id:'m25',  n:'Quarter Century', d:'Master 25 words.', em:'🎯', t:c => c.m >= 25 },
  { id:'m50',  n:'Half a Hundred', d:'Master 50 words.', em:'🥈', t:c => c.m >= 50 },
  { id:'m75',  n:'Word Wizard', d:'Master 75 words.', em:'🧙', t:c => c.m >= 75 },
  { id:'m100', n:'The Ton', d:'Master 100 words.', em:'💯', t:c => c.m >= 100 },
  { id:'m150', n:'Word Hoarder', d:'Master 150 words.', em:'🐉', t:c => c.m >= 150 },
  { id:'m200', n:'Dictionary Puffin', d:'Master 200 words.', em:'📚', t:c => c.m >= 200 },
  { id:'mall', n:'Every Last Word', d:'Master every word in the bank.', em:'🌟', t:c => c.total > 0 && c.m >= c.total },
  { id:'d5',   n:'Five-Day Flap', d:'Play 5 days in a row.', em:'🗓️', t:c => c.days >= 5 },
  { id:'d14',  n:'Fortnight Flyer', d:'Play 14 days in a row.', em:'🛫', t:c => c.days >= 14 },
  { id:'d21',  n:'Three-Week Wonder', d:'Play 21 days in a row.', em:'🎆', t:c => c.days >= 21 },
  { id:'d30',  n:'Month of Mastery', d:'Play 30 days in a row.', em:'🏰', t:c => c.days >= 30 },
  { id:'f100', n:'Fish Supper', d:'Win 100 fresh fish.', em:'🍟', t:c => c.S.points >= 100 },
  { id:'f250', n:'Trawler', d:'Win 250 fresh fish.', em:'🚢', t:c => c.S.points >= 250 },
  { id:'f500', n:'Fish Mountain', d:'Win 500 fresh fish.', em:'⛰️', t:c => c.S.points >= 500 },
  { id:'f1000',n:'Ocean Emptier', d:'Win 1,000 fresh fish.', em:'🌊', t:c => c.S.points >= 1000 },
  { id:'clear20', n:'Over the Horizon', d:'Get 20 fish ahead of the Mirror.', em:'🔭', t:c => c.S.points - c.S.race.mf >= 20 },
  { id:'s15',  n:'On Fire', d:'15 right in a row.', em:'🔥', t:c => c.S.stats.best >= 15 },
  { id:'s20',  n:'Untouchable', d:'20 right in a row.', em:'⚡', t:c => c.S.stats.best >= 20 },
  { id:'r25',  n:'Season Ticket', d:'Finish 25 matches.', em:'🎟️', t:c => c.S.stats.rounds >= 25 },
  { id:'r50',  n:'Club Legend', d:'Finish 50 matches.', em:'🏟️', t:c => c.S.stats.rounds >= 50 },
  { id:'r100', n:'Centurion', d:'Finish 100 matches.', em:'🛡️', t:c => c.S.stats.rounds >= 100 },
  { id:'perf3',n:'Hat-trick', d:'3 perfect matches.', em:'🎩', t:c => c.S.stats.perfect >= 3 },
  { id:'perf10',n:'Flawless', d:'10 perfect matches.', em:'💎', t:c => c.S.stats.perfect >= 10 },
  { id:'fix20',n:'Never Give Up', d:'Fix 20 tricky words.', em:'🧗', t:c => c.S.stats.fixed >= 20 },
  { id:'spell25',n:'Spelling Bee', d:'Spell or unscramble 25 words.', em:'🐝', t:c => c.S.stats.spell >= 25 },
  { id:'spell50',n:'Spelling Champion', d:'Spell or unscramble 50 words.', em:'🏅', t:c => c.S.stats.spell >= 50 },
  { id:'cw10', n:'Custard Connoisseur', d:'Win 10 pots of custard (ever).', em:'🍮', t:c => (c.S.stats.cwon || 0) >= 10 },
  { id:'cw25', n:'Custard Factory', d:'Win 25 pots of custard (ever).', em:'🏭', t:c => (c.S.stats.cwon || 0) >= 25 },
  { id:'splat1', n:'First Splat', d:'Hit the Mirror with a custard pie.', em:'🥧', t:c => (c.S.stats.splats || 0) >= 1 },
  { id:'splat10', n:'Pie Sniper', d:'Hit the Mirror with 10 custard pies.', em:'🥇', t:c => (c.S.stats.splats || 0) >= 10 },
  { id:'splat50', n:'Custard Commander', d:'Hit the Mirror with 50 custard pies.', em:'🫡', t:c => (c.S.stats.splats || 0) >= 50 },
  { id:'story1', n:'Bookworm', d:'Read a Cuffin story.', em:'📖', t:c => (c.S.stats.stories || 0) >= 1 },
  { id:'story10', n:'Story Collector', d:'Read 10 Cuffin stories.', em:'🗃️', t:c => (c.S.stats.stories || 0) >= 10 },
  { id:'say10', n:'Smooth Talker', d:'Pick the right way to say 10 words.', em:'🗣️', t:c => ((c.S.tstat || {}).say || [0])[0] >= 10 },
  { id:'say40', n:'Golden Voice', d:'Pick the right way to say 40 words.', em:'🎤', t:c => ((c.S.tstat || {}).say || [0])[0] >= 40 },
  { id:'pre10', n:'Word Builder', d:'Pick the right start 10 times.', em:'🧱', t:c => ((c.S.tstat || {}).pre || [0])[0] >= 10 },
  { id:'hear10', n:'Sharp Ears', d:'Listen and spell 10 words.', em:'👂', t:c => ((c.S.tstat || {}).hear || [0])[0] >= 10 },
  { id:'pinky10', n:'Pinky Pro', d:'Make 10 pinky promises.', em:'🤙', t:c => ((c.S.book || {}).list || []).filter(e => e.pinky).length >= 10 },
  { id:'book10', n:'Book Keeper', d:'Get 10 words right at the book check.', em:'📓', t:c => ((c.S.book || {}).list || []).filter(e => e.ok).length >= 10 },
  { id:'cards10', n:'Card Shark', d:'Master 10 similar & opposite cards.', em:'🃏', t:c => CARD_ITEMS.filter(isMastered).length >= 10 },
  { id:'school1', n:'Top of the Class', d:'Master one of this week’s school words.', em:'🏫', t:c => ((c.S.school || {}).list || []).some(k => { const x = allItems().find(y => norm(y.w) === k); return x && isMastered(x); }) },
  { id:'early', n:'Early Bird', d:'Finish a match before 8am.', em:'🐦', t:c => (c.S.stats.early || 0) >= 1 },
  { id:'owl', n:'Night Owl', d:'Finish a match after 7pm.', em:'🦉', t:c => (c.S.stats.owl || 0) >= 1 }
];
/* show badges easiest first, hardest (every word, then the crown) last */
const BADGE_ORDER = ["first", "splat1", "story1", "d3", "s5", "m10", "fix5", "spell10", "cust5", "rmatch1", "carrot1", "rab1", "clear", "perf", "f100", "hear10", "pre10", "say10", "pinky10", "book10", "early", "owl", "school1", "d5", "r10", "s10", "m25", "carrot25", "rab5", "rperf", "spell25", "cw10", "d7", "splat10", "cards10", "f250", "s15", "perf3", "fix20", "m50", "story10", "clear20", "r25", "d14", "spell50", "s20", "say40", "m75", "f500", "cw25", "d21", "carrot75", "lock1", "rab15", "rmatch10", "splat50", "r50", "m100", "half", "perf10", "d30", "m150", "f1000", "r100", "m200", "carrot150", "lock3", "mall", "leader"];
BADGES.sort((x, y) => { const i = BADGE_ORDER.indexOf(x.id), j = BADGE_ORDER.indexOf(y.id); return (i < 0 ? 999 : i) - (j < 0 ? 999 : j); });
function checkBadges(){
  const ctx = { S, m:masteredCount(), rm:rabbitMastered(), days:dayStreak(), total:mainItems().length }, got = [];
  for (const b of BADGES) if (!S.badges[b.id] && b.t(ctx)){ S.badges[b.id] = today(); got.push(b); }
  return got;
}

/* ---------- round engine ---------- */
let R = null, FORCE = null;
/* spaced review: a word's gap grows each new day he gets it right (1, 2, 4, 8… days; faster once mastered), and resets to tomorrow after a miss */
function schedule(r, ok, hinted){
  const t = today();
  if (!ok){ r.iv = 1; r.due = addDays(t, 1); r.sd = t; return; }   // a miss: back tomorrow, even if the retry later today is right
  if (hinted){ if (!r.iv) r.iv = 1; r.due = addDays(t, 1); return; }
  if (r.sd === t) return;   // already stretched today
  r.sd = t;
  r.iv = !r.iv ? 1 : Math.min(60, Math.max(r.iv + 1, Math.round(r.iv * (isMasteredRec(r) ? 2.5 : 2))));
  r.due = addDays(t, r.iv);
}
const dueIn = r => r && r.due ? -daysSince(r.due) : null;   // 0 = due today, negative = overdue
function weight(x){
  const r = peek(x); let b; const dn = dueIn(r);
  if (!r || r.seen === 0) b = 3;
  else if (r.wob) b = 7;
  else if (isMasteredRec(r)) b = dn == null ? (daysSince(r.last) >= 7 ? 1.5 : 0.35) : dn <= 0 ? 3 + Math.min(4, -dn * .5) : 0.12;   // due mastered words come back; others rest
  else if (r.streak >= 3) b = (r.dy || []).includes(today()) && (r.ty || []).length >= 2 ? 0.3 : 6;   // waiting for another day / ready to lock in
  else if (r.miss > 0 && r.streak === 0) b = 7;
  else b = 4;
  if (r && r.last === today() && r.streak >= 1 && !r.wob && r.lm !== today()) b *= .35;   // got it right earlier today: give it a rest
  if (r && r.seen && !isMasteredRec(r) && !r.wob && dn != null){ if (dn <= 0) b *= 1.4; else if (b < 7) b *= .6; }   // learning words: due ones first
  return x.card ? b * 1.6 : b;
}
function pickWords(n, pool){
  const left = pool.slice(), out = [];
  while (out.length < n && left.length){
    const ws = left.map(weight); const tot = ws.reduce((a,b)=>a+b, 0);
    let r = Math.random() * tot, i = 0;
    while (i < left.length - 1 && r >= ws[i]){ r -= ws[i]; i++; }
    out.push(left.splice(i, 1)[0]);
  }
  return out;
}
function newRound(picks, kind){
  return { queue: picks.map(w => ({ w, retry:false, tries:0, lastType:'' })), idx:0, total:picks.length, kind:kind || 'mixed',
    firstTry:0, points:0, mfish:0, custard:0, book:[], streak:0, best:0, fixed:0, results:[], missed:[], mastered:[], hello:say('start') };
}
function startRound(kind){ streakRescue(() => startRound2(kind)); }
function startRound2(kind){
  let pool = mainItems();
  if (kind === 'cards') pool = CARD_ITEMS;
  else if (kind === 'rabbit'){ pool = rabbitItems(); if (!pool.length){ toast('No Rabbit words yet!'); return home(); } }
  else if (kind === 'tricky'){ pool = trickyWords().filter(x => !isRabbitItem(x)); if (!pool.length){ toast('Nothing tricky yet!'); return home(say('empty')); }
    if (pool.length < 5) pool = pool.concat(mainItems().filter(x => { const r = peek(x); return r && r.seen && !isMasteredRec(r) && !pool.includes(x); }).sort((a, b) => (peek(b).miss / peek(b).seen) - (peek(a).miss / peek(a).seen)).slice(0, 5 - pool.length));   // short of tricky words: top up with the next-shakiest
    if (pool.length < 8) pool = pool.concat(shuffle(mainItems().filter(x => { const r = peek(x); return !r || !r.seen; })).slice(0, Math.min(3, 8 - pool.length))); }   // and a few brand-new words, so Training isn't the same handful every time
  if (!pool.length){ toast('The word bank is empty. Add words in Grown-ups.'); return; }
  const B = S.book && S.book.next || [], n = Math.min(kind === 'rabbit' ? 8 : 10, pool.length);
  const prac = shuffle(pracDue(pool)).slice(0, 3);   // words a grown-up marked: up to 3 each match, picked first so they always get their practice step
  const first = kind === 'tricky' ? [] : pool.filter(x => B.includes(pk(x)) && !prac.includes(x)).slice(0, 4);
  if ((first.length || prac.length) && S.book) S.book.next = B.filter(k => !first.some(x => pk(x) === k) && !prac.some(x => pk(x) === k));
  first.push(...prac);
  const due0 = shuffle(pool.filter(x => !first.includes(x) && (() => { const r = peek(x), d = dueIn(r); return r && r.seen && d != null && d <= 0; })())).sort((a, b) => dueIn(peek(a)) - dueIn(peek(b))).slice(0, 3);   // up to 3 due reviews, most overdue first
  const due = due0;
  const school = (S.school && S.school.list || []).map(k => pool.find(x => norm(x.w) === k)).filter(x => x && !first.includes(x) && !isMastered(x)); first.push(...shuffle(school).slice(0, Math.max(0, Math.min(3, n - first.length))));   // this week's school words: up to 3 each match
  first.push(...due.filter(x => !first.includes(x)).slice(0, Math.max(0, n - first.length)));
  let rest = pickWords(n - first.length, pool.filter(x => !first.includes(x)));
  if (kind === 'mixed'){   // make sure new words keep coming: at least 4 a match while only a few words are in progress
    const isNew = x => { const r = peek(x); return !r || !r.seen; };
    const learningN = mainItems().filter(x => { const r = peek(x); return r && r.seen && !isMasteredRec(r); }).length;
    const want = learningN < 15 ? 4 : learningN < 25 ? 2 : 0;
    const fresh0 = pool.filter(x => isNew(x) && !first.includes(x) && !rest.includes(x)), fresh = shuffle(fresh0.filter(x => x.card)).concat(shuffle(fresh0.filter(x => !x.card)));   // plain new words come out first, then cards
    let have = first.concat(rest).filter(isNew).length;
    const resting = x => { const r = peek(x); return r && isMasteredRec(r) && !r.wob && (dueIn(r) == null || dueIn(r) > 0); };
    for (let i = rest.length - 1; i >= 0 && have < want && fresh.length; i--) if (resting(rest[i])){ rest[i] = fresh.pop(); have++; }   // swap out resting mastered words first
    for (let i = rest.length - 1; i >= 0 && have < want && fresh.length; i--) if (!isNew(rest[i]) && isMasteredRec(peek(rest[i]))){ rest[i] = fresh.pop(); have++; }   // then extra reviews
    const bookFirst = first.filter(x => B.includes(pk(x)));
    R = newRound(bookFirst.concat(shuffle(first.filter(x => !bookFirst.includes(x)).concat(rest))), kind);   // book words first, then everything mixed so new words aren't all at the end
  } else if (kind === 'tricky') R = newRound(shuffle(first.concat(rest)), kind);   // new words mixed in, not all at the end
  else R = newRound(shuffle(first).concat(rest), kind);
  R.queue.forEach(it => { if (prac.includes(it.w)){ const p = S.practice[pk(it.w)]; it.prac = pracSteps(it.w)[Math.min(PRAC_STEPS - 1, p.st || 0)]; } });
  R.rank0 = rankInfo(masteredCount()).i; R.lastD = S.points - S.race.mf; R.badges0 = Object.keys(S.badges || {}).length;
  SND.prime(); SND.fx('whistle'); SND.loop(true);
  if (Math.random() < .5) setTimeout(() => VOICE.play('c04'), 600);
  question();
}
const TYPE_LABEL = { w2m:'What does it mean?', m2w:'Name the word', spell:'Spell it', scram:'Unscramble', gap:'Fill the gap', sim:'Similar & opposite', hear:'Listen and spell', pre:'Pick the right start', say:'How do you say it?' };
/* ---------- word-building: prefixes ("not" words and friends) ---------- */
const PREFIX_WORDS = { illegible:'il', illogical:'il', immortal:'im', impolite:'im', impure:'im', impatient:'im', improper:'im', inadequate:'in', incorrect:'in', indirect:'in', informal:'in', inoffensive:'in', inaccurate:'in', incapable:'in', invalid:'in', irreparable:'ir', irrational:'ir', irresistible:'ir', irresponsible:'ir',
  disadvantage:'dis', disappear:'dis', disappointed:'dis', disbelief:'dis', disconnect:'dis', dishonest:'dis', mishear:'mis', misinform:'mis', misjudge:'mis', mispronounced:'mis',
  reappear:'re', redesign:'re', reemerge:'re', rephrase:'re', reapply:'re', rearrange:'re', redecorate:'re', reheat:'re', antibiotic:'anti', anticlimax:'anti', antiseptic:'anti', antivirus:'anti', antifreeze:'anti', antisocial:'anti', autograph:'auto', autopilot:'auto', autobiography:'auto', automobile:'auto',
  interlock:'inter', interrelated:'inter', sublet:'sub', submerge:'sub', subtotal:'sub', superglue:'super', supernatural:'super', superpower:'super',
  interactive:'inter', intercity:'inter', subdivided:'sub', subheading:'sub', submarine:'sub', subtitle:'sub', superhero:'super', superman:'super', supermarket:'super', superstar:'super' };
const prefixOf = x => PREFIX_WORDS[norm(x.w)] || null;
const PREFIX_TIP = { il:'il- goes before l: il + legible = illegible.', im:'im- goes before m, p or b: im + polite = impolite.', in:'in- is the usual “not” start: in + correct = incorrect.', ir:'ir- goes before r: ir + responsible = irresponsible.',
  un:'un- means not: un + canny = uncanny.', dis:'dis- means not, or the opposite: dis + appear = disappear.', mis:'mis- means wrongly: mis + hear = mishear.', re:'re- means again: re + heat = reheat.', anti:'anti- means against: anti + freeze = antifreeze.', auto:'auto- means self: auto + graph = autograph.', inter:'inter- means between or together: inter + lock = interlock.', sub:'sub- means under or below: sub + merge = submerge.', super:'super- means above, or extra big and strong: super + power = superpower.' };
const PREFIX_RULE = 'The “not” starts: il- before l (illegal), ir- before r (irregular), im- before m, p or b (impossible), and in- for most others (incorrect). un- and dis- mean not too. re- means again, mis- means wrongly, anti- means against, auto- means self. inter- means between, sub- means under, super- means above or extra.';
const canHear = () => 'speechSynthesis' in window && !!(S && S.settings && S.settings.sound);
const hasMeaning = x => !!(x.card || (x.m && x.m.trim()));
function typesFor(x){
  if (!hasMeaning(x)) return canHear() ? ['hear', 'scram'] : ['scram'];   // a school word with no meaning yet: spelling only
  const t = x.card ? ['sim', 'w2m', 'scram'] : (S.words.length >= 4 ? ['w2m', 'm2w', 'spell', 'scram'] : ['spell', 'scram']);
  if (gapFor(x) && (x.card || S.words.length >= 4)) t.push('gap');
  if (!x.card && canHear()) t.push('hear');
  if (prefixOf(x)) t.push('pre');
  if (canHear() && pronOptions(x.w)) t.push('say');
  return t;
}
function pickType(item){
  const x = item.w, r = peek(x);
  if (FORCE && typesFor(x).includes(FORCE)) return FORCE;
  if (item.retry && item.lastType) return item.lastType;
  if (item.prac != null) return item.prac;   // a practice word: this step's question type
  if (r && x.card && r.streak >= 2 && !(r.ty || []).includes('sim')) return 'sim';   // steer cards towards the similar & opposite test
  if (!hasMeaning(x)){ const ts = typesFor(x), notYet = ts.filter(t => !((r && r.ty) || []).includes(t)); return notYet.length ? notYet[0] : ts[rnd(ts.length)]; }
  if (!r || !r.seen) return x.card ? (Math.random() < .65 ? 'sim' : 'w2m') : (S.words.length >= 4 ? (Math.random() < .5 ? 'w2m' : 'm2w') : 'spell');
  const base = { sim:4, w2m:2, m2w:2, spell:2, scram:2, gap:2.5, hear:1.6, pre:3, say:2.2 };
  const ts = typesFor(x), ws = ts.map(t => base[t] * ((r.streak > 0 && (r.ty || []).includes(t)) ? .35 : 1) * (t === item.lastType ? .2 : 1));
  let p = Math.random() * ws.reduce((a, b) => a + b, 0), i = 0;
  while (i < ts.length - 1 && p >= ws[i]){ p -= ws[i]; i++; }
  return ts[i];
}
function makeQuestion(item){
  const x = item.w, type = pickType(item);
  const q = { type, w:x, options:null, gap:null };
  if (type === 'w2m'){
    if (x.card){
      const right = info(x.w).m, ban = new Set([x.w, ...x.card.o]);
      const d = [...new Set(shuffle(CARDS.filter(c => !ban.has(c.w))).map(c => info(c.w).m).filter(m => m && m !== right))].slice(0, 3);
      q.options = shuffle([{ t:right, ok:true }, ...d.map(t => ({ t, ok:false }))]);
    } else {
      const d = shuffle(S.words.filter(y => norm(y.w) !== norm(x.w) && y.m && y.m !== x.m)).slice(0, 3);
      q.options = shuffle([{ t:x.m, ok:true }, ...d.map(y => ({ t:y.m, ok:false }))]);
    }
  } else if (type === 'm2w'){
    const others = S.words.filter(y => norm(y.w) !== norm(x.w) && y.m);
    const d = shuffle(others.filter(y => y.w[0].toLowerCase() === x.w[0].toLowerCase())).slice(0, 1);
    if (d.length < 3) for (const y of shuffle(others)) if (d.length < 3 && !d.includes(y) && y.w[0].toLowerCase() !== x.w[0].toLowerCase()) d.push(y);
    if (d.length < 3) for (const y of shuffle(others)) if (d.length < 3 && !d.includes(y)) d.push(y);
    q.options = shuffle([{ t:x.w, ok:true }, ...d.map(y => ({ t:y.w, ok:false }))]);
  } else if (type === 'say'){
    q.options = shuffle([{ t:x.w, ok:true, sp:x.w, j:'' }].concat(pronOptions(x.w).map(p => ({ t:p[1], ok:false, sp:p[0], j:p[2] }))));
  } else if (type === 'pre'){
    const p = prefixOf(x), stem = x.w.slice(p.length), fam = ['il', 'im', 'in', 'ir', 'un'].includes(p) ? ['il', 'im', 'in', 'ir', 'un'] : ['inter', 'sub', 'super'].includes(p) ? ['inter', 'sub', 'super', 'trans', 'under'] : ['re', 'dis', 'mis', 'anti', 'auto', 'un'];
    const REAL = new Set(['inpatient', 'disappear', 'reappear', 'rehear', 'reappointed', 'disarrange', 'unfreeze', 'refreeze', 'dissocial', 'reinform', 'discover', 'recover', 'unappear', 'disconnect', 'reconnect', 'misplace', 'replace', 'disapply', 'reform', 'inform', 'unarrange', 'underlet', 'underpower', 'interlet', 'overlock']);
    q.options = shuffle([{ t:x.w.toLowerCase(), ok:true }, ...shuffle(fam.filter(f => f !== p && !REAL.has(f + stem.toLowerCase()))).slice(0, 3).map(f => ({ t:f + stem.toLowerCase(), ok:false }))]);
    q.tip = PREFIX_TIP[p];
  } else if (type === 'gap'){
    q.gap = gapFor(x);
    const pool = x.card ? CARDS.filter(c => c.w !== x.w && !x.card.o.includes(c.w)).map(c => c.w) : S.words.filter(y => norm(y.w) !== norm(x.w) && y.m).map(y => y.w);
    q.options = shuffle([{ t:q.gap.word.toLowerCase() === x.w.toLowerCase() ? x.w : q.gap.word, ok:true }, ...shuffle(pool).slice(0, 3).map(t => ({ t, ok:false }))]);
  }
  return q;
}
/* Aaron's scoring, shared by the game and the test simulation. fishDone = fish already paid (cards pay per stage). */
function scoreItem(item, q, ok, fishDone, hinted){
  const r = rec(q.w); r.seen++; r.last = today(); r.ty = r.ty || []; r.dy = r.dy || [];
  const was = isMasteredRec(r) || !!(r.m && r.wob), spellish = q.type === 'spell' || q.type === 'scram' || q.type === 'hear';
  let pts = 0, note = null, line, lock = null, custard = false;
  const rabbit = isRabbitWord(q.w); R.lastCarrot = 0;
  pracResult(item, ok, hinted);
  S.stats.answered += 1;
  if (R.kind !== 'rabbit'){ S.race.ra = (S.race.ra == null ? .6 : S.race.ra) * .9 + (ok ? .1 : 0);
  S.race.ta = (S.race.ta == null ? S.race.ra : S.race.ta) * .97 + (ok ? .03 : 0); }   // slow-moving accuracy (main matches only): an earned lead doesn't vanish after one wobbly round
  if (ok){
    S.stats.right++; if (spellish) S.stats.spell++;
    R.streak++; R.best = Math.max(R.best, R.streak); S.stats.best = Math.max(S.stats.best, R.streak);
    if (R.streak % 5 === 0 && R.kind !== 'rabbit'){ S.stats.cwon = (S.stats.cwon || 0) + 1; S.custard = (S.custard || 0) + 1; R.custard = (R.custard || 0) + 1; custard = true; }
    if (!item.retry && !hinted) R.firstTry++; else { r.fixed++; R.fixed++; S.stats.fixed++; }
    if (hinted){ pts = 1; r.hint = (r.hint || 0) + 1; line = say('hinted'); lock = 'hint'; }
    else {
      r.right++; r.streak++;
      if (!r.ty.includes(q.type)) r.ty.push(q.type);
      if (!r.dy.includes(today())) r.dy.push(today());
      pts = item.retry ? 1 : 1 + (R.streak >= 3 ? 1 : 0) + (spellish ? 1 : 0);
      if (r.wob){ r.wob = false; }
      else if (!r.m && meetsMastery(r, !!q.w.card, typesFor(q.w).length)) r.m = true;
      const now = isMasteredRec(r);
      if (now && !was){ lock = 'mastered'; line = say('mastered'); R.mastered.push(q.w.w); r.md = today(); }
      else if (!now && r.streak >= 3){ lock = (q.w.card && !r.ty.includes('sim')) ? 'needsim' : r.ty.length < Math.min(2, typesFor(q.w).length) ? 'type' : 'day'; line = say(lock === 'day' ? 'lockin' : lock === 'needsim' ? 'needSim' : 'needType'); }
      else line = R.kind !== 'rabbit' && (R.streak === 3 || R.streak === 5 || R.streak === 10) ? say('streak', { n:R.streak }) : say(item.retry ? 'fixed' : 'right');
    }
    R.results[R.idx] = 'ok';
  } else {
    r.miss++; r.lm = today(); r.streak = Math.max(0, r.streak - 2); R.streak = 0; R.missed.push(q.w.w);
    if (pracOn(q.w)){}   // a word a grown-up marked for practice stays mastered: the practice steps decide
    else if (r.m && !r.wob){ r.wob = true; lock = 'wobble'; }   // one slip on a mastered word: needs one right answer to re-secure
    else { if (r.m){ r.ty = []; r.dy = []; } r.m = false; r.wob = false; }   // a second slip on a mastered word: earn it again
    line = say('wrong'); R.results[R.idx] = 'bad';
    if (!item.retry){ queueRetry(item); note = 'We will come back to this one in a moment.'; }
    else if (item.tries < 2){ queueRetry(item); note = 'One more go at this later.'; }
    else note = 'It stays on the tricky list for now.';
  }
  if (R.kind === 'rabbit'){ pts = 0; }   // the Rabbit match is for carrots: the fish race with the Mirror is not affected
  else if (fishDone != null) pts = fishDone; else { R.points += pts; S.points += pts; }
  schedule(r, ok, hinted && ok);
  { if (!S.tstatFrom) S.tstatFrom = today(); S.tstat = S.tstat || {}; const ts = S.tstat[q.type] || (S.tstat[q.type] = [0, 0]); ts[1]++; if (ok) ts[0]++; }
  raceFix();
  { const nb = checkBadges(); if (nb.length) R.newBadges = (R.newBadges || []).concat(nb); }   // earned the moment it happens, celebrated at full time
  if (rabbit && ok && !hinted){ const c = lock === 'mastered' ? 6 : 1; S.carrots = (S.carrots || 0) + c; R.carrots = (R.carrots || 0) + c; R.lastCarrot = c; { const nb = checkBadges(); if (nb.length) R.newBadges = (R.newBadges || []).concat(nb); } }   // carrots won back from the Rabbit
  if (custard) line = say('custard');
  return { pts, line, note, lock, custard };
}
function queueRetry(item){
  const pos = Math.min(R.queue.length, R.idx + 3 + rnd(2));
  R.queue.splice(pos, 0, { w:item.w, retry:true, tries:item.tries + 1, lastType:item.lastType });
}
document.addEventListener('keydown', e => {
  if (R && R.keys && !(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))) R.keys(e);
});


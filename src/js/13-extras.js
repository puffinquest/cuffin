/* ---------- celebrations, sound panel, progress report, saying words, streaks, race drama ---------- */

/* say a word aloud with the device's own British voice */
let ttsVoice = null;
function pickTts(){
  try {
    const vs = speechSynthesis.getVoices();
    ttsVoice = vs.find(v => /en-GB/i.test(v.lang) && /Daniel|Kate|Serena|Arthur|Martha|Google UK English Female|Google UK English Male/.test(v.name)) || vs.find(v => /en-GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  } catch (e) {}
}
if ('speechSynthesis' in window){ pickTts(); try { speechSynthesis.onvoiceschanged = pickTts; } catch (e) {} }
function sayWord(w){
  if (!('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(w); u.lang = 'en-GB'; u.rate = .85; if (ttsVoice) u.voice = ttsVoice;
    speechSynthesis.speak(u);
  } catch (e) {}
}
const speakBtn = w => ('speechSynthesis' in window) ? h('button', { class:'say-it', type:'button', 'aria-label':'Hear how to say ' + w, title:'Hear it', onclick:e => { e.stopPropagation(); sayWord(w); } }, icon('sound')) : null;
const wordWithSpeak = (w, cls) => h('div', { class:'wordrow' }, h('div', { class:cls || 'word', text:w }), speakBtn(w));

/* sound panel: one speaker button opens four switches */
function soundPanel(){
  const row = (key, label, sub) => {
    const b = h('button', { class:'switch', type:'button', role:'switch', 'aria-checked':String(S.settings[key] !== false), 'aria-label':label, onclick:() => {
      const v = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', String(v)); S.settings[key] = v;
      if (key === 'sound' && !v){ VOICE.stop(); stopNarr(); SND.stop(); SND.loop(false); S.settings.music = false; const mb = document.querySelector('.sheet [aria-label="Music"]'); if (mb) mb.setAttribute('aria-checked', 'false'); }
      if (key === 'music' && v && !S.settings.sound){ S.settings.sound = true; const sb = document.querySelector('.sheet [aria-label="All sounds"]'); if (sb) sb.setAttribute('aria-checked', 'true'); }
      if (key === 'music' && !v){ SND.stop(); SND.loop(false); }
      if (key === 'music' && v && R && R.queue && R.queue.length) SND.loop(true);
      if ((key === 'cvoice' || key === 'mvoice') && !v) VOICE.stop();
      if (key === 'readout' && !v) stopNarr();
      if (v){ SND.prime(); SND.fx('tap'); }
      save(); document.querySelectorAll('.tbtn[data-k]').forEach(x => x.refresh && x.refresh()); } });
    return h('div', { class:'set' }, h('div', { class:'lbl' }, h('b', { text:label }), h('span', { class:'small muted', text:sub })), b);
  };
  openSheet([h('h2', { text:'Sound' }),
    h('div', {}, row('sound', 'All sounds', 'Off = everything silent, music and voices too.'), row('music', 'Music', 'Story music and the match groove.'),
      row('cvoice', 'Cuffin’s voice', 'Cuffin speaking.'), row('mvoice', 'The Mirror’s voice', 'The Mirror speaking.'), row('readout', 'Read the story aloud', 'The intro, daily chapters and progress updates.')),
    h('button', { class:'btn alt wide', type:'button', onclick:closeSheet }, 'Done')], true);
}
function soundBtns(){
  const ic = () => icon(S.settings.sound ? 'sound' : 'mute');
  const b = h('button', { class:'tbtn', type:'button', 'aria-label':'Sound settings', title:'Sound', 'aria-pressed':String(!!S.settings.sound), onclick:() => { SND.prime(); soundPanel(); } }, ic());
  b.dataset.k = 'sound'; b.refresh = () => { b.setAttribute('aria-pressed', String(!!S.settings.sound)); put(b, ic()); };
  return b;
}

/* full-screen celebration; next() runs when he taps on */
function confettiBox(n){
  const box = h('div', { class:'confetti', 'aria-hidden':'true' }), cols = ['#FCD116', '#1D5BD8', '#D7263D', '#FFC83D', '#3DDC84', '#B48BFF'];
  for (let k = 0; k < (n || 50); k++) box.append(h('i', { style:'left:' + rnd(100) + '%;background:' + cols[k % cols.length] + ';animation-delay:' + (Math.random() * 1.4).toFixed(2) + 's' }));
  return box;
}
function fireworksBox(){
  const box = h('div', { class:'fireworks', 'aria-hidden':'true' }), cols = ['#FFD23F', '#FF4D5E', '#3DDC84', '#4DA3FF', '#B48BFF', '#FFFFFF'];
  for (let b = 0; b < 7; b++){
    const burst = h('div', { class:'fw', style:'left:' + (10 + rnd(80)) + '%;top:' + (8 + rnd(45)) + '%;animation-delay:' + (b * .45).toFixed(2) + 's' });
    for (let k = 0; k < 18; k++){ const a = k / 18 * Math.PI * 2, d = 60 + rnd(50);
      burst.append(h('i', { style:'--dx:' + Math.round(Math.cos(a) * d) + 'px;--dy:' + Math.round(Math.sin(a) * d) + 'px;background:' + cols[(b + k) % cols.length] + ';animation-delay:' + (b * .45).toFixed(2) + 's' })); }
    box.append(burst);
  }
  return box;
}
function celebrate(o, next){
  closeSheet();
  const go = h('button', { class:'btn kick', type:'button', onclick:() => { SND.fx('tap'); ov.remove(); if (R) R.keys = prev; if (o.onDone) o.onDone(); next && next(); } }, o.button || 'Brilliant!');
  const ov = h('div', { class:'celeb' + (o.fireworks ? ' prize' : ''), role:'dialog', 'aria-modal':'true', 'aria-labelledby':'celebh' }, o.fireworks ? fireworksBox() : null, confettiBox(o.confetti || 50),
    h('div', { class:'celin' },
      h('div', { class:'eyebrow', style:'color:#FFD23F', text:o.kicker || '' }),
      o.art || null,
      h('h2', { id:'celebh', text:o.title }),
      o.big ? wordWithSpeak(o.big, 'celword') : null,
      o.sub ? h('p', { class:'celsub', text:o.sub }) : null,
      o.line ? h('div', { class:'mline', style:'background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2);color:#fff' }, cimg(o.who === 'm' ? MIMG.smug : IMG.right, '', 34, ''), h('span', { class:'q', text:o.line })) : null,
      go, h('button', { class:'endlink', type:'button', onclick:() => { if (o.onEnd) return go.click(); ov.remove(); if (R) R.keys = prev; if (R && R.queue && R.queue.length) quitMatch(); else home(); } }, '✕ End')));
  if (o.fireworks && (o.title || '').length > 45){ const t = ov.querySelector('#celebh'); if (t) t.classList.add('long'); }
  document.body.append(ov); requestAnimationFrame(() => fitWords(ov));
  const prev = R ? R.keys : null; if (R) R.keys = null;
  SND.fx(o.sound || 'cheer'); if (o.tune) SND.tune(o.tune);
  if (o.fireworks){ [400, 900, 1500, 2100, 2800].forEach(t => setTimeout(() => { if (ov.isConnected) SND.fx('cheer'); }, t)); if (S.settings.sound) setTimeout(() => sayWord('Prize unlocked! ' + (o.title || '')), 700); }
  if (o.voice) setTimeout(() => VOICE.play(o.voice), 900);
  if (o.voice2) setTimeout(() => VOICE.play(o.voice2), 1000);
  setTimeout(() => go.focus({ preventScroll:true }), 80);
}
function celebrateAll(list, done){ const next = () => { const c = list.shift(); if (!c) return done(); celebrate(c, next); }; next(); }
const bigEmoji = e => h('div', { class:'celart', 'aria-hidden':'true', text:e });

/* "How are we doing?" */
function progressReport(){
  const T = mainItems().length, aM = masteredCount(), A = S.points, M = S.race.mf, d = A - M, ri = rankInfo(aM), st = dayStreak();
  const playedToday = S.history.some(x => x.d === today());
  VOICE.play('c23');
  const line = d >= 10 ? 'We are well clear. The Mirror has gone very quiet. Suspiciously quiet.' : d > 0 ? 'We are ahead, but only just. No time for custard.' : d === 0 ? 'Dead level. Every answer counts.' : 'The Mirror is in front. Four in. Four hold. Four out. We can catch him.';
  const r = (em, k, v) => h('div', { class:'rep' }, h('span', { class:'em', 'aria-hidden':'true', text:em }), h('span', { class:'k', text:k }), h('b', { text:v }));
  openSheet([
    h('div', { class:'say' }, cimg(IMG.hello, '', 52, 'Cuffin'), h('div', { class:'bub' }, h('div', { class:'nm', text:'Cuffin' }), h('p', { class:'tx', text:VOICE.can('c23') ? VO.c23 : 'Right. Here’s how we’re doing.' }))),
    h('div', { class:'reps' },
      r('🐟', 'Fresh fish', A + ' v ' + M + (d > 0 ? ' · we lead by ' + d : d < 0 ? ' · Mirror leads by ' + (-d) : ' · level')),
      r('🔒', 'Words mastered', aM + ' of ' + T + ' (Mirror ' + S.race.mm + ')'),
      r('🏆', 'Trophy', ri.cur.name + (ri.next ? ' · ' + (ri.next.at - aM) + ' words to ' + (SHORT_RANK[ri.next.name] || ri.next.name) : '')),
      r('🔥', 'Streak', st + ' day' + (st === 1 ? '' : 's') + (todayCount() >= GOAL ? ' · today’s goal done ✓' : playedToday ? ' · ' + (GOAL - todayCount()) + ' answers to today’s goal' : ' · play today to keep it')),
      r('🍮', 'Custard', (S.custard || 0) + ' pot' + ((S.custard || 0) === 1 ? '' : 's'))),
    h('p', { class:'line', text:line }),
    h('button', { class:'btn wide', type:'button', onclick:closeSheet }, 'Back to it')], true);
  narrateLines(['Fresh fish: ' + A + ' versus ' + M + '. ' + (d > 0 ? 'We lead by ' + d + '.' : d < 0 ? 'The Mirror leads by ' + (-d) + '.' : 'Level.'),
    'Words mastered: ' + aM + ' of ' + T + '. The Mirror has ' + S.race.mm + '.',
    ri.next ? (ri.next.at - aM) + ' more words to the next trophy.' : 'Every trophy won.',
    'Streak: ' + st + ' day' + (st === 1 ? '' : 's') + '.', line]);
}
const reportBtn = small => h('button', { class: small ? 'tbtn' : 'btn alt small', type:'button', 'aria-label':'How are we doing?', title:'How are we doing?', onclick:() => { SND.fx('tap'); progressReport(); } }, small ? '📣' : ['📣 ', 'How are we doing?']);

/* streaks */
const datesBetween = (a, b) => { const out = []; let d = addDays(a, 1); while (d < b){ out.push(d); d = addDays(d, 1); } return out; };
function streakRescue(done){
  const played = [...new Set(S.history.map(x => x.d).concat(S.freeze || []))].sort();
  const last = played[played.length - 1];
  if (!last || last >= addDays(today(), -1) || S.freezeAsk === today()) return done();
  const missed = datesBetween(last, today());
  if (missed.length > 2) return done();
  let n = 0, d = last; const set = new Set(played); while (set.has(d)){ n++; d = addDays(d, -1); }
  if (n < 2 || (S.custard || 0) < missed.length) return done();
  S.freezeAsk = today(); save();
  const k = missed.length;
  const yes = h('button', { class:'btn kick', type:'button', onclick:() => { ov.remove(); S.freeze = (S.freeze || []).concat(missed); S.custard -= k; save();
    celebrate({ kicker:'STREAK SAVED', art:bigEmoji('🔥'), title:n + '-day streak saved!', sub:'Cost: ' + k + ' pot' + (k > 1 ? 's' : '') + ' of custard. Play today to keep it going.', voice:VOICE.can('c29') ? 'c29' : null, line:VOICE.can('c29') ? VO.c29 : 'A pot of custard, sacrificed to save the streak. A noble custard.' }, done); } }, '🍮 Save my streak');
  const no = h('button', { class:'linkbtn', type:'button', style:'color:#C9D2F2', onclick:() => { ov.remove(); done(); } }, 'Let it go');
  const ov = h('div', { class:'celeb', role:'dialog', 'aria-modal':'true' }, h('div', { class:'celin' },
    h('div', { class:'eyebrow', style:'color:#FFD23F', text:'STREAK IN DANGER' }), bigEmoji('🔥'),
    h('h2', { text:'Your ' + n + '-day streak is in danger!' }),
    h('p', { class:'celsub', text:'You missed ' + (k === 1 ? 'yesterday' : k + ' days') + '. Spend ' + k + ' pot' + (k > 1 ? 's' : '') + ' of custard to keep your streak alive? You have ' + S.custard + '.' }),
    yes, no));
  document.body.append(ov); SND.fx('page');
}

/* race drama: at most one big moment per match (plus a comeback after it) */
function raceDrama(dPrev, dNow){
  if (!R || R.idx < 2) return null;   // let the match settle before any breaking news
  R.drama = R.drama || 0;
  if (dPrev >= 0 && dNow < 0 && R.drama === 0){
    R.drama = 1; R.wasBehind = true;
    return { title:'BREAKING NEWS', text:'The Mirror takes the lead!', voice:'c25', voice2:'m11', mline:'I’m in FRONT! Somebody take a picture! From my good side!' };
  }
  if (dPrev <= 0 && dNow > 0 && R.wasBehind && R.drama === 1){
    R.drama = 2;
    return { title:'WHAT A COMEBACK', text:'Cuffin is back in front!', voice:'c26', mline:msay('behind') };
  }
  if (dPrev < 10 && dNow >= 10 && R.drama === 0 && !R.farDone){
    R.drama = 1; R.farDone = true;
    return { title:'BREAKING NEWS', text:'Cuffin is ' + dNow + ' fish clear of the Mirror!', voice:'c24', voice2:'m12', mline:'This is fine. Everything is fine. I’m simply letting you win. For now.' };
  }
  return null;
}

function celebrateMastered(x, next){
  const v = VOICE.pick('c10'), v2 = Math.random() < .35 ? VOICE.pick('m13') : null;
  celebrate({ kicker:'WORD MASTERED', art:bigEmoji('🔒'), title:'Locked in for good!', big:x.w, sub:x.card ? info(x.w).m : x.m, voice:v, voice2:v2, tune:'win',
    line:v ? VO.c10 : 'Mastered. The puffin community will be informed.', button:'Keep going' }, next);
}
/* end-of-match celebrations: new trophy, badges, daily goal, streak */
/* prizes from Mum and Dad: a big fireworks moment, shown once (and replayed if it was missed) */
const onGrownupDev = () => { try { return typeof isGrownupDev === 'function' && isGrownupDev(); } catch (e) { return false; } };
function prizeParties(){
  const m = masteredCount(), out = [];
  if (onGrownupDev()) return out;   // the party is for Aaron: a grown-up's phone never uses it up
  for (const p of (S.prizes || []).slice().sort((a, b) => a.at - b.at)){
    if (m < p.at || p.kidSeen || p.given) continue;
    const mark = () => { p.announced = true; p.seen = true; if (!onGrownupDev()) p.kidSeen = true; save(); };
    out.push({ kicker:'🎁 PRIZE UNLOCKED! 🎁', fireworks:true, confetti:90, tune:'anthem', art:h('div', { class:'celgift', 'aria-hidden':'true', text:'🎁' }),
      title:p.text || 'A surprise prize!', sub:'For mastering ' + p.at + ' words. Go and show a grown-up!',
      line:'A prize. From the grown-ups. The puffin community is beside itself. I may need a lie down.', who:'c', button:'🎉 I’ll tell a grown-up!', onDone:mark, onEnd:mark });
  }
  return out;
}
function matchCelebrations(round, badges){
  const list = prizeParties(), m = masteredCount(), ri = rankInfo(m);
  if (S.rabbitLock && S.rabbitLock.party){ S.rabbitLock.party = false; save();
    list.push({ kicker:'RABBIT LOCKED OUT', art:h('div', { class:'celbadge' }, h('span', { class:'bem big', text:'🔒🐰' })), title:'Gate locked!', sub:'Every Rabbit word mastered. The Rabbit is locked out of the Puffin Community' + (S.rabbitLocks > 1 ? ' (' + S.rabbitLocks + ' times now!)' : '') + '.', fireworks:true, confetti:90, tune:'anthem',
      line:'The Rabbit rattled the gate, stamped his foot and hopped off sulking. He will be back with new words. He always is.' }); }
  for (const t of newRabbitTrophies()) list.push({ kicker:'RABBIT TROPHY', art:h('div', { class:'celtro' }, rabbitTrophyEl(t, 'won')), title:t.name + '!', sub:t.d + '.', line:'Another one for the cabinet. The Rabbit is furious.' });
  if (round.rank0 != null && ri.i > round.rank0) list.push({ kicker:'NEW TROPHY', art:h('div', { class:'celtro' }, trophyEl(ri.i, true)), title:TROPHY_NAMES[ri.i] + '!', sub:'You are now ' + ri.cur.name + '. ' + m + ' words mastered.', voice:VOICE.pick('c15'), tune:'win', line:VOICE.can('c15') ? VO.c15 : 'A new trophy. I would like that noted.' });
  for (const b of badges){
    const pw = b.id === 'd7', v = pw ? VOICE.pick('c31') : VOICE.pick('c27');
    list.push({ kicker:pw ? 'PERFECT WEEK' : 'NEW BADGE', art:h('div', { class:'celbadge' }, b.em ? h('span', { class:'bem big', text:b.em }) : icon(b.ic)), title:b.n, sub:b.d, voice:v, line:v ? VO[v] : 'A badge. The puffin community does not hand these out lightly.' });
  }
  if (S.goal !== today() && todayCount() >= GOAL){
    S.goal = today(); save();
    const st = dayStreak(), v = st >= 2 ? VOICE.pick('c28') : VOICE.pick('c30'), v2 = st >= 3 && Math.random() < .3 ? VOICE.pick('m15') : null;
    list.push({ kicker:'DAILY GOAL DONE', art:h('div', { class:'celflame' }, h('span', { 'aria-hidden':'true', text:'🔥' }), h('b', { text:String(st) })), title:st >= 2 ? st + '-day streak!' : 'Daily goal done!', sub:st >= 2 ? 'Come back tomorrow to make it ' + (st + 1) + '.' : 'Play again tomorrow to start a streak.', voice:v, voice2:v2, line:v ? VO[v] : 'Daily goal done. Floppy. Warm. Like custard.', confetti:30 });
  }
  return list;
}
const GOAL = 10;
const todayCount = () => (S.rounds || []).filter(x => x.d === today()).reduce((a, x) => a + (x.n || 0), 0);
/* the flame and the goal ring on Home */
function streakRow(){
  const st = dayStreak(), n = Math.min(GOAL, todayCount()), pct = n / GOAL, done = n >= GOAL;
  const ring = sv('svg', { viewBox:'0 0 36 36', class:'gring', 'aria-hidden':'true' },
    sv('circle', { cx:18, cy:18, r:15, class:'gr0' }), sv('circle', { cx:18, cy:18, r:15, class:'gr1', 'stroke-dasharray':(94.25 * pct).toFixed(1) + ' 94.25', transform:'rotate(-90 18 18)' }));
  return h('div', { class:'streakrow' },
    h('div', { class:'flame' + (st ? '' : ' out') + (S.history.some(x => x.d === today()) ? '' : ' cold'), title:'Days in a row' }, h('span', { 'aria-hidden':'true', text:'🔥' }), h('b', { text:String(st) }), h('span', { class:'small', text:st === 1 ? 'day' : 'days' })),
    h('div', { class:'goal' + (done ? ' done' : ''), title:'Daily goal' }, h('div', { class:'gwrap' }, ring, h('span', { class:'gtx', text: done ? '✓' : n + '' })), h('span', { class:'small', text: done ? 'Goal done!' : 'Goal: ' + GOAL + ' answers' })),
    h('button', { class:'cpots', type:'button', title:'Custard pots. Pie the Mirror: ' + ({ ready:'ready!', locked:'after today’s goal', done:'done today' })[pieState()], 'aria-label':'Custard pots: ' + (S.custard || 0) + '. Pie the Mirror', onclick:() => { SND.fx('tap'); pieGame(); } }, h('span', { class: pieState() === 'ready' ? 'pieready' : '', 'aria-hidden':'true', text: pieState() === 'ready' ? '🥧' : '🍮' }), h('b', { text:String(S.custard || 0) })));
}

/* reading the story aloud in the same British voice as the words */
const NARR = { tok:0, on:false };
function stopNarr(){ NARR.tok++; if (NARR.on){ NARR.on = false; try { speechSynthesis.cancel(); } catch (e) {} SND.duck(false); } }
const tidy = t => t.replace(/[\p{Extended_Pictographic}\u{FE0F}]/gu, '').replace(/\s·\s/g, ', ').replace(/\sv\s/g, ' versus ').replace(/\s+/g, ' ').trim();
function speakLines(lines, tok, after){
  const fin = () => { if (tok !== NARR.tok) return; NARR.on = false; SND.duck(false); if (after){ const f = after; after = null; f(); } };
  if (tok !== NARR.tok) return;
  if (!lines.length || !('speechSynthesis' in window)) return fin();
  try {
    speechSynthesis.cancel(); NARR.on = true; SND.duck(true);
    lines.forEach((t, k) => { const u = new SpeechSynthesisUtterance(t); u.lang = 'en-GB'; u.rate = .95; if (ttsVoice) u.voice = ttsVoice;
      if (k === lines.length - 1) u.onend = u.onerror = fin;
      speechSynthesis.speak(u); });
    setTimeout(fin, 2500 + lines.join(' ').length * 85);   // in case the phone never says it has finished
  } catch (e) { fin(); }
}
const canNarr = () => S.settings.sound && S.settings.readout !== false && 'speechSynthesis' in window;
/* everything on a story slide, minus lines a recording already says */
function slideLines(el){
  const voiced = new Set(Object.keys(VO).filter(k => VOICE.can(k)).map(k => VO[k].trim()));
  const out = [];
  el.querySelectorAll('.chapter, h2, p, .rule, .lower').forEach(x => {
    if (x.closest('button') || x.closest('.lower') !== null && !x.classList.contains('lower')) return;
    if (x.matches('p.tap, p.small, .sub p') ) return;
    let t;
    if (x.classList.contains('lower')){ const k = x.querySelector('.k'), v = x.querySelector('.v'); t = (k ? k.textContent + ' says: ' : '') + (v ? v.textContent : ''); if (v && voiced.has(v.textContent.trim())) return; }
    else if (x.classList.contains('tx')){ if (voiced.has(x.textContent.trim())) return; const nm = x.closest('.say') && x.closest('.say').querySelector('.nm'); t = (nm ? nm.textContent + ' says: ' : '') + x.textContent; }
    else { if (voiced.has(x.textContent.trim())) return; const c = x.cloneNode(true); c.querySelectorAll('.n').forEach(n => n.remove()); t = c.textContent; }
    t = tidy(t); if (t && t.length > 1 && !out.includes(t)) out.push(t);
  });
  return out;
}
function narrateSlide(el, clips){
  const playClips = () => (clips || []).forEach(id => VOICE.play(id));
  if (!canNarr()) return playClips();
  const tok = NARR.tok;
  setTimeout(() => { if (tok !== NARR.tok || !el.isConnected) return; speakLines(slideLines(el), tok, playClips); }, 450);
}
function narrateLines(lines, delay){
  stopNarr(); if (!canNarr()) return;
  const tok = NARR.tok;
  setTimeout(() => { if (tok !== NARR.tok) return; VOICE.whenIdle(() => speakLines(lines.map(tidy).filter(Boolean), tok)); }, delay || 600);
}

/* ---------- Grown-ups → Insights: where Aaron is strong and where he struggles ---------- */
const TYPE_NAMES = { say:'How do you say it?', w2m:'What does it mean?', m2w:'Name the word', spell:'Spelling', scram:'Unscramble', gap:'Fill the gap', sim:'Similar & opposite', hear:'Listen and spell', pre:'Pick the right start' };
function ago(d){ const n = daysSince(d); return n >= 999 ? 'never' : n === 0 ? 'today' : n === 1 ? 'yesterday' : n + ' days ago'; }
function whenDue(r){ const dn = dueIn(r); if (dn == null) return ''; return dn < 0 ? 'review overdue' : dn === 0 ? 'review today' : dn === 1 ? 'review tomorrow' : 'review in ' + dn + ' days'; }
function insightsPanel(){
  const items = allItems().map(x => ({ x, r:peek(x) }));
  const c = counts(), seenL = items.filter(o => o.r && o.r.seen);
  const dueToday = seenL.filter(o => { const d = dueIn(o.r); return d != null && d <= 0; }).length;
  const dueWeek = seenL.filter(o => { const d = dueIn(o.r); return d != null && d > 0 && d <= 7; }).length;
  const tricky = seenL.filter(o => o.r.miss > 0 && o.r.seen >= 2)
    .map(o => Object.assign(o, { rate:o.r.miss / o.r.seen }))
    .sort((a, b) => (b.r.wob ? 1 : 0) - (a.r.wob ? 1 : 0) || b.rate - a.rate || b.r.miss - a.r.miss).slice(0, 10);
  const recent = seenL.filter(o => o.r.md && daysSince(o.r.md) <= 6 && isMasteredRec(o.r)).map(o => o.x.w);
  const R7 = (S.rounds || []).filter(x => daysSince(x.d) <= 6), Rold = (S.rounds || []).filter(x => daysSince(x.d) > 6 && daysSince(x.d) <= 27);
  const pct = rs => { const n = rs.reduce((a, x) => a + (x.n || 0), 0); return n ? Math.round(100 * rs.reduce((a, x) => a + (x.r || 0), 0) / n) : null; };
  const p7 = pct(R7), pOld = pct(Rold);
  const cell = (k, v, sub) => h('div', { class:'st' }, h('div', { class:'k', text:k }), h('div', { class:'v', text:String(v) }), sub ? h('div', { class:'d', style:'color:var(--muted)', text:sub }) : null);
  const ts = S.tstat || {};
  const typeRows = Object.keys(TYPE_NAMES).filter(t => ts[t] && ts[t][1]).map(t => { const [ok, n] = ts[t], p = Math.round(100 * ok / n);
    return h('div', { class:'irow' }, h('span', { class:'iname', text:TYPE_NAMES[t] }), h('span', { class:'ibar', 'aria-hidden':'true' }, h('i', { style:'width:' + p + '%;background:' + (p >= 80 ? 'var(--win)' : p >= 60 ? 'var(--gold)' : 'var(--miss)') })), h('b', { class:'ipct', text:p + '%' }), h('span', { class:'small muted', text:'of ' + n })); });
  const days7 = new Set((S.history || []).filter(x => daysSince(x.d) <= 6).map(x => x.d)).size, q7 = R7.reduce((a, x) => a + (x.n || 0), 0);
  const week = h('div', { class:'weekbox' }, h('h3', { class:'ih', style:'margin:0', text:'This week' }),
    h('p', { text:'Played on ' + days7 + ' of the last 7 days · ' + q7 + ' questions · ' + recent.length + ' new word' + (recent.length === 1 ? '' : 's') + ' mastered · 🔥 ' + dayStreak() + '-day streak.' }),
    tricky.length ? h('p', { class:'small', text:'Worth a chat: ' + tricky.slice(0, 3).map(o => o.x.w).join(', ') + '.' }) : null,
    schoolDue() ? h('button', { class:'linkbtn', type:'button', style:'align-self:flex-start', onclick:() => { gTab = 'school'; grownups(); } }, '📅 Add this week’s school words →') : null);
  return h('div', { class:'insights' }, week,
    h('div', { class:'stat4' }, cell('MASTERED', c.mastered, 'of ' + mainItems().length), cell('LEARNING', c.learning + c.lock, c.new + ' not started'), cell('DUE TODAY', dueToday, dueWeek + ' more this week'),
      cell('RIGHT FIRST TIME', p7 == null ? '–' : p7 + '%', p7 == null ? 'last 7 days' : pOld == null ? 'last 7 days' : (p7 > pOld ? '▲ ' : p7 < pOld ? '▼ ' : '= ') + 'was ' + pOld + '% before')),
    h('h3', { class:'ih', text:'Words he finds hardest' }),
    tricky.length ? h('div', { class:'saves' }, tricky.map(o => h('div', { class:'sv' }, h('div', { class:'d' }, h('b', { text:o.x.w }),
      h('span', { class:'muted', text:'Wrong ' + o.r.miss + ' of ' + o.r.seen + ' · seen ' + ago(o.r.last) + (whenDue(o.r) ? ' · ' + whenDue(o.r) : '') })),
      h('span', { class:'you', title:o.r.wob ? 'Was mastered, slipped once' : isMasteredRec(o.r) ? 'Mastered' : 'Still learning', text:o.r.wob ? '🟠 wobbly' : isMasteredRec(o.r) ? '✅' : '📘' })))) : h('p', { class:'muted small', text:'No tricky words yet. Words show here once he has missed them.' }),
    typeRows.length ? [h('h3', { class:'ih', text:'By question type' }), h('div', { class:'itypes' }, typeRows)] : null,
    recent.length ? [h('h3', { class:'ih', text:'Mastered this week' }), h('p', { class:'small', text:recent.join(', ') })] : null,
    h('p', { class:'small muted', text:(S.tstatFrom ? 'Question-type figures count from ' + longDate(S.tstatFrom) + '. ' : '') + '📘 learning · ✅ mastered · 🟠 wobbly (slipped once after mastering).' }));
}

/* ---------- Progress → Aaron's own word lists ---------- */
function wordLists(){
  const all = mainItems().map(x => ({ x, r:peek(x) }));
  return {
    mastered:all.filter(o => isMasteredRec(o.r)).map(o => o.x).sort((a, b) => a.w.localeCompare(b.w)),
    almost:all.filter(o => isAlmost(o.r)).sort((a, b) => (b.r.wob ? 1 : 0) - (a.r.wob ? 1 : 0) || b.r.streak - a.r.streak).map(o => o.x),
    tricky:trickyWords()
  };
}
const LIST_INFO = { mastered:['✅', 'Mastered', 'Locked in for good. The puffin community is impressed.'], almost:['⭐', 'Almost there', 'Get these right again on another day to master them.'], tricky:['🔥', 'Tricky words', 'These caught you out. Practise them in “Tricky words” in More matches.'] };
function wordListSheet(kind){
  const L = wordLists(), list = L[kind], [em, title, tip] = LIST_INFO[kind];
  const tabs = h('div', { class:'seg seg3', role:'group', 'aria-label':'Choose list' }, Object.keys(LIST_INFO).map(k => h('button', { type:'button', 'aria-pressed':String(k === kind), onclick:() => { SND.fx('tap'); wordListSheet(k); } }, LIST_INFO[k][0] + ' ' + L[k].length)));
  const mean = x => x.card ? info(x.w).m : x.m;
  const note = x => { const r = peek(x); return kind === 'almost' ? (r.wob ? 'Slipped once: one right answer saves it' : (r.streak >= 3 ? 'Ready: get it right on another day' : r.streak + ' in a row')) : kind === 'tricky' ? 'Missed ' + r.miss + (r.miss === 1 ? ' time' : ' times') : ''; };
  openSheet([h('h2', {}, em + ' ' + title + ' ', h('span', { class:'muted', style:'font-size:.9em', text:'(' + list.length + ')' })), tabs, h('p', { class:'small muted', text:tip }),
    h('div', { class:'wlist' }, list.length ? list.map(x => h('div', { class:'wl' }, h('div', { style:'min-width:0' }, h('b', { text:x.w }), h('span', { class:'small muted', text:(mean(x) || '') + (note(x) ? ' · ' + note(x) : '') })), speakBtn(x.w)))
      : h('p', { class:'muted', text: kind === 'mastered' ? 'None yet. Keep going!' : kind === 'almost' ? 'Get a word right 2 times in a row and it appears here.' : 'Nothing tricky right now. Brilliant.' })),
    h('button', { class:'btn alt wide', type:'button', onclick:closeSheet }, 'Close')], true);
}
function wordListBtns(){
  const L = wordLists();
  return h('div', { class:'wbtns' }, Object.keys(LIST_INFO).map(k => h('button', { class:'btn alt small', type:'button', onclick:() => { SND.fx('tap'); wordListSheet(k); } }, LIST_INFO[k][0] + ' ' + L[k].length + ' ' + (k === 'almost' ? 'Almost' : k === 'tricky' ? 'Tricky' : 'Mastered'))));
}

/* ---------- Cuffin's word-building lesson (first prefix question, and from Progress) ---------- */
function prefixLesson(){
  const row = (p, ex, rule) => h('div', { class:'prow' }, h('b', { class:'pp', text:p }), h('span', {}, h('b', { text:ex }), ' · ' + rule));
  openSheet([h('div', { class:'say' }, cimg(IMG.hello, '', 52, 'Cuffin'), h('div', { class:'bub' }, h('div', { class:'nm', text:'Cuffin' }), h('p', { class:'tx', text:'A word-building secret. The start of a word can flip its meaning. Learn the rule and you win lots of words at once.' }))),
    h('div', { class:'prules' },
      row('il-', 'illegal', 'before l'), row('ir-', 'irregular', 'before r'), row('im-', 'impossible', 'before m, p or b'), row('in-', 'incorrect', 'most other “not” words'),
      row('un- / dis-', 'unkind, dishonest', 'also mean not'), row('re-', 'reheat', 'again'), row('mis-', 'mishear', 'wrongly'), row('anti-', 'antifreeze', 'against'), row('auto-', 'autograph', 'self'), row('inter-', 'interlock', 'between, together'), row('sub-', 'submerge', 'under'), row('super-', 'superpower', 'above, extra')),
    h('button', { class:'btn wide', type:'button', onclick:() => { SND.fx('tap'); closeSheet(); } }, 'Got it')], true);
  narrateLines(['A word-building secret. I L before L, as in illegal. I R before R, as in irregular. I M before M, P or B, as in impossible. And I N for most other not words, as in incorrect.'], 300);
}

/* ---------- Grown-ups → School: this week's school words ---------- */
const schoolDue = () => !S.school || !S.school.d || daysSince(S.school.d) >= 7;
/* reads the way school lists usually arrive: one per line, or "a, b, c", with or without meanings */
function parseSchool(txt){
  const clean = w => w.normalize('NFC').replace(/\(.*?\)/g, '').replace(/^[\s\-–—•*\d.)]+/, '').replace(/[^\p{L}'\- ]/gu, '').replace(/\s+/g, ' ').trim().toLowerCase();
  const out = [];
  for (let line of txt.split(/\n|;/)){
    line = line.trim(); if (!line) continue;
    if (/^(week|spelling|spellings|words|list)\b[^,]*:?\s*$/i.test(line)) continue;   // a heading on its own
    line = line.replace(/^(week\s*\d+\s*)?(spellings?|words|list)\s*:\s*/i, '');      // "Spellings: a, b"
    const sep = line.match(/\s*(\t|:|=|\s[-–—]\s|–|—)\s*/);
    if (sep){ const w = clean(line.slice(0, sep.index)), m = line.slice(sep.index + sep[0].length).trim(); if (w) out.push({ w, m }); continue; }
    const parts = line.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length === 2 && /\s/.test(parts[1])){ const w = clean(parts[0]); if (w) out.push({ w, m:parts[1] }); continue; }   // "word, a meaning in words"
    for (const p of parts){ const w = clean(p); if (w) out.push({ w, m:'' }); }                                           // "a, b, c" or a single word
  }
  return out.filter(x => x.w.length > 1 && x.w.split(' ').length <= 3);
}
function saveSchool(rows){
  const keys = [];
  for (const r of rows){
    const k = norm(r.w), card = CARD_ITEMS.find(x => norm(x.w) === k), ex = S.words.find(x => norm(x.w) === k);
    if (ex){ if (r.m && !ex.m) ex.m = r.m; }
    else if (!card) S.words.push({ w:r.w, m:r.m || '', s:'' });
    if (!keys.includes(k)) keys.push(k);
  }
  S.school = { d:today(), list:keys }; save();
}
function schoolPanel(){
  const due = schoolDue(), L = (S.school && S.school.list) || [];
  const ta = h('textarea', { id:'schoolin', 'aria-label':'This week’s school words', placeholder:'One word per line. Add a meaning after a comma if you have it:\nnecessary, needed or essential\nseparate\nbelieve, to think something is true', style:'min-height:120px' });
  const msg = h('p', { class:'small', 'aria-live':'polite' });
  const find = k => S.words.find(x => norm(x.w) === k) || CARD_ITEMS.find(x => norm(x.w) === k);
  const stat = x => { const r = peek(x); return !r || !r.seen ? '… not seen yet' : isMasteredRec(r) ? '✅ mastered' : isAlmost(r) ? '⭐ almost' : r.miss ? '🔥 tricky' : '📘 learning'; };
  return h('div', { class:'insights' },
    due ? h('div', { class:'note custard' }, h('span', { 'aria-hidden':'true', text:'📅' }), h('b', { text: L.length ? 'New week: add this week’s school words.' : 'Add Aaron’s school spelling words for this week.' }))
        : h('div', { class:'note' }, h('span', { 'aria-hidden':'true', text:'✅' }), h('span', { text:'This week’s words added ' + longDate(S.school.d) + '. Next reminder in ' + (7 - daysSince(S.school.d)) + ' day' + (7 - daysSince(S.school.d) === 1 ? '' : 's') + '.' })),
    h('p', { class:'small muted', text:'Paste or type the list. Meanings are optional: words with a meaning get every question type; words without one get “Listen and spell” and unscramble. Up to 3 of these words open every Kick Off until they are mastered. (Spelling lists added for you in an update become Rabbit words instead.)' }),
    ta, h('button', { class:'btn small', type:'button', style:'align-self:flex-start', onclick:() => {
      const rows = parseSchool(ta.value);
      if (!rows.length){ msg.style.color = 'var(--miss)'; msg.textContent = 'Type at least one word first.'; return; }
      saveSchool(rows); SND.fx('fish'); toast(rows.length + ' school word' + (rows.length === 1 ? '' : 's') + ' added'); grownups(); } }, '💾 Save this week’s words'), msg,
    L.length ? [h('h3', { class:'ih', text:'This week (' + L.length + ')' }), h('div', { class:'saves' }, L.map(k => { const x = find(k); if (!x) return null;
      return h('div', { class:'sv' }, h('div', { class:'d' }, h('b', { text:x.w }), h('span', { class:'muted', text:(x.card ? info(x.w).m : x.m) || 'No meaning: spelling questions only' })), h('span', { class:'you', text:stat(x) })); }))] : null);
}

/* ---------- Cuffin's word story: every 2–3 days after the daily chapter, and any time from More matches ---------- */
const storyDue = () => S.storyDay ? daysSince(S.storyDay) >= 3 || (daysSince(S.storyDay) >= 2 && Math.random() < .5) : matchDay() >= 2;
function storyTime(done){
  const st = pickStory(), bankItem = w => allItems().find(x => norm(x.w) === norm(w)), meanOfX = x => x ? (x.card ? info(x.w).m : x.m) : '';
  const words = st.w.filter(w => meanOfX(bankItem(w)));
  S.storyDay = today(); S.stories = (S.stories || []).concat(st.t).slice(-40); save();
  screen = 'story'; SND.loop(false);
  const re = words.length ? new RegExp('\\b(' + words.map(esc).join('|') + ')\\b', 'gi') : null;
  const para = t => { if (!re) return h('p', { text:t }); const out = []; let last = 0, m; re.lastIndex = 0; while ((m = re.exec(t))){ out.push(t.slice(last, m.index)); const w = m[0]; out.push(h('button', { class:'sw', type:'button', title:'Hear it', onclick:() => sayWord(w) }, w)); last = m.index + w.length; } out.push(t.slice(last)); return h('p', {}, out); };
  const endB = h('button', { class:'quit', type:'button', 'aria-label':'End the story and go home', onclick:() => { stopNarr(); home(); } }, icon('x'), h('span', { text:'End' }));
  const body = h('div', { class:'story' });
  function read(){
    put(body, h('div', { class:'storyhead' }, h('div', { class:'eyebrow', text:'📖 CUFFIN’S WORD STORY' }), h('h2', { text:st.t })),
      h('div', { class:'storytext' }, st.p.map(para)),
      h('p', { class:'small muted', text:'Tap a coloured word to hear it.' }),
      h('div', { class:'row', style:'gap:8px' }, h('button', { class:'btn alt small', type:'button', onclick:() => narrateLines([st.t].concat(st.p), 100) }, icon('sound'), 'Read it to me'),
        h('button', { class:'btn small', type:'button', style:'flex:1', onclick:() => { stopNarr(); SND.fx('tap'); quiz(0); } }, qs.length ? 'Questions →' : 'Done')));
    if (S.settings.sound) narrateLines([st.t].concat(st.p), 500);
  }
  const wq = shuffle(words.slice()).slice(0, 3).map(w => ({ w })), cq0 = (STORY_Q[st.t] || []).map((c, i) => ({ c, i }));
  const cq = shuffle(cq0).slice(0, Math.max(0, 5 - wq.length)).sort((a, b) => a.i - b.i);
  const qs = []; for (let i = 0; i < Math.max(wq.length, cq.length); i++){ if (cq[i]) qs.push(cq[i]); if (wq[i]) qs.push(wq[i]); }   // story questions in story order, word meanings in between
  const sentences = (() => { const raw = st.p.join(' ').split(/(?<=[.!?][”"]?)\s+/), out = []; let cur = ''; for (const r of raw){ cur = cur ? cur + ' ' + r : r; const q = (cur.match(/["“”]/g) || []).length; if (q % 2 === 0){ out.push(cur); cur = ''; } } if (cur) out.push(cur); return out; })();
  let got = 0;
  function quiz(i){
    if (i >= qs.length) return finish();
    const Q = qs[i];
    if (Q.c){   // what happened in the story
      const right = Q.c[1], opts = shuffle(Q.c.slice(1));
      const btns = opts.map((o, j) => h('button', { class:'ans', type:'button', onclick:() => {
        btns.forEach((b, k) => { b.disabled = true; if (opts[k] === right) b.classList.add('correct'); });
        const ok = o === right; if (!ok) btns[j].classList.add('wrong');
        if (ok){ got++; S.points += 1; save(); SND.fx('goal'); } else SND.fx('wrong');
        put(nx, h('button', { class:'btn wide', type:'button', onclick:() => { SND.fx('tap'); quiz(i + 1); } }, i + 1 < qs.length ? 'Next question' : 'Finish'));
      } }, h('span', { class:'l', text:'ABCD'[j] }), h('span', { class:'t', text:o }), h('span', { class:'mk' })));
      const nx = h('div');
      put(body, h('div', { class:'storyhead' }, h('div', { class:'eyebrow', text:'📖 STORY QUESTION ' + (i + 1) + ' OF ' + qs.length })),
        h('p', { class:'sentence', style:'font-size:1.05rem', text:Q.c[0] }), h('div', { class:'answers' }, btns), h('div', { class:'grow' }), nx);
      if (S.settings.sound) sayWord(Q.c[0]);
      return;
    }
    const w = Q.w, x = bankItem(w), right = meanOfX(x), sent = sentences.find(s => new RegExp('\\b' + esc(w) + '\\b', 'i').test(s)) || '';
    const wrong = [...new Set(shuffle(allItems().filter(y => norm(y.w) !== norm(w)).map(meanOfX).filter(m => m && m !== right)))].slice(0, 3);
    const opts = shuffle([right].concat(wrong));
    const ix = sent.search(new RegExp('\\b' + esc(w) + '\\b', 'i'));
    const btns = opts.map((o, j) => h('button', { class:'ans', type:'button', onclick:() => {
      btns.forEach((b, k) => { b.disabled = true; if (opts[k] === right) b.classList.add('correct'); });
      const ok = o === right; if (!ok) btns[j].classList.add('wrong');
      if (ok){ got++; S.points += 1; save(); SND.fx('goal'); } else SND.fx('wrong');
      put(nx, h('button', { class:'btn wide', type:'button', onclick:() => { SND.fx('tap'); quiz(i + 1); } }, i + 1 < qs.length ? 'Next question' : 'Finish'));
    } }, h('span', { class:'l', text:'ABCD'[j] }), h('span', { class:'t', text:o }), h('span', { class:'mk' })));
    const nx = h('div');
    put(body, h('div', { class:'storyhead' }, h('div', { class:'eyebrow', text:'📖 STORY QUESTION ' + (i + 1) + ' OF ' + qs.length })),
      h('p', { class:'sentence', style:'font-size:1rem' }, ix >= 0 ? [sent.slice(0, ix), h('b', { class:'swb', text:sent.substr(ix, w.length) }), sent.slice(ix + w.length)] : sent),
      h('p', { class:'muted', text:'In the story, what does “' + w + '” mean?' }), h('div', { class:'answers' }, btns), h('div', { class:'grow' }), nx);
  }
  function finish(){
    stopNarr(); S.stats.stories = (S.stats.stories || 0) + 1; save();
    put(body, h('div', { class:'storyhead' }, h('div', { class:'eyebrow', text:'📖 THE END' }), h('h2', { text:st.t })),
      sayBlock('com', qs.length ? (got === qs.length ? 'All ' + got + ' right. A story-reading puffin. The community is impressed.' : got >= qs.length - 1 ? got + ' out of ' + qs.length + '. Very nearly perfect. I would like that noted.' : got >= 2 ? got + ' out of ' + qs.length + '. Eventually still counts.' : 'Tricky ones. Read it again another day and they will make more sense.') : 'A good story. Mostly true. Partly custard.', IMG.right),
      qs.length ? h('p', { class:'line', text:'+' + got + ' 🐟 fresh fish from the story' }) : null,
      h('div', { class:'grow' }), h('button', { class:'btn kick', type:'button', onclick:() => { SND.fx('tap'); done(); } }, 'Back to the race'));
  }
  mount([h('div', { class:'qbar' }, endB, h('span', { class:'qn', text:'STORY TIME' }), h('div', { class:'tools' }, soundBtns())), h('div', { class:'pitch' }, h('div', { class:'pbody' }, body))], null);
  read();
}

/* ---------- Pie the Mirror: a free daily reward once the day's goal is done ---------- */
const PIE_HIT = ['My FEATHERS! I just had them polished!', 'This is custard CHAOS!', 'I am not crying. That is custard.', 'Mmm… actually, quite nice custard.', 'How DARE you! …Is there any more?', 'My reflection! It’s all yellow!', 'I demand a rematch! And a towel!', 'You’ll be hearing from my lawyer. He’s a crab.', 'Right in the beak!', 'That’s it. I’m telling Giles!', 'Custard in my EAR. Puffins have ears, you know.', 'I meant to do that. Custard is very fashionable.'];
const PIE_MISS = ['Ha! Missed! Too fast, too fabulous!', 'Is that all you’ve got, custard boy?', 'Whoosh! Couldn’t touch me!', 'Nearly! Not really.', 'I’ve seen seagulls throw better.', 'Missed me! The puffin community saw that.'];
/* once a day, free, after the daily goal; a grown-up can give one extra go */
const PIE_HITS = 6, PIE_SECS = 120;
const pieUsed = () => (S.pieN && S.pieN.d === today()) ? S.pieN.n : 0;
const pieAllowed = () => 1 + ((S.pieBonus && S.pieBonus.d === today()) ? S.pieBonus.n : 0);   // 1 a day, plus any extra a grown-up gives
const pieState = () => todayCount() < GOAL ? 'locked' : pieUsed() < pieAllowed() ? 'ready' : 'done';
let PIE_GAME = 0;
function pieGame(){
  screen = 'pies'; SND.loop(false);
  const st0 = pieState();
  const gameId = ++PIE_GAME; let lastThrow = 0;
  let dropT = 0, pies = st0 === 'ready' ? 1e9 : 0, thrown = 0, secs = PIE_SECS, timerT = 0, hits = 0, x = 50, vx = 28, last = performance.now(), raf = 0, over = false, duck = 0;
  const startPies = pies;
  const clock = h('b', { class:'pieclock', text:'2:00' }), score = h('b', { text:'0' });
  const mirror = cimg(MIMG.smug, 'piemirror', 120, 'The Mirror');
  const splats = h('div', { class:'splats' });
  const mbox = h('div', { class:'mbox' }, mirror, splats);
  const bubble = h('div', { class:'piebub', text:'Go on then. I bet you can’t hit me.' });
  const tray = h('div', { class:'pietray', 'aria-hidden':'true', text:'🥧' });
  const arena = h('div', { class:'arena', role:'button', 'aria-label':'Flick or tap to throw a custard pie at the Mirror' }, bubble, mbox, tray);
  const endB = h('button', { class:'quit', type:'button', 'aria-label':'Stop and go home', onclick:() => { if (thrown) finish('end'); else { over = true; cancelAnimationFrame(raf); home(); } } }, icon('x'), h('span', { text:'End' }));
  /* pies are animated by hand every frame (works the same on every phone) */
  const flying = []; let combo = 0;
  const WORDS = ['SPLAT!', 'SPLOSH!', 'KER-SPLAT!', 'GLOOP!', 'SPLODGE!', 'WALLOP!', 'SPLUDGE!'];
  function frame(t){
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    const half = arena.clientWidth ? (mbox.offsetWidth / 2 + 4) / arena.clientWidth * 100 : 18;
    x += vx * dt; if (x < half){ x = half; vx = Math.abs(vx); } if (x > 100 - half){ x = 100 - half; vx = -Math.abs(vx); }
    if (Math.random() < dt * .7) vx = -vx;   // sudden change of direction
    if (duck > 0) duck -= dt;
    mbox.style.left = x + '%'; mbox.classList.toggle('duck', duck > 0);
    for (let i = flying.length - 1; i >= 0; i--){
      const p = flying[i], k = Math.min(1, (t - p.t0) / p.dur);
      const px = p.x0 + (p.x1 - p.x0) * k, py = p.y0 + (p.y1 - p.y0) * k - Math.sin(k * Math.PI) * p.arc;
      p.el.style.transform = 'translate(' + (px - 22) + 'px,' + (py - 22) + 'px) rotate(' + (k * 600) + 'deg) scale(' + (1.25 - .55 * k) + ')';
      if (k >= 1){ flying.splice(i, 1); land(p, px, py); }
    }
    if (!over) raf = requestAnimationFrame(frame);
  }
  function burst(cls, txt, px, py, ms){ const e = h('div', { class:cls, text:txt, style:'left:' + px + 'px;top:' + py + 'px' }); arena.append(e); setTimeout(() => e.remove(), ms || 1100); return e; }
  function droplets(px, py){ for (let i = 0; i < 10; i++){ const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 50; const e = h('i', { class:'drop', style:'left:' + px + 'px;top:' + py + 'px;--dx:' + Math.round(Math.cos(a) * d) + 'px;--dy:' + Math.round(Math.sin(a) * d) + 'px' }); arena.append(e); setTimeout(() => e.remove(), 800); } }
  function land(p, px, py){
    p.el.remove(); if (over) return;
    const r = arena.getBoundingClientRect(), m = mirror.getBoundingClientRect();
    const mx = m.left - r.left, my = m.top - r.top, pad = 22;
    const hit = duck <= 0 && px > mx - pad && px < mx + m.width + pad && py > my - pad && py < my + m.height + pad;
    if (hit){
      hits++; combo++; score.textContent = String(hits); S.stats.splats = (S.stats.splats || 0) + 1;
      const dropped = S.race.mf > 0; if (dropped){ S.race.mf -= 1; dropT++; }   // a splat knocks a fish out of his flipper (if he has one)
      const sp = h('i', { class:'splat', style:'left:' + Math.max(10, Math.min(90, Math.round(((px - mx) / m.width) * 100))) + '%;top:' + Math.max(10, Math.min(90, Math.round(((py - my) / m.height) * 100))) + '%' });
      splats.append(sp); if (splats.children.length > 7) splats.firstChild.remove();
      burst('splatword', pickOne(WORDS), px, py - 30); droplets(px, py);
      if (dropped) burst('fishpop', '−1 🐟', mx + m.width / 2, my);
      if (combo >= 2) burst('combo', combo === 2 ? 'DOUBLE SPLAT!' : combo === 3 ? 'TRIPLE SPLAT!' : 'CUSTARD-TASTROPHE! ×' + combo, r.width / 2, r.height * .62);
      arena.classList.remove('shake'); void arena.offsetWidth; arena.classList.add('shake');
      mbox.classList.remove('hitwob'); void mbox.offsetWidth; mbox.classList.add('hitwob');
      put(bubble, pickOne(PIE_HIT)); bubble.classList.add('hit'); mirror.src = MIMG.sad;
      SND.fx('custard'); if (combo >= 2) SND.fx('cheer');
      if (hits % 3 === 1 && Math.random() < .7){ const v = VOICE.pick('m04', 'm05', 'm07'); if (v) VOICE.play(v); }
      vx = (vx > 0 ? 1 : -1) * Math.min(80, Math.abs(vx) + 5);   // he gets faster
      if (Math.random() < .3) duck = .55;   // and starts ducking
      clearTimeout(p.reset);
      if (hits >= PIE_HITS){ save(); return knockout(); }
      setTimeout(() => { if (!over) { mirror.src = MIMG.smug; bubble.classList.remove('hit'); } }, 1000);
      save();
    } else {
      combo = 0;
      burst('plop', 'plop', px, py); const g = h('i', { class:'groundsplat', style:'left:' + px + 'px;top:' + py + 'px' }); arena.append(g); setTimeout(() => g.remove(), 1400);
      put(bubble, pickOne(PIE_MISS)); SND.fx('wrong');
    }
  }
  /* six splats: the Mirror keels over, and that's pies for today */
  function knockout(){
    if (over) return; over = true; cancelAnimationFrame(raf); clearInterval(timerT); endB.disabled = true;
    flying.forEach(p => p.el.remove()); flying.length = 0;
    mirror.src = MIMG.sad; mbox.classList.add('ko'); arena.classList.remove('shake'); void arena.offsetWidth; arena.classList.add('shake');
    mbox.append(h('div', { class:'kostars', 'aria-hidden':'true', text:'💫 ⭐ 💫' }));
    burst('kobig', 'K.O.!', arena.clientWidth / 2, arena.clientHeight * .4, 2500);
    put(bubble, pickOne(['I’ll… be… back… tomorrow…', 'Tell my reflection… I loved it…', 'Is it… bath time… now?', 'Custard… everywhere… so… yellow…']));
    SND.fx('cheer'); const v = VOICE.pick('m07', 'm04'); if (v) setTimeout(() => VOICE.play(v), 500);
    setTimeout(() => results('ko'), 2600);
  }
  function tick(){
    if (over) return; secs--; clock.textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
    if (secs === 15) clock.classList.add('low');
    if (secs <= 0){ clearInterval(timerT); put(bubble, 'Ha! Time’s up! Saved by the bell!'); setTimeout(() => finish('time'), 900); over = true; cancelAnimationFrame(raf); }
  }
  function launch(tx, ty){
    if (over || pies <= 0) return;
    const r = arena.getBoundingClientRect();
    if (thrown === 0){ timerT = setInterval(tick, 1000); }
    if (performance.now() - lastThrow < 220) return; lastThrow = performance.now();   // no machine-gunning
    if (thrown === 0){ S.pieN = { d:today(), n:pieUsed() + 1 }; S.pieDay = today(); save(); }   // the session counts from the first pie
    pies--; thrown++;
    S.stats.pies = (S.stats.pies || 0) + 1;
    const el = h('div', { class:'pie', text:'🥧' }); arena.append(el);
    const x0 = r.width / 2, y0 = r.height - 34, dist = Math.hypot(tx - x0, ty - y0);
    flying.push({ el, x0, y0, x1:tx, y1:ty, t0:performance.now(), dur:Math.max(320, Math.min(620, dist * 1.3)), arc:Math.min(90, dist * .25) });
    SND.fx('flip');
  }
  /* tap where you want it to land, or flick the pie towards the Mirror. Finger (touch) and mouse/pen (pointer) are both read; whichever comes first wins */
  let start = null, lastTouch = 0;
  const begin = (cx, cy) => { const r = arena.getBoundingClientRect(); start = { x:cx - r.left, y:cy - r.top }; };
  const finishThrow = (cx, cy) => {
    if (!start) return;
    const r = arena.getBoundingClientRect(), ex = cx - r.left, ey = cy - r.top, dx = ex - start.x, dy = ey - start.y;
    const m = mirror.getBoundingClientRect(), targetY = m.top - r.top + m.height / 2;
    let tx = ex, ty = ey;
    if (Math.hypot(dx, dy) > 20 && dy < -8 && start.y > targetY + 20){ const k = (targetY - start.y) / dy; tx = start.x + dx * k; ty = targetY; }   // a flick from below: carry on in that direction up to the Mirror
    else if (start.y > r.height - 110){ tx = start.x; ty = targetY; }                                                    // a tap on the pie at the bottom: throw straight up
    start = null; launch(Math.max(10, Math.min(r.width - 10, tx)), Math.max(10, ty));
  };
  arena.addEventListener('touchstart', ev => { if (ev.cancelable) ev.preventDefault(); lastTouch = Date.now(); const t = ev.changedTouches[0]; begin(t.clientX, t.clientY); }, { passive:false });
  arena.addEventListener('touchmove', ev => { if (ev.cancelable) ev.preventDefault(); lastTouch = Date.now(); }, { passive:false });
  arena.addEventListener('touchend', ev => { if (ev.cancelable) ev.preventDefault(); lastTouch = Date.now(); const t = ev.changedTouches[0]; finishThrow(t.clientX, t.clientY); }, { passive:false });
  arena.addEventListener('touchcancel', () => { start = null; });
  arena.addEventListener('pointerdown', ev => { if (Date.now() - lastTouch < 800 || ev.pointerType === 'touch') return; ev.preventDefault(); begin(ev.clientX, ev.clientY); });
  arena.addEventListener('pointerup', ev => { if (Date.now() - lastTouch < 800 || ev.pointerType === 'touch') return; ev.preventDefault(); finishThrow(ev.clientX, ev.clientY); });
  document.documentElement.classList.add('noscroll');
  const t = setInterval(() => { if (!arena.isConnected){ clearInterval(t); if (PIE_GAME === gameId) document.documentElement.classList.remove('noscroll'); } }, 200);   // only the latest game unlocks scrolling
  function finish(why){ over = true; cancelAnimationFrame(raf); clearInterval(timerT); results(why); }
  function results(why){
    if (results.done) return; results.done = true; raceFix(); save();
    const nb = checkBadges(); if (nb.length) save();
    const res = h('div', { class:'pieres' },
      h('div', { class:'eyebrow', text: why === 'ko' ? 'KNOCKOUT!' : 'SPLAT-O-METER' }), h('div', { class:'piebig', text: why === 'ko' ? '💫 K.O. 💫' : hits + ' / ' + thrown }),
      h('p', { class:'line', text: hits === 0 ? (thrown ? 'Not one splat. The Mirror is unbearable now.' : 'No pies thrown. The Mirror looks relieved.') : (dropT ? 'The Mirror dropped ' + dropT + ' fish and needs a very long bath.' : 'Splat! He has no fish left to drop, but he needs a very long bath.') }),
      sayBlock('com', why === 'ko' ? 'Six splats. He is having a little lie down. Pies again tomorrow, after your words.' : hits ? 'Custard justice has been served. More pies tomorrow, after your words.' : 'We will practise. Pies again tomorrow, after your words.', IMG.right),
      nb.length ? h('p', { class:'note' }, '🏅 New badge: ' + nb.map(b => b.n).join(', ')) : null,
      h('div', { class:'grow' }), h('button', { class:'btn kick', type:'button', onclick:() => { SND.fx('tap'); home(); } }, 'Back to the race'));
    mount([h('div', { class:'qbar' }, h('span', { class:'qn', text:'PIE THE MIRROR' }), h('div', { class:'tools' }, soundBtns())), h('div', { class:'pitch' }, h('div', { class:'pbody' }, res))], null);
    if (hits) SND.fx('cheer');
  }
  if (!startPies){
    const n = todayCount(), locked = st0 === 'locked';
    mount([h('div', { class:'qbar' }, h('span', { class:'qn', text:'PIE THE MIRROR' }), h('div', { class:'tools' }, soundBtns())), h('div', { class:'pitch' }, h('div', { class:'pbody' },
      sayBlock('com', locked ? 'Words first, custard second. Finish today’s goal and the pies are ready.' : 'The Mirror is still lying down after today’s custard. Pies again tomorrow, after your words.', locked ? IMG.ask : IMG.right),
      locked ? h('p', { class:'line', text:'Today’s goal: ' + Math.min(n, GOAL) + ' of ' + GOAL + ' answers. ' + (GOAL - n) + ' to go!' }) : h('p', { class:'line', text:'💫 Today’s pie session is done.' }),
      h('div', { class:'grow' }), h('button', { class:'btn kick', type:'button', onclick:() => locked ? startRound('mixed') : home() }, locked ? '⚽ KICK OFF' : 'Back to the race'),
      locked ? h('button', { class:'btn alt wide', type:'button', onclick:() => home() }, 'Home') : null))], null);
    return;
  }
  mount([h('div', { class:'qbar' }, endB, h('span', { class:'qn' }, '⏱ ', clock, ' · SPLATS ', score, '/' + PIE_HITS), h('div', { class:'tools' }, soundBtns())),
    h('div', { class:'say' }, cimg(IMG.right, '', 44, 'Cuffin'), h('div', { class:'bub' }, h('div', { class:'nm', text:'Cuffin' }), h('p', { class:'tx', text:'Your reward for today’s words! Flick pies at the Mirror. Six splats and he’s down. You have 2 minutes!' }))), arena], null);
  raf = requestAnimationFrame(frame);
}

/* ---------- Grown-ups → Check words: test Aaron on his mastered words, tap any he has forgotten ---------- */
let checkHide = false;
function checkPanel(){
  const STEP_NAME = { w2m:'pick the meaning', m2w:'pick the word', sim:'similar & opposite', gap:'fill the gap', spell:'spell it', scram:'unscramble', hear:'hear & spell', pre:'pick the start', say:'say it' };
  const mean = x => x.card ? info(x.w).m : x.m, all = allItems();
  const box = h('div');
  const row = x => {
    const p = (S.practice || {})[pk(x)], prac = !!(p && p.on), st = prac ? (p.st || 0) : 0, steps = pracSteps(x);
    const status = prac ? '🔁 Practising · step ' + (st + 1) + ' of ' + PRAC_STEPS + ': ' + STEP_NAME[steps[st]] + (p.d === today() ? ' (next go tomorrow)' : '') : '';
    return h('button', { type:'button', class:'wl ck' + (prac ? ' on' : ''), 'aria-pressed':String(prac), onclick:() => { SND.fx('tap'); setPractice(x, !prac); draw(); const tb = [...document.querySelectorAll('.subtabs button')].find(b => /^Check words/.test(b.textContent)); if (tb) tb.textContent = 'Check words' + (all.some(pracOn) ? ' 🔁' : ''); } },
      h('div', { style:'min-width:0;text-align:left' }, h('b', { text:x.w }), checkHide && !prac ? null : h('span', { class:'small muted', text:(mean(x) || '') }), status ? h('span', { class:'small ckst', text:status }) : null),
      h('span', { class:'ckmark', text: prac ? '🔁' : '＋' }));
  };
  function draw(){
    const on = all.filter(pracOn), mastered = all.filter(x => isMasteredRec(peek(x)) || pracOn(x)).sort((a, b) => a.w.localeCompare(b.w));
    const done = all.filter(x => { const p = (S.practice || {})[pk(x)]; return p && !p.on && p.done && daysSince(p.done) <= 14; });
    put(box,
      h('p', { class:'small', text:'Test Aaron on his mastered words. Tap any he’s forgotten to mark it 🔁 for practice. Tap again to unmark it.' }),
      h('p', { class:'small muted', text:'A marked word still counts as mastered. Up to 3 come back at the start of each match, mixed in with no label. He re-proves each one in 3 steps, one a day: pick the meaning, then pick the word, then the harder one (similar & opposite for card words, otherwise fill the gap or spelling). A miss drops it back a step.' }),
      h('label', { class:'row small', style:'gap:8px;align-items:center' }, h('input', { type:'checkbox', checked:checkHide, onchange:e => { checkHide = e.target.checked; draw(); } }), h('span', { text:'Hide meanings while testing' })),
      on.length ? [h('h3', { class:'ih', text:'🔁 Practising (' + on.length + ')' }), h('p', { class:'small', text:on.map(x => x.w + ' (step ' + Math.min(PRAC_STEPS, ((S.practice[pk(x)] || {}).st || 0) + 1) + ' of ' + PRAC_STEPS + ')').join(', ') })] : null,
      done.length ? [h('h3', { class:'ih', text:'✅ Re-proven in the last 2 weeks' }), h('p', { class:'small', text:done.map(x => x.w).join(', ') })] : null,
      h('h3', { class:'ih', text:'Mastered words (' + mastered.length + ')' }),
      mastered.length ? h('div', { class:'wlist', style:'max-height:none' }, mastered.map(row)) : h('p', { class:'small muted', text:'No mastered words yet.' }));
  }
  draw();
  return box;
}

/* ---------- Stop the Rabbit: his words are their own challenge ---------- */
const rabbitLockedNow = () => rabbitAllDone();
function checkRabbitLock(){
  const pk = SCHOOL_PACKS[SCHOOL_PACKS.length - 1];
  if (pk && rabbitAllDone() && (!S.rabbitLock || S.rabbitLock.d !== pk.d)){ S.rabbitLocks = (S.rabbitLocks || 0) + 1; S.rabbitLock = { d:pk.d, on:today(), party:true }; const nb = checkBadges(); if (nb.length && R) R.newBadges = (R.newBadges || []).concat(nb); }
}
const RABBIT_TROPHIES = [
  { id:'rt1', name:'Carrot Medal', d:'Master 5 Rabbit words', svg:1, t:() => rabbitMastered() >= 5 },
  { id:'rt2', name:'Gate Shield', d:'Lock the Rabbit out of the community', svg:4, t:() => (S.rabbitLocks || 0) >= 1 },
  { id:'rt3', name:'Golden Carrot Cup', d:'Win 100 carrots back from the Rabbit', svg:6, t:() => (S.carrots || 0) >= 100 },
  { id:'rt4', name:'Rabbit-Proof Cup', d:'Lock the Rabbit out 3 times', svg:8, t:() => (S.rabbitLocks || 0) >= 3 },
];
function newRabbitTrophies(){
  S.rtrophy = S.rtrophy || {};
  const out = RABBIT_TROPHIES.filter(t => !S.rtrophy[t.id] && t.t());
  out.forEach(t => S.rtrophy[t.id] = today());
  if (out.length) save();
  return out;
}
function rabbitTrophyEl(t, state){
  const sp = h('span', { class:'tsv', 'aria-hidden':'true' });
  const vars = state === 'locked' ? '' : '--m:#FF9A3C;--d:#C4590F;--w:#FFFFFF;--r1:#3BA55C;--r2:#F07A1A';
  sp.innerHTML = '<svg viewBox="0 0 64 64" style="' + vars + '">' + TROPHY_SVG[t.svg] + '</svg>';   // constant markup, no user text
  return sp;
}
/* how close the Rabbit is to the gate: one step per Rabbit word not yet mastered */
function rabbitGate(compact){
  const tot = rabbitItems().length, done = rabbitMastered(), left = tot - done, locked = tot > 0 && left === 0;
  const pct = tot ? Math.round(100 * left / tot) : 0;
  const track = h('div', { class:'rgtrack', role:'img', 'aria-label': locked ? 'The Rabbit is locked out' : 'The Rabbit is ' + left + ' steps from the gate' },
    h('span', { class:'rgburrow', 'aria-hidden':'true', text:'🕳️' }), h('div', { class:'rgline' }, h('span', { class:'rgbun', style:'left:calc(' + (locked ? 0 : pct) + '% - 14px)', text:'🐰' })), h('span', { class:'rggate', 'aria-hidden':'true', text: locked ? '🔒' : '🚪' }));
  const txt = locked ? 'Gate locked! The Rabbit is out, for now.' : left + ' Rabbit word' + (left === 1 ? '' : 's') + ' to master to lock him out';
  return compact ? h('div', { class:'rgate compact' }, track, h('span', { class:'small', text:txt })) : h('div', { class:'rgate' }, track, h('p', { class:'small', text:txt }));
}
function rabbitSummary(x){
  screen = 'summary';
  const r = x.round, missed = [...new Set(r.missed)], locked = rabbitAllDone();
  SND.tune(r.firstTry >= r.total / 2 ? 'win' : 'lose');
  const extra = [x.badges.length ? '🏅 New badge: ' + x.badges.map(b => b.n).join(', ') : null, r.carrotBonus ? '⭐ Perfect! +' + r.carrotBonus + ' bonus carrots' : null].filter(Boolean);
  mount([
    topbar(),
    h('div', { class:'led', role:'group', 'aria-label':'Full time' },
      h('div', { class:'lhead' }, h('span', { class:'live' }, h('i'), 'FULL TIME'), h('b', { text: locked ? 'RABBIT LOCKED OUT' : 'STOP THE RABBIT' })),
      h('div', { class:'lgrid' },
        h('div', { class:'lside me' }, cimg(IMG.right, 'ava', 82, ''), h('div', { class:'digits' }, '+' + (r.carrots || 0), h('small', { text:'🥕' }))),
        h('div', { class:'lmid' }, h('div', { class:'vs', text:'VS' }), h('div', { class:'lead', text:'🥕 ' + (S.carrots || 0) + ' won back' })),
        h('div', { class:'lside mir' }, h('span', { class:'rabbitface', style:'width:82px;height:82px;border-radius:50%;font-size:3rem !important', 'aria-hidden':'true', text:'🐰' }), h('div', { class:'digits' }, String(missed.length), h('small', { text:'😈' }))))),
    rabbitGate(true),
    h('div', { class:'stat4' },
      h('div', { class:'st' }, h('div', { class:'k', text:'RIGHT FIRST TIME' }), h('div', { class:'v', text:r.firstTry + '/' + r.total }), h('div', { class:'d', text:'⭐'.repeat(x.stars) || 'Keep going' })),
      h('div', { class:'st' }, h('div', { class:'k', text:'LOCKED IN' }), h('div', { class:'v', text:String(r.mastered.length) }), h('div', { class:'d', text:r.mastered.slice(0, 2).join(', ') })),
      h('div', { class:'st' }, h('div', { class:'k', text:'TO LOOK AT AGAIN' }), h('div', { class:'v', text:String(missed.length) }), h('div', { class:'d', style:'color:var(--miss)', text:missed.slice(0, 2).join(', ') }))),
    extra.length ? h('div', { class:'note' }, h('span', { text:extra.join(' · ') })) : sayBlock('com', locked ? 'Gate locked. Not today, Rabbit. Not today.' : r.firstTry === r.total ? 'Every one right. The Rabbit is sulking behind a rock.' : 'Good. Every carrot we win back is one he cannot eat.', IMG.right),
    h('div', { class:'grow' }),
    h('button', { class:'btn kick rabbitbtn', type:'button', onclick:() => startRound('rabbit') }, '🐰 AGAIN'),
    h('div', { class:'homerow' }, h('button', { class:'btn alt small', type:'button', onclick:() => home() }, 'Home'), h('button', { class:'btn alt small', type:'button', onclick:() => trophies() }, 'Trophies'))
  ], 'home');
}


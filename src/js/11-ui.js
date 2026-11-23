/* ---------- shared UI ---------- */
const root = $('#root');
let screen = 'home';
const SCREENS = {};
let sheetEl = null;
function closeSheet(){ if (typeof NARR !== 'undefined' && NARR.on) stopNarr(); if (sheetEl){ sheetEl.forEach(e => e.remove()); sheetEl = null; } const a = root.querySelector('.app'); if (a) a.style.paddingBottom = ''; }
function mount(nodes, tab){
  closeSheet();
  put(root, h('div', { class:'app' }, nodes));
  const bar = $('#tabbar'); bar.hidden = !tab;
  bar.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-current', b.dataset.t === tab ? 'page' : 'false'));
}
/* a bottom sheet; withScrim for menus, without for the answer panel (the question stays visible above it) */
function openSheet(kids, withScrim, pad){
  closeSheet();
  const sh = h('div', { class:'sheet', role:'dialog', 'aria-modal': withScrim ? 'true' : 'false', 'aria-label': withScrim ? 'Menu' : 'Result' }, h('div', { class:'grab', 'aria-hidden':'true' }), kids);
  const els = [sh];
  if (withScrim){ const sc = h('div', { class:'scrim', onclick:closeSheet }); els.unshift(sc); }
  document.body.append(...els); sheetEl = els;
  if (pad) requestAnimationFrame(() => { const a = root.querySelector('.app'); if (a) a.style.paddingBottom = (sh.offsetHeight + 8) + 'px'; });
  return sh;
}
/* shrink-to-fit: if a screen is taller than the phone (real fonts, notch and home bar), step down through tighter layouts */
function fitApp(){
  const a = root.querySelector('.app'); if (!a) return;
  fitWords(document);
  if (a.style.paddingBottom) return;   // a result sheet is open and the page scrolls above it on purpose: keep the current layout
  const over = () => a.scrollHeight > a.clientHeight + 1 || a.scrollWidth > a.clientWidth + 1 || [...a.querySelectorAll('.homemid,.pbody,.pitch,.panel:not(.grow)')].some(e => e.scrollHeight > e.clientHeight + 1);
  a.classList.remove('fit1', 'fit2', 'fit3');
  for (const l of [1, 2, 3]){ if (!over()) break; a.classList.add('fit' + l); }
}
/* big single words (STOP card, celebrations, question words): shrink the font until the word fits on one line */
function fitWords(scope){
  scope.querySelectorAll('.bw, .celword, .word').forEach(el => {
    el.style.fontSize = ''; el.style.whiteSpace = 'nowrap';
    const box = el.parentElement && el.parentElement.classList.contains('wordrow') ? el.parentElement : el;
    let n = 0, fs = parseFloat(getComputedStyle(el).fontSize);
    while (n++ < 14 && (box.scrollWidth > box.clientWidth + 1 || el.scrollWidth > el.clientWidth + 1)){ fs *= .93; el.style.fontSize = fs + 'px'; }
  });
}
let fitRAF = 0;
const fitSoon = () => { cancelAnimationFrame(fitRAF); fitRAF = requestAnimationFrame(fitApp); };
new MutationObserver(fitSoon).observe(root, { childList:true, subtree:true });
window.addEventListener('resize', fitSoon);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSoon);
function toast(t){ const e = h('div', { class:'toast', role:'status', text:t }); put($('#toastbox'), e); setTimeout(() => { if (e.parentNode) e.remove(); }, 2600); }
const cimg = (src, cls, size, alt) => h('img', { class:cls || '', src, alt:alt || '', width:size, height:size, decoding:'async' });
function topbar(){
  const chip = h('span', { class:'sync', id:'syncchip', 'aria-live':'polite' }); drawSync(chip);
  return h('div', { class:'topbar' },
    h('div', { class:'brand' }, cimg(IMG.hello, '', 30, ''), h('span', {}, 'CUFFIN ', h('b', { class:'v', text:'v' }), ' ', h('b', { class:'m', text:'MIRROR' }))),
    h('div', { class:'tools' }, chip, soundBtns()));
}
function sayBlock(kind, line, img){
  const nm = kind === 'rival' ? 'The Mirror' : kind === 'kid' ? S.name : 'Cuffin';
  return h('div', { class:'say ' + kind },
    kind === 'kid' ? h('div', { class:'kidface', 'aria-hidden':'true', text:(S.name || 'A')[0].toUpperCase() }) : cimg(img || (kind === 'rival' ? MIMG.ask : IMG.hello), '', 52, kind === 'rival' ? 'The Mirror' : 'Cuffin'),
    h('div', { class:'bub' }, h('div', { class:'nm', text:nm }), h('p', { class:'tx', text:line })));
}
function crownSvg(cls){
  const s = document.createElementNS(SVGNS, 'svg'); s.setAttribute('class', cls || ''); s.setAttribute('aria-hidden', 'true'); s.setAttribute('viewBox', '0 0 24 24');
  const u = document.createElementNS(SVGNS, 'use'); u.setAttribute('href', '#i-crown'); s.append(u); return s;
}
/* the LED scoreboard */
let lastBoard = null;
function led(mini, label){
  const T = mainItems().length, aM = masteredCount(), A = S.points, M = S.race.mf, mm = S.race.mm, d = A - M;
  const segs = m => h('div', { class:'segs', 'aria-hidden':'true' }, Array.from({ length:10 }, (_, i) => h('i', { class: i < Math.max(m > 0 ? 1 : 0, Math.round(10 * m / Math.max(1, T))) ? 'on' : '' })));
  const bumpA = lastBoard && lastBoard.A !== A, bumpM = lastBoard && lastBoard.M !== M;
  const side = (who, img, name, fish, m, bump) => {
    const dg = h('div', { class:'digits' + (bump ? ' bump' : '') }, String(fish), h('small', { text:'🐟' }));
    const wc = h('div', { class:'wc', text: m + '/' + T + ' words' });
    const al = who === 'me' && !mini ? h('div', { class:'wc almost', text:'⭐ ' + almostCount() + ' almost' }) : null;
    return h('div', { class:'lside ' + who }, mini ? [cimg(img, 'ava', 38, ''), h('div', { class:'lcol' }, dg, segs(m), wc)] : [h('div', { class:'who', text:name }), cimg(img, 'ava', 82, ''), dg, segs(m), wc, al]);
  };
  lastBoard = { A, M };
  const lead = d > 0 ? 'CUFFIN +' + d : d < 0 ? 'MIRROR +' + (-d) : 'LEVEL';
  const pots = h('span', { class:'pots', title:'Pots of custard and carrots' }, '🍮 ' + (S.custard || 0) + ((S.carrots || S.school) ? '  🥕 ' + (S.carrots || 0) : ''));
  return h('div', { class:'led' + (mini ? ' mini' : ''), role:'group', 'aria-label':'Scoreboard: Cuffin and ' + S.name + ' ' + A + ' fish, ' + aM + ' words, ' + (S.custard || 0) + ' pots of custard. The Mirror ' + M + ' fish, ' + mm + ' words.' },
    mini ? null : h('div', { class:'lhead' }, h('span', { class:'live' }, h('i'), 'CHAPTER ' + matchDay()), pots, h('b', { text:label || 'RACE FOR LEADER' })),
    h('div', { class:'lgrid' },
      side('me', d >= 0 ? IMG.right : IMG.ask, 'CUFFIN', A, aM, bumpA),
      h('div', { class:'lmid' }, h('div', { class:'vs', text:'VS' }), h('div', { class:'lead', text:lead }), mini ? (label ? h('div', { class:'lead', text:label }) : pots) : null),
      side('mir', d < 0 ? MIMG.smug : d > 3 ? MIMG.sad : MIMG.ask, 'MIRROR', M, mm, bumpM)));
}

/* ---------- a question ---------- */
function question(){
  if (R.idx >= R.queue.length) return finishRound();
  R.lastCarrot = 0;
  screen = 'round';
  const item = R.queue[R.idx];
  const q = makeQuestion(item); item.lastType = q.type;
  const hintsOn = !!S.settings.hints;
  let done = false, hinted = false;
  const boardBox = h('div', { style:'flex:none' });
  const pipsEl = h('div', { class:'pips', 'aria-hidden':'true' });
  const qn = h('span', { class:'qn' });
  const body = h('div', { class:'pbody' });
  const strip = h('div', { class:'strip' });
  const refresh = () => { roundRec(false); S.last = today(); snapshot(); save(); put(boardBox, led(true, (R.idx + 1) + '/' + R.queue.length)); drawPips(); };
  function drawPips(){
    put(pipsEl, R.queue.map((it, i) => h('i', { class: i === R.idx ? 'now' : R.results[i] === 'ok' ? 'ok' : R.results[i] === 'bad' ? 'no' : '' })));
    qn.textContent = (R.idx + 1) + '/' + R.queue.length;
  }
  const setStrip = (cls, label) => put(strip, h('span', { text:label }), hintsOn ? null : h('span', { class:'tm', text:'TEST MODE' }), item.retry ? h('span', { class:'tm', text:'SECOND GO' }) : null) || (strip.className = 'strip ' + (cls || ''));
  const cue = line => h('div', { class:'cue' }, cimg(IMG.ask, '', 30, ''), h('span', { text:line }));
  const goNext = () => { closeSheet(); R.idx++; question(); };
  const lastQ = () => R.idx >= R.queue.length - 1;
  const mtag = () => h('span', { class:'mtag', text:'MIRROR' });
  const hintBtn = (label, fn) => hintsOn ? h('button', { class:'hintbtn', type:'button', onclick:e => { if (done) return; hinted = true; SND.fx('peek'); e.currentTarget.remove(); fn(); } }, icon('bulb'), label) : null;
  const RABBIT_MISS = ['Oi! That was MY carrot.', 'Grr. Lucky guess.', 'Hmph. I meant to drop that one.', 'No fair. You’ve been practising.', 'My carrots! Give them back!', 'I’ll get you next time. Probably.'];
  const RABBIT_GLOAT = ['Hee hee. Told you they were tricky.', 'Snigger. One step closer to the gate.', 'Ha! That one’s mine.', 'Hee hee. Carrot for me.', 'Oops! The gate creaks open a little.'];
  function mirrorTurn(guessFor){
    if (R.kind === 'rabbit') return { sat:true, rab:true };   // the Mirror sits out the Rabbit match
    if (item.retry) return { sat:true };
    const t = mirrorTry(mirrorGain(q.type)); R.mfish += t.fish; mirrorMastery(t.ok);
    return { ok:t.ok, fish:t.fish, guess:guessFor(t.ok) };
  }
  function mirrorLine(mir){ if (mir.rab) return null; if (mir.sat) return msay('sitout'); if (Math.random() < .25) return msay(raceLine()); return msay(mir.ok ? 'right' : 'wrong'); }
  function noteFor(lock, custard){
    const n = [];
    if (custard) n.push(h('div', { class:'note custard' }, h('span', { class:'wobble', style:'font-size:1.3rem', text:'🍮' }), h('span', { text:'Five in a row! A pot of custard for the team.' })));
    if (R && R.lastCarrot) n.push(h('div', { class:'note carrot' }, h('span', { class:'wobble', style:'font-size:1.3rem', text:'🥕' }), h('span', { text: R.lastCarrot > 1 ? 'Rabbit word MASTERED! A whole bunch of ' + R.lastCarrot + ' carrots won back from the Rabbit.' : '+1 carrot won back from the Rabbit!' })));
    const txt = { mastered:q.w.w + ' is MASTERED. Locked in.', day:'3 in a row! Get it right on another day to lock it in.', type:'3 in a row! Now get it right in a different kind of question.',
      needsim:'3 in a row! Beat this card in a similar & opposite question to master it.', wobble:'Was mastered. Get it right next time to keep it.', hint:'Hint used: fish yes, mastery no.' }[lock];
    if (txt) n.push(h('div', { class:'note' }, icon(lock === 'hint' ? 'bulb' : 'lock'), h('span', { text:txt })));
    return n;
  }
  /* the answer sheet */
  function resultSheet(o){
    if (o.ok) SND.fx(o.custard ? 'custard' : 'goal'); else SND.fx('wrong');
    const mir = o.mir;
    let cv = null, mv = null;
    const dNow = S.points - S.race.mf, drama = raceDrama(R.lastD == null ? dNow : R.lastD, dNow); R.lastD = dNow;
    if (drama){ cv = VOICE.pick(drama.voice); if (drama.voice2) mv = VOICE.pick(drama.voice2); if (cv) o.line = VO[cv]; }
    else if (o.custard) cv = VOICE.pick('c09');
    else if (o.lock === 'mastered') cv = null;
    else if (Math.random() < 1 / 3) cv = o.ok ? VOICE.pick('c05', 'c06') : VOICE.pick('c07', 'c08');
    if (mir && !mir.sat && !drama){
      if (o.custard && Math.random() < .5) mv = VOICE.pick('m06');
      else if (!cv && Math.random() < .25) mv = mir.ok ? VOICE.pick('m02', 'm03') : VOICE.pick('m04', 'm05');
    }
    if (cv && !drama){ o.line = VO[cv]; } if (cv){ setTimeout(() => VOICE.play(cv), 1000); }
    if (mv) setTimeout(() => VOICE.play(mv), cv ? 1200 : 1000);
    if (mir && !mir.sat && !mv) setTimeout(() => SND.fx(mir.ok ? 'mRight' : 'mWrong'), 900);
    const goOn = o.lock === 'mastered' ? () => { closeSheet(); celebrateMastered(q.w, o.next); } : o.next;
    const nb = h('button', { class:'btn wide', type:'button', onclick:() => { SND.fx('tap'); goOn(); } }, o.nextLabel);
    openSheet([
      h('div', { class:'res ' + (o.ok ? 'ok' : 'no'), role:'status' }, o.ok ? h('span', { style:'font-size:2rem', 'aria-hidden':'true', text:'⚽' }) : h('span', { class:'plate', 'aria-hidden':'true', text:'🍽️' }),
        h('div', {}, h('div', { class:'big', text: o.ok ? 'GOAL!' : 'OFF THE POST' }), h('div', { class:'small muted', text: R.kind === 'rabbit' ? (o.ok ? (R.lastCarrot ? 'Carrot snatched back from the Rabbit!' : 'Right! (No carrot with a hint.)') : 'The Rabbit sniggers. Eventually still counts.') : o.ok ? 'Fresh fish!' : 'No fish this time. Eventually still counts.' })),
        h('div', { class:'fish', text: R.kind === 'rabbit' ? '+' + (R.lastCarrot || 0) + ' 🥕' : '+' + (o.fish || 0) + ' 🐟' })),
      drama ? h('div', { class:'news', role:'status' }, h('b', { text:drama.title }), h('span', { text:drama.text })) : null,
      o.answer || null,
      o.book ? h('div', { class:'note custard' }, h('span', { 'aria-hidden':'true', text:'📓' }), h('b', { text:'Next: write it in your vocabulary book.' })) : null,
      o.line ? h('p', { class:'line', text:o.line }) : null,
      noteFor(o.lock, o.custard),
      mir && mir.rab ? h('div', { class:'mline' }, h('span', { class:'rabbitface mini', 'aria-hidden':'true', text:'🐰' }), h('div', { style:'min-width:0' }, h('b', { text:'The Rabbit: ' }), h('span', { class:'q', text: pickOne(o.ok ? RABBIT_MISS : RABBIT_GLOAT) }))) :
      mir ? h('div', { class:'mline' }, cimg(mir.sat || !mir.ok ? MIMG.sad : MIMG.smug, '', 34, 'The Mirror'),
        h('div', { style:'min-width:0' }, mir.sat ? h('b', { text:'Mirror sits this one out. ' }) : h('span', {}, h('b', { text:'Mirror: ' }), '“' + mir.guess + '” ' + (mir.ok ? '✓ +' + mir.fish + ' 🐟 ' : '✗ ')),
          h('span', { class:'q', text: mv ? VO[mv] : drama && drama.mline ? drama.mline : o.custard && !mir.sat ? pickOne(MCUSTARD) : mirrorLine(mir) }))) : null,
      nb], false);
    setTimeout(() => nb.focus({ preventScroll:true }), 60);
    R.keys = e => { if (e.key === 'Enter' && document.activeElement !== nb) nb.click(); };
  }
  /* "I'm stuck": counts as a miss, shows the answer, then on to the book */
  /* a big unmissable OPPOSITE warning before every opposite question */
  function oppFlash(w, rev){
    const ov = h('div', { class:'oppflash', role:'alert', onclick:() => ov.remove() },
      h('div', { class:'ofin' }, h('div', { class:'ofarrows', 'aria-hidden':'true', text:'⬅️ ↔️ ➡️' }), h('div', { class:'oftitle', text:'OPPOSITE!' }),
        h('div', { class:'ofsub' }, rev ? 'Find the card word that means the OPPOSITE of ' : 'Find the word that means the OPPOSITE of ', h('b', { text:w }))));
    document.body.append(ov);
    if (S.settings.sound) sayWord('Opposite!');
    setTimeout(() => ov.remove(), 1500);
  }
  function stuckBtn(fn){ return h('button', { class:'stuck', type:'button', onclick:() => { if (done) return; SND.fx('page'); fn(); } }, '🤷 I’m stuck, show me'); }
  function finalize(ok, mir, answer){
    if (done) return; done = true;
    const res = scoreItem(item, q, ok, null, hinted && ok);
    body.querySelectorAll('.hintbtn').forEach(e => e.remove());
    const bk = ok ? null : bookAdd(q.w);
    refresh();
    resultSheet({ ok, fish:res.pts, mir, answer, book:bk, line:res.line, lock:res.lock, custard:res.custard, nextLabel: bk ? '📓 Book time' : lastQ() ? 'Full time ⚽' : 'Next question', next: bk ? () => { closeSheet(); bookStop(bk, goNext); } : goNext });
  }
  const meanOf = () => q.w.card ? info(q.w.w).m : q.w.m;
  function choiceQ(){
    const btns = q.options.map((o, i) => h('button', { class:'ans', type:'button', 'data-t':o.t, onclick:() => choose(o, i) },
      h('span', { class:'l', text:'ABCD'[i] }), h('span', { class:'t', text:o.t }), h('span', { class:'mk' })));
    function choose(o, i){
      if (done) return;
      btns.forEach((b, j) => { b.disabled = true; if (q.options[j].ok) b.classList.add('correct'); });
      if (!o.ok) btns[i].classList.add('wrong');
      const mir = mirrorTurn(okM => { const wr = q.options.filter(x => !x.ok); return okM ? q.options.find(x => x.ok).t : wr[rnd(wr.length)].t; });
      if (!mir.sat) btns.forEach(b => { if (b.dataset.t === mir.guess) b.querySelector('.mk').before(mtag()); });
      const answer = q.type === 'pre' ? h('div', {}, h('p', { class:'line' }, h('b', { text:q.w.w }), ' = ' + meanOf()), h('p', { class:'small', style:'margin-top:3px', text:'💡 ' + q.tip })) : q.type === 'gap' ? h('p', { class:'sentence', style:'font-size:1rem' }, q.gap.before, h('span', { class:'fill', text:q.gap.word }), q.gap.after)
        : h('p', { class:'line' }, h('b', { text:q.w.w }), meanOf() ? ' = ' + meanOf() : '');
      finalize(o.ok, mir, answer);
    }
    R.keys = e => { if (done) return; const i = '1234'.indexOf(e.key); if (i > -1 && btns[i] && !btns[i].disabled) btns[i].click(); };
    const sent = q.type === 'w2m' ? gapFor(q.w) : null;
    const clueBox = h('div', { class:'clue', hidden:true, 'aria-live':'polite' });
    const clue = sent ? hintBtn('Clue: see it in a sentence', () => { put(clueBox, h('span', { class:'em', 'aria-hidden':'true', text:'💡' }), h('span', {}, sent.before, h('b', { text:sent.word }), sent.after)); clueBox.hidden = false; }) : null;
    return [clueBox, h('div', { class:'answers' }, btns), h('div', { class:'row hintrow' }, clue, hintBtn('Knock one out', () => { const wr = btns.filter((b, j) => !q.options[j].ok && !b.disabled); const b = wr[rnd(wr.length)]; if (b){ b.disabled = true; b.classList.add('gone'); } }))];
  }
  /* "How do you say it?": three spoken versions, one right; tap to hear, then pick */
  function sayQ(){
    let sel = null; const L = 'ABC';
    const go = h('button', { class:'btn wide', type:'button', disabled:true, onclick:() => {
      if (done || sel == null) return;
      const o = q.options[sel], ri = q.options.findIndex(x => x.ok);
      btns.forEach((b, j) => { b.disabled = true; if (q.options[j].ok) b.classList.add('correct'); });
      if (!o.ok) btns[sel].classList.add('wrong');
      const mir = mirrorTurn(okM => okM ? 'Version ' + L[ri] : 'Version ' + L[q.options.findIndex(x => !x.ok)]);
      setTimeout(() => sayWord(q.w.w), 600);
      finalize(o.ok, mir, h('div', { class:'sayans' },
        h('div', { class:'wordrow' }, h('span', { text:'Say it like this: ' }), h('b', { text:q.w.w }), speakBtn(q.w.w)),
        q.options.filter(x => !x.ok).map(x => h('p', { class:'small' }, '❌ “' + x.t + '”' + (x.j ? ' · ' + x.j : ''))),
        h('p', { class:'saynow' }, '🗣️ Now you say it out loud: ', h('b', { text:q.w.w }))));
    } }, 'Check');
    const btns = q.options.map((o, i) => h('button', { class:'ans sayopt', type:'button', onclick:() => {
      if (done) return; sayWord(String(o.sp).toLowerCase()); sel = i; btns.forEach((b, j) => b.classList.toggle('sel', j === i)); go.disabled = false; } },
      h('span', { class:'l', text:L[i] }), h('span', { class:'t' }, icon('sound'), ' Hear version ' + L[i]), h('span', { class:'mk' })));
    R.keys = e => { const i = '123'.indexOf(e.key); if (i > -1 && btns[i] && !btns[i].disabled) btns[i].click(); if (e.key === 'Enter') go.click(); };
    return [h('div', { class:'answers' }, btns), h('p', { class:'small muted', text:'Tap each one to hear it. Pick the one that sounds right, then Check.' }), go];
  }
  function spellQ(){
    const input = h('input', { id:'spellin', type:'text', autocomplete:'off', autocapitalize:'none', autocorrect:'off', spellcheck:'false', 'aria-label':'Type the word' });
    const boxes = h('div', { class:'boxes', 'aria-label':'The word has ' + q.w.w.length + ' letters' }, [...q.w.w].map(() => h('b')));
    const go = h('button', { class:'btn', type:'submit' }, 'Check');
    const form = h('form', { class:'spell', onsubmit:e => {
      e.preventDefault(); const v = input.value.trim(); if (!v || done) return;
      input.disabled = true; go.disabled = true; input.blur();
      const ok = norm(v) === norm(q.w.w);
      const mir = mirrorTurn(okM => okM ? q.w.w : misspell(q.w.w));
      finalize(ok, mir, h('div', { class:'letters', 'aria-label':'Correct spelling: ' + q.w.w }, [...q.w.w].map((c, i) => h('span', { class: ok || (v[i] && v[i].toLowerCase() === c.toLowerCase()) ? 'ok' : 'bad', text:c }))));
    } }, input, go);
    setTimeout(() => input.focus({ preventScroll:true }), 60);
    R.keys = null;
    const stuck = stuckBtn(() => { input.disabled = true; go.disabled = true; input.blur();
      const mir = mirrorTurn(okM => okM ? q.w.w : misspell(q.w.w));
      finalize(false, mir, h('div', { class:'letters', 'aria-label':'The word is ' + q.w.w }, [...q.w.w].map(c => h('span', { class:'ok', text:c })))); });
    return [boxes, form, h('div', { class:'row', style:'justify-content:space-between' }, stuck, hintBtn('Show the first letter', () => { const b = boxes.firstChild; b.textContent = q.w.w[0]; b.classList.add('f'); }))];
  }
  function scramQ(){
    const word = q.w.w, letters = [...word];
    let order; do { order = shuffle(letters.map((c, i) => i)); } while (letters.length > 1 && order.every((v, i) => letters[v] === letters[i]));
    const picked = []; let locked = 0;
    const slots = h('div', { class:'slots', 'aria-live':'polite', 'aria-label':'Your word' });
    const tileBtns = order.map(i => h('button', { class:'tile', type:'button', 'aria-label':'Letter ' + letters[i], text:letters[i], onclick:e => { if (done) return; SND.fx('tile'); picked.push({ i, b:e.currentTarget }); e.currentTarget.disabled = true; draw(); } }));
    function draw(){
      put(slots, letters.map((_, k) => { const p = picked[k];
        return h('button', { class:'slot' + (p ? ' full' : '') + (k < locked ? ' lock' : ''), type:'button', disabled:!p || k < locked || done, 'aria-label': p ? 'Remove ' + letters[p.i] : 'Empty', text: p ? letters[p.i] : '',
          onclick:() => { if (done || k < locked) return; picked.splice(k).forEach(o => { o.b.disabled = false; }); draw(); } }); }));
      if (picked.length === letters.length && !done) check();
    }
    function check(){
      const guess = picked.map(p => letters[p.i]).join(''), ok = norm(guess) === norm(word);
      tileBtns.forEach(b => { b.disabled = true; });
      const mir = mirrorTurn(okM => okM ? word : misspell(word));
      finalize(ok, mir, h('p', { class:'line' }, h('b', { text:word }), meanOf() ? ' = ' + meanOf() : ''));
      draw(); if (ok) slots.classList.add('win');
    }
    const clear = h('button', { class:'btn alt small', type:'button', onclick:() => { if (done) return; picked.splice(locked).forEach(o => { o.b.disabled = false; }); draw(); } }, 'Clear');
    const hint = hintBtn('Place the first letter', () => {
      picked.splice(0).forEach(o => { o.b.disabled = false; });
      const bi = tileBtns.findIndex((b, j) => letters[order[j]].toLowerCase() === word[0].toLowerCase());
      picked.push({ i:order[bi], b:tileBtns[bi] }); tileBtns[bi].disabled = true; locked = 1; draw();
    });
    draw();
    R.keys = e => { if (done) return; const k = e.key.toLowerCase(); if (k === 'backspace'){ if (picked.length > locked){ const o = picked.pop(); o.b.disabled = false; draw(); } return; }
      const b = tileBtns.find((x, j) => !x.disabled && letters[order[j]].toLowerCase() === k); if (b) b.click(); };
    const stuck = stuckBtn(() => { tileBtns.forEach(b => { b.disabled = true; });
      picked.splice(0); letters.forEach((c, k) => picked.push({ i:k, b:null })); locked = letters.length;
      const mir = mirrorTurn(okM => okM ? word : misspell(word));
      finalize(false, mir, h('p', { class:'line' }, h('b', { text:word }), meanOf() ? ' = ' + meanOf() : '')); draw(); });
    return [slots, h('div', { class:'tiles' }, tileBtns), h('div', { class:'row', style:'justify-content:space-between;flex-wrap:wrap;gap:8px' }, clear, hint, stuck)];
  }

  /* similar & opposite cards: know it? → similar → (sheet) → opposite, 3 choices → (sheet) → review */
  function cardFlow(){
    const c = q.w.card, opts4 = shuffle(c.o.slice());
    /* three ways round: normal (similar then opposite), swap (opposite first), reverse (show the partner word, find the card word) */
    const r0 = peek(q.w), seenB4 = r0 && r0.seen > 0;
    const mode = window.__cardMode || (!seenB4 || item.retry ? 'normal' : pickOne(['normal', 'normal', 'swap', 'reverse']));
    const oppFirst = mode === 'swap' || (mode === 'reverse' && Math.random() < .5);
    const roleOf = n => (n === 1) !== oppFirst ? 'sim' : 'opp';
    const decoys = shuffle(CARDS.filter(x => x.w !== c.w && !c.o.includes(x.w) && !x.o.includes(c.w)).map(x => x.w));
    const g = { ps:null, po:null, s:false, o:false }; let fishN = 0, mS = false, mO = false, firstRight = null;
    const LBL = { sim:'SIMILAR', opp:'OPPOSITE' };
    const track = phase => h('div', { class:'track', 'aria-hidden':'true' },
      hintsOn && mode !== 'reverse' ? h('span', { class: phase === 0 ? 'on0' : 'done', text: phase === 0 ? 'KNOW IT?' : '✓ KNOW IT' }) : null,
      [1, 2].map(n => h('span', { class: phase === n ? (roleOf(n) === 'sim' ? 'on1' : 'on2') : phase > n ? 'done' : '', text: phase > n ? '✓ ' + LBL[roleOf(n)] : n + ' ' + LBL[roleOf(n)] })));
    const word = t => wordWithSpeak(t || c.w);
    function know(){
      setStrip('', 'SIMILAR & OPPOSITE CARD');
      const yes = h('button', { class:'kbtn yes', type:'button', onclick:() => { SND.fx('tap'); stage(1); } }, h('span', { class:'em', 'aria-hidden':'true', text:'👍' }), 'I KNOW IT');
      const no = h('button', { class:'kbtn no', type:'button', onclick:explain }, h('span', { class:'em', 'aria-hidden':'true', text:'🤔' }), 'NOT SURE');
      put(body, cue(item.retry ? say('retry') : say('know')), track(0), word(), h('div', { class:'grow' }), h('div', { class:'know' }, yes, no), h('p', { class:'small muted', text:'No fish lost either way.' }));
      R.keys = e => { if (e.key === '1') yes.click(); if (e.key === '2') no.click(); };
    }
    function explain(){
      hinted = true; SND.fx('peek');
      const t = info(c.w);
      const bk = bookAdd(q.w);
      const go = h('button', { class:'btn wide', type:'button', onclick:() => { SND.fx('tap'); if (bk) bookStop(bk, () => stage(1)); else stage(1); } }, bk ? '📓 Book time' : 'Got it · Part 1 🤝');
      put(body, cue(say('explain')), track(0), h('div', { class:'explain' }, word(), h('p', { class:'meaning', text:t.m || 'A word from the card box.' }), t.f ? h('p', { class:'muted', style:'font-style:italic', text:t.f }) : null),
        bk ? h('div', { class:'book slim' }, h('div', { class:'bk' }, h('span', { 'aria-hidden':'true', text:'📓' }), 'WRITE ' + c.w.toUpperCase() + ' AND ITS MEANING IN YOUR VOCABULARY BOOK')) : null, h('div', { class:'grow' }), go);
      R.keys = null;
    }
    /* the meaning shows in a fixed box under the choices, so nothing moves and his next tap lands where he aims */
    let peekBox = null, lockUntil = 0;
    function optRow(wd, i, onPick){
      const x = info(wd);
      const b = h('button', { class:'ans', type:'button', 'data-t':wd, onclick:() => onPick(wd, b) }, h('span', { class:'l', text:'ABCD'[i] }), h('span', { class:'t' }, h('span', { text:wd })), h('span', { class:'mk' }));
      if (!hintsOn) return { row:b, b };
      const ib = h('button', { class:'peek', type:'button', 'aria-pressed':'false', 'aria-label':'Peek: what does ' + wd + ' mean?', title:'What does ' + wd + ' mean?', text:'i',
        onclick:e => {
          e.stopPropagation(); lockUntil = Date.now() + 450;   // ignore a stray second tap on the answers
          sayWord(wd);   // a word he doesn't know: say it aloud every time he taps
          if (peekBox){ put(peekBox, h('b', { text:wd + ': ' }), x.m || 'No meaning on file.'); peekBox.classList.add('on'); }
          if (ib.getAttribute('aria-pressed') === 'true') return;
          ib.setAttribute('aria-pressed', 'true'); ib.setAttribute('aria-label', 'Hear ' + wd + ' again'); put(ib, icon('sound'));
          if (!done){ hinted = true; SND.fx('peek'); } } });
      if (matchMedia('(hover:hover)').matches){ b.addEventListener('mouseenter', () => { if (ib.getAttribute('aria-pressed') !== 'true') b.title = x.m || ''; }); }
      return { row:h('div', { class:'orow' }, b, ib), b };
    }
    /* what part n asks: the big word shown, the right answer, the choices */
    function part(n){
      const role = roleOf(n), partner = role === 'sim' ? c.s : c.p;
      if (mode === 'reverse'){
        const list = shuffle([c.w].concat(decoys.slice(n === 1 ? 0 : 3, n === 1 ? 3 : 5)));
        return { role, show:partner, right:c.w, list, banner: role === 'sim' ? 'BACKWARDS! Which word is SIMILAR to' : 'BACKWARDS! Which word is the OPPOSITE of' };
      }
      const list = n === 1 ? opts4 : opts4.filter(w => w !== firstRight);
      return { role, show:c.w, right:partner, list, banner: role === 'sim' ? (n === 1 ? 'The SIMILAR word to' : 'FLIP IT! The SIMILAR word to') : (n === 1 ? 'UPSIDE DOWN! The OPPOSITE of' : 'FLIP IT! The OPPOSITE of') };
    }
    function stage(n){
      const P = part(n), opp = P.role === 'opp';
      setStrip(opp ? 'opp' : 'sim', 'PART ' + n + ' · ' + LBL[P.role] + (mode === 'reverse' ? ' · BACKWARDS' : ''));
      if (n === 2 || opp) SND.fx('flip');
      peekBox = hintsOn ? h('div', { class:'peekbox', 'aria-live':'polite' }, n === 2 ? 'Only 3 choices this time. Tap i to hear a word and see what it means.' : 'Tap i to hear a word and see what it means. It doesn’t pick it.') : null;
      const rows = P.list.map((wd, i) => optRow(wd, i, (w, b) => pick(n, P, w, b, rows)));
      if (opp) oppFlash(P.show, mode === 'reverse');
      put(body, track(n),
        h('div', { class:'banner big ' + (opp ? 's2' : 's1'), role:'status' }, h('span', { class:'em', 'aria-hidden':'true', text: opp ? '↔️' : '🟰' }),
          h('div', { class:'bt' }, h('b', { text: opp ? 'OPPOSITE' : 'SIMILAR' }),
            h('span', { text: (mode === 'reverse' ? 'Which card word means ' : 'Which word means ') + (opp ? 'the OPPOSITE of…' : 'the SAME as…') }))),
        word(P.show), h('div', { class:'answers ' + (opp ? 's2 hazard' : 's1') }, rows.map(r => r.row)), peekBox);
      R.keys = e => { const i = '1234'.indexOf(e.key); if (i > -1 && rows[i] && !rows[i].b.disabled) rows[i].b.click(); };
    }
    function pick(n, P, wd, btn, rows){
      if (rows.answered || Date.now() < lockUntil) return;   // answered already (a caught, greyed-out option doesn't count)
      const other = P.role === 'opp' ? c.s : c.p;
      if (mode !== 'reverse' && wd === other && wd !== P.right && !g['warn' + n]){   // he picked the SIMILAR word on an OPPOSITE question (or the other way round): catch it
        g['warn' + n] = true; btn.disabled = true; btn.classList.add('gone'); SND.fx('whistle');
        const want = P.role === 'opp' ? 'OPPOSITE' : 'SIMILAR', got = P.role === 'opp' ? 'SIMILAR' : 'OPPOSITE';
        openSheet([h('div', { class:'say' }, cimg(IMG.ask, '', 52, 'Cuffin'), h('div', { class:'bub' }, h('div', { class:'nm', text:'Cuffin' }), h('p', { class:'tx' }, 'Careful! ', h('b', { text:wd }), ' is the ' + got + ' word. This one wants the ', h('b', { text:want }), '. Have another go.'))),
          h('button', { class:'btn wide', type:'button', onclick:() => { SND.fx('tap'); closeSheet(); } }, 'Try again ' + (P.role === 'opp' ? '↔️' : '🟰'))], true);
        if (S.settings.sound) sayWord('Careful! That is the ' + got.toLowerCase() + ' word. Find the ' + want.toLowerCase() + '.');
        return;
      }
      const right = P.right, ok = wd === right;
      rows.answered = true;
      if (n === 1) firstRight = right;
      if (P.role === 'sim'){ g.ps = wd; g.s = ok; } else { g.po = wd; g.o = ok; }
      if (ok){ S.points += 1; R.points += 1; fishN++; }
      let mir;
      if (!item.retry){
        const t = mirrorTry(1); R.mfish += t.fish; if (P.role === 'sim') mS = t.ok; else mO = t.ok;
        const wr = P.list.filter(x => x !== right);
        mir = { ok:t.ok, fish:t.fish, guess: t.ok ? right : wr[rnd(wr.length)] };
      } else mir = { sat:true };
      rows.forEach(r => { r.b.disabled = true; if (r.b.dataset.t === right) r.b.classList.add('correct'); if (!mir.sat && r.b.dataset.t === mir.guess) r.b.querySelector('.mk').before(mtag()); });
      if (!ok) btn.classList.add('wrong');
      refresh();
      const answer = mode === 'reverse'
        ? h('p', { class:'line' }, h('b', { text:P.show }), ' is the ', h('span', { class:'role ' + P.role, text:LBL[P.role] }), ' of ', h('b', { text:c.w }), ' = ' + info(c.w).m)
        : h('p', { class:'line' }, h('span', { class:'role ' + P.role, style:'margin-right:6px', text:LBL[P.role] }), h('b', { text:right }), ' = ' + info(right).m);
      resultSheet({ ok, fish: ok ? 1 : 0, mir, line: ok ? say('right') : null, answer,
        nextLabel: n === 1 ? 'Part 2: ' + (roleOf(2) === 'sim' ? 'Similar 🤝' : 'Opposite 🔄') : 'See the whole card', next: n === 1 ? () => { closeSheet(); stage(2); } : () => { closeSheet(); review(); } });
    }
    function review(){
      if (done) return; done = true;
      const ok = g.s && g.o;
      const res = scoreItem(item, q, ok, fishN, hinted && ok);
      if (!item.retry) mirrorMastery(mS && mO);
      refresh();
      setStrip('', 'CARD REVIEW');
      const roles = {}; roles[c.s] = 'sim'; roles[c.p] = 'opp';
      const order = [c.s, c.p].concat(c.o.filter(w => w !== c.s && w !== c.p));
      const rev = mode === 'reverse';
      put(body, h('div', { class:'banner ' + (ok ? 's1' : 's2'), text: fishN === 2 ? '🐟🐟 Both parts right!' : fishN === 1 ? '🐟 One part right' : '🍽️ No fish this time' }),
        h('div', { class:'review' },
          h('div', { class:'rv' }, h('span', { class:'role', text:'THE WORD' }), h('div', { style:'min-width:0' }, h('div', { class:'w', text:c.w }), h('div', { class:'m', text:info(c.w).m })), h('span')),
          order.map(w => { const right = roles[w], picked = rev ? null : g.ps === w ? 'sim' : g.po === w ? 'opp' : null, good = picked && picked === right, bad = picked && picked !== right;
            const revMark = rev && right ? ((right === 'sim' ? g.s : g.o) ? '✅ you' : '❌ you') : '';
            return h('div', { class:'rv ' + (good || (rev && revMark === '✅ you') ? 'rv-good' : bad || (rev && revMark === '❌ you') ? 'rv-bad' : '') }, h('span', { class:'role ' + (right || 'no'), text: right === 'sim' ? 'SIMILAR' : right === 'opp' ? 'OPPOSITE' : '—' }),
              h('div', { style:'min-width:0' }, h('div', { class:'w', text:w }), h('div', { class:'m', text:info(w).m })),
              h('span', { class:'you', text: picked ? (good ? '✅ you' : '❌ you') : revMark })); })),
        h('p', { class:'small muted', text: ok ? 'Both parts right: this card counts.' : rev ? 'You picked ' + [g.s ? null : g.ps, g.o ? null : g.po].filter(Boolean).join(' and ') + '. Cards count only when both parts are right.' : 'Cards count only when both parts are right. It will come back.' }));
      SND.fx(ok ? 'goal' : 'page');
      { const v = res.custard ? VOICE.pick('c09') : null; if (v) setTimeout(() => VOICE.play(v), 600); }
      const bk = ok ? null : bookAdd(q.w, true);
      const after = res.lock === 'mastered' ? () => { closeSheet(); celebrateMastered(q.w, goNext); } : goNext;
      openSheet([bk ? h('div', { class:'note custard' }, h('span', { 'aria-hidden':'true', text:'📓' }), h('b', { text:'Next: write it in your vocabulary book.' })) : null, noteFor(res.lock, res.custard),
        (() => { const nb = h('button', { class:'btn wide', type:'button', onclick:() => { SND.fx('tap'); if (bk){ closeSheet(); bookStop(bk, goNext); } else after(); } }, bk ? '📓 Book time' : lastQ() ? 'Full time ⚽' : 'Next question'); setTimeout(() => nb.focus({ preventScroll:true }), 60); return nb; })()], false, true);
      R.keys = null;
    }
    if (hintsOn && mode !== 'reverse') know(); else stage(1);
  }

  if (q.type === 'sim') cardFlow();
  else {
    setStrip(q.type === 'gap' ? 'gap' : q.type === 'scram' ? 'scram' : '', (isRabbitWord(q.w) ? '🐰 RABBIT WORD · ' : '') + TYPE_LABEL[q.type].toUpperCase());
    const lead = item.retry ? say('retry') : R.idx === 0 ? R.hello : pickOne(['Your question.', 'Here it comes.', 'The Mirror is watching.', 'Take your time.', 'Concentrate. Floppy, warm, like custard.']);
    const top = q.type === 'w2m' ? [h('p', { class:'muted', text:'What does this word mean?' }), wordWithSpeak(q.w.w)]
      : q.type === 'm2w' ? [h('p', { class:'muted', text:'Which word means…' }), h('p', { class:'meaning', text:'“' + meanOf() + '”' })]
      : q.type === 'gap' ? [h('p', { class:'muted', text:'Which word fills the gap?' }), h('p', { class:'sentence' }, q.gap.before, h('span', { class:'blank', 'aria-label':'gap' }), q.gap.after)]
      : q.type === 'scram' && !meanOf() ? [h('p', { class:'muted', text:'Unscramble the word you hear.' }), h('button', { class:'btn alt hearbtn', type:'button', onclick:() => sayWord(q.w.w) }, icon('sound'), 'Hear the word')]
      : q.type === 'scram' ? [h('p', { class:'muted', text:'Unscramble the word that means…' }), h('p', { class:'meaning', text:'“' + meanOf() + '”' })]
      : q.type === 'hear' ? [h('p', { class:'muted', text:'Listen, then spell the word you hear.' }), h('button', { class:'btn alt hearbtn', type:'button', onclick:() => sayWord(q.w.w) }, icon('sound'), 'Hear it again')]
      : q.type === 'say' ? [h('p', { class:'muted', text:'How do you say this word?' }), h('div', { class:'word', text:q.w.w })]
      : q.type === 'pre' ? [h('p', { class:'muted', text:'Pick the right start. Which word means…' }), h('p', { class:'meaning', text:'“' + meanOf() + '”' })]
      : [h('p', { class:'muted', text:'Spell the word that means…' }), h('p', { class:'meaning', text:'“' + meanOf() + '”' })];
    const kids = q.type === 'say' ? sayQ() : q.type === 'spell' || q.type === 'hear' ? spellQ() : q.type === 'scram' ? scramQ() : choiceQ();
    if ((q.type === 'hear' || (q.type === 'scram' && !meanOf())) && S.settings.sound) sayWord(q.w.w);   // said straight away (inside the tap, so iPhone allows it)
    put(body, cue(lead), top, kids);
    if (q.type === 'pre' && !S.seenPre){ S.seenPre = true; save(); setTimeout(() => { if (!done && !sheetEl) prefixLesson(); }, 120); }   // never over the top of an answer
  }
  const quit = h('button', { class:'quit', type:'button', 'aria-label':'End this match and go home', onclick:() => quitMatch() }, icon('x'), h('span', { text:'End' }));
  put(boardBox, R.kind === 'rabbit' ? h('div', { class:'rmini' }, h('span', { class:'small', text:'🐰 STOP THE RABBIT · ' + (R.idx + 1) + '/' + R.queue.length + ' · 🥕 ' + (S.carrots || 0) }), rabbitGate(true)) : led(true, (R.idx + 1) + '/' + R.queue.length));
  const keepSheet = sheetEl; sheetEl = null;
  mount([h('div', { class:'qbar' }, quit, pipsEl, qn, h('div', { class:'tools' }, reportBtn(true), soundBtns())), boardBox, h('div', { class:'pitch' }, strip, body)], null);
  if (keepSheet) keepSheet.forEach(e => e.remove());
  drawPips();
}

function snapshot(){
  const row = { d:today(), m:masteredCount(), p:S.points, mf:S.race.mf, mm:S.race.mm };
  const last = S.history[S.history.length - 1];
  if (last && last.d === row.d) S.history[S.history.length - 1] = row; else S.history.push(row);
  if (S.history.length > 400) S.history.shift();
}
/* the match's record is kept up to date after every answer, so if the app is closed mid-match (Screen Time, battery, swiped away) today's goal and streak still count */
function roundRec(final){
  if (!R) return;
  R.recId = R.recId || Date.now().toString(36) + rnd(1e6);
  const n = final ? R.total : (R.results || []).reduce((a, v, i) => a + (v && R.queue[i] && !R.queue[i].retry ? 1 : 0), 0);
  if (!n) return;
  const rec = { id:R.recId, d:today(), r:R.firstTry, n, a:R.points, m:R.mfish, part:!final };
  const i = S.rounds.findIndex(x => x.id === R.recId);
  if (i >= 0) S.rounds[i] = rec; else { S.rounds.push(rec); if (S.rounds.length > 200) S.rounds.shift(); }
}
/* leaving early still counts today's answers towards the streak and goal, and celebrates any badge */
function quitMatch(){
  SND.loop(false); closeSheet();
  const n = (R.results || []).reduce((a, v, i) => a + (v && R.queue[i] && !R.queue[i].retry ? 1 : 0), 0), nb = R.newBadges || [];
  if (n){
    roundRec(false); checkRabbitLock();
    raceFix(); S.last = today(); snapshot(); save();
  }
  const party = n ? matchCelebrations({ rank0:R.rank0 }, nb) : [];
  R = null;
  if (party.length){ screen = 'party'; celebrateAll(party, () => home(say('quit'))); } else home(say('quit'));
}
function finishRound(){
  SND.loop(false); closeSheet();
  if (R.book && R.book.length && !R.bookDone){ R.bookDone = true; return bookCheck(R.book, finishRound); }
  const acc = R.firstTry / R.total;
  let bonus = 0;
  const rabbitWasLocked = R.kind === 'rabbit' && rabbitLockedNow();
  if (R.kind === 'rabbit'){
    S.stats.rmatch = (S.stats.rmatch || 0) + 1;
    if (R.firstTry === R.total && R.total >= 5){ bonus = 3; S.carrots = (S.carrots || 0) + 3; R.carrots = (R.carrots || 0) + 3; S.stats.rperf = (S.stats.rperf || 0) + 1; R.carrotBonus = 3; }
  }
  else if (R.firstTry === R.total && R.total >= 5){ bonus = 3; R.points += bonus; S.points += bonus; S.stats.perfect++; }
  if (R.firstTry >= R.total && R.mfish >= R.points){ const cut = R.mfish - Math.max(0, R.points - 1); R.mfish -= cut; S.race.mf = Math.max(0, S.race.mf - cut); }   // all right first time: the round is always his
  else if (R.firstTry >= R.total){ const over = (S.points - S.race.mf) - Math.round(leadTarget()), room = R.points - 1 - R.mfish; if (over > 0 && room > 0){ const t = Math.min(over, room); R.mfish += t; S.race.mf += t; } }   // perfect round, already well clear: he still wins it, but the lead grows slowly
  raceFix();
  const stars = acc >= 1 ? 3 : acc >= .8 ? 2 : acc >= .5 ? 1 : 0;
  S.stats.rounds++; { const hr = new Date().getHours(); if (hr < 8) S.stats.early = (S.stats.early || 0) + 1; if (hr >= 19) S.stats.owl = (S.stats.owl || 0) + 1; }
  roundRec(true);
  S.last = today(); snapshot();
  const crowned = !S.leader && allDone() && S.points > S.race.mf;
  if (crowned) S.leader = { d:today(), a:S.points, m:S.race.mf };
  checkRabbitLock();
  const badges = (R.newBadges || []).concat(checkBadges()), prizes = [], m = masteredCount();
  for (const p of S.prizes) if (!p.announced && m >= p.at){ p.announced = true; prizes.push(p); }
  save();
  const x = { acc, stars, bonus, badges, prizes, round:R };
  const party = matchCelebrations(R, badges);
  R = null;
  if (SYNC.pending){ SYNC.pending = null; if (SYNC.ready) pull(false); }
  const end = () => { if (crowned) ceremony(false, () => summary(x)); else if (x.round.toHome) home(); else summary(x); };
  if (party.length){ screen = 'party'; celebrateAll(party, end); } else end();
}
function summary(x){
  if (x.round.kind === 'rabbit') return rabbitSummary(x);
  screen = 'summary';
  const r = x.round, mirWon = r.mfish > r.points, tie = r.mfish === r.points;
  const key = x.stars === 3 ? 'end3' : x.stars === 2 ? 'end2' : x.stars === 1 ? 'end1' : 'end0';
  SND.tune(mirWon ? 'lose' : 'win');
  const rankUp = r.rank0 != null && rankInfo(masteredCount()).i > r.rank0;
  { const v = rankUp ? null : mirWon || tie ? VOICE.pick('c14') : VOICE.pick('c13'); const v2 = mirWon && Math.random() < .5 ? VOICE.pick('m07') : null;
    if (v) setTimeout(() => VOICE.play(v), 1500); if (v2) setTimeout(() => VOICE.play(v2), 1700); }
  const missed = [...new Set(r.missed)];
  const extra = [r.carrots ? '🥕 ' + r.carrots + ' carrot' + (r.carrots === 1 ? '' : 's') + ' won back from the Rabbit' : null, x.badges.length ? '🏅 New badge: ' + x.badges.map(b => b.n).join(', ') : null, x.prizes.length ? '🎁 Prize unlocked: ' + x.prizes.map(p => p.text || 'a surprise').join(', ') + '. Ask a grown-up!' : null].filter(Boolean);
  mount([
    topbar(),
    h('div', { class:'led', role:'group', 'aria-label':'Full time' },
      h('div', { class:'lhead' }, h('span', { class:'live' }, h('i'), 'FULL TIME'), h('b', { text: mirWon ? 'MIRROR TAKES THE ROUND' : tie ? 'ROUND DRAWN' : 'ROUND TO CUFFIN' })),
      h('div', { class:'lgrid' },
        h('div', { class:'lside me' }, cimg(IMG.right, 'ava', 82, ''), h('div', { class:'digits' }, '+' + r.points, h('small', { text:'🐟' }))),
        h('div', { class:'lmid' }, h('div', { class:'vs', text:'VS' }), h('div', { class:'lead', text:'TOTAL ' + S.points + '–' + S.race.mf })),
        h('div', { class:'lside mir' }, cimg(mirWon ? MIMG.smug : MIMG.sad, 'ava', 82, ''), h('div', { class:'digits' }, '+' + r.mfish, h('small', { text:'🐟' }))))),
    h('div', { class:'stat4' },
      h('div', { class:'st' }, h('div', { class:'k', text:'RIGHT FIRST TIME' }), h('div', { class:'v', text:r.firstTry + '/' + r.total }), h('div', { class:'d', text:'⭐'.repeat(x.stars) || 'Keep going' })),
      h('div', { class:'st cus' }, h('div', { class:'k', text:'CUSTARD POTS' }), h('div', { class:'v', text:'🍮 ' + (r.custard || 0) }), h('div', { class:'d', style:'color:var(--muted)', text:'1 pot for every 5 in a row' })),
      h('div', { class:'st' }, h('div', { class:'k', text:'LOCKED IN' }), h('div', { class:'v', text:String(r.mastered.length) }), h('div', { class:'d', text:r.mastered.slice(0, 2).join(', ') })),
      h('div', { class:'st' }, h('div', { class:'k', text:'TO LOOK AT AGAIN' }), h('div', { class:'v', text:String(missed.length) }), h('div', { class:'d', style:'color:var(--miss)', text:missed.slice(0, 2).join(', ') }))),
    extra.length ? h('div', { class:'note' }, h('span', { text:extra.join(' · ') })) : sayBlock(mirWon ? 'rival' : 'com', mirWon ? msay('roundWin') : (r.custard ? say('custard') : say(key)), mirWon ? MIMG.smug : IMG.right),
    h('div', { class:'grow' }),
    h('button', { class:'btn kick', type:'button', onclick:() => startRound('mixed') }, 'PLAY AGAIN'),
    h('div', { class:'homerow' }, h('button', { class:'btn alt small', type:'button', onclick:() => home() }, 'Home'), h('button', { class:'btn alt small', type:'button', onclick:() => progress() }, 'See the charts'))
  ], 'home');
}


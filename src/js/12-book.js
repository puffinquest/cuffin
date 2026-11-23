/* ---------- the vocabulary book ----------
   A miss or a 'not sure' asks Aaron to write the word in his real vocabulary book before carrying on.
   At full time Cuffin runs a Book check: he shows the meaning and Aaron types the word from his book. */
function bookStore(){ if (!S.book || !Array.isArray(S.book.list)) S.book = { list:[], next:[] }; return S.book; }
function bookAdd(x, withPair){
  if (!R || !R.book) return null;
  const k = pk(x), c = x.card;
  let e = R.book.find(b => b.k === k);
  if (e){ if (withPair && c && !e.s){ e.s = c.s; e.o = c.p; e.again = true; const le = bookStore().list.find(b => b.k === k); if (le){ le.s = c.s; le.o = c.p; } return e; } return null; }
  e = { k, w:x.w, m: c ? info(x.w).m : x.m, s: withPair && c ? c.s : null, o: withPair && c ? c.p : null, d:today(), ok:false };
  R.book.push(e);
  const B = bookStore(); B.list = B.list.filter(b => b.k !== k); B.list.unshift(Object.assign({}, e)); B.list = B.list.slice(0, 200);
  if (!B.next.includes(k)) B.next.push(k); B.next = B.next.slice(-20);
  return e;
}
function bookBox(e){
  return h('div', { class:'book', role:'note' },
    h('div', { class:'bk' }, h('span', { 'aria-hidden':'true', text:'📓' }), e.again ? 'ADD THE SIMILAR AND OPPOSITE TO YOUR BOOK' : 'WRITE IT IN YOUR VOCABULARY BOOK'),
    h('div', { class:'wordrow' }, h('div', { class:'bw', text:e.w }), speakBtn(e.w)),
    e.m ? h('div', { class:'bm', text:e.m }) : null,
    e.s ? h('div', { class:'bp' }, h('span', { class:'role sim', text:'SIMILAR' }), ' ' + e.s + '  ', h('span', { class:'role opp', text:'OPPOSITE' }), ' ' + e.o) : null);
}
const BOOK_SAY = ['Write that one in your vocabulary book. The puffin community is watching.', 'Into the book it goes. That is how we beat the Mirror.', 'Book. Pencil. Now. The Mirror does not own a book. That is his weakness.'];
function bookCheck(list, done){
  screen = 'bookcheck';
  const items = list.slice(0, 5);
  let i = 0, tries = 0, right = 0;
  const out = h('div', { class:'stack', style:'display:flex;flex-direction:column;gap:8px' });
  const cue2 = h('div', { class:'say' }, cimg(IMG.ask, '', 52, 'Cuffin'), h('div', { class:'bub' }, h('div', { class:'nm', text:'Cuffin' }), h('p', { class:'tx' })));
  const setCue = t => { cue2.querySelector('.tx').textContent = t; };
  const body2 = h('div', { class:'pbody' });
  const strip2 = h('div', { class:'strip', style:'background:#6B4E16' });
  if (!VOICE.play('c18')) SND.fx('whistle');
  if (Math.random() < .5) setTimeout(() => VOICE.play('m09'), 400);
  setCue(VOICE.can('c18') ? VO.c18 : 'Book check. Have you actually written them down? I am checking. Officially. The puffin community is watching.');
  function show(){
    if (i >= items.length) return finish();
    const e = items[i]; tries = 0;
    put(strip2, h('span', { text:'📓 BOOK CHECK' }), h('span', { class:'tm', text:(i + 1) + ' OF ' + items.length }));
    const input = h('input', { id:'bookin', type:'text', autocomplete:'off', autocapitalize:'none', autocorrect:'off', spellcheck:'false', 'aria-label':'Type the word from your book' });
    const go = h('button', { class:'btn', type:'submit' }, 'Check');
    const fb = h('div', { 'aria-live':'polite' });
    const next = h('div');
    const form = h('form', { class:'spell', onsubmit:ev => {
      ev.preventDefault(); const v = input.value.trim(); if (!v) return;
      if (norm(v) === norm(e.w)){
        input.disabled = true; go.disabled = true; right++; e.ok = true; markBook(e.k, true);
        const rab = R.kind === 'rabbit';
        if (rab){ S.carrots = (S.carrots || 0) + 1; R.carrots = (R.carrots || 0) + 1; } else { S.points += 1; R.points += 1; }   // the Rabbit match pays carrots, never fish
        save();
        SND.fx('goal'); if (!VOICE.play('c19')) {}
        put(fb, h('div', { class:'note custard' }, h('span', { 'aria-hidden':'true', text:'✅' }), h('span', { text: rab ? 'It’s in the book. +1 bonus carrot!' : 'It’s in the book. +1 bonus fish!' })));
        nextBtn();
      } else {
        tries++; SND.fx('wrong');
        if (tries < 2){ put(fb, h('div', { class:'note' }, h('span', { 'aria-hidden':'true', text:'👀' }), h('span', { text:'Not quite. Look again in your book, carefully.' }))); input.select(); }
        else { input.disabled = true; go.disabled = true; markBook(e.k, false);
          put(fb, h('div', { class:'note' }, h('span', { 'aria-hidden':'true', text:'✏️' }), h('span', {}, 'It’s ', h('b', { text:e.w }), '. Write it in your book again, carefully. It will come back next match.')));
          nextBtn(); }
      }
    } }, input, go);
    function nextBtn(){ const b = h('button', { class:'btn wide', type:'button', onclick:() => { SND.fx('tap'); i++; show(); } }, i >= items.length - 1 ? 'Done ✓' : 'Next word'); put(next, b); setTimeout(() => b.focus({ preventScroll:true }), 60); }
    put(body2, e.m ? h('p', { class:'muted', text:'Look in your vocabulary book. Which word means…' }) : h('p', { class:'muted', text:'Listen, then type the word from your vocabulary book.' }), e.m ? h('p', { class:'meaning', text:'“' + e.m + '”' }) : h('button', { class:'btn alt hearbtn', type:'button', onclick:() => sayWord(e.w) }, icon('sound'), 'Hear the word'),
      h('div', { class:'boxes', 'aria-label':'The word has ' + e.w.length + ' letters' }, [...e.w].map((ch, j) => h('b', { class: j === 0 ? 'f' : '', text: j === 0 ? ch : '' }))),
      form, fb, h('div', { class:'grow' }), next);
    setTimeout(() => input.focus({ preventScroll:true }), 60);
  }
  function finish(){
    const all = right === items.length;
    if (all && Math.random() < .6) VOICE.play('m10');
    put(strip2, h('span', { text:'📓 BOOK CHECK DONE' }));
    setCue(all ? 'Every word is in the book. The puffin community has inspected it. Officially impressed.' : 'Good. Some words need writing again. Do that now, then we carry on.');
    const b = h('button', { class:'btn wide', type:'button', onclick:() => { SND.fx('tap'); done(); } }, 'Full time ⚽');
    put(body2, h('div', { class:'stat4' },
      h('div', { class:'st' }, h('div', { class:'k', text:'IN THE BOOK' }), h('div', { class:'v', text:right + '/' + items.length })),
      R.kind === 'rabbit' ? h('div', { class:'st cus' }, h('div', { class:'k', text:'BONUS CARROTS' }), h('div', { class:'v', text:'+' + right + ' 🥕' })) : h('div', { class:'st cus' }, h('div', { class:'k', text:'BONUS FISH' }), h('div', { class:'v', text:'+' + right + ' 🐟' }))),
      R.kind === 'rabbit' ? null : h('div', { class:'mline' }, cimg(all ? MIMG.sad : MIMG.smug, '', 34, 'The Mirror'), h('span', { class:'q', text: all ? (VOICE.can('m10') ? VO.m10 : 'Writing things down? That’s cheating! …Is it? It looks like it works.') : 'Ha! Not in the book! I keep all my words in my head. Next to my reflection.' })),
      h('div', { class:'grow' }), b);
    setTimeout(() => b.focus({ preventScroll:true }), 60);
  }
  const endB = h('button', { class:'quit', type:'button', 'aria-label':'End the book check and go on', onclick:() => { SND.fx('tap'); if (R) R.toHome = true; done(); } }, icon('x'), h('span', { text:'End' }));
  mount([h('div', { class:'qbar' }, endB, h('span', { class:'qn', text:'FULL TIME · BOOK CHECK' }), h('div', { class:'tools' }, soundBtns())), R.kind === 'rabbit' ? rabbitGate(true) : led(true, 'BOOK'), cue2, h('div', { class:'pitch' }, strip2, body2)], null);
  show();
}
function markBook(k, ok){ const e = bookStore().list.find(b => b.k === k); if (e){ e.ok = ok; e.chk = ok ? 'ok' : 'miss'; } }
function markPinky(k){ const e = bookStore().list.find(b => b.k === k); if (e){ e.pinky = true; save(); } }

/* the big STOP card: full screen, Cuffin, the word, and a pencil timer before he can carry on */
const BOOK_SECS = 15;
function bookStop(e, next){
  closeSheet();
  const secs = window.__fastBook ? 1 : BOOK_SECS;
  let left = secs, timer = null;
  const num = h('span', { class:'num', text:String(left) });
  const ring = h('div', { class:'ring', role:'timer', 'aria-label':'Writing time' }, h('span', { class:'pen', 'aria-hidden':'true', text:'✏️' }), num);
  const finish = () => { clearInterval(timer); SND.fx('fish'); ov.remove(); R && (R.keys = prevKeys); next(); };
  /* after the timer: a pinky promise that it really is in the book */
  function promise(){
    VOICE.stop(); SND.fx('page');
    const mv = Math.random() < .3 && VOICE.can('m14');
    VOICE.play('c20'); if (mv) VOICE.play('m14');
    const yes = h('button', { class:'btn kick', type:'button', onclick:() => { markPinky(e.k); e.pinky = true; VOICE.stop(); VOICE.play('c21'); put(stopgo, h('div', { class:'pinkydone', role:'status' }, h('span', { 'aria-hidden':'true', text:'🤙' }), h('b', { text:'Pinky promise witnessed. Officially.' }))); SND.fx('cheer'); pinkyT = setTimeout(finish, 1500); } }, '🤙 Pinky promise!');
    const no = h('button', { class:'btn alt', type:'button', onclick:() => { VOICE.stop(); VOICE.play('c22'); left = Math.max(5, Math.round(secs / 2)); secsNow = left; put(stopgo, ring, go); go.disabled = true; put(go, '✍️ Keep writing…'); ring.classList.remove('done'); num.textContent = String(left); ring.style.setProperty('--p', '0'); timer = setInterval(tick, 1000); } }, 'Not yet…');
    put(stopgo, h('div', { class:'pinky' }, h('p', { class:'pq', text:'Pinky promise it’s in your book?' }), mv ? h('p', { class:'small', style:'color:#C9D2F2', text:'The Mirror: “' + VO.m14 + '”' }) : null, h('div', { class:'pbtns' }, yes, no)));
    setTimeout(() => yes.focus({ preventScroll:true }), 30);
  }
  let secsNow = secs, pinkyT = null;
  const go = h('button', { class:'btn kick', type:'button', disabled:true, onclick:() => { if (go.disabled) return; promise(); } }, '✍️ Keep writing…');
  const stopgo = h('div', { class:'stopgo' }, ring, go);
  const ov = h('div', { class:'stopov', role:'dialog', 'aria-modal':'true', 'aria-labelledby':'stoph' },
    h('div', { class:'stopin' },
      h('button', { class:'endlink', type:'button', onclick:() => { clearInterval(timer); clearTimeout(pinkyT); VOICE.stop(); ov.remove(); if (R) R.keys = prevKeys; if (R && R.queue) quitMatch(); else home(); } }, '✕ End match'),
      h('div', { class:'stoptop' }, cimg(IMG.hello, 'stopimg', 150, 'Cuffin'), h('div', {}, h('h2', { id:'stoph', text:'STOP!' }), h('p', { class:'stopsub', text:'Write it in your vocabulary book.' }))),
      bookBox(e),
      h('p', { class:'stopline', text: (VOICE.can('c17') ? VO.c17 : pickOne(BOOK_SAY)) + ' I will check at full time.' }),
      stopgo));
  document.body.append(ov); requestAnimationFrame(() => fitWords(ov));
  const prevKeys = R ? R.keys : null; if (R) R.keys = null;
  if (!VOICE.play('c17')) SND.fx('whistle');
  const tick = () => {
    left--; num.textContent = String(Math.max(0, left));
    ring.style.setProperty('--p', String(1 - left / secsNow));
    if (left <= 0){ clearInterval(timer); ring.classList.add('done'); num.textContent = '✓'; go.disabled = false; put(go, '✍️ I’ve written it'); SND.fx('tile'); setTimeout(() => go.focus({ preventScroll:true }), 30); }
  };
  ring.style.setProperty('--p', '0');
  timer = setInterval(tick, 1000);
}


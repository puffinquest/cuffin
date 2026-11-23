/* ---------- Home: the scoreboard and one big button ---------- */
function homeLine(){
  const now = new Date();
  if (now.getMonth() === 8 && now.getDate() === 12) return say('birthday');
  if (S.leader) return say('leaderHome');
  if (!S.stats.answered) return 'Giles is retiring. Win the most fish, master every word, and the crown is ours. Press Kick Off.';
  const l = raceLine();
  if (Math.random() < .2) return pickOne(SAY.custard);
  return say(l === 'behind' ? 'aheadHome' : l === 'ahead' ? 'behindHome' : 'levelHome');
}
function mission(){
  const T = mainItems().length, aM = masteredCount(), d = S.points - S.race.mf, lock = lockReadyToday();
  if (S.leader) return 'Keep your crown shiny: play a match to keep the words fresh.';
  if (lock >= 3) return 'Lock in ' + lock + ' words you got right 3 in a row on another day.';
  if (d < 0) return 'Catch the Mirror. He is ' + (-d) + ' fish ahead.';
  if (d <= 3) return 'Break away: finish today ' + Math.max(5, d + 5) + ' fish ahead of the Mirror.';
  return 'Win a pot of custard: get 5 in a row. ' + (T - aM) + ' words to the crown.';
}
const visitSnap = () => ({ d:today(), a:S.points, m:S.race.mf, w:masteredCount(), mw:S.race.mm, c:S.custard || 0, r:rankInfo(masteredCount()).i });
function home(greeting){
  screen = 'home';
  SND.loop(false);
  if (location.hash === '#report' && !home.reportShown && S.intro){ home.reportShown = true; try { history.replaceState(null, '', location.pathname); } catch (e) {} gTab = 'insights'; return grownups(); }   // opened from the Sunday report: straight to Insights
  if (!S.intro) return intro(() => { S.intro = true; S.lastVisit = visitSnap(); save(); home(); });
  if (S.lastVisit && S.lastVisit.d !== today() && !home.recapDone){ home.recapDone = true; return chapter(() => { S.lastVisit = visitSnap(); save(); if (storyDue()) storyTime(() => home()); else home(); }); }
  if (!S.lastVisit){ S.lastVisit = visitSnap(); save(); }
  if (rabbitDue() && !home.rabbitShown){ home.rabbitShown = true; return rabbitNews(() => home()); }   // the Rabbit's news, if today's chapter has already been seen
  if (home.prizeShowing && !document.querySelector('.celeb')) home.prizeShowing = false;   // a party closed with End
  const pz = home.prizeShowing ? [] : prizeParties();
  { const nb = checkBadges(); if (nb.length){ save(); const msg = '🏅 New badge: ' + nb.map(b => b.n).join(', '); if (pz.length) home.badgeMsg = msg; else toast(msg); } }   // catch up on badges earned in an unfinished match
  if (pz.length){ home.prizeShowing = true; setTimeout(() => {   // a prize reached but never celebrated: show it now (only if Aaron is still on Home)
    if (screen !== 'home' || document.querySelector('.celeb') || (typeof R !== 'undefined' && R && R.queue && R.queue.length)){ home.prizeShowing = false; return; }
    celebrateAll(pz, () => { home.prizeShowing = false; const m = home.badgeMsg; home.badgeMsg = null; home(); if (m) toast(m); });
  }, 400); }
  autoDaily();
  let greet = greeting || null;
  if (!home.greeted && S.stats.answered && (S.history || []).some(x => x.d < today())){ home.greeted = true; if (VOICE.play('c02')) greet = VO.c02.replace('Aaron', S.name); }
  mount([
    topbar(),
    S.leader ? h('div', { class:'leaderbox', role:'status' }, crownSvg(''), h('div', { style:'min-width:0' }, h('b', { text:'Leaders of the Puffin Community' }), h('div', { class:'small', text:'Crowned ' + longDate(S.leader.d) }))) : null,
    led(false),
    h('div', { class:'homemid' },
      sayBlock('com', greet || homeLine(), S.leader ? IMG.right : IMG.hello),
      streakRow(),
      h('button', { class:'btn kick', type:'button', onclick:() => startRound('mixed') }, '⚽ KICK OFF'),
      rabbitItems().length ? h('button', { class:'btn rabbitbtn rabhome', type:'button', onclick:() => startRound('rabbit') }, h('span', { class:'rht', text:'🐰 STOP THE RABBIT' }), (() => { const left = rabbitItems().length - rabbitMastered(); return h('span', { class:'rhs', text: left ? left + ' word' + (left === 1 ? '' : 's') + ' to lock him out · 🥕 ' + (S.carrots || 0) : 'Gate locked! Keep him out · 🥕 ' + (S.carrots || 0) }); })()) : null,
      h('div', { class:'homerow' }, h('button', { class:'btn alt small', type:'button', onclick:moreSheet }, icon('more'), 'More matches'), reportBtn(false)))
  ], 'home');
}
SCREENS.home = () => home();
function moreSheet(){
  const tricky = trickyWords().length;
  const item = (em, t, sub, fn, dis) => h('button', { class:'mitem', type:'button', disabled:!!dis, onclick:() => { closeSheet(); fn(); } }, h('span', { class:'em', 'aria-hidden':'true', text:em }), h('span', {}, t, h('small', { text:sub })));
  openSheet([h('h2', { text:'More matches' }), h('div', { class:'mlist' },
    item('🤝', 'Cards match', 'Just the similar & opposite cards', () => startRound('cards')),
    item('🎯', 'Training', tricky ? tricky + ' tricky words to fix' : 'No tricky words yet', () => startRound('tricky'), !tricky),
    item('🥧', 'Pie the Mirror', ({ ready:'Ready! Your reward for today’s words', locked:'Unlocks when today’s goal is done (' + Math.min(todayCount(), GOAL) + '/' + GOAL + ')', done:'Done for today. Back tomorrow' })[pieState()], () => pieGame()),
    item('📖', 'Story time', 'A Cuffin story using your words', () => storyTime(() => home())),
    item('💡', 'Word-building tip', 'How il-, im-, in-, ir- and friends work', () => { home(); prefixLesson(); }),
    item('📺', 'Today’s chapter', 'Watch the match report again', () => chapter(() => home())),
    item('🎬', 'The story from the start', 'Giles, the crown and the Mirror', () => intro(() => home()))),
    h('button', { class:'btn alt wide', type:'button', onclick:closeSheet }, 'Close')], true);
}

/* ---------- broadcast slideshows ---------- */
function reel(slides, finish, opts){
  opts = opts || {};
  let i = -1;
  const box = h('div', { class:'bcast', role:'region', 'aria-roledescription':'slideshow', 'aria-label':opts.label || 'Story' });
  const dots = h('div', { class:'dots', 'aria-hidden':'true' });
  const back = h('button', { class:'back', type:'button', onclick:() => go(i - 1) }, '← BACK');
  const next = h('button', { class:'next', type:'button', onclick:() => go(i + 1) }, 'NEXT →');
  const live = h('span', { class:'small', 'aria-live':'polite', style:'color:#9AA6D6' });
  const top = h('div', { class:'btop' }, h('span', { class:'onair' }, h('i'), opts.tag || 'ON AIR'), h('div', { class:'tools' }, soundBtns(), h('button', { class:'skip', type:'button', onclick:end }, opts.skip || 'Skip')));
  const nav = h('div', { class:'bnav' }, back, h('div', { style:'display:flex;flex-direction:column;align-items:center;gap:4px' }, dots, live), next);
  function end(){ SND.stop(); VOICE.stop(); stopNarr(); R = null; finish(); }
  function go(n){
    if (n >= slides.length) return end();
    const fwd = n > i; i = Math.max(0, n);
    if (fwd && i > 0) SND.fx('page');
    VOICE.stop(); stopNarr(); VOICE.hold();
    const s = slides[i](end);
    narrateSlide(s, VOICE.release());
    s.classList.add('slide', 'in');
    s.addEventListener('click', e => { if (!e.target.closest('button')) go(i + 1); });
    put(box, top, s, opts.ticker ? h('div', { class:'ticker', 'aria-hidden':'true' }, h('span', { text:opts.ticker })) : null, nav);
    put(dots, slides.map((_, k) => h('i', { class: k === i ? 'on' : '' })));
    live.textContent = (i + 1) + ' of ' + slides.length;
    back.disabled = i === 0; next.hidden = i === slides.length - 1;
    const cta = s.querySelector('.cta'); setTimeout(() => (cta || next).focus({ preventScroll:true }), 40);
  }
  function start(){ SND.prime(); if (opts.tune) SND.tune(opts.tune); go(0); }
  mount([box], null);
  R = { keys:e => { if (i < 0) return; if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); }, queue:[] };
  if (opts.splash && (S.settings.sound || S.settings.music)){
    const b = h('button', { class:'ball', type:'button', onclick:start }, 'TAP TO', h('br'), 'START');
    put(box, top, h('div', { class:'slide in' }, h('div', { class:'splash' }, opts.splash, b, h('p', { class:'small', text:'Sound on? Turn it up. Or tap the speaker to turn it off.' }))), nav);
    back.disabled = true; next.hidden = true; setTimeout(() => b.focus({ preventScroll:true }), 40);
  } else start();
}
const photo = (src, alt, cls) => cimg(src, 'hero ' + (cls || ''), 210, alt);
const duoFig = (a, b, ca, cb) => h('div', { class:'duo' },
  h('figure', { class:'c' }, cimg(a || IMG.right, '', 140, 'Cuffin'), h('figcaption', { text:ca || 'CUFFIN & ' + S.name.toUpperCase() })),
  h('span', { class:'vsb', text:'VS' }),
  h('figure', { class:'m' }, cimg(b || MIMG.ask, '', 140, 'The Mirror'), h('figcaption', { text:cb || 'THE MIRROR' })));
const lower = (k, v, cls) => h('div', { class:'lower' }, h('span', { class:'k ' + (cls || ''), text:k }), h('span', { class:'v', text:v }));
function intro(finish){
  screen = 'intro';
  const sl = (...kids) => () => h('div', {}, ...kids);
  reel([
    sl(crownSvg('bigcrown float'), h('h2', {}, 'BREAKING: ', h('em', { text:'Giles is retiring!' })),
      h('p', { class:'big', text:'Giles has led the Puffin Community for 41 years. His knees creak. He would like to sit on a rock and eat sprats.' }), h('p', { class:'tap', text:'Tap anywhere to keep going' })),
    () => { VOICE.play('c01'); return h('div', {}, photo(IMG.right, 'Cuffin', 'float'), h('h2', {}, 'Candidate 1: ', h('em', { text:'CUFFIN' })),
      h('p', { text: VOICE.can('c01') ? 'Scruffy. Wise. Has never found custard in the North Atlantic. Has looked.' : 'Scruffy. Wise. Has crossed the Atlantic eleven times. Twelve, if you count the one that went wrong. Has never found custard in the North Atlantic. Has looked.' })); },
    () => { VOICE.play('m01'); return h('div', {}, photo(MIMG.smug, 'The Mirror', 'swoop'), h('h2', {}, 'Candidate 2: ', h('em', { style:'color:#C6A1FF', text:'THE MIRROR' })),
      h('p', { text:'Fluffy. Gleaming. Has never crossed anything wider than a bath.' }), sayBlock('rival', VO.m01, MIMG.ask)); },
    sl(h('h2', {}, 'How the new ', h('em', { text:'Leader' }), ' is chosen'),
      h('div', { class:'rules' }, h('div', { class:'rule' }, h('span', { class:'n', text:'1' }), 'Master ALL the words'), h('div', { class:'rule' }, h('span', { class:'n', text:'2' }), 'Win the most fresh fish'), h('div', { class:'rule' }, h('span', { class:'n', text:'3' }), 'Get there first')),
      lower('GILES', 'I wrote the rules on a rock. It is a very old rock. It smells faintly of custard. Nobody knows why.')),
    sl(photo(IMG.hello, 'Cuffin'), h('h2', {}, S.name + ', you’re ', h('em', { text:'Cuffin’s helper' })),
      sayBlock('com', 'I have the feathers. You have the brain. You answer, I take the credit. Shared credit. Mostly shared.', IMG.hello)),
    sl(h('h2', {}, 'How to ', h('em', { text:'play' })),
      h('div', { class:'rules' }, h('div', { class:'rule' }, h('span', { class:'n', text:'🐟' }), 'Right answers win fresh fish. GOAL!'), h('div', { class:'rule' }, h('span', { class:'n', text:'🍮' }), '5 in a row wins a pot of custard.'),
        h('div', { class:'rule' }, h('span', { class:'n', text:'🪞' }), 'The Mirror guesses every question too.'), h('div', { class:'rule' }, h('span', { class:'n', text:'🔒' }), 'Get a word right lots of times, on different days, to master it.'))),
    end => h('div', {}, h('h2', {}, 'It’s ', h('em', { text:'matchday' })), duoFig(), h('button', { class:'cta', type:'button', onclick:() => { SND.fx('whistle'); end(); } }, 'Help Cuffin win! 🐟'))
  ], finish, { label:'The story', skip:'Skip', tune:'fanfare', splash:h('div', { class:'chapter', text:'THE RACE FOR LEADER' }), ticker:'BREAKING NEWS · GILES TO RETIRE · TWO PUFFINS, ONE CROWN · STILL NO CUSTARD IN THE NORTH ATLANTIC · ' });
}
/* ---------- the Rabbit: Cuffin's other nemesis, who sneaks new school words in ---------- */
const rabbitPack = () => SCHOOL_PACKS.length ? SCHOOL_PACKS[SCHOOL_PACKS.length - 1] : null;
const rabbitDue = () => { const pk = rabbitPack(); if (!pk || !(S.packs || []).includes(pk.d)) return false; const n = S.rabbitNews || {}; return n.d !== pk.d || !n.v; };   // v: shown since the blank-slide fix
const rabbitSay = line => h('div', { class:'say rabbit' }, h('div', { class:'kidface rabbitface', 'aria-hidden':'true', text:'🐰' }), h('div', { class:'bub' }, h('div', { class:'nm', text:'The Rabbit' }), h('p', { class:'tx', text:line })));
function rabbitSlides(){   // two slides: the news, then what everyone thinks of it
  const pk = rabbitPack(), first = !(S.rabbitNews && S.rabbitNews.d && S.rabbitNews.d !== pk.d), words = pk.rows.map(r => r[0]);
  const mark = () => { if (!S.rabbitNews || S.rabbitNews.d !== pk.d || !S.rabbitNews.v){ S.rabbitNews = { d:pk.d, on:today(), v:2 }; save(); } };
  const show = words.slice(0, 3).join(', ') + (words.length > 3 ? ' + ' + (words.length - 3) + ' more' : '');
  return [() => { mark(); return h('div', {}, h('div', { class:'chapter', text:'🚨 BREAKING NEWS' }),
      h('h2', {}, first ? 'Enter: ' : 'He’s ', h('em', { text: first ? 'the Rabbit' : 'back' })),
      first ? h('p', { text:'“I would like to enter the race,” whispered the Rabbit. “You are a rabbit,” said Giles. “This is a race for puffins.” So that night the Rabbit crept into the word store and sneaked in ' + words.length + ' brand-new words, just to annoy everyone.' })
            : h('p', { text:'Somebody crept into the word store again. Muddy paw prints, a nibbled carrot top and ' + words.length + ' brand-new words.' }),
      h('p', { class:'big', text:show }),
      rabbitSay(first ? 'Hee hee. Good luck with THOSE. They’re extra long. I checked.' : pickOne(['Missed me? I brought action words. Try to keep up.', 'Hee hee. More words. You’re welcome.', 'I left you a few little extras. Hee hee.']))); },
    () => h('div', {}, h('h2', {}, first ? 'Win back the ' : 'Lock the ', h('em', { text: first ? 'carrots' : 'gate' })),
      sayBlock('com', first ? 'Typical. But here’s the good news: tap 🐰 STOP THE RABBIT on Home. Get a Rabbit word right and we win back a carrot. Master it and we take a whole bunch.' : 'Giles has had enough. The Rabbit’s words are now their own challenge: 🐰 STOP THE RABBIT on Home. Master every Rabbit word and the gate locks him out. Carrots for every one you get right.', IMG.hello),
      first ? sayBlock('rival', 'A RABBIT? In MY race? I don’t trust him. His ears are bigger than mine.', MIMG.ask) : null,
      h('p', { class:'big', text:'🥕 ' + (S.carrots || 0) + ' carrot' + ((S.carrots || 0) === 1 ? '' : 's') + ' won back so far' }),
      lower('WATCH OUT', first ? 'He says he’ll be back. Rabbits always come back.' : 'Your Leader words are safe. This is a separate fight.', 'cus'))];
}
function rabbitNews(finish){
  screen = 'chapter';
  const sl = rabbitSlides();
  reel([sl[0], end => { const el = sl[1](); el.append(h('button', { class:'cta', type:'button', onclick:() => { SND.fx('whistle'); end(); } }, 'Let’s get them back 🥕')); return el; }], finish,
    { label:'Breaking news', tag:'BREAKING NEWS', tune:'news', splash:h('div', { class:'chapter', text:'🚨 BREAKING NEWS' }), ticker:'BREAKING NEWS · RABBIT SPOTTED NEAR THE WORD STORE · NEW WORDS FOUND · CARROTS AT RISK · ' });
}
/* the daily chapter: shows itself on the first visit of a new day */
function chapter(finish){
  screen = 'chapter';
  const v = S.lastVisit || visitSnap(), n = matchDay(), title = CHAPTERS[(n - 1) % CHAPTERS.length];
  const da = S.points - (v.a || 0), dm = S.race.mf - (v.m || 0), d = S.points - S.race.mf, T = mainItems().length, aM = masteredCount();
  const ri = rankInfo(aM), sinceKey = da > dm ? 'won' : da < dm ? 'lost' : 'level';
  const rows = chartRows();
  const plus = x => x > 0 ? '+' + x + ' since last time' : 'same as last time';
  const sl = (...kids) => () => h('div', {}, ...kids);
  const rabbit = rabbitDue();
  reel([
    () => { VOICE.play('c03'); return h('div', {}, h('div', { class:'chapter', text:'CHAPTER ' + n + ' · ' + shortDate(today()).toUpperCase() }), h('h2', {}, h('em', { text:title })),
      led(true, 'SO FAR'), Math.random() < .5 ? lower('GILES', pickOne(GCUSTARD), 'cus') : lower('GILES', pickOne(GILES))); },
    () => { const lv = d > 0 ? 'c11' : d < 0 ? 'c12' : null; const said = lv && VOICE.play(lv); return h('div', {}, h('h2', {}, 'The race ', h('em', { text:'so far' })), h('div', { class:'chartbox' }, raceChart(rows, 'p', 'mf', 'Fresh fish over time')), legend(),
      h('p', { class:'big', text: d > 0 ? 'Cuffin leads by ' + d + ' fish. ' : d < 0 ? 'The Mirror leads by ' + (-d) + ' fish. ' : 'Dead level. ' }), sayBlock('com', said ? VO[lv] : pickOne(SAY.since[sinceKey]), IMG.hello)); },
    ...(rabbit ? rabbitSlides() : []),
    sl(h('h2', {}, 'Your ', h('em', { text:'stats' })),
      h('div', { class:'stat4' },
        h('div', { class:'st' }, h('div', { class:'k', text:'WORDS MASTERED' }), h('div', { class:'v', text:aM + '/' + T }), h('div', { class:'d', text:plus(aM - (v.w || 0)) })),
        h('div', { class:'st' }, h('div', { class:'k', text:'FRESH FISH' }), h('div', { class:'v', text:'🐟 ' + S.points }), h('div', { class:'d', text:plus(da) })),
        h('div', { class:'st cus' }, h('div', { class:'k', text:'POTS OF CUSTARD' }), h('div', { class:'v', text:'🍮 ' + (S.custard || 0) }), h('div', { class:'d', text:plus((S.custard || 0) - (v.c || 0)) })),
        h('div', { class:'st' }, h('div', { class:'k', text:'RANK' }), h('div', { class:'v', style:'font-size:1rem', text:ri.cur.name }), h('div', { class:'d', text: ri.next ? (ri.next.at - aM) + ' words to ' + ri.next.name : 'Top rank!' }))),
      lower('CUFFIN', 'Still no custard in the North Atlantic. Still winning pots of it here. The universe is strange.', 'cus')),
    end => h('div', {}, h('h2', {}, 'Pre-match ', h('em', { text:'talk' })),
      sayBlock('rival', Math.random() < .35 ? pickOne(MCUSTARD) : pickOne(PRE), MIMG.smug), sayBlock('kid', pickOne(ASAY)),
      lower('MISSION', mission()),
      h('button', { class:'cta', type:'button', onclick:() => { SND.fx('whistle'); end(); } }, 'KICK OFF ⚽'))
  ].filter(Boolean), finish, { label:'Chapter ' + n, tag:'CHAPTER ' + n, tune:'news', splash:h('div', { style:'display:flex;flex-direction:column;align-items:center;gap:6px' }, h('div', { class:'chapter', text:'CHAPTER ' + n }), h('h2', { text:title })),
    ticker:'CHAPTER ' + n + ' · CUFFIN ' + S.points + ' – ' + S.race.mf + ' MIRROR · ' + aM + ' WORDS MASTERED · ' + (S.custard || 0) + ' POTS OF CUSTARD · ' });
}
function confetti(n){
  const box = h('div', { class:'confetti', 'aria-hidden':'true' }), cols = ['#FCD116', '#1D5BD8', '#D7263D', '#FFC83D', '#3DDC84', '#B48BFF'];
  for (let k = 0; k < (n || 46); k++) box.append(h('i', { style:'left:' + rnd(100) + '%;background:' + cols[k % cols.length] + ';animation-delay:' + (Math.random() * 1.6).toFixed(2) + 's' }));
  return box;
}
function ceremony(preview, finish){
  screen = 'ceremony';
  const L = S.leader || { d:today(), a:S.points, m:S.race.mf }, tant = shuffle(MSAY.defeat);
  reel([
    () => h('div', {}, confetti(), h('h2', {}, 'Every word ', h('em', { text:'MASTERED!' })), h('p', { text:'The whole Puffin Community has gathered on the big rock. Final score:' }), duoFig(IMG.right, MIMG.ask, '🐟 ' + L.a, '🐟 ' + L.m)),
    () => h('div', {}, crownSvg('bigcrown float'), h('h2', {}, 'Giles ', h('em', { text:'clears his throat' })),
      h('p', { class:'big', text:'“By the power of the rock, the fish and the very old rules… the new Leader of the Puffin Community is… CUFFIN! With his helper, ' + S.name.toUpperCase() + '!”' })),
    () => { const said = VOICE.play('m08'); return h('div', {}, h('h2', {}, 'Meanwhile… ', h('em', { style:'color:#C6A1FF', text:'the Mirror' })), photo(MIMG.sad, 'The Mirror, flat on the floor', 'tantrum'), sayBlock('rival', said ? VO.m08 : tant[0], MIMG.sad), sayBlock('rival', (said ? tant.filter(t => !/rematch/i.test(t)) : tant.slice(1))[0], MIMG.smug)); },
    () => { SND.fx('cheer'); VOICE.play('c16'); return h('div', {}, confetti(60), h('div', { class:'crownwrap' }, photo(IMG.hello, 'Cuffin wearing the crown'), crownSvg('crowndrop')),
      h('h2', {}, h('em', { text:'Leader' }), ' of the Puffin Community'), sayBlock('com', VOICE.can('c16') ? VO.c16 : 'I would like this noted. Officially. In the literature. And bring out the custard. All of it.', IMG.right)); },
    end => h('div', {}, h('div', { class:'cert' }, h('div', { class:'eyebrow', text:'Certificate of the Puffin Community' }), h('div', { class:'t', text:'Cuffin & ' + S.name }),
        h('p', { text:'are crowned Leaders of the Puffin Community, having mastered every word, won ' + (S.custard || 0) + ' pots of custard and beaten the Mirror by ' + Math.max(1, L.a - L.m) + ' fresh fish.' }),
        h('p', { class:'small', style:'color:#55648A', text:'Crowned ' + longDate(L.d) + ' on the big rock. Witnessed by Giles, several gulls and one sulking Mirror.' })),
      h('button', { class:'cta', type:'button', onclick:end }, preview ? 'Done' : 'Hooray! 🐟'))
  ], finish, { label:'The crowning', tag:'LIVE · THE BIG ROCK', tune:'anthem', ticker:'NEW LEADER OF THE PUFFIN COMMUNITY · CUFFIN & ' + S.name.toUpperCase() + ' · THE MIRROR IS SULKING · CUSTARD FOR EVERYONE · ' });
}

/* ---------- charts ---------- */
function niceMax(v){ const s = [4,8,12,20,40,60,80,100,150,200,300,400,600,800,1000,1500,2000]; return s.find(n => n >= v) || Math.ceil(v / 500) * 500; }
function raceChart(rows, ka, kb, label){
  if (!rows.length) return h('div', { class:'notice', style:'margin:auto', text:'Play a match and the race appears here.' });
  const W = 640, H = 300, m = { l:46, r:66, t:18, b:34 };
  const svg = sv('svg', { class:'chart', viewBox:'0 0 ' + W + ' ' + H, preserveAspectRatio:'xMidYMid meet', role:'img', 'aria-label':label + ': Cuffin and ' + S.name + ' ' + rows[rows.length-1][ka] + ', the Mirror ' + rows[rows.length-1][kb] });
  const maxV = niceMax(Math.max(4, ...rows.map(r => Math.max(r[ka] || 0, r[kb] || 0)))), iw = W - m.l - m.r, ih = H - m.t - m.b;
  const X = i => rows.length === 1 ? m.l + iw / 2 : m.l + i * iw / (rows.length - 1), Y = v => m.t + ih - (v / maxV) * ih;
  for (let k = 0; k <= 4; k++){ const v = maxV * k / 4, y = Y(v); svg.append(sv('line', { class: k === 0 ? 'axis' : 'grid', x1:m.l, x2:W - m.r, y1:y, y2:y }), sv('text', { x:m.l - 8, y:y + 5, 'text-anchor':'end' }, v)); }
  const ends = [];
  [[ka, '#FF4D5E', ''], [kb, '#9C6BFF', '8 6']].forEach(([k, col, dash], si) => {
    const pts = rows.map((r, i) => [X(i), Y(r[k] || 0)]);
    if (si === 0 && pts.length > 1) svg.append(sv('path', { d:'M' + pts[0][0] + ',' + Y(0) + ' ' + pts.map(p => 'L' + p[0] + ',' + p[1]).join(' ') + ' L' + pts[pts.length-1][0] + ',' + Y(0) + ' Z', fill:col, opacity:.14 }));
    if (pts.length > 1) svg.append(sv('path', { d:pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' '), fill:'none', stroke:col, 'stroke-width':5, 'stroke-linejoin':'round', 'stroke-linecap':'round', 'stroke-dasharray':dash }));
    const lp = pts[pts.length - 1];
    svg.append(sv('circle', { cx:lp[0], cy:lp[1], r:8, fill:col, stroke:'#fff', 'stroke-width':3 }));
    ends.push({ x:lp[0], y:lp[1], col, t:String(rows[rows.length-1][k] || 0) });
  });
  if (Math.abs(ends[0].y - ends[1].y) < 22){ const mid = (ends[0].y + ends[1].y) / 2, up = ends[0].y <= ends[1].y ? 0 : 1; ends[up].y = mid - 12; ends[1 - up].y = mid + 12; }
  ends.forEach(e => svg.append(sv('text', { x:e.x + 14, y:e.y + 6, style:'fill:' + e.col + ';font-weight:800;font-size:19px' }, e.t)));
  const idxs = rows.length >= 5 ? [0, Math.floor((rows.length - 1) / 2), rows.length - 1] : rows.map((_, i) => i);
  idxs.forEach(i => svg.append(sv('text', { x:X(i), y:H - 10, 'text-anchor': i === 0 && rows.length > 1 ? 'start' : (i === rows.length - 1 && rows.length > 1 ? 'end' : 'middle') }, shortDate(rows[i].d))));
  return svg;
}
const legend = () => h('div', { class:'legend' }, h('span', {}, h('i', { style:'background:#FF4D5E' }), 'Cuffin & ' + S.name), h('span', {}, h('i', { style:'background:repeating-linear-gradient(90deg,#9C6BFF 0 6px,transparent 6px 10px)' }), 'The Mirror'));
function chartRows(){
  const rows = S.history.filter(r => r.mf != null).slice(-14).map(r => Object.assign({}, r));
  const now = { d:today(), m:masteredCount(), p:S.points, mf:S.race.mf, mm:S.race.mm };
  if (rows.length && rows[rows.length - 1].d === now.d) rows[rows.length - 1] = now; else if (S.stats.answered) rows.push(now);
  return rows;
}

/* ---------- Progress: one chart, flip between fish and words ---------- */
let progView = 'fish';
function progress(){
  screen = 'progress';
  const c = counts(), T = mainItems().length, rows = chartRows();
  const seg = [['mastered','var(--win)','Mastered'],['lock','var(--gold)','Nearly there'],['learning','var(--sim)','Learning'],['new','var(--line)','Not seen yet']];
  const pick = v => h('button', { type:'button', 'aria-pressed':String(progView === v), onclick:() => { progView = v; SND.fx('tap'); progress(); } }, v === 'fish' ? '🐟 FRESH FISH' : '🔒 WORDS MASTERED');
  mount([
    topbar(),
    h('h2', { text:'The race so far' }),
    h('div', { class:'seg', role:'group', 'aria-label':'Choose chart' }, pick('fish'), pick('words')),
    h('div', { class:'panel grow' }, legend(), h('div', { class:'chartbox' }, raceChart(rows, progView === 'fish' ? 'p' : 'm', progView === 'fish' ? 'mf' : 'mm', progView === 'fish' ? 'Fresh fish over time' : 'Words mastered over time'))),
    h('div', { class:'panel', style:'flex:none' }, h('div', { class:'row', style:'justify-content:space-between' }, h('b', { text:'My ' + T + ' words' }), h('span', { class:'pots', style:'color:var(--ink);background:var(--custard-soft);border-color:var(--custard)', text:'🍮 ' + (S.custard || 0) + ' pots' })),
      h('div', { class:'stackbar', role:'img', 'aria-label':seg.map(s => c[s[0]] + ' ' + s[2].toLowerCase()).join(', ') }, seg.map(s => c[s[0]] ? h('i', { style:'width:' + (100 * c[s[0]] / T) + '%;background:' + s[1] }) : null)),
      h('div', { class:'keys' }, seg.map(s => h('span', {}, h('i', { style:'background:' + s[1] }), h('b', { text:String(c[s[0]]) }), ' ' + s[2]))),
      wordListBtns())
  ], 'progress');
}
SCREENS.progress = progress;

/* ---------- the trophy cabinet: one original football trophy per rank ---------- */
const TROPHY_NAMES = ['Kick-off Medal','First Goal Medal','Silver Medal','Gold Medal','Club Shield','League Shield','County Cup','Silver Cup','Golden Cup','Grand Final Cup','Golden Ball','The Puffin Crown Cup'];
const SHORT_RANK = { 'Honorary Member of the Puffin Community':'Honorary Member', 'Leader of the Puffin Community':'Leader' };
const METAL = { b:['#E79A57','#A65F28'], s:['#E6ECF7','#97A4BF'], g:['#FFD34D','#C99400'] };
const TMETAL = ['b','b','s','g','s','g','s','s','g','g','g','g'];
const F = k => 'style="fill:var(--' + k + ')"';
const BALL = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" ' + F('w') + '/><path d="M' + x + ' ' + (y - r * .55) + 'l' + (r * .52) + ' ' + (r * .38) + 'l-' + (r * .2) + ' ' + (r * .6) + 'h-' + (r * .64) + 'l-' + (r * .2) + '-' + (r * .6) + 'z" ' + F('d') + '/>';
const STAR = (x, y, s) => '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M0-8l2.4 5 5.4.6-4 3.7 1.1 5.3L0 3.9l-4.9 2.7 1.1-5.3-4-3.7 5.4-.6z" ' + F('w') + '/>';
const SHINE = '<path d="M22 12h4v8c0 5 2 9 5 11-6-1-9-6-9-12z" fill="#fff" opacity=".35"/>';
const medal = sym => '<path d="M21 2h10l4 20H25z" ' + F('r1') + '/><path d="M33 2h10l-4 20H29z" ' + F('r2') + '/><circle cx="32" cy="41" r="17" ' + F('d') + '/><circle cx="32" cy="41" r="14" ' + F('m') + '/><circle cx="32" cy="41" r="10" ' + F('d') + ' opacity=".25"/>' + sym;
const handles = (y, w) => '<path d="M18 ' + y + 'h-' + w + 'c0 9 4 13 10 14M46 ' + y + 'h' + w + 'c0 9-4 13-10 14" fill="none" stroke-width="4" stroke-linecap="round" style="stroke:var(--m)"/>';
const cupBody = '<path d="M18 10h28v9c0 11-6 17-14 17s-14-6-14-17z" ' + F('m') + '/>' + SHINE + '<rect x="29" y="35" width="6" height="7" ' + F('d') + '/><path d="M22 42h20l2 6H20z" ' + F('m') + '/>';
const TROPHY_SVG = [
  medal(BALL(32, 41, 6.5)),
  medal(STAR(32, 41, 1)),
  medal('<path d="M23 41c3-4 7-5 10-5 3 0 5 2 6 4l3-3v8l-3-3c-1 2-3 4-6 4-3 0-7-1-10-5z" ' + F('w') + '/>'),
  medal('<path d="M24 46l-1-9 5 4 4-6 4 6 5-4-1 9z" ' + F('w') + '/>'),
  '<path d="M14 6h36v21c0 16-9 25-18 31C23 52 14 43 14 27z" ' + F('d') + '/><path d="M18 10h28v17c0 13-7 20-14 25-7-5-14-12-14-25z" ' + F('m') + '/>' + BALL(32, 27, 8),
  '<path d="M14 4h36v21c0 16-9 23-18 29C23 48 14 41 14 25z" ' + F('d') + '/><path d="M18 8h28v17c0 13-7 18-14 23-7-5-14-10-14-23z" ' + F('m') + '/>' + BALL(32, 25, 7) + '<path d="M8 46h48l-4 6 4 6H8l4-6z" ' + F('r1') + '/>' + STAR(22, 51, .45) + STAR(32, 51, .45) + STAR(42, 51, .45),
  handles(13, 6) + cupBody + '<rect x="16" y="48" width="32" height="10" rx="2" ' + F('d') + '/>',
  handles(13, 6) + cupBody + '<rect x="14" y="48" width="36" height="14" rx="2" ' + F('d') + '/><rect x="23" y="52" width="18" height="5" rx="1" ' + F('w') + ' opacity=".7"/>' + '<path d="M26 22c2-3 5-3 7-3 2 0 3 1 4 2l2-2v5l-2-2c-1 1-2 2-4 2-2 0-5 0-7-2z" ' + F('w') + '/>',
  '<circle cx="32" cy="4" r="3" ' + F('m') + '/><path d="M18 14c0-5 6-8 14-8s14 3 14 8z" ' + F('d') + '/>' + handles(17, 6) + '<path d="M18 14h28v8c0 10-6 15-14 15s-14-5-14-15z" ' + F('m') + '/><path d="M22 16h4v7c0 5 2 8 5 10-6-1-9-5-9-11z" fill="#fff" opacity=".35"/><rect x="29" y="37" width="6" height="6" ' + F('d') + '/><path d="M21 43h22l2 5H19z" ' + F('m') + '/><rect x="14" y="48" width="36" height="14" rx="2" ' + F('d') + '/>' + STAR(32, 25, .7),
  '<path d="M20 10c-9 0-9 14 2 16M44 10c9 0 9 14-2 16" fill="none" stroke-width="4" stroke-linecap="round" style="stroke:var(--m)"/><path d="M19 4h26l-2 17c-1 9-5 14-11 14s-10-5-11-14z" ' + F('m') + '/><path d="M23 7h4l1 12c0 6 2 10 4 12-5-1-8-5-8-11z" fill="#fff" opacity=".35"/>' + STAR(32, 17, .8) + '<path d="M29 35h6l1 9h-8z" ' + F('d') + '/><path d="M21 44h22l2 5H19z" ' + F('m') + '/><rect x="16" y="49" width="32" height="6" rx="1" ' + F('d') + '/><rect x="12" y="55" width="40" height="7" rx="2" ' + F('m') + '/>',
  '<circle cx="32" cy="22" r="16" ' + F('m') + '/><path d="M32 14l6 4.4-2.3 7h-7.4l-2.3-7z" ' + F('d') + '/><path d="M32 6v8M38 18.4l8.5-2.8M35.7 25.4l5.2 7M28.3 25.4l-5.2 7M26 18.4l-8.5-2.8" fill="none" stroke-width="2" style="stroke:var(--d)"/><circle cx="26" cy="15" r="4" fill="#fff" opacity=".35"/><path d="M25 38h14l-2 8H27z" ' + F('d') + '/><rect x="14" y="46" width="36" height="16" rx="2" ' + F('m') + '/><rect x="22" y="51" width="20" height="5" rx="1" ' + F('d') + ' opacity=".6"/>',
  '<path d="M20 13l-2-10 7 5 7-7 7 7 7-5-2 10z" ' + F('m') + '/><circle cx="25" cy="9" r="1.6" ' + F('r1') + '/><circle cx="32" cy="7" r="1.8" ' + F('r2') + '/><circle cx="39" cy="9" r="1.6" ' + F('r1') + '/>' + '<path d="M14 18H7c0 11 5 15 12 16M50 18h7c0 11-5 15-12 16" fill="none" stroke-width="4" stroke-linecap="round" style="stroke:var(--m)"/><path d="M14 14h36v10c0 13-8 21-18 21s-18-8-18-21z" ' + F('m') + '/><path d="M18 17h4v8c0 7 3 12 7 15-8-1-11-8-11-15z" fill="#fff" opacity=".35"/>' + BALL(32, 27, 6.5) + '<rect x="28" y="45" width="8" height="5" ' + F('d') + '/><path d="M20 50h24l2 4H18z" ' + F('m') + '/><rect x="12" y="54" width="40" height="9" rx="2" ' + F('d') + '/><rect x="22" y="56.5" width="20" height="4" rx="1" ' + F('m') + '/>'
];
function trophyEl(i, state){
  const s = h('span', { class:'tsv', 'aria-hidden':'true' });
  const [m, d] = METAL[TMETAL[i]];
  const vars = state === 'locked' ? '' : '--m:' + m + ';--d:' + d + ';--w:#FFFFFF;--r1:#D7263D;--r2:#1D5BD8';
  s.innerHTML = '<svg viewBox="0 0 64 64" style="' + vars + '">' + TROPHY_SVG[i] + '</svg>';   // constant markup, no user text
  return s;
}
function trophies(){
  screen = 'trophies';
  const m = masteredCount(), ri = rankInfo(m), t = ri.table;
  const pct = ri.next ? Math.round(100 * (m - ri.cur.at) / Math.max(1, ri.next.at - ri.cur.at)) : 100;
  const def = ri.next ? (ri.next.at - m) + ' more words to win the ' + TROPHY_NAMES[ri.i + 1] : 'Every trophy won. Leader of the Puffin Community!';
  const sub = h('div', { class:'small muted', 'aria-live':'polite', text:def });
  const cells = t.map((r, i) => {
    const state = i <= ri.i ? 'won' : i === ri.i + 1 ? 'next' : 'locked';
    const label = SHORT_RANK[r.name] || r.name;
    const b = h('button', { class:'tr ' + state + (i === ri.i ? ' now' : '') + (i === t.length - 1 ? ' top' : ''), type:'button',
      'aria-label':TROPHY_NAMES[i] + ', ' + r.name + ', ' + (i === t.length - 1 ? 'every word' : r.at + ' words') + (state === 'won' ? ', won' : ', not won yet'),
      onclick:() => { SND.fx('tap'); cab.querySelectorAll('.tr').forEach(x => x.classList.remove('sel')); b.classList.add('sel');
        sub.textContent = TROPHY_NAMES[i] + ' · ' + r.name + ' · ' + (i === t.length - 1 ? 'master every word' : r.at + ' words') + (state === 'won' ? ' · WON!' : ''); } },
      trophyEl(i, state), state === 'next' ? h('span', { class:'lk', 'aria-hidden':'true' }, icon('lock')) : null,
      h('span', { class:'n', text:label }), h('span', { class:'w', text: state === 'won' ? '✓ won' : (i === t.length - 1 ? 'every word' : r.at + ' words') }));
    return b;
  });
  const cab = h('div', { class:'cabinet' }, cells);
  const badgesN = Object.keys(S.badges).length;
  mount([
    topbar(),
    h('div', { class:'row', style:'justify-content:space-between;flex:none' }, h('h2', { text:'Trophy cabinet' }), h('span', { class:'pots', style:'color:var(--ink);background:var(--gold-soft);border-color:var(--gold)', text:'🏆 ' + (ri.i + 1) + ' of ' + t.length })),
    h('div', { class:'panel', style:'flex:none;gap:5px' }, h('div', { class:'row', style:'justify-content:space-between' }, h('span', { class:'rankname', text:ri.cur.name }), h('span', { class:'small muted', text:m + ' words' })),
      h('div', { class:'bar', role:'progressbar', 'aria-label':'Progress to the next trophy', 'aria-valuenow':pct, 'aria-valuemin':0, 'aria-valuemax':100 }, h('i', { style:'width:' + pct + '%' })), sub),
    cab,
    rabbitItems().length ? (() => { const rsub = h('div', { class:'small muted', 'aria-live':'polite', text:'Tap a Rabbit trophy to see how to win it.' });
      return h('div', { class:'panel rcab', style:'flex:none;gap:4px' }, h('div', { class:'row', style:'justify-content:space-between' }, h('b', { text:'🐰 Rabbit trophies' }), h('span', { class:'small muted', text:'🥕 ' + (S.carrots || 0) })), rabbitGate(true),
        h('div', { class:'rtrow' }, RABBIT_TROPHIES.map(t => { const won = !!(S.rtrophy || {})[t.id];
          return h('button', { class:'tr mini ' + (won ? 'won' : 'locked'), type:'button', 'aria-label':t.name + (won ? ', won' : ', not won yet'), onclick:() => { SND.fx('tap'); rsub.textContent = t.name + ' · ' + t.d + (won ? ' · WON!' : ''); } }, rabbitTrophyEl(t, won ? 'won' : 'locked'), h('span', { class:'n', text:t.name })); })), rsub); })() : null,
    h('div', { class:'homerow', style:'flex:none' }, h('button', { class:'btn alt small', type:'button', onclick:badgeSheet }, '🏅 Badges ' + badgesN + '/' + BADGES.length), h('button', { class:'btn alt small', type:'button', onclick:prizeSheet }, '🎁 Prizes'))
  ], 'trophies');
}
SCREENS.trophies = trophies;
function badgeSheet(){
  const info2 = h('p', { class:'binfo', 'aria-live':'polite', text:'Tap a badge to see what it is for.' });
  const grid = h('div', { class:'bgrid' }, BADGES.map(b => { const got = !!S.badges[b.id];
    const el = h('button', { class:'bdg' + (got ? '' : ' locked'), type:'button', 'aria-pressed':'false', 'aria-label':b.n + (got ? ', won' : ', not won yet'), onclick:() => {
      grid.querySelectorAll('.bdg').forEach(x => x.setAttribute('aria-pressed', 'false')); el.setAttribute('aria-pressed', 'true'); SND.fx('tap');
      put(info2, h('b', { text:b.n }), ' · ' + b.d + (got ? ' Won!' : '')); } }, got ? (b.em ? h('span', { class:'bem', 'aria-hidden':'true', text:b.em }) : icon(b.ic)) : icon('lock')); return el; }));
  const won = BADGES.filter(b => S.badges[b.id]).length;
  openSheet([h('h2', {}, 'Badges ', h('span', { class:'muted', style:'font-size:.8em', text:won + ' of ' + BADGES.length })), h('div', { class:'bscroll' }, grid), info2, h('button', { class:'btn alt wide', type:'button', onclick:closeSheet }, 'Close')], true);
}
function prizeSheet(){
  const m = masteredCount(), list = S.prizes.slice().sort((a, b) => a.at - b.at);
  openSheet([h('h2', { text:'Prizes from Mum and Dad' }),
    list.length ? h('div', { class:'mlist' }, list.map(p => h('div', { class:'mitem' }, h('span', { class:'em', 'aria-hidden':'true', text: p.given ? '✅' : m >= p.at ? '🎁' : '🔒' }),
      h('span', {}, p.text || 'A surprise', h('small', { text: p.at + ' words mastered' + (p.given ? ' · received' : m >= p.at ? ' · earned! Ask a grown-up' : '') }))))) :
      h('p', { class:'muted', text:'No prizes set yet. A grown-up can add some in Grown-ups.' }),
    h('button', { class:'btn alt wide', type:'button', onclick:closeSheet }, 'Close')], true);
}

/* ---------- Grown-ups: one section at a time ---------- */
let parentOK = false, gTab = 'play';
/* a button that needs a second tap: "Sure? Tap again" */
function sureBtn(label, fn){
  let armed = false, t = null;
  const b = h('button', { class:'btn alt small', type:'button', onclick:async () => {
    if (!armed){ armed = true; put(b, 'Sure? Tap again'); b.classList.add('warn'); t = setTimeout(() => { armed = false; put(b, label); b.classList.remove('warn'); }, 4000); return; }
    clearTimeout(t); b.disabled = true; await fn(); } }, label);
  return b;
}
function sw(id, on, label, sub, fn){
  const b = h('button', { class:'switch', id, type:'button', role:'switch', 'aria-checked':String(on), 'aria-label':label, onclick:() => { const v = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', String(v)); fn(v); } });
  return h('div', { class:'set' }, h('div', { class:'lbl' }, h('b', { text:label }), h('span', { class:'small muted', text:sub })), b);
}
function grownups(){
  screen = 'grownups';
  if (S.pin && !parentOK){
    const inp = h('input', { class:'fld', id:'pinin', type:'password', inputmode:'numeric', autocomplete:'off', 'aria-label':'PIN', style:'max-width:200px' });
    const msg = h('p', { class:'small', style:'color:var(--miss)' });
    mount([topbar(), h('div', { class:'panel' }, h('h2', { text:'Grown-ups' }), h('p', { class:'muted', text:'Enter the PIN to continue.' }),
      h('form', { class:'row', onsubmit:e => { e.preventDefault(); if (inp.value === S.pin){ parentOK = true; grownups(); } else { msg.textContent = 'That is not the PIN.'; inp.value = ''; } } }, inp, h('button', { class:'btn small', type:'submit' }, 'Unlock')), msg)], 'grownups');
    setTimeout(() => inp.focus(), 30); return;
  }
  const nb = bookStore().list.filter(e => e.d === today()).length;
  const tabs = [['play','Play'],['insights','Insights'],['check','Check words' + (Object.values(S.practice || {}).filter(p => p.on).length ? ' 🔁' : '')],['school','School' + (schoolDue() ? ' ⚠️' : '')],['book','Book' + (nb ? ' (' + nb + ' today)' : '')],['saves','Saves'],['words','Words'],['prizes','Prizes'],['how','How it works'],['more','More']];
  const bar = h('div', { class:'subtabs', role:'group', 'aria-label':'Grown-ups sections' }, tabs.map(([id, t]) => h('button', { type:'button', 'aria-pressed':String(gTab === id), onclick:() => { gTab = id; grownups(); } }, t)));
  const panel = h('div', { class:'panel grow', style:'overflow-y:auto' });
  const c = counts(), T = mainItems().length;
  if (gTab === 'play'){
    put(panel,
      sw('sw-hints', S.settings.hints, 'Hints', S.settings.hints ? 'On: “not sure” explanations, peeks and hint buttons.' : 'Off (test mode): no hints, every answer is ' + S.name + '’s own.', v => { S.settings.hints = v; save(); grownups(); }),
      sw('sw-sound', S.settings.sound, 'All sounds', 'Goals, misses, the Mirror and music. ' + S.name + ' can also switch this with the speaker button.', v => { S.settings.sound = v; if (!v){ S.settings.music = false; SND.stop(); SND.loop(false); } save(); grownups(); if (v){ SND.prime(); SND.fx('goal'); } }),
      sw('sw-cv', S.settings.cvoice !== false, 'Cuffin’s voice', 'The recorded Cuffin lines.', v => { S.settings.cvoice = v; if (!v) VOICE.stop(); save(); grownups(); }),
      sw('sw-mv', S.settings.mvoice !== false, 'The Mirror’s voice', 'The recorded Mirror lines.', v => { S.settings.mvoice = v; if (!v) VOICE.stop(); save(); grownups(); }),
      remindBlock(),
      sw('sw-music', S.settings.music, 'Music', 'Story fanfare, chapter sting, crowning anthem, match groove.', v => { S.settings.music = v; if (v) S.settings.sound = true; save(); grownups(); if (!v){ SND.stop(); SND.loop(false); } else { SND.prime(); SND.tune('win'); } }),
      h('div', { class:'set' }, h('div', { class:'lbl' }, h('b', { text:'Pie the Mirror' }), h('span', { class:'small muted', text:'Once a day, after the daily goal: 6 splats or 2 minutes. Sessions today: ' + pieUsed() + ' of ' + pieAllowed() + '.' })),
        h('button', { class:'btn alt small', type:'button', onclick:() => { S.pieBonus = { d:today(), n:((S.pieBonus && S.pieBonus.d === today()) ? S.pieBonus.n : 0) + 1 }; save(); toast('Extra pie session added for today'); grownups(); } }, '🥧 Extra session today')),
      h('div', { class:'set' }, h('div', { class:'lbl' }, h('b', { text:'Previews' }), h('span', { class:'small muted', text:'These do not change any progress.' }))),
      h('div', { class:'row' }, h('button', { class:'btn alt small', type:'button', onclick:() => intro(() => grownups()) }, 'The story'), h('button', { class:'btn alt small', type:'button', onclick:() => chapter(() => grownups()) }, 'Today’s chapter'), h('button', { class:'btn alt small', type:'button', onclick:() => ceremony(true, () => grownups()) }, 'The crowning')));
  } else if (gTab === 'school'){
    put(panel, schoolPanel());
  } else if (gTab === 'insights'){
    put(panel, insightsPanel());
  } else if (gTab === 'check'){
    put(panel, checkPanel());
  } else if (gTab === 'book'){
    const L = bookStore().list.slice(0, 120), days = {};
    L.forEach(e => { (days[e.d] = days[e.d] || []).push(e); });
    const st = e => e.ok || e.chk === 'ok' ? ['✅', 'Typed it from the book at the Book check'] : e.chk === 'miss' ? ['❌', 'Missed it at the Book check'] : e.pinky ? ['🤙', 'Pinky-promised it’s written'] : ['…', 'Not checked yet'];
    put(panel, h('p', { class:'small muted', text:'Words ' + S.name + ' should have written in his vocabulary book, by day. ✅ checked · ❌ missed at the check · 🤙 pinky-promised · … not checked yet.' }),
      L.length ? h('div', { class:'saves grow' }, Object.keys(days).sort().reverse().map(d => [h('div', { class:'bkday', text:longDate(d) + ' · ' + days[d].length + ' word' + (days[d].length === 1 ? '' : 's') }),
        days[d].map(e => { const [i, t] = st(e); return h('div', { class:'sv' }, h('div', { class:'d' }, h('b', { text:e.w }), h('span', { class:'muted', text:(e.m || '') + (e.s ? ' · similar ' + e.s + ', opposite ' + e.o : '') })), h('span', { class:'you', title:t, 'aria-label':t, text:i })); })])) : h('p', { class:'muted', text:'Nothing written yet.' }));
  } else if (gTab === 'saves'){
    const list = h('div', { class:'saves grow' }, h('p', { class:'muted', text:'Loading…' }));
    const drawSaves = async () => {
      const rows = await listSaves();
      if (!rows.length) return put(list, h('p', { class:'muted', text:'No save points yet.' }));
      put(list, rows.map(r => { const conf = h('div');
        const go = h('button', { class:'btn alt small', type:'button', onclick:() => put(conf, h('div', { class:'confirm' }, h('span', { text:'Go back to this? Today’s progress is saved first, so you can undo.' }),
          h('div', { class:'row' }, h('button', { class:'btn small', type:'button', onclick:async () => { await restoreSave(r); toast('Went back to ' + r.name); grownups(); } }, 'Yes, go back'), h('button', { class:'btn alt small', type:'button', onclick:() => put(conf) }, 'Cancel')))) }, 'Go back');
        return h('div', {}, h('div', { class:'sv' }, h('div', { class:'d' }, h('b', { text:r.name || 'Save point' }), h('span', { class:'muted', text:new Date(r.at).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) + ' · ' + r.a + '–' + r.m + ' fish · ' + r.w + ' words' })),
          h('div', { class:'row', style:'gap:2px;flex-wrap:nowrap' }, go, (() => { let armed = false; const x = h('button', { class:'linkbtn', type:'button', 'aria-label':'Delete ' + (r.name || 'save point'), onclick:async () => { if (!armed){ armed = true; put(x, 'Delete?'); x.style.color = 'var(--miss)'; setTimeout(() => { armed = false; put(x, '✕'); x.style.color = ''; }, 4000); return; } await deleteSave(r); drawSaves(); } }, '✕'); return x; })())), conf); }));
    };
    const rst = h('input', { class:'fld', id:'rstin', type:'text', placeholder:'Type RESTART', 'aria-label':'Type RESTART to confirm', style:'max-width:150px' });
    const rbtn = h('button', { class:'btn alt small', type:'button', disabled:true, onclick:async () => {
      await addSave('Before restart · ' + stamp());
      const keep = { words:S.words, bank:S.bank, prizes:S.prizes.map(p => Object.assign({}, p, { announced:false, given:false })), name:S.name, pin:S.pin, settings:S.settings, autoSave:S.autoSave };
      S = Object.assign(fresh(), keep); S.epoch = Date.now(); SYNC.allowBlank = true; home.recapDone = true; save(); toast('Restarted. Tap Home to see the story.'); grownups(); } }, 'Restart from scratch');
    rst.addEventListener('input', () => { rbtn.disabled = rst.value.trim().toUpperCase() !== 'RESTART'; });
    put(panel, h('p', { class:'small muted', text: SYNC.ready ? 'Progress syncs to the family after every answer. Save points are snapshots to go back to: one is made automatically each day the game opens, and before anything replaces progress.' : 'Progress is saved in this browser. Save points are snapshots to go back to.' }),
      h('button', { class:'btn small', type:'button', style:'align-self:flex-start', onclick:async () => { if (await addSave('Grown-up save · ' + stamp())){ toast('Save point made'); drawSaves(); } } }, icon('save'), 'Make a save point'),
      list, h('div', { class:'notice' }, h('b', { text:'Restart from scratch. ' }), 'Clears fish, words, custard, badges, the race and the crown; the story plays again. A save point is made first.', h('div', { class:'row', style:'margin-top:6px' }, rst, rbtn)));
    drawSaves();
  } else if (gTab === 'words'){
    const ta = h('textarea', { id:'bankin', placeholder:'word, meaning | example sentence\nilluminate, To light something up | The torch will illuminate the cave.', 'aria-label':'Words and meanings' });
    const mode = h('select', { class:'fld', id:'bankmode', 'aria-label':'Import mode' }, h('option', { value:'replace', text:'Replace the word bank' }), h('option', { value:'add', text:'Add to the word bank' }));
    const msg = h('p', { class:'small', 'aria-live':'polite' });
    const file = h('input', { type:'file', accept:'.csv,.txt,.tsv,text/plain,text/csv', id:'bankfile', 'aria-label':'Choose a word file' });
    file.addEventListener('change', () => { const f = file.files[0]; if (!f) return; const fr = new FileReader(); fr.onload = () => { ta.value = String(fr.result); msg.textContent = 'File loaded. Check it, then Import.'; }; fr.readAsText(f); });
    put(panel, h('b', { text:'Word bank: ' + S.bank }), h('p', { class:'small muted', text:'One per line: word, meaning. Add “|” and a sentence containing the word for Fill the gap. The ' + CARDS.length + ' cards are always included.' }),
      file, ta, h('div', { class:'row' }, h('div', { style:'flex:1;min-width:140px' }, mode), h('button', { class:'btn small', type:'button', onclick:() => importWords(ta.value, mode.value, msg) }, 'Import')), msg);
  } else if (gTab === 'prizes'){
    const list = h('div', { style:'display:flex;flex-direction:column;gap:6px' });
    const drawPrizes = () => {
      put(list, S.prizes.slice().sort((a, b) => a.at - b.at).map((p, i) => h('div', { class:'prize-row' },
        h('input', { class:'fld', id:'prz-at-' + i, type:'number', min:1, value:p.at, 'aria-label':'Words mastered', onchange:e => { p.at = Math.max(1, parseInt(e.target.value, 10) || 1); p.announced = masteredCount() >= p.at ? p.announced : false; save(); drawPrizes(); } }),
        h('input', { class:'fld', id:'prz-tx-' + i, type:'text', maxlength:80, value:p.text, placeholder:'e.g. Film night', 'aria-label':'Prize', onchange:e => { p.text = e.target.value; save(); } }),
        h('label', { class:'chk' }, h('input', { type:'checkbox', checked:p.given, onchange:e => { p.given = e.target.checked; save(); } }), 'Given'),
        h('button', { class:'linkbtn', type:'button', 'aria-label':'Remove prize', onclick:() => { S.prizes = S.prizes.filter(x => x !== p); save(); drawPrizes(); } }, '✕'))));
      if (!S.prizes.length) list.append(h('p', { class:'muted small', text:'No prizes yet. For example: 25 words mastered, ice cream trip.' }));
    };
    drawPrizes();
    put(panel, h('p', { class:'small muted', text:'Words mastered to earn each prize. The game announces it after the match where he reaches it.' }), list,
      h('button', { class:'btn small', type:'button', style:'align-self:flex-start', onclick:() => { const base = Math.max(0, ...S.prizes.map(p => p.at)); S.prizes.push({ at:base + 10, text:'', announced:false, given:false }); save(); drawPrizes(); } }, 'Add a prize'));
  } else if (gTab === 'how'){
    put(panel, h('div', { class:'prose' },
      h('div', { class:'row', style:'gap:6px' }, h('span', { class:'chip', text:'Mastered ' + c.mastered + '/' + T }), h('span', { class:'chip', text:'Nearly there ' + c.lock }), h('span', { class:'chip', text:'Accuracy ' + (S.stats.answered ? accuracy() + '%' : '–') })),
      h('p', {}, h('b', { text:'Mastered: ' }), '3 right in a row, in 2 question types, on 2 different days, no hints. A miss knocks the run back by 2.'),
      h('p', {}, h('b', { text:'Review timing: ' }), 'each word has its own review date. Every new day he gets it right, the gap grows (1, 2, 4, 8 days…, faster once mastered, up to 2 months). A miss brings it back tomorrow. Each match starts with up to 3 words that are due, most overdue first.'),
      h('p', {}, h('b', { text:'Cards: ' }), 'must also include a fully right similar & opposite answer. After 2 right, the game steers the card to that test.'),
      h('p', {}, h('b', { text:'Wobbly: ' }), 'a mastered word that is missed stops counting until he gets it right again; two misses and it must be re-earned.'),
      h('p', {}, h('b', { text:'Vocabulary book: ' }), 'a miss or “not sure” asks him to write the word down before carrying on. At full time a Book check shows the meaning and he types the word from his book (+1 fish each). Written words come first in the next match.'),
      h('p', {}, h('b', { text:'Custard: ' }), 'a pot for every 5 in a row. Just for fun.'),
      h('p', {}, h('b', { text:'The Mirror: ' }), 'guesses every question, steered so he is never more than ' + LEAD_CAP + ' fish or ' + MAST_CAP + ' word ahead and always loses at the end. ' + S.name + '’s score is never adjusted.'),
      h('p', { class:'muted', text:'For a final check, switch hints off in Play.' })));
  } else {
    const nameIn = h('input', { class:'fld', id:'namein', type:'text', value:S.name, style:'max-width:180px', onchange:e => { S.name = e.target.value.trim() || 'Aaron'; save(); toast('Name saved'); } });
    const pinIn = h('input', { class:'fld', id:'newpin', type:'text', inputmode:'numeric', maxlength:8, placeholder:S.pin ? 'PIN is set' : 'New PIN', 'aria-label':'New PIN', style:'max-width:130px' });
    const code = h('textarea', { id:'bkcode', placeholder:'Paste a backup code here to restore', 'aria-label':'Backup code', style:'min-height:56px' });
    const bmsg = h('p', { class:'small', 'aria-live':'polite' });
    const arch = archived();
    put(panel,
      h('div', { class:'row' }, h('label', { for:'namein', text:'Name' }), nameIn),
      h('p', { class:'small muted', text:'Game version: ' + APPV }),
      h('div', { class:'notice' }, h('b', { text:'Family code: ' }), (familyCode() && familyCode() !== 'LOCAL') ? familyCode() : 'not set (this device only)', ' ',
        h('button', { class:'linkbtn', type:'button', onclick:() => { setFamily(''); location.reload(); } }, 'Change')),
      (() => { const lg = (() => { try { return JSON.parse(localStorage.getItem(KEY + '-synclog') || 'null'); } catch (e) { return null; } })();
        const unsent = (S.upd || 0) > getBase();
        const t = lg ? new Date(lg.at).toLocaleString('en-GB', { weekday:'short', hour:'2-digit', minute:'2-digit' }) : 'never';
        const msg = h('span', { class:'small', text: unsent ? '⚠️ This device has progress not yet saved to the family. ' : '✅ Everything on this device is saved to the family. ' });
        return h('div', { class:'notice' }, msg, h('span', { class:'small muted', text:'Last contact: ' + t + (lg && !lg.ok ? ' (failed)' : '') + '. ' }),
          h('button', { class:'linkbtn', type:'button', onclick:async () => { toast('Syncing…'); await pull(false); grownups(); toast((S.upd || 0) > getBase() ? 'Still not saved: check the internet connection' : 'Saved to the family ✓'); } }, 'Sync now')); })(),
      h('div', { class:'row' }, pinIn, h('button', { class:'btn small', type:'button', onclick:() => { if (pinIn.value.trim()){ S.pin = pinIn.value.trim(); save(); toast('PIN saved'); grownups(); } } }, 'Set PIN'), S.pin ? h('button', { class:'linkbtn', type:'button', onclick:() => { S.pin = ''; save(); grownups(); } }, 'Remove') : null),
      h('p', { class:'small muted', text:'The PIN keeps ' + S.name + ' out of Grown-ups (including restart). It is a child-lock, not real security.' }),
      h('div', { class:'row' }, h('button', { class:'btn alt small', type:'button', onclick:() => { code.value = exportCode(); code.select(); } }, 'Show backup code'), h('button', { class:'btn alt small', type:'button', onclick:() => { if (!code.value) code.value = exportCode(); copyText(code); } }, 'Copy'),
        sureBtn('Restore', async () => { let o; try { o = migrate(importCode(code.value), true); } catch (e) { bmsg.style.color = 'var(--miss)'; bmsg.textContent = 'Paste a full backup code in the box first.'; return; } await addSave('Before restore · ' + stamp()); S = o; S.epoch = Date.now(); raceFix(); save(); toast('Progress restored'); grownups(); })),
      code, bmsg,
      arch ? h('div', { class:'row' }, sureBtn('Pre-race progress', async () => { try { const o = migrate(JSON.parse(arch), true); await addSave('Before pre-race restore · ' + stamp()); S = o; S.epoch = Date.now(); raceFix(); save(); toast('Pre-race progress restored'); grownups(); } catch (e) {} })) : null);
  }
  mount([topbar(), h('h2', { text:'Grown-ups' }), bar, panel], 'grownups');
}
SCREENS.grownups = grownups;

function copyText(el){
  el.select(); const ok = () => toast('Copied');
  const fb = () => { try { document.execCommand('copy'); ok(); } catch (e) { toast('Select the text and copy it'); } };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(el.value).then(ok, fb); else fb();
}
function exportCode(){ return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
function importCode(t){ const o = JSON.parse(decodeURIComponent(escape(atob(t.trim())))); if (!o || o.v !== 1 || !Array.isArray(o.words)) throw new Error('bad'); return o; }
function importWords(text, mode, msg){
  const lines = String(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const out = []; let skipped = 0;
  lines.forEach((l, i) => {
    if (i === 0 && /^"?word"?\s*[,\t;]/i.test(l)) return;
    let idx = l.indexOf('\t'); if (idx < 0) idx = l.indexOf(',');
    if (idx < 1){ skipped++; return; }
    const w = l.slice(0, idx).trim().replace(/^"|"$/g, '');
    let rest = l.slice(idx + 1).trim(), s = '';
    const bar = rest.indexOf('|'); if (bar > -1){ s = rest.slice(bar + 1).trim(); rest = rest.slice(0, bar).trim(); }
    const m = rest.replace(/^"|"$/g, '');
    if (!w || !m){ skipped++; return; }
    out.push(s ? { w, m, s } : { w, m });
  });
  if (!out.length){ msg.style.color = 'var(--miss)'; msg.textContent = 'No words found. Each line needs a word, a comma, then the meaning.'; return; }
  const seen = new Map();
  (mode === 'add' ? S.words.concat(out) : out).forEach(x => seen.set(norm(x.w), x));
  const bank = [...seen.values()];
  if (mode !== 'add' && bank.length < 4){ msg.style.color = 'var(--miss)'; msg.textContent = 'Please add at least 4 words.'; return; }
  S.words = bank; S.bank = (mode === 'add' ? 'Custom bank' : 'Custom list') + ' (' + bank.length + ')';
  const keys = new Set(bank.map(x => norm(x.w)));
  for (const k of Object.keys(S.prog)) if (!keys.has(k) && !k.startsWith('card:')) delete S.prog[k];
  raceFix(); S.demo = false; save();
  msg.style.color = 'var(--win)'; msg.textContent = 'Imported ' + out.length + ' words. The bank now has ' + bank.length + '.' + (skipped ? ' ' + skipped + ' skipped.' : '');
  toast('Word bank updated');
}
function loadDemo(){
  const ws = shuffle(allItems()), n = ws.length, target = Math.max(3, Math.round(n * 0.3)), days = 12, t0 = today(), y = addDays(t0, -1);
  S.prog = {}; S.history = []; S.rounds = []; S.badges = {}; S.points = 0; S.leader = null; S.custard = 6;
  S.stats = { answered:0, right:0, spell:0, fixed:0, best:0, rounds:0, perfect:0 };
  for (let i = 0; i < days; i++){
    const d = addDays(t0, -(days - 1 - i)), m = Math.round(target * Math.pow((i + 1) / days, 1.3)), p = Math.round(9 * (i + 1) * 1.6);
    S.history.push({ d, m, p, mf:Math.max(0, p - 2 - rnd(4) + (i % 4 === 1 ? 4 : 0)), mm:Math.max(0, m - rnd(2)) });
    const r = 5 + Math.min(5, Math.floor(i * 0.5) + rnd(2));
    S.rounds.push({ d, r:Math.min(10, r), n:10 }); S.stats.answered += 10; S.stats.right += Math.min(10, r);
  }
  S.stats.rounds = days; S.points = S.history[days - 1].p; S.stats.best = 6; S.stats.spell = 12; S.stats.fixed = 7;
  ws.forEach((x, i) => {
    const r = rec(x);
    if (i < target) Object.assign(r, { streak:3, seen:4, right:4, last:y, ty:['sim','w2m'], dy:[addDays(t0, -3), y], m:true });
    else if (i < target + 8) Object.assign(r, { streak:3, seen:3, right:3, last:y, ty:['sim','gap'], dy:[y] });
    else if (i < target + 14) Object.assign(r, { streak:0, seen:3, right:1, miss:2, last:t0, ty:[], dy:[] });
    else if (i < target + 20) Object.assign(r, { streak:1, seen:2, right:2, last:t0, ty:['w2m'], dy:[t0] });
  });
  S.race = { mf:S.points - 2, mm:Math.max(0, masteredCount() - 1), ms:0 };
  Object.assign(S.history[days - 1], { mf:S.race.mf, mm:S.race.mm, m:masteredCount() });
  S.last = y; S.demo = true; S.intro = true; S.lastVisit = { d:y, a:S.points - 14, m:S.race.mf - 11, w:Math.max(0, masteredCount() - 3), mw:Math.max(0, S.race.mm - 2), c:4, r:0 };
  checkBadges(); save();
}

/* ---------- test hooks (only with #test in the address) ---------- */
if (location.hash === '#test'){
  window.__cwq = {
    party: () => { S.goal = ''; celebrateAll(matchCelebrations({ rank0:0 }, [BADGES.find(b => b.id === 'd7'), BADGES[0]]), () => home()); },
    mastered: () => celebrateMastered(allItems()[0], () => home()),
    stop: () => { R = newRound(allItems().slice(0, 2), 'mixed'); bookStop(bookAdd(allItems()[3]), () => home()); },
    rescue: () => { const d1 = addDays(today(), -2), d2 = addDays(today(), -3); S.history = [{ d:d2, p:1 }, { d:d1, p:2 }]; S.freeze = []; S.freezeAsk = ''; S.custard = 3; save(); streakRescue(() => home()); },
    S: () => S, home: () => { home.recapDone = true; home(); }, ceremony: () => ceremony(true, () => home()), intro: () => intro(() => home()), chapter: () => chapter(() => home()),
    reset: () => { S = fresh(); S.intro = true; S.lastVisit = visitSnap(); save(); home.recapDone = true; home(); },
    demo: () => { loadDemo(); home.recapDone = true; home(); },
    round: kind => startRound(kind || 'mixed'), forceType: t => { FORCE = t || null; },
    lastVisitYesterday: () => { S.lastVisit = Object.assign(visitSnap(), { d:addDays(today(), -1), a:Math.max(0, S.points - 12), m:Math.max(0, S.race.mf - 9), w:Math.max(0, masteredCount() - 2), c:Math.max(0, (S.custard || 0) - 2) }); saveLocal(); home.recapDone = false; home(); },
    nearEnd: n => { const xs = allItems(); xs.forEach((x, i) => { Object.assign(rec(x), { seen:4, right:4, streak: i < xs.length - n ? 3 : 2, last:today(), ty:['w2m','sim'], dy:['2026-01-01', today()], m: i < xs.length - n }); });
      S.points = 400; S.race = { mf:398, mm:xs.length - n - 1, ms:0 }; S.intro = true; S.leader = null; save(); home.recapDone = true; home(); },
    endRound: () => { R = newRound([], 'mixed'); R.total = 1; finishRound(); },
    sim: (games, skill, maxQ, daysPer) => {
      const out = { games, questions:0, mirrorWins:0, maxFishLead:-1e9, maxMastLead:-1e9, finished:0, finishedAhead:0, simShare:0 };
      const keep = S; let close = 0, ahead = 0, total = 0, gap = 0, mgap = 0, sims = 0;
      for (let g = 0; g < games; g++){
        S = fresh(); S.intro = true; let q = 0, day = 0;
        while (q < (maxQ || 8000) && !allDone()){
          if (q % (daysPer || 40) === 0) day++;
          SIMDAY = '2027-' + pad(1 + Math.floor(day / 28) % 12) + '-' + pad(1 + day % 28);
          if (!S.history.some(x => x.d === SIMDAY)) S.history.push({ d:SIMDAY, p:S.points });
          R = newRound(pickWords(10, allItems()), 'mixed');
          while (R.idx < R.queue.length){
            const item = R.queue[R.idx], qq = makeQuestion(item); item.lastType = qq.type;
            const r0 = peek(item.w), p = Math.min(.97, skill + (r0 ? r0.streak * .05 : 0));
            if (qq.type === 'sim'){
              sims++;
              let f = 0, ms = 0; const s1 = Math.random() < p, s2 = Math.random() < Math.min(.98, p + .08);
              [s1, s2].forEach(ok => { if (ok){ S.points++; R.points++; f++; } if (!item.retry){ const t = mirrorTry(1); if (t.ok) ms++; } });
              scoreItem(item, qq, s1 && s2, f, false); if (!item.retry) mirrorMastery(ms === 2);
            } else {
              const ok = Math.random() < p; scoreItem(item, qq, ok, null, false);
              if (!item.retry){ const t = mirrorTry(mirrorGain(qq.type)); mirrorMastery(t.ok); }
            }
            const d = S.race.mf - S.points, dm = S.race.mm - masteredCount();
            out.maxFishLead = Math.max(out.maxFishLead, d); out.maxMastLead = Math.max(out.maxMastLead, dm);
            total++; gap -= d; mgap -= dm; if (d >= -5) close++; if (d > 0) ahead++;
            R.idx++; q++;
          }
          if (R.firstTry === R.total && R.total >= 5) S.points += 3;
          raceFix();
        }
        out.questions += q;
        if (allDone()){ out.finished++; if (S.points > S.race.mf && masteredCount() > S.race.mm) out.finishedAhead++; else out.mirrorWins++; }
      }
      SIMDAY = null;
      Object.assign(out, { meanGap:+(gap / total).toFixed(1), meanMastGap:+(mgap / total).toFixed(1), closeShare:+(close / total).toFixed(3), aheadShare:+(ahead / total).toFixed(3), simShare:+(sims / total).toFixed(2) });
      S = keep; R = null; saveLocal();
      return out;
    }
  };
}

/* ---------- boot ---------- */
window.addEventListener('hashchange', () => { if (location.hash === '#report'){ home.reportShown = false; home(); } });
$('#tabbar').addEventListener('click', e => { const b = e.target.closest('.tab'); if (!b) return; SND.fx('tap'); ({ home:() => { home.recapDone = true; home(); }, progress, trophies, grownups })[b.dataset.t](); });
raceFix();
(async () => {
  if (!familyCode()) await new Promise(r => familyScreen(r));
  if (famId(familyCode()).length >= 12 && FIREBASE_CONFIG.apiKey){
    mount([h('div', { class:'boot', role:'status' }, cimg(IMG.hello, 'float', 140, 'Cuffin'), h('div', { class:'eyebrow', text:'Loading your progress…' }))], null);
    await Promise.race([syncStart(), new Promise(r => setTimeout(r, 7000))]);
  } else syncStart();
  home();
})();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js', { updateViaCache:'none' }).catch(() => {});

})();
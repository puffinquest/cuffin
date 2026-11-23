/* ---------- sound: all synthesised with Web Audio, original music ---------- */
const SND = (() => {
  let ac = null, out, sfxBus, musBus, piece = null, loopTimer = null, loopAt = 0, loopStep = 0;
  const wantS = () => !!(S && S.settings && S.settings.sound);
  const wantM = () => !!(S && S.settings && S.settings.sound && S.settings.music);
  function ctx(){
    if (!ac){
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      try { ac = new C(); } catch (e) { return null; }
      out = ac.createDynamicsCompressor(); out.threshold.value = -14; out.ratio.value = 4; out.connect(ac.destination);
      sfxBus = ac.createGain(); sfxBus.gain.value = .6; sfxBus.connect(out);
      musBus = ac.createGain(); musBus.gain.value = .42; musBus.connect(out);
    }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    return ac;
  }
  const NOTE = s => { const m = /^([A-G])(#|b)?(-?\d)$/.exec(s); const b = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return 440 * Math.pow(2, (12 * (+m[3] + 1) + b - 69) / 12); };
  function tone(bus, f, t, d, o){
    o = o || {};
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type || 'square'; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
    if (o.det) osc.detune.value = o.det;
    const v = o.vol == null ? .2 : o.vol, a = o.a || .008, r = Math.min(o.r || .08, d * .9);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + a);
    g.gain.setValueAtTime(v, Math.max(t + a, t + d - r)); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    let node = osc;
    if (o.lp){ const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(o.lp, t); if (o.lpTo) fl.frequency.exponentialRampToValueAtTime(o.lpTo, t + Math.min(d, .3)); osc.connect(fl); node = fl; }
    if (o.vib){ const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = o.vib; lg.gain.value = f * .025; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + d); }
    node.connect(g); g.connect(bus); osc.start(t); osc.stop(t + d + .03);
  }
  let nbuf = null;
  function noise(bus, t, d, o){
    o = o || {};
    if (!nbuf){ nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const ch = nbuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
    const s = ac.createBufferSource(); s.buffer = nbuf; s.loop = true;
    const fl = ac.createBiquadFilter(); fl.type = o.type || 'bandpass'; fl.frequency.setValueAtTime(o.f || 1000, t); if (o.fTo) fl.frequency.exponentialRampToValueAtTime(o.fTo, t + d); fl.Q.value = o.q || 1;
    const g = ac.createGain(), v = o.vol || .2;
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + (o.a || .005)); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(fl); fl.connect(g); g.connect(bus); s.start(t); s.stop(t + d + .05);
  }
  /* instruments */
  const brass = (bus, notes, t, d, vol) => notes.forEach(n => [-8, 8].forEach(det => tone(bus, NOTE(n), t, d, { type:'sawtooth', vol:vol || .05, a:.05, r:.15, lp:700, lpTo:2400, det })));
  const horn = (bus, n, t, d, vol) => { tone(bus, NOTE(n), t, d, { type:'sawtooth', vol:vol || .09, a:.03, r:.12, lp:1200, lpTo:3200, vib: d > .5 ? 5 : 0 }); tone(bus, NOTE(n), t, d, { type:'square', vol:(vol || .09) * .35, a:.03, r:.12, lp:1800 }); };
  const timp = (bus, t, n, vol) => { const f = NOTE(n || 'D2'); tone(bus, f, t, .7, { type:'sine', vol:vol || .45, a:.004, r:.5, to:f * .82 }); noise(bus, t, .09, { f:240, vol:.12 }); };
  const string = (bus, n, t, d, vol) => tone(bus, NOTE(n), t, d, { type:'triangle', vol:vol || .05, a:.25, r:.4, vib:5 });
  const cym = (bus, t, d, vol) => noise(bus, t, d || 1.2, { type:'highpass', f:6000, vol:vol || .07, a:.002 });
  const hat = (bus, t, vol) => noise(bus, t, .05, { type:'highpass', f:8000, vol:vol || .05 });
  const kick = (bus, t, vol) => tone(bus, 120, t, .18, { type:'sine', to:45, vol:vol || .35, a:.002, r:.12 });
  const snare = (bus, t, vol) => { noise(bus, t, .14, { f:1800, q:.6, vol:vol || .12 }); tone(bus, 190, t, .08, { type:'triangle', vol:.08 }); };

  /* sound effects */
  const FX = {
    tap(t){ tone(sfxBus, 1200, t, .04, { type:'triangle', vol:.05 }); },
    right(t){ ['C5','E5','G5','C6'].forEach((n, i) => tone(sfxBus, NOTE(n), t + i * .065, .14, { type:'square', vol:.07, lp:3500 }));
      tone(sfxBus, NOTE('E6'), t + .27, .55, { type:'triangle', vol:.12 }); tone(sfxBus, NOTE('G6'), t + .3, .5, { type:'sine', vol:.07 });
      noise(sfxBus, t + .25, .6, { type:'highpass', f:5000, vol:.04 }); },
    goal(t){ FX.right(t); noise(sfxBus, t + .1, 1.6, { f:900, q:.4, vol:.12, a:.25 }); for (let i = 0; i < 10; i++) noise(sfxBus, t + .25 + Math.random() * 1.1, .05, { f:2500, q:1.5, vol:.06 }); },
    wrong(t){ let tt = t; [['G3',.2],['F#3',.2],['F3',.2],['E3',.75]].forEach(([n, d], i) => { tone(sfxBus, NOTE(n), tt, d, { type:'sawtooth', vol:.1, a:.02, lp:600, lpTo:1400, vib: i === 3 ? 7 : 0 }); tt += d; }); },
    mRight(t){ [['C4',.12],['Eb4',.12],['F#4',.12],['G4',.32]].reduce((tt, [n, d]) => { tone(sfxBus, NOTE(n), tt, d, { type:'triangle', vol:.12, a:.003, r:.06 }); return tt + d + .03; }, t);
      tone(sfxBus, NOTE('G2'), t + .5, .4, { type:'sawtooth', vol:.07, lp:500 }); },
    mWrong(t){ tone(sfxBus, 180, t, .22, { type:'sine', to:700, vol:.16 }); tone(sfxBus, 700, t + .22, .4, { type:'sine', to:120, vol:.13 }); },
    flip(t){ noise(sfxBus, t, .4, { f:300, fTo:5000, q:.9, vol:.12 }); tone(sfxBus, NOTE('A5'), t + .32, .12, { type:'square', vol:.06 }); tone(sfxBus, NOTE('E6'), t + .42, .2, { type:'square', vol:.06 }); },
    peek(t){ tone(sfxBus, NOTE('E6'), t, .08, { type:'sine', vol:.07 }); tone(sfxBus, NOTE('B6'), t + .06, .12, { type:'sine', vol:.05 }); },
    tile(t){ tone(sfxBus, 660 + Math.random() * 200, t, .06, { type:'triangle', vol:.07 }); },
    fish(t){ [0, .08, .16].forEach((d, i) => tone(sfxBus, NOTE(['G5','B5','D6'][i]), t + d, .08, { type:'square', vol:.05 })); },
    whistle(t){ tone(sfxBus, 2300, t, .5, { type:'sine', vol:.12, vib:28 }); },
    page(t){ noise(sfxBus, t, .18, { f:1500, fTo:400, q:.8, vol:.08 }); },
    custard(t){ FX.goal(t); [0, .12, .24, .36].forEach((d, i) => tone(sfxBus, 300 + i * 40, t + .55 + d, .16, { type:'sine', vol:.14, vib:14, to:260 + i * 60 }));
      ['G5','C6','E6','G6'].forEach((n, i) => tone(sfxBus, NOTE(n), t + 1.1 + i * .08, .3, { type:'triangle', vol:.08 })); },
    cheer(t){ noise(sfxBus, t, 2.4, { f:1000, q:.35, vol:.16, a:.5 }); for (let i = 0; i < 18; i++) noise(sfxBus, t + .3 + Math.random() * 1.6, .05, { f:2200, q:1.4, vol:.06 }); }
  };

  /* music: original pieces */
  const TUNES = {
    /* the trailer: a big space-opera-style fanfare in D (original) */
    fanfare(b, t){
      for (let i = 0; i < 10; i++) timp(b, t + i * .09, 'D2', .12 + i * .025);
      cym(b, t + .95, 1.6, .06);
      const q = .38; let x = t + 1;
      brass(b, ['D3','A3','D4','F#4'], x, .18); brass(b, ['D3','A3','D4','F#4'], x + q * .5, .12); brass(b, ['D3','A3','D4','F#4'], x + q * .75, .12);
      brass(b, ['D3','A3','D4','F#4','A4'], x + q, q * 3, .06); timp(b, x + q, 'D2');
      x += q * 4;
      const mel = [['A4',.5],['D5',.5],['E5',.5],['F#5',1.5],['E5',.5],['D5',.5],['B4',.5],['A4',1.5],['G4',.5],['A4',.5],['B4',.5],['D5',1],['C#5',.5],['D5',2]];
      const bass = [['D3',2],['D3',1],['B2',1],['G2',2],['A2',2],['D3',2]];
      let mt = x; mel.forEach(([n, d]) => { horn(b, n, mt, d * q * .98, .085); mt += d * q; });
      let bt = x; bass.forEach(([n, d]) => { brass(b, [n, n.replace(/\d/, m => +m + 1)], bt, d * q * .95, .045); timp(b, bt, n.replace(/\d/, '2'), .35); bt += d * q; });
      let st = x; [['F#4','A4'],['D4','G4'],['E4','A4'],['F#4','A4']].forEach(ch => { ch.forEach(n => string(b, n.replace(/\d/, m => +m + 1), st, q * 4, .03)); st += q * 4; });
      const end = x + 16 * q;
      brass(b, ['D3','A3','D4','F#4','A4','D5'], end, 1.6, .06); cym(b, end, 2.2, .08); timp(b, end, 'D2', .5); timp(b, end + .2, 'A1', .4);
      return end + 1.8 - t;
    },
    /* the daily report: a TV news sting */
    news(b, t){
      const q = .16; [['E5',1],['B4',1],['E5',1],['G#5',2],['F#5',1],['E5',1],['B5',3]].reduce((x, [n, d]) => { tone(b, NOTE(n), x, d * q * .9, { type:'square', vol:.06, lp:3000 }); tone(b, NOTE(n) / 2, x, d * q * .9, { type:'sawtooth', vol:.03, lp:1200 }); return x + d * q; }, t);
      [0, 2, 4, 6, 8, 10].forEach(i => kick(b, t + i * q, .25)); [1, 3, 5, 7, 9].forEach(i => hat(b, t + i * q, .05));
      brass(b, ['E3','B3','E4','G#4'], t + 10 * q, .9, .05); cym(b, t + 10 * q, 1, .05);
      return 10 * q + 1;
    },
    /* the crowning: a slow, proud anthem in G (original) */
    anthem(b, t){
      const q = .55; const mel = [['D4',1],['G4',1.5],['A4',.5],['B4',1],['D5',1],['C5',1],['B4',1],['A4',2],['B4',1],['C5',1],['D5',1.5],['E5',.5],['D5',1],['G5',1],['F#5',1],['G5',3]];
      let x = t; mel.forEach(([n, d]) => { horn(b, n, x, d * q * .97, .08); x += d * q; });
      const ch = [['G2','D3','G3','B3'],['C3','G3','C4','E4'],['G2','D3','G3','B3'],['D3','A3','D4','F#4'],['E3','B3','E4','G4'],['C3','G3','C4','E4'],['D3','A3','D4','F#4'],['G2','D3','G3','B3','D4']];
      ch.forEach((c, i) => { brass(b, c, t + i * 2 * q, 2 * q * .97, .035); timp(b, t + i * 2 * q, 'G1', .25); });
      cym(b, t + 14 * q, 2.4, .08);
      return 17 * q + 1;
    },
    win(b, t){ ['G4','C5','E5','G5'].forEach((n, i) => horn(b, n, t + i * .12, i === 3 ? .8 : .14, .08)); brass(b, ['C4','E4','G4','C5'], t + .36, .9, .05); cym(b, t + .36, 1, .05); return 1.4; },
    lose(b, t){ [['C4',.22],['B3',.22],['Bb3',.22],['A3',.7]].reduce((x, [n, d]) => { horn(b, n, x, d, .07); return x + d; }, t); return 1.4; }
  };
  /* the match groove that plays during a round: four bars, C-Am-F-G, quiet */
  const PROG = [['C3','E4','G4'],['A2','C4','E4'],['F2','A3','C4'],['G2','B3','D4']];
  function loopTick(){
    if (!ac) return;
    const spb = 60 / 116 / 2; // eighth notes
    while (loopAt < ac.currentTime + .25){
      const bar = Math.floor(loopStep / 8) % 4, s = loopStep % 8, ch = PROG[bar];
      if (s === 0 || s === 3 || s === 6) tone(musBus, NOTE(ch[0]), loopAt, spb * .9, { type:'square', vol:.05, lp:500 });
      if (s % 2 === 1) hat(musBus, loopAt, .025);
      if (s === 0 || s === 4) kick(musBus, loopAt, .12);
      if (s === 2 || s === 6){ snare(musBus, loopAt, .04); ch.slice(1).forEach(n => tone(musBus, NOTE(n), loopAt, spb * .8, { type:'triangle', vol:.025 })); }
      if (loopStep % 32 === 31) noise(musBus, loopAt, .3, { f:500, fTo:3000, vol:.03 });
      loopAt += spb; loopStep++;
    }
  }
  return {
    prime(){ return !!ctx(); },
    duck(on){ if (!ac || !musBus) return; try { musBus.gain.setTargetAtTime(on ? .06 : .42, ac.currentTime, .08); sfxBus.gain.setTargetAtTime(on ? .2 : .6, ac.currentTime, .08); } catch (e) {} },
    fx(name){ if (!wantS() || !ctx()) return; try { FX[name](ac.currentTime + .01); } catch (e) {} },
    tune(name){
      if (!wantM() || !ctx()) return 0;
      this.stop();
      try { piece = ac.createGain(); piece.gain.value = 1; piece.connect(musBus); return TUNES[name](piece, ac.currentTime + .05); } catch (e) { return 0; }
    },
    stop(){
      if (piece && ac){ const p = piece; try { p.gain.setTargetAtTime(.0001, ac.currentTime, .15); setTimeout(() => { try { p.disconnect(); } catch (e) {} }, 900); } catch (e) {} }
      piece = null;
    },
    loop(on){
      if (on && wantM() && ctx()){ if (loopTimer) return; loopAt = ac.currentTime + .1; loopStep = 0; loopTimer = setInterval(loopTick, 60); }
      else { if (loopTimer){ clearInterval(loopTimer); loopTimer = null; } }
    },
    looping(){ return !!loopTimer; }
  };
})();


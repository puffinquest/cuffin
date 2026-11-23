/* ---------- recorded voiceovers (Shaw's recordings) ----------
   Each id plays audio/<id>.mp3 if that file was built in (HAVE). Missing clips fall back to text silently. */
const VO = {
  c01:'I am Cuffin. I have crossed the Atlantic eleven times. Twelve, if you count the one that went wrong.',
  c02:'Welcome back, Aaron. The puffin community has been expecting you.',
  c03:'Previously… on Cuffin versus the Mirror.',
  c04:'Right. Four in. Four hold. Four out. Kick off.',
  c05:'Correct. I would like that noted.',
  c06:'Precisely right. The puffin community approves.',
  c07:'Not quite. Eventually still counts.',
  c08:'Don’t fight the swell. Look at the answer.',
  c09:'Custard. There is no custard in the North Atlantic. I have checked. And yet… here it is.',
  c10:'Locked in. Written down. In ink.',
  c11:'We’re ahead. Don’t tell the Mirror. He’ll sulk.',
  c12:'The Mirror’s in front. Don’t panic. We’ll get him.',
  c13:'Round to us. The Mirror is sulking. Magnificently.',
  c14:'Hard round. The sea does that. Next time.',
  c15:'A promotion. The puffin community is murmuring.',
  c16:'Leader of the Puffin Community. I would like this noted. Officially. Bring out the custard.',
  c17:'Write that one in your vocabulary book. The puffin community is watching.',
  c18:'Book check. Have you actually written it down? I am checking. Officially.',
  c19:'Written down. Good. That is how we beat the Mirror.',
  c20:'Pinky promise? The puffin community takes pinky promises very seriously.',
  c21:'A pinky promise. Witnessed. Officially.',
  c22:'Not yet? Good. Honesty. Take your time.',
  c23:'Right. Here’s how we’re doing.',
  c24:'Breaking news. We are miles ahead of the Mirror. Don’t tell him. Actually… do tell him.',
  c25:'The Mirror is in front. This is not a drill. Four in. Four hold. Four out.',
  c26:'And we’re back in front. I would like that noted.',
  c27:'A badge. The puffin community does not hand these out lightly.',
  c28:'Another day, another fish. Our streak lives on.',
  c29:'A pot of custard, sacrificed to save the streak. A noble custard.',
  c30:'Daily goal done. Floppy. Warm. Like custard.',
  c31:'Seven days in a row. A perfect week. The puffin community is speechless.',
  m01:'Mwah-ha-ha! Did somebody say CROWN? It’s mine. It matches my feathers.',
  m02:'Ha! Correct! Obviously.',
  m03:'Polish my beak and call me Professor!',
  m04:'WHAT?! That question was rigged!',
  m05:'Nobody saw that. Cuffin, stop writing it down.',
  m06:'Custard? CUSTARD? Nobody told ME there was custard!',
  m07:'I’ve already ordered the crown. Size: magnificent.',
  m08:'NOOOO! I demand a rematch! Best of five hundred!',
  m09:'A vocabulary book? I keep all my words in my head. Next to my reflection.',
  m10:'Writing things down? That’s cheating! …Is it? It looks like it works.',
  m11:'I’m in FRONT! Somebody take a picture! From my good side!',
  m12:'This is fine. Everything is fine. I’m simply letting you win. For now.',
  m13:'Mastered? Pfft. I mastered that word years ago. Probably.',
  m14:'Pinky promise? I don’t even have pinkies. I have FEATHERS.',
  m15:'A streak? I also have a streak. It’s a streak of being magnificent.'
};
const HAVE = new Set(["c01", "c02", "c03", "c04", "c05", "c06", "c07", "c08", "c09", "c10", "c11", "c12", "c13", "c14", "c15", "c16", "c17", "c18", "c19", "c20", "c21", "c22", "c23", "c24", "c25", "c26", "c27", "c28", "c29", "c30", "c31", "m01", "m02", "m03", "m04", "m05", "m06", "m07", "m08", "m09", "m10", "m11", "m12", "m13", "m14", "m15"]);
const VOICE = (() => {
  let cur = null, waiting = null, idle = [], held = null;
  const flush = () => { if (cur || waiting) return; const f = idle; idle = []; f.forEach(fn => { try { fn(); } catch (e) {} }); };
  const can = id => !!(S && S.settings && S.settings.sound && (id[0] === 'm' ? S.settings.mvoice !== false : S.settings.cvoice !== false) && (HAVE.has(id) || window.__voTest));
  function start(id){
    if (window.__voTest){ window.__voTest.push(id); return; }
    try {
      const a = new Audio('audio/' + id + '.mp3?v=' + APPV); cur = a; SND.duck(true);
      const done = () => { if (cur !== a) return; cur = null; SND.duck(false); if (waiting){ const w = waiting; waiting = null; start(w); } else flush(); };
      a.onended = done; a.onerror = done;
      const p = a.play(); if (p && p.catch) p.catch(() => { cur = null; SND.duck(false); flush(); });
    } catch (e) { cur = null; }
  }
  return {
    can,
    play(id){ if (!can(id)) return false; if (held){ held.push(id); return true; } if (cur){ waiting = id; return true; } start(id); return true; },
    /* pick one of several clips that exist; returns its id or null */
    pick(...ids){ const ok = ids.filter(can); return ok.length ? ok[rnd(ok.length)] : null; },
    /* run fn once no recorded line is playing or queued */
    whenIdle(fn){ idle.push(fn); flush(); },
    /* hold lines back while the narrator reads a slide, then release them */
    hold(){ held = []; }, release(){ const q = held || []; held = null; return q; },
    stop(){ waiting = null; idle = []; if (cur){ try { cur.pause(); } catch (e) {} cur = null; } SND.duck(false); }
  };
})();


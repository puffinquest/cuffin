/* ---------- state + storage ---------- */
const KEY = 'cuffin-word-quest-v1';
const ARCH = KEY + '-before-race';
const LSAVES = KEY + '-saves';
let storageOK = true;
function sampleWords(){ return SAMPLE.map(([w, m, s]) => ({ w, m, s })); }
function fresh(){
  return { v:1, name:'Aaron', bank:'Sample words (58)', words:sampleWords(),
    prog:{}, points:0, fishV:1, history:[], rounds:[], badges:{}, prizes:[], pin:'', last:'', demo:false,
    race:{ mf:0, mm:0, ms:0 }, custard:0, book:{ list:[], next:[] }, intro:false, leader:null, lastVisit:null, upd:0, mv:2,
    settings:{ hints:true, sound:true, music:true, cvoice:true, mvoice:true, readout:true }, epoch:0, freeze:[], goal:'', freezeAsk:'',
    stats:{ answered:0, right:0, spell:0, fixed:0, best:0, rounds:0, perfect:0, splats:0, pies:0, stories:0, early:0, owl:0, cwon:0 } };
}
const isBlank = o => !o || ((!o.stats || !o.stats.answered) && !(o.history && o.history.length));
/* restoring = keep the old progress (a backup code, a save point, the archive); otherwise a pre-race save starts the race from scratch */

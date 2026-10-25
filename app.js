(function(){
'use strict';
const APPV = "403308a45f";
/* ---------- tiny DOM helpers ---------- */
const $ = (s, r=document) => r.querySelector(s);
function h(tag, props, ...kids){
  const e = document.createElement(tag);
  if (props) for (const k in props){
    const v = props[k];
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.slice(0,2) === 'on') e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of kids.flat(Infinity)){
    if (c == null || c === false) continue;
    e.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return e;
}
const SVGNS = 'http://www.w3.org/2000/svg';
function sv(tag, attrs, ...kids){
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  for (const c of kids.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}
function icon(name){
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('class', 'ic'); s.setAttribute('aria-hidden', 'true');
  const u = document.createElementNS(SVGNS, 'use'); u.setAttribute('href', '#i-' + name);
  s.append(u); return s;
}
const shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const rnd = n => Math.floor(Math.random()*n);
const norm = w => String(w).trim().toLowerCase();

/* ---------- Cuffin and the Mirror: photos and voices ---------- */
const IMG = { hello:'img/cuffin-front.webp', ask:'img/cuffin-front.webp', right:'img/cuffin-side.webp', wrong:'img/cuffin-lie.webp' };
const MIMG = { ask:'img/mirror-side.webp', smug:'img/mirror-front.webp', sad:'img/mirror-lie.webp' };
const SAY = {
  first:[
    "I am Cuffin. I have crossed the Atlantic eleven times. Twelve, if you count the one that went wrong. Giles is retiring, and somebody sensible must lead the puffins. That is me. With your help. Mostly your help."
  ],
  hello:[
    "Welcome back, {name}. The puffin community has been expecting you.",
    "You took your time. I flew through a hurricane to be here. It was extremely inconvenient.",
    "Ah. {name}. Somebody has to keep an eye on the Mirror.",
    "Good. You are here. We have a network, and the network says the Mirror has been practising his bow."
  ],
  aheadHome:[
    "We are ahead. Do not tell the Mirror. He will sulk. He will sulk anyway.",
    "Ahead of the Mirror. The puffin community approves. Keep flapping.",
    "We are in front. I would like that noted. Officially."
  ],
  behindHome:[
    "The Mirror is in front. Do not panic. Four in. Four hold. Four out. Then we catch him.",
    "He is ahead for now. Eventually still counts. Let us go and get some fish.",
    "The Mirror is gloating. It is not a good look on him. Shall we fix it?"
  ],
  levelHome:[
    "Level. Beak and beak. The puffin community calls this a proper race.",
    "Dead level with the Mirror. One good round and the crown starts looking at us."
  ],
  leaderHome:[
    "Leader of the Puffin Community. It is in our literature now. Permanently.",
    "Giles sends his regards. He is on a rock, eating sprats. He seems very happy.",
    "We won. The Mirror is still sulking. I have offered him a fish. He said it was the wrong shade of silver."
  ],
  birthday:["Happy birthday, {name}. And to me. The puffin community sent fish."],
  streakDays:[
    "{n} days in a row. The puffin community has noted this. Officially.",
    "{n} days running. That is what a migration looks like."
  ],
  start:[
    "We will test you. The puffin community takes vocabulary seriously.",
    "Four in. Four hold. Four out. Right. Ready?",
    "Ten questions. The Mirror is already polishing his beak. Let us disappoint him."
  ],
  right:[
    "Correct. The puffin community notes it with approval.",
    "Correct. I would like that noted.",
    "Precisely right. We have a network, and the network is impressed.",
    "Yes. Exactly that. Fresh fish for the team.",
    "Correct. I knew you knew."
  ],
  wrong:[
    "Not quite. There is a gap between what happens and what you do next. You are in it. Look at the answer.",
    "Not this time. Eventually still counts.",
    "Don't fight the swell. Let it hold you. Read the answer, then we go again.",
    "Not this time. The puffin community has been wrong too. Roughly twice. Look at the answer."
  ],
  streak:[
    "{n} in a row. I also did well once. I would like that noted too.",
    "{n} in a row. The puffin community is murmuring. The Mirror is sweating."
  ],
  retry:[
    "Back again. A second chance. The puffin community believes in those.",
    "Now then. Let us see if it stuck."
  ],
  fixed:[
    "Fixed. That is how it works. I have already forgotten the mistake.",
    "There it is. Forgiven instantly."
  ],
  know:[
    "Before we race, a quick question between us. Do you know this word?",
    "First things first. Do you know this one? Be honest. Nobody is counting."
  ],
  knowYes:[
    "Good. I would like that noted.",
    "Excellent. The network had a feeling you would."
  ],
  explain:[
    "Right. Here is the puffin community's official explanation.",
    "We have a network. The network says this:",
    "Simple. Listen carefully, because I will say it once. Possibly twice."
  ],
  explainEnd:[
    "Now you know it. That is how it works.",
    "There. Stored safely in the brain. Next to the fish facts.",
    "Got it? Good. Not sure is allowed. Not knowing for ever is not."
  ],
  end0:["Hard round. The sea does that. Nothing is lost: those words come back, and next time they are easier. Eventually still counts."],
  end1:["A good start. Some words slipped away, so they will come round again. That is the plan, not the problem."],
  end2:["Very good. I am only saying that because it is true. The puffin community agrees."],
  end3:["Perfect. Every one, first time. I am speechless, which for a puffin is a large achievement. And no, there is still no custard in the North Atlantic."],
  badge:["A badge. The puffin community does not hand these out lightly. Well, it does, but it was a careful kind of lightly."],
  prize:["Official notice from the puffin community: a prize has been earned. It is outside my area. Please see Mummy or Daddy."],
  empty:["There is nothing tricky on the list. This is either very good news, or a sign you have not started yet."],
  quit:["Leaving mid-match is allowed. Your answers so far are saved. I will be here. So, sadly, will the Mirror."]
};
SAY.custard = [
  "Five in a row. A pot of custard for the team. I have looked into it. I am still not convinced it is the same custard. The mystery continues.",
  "Custard earned. There is no custard in the North Atlantic. I have checked. And yet, here it is. The universe is strange.",
  "A pot of custard. The puffin community has formally given up trying to explain it. We simply accept it and carry on.",
  "Five in a row. Floppy, warm, like custard. Which is now ours. I have questions. Nobody has answers."
];
const MCUSTARD = [
  "Custard? CUSTARD? Nobody told me there was custard!",
  "I'd have custard too if they gave it out for being fluffy.",
  "That custard should be mine. I'm the yellowest one here. Well. My feet are.",
  "I don't even like custard. (I love custard.)"
];
const GCUSTARD = [
  "Giles has never tasted custard. He says it sounds like a rumour.",
  "Giles has asked for custard at his leaving party. Nobody knows where to get it.",
  "Giles believes a burrow, from the inside, feels almost exactly like custard. It is his leading theory.",
  "A seagull claims to have seen custard near Newfoundland. Giles has asked for evidence."
];
const CHAPTERS = ["The Custard Question","Beak to Beak","The Puddle Plot","Fish, Fog and Custard","A Very Fluffy Problem","The Great Fish Count","Custard at Dawn","Mirror, Mirror","Rock Bottom","The Sprat Strategy","The Wobbly Words","Custard Clues","Feathers at Dawn","The Sulking Season","A Crown Too Shiny","The Custard Conspiracy","Wind, Waves and Vocabulary","The Twelfth Crossing","Snack Attack","The Final Stretch"];
SAY.needSim = ["Three in a row. To master a card, you must beat it in a similar and opposite question. It is coming."];
SAY.hinted = [
  "A hint, well used. Fish for the team. It will not count towards mastering it, though. The puffin community is strict about that.",
  "Correct, with a little help. Next time, try it without the hint and it starts to count."
];
SAY.lockin = [
  "Three in a row. Come back on another day and get it right again, and it is locked in for good.",
  "Nearly mastered. The puffin community needs to see it on another day. That is how we know it has stuck."
];
SAY.needType = ["Three in a row. Now get it right in a different kind of question and it is mastered."];
SAY.mastered = ["Mastered. Locked in. The puffin community has written it down in ink.", "That word is mastered. Officially. I would like that noted."];
SAY.since = {
  won:["Last time, we out-fished the Mirror. He has been sulking ever since. Let us give him more to sulk about.", "Good last session. The Mirror spent the night practising in front of a puddle."],
  lost:["Last time, the Mirror sneaked a few more fish than us. Do not worry. Four in. Four hold. Four out. Today we get them back.", "The Mirror had a good day last time. He will not stop talking about it. Shall we stop him?"],
  level:["Last time it was level. Beak and beak. Today somebody breaks away.", "Dead level last time. The puffin community is on the edge of its rock."]
};
const ASAY = [
  "Mirror, you are about as scary as a wet sock.",
  "I've got the brain. Cuffin's got the feathers. You've got... a reflection.",
  "Polish your trophy cabinet, Mirror. It's going to stay empty.",
  "Bring it on, fluff-ball.",
  "I don't need luck. I've got vocabulary.",
  "Cuffin, hold my fish.",
  "Every word I learn is another fish in our bucket.",
  "Mirror, mirror on the wall, who's the cleverest of them all? Not you.",
  "See you at the finish line. I'll be the one next to the puffin in the crown.",
  "You've been practising? Cute. So have I."
];
const PRE = [
  "I've been practising all night. In front of a mirror. Obviously.",
  "Today's the day I take the lead! I can feel it in my extremely fluffy bones.",
  "I had my feathers blow-dried for the occasion. You can tell, can't you?",
  "Giles told me I'm his favourite. He didn't. But he will.",
  "I've learned a new word today: WINNER. It's spelled M-I-R-R-O-R.",
  "Ready to lose, scruffy? I've brought a spare crown. For me."
];
const GILES = [
  "Giles has started packing. He owns three rocks and one very old sprat.",
  "Giles was seen practising his retirement nap. It went well.",
  "Giles asked for a quiet leaving party. The Mirror has booked a brass band.",
  "Giles polished the crown today. It took four hours and one sock.",
  "Giles reminds everyone: the crown goes to the puffin who masters every word. No shortcuts.",
  "Giles has written his leaving speech. It is mostly about fish.",
  "A seagull tried on the crown. Giles has had a word with it.",
  "Giles once knew a puffin who learned ten words a day. He would like that noted.",
  "Giles has been spotted measuring Cuffin's head. For reasons.",
  "Giles says the Mirror asked to borrow the crown 'just for a photo'. The answer was no."
];
const MSAY = {
  right:[
    "Ha! Correct! Obviously. I studied that word in a very shiny puddle.",
    "Ding ding ding! The Mirror strikes again! Somebody fetch me a fish and a round of applause.",
    "Correct, naturally. Have I mentioned I am magnificent? I shall mention it again. Magnificent.",
    "Right AGAIN. Is it hard being this clever? Yes. Yes it is. For me.",
    "Bullseye! Polish my beak and call me Professor.",
    "Oh, did I get it? I did. I always do. Except when I don't. Which is hardly ever. Sometimes."
  ],
  wrong:[
    "WHAT?! That question was clearly rigged. By the wind. And possibly a seagull.",
    "I meant to do that. It is a cunning plan. You would not understand it. Neither do I.",
    "Curses! Foiled by vocabulary!",
    "Wrong? Me? I demand a recount. And a mirror. Mostly the mirror.",
    "That word is spelled wrong in the dictionary. I shall be writing to them. In glitter.",
    "Nobody saw that. Nobody saw that. Cuffin, stop writing it down.",
    "Pah! I wasn't even trying. I was admiring my reflection in the question."
  ],
  sitout:[
    "A re-do? Pfft. I'm sitting this one out. I'll just stand here looking fabulous.",
    "Retries are for puffins who get things wrong. I wouldn't know. Wake me when it's my turn.",
    "Not my question. I shall be over here. Sulking. Magnificently."
  ],
  ahead:[
    "Look at the scoreboard! LOOK AT IT! I'm winning! Somebody take a picture!",
    "Practise your bow, Cuffin. You'll be bowing to ME.",
    "I've already ordered the crown. In gold. Size: magnificent.",
    "Ahead! The crown is practically sitting on my fluffy head!"
  ],
  behind:[
    "Behind? A temporary situation. Like weather. Or Cuffin's feathers.",
    "Enjoy your little lead. I have a plan. It involves... more fish.",
    "Don't get comfortable! The Mirror always comes back. Like a boomerang. A fluffy boomerang.",
    "This is fine. Everything is fine. I am simply letting you win. For now. Probably."
  ],
  level:[
    "Neck and neck! Beak and beak! Dramatic music, please!",
    "Level! The tension! I may faint. Somebody fan me with a fish."
  ],
  roundWin:[
    "Another round to the Mirror! Mwah-ha-ha! I'd stay for a chat, but I have a crown to try on.",
    "Did you see me? Of course you did. Everyone always sees me. I sparkle."
  ],
  roundLose:[
    "That round doesn't count. I had a feather in my eye. A very big feather.",
    "Fine. FINE. You won that round. I am writing a strongly worded letter to the sea.",
    "Hmph. Luck. Pure luck. And a bit of brains. Mostly luck."
  ],
  home:[
    "Mwah-ha-ha! Oh, sorry. I was practising my winner's laugh.",
    "The crown will look SO good on me. It matches my feathers.",
    "I've never crossed the Atlantic. I've never needed to. Things come to me."
  ],
  entrance:[
    "Mwah-ha-ha! Did somebody say CROWN? It's mine. It matches my feathers."
  ],
  custard:MCUSTARD,
  defeat:[
    "NOOOOO! This is an outrage! A scandal! A... a very fair result, actually, but I refuse to say so!",
    "I demand a rematch! Best of three! Best of five hundred!",
    "Fine! Keep your silly crown! I didn't want it anyway! (I wanted it very much.)",
    "I'm not crying. My eyes are just... reflecting. Very hard."
  ]
};
const lastSay = {};
function pickLine(bank, key, vars){
  const arr = bank[key]; let i = rnd(arr.length);
  const tag = (bank === MSAY ? 'm:' : 'c:') + key;
  if (arr.length > 1 && lastSay[tag] === i) i = (i + 1) % arr.length;
  lastSay[tag] = i;
  const v = Object.assign({ name: S ? S.name : 'Aaron' }, vars || {});
  return arr[i].replace(/\{(\w+)\}/g, (m, k) => v[k] != null ? v[k] : m);
}
const say = (key, vars) => pickLine(SAY, key, vars);
const pickOne = arr => arr[rnd(arr.length)];
const msay = (key, vars) => pickLine(MSAY, key, vars);

/* ---------- sample word bank: word, meaning, example sentence (replace via Grown-ups) ---------- */
const SAMPLE = [
["illegible","So messy or faint that you can't read it.","The doctor's handwriting was so illegible that nobody could read the note."],
["immortal","Living forever and never dying.","In the story, the wizard drank a potion to become immortal."],
["impolite","Not polite; rude.","It is impolite to talk with your mouth full."],
["impure","Not clean or pure; mixed with something else.","The water from the muddy river was impure, so we boiled it."],
["inadequate","Not enough, or not good enough.","One small sandwich was inadequate for a whole football team."],
["incorrect","Not correct; wrong.","Cuffin circled the incorrect answer in red."],
["indirect","Not straight; going the long way round.","We took an indirect route home and got lost twice."],
["informal","Relaxed and casual, not formal.","The party was informal, so everyone wore trainers."],
["inoffensive","Harmless; it doesn't upset anyone.","The joke was gentle and inoffensive, so everyone laughed."],
["irreparable","So badly damaged that it can't be fixed.","The phone fell in the sea and the damage was irreparable."],
["illogical","Doesn't make sense; not based on good reasoning.","Wearing sunglasses at midnight seems illogical."],
["impatient","Not able to wait calmly.","Aaron was impatient for the match to start."],
["improper","Not the correct or proper way to do something.","It is improper to wear muddy boots in the house."],
["inaccurate","Not exactly right; has mistakes in it.","The map was inaccurate and sent us into a field of cows."],
["incapable","Not able to do something.","The old printer seems incapable of printing anything on time."],
["invalid","Not allowed or accepted; it doesn't count.","The goal was invalid because the player was offside."],
["irrational","Not sensible or based on reason.","Being scared of a harmless money spider is irrational."],
["irresistible","Too tempting to say no to.","The smell of fresh pancakes was irresistible."],
["irresponsible","Not careful or sensible; doesn't think about the results.","Leaving the gate open was irresponsible because the dog ran off."],
["antibiotic","A medicine that kills harmful germs called bacteria.","The doctor gave her an antibiotic to clear up the infection."],
["anticlimax","A letdown when something exciting turns out to be disappointing.","After all that waiting, the tiny firework was an anticlimax."],
["antiseptic","A cleaning liquid that stops germs getting into a cut.","Mum dabbed antiseptic on the cut on my knee."],
["antivirus","A computer program that protects against viruses.","Dad installed antivirus on the laptop to keep it safe."],
["autograph","A famous person's own signature.","The striker signed his autograph on my shirt."],
["autopilot","A system that flies a plane or steers a ship by itself.","The pilot switched on the autopilot and ate a sandwich."],
["reappear","To show up again.","The sun will reappear when the clouds move away."],
["redesign","To plan how something looks all over again, in a new way.","The club decided to redesign its kit for next season."],
["reemerge","To come out again.","The puffin dived and took ages to reemerge from the waves."],
["rephrase","To say something again using different words.","If they don't understand, try to rephrase the question."],
["antifreeze","A liquid that stops water freezing, used in car engines.","Dad poured antifreeze into the car before the icy winter."],
["antisocial","Not wanting to be around other people, or not friendly.","Playing loud music at midnight is antisocial."],
["autobiography","The story of someone's life, written by that person.","The footballer wrote an autobiography about his life."],
["automobile","An old-fashioned word for a car.","Grandpa still calls his car an automobile."],
["reapply","To put on again, or to ask for something again.","Remember to reapply your sun cream after swimming."],
["rearrange","To put things in a different order.","We had to rearrange the furniture to fit the new sofa."],
["redecorate","To give a room a new look with paint or wallpaper.","We are going to redecorate my bedroom with blue paint."],
["redo","To do something again.","My homework was messy, so I had to redo it."],
["reheat","To make something hot again.","Can you reheat the soup in the microwave?"],
["return","To go or come back, or to give something back.","Please return the library book by Friday."],
["disadvantage","Something that makes things harder for you.","Being short can be a disadvantage in basketball."],
["disappear","To vanish so nobody can see it.","The magician made the coin disappear."],
["disappointed","Sad because something wasn't as good as you hoped.","We were disappointed when the match was cancelled."],
["disbelief","Not being able to believe something.","He stared at the final score in disbelief."],
["disconnect","To unplug or separate two things that were joined.","Remember to disconnect the charger when the battery is full."],
["dishonest","Not telling the truth.","It is dishonest to copy someone else's answers."],
["mishear","To hear something wrongly.","In a noisy crowd, it is easy to mishear your own name."],
["misinform","To give someone wrong information.","Please don't misinform the new boy about where the lunch hall is."],
["misjudge","To judge or guess something wrongly.","Goalkeepers sometimes misjudge a high ball."],
["mispronounced","Said a word the wrong way.","The teacher mispronounced my name on the first day."],
["metaphor","Saying one thing IS another, like 'the sea is a blanket'.","'The classroom was a zoo' is a metaphor."],
["simile","Comparing two things using 'like' or 'as'.","'As brave as a lion' is a simile."],
["alliteration","Words close together that start with the same sound.","'Purple puffins paddle past' uses alliteration."],
["personification","Giving human actions or feelings to something that isn't human.","'The wind whispered' is an example of personification."],
["onomatopoeia","A word that sounds like the noise it describes, like SPLASH.","'Buzz' and 'splash' are examples of onomatopoeia."],
["noun","A naming word for a person, place, thing or idea.","'Puffin' is a noun because it names a thing."],
["verb","A doing or being word.","'Run' is a verb because it is a doing word."],
["adjective","A word that describes a noun.","'Fluffy' is an adjective that describes the Mirror."],
["adverb","A word that tells you how, when or where something happens.","In 'Cuffin flew quickly', the word 'quickly' is an adverb."]
];

/* ---------- similar & opposite cards (Marie Redmond Super Brain). Add more here; progress is kept separately. ---------- */
const CARDS = [
{w:"collide", o:["proclaim", "reconcile", "collage", "clash"], s:"clash", p:"reconcile"},
{w:"evaporate", o:["sustain", "polish", "dissolve", "solidify"], s:"dissolve", p:"solidify"},
{w:"fair", o:["rowdy", "just", "sleek", "devious"], s:"just", p:"devious"},
{w:"agitate", o:["acquire", "descend", "disturb", "pacify"], s:"disturb", p:"pacify"},
{w:"tranquil", o:["errand", "thorough", "placid", "perturbed"], s:"placid", p:"perturbed"},
{w:"burden", o:["punctual", "onus", "advantage", "roam"], s:"onus", p:"advantage"},
{w:"gravitate", o:["drift", "omen", "consume", "withdraw"], s:"drift", p:"withdraw"},
{w:"convey", o:["transfer", "seize", "permit", "command"], s:"transfer", p:"seize"},
{w:"direct", o:["continuous", "convoluted", "flourish", "interior"], s:"continuous", p:"convoluted"},
{w:"decent", o:["upright", "unrefined", "despair", "placid"], s:"upright", p:"unrefined"},
{w:"retrieve", o:["reclaim", "fertile", "relinquish", "approve"], s:"reclaim", p:"relinquish"},
{w:"adolescent", o:["artful", "yonder", "aged", "juvenile"], s:"juvenile", p:"aged"},
{w:"produce", o:["procure", "dismantle", "probable", "create"], s:"create", p:"dismantle"},
{w:"keen", o:["acute", "contrary", "antiquity", "dull"], s:"acute", p:"dull"},
{w:"relish", o:["eager", "detest", "savour", "present"], s:"savour", p:"detest"},
{w:"covet", o:["crave", "elect", "seek", "scorn"], s:"crave", p:"scorn"},
{w:"disarray", o:["despair", "regulated", "peril", "turmoil"], s:"turmoil", p:"regulated"},
{w:"summit", o:["deposit", "peak", "summon", "nadir"], s:"peak", p:"nadir"},
{w:"sparse", o:["scanty", "sullen", "spar", "abundant"], s:"scanty", p:"abundant"},
{w:"stern", o:["stalk", "fragrant", "lenient", "severe"], s:"severe", p:"lenient"},
{w:"gaudy", o:["lavish", "entire", "austere", "lofty"], s:"lavish", p:"austere"},
{w:"ramble", o:["upbeat", "saunter", "emerge", "sprint"], s:"saunter", p:"sprint"},
{w:"urban", o:["domestic", "metropolitan", "endure", "rural"], s:"metropolitan", p:"rural"},
{w:"banish", o:["exile", "cease", "pledge", "incorporate"], s:"exile", p:"incorporate"},
{w:"communicate", o:["disclose", "compromise", "dissent", "conceal"], s:"disclose", p:"conceal"},
{w:"guarantee", o:["pledge", "breach", "innocent", "forlorn"], s:"pledge", p:"breach"},
{w:"supervise", o:["shuffle", "adept", "manage", "abandon"], s:"manage", p:"abandon"},
{w:"struggle", o:["strut", "wrestle", "topple", "idleness"], s:"wrestle", p:"idleness"},
{w:"eccentric", o:["mature", "bizarre", "augment", "customary"], s:"bizarre", p:"customary"},
{w:"comprehend", o:["perceive", "relate", "overlook", "shabby"], s:"perceive", p:"overlook"},
{w:"wayward", o:["unruly", "punctual", "compliant", "nasty"], s:"unruly", p:"compliant"},
{w:"contempt", o:["suspect", "scorn", "scorch", "flattery"], s:"scorn", p:"flattery"},
{w:"permit", o:["veto", "coarse", "alter", "sanction"], s:"sanction", p:"veto"},
{w:"acquire", o:["squander", "nimble", "assent", "obtain"], s:"obtain", p:"squander"},
{w:"earnest", o:["frivolous", "sanitary", "sincere", "elite"], s:"sincere", p:"frivolous"},
{w:"maim", o:["embrace", "restore", "deplete", "maul"], s:"maul", p:"restore"},
{w:"obscure", o:["obstinate", "cryptic", "palpable", "optimum"], s:"cryptic", p:"palpable"},
{w:"commend", o:["inept", "unstable", "applaud", "censure"], s:"applaud", p:"censure"},
{w:"dismal", o:["jolly", "admission", "bleak", "decline"], s:"bleak", p:"jolly"},
{w:"revere", o:["regard", "abhor", "rally", "appeal"], s:"regard", p:"abhor"},
{w:"nominal", o:["misuse", "credit", "significant", "minimal"], s:"minimal", p:"significant"},
{w:"capability", o:["sacrifice", "flair", "barren", "incapacity"], s:"flair", p:"incapacity"},
{w:"banal", o:["innovative", "prominent", "compulsory", "trite"], s:"trite", p:"innovative"},
{w:"wane", o:["decline", "enhance", "accuse", "commence"], s:"decline", p:"enhance"},
{w:"concur", o:["calamity", "sly", "assent", "clash"], s:"assent", p:"clash"},
{w:"sincere", o:["benefit", "malady", "genuine", "cunning"], s:"genuine", p:"cunning"},
{w:"ponder", o:["discount", "examine", "strut", "stall"], s:"examine", p:"discount"},
{w:"curb", o:["livid", "broaden", "restrict", "restore"], s:"restrict", p:"broaden"},
{w:"comply", o:["compose", "rebuff", "perceive", "adhere"], s:"adhere", p:"rebuff"},
{w:"hostile", o:["impartial", "fragile", "congenial", "aggressive"], s:"aggressive", p:"congenial"},
{w:"accomplishment", o:["success", "incompetence", "possess", "undertake"], s:"success", p:"incompetence"},
{w:"discernible", o:["dubious", "obtain", "submit", "evident"], s:"evident", p:"dubious"},
{w:"uncanny", o:["deceit", "eerie", "unremarkable", "mollify"], s:"eerie", p:"unremarkable"},
{w:"supple", o:["suppress", "lithe", "gregarious", "rigid"], s:"lithe", p:"rigid"},
{w:"turbulent", o:["balmy", "implore", "tempestuous", "indolent"], s:"tempestuous", p:"balmy"},
{w:"dumb", o:["vocal", "pompous", "mute", "mature"], s:"mute", p:"vocal"},
{w:"ancestor", o:["adolescent", "precocious", "predecessor", "descendent"], s:"predecessor", p:"descendent"},
{w:"validate", o:["stabilise", "repudiate", "confirm", "insert"], s:"confirm", p:"repudiate"},
{w:"brazen", o:["timid", "bold", "earnest", "superficial"], s:"bold", p:"timid"},
{w:"frail", o:["decay", "feeble", "hearty", "blunt"], s:"feeble", p:"hearty"},
{w:"oppose", o:["resist", "yearn", "linger", "bolster"], s:"resist", p:"bolster"},
{w:"stingy", o:["miserly", "tyrant", "temperate", "lavish"], s:"miserly", p:"lavish"},
{w:"pristine", o:["implore", "grimy", "dismal", "immaculate"], s:"immaculate", p:"grimy"},
{w:"coherent", o:["obscure", "logical", "luminous", "copious"], s:"logical", p:"obscure"},
{w:"feud", o:["accord", "forgo", "futile", "altercation"], s:"altercation", p:"accord"},
{w:"gleam", o:["waft", "startle", "muted", "sheen"], s:"sheen", p:"muted"},
{w:"fret", o:["laud", "candid", "carp", "polarity"], s:"carp", p:"laud"},
{w:"sermon", o:["hinder", "dialogue", "residence", "lecture"], s:"lecture", p:"dialogue"},
{w:"merge", o:["malign", "oppress", "disjoin", "fuse"], s:"fuse", p:"disjoin"},
{w:"nauseous", o:["absurd", "thriving", "queasy", "convert"], s:"queasy", p:"thriving"},
{w:"contest", o:["concede", "suffice", "endeavour", "dispute"], s:"dispute", p:"concede"},
{w:"myriad", o:["multiple", "abstain", "curb", "sole"], s:"multiple", p:"sole"},
{w:"kindle", o:["labour", "provoke", "quench", "assistance"], s:"provoke", p:"quench"},
{w:"idle", o:["diligent", "assault", "ineffective", "fertile"], s:"ineffective", p:"diligent"},
{w:"sullen", o:["animated", "hygienic", "deliberate", "glum"], s:"glum", p:"animated"},
{w:"entice", o:["accelerate", "repulse", "appeal", "confer"], s:"appeal", p:"repulse"},
{w:"tantalising", o:["noted", "humdrum", "titillating", "sturdy"], s:"titillating", p:"humdrum"},
{w:"endure", o:["yield", "undergo", "approve", "expose"], s:"undergo", p:"yield"},
{w:"retain", o:["abandon", "intention", "possess", "deform"], s:"possess", p:"abandon"},
{w:"fragrant", o:["divine", "reluctant", "foul", "aromatic"], s:"aromatic", p:"foul"},
{w:"cautious", o:["negligent", "wary", "crave", "jubilant"], s:"wary", p:"negligent"},
{w:"vex", o:["ally", "appease", "imitate", "exasperate"], s:"exasperate", p:"appease"},
{w:"routine", o:["obscure", "abnormal", "ultimate", "conventional"], s:"conventional", p:"abnormal"},
{w:"fundamental", o:["complex", "humble", "elementary", "fatal"], s:"elementary", p:"complex"},
{w:"brief", o:["forbid", "advance", "withhold", "inform"], s:"inform", p:"withhold"},
{w:"ornamental", o:["unembellished", "ornate", "overt", "occupied"], s:"ornate", p:"unembellished"},
{w:"colossal", o:["cocky", "diminutive", "conclude", "gargantuan"], s:"gargantuan", p:"diminutive"},
{w:"astute", o:["futile", "ignorant", "secret", "prudent"], s:"prudent", p:"ignorant"},
{w:"thwart", o:["foil", "moderate", "assist", "acquire"], s:"foil", p:"assist"},
{w:"serene", o:["meagre", "poised", "clamorous", "modest"], s:"poised", p:"clamorous"},
{w:"unkempt", o:["scanty", "dishevelled", "immune", "ordered"], s:"dishevelled", p:"ordered"},
{w:"elevate", o:["augment", "assemble", "demote", "prohibit"], s:"augment", p:"demote"},
{w:"uniform", o:["standardised", "variable", "imperial", "coax"], s:"standardised", p:"variable"},
{w:"stern", id:"stern2", o:["ecstatic", "grave", "antagonise", "despise"], s:"grave", p:"ecstatic"},
{w:"lean", o:["nimble", "stout", "insolent", "gaunt"], s:"gaunt", p:"stout"},
{w:"accurate", o:["extend", "precise", "vague", "affirm"], s:"precise", p:"vague"},
{w:"resentment", o:["enviousness", "vast", "affection", "wretched"], s:"enviousness", p:"affection"},
{w:"lurch", o:["flounder", "idol", "stabilise", "exterior"], s:"flounder", p:"stabilise"},
{w:"conserve", o:["cooperate", "preserve", "instigate", "endanger"], s:"preserve", p:"endanger"},
{w:"examine", o:["understand", "scrutinise", "skim", "crave"], s:"scrutinise", p:"skim"},
{w:"glisten", o:["glint", "hazy", "twilight", "proportion"], s:"glint", p:"hazy"},
{w:"deliberate", o:["pierce", "vouch", "calculated", "unforeseen"], s:"calculated", p:"unforeseen"},
{w:"visible", o:["evident", "ambiguous", "complete", "lenient"], s:"evident", p:"ambiguous"},
{w:"ascend", o:["decline", "embrace", "scale", "ramble"], s:"scale", p:"decline"},
{w:"harass", o:["anxiety", "affirm", "assist", "pester"], s:"pester", p:"assist"},
{w:"surplus", o:["wanting", "gaiter", "excess", "ordeal"], s:"excess", p:"wanting"},
{w:"nostalgic", o:["indifferent", "anxious", "coy", "wistful"], s:"wistful", p:"indifferent"},
{w:"inferior", o:["besieged", "prosperous", "mediocre", "exceptional"], s:"mediocre", p:"exceptional"},
{w:"prevail", o:["overcome", "reflect", "forfeit", "compel"], s:"overcome", p:"forfeit"},
{w:"propose", o:["imply", "surreal", "genre", "retort"], s:"imply", p:"retort"},
{w:"deceive", o:["delude", "aid", "crave", "irrational"], s:"delude", p:"aid"},
{w:"familiar", o:["fresh", "mundane", "insolent", "abnormal"], s:"mundane", p:"abnormal"},
{w:"rehearse", o:["recite", "achieve", "cease", "alert"], s:"recite", p:"cease"},
{w:"amend", o:["mar", "modify", "declare", "plunge"], s:"modify", p:"mar"},
{w:"classify", o:["merge", "allocate", "clatter", "clamour"], s:"allocate", p:"clatter"},
{w:"enterprise", o:["incision", "helix", "pastime", "venture"], s:"venture", p:"pastime"},
{w:"fluctuate", o:["linger", "mere", "resolve", "oscillate"], s:"oscillate", p:"linger"},
{w:"waft", o:["wade", "yield", "drift", "harbour"], s:"drift", p:"wade"},
{w:"helix", o:["caged", "coil", "wring", "parallel"], s:"coil", p:"parallel"},
{w:"accustom", o:["acquaint", "suppress", "extract", "atheist"], s:"acquaint", p:"suppress"},
{w:"allay", o:["insult", "assuage", "impair", "amaze"], s:"assuage", p:"impair"},
{w:"halt", o:["interval", "prevent", "persist", "preserve"], s:"prevent", p:"persist"},
{w:"envelop", o:["encompass", "surface", "disappear", "discharge"], s:"encompass", p:"discharge"},
{w:"discern", o:["reveal", "consider", "confound", "conduct"], s:"consider", p:"confound"},
{w:"smother", o:["smug", "inhale", "stifle", "porous"], s:"stifle", p:"inhale"},
{w:"balk", o:["waver", "wander", "endure", "dwelling"], s:"waver", p:"endure"},
{w:"conquer", o:["discuss", "conclude", "subdue", "yield"], s:"subdue", p:"yield"},
{w:"refined", o:["sophisticated", "crude", "improve", "abstain"], s:"sophisticated", p:"crude"},
{w:"hostile", id:"hostile2", o:["adverse", "hospitable", "warp", "soiled"], s:"adverse", p:"hospitable"},
{w:"prosperous", o:["trivia", "stormy", "affluent", "destitute"], s:"affluent", p:"destitute"},
{w:"awe", o:["avoid", "reverence", "consult", "apathy"], s:"reverence", p:"apathy"},
{w:"duplicate", o:["robust", "original", "imitation", "scribe"], s:"imitation", p:"original"},
{w:"repel", o:["depart", "consider", "repulse", "entice"], s:"repulse", p:"entice"},
{w:"confide", o:["conflict", "divulge", "avoid", "conceal"], s:"divulge", p:"conceal"},
{w:"enlarge", o:["insert", "expand", "suspend", "contract"], s:"expand", p:"contract"},
{w:"thorough", o:["meticulous", "deceit", "berate", "cursory"], s:"meticulous", p:"cursory"},
{w:"mirage", o:["illusion", "certainty", "vacant", "enrage"], s:"illusion", p:"certainty"},
{w:"purchase", o:["acquire", "vend", "betray", "deprive"], s:"acquire", p:"vend"},
{w:"exclude", o:["exhume", "debate", "eliminate", "admit"], s:"eliminate", p:"admit"},
{w:"opinion", o:["sentiment", "reality", "deprive", "confine"], s:"sentiment", p:"reality"},
{w:"expert", o:["stubborn", "amateur", "brood", "proficient"], s:"proficient", p:"amateur"},
{w:"soiled", o:["unblemished", "fickle", "unkempt", "wound"], s:"unkempt", p:"unblemished"},
{w:"trailing", o:["lagging", "beck", "frontal", "digesting"], s:"lagging", p:"frontal"},
{w:"gush", o:["surge", "trickle", "soothe", "endure"], s:"surge", p:"trickle"},
{w:"amuse", o:["irk", "amiable", "regale", "regard"], s:"regale", p:"irk"},
{w:"exhausted", o:["fatigued", "invigorated", "earnest", "wholly"], s:"fatigued", p:"invigorated"},
{w:"malleable", o:["tranquil", "pliant", "dismal", "rigid"], s:"pliant", p:"rigid"},
{w:"affix", o:["context", "detach", "append", "believe"], s:"append", p:"detach"},
{w:"alluring", o:["cease", "attest", "repulsive", "appealing"], s:"appealing", p:"repulsive"},
{w:"arrange", o:["segregate", "expose", "align", "displace"], s:"align", p:"displace"},
{w:"vulgar", o:["condemn", "refined", "detest", "crude"], s:"crude", p:"refined"},
{w:"despair", o:["contentment", "destined", "parity", "anguish"], s:"anguish", p:"contentment"},
{w:"humid", o:["dull", "humble", "muggy", "arid"], s:"muggy", p:"arid"},
{w:"akin", o:["cunning", "comparable", "divergent", "raiment"], s:"comparable", p:"divergent"},
{w:"hasten", o:["dash", "abundant", "dawdle", "frivolous"], s:"dash", p:"dawdle"},
{w:"offend", o:["assuage", "aggrieve", "official", "offset"], s:"aggrieve", p:"assuage"},
{w:"temporary", o:["enduring", "interim", "tempting", "brisk"], s:"interim", p:"enduring"},
{w:"interrogate", o:["interim", "integrity", "respond", "examine"], s:"examine", p:"respond"},
{w:"flourish", o:["deter", "wither", "lifeless", "thrive"], s:"thrive", p:"wither"},
{w:"solace", o:["suppress", "distress", "consolation", "unite"], s:"consolation", p:"distress"},
{w:"evade", o:["capsize", "encounter", "elude", "permeable"], s:"elude", p:"encounter"},
{w:"derelict", o:["novel", "inhabited", "pasture", "desolate"], s:"desolate", p:"inhabited"},
{w:"affirm", o:["refute", "verify", "conquer", "gloat"], s:"verify", p:"refute"},
{w:"boisterous", o:["plume", "subdued", "rowdy", "distinct"], s:"rowdy", p:"subdued"},
{w:"ardent", o:["labour", "fortunate", "fervent", "apathetic"], s:"fervent", p:"apathetic"},
{w:"approach", o:["advance", "depart", "appraise", "hinder"], s:"advance", p:"depart"},
{w:"humiliate", o:["promote", "abscond", "convey", "shame"], s:"shame", p:"promote"},
{w:"deprive", o:["stall", "bestow", "commit", "deny"], s:"deny", p:"bestow"},
{w:"boundary", o:["outskirt", "host", "hub", "restrain"], s:"outskirt", p:"hub"},
{w:"compete", o:["contend", "cooperate", "component", "occupy"], s:"contend", p:"cooperate"},
{w:"volatile", o:["placid", "sacred", "erratic", "rogue"], s:"erratic", p:"placid"},
{w:"confirm", o:["verify", "deny", "calculate", "contemplate"], s:"verify", p:"deny"},
{w:"oppress", o:["unite", "torment", "operate", "alleviate"], s:"torment", p:"alleviate"},
{w:"gripe", o:["grumble", "approve", "compassion", "hence"], s:"grumble", p:"approve"},
{w:"insolent", o:["humble", "remote", "seize", "impudent"], s:"impudent", p:"humble"},
{w:"blunt", o:["dull", "bliss", "feral", "barbed"], s:"dull", p:"barbed"},
{w:"terminate", o:["commence", "startle", "abort", "terse"], s:"abort", p:"commence"},
{w:"provide", o:["punish", "supply", "conceal", "create"], s:"supply", p:"conceal"},
{w:"incident", o:["episode", "abstain", "inactivity", "include"], s:"episode", p:"inactivity"},
{w:"truce", o:["segregate", "chaotic", "reprieve", "persistence"], s:"reprieve", p:"persistence"},
{w:"calculate", o:["suppose", "compute", "debrief", "halt"], s:"compute", p:"suppose"},
{w:"component", o:["competent", "segment", "origin", "entity"], s:"segment", p:"entity"},
{w:"grant", o:["bestow", "refrain", "convey", "lucid"], s:"bestow", p:"refrain"},
{w:"prompt", o:["dissuade", "mention", "develop", "repress"], s:"mention", p:"dissuade"}
];
const XW = {"collide": {"m": "To crash into something.", "f": "Two puffins in fog. Bonk."}, "proclaim": {"m": "To announce something loudly and officially.", "f": "A puffin on a rock proclaiming “FISH!”"}, "reconcile": {"m": "To make up and be friends again after a fight.", "f": "Two puffins sharing a fish after an argument."}, "collage": {"m": "A picture made by sticking lots of bits and photos together.", "f": "Looks like collide, but it is arts and crafts. Sneaky."}, "clash": {"m": "To crash or fight, or to disagree strongly.", "f": "Cymbals clash. So do stripes and spots."}, "evaporate": {"m": "When a liquid turns into a gas and floats away.", "f": "Puddles do it on sunny days. Poof."}, "sustain": {"m": "To keep something going.", "f": "A good fish breakfast sustains a puffin all morning."}, "polish": {"m": "To rub something until it shines.", "f": "Cuffin polishes his beak. Daily."}, "dissolve": {"m": "To melt away into a liquid.", "f": "Sugar in tea. Gone, but still there."}, "solidify": {"m": "To turn hard and solid.", "f": "Water in the freezer solidifies into ice."}, "fair": {"m": "Treating everyone the same, in a way that is right.", "f": "Splitting the fish equally is fair."}, "rowdy": {"m": "Noisy and out of control.", "f": "A playground at lunchtime."}, "just": {"m": "Fair and right.", "f": "A just referee blows the whistle for both teams."}, "sleek": {"m": "Smooth, shiny and neat.", "f": "A seal swimming past is sleek."}, "devious": {"m": "Sneaky and dishonest, with a trick up the sleeve.", "f": "A seagull pretending not to want your chips."}, "agitate": {"m": "To stir up or upset.", "f": "Shake a fizzy drink and you agitate it. Do not open it."}, "acquire": {"m": "To get something.", "f": "Acquire one new word a day and you will be unstoppable."}, "descend": {"m": "To go down.", "f": "A puffin descends to the waves."}, "disturb": {"m": "To bother or interrupt.", "f": "Do not disturb a puffin mid-fish."}, "pacify": {"m": "To calm someone down.", "f": "A snack pacifies a grumpy puffin."}, "tranquil": {"m": "Calm and peaceful.", "f": "A still lake at sunrise."}, "errand": {"m": "A short trip to do a job.", "f": "Running to the shop for milk."}, "thorough": {"m": "Careful and complete.", "f": "A thorough tooth-brush gets every tooth."}, "placid": {"m": "Calm and not easily upset.", "f": "A placid cow chewing grass."}, "perturbed": {"m": "Worried and upset.", "f": "The face you pull when the fish has gone."}, "burden": {"m": "A heavy load, or a worry you have to carry.", "f": "A huge rucksack is a burden."}, "punctual": {"m": "On time.", "f": "Punctual puffins never miss the tide."}, "onus": {"m": "The duty that falls on you.", "f": "The onus is on you to tidy your room."}, "advantage": {"m": "Something that helps you do better.", "f": "Being tall is an advantage in basketball."}, "roam": {"m": "To wander around with no fixed plan.", "f": "Puffins roam the open sea."}, "gravitate": {"m": "To be drawn towards something.", "f": "Aaron gravitates to the biscuit tin."}, "drift": {"m": "To move slowly, carried along.", "f": "A leaf drifting down a stream."}, "omen": {"m": "A sign of something that will happen.", "f": "Dark clouds are an omen of rain."}, "consume": {"m": "To eat, drink or use up.", "f": "Puffins consume loads of sand eels."}, "withdraw": {"m": "To take back or move away.", "f": "A snail withdraws into its shell."}, "convey": {"m": "To carry or pass something on.", "f": "A conveyor belt conveys luggage. A message conveys news."}, "transfer": {"m": "To move something from one place to another.", "f": "Transfer the pasta from pan to plate."}, "seize": {"m": "To grab hold of something suddenly.", "f": "A gull seizes a chip. Rude."}, "permit": {"m": "To allow.", "f": "Mum permits two biscuits."}, "command": {"m": "To give an order.", "f": "Captain Cuffin commands the ship."}, "direct": {"m": "Straight, with no detours.", "f": "A direct route has no wiggles."}, "continuous": {"m": "Going on without stopping.", "f": "A continuous line has no gaps."}, "convoluted": {"m": "Twisty and complicated.", "f": "Instructions with 47 steps."}, "flourish": {"m": "To grow or do really well.", "f": "Plants flourish in sunshine."}, "interior": {"m": "The inside of something.", "f": "The interior of a nest is cosy."}, "decent": {"m": "Good, proper and respectable.", "f": "A decent person hands back a lost wallet."}, "upright": {"m": "Honest and doing the right thing.", "f": "An upright puffin never steals fish."}, "unrefined": {"m": "Rough, not polished or fancy.", "f": "A burping contest is unrefined."}, "despair": {"m": "Feeling that all hope is lost.", "f": "The puffin whose fish fell back in the sea."}, "retrieve": {"m": "To get something back.", "f": "A dog retrieves the stick. Good dog."}, "reclaim": {"m": "To take back something that is yours.", "f": "Reclaim your seat after a loo trip."}, "fertile": {"m": "Good for growing things.", "f": "Fertile soil grows giant carrots."}, "relinquish": {"m": "To give something up.", "f": "Relinquish the remote? Never."}, "approve": {"m": "To say yes, that is good.", "f": "Mum approves of this game."}, "artful": {"m": "Clever, often in a sneaky way.", "f": "An artful fox talks its way out of trouble."}, "yonder": {"m": "Over there, in the distance.", "f": "Look, a puffin yonder!"}, "aged": {"m": "Very old.", "f": "An aged tortoise has seen everything."}, "adolescent": {"m": "A young person between a child and a grown-up.", "f": "Basically a teenager."}, "juvenile": {"m": "Young, or childish.", "f": "A juvenile puffin is still learning to fish."}, "produce": {"m": "To make something.", "f": "A hen produces eggs."}, "procure": {"m": "To get something, often with a bit of effort.", "f": "Procure snacks for the journey."}, "dismantle": {"m": "To take something apart, piece by piece.", "f": "Dismantle the Lego tower."}, "probable": {"m": "Likely to happen.", "f": "Rain is probable. This is Britain."}, "create": {"m": "To make something brand new.", "f": "Create a masterpiece."}, "keen": {"m": "Very eager, or sharp.", "f": "Keen eyes spot fish from far away."}, "acute": {"m": "Sharp and strong.", "f": "Acute hearing: you hear the biscuit tin open."}, "contrary": {"m": "Opposite, or against.", "f": "A contrary puffin says no to everything."}, "antiquity": {"m": "Ancient times, a very long time ago.", "f": "The pyramids come from antiquity."}, "dull": {"m": "Boring, or not sharp.", "f": "A dull pencil will not write."}, "relish": {"m": "To really enjoy something.", "f": "Relish every chip."}, "eager": {"m": "Excited and keen to start.", "f": "Eager to begin the game."}, "detest": {"m": "To dislike very, very strongly.", "f": "I detest cold chips."}, "savour": {"m": "To enjoy slowly and properly.", "f": "Savour the last biscuit."}, "present": {"m": "Here, right now.", "f": "\"Present!\" says Aaron at registration."}, "covet": {"m": "To really want something that belongs to someone else.", "f": "Coveting a friend's shiny new bike."}, "crave": {"m": "To want very badly.", "f": "Craving chocolate."}, "elect": {"m": "To choose by voting.", "f": "Elect a class captain."}, "seek": {"m": "To look for.", "f": "Hide and seek."}, "scorn": {"m": "To treat as worthless.", "f": "Scorn is a sneer in word form."}, "regulated": {"m": "Controlled by rules.", "f": "Traffic lights keep the roads regulated."}, "peril": {"m": "Great danger.", "f": "A puffin in peril from a hungry gull."}, "turmoil": {"m": "Wild confusion.", "f": "A bedroom during the great sock hunt is turmoil."}, "deposit": {"m": "To put something down or into a bank.", "f": "Deposit coins in the piggy bank."}, "summit": {"m": "The very top of a mountain.", "f": "Aim for the summit."}, "peak": {"m": "The highest point.", "f": "The peak of the mountain."}, "summon": {"m": "To call someone to come.", "f": "Summon the butler. Ring the bell."}, "nadir": {"m": "The lowest point.", "f": "The nadir of the day: no snacks left."}, "sparse": {"m": "Thinly spread, not much of it.", "f": "Sparse trees on a bare hill."}, "scanty": {"m": "Very small in amount.", "f": "A scanty lunch. Barely a crumb."}, "sullen": {"m": "Gloomy and grumpy, saying very little.", "f": "A sullen puffin glares at the sea."}, "spar": {"m": "To practise a fight or argue playfully.", "f": "Spar with words, not fists."}, "abundant": {"m": "Plenty of it.", "f": "Abundant sand eels. Puffin heaven."}, "stern": {"m": "Serious and strict.", "f": "A stern look from the teacher."}, "stalk": {"m": "To follow quietly (or the stem of a plant).", "f": "A cat stalks a bird."}, "fragrant": {"m": "Smelling lovely.", "f": "Fragrant flowers."}, "lenient": {"m": "Gentle about punishing.", "f": "A lenient teacher forgives forgotten homework."}, "severe": {"m": "Very strict, or very bad.", "f": "A severe storm."}, "gaudy": {"m": "Too bright and showy.", "f": "A gaudy neon jumper."}, "lavish": {"m": "Generous, luxurious, plenty.", "f": "A lavish feast with ten puddings."}, "entire": {"m": "The whole thing.", "f": "The entire cake. Gone."}, "austere": {"m": "Plain and strict, with no frills.", "f": "An austere room: one chair, nothing else."}, "lofty": {"m": "Very high.", "f": "Lofty towers touch the clouds."}, "ramble": {"m": "To walk or talk without hurrying.", "f": "A ramble through the countryside."}, "upbeat": {"m": "Cheerful.", "f": "An upbeat song."}, "saunter": {"m": "To walk slowly and happily.", "f": "Saunter down the lane."}, "emerge": {"m": "To come out.", "f": "Emerge from the burrow."}, "sprint": {"m": "To run very fast.", "f": "Sprint to the finish line."}, "urban": {"m": "To do with towns and cities.", "f": "Urban buses and tall buildings."}, "domestic": {"m": "To do with the home.", "f": "A domestic cat lives at home."}, "metropolitan": {"m": "To do with a big city.", "f": "London is a metropolitan area."}, "endure": {"m": "To put up with something hard.", "f": "Endure a long car journey."}, "rural": {"m": "To do with the countryside.", "f": "Rural fields full of cows."}, "banish": {"m": "To send away for good.", "f": "Banish the dragon from the kingdom."}, "exile": {"m": "Being forced to live away from home.", "f": "A king in exile."}, "cease": {"m": "To stop.", "f": "Cease the noise, please."}, "pledge": {"m": "A serious promise.", "f": "A pledge to tidy my room."}, "incorporate": {"m": "To include as part of something.", "f": "Incorporate carrots into the soup."}, "communicate": {"m": "To share information.", "f": "Puffins communicate with squawks."}, "disclose": {"m": "To reveal a secret.", "f": "Disclose where the biscuits are."}, "compromise": {"m": "Meeting in the middle.", "f": "Half a biscuit each."}, "dissent": {"m": "To disagree.", "f": "One voice of dissent in the meeting."}, "conceal": {"m": "To hide.", "f": "Conceal the presents."}, "guarantee": {"m": "A promise that something will happen.", "f": "Guaranteed to make you smile."}, "breach": {"m": "A break, or breaking a promise.", "f": "A breach in the sandcastle wall."}, "innocent": {"m": "Not guilty.", "f": "Innocent until proven guilty."}, "forlorn": {"m": "Sad and lonely.", "f": "A forlorn sock without its pair."}, "supervise": {"m": "To watch over and guide.", "f": "Supervise the experiment."}, "manage": {"m": "To be in charge of.", "f": "Manage the team."}, "shuffle": {"m": "To mix up, or slide your feet.", "f": "Shuffle the cards."}, "adept": {"m": "Very good at something.", "f": "Adept at puzzles."}, "abandon": {"m": "To leave behind for good.", "f": "Abandon ship!"}, "struggle": {"m": "To try hard against something difficult.", "f": "Struggle with a jam jar lid."}, "wrestle": {"m": "To grapple with.", "f": "Wrestle a stubborn zip."}, "strut": {"m": "To walk proudly.", "f": "A puffin struts along the rock."}, "topple": {"m": "To fall over.", "f": "Topple the tower."}, "idleness": {"m": "Doing nothing at all.", "f": "Idleness on a lazy Sunday."}, "eccentric": {"m": "Unusual and a bit odd.", "f": "An eccentric inventor wears a teapot as a hat."}, "bizarre": {"m": "Very strange.", "f": "A bizarre dream about flying custard."}, "mature": {"m": "Grown up.", "f": "A mature oak tree."}, "augment": {"m": "To make bigger.", "f": "Augment your pocket money by doing chores."}, "customary": {"m": "Usual, by tradition.", "f": "It is customary to say thank you."}, "comprehend": {"m": "To understand.", "f": "Comprehend the lesson."}, "perceive": {"m": "To notice or understand.", "f": "Perceive a change in the weather."}, "relate": {"m": "To tell a story, or to connect.", "f": "Relate the tale of the lost fish."}, "overlook": {"m": "To miss or ignore.", "f": "Overlook a typo."}, "shabby": {"m": "Worn out and scruffy.", "f": "A shabby old coat."}, "wayward": {"m": "Hard to control, going its own way.", "f": "A wayward balloon drifts off."}, "unruly": {"m": "Wild and disobedient.", "f": "Unruly hair."}, "compliant": {"m": "Doing as you are asked.", "f": "Compliant: puts shoes on first time."}, "nasty": {"m": "Unpleasant.", "f": "A nasty smell."}, "contempt": {"m": "A feeling that someone is worthless.", "f": "Looking at it with contempt."}, "suspect": {"m": "To think something may be true.", "f": "Suspect the cat ate the fish."}, "scorch": {"m": "To burn the surface.", "f": "Scorched toast."}, "flattery": {"m": "Over-the-top praise to win a favour.", "f": "Flattery might get you a biscuit."}, "veto": {"m": "To say no, officially.", "f": "The king vetoed the law."}, "coarse": {"m": "Rough.", "f": "Coarse sandpaper."}, "alter": {"m": "To change.", "f": "Alter a recipe."}, "sanction": {"m": "An official okay (it can also mean a punishment).", "f": "Official sanction to play."}, "squander": {"m": "To waste.", "f": "Squander pocket money on sweets."}, "nimble": {"m": "Quick and light on your feet.", "f": "A nimble goat on a cliff."}, "assent": {"m": "To agree.", "f": "Assent with a nod."}, "obtain": {"m": "To get.", "f": "Obtain tickets."}, "earnest": {"m": "Serious and sincere.", "f": "An earnest apology."}, "frivolous": {"m": "Silly and not serious.", "f": "A frivolous hat covered in pom-poms."}, "sanitary": {"m": "Clean and healthy.", "f": "Sanitary hands. Wash them."}, "sincere": {"m": "Honest and meaning it.", "f": "A sincere thank-you."}, "elite": {"m": "The very best of a group.", "f": "The elite squad."}, "maim": {"m": "To badly injure.", "f": "A serious word that means to injure badly."}, "embrace": {"m": "To hug or welcome.", "f": "Embrace your gran."}, "restore": {"m": "To fix and bring back.", "f": "Restore an old painting."}, "deplete": {"m": "To use up.", "f": "Deplete the biscuit supply."}, "maul": {"m": "To attack and hurt roughly.", "f": "A serious word: a bear might maul."}, "obscure": {"m": "Hard to see or know.", "f": "An obscure little path."}, "obstinate": {"m": "Stubborn.", "f": "An obstinate mule will not budge."}, "cryptic": {"m": "Mysterious and hard to understand.", "f": "A cryptic clue."}, "palpable": {"m": "So clear you could almost touch it.", "f": "The excitement was palpable."}, "optimum": {"m": "The best possible.", "f": "The optimum temperature for tea."}, "commend": {"m": "To praise.", "f": "Commended for good work."}, "inept": {"m": "Clumsy and unskilled.", "f": "Inept at juggling."}, "unstable": {"m": "Wobbly.", "f": "An unstable tower."}, "applaud": {"m": "To clap.", "f": "Applaud the show."}, "censure": {"m": "Strong disapproval.", "f": "Censure for being rude."}, "dismal": {"m": "Gloomy and miserable.", "f": "A dismal grey day."}, "jolly": {"m": "Cheerful.", "f": "A jolly snowman."}, "admission": {"m": "Entry, or owning up.", "f": "Admission is free."}, "bleak": {"m": "Cold, empty and cheerless.", "f": "A bleak empty moor."}, "decline": {"m": "To say no, or to go down.", "f": "Decline an invitation."}, "revere": {"m": "To deeply respect.", "f": "Revere a hero."}, "regard": {"m": "To think of with respect.", "f": "Regard highly."}, "abhor": {"m": "To dislike something deeply and strongly.", "f": "Abhor injustice."}, "rally": {"m": "To gather together.", "f": "Rally the team."}, "appeal": {"m": "To ask earnestly, or to attract.", "f": "Appeal for help."}, "nominal": {"m": "Tiny, hardly anything.", "f": "A nominal fee of 1p."}, "misuse": {"m": "To use wrongly.", "f": "Misuse a tool."}, "credit": {"m": "Praise or recognition.", "f": "Credit where it is due."}, "significant": {"m": "Important or large.", "f": "A significant discovery."}, "minimal": {"m": "The smallest amount.", "f": "Minimal mess."}, "capability": {"m": "The ability to do something.", "f": "The capability to fly."}, "sacrifice": {"m": "To give something up for a good reason.", "f": "Sacrifice your last sweet."}, "flair": {"m": "Natural talent.", "f": "A flair for drawing."}, "barren": {"m": "Nothing can grow there.", "f": "A barren desert."}, "incapacity": {"m": "Not being able to do something.", "f": "Incapacity to lift a heavy box."}, "banal": {"m": "Boring and predictable.", "f": "A banal chat about the weather."}, "innovative": {"m": "Full of new ideas.", "f": "An innovative gadget."}, "prominent": {"m": "Easy to see, or well known.", "f": "A prominent nose."}, "compulsory": {"m": "You must do it.", "f": "Compulsory homework. Sorry."}, "trite": {"m": "Said so often it has lost meaning.", "f": "A trite saying."}, "wane": {"m": "To get smaller or weaker.", "f": "The moon wanes."}, "enhance": {"m": "To make better.", "f": "Enhance a photo."}, "accuse": {"m": "To say someone did wrong.", "f": "Accuse the cat."}, "commence": {"m": "To begin.", "f": "Commence the quiz."}, "concur": {"m": "To agree.", "f": "\"I concur,\" said the puffin."}, "calamity": {"m": "A terrible disaster.", "f": "A calamity: the cake fell."}, "sly": {"m": "Clever and sneaky.", "f": "A sly fox."}, "benefit": {"m": "A good result, or help.", "f": "The benefit of sleep."}, "malady": {"m": "An illness (an old-fashioned word).", "f": "A malady is an illness."}, "genuine": {"m": "Real, not fake.", "f": "A genuine smile."}, "cunning": {"m": "Clever at tricking.", "f": "A cunning plan."}, "discount": {"m": "To ignore or treat as not important.", "f": "Discount the rumour."}, "examine": {"m": "To look at closely.", "f": "Examine a bug."}, "ponder": {"m": "To think about carefully.", "f": "Ponder the puzzle."}, "stall": {"m": "To stop or delay.", "f": "The engine stalls."}, "curb": {"m": "To hold back.", "f": "Curb your appetite."}, "livid": {"m": "Furiously angry.", "f": "Livid about the broken toy."}, "broaden": {"m": "To make wider.", "f": "Broaden your mind."}, "restrict": {"m": "To limit.", "f": "Restrict screen time."}, "comply": {"m": "To follow a rule.", "f": "Comply with the rules."}, "compose": {"m": "To write music or put together.", "f": "Compose a song."}, "rebuff": {"m": "To reject sharply.", "f": "Rebuff an offer."}, "adhere": {"m": "To stick to.", "f": "Adhere to the plan."}, "hostile": {"m": "Unfriendly and aggressive.", "f": "A hostile glare."}, "impartial": {"m": "Fair, not taking sides.", "f": "An impartial referee."}, "fragile": {"m": "Easily broken.", "f": "Fragile glass."}, "congenial": {"m": "Pleasant and friendly.", "f": "A congenial host."}, "aggressive": {"m": "Ready to attack.", "f": "An aggressive goose."}, "accomplishment": {"m": "Something you have achieved.", "f": "Winning the race is an accomplishment."}, "success": {"m": "Achieving what you hoped for.", "f": "Success tastes sweet."}, "incompetence": {"m": "Not being able to do the job.", "f": "Making tea with cold water is incompetence."}, "possess": {"m": "To own.", "f": "Possess a bike."}, "undertake": {"m": "To agree to do.", "f": "Undertake a quest."}, "discernible": {"m": "Able to be noticed.", "f": "A discernible smell of pizza."}, "dubious": {"m": "Doubtful.", "f": "A dubious excuse."}, "submit": {"m": "To hand in, or give in.", "f": "Submit your homework."}, "evident": {"m": "Plain to see.", "f": "Evident joy."}, "uncanny": {"m": "Strange in a spooky way.", "f": "An uncanny silence."}, "deceit": {"m": "Lying and tricking.", "f": "Deceit is lying."}, "eerie": {"m": "Spooky.", "f": "An eerie fog."}, "unremarkable": {"m": "Ordinary, nothing special.", "f": "An unremarkable Tuesday."}, "mollify": {"m": "To calm someone down.", "f": "Mollify with a biscuit."}, "supple": {"m": "Bendy and flexible.", "f": "A supple gymnast."}, "suppress": {"m": "To hold back.", "f": "Suppress a giggle."}, "lithe": {"m": "Slim and graceful.", "f": "A lithe cat."}, "gregarious": {"m": "Loves being with others.", "f": "Gregarious as puffins in a colony."}, "rigid": {"m": "Stiff, does not bend.", "f": "A rigid plank."}, "turbulent": {"m": "Rough and stormy.", "f": "Turbulent seas."}, "balmy": {"m": "Warm and pleasant.", "f": "A balmy summer night."}, "implore": {"m": "To beg.", "f": "Implore for another chapter."}, "tempestuous": {"m": "Stormy and wild.", "f": "A tempestuous sea."}, "indolent": {"m": "Lazy.", "f": "An indolent cat naps all day."}, "dumb": {"m": "Unable to speak (this word can also be rude, so be careful).", "f": "Another word for mute."}, "vocal": {"m": "Speaking out loud.", "f": "A vocal crowd."}, "pompous": {"m": "Full of your own importance.", "f": "A pompous peacock."}, "mute": {"m": "Silent.", "f": "Press the mute button."}, "ancestor": {"m": "A relative from long ago.", "f": "Your great-great-grandparent."}, "precocious": {"m": "Grown up for your age.", "f": "A precocious toddler reading a novel."}, "predecessor": {"m": "Someone who came before you.", "f": "The old captain is the new captain's predecessor."}, "descendent": {"m": "Someone who comes after you in a family.", "f": "Your children are your descendents."}, "validate": {"m": "To confirm something is correct.", "f": "Validate a ticket."}, "stabilise": {"m": "To make steady.", "f": "Stabilise the wobbly table."}, "repudiate": {"m": "To reject.", "f": "Repudiate a claim."}, "confirm": {"m": "To say it is true.", "f": "Confirm the booking."}, "insert": {"m": "To put into.", "f": "Insert the coin."}, "brazen": {"m": "Bold and shameless.", "f": "A brazen seagull steals chips."}, "timid": {"m": "Shy and easily scared.", "f": "A timid mouse."}, "bold": {"m": "Brave.", "f": "A bold knight."}, "superficial": {"m": "Only on the surface.", "f": "A superficial scratch."}, "frail": {"m": "Weak and delicate.", "f": "A frail old branch."}, "decay": {"m": "To rot.", "f": "Tooth decay. Brush!"}, "feeble": {"m": "Weak.", "f": "A feeble cry."}, "hearty": {"m": "Strong, healthy and warm.", "f": "A hearty stew."}, "blunt": {"m": "Not sharp, or very direct.", "f": "A blunt knife."}, "oppose": {"m": "To be against.", "f": "Oppose a plan."}, "resist": {"m": "To fight against.", "f": "Resist the cake."}, "yearn": {"m": "To long for.", "f": "Yearn for summer."}, "linger": {"m": "To stay a bit longer.", "f": "Linger over breakfast."}, "bolster": {"m": "To support.", "f": "Bolster the team."}, "stingy": {"m": "Not willing to spend or share.", "f": "A stingy puffin hoards the fish."}, "miserly": {"m": "Really not wanting to spend money.", "f": "A miserly millionaire."}, "tyrant": {"m": "A cruel ruler.", "f": "A tyrant bossing everyone."}, "temperate": {"m": "Mild, not extreme.", "f": "A temperate climate."}, "pristine": {"m": "Perfectly clean and new.", "f": "A pristine white shirt."}, "grimy": {"m": "Dirty.", "f": "Grimy hands."}, "immaculate": {"m": "Perfectly clean and neat.", "f": "An immaculate kitchen."}, "coherent": {"m": "Clear and makes sense.", "f": "A coherent story."}, "logical": {"m": "Makes sense, step by step.", "f": "A logical plan."}, "luminous": {"m": "Glowing.", "f": "Luminous paint glows in the dark."}, "copious": {"m": "Plenty of.", "f": "Copious notes."}, "feud": {"m": "A long, angry quarrel.", "f": "A family feud."}, "accord": {"m": "Agreement.", "f": "In accord."}, "forgo": {"m": "To go without.", "f": "Forgo pudding."}, "futile": {"m": "Pointless.", "f": "A futile attempt to catch the wind."}, "altercation": {"m": "A noisy argument.", "f": "A loud altercation over the last biscuit."}, "gleam": {"m": "A soft shine.", "f": "A gleam in the eye."}, "waft": {"m": "To drift gently through the air.", "f": "The smell of toast wafts upstairs."}, "startle": {"m": "To surprise suddenly.", "f": "A bang startles the puffins."}, "muted": {"m": "Quiet and soft.", "f": "Muted colours."}, "sheen": {"m": "A soft shine.", "f": "The sheen on silk."}, "sermon": {"m": "A talk, often about right and wrong.", "f": "A long sermon."}, "hinder": {"m": "To get in the way.", "f": "Hinder progress."}, "dialogue": {"m": "A conversation.", "f": "A dialogue between two friends."}, "residence": {"m": "A home.", "f": "The king's residence."}, "lecture": {"m": "A long talk.", "f": "A lecture on manners."}, "merge": {"m": "To join together.", "f": "Merge two lanes of traffic."}, "malign": {"m": "To say nasty things about someone.", "f": "Malign a name."}, "oppress": {"m": "To treat harshly.", "f": "Oppress people."}, "disjoin": {"m": "To separate.", "f": "Disjoin the pieces."}, "fuse": {"m": "To join together.", "f": "Fuse two metals."}, "nauseous": {"m": "Feeling sick.", "f": "Nauseous on the boat."}, "absurd": {"m": "Silly and unreasonable.", "f": "An absurd hat."}, "thriving": {"m": "Doing really well.", "f": "A thriving garden."}, "queasy": {"m": "A bit sick.", "f": "Queasy in the car."}, "convert": {"m": "To change into something else.", "f": "Convert pounds into dollars."}, "contest": {"m": "To argue against, or a competition.", "f": "Contest a decision."}, "concede": {"m": "To admit, or give in.", "f": "Concede defeat."}, "suffice": {"m": "To be enough.", "f": "A snack will suffice."}, "endeavour": {"m": "A serious try.", "f": "Best endeavour."}, "dispute": {"m": "An argument.", "f": "A dispute about the rules."}, "myriad": {"m": "A huge number of.", "f": "Myriad stars."}, "multiple": {"m": "Many.", "f": "Multiple choices."}, "abstain": {"m": "To hold yourself back.", "f": "Abstain from sweets."}, "sole": {"m": "Only one.", "f": "The sole survivor."}, "kindle": {"m": "To start a fire or a feeling.", "f": "Kindle a flame."}, "labour": {"m": "Hard work.", "f": "A labour of love."}, "provoke": {"m": "To stir up.", "f": "Provoke a reaction."}, "quench": {"m": "To put out a fire or a thirst.", "f": "Quench your thirst."}, "assistance": {"m": "Help.", "f": "Assistance needed."}, "idle": {"m": "Doing nothing.", "f": "Idle hands."}, "diligent": {"m": "Hard-working and careful.", "f": "A diligent student."}, "assault": {"m": "A violent attack.", "f": "An assault is a violent attack."}, "ineffective": {"m": "Does not work.", "f": "An ineffective umbrella."}, "animated": {"m": "Lively.", "f": "An animated chat."}, "hygienic": {"m": "Clean and healthy.", "f": "A hygienic kitchen."}, "deliberate": {"m": "Done on purpose.", "f": "A deliberate choice."}, "glum": {"m": "Sad and gloomy.", "f": "A glum face."}, "entice": {"m": "To tempt.", "f": "Entice with treats."}, "accelerate": {"m": "To go faster.", "f": "Accelerate the car."}, "repulse": {"m": "To drive back, or disgust.", "f": "Repulse an attack."}, "confer": {"m": "To discuss together, or to give.", "f": "Confer with friends."}, "tantalising": {"m": "Tempting but just out of reach.", "f": "The tantalising smell of cake."}, "noted": {"m": "Well known.", "f": "A noted author."}, "humdrum": {"m": "Dull and ordinary.", "f": "A humdrum day."}, "titillating": {"m": "Exciting and teasing.", "f": "A titillating clue."}, "sturdy": {"m": "Strong.", "f": "Sturdy boots."}, "yield": {"m": "To give way, or to produce.", "f": "Yield to traffic."}, "undergo": {"m": "To go through.", "f": "Undergo training."}, "expose": {"m": "To uncover.", "f": "Expose the truth."}, "retain": {"m": "To keep.", "f": "Retain information."}, "intention": {"m": "A plan or aim.", "f": "Good intentions."}, "deform": {"m": "To change the shape badly.", "f": "Deform the metal."}, "divine": {"m": "Heavenly.", "f": "A divine cake."}, "reluctant": {"m": "Unwilling.", "f": "Reluctant to get up."}, "foul": {"m": "Disgusting.", "f": "A foul smell."}, "aromatic": {"m": "Having a strong, pleasant smell.", "f": "Aromatic herbs."}, "cautious": {"m": "Careful.", "f": "Cautious on the ice."}, "negligent": {"m": "Careless.", "f": "A negligent driver."}, "wary": {"m": "On your guard.", "f": "Wary of strangers."}, "jubilant": {"m": "Overjoyed.", "f": "A jubilant crowd."}, "vex": {"m": "To annoy.", "f": "Vexed by noisy neighbours."}, "ally": {"m": "A friend who helps you.", "f": "An ally in battle."}, "appease": {"m": "To calm by giving in.", "f": "Appease with a snack."}, "imitate": {"m": "To copy.", "f": "Imitate a bird."}, "exasperate": {"m": "To annoy a lot.", "f": "Exasperated by dawdling."}, "routine": {"m": "A regular way of doing things.", "f": "A morning routine."}, "abnormal": {"m": "Not normal.", "f": "Abnormal behaviour."}, "ultimate": {"m": "Final, or the very best.", "f": "The ultimate prize."}, "conventional": {"m": "Traditional.", "f": "Conventional methods."}, "fundamental": {"m": "Basic and essential.", "f": "Fundamental rules."}, "complex": {"m": "Complicated.", "f": "A complex puzzle."}, "humble": {"m": "Modest.", "f": "A humble hero."}, "elementary": {"m": "Basic.", "f": "Elementary maths."}, "fatal": {"m": "Causing death.", "f": "A fatal mistake is a deadly one."}, "brief": {"m": "Short, or to give information.", "f": "A brief chat."}, "forbid": {"m": "To not allow.", "f": "Forbid entry."}, "advance": {"m": "To move forward.", "f": "Advance one step."}, "withhold": {"m": "To hold back.", "f": "Withhold information."}, "inform": {"m": "To tell.", "f": "Inform the class."}, "ornamental": {"m": "Decorative.", "f": "An ornamental garden."}, "unembellished": {"m": "Plain, with no decoration.", "f": "The unembellished truth."}, "ornate": {"m": "Highly decorated.", "f": "An ornate mirror."}, "overt": {"m": "Open, not hidden.", "f": "Overt kindness."}, "occupied": {"m": "Busy, or taken.", "f": "An occupied seat."}, "colossal": {"m": "Enormous.", "f": "A colossal statue."}, "cocky": {"m": "Too sure of yourself.", "f": "A cocky cockerel."}, "diminutive": {"m": "Tiny.", "f": "A diminutive puppy."}, "conclude": {"m": "To finish, or decide.", "f": "Conclude the story."}, "gargantuan": {"m": "Gigantic.", "f": "A gargantuan burger."}, "astute": {"m": "Quick to notice, clever.", "f": "An astute detective."}, "ignorant": {"m": "Not knowing.", "f": "Ignorant of the rules."}, "secret": {"m": "Hidden.", "f": "A secret handshake."}, "prudent": {"m": "Sensible and careful.", "f": "Prudent saving."}, "thwart": {"m": "To stop someone's plan.", "f": "Thwart the villain."}, "foil": {"m": "To stop a plan.", "f": "Foil the plot."}, "moderate": {"m": "Average, not extreme.", "f": "Moderate speed."}, "assist": {"m": "To help.", "f": "Assist a friend."}, "serene": {"m": "Calm and peaceful.", "f": "A serene pond."}, "meagre": {"m": "Very small in amount.", "f": "Meagre rations."}, "poised": {"m": "Calm and balanced.", "f": "A poised dancer."}, "clamorous": {"m": "Loud and noisy.", "f": "A clamorous crowd."}, "modest": {"m": "Humble, or small.", "f": "A modest house."}, "unkempt": {"m": "Messy.", "f": "Unkempt hair."}, "dishevelled": {"m": "Untidy.", "f": "Dishevelled after the storm."}, "immune": {"m": "Protected from.", "f": "Immune to a disease."}, "ordered": {"m": "Neat, in order.", "f": "Ordered books."}, "elevate": {"m": "To raise up.", "f": "Elevate the platform."}, "assemble": {"m": "To put together, or gather.", "f": "Assemble a model."}, "demote": {"m": "To move to a lower rank.", "f": "Demote the captain."}, "prohibit": {"m": "To forbid.", "f": "Swimming prohibited."}, "uniform": {"m": "All the same.", "f": "A school uniform."}, "standardised": {"m": "Made the same way each time.", "f": "Standardised sizes."}, "variable": {"m": "Changing.", "f": "Variable weather."}, "imperial": {"m": "To do with an empire.", "f": "An imperial palace."}, "coax": {"m": "To gently persuade.", "f": "Coax a cat out from under the bed."}, "ecstatic": {"m": "Overjoyed.", "f": "Ecstatic at the news."}, "grave": {"m": "Serious.", "f": "A grave face."}, "antagonise": {"m": "To make someone an enemy.", "f": "Antagonise the dog."}, "despise": {"m": "To dislike very strongly.", "f": "Despise bullying."}, "lean": {"m": "Thin and fit.", "f": "A lean athlete."}, "stout": {"m": "Sturdy and round.", "f": "A stout stick."}, "insolent": {"m": "Rude.", "f": "An insolent reply."}, "gaunt": {"m": "Thin and tired-looking.", "f": "A gaunt face."}, "accurate": {"m": "Exactly right.", "f": "An accurate measurement."}, "extend": {"m": "To stretch out.", "f": "Extend a hand."}, "precise": {"m": "Exact.", "f": "Precise instructions."}, "vague": {"m": "Not clear.", "f": "A vague idea."}, "affirm": {"m": "To say firmly it is true.", "f": "Affirm your support."}, "resentment": {"m": "Bitter anger kept inside.", "f": "Resentment about unfairness."}, "enviousness": {"m": "Wanting what others have.", "f": "Enviousness is jealousy."}, "vast": {"m": "Huge.", "f": "A vast desert."}, "affection": {"m": "Fondness.", "f": "A hug shows affection."}, "wretched": {"m": "Miserable.", "f": "A wretched day."}, "lurch": {"m": "A sudden stagger.", "f": "The bus lurched."}, "flounder": {"m": "To struggle clumsily.", "f": "Flounder in mud."}, "idol": {"m": "A hero you admire.", "f": "A pop idol."}, "exterior": {"m": "The outside.", "f": "The exterior of the house."}, "conserve": {"m": "To save and protect.", "f": "Conserve water."}, "cooperate": {"m": "To work together.", "f": "Cooperate as a team."}, "preserve": {"m": "To keep safe.", "f": "Preserve fruit in jars."}, "instigate": {"m": "To start trouble.", "f": "Instigate an argument."}, "endanger": {"m": "To put in danger.", "f": "Endanger wildlife."}, "understand": {"m": "To get it.", "f": "Understand the question."}, "scrutinise": {"m": "To look at very carefully.", "f": "Scrutinise a map."}, "skim": {"m": "To glance over quickly.", "f": "Skim a page."}, "glisten": {"m": "To sparkle wetly.", "f": "Dew glistens."}, "glint": {"m": "A tiny flash of light.", "f": "A glint in the eye."}, "hazy": {"m": "Not clear.", "f": "A hazy morning."}, "twilight": {"m": "The dim light after sunset.", "f": "A twilight walk."}, "proportion": {"m": "A part of the whole.", "f": "The proportion of boys to girls."}, "calculated": {"m": "Carefully planned.", "f": "A calculated risk."}, "unforeseen": {"m": "Not expected.", "f": "An unforeseen delay."}, "pierce": {"m": "To make a hole.", "f": "Pierce with a pin."}, "vouch": {"m": "To say you know it is true.", "f": "Vouch for a friend."}, "visible": {"m": "Able to be seen.", "f": "Visible from space."}, "ambiguous": {"m": "Could mean two things.", "f": "An ambiguous answer."}, "complete": {"m": "Whole, finished.", "f": "A complete set."}, "ascend": {"m": "To go up.", "f": "Ascend the stairs."}, "scale": {"m": "To climb.", "f": "Scale a wall."}, "harass": {"m": "To bother again and again.", "f": "Harass means repeated annoyance."}, "pester": {"m": "To keep on bothering.", "f": "Pester for sweets."}, "anxiety": {"m": "Worry.", "f": "Anxiety before a test."}, "surplus": {"m": "More than you need.", "f": "Surplus apples."}, "excess": {"m": "Too much.", "f": "Excess baggage."}, "wanting": {"m": "Missing, or not enough.", "f": "Found wanting."}, "gaiter": {"m": "A cover for your lower leg.", "f": "Walking gaiters."}, "ordeal": {"m": "A painful experience.", "f": "An ordeal of a trip."}, "nostalgic": {"m": "Fondly missing the past.", "f": "Nostalgic about when you were little."}, "wistful": {"m": "Sadly longing.", "f": "A wistful sigh."}, "indifferent": {"m": "Not caring.", "f": "Indifferent to the result."}, "anxious": {"m": "Worried.", "f": "Anxious about the exam."}, "coy": {"m": "Pretending to be shy.", "f": "A coy smile."}, "inferior": {"m": "Lower in quality.", "f": "Inferior goods."}, "besieged": {"m": "Surrounded by attackers.", "f": "A castle besieged."}, "prosperous": {"m": "Rich and successful.", "f": "A prosperous town."}, "mediocre": {"m": "Just average.", "f": "A mediocre meal."}, "exceptional": {"m": "Outstanding.", "f": "Exceptional marks."}, "prevail": {"m": "To win, or to be common.", "f": "Good will prevail."}, "overcome": {"m": "To beat.", "f": "Overcome your fear."}, "reflect": {"m": "To bounce back, or to think.", "f": "Reflect on the day."}, "forfeit": {"m": "To lose by breaking a rule.", "f": "Forfeit the match."}, "compel": {"m": "To force.", "f": "Compel to obey."}, "candid": {"m": "Honest and open, even when it is awkward.", "f": "A candid friend tells you if you have spinach in your teeth."}, "carp": {"m": "To complain about small things.", "f": "Carping about the weather again."}, "disarray": {"m": "A messy, muddled state.", "f": "A bedroom in disarray after the great toy hunt."}, "fret": {"m": "To worry.", "f": "Fretting over a spelling test."}, "laud": {"m": "To praise highly.", "f": "Laud the winner with a big cheer."}, "polarity": {"m": "Being at opposite extremes, like the two ends of a magnet.", "f": "The polarity of north and south poles."}, "propose": {"m": "To put forward an idea or plan.", "f": "Propose a picnic by the sea."}, "imply": {"m": "To hint at something without saying it.", "f": "A raised eyebrow implies \"really?\""}, "surreal": {"m": "Dreamlike and very strange.", "f": "A surreal dream where fish fly."}, "genre": {"m": "A type of book, film or music.", "f": "Mystery is Aaron's favourite genre."}, "retort": {"m": "A quick, sharp reply.", "f": "A witty retort."}, "deceive": {"m": "To trick someone into believing something false.", "f": "Deceive with a disguise."}, "delude": {"m": "To fool someone into believing something untrue.", "f": "Delude yourself that it is not bedtime."}, "aid": {"m": "To help.", "f": "Aid a friend in need."}, "irrational": {"m": "Not sensible or based on reason.", "f": "An irrational fear of socks."}, "familiar": {"m": "Well known to you.", "f": "A familiar face."}, "fresh": {"m": "New, clean, not stale.", "f": "Fresh bread."}, "mundane": {"m": "Ordinary and a bit boring.", "f": "A mundane Monday."}, "rehearse": {"m": "To practise before the real thing.", "f": "Rehearse the school play."}, "recite": {"m": "To say aloud from memory.", "f": "Recite a poem."}, "achieve": {"m": "To succeed in doing something.", "f": "Achieve a goal."}, "alert": {"m": "Awake and watchful.", "f": "Alert as a puffin spotting a gull."}, "amend": {"m": "To change something to improve it.", "f": "Amend your essay."}, "mar": {"m": "To spoil.", "f": "A scratch mars the paint."}, "modify": {"m": "To change a little.", "f": "Modify the recipe."}, "declare": {"m": "To announce clearly.", "f": "Declare the winner."}, "plunge": {"m": "To dive or drop suddenly.", "f": "Plunge into the pool."}, "classify": {"m": "To sort into groups.", "f": "Classify animals into mammals and birds."}, "allocate": {"m": "To share out for a purpose.", "f": "Allocate a desk to each pupil."}, "clatter": {"m": "A loud rattling noise.", "f": "The clatter of pans."}, "clamour": {"m": "A loud, confused noise.", "f": "A clamour of voices."}, "enterprise": {"m": "A big project, or a business.", "f": "A bold enterprise."}, "incision": {"m": "A neat cut.", "f": "A surgeon makes an incision."}, "helix": {"m": "A spiral shape, like a coil.", "f": "DNA is a double helix."}, "pastime": {"m": "A hobby you do for fun.", "f": "Chess is a pastime."}, "venture": {"m": "A risky or exciting project.", "f": "A venture into the unknown."}, "fluctuate": {"m": "To keep going up and down.", "f": "Temperatures fluctuate."}, "mere": {"m": "Nothing more than.", "f": "A mere scratch."}, "resolve": {"m": "To settle, or a firm decision.", "f": "Resolve the problem."}, "oscillate": {"m": "To swing back and forth.", "f": "A pendulum oscillates."}, "wade": {"m": "To walk through water or mud with effort.", "f": "Wade across the stream with wet socks."}, "harbour": {"m": "A safe place where boats shelter, or to keep something in your mind.", "f": "Boats rest in the harbour."}, "caged": {"m": "Shut inside a cage.", "f": "A caged bird wants to fly."}, "coil": {"m": "To wind round and round, or the loops themselves.", "f": "A snake coils up for a nap."}, "wring": {"m": "To twist and squeeze, like getting water out of a cloth.", "f": "Wring out the wet towel."}, "parallel": {"m": "Side by side and always the same distance apart, like train tracks.", "f": "Parallel lines never meet."}, "accustom": {"m": "To get used to something.", "f": "Accustom your eyes to the dark."}, "acquaint": {"m": "To make someone familiar with something.", "f": "Acquaint yourself with the rules before you play."}, "extract": {"m": "To pull or take something out.", "f": "Extract a splinter. Gently."}, "atheist": {"m": "Someone who does not believe in any god.", "f": "An atheist is a person, not a thing you do."}, "allay": {"m": "To calm or ease a fear or worry.", "f": "A hug allays a nightmare."}, "assuage": {"m": "To make a feeling less strong, like soothing worry or hunger.", "f": "A biscuit assuages hunger."}, "insult": {"m": "To say something rude to someone.", "f": "Insult is a rude remark. Be kind instead."}, "impair": {"m": "To damage or make weaker.", "f": "A cold can impair your sense of smell."}, "amaze": {"m": "To surprise someone hugely.", "f": "A magician amazes the crowd."}, "halt": {"m": "To stop.", "f": "The guard shouts, \"Halt!\""}, "interval": {"m": "A gap of time or space between two things.", "f": "An interval at the theatre for ice cream."}, "prevent": {"m": "To stop something from happening.", "f": "Prevent a spill by using a lid."}, "persist": {"m": "To keep going and not give up.", "f": "Persist until you can ride the bike."}, "envelop": {"m": "To wrap up or surround completely.", "f": "Fog envelops the harbour."}, "encompass": {"m": "To surround or include.", "f": "The fence encompasses the whole garden."}, "surface": {"m": "To come up into view, or the outside layer.", "f": "A whale surfaces for air."}, "disappear": {"m": "To vanish.", "f": "Biscuits disappear very fast."}, "discharge": {"m": "To release or let go, or to send away.", "f": "Discharge the water from the bath."}, "discern": {"m": "To notice or work out something that is hard to see.", "f": "Discern a puffin on a foggy cliff."}, "reveal": {"m": "To show or tell something that was hidden.", "f": "Reveal the surprise!"}, "consider": {"m": "To think about carefully.", "f": "Consider your answer before you click."}, "confound": {"m": "To confuse or puzzle someone completely.", "f": "A tricky riddle will confound you."}, "conduct": {"m": "To lead or carry out, or how you behave.", "f": "Conduct an orchestra or an experiment."}, "smother": {"m": "To cover so completely that something cannot breathe, or to put out a fire.", "f": "Smother the flames with a blanket."}, "smug": {"m": "Too pleased with yourself.", "f": "A smug grin after winning."}, "inhale": {"m": "To breathe in.", "f": "Inhale the smell of fresh bread."}, "stifle": {"m": "To hold back or smother.", "f": "Stifle a yawn in class."}, "porous": {"m": "Full of tiny holes that let air or water through.", "f": "A sponge is porous."}, "balk": {"m": "To hesitate or refuse to go on with something.", "f": "The horse balked at the jump."}, "waver": {"m": "To be unsure and keep changing your mind.", "f": "Waver between chocolate and vanilla."}, "wander": {"m": "To walk around with no fixed plan.", "f": "Wander along the beach."}, "dwelling": {"m": "A place where someone lives.", "f": "A cosy dwelling by the sea."}, "conquer": {"m": "To beat and take control of.", "f": "Conquer the mountain."}, "subdue": {"m": "To calm down or bring under control.", "f": "Subdue the wild horse."}, "discuss": {"m": "To talk about something together.", "f": "Discuss the plan."}, "sophisticated": {"m": "Fancy, grown-up and refined.", "f": "A sophisticated dinner party."}, "crude": {"m": "Rough and rude, not polished.", "f": "A crude joke."}, "improve": {"m": "To make better.", "f": "Improve your handwriting."}, "refined": {"m": "Polished and elegant.", "f": "Refined manners."}, "adverse": {"m": "Harmful or unfavourable.", "f": "Adverse weather cancelled the trip."}, "hospitable": {"m": "Friendly and welcoming to guests.", "f": "A hospitable host offers tea."}, "warp": {"m": "To bend out of shape.", "f": "Wood warps in the damp."}, "soiled": {"m": "Dirty.", "f": "Soiled laundry."}, "trivia": {"m": "Little facts that are not very important.", "f": "A trivia quiz."}, "stormy": {"m": "Wild and windy with rough weather.", "f": "A stormy night."}, "affluent": {"m": "Rich and comfortable.", "f": "An affluent neighbourhood."}, "destitute": {"m": "Having nothing at all, extremely poor.", "f": "A destitute traveller with no food."}, "avoid": {"m": "To stay away from.", "f": "Avoid the puddle."}, "reverence": {"m": "Deep respect.", "f": "A hush of reverence."}, "consult": {"m": "To ask for advice.", "f": "Consult a doctor."}, "apathy": {"m": "Not caring at all.", "f": "Apathy is a shrug in word form."}, "awe": {"m": "Wonder mixed with respect.", "f": "Awe at the huge waterfall."}, "robust": {"m": "Strong and healthy.", "f": "A robust oak."}, "original": {"m": "The first, or completely new.", "f": "An original idea."}, "imitation": {"m": "A copy.", "f": "An imitation of the real thing."}, "scribe": {"m": "Someone who writes things down.", "f": "A scribe copied books by hand."}, "duplicate": {"m": "An exact copy, or to copy.", "f": "Duplicate the key."}, "depart": {"m": "To leave.", "f": "The train departs at noon."}, "repel": {"m": "To push away.", "f": "Magnets repel each other."}, "conflict": {"m": "A serious disagreement or fight.", "f": "A conflict over the last biscuit."}, "divulge": {"m": "To reveal a secret.", "f": "Never divulge the password."}, "confide": {"m": "To tell someone a secret you trust them with.", "f": "Confide in a friend."}, "expand": {"m": "To get bigger.", "f": "Balloons expand when you blow them up."}, "suspend": {"m": "To hang, or to stop for a while.", "f": "Suspend play for rain."}, "contract": {"m": "To shrink, or a written agreement.", "f": "Metal contracts in the cold."}, "enlarge": {"m": "To make bigger.", "f": "Enlarge the photo."}, "meticulous": {"m": "Very careful about every detail.", "f": "A meticulous artist."}, "berate": {"m": "To tell someone off angrily.", "f": "Berate the referee."}, "cursory": {"m": "Quick and not thorough.", "f": "A cursory glance."}, "illusion": {"m": "Something that looks real but is not.", "f": "A magic trick is an illusion."}, "certainty": {"m": "Being completely sure.", "f": "A certainty: the sun will rise."}, "vacant": {"m": "Empty.", "f": "A vacant seat."}, "enrage": {"m": "To make very angry.", "f": "Enrage the bull."}, "mirage": {"m": "A trick of the light, like water in the desert that is not there.", "f": "A mirage in the desert."}, "vend": {"m": "To sell.", "f": "A vending machine vends snacks."}, "betray": {"m": "To let someone down by breaking their trust.", "f": "Betray a friend."}, "purchase": {"m": "To buy.", "f": "Purchase a ticket."}, "exhume": {"m": "To dig up a buried body.", "f": "A rather grim word: to dig up."}, "debate": {"m": "A formal argument, or to argue it out.", "f": "A class debate."}, "eliminate": {"m": "To remove or get rid of.", "f": "Eliminate the mistakes."}, "admit": {"m": "To let in, or to own up.", "f": "Admit the guests."}, "exclude": {"m": "To leave out.", "f": "Exclude no one."}, "sentiment": {"m": "A feeling or opinion.", "f": "A kind sentiment."}, "reality": {"m": "What is actually true.", "f": "The reality is, it is bedtime."}, "confine": {"m": "To keep inside limits.", "f": "Confine the cat to one room."}, "opinion": {"m": "What you think about something.", "f": "In my opinion, pizza wins."}, "stubborn": {"m": "Refusing to change your mind.", "f": "A stubborn mule."}, "amateur": {"m": "Someone who does it for fun, not as a job.", "f": "An amateur footballer."}, "brood": {"m": "To think about something sadly, or to sit on eggs.", "f": "A hen broods on her eggs."}, "proficient": {"m": "Skilled and able.", "f": "Proficient at swimming."}, "expert": {"m": "Someone with great skill or knowledge.", "f": "An expert on puffins."}, "unblemished": {"m": "Spotless, with no marks.", "f": "An unblemished record."}, "fickle": {"m": "Always changing your mind.", "f": "The fickle wind."}, "wound": {"m": "An injury (or the past tense of \"wind\").", "f": "A wound needs a plaster."}, "lagging": {"m": "Falling behind.", "f": "Lagging at the back of the race."}, "beck": {"m": "A small stream (in northern England), or a signal with your hand.", "f": "Always at your beck and call."}, "frontal": {"m": "At the front.", "f": "A frontal attack."}, "digesting": {"m": "Breaking down food in your tummy.", "f": "Digesting your lunch."}, "trailing": {"m": "Following behind.", "f": "Trailing behind the group."}, "surge": {"m": "A sudden strong rush.", "f": "A surge of water."}, "trickle": {"m": "A thin, slow flow.", "f": "A trickle from the tap."}, "soothe": {"m": "To calm and comfort.", "f": "Soothe a crying baby."}, "gush": {"m": "To pour out fast.", "f": "Water gushes from a burst pipe."}, "irk": {"m": "To annoy.", "f": "It irks me when you hum."}, "amiable": {"m": "Friendly and pleasant.", "f": "An amiable neighbour."}, "regale": {"m": "To entertain with stories.", "f": "Regale the table with tales."}, "amuse": {"m": "To make someone smile or laugh.", "f": "Amuse the baby."}, "fatigued": {"m": "Very tired.", "f": "Fatigued after a long hike."}, "invigorated": {"m": "Full of energy again.", "f": "Invigorated by a cold shower."}, "wholly": {"m": "Completely.", "f": "Wholly delicious."}, "exhausted": {"m": "Completely worn out.", "f": "Exhausted after the race."}, "pliant": {"m": "Bends easily.", "f": "A pliant twig."}, "malleable": {"m": "Easy to shape or bend.", "f": "Gold is malleable."}, "context": {"m": "The words or situation around something that explain it.", "f": "Take the quote in context."}, "detach": {"m": "To separate or unfasten.", "f": "Detach the trailer."}, "append": {"m": "To add on at the end.", "f": "Append a note."}, "believe": {"m": "To think something is true.", "f": "Believe in yourself."}, "affix": {"m": "To stick or attach.", "f": "Affix a stamp."}, "attest": {"m": "To swear that something is true.", "f": "Attest to the facts."}, "repulsive": {"m": "Disgusting.", "f": "A repulsive smell."}, "appealing": {"m": "Attractive and tempting.", "f": "An appealing smell of pancakes."}, "alluring": {"m": "Tempting and attractive.", "f": "An alluring display of sweets."}, "align": {"m": "To line up.", "f": "Align the edges."}, "displace": {"m": "To push out of place.", "f": "Displace the water."}, "segregate": {"m": "To keep apart.", "f": "Segregate the recycling."}, "arrange": {"m": "To put in order.", "f": "Arrange the books."}, "condemn": {"m": "To say strongly that something is wrong.", "f": "Condemn bullying."}, "vulgar": {"m": "Rude, rough and lacking manners.", "f": "A vulgar joke is not polite."}, "contentment": {"m": "Quiet happiness.", "f": "A cat purring in contentment."}, "destined": {"m": "Meant to happen, as if by fate.", "f": "Destined for greatness."}, "parity": {"m": "Being equal.", "f": "Parity between teams."}, "anguish": {"m": "Severe pain or sadness.", "f": "A cry of anguish."}, "humid": {"m": "Warm and damp.", "f": "A humid jungle."}, "muggy": {"m": "Warm, damp and sticky.", "f": "A muggy afternoon."}, "arid": {"m": "Very dry.", "f": "An arid desert."}, "akin": {"m": "Similar or related.", "f": "A donkey is akin to a horse."}, "comparable": {"m": "Similar enough to compare.", "f": "Comparable prices."}, "divergent": {"m": "Going in different directions.", "f": "Divergent paths."}, "raiment": {"m": "Clothing (an old-fashioned word).", "f": "Dressed in fine raiment."}, "hasten": {"m": "To hurry.", "f": "Hasten to the door."}, "dash": {"m": "To run quickly.", "f": "Dash for the bus."}, "dawdle": {"m": "To go slowly and waste time.", "f": "Don't dawdle!"}, "offend": {"m": "To upset or insult.", "f": "Offend with a rude joke."}, "aggrieve": {"m": "To make someone feel unfairly treated.", "f": "Aggrieved by the decision."}, "official": {"m": "Formally approved, or a person in charge.", "f": "An official letter."}, "offset": {"m": "To balance or cancel out.", "f": "Offset the cost."}, "temporary": {"m": "Lasting only a short time.", "f": "A temporary fix."}, "enduring": {"m": "Lasting a long time.", "f": "Enduring friendship."}, "interim": {"m": "In the meantime.", "f": "An interim solution."}, "tempting": {"m": "Making you want it.", "f": "A tempting cake."}, "brisk": {"m": "Quick and lively.", "f": "A brisk walk."}, "integrity": {"m": "Being honest and having strong principles.", "f": "A person of integrity."}, "respond": {"m": "To answer.", "f": "Respond to the email."}, "interrogate": {"m": "To question closely.", "f": "Interrogate the suspect."}, "deter": {"m": "To put someone off.", "f": "A fence deters thieves."}, "wither": {"m": "To dry up and shrivel.", "f": "Flowers wither without water."}, "lifeless": {"m": "Without life or energy.", "f": "A lifeless landscape."}, "thrive": {"m": "To grow and do well.", "f": "Plants thrive in sunshine."}, "solace": {"m": "Comfort when you are sad.", "f": "Find solace in a hug."}, "distress": {"m": "Great worry or pain.", "f": "A cry of distress."}, "consolation": {"m": "Comfort, or a small prize for losing.", "f": "A consolation prize."}, "unite": {"m": "To join together.", "f": "Unite the team."}, "evade": {"m": "To dodge or escape from.", "f": "Evade the tag."}, "capsize": {"m": "To tip over in the water.", "f": "The boat capsized."}, "encounter": {"m": "To meet, often by chance.", "f": "Encounter a bear."}, "elude": {"m": "To escape from or avoid.", "f": "The answer eludes me."}, "permeable": {"m": "Allowing liquid to pass through.", "f": "Permeable fabric."}, "derelict": {"m": "Abandoned and falling to pieces.", "f": "A derelict house."}, "novel": {"m": "A long story book, or something new.", "f": "A novel idea."}, "inhabited": {"m": "Lived in.", "f": "An inhabited island."}, "pasture": {"m": "A field where animals graze.", "f": "Cows in the pasture."}, "desolate": {"m": "Empty, lonely and bleak.", "f": "A desolate wasteland."}, "refute": {"m": "To prove something wrong.", "f": "Refute the claim."}, "verify": {"m": "To check that something is true.", "f": "Verify your answer."}, "gloat": {"m": "To show off about winning.", "f": "Do not gloat."}, "boisterous": {"m": "Noisy and full of energy.", "f": "A boisterous party."}, "plume": {"m": "A big feather, or a cloud of smoke.", "f": "A plume of smoke."}, "subdued": {"m": "Quiet and calm.", "f": "A subdued mood."}, "distinct": {"m": "Clearly different, or easy to notice.", "f": "A distinct smell."}, "ardent": {"m": "Very enthusiastic.", "f": "An ardent fan."}, "fortunate": {"m": "Lucky.", "f": "Fortunate to win."}, "fervent": {"m": "Full of strong feeling.", "f": "A fervent prayer."}, "apathetic": {"m": "Not interested or caring.", "f": "An apathetic shrug."}, "approach": {"m": "To come near.", "f": "Approach slowly."}, "appraise": {"m": "To judge the value of something.", "f": "Appraise a painting."}, "humiliate": {"m": "To make someone feel ashamed.", "f": "Never humiliate anyone."}, "promote": {"m": "To lift up or help along.", "f": "Promote a new product."}, "abscond": {"m": "To run away secretly.", "f": "A prisoner absconds."}, "shame": {"m": "A painful feeling of having done wrong.", "f": "Hang your head in shame."}, "deprive": {"m": "To take something away from someone.", "f": "Deprive of sleep."}, "bestow": {"m": "To give something as an honour.", "f": "Bestow a medal."}, "commit": {"m": "To promise yourself to something.", "f": "Commit to practice."}, "deny": {"m": "To say something is not true.", "f": "Deny the claim."}, "boundary": {"m": "The edge of something.", "f": "The boundary of the field."}, "outskirt": {"m": "The edge of a town.", "f": "The outskirts of town."}, "host": {"m": "A person who welcomes guests.", "f": "The host serves tea."}, "hub": {"m": "The centre of activity.", "f": "A bus hub."}, "restrain": {"m": "To hold back.", "f": "Restrain the dog."}, "compete": {"m": "To try to win against others.", "f": "Compete in the race."}, "contend": {"m": "To compete, or to argue.", "f": "Contend for the title."}, "occupy": {"m": "To fill or live in a place.", "f": "Occupy a seat."}, "component": {"m": "One part of a bigger thing.", "f": "A component of the engine."}, "volatile": {"m": "Likely to change suddenly.", "f": "A volatile temper."}, "erratic": {"m": "Unpredictable.", "f": "An erratic driver."}, "sacred": {"m": "Holy and treated with deep respect.", "f": "A sacred place."}, "rogue": {"m": "A cheeky troublemaker.", "f": "A lovable rogue."}, "calculate": {"m": "To work out with numbers.", "f": "Calculate the total."}, "contemplate": {"m": "To think about deeply.", "f": "Contemplate the sea."}, "torment": {"m": "To cause great suffering.", "f": "Tormented by nightmares."}, "operate": {"m": "To work, or to use a machine.", "f": "Operate the machine."}, "alleviate": {"m": "To make pain or a problem less severe.", "f": "Alleviate the pain."}, "gripe": {"m": "A small complaint.", "f": "My gripe is the noise."}, "grumble": {"m": "To complain quietly.", "f": "Grumble about homework."}, "compassion": {"m": "Kindness towards someone who is suffering.", "f": "A hug shows compassion."}, "hence": {"m": "For that reason.", "f": "It was raining, hence the umbrella."}, "impudent": {"m": "Cheeky and disrespectful.", "f": "An impudent grin."}, "remote": {"m": "Far away.", "f": "A remote island."}, "bliss": {"m": "Perfect happiness.", "f": "Pure bliss on a sunny day."}, "feral": {"m": "Wild, living without people.", "f": "A feral cat."}, "barbed": {"m": "Having sharp points, like barbed wire.", "f": "Barbed wire."}, "terminate": {"m": "To end.", "f": "Terminate the contract."}, "terse": {"m": "Short and abrupt.", "f": "A terse reply."}, "abort": {"m": "To stop before finishing.", "f": "Abort the mission."}, "punish": {"m": "To make someone suffer for doing wrong.", "f": "Punish the rule-breaker."}, "supply": {"m": "To provide what is needed.", "f": "Supply the team with water."}, "episode": {"m": "One part of a story or series, or a single event.", "f": "An episode of your favourite show."}, "inactivity": {"m": "Doing nothing, not moving.", "f": "Days of inactivity on the sofa."}, "include": {"m": "To have as part of the whole.", "f": "Include everyone."}, "truce": {"m": "An agreement to stop fighting for a while.", "f": "Both sides agreed a truce."}, "chaotic": {"m": "Totally disorganised and messy.", "f": "A chaotic classroom."}, "reprieve": {"m": "A pause or escape from something bad.", "f": "A reprieve from homework."}, "persistence": {"m": "Keeping going without giving up.", "f": "Persistence wins the race."}, "suppose": {"m": "To guess or assume something is true.", "f": "I suppose it might rain."}, "compute": {"m": "To work out an answer, usually with numbers.", "f": "A computer computes sums."}, "debrief": {"m": "To talk through what happened afterwards.", "f": "Debrief after the mission."}, "provide": {"m": "To give what is needed.", "f": "Provide snacks for the trip."}, "incident": {"m": "Something that happens, often a small event.", "f": "An incident in the playground."}, "competent": {"m": "Able to do something well enough.", "f": "A competent swimmer."}, "origin": {"m": "Where something starts.", "f": "The origin of the river."}, "entity": {"m": "A single complete thing that exists on its own.", "f": "A company is a legal entity."}, "segment": {"m": "One part of a whole.", "f": "A segment of an orange."}, "refrain": {"m": "To hold yourself back from doing something.", "f": "Refrain from shouting."}, "lucid": {"m": "Clear and easy to understand.", "f": "A lucid explanation."}, "dissuade": {"m": "To talk someone out of something.", "f": "Dissuade him from jumping."}, "mention": {"m": "To say something briefly.", "f": "Mention it to your teacher."}, "develop": {"m": "To grow or make something grow.", "f": "Develop a skill."}, "repress": {"m": "To hold back or keep down.", "f": "Repress a giggle."}, "prompt": {"m": "To nudge someone into action, or quick and on time.", "f": "A prompt reply."}, "grant": {"m": "To give or allow.", "f": "Grant a wish."}};
const put = (el, ...k) => el.replaceChildren(...k.flat(Infinity).filter(x => x != null && x !== false));
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
    stats:{ answered:0, right:0, spell:0, fixed:0, best:0, rounds:0, perfect:0 } };
}
const isBlank = o => !o || ((!o.stats || !o.stats.answered) && !(o.history && o.history.length));
/* restoring = keep the old progress (a backup code, a save point, the archive); otherwise a pre-race save starts the race from scratch */
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
function setBaseAll(o){ setBase(o.upd || 0); try { localStorage.setItem(BASESKEY, JSON.stringify({ points:o.points || 0, custard:o.custard || 0, stats:o.stats || {}, race:{ mf:(o.race || {}).mf || 0, mm:(o.race || {}).mm || 0 }, tstat:o.tstat || {} })); } catch (e) {} }
const roundKey = x => x.id || (x.d + '|' + x.a + '|' + x.r + '|' + x.n);
/* two devices played while apart: add up what each one gained since they last agreed, so no answers are lost */
function mergeStates(a, b, base){
  if (a.demo !== b.demo) return JSON.parse(JSON.stringify(a.demo ? b : a));
  const o = JSON.parse(JSON.stringify(a)), r = b;
  const add = (av, bv, bs) => Math.max(0, base ? (bv || 0) + (av || 0) - (bs || 0) : Math.max(av || 0, bv || 0));
  for (const k in (r.prog || {})){ const x = r.prog[k], y = o.prog[k]; if (!y || (x.seen || 0) > (y.seen || 0)) o.prog[k] = x; }
  o.points = add(a.points, r.points, base && base.points); o.custard = add(a.custard, r.custard, base && base.custard);
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
function syncStep(first){ SYNC.chain = (SYNC.chain || Promise.resolve()).then(() => syncOnce(first)).catch(() => {}); return SYNC.chain; }
async function fetchRemote(){ const snap = await progRef().get(); let remote = null; if (snap.exists){ try { remote = JSON.parse(snap.data().s); } catch (e) {} } return remote; }
async function syncOnce(first){
  let remote;
  try { remote = await fetchRemote(); } catch (e) { if (first) setSync('local'); else setSync('error'); return; }
  SYNC.ready = true; SYNC.remoteReal = !!remote && !isBlank(remote);
  await decide(remote, first);
}
async function decide(remote, first){
  if (!remote) return isBlank(S) ? setSync('cloud') : write(remote);
  /* demo progress never beats real progress */
  if (remote.demo && !S.demo && !isBlank(S)){ keepCopy(S, 'Real progress (rescued)'); S.upd = Date.now(); saveLocal(); return write(remote); }
  const ru = remote.upd || 0, lu = S.upd || 0, base = getBase();
  if (ru === lu){ setBaseAll(S); return setSync('cloud'); }
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
    try { await progRef().set({ s:JSON.stringify(snap), upd:snap.upd || 0, fish:snap.points, words:masteredCount(), played:snap.last || '' }); setBaseAll(snap); setSync('cloud'); return; }
    catch (e){ if (!(e && e.code === 'unavailable') || t === 2){ setSync('error'); return; } await new Promise(r => setTimeout(r, 1500 + Math.random() * 1500)); }
  }
}
const pull = first => syncStep(first);
function pushSoon(){ if (!SYNC.ready) return; clearTimeout(SYNC.timer); SYNC.timer = setTimeout(() => syncStep(false), 1500); }
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
const pk = x => x.card ? 'card:' + (x.card.id || norm(x.w)) : norm(x.w);
function rec(x){ const k = pk(x); return S.prog[k] || (S.prog[k] = { streak:0, seen:0, right:0, miss:0, fixed:0, last:'', ty:[], dy:[] }); }
const peek = x => S.prog[pk(x)];
/* cards also need a hint-free, fully right similar & opposite answer in the current run */
const meetsMastery = (r, card, nTypes) => r.streak >= 3 && (r.ty || []).length >= Math.min(2, nTypes || 2) && (r.dy || []).length >= 2 && (!card || (r.ty || []).includes('sim'));
const isMasteredRec = r => !!r && !!r.m && !r.wob;
const isMastered = x => isMasteredRec(peek(x));
const masteredCount = () => allItems().filter(isMastered).length;
/* almost mastered: on a run of 2+, or mastered-then-slipped once */
const isAlmost = r => !!r && r.seen > 0 && !isMasteredRec(r) && (r.wob || r.streak >= 2);
const almostCount = () => allItems().filter(x => isAlmost(peek(x))).length;
function status(x){
  const r = peek(x);
  if (!r || !r.seen) return 'new';
  if (isMasteredRec(r)) return 'mastered';
  if (isAlmost(r)) return 'lock';
  return 'learning';
}
const trickyWords = () => allItems().filter(x => { const r = peek(x); return r && r.miss > 0 && !isMasteredRec(r) && (r.wob || r.streak < 2); })
  .sort((a,b) => peek(b).miss - peek(a).miss);
function counts(){ const c = { mastered:0, lock:0, learning:0, new:0 }; for (const x of allItems()) c[status(x)]++; return c; }
const lockReadyToday = () => allItems().filter(x => { const r = peek(x); return r && !isMasteredRec(r) && (r.wob || (r.streak >= 3 && !(r.dy || []).includes(today()))); }).length;
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
  const n = Math.max(1, allItems().length); let prev = -1;
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
  const T = allItems().length, aM = masteredCount(), A = S.points, end = T - aM <= END_ZONE;
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
const allDone = () => { const T = allItems().length; return T > 0 && masteredCount() >= T; };
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
  { id:'cust5',  n:'Custard Collector', d:'Win 5 pots of custard.',             ic:'custard', t:c => (c.S.custard || 0) >= 5 },
  { id:'leader', n:'Crowned',         d:'Beat the Mirror and become Leader.',         ic:'crown',  t:c => !!c.S.leader }
];
function checkBadges(){
  const ctx = { S, m:masteredCount(), days:dayStreak(), total:allItems().length }, got = [];
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
  let pool = allItems();
  if (kind === 'cards') pool = CARD_ITEMS;
  else if (kind === 'tricky'){ pool = trickyWords(); if (!pool.length){ toast('Nothing tricky yet!'); return home(say('empty')); }
    if (pool.length < 5) pool = pool.concat(allItems().filter(x => { const r = peek(x); return r && r.seen && !isMasteredRec(r) && !pool.includes(x); }).sort((a, b) => (peek(b).miss / peek(b).seen) - (peek(a).miss / peek(a).seen)).slice(0, 5 - pool.length)); }   // short of tricky words: top up with the next-shakiest
  if (!pool.length){ toast('The word bank is empty. Add words in Grown-ups.'); return; }
  const B = S.book && S.book.next || [], n = Math.min(10, pool.length);
  const first = kind === 'tricky' ? [] : pool.filter(x => B.includes(pk(x))).slice(0, 4);
  if (first.length && S.book) S.book.next = B.filter(k => !first.some(x => pk(x) === k));
  const due0 = shuffle(pool.filter(x => !first.includes(x) && (() => { const r = peek(x), d = dueIn(r); return r && r.seen && d != null && d <= 0; })())).sort((a, b) => dueIn(peek(a)) - dueIn(peek(b))).slice(0, 3);   // up to 3 due reviews, most overdue first
  const due = due0;
  const school = (S.school && S.school.list || []).map(k => pool.find(x => norm(x.w) === k)).filter(x => x && !first.includes(x) && !isMastered(x)); first.push(...shuffle(school).slice(0, Math.max(0, Math.min(3, n - first.length))));   // this week's school words: up to 3 each match
  first.push(...due.filter(x => !first.includes(x)).slice(0, Math.max(0, n - first.length)));
  const rest = pickWords(n - first.length, pool.filter(x => !first.includes(x)));
  R = newRound(shuffle(first).concat(rest), kind);
  R.rank0 = rankInfo(masteredCount()).i; R.lastD = S.points - S.race.mf; R.badges0 = Object.keys(S.badges || {}).length;
  SND.prime(); SND.fx('whistle'); SND.loop(true);
  if (Math.random() < .5) setTimeout(() => VOICE.play('c04'), 600);
  question();
}
const TYPE_LABEL = { w2m:'What does it mean?', m2w:'Name the word', spell:'Spell it', scram:'Unscramble', gap:'Fill the gap', sim:'Similar & opposite', hear:'Listen and spell', pre:'Pick the right start' };
/* ---------- word-building: prefixes ("not" words and friends) ---------- */
const PREFIX_WORDS = { illegible:'il', illogical:'il', immortal:'im', impolite:'im', impure:'im', impatient:'im', improper:'im', inadequate:'in', incorrect:'in', indirect:'in', informal:'in', inoffensive:'in', inaccurate:'in', incapable:'in', invalid:'in', irreparable:'ir', irrational:'ir', irresistible:'ir', irresponsible:'ir',
  disadvantage:'dis', disappear:'dis', disappointed:'dis', disbelief:'dis', disconnect:'dis', dishonest:'dis', mishear:'mis', misinform:'mis', misjudge:'mis', mispronounced:'mis',
  reappear:'re', redesign:'re', reemerge:'re', rephrase:'re', reapply:'re', rearrange:'re', redecorate:'re', reheat:'re', antibiotic:'anti', anticlimax:'anti', antiseptic:'anti', antivirus:'anti', antifreeze:'anti', antisocial:'anti', autograph:'auto', autopilot:'auto', autobiography:'auto', automobile:'auto' };
const prefixOf = x => PREFIX_WORDS[norm(x.w)] || null;
const PREFIX_TIP = { il:'il- goes before l: il + legible = illegible.', im:'im- goes before m, p or b: im + polite = impolite.', in:'in- is the usual “not” start: in + correct = incorrect.', ir:'ir- goes before r: ir + responsible = irresponsible.',
  un:'un- means not: un + canny = uncanny.', dis:'dis- means not, or the opposite: dis + appear = disappear.', mis:'mis- means wrongly: mis + hear = mishear.', re:'re- means again: re + heat = reheat.', anti:'anti- means against: anti + freeze = antifreeze.', auto:'auto- means self: auto + graph = autograph.' };
const PREFIX_RULE = 'The “not” starts: il- before l (illegal), ir- before r (irregular), im- before m, p or b (impossible), and in- for most others (incorrect). un- and dis- mean not too. re- means again, mis- means wrongly, anti- means against, auto- means self.';
const canHear = () => 'speechSynthesis' in window && !!(S && S.settings && S.settings.sound);
const hasMeaning = x => !!(x.card || (x.m && x.m.trim()));
function typesFor(x){
  if (!hasMeaning(x)) return canHear() ? ['hear', 'scram'] : ['scram'];   // a school word with no meaning yet: spelling only
  const t = x.card ? ['sim', 'w2m', 'scram'] : (S.words.length >= 4 ? ['w2m', 'm2w', 'spell', 'scram'] : ['spell', 'scram']);
  if (gapFor(x) && (x.card || S.words.length >= 4)) t.push('gap');
  if (!x.card && canHear()) t.push('hear');
  if (prefixOf(x)) t.push('pre');
  return t;
}
function pickType(item){
  const x = item.w, r = peek(x);
  if (FORCE && typesFor(x).includes(FORCE)) return FORCE;
  if (item.retry && item.lastType) return item.lastType;
  if (r && x.card && r.streak >= 2 && !(r.ty || []).includes('sim')) return 'sim';   // steer cards towards the similar & opposite test
  if (!hasMeaning(x)){ const ts = typesFor(x), notYet = ts.filter(t => !((r && r.ty) || []).includes(t)); return notYet.length ? notYet[0] : ts[rnd(ts.length)]; }
  if (!r || !r.seen) return x.card ? (Math.random() < .65 ? 'sim' : 'w2m') : (S.words.length >= 4 ? (Math.random() < .5 ? 'w2m' : 'm2w') : 'spell');
  const base = { sim:4, w2m:2, m2w:2, spell:2, scram:2, gap:2.5, hear:1.6, pre:3 };
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
  } else if (type === 'pre'){
    const p = prefixOf(x), stem = x.w.slice(p.length), fam = ['il', 'im', 'in', 'ir', 'un'].includes(p) ? ['il', 'im', 'in', 'ir', 'un'] : ['re', 'dis', 'mis', 'anti', 'auto', 'un'];
    const REAL = new Set(['inpatient', 'disappear', 'reappear', 'rehear', 'reappointed', 'disarrange', 'unfreeze', 'refreeze', 'dissocial', 'reinform', 'discover', 'recover', 'unappear', 'disconnect', 'reconnect', 'misplace', 'replace', 'disapply', 'reform', 'inform', 'unarrange']);
    q.options = shuffle([{ t:x.w, ok:true }, ...shuffle(fam.filter(f => f !== p && !REAL.has(f + stem))).slice(0, 3).map(f => ({ t:f + stem, ok:false }))]);
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
  S.stats.answered += 1;
  S.race.ra = (S.race.ra == null ? .6 : S.race.ra) * .9 + (ok ? .1 : 0);
  S.race.ta = (S.race.ta == null ? S.race.ra : S.race.ta) * .97 + (ok ? .03 : 0);   // slow-moving accuracy: an earned lead doesn't vanish after one wobbly round
  if (ok){
    S.stats.right++; if (spellish) S.stats.spell++;
    R.streak++; R.best = Math.max(R.best, R.streak); S.stats.best = Math.max(S.stats.best, R.streak);
    if (R.streak % 5 === 0){ S.custard = (S.custard || 0) + 1; R.custard = (R.custard || 0) + 1; custard = true; }
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
      else line = (R.streak === 3 || R.streak === 5 || R.streak === 10) ? say('streak', { n:R.streak }) : say(item.retry ? 'fixed' : 'right');
    }
    R.results[R.idx] = 'ok';
  } else {
    r.miss++; r.lm = today(); r.streak = Math.max(0, r.streak - 2); R.streak = 0; R.missed.push(q.w.w);
    if (r.m && !r.wob){ r.wob = true; lock = 'wobble'; }   // one slip on a mastered word: needs one right answer to re-secure
    else { if (r.m){ r.ty = []; r.dy = []; } r.m = false; r.wob = false; }   // a second slip on a mastered word: earn it again
    line = say('wrong'); R.results[R.idx] = 'bad';
    if (!item.retry){ queueRetry(item); note = 'We will come back to this one in a moment.'; }
    else if (item.tries < 2){ queueRetry(item); note = 'One more go at this later.'; }
    else note = 'It stays on the tricky list for now.';
  }
  if (fishDone != null) pts = fishDone; else { R.points += pts; S.points += pts; }
  schedule(r, ok, hinted && ok);
  { if (!S.tstatFrom) S.tstatFrom = today(); S.tstat = S.tstat || {}; const ts = S.tstat[q.type] || (S.tstat[q.type] = [0, 0]); ts[1]++; if (ok) ts[0]++; }
  raceFix();
  { const nb = checkBadges(); if (nb.length) R.newBadges = (R.newBadges || []).concat(nb); }   // earned the moment it happens, celebrated at full time
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
  let db = null;
  try { db = await fbInit(); } catch (e) { db = null; }
  if (!db){ setSync('local'); return; }
  SYNC.db = db; SYNC.uid = fam;
  await pull(true);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && SYNC.ready) pull(false); });
  setInterval(() => { if (SYNC.ready && document.visibilityState === 'visible' && !(R && R.queue && R.queue.length)) pull(false); }, 60000);
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
  const T = allItems().length, aM = masteredCount(), A = S.points, M = S.race.mf, mm = S.race.mm, d = A - M;
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
  const pots = h('span', { class:'pots', title:'Pots of custard' }, '🍮 ' + (S.custard || 0));
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
  const refresh = () => { save(); put(boardBox, led(true, (R.idx + 1) + '/' + R.queue.length)); drawPips(); };
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
  function mirrorTurn(guessFor){
    if (item.retry) return { sat:true };
    const t = mirrorTry(mirrorGain(q.type)); R.mfish += t.fish; mirrorMastery(t.ok);
    return { ok:t.ok, fish:t.fish, guess:guessFor(t.ok) };
  }
  function mirrorLine(mir){ if (mir.sat) return msay('sitout'); if (Math.random() < .25) return msay(raceLine()); return msay(mir.ok ? 'right' : 'wrong'); }
  function noteFor(lock, custard){
    const n = [];
    if (custard) n.push(h('div', { class:'note custard' }, h('span', { class:'wobble', style:'font-size:1.3rem', text:'🍮' }), h('span', { text:'Five in a row! A pot of custard for the team.' })));
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
        h('div', {}, h('div', { class:'big', text: o.ok ? 'GOAL!' : 'OFF THE POST' }), h('div', { class:'small muted', text: o.ok ? 'Fresh fish!' : 'No fish this time. Eventually still counts.' })),
        h('div', { class:'fish', text:'+' + (o.fish || 0) + ' 🐟' })),
      drama ? h('div', { class:'news', role:'status' }, h('b', { text:drama.title }), h('span', { text:drama.text })) : null,
      o.answer || null,
      o.book ? h('div', { class:'note custard' }, h('span', { 'aria-hidden':'true', text:'📓' }), h('b', { text:'Next: write it in your vocabulary book.' })) : null,
      o.line ? h('p', { class:'line', text:o.line }) : null,
      noteFor(o.lock, o.custard),
      mir ? h('div', { class:'mline' }, cimg(mir.sat || !mir.ok ? MIMG.sad : MIMG.smug, '', 34, 'The Mirror'),
        h('div', { style:'min-width:0' }, mir.sat ? h('b', { text:'Mirror sits this one out. ' }) : h('span', {}, h('b', { text:'Mirror: ' }), '“' + mir.guess + '” ' + (mir.ok ? '✓ +' + mir.fish + ' 🐟 ' : '✗ ')),
          h('span', { class:'q', text: mv ? VO[mv] : drama && drama.mline ? drama.mline : o.custard && !mir.sat ? pickOne(MCUSTARD) : mirrorLine(mir) }))) : null,
      nb], false);
    setTimeout(() => nb.focus({ preventScroll:true }), 60);
    R.keys = e => { if (e.key === 'Enter' && document.activeElement !== nb) nb.click(); };
  }
  /* "I'm stuck": counts as a miss, shows the answer, then on to the book */
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
    function optRow(wd, i, onPick){
      const x = info(wd), mean = h('small', { text:x.m || 'No meaning on file.', hidden:true });
      const b = h('button', { class:'ans', type:'button', 'data-t':wd, onclick:() => onPick(wd, b) }, h('span', { class:'l', text:'ABCD'[i] }), h('span', { class:'t' }, h('span', { text:wd }), mean), h('span', { class:'mk' }));
      if (!hintsOn) return { row:b, b };
      const ib = h('button', { class:'peek', type:'button', 'aria-pressed':'false', 'aria-label':'Peek: what does ' + wd + ' mean?', title:'What does ' + wd + ' mean?', text:'i',
        onclick:() => {
          sayWord(wd);   // a word he doesn't know: say it aloud every time he taps
          if (!mean.hidden) return;
          mean.hidden = false; ib.setAttribute('aria-pressed', 'true'); ib.setAttribute('aria-label', 'Hear ' + wd + ' again'); put(ib, icon('sound'));
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
      const rows = P.list.map((wd, i) => optRow(wd, i, (w, b) => pick(n, P, w, b, rows)));
      put(body, track(n),
        h('div', { class:'banner big ' + (opp ? 's2' : 's1'), role:'status' }, h('span', { class:'em', 'aria-hidden':'true', text: opp ? '↔️' : '🟰' }),
          h('div', { class:'bt' }, h('b', { text: opp ? 'OPPOSITE' : 'SIMILAR' }),
            h('span', { text: (mode === 'reverse' ? 'Which card word means ' : 'Which word means ') + (opp ? 'the OPPOSITE of…' : 'the SAME as…') }))),
        word(P.show), h('div', { class:'answers ' + (opp ? 's2' : 's1') }, rows.map(r => r.row)),
        hintsOn ? h('p', { class:'small muted', text: n === 2 ? 'Only 3 choices this time. Tap i to hear and peek.' : 'Tap i to hear a word and see what it means. It doesn’t pick it.' }) : null);
      R.keys = e => { const i = '1234'.indexOf(e.key); if (i > -1 && rows[i] && !rows[i].b.disabled) rows[i].b.click(); };
    }
    function pick(n, P, wd, btn, rows){
      if (rows[0].b.disabled) return;
      const right = P.right, ok = wd === right;
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
    setStrip(q.type === 'gap' ? 'gap' : q.type === 'scram' ? 'scram' : '', TYPE_LABEL[q.type].toUpperCase());
    const lead = item.retry ? say('retry') : R.idx === 0 ? R.hello : pickOne(['Your question.', 'Here it comes.', 'The Mirror is watching.', 'Take your time.', 'Concentrate. Floppy, warm, like custard.']);
    const top = q.type === 'w2m' ? [h('p', { class:'muted', text:'What does this word mean?' }), wordWithSpeak(q.w.w)]
      : q.type === 'm2w' ? [h('p', { class:'muted', text:'Which word means…' }), h('p', { class:'meaning', text:'“' + meanOf() + '”' })]
      : q.type === 'gap' ? [h('p', { class:'muted', text:'Which word fills the gap?' }), h('p', { class:'sentence' }, q.gap.before, h('span', { class:'blank', 'aria-label':'gap' }), q.gap.after)]
      : q.type === 'scram' && !meanOf() ? [h('p', { class:'muted', text:'Unscramble the word you hear.' }), h('button', { class:'btn alt hearbtn', type:'button', onclick:() => sayWord(q.w.w) }, icon('sound'), 'Hear the word')]
      : q.type === 'scram' ? [h('p', { class:'muted', text:'Unscramble the word that means…' }), h('p', { class:'meaning', text:'“' + meanOf() + '”' })]
      : q.type === 'hear' ? [h('p', { class:'muted', text:'Listen, then spell the word you hear.' }), h('button', { class:'btn alt hearbtn', type:'button', onclick:() => sayWord(q.w.w) }, icon('sound'), 'Hear it again')]
      : q.type === 'pre' ? [h('p', { class:'muted', text:'Pick the right start. Which word means…' }), h('p', { class:'meaning', text:'“' + meanOf() + '”' })]
      : [h('p', { class:'muted', text:'Spell the word that means…' }), h('p', { class:'meaning', text:'“' + meanOf() + '”' })];
    const kids = q.type === 'spell' || q.type === 'hear' ? spellQ() : q.type === 'scram' ? scramQ() : choiceQ();
    if ((q.type === 'hear' || (q.type === 'scram' && !meanOf())) && S.settings.sound) sayWord(q.w.w);   // said straight away (inside the tap, so iPhone allows it)
    put(body, cue(lead), top, kids);
    if (q.type === 'pre' && !S.seenPre){ S.seenPre = true; save(); setTimeout(prefixLesson, 120); }
  }
  const quit = h('button', { class:'quit', type:'button', 'aria-label':'End this match and go home', onclick:() => quitMatch() }, icon('x'), h('span', { text:'End' }));
  put(boardBox, led(true, (R.idx + 1) + '/' + R.queue.length));
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
/* leaving early still counts today's answers towards the streak and goal, and celebrates any badge */
function quitMatch(){
  SND.loop(false); closeSheet();
  const n = (R.results || []).reduce((a, v, i) => a + (v && R.queue[i] && !R.queue[i].retry ? 1 : 0), 0), nb = R.newBadges || [];
  if (n){
    S.rounds.push({ id:Date.now().toString(36) + rnd(1e6), d:today(), r:R.firstTry, n, a:R.points, m:R.mfish, part:true }); if (S.rounds.length > 200) S.rounds.shift();
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
  if (R.firstTry === R.total && R.total >= 5){ bonus = 3; R.points += bonus; S.points += bonus; S.stats.perfect++; }
  if (R.firstTry >= R.total && R.mfish >= R.points){ const cut = R.mfish - Math.max(0, R.points - 1); R.mfish -= cut; S.race.mf = Math.max(0, S.race.mf - cut); }   // all right first time: the round is always his
  else if (R.firstTry >= R.total){ const over = (S.points - S.race.mf) - Math.round(leadTarget()), room = R.points - 1 - R.mfish; if (over > 0 && room > 0){ const t = Math.min(over, room); R.mfish += t; S.race.mf += t; } }   // perfect round, already well clear: he still wins it, but the lead grows slowly
  raceFix();
  const stars = acc >= 1 ? 3 : acc >= .8 ? 2 : acc >= .5 ? 1 : 0;
  S.stats.rounds++;
  S.rounds.push({ id:Date.now().toString(36) + rnd(1e6), d:today(), r:R.firstTry, n:R.total, a:R.points, m:R.mfish }); if (S.rounds.length > 200) S.rounds.shift();
  S.last = today(); snapshot();
  const crowned = !S.leader && allDone() && S.points > S.race.mf;
  if (crowned) S.leader = { d:today(), a:S.points, m:S.race.mf };
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
  screen = 'summary';
  const r = x.round, mirWon = r.mfish > r.points, tie = r.mfish === r.points;
  const key = x.stars === 3 ? 'end3' : x.stars === 2 ? 'end2' : x.stars === 1 ? 'end1' : 'end0';
  SND.tune(mirWon ? 'lose' : 'win');
  const rankUp = r.rank0 != null && rankInfo(masteredCount()).i > r.rank0;
  { const v = rankUp ? null : mirWon || tie ? VOICE.pick('c14') : VOICE.pick('c13'); const v2 = mirWon && Math.random() < .5 ? VOICE.pick('m07') : null;
    if (v) setTimeout(() => VOICE.play(v), 1500); if (v2) setTimeout(() => VOICE.play(v2), 1700); }
  const missed = [...new Set(r.missed)];
  const extra = [x.badges.length ? '🏅 New badge: ' + x.badges.map(b => b.n).join(', ') : null, x.prizes.length ? '🎁 Prize unlocked: ' + x.prizes.map(p => p.text || 'a surprise').join(', ') + '. Ask a grown-up!' : null].filter(Boolean);
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
        S.points += 1; R.points += 1; save();
        SND.fx('goal'); if (!VOICE.play('c19')) {}
        put(fb, h('div', { class:'note custard' }, h('span', { 'aria-hidden':'true', text:'✅' }), h('span', { text:'It’s in the book. +1 bonus fish!' })));
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
      h('div', { class:'st cus' }, h('div', { class:'k', text:'BONUS FISH' }), h('div', { class:'v', text:'+' + right + ' 🐟' }))),
      h('div', { class:'mline' }, cimg(all ? MIMG.sad : MIMG.smug, '', 34, 'The Mirror'), h('span', { class:'q', text: all ? (VOICE.can('m10') ? VO.m10 : 'Writing things down? That’s cheating! …Is it? It looks like it works.') : 'Ha! Not in the book! I keep all my words in my head. Next to my reflection.' })),
      h('div', { class:'grow' }), b);
    setTimeout(() => b.focus({ preventScroll:true }), 60);
  }
  const endB = h('button', { class:'quit', type:'button', 'aria-label':'End the book check and go on', onclick:() => { SND.fx('tap'); if (R) R.toHome = true; done(); } }, icon('x'), h('span', { text:'End' }));
  mount([h('div', { class:'qbar' }, endB, h('span', { class:'qn', text:'FULL TIME · BOOK CHECK' }), h('div', { class:'tools' }, soundBtns())), led(true, 'BOOK'), cue2, h('div', { class:'pitch' }, strip2, body2)], null);
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
  document.body.append(ov);
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
function celebrate(o, next){
  closeSheet();
  const go = h('button', { class:'btn kick', type:'button', onclick:() => { SND.fx('tap'); ov.remove(); if (R) R.keys = prev; next && next(); } }, o.button || 'Brilliant!');
  const ov = h('div', { class:'celeb', role:'dialog', 'aria-modal':'true', 'aria-labelledby':'celebh' }, confettiBox(o.confetti || 50),
    h('div', { class:'celin' },
      h('div', { class:'eyebrow', style:'color:#FFD23F', text:o.kicker || '' }),
      o.art || null,
      h('h2', { id:'celebh', text:o.title }),
      o.big ? wordWithSpeak(o.big, 'celword') : null,
      o.sub ? h('p', { class:'celsub', text:o.sub }) : null,
      o.line ? h('div', { class:'mline', style:'background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2);color:#fff' }, cimg(o.who === 'm' ? MIMG.smug : IMG.right, '', 34, ''), h('span', { class:'q', text:o.line })) : null,
      go, h('button', { class:'endlink', type:'button', onclick:() => { ov.remove(); if (R) R.keys = prev; if (R && R.queue && R.queue.length) quitMatch(); else home(); } }, '✕ End')));
  document.body.append(ov);
  const prev = R ? R.keys : null; if (R) R.keys = null;
  SND.fx(o.sound || 'cheer'); if (o.tune) SND.tune(o.tune);
  if (o.voice) setTimeout(() => VOICE.play(o.voice), 900);
  if (o.voice2) setTimeout(() => VOICE.play(o.voice2), 1000);
  setTimeout(() => go.focus({ preventScroll:true }), 80);
}
function celebrateAll(list, done){ const next = () => { const c = list.shift(); if (!c) return done(); celebrate(c, next); }; next(); }
const bigEmoji = e => h('div', { class:'celart', 'aria-hidden':'true', text:e });

/* "How are we doing?" */
function progressReport(){
  const T = allItems().length, aM = masteredCount(), A = S.points, M = S.race.mf, d = A - M, ri = rankInfo(aM), st = dayStreak();
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
function matchCelebrations(round, badges){
  const list = [], m = masteredCount(), ri = rankInfo(m);
  if (round.rank0 != null && ri.i > round.rank0) list.push({ kicker:'NEW TROPHY', art:h('div', { class:'celtro' }, trophyEl(ri.i, true)), title:TROPHY_NAMES[ri.i] + '!', sub:'You are now ' + ri.cur.name + '. ' + m + ' words mastered.', voice:VOICE.pick('c15'), tune:'win', line:VOICE.can('c15') ? VO.c15 : 'A new trophy. I would like that noted.' });
  for (const b of badges){
    const pw = b.id === 'd7', v = pw ? VOICE.pick('c31') : VOICE.pick('c27');
    list.push({ kicker:pw ? 'PERFECT WEEK' : 'NEW BADGE', art:h('div', { class:'celbadge' }, icon(b.ic)), title:b.n, sub:b.d, voice:v, line:v ? VO[v] : 'A badge. The puffin community does not hand these out lightly.' });
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
    h('div', { class:'cpots', title:'Custard pots' }, h('span', { 'aria-hidden':'true', text:'🍮' }), h('b', { text:String(S.custard || 0) })));
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
const TYPE_NAMES = { w2m:'What does it mean?', m2w:'Name the word', spell:'Spelling', scram:'Unscramble', gap:'Fill the gap', sim:'Similar & opposite', hear:'Listen and spell', pre:'Pick the right start' };
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
    h('div', { class:'stat4' }, cell('MASTERED', c.mastered, 'of ' + allItems().length), cell('LEARNING', c.learning + c.lock, c.new + ' not started'), cell('DUE TODAY', dueToday, dueWeek + ' more this week'),
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
  const all = allItems().map(x => ({ x, r:peek(x) }));
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
      row('un- / dis-', 'unkind, dishonest', 'also mean not'), row('re-', 'reheat', 'again'), row('mis-', 'mishear', 'wrongly'), row('anti-', 'antifreeze', 'against'), row('auto-', 'autograph', 'self')),
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
    h('p', { class:'small muted', text:'Paste or type the list. Meanings are optional: words with a meaning get every question type; words without one get “Listen and spell” and unscramble. Up to 3 of these words open every match until they are mastered. Last week’s words stay in his word bank.' }),
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
        h('button', { class:'btn small', type:'button', style:'flex:1', onclick:() => { stopNarr(); SND.fx('tap'); quiz(0); } }, words.length >= 2 ? 'Questions →' : 'Done')));
    if (S.settings.sound) narrateLines([st.t].concat(st.p), 500);
  }
  const qs = shuffle(words.slice()).slice(0, 2), sentences = (() => { const raw = st.p.join(' ').split(/(?<=[.!?][”"]?)\s+/), out = []; let cur = ''; for (const r of raw){ cur = cur ? cur + ' ' + r : r; const q = (cur.match(/["“”]/g) || []).length; if (q % 2 === 0){ out.push(cur); cur = ''; } } if (cur) out.push(cur); return out; })();
  let got = 0;
  function quiz(i){
    if (words.length < 2 || i >= qs.length) return finish();
    const w = qs[i], x = bankItem(w), right = meanOfX(x), sent = sentences.find(s => new RegExp('\\b' + esc(w) + '\\b', 'i').test(s)) || '';
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
    stopNarr();
    put(body, h('div', { class:'storyhead' }, h('div', { class:'eyebrow', text:'📖 THE END' }), h('h2', { text:st.t })),
      sayBlock('com', words.length >= 2 ? (got === 2 ? 'Both right. A story-reading puffin. The community is impressed.' : got === 1 ? 'One out of two. Eventually still counts.' : 'Tricky ones. We will meet those words again.') : 'A good story. Mostly true. Partly custard.', IMG.right),
      words.length >= 2 ? h('p', { class:'line', text:'+' + got + ' 🐟 fresh fish from the story' }) : null,
      h('div', { class:'grow' }), h('button', { class:'btn kick', type:'button', onclick:() => { SND.fx('tap'); done(); } }, 'Back to the race'));
  }
  mount([h('div', { class:'qbar' }, endB, h('span', { class:'qn', text:'STORY TIME' }), h('div', { class:'tools' }, soundBtns())), h('div', { class:'pitch' }, h('div', { class:'pbody' }, body))], null);
  read();
}

/* ---------- Cuffin's word stories: short, silly, read aloud, each using a few of Aaron's words ---------- */
const STORIES = [
  { t:'The Custard Map', w:['inaccurate','ponder','ramble','dismal','acquire'], p:[
    'Giles found an old map that promised a lake of custard. Cuffin studied it for a long time. "This map is inaccurate," he said. "It shows the sea as a picnic blanket."',
    'They set off anyway. The walk turned into a long ramble across wet rocks. The weather was dismal, grey and drizzly, and everyone’s feathers went flat.',
    'At the end they found only a puddle. Cuffin stopped to ponder. "We did not acquire any custard," he said, "but we did acquire very damp feet. I would like that noted."'] },
  { t:'The Mirror’s Autograph', w:['autograph','brazen','vex','sincere','insolent'], p:[
    'The Mirror set up a table on the cliff and offered his autograph to anyone passing. Nobody asked. So he signed a rock, a seagull and Giles’s hat.',
    '"That is brazen," said Cuffin. "You cannot sign other people’s hats." Signing things was the Mirror’s favourite way to vex everyone.',
    'Giles was not amused. The Mirror said sorry, but it did not sound sincere. When he added "Your hat looked better with my name on it," Giles called him insolent and took the pen away.'] },
  { t:'The Great Fish Race', w:['collide','hasten','cautious','turbulent','prevail'], p:[
    'Every summer the puffins race to the fishing rock. "Hasten!" shouted Giles, waving a flag that was mostly seaweed.',
    'The Mirror flew so fast he nearly managed to collide with a lighthouse. Cuffin was more cautious. He flew low over the turbulent waves, choosing each gust carefully.',
    'The Mirror zoomed past, then got distracted by his reflection in a rock pool. Slow and steady, Cuffin landed first. "Brains prevail," he said. "Also, he stopped to look at himself again."'] },
  { t:'Redecorating the Burrow', w:['redecorate','rearrange','gaudy','refined','discern'], p:[
    'The Mirror decided to redecorate his burrow. He painted it gold, pink and a colour he called "shiny". It was very gaudy.',
    'Cuffin preferred a refined look: one smooth stone, one nice shell, and a sign saying "No custard here. Yet."',
    'The Mirror tried to rearrange Cuffin’s shells so they spelled MIRROR. But Cuffin could discern the change at once. "That shell was facing north," he said. "It is now facing smug."'] },
  { t:'The Mishap at Breakfast', w:['mishear','misjudge','reheat','frail','fret'], p:[
    'Giles asked for "a nice sprat on toast". The Mirror managed to mishear him and brought a nice SPLAT on toast. It was just a blob of seaweed.',
    'Then the Mirror tried to reheat yesterday’s fish on a sunny rock. It is easy to misjudge the sun, and the fish stayed cold and sad.',
    'Giles was old and a little frail, and he began to fret about missing breakfast. Cuffin calmly shared his own sprat. "Four in, four hold, four out," he told Giles. "Then eat."'] },
  { t:'The Disappearing Shell', w:['disappear','reappear','deceive','dishonest','confide'], p:[
    'Cuffin’s lucky shell seemed to disappear overnight. He searched everywhere: under rocks, behind the lighthouse, inside his own ear.',
    'The Mirror said he had not seen it. But the Mirror was sitting on something lumpy and shell-shaped. It is hard to deceive a puffin who has crossed the Atlantic eleven times.',
    'Then the shell seemed to reappear under the Mirror’s bottom. "Being dishonest does not suit you," said Cuffin. Later, the Mirror decided to confide in Cuffin: he only wanted to borrow some luck.'] },
  { t:'The Sea Fog', w:['obscure','visible','ascend','tranquil','serene'], p:[
    'One morning a thick fog rolled in. It began to obscure everything. Cuffin could not see the sea, the rocks, or his own feet.',
    'Only the top of the lighthouse was visible. "Let us ascend," said Cuffin, and the puffins flew up and up until they popped out above the fog.',
    'Up there the sky was tranquil and blue. Even the Mirror stopped talking. For one whole minute, everything was serene. Then he said, "I look amazing in this light," and the moment was over.'] },
  { t:'The Rematch', w:['contest','oppose','fair','endure','thwart'], p:[
    'The Mirror demanded a contest: who could stand on one leg the longest. Giles did not oppose the idea, as long as it was fair.',
    'Cuffin could endure the wind, the rain and a crab nibbling his toe. The Mirror wobbled after ten seconds.',
    'So he tried to thwart Cuffin by tickling him with a feather. Giles blew his whistle. "Disqualified," he said. "Cuffin wins. Again."'] },
  { t:'The Antisocial Seagull', w:['antisocial','hostile','permit','banish','solace'], p:[
    'A seagull moved onto the puffins’ cliff. He was antisocial: he would not say hello, and he stole chips from everyone.',
    'He was quite hostile too, flapping and squawking whenever anyone came near. "We do not permit chip-stealing," said Giles.',
    'Some puffins wanted to banish him for ever. But Cuffin noticed the seagull was lonely. He offered him a sprat. The seagull found solace in the sprat, and stopped squawking. Mostly.'] },
  { t:'The Biggest Wave', w:['colossal','cautious','gush','awe'], p:[
    'One stormy day a colossal wave rose out of the sea. It was taller than the lighthouse and greener than the Mirror’s jealousy.',
    'Water began to gush between the rocks. "Be cautious," said Cuffin. "Back to the burrows." The puffins scurried up the cliff.',
    'From the top they watched the wave crash down. Everyone stood in awe, beaks open. Even the Mirror said, "Wow." It was the first time anyone could remember him being speechless.'] },
  { t:'The Recipe', w:['classify','examine','thorough','familiar'], p:[
    'Cuffin found a book called "Custard: A Recipe". He wanted to examine every page. He was very thorough: he even read the bits about washing up.',
    'He began to classify the steps into "easy", "tricky" and "needs a cow". Most were "needs a cow".',
    'Some words seemed familiar: milk, sugar, egg. "We have none of these," Cuffin said. "We have fish." He closed the book and sighed. The mystery of the custard continues.'] },
  { t:'The Lost Fish', w:['retrieve','sparse','struggle','accomplishment'], p:[
    'Cuffin dropped his best fish into a deep rock pool. He dived in to retrieve it. The pool was cold, and the fish were sparse.',
    'It was a real struggle. He came up three times with nothing but seaweed on his head.',
    'But Cuffin did not give up. On the fourth dive he grabbed it. "Eventually still counts," he puffed. Getting that fish back was his proudest accomplishment of the week.'] },
  { t:'The Sullen Mirror', w:['sullen','gripe','offend'], p:[
    'After losing the leg-standing contest, the Mirror sat in a corner, sullen and silent, staring at a puddle.',
    'Every so often he made a little gripe: "The wind was unfair. The crab was on Cuffin’s side. My leg is shorter."',
    'Cuffin did not want to offend him. He sat down and said, "You were very good for ten seconds." The Mirror looked a little more cheerful. Then he said, "Eleven," and Cuffin let him have that one.'] },
  { t:'Impatient Giles', w:['impatient','impolite','rephrase','informal'], p:[
    'Giles was impatient. The new Leader had not been chosen yet, and he wanted to retire and eat sprats on a rock.',
    '"Hurry UP," he snapped at the Mirror. That was a bit impolite, so he decided to rephrase it.',
    '"What I meant was: please hurry up, young puffin." The Mirror said Giles could be informal with him. "Call me Your Shininess," he said. Giles did not.'] },
  { t:'The Robot Puffin', w:['automobile','autopilot','incapable','invalid'], p:[
    'A tourist dropped a toy robot puffin on the cliff. The Mirror thought it was a new rival.',
    'The robot was on autopilot. It marched in circles, beeping. It seemed incapable of stopping. "It moves like a tiny automobile," said Cuffin.',
    'The Mirror challenged it to a staring contest. The robot ran out of batteries. "I win!" said the Mirror. Giles ruled the result invalid, because you cannot beat a robot that is asleep.'] },
  { t:'The Illegible Letter', w:['illegible','misinform','incorrect'], p:[
    'A letter arrived for Cuffin, but the writing was illegible. It looked like a crab had walked through some ink.',
    'The Mirror offered to read it. He said it was an invitation to the Mirror’s Birthday Party. That was incorrect. He had tried to misinform everyone.',
    'Cuffin worked hard to decipher it himself. It was from his cousin in Iceland: "Still no custard here either." Cuffin felt frustrated, but not surprised.'] },
  { t:'The Brilliant Idea', w:['deliberate','propose','astute','commend','flourish'], p:[
    'Cuffin had an idea. It was no accident: he made a deliberate choice to think about it for three whole days.',
    'Then he went to Giles. "I propose a puffin school," he said. "Every puffin learns one new word a day." Giles thought this was very astute.',
    '"I commend you, Cuffin," he said. The school began the next morning. The puffins started to flourish. The Mirror learned the word "magnificent" and used it about himself all week.'] },
  { t:'The Echo Cave', w:['onomatopoeia','alliteration','simile','metaphor','reappear'], p:[
    'Cuffin found a cave that echoed everything. "Splash! Crash! Squawk!" he shouted. "That is onomatopoeia," said Giles. "Words that sound like the noise they make."',
    'The Mirror shouted, "Marvellous Mirror makes magnificent moves!" "That is alliteration," said Giles. "Lots of words starting with the same sound."',
    'Cuffin said the echo was "like a parrot made of rock". That was a simile. The Mirror said, "My voice is a golden trumpet." That was a metaphor, and also not true. Every word seemed to reappear a second later, bouncing round the walls.'] },
  { t:'The Volatile Volcano', w:['volatile','evaporate','humid','elevate'], p:[
    'Giles told a story about a volatile volcano that could erupt at any moment. The puffins listened, very still.',
    'It was so hot near the volcano, he said, that puddles would evaporate in seconds, and the air was so humid your feathers went curly.',
    'To escape, the puffins had to elevate themselves on a passing cloud. The Mirror was speechless with amazement. "Is that true?" he whispered. "No," said Giles. "But it is a good story."'] },
  { t:'The Untidy Burrow', w:['disarray','unkempt','arrange','pristine','routine'], p:[
    'The Mirror’s burrow was in total disarray: mirrors everywhere, feathers on the floor, and a sock nobody could explain.',
    'He himself looked unkempt, with feathers sticking out in seventeen directions. "I cannot find my comb," he moaned.',
    'Cuffin helped him arrange everything neatly. Soon the burrow was pristine. "Now make it a routine," said Cuffin. "Tidy every morning." The Mirror agreed, then went straight back to admiring himself.'] },
];
/* pick a story that uses the most words Aaron is learning right now, one he hasn't heard yet */
function pickStory(){
  const seen = S.stories || [], k = w => norm(w);
  const learning = new Set(allItems().filter(x => { const r = peek(x); return r && r.seen && !isMasteredRec(r); }).map(x => norm(x.w)));
  const known = new Set(allItems().map(x => norm(x.w)));
  const score = st => st.w.filter(w => learning.has(k(w))).length * 3 + st.w.filter(w => known.has(k(w))).length;
  let pool = STORIES.filter(st => !seen.includes(st.t));
  if (!pool.length){ S.stories = []; pool = STORIES.slice(); }
  return pool.slice().sort((a, b) => score(b) - score(a) || Math.random() - .5)[0];
}

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
  const T = allItems().length, aM = masteredCount(), d = S.points - S.race.mf, lock = lockReadyToday();
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
  { const nb = checkBadges(); if (nb.length){ save(); toast('🏅 New badge: ' + nb.map(b => b.n).join(', ')); } }   // catch up on badges earned in an unfinished match
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
/* the daily chapter: shows itself on the first visit of a new day */
function chapter(finish){
  screen = 'chapter';
  const v = S.lastVisit || visitSnap(), n = matchDay(), title = CHAPTERS[(n - 1) % CHAPTERS.length];
  const da = S.points - (v.a || 0), dm = S.race.mf - (v.m || 0), d = S.points - S.race.mf, T = allItems().length, aM = masteredCount();
  const ri = rankInfo(aM), sinceKey = da > dm ? 'won' : da < dm ? 'lost' : 'level';
  const rows = chartRows();
  const plus = x => x > 0 ? '+' + x + ' since last time' : 'same as last time';
  const sl = (...kids) => () => h('div', {}, ...kids);
  reel([
    () => { VOICE.play('c03'); return h('div', {}, h('div', { class:'chapter', text:'CHAPTER ' + n + ' · ' + shortDate(today()).toUpperCase() }), h('h2', {}, h('em', { text:title })),
      led(true, 'SO FAR'), Math.random() < .5 ? lower('GILES', pickOne(GCUSTARD), 'cus') : lower('GILES', pickOne(GILES))); },
    () => { const lv = d > 0 ? 'c11' : d < 0 ? 'c12' : null; const said = lv && VOICE.play(lv); return h('div', {}, h('h2', {}, 'The race ', h('em', { text:'so far' })), h('div', { class:'chartbox' }, raceChart(rows, 'p', 'mf', 'Fresh fish over time')), legend(),
      h('p', { class:'big', text: d > 0 ? 'Cuffin leads by ' + d + ' fish. ' : d < 0 ? 'The Mirror leads by ' + (-d) + ' fish. ' : 'Dead level. ' }), sayBlock('com', said ? VO[lv] : pickOne(SAY.since[sinceKey]), IMG.hello)); },
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
  ], finish, { label:'Chapter ' + n, tag:'CHAPTER ' + n, tune:'news', splash:h('div', { style:'display:flex;flex-direction:column;align-items:center;gap:6px' }, h('div', { class:'chapter', text:'CHAPTER ' + n }), h('h2', { text:title })),
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
  const c = counts(), T = allItems().length, rows = chartRows();
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
    h('div', { class:'homerow', style:'flex:none' }, h('button', { class:'btn alt small', type:'button', onclick:badgeSheet }, '🏅 Badges ' + badgesN + '/' + BADGES.length), h('button', { class:'btn alt small', type:'button', onclick:prizeSheet }, '🎁 Prizes'))
  ], 'trophies');
}
SCREENS.trophies = trophies;
function badgeSheet(){
  const info2 = h('p', { class:'binfo', 'aria-live':'polite', text:'Tap a badge to see what it is for.' });
  const grid = h('div', { class:'bgrid' }, BADGES.map(b => { const got = !!S.badges[b.id];
    const el = h('button', { class:'bdg' + (got ? '' : ' locked'), type:'button', 'aria-pressed':'false', 'aria-label':b.n + (got ? ', won' : ', not won yet'), onclick:() => {
      grid.querySelectorAll('.bdg').forEach(x => x.setAttribute('aria-pressed', 'false')); el.setAttribute('aria-pressed', 'true'); SND.fx('tap');
      put(info2, h('b', { text:b.n }), ' · ' + b.d + (got ? ' Won!' : '')); } }, icon(got ? b.ic : 'lock')); return el; }));
  openSheet([h('h2', { text:'Badges' }), grid, info2, h('button', { class:'btn alt wide', type:'button', onclick:closeSheet }, 'Close')], true);
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
  const tabs = [['play','Play'],['insights','Insights'],['school','School' + (schoolDue() ? ' ⚠️' : '')],['book','Book' + (nb ? ' (' + nb + ' today)' : '')],['saves','Saves'],['words','Words'],['prizes','Prizes'],['how','How it works'],['more','More']];
  const bar = h('div', { class:'subtabs', role:'group', 'aria-label':'Grown-ups sections' }, tabs.map(([id, t]) => h('button', { type:'button', 'aria-pressed':String(gTab === id), onclick:() => { gTab = id; grownups(); } }, t)));
  const panel = h('div', { class:'panel grow', style:'overflow-y:auto' });
  const c = counts(), T = allItems().length;
  if (gTab === 'play'){
    put(panel,
      sw('sw-hints', S.settings.hints, 'Hints', S.settings.hints ? 'On: “not sure” explanations, peeks and hint buttons.' : 'Off (test mode): no hints, every answer is ' + S.name + '’s own.', v => { S.settings.hints = v; save(); grownups(); }),
      sw('sw-sound', S.settings.sound, 'All sounds', 'Goals, misses, the Mirror and music. ' + S.name + ' can also switch this with the speaker button.', v => { S.settings.sound = v; if (!v){ S.settings.music = false; SND.stop(); SND.loop(false); } save(); grownups(); if (v){ SND.prime(); SND.fx('goal'); } }),
      sw('sw-cv', S.settings.cvoice !== false, 'Cuffin’s voice', 'The recorded Cuffin lines.', v => { S.settings.cvoice = v; if (!v) VOICE.stop(); save(); grownups(); }),
      sw('sw-mv', S.settings.mvoice !== false, 'The Mirror’s voice', 'The recorded Mirror lines.', v => { S.settings.mvoice = v; if (!v) VOICE.stop(); save(); grownups(); }),
      remindBlock(),
      sw('sw-music', S.settings.music, 'Music', 'Story fanfare, chapter sting, crowning anthem, match groove.', v => { S.settings.music = v; if (v) S.settings.sound = true; save(); grownups(); if (!v){ SND.stop(); SND.loop(false); } else { SND.prime(); SND.tune('win'); } }),
      h('div', { class:'set' }, h('div', { class:'lbl' }, h('b', { text:'Previews' }), h('span', { class:'small muted', text:'These do not change any progress.' }))),
      h('div', { class:'row' }, h('button', { class:'btn alt small', type:'button', onclick:() => intro(() => grownups()) }, 'The story'), h('button', { class:'btn alt small', type:'button', onclick:() => chapter(() => grownups()) }, 'Today’s chapter'), h('button', { class:'btn alt small', type:'button', onclick:() => ceremony(true, () => grownups()) }, 'The crowning')));
  } else if (gTab === 'school'){
    put(panel, schoolPanel());
  } else if (gTab === 'insights'){
    put(panel, insightsPanel());
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
        h('input', { class:'fld', id:'prz-tx-' + i, type:'text', value:p.text, placeholder:'e.g. Film night', 'aria-label':'Prize', onchange:e => { p.text = e.target.value; save(); } }),
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
      h('div', { class:'notice' }, h('b', { text:'Family code: ' }), (familyCode() && familyCode() !== 'LOCAL') ? familyCode() : 'not set (this device only)', ' ',
        h('button', { class:'linkbtn', type:'button', onclick:() => { setFamily(''); location.reload(); } }, 'Change')),
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
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

})();
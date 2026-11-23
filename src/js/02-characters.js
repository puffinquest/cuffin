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


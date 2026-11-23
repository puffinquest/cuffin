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
  const school = new Set((S.school && S.school.list) || []);
  const score = st => st.w.filter(w => school.has(k(w))).length * 4 + st.w.filter(w => learning.has(k(w))).length * 3 + st.w.filter(w => known.has(k(w))).length;   // this week's school words first
  let pool = STORIES.filter(st => !seen.includes(st.t));
  if (!pool.length){ S.stories = []; pool = STORIES.slice(); }
  return pool.slice().sort((a, b) => score(b) - score(a) || Math.random() - .5)[0];
}
/* this week's school words get their own story */
STORIES.push({ t:'The Superglue Disaster', w:['superglue','interlock','submerge','supernatural','superpower','subtotal'], p:[
  'The Mirror bought a tube of superglue. "With this," he announced, "I will glue my best feathers on forever." The shopkeeper, a crab, handed him the receipt. The subtotal was two fish, plus one fish for a shiny bag.',
  'Back on the cliff, the Mirror tried to glue two shells together so they would interlock like a crown. Instead, he glued his own wings together. He hopped about shouting that he had been struck by a supernatural curse.',
  '"It is not supernatural," said Cuffin. "It is glue." Giles said the only cure was warm salty water, so the Mirror had to submerge himself in a rock pool for an hour. "Patience," said Cuffin, "is my superpower. Clearly not yours."'] });

/* questions about what happened in each story: [question, right answer, wrong, wrong, wrong] */
const STORY_Q = {
  'The Custard Map':[['What did the map promise?', 'A lake of custard', 'A hidden treasure chest', 'A giant fish', 'A secret burrow'], ['What was the weather like on the walk?', 'Grey and drizzly', 'Hot and sunny', 'Snowy', 'Very windy but dry'], ['What did they find at the end?', 'Only a puddle', 'A lake of custard', 'A sleeping seagull', 'Another map'], ['What did they acquire in the end?', 'Very damp feet', 'A bucket of custard', 'A new hat', 'A shiny shell']],
  'The Mirror’s Autograph':[['How many puffins asked for the Mirror’s autograph?', 'Nobody', 'Everybody', 'Just Giles', 'Three seagulls'], ['Whose hat did the Mirror sign?', 'Giles’s hat', 'Cuffin’s hat', 'His own hat', 'A crab’s hat'], ['Why didn’t the Mirror’s sorry work?', 'It did not sound sincere', 'Nobody heard it', 'He said it in French', 'He said it to a rock'], ['What did Giles take away?', 'The pen', 'The table', 'The hat', 'The rock']],
  'The Great Fish Race':[['What was Giles’s flag mostly made of?', 'Seaweed', 'Feathers', 'Paper', 'Fish scales'], ['What did the Mirror nearly crash into?', 'A lighthouse', 'A boat', 'Giles', 'A cloud'], ['Why did the Mirror lose?', 'He stopped to look at his reflection', 'He fell asleep', 'He dropped his fish', 'He flew the wrong way'], ['Who won the race?', 'Cuffin', 'The Mirror', 'Giles', 'A seagull']],
  'Redecorating the Burrow':[['Which colour did the Mirror call “shiny”?', 'A colour he made up', 'Blue', 'Green', 'Black'], ['What did Cuffin’s sign say?', 'No custard here. Yet.', 'Keep out!', 'Welcome, friends!', 'Mirror was here'], ['What did the Mirror try to spell with Cuffin’s shells?', 'MIRROR', 'CUSTARD', 'HELLO', 'FISH'], ['How did Cuffin know his shells had been moved?', 'One was facing a different way', 'Giles told him', 'He heard a noise', 'One was missing']],
  'The Mishap at Breakfast':[['What did Giles ask for?', 'A sprat on toast', 'Custard on toast', 'A boiled egg', 'Seaweed soup'], ['What did the Mirror bring instead?', 'A blob of seaweed', 'A fish finger', 'A cup of tea', 'Nothing at all'], ['How did the Mirror try to reheat the fish?', 'On a sunny rock', 'In a fire', 'In a microwave', 'Under his wing'], ['What did Cuffin do to help Giles?', 'Shared his own sprat', 'Cooked him custard', 'Flew to a café', 'Told the Mirror off']],
  'The Disappearing Shell':[['What went missing?', 'Cuffin’s lucky shell', 'Giles’s hat', 'The Mirror’s comb', 'A bucket of fish'], ['Where was the shell really?', 'Under the Mirror’s bottom', 'Behind the lighthouse', 'In a rock pool', 'In Cuffin’s ear'], ['How many times has Cuffin crossed the Atlantic?', 'Eleven', 'Two', 'Fifty', 'None'], ['Why did the Mirror take the shell?', 'He wanted to borrow some luck', 'He wanted to sell it', 'He thought it was his', 'He wanted to eat it']],
  'The Sea Fog':[['What could still be seen in the fog?', 'The top of the lighthouse', 'The sea', 'Cuffin’s feet', 'The Mirror'], ['How did the puffins get out of the fog?', 'They flew up above it', 'They waited until night', 'They swam away', 'They hid in a burrow'], ['What was the sky like above the fog?', 'Calm and blue', 'Dark and stormy', 'Pink and cloudy', 'Full of seagulls'], ['What spoiled the peaceful moment?', 'The Mirror talking about how amazing he looked', 'A clap of thunder', 'Giles sneezing', 'A boat horn']],
  'The Rematch':[['What was the contest?', 'Standing on one leg', 'Catching fish', 'Flying the fastest', 'Holding your breath'], ['What nibbled Cuffin’s toe?', 'A crab', 'A seagull', 'A fish', 'The Mirror'], ['How did the Mirror try to cheat?', 'Tickled Cuffin with a feather', 'Pushed Cuffin over', 'Hid Cuffin’s leg', 'Splashed water at him'], ['What did Giles decide?', 'The Mirror was disqualified', 'It was a draw', 'The Mirror won', 'They would try again tomorrow']],
  'The Antisocial Seagull':[['What did the seagull steal?', 'Chips', 'Shells', 'Feathers', 'Hats'], ['Who wanted to banish the seagull?', 'Some of the puffins', 'Cuffin', 'Nobody', 'The Mirror only'], ['What did Cuffin notice about the seagull?', 'He was lonely', 'He was hungry for custard', 'He was lost', 'He was a puffin in disguise'], ['What did Cuffin give him?', 'A sprat', 'A chip', 'A shell', 'A hat']],
  'The Biggest Wave':[['How tall was the wave?', 'Taller than the lighthouse', 'As tall as a puffin', 'As tall as a house', 'As small as a puddle'], ['Where did the puffins go?', 'Up the cliff to the burrows', 'Into the sea', 'Onto a boat', 'Into a cave'], ['How did everyone feel watching the wave?', 'Amazed', 'Bored', 'Sleepy', 'Angry'], ['What was surprising about the Mirror?', 'He was speechless', 'He surfed the wave', 'He fell asleep', 'He was brave']],
  'The Recipe':[['What was the book called?', 'Custard: A Recipe', 'Fish for Beginners', 'The Puffin Cookbook', 'Seaweed Soups'], ['Which group did most steps go in?', 'Needs a cow', 'Easy', 'Tricky', 'Needs a fish'], ['Which ingredients did Cuffin recognise?', 'Milk, sugar and egg', 'Fish, salt and seaweed', 'Flour and butter', 'Jam and cream'], ['Why couldn’t Cuffin make custard?', 'He had only fish', 'The book was illegible', 'The Mirror ate it', 'He was too busy']],
  'The Lost Fish':[['Where did Cuffin drop his fish?', 'Into a deep rock pool', 'Off the cliff', 'Into the Mirror’s burrow', 'Into a boat'], ['What did Cuffin come up with at first?', 'Seaweed on his head', 'A crab', 'A boot', 'A shell'], ['On which dive did Cuffin get the fish?', 'The fourth', 'The first', 'The tenth', 'The second'], ['What does Cuffin say about doing things eventually?', 'Eventually still counts', 'Eventually is too late', 'Never give up custard', 'Fast is best']],
  'The Sullen Mirror':[['Why was the Mirror sullen?', 'He lost the leg-standing contest', 'He lost his comb', 'It was raining', 'Nobody signed his hat'], ['What did the Mirror blame?', 'The wind, the crab and his short leg', 'Giles', 'His breakfast', 'The fog'], ['What did Cuffin say to cheer him up?', 'You were very good for ten seconds', 'You won really', 'Try harder next time', 'Have some custard'], ['How long did the Mirror say he lasted?', 'Eleven seconds', 'Ten minutes', 'One hour', 'Five seconds']],
  'Impatient Giles':[['Why was Giles impatient?', 'He wanted to retire', 'He was hungry', 'He was late', 'He was cold'], ['Who did Giles snap at?', 'The Mirror', 'Cuffin', 'A seagull', 'A crab'], ['What did Giles do after being impolite?', 'Said it again more kindly', 'Walked away', 'Flew home', 'Laughed'], ['What did the Mirror want to be called?', 'Your Shininess', 'Your Majesty', 'Leader', 'Mr Mirror']],
  'The Robot Puffin':[['Who dropped the robot puffin?', 'A tourist', 'Giles', 'A seagull', 'Cuffin'], ['What did the robot do?', 'Marched in circles, beeping', 'Flew away', 'Sang a song', 'Ate fish'], ['What contest did the Mirror challenge it to?', 'A staring contest', 'A race', 'A swimming contest', 'Standing on one leg'], ['Why didn’t the Mirror’s win count?', 'The robot’s batteries had run out', 'He cheated', 'Giles was asleep', 'The robot won']],
  'The Illegible Letter':[['What did the writing look like?', 'A crab had walked through ink', 'Beautiful joined-up writing', 'Tiny dots', 'A picture of a fish'], ['What did the Mirror pretend the letter said?', 'An invitation to his birthday party', 'A prize for Cuffin', 'A recipe for custard', 'A map'], ['Who was the letter really from?', 'Cuffin’s cousin in Iceland', 'Giles', 'The Mirror', 'A seagull'], ['What did the letter really say?', 'Still no custard here either', 'Happy birthday', 'Come and visit', 'I found the custard']],
  'The Brilliant Idea':[['How long did Cuffin think about his idea?', 'Three whole days', 'Three seconds', 'A whole year', 'One night'], ['What did Cuffin propose?', 'A puffin school', 'A custard factory', 'A fishing race', 'A new burrow'], ['How many new words a day would each puffin learn?', 'One', 'Ten', 'None', 'A hundred'], ['Which word did the Mirror use about himself all week?', 'Magnificent', 'Astute', 'Refined', 'Humble']],
  'The Echo Cave':[['What was special about the cave?', 'It echoed everything', 'It was full of custard', 'It glowed in the dark', 'It was warm'], ['What is “Splash! Crash! Squawk!” an example of?', 'Onomatopoeia', 'A metaphor', 'A simile', 'Alliteration'], ['Cuffin said the echo was “like a parrot made of rock”. What is that?', 'A simile', 'A metaphor', 'Onomatopoeia', 'Alliteration'], ['What did the Mirror say his voice was?', 'A golden trumpet', 'A silver bell', 'A rock parrot', 'A foghorn']],
  'The Volatile Volcano':[['Who told the story about the volcano?', 'Giles', 'Cuffin', 'The Mirror', 'A seagull'], ['What happened to puddles near the volcano?', 'They dried up in seconds', 'They froze', 'They turned to custard', 'They got bigger'], ['How did the puffins escape in the story?', 'On a passing cloud', 'On a boat', 'Through a tunnel', 'On a whale'], ['Was Giles’s story true?', 'No, but it was a good story', 'Yes, every word', 'Only the volcano part', 'Nobody knows']],
  'The Untidy Burrow':[['What was in the Mirror’s burrow that nobody could explain?', 'A sock', 'A custard pie', 'A crab', 'A map'], ['What could the Mirror not find?', 'His comb', 'His mirror', 'His sock', 'His fish'], ['Who helped tidy up?', 'Cuffin', 'Giles', 'A seagull', 'Nobody'], ['What did Cuffin tell him to do every morning?', 'Tidy up', 'Brush his feathers', 'Catch a fish', 'Practise spelling']],
  'The Superglue Disaster':[['Why did the Mirror buy superglue?', 'To glue his best feathers on forever', 'To fix a shell', 'To mend Giles’s hat', 'To make a crown for Cuffin'], ['Who sold him the superglue?', 'A crab', 'A seagull', 'Giles', 'Cuffin'], ['What did the Mirror accidentally glue together?', 'His own wings', 'Two shells', 'Giles’s feet', 'The receipt'], ['How was the Mirror unstuck?', 'Sitting in warm salty water for an hour', 'Cuffin pulled hard', 'A supernatural spell', 'He waited until morning']],
};
STORIES.push({ t:'The Supermarket Submarine', w:['supermarket','submarine','superhero','subtitle','intercity','superstar'], p:[
  'The Rabbit opened a supermarket at the bottom of the sea. To get there, you had to take his submarine. "Carrots half price!" said the sign. "Puffins pay double."',
  'The Mirror dressed up as a superhero to investigate, with a cape made from a tea towel. He flew straight into a rock. Giles watched the whole thing like a film with no subtitles: confusing, and slightly embarrassing.',
  'In the end, Cuffin simply caught the intercity ferry home with a bag of fish. "Who needs an underwater supermarket?" he said. Everyone agreed Cuffin was the real superstar. The Rabbit was not invited to the party.'] });
STORY_Q['The Supermarket Submarine'] = [['Where was the Rabbit’s supermarket?', 'At the bottom of the sea', 'On top of the lighthouse', 'In a burrow', 'On the beach'], ['How did you get to the supermarket?', 'By submarine', 'By bus', 'By flying', 'By digging'], ['What was the Mirror’s cape made from?', 'A tea towel', 'Seaweed', 'A sail', 'A flag'], ['Who was the real superstar?', 'Cuffin', 'The Mirror', 'The Rabbit', 'Giles']];
STORIES.push({ t:'Sports Day at the Cliff', w:['beginning','equipped','jumping','running','swimming','preferred','stopping'], p:[
  'At the beginning of Sports Day, Giles blew his whistle so hard that his hat flew off. The Mirror arrived equipped with sunglasses, a headband and three mirrors, so he could watch himself win.',
  'First came the running race. The Mirror kept stopping to check his reflection, and a crab beat him. Then came the jumping. Cuffin jumped over a puddle. The Mirror jumped into it.',
  'Last was the swimming race. Cuffin preferred a calm, steady paddle and won easily. The Rabbit watched from behind a rock, muttering. "Rabbits can’t swim," said Giles. "That is why he is not invited."'] });
STORY_Q['Sports Day at the Cliff'] = [['What happened when Giles blew his whistle?', 'His hat flew off', 'He fell over', 'A seagull stole it', 'Nothing at all'], ['Why did the Mirror bring three mirrors?', 'To watch himself win', 'To dazzle Cuffin', 'To signal for help', 'To sell them'], ['Who beat the Mirror in the running race?', 'A crab', 'Cuffin', 'The Rabbit', 'Giles'], ['Why wasn’t the Rabbit invited?', 'Rabbits can’t swim', 'He was too fast', 'He was asleep', 'He was busy gardening']];


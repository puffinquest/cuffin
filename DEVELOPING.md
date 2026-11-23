# Developing Cuffin's Word Quest

The live game is what GitHub Pages serves from the top of this repo: `app.js`, `index.html`, `sw.js`, plus `img/`, `audio/` and `icons/`.
**Never edit `app.js`, `index.html` or `sw.js` directly.** They are built from `src/`.

## The loop for every change

```bash
git pull
# edit files in src/
python3 tools/build.py          # builds app.js / index.html / sw.js with a new version stamp
python3 tests/run_tests.py      # must say "0 failed"
python3 tools/build.py --check  # confirms the built files match src/
git add -A && git commit && git push
```

After pushing, wait a minute, then check the live version: Grown-ups → More shows it. Phones pick up the new version the next time the game opens. The service worker fetches the page with `no-cache`, and the version stamp changes the `app.js` URL.

For big changes, also have an independent agent test the game before reporting it done (Shaw's standing request).

## Where things live (`src/js/`, joined in name order)

| File | What's in it |
|---|---|
| 00-start.js | opening of the app; `APPV` version placeholder (`__APPV__`) |
| 01-helpers.js | tiny DOM helpers (`h`, `put`, …) |
| 02-characters.js | Cuffin / Mirror photos and lines |
| 03-sample-words.js | the 58 plain bank words (part of the 242 Leader words) |
| 04-cards.js | the 184 similar & opposite cards (the rest of the 242) |
| 05-state.js | state and storage |
| **06-school-lists.js** | **weekly spelling lists (`SCHOOL_PACKS`)**: these become Rabbit words |
| 07-core.js | Rabbit split, mastery, spaced review, race with the Mirror, badges, match engine (`startRound2`), scoring |
| 08-sound.js | synthesised sound and music |
| 09-voiceovers.js | Shaw's recorded voice lines |
| 10-firebase.js | family sync |
| 11-ui.js | shared UI, the question screen, results, full time |
| 12-book.js | vocabulary book, STOP card, book check |
| 13-extras.js | celebrations, prizes, insights, school tab, story UI, pie game, Check words, Stop the Rabbit screens |
| 14-stories.js | word stories (`STORIES`) and their questions (`STORY_Q`, 4 per story) |
| 15-pronunciation.js | "How do you say it?" options (`PRON`, 2 funny wrong options per word) |
| 16-screens.js | Home, trophies, Grown-ups, chapter / news slideshows, and app start-up |

`src/index.html` holds the CSS and page shell. `src/sw.js` is the service worker. Both use the `__APPV__` placeholder.

## Adding a weekly spelling list

1. Add a pack to `SCHOOL_PACKS` in `06-school-lists.js`: `{ d:'YYYY-MM-DD', rows:[[word, meaning, sentence], …] }`. Use child-friendly meanings and British spelling.
2. Add a `PRON` entry for each word in `15-pronunciation.js`. Each needs 2 wrong options that sound clearly different from the real word in a British voice, aren't alike each other, and are funny and suitable for a 9-year-old. Real-word phrases work best ("rhino king" for running). Never use "hate".
3. Optional: add a story using the words to `14-stories.js`, with 4 `STORY_Q` questions.
4. If the words have a prefix (inter-, sub-, super-…), add them to `PREFIX_WORDS` in `07-core.js`.
5. Build, test, push. The Rabbit's "He's back" news plays once automatically for the new pack.

## Rules that matter

- **Aaron's progress lives in Firebase, never in this repo.** Never put the family code (PUFFIN-…) in the source; `build.py` refuses to build if one appears.
- **The 242 Leader words** (58 bank words + 184 cards) drive mastery, ranks, prizes and the Mirror race. School-list words are Rabbit words: Stop the Rabbit only, paying carrots, not fish.
- **Tests never touch real data.** `tests/run_tests.py` blocks all Firebase/Google requests and plays a copy of the game.
- **Content standards:** British English. Cuffin is dry and deadpan; the Mirror is vain and must never win; the Rabbit is sneaky and sly. Never use the word "hate". No copyrighted material.

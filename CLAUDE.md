# Notes for Claude

Read DEVELOPING.md before changing anything. The short version:

- Edit `src/` only. Never hand-edit `app.js`, `index.html` or `sw.js`.
- Build with `python3 tools/build.py`, test with `python3 tests/run_tests.py` (it must report 0 failed), confirm with `python3 tools/build.py --check`, then commit and push.
- Have an independent agent test any significant change before telling Shaw it's done.
- Never touch the family's real data in tests. The test suite blocks Firebase; keep it that way.
- Weekly spellings: add a pack to `src/js/06-school-lists.js` and PRON entries to `src/js/15-pronunciation.js` (see DEVELOPING.md).
- Commits end with the attribution lines the session asks for.

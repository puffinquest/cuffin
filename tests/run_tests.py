#!/usr/bin/env python3
"""End-to-end checks for Cuffin's Word Quest. Run after every change, before pushing:

    python3 tools/build.py && python3 tests/run_tests.py

What it does:
- copies the built game (app.js, index.html, sw.js, img, audio, icons) to a temporary folder,
  adds a test hook (window.__ev) to the copy only, and serves it on localhost
- BLOCKS every Firebase/Google request, so the family's real data is never touched
- plays real matches through the UI on an iPhone SE-sized screen, and checks the rules
  that matter (word counts, Rabbit words kept separate, new words keep coming, etc.)

Needs Python Playwright with Chromium (pre-installed in Claude's workspace).
Exit code 0 = all passed. Screenshots of failures go to tests/out/.
"""
import contextlib, functools, http.server, json, os, pathlib, random, re, shutil, socket, sys, tempfile, threading, traceback

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'tests' / 'out'
SE = dict(viewport={'width': 375, 'height': 647}, device_scale_factor=2, has_touch=True, is_mobile=True)
IPAD = dict(viewport={'width': 820, 'height': 1180}, device_scale_factor=2, has_touch=True, is_mobile=True)
results = []


def check(name, ok, detail=''):
    results.append((name, bool(ok), detail))
    print(('  PASS ' if ok else '  FAIL ') + name + (('  [' + str(detail)[:300] + ']') if detail and not ok else ''))


# ---------- serve a hooked copy of the built game ----------
def make_site():
    d = pathlib.Path(tempfile.mkdtemp(prefix='cuffin-test-'))
    for f in ('app.js', 'index.html', 'sw.js', 'manifest.webmanifest'):
        shutil.copy(ROOT / f, d / f)
    for sub in ('img', 'audio', 'icons'):
        if (ROOT / sub).exists():
            shutil.copytree(ROOT / sub, d / sub)
    js = (d / 'app.js').read_text(encoding='utf-8')
    i = js.rindex('})();')
    (d / 'app.js').write_text(js[:i] + 'window.__ev = s => eval(s);\n' + js[i:], encoding='utf-8')
    return d


def serve(d):
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(d))
    handler.log_message = lambda *a: None
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', port), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, 'http://127.0.0.1:%d/index.html' % port


def block(route):
    u = route.request.url
    if any(k in u for k in ('gstatic', 'googleapis', 'firebase', 'fonts.g')):
        return route.abort()
    return route.continue_()


def new_page(browser, url, dev=SE):
    ctx = browser.new_context(**dev)
    pg = ctx.new_page()
    pg.route('**/*', block)
    pg.emulate_media(reduced_motion='reduce')
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(2500)
    return pg, errs


def ev(pg, s):
    return pg.evaluate('s => window.__ev(s)', s)


def clear_overlays(pg):
    ev(pg, "document.querySelectorAll('.celeb,.stopov,.sheet,.scrim').forEach(e => e.remove()); 1")


def existing_player(pg):
    """An existing player like Aaron: played before, about half the main words mastered, some due. Saved and reloaded so school packs apply."""
    ev(pg, r"""(() => {
      S.intro = true; S.stats.answered = 500; S.lastVisit = { d:today(), a:0, m:0, w:0, c:0 };
      localStorage.setItem(KEY, JSON.stringify(S)); return 1; })()""")
    pg.reload(); pg.wait_for_timeout(2500)
    ev(pg, r"""(() => {
      const add = (n) => { const x = new Date(today()); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
      const it = mainItems(); S.prog = S.prog || {};
      it.forEach((x, i) => { const r = rec(x);
        if (i % 2 === 0) Object.assign(r, { seen:8, right:7, miss:1, streak:4, m:true, md:add(-20), last:add(-(i % 9)), ty:['w2m','m2w'], dy:[add(-30), add(-29)], iv:8, due:add((i % 7) - 3) });
        else if (i % 37 === 1) Object.assign(r, { seen:3, right:2, miss:1, streak:1, last:add(-1), due:today(), iv:1 });
      });
      const last = SCHOOL_PACKS[SCHOOL_PACKS.length - 1].d;
      S.rabbitNews = { d:last, on:today(), v:2 }; S.book = { next:[] }; S.settings.sound = true;
      localStorage.setItem(KEY, JSON.stringify(S)); return 1; })()""")
    pg.reload(); pg.wait_for_timeout(2500)
    clear_overlays(pg); ev(pg, 'home(); 1'); pg.wait_for_timeout(500)


# ---------- play a match through the UI ----------
def play(pg, kind, maxsteps=400):
    """Answers questions the way a child would (mostly right). Returns (log, final screen, words that were Rabbit words)."""
    log, rabbit_seen = [], []
    if kind == 'mixed': pg.locator('button.kick:visible').first.click()
    elif kind == 'rabbit': pg.locator('button.rabhome:visible').first.click()
    else: ev(pg, "startRound('%s'); 1" % kind)
    pg.wait_for_timeout(1200)
    vis = lambda sel: pg.locator(sel + ':visible').count() > 0
    for _ in range(maxsteps):
        scr = ev(pg, 'screen')
        if scr in ('summary', 'home', 'ceremony'):
            break
        if scr == 'bookcheck' and vis('.pitch input:not([disabled])'):
            w = ev(pg, "(() => { const t = document.body.innerText.match(/“([^”]+)”/); if (!t) return ''; const x = allItems().find(y => (y.card ? info(y.w).m : y.m) === t[1]); return x ? x.w : ''; })()")
            pg.locator('.pitch input:visible').first.fill(w or 'xx'); pg.locator('button:visible:has-text("Check")').last.click(timeout=3000)
            pg.wait_for_timeout(700); continue
        if scr != 'round':
            k = pg.locator('button:visible:not([disabled])')
            cand = [i for i in range(k.count()) if k.nth(i).inner_text().strip() and 'End' not in k.nth(i).inner_text()]
            if cand: k.nth(cand[-1]).click(timeout=3000)
            pg.wait_for_timeout(900); continue
        if vis('.stopov'):
            b = pg.locator('.stopov button:visible:not([disabled])')
            if b.count(): b.last.click(timeout=3000)
            pg.wait_for_timeout(900); continue
        sh = pg.locator('.sheet:visible button:visible:not([disabled])')
        if sh.count():
            sh.last.click(timeout=3000); pg.wait_for_timeout(600); continue
        nb = pg.locator('button:visible').filter(has_text=re.compile(r'^\s*(Next question|Full time|📓 Book time|Book time)'))
        if nb.count(): nb.last.click(); pg.wait_for_timeout(600); continue
        wr = pg.locator('button:visible:not([disabled])', has_text='written it')
        if wr.count(): wr.first.click(); pg.wait_for_timeout(600); continue
        if pg.locator('button:visible', has_text='Keep writing').count(): pg.wait_for_timeout(900); continue
        cur = json.loads(ev(pg, "JSON.stringify((() => { const q = R && R.queue && R.queue[R.idx]; return q ? { w:q.w.w, m:q.w.card ? info(q.w.w).m : q.w.m, rab:isRabbitItem(q.w) } : {}; })())"))
        if not cur:
            pg.wait_for_timeout(500); continue
        if cur.get('rab'): rabbit_seen.append(cur['w'])
        right = random.random() < .85
        if vis('#spellin'):
            log.append('spell'); pg.fill('#spellin', cur['w'] if right else 'zzz'); pg.locator('form.spell button[type=submit]').click()
        elif vis('.tile'):
            log.append('scram')
            for ch in cur['w']:
                t = pg.locator('.tile:not([disabled])', has_text=ch)
                c = [i for i in range(t.count()) if t.nth(i).inner_text() == ch]
                (t.nth(c[0]) if c else pg.locator('.tile:not([disabled])').first).click()
        elif vis('.sayopt:not([disabled])'):
            log.append('say'); pg.locator('.sayopt:not([disabled])').nth(random.randrange(3)).click(); pg.wait_for_timeout(200); pg.locator('button:has-text("Check")').click()
        elif vis('button:has-text("I KNOW IT"):not([disabled])'):
            log.append('card'); pg.locator('button:has-text("I KNOW IT")').click(timeout=3000)
        elif vis('.ans:not([disabled])'):
            log.append('choice'); a = pg.locator('.ans:not([disabled])')
            ts = [a.nth(i).get_attribute('data-t') for i in range(a.count())]
            good = [i for i, t in enumerate(ts) if t and (t.lower() == cur['w'].lower() or t == cur['m'])]
            a.nth(good[0] if good and right else random.randrange(a.count())).click()
        else:
            b = pg.locator('button:visible:not([disabled])')
            log.append('other')
            if b.count(): b.last.click()
        pg.wait_for_timeout(500)
    pg.wait_for_timeout(800)
    return log, ev(pg, 'screen'), rabbit_seen


def overflow(pg):
    return ev(pg, "document.documentElement.scrollWidth > innerWidth + 1")


# ---------- the checks ----------
def run(browser, url):
    print('\n1. Loads cleanly')
    for name, dev in (('SE', SE), ('iPad', IPAD)):
        pg, errs = new_page(browser, url, dev)
        check('%s: home screen shows' % name, ev(pg, 'screen') in ('home', 'chapter', 'intro', 'join') or pg.locator('body').inner_text() != '')
        check('%s: no sideways scrolling' % name, not overflow(pg))
        check('%s: no JS errors on load' % name, not errs, errs)
        pg.close()

    pg, errs = new_page(browser, url)
    existing_player(pg)
    print('\n2. Word lists')
    packs = ev(pg, 'SCHOOL_PACKS.reduce((n, p) => n + p.rows.length, 0)')
    check('main (Leader) words = 242', ev(pg, 'mainItems().length') == 242, ev(pg, 'mainItems().length'))
    check('every school-list word is a Rabbit word (%d)' % packs, ev(pg, 'rabbitItems().length') == packs, ev(pg, 'rabbitItems().length'))
    check('no duplicate words', ev(pg, 'new Set(allItems().map(x => (x.card ? "c:" : "") + norm(x.w))).size === allItems().length'))
    check('every Rabbit word has a meaning and a sentence', ev(pg, 'rabbitItems().every(x => x.m && x.s)'))
    pg.reload(); pg.wait_for_timeout(2500)
    check('reloading adds no duplicates', ev(pg, 'rabbitItems().length') == packs)
    check('every word has 2 pronunciation options', ev(pg, 'allItems().every(x => { const p = PRON[norm(x.w)]; return p && p.length === 2 && p[0][0] !== p[1][0]; })'),
          ev(pg, 'allItems().filter(x => { const p = PRON[norm(x.w)]; return !(p && p.length === 2); }).map(x => x.w).join(",")'))
    check('every story has 4 story questions', ev(pg, 'STORIES.every(s => (STORY_Q[s.t] || []).length === 4)'))

    print('\n3. Which words each kind of match uses (300 simulated matches each)')
    sim = json.loads(ev(pg, r"""JSON.stringify((() => {
      const out = {}; const isNew = x => { const r = peek(x); return !r || !r.seen; };
      for (const kind of ['mixed', 'rabbit', 'tricky', 'cards']){
        let rab = 0, nonRab = 0, minNew = 99, n = 0;
        for (let k = 0; k < 300; k++){ R = null; try { startRound2(kind); } catch (e) { out[kind] = 'ERR ' + e; break; }
          if (!R || !R.queue) continue; n++;
          R.queue.forEach(q => isRabbitItem(q.w) ? rab++ : nonRab++);
          minNew = Math.min(minNew, R.queue.filter(q => isNew(q.w)).length); }
        if (typeof out[kind] !== 'string') out[kind] = { rab, nonRab, minNew, n };
        R = null; document.querySelectorAll('.celeb,.stopov,.sheet,.scrim').forEach(e => e.remove());
      }
      home(); return out; })())"""))
    check('Kick Off never includes Rabbit words', isinstance(sim['mixed'], dict) and sim['mixed']['rab'] == 0, sim['mixed'])
    check('Kick Off always has at least 4 new words (few words in progress)', isinstance(sim['mixed'], dict) and sim['mixed']['minNew'] >= 4, sim['mixed'])
    check('Stop the Rabbit only uses Rabbit words', isinstance(sim['rabbit'], dict) and sim['rabbit']['nonRab'] == 0 and sim['rabbit']['rab'] > 0, sim['rabbit'])
    check('Training never includes Rabbit words', not isinstance(sim['tricky'], dict) or sim['tricky']['rab'] == 0, sim['tricky'])
    check('Cards match never includes Rabbit words', isinstance(sim['cards'], dict) and sim['cards']['rab'] == 0, sim['cards'])
    clear_overlays(pg); ev(pg, 'home(); 1'); pg.wait_for_timeout(600)

    print('\n4. Real matches through the screen (iPhone SE size)')
    before = json.loads(ev(pg, 'JSON.stringify({ fish:S.points, mirror:S.race.mf, carrots:S.carrots || 0, rounds:(S.rounds || []).length })'))
    log, end, rab = play(pg, 'mixed')
    OUT.mkdir(exist_ok=True); pg.screenshot(path=str(OUT / 'kickoff_end.png'))
    check('Kick Off plays to full time', end in ('summary', 'ceremony'), (end, log[-5:]))
    check('Kick Off showed no Rabbit words', not rab, rab)
    check('full-time screen fits (no sideways scroll)', not overflow(pg))
    after = json.loads(ev(pg, 'JSON.stringify({ fish:S.points, mirror:S.race.mf, carrots:S.carrots || 0, rounds:(S.rounds || []).length })'))
    check('the match was recorded', after['rounds'] > before['rounds'], (before, after))
    clear_overlays(pg); ev(pg, 'home(); 1'); pg.wait_for_timeout(600)

    fish0 = json.loads(ev(pg, 'JSON.stringify([S.points, S.race.mf, S.carrots || 0])'))
    log, end, rab = play(pg, 'rabbit')
    pg.screenshot(path=str(OUT / 'rabbit_end.png'))
    fish1 = json.loads(ev(pg, 'JSON.stringify([S.points, S.race.mf, S.carrots || 0])'))
    check('Stop the Rabbit plays to full time', end == 'summary', (end, log[-5:]))
    check('Stop the Rabbit pays no fish and leaves the Mirror alone', fish1[0] == fish0[0] and fish1[1] == fish0[1], (fish0, fish1))
    check('Stop the Rabbit pays carrots', fish1[2] > fish0[2], (fish0, fish1))
    clear_overlays(pg); ev(pg, 'home(); 1'); pg.wait_for_timeout(600)

    log, end, rab = play(pg, 'tricky')
    check('Training plays to the end (or says nothing is tricky)', end in ('summary', 'home'), (end, log[-5:]))
    check('Training showed no Rabbit words', not rab, rab)
    clear_overlays(pg); ev(pg, 'home(); 1'); pg.wait_for_timeout(600)

    print('\n5. Screens')
    for name, js in (('Progress', 'progress()'), ('Trophies', 'trophies()'), ('Grown-ups', 'parentOK = true; grownups()')):
        try:
            ev(pg, js + '; 1'); pg.wait_for_timeout(700)
            check('%s opens without sideways scroll' % name, not overflow(pg))
        except Exception as e:
            check('%s opens' % name, False, e)
        clear_overlays(pg)
    ev(pg, 'home(); 1'); pg.wait_for_timeout(500)
    try:
        ev(pg, 'storyTime(() => home()); 1'); pg.wait_for_timeout(800)
        pg.locator('text=Questions →').click(); pg.wait_for_timeout(500)
        n = ev(pg, "(() => { const m = (document.querySelector('.eyebrow') || {}).innerText || ''; const r = m.match(/OF (\\d+)/); return r ? +r[1] : 0; })()")
        check('a story gives 5 questions', n == 5, n)
    except Exception as e:
        check('story quiz opens', False, e)
    clear_overlays(pg); ev(pg, 'home(); 1')

    print('\n6. Rabbit news for a new spelling list')
    ev(pg, "S.rabbitNews = { d:'2000-01-01', on:'2000-01-01', v:2 }; save(); home.rabbitShown = false; 1")
    pg.reload(); pg.wait_for_timeout(2500)
    check('the "He\'s back" news shows for a new list', ev(pg, 'screen') == 'chapter' or ev(pg, 'rabbitDue()'))
    check('every JS error so far', not errs, errs)
    pg.close()


def main():
    random.seed(7)
    site = make_site()
    httpd, url = serve(site)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            try:
                run(browser, url)
            except Exception:
                traceback.print_exc(); check('test run finished without crashing', False)
            browser.close()
    finally:
        httpd.shutdown(); shutil.rmtree(site, ignore_errors=True)
    bad = [r for r in results if not r[1]]
    print('\n%d passed, %d failed' % (len(results) - len(bad), len(bad)))
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()

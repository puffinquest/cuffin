#!/usr/bin/env python3
"""Build the game from src/ into the files GitHub Pages serves (app.js, index.html, sw.js).

  python3 tools/build.py            build, with a new version stamp
  python3 tools/build.py --check    build in memory and confirm the published files match
                                    src/ exactly (catches anything edited directly in app.js)

The version stamp is the first 10 characters of a SHA-1 of the source, so it only changes
when the source changes. Phones pick up a new version because sw.js and the app.js URL
both carry the stamp.
"""
import hashlib, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
MARK = '__APPV__'
OUT = ('app.js', 'index.html', 'sw.js')


def sources():
    parts = sorted((SRC / 'js').glob('*.js'))
    if not parts:
        sys.exit('No source files in src/js')
    js = ''.join(p.read_text(encoding='utf-8') for p in parts)
    return js, (SRC / 'index.html').read_text(encoding='utf-8'), (SRC / 'sw.js').read_text(encoding='utf-8')


def build(version=None):
    js, html, sw = sources()
    for name, text in (('js', js), ('index.html', html), ('sw.js', sw)):
        if MARK not in text:
            sys.exit('Version placeholder %s missing from %s' % (MARK, name))
    # never publish the family code
    if any(c.upper().replace('-', '') != 'PUFFINXXXXXXXX' for c in re.findall(r'PUFFIN-?[A-Z0-9]{4}-?[A-Z0-9]{4}', js + html + sw, re.I)):   # XXXX is the input box's example text
        sys.exit('A family code appears in the source. Remove it before building.')
    if version is None:
        version = hashlib.sha1((js + html + sw).encode('utf-8')).hexdigest()[:10]
    return version, {'app.js': js.replace(MARK, version), 'index.html': html.replace(MARK, version), 'sw.js': sw.replace(MARK, version)}


def live_version():
    m = re.search(r'const APPV = "([0-9a-f]{10})"', (ROOT / 'app.js').read_text(encoding='utf-8'))
    return m.group(1) if m else None


def main():
    if '--check' in sys.argv:
        v = live_version()
        if not v:
            sys.exit('Could not read the version from app.js')
        fresh, out = build()
        if fresh != v:
            print('MISMATCH: app.js says version %s but the source hashes to %s. Run tools/build.py.' % (v, fresh))
            sys.exit(1)
        bad = [f for f in OUT if (ROOT / f).read_text(encoding='utf-8') != out[f]]
        if bad:
            print('MISMATCH: %s differ from src/ (version %s). Someone edited the built files directly.' % (', '.join(bad), v))
            sys.exit(1)
        print('OK: app.js, index.html and sw.js match src/ exactly (version %s)' % v)
        return
    version, out = build()
    for f, text in out.items():
        (ROOT / f).write_text(text, encoding='utf-8')
    print('Built version %s: %s' % (version, ', '.join('%s %d bytes' % (f, len(t.encode('utf-8'))) for f, t in out.items())))


if __name__ == '__main__':
    main()

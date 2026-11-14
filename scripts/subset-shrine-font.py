#!/usr/bin/env python3
"""Rebuild ShrineHand from the full LXGW WenKai font and current site copy."""
import argparse
import unicodedata
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'static/fonts/shrine-hand.woff2'


def requested_characters():
    chars = set((ROOT / 'static/fonts/shrine-chars.txt').read_text())
    chars.update(chr(c) for c in range(32, 127))
    chars.update(chr(c) for c in range(0x3041, 0x3097))
    chars.update(chr(c) for c in range(0x30A1, 0x30FB))
    paths = [p for p in ROOT.rglob('*.html') if not any(x.startswith('.') or x == 'node_modules' for x in p.relative_to(ROOT).parts)]
    for folder, pattern in [('static/js', '*.js'), ('static/css', '*.css'), ('static/data', '*.json')]:
        paths.extend((ROOT / folder).glob(pattern))
    for path in paths:
        chars.update(c for c in path.read_text() if '\u2e80' <= c <= '\u9fff' or '\uf900' <= c <= '\ufaff' or '\uff00' <= c <= '\uffef')
    return {ord(c) for c in chars if not c.isspace() or c == ' '}


def missing_required(wanted, available):
    # Decorative arrows and symbols may use the system fallback; ideographs
    # and assigned kana used by the site must be present in ShrineHand.
    return {c for c in wanted - available if
            (0x3400 <= c <= 0x9FFF or 0xF900 <= c <= 0xFAFF or 0x3041 <= c <= 0x30FA)
            and unicodedata.category(chr(c)) != 'Cn'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    wanted = requested_characters()
    existing = TTFont(OUTPUT)
    if args.check:
        missing = missing_required(wanted, set(existing.getBestCmap()))
        if missing:
            raise SystemExit('Missing ShrineHand glyphs: ' + ''.join(chr(c) for c in sorted(missing)))
        print('ShrineHand covers current site copy:', len(wanted), 'characters.')
        return
    if not args.source:
        parser.error('--source must point to the full LXGWWenKai-Regular.ttf')
    font = TTFont(args.source, checkChecksums=2)
    available = set(font.getBestCmap())
    # Keep the previous subset as well as newly required title and body glyphs.
    wanted.update(existing.getBestCmap())
    supported = wanted & available
    missing = missing_required(wanted, available)
    if missing:
        raise SystemExit('Full source font lacks required characters: ' + ''.join(chr(c) for c in sorted(missing)))
    options = subset.Options()
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.name_languages = ['*']
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=supported)
    subsetter.subset(font)
    font.flavor = 'woff2'
    temporary = OUTPUT.with_suffix('.tmp.woff2')
    font.save(temporary)
    if supported - set(TTFont(temporary).getBestCmap()):
        raise SystemExit('Subset lost required characters')
    temporary.replace(OUTPUT)
    (ROOT / 'static/fonts/shrine-chars.txt').write_text(''.join(chr(c) for c in sorted(supported)) + '\n')
    print('Rebuilt ShrineHand:', len(supported), 'characters,', OUTPUT.stat().st_size, 'bytes.')


if __name__ == '__main__':
    main()

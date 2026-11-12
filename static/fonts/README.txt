display-900.woff2 — bundled ultra-black CJK display face
=========================================================

WHAT THIS IS
------------
A WOFF2 subset of Noto Sans SC Black (weight 900) containing exactly the
characters that can appear in this site's display-size headings, plus the
ASCII/Latin characters that share those same lines (so a mixed line such as
"緋想天Tools" renders in one face, one weight, one set of metrics).

It is a HEADING-ONLY face. Body text never uses it. It exists because on
Windows a 900-weight CJK headline otherwise falls back to Microsoft YaHei
Bold (a fake-bold ~700), which is nowhere near heavy enough for the
"雷霆大字" look.

CHARACTER SET: 359 characters. This is the union of

  * every character that occurs in display-size text on the site (77 unique
    characters extracted from the live pages today; see "HOW subset-chars.txt
    WAS DERIVED"), plus everything the previous 346-character build already
    covered, so a page edit can never silently drop a glyph,
  * the full ASCII printable range U+0020-U+007E,
  * ". , : % – — · × →" and the CJK punctuation used on the site
    （，。、；：？！「」『』【】〔〕（）［］｛｝《》〈〉…‥～￥＄％＆＊＋－＝＜＞｜＠＾＿｀＃）,
  * the strings 緋想天Tools, 404, Hisou Tenshi, 比那名居天子, 下载, 关于.

All ten digits 0-9 are included, including 8 and 9 — the homepage stats row
uses 8 (e.g. "8 部 玩过游戏") and 19.4k-style numbers, and before this rebuild
the subset only had 0-7, so 8 and 9 fell back to the system font and rendered
visibly thinner and smaller than their neighbours. If you add a new heading
with a character that is not in subset-chars.txt, that ONE glyph falls back
to the next family in --font-display (see "TO EXTEND THE SET" below).

The 13 characters added by the 2026-11-12 rebuild are
传 平 折 施 时 痕 腾 藏 轮 迹 送 造 门. They were missing from the previous
subset, so on macOS (and any platform without a 900-weight CJK fallback) those
glyphs silently dropped to PingFang SC Semibold while the rest of the same
heading stayed Noto Sans SC Black — the heading looked half-bold, half-light.
That was the "部分文字字体出错" bug reported for Chrome and Safari on macOS.
Now a full-coverage check over all nine pages reports every display glyph
as the custom face (see VERIFICATION below). Because pages keep changing,
extract2-style tooling UNIONS its output with the existing subset-chars.txt
instead of replacing it (see "HOW subset-chars.txt WAS DERIVED").

FONT
----
  Family (name ID 1/4)   Noto Sans SC Black
  Weight                Black, i.e. 900 (OS/2.usWeightClass = 900)
  Version (name ID 5)   Version 2.004;hotconv 1.0.118;makeotfexe 2.5.65603
  Copyright (name ID 0) © 2014-2021 Adobe (http://www.adobe.com/).
  Upstream project      https://github.com/googlefonts/noto-cjk
  Source file used      NotoSansSC-Black.otf
                        8,855,916 bytes, 31,036 glyphs, CFF-flavoured OTF
                        (not committed; re-download with curl if needed)
  Source URL            https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Sans/SubsetOTF/SC/NotoSansSC-Black.otf
                        mirror that also worked:
                        https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-Black.otf
                        (the paths Sans/OTF/SimplifiedChinese/NotoSansSC-Black.otf
                        that older docs mention are 404 in the current tree;
                        the live tree keeps it under Sans/SubsetOTF/SC/.)

LICENCE
-------
  SIL Open Font License, Version 1.1 — https://scripts.sil.org/OFL
  The full OFL text and its URL are kept INSIDE the subset (name IDs 13,
  14, 16, 17 are retained, i.e. the fontTools default of keeping only name
  IDs 0-6 was deliberately overridden). Redistribution as part of this site
  is permitted by the OFL; the font may not be sold on its own, and any
  derivative must stay under the OFL and must not use the reserved font
  name "Noto" without permission. "Noto Sans SC Black" here is unmodified
  glyph data, subset only.

SUBSET
------
  Characters          359 (203 CJK ideographs + 12 kana + 95 ASCII printable
                      + 49 punctuation/symbols; 346 of them are shared with
                      the previous build, 13 are new)
  Glyphs in file      367 (359 mapped CFF ids + .notdef + 7 unmapped side
                      glyphs the subsetter keeps for the kept name/GSUB data)
  cmap entries        359
  Byte size before    8,855,916 bytes  (source OTF, 31,036 glyphs)
  Byte size after        50,972 bytes  (49.78 KiB)  = 82.9% of the 60 KB budget
                      (10,468 bytes of headroom left)
  SHA-256 (woff2)      3402f296b4fed34b6300009bfdbee1f158fa01504b3ee4a4c58b6e9a160c19ff
  SHA-256 (chars)      be506811a290100b3d31bca4b78d6cd35993e7b6abdd4c2a7c43e3ce309cb201
  Font tables kept     BASE CFF GPOS GSUB OS/2 VORG cmap head hhea hmtx
                       maxp name post vhea vmtx

  The previous shipped file was the 346-character build (47,896 B, SHA-256
  e4c59ec4b170e2733e8e08eb4a69ef817b2e96ba1ff9ac029a9d0f29b6070119). It is
  superseded because it was missing 13 glyphs that are on the site today; it
  also caused the mixed-weight heading reported on macOS. Before that shipped
  the 329-character build (44,524 B, SHA-256
  51c6f53c08845d81f09b2ae88113d0a1b7a96c876d10af02637890e48cf3fe91).
  Before that came an 118-character build (17,844 B), and before that a build
  with --no-hinting that rendered broken at 1x (see KEEP THE HINTS below).

COMMAND USED (fontTools 4.51.0 for this rebuild, 4.66.0 for the previous one;
any 4.x works. brotli is required for --flavor=woff2; brotli is what actually
compresses the CFF data to ~200x smaller)

  python -m fontTools.subset NotoSansSC-Black.otf \
      --text-file=subset-chars.txt \
      --flavor=woff2 \
      --layout-features='' \
      --name-IDs='*' \
      --name-languages='*' \
      --output-file=display-900.woff2

  --text-file   subset-chars.txt next to this README = the exact character
                string that went in (359 chars, 885 bytes, UTF-8, no BOM; note
                it starts with a single space, which is intentional - see below)
  --layout-features=''   drops GSUB/GPOS lookups; headings are not shaped.
                Side effect to know about: this also drops the Latin 'kern'
                feature, so display strings set in this face are NOT kerning-
                adjusted ("Terms and Conditions" is +10.7 px wider than the
                original at 120 px, i.e. +0.8%). CJK is unaffected (CJK fonts
                do not kern by default). If you want kerning back, build with
                --layout-features='kern' instead: that variant was tested at
                49,060 bytes (+1,164 B) for this 346-char set and renders every
                tested heading string pixel-identically to the original OTF.
                Everything else in this README is about the shipped 47,896 B
                build.

  KEEP THE HINTS. Do NOT add --no-hinting: stripping the CFF stem hints makes
  FreeType auto-hint the glyphs, which snaps stems across the curve joins and
  carves visible holes into the diagonals of 緋, the 心 of 想 and the 捺 of 天 —
  but only at small device sizes (every 1x screen and narrow retina viewports),
  so a 3x screenshot hides the bug. The first shipped build had --no-hinting and
  rendered broken; every build after that keeps the hints (this one included)
  and is clean from 1x to 3x. Keeping the hints costs ~3.7 KB (for the 118-char
  set: 14,188 B without hints vs 17,844 B with hints; the same trade applies
  here). Verified for this file: all 359 glyphs still carry their hintmasks
  (816 hintmask ops in both the shipped file and the source OTF, i.e. an
  identical hint/op skeleton), while a --no-hinting build has 0.
  --name-IDs='*'         keeps the OFL text (licence compliance)

HOW subset-chars.txt WAS DERIVED
--------------------------------
Tool: C:\Users\Tenshi\Documents\GitHub\.site-tools\font-fix2\extract2.py
(stdlib html.parser; run it with Python 3, no third-party packages)

It parses every *.html in the repo (10 files today, plus the two encrypted
vault-src pages when they are present):
  404.html
  index.html, template/my_template.html
  about-us/index.html, about-us/vault-src.html
  contact-us/index.html
  download/index.html, download/vault-src.html
  privacy-policy/index.html
  terms-and-conditions/index.html
  tools/index.html, tools/cellCalculator/index.html

and collects characters that occur inside display-size elements:
  * every <h1>, <h2> and <h3> text
  * any element whose class contains one of
      mega, sec__title, sec__name, sec__num, pagehead__title, nf__code,
      stat__num, stat__label, plate__tag, tile__title, sec__intro,
      vault__title, title
    (class token "mega__latin" is skipped: that element is --font-mono, not
    the display face)
Then it adds the full ASCII printable range, the punctuation listed under
CHARACTER SET, and force-adds the strings
      緋想天Tools   404   Hisou Tenshi   比那名居天子   下载   关于   資源
      手机背景   PC
(the last few cover /about-us/ and /download/, which were encrypted when the
first subset was built and are readable now; harmless if unused).

The space U+0020 is included on purpose: it occurs inside "Hisou Tenshi",
"Privacy Policy" and "8 部 玩过游戏", and without it those lines would split
into custom-font words joined by a fallback-font space.

The previous subset-chars.txt is read first and unioned into the result, so
re-running the extractor can never drop a character the shipped font already
covers. This matters: the pages are edited by other people while the font is
being rebuilt, and 5 characters (幻 解 输 郷 锁) only surfaced when a second,
independent regex cross-check was run over the same HTML (輸 and 鎖 belong to
"输密码解锁", so the font would otherwise have fallen back on the vault gate).
If a heading changes later, just re-run this script and rebuild.

The result is deduplicated and sorted by code point, then written as one
UTF-8 line with no BOM and no trailing newline.

TO EXTEND THE SET (new heading with a new character)
----------------------------------------------------
  1. append the character(s) to subset-chars.txt (order does not matter, but
     keep the leading space), or just re-run extract2.py if the new text is
     already in the HTML
  2. re-run the fontTools command above against NotoSansSC-Black.otf
     (re-download from the Source URL if it is gone)
  3. verify:  python -c "from fontTools.ttLib import TTFont; f=TTFont('display-900.woff2'); print(len(f.getGlyphOrder()), len(f.getBestCmap()), f['OS/2'].usWeightClass, f['name'].getDebugName(4))"
     and check that every character of subset-chars.txt is in f.getBestCmap()
  4. rebuild and confirm the file is still under 60 KB

  Characters OUTSIDE this subset simply fall back to the next family in
  --font-display, so nothing breaks; it just looks thinner for that glyph.

USAGE (already wired in this repo — static/css/root.css:182-197)
---------------------------------------------------------------
  static/css/root.css line 53 puts "HST Display" first in --font-display,
  and the face is declared as:

    @font-face {
        font-family: "HST Display";
        src: url("../fonts/display-900.woff2?v=47677276") format("woff2");
        font-weight: 900;
        font-style: normal;
        font-display: block;
    }

  font-display: block, NOT swap. With swap, the browser paints the fallback
  face immediately and swaps to HST Display whenever the 50 KB font arrives;
  on macOS the fallback is PingFang SC Semibold (~600) because style.css sets
  font-synthesis-weight: none, so the first paint looks visibly lighter than
  the final one — the "先出文字再跳变成雷霆大字" flash. block keeps display
  text invisible during the block period instead, so the first paint of a
  heading is already the heavy face.

  THE PRELOAD URL MUST MATCH THE CSS URL EXACTLY (including ?v=...). Every
  page has

    <link rel="preload" href="/static/fonts/display-900.woff2?v=47677276"
          as="font" type="font/woff2" crossorigin>

  If the two differ, the preload is downloaded and discarded, the CSS then
  fetches the font again seconds later, and the block period is spent waiting
  for a request that only started after the stylesheet parsed. That was the
  other half of the jump: preload used a stale hash (fd3ab177) while root.css
  pointed at e4c59ec4, producing two 47 KB downloads ~4 s apart.

  NEVER hand-write the ?v= in root.css. Leave the url() without a query and
  run `node scripts/stamp-assets.mjs`; it fills in every ?v= in HTML and CSS
  from the file contents, so the preload and the @font-face URL can never
  drift apart again (that drift is exactly what broke the preload). The
  purge-cloudflare-cache workflow runs the same script with --check and fails
  the deploy if any URL is stale, so after touching an asset always run:

    node scripts/stamp-assets.mjs   # rewrite in place
    node scripts/stamp-assets.mjs --check

  One quirk worth knowing: the stamper hashes files after a UTF-8 round-trip,
  which is fine for text but not for a binary woff2 — so the ?v= it assigns
  the font (47677276) is NOT the font's SHA-256 (3402f296...). Do not compute
  the ?v= by hand; let the script own it.

  The relative url() is intentional: the stylesheet lives in static/css/, so
  ../fonts/ resolves to static/fonts/ regardless of whether the site is
  served from the domain root or from a project sub-path. Give display
  elements font-weight: 900 (and preferably font-synthesis: none) so the
  browser picks this face rather than synthesising. Note that with a single
  900 face, a rule saying font-weight: 700 (as .stat__num does) still gets the
  900 face, because style.css sets font-synthesis-weight: none — that is why
  the stat numbers are heavy.

VERIFICATION OF THIS BUILD (2026-11-12, macOS 26.7.3, headless Chrome
157.0.8103.51, fontTools 4.51.0)
--------------------------------------------------------------------------
  Coverage / subset
  * fontTools: name ID 4 = "Noto Sans SC Black", 367 glyphs, 359 cmap
    entries, usWeightClass 900, name IDs 13/14 still contain the OFL text.
  * all 359 characters of subset-chars.txt resolve through getBestCmap();
    0 missing in the subset, 0 missing in the source OTF.
  Hints
  * all 359 glyphs carry hintmasks: 816 hintmask ops in both the source OTF
    and this file (identical op/hint skeleton; a --no-hinting build has 0).
    This is what keeps 緋 / 想 / 天 clean at 1x.
  Rendered coverage (the reported bug)
  * every leaf element whose computed font-family contains "HST Display" on
    all nine pages (23 elements) was checked with
    CSS.getPlatformFontsForNode at deviceScaleFactor 1 AND 2: every glyph of
    every element reports family "Noto Sans SC Black", isCustomFont true,
    and 0 glyphs fall back. Text checked includes 平时折腾的玩具, 造过的轮子,
    私藏传送门, 施工痕迹, 全人類の緋想天、比那名居天子, 緋想天Tools,
    浓度与体积计算器.
  * before/after of the reported heading at 1x: before, 平 时 折 腾 rendered
    in PingFang SC Semibold while 的 玩 具 stayed Noto Sans SC Black (the
    half-light heading in the bug report); after, all seven glyphs are the
    same heavy face.
  Fallback flash (the "先出文字再跳变" bug)
  * with request interception holding the font back 2.5 s, the heading region
    paints 0 ink while document.fonts is "loading", then paints the heavy
    glyphs the moment the face loads — font-display: block never shows a
    fallback frame. Same result for #heroTitle (緋想天 at 200 px): blank
    during the delay, heavy immediately after.
  * the network log now shows exactly ONE font request. The old build made
    two (?v=fd3ab177 from the preload, ?v=e4c59ec4 from root.css) ~4 s apart.
  * under Chrome throttling at 400 kbps / 200 ms latency the font request
    starts at 294 ms, together with root.css; the old live build started it
    at 3486 ms and again at 9402 ms, and first-contentful-paint was 9724 ms
    vs 6104 ms. The remaining FCP cost is the render-blocking Google Fonts
    @import on style.css line 1 — a separate issue, not this font.
  Residual risk
  * font-display: block hides display text for at most ~3 s; on a first
    visit over a link slower than ~15 KB/s the font can land after the block
    period and one swap frame becomes visible. Repeat visits come from the
    4 h cache and are unaffected.
  Safari
  * not script-verified this round: safaridriver needs Safari's "Allow
    remote automation" setting enabled manually. The fix mechanism itself is
    engine-independent (coverage is in the font file, block is standard CSS),
    so Safari should behave like Chrome; verify by hand before closing the
    macOS issue.

VERIFICATION OF THE 346-CHARACTER BUILD (2026-10-31, Windows machine, headless
Chrome + fontTools 4.66.0) — kept as history
---------------------------------------------------------------------------
  Coverage
  * fontTools: name ID 4 = "Noto Sans SC Black", 347 glyphs, 346 cmap
    entries, usWeightClass 900, name ID 13 still contains the OFL text.
  * all 346 characters of subset-chars.txt resolve through getBestCmap();
    0 missing in the subset, 0 missing in the source OTF, 0 blank glyphs
    (checked with a BoundsPen; U+0020 is blank by design).
  Hints
  * for all 346 characters the decompiled Type2 charstring has the same
    op-code / hintmask skeleton as the source OTF (numbers differ only where
    the subsetter renumbered subroutines); hintmask ops 763 in source, 763 in
    this file; a --no-hinting control build has 0.
  1x visual (deviceScaleFactor 1, the case where the old bug showed)
  * Chrome fetched /static/fonts/display-900.woff2 (200, 47,896 bytes),
    document.fonts.check('900 40px "HST Display"') === true, one FontFace
    report "loaded", no failed requests.
  * CSS.getPlatformFontsForNode: every glyph of every .stat__num on the
    homepage (250 / 15 / 8 / 4) reported familyName "Noto Sans SC Black",
    isCustomFont true; each of the ten digits 0-9 rendered in its own span
    also reported custom (so 8 and 9 are no longer falling back); .mega
    (緋想天 at 200 px) reported custom for all 3 glyphs.
  * The decrypted /download/ vault heading "输密码解锁" (.vault__title,
    28 px, weight 900) reported familyName "Noto Sans SC Black",
    isCustomFont true, glyphCount 5 (all five glyphs); screenshots
    vault-title-1x.png and vault-gate-1x.png.
  * .stat__label is --font-mono body text (9.5 px), deliberately system.
  * Screenshots: .site-tools/font-fix2/stats-1x.png (the real stats row,
    all four numbers equally heavy), probe-1x.png (digits 0-9 at 34 and 64 px
    plus 緋想天 at 96 and 200 px in one 1440 px viewport), iso-d34-1x.png /
    iso-d64-1x.png (digits, isolated page) and iso-t96-1x.png /
    iso-t200-1x.png (緋想天, isolated page).
  Fidelity vs the untouched source OTF
  * same Chrome, subset woff2 vs source OTF, full-page charset rows at 32 px:
    344 of 346 characters pixel-identical; the only two that differ are the
    plain ASCII quotes " and ' — there the subset draws the font's own quote
    glyph while Chrome's @font-face render of the 8.8 MB source OTF falls
    back for them, i.e. the subset is the correct one.
  * strings "緋想天" at 96 px and "0123456789" at 34 px: 0 differing pixels
    against the source OTF in the same Chrome; at 200 px: 5 pixels with a
    1/255 delta.
  * MAXDELTA vs a Pillow render of the source OTF at 34/48/64/96 px for
    "0123456789" and 96/200/320 px for "緋想天": no extra enclosed white
    regions ("holes") in the Chrome render, ink-pixel delta within 1.5%.
    (One 317 px² enclosed counter in 緋 at exactly 96 px is also present when
    Chrome renders the ORIGINAL un-subsetted OTF, so it is a FreeType hinting
    quirk of the source font at that one size, not a subset artefact.)

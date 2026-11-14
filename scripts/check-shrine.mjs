#!/usr/bin/env node
/* Structural regression checks for all public routes; no external requests. */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const routes = ['index.html', 'about-us/index.html', 'contact-us/index.html', 'tools/index.html', 'tools/cellCalculator/index.html', 'download/index.html', 'privacy-policy/index.html', 'terms-and-conditions/index.html', 'sites/index.html', 'changelog/index.html', '404.html'];
const html = new Map(routes.map(file => [file, readFileSync(path.join(root, file), 'utf8')]));
const fail = [];
const danmaku = createRequire(import.meta.url)('./danmaku-source.cjs');
const works = Object.entries(danmaku.presets).filter(([key])=>key!=='home').map(([,x])=>x.game);
if (works.length !== routes.length-1 || new Set(works).size !== works.length) fail.push('Danmaku: active routes must use distinct STG works; Home stays disabled');
const activeClips=JSON.parse(readFileSync(path.join(root,'static/data/danmaku.json'),'utf8'));
if(activeClips.items.home?.enabled!==false)fail.push('Home must not have an active danmaku clip');
const seven = danmaku.build('terms');
if (seven.preset.spell !== '「七人の一寸法師」' || seven.bullets.filter(b => b.shape === 'option').length !== 7) fail.push('Terms: expected central emitter and six options');
const pure = danmaku.build('privacy');
if (!pure.bullets.some(b => b.shape === 'rice') || new Set(pure.bullets.filter(b => b.shape === 'ring').map(b => b.color)).size < 2) fail.push('Privacy: missing independent rice and red/blue ring layers');
for (const key of Object.keys(danmaku.presets)) {
 const effect = danmaku.build(key);
 if (effect.duration < 6 || (effect.bullets.length < 80 && !effect.beams.length)) fail.push(`Danmaku ${key}: incomplete effect`);
 for (const bullet of effect.bullets) {
  if (bullet.start + bullet.life > effect.duration) fail.push(`Danmaku ${key}: effect outlives cleanup`);
  const p = bullet.motion(bullet.life / 2);
  if (![p.x, p.y, p.angle].every(Number.isFinite)) fail.push(`Danmaku ${key}: invalid trajectory`);
 }
}
const ids = new Map();
for (const [file, text] of html) {
 const found = [...text.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
 ids.set(file, new Set(found));
 if (new Set(found).size !== found.length) fail.push(`${file}: duplicate element ID`);
 if ((text.match(/<h1\b/g) || []).length !== 1) fail.push(`${file}: expected one h1`);
 if (!text.includes('id="themeAutoBtn"') || !text.includes('/static/js/shrine.js')) fail.push(`${file}: missing shared interactions`);
 if (!text.includes('/static/js/danmaku.js')) fail.push(`${file}: missing page-specific danmaku`);
}
for (const [file, text] of html) {
 for (const [, raw] of text.matchAll(/\bhref="([^"]+)"/g)) {
  if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(raw)) continue;
  const u = new URL(raw, 'https://local/' + file);
  let target = decodeURIComponent(u.pathname).replace(/^\//, '');
  if (!target || target.endsWith('/')) target += 'index.html';
  if (!existsSync(path.join(root, target))) { fail.push(`${file}: missing ${raw}`); continue; }
  if (u.hash && ids.has(target) && !ids.get(target).has(decodeURIComponent(u.hash.slice(1)))) fail.push(`${file}: missing anchor ${raw}`);
 }
}
const home = html.get('index.html');
const profile = home.match(/<section\b[^>]*id="profile"[\s\S]*?<\/section>/)?.[0] || '';
if ((profile.match(/class="chip"/g) || []).length !== 32) fail.push('Profile: expected all 32 original tags');
if ((profile.match(/role="listitem"/g) || []).length !== 24) fail.push('Profile: expected all 24 original characters');
if (!home.includes('id="skills"') || !home.includes('data-term-input') || !home.includes('id="egg"') || !home.includes('id="pAudio"')) fail.push('Missing protected interactive component');
const manifest = JSON.parse(readFileSync(path.join(root, 'static/data/oracles.json'), 'utf8'));
const expectedPages = Array.from({ length: 132 }, (_, i) => i + 17).filter(page => ![52, 79, 117, 139].includes(page));
if (manifest.count !== 128 || manifest.items.length !== 128) fail.push('Oracle manifest: expected 128 entries');
manifest.items.forEach((item, i) => {
 if (item.number !== i + 1 || item.sourcePage !== expectedPages[i]) fail.push(`Oracle ${i + 1}: invalid source-page mapping`);
 if (!existsSync(path.join(root, item.src.replace(/^\//, '')))) fail.push(`Oracle ${i + 1}: missing WebP`);
});
const directory = html.get('sites/index.html');
if (directory.includes('data-category-filter="全部"')) fail.push('Directory: all-items filter must remain removed');
const logs = JSON.parse(readFileSync(path.join(root, 'static/data/changelog.json'), 'utf8'));
if (logs.length < 15 || (html.get('changelog/index.html').match(/class="goshuin-leaf"/g) || []).length !== logs.length) fail.push('Chronicle: missing records');
if (logs.some(log => Array.from(log.name || '').length !== 4)) fail.push('Chronicle: expected four-character entry names');
if (fail.length) throw new Error(fail.join('\n'));
execFileSync(process.execPath, [path.join(root, 'scripts/render-archives.mjs'), '--check'], { stdio: 'inherit' });
execFileSync(process.execPath, [path.join(root, 'scripts/check-assets.mjs')], { stdio: 'inherit' });
execFileSync(process.execPath, [path.join(root, 'scripts/check-repos.mjs')], { stdio: 'inherit' });
execFileSync(process.execPath, [path.join(root, 'scripts/check-danmaku.mjs')], { stdio: 'inherit' });
console.log(`Shrine verified: ${routes.length} routes, local links and anchors, 32 tags, 24 characters, 128 mapped oracles.`);

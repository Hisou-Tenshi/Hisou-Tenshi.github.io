#!/usr/bin/env node
/* Regression checks for byte-exact, nested and lazy-image asset fingerprints. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const stamp = fileURLToPath(new URL('./stamp-assets.mjs', import.meta.url));
const temp = mkdtempSync(path.join(tmpdir(), 'shrine-assets-'));
const digest = buffer => createHash('sha256').update(buffer).digest('hex').slice(0, 8);
const read = name => readFileSync(path.join(temp, name), 'utf8');
const run = (...args) => execFileSync(process.execPath, [stamp, ...args], { cwd: temp, stdio: 'pipe' });
try {
 for (const folder of ['static/css', 'static/img']) mkdirSync(path.join(temp, folder), { recursive: true });
 writeFileSync(path.join(temp, 'static/img/test.webp'), Buffer.from([0xff, 0x00]));
 writeFileSync(path.join(temp, 'static/css/test.css'), '.hero{background:url("../img/test.webp?v=00000000")}');
 writeFileSync(path.join(temp, 'index.html'), '<link href="/static/css/test.css"><img src="/static/img/test.webp"><img data-src="/static/img/test.webp"><a data-full="/static/img/test.webp">Open</a>');
 run();
 const original = read('index.html');
 const firstHash = digest(Buffer.from([0xff, 0x00]));
 assert.ok(read('static/css/test.css').includes('test.webp?v=' + firstHash));
 assert.equal(original.split('test.webp?v=' + firstHash).length - 1, 3);
 run();
 assert.equal(read('index.html'), original, 'Stamping must be idempotent');
 run('--check');
 // Both byte sequences decode to the same UTF-8 replacement character. Their
 // raw resource fingerprints, and the containing CSS fingerprint, must differ.
 writeFileSync(path.join(temp, 'static/img/test.webp'), Buffer.from([0xfe, 0x00]));
 assert.throws(() => run('--check'), 'A changed nested asset must be detected');
 run();
 const secondHash = digest(Buffer.from([0xfe, 0x00]));
 assert.notEqual(secondHash, firstHash);
 assert.ok(read('static/css/test.css').includes('test.webp?v=' + secondHash));
 assert.notEqual(read('index.html'), original, 'Nested asset changes must invalidate CSS in HTML');
 run('--check');
 console.log('Asset fingerprints verified: raw bytes, nested cache updates, lazy-image URLs and idempotence.');
} finally {
 rmSync(temp, { recursive: true, force: true });
}

// Exercise the real purge script without credentials, network access or waits.
const batches = [];
const changed = Array.from({ length: 245 }, (_, i) => 'static/test-' + i + '.svg').concat('index.html');
const purge = readFileSync(new URL('./purge-cloudflare.mjs', import.meta.url), 'utf8')
 .replace(/^#![^\n]*\n/, '')
 .replace(/^import .*;\r?\n/gm, '');
await runInNewContext('(async function(){' + purge + '\n})()', {
 process: {
  env: { CLOUDFLARE_API_TOKEN: 'test-only', CLOUDFLARE_ZONE_ID: 'fixture', BASE_URL: 'https://test.invalid', CHANGED: changed.join('\n') },
  exit(code) { throw Error('Unexpected purge exit: ' + code); },
 },
 fetch: async (_url, init) => {
  batches.push(JSON.parse(init.body).files);
  return { ok: true, json: async () => ({ success: true }) };
 },
 console: { log() {}, error(message) { throw Error(message); } },
 setTimeout(callback) { callback(); },
});
assert.equal(batches.flat().length, changed.length, 'Purge must not truncate large commits');
assert.ok(batches.every(batch => batch.length <= 30));
assert.equal(batches[0][0], 'https://test.invalid/', 'Page HTML must be purged first');
console.log('Cache purge verified: 246 paths retained, pages first, bounded batches.');

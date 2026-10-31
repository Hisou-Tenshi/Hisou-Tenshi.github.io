#!/usr/bin/env node
/**
 * Build an encrypted "vault" payload for the site.
 *
 *   node vault_build.mjs --src about-us/vault-src.html --out about-us/vault.json
 *   (password is read from $VAULT_PASSWORD, or --password "…")
 *
 * Scheme (browser side in static/js/vault.js):
 *   key = PBKDF2-SHA256(password, salt, 210000) -> 256-bit AES-GCM key
 *   ct  = AES-256-GCM(key, iv, utf8(html))
 *
 * The plaintext source MUST NOT be committed — put it in a directory that is
 * listed in .gitignore (default: <page>/vault-src.html).
 */
import fs from 'node:fs';
import path from 'node:path';
import { webcrypto as crypto } from 'node:crypto';

const ITER = 210000;
const enc = new TextEncoder();

function arg(name, fallback = null) {
  const i = process.argv.indexOf('--' + name);
  if (i === -1) return fallback;
  return process.argv[i + 1] ?? fallback;
}

const src = arg('src');
const out = arg('out');
const password = arg('password') || process.env.VAULT_PASSWORD || '';

if (!src || !out) {
  console.error('usage: node vault_build.mjs --src <plaintext.html> --out <vault.json>');
  process.exit(2);
}
if (!password) {
  console.error('missing password: set $VAULT_PASSWORD or pass --password');
  process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const html = fs.readFileSync(src, 'utf8');
  if (/<script|<style|<!DOCTYPE|<html/i.test(html)) {
    console.error('refusing: source looks like a full document, not a fragment');
    process.exit(1);
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(html));

  const b64 = (buf) => Buffer.from(new Uint8Array(buf)).toString('base64');
  const payload = {
    v: 1,
    cipher: 'AES-GCM-256',
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iter: ITER },
    salt: b64(salt),
    iv: b64(iv),
    ct: b64(ct),
    // Shown in the browser console only — never rendered.
    built: 'vault_build.mjs',
  };

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload), 'utf8');

  const roundtrip = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  const ok = new TextDecoder().decode(roundtrip) === html;
  console.log(
    `${path.basename(src)} ${html.length} B -> ${out} ${JSON.stringify(payload).length} B  (b64 x${(JSON.stringify(payload).length / html.length).toFixed(2)})  decrypt-ok=${ok}`
  );
  if (!ok) process.exit(1);
  await sleep(0);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Content-hash stamping for static asset URLs.
 *
 *   /static/css/style.css  ->  /static/css/style.css?v=1a2b3c4d
 *
 * The hash is the first 8 hex chars of sha256(contents). When a file changes its
 * URL changes, so Cloudflare's edge cache (and browsers) treat it as a brand new
 * resource — stale JS/CSS can never be served after a deploy.
 *
 * Idempotent: an existing ?v=… is replaced, not appended.
 * Covers: HTML attributes src/href/srcset/imagesrcset, and url(...) inside CSS.
 *
 *   node scripts/stamp-assets.mjs            # rewrite in place
 *   node scripts/stamp-assets.mjs --check    # exit 1 if anything is stale
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const ROOT = process.cwd();
const SKIP = new Set(['.git', 'node_modules', '.site-tools']);

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		if (SKIP.has(name)) continue;
		const p = join(dir, name);
		const st = statSync(p);
		if (st.isDirectory()) walk(p, out);
		else out.push(p);
	}
	return out;
}

const cache = new Map();
function hashOf(absPath) {
	if (cache.has(absPath)) return cache.get(absPath);
	let h;
	try {
		let buf = readFileSync(absPath);
		// A CSS file is itself stamped (its url() refs carry ?v=…), so hash the
		// canonical form: otherwise every run would change every CSS hash.
		if (absPath.endsWith('.css')) {
			buf = Buffer.from(buf.toString('utf8').replace(/\?v=[0-9a-f]{8}/g, ''), 'utf8');
		}
		h = createHash('sha256').update(buf).digest('hex').slice(0, 8);
	} catch {
		h = null;
	}
	cache.set(absPath, h);
	return h;
}

/** resolve a URL that starts with / to a file on disk */
function diskPathFor(urlPath) {
	const clean = decodeURI(urlPath.split('?')[0]);
	return join(ROOT, clean.replace(/^\//, ''));
}

function stampUrl(url) {
	if (!url.startsWith('/static/')) return url;
	const [path] = url.split('?');
	const file = diskPathFor(path);
	const h = hashOf(file);
	return h ? `${path}?v=${h}` : url;
}

/** srcset / imagesrcset: "a.webp 320w, b.webp 768w" */
function stampSrcset(value) {
	return value
		.split(',')
		.map((part) => {
			const m = part.trim().match(/^(\S+)(\s+.+)?$/);
			if (!m) return part;
			return stampUrl(m[1]) + (m[2] || '');
		})
		.join(', ');
}

const ATTR = /(\s(?:src|href|content)=")(\/static\/[^"]*)(")/g;
const SRCSET = /(\s(?:srcset|imagesrcset)=")([^"]*)(")/g;

function stampHtml(text) {
	text = text.replace(SRCSET, (_, a, v, z) => a + stampSrcset(v) + z);
	text = text.replace(ATTR, (_, a, v, z) => {
		if (!v.startsWith('/static/')) return _; // data: / remote / anchors
		return a + stampUrl(v) + z;
	});
	return text;
}

function stampCss(text, cssFile) {
	return text.replace(/url\(\s*(['"]?)(\.[^'")]+|[^'")]+)\1\s*\)/g, (all, q, ref) => {
		if (/^(data:|https?:|\/\/)/.test(ref)) return all;
		const abs = ref.startsWith('/') ? diskPathFor(ref) : join(dirname(cssFile), ref);
		const h = hashOf(abs);
		if (!h) return all;
		const [p] = ref.split('?');
		return `url(${q}${p}?v=${h}${q})`;
	});
}

const files = walk(ROOT);
const targets = files.filter((f) => /\.(html|css)$/.test(f));
const check = process.argv.includes('--check');
let changed = 0;
const stampReport = [];

for (const file of targets) {
	const before = readFileSync(file, 'utf8');
	const after = file.endsWith('.css') ? stampCss(before, file) : stampHtml(before);
	if (after !== before) {
		changed++;
		const n = (before.match(/\?v=[0-9a-f]{8}/g) || []).length;
		stampReport.push(relative(ROOT, file));
		if (!check) writeFileSync(file, after);
	}
	// validate every /static/ reference resolves
	const refs = [...after.matchAll(/(?:src|href|srcset|imagesrcset)="(\/static\/[^"]*)"/g)];
	for (const r of refs) {
		for (const piece of r[1].split(',')) {
			const url = piece.trim().split(/\s+/)[0];
			if (!url) continue;
			if (!hashOf(diskPathFor(url))) {
				console.error(`MISSING ${relative(ROOT, file)} -> ${url}`);
				process.exitCode = 2;
			}
		}
	}
}

if (check) {
	if (changed) {
		console.error(`stale asset URLs in ${changed} file(s):\n  ${stampReport.join('\n  ')}`);
		console.error('run: node scripts/stamp-assets.mjs');
		process.exit(1);
	}
	console.log('asset URLs are up to date');
} else {
	console.log(`stamped ${changed} file(s)`);
}

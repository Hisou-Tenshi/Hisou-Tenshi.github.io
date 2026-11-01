#!/usr/bin/env node
/* Verify that the Projects tiles rendered into index.html still match the
 * curated copy in scripts/fetch-repos.mjs — the authoritative source that the
 * hourly data workflow writes into static/data/repos.json.
 *
 *   node scripts/check-repos.mjs      # exits 1 on drift
 *
 * The tiles are server-rendered as a no-JS fallback, but static/js/script.js
 * re-renders them from repos.json at runtime, so a copy edit made only in
 * index.html silently loses. Edit the ALLOW list and mirror it into the HTML.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptSrc = readFileSync(path.join(ROOT, 'scripts/fetch-repos.mjs'), 'utf8');
const html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const allow = [...scriptSrc.matchAll(/name:\s*'([^']+)',\s*\n\s*icon:\s*'[^']*',\s*\n\s*desc:\s*'([^']+)'/g)].map(
	([, name, desc]) => ({ name, desc })
);
if (!allow.length) {
	console.error('check-repos: could not parse the ALLOW list');
	process.exit(2);
}

/* Collect the inner HTML of every <span class="tile__desc">, walking nested tags. */
function descBlocks(src) {
	const out = [];
	const marker = '<span class="tile__desc">';
	let i = 0;
	for (;;) {
		const start = src.indexOf(marker, i);
		if (start < 0) break;
		let p = start + marker.length;
		let depth = 1;
		while (p < src.length && depth > 0) {
			const nextOpen = src.indexOf('<span', p);
			const nextClose = src.indexOf('</span>', p);
			if (nextClose < 0) break;
			if (nextOpen >= 0 && nextOpen < nextClose) {
				depth++;
				p = nextOpen + 5;
			} else {
				depth--;
				p = nextClose + 7;
			}
		}
		out.push(src.slice(start + marker.length, p - 7).replace(/<[^>]+>/g, ''));
		i = p;
	}
	return out;
}

const titles = [...html.matchAll(/<span class="tile__title">([^<]+)<\/span>/g)].map(([, t]) => t);
const descs = descBlocks(html);
if (titles.length !== descs.length) {
	console.error(`check-repos: ${titles.length} titles but ${descs.length} descriptions in index.html`);
	process.exit(2);
}

let bad = 0;
const rendered = new Map(titles.map((t, i) => [t, descs[i].replace(/\s+/g, ' ').trim()]));
for (const { name, desc } of allow) {
	const got = rendered.get(name);
	if (got === undefined) {
		console.error(`missing tile: ${name}`);
		bad++;
	} else if (got !== desc) {
		console.error(`drift: ${name}\n  index.html  : ${got}\n  fetch-repos : ${desc}`);
		bad++;
	}
}
if (bad) {
	console.error(`\n${bad} tile(s) out of sync — edit scripts/fetch-repos.mjs, then mirror the same text into index.html`);
	process.exit(1);
}
console.log(`repos in sync (${allow.length} tiles)`);

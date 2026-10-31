#!/usr/bin/env node
/* ==========================================================================
   fetch-bangumi.mjs — refresh static/data/bangumi.json from the Bangumi API
   --------------------------------------------------------------------------
   Reads the PUBLIC collection totals of one Bangumi user and writes them into
   a tiny JSON file the static homepage hydrates from.

   Token resolution:
     process.env.BANGUMI_API            (GitHub Actions: repository secret)
     <repo>/.env  ->  BANGUMI_API = ... (local runs only; .env is git-ignored)

   The v0 collections endpoint needs BOTH an `Authorization` header and a
   descriptive `User-Agent`; it answers with `{ total, data: [...] }` and we
   only ever read `total`, so `limit=1` keeps the payload tiny.

   Mapping (subject_type / type):
     anime        2 / 2  动画 · 看过
     anime-doing  2 / 3  动画 · 在看
     game         4 / 2  游戏 · 玩过
     book         1 / 2  书籍 · 读过

   Failure policy: if ANY request fails we exit 0 WITHOUT touching the file,
   so a flaky API never blanks out numbers that are already published.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'static', 'data', 'bangumi.json');
const ENV_FILE = path.join(ROOT, '.env');

const USER = '1009342';
const API = 'https://api.bgm.tv';
const UA = 'Hisou-Tenshi.github.io/1.0 (+https://github.com/Hisou-Tenshi/Hisou-Tenshi.github.io)';
const TIMEOUT = 20000;

/** stats key -> [subject_type, collection type] */
const MAP = [
	['anime', 2, 2],
	['anime-doing', 2, 3],
	['game', 4, 2],
	['book', 1, 2]
];

/** Pull BANGUMI_API out of a dotenv-ish file. `BANGUMI_API=…` and `BANGUMI_API = …`. */
function parseEnv(text) {
	for (const raw of String(text).replace(/^\uFEFF/, '').split(/\r?\n/)) {
		const line = raw.trim();
		if (!line || line[0] === '#') continue;
		const m = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
		if (!m || m[1] !== 'BANGUMI_API') continue;
		let v = m[2].trim();
		if (v.length >= 2 && ((v[0] === '"' && v[v.length - 1] === '"') || (v[0] === "'" && v[v.length - 1] === "'"))) {
			v = v.slice(1, -1);
		} else {
			v = v.replace(/\s+#.*$/, '').trim();
		}
		return v || null;
	}
	return null;
}

async function resolveToken() {
	const fromEnv = (process.env.BANGUMI_API || '').trim();
	if (fromEnv) return fromEnv;
	try {
		const token = parseEnv(await readFile(ENV_FILE, 'utf8'));
		if (token) return token;
	} catch {
		/* no .env (CI) — fine */
	}
	return null;
}

async function collectionTotal(token, subjectType, type) {
	const url = API + '/v0/users/' + USER + '/collections?subject_type=' + subjectType + '&type=' + type + '&limit=1';
	const res = await fetch(url, {
		headers: {
			Authorization: 'Bearer ' + token,
			'User-Agent': UA,
			Accept: 'application/json'
		},
		signal: AbortSignal.timeout(TIMEOUT)
	});
	if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
	const body = await res.json();
	if (!body || typeof body.total !== 'number' || !Number.isFinite(body.total)) {
		throw new Error('missing numeric `total` for ' + url);
	}
	return body.total;
}

async function main() {
	const token = await resolveToken();
	if (!token) {
		console.error('[bangumi] no BANGUMI_API token (env or .env) — nothing fetched, file left untouched');
		return;
	}

	const stats = {};
	for (const [key, subjectType, type] of MAP) {
		stats[key] = await collectionTotal(token, subjectType, type);
		console.log('[bangumi] ' + key + ' = ' + stats[key] + ' (subject_type=' + subjectType + ', type=' + type + ')');
	}

	const payload = {
		updated: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
		user: USER,
		url: 'https://bgm.tv/user/' + USER,
		stats
	};
	await writeFile(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
	console.log('[bangumi] wrote ' + path.relative(ROOT, OUT) + ' @ ' + payload.updated);
}

main().catch((err) => {
	console.error('[bangumi] skipped, keeping existing file:', err && err.message ? err.message : err);
	process.exitCode = 0;
});

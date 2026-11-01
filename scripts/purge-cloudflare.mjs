#!/usr/bin/env node
/**
 * Purge the URLs that a push actually changed from the Cloudflare edge cache.
 *
 * With content-hashed asset URLs (scripts/stamp-assets.mjs) a changed file gets a
 * brand-new URL, so only the HTML documents themselves need purging — but this
 * script purges every changed path anyway, plus the HTML of changed pages.
 *
 * env: CLOUDFLARE_API_TOKEN (Zone → Cache Purge → Purge)
 *      CLOUDFLARE_ZONE_ID
 *      BASE_URL   (default https://tenshi.qzz.io)
 *      CHANGED    newline-separated repo paths (default: read from stdin)
 */
import { execSync } from 'node:child_process';

const token = process.env.CLOUDFLARE_API_TOKEN;
const zone = process.env.CLOUDFLARE_ZONE_ID;
const base = (process.env.BASE_URL || 'https://tenshi.qzz.io').replace(/\/$/, '');

if (!token || !zone) {
	console.error('CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID are not set — skipping purge');
	process.exit(0);
}

function changedPaths() {
	if (process.env.CHANGED) return process.env.CHANGED.split(/\r?\n/).filter(Boolean);
	try {
		// files touched by the push (HEAD vs its parent); root commits diff against the empty tree
		const out = execSync('git diff --name-only HEAD^ HEAD', { encoding: 'utf8' });
		return out.split(/\r?\n/).filter(Boolean);
	} catch {
		try {
			const out = execSync('git ls-tree -r --name-only HEAD', { encoding: 'utf8' });
			return out.split(/\r?\n/).filter(Boolean);
		} catch {
			return [];
		}
	}
}

/** repo path → public URL */
function urlFor(path, html) {
	if (path === 'index.html') return `${base}/`;
	if (path.endsWith('/index.html')) return `${base}/${path.slice(0, -'index.html'.length)}`;
	if (path.endsWith('.html')) return `${base}/${path}`;
	return `${base}/${path}`;
}

const paths = changedPaths().filter((p) => /\.(html|css|js|json|svg|woff2?|webp|png|jpe?g|mp3)$/i.test(p));
const urls = [...new Set(paths.map((p) => urlFor(p)))];
// the HTML directory of any changed page is what actually gets edge-cached
for (const p of paths.filter((x) => x.endsWith('.html'))) urls.push(urlFor(p));

if (!urls.length) {
	console.log('nothing to purge');
	process.exit(0);
}

const list = [...new Set(urls)].slice(0, 200);
console.log(`purging ${list.length} URL(s):`);
for (const u of list) console.log('  ' + u);

const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
	method: 'POST',
	headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
	body: JSON.stringify({ files: list })
});
const body = await res.json().catch(() => ({}));
if (!res.ok || body.success === false) {
	console.error('purge failed', res.status, JSON.stringify(body.errors || body).slice(0, 500));
	process.exit(1);
}
console.log('purged ✓');

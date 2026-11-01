#!/usr/bin/env node
/* ==========================================================================
   fetch-repos.mjs — refresh static/data/repos.json for the curated repo tiles
   --------------------------------------------------------------------------
   The ORDER, the display NAMES, the ICONS and the DESCRIPTIONS are curated
   here on purpose (they are hand-written copy, not derived from the GitHub
   API). Only the volatile fields are fetched per run:
       stars  <- stargazers_count
       lang   <- language (null for repos with no language)
   and the file-level `updated` stamp moves with them.

   Auth:
       GITHUB_TOKEN set  -> https://api.github.com REST with a bearer token
       otherwise         -> `gh api repos/...` (uses the local gh login)
       plus an unauthenticated REST fallback if neither is usable

   Failure policy: a repo we cannot fetch keeps its previous stars/lang, so a
   bad API day can never blank the file; only the `updated` stamp moves.
   ========================================================================== */

import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'static', 'data', 'repos.json');
const OWNER = 'Hisou-Tenshi';
const TIMEOUT = 20000;
const UA = 'Hisou-Tenshi.github.io/1.0 (+https://github.com/Hisou-Tenshi/Hisou-Tenshi.github.io)';

/* Curated, ordered allow-list. `desc` is final copy — edit it here, not on
   the fetched repo. */
const CURATED = [
	{
		repo: 'SenrenBanka-CN-Text-Extractor',
		name: 'SenrenBanka-CN-Text-Extractor',
		icon: 'text',
		desc: '千恋＊万花 Steam 版的文本提取与简体排版，顺带把 KiriKiri 的 XP3 解包流程跑通了。'
	},
	{
		repo: 'bangumi-sync',
		name: 'bangumi-sync',
		icon: 'sync',
		desc: '用 GitHub Actions 把追番进度同步回 Bangumi，每次运行顺手存一份在看清单。'
	},
	{
		repo: 'weekly-info',
		name: 'weekly-info',
		icon: 'mail',
		desc: 'Journal Club 的周报邮件系统，跑在 Actions 和 Vercel 上，配置加密之后才进仓库。'
	},
	{
		repo: 'ipsc-video-analysis',
		name: 'ipsc-video-analysis',
		icon: 'video',
		desc: '从 iPSC 实验视频里提取机械信号的一套分析方法。'
	},
	{
		repo: 'Calling',
		name: 'Calling',
		icon: 'chat',
		desc: '本地就能跑的 LLM 对话框，带工具 Agent 和文档翻译。'
	},
	{
		repo: 'ACGMN-Grid',
		name: 'ACGMN-Grid',
		icon: 'grid',
		desc: '在 game-grid 基础上改出来的 ACGMN+ 生涯喜好表生成器。'
	},
	{
		repo: 'dsh-whale-desktop-launcher',
		name: 'dsh-whale-desktop-launcher',
		icon: 'whale',
		desc: '给 DeepSeek Harness Web 做的 Windows 桌面启动器插件，带一个鲸鱼娘图标。'
	},
	{
		repo: 'Hisou-Tenshi.github.io',
		name: '本站',
		icon: 'star',
		desc: '你现在看的这个站。纯静态，推上 GitHub Pages 就上线。'
	}
];

function ghApi(repo) {
	return new Promise((resolve, reject) => {
		execFile(
			'gh',
			['api', 'repos/' + OWNER + '/' + repo],
			{ timeout: 30000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 },
			(err, stdout) => {
				if (err) return reject(err);
				try {
					resolve(JSON.parse(stdout));
				} catch (e) {
					reject(e);
				}
			}
		);
	});
}

async function restApi(repo, token) {
	const headers = { 'User-Agent': UA, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
	if (token) headers.Authorization = 'Bearer ' + token;
	const res = await fetch('https://api.github.com/repos/' + OWNER + '/' + repo, {
		headers,
		signal: AbortSignal.timeout(TIMEOUT)
	});
	if (!res.ok) throw new Error('HTTP ' + res.status);
	return res.json();
}

async function repoMeta(repo, token) {
	if (token) return restApi(repo, token);
	try {
		return await ghApi(repo);
	} catch (e) {
		console.warn('[repos] gh api unavailable for ' + repo + ' (' + (e && e.message) + '), trying public REST');
		return restApi(repo, null);
	}
}

function normStars(v) {
	const n = typeof v === 'number' ? v : parseInt(v, 10);
	return Number.isFinite(n) && n >= 0 ? n : 0;
}

function normLang(v) {
	return typeof v === 'string' && v ? v : null;
}

async function readExisting() {
	try {
		return JSON.parse(await readFile(OUT, 'utf8'));
	} catch {
		return null;
	}
}

async function main() {
	const token = (process.env.GITHUB_TOKEN || '').trim();
	const old = await readExisting();
	const oldByRepo = new Map();
	if (old && Array.isArray(old.items)) {
		for (const it of old.items) if (it && it.repo) oldByRepo.set(it.repo, it);
	}

	const items = [];
	for (const entry of CURATED) {
		const prev = oldByRepo.get(entry.repo) || {};
		let stars = prev.stars;
		let lang = prev.lang;
		try {
			const meta = await repoMeta(entry.repo, token);
			stars = normStars(meta && meta.stargazers_count);
			lang = normLang(meta && meta.language);
			console.log('[repos] ' + entry.repo + ' ★' + stars + ' · ' + (lang || '—'));
		} catch (err) {
			console.warn('[repos] failed ' + entry.repo + ': ' + (err && err.message ? err.message : err) + ' — keeping previous values');
			stars = normStars(stars);
			lang = lang === undefined ? null : lang;
		}
		items.push({
			repo: entry.repo,
			name: entry.name,
			lang,
			stars,
			icon: entry.icon,
			desc: entry.desc,
			url: 'https://github.com/' + OWNER + '/' + entry.repo
		});
	}

	/* stars/lang are the only volatile fields; the items array is otherwise
	   curated copy. The `updated` stamp is refreshed on every successful run so
	   the file always reflects the last fetch — bangumi.json is rewritten
	   hourly anyway, so this adds no extra commit churn. */
	const unchanged = Boolean(old && Array.isArray(old.items) && JSON.stringify(old.items) === JSON.stringify(items));
	if (unchanged) {
		console.log('[repos] items unchanged — refreshing the updated stamp only');
	}

	const payload = {
		updated: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
		items
	};
	await writeFile(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
	console.log('[repos] wrote ' + path.relative(ROOT, OUT) + ' @ ' + payload.updated + ' (' + items.length + ' items)');
}

main().catch((err) => {
	console.error('[repos] skipped, keeping existing file:', err && err.message ? err.message : err);
	process.exitCode = 0;
});

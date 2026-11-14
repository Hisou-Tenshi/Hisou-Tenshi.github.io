#!/usr/bin/env node
/* Source JSON -> static HTML; identical renderer is used by live project hydration. */
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url),projects=require('../static/js/project-view.js');
const check=process.argv.includes('--check');
const read=p=>readFileSync(path.join(root,p),'utf8');
const sites=JSON.parse(read('static/data/sites.json')),logs=JSON.parse(read('static/data/changelog.json')),repos=JSON.parse(read('static/data/repos.json')).items;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categories=[...new Set(sites.map(x=>x.category))];
const files=new Map();
function replace(file,name,content){let html=files.get(file)||read(file);const re=new RegExp(`<!-- archive:${name}:start -->[\\s\\S]*?<!-- archive:${name}:end -->`);if(!re.test(html))throw Error('Missing marker: '+name);files.set(file,html.replace(re,()=>`<!-- archive:${name}:start -->\n${content}\n<!-- archive:${name}:end -->`));}
replace('sites/index.html','filters',categories.map((c,i)=>`<button type="button" data-category-filter="${esc(c)}" class="${i===0?'active':''}" aria-pressed="${i===0}" aria-controls="catalogueEntries">${esc(c)}</button>`).join('\n'));
replace('sites/index.html','sites',sites.map((s,i)=>`<a class="catalogue-entry" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" data-cat="${esc(s.category)}"${s.category===categories[0]?'':' hidden'}><img src="${esc(s.icon)}" alt="" width="26" height="26" loading="lazy"><span><strong>${esc(s.name)}</strong><small>${esc(s.description)}</small></span><span class="page-no">${String(i+1).padStart(2,'0')}</span></a>`).join('\n'));
replace('changelog/index.html','logs',logs.map((l,i)=>`<article class="goshuin-leaf"><span class="eyebrow red">奉記</span><time class="date-vertical" datetime="${esc(l.date)}">${esc(l.date)}</time><h2 class="entry-name">${esc(l.name)}</h2><span class="margin-stamp" aria-hidden="true"><span>奉</span><span>記</span><span>修</span><span>繕</span></span><p class="chronicle-note">${esc(l.title)}</p></article>`).join('\n'));
replace('index.html','sites-preview',sites.filter(s=>s.featured).slice(0,5).map(s=>`<a class="mini-row" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(s.name)}</span><small>${esc(s.description)}</small><span aria-hidden="true">↗</span></a>`).join('\n'));
replace('index.html','logs-preview',logs.slice(0,5).map(l=>`<div class="mini-row"><span>${esc(l.name)}</span><time datetime="${esc(l.date)}">${esc(l.date)}</time></div>`).join('\n'));
replace('index.html','projects',projects.render(repos));
files.set('index.html',files.get('index.html').replace(/查看全部 \d+ 条更新记录/, '查看全部 '+logs.length+' 条更新记录'));
for(const [file,value] of files){const clean=s=>s.replace(/\?v=[0-9a-f]{8}/g,'');if(clean(read(file))!==clean(value)){if(check)throw Error(file+' is out of sync. Run node scripts/render-archives.mjs');writeFileSync(path.join(root,file),value);}}
console.log(`Scenes ${check?'verified':'rendered'}: ${sites.length} sites, ${logs.length} records, ${repos.length} projects.`);

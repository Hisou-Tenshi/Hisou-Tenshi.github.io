#!/usr/bin/env node
/* Descriptions live in JSON and the opened spell, not beneath the closed card. */
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const projects=createRequire(import.meta.url)('../static/js/project-view.js');
const allow=[...read('scripts/fetch-repos.mjs').matchAll(/name:\s*'([^']+)',\s*\n\s*icon:\s*'[^']*',\s*\n\s*desc:\s*'([^']+)'/g)].map(([,name,desc])=>({name,desc}));
if(!allow.length)throw Error('Cannot parse project allow list');
const items=JSON.parse(read('static/data/repos.json')).items;
for(const {name,desc} of allow){const item=items.find(x=>x.name===name);if(!item||item.desc!==desc||!item.url)throw Error('Missing or changed project content: '+name);}
const block=read('index.html').match(/<!-- archive:projects:start -->\s*([\s\S]*?)\s*<!-- archive:projects:end -->/)?.[1];
if(block!==projects.render(items))throw Error('Project cards drifted: run node scripts/render-archives.mjs');
if((block.match(/data-project-spell=/g)||[]).length!==items.length||/project-direct|tile__desc/.test(block))throw Error('Expected compact spell cards with details only on opening');
console.log(`Projects verified: ${items.length} spell cards; all descriptions and URLs retained in source JSON.`);

#!/usr/bin/env node
/* Check the actual GIF containers: finite playback, clean disposal, timing and asset hashes. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(path.join(root,p));
const hash=b=>createHash('sha256').update(b).digest('hex').slice(0,12);
const manifest=JSON.parse(read('static/data/danmaku.json'));
if(manifest.sourceHash!==hash(read('scripts/danmaku-source.cjs')))throw Error('GIF geometry changed: regenerate the clips');
if(manifest.rendererHash!==hash(read('scripts/render-danmaku.mjs'))||manifest.encoderHash!==hash(read('scripts/encode-danmaku.py')))throw Error('GIF compiler changed: regenerate the clips');
function inspect(b,{allowLoop=false}={}){
 if(!/^GIF8[79]a$/.test(b.subarray(0,6).toString()))throw Error('Not a GIF');
 const result={width:b.readUInt16LE(6),height:b.readUInt16LE(8),frames:0,durationMs:0,clean:true};
 let o=13+((b[10]&128)?3*(1<<((b[10]&7)+1)):0),delay=0,disposal=0;
 const blocks=()=>{while(o<b.length){const n=b[o++];if(!n)return;o+=n;}throw Error('Truncated GIF');};
 while(o<b.length){
  const type=b[o++];if(type===0x3b)break;
  if(type===0x21){const label=b[o++];if(label===0xf9){const n=b[o++];disposal=(b[o]>>2)&7;delay=b.readUInt16LE(o+1)*10;o+=n+1;}else blocks();}
  else if(type===0x2c){const packed=b[o+8];o+=9;if(packed&128)o+=3*(1<<((packed&7)+1));o++;blocks();result.frames++;result.durationMs+=delay;result.clean&&=disposal===2;}
  else throw Error('Unexpected GIF block '+type);
 }
 if(!allowLoop&&(b.includes(Buffer.from('NETSCAPE2.0'))||b.includes(Buffer.from('ANIMEXTS1.0'))))throw Error('Generated GIF must not loop');
 return result;
}
let total=0,active=0;
if(manifest.items.home?.enabled!==false)throw Error('Home must have no active danmaku');
for(const [key,c] of Object.entries(manifest.items)){
 if(c.enabled===false)continue;
 const m=c.src.match(/^\/static\/img\/shrine\/danmaku\/([a-z]+)\.gif\?v=([a-f0-9]{12})$/);
 if(!m||m[1]!==key)throw Error(key+': unexpected asset path');
 const supplied=c.sourceType==='provided';
 if(c.durationMs!==6400)throw Error(key+': all active clips must share the 6.4s presentation duration');
 const bytes=read(c.src.slice(1).split('?')[0]),actual=inspect(bytes,{allowLoop:supplied});
 if(hash(bytes)!==m[2]||bytes.length!==c.bytes)throw Error(key+': stale content hash');
 if((!supplied&&!actual.clean)||actual.durationMs!==c.durationMs||actual.frames!==c.frames||actual.width!==c.width||actual.height!==c.height)throw Error(key+': invalid disposal, dimensions or timing');
 if(c.centerX!==c.width/2||c.centerY!==c.height/2)throw Error(key+': emission origin must be the bitmap center');
 if(supplied&&createHash('sha256').update(bytes).digest('hex')!==(c.assetSha256||c.sourceSha256))throw Error(key+': supplied GIF derivation hash drifted');
 if(!supplied&&(actual.durationMs!==6400||bytes.length>1.5*1024*1024))throw Error(key+': generated clip exceeds timing or size budget');
 total+=bytes.length;active++;
}
if(active!==10)throw Error('Expected ten active routes with Home disabled');
const player=read('static/js/danmaku.js').toString();
if(/requestAnimationFrame|getContext|createElement\(['"]canvas/.test(player)||!player.includes('new Image'))throw Error('The player must not run the particle renderer');
if(/"home"\s*:/.test(player)||player.includes('--cast-enter-x')||player.includes('is-playing'))throw Error('Home or popup travel leaked into the player');
if(!player.includes('setTimeout(stop,clip.durationMs)'))throw Error('Playback must stop after one supplied/generated clip cycle');
console.log(`Native GIFs verified: ${active} active routes, all 6.4s, Home disabled, centered origins, supplied Tools derivation validated, ${(total/1024/1024).toFixed(2)} MiB total; no popup travel or live canvas.`);

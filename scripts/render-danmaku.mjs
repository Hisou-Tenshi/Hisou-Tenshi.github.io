#!/usr/bin/env node
/* Optional authoring tools: @napi-rs/canvas + Python/Pillow. No browser dependency. */
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(import.meta.url);
const {createCanvas}=require(process.env.DANMAKU_CANVAS_MODULE||'@napi-rs/canvas');
const source=require('./danmaku-source.cjs');
const width=360,height=360,fps=15,frames=96;
const out=path.join(root,'static/img/shrine/danmaku'),manifestPath=path.join(root,'static/data/danmaku.json');
const requested=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');
const keys=(requested||Object.keys(source.presets)).filter(key=>key!=='home'),temporary=mkdtempSync(path.join(os.tmpdir(),'shrine-gif-'));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex').slice(0,12);
const geometryHash=hash(path.join(root,'scripts/danmaku-source.cjs')),rendererHash=hash(fileURLToPath(import.meta.url)),encoderHash=hash(path.join(root,'scripts/encode-danmaku.py'));
const manifest=existsSync(manifestPath)?JSON.parse(readFileSync(manifestPath,'utf8')):{items:{}};
if(manifest.items.home)manifest.items.home.enabled=false;
mkdirSync(out,{recursive:true});
try{
 for(const key of keys){
  if(!source.presets[key])throw Error('Unknown cast '+key);
  if(manifest.items[key]?.sourceType==='provided'){
   const clip=manifest.items[key],file=path.join(out,key+'.gif');
   clip.bytes=readFileSync(file).length;clip.src='/static/img/shrine/danmaku/'+key+'.gif?v='+hash(file);
   console.log('Preserved supplied GIF for '+key+' ('+clip.sourceFile+')');continue;
  }
  const stage=path.join(temporary,key);mkdirSync(stage);const pattern=source.build(key),canvas=createCanvas(width,height),c=canvas.getContext('2d');
  console.log('Rendering '+key+' ('+pattern.preset.spell+')');
  for(let i=0;i<frames;i++){source.renderFrame(pattern,c,i/fps,{width,height,scale:.63});writeFileSync(path.join(stage,`frame-${String(i).padStart(3,'0')}.png`),canvas.toBuffer('image/png'));}
  const file=path.join(out,key+'.gif');
  const encoded=JSON.parse(execFileSync(process.env.DANMAKU_PYTHON||'python3',[path.join(root,'scripts/encode-danmaku.py'),stage,file,String(fps)],{encoding:'utf8',maxBuffer:1024*1024}));
  manifest.items[key]={game:pattern.preset.game,spell:pattern.preset.spell,kind:pattern.preset.kind,width,height,centerX:width/2,centerY:height/2,fps,...encoded,src:'/static/img/shrine/danmaku/'+key+'.gif?v='+hash(file)};
  if(process.env.DANMAKU_REVIEW_DIR){mkdirSync(process.env.DANMAKU_REVIEW_DIR,{recursive:true});source.renderFrame(pattern,c,2.8,{width,height,scale:.63});writeFileSync(path.join(process.env.DANMAKU_REVIEW_DIR,key+'.png'),canvas.toBuffer('image/png'));}
  console.log('Encoded '+key+': '+(encoded.bytes/1024).toFixed(0)+' KiB, '+encoded.frames+' frames, '+encoded.durationMs+' ms, no loop');
  rmSync(stage,{recursive:true,force:true});
 }
 manifest.version=1;manifest.durationMs=6400;manifest.sourceHash=geometryHash;manifest.rendererHash=rendererHash;manifest.encoderHash=encoderHash;
 writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 const catalog=Object.fromEntries(Object.entries(manifest.items).filter(([key,c])=>key!=='home'&&c.enabled!==false).map(([key,c])=>[key,{src:c.src,kind:c.kind,game:c.game,width:c.width,height:c.height,displayWidth:c.displayWidth,centerX:c.centerX,centerY:c.centerY,durationMs:c.durationMs}]));
 writeFileSync(path.join(root,'static/js/danmaku.js'),readFileSync(path.join(root,'scripts/danmaku-player.template.js'),'utf8').replace('__DANMAKU_CATALOG__',JSON.stringify(catalog)));
 console.log('Updated native GIF player and manifest ('+Object.keys(catalog).length+' clips)');
}finally{rmSync(temporary,{recursive:true,force:true});}

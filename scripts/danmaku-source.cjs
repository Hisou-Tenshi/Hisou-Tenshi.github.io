/* OFFLINE ONLY. Reference-based source for scripts/render-danmaku.mjs; never loaded by pages. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory();else root.ShrineDanmaku=factory();})(typeof window==='undefined'?this:window,function(){
 'use strict';
 var PI=Math.PI,TAU=2*PI;
 var presets={
  home:{game:'TH06',spell:'恋符「マスタースパーク」',kind:'spark',colors:['#eafaff','#c7edf6','#f9f1c7','#bfcfec','#ffffff']},
  about:{game:'TH07',spell:'「反魂蝶 -八分咲-」',kind:'butterfly',field:true,colors:['#e84e75','#bba5ed','#ffe1ec']},
  contact:{game:'TH08',spell:'禁薬「蓬莱の薬」',kind:'medicine',field:true,colors:['#7888e8','#9ca9f9','#d9dfff']},
  tools:{game:'TH10',spell:'「マウンテン・オブ・フェイス」',kind:'faith',field:true,colors:['#69bfe9','#bc79df','#e66979']},
  download:{game:'TH11',spell:'「地獄の人工太陽」',kind:'sun',field:true,colors:['#ee533f','#f8d587','#ec7964']},
  directory:{game:'TH12',spell:'光符「正義の威光」',kind:'laser',field:true,colors:['#f1d854','#6684ee','#fff3ba']},
  chronicle:{game:'TH13',spell:'名誉「十二階の色彩」',kind:'ranks',field:true,colors:['#9759cc','#517cd8','#46a5bc','#68aa58','#d5ac35','#d96385']},
  terms:{game:'TH14',spell:'「七人の一寸法師」',kind:'seven',field:true,colors:['#e75e70','#eaa157','#dfcc58','#62ba79','#5cbfd1','#5c83db','#b576db']},
  privacy:{game:'TH15',spell:'純符「純粋な弾幕地獄」',kind:'pure',field:true,colors:['#e65067','#537be6','#a089e2']},
  lost:{game:'TH16',spell:'秘儀「七星の剣」',kind:'dipper',field:true,colors:['#7399fc','#c8d6ff','#f5f8ff']},
  calculator:{game:'TH17',spell:'方形「スクエアクリーチャー」',kind:'square',field:true,colors:['#f3efb6','#deedc3','#fff8d4']}
 };
 function mix(a,b,p){return a+(b-a)*p;}
 function polar(a,s,bend){return function(t){var turn=a+(bend||0)*t;return {x:Math.cos(turn)*s*t,y:Math.sin(turn)*s*t+27*t,angle:turn-PI/2};};}
 function build(key){
  var cfg=presets[key]||presets.home,kind=cfg.kind,bullets=[],beams=[];
  function add(start,shape,color,size,motion,life){bullets.push({start:start,life:life||2.9,shape:shape,color:color,size:size,motion:motion});}
  function fan(w,n,shape,speed,bend,size){for(var j=0;j<n;j++){var a=mix(.16,PI-.16,j/(n-1));add(w*.48,shape,cfg.colors[w%cfg.colors.length],size||5,polar(a,speed+(j%3)*5,bend));}}
  for(var w=0;w<6;w++){
   if(kind==='spark'){
    // TH06's image is one cyan-white rainbow fan, with three source lights.
    // Keep its long middle hold static so the GIF can store it as one long frame.
    if(w===0){beams.push({start:0,life:6.2,kind:'spark',color:cfg.colors[0],phase:0});for(var j=0;j<3;j++)add(0,'ring','#e8fbff',3.3,(function(j){return function(){return{x:(j-1)*12,y:8,angle:0};};})(j),6.2);}
   }else if(kind==='butterfly'){
    // TH07 screenshots: pale violet falling butterflies, dense crimson butterfly wreaths,
    // and separate red medium-orb rain. These are three independent layers.
    for(var j=0;j<18;j++)add(w*.46,'butterfly','#c9b4ef',5.5,(function(a,w){return function(t){var r=60*t;return{x:Math.cos(a)*r+16*Math.sin(t*2+w),y:Math.sin(a)*r+36*t,angle:a};};})(j*TAU/18+w*.2,w),3.1);
    if(w<4)for(var j=0;j<38;j++)add(.4+w*.65,'butterfly','#e95278',9,(function(a){return function(t){var r=64*t;return{x:Math.cos(a)*r,y:Math.sin(a)*r,angle:a+PI/2};};})(j*TAU/38+w*.08),3.8);
    if(w>1)for(var j=0;j<12;j++)add(w*.52,'ring','#ed7186',5.5,(function(j,w){return function(t){return{x:(j-5.5)*27+13*Math.sin(t*1.5+w),y:36*t+18*t*t-70,angle:0};};})(j,w),3.3);
   }else if(kind==='medicine'){
    // TH08's pictured blue phase: tightly packed concentric hollow-oval shells.
    for(var ring=0;ring<2;ring++)for(var j=0;j<62;j++)add(w*.47+ring*.19,'rice-ring',cfg.colors[(w+ring)%3],4.6,(function(a,ring){return function(t){var r=(67+ring*5)*t,turn=a+t*.055;return{x:Math.cos(turn)*r,y:Math.sin(turn)*r,angle:turn-PI/2};};})(j*TAU/62+w*.035,ring),3.5);
   }else if(kind==='faith'){
    // THBWiki's Normal screenshot: interlacing kaji-leaf knots, not circular rings.
    if(w<4)for(var j=0;j<250;j++){
     var a=j%50*TAU/50,leaf=Math.floor(j/50)*TAU/5;
     add(w*.62,'ofuda',cfg.colors[w%3],4.4,(function(a,leaf,w){return function(t){
      var r=t*42,turn=w*.1+t*.16,u=Math.cos(leaf)+.86*Math.cos(a),v=Math.sin(leaf)+.86*Math.sin(a);
      return {x:r*(u*Math.cos(turn)-v*Math.sin(turn)),y:r*(u*Math.sin(turn)+v*Math.cos(turn)),angle:a+turn};
     };})(a,leaf,w),3.5);
    }
    for(var j=0;j<12;j++)add(w*.48+.12,'ofuda',w%2?'#6583de':'#83b76e',5,(function(a){return function(t){return{x:Math.cos(a)*91*t,y:Math.sin(a)*91*t,angle:a-PI/2};};})(j*TAU/12+w*.23),3.2);
   }else if(kind==='sun'){
    // TH11 Hard: one enormous white/red sun and captured golden debris, not three suns.
    if(w===0)add(.15,'sun',cfg.colors[0],76,function(t){return{x:0,y:16,angle:0,scale:.35+1.15*Math.min(1,t/1.25)};},6.05);
    for(var j=0;j<44;j++)add(w*.48,'orb',cfg.colors[1],2.8,(function(a,w){return function(t){var r=152-26*t,turn=a+t*(.48+w*.035);return{x:Math.cos(turn)*r,y:36+Math.sin(turn)*r,angle:0};};})(j*TAU/44+w*.09,w),3.7);
    for(var j=0;j<12;j++)add(w*.5,'ring',cfg.colors[2],5,(function(a,w){return function(t){return{x:Math.cos(a)*87*t,y:36+Math.sin(a)*87*t+12*Math.sin(t+w),angle:0};};})(j*TAU/12+w*.3,w),3.5);
   }else if(kind==='laser'){
    // TH12 Hard/Lunatic: straight blue laser columns through horizontal golden chains.
    if(w===0)for(var col=0;col<5;col++)beams.push({start:.35+col*.09,life:5.7-col*.09,kind:'pillar',color:cfg.colors[1],x:(col-2)*72,top:54,length:320,tilt:0});
    for(var j=0;j<46;j++)add(w*.48,'hook',cfg.colors[0],4.1,(function(j,w){return function(t){var spread=Math.min(1,t/.4);return{x:(j-22.5)*9.1*spread,y:-75+88*t+12*Math.sin(j*.44+w*.7+t),angle:Math.sin(j*.44+w)*.2};};})(j,w),3.8);
   }else if(kind==='ranks'){
    // TH13 Normal: six paired rank colors in curling clusters of outlined teardrops.
    for(var cluster=0;cluster<6;cluster++)for(var j=0;j<12;j++)add(w*.46+j*.022,'droplet',cfg.colors[cluster],5.3,(function(cluster,j,w){return function(t){var base=cluster*TAU/6+w*.18,turn=base+(j-5.5)*.14+t*.42,r=42*t+12*t*t;return{x:Math.cos(base)*27*Math.min(1,t*3)+Math.cos(turn)*r,y:Math.sin(base)*27*Math.min(1,t*3)+Math.sin(turn)*r+25*t,angle:turn-PI/2};};})(cluster,j,w),3.6);
   }else if(kind==='seven'){
    // Seven colored arc trains; six options join the central emitter over time.
    if(w===0){
     add(0,'option',cfg.colors[3],7,function(){return{x:0,y:0,angle:0};},6.2);
     for(var k=0;k<6;k++)add(.75+k*.18,'option',cfg.colors[k],6,(function(k){return function(t){var a=k*TAU/6-PI/2,p=Math.min(1,t/.6);p=p*p*(3-2*p);return{x:Math.cos(a)*86*p,y:Math.sin(a)*74*p,angle:0};};})(k),6.2-(.75+k*.18));
    }
    for(var band=0;band<7;band++)for(var j=0;j<9;j++){
     var a=band*TAU/7+j/8*(TAU/7)*.76+w*.08;
     add(w*.48,'scale',cfg.colors[band],3.4,(function(a){return function(t){var turn=a+t*.12,r=72*t;return{x:Math.cos(turn)*r,y:Math.sin(turn)*r,angle:turn+PI/2};};})(a),3.6);
    }
    if(w<5)for(var k=0;k<7;k++)add(1.7+w*.5+k*.018,'large-orb',cfg.colors[k],10,(function(k,w){return function(t){var a=(k-1)*TAU/6-PI/2,ox=k?Math.cos(a)*86:0,oy=k?Math.sin(a)*74:0,shot=a+w*.38;return{x:ox+Math.cos(shot)*46*t,y:oy+Math.sin(shot)*46*t+28*t,angle:0};};})(k,w),2.4);
   }else if(kind==='pure'){
    // Independent layers enter in stages: lavender rice, red rings, blue offset rings.
    for(var j=0;j<22;j++)add(w*.48,'rice',cfg.colors[2],4.3,(function(a){return function(t){return{x:Math.cos(a)*92*t,y:Math.sin(a)*92*t,angle:a-PI/2};};})(j*TAU/22+w*.17),3.3);
    if(w<5)for(var j=0;j<37;j++)add(.85+w*.47,'ring',cfg.colors[0],5.5,(function(a,w){return function(t){var p=Math.min(1,t/.45);return{x:Math.cos(w*1.2)*48*p+Math.cos(a)*66*t,y:Math.sin(w*.8)*23*p+Math.sin(a)*66*t,angle:0};};})(j*TAU/37+w*.045,w),3.4);
    if(w<4)for(var j=0;j<32;j++)add(1.8+w*.48,'ring',cfg.colors[1],7,(function(a,w){return function(t){var p=Math.min(1,t/.45);return{x:(w%2?70:-70)*p+Math.cos(a)*58*t,y:25*p+Math.sin(a)*58*t,angle:0};};})(j*TAU/32+w*.09,w),3);
   }else if(kind==='dipper'){
    // TH16: seven capped blue sword-lasers among white/blue star spray.
    if(w===0)for(var k=0;k<7;k++)beams.push({start:.3+k*.09,life:5.8-k*.09,kind:'pillar',color:'#799aff',x:(k-3)*40,top:70+Math.cos(k*.8)*22,length:270,tilt:(k-3)*.025});
    for(var j=0;j<42;j++)add(w*.48,'star',cfg.colors[j%3],3.5+j%3,(function(a,w){return function(t){var r=53*t+8*t*t,turn=a+t*.18;return{x:Math.cos(turn)*r,y:Math.sin(turn)*r+18*t,angle:turn+w};};})(j*TAU/42+w*.11,w),3.6);
   }else if(kind==='square'){
    // TH17 Hard: cream-colored rice bullets outline expanding, rotating quadrilaterals.
    for(var side=0;side<4;side++)for(var j=0;j<22;j++){
     var u=mix(-1,1,j/22),v=side===0?[u,-1]:side===1?[1,u]:side===2?[-u,1]:[-1,-u];
     add(w*.48,'rice-ring',cfg.colors[w%3],4.6,(function(v,w){return function(t){var a=PI/4+w*.15+t*.2,r=45*t*(1+.035*Math.sin(t*2)),x=(v[0]*Math.cos(a)-v[1]*Math.sin(a))*r,y=(v[0]*Math.sin(a)+v[1]*Math.cos(a))*r;return{x:x,y:y,angle:Math.atan2(y,x)-PI/2};};})(v,w),3.6);
    }
   }
  }
  return {preset:cfg,bullets:bullets,beams:beams,duration:6.4};
 }
 function glyph(c,b,p,alpha){
  var s=b.size*(p.scale||1);c.save();c.translate(p.x,p.y);c.rotate(p.angle||0);c.globalAlpha=alpha;
  c.shadowColor=b.color;c.shadowBlur=b.shape==='sun'?22:b.shape==='large-orb'?13:5;c.fillStyle=b.color;c.strokeStyle='rgba(24,35,64,.65)';c.lineWidth=.9;c.beginPath();
  if(b.shape==='star'){for(var i=0;i<10;i++){var a=-PI/2+i*PI/5,r=i%2?s*.43:s;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();}
  else if(b.shape==='butterfly'){c.moveTo(0,-s*.25);c.bezierCurveTo(-s*1.5,-s*1.7,-s*2,-s*.15,-s*.65,s*.25);c.bezierCurveTo(-s*1.3,s*1.3,-s*.25,s*1.5,0,s*.55);c.bezierCurveTo(s*.25,s*1.5,s*1.3,s*1.3,s*.65,s*.25);c.bezierCurveTo(s*2,-s*.15,s*1.5,-s*1.7,0,-s*.25);c.closePath();c.fillStyle='#fff2f8';c.strokeStyle=b.color;c.lineWidth=1.5;}
  else if(b.shape==='amulet'||b.shape==='ofuda'){c.rect(-s*.62,-s,s*1.24,s*2);}
  else if(b.shape==='scale'){c.moveTo(0,-s*1.3);c.lineTo(s*.68,0);c.lineTo(s*.48,s);c.lineTo(0,s*.4);c.lineTo(-s*.48,s);c.lineTo(-s*.68,0);c.closePath();}
  else if(b.shape==='square'){c.rect(-s,-s,s*2,s*2);}
  else if(b.shape==='sword'){c.moveTo(0,-s*2.5);c.lineTo(s*.55,s*.75);c.lineTo(s*.22,s*.45);c.lineTo(s*.22,s*1.4);c.lineTo(-s*.22,s*1.4);c.lineTo(-s*.22,s*.45);c.lineTo(-s*.55,s*.75);c.closePath();}
  else if(b.shape==='needle'){c.moveTo(0,-s*2);c.lineTo(s*.4,s*1.5);c.lineTo(-s*.4,s*1.5);c.closePath();}
  else if(b.shape==='rice'||b.shape==='petal'||b.shape==='rice-ring'){c.ellipse(0,0,s*.52,s*1.5,0,0,TAU);if(b.shape==='rice-ring'){c.fillStyle='#f7fcff';c.strokeStyle=b.color;c.lineWidth=1.5;}}
  else if(b.shape==='droplet'){c.moveTo(0,-s*1.7);c.bezierCurveTo(-s*.7,-s*.5,-s*.9,s*.9,0,s);c.bezierCurveTo(s*.9,s*.9,s*.7,-s*.5,0,-s*1.7);c.closePath();c.fillStyle='#fffaf2';c.strokeStyle=b.color;c.lineWidth=1.7;}
  else if(b.shape==='hook'){c.moveTo(-s*.85,-s);c.bezierCurveTo(-s*.8,s*1.5,s*.8,s*1.5,s*.85,-s);c.lineTo(s*.42,-s);c.bezierCurveTo(s*.38,s*.65,-s*.38,s*.65,-s*.42,-s);c.closePath();}
  else{c.arc(0,0,s,0,TAU);}
  if(b.shape==='ofuda'){c.fillStyle='#f9fff3';c.strokeStyle=b.color;c.lineWidth=1.4;}
  if(b.shape==='ring'||b.shape==='large-orb'||b.shape==='option'){
   var ring=c.createRadialGradient(0,0,0,0,0,s);ring.addColorStop(0,'#ffffff');ring.addColorStop(.62,'#fffdf9');ring.addColorStop(.77,b.color);ring.addColorStop(1,b.color);c.fillStyle=ring;c.strokeStyle=b.color;c.lineWidth=1;
  }
  if(b.shape==='sun'){var g=c.createRadialGradient(0,0,0,0,0,s);g.addColorStop(0,'#ffffff');g.addColorStop(.62,'#fff4e9');g.addColorStop(.82,'#ffc9b3');g.addColorStop(.92,'#f98766');g.addColorStop(1,b.color);c.fillStyle=g;}
  c.fill();c.stroke();c.shadowBlur=0;c.globalAlpha=alpha*.9;c.fillStyle='#fff8ef';c.beginPath();c.ellipse(0,-s*.12,s*.22,s*(b.shape==='rice'||b.shape==='petal'?.85:.3),0,0,TAU);c.fill();
  if(b.shape==='amulet'||b.shape==='ofuda'){
   c.strokeStyle=b.shape==='ofuda'?b.color:'#fff3df';c.lineWidth=.8;c.strokeRect(-s*.35,-s*.72,s*.7,s*1.44);
   if(b.shape==='ofuda'){c.beginPath();c.moveTo(-s*.2,-s*.3);c.lineTo(s*.2,-s*.3);c.moveTo(0,-s*.1);c.lineTo(0,s*.5);c.stroke();}
  }
  if(b.shape==='option'){c.strokeStyle=b.color;c.lineWidth=1;c.beginPath();c.ellipse(0,-s*.4,s*1.5,s*.55,0,0,TAU);c.stroke();}
  c.restore();
 }
 function beam(c,b,t,origin,height,scale){
  var fade=Math.min(1,t/.25,(b.life-t)/.55);if(fade<=0)return;c.save();c.translate(origin,2);c.scale(scale,scale);c.globalAlpha=fade*.75;c.lineCap='round';c.shadowColor=b.color;c.shadowBlur=14;
  if(b.kind==='spark'){
   var length=Math.min(height/scale-10,t*600),width=128*Math.min(1,t/.5);
   var colors=c.createLinearGradient(-width,0,width,0);colors.addColorStop(0,'#b96696');colors.addColorStop(.18,'#d8cc8c');colors.addColorStop(.38,'#b2e7d8');colors.addColorStop(.53,'#d8ffff');colors.addColorStop(.72,'#a3e4ee');colors.addColorStop(.9,'#899bd6');colors.addColorStop(1,'#b7a9dd');
   c.shadowBlur=10;c.fillStyle=colors;c.beginPath();c.moveTo(-8,0);c.bezierCurveTo(-18,80,-width*.9,length*.5,-width,length);c.lineTo(width,length);c.bezierCurveTo(width*.9,length*.5,18,80,8,0);c.closePath();c.fill();
   c.globalAlpha=fade*.9;c.fillStyle='#dbffff';c.beginPath();c.moveTo(-4,0);c.bezierCurveTo(-10,80,-width*.37,length*.5,-width*.48,length);c.lineTo(width*.48,length);c.bezierCurveTo(width*.37,length*.5,10,80,4,0);c.closePath();c.fill();
  }else if(b.kind==='pillar'){
   var x=b.x,y=140+b.top,len=Math.min(b.length,t*500);
   c.translate(x,y);c.rotate(b.tilt);c.shadowBlur=8;
   [10,6,2.6].forEach(function(w,i){c.strokeStyle=[b.color,'#c8d8ff','#ffffff'][i];c.lineWidth=w;c.beginPath();c.moveTo(0,0);c.lineTo(0,len);c.stroke();});
   c.shadowBlur=0;c.fillStyle='#f9ffff';c.strokeStyle=b.color;c.lineWidth=2.3;c.beginPath();c.arc(0,0,7.5,0,TAU);c.fill();c.stroke();c.beginPath();c.arc(0,0,2.3,0,TAU);c.stroke();
  }else{
   var len=Math.min(320,t*230),phase=b.phase,flip=b.flip;
   c.strokeStyle=b.color;c.lineWidth=6;c.beginPath();c.moveTo(0,0);c.bezierCurveTo((phase*50+flip*65)*t,len*.28,(-phase*80-flip*90)*t,len*.68,phase*80+Math.sin(t*2+phase)*70,len);c.stroke();c.shadowBlur=0;c.strokeStyle='#fff8c9';c.lineWidth=1.6;c.stroke();
  }
  c.restore();
 }
 function renderFrame(pattern,c,t,options){
  var width=options.width,height=options.height,scale=options.scale||.84;
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,width,height);
  // Keep the full pattern's emission origin at the bitmap center from frame zero.
  // Pillar offsets retain their position relative to that origin; no entry travel.
  c.save();c.translate(0,height/2-(6+height*.47));
  pattern.beams.forEach(function(b){var age=t-b.start;if(age>=0&&age<b.life)beam(c,b,age,width/2,height,scale);});
  c.restore();
  c.save();c.translate(width/2,height/2);c.scale(scale,scale);
  function paint(b){var age=t-b.start;if(age<0||age>b.life)return;var pos=b.motion(age),alpha=Math.min(1,age/.12,(b.life-age)/.65);glyph(c,b,pos,alpha*.97);}
  pattern.bullets.filter(function(b){return b.shape!=='sun';}).forEach(paint);
  // The white solar core occludes particles once they fall into it.
  pattern.bullets.filter(function(b){return b.shape==='sun';}).forEach(paint);
  c.restore();
 }
 return {build:build,presets:presets,renderFrame:renderFrame};
});

/* Native GIFs, centered on the active tab at the navigation's lower edge. */
(function(){
 'use strict';
 var clips={"about":{"src":"/static/img/shrine/danmaku/about.gif?v=36acb7a74d12","kind":"butterfly","game":"TH07","width":360,"height":360,"centerX":180,"centerY":180,"durationMs":6400},"contact":{"src":"/static/img/shrine/danmaku/contact.gif?v=2db6d987b1d5","kind":"medicine","game":"TH08","width":360,"height":360,"centerX":180,"centerY":180,"durationMs":6400},"tools":{"src":"/static/img/shrine/danmaku/tools.gif?v=3bc3c46ffc35","kind":"faith","game":"TH10","width":512,"height":512,"displayWidth":360,"centerX":256,"centerY":256,"durationMs":6400},"download":{"src":"/static/img/shrine/danmaku/download.gif?v=5034252b32bb","kind":"sun","game":"TH11","width":360,"height":360,"centerX":180,"centerY":180,"durationMs":6400},"directory":{"src":"/static/img/shrine/danmaku/directory.gif?v=45710016d2c3","kind":"laser","game":"TH12","width":360,"height":360,"centerX":180,"centerY":180,"durationMs":6400},"chronicle":{"src":"/static/img/shrine/danmaku/chronicle.gif?v=85e5d5014896","kind":"ranks","game":"TH13","width":360,"height":360,"centerX":180,"centerY":180,"durationMs":6400},"terms":{"src":"/static/img/shrine/danmaku/terms.gif?v=459e8e3eba1a","kind":"seven","game":"TH14","width":360,"height":360,"centerX":180,"centerY":180,"durationMs":6400},"privacy":{"src":"/static/img/shrine/danmaku/privacy.gif?v=a87c0652ccff","kind":"pure","game":"TH15","width":360,"height":360,"centerX":180,"centerY":180,"durationMs":6400},"lost":{"src":"/static/img/shrine/danmaku/lost.gif?v=71f82583f9e3","kind":"dipper","game":"TH16","width":360,"height":360,"centerX":180,"centerY":180,"durationMs":6400},"calculator":{"src":"/static/img/shrine/danmaku/calculator.gif?v=803734a4ff19","kind":"square","game":"TH17","width":360,"height":360,"centerX":180,"centerY":180,"durationMs":6400}};
 var active=null,timer=0,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function stop(){clearTimeout(timer);timer=0;if(active){active.onload=null;active.onerror=null;active.remove();active.removeAttribute('src');active=null;}}
 function burst(key,origin){
  if(key==='home'||document.body.dataset.page==='home'){stop();return false;}
  if(reduced.matches||document.hidden||!clips[key])return false;
  var host=document.getElementById('edgeBullets');if(!host)return false;stop();
  var clip=clips[key],width=Math.min(clip.displayWidth||clip.width,innerWidth-24),scale=width/clip.width,height=clip.height*scale;
  var left=origin.x-clip.centerX*scale,top=origin.y-clip.centerY*scale;
  host.style.setProperty('--danmaku-clip-top',origin.y+'px');
  var img=new Image();active=img;img.className='nav-danmaku';img.alt='';img.setAttribute('aria-hidden','true');img.decoding='async';
  img.dataset.pattern=clip.kind;img.dataset.game=clip.game;img.dataset.format='gif';img.width=clip.width;img.height=clip.height;
  img.style.cssText='left:'+left+'px;top:'+top+'px;width:'+width+'px;height:'+height+'px';
  img.style.setProperty('--cast-duration',clip.durationMs+'ms');
  img.style.setProperty('--fade-left',Math.max(0,-left)+'px');
  img.style.setProperty('--fade-right',Math.min(width,innerWidth-left)+'px');
  img.style.setProperty('--fade-bottom',Math.min(height,innerHeight-top)+'px');
  img.onload=function(){if(active!==img)return;if(document.hidden||reduced.matches){stop();return;}clearTimeout(timer);host.replaceChildren(img);timer=setTimeout(stop,clip.durationMs);};
  img.onerror=stop;timer=setTimeout(stop,15000);img.src=clip.src;return true;
 }
 document.addEventListener('visibilitychange',function(){if(document.hidden)stop();});
 addEventListener('pagehide',stop);addEventListener('resize',stop);reduced.addEventListener('change',stop);
 window.ShrineDanmaku={burst:burst,stop:stop};
})();

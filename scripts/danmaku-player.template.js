/* Native GIFs, centered on the active tab at the navigation's lower edge. */
(function(){
 'use strict';
 var clips=__DANMAKU_CATALOG__;
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

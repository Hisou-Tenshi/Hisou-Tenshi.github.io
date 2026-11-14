/* One renderer for static output and live repo hydration; no content duplication. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ShrineProjects=factory();})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 var names={"SenrenBanka-CN-Text-Extractor":"文符「千恋万花の書庫」","bangumi-sync":"記符「幻想の追跡者」","ACGMN-Grid":"天符「好きを並べる空」","weekly-info":"報符「週を紡ぐ便り」","ipsc-video-analysis":"研符「生命の律動」","Calling":"言符「雲間の対話」","dsh-whale-desktop-launcher":"鯨符「机上の遊泳」","Hisou-Tenshi.github.io":"界符「雲上の神社」"};
 var featured=['SenrenBanka-CN-Text-Extractor','bangumi-sync','ACGMN-Grid'];
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function render(items){
  var ordered=featured.map(function(name){return items.find(function(x){return x.repo===name;});}).filter(Boolean).concat(items.filter(function(x){return !featured.includes(x.repo);}));
  return ordered.map(function(it,i){
   if(!it.url)return '';
   return '<article class="project-spell"><button class="spell" type="button" data-project-spell="'+esc(it.repo)+'" aria-label="展开符卡：'+esc(it.name)+'"><span class="card-circle" aria-hidden="true"></span><span class="spell-order">SPELL CARD / No. '+String(i+1).padStart(2,'0')+'</span><strong class="spell-name">'+esc(names[it.repo]||it.name)+'</strong><span class="spell-project tile__title">'+esc(it.name)+'</span><span class="spell-open">展開する ───── ✧</span></button></article>';
  }).join('\n');
 }
 return {render:render,names:names};
});

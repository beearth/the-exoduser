/* Still paintings, quiet environmental layers. No grain, point particles or body warping. */
(function(scope){
 'use strict';
 const TAU=Math.PI*2,period=i=>96+48*i,wind=(t,i=0)=>Math.sin(t*TAU/period(i)+i*1.7);
 const loadingNames=new Set(Array.from({length:19},(_,i)=>String(i+1)).filter(n=>!['13','14','17'].includes(n)).concat(['rd1','rd2','rd4','rd5','rd6','rd7','rd8','rd9','rd10','rd11','rd12','rd13','rd14','rd15','rd16','rd17']));
 function loadingId(src){const m=String(src||'').match(/(?:^|\/)lording\/(?:wide\/)?(\d+|rd\d+)(?:-(?:16|21|32))?\.(?:png|jpg|webp)(?:[?#].*)?$/);return m&&loadingNames.has(m[1])?m[1]:null;}
 function allowedScreen(id){return ['lobby','charVisualPop','loadingBodyArt','chapterGate','stageTransition','death','stageClear','demoEnd','victory'].includes(id);}
 function staticReason(p={}){
  const s=p.settings||{};
  if(p.hidden)return 'hidden';
  if(p.reduce||s.reduceMotion)return 'reduced-motion';
  if(p.tier==='C'||p.quality==='low'||s.quality==='low')return 'low-tier';
  if(s.atmos===0)return 'atmosphere-off';
  if(/swiftshader|llvmpipe|software|microsoft basic|proxy/i.test(p.renderer||''))return 'gpu-proxy';
  return null;
 }
 function plateBox(iw,ih,meta,w,h){const k=Math.max(w/iw,h/ih),ow=Math.min(iw,meta?.width||iw);return [(w-iw*k)/2+(iw-ow)/2*k,(h-ih*k)/2,ow*k,ih*k];}
 const api=scope.LivingScenes={staticReason,loadingId,allowedScreen,wind,period,plateBox};
 if(!scope.document)return;
 const doc=scope.document,reduceQuery=scope.matchMedia('(prefers-reduced-motion: reduce)'),KEY='exoduser_menu_reduce_motion';
 const q=s=>doc.querySelector(s),can=doc.createElement('canvas'),cx=can.getContext('2d',{alpha:true});
 if(!cx)return;
 can.className='living-scene';can.setAttribute('aria-hidden','true');can.hidden=true;
 const field=doc.createElement('canvas'),fx=field.getContext('2d'),mask=doc.createElement('canvas'),mx=mask.getContext('2d');
 const texture=doc.createElement('canvas'),tx=texture.getContext('2d');
 let state=null,raf=0,last=-Infinity,maskKey='',renderer='',reduced=false,stillTicket=0;
 const still=doc.createElement('img');still.className='living-still';still.alt='';still.setAttribute('aria-hidden','true');
 const stats=api.stats={active:null,source:null,stillSource:null,stillReady:false,reason:'idle',frames:0,renderMs:0,maxRenderMs:0,renderer:'',resolution:[],error:null,suppressedSpecks:0};
 const cleaned=new Map(),corrections=new Map();
 const loadingRepairIds=new Set(['1','2','rd2','rd4','rd7','rd8','rd12']);
 function correction(name){if(corrections.has(name))return corrections.get(name);const promise=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Correction image unavailable: '+name));im.src='assets/living-scenes/20261102/'+name+'-clean.webp';});corrections.set(name,promise);return promise;}
 // Preserve the original warrior silhouette; only the surrounding scene is cleaned.
 const warriorOutline=[[.16,.10],[.24,.10],[.25,.20],[.30,.24],[.31,.22],[.36,.21],[.39,.27],[.47,.31],[.60,.32],[.68,.35],[.74,.39],[.82,.43],[.83,.59],[.78,.67],[.74,.81],[.66,.84],[.61,.77],[.57,.82],[.58,.94],[.50,.95],[.44,.79],[.39,.71],[.32,.66],[.29,.77],[.28,.89],[.23,.91],[.18,.91],[.15,.96],[.15,.77],[.16,.58],[.16,.33]];
 function cleanImage(im,s){
  if(cleaned.has(im.src))return cleaned.get(im.src);
  const lid=loadingId(s.source),wide=/-(?:21|32)\.webp(?:[?#]|$)/.test(im.src),hero=s.source.match(/poster_idle_(warrior|silvertail|hellgunner|transmuter|spearmage)/)?.[1],kind=loadingRepairIds.has(lid)?'loading-'+lid+(im.naturalWidth===1920?'-16':''):hero?hero+(wide?'-wide':''):s.kind==='death'?'death'+(wide?'-wide':''):null;
  if(!kind||(kind.startsWith('loading-')&&![1920,2560,3840].includes(im.naturalWidth)))return Promise.resolve({url:im.src,count:0});
  const pending=correction(kind).then(repair=>{
   if(kind.startsWith('loading-'))return {url:repair.src,count:0};
   return new Promise((resolve,reject)=>{
   const c=doc.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);
   const [ox,oy,ow,oh]=originalBox(s,c.width,c.height);
   const k=Math.max(c.width/repair.naturalWidth,c.height/repair.naturalHeight),rx=wide?(c.width-repair.naturalWidth*k)/2:ox,ry=wide?(c.height-repair.naturalHeight*k)/2:oy,rw=wide?repair.naturalWidth*k:ow,rh=wide?repair.naturalHeight*k:oh;
   ctx.drawImage(repair,rx,ry,rw,rh);
   if(kind.startsWith('warrior')){
    const fg=doc.createElement('canvas'),fm=doc.createElement('canvas');fg.width=fm.width=c.width;fg.height=fm.height=c.height;const f=fg.getContext('2d'),m=fm.getContext('2d');
    f.drawImage(im,0,0);m.filter=`blur(${oh*.012}px)`;m.beginPath();warriorOutline.forEach(([x,y],i)=>m[i?'lineTo':'moveTo'](ox+ow*x,oy+oh*y));m.closePath();m.fill();f.globalCompositeOperation='destination-in';f.drawImage(fm,0,0);ctx.drawImage(fg,0,0);
    // Three detached embers inside the loose silhouette margin; no face/body pixels.
    for(const[x,y,r]of [[450,554,12],[560,463,10],[1411,455,12]]){
     const px=ox+ow*x/1920,py=oy+oh*y/1080,rr=oh*r/1080;ctx.save();ctx.beginPath();ctx.arc(px,py,rr,0,TAU);ctx.clip();ctx.drawImage(repair,rx,ry,rw,rh);ctx.restore();
    }
   }
   c.toBlob(blob=>blob?resolve({url:URL.createObjectURL(blob),count:0}):reject(new Error('still encoding failed')),'image/png');
  });});
  cleaned.set(im.src,pending);if(cleaned.size>4){const first=cleaned.keys().next().value;cleaned.get(first).then(item=>URL.revokeObjectURL(item.url)).catch(()=>{});cleaned.delete(first);}return pending;
 }
 try{reduced=scope.localStorage.getItem(KEY)==='1';}catch{}
 try{const probe=doc.createElement('canvas'),gl=probe.getContext('webgl');if(gl){const e=gl.getExtension('WEBGL_debug_renderer_info');renderer=e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);gl.getExtension('WEBGL_lose_context')?.loseContext();}}catch{}
 stats.renderer=renderer;
 function policy(){
  let tier='',settings={};
  try{settings=JSON.parse(scope.localStorage.getItem('hellcave_settings')||'{}').opt||{};}catch{}
  try{if(typeof OPT!=='undefined')settings=OPT;if(typeof _hwTier!=='undefined')tier=_hwTier;}catch{}
  return staticReason({hidden:doc.hidden,reduce:reduceQuery.matches||reduced,tier,settings,renderer});
 }
 function visible(e){if(!e?.isConnected||!e.getClientRects().length)return false;for(let p=e;p&&p!==doc;p=p.parentElement){const s=scope.getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden'||+s.opacity<.03)return false;}return true;}
 function source(e,fallback){return e?.getAttribute('src')||fallback||'';}
 function choose(){
  // Approved screens are an absolute boundary, even when a loading image exists behind them.
  if(['#splashOverlay','#cinClickPrompt','#fdgScreen'].some(s=>visible(q(s))))return null;
  const hero=q('#charVisualPop');
  if(visible(hero))return{host:hero.querySelector('.cs-scene'),owner:hero,kind:'hero',source:source(q('#csWideArt'),q('#csIdleVid')?.poster)};
  for(const[id,kind]of [['demoEnd','end'],['death','death'],['stageTransition','loading'],['chapterGate','loading'],['victory','clear'],['stageClear','clear']]){
   const host=q('#'+id);if(!visible(host))continue;
   const src=kind==='loading'?source(q(id==='chapterGate'?'#chGateImg':'#stRndImg')):kind==='death'?'img/cin_remember_wide.png':'';
   if(kind==='loading'&&!loadingId(src))return null;
   return{host:id==='stageClear'?doc.body:host,owner:host,kind,source:src,viewport:id==='stageClear'};
  }
  if(visible(q('#lobby')))return{host:q('#lobby'),owner:q('#lobby'),kind:'crypt',source:source(q('#lobbyWideArt'),'assets/lobby/lobby_varkan_crypt_poster_v2.webp')};
  const entry=q('#loadingBodyArt');
  if(visible(entry)&&!visible(q('#cinScene'))&&!visible(q('#container'))){const src=source(entry.querySelector('img:not(.loading-backdrop)'));if(loadingId(src))return{host:entry,owner:entry,kind:'loading',source:src};}
  return null;
 }
 function imageFor(s){if(!s.source)return null;return scope.FullscreenArt?scope.FullscreenArt.get(s.source):null;}
 function tone(s){
  const id=loadingId(s.source),src=s.source;
  if(s.kind==='death'||s.kind==='end')return [109,57,57];
  if(s.kind==='clear')return [143,135,114];
  if(s.kind==='crypt'&&/crypt/.test(src))return [102,123,140];
  if(/(?:silvertail|spearmage)/.test(src)||['1','2','3','rd4'].includes(id))return [120,111,138];
  if(/transmuter/.test(src)||['11','rd9','rd17'].includes(id))return [103,129,149];
  if(['5','6','7','8','9','12','rd7','rd10'].includes(id))return [108,117,91];
  return [137,106,99];
 }
 // A periodic analytic smoke field. No stochastic samples or tiny specks.
 texture.width=768;texture.height=192;
 const pixels=tx.createImageData(texture.width,texture.height);
 for(let y=0;y<192;y++)for(let x=0;x<768;x++){
  const u=x/768*TAU,v=y/192,band=Math.sin(v*Math.PI)**2;
  const a=Math.max(0,.48+.27*Math.sin(u*2+Math.sin(v*5)*1.4)+.17*Math.cos(u*3-v*6)+.08*Math.sin(u*5+v*9));
  const n=(y*768+x)*4;pixels.data[n]=pixels.data[n+1]=pixels.data[n+2]=255;pixels.data[n+3]=Math.round(a*a*band*255);
 }
 tx.putImageData(pixels,0,0);
 function canonical(src){const clean=String(src).split(/[?#]/)[0];return Object.keys(scope.EXODUSER_FULLSCREEN_ART||{}).find(k=>Object.values(scope.EXODUSER_FULLSCREEN_ART[k]).includes(clean))||clean;}
 function originalBox(s,w,h){
  const im=imageFor(s),iw=im?.naturalWidth||w,ih=im?.naturalHeight||h;
  return plateBox(iw,ih,scope.EXODUSER_FULLSCREEN_META?.[canonical(s.source)],w,h);
 }
 function prepareMask(w,h,s){
  const key=[w,h,s.kind,s.source,imageFor(s)?.naturalWidth].join('|');if(key===maskKey)return;
  maskKey=key;mask.width=w;mask.height=h;const [ox,oy,ow,oh]=originalBox(s,w,h);
  const top=mx.createLinearGradient(0,0,0,h*.48);top.addColorStop(0,'#fff');top.addColorStop(.55,'#fff');top.addColorStop(1,'#fff0');mx.fillStyle=top;mx.fillRect(0,0,w,h*.48);
  const floor=mx.createLinearGradient(0,h*.6,0,h);floor.addColorStop(0,'#fff0');floor.addColorStop(.65,'#fff');floor.addColorStop(1,'#fff0');mx.fillStyle=floor;mx.fillRect(0,h*.6,w,h*.4);
  if(s.kind==='hero'||s.kind==='loading'||s.kind==='crypt'){
   const center=s.kind==='hero'&&/warrior/.test(s.source)?.36:.5;
   mx.save();mx.globalCompositeOperation='destination-out';mx.translate(ox+ow*center,oy+oh*.47);mx.scale(ow*.37,oh*.67);
   const g=mx.createRadialGradient(0,0,.65,0,0,1);g.addColorStop(0,'#fff');g.addColorStop(.85,'#fff');g.addColorStop(1,'#fff0');mx.fillStyle=g;mx.fillRect(-1,-1,2,2);mx.restore();
  }
  if(['clear','end'].includes(s.kind)){
   mx.save();mx.globalCompositeOperation='destination-out';const g=mx.createRadialGradient(w*.5,h*.5,h*.18,w*.5,h*.5,h*.5);g.addColorStop(0,'#fff');g.addColorStop(1,'#fff0');mx.fillStyle=g;mx.fillRect(0,0,w,h);mx.restore();
  }
 }
 function paint(w,h,s,t){
  const rw=Math.max(1,Math.round(Math.min(1280,w))),rh=Math.max(1,Math.round(h*rw/w));
  if(field.width!==rw||field.height!==rh){field.width=rw;field.height=rh;}
  fx.clearRect(0,0,rw,rh);prepareMask(rw,rh,s);
  const color=tone(s);
  for(let i=0;i<3;i++){
   const drift=wind(t,i)*rw*(.017+i*.006),top=i===0?-.035*rh:rh*(.59+(i-1)*.11);
   fx.globalAlpha=i===0?.075:.13;fx.drawImage(texture,-rw*.12+drift,top,rw*1.24,rh*(i===0?.49:.38));
  }
  fx.globalAlpha=1;fx.globalCompositeOperation='source-in';fx.fillStyle=`rgb(${color.join(',')})`;fx.fillRect(0,0,rw,rh);
  fx.globalCompositeOperation='destination-in';fx.drawImage(mask,0,0);fx.globalCompositeOperation='source-over';cx.drawImage(field,0,0,w,h);
  if(s.kind==='crypt'&&/crypt/.test(s.source)){
   const [ox,oy,ow,oh]=originalBox(s,w,h);
   for(const [x,y,r]of [[.095,.553,.083],[.238,.52,.047],[.46,.579,.071]]){
    const px=ox+ow*x,py=oy+oh*y,radius=oh*r,pulse=.075+.025*Math.sin(t*TAU/11+x*14)+.012*Math.sin(t*2.3+x*11);
    const g=cx.createRadialGradient(px,py,0,px,py,radius);g.addColorStop(0,`rgba(86,151,202,${pulse})`);g.addColorStop(.45,`rgba(61,113,167,${pulse*.38})`);g.addColorStop(1,'rgba(61,113,167,0)');cx.fillStyle=g;cx.fillRect(px-radius,py-radius,2*radius,2*radius);
   }
  }
 }
 function frame(now){
  raf=0;if(!state||policy())return;raf=scope.requestAnimationFrame(frame);if(now-last<1000/30)return;last=now;
  const start=performance.now(),r=state.viewport?{width:scope.innerWidth,height:scope.innerHeight}:state.host.getBoundingClientRect();
  const scale=Math.min(1,1920/r.width,1080/r.height),w=Math.max(1,Math.round(r.width*scale)),h=Math.max(1,Math.round(r.height*scale));
  if(can.width!==w||can.height!==h){can.width=w;can.height=h;}cx.clearRect(0,0,w,h);paint(w,h,state,now/1000);
  const cost=performance.now()-start;stats.frames++;stats.renderMs+=cost;stats.maxRenderMs=Math.max(stats.maxRenderMs,cost);stats.resolution=[w,h];
 }
 function syncStill(s){
  const ticket=++stillTicket;stats.stillReady=false;stats.stillSource=null;still.remove();
  if(s?.owner)s.owner.classList.remove('living-painting-ready');
  if(!['hero','crypt','loading','death'].includes(s?.kind))return;
  const image=imageFor(s);
  const ready=async()=>{
   if(ticket!==stillTicket||!image?.naturalWidth)return;
    // Immediately select the correct painting; a previous hero can never remain in this slot.
    still.src=image.src;s.host.appendChild(still);s.owner.classList.add('living-painting-ready');
    let item;try{item=await cleanImage(image,s);}catch(e){if(ticket===stillTicket)stats.error=String(e);return;}
   if(ticket!==stillTicket)return;
    still.src=item.url;try{await still.decode();}catch(e){if(ticket===stillTicket)stats.error=String(e);return;}
    if(ticket!==stillTicket)return;
    stats.suppressedSpecks=item.count;stats.stillSource=s.source;stats.stillReady=true;
  };
  if(image?.complete&&image.naturalWidth)ready();else image?.addEventListener('load',ready,{once:true});
 }
 function poll(){
  const next=choose(),changed=next?.owner!==state?.owner||next?.source!==state?.source;
  state=next;const reason=policy(),previousReason=stats.reason;stats.active=state?.kind||null;stats.source=state?.source||null;stats.reason=reason||(!state?'idle':null);
  if(changed){stats.suppressedSpecks=0;stats.error=null;syncStill(state);maskKey='';}
  if(previousReason!==stats.reason)doc.dispatchEvent(new Event('living-motion-policy'));
  for(const v of doc.querySelectorAll('#lobbyAmbientVideo,#lobbyCharPreview,#csIdleVid,#csSceneVid'))if(!v.paused)v.pause();
  if(!state||reason){scope.cancelAnimationFrame(raf);raf=0;cx.clearRect(0,0,can.width,can.height);can.hidden=true;return;}
  if(can.parentElement!==state.host)state.host.appendChild(can);
  for(const e of state.owner.children)if(!e.matches('canvas,img,.loading-art,script,style')&&scope.getComputedStyle(e).position==='static')e.classList.add('living-ui-layer');
  can.classList.toggle('living-viewport',!!state.viewport);can.hidden=false;if(!raf)raf=scope.requestAnimationFrame(frame);
 }
 api.setReduced=value=>{reduced=!!value;try{scope.localStorage.setItem(KEY,reduced?'1':'0');}catch{}poll();};
 api.refresh=poll;
 api.motionAllowed=()=>!policy();
 doc.addEventListener('play',e=>{if(['lobbyAmbientVideo','lobbyCharPreview','csIdleVid','csSceneVid'].includes(e.target.id))e.target.pause();},true);
 function boot(){
  poll();scope.setInterval(poll,400);doc.addEventListener('visibilitychange',poll);reduceQuery.addEventListener('change',poll);scope.addEventListener('resize',()=>{maskKey='';poll();});scope.addEventListener('storage',e=>{if(e.key===KEY)reduced=e.newValue==='1';poll();});doc.addEventListener('change',poll);
  const observer=new MutationObserver(poll);
  for(const id of ['csWideArt','lobbyWideArt','stRndImg','chGateImg']){const el=q('#'+id);if(el)observer.observe(el,{attributes:true,attributeFilter:['src']});}
  for(const id of ['lobby','charVisualPop','stageTransition','chapterGate','stageClear','death','demoEnd','victory','splashOverlay','cinClickPrompt','fdgScreen']){const el=q('#'+id);if(el)observer.observe(el,{attributes:true,attributeFilter:['style']});}
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(globalThis);

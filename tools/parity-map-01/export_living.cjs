const fs=require('fs'),path=require('path'),{chromium}=require(process.env.PARITY_PLAYWRIGHT || 'playwright');
const out=path.resolve('godot/assets/map/web_parity/living');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});try{const p=await b.newPage();await p.goto((process.env.PARITY_WEB_BASE || 'http://127.0.0.1:3399')+'/game.html?test=1');await p.waitForTimeout(3000);await p.evaluate(async()=>{await _startDemoNew();window._btFramePause=true;});await p.waitForTimeout(1500);
const data=await p.evaluate(()=>{
 const g={stage:0,cam:{x:0,y:0}},res={files:[],objects:JSON.parse(JSON.stringify(MAP_OBJS)),meta:{}};
 const save=(name,c)=>res.files.push({name,uri:c.toDataURL()});
 for(const o of MAP_OBJS)res.meta[o.type]=_OBJ_META[o.type];
 for(const mode of ['dry0','dry1','dry2','wet','surfaceDry','surfaceWet']){
  const wet=mode==='wet'||mode==='surfaceWet',surf=mode.startsWith('surface'),variant=mode.startsWith('dry')?+mode.slice(3):0,x=variant*40;
  const type=wet?'m_c1pool':surf?'m_c1cocoon':'_atlasDry',k=wet?1.25:surf?1.1:1;
  const sheet=document.createElement('canvas');sheet.width=sheet.height=1280;const s=sheet.getContext('2d');
  for(let f=0;f<16;f++){const c=document.createElement('canvas');c.width=c.height=320;const ctx=c.getContext('2d');ctx.translate(160-x,160-(surf&&!wet?100/k:0));g.cam.x=x;g.cam.y=0;Ch1LivingDetail.draw(ctx,g,[{type,x,y:0,scale:1/k}],(f*Math.PI*2/16-x*.017)/.00095,320,320,surf);s.drawImage(c,(f%4)*320,Math.floor(f/4)*320);}
  save(mode+'.png',sheet);
 }
 const regions=[{tx:49,ty:151,w:1440,h:880,variant:0},{tx:151,ty:136,w:1440,h:800,variant:1},{tx:100,ty:120,w:1360,h:820,variant:2},{tx:46,ty:107,w:960,h:640,variant:3},{tx:167,ty:47,w:900,h:680,variant:4}];
 for(const r of regions){const c=document.createElement('canvas');c.width=r.w;c.height=r.h;const ctx=c.getContext('2d'),x=(r.tx+.5)*40,y=(r.ty+.5)*40;ctx.translate(-x+r.w/2,-y+r.h/2);g.cam={x,y};const proxy=new Proxy(ctx,{get(t,k){if(k==='drawImage')return(im,...a)=>{if(im.width===768&&im.height===512)t.drawImage(im,...a)};const v=t[k];return typeof v==='function'?v.bind(t):v;},set(t,k,v){t[k]=v;return true}});Ch1LivingDetail.draw(proxy,g,[],1000,r.w,r.h);save('region'+r.variant+'.png',c);r.x=x-r.w/2;r.y=y-r.h/2;}
 res.regions=regions;res.shadows=[];
 MAP_OBJS.forEach((o,i)=>{const c=document.createElement('canvas');c.width=3072;c.height=2048;const ctx=c.getContext('2d'),x=o.x-1536,y=o.y-1024;ctx.translate(-x,-y);g.cam={x:o.x,y:o.y};Ch1LivingDetail.shadows(ctx,g,[o],_OBJ_SPR,_OBJ_META,1000,3072,2048);save('shadow'+i+'.png',c);res.shadows.push({name:'shadow'+i+'.png',x,y});});return res;
 });
for(const f of data.files)fs.writeFileSync(path.join(out,f.name),Buffer.from(f.uri.split(',')[1],'base64'));delete data.files;fs.writeFileSync(path.join(out,'source.json'),JSON.stringify(data,null,2));console.log('exported',data.objects.length,'objects,',data.shadows.length,'shadow canvases');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});

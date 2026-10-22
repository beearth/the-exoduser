const fs=require('fs'),path=require('path');const {chromium}=require(process.env.PARITY_PLAYWRIGHT || require('os').homedir()+'/Projects/exoduser-migration-20261001/node_modules/playwright');
const out=path.resolve('godot/assets/map/web_parity');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});try{const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto('http://localhost:3333/game.html?test=1');await p.waitForTimeout(3000);await p.evaluate(async()=>{await _startDemoNew();window._btFramePause=true;});
console.log('source totals',await p.evaluate(()=>G._regions?.map(r=>r.total)));
const manifest=[];
const hand=await p.evaluate(()=>MAP_OBJS.filter(o=>o._hand&&_OBJ_META[o.type]?.rotTree).map(o=>({mo:o,rt:_OBJ_META[o.type].rotTree,sz:_OBJ_META[o.type].sz*(o.scale||1)})));
for(const h of hand)await p.evaluate(h=>{const c=document.createElement('canvas');Ch1RotTrees.drawObj(c.getContext('2d'),h.mo,h.rt,h.sz,1000)},h);
const count=await p.evaluate(()=>Ch1RotTrees._instances().length);
for(let id=0;id<count;id++){if(id===13)continue;let info;for(let retry=0;retry<60;retry++){
info=await p.evaluate(id=>{const it=Ch1RotTrees._instances()[id];const g={stage:0,cam:{x:it.x+it.w/2,y:it.y+it.h/2},_camZoom:1};const c=document.createElement('canvas');c.width=1;c.height=1;
if(it.baked)Ch1RotTrees.draw(c.getContext('2d'),g,1000,'assets/map/ch1/production_finish',2000,2000);else{const mo=MAP_OBJS.find(o=>Math.abs(o.x-it.x-it.w/2)<1&&Math.abs(o.y-it.y-it.h/2)<1);if(mo)Ch1RotTrees.drawObj(c.getContext('2d'),mo,_OBJ_META[mo.type].rotTree,_OBJ_META[mo.type].sz*(mo.scale||1),1000)}
return {ready:!!it.tex,erased:it.tex===false,idx:it.idx,x:it.x,y:it.y,w:it.w,h:it.h,side:it.side,k:it.k,anchorY:it.anchorY,phase:it.phase,phase2:it.phase2,baked:it.baked,feats:it.feats.map(f=>({k:f.k,cx:f.cx,cy:f.cy,px:f.px,py:f.py,pw:f.pw,ph:f.ph,lx:f.lx,ly:f.ly,phase:f.phase,speed:f.speed}))}},id);
if(info.ready||info.erased)break;await p.waitForTimeout(100)}
if(info.ready){const uri=await p.evaluate(id=>{const it=Ch1RotTrees._instances()[id];const c=document.createElement('canvas');c.width=it.side;c.height=it.side;c.getContext('2d').drawImage(it.tex,0,0);return c.toDataURL('image/png')},id);fs.writeFileSync(path.join(out,`tree_${info.idx}.png`),Buffer.from(uri.split(',')[1],'base64'));
for(let fi=0;fi<info.feats.length;fi++){const f=info.feats[fi];if(!f.pw)continue;const uri=await p.evaluate(({id,fi})=>{const it=Ch1RotTrees._instances()[id],f=it.feats[fi];const c=document.createElement('canvas');c.width=f.pw;c.height=f.ph;c.getContext('2d').drawImage(it.tex,f.lx,f.ly,f.pw,f.ph,0,0,f.pw,f.ph);return c.toDataURL('image/png')},{id,fi});f.texture=`res://assets/map/web_parity/feature_${info.idx}_${fi}.png`;fs.writeFileSync(path.join(out,`feature_${info.idx}_${fi}.png`),Buffer.from(uri.split(',')[1],'base64'));}
manifest.push({...info,texture:`res://assets/map/web_parity/tree_${info.idx}.png`})}else if(!info.erased)throw Error('tree not ready '+id);
}
// Exact source AO/recess/rim pass, in 1000px world tiles. No input art is redrawn.
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
let uri=await p.evaluate(async({x,y})=>{const c=document.createElement('canvas');c.width=1000;c.height=1000;const ctx=c.getContext('2d');ctx.translate(-x*1000,-y*1000);const g={...G,cam:{x:x*1000+500,y:y*1000+500},_camZoom:1,_bossArena:false};Ch1BoundaryEdge.draw(ctx,g,1000,1000,1000);return c.toDataURL('image/png')},{x,y});fs.writeFileSync(path.join(out,`edge_${x}_${y}.png`),Buffer.from(uri.split(',')[1],'base64'));}
fs.writeFileSync(path.join(out,'trees.json'),JSON.stringify({source:'ch1-rot-trees.js:14-426',trees:manifest},null,2));console.log('exported',manifest.length);
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});

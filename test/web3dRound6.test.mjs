import test from 'node:test';
import assert from 'node:assert/strict';
import {shadeEnvironment} from '../web3d/lighting-model.mjs';
const hue=c=>{const hi=Math.max(...c),lo=Math.min(...c),d=hi-lo,i=c.indexOf(hi);return ((d?(i===0?(c[1]-c[2])/d:i===1?2+(c[2]-c[0])/d:4+(c[0]-c[1])/d)*60:0)+360)%360;};
const delta=(a,b)=>Math.min(Math.abs(hue(a)-hue(b)),360-Math.abs(hue(a)-hue(b)));
test('camp ash, grey canvas and every low-chroma material keep hue under colored pools',()=>{
 for(const art of [[.20,.19,.22],[.31,.30,.32],[.17,.16,.17],[.19,.20,.21],[.09,.08,.07],[.32,.10,.39]])
 for(const light of [[3,.4,.06],[0,0,0],[.1,.7,1],[1,.01,.01]]){
  const c=shadeEnvironment(art,[.22,.21,.31],light);assert.ok(delta(art,c)<=15,`${art} -> ${c} delta ${delta(art,c)}`);
 }
});
test('unlit late-route material retains at least 72 percent of source detail',()=>{
 for(const art of [[.22,.24,.20],[.04,.04,.05],[.3,.28,.32]]){
  const c=shadeEnvironment(art,[.22,.21,.31],[0,0,0]);assert.ok(c.every((v,i)=>v>=art[i]*.72));
 }
});
test('red bark highlights and sourceless pool cores cannot turn into neon or white',()=>{
 for(const art of [[.35,.07,.05],[.16,.15,.18],[.6,.53,.46]]){
  const c=shadeEnvironment(art,[.22,.21,.31],[12,2,1],[.4,.02,.01]);
  assert.ok(delta(art,c)<=15);assert.ok(Math.max(...c)<=Math.max(...art)*1.25+.015);
 }
});
test('cached soil cleanup removes small bright islands while retaining broad cracks and alpha',async()=>{
 const api=await import('../web3d/material-cleanup.mjs').catch(()=>({}));
 assert.equal(typeof api.despeckleMaterial,'function','display-only material cleanup exists');
 const w=64,h=48,a=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++)a.set(x>=29&&x<=34?[25,20,19,255]:[70,60,55,255],(y*w+x)*4);
 for(const [x,y]of [[12,12],[44,28],[20,36]])for(let v=-1;v<=1;v++)for(let u=-1;u<=1;u++)a.set([180,160,145,255],((y+v)*w+x+u)*4);
 const before=a.slice(),b=api.despeckleMaterial(a,w,h,4);assert.deepEqual(a,before,'original albedo bytes immutable');
 for(const [x,y]of [[12,12],[44,28],[20,36]])assert.ok(b[(y*w+x)*4]<=71,'bright islands removed');
 assert.ok(b[(24*w+31)*4]<30,'broad dark crack retained');assert.equal(b[(24*w+5)*4+3],255);
});
test('depth raster uses the same supported paint operations as the native GPU proxy',async()=>{
 const api=await import('../web3d/native-prop-context.mjs').catch(()=>({}));assert.equal(typeof api.nativePropContext,'function','native paint capability adapter exists');
 const raw={filter:'none',globalCompositeOperation:'source-over',globalAlpha:1,shadowBlur:0,drawImage(){assert.equal(this,raw);return 'drawn';}};
 const proxy=api.nativePropContext(raw,true);proxy.filter='brightness(1.24) contrast(1.1)';proxy.globalCompositeOperation='lighter';proxy.shadowBlur=12;proxy.globalAlpha=.5;
 assert.equal(raw.filter,'none');assert.equal(raw.globalCompositeOperation,'source-over');assert.equal(raw.shadowBlur,0);assert.equal(raw.globalAlpha,.5);assert.equal(proxy.drawImage(),'drawn');
 assert.equal(api.nativePropContext(raw,false),raw,'native Canvas2D keeps its real filters');
});
test('native canopy opacity governs the displayed color instead of a second enemy fade',async()=>{
 const m=await import('../web3d/depth-layout.mjs');assert.equal(typeof m.presentationOcclusion,'function');
 const object={x:0,y:0},volume={object,left:-100,right:100,top:-200,bottom:100,foot:80},actors=[{x:0,y:0,hp:100}];
 assert.equal(m.presentationOcclusion(volume,actors,()=>1).alpha,1);
 assert.equal(m.presentationOcclusion(volume,actors,()=>.62).alpha,.62);
 assert.equal(m.presentationOcclusion(volume,actors).alpha,.35);
});
test('forest protection uses the native trimmed prop footprint, including the corpse-tree pivot',async()=>{
 const m=await import('../web3d/depth-layout.mjs');assert.equal(typeof m.nativePropStamp,'function');
 const row=m.nativePropStamp({type:'m_c1tree',x:1000,y:2000,_hand:true},{sz:1000,keepAR:1,sourceSize:[1000,1000],srcRect:[10,20,800,900],trimOffset:[100,50]},{naturalWidth:1024,naturalHeight:1024});
 assert.deepEqual(row.source,[10,20,800,900]);assert.deepEqual(row.destination,[712,1517.6,576,648]);
});

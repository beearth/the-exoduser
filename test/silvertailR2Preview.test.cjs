const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const dimensions={'01':[192,768],'02':[384,768],'03':[640,1280],'04':[480,480],'05':[768,1024],'06':[288,768]};

function environment(search,broken){
  let requested=[];const originalApply=(base,map,done)=>done(base,map);
  class Image{
    set src(value){requested.push(value);const key=Object.keys(dimensions).find(k=>value.includes('/'+k+'_'));[this.naturalWidth,this.naturalHeight]=dimensions[key]||[0,0];queueMicrotask(()=>{if(broken===key)this.onerror();else this.onload()});}
  }
  const scope={URLSearchParams,location:{search},Image,Promise,console,WarriorDashFlight:{apply:originalApply},document:{createElement:()=>({getContext:()=>({drawImage(){},imageSmoothingEnabled:true})})}};
  vm.createContext(scope);const file=path.join(root,'silvertail-r2-preview.js');vm.runInContext(fs.existsSync(file)?fs.readFileSync(file,'utf8'):'',scope);
  assert.ok(scope.SilvertailR2Preview,'missing opt-in sprite preview');return {scope,originalApply,requested};
}
const apply=(e,character='silvertail')=>new Promise(resolve=>{const base={width:480,height:1136};const map={sentinel:[{x:1,y:2,w:3,h:4}]};e.scope.WarriorDashFlight.apply(base,map,(image,frames)=>resolve({base,map,image,frames}),character)});

test('no spr flag leaves the legacy loader untouched and makes no asset requests',async()=>{
  const e=environment('?test=1');assert.equal(e.scope.SilvertailR2Preview.active,false);assert.equal(e.scope.WarriorDashFlight.apply,e.originalApply);const r=await apply(e);assert.equal(r.image,r.base);assert.equal(r.frames,r.map);assert.equal(e.requested.length,0);
});
test('only the exact silver_r2 query value opts in',()=>{
  for(const q of ['','?spr=other','?spr=silver_r2x','?silver_r2=1'])assert.equal(environment(q).scope.SilvertailR2Preview.active,false);
  assert.equal(environment('?spr=silver_r2').scope.SilvertailR2Preview.active,true);
});
test('opt-in leaves the other hero and its legacy frame map untouched',async()=>{
  const e=environment('?spr=silver_r2'),r=await apply(e,'warrior');assert.equal(r.image,r.base);assert.equal(r.frames,r.map);assert.equal(e.requested.length,0);
});
test('all six atlases provide eight directions, canonical clips and unchanged logical foot anchors',async()=>{
  const e=environment('?spr=silver_r2'),r=await apply(e);assert.equal(e.requested.length,6);assert.notEqual(r.image,r.base);assert.equal(r.image._silverR2,true);assert.equal(r.frames.sentinel,r.map.sentinel);
  for(const dir of ['s','se','e','ne','n','nw','w','sw']){
    for(const [anim,count] of Object.entries({idle:2,run:4,atk1:9,atk2:9,atk3:9,bash:9,gSlam1:4,gSlam2:4,whirlwind:4,hurt:3,dash_start:2,dash_fly:2,dash_land:2})){
      const frames=r.frames[anim+'_'+dir];assert.equal(frames.length,count,anim+'/'+dir);
      for(const f of frames){assert.equal(f.renderScale,.5);assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=r.image.width&&f.y+f.h<=r.image.height);}
    }
    for(const [anim,footY,expected] of [['idle',94,23],['atk1',124,22],['dash_fly',100,18]]){const f=r.frames[anim+'_'+dir][0];assert.equal(footY*f.renderScale-f.h*f.renderScale/2,expected);}
  }
  assert.deepEqual(Array.from(r.frames.atk1_s,f=>[f.x,f.y]),Array.from({length:9},(_,i)=>[i%3*160,r.frames.atk1_s[0].y+Math.floor(i/3)*160]));
});
test('one failed new atlas falls back atomically to the complete legacy result',async()=>{
  const e=environment('?spr=silver_r2','02'),r=await apply(e);assert.equal(r.image,r.base);assert.equal(r.frames,r.map);
});
test('twofold source renders at original logical size while untagged frames retain exact draw arguments',()=>{
  const html=fs.readFileSync(path.join(root,'game.html'),'utf8'),start=html.indexOf('const SpriteAnimator='),end=html.indexOf('// ── Atlas P',start);const scope={};vm.createContext(scope);vm.runInContext(html.slice(start,end)+';globalThis.sa=SpriteAnimator;',scope);
  for(const [scale,expected] of [[undefined,[-48,-48,96,96]],[.5,[-24,-24,48,48]]]){
    let args;const ctx={save(){},restore(){},translate(){},scale(){},drawImage(...a){args=a}};const f={x:0,y:0,w:96,h:96};if(scale)f.renderScale=scale;
    scope.sa.draw({img:{},fm:{idle_s:[f]},anim:'idle',f:0},ctx,0,0,false,'s');assert.deepEqual(args.slice(-4),expected);
  }
});

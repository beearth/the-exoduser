// CH1-1 altar moat (ch1-altar-moat.js) contracts.
// - visual only: the hill collision spec in game.html is untouched
// - liquid always covers the blocked band and is at most .024 (of the ellipse) wider
// - game.html / game-easy-test.html wiring (script tag, draw after hill, static lights)
// - runtime gates: other stages and the boss arena draw nothing and add no lights
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const moduleSrc=fs.readFileSync(path.join(ROOT,'ch1-altar-moat.js'),'utf8');
const gameSrc=fs.readFileSync(path.join(ROOT,'game.html'),'utf8');
const easySrc=fs.readFileSync(path.join(ROOT,'game-easy-test.html'),'utf8');
const buildSrc=fs.readFileSync(path.join(ROOT,'build-nwjs.mjs'),'utf8');
const HILL={cx:147,cy:98,rx:18,ry:9,inner:.84,outer:1.04,rampX0:125,rampX1:135,rampY:98,rampHalf0:1.8,rampHalf1:3};

function loadModule(){
  const images=[];
  const ctx={performance:{now:()=>0},Image:function(){images.push(this);this.complete=false;this.naturalWidth=0;},document:{createElement(){throw new Error('no build expected in tests');}}};
  ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(moduleSrc,ctx);
  return{moat:ctx.Ch1AltarMoat,images};
}

test('altar moat: collision spec in game.html is unchanged',()=>{
  for(const s of [gameSrc,easySrc]){
    assert.match(s,/const _CH1_HILL=\{cx:147,cy:98,rx:18,ry:9,inner:\.84,outer:1\.04,rampX0:125,rampX1:135,rampY:98,rampHalf0:1\.8,rampHalf1:3\};/);
    assert.match(s,/return d>=h\.inner&&d<=h\.outer;/);
  }
});

test('altar moat: liquid covers the blocked band and stays within .024 of it',()=>{
  const {moat}=loadModule();
  for(let i=0;i<3600;i++){
    const a=i/3600*Math.PI*2,dIn=moat._edgeD(HILL,a,false),dOut=moat._edgeD(HILL,a,true);
    assert.ok(dIn<=HILL.inner+1e-9,`inner edge inside collision at ${a}`);
    assert.ok(dOut>=HILL.outer-1e-9,`outer edge inside collision at ${a}`);
    assert.ok(HILL.inner-dIn<=.0241&&dOut-HILL.outer<=.0241,`liquid too wide at ${a}`);
  }
});

test('altar moat: wiring in both builds and in the package list',()=>{
  assert.match(gameSrc,/<script src="ch1-altar-moat\.js\?v=\d{8}-\d+"><\/script>/);
  for(const s of [gameSrc,easySrc]){
    assert.match(s,/_drawCh1Hill\(X\);\n\s*if\(globalThis\.Ch1AltarMoat\)Ch1AltarMoat\.draw\(X,G,_now,_CH1_HILL,T,VW,VH\);/);
    assert.match(s,/if\(G\.stage===0&&!G\._bossArena&&globalThis\.Ch1AltarMoat\)Ch1AltarMoat\.lights\(_slArr,_CH1_HILL,T\);/);
  }
  assert.match(buildSrc,/'ch1-altar-moat\.js'/);
  assert.ok(fs.existsSync(path.join(ROOT,'assets/map/ch1/collision/prop_pool.png')),'source art exists');
});

test('altar moat: ten green lights on the band centre line',()=>{
  const {moat}=loadModule(),arr=[];
  moat.lights(arr,HILL,40);
  assert.strictEqual(arr.length,10);
  const mid=(HILL.inner+HILL.outer)/2;
  for(const l of arr){
    const dx=(l.x/40-HILL.cx)/HILL.rx,dy=(l.y/40-HILL.cy)/HILL.ry;
    assert.ok(Math.abs(Math.hypot(dx,dy)-mid)<1e-9);
    assert.deepStrictEqual([l.r,l.a,l.cr,l.cg,l.cb,l.f],[210,.30,126,236,98,.7]);
  }
});

test('altar moat: other stages, the boss arena and unloaded art draw nothing',()=>{
  const {moat,images}=loadModule();
  let draws=0;const ctx={globalAlpha:1,drawImage(){draws++;}};
  moat.draw(ctx,{stage:1,cam:{x:5880,y:3920}},0,HILL,40,1600,900);
  moat.draw(ctx,{stage:0,_bossArena:true,cam:{x:5880,y:3920}},0,HILL,40,1600,900);
  assert.strictEqual(images.length,0,'no image request outside CH1-1 field');
  moat.draw(ctx,{stage:0,cam:{x:5880,y:3920}},0,HILL,40,1600,900);
  assert.strictEqual(images.length,1,'requests prop_pool once');
  assert.match(images[0].src,/assets\/map\/ch1\/collision\/prop_pool\.png$/);
  moat.draw(ctx,{stage:0,cam:{x:5880,y:3920}},16,HILL,40,1600,900);
  assert.strictEqual(images.length,1);
  assert.strictEqual(draws,0,'nothing drawn before the art is decoded');
  assert.strictEqual(moat.qa().built,false);
});

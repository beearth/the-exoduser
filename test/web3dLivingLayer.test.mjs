import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleURL=new URL('../web3d/living-layout.mjs',import.meta.url);
test('living layer keeps seed-stable foliage out of open combat ground without consuming native RNG',async()=>{
  assert.ok(fs.existsSync(moduleURL),'living layer layout must exist');
  const {foliageLayout}=await import(moduleURL);
  const map=Array.from({length:45},(_,y)=>Array.from({length:60},(_,x)=>x<4||x>55||y<4||y>40?1:0));
  const before=JSON.stringify(map),random=Math.random;
  Math.random=()=>{throw Error('native RNG consumed');};
  try{
    const a=foliageLayout(map,40,123),b=foliageLayout(map,40,123);
    assert.deepEqual(a,b);assert.notDeepEqual(a,foliageLayout(map,40,124));
    assert.ok(a.length>10);
    for(const p of a){assert.ok(p.x<300||p.x>2100||p.y<300||p.y>1450,'central combat space must stay empty');}
    assert.equal(JSON.stringify(map),before);
  }finally{Math.random=random;}
});
test('water mask follows the existing altar channel and leaves its west crossing dry',async()=>{
  assert.ok(fs.existsSync(moduleURL),'living layer water contract must exist');
  const {waterAt}=await import(moduleURL);
  const h={cx:147,cy:98,rx:18,ry:9,inner:.84,outer:1.04,rampX0:125,rampX1:135,rampY:98,rampHalf0:1.8,rampHalf1:3};
  assert.equal(waterAt(147*40,98*40,h,40),false);
  assert.equal(waterAt((147+18*.94)*40,98*40,h,40),true);
  assert.equal(waterAt((147-18*.94)*40,98*40,h,40),false);
  assert.equal(waterAt(147*40,(98+9*1.12)*40,h,40),false);
});
test('opt-in installs a transparent layer inside the native map pass, with native actors and HUD intact',()=>{
  const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
  assert.match(html,/_Web3DLivingLayer\?\.draw/,'native map must composite the live overlay');
  assert.ok(html.indexOf('_Web3DLivingLayer?.draw')<html.indexOf('  const _tWI=performance.now();'));
  assert.match(html,/import\('\.\/web3d\/living-layer\.mjs/);
});

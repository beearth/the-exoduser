import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
const source=html.slice(html.indexOf('let _worldDropFxWarmPromise='),html.indexOf('function _worldItemSkin(it){'));
function setup(){
  let now=0,tasks=0;const calls=[],queue=[];
  const env={G:{on:false},_bootLoadActive:true,_bootLoadKilled:false,_bootLoadEpoch:1,
    _worldDropFx:[0,1].map(()=>({complete:true,naturalWidth:1024,naturalHeight:2560})),_WORLD_DROP_FX_COLS:2,_worldDropFxTiles:[[],[]],
    performance:{now:()=>now},setTimeout(fn,ms){queue.push(()=>{now+=Math.max(ms,1);tasks++;fn()});},
    _worldDropFxTile(f,t){calls.push({f,t,task:tasks});now+=2;return env._worldDropFxTiles[f][t]={width:512,height:512};}};
  vm.createContext(env);vm.runInContext(source,env);
  async function drain(onTask=()=>{}){for(let i=0;i<1000;i++){await Promise.resolve();if(queue.length){onTask(i);queue.shift()();}else{await Promise.resolve();if(!queue.length)return;}}throw Error('unbounded preparation');}
  return {env,calls,drain,queue,advance:n=>now+=n};
}
test('all 20 tiles use the existing cache, yield individually and reuse identical objects',async()=>{
  const {env,calls,drain}=setup();const p=env._prepareWorldDropFx();assert.equal(env._prepareWorldDropFx(),p);
  await drain();const s=await p;assert.equal(s.status,'ready');assert.equal(s.created,20);assert.equal(s.pixelBytes,20971520);
  assert.equal(new Set(calls.map(c=>c.task)).size,20);assert.equal(s.processingMs,40);assert.equal(s.maxTileMs,2);
  const objects=env._worldDropFxTiles.flat();const again=env._prepareWorldDropFx();await drain();const s2=await again;
  assert.equal(s2.reused,20);assert.equal(s2.created,0);assert.equal(calls.length,20);
  assert.ok(objects.every((o,i)=>o===env._worldDropFxTiles.flat()[i]));
});
test('a delayed frame does not block a ready frame; both finish after arrival',async()=>{
  const {env,calls,drain}=setup();env._worldDropFx[0].complete=false;
  const p=env._prepareWorldDropFx();await drain(i=>{if(i===12)env._worldDropFx[0].complete=true;});
  assert.equal((await p).created,20);assert.equal(calls[0].f,1);
});
test('failed and undersized images only skip unavailable tiles; never create out-of-atlas tiles',async()=>{
  const {env,calls,drain}=setup();env._worldDropFx[0].naturalWidth=0;env._worldDropFx[1].naturalHeight=512;
  const p=env._prepareWorldDropFx();await drain();const s=await p;
  assert.equal(s.status,'partial');assert.equal(s.created,2);assert.equal(s.unavailable,18);assert.ok(calls.every(c=>c.f===1&&c.t<2));
});
test('stalled image has a finite timeout and later remains retryable',async()=>{
  const {env,drain}=setup();env._worldDropFx.forEach(img=>img.complete=false);
  const p=env._prepareWorldDropFx();await drain();assert.equal((await p).status,'timeout');
  env._worldDropFx.forEach(img=>img.complete=true);const retry=env._prepareWorldDropFx();await drain();assert.equal((await retry).created,20);
});
test('combat, cancellation or a replacement boot stops processing after the current task',async()=>{
  for(const change of [e=>e.G.on=true,e=>e._bootLoadActive=false,e=>e._bootLoadKilled=true,e=>e._bootLoadEpoch++]){
    const {env,calls,drain}=setup();const p=env._prepareWorldDropFx();await drain(()=>change(env));
    assert.equal((await p).status,'cancelled');assert.equal(calls.length,1);
  }
  const {env,calls}=setup();env.G.on=true;assert.equal(await env._prepareWorldDropFx(),null);assert.equal(calls.length,0);
});
test('processing failure preserves successful cache and releases in-flight guard for retry',async()=>{
  const {env,drain}=setup(),original=env._worldDropFxTile;env._worldDropFxTile=(f,t)=>{if(t===2)throw Error('allocation failure');return original(f,t);};
  const p=env._prepareWorldDropFx();await drain();assert.equal((await p).status,'failed');const first=env._worldDropFxTiles[0][0];
  env._worldDropFxTile=original;const retry=env._prepareWorldDropFx();await drain();assert.equal((await retry).created,18);assert.equal(env._worldDropFxTiles[0][0],first);
});
test('deadline includes processing time; remaining jobs use lazy fallback',async()=>{
  const {env,drain,advance}=setup(),original=env._worldDropFxTile;env._worldDropFxTile=(f,t)=>{advance(6000);return original(f,t);};
  const p=env._prepareWorldDropFx();await drain();const s=await p;assert.equal(s.created,1);assert.equal(s.status,'timeout');
});
test('common boot awaits optional preparation between asset preload and renderer initialization',()=>{
  assert.match(html,/await _preloadAssets\(\);\s*await _prepareWorldDropFx\(\);[^\n]*\nsetBootLoading\(80,[^\n]*\nawait _bootRenderer\(\);/);
  assert.match(html,/_bootLoadActive=true;_bootLoadKilled=false;_bootLoadEpoch\+\+;/);
});
test('replacement boot shares pending cancellation, then can retry after settlement',async()=>{
  const {env,drain}=setup();const old=env._prepareWorldDropFx();env._bootLoadEpoch++;
  assert.equal(env._prepareWorldDropFx(),old);await drain();assert.equal((await old).status,'cancelled');
  const fresh=env._prepareWorldDropFx();assert.notEqual(fresh,old);await drain();assert.equal((await fresh).created,20);
});

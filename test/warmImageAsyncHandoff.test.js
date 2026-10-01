import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
function fn(name){const a=html.indexOf('function '+name+'(');let i=html.indexOf('{',a),d=0;for(;i<html.length;i++){if(html[i]==='{')d++;else if(html[i]==='}'&&!--d)return html.slice(a,i+1)}throw Error(name)}
const tick=()=>new Promise(r=>setImmediate(r));
function setup(){
 const pending=[],bitmaps=[],uploads=[],draws=[],timers=[];let now=0;
 class Img {constructor(path='/assets/vfx/vfx_magic_burst.png'){this.src='http://qa.local'+path;this.complete=true;this.width=this.naturalWidth=1000;this.height=this.naturalHeight=1000}}
 const c=vm.createContext({URL,Map,Set,Number,HTMLImageElement:Img,location:{href:'http://qa.local/game.html',origin:'http://qa.local'},performance:{now:()=>now},console:{log(){}},
 fetch:abs=>new Promise((resolve,reject)=>pending.push({abs,resolve:()=>resolve({ok:true,blob:()=>({})}),reject})),
 createImageBitmap:async()=>{const b={width:1000,height:1000,closed:0,close(){this.closed++}};bitmaps.push(b);return b},
 _scheduleWarmupNext:()=>timers.push(true),_warmImageGpu:img=>draws.push(img),_warmShieldAuraGpu(){},_warmBonfireBarrierGpu(){},_warmPlayerAtlasGpu(){},_useGL:true,_texBySrc:new Map(),_texAdoptBitmap:(src,bmp)=>{uploads.push(src);c._texBySrc.set(src,{w:bmp.width,h:bmp.height})},
 _TEXHOT_INFLIGHT:2,_TEXHOT_QMAX:4,_TEXHOT_BUDGET_PX:64e6,_texPreQ:[],_texPreWait:[],_texPreSeen:new Set(),_texPreJobs:new Map(),_texPreBusy:0,_texPrePx:0,_texPreContextLost:false,
 _wqBuf:[],_wqIdx:0,_wqLen:0,_wqTotal:0,_wqQueued:new Set(),_wqGpuImages:new Set(),_wqAsyncWait:null,_ensWarmDone:false,_WQ_SHIELD_AURA:Symbol(),_WQ_BONFIRE_BARRIER:Symbol(),_WQ_PLAYER_ATLAS:Symbol()});
 const a=html.indexOf('const _WQ_ASYNC_PATHS='),b=html.indexOf('var _wqAsyncWait=',a);
 vm.runInContext(html.slice(a,b)+[' _texPreClose','_texPreReset','_texPrePump','_texPrewarmSrc','_texPreDrain','_warmAsyncTarget','_warmAsyncJob','_queueWarmFireAsync','_waitWarmAsync','_queueWarmImage','_warmupNext'].map(x=>fn(x.trim())).join('\n'),c);
 return {c,Img,pending,bitmaps,uploads,draws,timers,time:n=>now=n,resolve:async i=>{pending[i].resolve();await tick()}};
}
test('target admission before warm index, waits for decoded upload then adopts once',async()=>{
 const {c,Img,resolve,draws,uploads,bitmaps}=setup();const img=new Img();c._queueWarmImage(img,80);
 c._warmupNext();assert.equal(draws.length,0);assert.equal(c._wqIdx,0);
 await resolve(0);assert.equal(c._texPreJobs.get(img.src).status,'decoded');c._warmupNext();assert.equal(draws.length,0);
 c._texPreDrain();assert.equal(c._texPreJobs.get(img.src).status,'ready');c._warmupNext();
 assert.equal(draws.length,1);assert.equal(uploads.length,1);assert.equal(bitmaps[0].closed,1);assert.equal(c._wqIdx,1);
 c._queueWarmImage(img,80);assert.equal(c._wqLen,1);
});
test('duplicate URLs share one ticket and budget; gameplay-first cache avoids duplicate upload',async()=>{
 const {c,Img,resolve,pending,uploads,bitmaps}=setup(),img=new Img();const a=c._warmAsyncJob(img),b=c._warmAsyncJob(new Img());
 assert.equal(a,b);assert.equal(pending.length,1);assert.equal(c._texPrePx,1e6);
 c._texBySrc.set(img.src,{w:1000,h:1000});await resolve(0);c._texPreDrain();
 assert.equal(a.status,'ready');assert.equal(uploads.length,0);assert.equal(bitmaps[0].closed,1);
});
test('HTTP/decode failure and timeout retain synchronous warm fallback without poisoning success before draw',async()=>{
 const a=setup(),img=new a.Img();a.c._queueWarmImage(img,80);a.pending[0].reject(Error('fetch'));await tick();a.c._warmupNext();assert.equal(a.draws.length,1);
 const b=setup();b.c._queueWarmImage(new b.Img(),80);b.c._warmupNext();b.time(1999);b.c._warmupNext();assert.equal(b.draws.length,0);b.time(2000);b.c._warmupNext();assert.equal(b.draws.length,1);
 await b.resolve(0);b.c._texPreDrain();assert.equal(b.bitmaps[0].closed,1);
 const d=setup();d.c.createImageBitmap=async()=>{throw Error('decode')};d.c._queueWarmImage(new d.Img(),80);await d.resolve(0);d.c._warmupNext();assert.equal(d.draws.length,1);
});
test('context reset disposes queued/in-flight bitmaps exactly once; old work never uploads to restored context',async()=>{
 const a=setup();a.c._warmAsyncJob(new a.Img());a.c._warmAsyncJob(new a.Img('/assets/vfx/boss/vfx_void_black.png'));await a.resolve(0);
 a.c._texPreReset();a.c._texBySrc=new Map();a.c._texPreSeen.clear();a.c._texPrePx=0;assert.equal(a.bitmaps[0].closed,1);assert.equal(a.c._texPreBusy,1);
 a.c._warmAsyncJob(new a.Img());assert.equal(a.c._texPreBusy,2);await a.resolve(1);assert.equal(a.bitmaps[1].closed,1);assert.equal(a.uploads.length,0);
 await a.resolve(2);a.c._texPreDrain();assert.equal(a.bitmaps[2].closed,1);assert.equal(a.uploads.length,1);a.c._texPreReset();assert.ok(a.bitmaps.every(x=>x.closed===1));
});
test('in-flight reservation enforces decoded queue 4 and concurrency 2 across batch completions',async()=>{
 const a=setup();for(let i=0;i<9;i++)a.c._texPrewarmSrc('/assets/'+i+'.png',1e6);
 for(let i=0;i<4;i++)await a.resolve(i);
 assert.equal(a.c._texPreQ.length,4);assert.equal(a.pending.length,4);assert.equal(a.c._texPreBusy,0);
 a.c._texPreDrain();assert.equal(a.pending.length,5);assert.ok(a.c._texPreQ.length+a.c._texPreBusy<=4);
});
test('unsupported renderer/API, Canvas, non-target, foreign origin and budget keep original path',()=>{
 for(const mutate of [c=>c._useGL=false,c=>c.fetch=undefined,c=>c.createImageBitmap=undefined,c=>c._texPrePx=64e6]){
  const a=setup();mutate(a.c);a.c._queueWarmImage(new a.Img(),80);a.c._warmupNext();assert.equal(a.pending.length,0);assert.equal(a.draws.length,1);
 }
 const a=setup();for(const img of [{width:100,height:100},new a.Img('/assets/other.png'),Object.assign(new a.Img(),{src:'http://elsewhere/assets/vfx/vfx_magic_burst.png'})])a.c._queueWarmImage(img,80);
 assert.equal(a.pending.length,0);for(let i=0;i<3;i++)a.c._warmupNext();assert.equal(a.draws.length,3);
});
test('lost context never marks target warmed; queue replacement receives a fresh timeout',()=>{
 const a=setup(),img=new a.Img();a.c._queueWarmImage(img,80);a.c._warmupNext();a.time(1900);
 a.c._wqQueued=new Set();a.c._wqLen=0;a.c._wqIdx=0;a.c._queueWarmImage(img,80);a.c._warmupNext();a.time(2100);a.c._warmupNext();assert.equal(a.draws.length,0);
 a.c._texPreReset();a.c._texBySrc=null;a.c._useGL=false;a.c._texPreContextLost=true;a.c._warmupNext();assert.equal(a.draws.length,0);assert.equal(a.c._wqGpuImages.has(img),false);
});
test('failed upload still closes bitmap and advances job failure status',async()=>{
 const a=setup();const job=a.c._warmAsyncJob(new a.Img());await a.resolve(0);a.c._texAdoptBitmap=()=>{throw Error('upload')};a.c._texPreDrain();
 assert.equal(job.status,'failed');assert.equal(a.bitmaps[0].closed,1);
});

const firePath='/assets/vfx/fire_burst_radial.webp';
const primaryPaths=['/assets/vfx/vfx_magic_burst.png','/assets/vfx/boss/vfx_void_black.png','/assets/vfx/vfx_peace_shield.png'];
test('fire cannot preempt a missing or budget-rejected primary, even if it is collected first',()=>{
 const a=setup(),fire=new a.Img(firePath);a.c._queueWarmImage(fire,80);assert.equal(a.pending.length,0);assert.equal(a.c._texPrePx,0);
 for(const p of primaryPaths)a.c._queueWarmImage(new a.Img(p),80);
 a.c._queueWarmFireAsync();assert.equal(a.c._texPreJobs.get(fire.src).status,'pending');assert.equal(a.c._texPrePx,4e6);
 const b=setup();b.c._texPrePx=62e6;for(const p of primaryPaths)b.c._queueWarmImage(new b.Img(p),80);b.c._queueWarmImage(new b.Img(firePath),80);b.c._queueWarmFireAsync();assert.equal(b.c._texPrePx,64e6);assert.equal(b.c._texPreJobs.has(fire.src),false);
});
test('measured dimensions fit 64MP after original seed and three primary reservations',()=>{
 const a=setup();a.c._texPrePx=32204920;const dims=[[3264,4096],[2304,2304],[2400,1920]];
 primaryPaths.forEach((p,i)=>{const img=new a.Img(p);img.naturalWidth=dims[i][0];img.naturalHeight=dims[i][1];a.c._queueWarmImage(img,80)});
 const img=new a.Img(firePath);img.naturalWidth=3584;img.naturalHeight=1728;a.c._queueWarmImage(img,80);a.c._queueWarmFireAsync();
 assert.equal(a.c._texPrePx,61683832);assert.equal(64e6-a.c._texPrePx,2316168);assert.equal(a.c._texPreJobs.size,4);
});
test('cached primaries permit fire without extra primary reservation; insufficient residual budget falls back',()=>{
 const a=setup();for(const path of primaryPaths)a.c._texBySrc.set('http://qa.local'+path,{w:1,h:1});a.c._texPrePx=63999999;
 const img=new a.Img(firePath);a.c._queueWarmImage(img,80);a.c._queueWarmFireAsync();a.c._warmupNext();assert.equal(a.pending.length,0);assert.equal(a.draws.length,1);assert.equal(a.c._texPrePx,63999999);
});
test('deferred pass never admits fire outside capped queue or revives stale primary reservations',()=>{
 const a=setup();for(const path of primaryPaths)a.c._warmAsyncJob(new a.Img(path));a.c._queueWarmImage(new a.Img(firePath),0);a.c._queueWarmFireAsync();assert.equal(a.c._texPreJobs.size,3);
 for(const j of a.c._texPreJobs.values())j.status='stale';a.c._queueWarmImage(new a.Img(firePath),80);a.c._queueWarmFireAsync();assert.equal(a.c._texPreJobs.size,3);
});

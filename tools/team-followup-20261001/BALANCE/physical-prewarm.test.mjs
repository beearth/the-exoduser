import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';

const game=readFileSync(new URL('../../../game.html',import.meta.url),'utf8');
const candidate=readFileSync(new URL('./physical-prewarm-candidate.js',import.meta.url),'utf8');
const start=game.indexOf('function _physicalImpactSheet(img)');
const end=game.indexOf('function _waterBeanIceBurst(',start);
assert(start>=0&&end>start);
const helper=game.slice(start,end);
const tint=game.split('\n').find(line=>line.startsWith('function _tintHolyDome('));
assert(tint);

function harness({complete=true,syncCost=5,failRead=false}={}){
  let clock=0,nextId=1,reads=0,draws=0;const timers=new Map(),listeners=new Map();
  const pixels=new Uint8ClampedArray(512*512*4);
  for(let index=0;index<pixels.length;index+=4){pixels[index]=(index/4)%256;pixels[index+1]=17;pixels[index+2]=99;pixels[index+3]=(index/16)%256;}
  const image={src:'existing/fire.png',currentSrc:'existing/fire.png',complete,naturalWidth:complete?512:0,naturalHeight:complete?512:0,
    onload:'preserve-load',onerror:'preserve-error',
    addEventListener(type,handler){listeners.set(type,handler);},removeEventListener(type){listeners.delete(type);},
    emit(type){listeners.get(type)?.();}};
  const context=vm.createContext({G:{on:false},_bootLoadActive:true,_bootLoadKilled:false,_bootLoadEpoch:1,
    _tvfx2Imgs:{'Fire_ImpactFire_Sheet.png':image},performance:{now:()=>clock},
    setTimeout:(callback,delay)=>{const id=nextId++;timers.set(id,{at:clock+delay,callback});return id;},
    clearTimeout:id=>timers.delete(id),
    ImageData:class{constructor(data,width,height){this.data=data;this.width=width;this.height=height;}},
    document:{createElement(){const canvas={};canvas.getContext=()=>({
      drawImage(){draws++;},
      getImageData(){reads++;clock+=syncCost;if(failRead)throw Error('readback fixture');return {data:pixels};},
      createImageData(width,height){return {data:new Uint8ClampedArray(width*height*4)};},
      putImageData(output){canvas.output=output.data;}
    });return canvas;}}
  });
  vm.runInContext(`Math.random=()=>{throw Error('RNG forbidden')};${helper}\n${tint}\n${candidate}`,context);
  const flush=async()=>{for(let turn=0;turn<5;turn++)await Promise.resolve();};
  const advance=async duration=>{const target=clock+duration;while(true){const due=[...timers.entries()].filter(([,entry])=>entry.at<=target).sort((first,second)=>first[1].at-second[1].at)[0];if(!due)break;clock=due[1].at;timers.delete(due[0]);due[1].callback();await flush();}clock=Math.max(clock,target);await flush();};
  return {context,image,pixels,listeners,timers,flush,advance,run:()=>context._preparePhysicalImpactSheet(),reads:()=>reads,draws:()=>draws};
}

test('실제원helper/tint 실행·같은WeakMap/동일객체/재호출가공0/RNG0',async()=>{
  const h=harness();const first=h.run();assert.equal(h.run(),first,'공유inflight 동일Promise');
  const stats=await first;assert.equal(stats.status,'prepared');assert.equal(stats.syncMs,5);assert.equal(stats.pixelBytes,1048576);
  const sheet=h.context._physicalImpactSheet(h.image);assert.equal(h.reads(),1);assert.equal(h.context._physicalImpactSheet(h.image),sheet);
  for(let index=0;index<h.pixels.length;index+=4){assert.equal(sheet.output[index],255);assert.equal(sheet.output[index+1],255);assert.equal(sheet.output[index+2],255);assert.equal(sheet.output[index+3],Math.round(Math.max(h.pixels[index],h.pixels[index+1],h.pixels[index+2])*h.pixels[index+3]/255));}
  const second=await h.run();assert.equal(second.status,'reused');assert.equal(second.reuses,1);assert.equal(h.reads(),1);
  assert.equal(h.image.onload,'preserve-load');assert.equal(h.image.onerror,'preserve-error');
});

test('G.on/bootActive/killed 부트밖은 동기가공0',async()=>{
  for(const field of ['G.on','_bootLoadActive','_bootLoadKilled']){
    const h=harness();if(field==='G.on')h.context.G.on=true;else h.context[field]=field==='_bootLoadKilled';
    assert.equal((await h.run()).status,'outside-boot');assert.equal(h.reads(),0);assert.equal(h.draws(),0);
  }
});

test('미완료512이미지 load대기·기존handler불변·listener/timer cleanup',async()=>{
  const h=harness({complete:false});const result=h.run();await h.flush();assert.equal(h.listeners.size,2);
  h.image.complete=true;h.image.naturalWidth=512;h.image.naturalHeight=512;h.image.emit('load');
  assert.equal((await result).status,'prepared');assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);
  assert.equal(h.image.onload,'preserve-load');assert.equal(h.image.onerror,'preserve-error');
});

test('로드error/완료됐지만잘못된크기/missing은lazy 유지',async()=>{
  const h=harness({complete:false});const result=h.run();await h.flush();h.image.emit('error');assert.equal((await result).status,'load-failed');assert.equal(h.reads(),0);assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);
  const invalid=harness();invalid.image.naturalWidth=256;assert.equal((await invalid.run()).status,'load-failed');assert.equal(invalid.reads(),0);
  const missing=harness();delete missing.context._tvfx2Imgs['Fire_ImpactFire_Sheet.png'];assert.equal((await missing.run()).status,'missing');
});

test('대기중 G.on/killed/bootActive/epoch 취소와cleanup',async()=>{
  for(const field of ['G.on','_bootLoadKilled','_bootLoadActive','_bootLoadEpoch']){
    const h=harness({complete:false});const result=h.run();await h.flush();
    if(field==='G.on')h.context.G.on=true;else h.context[field]=field==='_bootLoadActive'?false:field==='_bootLoadEpoch'?2:true;
    await h.advance(16);assert.equal((await result).status,'cancelled');assert.equal(h.reads(),0);assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);
  }
});

test('대기뒤 src/currentSrc/identity변경 stale작업0',async()=>{
  for(const field of ['src','currentSrc','identity']){
    const h=harness({complete:false});const result=h.run();await h.flush();
    if(field==='identity')h.context._tvfx2Imgs['Fire_ImpactFire_Sheet.png']={...h.image};else h.image[field]='changed';
    await h.advance(16);assert.equal((await result).status,'stale');assert.equal(h.reads(),0);assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);
  }
});

test('250ms협력적대기예산·늦은load무효/무한예약0',async()=>{
  const h=harness({complete:false});const result=h.run();await h.flush();await h.advance(250);
  const stats=await result;assert.equal(stats.status,'timeout');assert.equal(stats.totalMs,250);assert.equal(h.timers.size,0);assert.equal(h.listeners.size,0);
  h.image.complete=true;h.image.naturalWidth=h.image.naturalHeight=512;h.image.emit('load');assert.equal(h.reads(),0);
});

test('동기가공예산초과는선점하지않고명시·lazy원캐시 유지',async()=>{
  const h=harness({syncCost:300});const stats=await h.run();assert.equal(stats.status,'prepared-over-budget');assert.equal(stats.syncMs,300);assert.equal(stats.totalMs,300);assert.equal(h.reads(),1);
  assert(h.context._physicalImpactSheet.cache.get(h.image));
});

test('가공예외는error·동기시간기록·기존lazy 재시도가능',async()=>{
  const h=harness({failRead:true});const stats=await h.run();assert.equal(stats.status,'error');assert.equal(stats.syncMs,5);assert.equal(stats.pixelBytes,0);assert.equal(h.context._physicalImpactSheet.cache.has(h.image),false);assert.equal(h.context._preparePhysicalImpactSheet.pending,null);
});

test('대기중원lazy이미준비된캐시는재사용',async()=>{
  const h=harness({complete:false});const result=h.run();await h.flush();h.image.complete=true;h.image.naturalWidth=h.image.naturalHeight=512;
  const lazy=h.context._physicalImpactSheet(h.image);h.image.emit('load');assert.equal((await result).status,'reused');assert.equal(h.context._physicalImpactSheet(h.image),lazy);assert.equal(h.reads(),1);
});

test('추출원문/후보해시',()=>{
  console.log(JSON.stringify({game:createHash('sha256').update(game).digest('hex'),helper:createHash('sha256').update(helper).digest('hex'),tint:createHash('sha256').update(tint).digest('hex'),candidate:createHash('sha256').update(candidate).digest('hex'),limits:'fake clock + 실제함수추출 + synthetic Canvas RGBA; 브라우저픽셀/실전미검수'}));
});

test('늦은getter예외/부분listener등록예외도settle과정리',async()=>{
  const h=harness({complete:false});const pending=h.run();await h.flush();
  Object.defineProperty(h.image,'src',{get(){throw Error('getter fixture');}});
  await h.advance(16);assert.equal((await pending).status,'error');assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);
  const partial=harness({complete:false});const add=partial.image.addEventListener;
  partial.image.addEventListener=(type,handler)=>{add(type,handler);if(type==='error')throw Error('partial listener fixture');};
  assert.equal((await partial.run()).status,'error');assert.equal(partial.listeners.size,0);
});

function initialLoad(){
  const state=harness({complete:false});
  Object.assign(state.image,{src:'http://127.0.0.1:3340/assets/Fire_ImpactFire_Sheet.png',currentSrc:'',srcset:'',sizes:''});
  return state;
}

function finishLoad(state){
  state.image.complete=true;state.image.naturalWidth=state.image.naturalHeight=512;state.image.emit('load');
}

test('정상 최초 currentSrc 확정은 같은객체/절대src/선택속성불변에서 준비·재호출0',async()=>{
  const state=initialLoad();const pending=state.run();await state.flush();await state.advance(32);
  state.image.currentSrc=state.image.src;finishLoad(state);
  const stats=await pending;assert.equal(stats.status,'prepared');assert.equal(stats.totalMs,37);
  const sheet=state.context._physicalImpactSheet(state.image);
  assert.equal((await state.run()).status,'reused');assert.equal(state.context._physicalImpactSheet(state.image),sheet);
  assert.equal(state.reads(),1);assert.equal(state.listeners.size,0);assert.equal(state.timers.size,0);
});

test('최초 확정 경계: 다른URL/선택URL/상대src/DOM속성없음/객체교체는 stale',async()=>{
  for(const variant of ['other','selected','relative','no-dom','identity','src']){
    const state=initialLoad();
    if(variant==='relative')state.image.src='assets/Fire_ImpactFire_Sheet.png';
    if(variant==='no-dom'){delete state.image.srcset;delete state.image.sizes;}
    const pending=state.run();await state.flush();state.image.currentSrc=state.image.src;
    if(variant==='other')state.image.currentSrc='https://evil.example/other.png';
    if(variant==='selected')state.image.currentSrc=state.image.src+'?selected=2';
    if(variant==='identity')state.context._tvfx2Imgs['Fire_ImpactFire_Sheet.png']={...state.image};
    if(variant==='src')state.image.src='https://evil.example/other.png';
    finishLoad(state);assert.equal((await pending).status,'stale',variant);assert.equal(state.reads(),0);
    assert.equal(state.listeners.size,0);assert.equal(state.timers.size,0);
  }
});

test('srcset/sizes 전환 및 기존선택속성은 정상주소처럼 보여도 거부',async()=>{
  for(const variant of ['srcset','sizes','initial-srcset','initial-sizes']){
    const state=initialLoad();const field=variant.includes('srcset')?'srcset':'sizes';
    if(variant.startsWith('initial'))state.image[field]='selected';
    const pending=state.run();await state.flush();state.image.currentSrc=state.image.src;
    if(!variant.startsWith('initial'))state.image[field]='changed';
    finishLoad(state);assert.equal((await pending).status,'stale',variant);assert.equal(state.reads(),0);
    assert.equal(state.listeners.size,0);assert.equal(state.timers.size,0);
  }
});

test('정상 최초확정 동시 epoch/취소 및 완료전확정은 거부',async()=>{
  for(const variant of ['epoch','killed','inactive','on','incomplete']){
    const state=initialLoad();const pending=state.run();await state.flush();state.image.currentSrc=state.image.src;
    if(variant==='epoch')state.context._bootLoadEpoch++;
    if(variant==='killed')state.context._bootLoadKilled=true;
    if(variant==='inactive')state.context._bootLoadActive=false;
    if(variant==='on')state.context.G.on=true;
    if(variant==='incomplete')state.image.emit('load');else finishLoad(state);
    assert.equal((await pending).status,variant==='incomplete'?'stale':'cancelled');assert.equal(state.reads(),0);
    assert.equal(state.listeners.size,0);assert.equal(state.timers.size,0);
  }
});

test('이미 확정된 currentSrc 변경은 요청src와 같아져도 거부',async()=>{
  const state=initialLoad();state.image.currentSrc=state.image.src+'?old=1';const pending=state.run();await state.flush();
  state.image.currentSrc=state.image.src;finishLoad(state);assert.equal((await pending).status,'stale');assert.equal(state.reads(),0);
});

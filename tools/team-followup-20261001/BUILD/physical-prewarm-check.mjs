import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const startedAt=new Date().toISOString();
const files=['game.html','test/physicalImpactPrewarm.test.mjs','tools/team-followup-20261001/QA/physical-prewarm-original.js','tools/team-followup-20261001/BALANCE/physical-prewarm-candidate.js','outputs/team-review-20261001/draw-attribution/physical-fixture.json'];
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sources=files.map(file=>({file,sha256:hash(file)}));
const game=fs.readFileSync(files[0],'utf8');
const testSource=fs.readFileSync(files[1],'utf8');
const harnessSource=testSource.slice(testSource.indexOf('const candidateStart='),testSource.indexOf("test('실제원helper"));
const {harness,helper,tint,candidate}=new Function('game','vm','assert',harnessSource+';return {harness,helper,tint,candidate};')(game,vm,assert);
const checks=[];
async function check(name,run){try{const actual=await run();checks.push({name,pass:true,actual});}catch(error){checks.push({name,pass:false,error:String(error.stack)});}}
await check('원 helper/tint 문자열 불변·후보/브라우저fixture 함수 동일',()=>{
  const original=fs.readFileSync(files[2],'utf8');
  assert(original.includes(helper.slice(0,helper.indexOf('// QA:')).trim()));assert(original.includes(tint));
  assert.equal(candidate.trim(),fs.readFileSync(files[3],'utf8').trim());
  const fixture=JSON.parse(fs.readFileSync(files[4],'utf8'));
  assert.equal(candidate.trim(),fixture.candidateFunction.trim());
  assert.equal(fixture.result.different,0);assert.equal(fixture.result.sameIdentity,true);
  return {fixtureBytes:fixture.result.bytes,fixtureOnly:true};
});
await check('부트 정의/활성화 이후 assets→drop→skins→physical→renderer 1회',()=>{
  const boot=game.slice(game.indexOf('(async function _boot(){'));
  const stages=['showBootLoading(','await _preloadAssets();','await _prepareWorldDropFx();','await _prepareWorldItemSkins();','await _preparePhysicalImpactSheet();','await _bootRenderer();'];
  const positions=stages.map(stage=>boot.indexOf(stage));assert(positions.every((value,index)=>value>=0&&(index===0||value>positions[index-1])));
  assert.equal(game.match(/await _preparePhysicalImpactSheet\(\);/g).length,1);
  assert(game.indexOf('let _bootLoadShownAt=')<game.indexOf('(async function _boot(){'));
  return {positions,missingBootDOM:'showBootLoading 조기return이면outside-boot;실제호출root확인'};
});
await check('microtask 시작 전 epoch 변경·동시 promise·완료후 재호출',async()=>{
  const harnessState=harness();const pending=harnessState.run();assert.equal(harnessState.run(),pending);
  harnessState.context._bootLoadEpoch++;assert.equal((await pending).status,'cancelled');assert.equal(harnessState.reads(),0);
  assert.equal((await harnessState.run()).status,'prepared');assert.equal((await harnessState.run()).status,'reused');assert.equal(harnessState.reads(),1);
  return 'cancelled→prepared→reused; read1';
});
for(const field of ['src','currentSrc','identity'])await check('load 동시 '+field+' 변경 stale→lazy',async()=>{
  const harnessState=harness({complete:false});const pending=harnessState.run();await harnessState.flush();
  harnessState.image.complete=true;harnessState.image.naturalWidth=harnessState.image.naturalHeight=512;
  if(field==='identity')harnessState.context._tvfx2Imgs['Fire_ImpactFire_Sheet.png']={...harnessState.image};else harnessState.image[field]='changed';
  harnessState.image.emit('load');assert.equal((await pending).status,'stale');assert.equal(harnessState.reads(),0);
  assert.equal(harnessState.timers.size,0);assert.equal(harnessState.listeners.size,0);
  const current=harnessState.context._tvfx2Imgs['Fire_ImpactFire_Sheet.png'];assert(harnessState.context._physicalImpactSheet(current));assert.equal(harnessState.reads(),1);
  return {status:'stale',lazyRead:1};
});
await check('정상 currentSrc 빈값→로드주소도 stale, 다음 명시호출 준비가능',async()=>{
  const harnessState=harness({complete:false});harnessState.image.currentSrc='';const pending=harnessState.run();await harnessState.flush();
  harnessState.image.currentSrc=harnessState.image.src;harnessState.image.complete=true;harnessState.image.naturalWidth=harnessState.image.naturalHeight=512;harnessState.image.emit('load');
  assert.equal((await pending).status,'stale');assert.equal(harnessState.reads(),0);assert.equal((await harnessState.run()).status,'prepared');
  return {input:'currentSrc=""→src, load512²',first:'stale',again:'prepared',bootAutomaticRetry:false};
});
for(const time of [249,250,400])await check('load 전달 시각 '+time+'ms 예산경계',async()=>{
  const harnessState=harness({complete:false});const pending=harnessState.run();await harnessState.flush();await harnessState.advance(time);
  harnessState.image.complete=true;harnessState.image.naturalWidth=harnessState.image.naturalHeight=512;harnessState.image.emit('load');
  const stats=await pending;assert.equal(stats.status,time<250?'prepared-over-budget':'timeout');assert.equal(harnessState.reads(),time<250?1:0);
  assert.equal(harnessState.timers.size,0);assert.equal(harnessState.listeners.size,0);return stats;
});
await check('취소우선순위·로드 동시 killed',async()=>{
  const harnessState=harness({complete:false});const pending=harnessState.run();await harnessState.flush();harnessState.context._bootLoadKilled=true;
  harnessState.image.complete=true;harnessState.image.naturalWidth=harnessState.image.naturalHeight=512;harnessState.image.emit('load');
  assert.equal((await pending).status,'cancelled');assert.equal(harnessState.reads(),0);return 'cancelled/read0';
});
await check('setTimeout 설치예외 settle 및 pending 해제',async()=>{
  const harnessState=harness({complete:false});harnessState.context.setTimeout=()=>{throw Error('schedule fixture');};
  const stats=await harnessState.run();assert.equal(stats.status,'error');assert.equal(harnessState.listeners.size,0);assert.equal(harnessState.context._preparePhysicalImpactSheet.pending,null);return stats;
});
await check('개별 remove 예외도 다른 remove/settle 수행; 잔존listener 명시',async()=>{
  const harnessState=harness({complete:false});const remove=harnessState.image.removeEventListener;
  harnessState.image.removeEventListener=type=>{if(type==='load')throw Error('remove fixture');remove(type);};
  const pending=harnessState.run();await harnessState.flush();harnessState.image.emit('error');const stats=await pending;
  assert.equal(stats.status,'load-failed');assert.equal(stats.errors.length,1);assert.equal(harnessState.listeners.size,1);assert.equal(harnessState.timers.size,0);
  return {stats,remainingListener:'load',nativeAPIExceptionOnly:true};
});
await check('가공예외후 원lazy 재시도·캐시 오염0',async()=>{
  const harnessState=harness();const originalTint=harnessState.context._tintHolyDome;harnessState.context._tintHolyDome=()=>{throw Error('tint fixture');};
  assert.equal((await harnessState.run()).status,'error');assert.equal(harnessState.context._physicalImpactSheet.cache.has(harnessState.image),false);
  harnessState.context._tintHolyDome=originalTint;assert(harnessState.context._physicalImpactSheet(harnessState.image));assert.equal(harnessState.reads(),1);return 'error→lazy read1';
});
await check('검사도중 입력SHA 불변',()=>{assert.deepEqual(files.map(file=>({file,sha256:hash(file)})),sources);return true;});
const evidence={startedAt,completedAt:new Date().toISOString(),sources,checks,pass:checks.filter(entry=>entry.pass).length,fail:checks.filter(entry=>!entry.pass).length,limits:'기존 synthetic Canvas/fake clock 하니스 재사용·독립 경계입력. 실제게임/브라우저 실행0. 성능개선/실제boot 미확인.'};
fs.writeFileSync('tools/team-followup-20261001/BUILD/physical-prewarm-evidence.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({pass:evidence.pass,fail:evidence.fail,sources}));if(evidence.fail)process.exitCode=1;

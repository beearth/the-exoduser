// STORY-cinbgm-fade-cancel-pause-1326 — _cinBgm 페이드 취소 시 구 Audio pause 보장 (1312 후보 정정)
//
// 감독 HOLD: 1312 _cinBgmFade 후보는 clearInterval 만 하고 옛 Audio 를 pause 하지 않아 페이드 중 취소 시
// 구 source 가 영구 재생될 수 있는데 "pause 한다"고 주장했다. 같은 후보를 정정한다:
//  - fading Audio 와 interval 소유자를 함께 캡처(_fade={a,id}),
//  - 취소 경로가 구 Audio 를 pause,
//  - 이전 self-clear 콜백이 새 interval 을 clear 하거나 새 Audio 를 pause 하지 못하게(소유자 비교).
// 실제 startCinBgm(2130)/stopCinBgm(2135) 전문을 verbatim 추출해 original/flawed(1312)/corrected 를
// 가짜 Audio·가상 timer 원장으로 대조한다. 원소스 수정 0. 실제 청취 Gate 미인수(native/청취 분리).
// Node=/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node

import fs from 'node:fs'; import crypto from 'node:crypto'; import vm from 'node:vm';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const idx=fs.readFileSync(ROOT+'/index.html','utf8'); const L=idx.split('\n');

// ── 원문 verbatim 추출(2129-2135: _cinBgm/startCinBgm/stopCinBgm; stopLobbyBgm 2131-2134 제외) ──
const startSrc=L[2130-1]; const stopSrc=L[2135-1];
if(!/^function startCinBgm\(\)\{/.test(startSrc)||!/_cinBgm=new Audio/.test(startSrc)) throw new Error('startCinBgm 마커 불일치');
if(!/^function stopCinBgm\(\)\{if\(!_cinBgm\)return;/.test(stopSrc)||!/clearInterval\(_fd\);try\{_a\.pause\(\)/.test(stopSrc)) throw new Error('stopCinBgm 마커 불일치');
console.log('startCinBgm SHA', sha(startSrc)); console.log('stopCinBgm SHA', sha(stopSrc));

// ── flawed(1312): clearInterval 만, pause 없음 (버그 재현용) ──
const startFlawed="function startCinBgm(){try{if(_cinBgmFade){clearInterval(_cinBgmFade);_cinBgmFade=null;}if(_cinBgm)return;_cinBgm=new Audio(_CIN_BGM_TRACKS[0]);_cinBgm.volume=0.6;_cinBgm.play().catch(()=>{})}catch(e){}}";
const stopFlawed="function stopCinBgm(){if(_cinBgmFade){clearInterval(_cinBgmFade);_cinBgmFade=null;}if(!_cinBgm)return;const _a=_cinBgm;_cinBgm=null;_cinBgmFade=setInterval(()=>{if(_a.volume>0.06){_a.volume=Math.max(0,_a.volume-0.06)}else{clearInterval(_cinBgmFade);_cinBgmFade=null;try{_a.pause()}catch(e){}}},50)}";

// ── corrected: 취소 시 구 Audio pause + 소유자 캡처 ──
const corrDecl="let _cinBgmFade=null;function _cancelCinBgmFade(){if(_cinBgmFade){clearInterval(_cinBgmFade.id);try{_cinBgmFade.a.pause()}catch(e){}_cinBgmFade=null;}}";
const startCorr="function startCinBgm(){try{_cancelCinBgmFade();if(_cinBgm)return;_cinBgm=new Audio(_CIN_BGM_TRACKS[0]);_cinBgm.volume=0.6;_cinBgm.play().catch(()=>{})}catch(e){}}";
const stopCorr="function stopCinBgm(){_cancelCinBgmFade();if(!_cinBgm)return;const _a=_cinBgm;_cinBgm=null;const _fade={a:_a,id:null};_fade.id=setInterval(()=>{if(_a.volume>0.06){_a.volume=Math.max(0,_a.volume-0.06)}else{clearInterval(_fade.id);if(_cinBgmFade===_fade)_cinBgmFade=null;try{_a.pause()}catch(e){}}},50);_cinBgmFade=_fade;}";

// ── 가짜 Audio + 가상 timer ──
function makeEnv(decl){
  let now=0,seq=0; const timers=new Map(); const audios=[];
  const setInterval=(fn,ms)=>{const id=++seq;timers.set(id,{fn,ms,next:now+ms,cancelled:false});return id;};
  const clearInterval=id=>{const t=timers.get(id);if(t)t.cancelled=true;};
  const advance=ms=>{const tgt=now+ms;let guard=0;while(guard++<100000){let fire=null;for(const [id,t] of timers){if(!t.cancelled&&t.next<=tgt&&(!fire||t.next<fire[1].next))fire=[id,t];}if(!fire)break;now=fire[1].next;fire[1].next+=fire[1].ms;fire[1].fn();}now=tgt;};
  function Audio(src){const a={src,volume:1,paused:true,play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;}};audios.push(a);return a;}
  const sandbox={ _CIN_BGM_TRACKS:['t0','t1','t2','t3'], _cinBgm:null, Audio, setInterval, clearInterval, console:{log(){}}, Promise };
  vm.createContext(sandbox);
  vm.runInContext(decl, sandbox);
  return { sandbox, advance, audios, aliveTimers:()=>[...timers.values()].filter(t=>!t.cancelled).length };
}
function build(variant){
  if(variant==='original') return makeEnv('let _cinBgm=null;'+startSrc+'\n'+stopSrc);
  if(variant==='flawed')   return makeEnv('let _cinBgm=null;let _cinBgmFade=null;'+startFlawed+'\n'+stopFlawed);
  if(variant==='corrected')return makeEnv('let _cinBgm=null;'+corrDecl+startCorr+'\n'+stopCorr);
}
const run=(e,fn)=>vm.runInContext(fn+'()',e.sandbox);

let pass=0,fail=0; const ck=(n,g,w)=>{const ok=Object.is(g,w);console.log((ok?'PASS':'FAIL')+' | '+n+' | got='+JSON.stringify(g)+' want='+JSON.stringify(w));ok?pass++:fail++;};
const playing=e=>e.audios.filter(a=>!a.paused).length;

console.log('\n== 정상 1회 페이드 (start → stop → advance) : 세 변형 모두 구 Audio pause 돼야 ==');
for(const v of ['original','flawed','corrected']){
  const e=build(v); run(e,'startCinBgm'); run(e,'stopCinBgm'); e.advance(2000);
  ck(v+': 정상 페이드 후 재생 중 Audio 0', playing(e), 0);
  ck(v+': 정상 페이드 후 살아있는 timer 0', e.aliveTimers(), 0);
}

console.log('\n== 빠른 재진입 취소: start(a1) → stop(a1 페이드 시작) → (페이드 중) start(a2) → advance ==');
for(const v of ['original','flawed','corrected']){
  const e=build(v);
  run(e,'startCinBgm');          // a1
  run(e,'stopCinBgm');           // a1 페이드 시작
  e.advance(100);                // 페이드 2틱(vol 0.6→~0.48), 아직 진행중
  run(e,'startCinBgm');          // a2 (취소 경로 발동)
  e.advance(2000);               // 끝까지
  const live=e.audios.filter(a=>!a.paused);
  console.log('  ['+v+'] audios='+e.audios.length+' 재생중='+live.length+' aliveTimers='+e.aliveTimers());
  // 식별자(생성순) 기반 단언: a1=audios[0], a2=audios[1] (src 는 랜덤/하드코딩 무관)
  if(v==='flawed'){
    ck('flawed: 취소된 a1(audios[0]) 이 pause 안 되고 영구 재생(버그)', e.audios[0].paused, false);
    ck('flawed: 재생 중 Audio 2개(a1 영구 + a2) 오버랩', playing(e), 2);
  } else {
    ck(v+': 재진입 후 구 a1(audios[0]) pause', e.audios[0].paused, true);
    ck(v+': 재진입 후 신 a2(audios[1]) 재생 중', e.audios[1].paused, false);
    ck(v+': 재진입 후 재생 중 Audio 1만', playing(e), 1);
    ck(v+': 재진입 후 살아있는 timer 0(orphan 없음)', e.aliveTimers(), 0);
  }
}

console.log('\n== corrected: 이전 self-clear 콜백이 새 fade/Audio 를 건드리지 않음 (소유자 비교) ==');
{
  const e=build('corrected');
  run(e,'startCinBgm');          // a1
  run(e,'stopCinBgm');           // fade1(a1)
  run(e,'startCinBgm');          // a2 (취소: a1 pause, fade1 clear)  — _cinBgm 은? start 은 _cinBgm null 이어야 생성
  run(e,'stopCinBgm');           // fade2(a2)
  e.advance(2000);
  ck('corrected: 2회 재진입 후 재생 중 0(모두 정리)', playing(e), 0);
  ck('corrected: orphan timer 0', e.aliveTimers(), 0);
}

console.log('\n== '+pass+' PASS / '+fail+' FAIL ==');
console.log('원문 startCinBgm/stopCinBgm=추출 verbatim. flawed=1312 후보(clearInterval만). corrected=취소 시 구 Audio pause+소유자 캡처.');
console.log('가짜 Audio/timer 원장만 — 실제 청취/native/화면 미검수(UNKNOWN). 볼륨 0.6/0.06/50ms·트랙풀 불변. productionApplied=false.');
process.exit(fail?1:0);

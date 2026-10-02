// STORY-door-timer-reentry-1405 — door-phase onVidClick 미추적 타이머(prompt-hide/진동)의 재진입 잔존
//
// onVidClick(index.html)은 setTimeout(prompt.display='none',1200)(2374)과 8개 진동 setTimeout(2382)을
// 등록하나 _clearVidTimers(2227-2230)는 _vidFadeTimer/_vidStartTimer 만 clear → 이 둘은 미추적.
// skip/재진입 시 run1 의 stale prompt-hide 가 run2 의 ENTER prompt(display 복원)을 다시 숨기고(DOM 덮음),
// stale 진동이 새 scene/로비에서 발화. 실제 _clearVidTimers 를 호출(종료 경로가 호출)로 정리되는지 검증.
// 자막/oldAudio/fade/hold/5caller 검사 반복 0. 원소스 수정 0. 실제 native/청취/시각 미인수.
// Node=/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node

import fs from 'node:fs'; import crypto from 'node:crypto'; import vm from 'node:vm';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const idx=fs.readFileSync(ROOT+'/index.html','utf8'); const L=idx.split('\n');

// ── 원문 verbatim 추출 + 마커 ──
const clearSrc=L.slice(2227-1,2230).join('\n');
if(!/^function _clearVidTimers\(\)\{/.test(clearSrc)||!/_vidStartTimer\)\{clearTimeout\(_vidStartTimer\)/.test(clearSrc)) throw new Error('_clearVidTimers 마커 불일치');
const promptLine=L[2374-1];
if(!/setTimeout\(\(\)=>\{prompt\.style\.display='none'\},1200\);/.test(promptLine)) throw new Error('prompt-hide 마커 불일치');
const vibBlock=L.slice(2380-1,2383).join('\n');
if(!/_steps\.forEach\(s=>\{setTimeout\(\(\)=>\{/.test(vibBlock)||!/vibrationActuator/.test(vibBlock)) throw new Error('진동 블록 마커 불일치');
console.log('_clearVidTimers SHA', sha(clearSrc));
console.log('promptLine SHA', sha(promptLine));
console.log('vibBlock SHA', sha(vibBlock));

// ── 등록부(현재/후보). 후보: prompt-hide 추적 + 진동 id 추적 ──
const promptCur=promptLine.trim();                                   // setTimeout(...,1200);
const promptCand="_vidPromptTimer="+promptLine.trim();               // _vidPromptTimer=setTimeout(...,1200);
const vibCur=vibBlock;                                               // 원문
const vibCand=vibBlock.replace('_steps.forEach(s=>{setTimeout(()=>{','_steps.forEach(s=>{_vidVibTimers.push(setTimeout(()=>{')
                      .replace('},s[0])});','},s[0]))});');
if(vibCand===vibBlock) throw new Error('진동 후보 transform 실패');
// ── _clearVidTimers (현재/후보) ──
const clearCand=clearSrc.replace(/\n\}\s*$/,
  "\n  if(_vidPromptTimer){clearTimeout(_vidPromptTimer);_vidPromptTimer=null;}\n  _vidVibTimers.forEach(id=>clearTimeout(id));_vidVibTimers.length=0;\n}");
if(clearCand===clearSrc) throw new Error('_clearVidTimers 후보 transform 실패');

function makeEnv(){
  let now=0,seq=0; const timers=new Map();
  const setTimeout=(fn,ms)=>{const id=++seq;timers.set(id,{fn,at:now+ms,cancelled:false,interval:false});return id;};
  const setInterval=(fn,ms)=>{const id=++seq;timers.set(id,{fn,at:now+ms,ms,cancelled:false,interval:true});return id;};
  const clearTimeout=id=>{const t=timers.get(id);if(t)t.cancelled=true;};
  const clearInterval=clearTimeout;
  const advance=ms=>{const tgt=now+ms;let g=0;while(g++<100000){let f=null;for(const[id,t]of timers){if(!t.cancelled&&t.at<=tgt&&(!f||t.at<f[1].at))f=[id,t];}if(!f)break;now=f[1].at;if(f[1].interval){f[1].at+=f[1].ms;}else{timers.delete(f[0]);}f[1].fn();}now=tgt;};
  let vibCount=0;
  const sb={ prompt:{style:{display:''},querySelector:()=>null},
    _GP:{vibRef:{vibrationActuator:{playEffect:()=>{vibCount++;return Promise.resolve();}}}},
    _vidFadeTimer:null,_vidStartTimer:null,_vidPromptTimer:null,_vidVibTimers:[],
    setTimeout,setInterval,clearTimeout,clearInterval,Promise,console:{log(){}},
    get _vibCount(){return vibCount;} };
  vm.createContext(sb); return {sb,advance};
}
function build(variant){
  const e=makeEnv();
  const clear=variant==='cand'?clearCand:clearSrc;
  const reg = variant==='cand'
    ? "function registerDoorTimers(){\n"+promptCand+"\n"+vibCand+"\n}"
    : "function registerDoorTimers(){\n"+promptCur+"\n"+vibCur+"\n}";
  vm.runInContext(clear+'\n'+reg, e.sb);
  return e;
}
const run=(e,fn)=>vm.runInContext(fn+'()',e.sb);
const promptDisp=e=>e.sb.prompt.style.display;
const vibN=e=>e.sb._vibCount;

let pass=0,fail=0; const ck=(n,g,w)=>{const ok=Object.is(g,w);console.log((ok?'PASS':'FAIL')+' | '+n+' | got='+JSON.stringify(g)+' want='+JSON.stringify(w));ok?pass++:fail++;};

console.log('\n== S1 현재식 재진입: run1 door timers → _clearVidTimers → (재진입)prompt.display="" → advance 3500 ==');
{
  const e=build('cur');
  run(e,'registerDoorTimers');          // run1 door: prompt-hide@1200 + 진동 8스텝
  run(e,'_clearVidTimers');              // 종료 경로의 정리(현재: prompt/진동 미정리)
  e.sb.prompt.style.display='';          // 재진입 _goCinematic 이 ENTER prompt 복원(2724)
  e.advance(3500);
  console.log('  prompt.display='+JSON.stringify(promptDisp(e))+' vib='+vibN(e));
  ck('현재식: stale prompt-hide 가 재진입 ENTER prompt 를 다시 숨김(DOM 덮음)', promptDisp(e), 'none');
  ck('현재식: stale 진동 8스텝이 teardown 후에도 발화', vibN(e), 8);
}

console.log('\n== S2 후보 재진입: 추적+clear ==');
{
  const e=build('cand');
  run(e,'registerDoorTimers');
  run(e,'_clearVidTimers');              // 후보: prompt/진동 timer clear
  e.sb.prompt.style.display='';
  e.advance(3500);
  console.log('  prompt.display='+JSON.stringify(promptDisp(e))+' vib='+vibN(e));
  ck('후보: 재진입 ENTER prompt 유지(stale 미발화)', promptDisp(e), '');
  ck('후보: stale 진동 0', vibN(e), 0);
}

console.log('\n== S3 control 정상 1회(종료 없음): prompt 1200 에 숨김 + 진동 8 정상 ==');
for(const v of ['cur','cand']){
  const e=build(v);
  run(e,'registerDoorTimers');
  e.advance(3500);                       // teardown 없이 자연 경과
  ck(v+' control: prompt 정상 숨김', promptDisp(e), 'none');
  ck(v+' control: 진동 8스텝 정상 발화', vibN(e), 8);
}

console.log('\n== '+pass+' PASS / '+fail+' FAIL ==');
console.log('원문 _clearVidTimers/prompt-hide/진동블록=추출 verbatim. 정리는 실제 _clearVidTimers 호출로 발생(종료 경로가 호출).');
console.log('가짜 timer/prompt/진동 카운터만 — 실제 native 진동·화면·청취 미검수(UNKNOWN). 1200/진동 스텝 수치 불변. productionApplied=false.');
process.exit(fail?1:0);

# STORY-ember-restart-lifecycle-1454 — cinScene ember interval 재진입 미복원 patch + 실행 근거 (단일 artifact)

담당 STORY(Claude, UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`, provider Claude Code) · 한국어.
credit: epoch `rolling-after-e764-1445`(STORY 1 file credit) → **이 `result.md` 1개**에 patch·스크립트·원출력·pins·docs 인계 내장. production·공유docs·Git·게임/save/UI·삭제/이동·새세션/권한 0. `productionApplied=false`, native/화면/청취 미인수.

## 0. pins·시각

| 항목 | 값 |
|---|---|
| index.html whole SHA256(실Read 시점) | `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` |
| ember block(index.html:2603-2618) fragment SHA256 | `83d6705d62760e0bfe4147f8860c19cec17a815cb7b0cd46e09a088a9198da1d` |
| 원문 수치(불변) | 주기 150ms, self-remove 7000ms, ember 색/크기 |
| 검증 실행 UTC | 2026-10-02T14:37:57Z → **8 PASS / 0 FAIL, exit 0**(transient scratch, repo 파일 0) |
| 첫 실패 보완 | 이 ember artifact는 **첫 실행에서 실패 없음(8 PASS)**. (1326/1405의 첫 SyntaxError와 달리 교정 불필요 — 정직 기록.) |

## 1. 결함 요지 (재진입 미복원)
`_emberIv`는 모듈 레벨 `setInterval(…,150)`(index.html:2603, **할당 2603 1곳뿐**), body는 cinScene 숨김 시 early-return, 아니면 `div.ember` append + 7000ms self-remove. `clearInterval(_emberIv)`은 `_goLogin`(2686)·`_goLobby`(2745)에만. `_goCinematic`(재진입)은 `cinScene.style.display=''`(2729)만 하고 **ember interval 재시작 없음** → **2번째+ 시네마틱에 불씨 연출 사라짐**. 가설(stale interval 중복/DOM 덮음)은 재현 안 됨(할당 1곳, 중복 경로 없음; ember div는 자기만 remove).

## 2. 최소 patch 후보 (productionApplied=false — root 적용)
```js
let _emberIv=null;
function _startEmbers(){ if(_emberIv)return; _emberIv=setInterval(()=>{
  const scene=$('cinScene');
  if(!scene||scene.style.display==='none')return;
  const e=document.createElement('div');
  e.className='ember';
  e.style.left=(20+Math.random()*60)+'vw';
  e.style.bottom='-5px';
  const sz=2+Math.random()*3;
  e.style.width=sz+'px';e.style.height=sz+'px';
  const hue=10+Math.random()*25;
  e.style.background=`hsl(${hue},100%,${50+Math.random()*30}%)`;
  e.style.boxShadow=`0 0 ${3+Math.random()*6}px hsl(${hue},100%,50%)`;
  e.style.animation=`rise ${3+Math.random()*4}s ease-out forwards`;
  scene.appendChild(e);
  setTimeout(()=>e.remove(),7000);
},150); }
function _stopEmbers(){ if(_emberIv){clearInterval(_emberIv);_emberIv=null;} }
// 초기(2603 위치): _startEmbers();
// _goLogin(2686)/_goLobby(2745): clearInterval(_emberIv) → _stopEmbers();
// _goCinematic: cinScene 표시(2729) 후 _startEmbers();
```
body는 index.html:2604-2617 **verbatim**. `if(_emberIv)return` 가드로 중복 방지, `_stopEmbers` null화로 재시작 가능. 주기 150·self-remove 7000·색/크기·DOM leaf·대사·연출 수치 불변.

## 3. 실행 스크립트 (transient, 이번 재실행 안 함 — 원출력 §4)
```js
import fs from 'node:fs'; import vm from 'node:vm'; import crypto from 'node:crypto';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const L=fs.readFileSync(ROOT+'/index.html','utf8').split('\n');
const block=L.slice(2603-1,2618).join('\n');
if(!/let _emberIv=setInterval\(\(\)=>\{/.test(block)||!/setTimeout\(\(\)=>e\.remove\(\),7000\);/.test(block)||!/\},150\);$/.test(block)) throw new Error('ember 블록 마커 불일치');
const body=L.slice(2604-1,2617).join('\n');
const PERIOD=block.match(/\},(\d+)\);$/)[1]; const REMOVE=body.match(/e\.remove\(\),(\d+)\)/)[1];
function env(){ let now=0,seq=0; const timers=new Map(); let appendN=0, removeN=0;
  const setInterval=(fn,ms)=>{const id=++seq;timers.set(id,{fn,at:now+ms,ms,iv:true,c:false});return id;};
  const setTimeout=(fn,ms)=>{const id=++seq;timers.set(id,{fn,at:now+ms,iv:false,c:false});return id;};
  const clearInterval=id=>{const t=timers.get(id);if(t)t.c=true;};
  const advance=ms=>{const tgt=now+ms;let g=0;while(g++<100000){let f=null;for(const[id,t]of timers){if(!t.c&&t.at<=tgt&&(!f||t.at<f[1].at))f=[id,t];}if(!f)break;now=f[1].at;if(f[1].iv)f[1].at+=f[1].ms;else timers.delete(f[0]);f[1].fn();}now=tgt;};
  const alive=()=>[...timers.values()].filter(t=>!t.c&&t.iv).length;
  const scene={style:{display:''},_kids:0, appendChild(){appendN++;this._kids++;}};
  const el=()=>({style:{}, remove(){removeN++;scene._kids--;}});
  const document={createElement:()=>el()}; const $=()=>scene;
  const sb={document,$,setInterval,setTimeout,clearInterval,Math,scene,
    get _appendN(){return appendN;}, get _removeN(){return removeN;}, _alive:alive, _emberIv:null };
  vm.createContext(sb); return {sb,advance}; }
const START="function _startEmbers(){ if(_emberIv)return; _emberIv=setInterval(()=>{\n"+body+"\n},"+PERIOD+"); }";
const STOP="function _stopEmbers(){ if(_emberIv){clearInterval(_emberIv);_emberIv=null;} }";
function buildCand(){const e=env(); vm.runInContext(START+'\n'+STOP,e.sb); return e;}
function buildCur(){const e=env(); vm.runInContext("function _startModule(){ _emberIv=setInterval(()=>{\n"+body+"\n},"+PERIOD+"); }\nfunction _clearModule(){ clearInterval(_emberIv); }",e.sb); return e;}
const call=(e,fn)=>vm.runInContext(fn+'()',e.sb);
// 정상1회 / stop→2차 재진입(현재식 vs 후보) / 중복start 가드 (assert 8)
```
(DOM/clock stub + 원문 body verbatim. `_goLogin/_goLobby/_goCinematic` whole closure 통합은 대역=fixture.)

## 4. 원출력 (2026-10-02T14:37:57Z, exit 0)
```
ember block SHA 83d6705d62760e0bfe4147f8860c19cec17a815cb7b0cd46e09a088a9198da1d  (index.html:2603-2618, wholeSHA=1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7)
원문 주기=150 self-remove=7000
== 정상 1회: start → advance 300(2틱 append) → advance 7000(self-remove) ==
PASS | 후보 정상: 2틱 append=2 | got=2 want=2
PASS | 후보 정상: alive interval 1 | got=1 want=1
PASS | 후보 정상: self-remove 2(child 정리) | got=2 want=2
== stop→2차 재진입 중복 start: 현재식(재시작 없음) vs 후보 ==
  현재식 1차 append=2 재진입후 총 append=2 alive=0
PASS | 현재식: 재진입 후 2차 ember 미생성(1차=재진입후 동일) | got=2 want=2
PASS | 현재식: clear 후 alive interval 0 | got=0 want=0
  후보 1차 append=2 재진입후 총 append=4 alive=1
PASS | 후보: 재진입 2차 ember 복원(총 append 증가) | got=true want=true
PASS | 후보: stop→restart 후 alive interval 1(중복 아님) | got=1 want=1
== 중복 start 가드: _startEmbers 2연속 → interval 1 ==
PASS | 후보: 중복 start 가드 → alive 1 | got=1 want=1
== 8 PASS / 0 FAIL ==   exit=0
```

## 5. docs 인계·Gate
- **docs(root):** `cinematic/ENTER_ENGRAVED_20260907.md` 또는 `WORLD_INTRO_INGAME_20260907.md`에 "cinScene ember interval = `_startEmbers`/`_stopEmbers` 단일 가드, 종료(_goLogin/_goLobby) stop + 재진입(_goCinematic) 재시작" 수명 불변식 신규 기록(전체 rg 동기화). 공용 `index.html`·Git은 원총괄/root. 150/7000/색/크기 수치 변경 0.
- **Gate/대역:** 원문 body verbatim 실행 + 가상 clock/카운터. `_goCinematic` whole closure 통합·실 native 불씨 화면은 미검수(UNKNOWN). source/fixture ≠ native6/화면/청취, 제품 완료 숫자 0.
- **보존:** 1134/1212/1300/1326/1405 및 제출 옛 폴더 불변, 기존 8 재실행 0, door/fade/audio/subtitle/정적표 중복 0.

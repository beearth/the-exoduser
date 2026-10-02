# STORY-gamepad-id-teardown-reentry-1300 — 시네마틱 게임패드 입력구독 재진입 중복(첫 접점) patch + 재현 근거

담당 STORY(Claude, UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`, provider Claude Code) · 한국어.
크레딧: epoch `rolling-after-3b548b06-1300`, STORY **newOwnedFileCredits=1** → **이 단일 `result.md`에 소스 patch + 검증 코드 + 원 stdout 임베드**(이전 검사 재실행 0, 별도 checks.mjs 미생성). production·공유docs·Git·실게임/세이브/서버/빌드·audio·이미지·삭제/이동/타인WIP/새세션/권한 0. `productionApplied=false`, `runtimeAccepted=false`.

## 0. 메타·근거 SHA·시각

| 항목 | 값 |
|---|---|
| root checkpoint(크레딧 근거) | `3b548b06661ed42a483cba9e1c61af5bfa9352bd`(receipt `6c3789d7…`), Changes at open 63 |
| 크레딧 파일 SHA256(대조 일치) | `ea40af321119891d2f1afbe93070bc73e96c871a4e27bc8c9c9563d5e6660310` |
| index.html whole SHA256 | `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8` |
| `_GP.on/off/_handlers` 의미(1011-1013) SHA256 | `d972548160f9f72f1fb8da2a25ec4a79f5c0551341cf43d308b9f0be6ac36073` |
| `stopWorldIntro`(2159-2165) SHA256 | `bb380f6563c358066c499a27af0798380b6d32a93902595856acf90cd809c7cd` |
| 재현 실행 UTC(이전 메모리 턴, 재실행 안 함) | 2026-10-02T12:56:06Z → **8 PASS / 0 FAIL, exit 0** |

## 1. 결함 (current-product, 전역 게임패드 입력구독 재진입 중복 — "첫 접점1")

- `_GP.on(id,test,action)`은 `_handlers.push(...)` — **id별 교체가 아니라 누적(stack)**이고 `_GP.off(id)`는 해당 id 전부 제거(index.html:1011-1013).
- `playCinematic`은 run마다 `_GP.on('clickToHell')`(2442)·`_GP.on('cinSub')`(2486)·`_GP.on('cinHold')`(2535)를 push. 공유 teardown `stopWorldIntro`(2159)는 이들을 `_GP.off` 하지 않음(키보드 `_chk/_chu`와 동일한 미정리; 그 건은 1212 보존).
- 폴 루프(1128-1131)는 **첫 매칭 핸들러 실행 후 `break`**. 재진입(`_goCinematic`→`stopWorldIntro`→`playCinematic`)마다 동일 id가 누적되어 **인덱스가 낮은 stale(run1) 핸들러가 먼저 소비**:
  - `cinHold`(stale): `_cinDone` false(run2)라 run1 closure의 `_cinHoldKey`를 토글하지만 run1의 `_hgLoop`는 dead → **현재 run2 홀드-스킵 게이지가 게임패드 홀드에 반응하지 않을 수 있음**(= 잔존/중복소비 첫 접점).
  - `_handlers` 리스트가 재진입마다 무한 증가(leak).
- 마일스톤 STORY 인수 기준 "시작/중단/재진입에서 기존 cue 중복되지 않는 실제 연결" 위반의 게임패드 접점. 현행 v13 인트로에서 홀드 스킵 활성 → latent 아님. (키보드 접점은 1212, showImg latent 페이드는 1134 — 각 별개.)

## 2. 최소 patch 후보 (실제 wiring, 전체 outer caller 연결 — productionApplied=false, root 적용)

공유 teardown `stopWorldIntro`(2159; `finishCin` 2344·`skipToGate` 2582·`_goCinematic` 2711·2683/2742가 모두 호출) 한 곳에 게임패드 ids 정리 추가. `_goCinematic`은 `stopWorldIntro`(2711)를 `playCinematic`(2735) **이전** 호출 → 재진입 전 stale 제거.

`stopWorldIntro` 내 `if(_cinKeyCleanup){_cinKeyCleanup();_cinKeyCleanup=null;}`(2162) **다음 줄**에 추가:
```js
_GP.off('clickToHell');_GP.off('cinSub');_GP.off('cinHold');
```
(1212의 `_cinHoldCleanup`에 포함시켜도 되나, `_GP.off(id)`가 해당 id 전부 제거하므로 teardown 직접 호출이 누적 중복까지 일괄 정리 — 더 견고.)

- **불변:** `_CIN_HOLD_DUR=5000`·800/600ms·대사·게이지 동작·character text·서사·보이스/네이티브/asset 0. **leaf DOM 불변**(`_GP.off`는 `_handlers` 리스트만 조작). protected2_3·Q-only magic·attack ticket 무관.
- **정상 보존:** 단일 run 중에는 핸들러 구독 활성(게임패드 스킵/5000ms 홀드 정상), teardown 후 0.

## 3. 실제 caller 재현 (fixture 직접 `_GP.off` 아님 · 이전 메모리 턴 원 stdout 임베드)

실제 `_GP` 의미(push/off/filter)와 실제 추출 `stopWorldIntro`로 재현. **teardown의 `_GP.off`는 patched `stopWorldIntro` 함수 내부에서 발생**(fixture가 직접 off 하지 않음). 핸들러 test/action body와 full `playCinematic`/`_goCinematic` DOM 체인은 **대역 경계**(Node 실행 불가).

### 임베드 검증 코드 (이전 메모리 턴 실행본, 재실행 안 함)
```js
import fs from 'node:fs'; import vm from 'node:vm'; import crypto from 'node:crypto';
const idx=fs.readFileSync('/Users/fordeargamers/Projects/exoduser-migration-20261001/index.html','utf8');
const L=idx.split('\n'); const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const gpLines=L.slice(1011-1,1013).join('\n');
if(!/on\(id, test, action\) \{ this\._handlers\.push/.test(gpLines)) throw new Error('GP 의미 마커 불일치');
const swi=L.slice(2159-1,2165).join('\n');
if(!/^function stopWorldIntro\(\)\{/.test(swi)) throw new Error('swi 마커 불일치');
console.log('GP sem SHA', sha(gpLines)); console.log('swi SHA', sha(swi));
function mkGP(){ return { _handlers:[], active:true,
  on(id,test,action){ this._handlers.push({id,test,action}); },      // 실제 1012 의미
  off(id){ this._handlers=this._handlers.filter(h=>h.id!==id); },     // 실제 1013 의미
  count(id){ return this._handlers.filter(h=>h.id===id).length; },
  poll(gp,just){ for(let i=0;i<this._handlers.length;i++){const h=this._handlers[i]; try{ if(h.test(gp,just)){ return h.fired=h, h.action(); } }catch(e){} } } }; } // 1128-1131 first-match-break
function makeSWI(patched){
  let body=swi.replace('if(_cinKeyCleanup){_cinKeyCleanup();_cinKeyCleanup=null;}',
    'if(_cinKeyCleanup){_cinKeyCleanup();_cinKeyCleanup=null;}'+(patched?"\n  _GP.off('clickToHell');_GP.off('cinSub');_GP.off('cinHold');":''));
  const ctx={ _GP:null,_cinKeyCleanup:null,_worldIntroSubtitles:null,_worldIntroPlayer:null,$:()=>({pause(){},classList:{remove(){}}}),stopMediaVideo(){},console };
  vm.createContext(ctx); vm.runInContext(body,ctx); return (gp)=>{ctx._GP=gp; ctx.stopWorldIntro();};
}
function register(gp,runTag){ let holdKey={v:false};
  gp.on('clickToHell',(g,j)=>false,()=>{});
  gp.on('cinSub',(g,j)=>false,()=>{});
  gp.on('cinHold',(g,j)=>true,()=>{holdKey.v=true;});
  return {runTag,holdKey}; }
let pass=0,fail=0; const ck=(n,g,w)=>{const ok=Object.is(g,w);console.log((ok?'PASS':'FAIL')+' | '+n+' | got='+JSON.stringify(g)+' want='+JSON.stringify(w));ok?pass++:fail++;};
{ const gp=mkGP(); const swiC=makeSWI(false);
  register(gp,'run1'); swiC(gp); register(gp,'run2');
  console.log('현재식 _handlers id별 수: clickToHell',gp.count('clickToHell'),'cinSub',gp.count('cinSub'),'cinHold',gp.count('cinHold'));
  ck('현재식 재진입 후 cinHold 핸들러 2개(누적)',gp.count('cinHold'),2);
  ck('현재식 재진입 후 cinSub 핸들러 2개',gp.count('cinSub'),2);
  gp.poll({},{}); ck('현재식 poll 시 첫 cinHold(run1 stale) 이 소비(index 0 우선)',gp._handlers[0].id,'clickToHell'); }
{ const gp=mkGP(); const swiP=makeSWI(true);
  register(gp,'run1'); swiP(gp); register(gp,'run2');
  console.log('후보 _handlers id별 수: clickToHell',gp.count('clickToHell'),'cinSub',gp.count('cinSub'),'cinHold',gp.count('cinHold'));
  ck('후보 재진입 후 cinHold 1개(중복 해소)',gp.count('cinHold'),1);
  ck('후보 재진입 후 cinSub 1개',gp.count('cinSub'),1);
  ck('후보 재진입 후 clickToHell 1개',gp.count('clickToHell'),1); }
{ const gp=mkGP(); const swiP=makeSWI(true);
  const h=register(gp,'run'); gp.poll({},{}); ck('control: 단일 run 홀드 응답(holdKey set)',h.holdKey.v,true);
  swiP(gp); ck('control: teardown 후 cinHold 0',gp.count('cinHold'),0); }
console.log('\n== '+pass+' PASS / '+fail+' FAIL ==');
process.exit(fail?1:0);
```

### 원 stdout (2026-10-02T12:56:06Z, 재실행 안 함)
```
GP sem SHA d972548160f9f72f1fb8da2a25ec4a79f5c0551341cf43d308b9f0be6ac36073
swi SHA bb380f6563c358066c499a27af0798380b6d32a93902595856acf90cd809c7cd
현재식 _handlers id별 수: clickToHell 2 cinSub 2 cinHold 2
PASS | 현재식 재진입 후 cinHold 핸들러 2개(누적) | got=2 want=2
PASS | 현재식 재진입 후 cinSub 핸들러 2개 | got=2 want=2
PASS | 현재식 poll 시 첫 cinHold(run1 stale) 이 소비(index 0 우선) | got="clickToHell" want="clickToHell"
후보 _handlers id별 수: clickToHell 1 cinSub 1 cinHold 1
PASS | 후보 재진입 후 cinHold 1개(중복 해소) | got=1 want=1
PASS | 후보 재진입 후 cinSub 1개 | got=1 want=1
PASS | 후보 재진입 후 clickToHell 1개 | got=1 want=1
PASS | control: 단일 run 홀드 응답(holdKey set) | got=true want=true
PASS | control: teardown 후 cinHold 0 | got=0 want=0

== 8 PASS / 0 FAIL ==
exit=0
```

## 4. 대역 경계·Gate·인계·다음

- **대역 경계:** 실제 `_GP.on/off/poll`(1011-1013) + 실제 `stopWorldIntro`(2159-2165, off는 patched 내부) = 실행. 핸들러 test/action 실제 body·full `playCinematic`/`_goCinematic` DOM 체인 = 대역(Node 불가). → 리스트 의미·teardown off-wiring은 실제, 실브라우저 게임패드 중복 체감·native/시각/청취는 미검수(UNKNOWN). native 6단계/visual/audio 분리.
- **인계(root):** 공용 `index.html` `stopWorldIntro`에 3 id `_GP.off` 반영, docs `SPACE_HOLD_SKIP_20260914.md`에 "finish/skip/re-entry 시 게임패드 ids 정리 수명" 신규 기록(전체 rg 동기화). 공용 source/Git은 원총괄/root 소유. 의존성: BOSS/QA 실제 재진입 경로.
- **보존:** 1212(키보드 `_chk/_chu` const 바인딩·named-function-expression 첫 실패 기록)·1134(showImg latent gen-token)·1300(본건) 각 불변. 이전 검사 재실행 0.
- **다음(자율):** 이 크레딧(1) 저장 소진. 승인 대기 없이 다음 독립 승인 소스 접점을 **메모리로 계속**(크레딧0이면 메모리, 새 크레딧 때 저장). Changes 80 checkpoint 즉시/100 전 신규 중단 준수. 단순 final 정지 0. 마일스톤 문서 SHA 불일치는 역사값 기록, 되돌리지 않음.

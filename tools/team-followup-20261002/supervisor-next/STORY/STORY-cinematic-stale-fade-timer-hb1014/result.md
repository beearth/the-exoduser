# STORY-cinematic-stale-fade-timer-hb1014 — 컷 전환 800ms 타이머가 현재 컷을 숨기는 경계

담당 STORY(Claude, UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`, provider Claude Code) · 한국어 · 정적 소스 재현 + 최소 guard 검수.
소유 = 이 폴더 `result.md`·`checks.mjs` **2파일만**(별도 evidence/log/fixture/patch/backup 0 — 영수증·SHA·patch는 본 result 안에 보존). production·공유docs·기존test·다른팀산출·Git(조회 포함)·실게임/세이브/서버/빌드·audio·이미지·삭제/이동 0. `productionApplied=false`, `runtimeAccepted=false`.

## 0. 메타·영수증·SHA·시각

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` (TASK 경로 일치) |
| Assigned(TASK) | 2026-10-02T10:42:53.686554Z |
| parent 제공 기준(역사) | `6b865637` — 역사적 기준, **current HEAD 주장 0**, Git 조회 0 |
| 소스 Read·앵커 고정 | index.html `showImg`(2238-2250)/`hideAll`(2251)/defect line 2246, `_goCinematic`(2703-2736) |
| Node | `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` |
| checks 실행 1차 UTC | 2026-10-02T10:53:45Z → exit 1 (하니스 버그, 아래 §4) |
| checks 실행 2차 UTC(수정 후) | 2026-10-02T10:54:15Z → **exit 0, 9 PASS / 0 FAIL** |
| docs rg UTC | 2026-10-02T10:54:26Z |

**원문/산출 SHA256(shasum/crypto, git 아님):**
- index.html whole `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8`
- 추출 block(2236-2251) `c824fca39532fbe2783566e10c2e7a351fd7aa83a16833d132e3daf003797cd3`
- defect line 2246 `70d6f43e2d5587d0eccbe8a63d89a1a35adc72e27dddde0ea5641819d6bf99b7`
- checks.mjs(최종, 수정 후): `shasum -a 256 checks.mjs`로 root가 대조 — 본 디렉터리 소유 파일

## 1. 실제 defect (원문)

`index.html:2238-2250` `showImg(idx)` 전환부, 핵심 라인 **2246**:
```
else if(i===_prevImg){el.style.zIndex=3;setTimeout(()=>{el.classList.remove('show');const im2=el.querySelector('img');if(im2)im2.style.animation=''},800);}
```
- A→B 전환 시 **직전 이미지(el=_prevImg)**에 800ms `setTimeout`을 등록해 `.show`를 제거한다(크로스페이드 잔상 정리).
- 그러나 콜백은 **el을 클로저로 캡처**하고 fire 시점에 **el이 다시 현재 컷이 되었는지 확인하지 않는다**. 또한 타이머 **id를 보관하지 않아** 완료/재진입 시 취소되지 않는다.
- 결과 2경계:
  1. **동일 run 빠른 B→A**: `showImg(A)→showImg(B)`(A에 800ms 타이머 예약)→800ms 내 `showImg(A)`(A가 다시 현재). 예약된 타이머가 뒤늦게 fire → **현재 컷 A의 `.show` 제거**(A가 사라짐).
  2. **완료/재진입(교차 run)**: `_goCinematic`(재시작, 2703)은 `cImgs.forEach(...remove('show'))`로 이미지만 리셋(2722)하고 **이전 run의 800ms 타이머를 clear 하지 않는다**(id 미추적). 새 run이 `showImg(A)`로 A를 표시한 뒤, 이전 run의 타이머가 같은 DOM el에 fire → 현재 A가 숨겨짐.

> 현행 데이터 주의: `CIN_LINES`의 img 인덱스는 0→18로 **단조 증가**(중복/역행 없음)이므로 **정상 전진 재생/부분 스킵에서 동일-run B→A는 발생하지 않는다**(UNKNOWN: 점프를 만드는 입력은 현재 cue 데이터에 없음). 반면 **교차-run(재진입: `replayCinBtn onclick="_goCinematic()"` index.html:718, `?cinematic=1`)** 경로는 데이터와 무관하게 도달 가능하다. 본 과제는 메커니즘을 명시적 대역으로 재현하며, 실제 제품 노출 빈도/시각은 미검수(Gate).

## 2. 재현·후보·control (checks.mjs, 9 PASS / 0 FAIL)

`showImg`/`hideAll` 블록을 **원문에서 추출(라인 슬라이스 + 마커 단언, verbatim)**하여 명시적 DOM 대역 + 가상 clock에서 실행. `setTimeout/clearTimeout`은 가상 clock으로 주입, DOM은 `classList`(add/remove/contains)·`style`·`querySelector` 대역. SYNTH = idx 시퀀스/clock advance만.

| 시나리오 | 현재식 | 후보식 |
|---|---|---|
| **S1 빠른 B→A**(0→1→0, +800ms) | 현재 컷 el0 `.show` **제거됨(defect 재현)** | el0 `.show` **유지**(guard), el1 정상 fade out |
| **S2 control 정상 A→B**(0→1, +800ms) | el0 정상 fade out, el1 유지 | el0 정상 fade out, el1 유지(**보존**) |
| **S3 lifetime**(0→1, hideAll, +800ms) | stale 타이머가 hideAll **이후에도 fire(미정리), 수=1** | hideAll이 대기 타이머 clear → **fire 0** |

→ defect는 실제 원문 식으로 재현됐고, 후보는 정상 A→B fade(S2)를 깨지 않으며 현재-컷 보호(S1)와 완료/재진입 정리(S3)를 달성.

## 3. 최소 patch 후보 (memory 후보 — productionApplied=false)

원문 `showImg`/`hideAll`에 대한 최소 transform(접점 2곳). **원소스 미변경**, root 채택 대상.

(a) `_prevImg` 선언부에 전환 타이머 레지스트리 추가:
```
let _prevImg=-1;const _fadeTimers=new Set();
```
(b) defect 라인 2246 → 시퀀스 guard(`_pi!==_prevImg`) + id 추적:
```
else if(i===_prevImg){el.style.zIndex=3;const _pi=i;const _tid=setTimeout(()=>{_fadeTimers.delete(_tid);if(_pi!==_prevImg){el.classList.remove('show');const im2=el.querySelector('img');if(im2)im2.style.animation=''}},800);_fadeTimers.add(_tid);}
```
(c) `hideAll`에 대기 타이머 정리(lifetime):
```
const hideAll=()=>{_fadeTimers.forEach(id=>clearTimeout(id));_fadeTimers.clear();cImgs.forEach(el=>{el.classList.remove('show');el.style.zIndex=3});_prevImg=-1;};
```
- (b) `_pi!==_prevImg`: 예약 당시 prev였던 el이 fire 시점에 **다시 현재(_prevImg)면 제거 skip** → 동일-run B→A 보호. 정상 A→B에서는 `_pi(A)!==_prevImg(B)`라 제거 진행(fade 보존).
- (a)(c) `_fadeTimers` clear: 완료/재진입 teardown에서 대기 타이머 취소.
- **교차-run 완전 해소 조건(대역 경계):** (c)는 **각 run 자신의 closure**를 정리한다. 재진입 시 이전 run의 타이머까지 확실히 끊으려면 `_goCinematic`(2703)/`hideAll` 또는 공유 레지스트리에서 **teardown 시 clear를 호출**하도록 root가 통합해야 한다(현행 `_goCinematic:2722`는 show만 리셋, 타이머 미추적). 이 통합 지점은 본 소유 밖 → root 결정.

## 4. 하니스 실패 기록(숨기지 않음)

1차 실행(10:53:45Z, exit 1)에서 **S3 현재식 assertion이 FAIL**. 원인: 가상 clock 하니스가 `firedAfterHideAll` 플래그를 타이머 객체에 기록한 뒤 fire 직후 `timers.delete(id)`로 제거 → 집계가 항상 0. 실제 소스 계약 문제가 아니라 **하니스 측정 버그**. 독립 누적 counter(`firedAfter`)로 수정 후 2차 실행(10:54:15Z) exit 0, 9 PASS. 가짜 counter로 계약을 대체하지 않았고, control(S2) 없이 PASS로 선언하지 않았다.

## 5. docs 동기화 인계 (root)

docs 전체 rg(10:54:26Z, 백업 제외): `showImg`=0, `_prevImg`=0, `playCinematic`=0, `remove('show')`=0, `cinZoomSlow`=`docs/CHANGELOG_DAILY_20260520.md`(줌 애니명만), `800ms`=맵 화면효과 문서(무관).

| 정본/문서 | 현행(old) | 제안(new) | 상태 |
|---|---|---|---|
| (해당 전환 타이머 SSOT) | **없음** — `showImg`/800ms 크로스페이드 타이머는 docs 미기재 | `docs/11내러티브·로어디자인`(또는 `docs/cinematic/WORLD_INTRO_INGAME_20260907.md` 재생 계약)에 **정지이미지 전환부 800ms 잔상 정리 타이머와 현재-컷 보호/재진입 정리 계약**을 신규 기록 | root 신규 추가 후보(값·함수·구현상태 표) |
| 수치 보존 | 800ms(제거 지연)·600ms(기타)·대사/타자속도/언어/LOCK/TBD | **불변** | 변경 0 |
| 보호2_3·blackBean Q패링·어택티켓금지·캐릭터LOCK/TBD·확정수치 | — | 보존 | 변경 0 |

> 전환 타이머는 source-only 메커니즘이라 **정본 수치/공식 충돌 없음**. 신규 설계가 필요하면 기존 정책을 임의 확정하지 않는다(root 결정).

## 6. 결과·Gate·blocker

- **결과:** 원문 `showImg:2246`의 800ms `remove('show')` 타이머가 (1) 동일-run 빠른 B→A, (2) 완료/재진입 교차-run에서 **현재 컷을 숨길 수 있는 경계**를 실제 추출 소스로 재현(S1). 최소 guard 후보(시퀀스 `_pi!==_prevImg` + `_fadeTimers` clear)가 현재-컷 보호·정상 A→B fade 보존·lifetime 정리를 달성(S2/S3). 9 PASS/0 FAIL(하니스 1차 실패는 수정·기록).
- **실제품 Gate(UNKNOWN):** `productionApplied=false`·`runtimeAccepted=false`. 실브라우저/cinematic 영상/audio/GPU 픽셀/맵 visual/배포 PASS **아님**. 동일-run B→A는 현행 `CIN_LINES`(단조 증가) 데이터상 전진 재생에서 미발생(점프 입력 UNKNOWN); 교차-run(재진입)은 도달 가능하나 실제 사용자 노출 빈도/시각 미검수.
- **진짜 blocker/필수 결정(root):** 교차-run 완전 해소를 위한 teardown clear 통합 지점(`_goCinematic`/`hideAll`/공유 레지스트리) 결선 = root. 후보 생산 채택·canonical 신규 기록·Git = root. 본 과제는 이 한 건만 수행하며 새 기능·정책확장·자체 다음건 배정 0, 감독 검수 후 root 통합 대기.

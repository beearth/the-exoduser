# STORY-tworun-crossclosure-fade-1134 — 실제 2-run cross-closure stale fade 검증 (hb1014 정정)

담당 STORY(Claude, UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`, provider Claude Code) · 한국어 · epoch `capacity-after-8c317a73-1134`.
소유 = 이 폴더 `result.md`·`checks.mjs` **2파일만**(이 epoch 역할당 1반복/2파일). production·공유docs·기존test·Git(조회 포함)·실게임/세이브/서버/빌드·audio·이미지·삭제/이동/타인WIP 0. `productionApplied=false`, `runtimeAccepted=false`.

## 0. 용량 epoch·시각·SHA

| 항목 | 값 |
|---|---|
| capacity epoch | `capacity-after-8c317a73-1134`, `allowNewOwnedFiles=true`(root checkpoint 8c317/72fe 후 Changes 68) |
| 저장 한정 | 역할당 1반복, 최대 2파일(result.md+checks.mjs). 다음 독립 건은 메모리 진행, 새 epoch에서 추가 저장 |
| checks 실행 UTC | 2026-10-02T11:42:07Z / KST 20:42:07 → **exit 0, 6 PASS / 0 FAIL** |
| index.html whole SHA256 | `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8` |
| 추출 block(2236-2251) SHA256 | `c824fca39532fbe2783566e10c2e7a351fd7aa83a16833d132e3daf003797cd3` |
| checks.mjs SHA256 | `56512db697265a067db69d09785e6b2cb4c94c49bb0090b4e4f9f8ea16ec69bc` |

## 1. hb1014 대비 정정 (감독 피드백 반영)

- **단일 closure 합성 A→B→A → 실제 2-run cross-closure로 교체.** 원문 `showImg`/`hideAll` 블록(index.html:2236-2251, verbatim)을 **2회 인스턴스화**해 독립 closure 2개(각자 `_prevImg`/`cImgs`)를 만들되 **동일 공유 DOM 노드**(`$('cinImg'+i)` 공유)와 **공유 가상 clock**을 연결했다.
- **수동 `_fadeTimers.clear()` 제거.** 후보 guard는 원문 teardown lifecycle에 연결되는 **generation-token(`_cinGen`=`_GEN.v`)** 방식이다 — teardown/새 run이 gen을 올리면 이전 run의 지연 타이머가 fire 시 **스스로 skip**(id 추적·수동 clear 불필요).
- **이전 9-assertion 재실행 0.** 본 파일은 신규 two-run 검증(별건). hb1014의 원 stdout/SHA/하니스 수정 이력은 그 결과물에 보존(불변).

## 2. 실제 소스 teardown lifecycle (읽기 전용 확정)

- `_clearVidTimers`(2227-2230): **문 비디오 감시 타이머**만 clear(showImg 페이드 무관).
- `finishCin`(2341): `_cinTimer`(대사 타이머)만 clear. cImgs·페이드 타이머 미처리.
- `skipToGate`(2583 `_cinTimer` clear, 2591 cinImg `.show` 전부 제거): 페이드 타이머 미clear.
- `_goCinematic`(2722 cinImg `.show` 전부 제거): 페이드 타이머 미clear.
- `_fadeTimers`/`_cinGen`/`showImgTimers` 레지스트리 **0건** → showImg 800ms `setTimeout` id는 어디에도 저장되지 않아 **모든 teardown 경로가 미clear**. → 각 `playCinematic` run의 지연 페이드가 teardown을 넘겨 다음 run까지 생존.

## 3. 검증 결과 (checks.mjs, 6 PASS / 0 FAIL)

| 시나리오 | 구성 | 결과 |
|---|---|---|
| **S1 현재식 2-run** | run1 `showImg(0),showImg(1)`(공유 el0에 800ms 예약) → teardown(show 리셋, 타이머 미clear=원문) → run2(새 closure) `showImg(0)` → +800 | run1 stale 타이머 fire → **run2 현재 컷 el0 `.show` 제거(cross-run defect 재현)** |
| **S2 후보 2-run** | 동일하되 teardown에서 `_GEN.v++`(원문 teardown의 gen bump 연결 모사) | A-timer `_g(1)!==_GEN.v(2)` → **skip → run2 현재 컷 유지** |
| **S3 control 후보 단일 run** | `showImg(0),showImg(1)` +800 | el0 정상 fade out, el1 유지(**정상 fade 보존**) |
| **S4 control 현재식 단일 run** | 동일 | el0 정상 fade out, el1 유지(단일 run defect 아님) |

→ 두 real closure + 공유 DOM에서 **종료→새 run 후 stale fade가 현재 이미지를 숨김**을 확인(S1). gen-token 자동 guard가 cross-run을 중립화(S2)하면서 정상 A→B fade(S3/S4)를 보존.

## 4. memory guard 후보 (productionApplied=false)

원문 2246 접점 + teardown gen bump 2곳. **원소스 미변경**, root 채택 대상.

(a) 모듈 스코프: `let _cinGen=0;`
(b) 2246 교체(자동 guard, 수동 clear 없음):
```
else if(i===_prevImg){el.style.zIndex=3;const _g=_cinGen;const _pi=i;setTimeout(()=>{if(_g!==_cinGen)return;if(_pi===_prevImg)return;el.classList.remove('show');const im2=el.querySelector('img');if(im2)im2.style.animation=''},800);}
```
(c) teardown/새 run 진입점에서 `_cinGen++`: `playCinematic` 시작, `finishCin`(2338), `skipToGate`(2580), `_goCinematic`(2703) — 각 진입에 1줄.
- `_g!==_cinGen`: **cross-run stale 자동 중립화**(teardown/새 run이 gen 올림).
- `_pi===_prevImg`: **동일-run B→A** 현재 컷 보호.
- 800/600ms·대사/타자속도/언어/LOCK/TBD 불변, ART 로더 무관. protected2_3·blackBean Q-only·attackticket 무관.

## 5. 도달성 Gate·docs 인계

- **도달성:** 현행 v13 영화 경로는 `showImg`(=`showLine` 경유)를 호출하지 않음(`WORLD_INTRO_INGAME_20260907.md:25` showLine(0) 중지; 0621/0748). 따라서 cross-run 페이드 숨김은 **보존 코드 latent 결함**이며 **현행 제품 노출이 아님**(실게임/native/시각/청취 미검수 → UNKNOWN).
- **docs:** `showImg`/전환 800ms 페이드 타이머는 docs 미기재(hb1014 rg: showImg/_prevImg/playCinematic/remove('show') 매칭 0). 정본 수치/공식 충돌 없음 → root가 `docs/11내러티브·로어디자인` 또는 `WORLD_INTRO_INGAME`에 "전환 페이드 타이머 + 현재-컷/cross-run 보호" 신규 기록(값·함수·구현상태). 공용 코드 적용·docs 전체 rg 동기화·Git은 원총괄 소유.

## 6. 결과·blocker·다음

- **결과:** 실제 2-run cross-closure에서 stale 800ms fade가 현재 이미지를 숨기는 결함을 원문 추출 소스로 재현(S1), gen-token 자동 guard가 수동 clear 없이 해소(S2)하며 정상 fade 보존(S3/S4). 6 PASS/0 FAIL.
- **blocker/root 결정:** gen bump를 원문 `playCinematic`/`finishCin`/`skipToGate`/`_goCinematic` 진입점에 실제 결선하는 공용 코드 적용 = root. 후보 생산 채택·canonical 신규 기록·Git = root.
- **다음(자율):** 이 epoch 저장 1건 완료. 다음 독립 건은 허가를 다시 묻지 않고 **메모리로 진행**하고 새 capacity epoch에서 추가 저장한다. production/shared docs/Git/사용자게임/새세션 변경 0. 원 stdout/명령/SHA/실패·수정 이력 그대로 인계.

# MAP-20261002-MANUAL-LIFECYCLE-FIX 결과 — 수동입력 관측기 lifecycle 계약 수정

- 팀: Mac MAP / 터미널 3 / 세션 d447a49d / 과제일 2026-10-02
- HEAD: `30a204a7aa348a88b90bdc922862c610a7da938f`
- 상태: **3반례 RED→GREEN + 회귀 완료.** 실맵/8뷰/좌표경계 시각 PASS는 이번 없음(기존 **RETOUCH 유지**).

## 1. 착수 시각 (receipt와 동일)
수신 15:35Z · 첫Read 15:35Z(과제/재현기/counterexamples) · 첫Edit 15:40Z(관측기) · 실행 15:42Z · 완료 15:43Z.

## 2. 읽은 원자료
- 과제: `OWNER_IMPL_20261002.md`
- RED 재현기: `tools/team-followup-20261001/root-review/five-owner-counterexamples.mjs` (읽기전용)
- RED 기준값: `outputs/team-review-20261001/five-owner-acceptance/counterexamples-before.json` (읽기전용)
- 선독 유지: 맵 가이드 v0.9(§0·§15–19), `_MAP_SSOT_INDEX`, 맵디테일, 기존 MAP 산출(safe 하니스·evidence gate·manual observer).

## 3. 소유 쓰기 (MAP 폴더만)
`game.html`/index/server/공유docs/타팀(ANIMVFX)/`root-review`/`counterexamples-before.json` **미수정**. `PROJECT_MANAGEMENT_MASTER.md`의 변경(M)은 **대화 시작 스냅샷에 이미 있던 타 세션 WIP** — 미간섭. game K/P/G/map 쓰기0·passive 관측 유지. unsafe/safe 주입 하니스(`m5-walk-harness.safe.js`)·evidence gate(`m5-evidence-gate.cjs`) 원본 보존.

| 경로 | 내용 | sha256 |
|---|---|---|
| `manual-input-observer.js` (수정) | lifecycle 계약 반영 | `f7514fbf…` |
| `manual-lifecycle-fixture.cjs` (신규) | 3반례 RED→GREEN + 보강(22항목) | `40093ef0…` |
| `manual-lifecycle-fixture-output.txt` (신규) | 실행 로그(22 PASS/0 FAIL) | — |
| `manual-lifecycle-after.json` (신규) | 수정 후 3반례 재측정(모두 expected=0) | — |
| `manual-input-fixture-output.txt` (갱신) | 기존 27 회귀 로그 | — |

## 4. 단일 lifecycle 계약(수정 내용)
세 반례를 "시작/실패/중복/포커스손실"을 묶은 하나의 계약으로 해결:

1. **원자적 설치 + 롤백** — 리스너/인터벌 설치를 `try`로 감싸고, 설치 중 예외 시 `_teardown()`으로 **이미 설치된 것 전부 롤백** 후 재던짐. 성공 시에만 레지스트리 등록. (반례1)
2. **인스턴스 레지스트리(`_instances`)** — 새 `start()`는 기존 활성 인스턴스를 먼저 `_dispose('superseded-by-new-start')`로 정리(핸들 유실 0). 중복 start 후 last만 stop해도 first 자원 잔존 0. (반례3)
3. **포커스손실 게이트(armed/focused/awaitingFresh)** — blur/hidden에서 즉시 `armed=false`로 **표본 중단** + 현재 leg를 `focus-lost`로 종료. 재개는 **명시적 visible/focus 복귀 + 새 keydown(edge)** 에서만(`awaitingFresh`→keydown에서 arm). **이전 held 키를 새 입력으로 가정하지 않음.** (반례2)
4. **정리 실패 비은폐** — `_teardown()`은 `clearInterval`/`removeEventListener` 예외를 삼키지 않고 `teardownErrors`에 기록, 실패 핸들은 `st.listeners`에 **보존(유실 방지, 재시도 가능)**, 상태를 `cleanup='partial-unknown-retry-possible'`로 노출(`controller.cleanupState()`).
5. 부가: keydown/keyup을 **식별성 있는 별도 핸들**로 등록(동일 fn 재사용 시 remove 모호성 제거), `_dispose` idempotent, abort는 tick에서 `_dispose('external-abort')`.

## 5. RED→GREEN 대조 (counterexamples-before.json → manual-lifecycle-after.json)
| 반례 | RED(before) | GREEN(after, 수정본) |
|---|---|---|
| MAP-install-rollback | remainingListeners **1** | **0** |
| MAP-hidden-sampling | hiddenLegs **1**, hiddenSamples **2** | **0, 0** |
| MAP-duplicate-start | remainingTimers **1**, remainingListeners **3** | **0, 0** |

## 6. 검수 (실행함)
- Node `--check` 구문: `manual-input-observer.js`, `manual-lifecycle-fixture.cjs` PASS (v24.15.0).
- **lifecycle fixture 22 PASS / 0 FAIL** (exit 0): C1 롤백·C2 숨김중단·C3 중복정리 + R1 포커스복귀 재개계약·R2 정리예외 기록·R3 abort/idempotent.
- **기존 27 회귀 PASS** (exit 0) — 상태쓰기0·passive·정리·게이트 연결 불변.
- 미수행(이번 금지): 실게임/브라우저/서버 기동, 실제 사용자 손 입력, 8뷰 촬영, 시각 PASS.

## 7. MAP PRODUCTION REPORT (미측정 시각 범위 명시)
- STAGE: CH1-1(stage0), MAP-020 / M5. 이번 작업 = **관측기 lifecycle 수정(도구)**.
- VISUAL QA(§15–17): **이번 측정 없음.** 실맵 화면·8뷰(START/EARLY/MAIN ARENA/SIDE LEFT/SIDE RIGHT/PRIMARY LANDMARK/LATE/EXIT·BOSS)·좌표경계·반복무늬·원거리 shade 절단 **미측정**. evidence gate 상 미방문 8뷰는 UNKNOWN.
- TECH QA: 관측기 lifecycle만 오프라인(vm) 검증. collision/route/pageerror/seam/performance **미측정**.
- VISUAL VERDICT: **RETOUCH 유지**(이번 시각 PASS 없음). 사용자 게임 그대로.
- FILES: stage-owned 원본수정0, 신규/수정은 MAP 폴더만. 공유docs·타팀 파일 변경0.
- GIT/DEPLOY: 없음(권한·생성·새세션·queue 0).

## 8. 미완료·인계 (root 단독 후속)
1. 실제 사용자 입력 관측 세션 + 8뷰 촬영(6뷰 미방문) → evidence gate 판정.
2. 관측 leg→SSOT 경계 자동매핑 기준 확정(현재 수동 boundaryMap).
3. M5 주머니 전체경로 미성립·MAP-020 전체 RETOUCH 유지.
4. SSOT `7000,6900` 좌표 정정은 생산수정 소유자 몫(총괄 소유 문서에 기반영, 미편집).

## 9. docs 반영안 (소유 폴더 기록만, 공유docs 미수정)
이번 변경은 신규 검증 도구 영역으로 맵 수치/스펙 불변 → 공유 docs 정정 불필요. 도구·계약·RED/GREEN 근거는 본 result와 fixture에 보존. 공유 SSOT/가이드 반영은 root 통합 시 판단.

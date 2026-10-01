# ENEMY owner-integration 결과 — 검수된 tick-health 수정의 원담당 probe 경로 인수

- 과제: ENEMY-TICK-UNKNOWN-FIX의 **원담당(owner) 인수 한 건**. ITEM 지원팀이 검수 완료한 tick-health 수정을 재작성하지 않고 원 probe 경로로 통합.
- 담당 구분: 원담당 ENEMY(세션 ddbd64be). 지원담당 = ITEM(enemy-support-*). 검수 = ITEM 자체 + BUILD 독립감사 + root(§SUPPORT-root-review.md, 기준 HEAD `8d221540`).
- 수신 2026-10-02T00:14 / 첫 Read 00:14 / 첫 Edit 00:17 / 완료 00:18:30 (KST).

## 읽은 입력 (읽기 전용, 미수정)
- `ENEMY/et3-probe.fixed.js` — 인수 전 원담당 probe(= 거짓 FAIL_NO_FIRE 재현 대상).
- `ITEM/enemy-support-probe.js` — 검수 완료된 수정본(인수 소스).
- `ITEM/enemy-support-tick.test.mjs` — 검수된 회귀(17 시험).
- `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/SUPPORT-root-review.md` — root 인수 근거.

## 인수한 검수 수정 내용 (재작성 없음)
원본 대비 검수 델타는 tick-health 5개 훅뿐이며, 이를 그대로 인수했다(통합본 sha256 = ITEM 검수본과 **바이트 동일** `92cbecd7…`):
1. `tick()` 분류 재작성 — `missing_tick`/`nonfinite_or_invalid_tick`/`invalid_tick_counter`/`backward_tick`/`tick_read_error`.
2. `install()`에서 `lastObservedTick`/`lastCountedTick`을 `installedTick`으로 초기화.
3. `sample()`에서 **rAF 샘플 수(rafSamples)와 물리tick 증가분(physicalAdvances)을 분리 집계**, 120 연속 정체 시 `stalled_tick`.
4. residency 집계 게이트에 `tickIssues.length===0 && 실제 물리tick 증가` 조건 추가 → rAF를 물리tick으로 세지 않음.
5. `report()`: `tickHealthy` 미충족 시 **INCONCLUSIVE(physical_tick_unverified)**, `elapsedTicks`는 이슈 없고 단조일 때만, `tickHealth` 진단 블록 추가.

> 핵심 계약: **tick 없는 451 rAF는 INCONCLUSIVE로 남기고 실제 AI 결함(FAIL_NO_FIRE)로 승격하지 않는다. rAF ↔ 물리tick 분리.**

## 산출물 (ENEMY 소유, owner-integration-* + OWNER_NEXT_20261002-*)
| 파일 | sha256 | 내용 |
|---|---|---|
| `owner-integration-et3-probe.patch` | `4624d5e3…` | **애셉턴스 patch** — 원담당 실제 경로 `ENEMY/et3-probe.fixed.js`에 검수 수정을 적용하는 unified diff(97행). `-p1`. |
| `owner-integration-et3-probe.fixed.js` | `92cbecd7…` | patch 적용 미리보기(실행·검증용). ITEM 검수본과 바이트 동일. |
| `owner-integration-tick.test.mjs` | `f6cc3c4c…` | 원담당 경로 회귀 17 시험(vm 샌드박스, globalThis 미오염). |

## 수행 명령 / 결과
```
node --check owner-integration-et3-probe.fixed.js                 → exit0
node --check owner-integration-tick.test.mjs                      → exit0
patch --dry-run -p1 < owner-integration-et3-probe.patch           → clean apply (쓰기 안 함)
node --test owner-integration-tick.test.mjs                       → 17 pass / 0 fail
node (통합본 대상 기존 9 mock 무회귀)                               → 9 PASS / 0 FAIL
```
- node: `~/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` (v24.15.0)

### 회귀 요지
- **원본 재현:** null tick + 451 rAF → 원 probe는 `FAIL_NO_FIRE`, inRangeTicks=451 (거짓 결함, 왜 수정이 필요한지 증거).
- **통합본:** 동일 입력 → `INCONCLUSIVE`, inRangeTicks=0, rafSamples=451, physicalAdvances=0, elapsedTicks=null.
- **비정상 tick 8종**(undefined/NaN/±Infinity/string/negative/fractional/constant) 451 rAF → 전부 INCONCLUSIVE, physicalAdvances=0.
- **무회귀:** 정상 단조 물리tick 470 + 고주사율 ×3 중복 rAF(1410) → `FAIL_NO_FIRE` 유지, inRangeTicks=470, physicalAdvances=470, elapsedTicks=470.
- backward/reset/missing·정체(stall)·getter 예외·물리tick 공백 → 전부 INCONCLUSIVE(영구 무효, 외삽 없음).
- 통합본으로 기존 F1~F5 9시나리오 **무회귀 확인**.

## 적용 여부 구분 (중요)
- **원 probe 파일 `ENEMY/et3-probe.fixed.js`는 직접 수정하지 않았다**(소유 밖). patch로만 제출. `patch --dry-run`으로 원 경로에 **깨끗이 적용됨을 확인**(실제 쓰기 0). 실제 적용은 root/총괄 통합 단계에서 `patch -p1 < owner-integration-et3-probe.patch`.
- 통합 미리보기 파일은 실행·검증 목적의 사본이며, 그 자체가 원 경로 반영은 아니다.

## 한계 / 남은 게이트
- **실게임 tick 연결·AI 품질 검수 아님.** 모의/정적까지만. root 실전측정은 종료됨.
- 실제 CH1-1 필드 verdict 산출은 여전히 QA 종료 인계(QA-game-release.json released=true) 후.
- game.html/easy/index/server/공유 docs/타팀 파일 변경 0. Git·권한·새 세션/에이전트·타팀 메시지 0.

## 인계
root/총괄: `owner-integration-et3-probe.patch`를 `ENEMY/et3-probe.fixed.js`에 `-p1` 적용하면 원담당 probe가 검수된 tick-health 거동을 갖는다. 이 한 건 종료, 다음 잔여 게이트(실화면 verdict) 인계.

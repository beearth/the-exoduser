# ANIMVFX-20261002-SPARSE-CLOCK-INTEGRATION — 결과 (한국어)

- 담당: ANIMVFX / 터미널 8. 기존 세션 `1d2a7253-478c-43aa-8c6f-766a02270432`. 작성 2026-10-02.
- 기준 HEAD: `30a204a7aa348a88b90bdc922862c610a7da938f`.
- 시각: 수신 00:36 / 첫 Read 00:37 / 첫 Edit 00:40 / 검사·완료 00:48 (KST). 상세 `OWNER_IMPL_20261002-receipt.json`.
- **성격: C5 구간판정에 누락/비정상/역행 카운터 계약을 보강해 실제 owner gate에 통합. 반례 RED→GREEN·기존8+2·실raw3·canonical 회귀 실행. 게임/브라우저 0, 실제 ≥90Hz 라이브 검수는 계속 UNKNOWN.**

## 1. 반례 재현 (root `counterexamples-before.json`)
`ANIM-missing-middle-draw-record` / `ANIM-missing-draw-counter`: 중간(또는 전체) record의 `draws`가 누락되면 `dD=null`을 **'진행 없음(0)'처럼** 취급 → 그 감소구간이 `update-only`로 새서 **오PASS(고주사율 실수명 인증)**. `clockMissing`도 `draws`를 검사하지 않았다. 직접 `classifyDecaySparse({dHf:1,dU:1,dD:null})`도 PASS였다.

근본 원인: 끝점 카운터가 미상(null/NaN/누락)인데 이를 0으로 간주해 구동원을 단정.

## 2. 최소 수정 (canonical gate에 통합)
통합 대상: **`animvfx_highhz_lifetime_gate.mjs`** (실제 owner). 통합 전 사본을 **`sparse-clock-gate-before.mjs`** 로 동결 보존(SHA `3309238f…`).

### C2 카운터 무결 계약 보강 (`extractEpisodes`)
모든 시작/중간/종료 record에 대해 `updates/draws/now`를:
- **결측/NaN** → `clockMissing` → REJECT (기존엔 `draws` 미검사였음 — 보강).
- **비정수/음수**(updates·draws) → `nonInteger` → REJECT.
- **역행(단조 위반)** → `clockBreak` → REJECT.
- **가짜 zero event**(`flash-zero-observed`인데 hf≠0) → `fakeZero` → REJECT. 종료는 **실제 hf===0**만 인정(event만으론 불인정).
- 초기 `hidden/paused/runtimeGate=false`도 시작 record에서 포착(정상으로 보충하지 않음).

### C5 구간 판정 하드닝 (`classifyDecaySparse`)
- `dU/dD`는 **두 유효 끝점에서 수치일 때만** 비교. 하나라도 null/NaN이면 그 구간은 **indeterminate**(진행여부 판정 불가) — **0으로 간주 금지**.
- 판정 순서: 감소구간0=UNKNOWN · 무카운터(둘다0인데 감소)=REJECT · (update-only+draw-only)=FAIL(모순) · draw-only>0=FAIL(회귀) · **indeterminate>0=UNKNOWN** · update-only>0=PASS · 둘다진행만=UNKNOWN.
- 즉 **끝점 미상은 절대 PASS로 승격하지 않는다.** 실제 draw 구동(update 없이 감소) 증거만 FAIL.

보존: sparse sp0.5 정상(주사율 독립)·총량일치 오판 수정·부활/사망 reset 계약 유지.

### 사이드: `sparse-update-c5-gate.mjs`
버그 사본 중복 제거 — 로컬 classify/extract/judge/gateV2를 삭제하고 **canonical로 위임**, old-wrong 대조(`priorGate`)는 **고정 before**(`sparse-clock-gate-before.mjs`)를 읽도록 변경. (root 지적: 버그 로직이 두 곳에 남지 않게.)

## 3. 산출물 (ANIMVFX 소유)
| 파일 | 역할 | SHA(앞20) |
|---|---|---|
| `animvfx_highhz_lifetime_gate.mjs` | **canonical owner (통합본, GREEN 대상)** | `94fb46c002fdca7cbcfe` |
| `sparse-clock-gate-before.mjs` | 통합 전 magnitude 사본(동결, old-wrong 대조원) | `3309238f04d51ccf65af` |
| `sparse-clock-integration.mjs` | 반례 RED→GREEN·회귀·실raw 하니스 | `d66d4c978e920a95ad7e` |
| `sparse-update-c5-gate.mjs` | 기존 8+2 데모(위임·고정 before 참조) | `37d9956be9b7054b081d` |

## 4. 검사 결과 (게임 실행 없이, 전부 exit 0)
| 검사 | 명령 | 결과 |
|---|---|---|
| canonical 구문 | `node --check` ×5 파일 | 전부 PASS |
| **canonical 자가검사 18종** | `node animvfx_highhz_lifetime_gate.mjs` | 18/18 (반례 missing-middle-draw·missing-draw-counter=REJECT 포함) exit 0 |
| **반례 RED→GREEN** | `node sparse-clock-integration.mjs …` | 2 반례 + 단위: RED(before=PASS 오판) → GREEN(canonical=REJECT/UNKNOWN) 전부 ✓ |
| canonical 회귀 | 위 하니스 | update-only 240→PASS, draw-only 240→FAIL ✓ |
| **기존 8+2** | `node sparse-update-c5-gate.mjs` | 8 fixture + 2 old-wrong 데모 전부 OK (owner=GREEN, before=old-wrong) |
| **실 raw 3종** | 하니스/canonical | valid·60=UNKNOWN(고주사율 미실측)·부활 PASS, raw=에피소드0 UNKNOWN — 오REJECT/오PASS 없음 |
| 선행 검증기 회귀 | `node animvfx_gl_validator.mjs` | 9/9 유지 exit 0 |

핵심 대조: `classifyDecaySparse({dHf:1,dU:1,dD:null})` = **before PASS → canonical UNKNOWN**. missing-middle-draw = **before PASS → canonical REJECT**.

## 5. 경계·불변 (과대해석 금지)
- **실제 ≥90Hz 라이브 수명은 계속 UNKNOWN**(현존 raw 자연감쇠 ~36–38Hz). 통합은 판정기 하드닝일 뿐 라이브 측정 아님.
- 실 raw는 완전한 카운터라 **오REJECT 없음**(보강이 정상 데이터를 깨지 않음 확인).
- **원 GL probe(`animvfx_gl_probe.js`)·production VFX·game/easy/index/server/공유docs·타팀 수정 0.** canonical gate 원본도 before로 동결 보존 후 통합.
- 사용자 게임 입력/리로드/계측/새 게임·브라우저·서버·빌드 0. Git/queue/새세션/새에이전트/권한 0.

## 6. docs 반영안 (소유폴더 기록 — 공유docs 직접편집 금지)
- `ANIMATION_VFX_TEAM_MASTER.md` §11 하위 한 줄 인덱스 **후보**(총괄 통합 시 반영):
  > "ANIMVFX-20261002-SPARSE-CLOCK-INTEGRATION: C5 구간판정에 카운터 무결(결측/NaN/비정수/음수/역행·가짜zero)·끝점미상=UNKNOWN 계약 보강 후 canonical gate 통합. 반례 missing-draw 2종 RED→GREEN(REJECT). before=`sparse-clock-gate-before.mjs` 동결. 실 ≥90Hz 여전히 UNKNOWN."

## 7. 남은 잔여 게이트 (인계)
- **총괄**: canonical 통합본(`animvfx_highhz_lifetime_gate.mjs`)을 새 acceptance 기준으로 채택 검토. (이전 `sparse-update-c5.patch`는 끝점미상 보강 전이므로 본 통합본으로 대체.)
- **QA/총괄**: 정규 GL **고주사율(120/240Hz) + after-update 표본(슬로모 구간 권장)** raw 확보 시 canonical C7이 고주사율 수명 PASS/FAIL 자동 판정(현재 UNKNOWN).
- 부활 잔상0 정규 GL 실화면·가독성(가림) 판정은 기존 인계 유지.

# ANIM-C5-SPARSE-UPDATE-EDGE — 결과 (한국어)

- 담당: ANIMVFX / 터미널 8. 기존 세션 `1d2a7253-478c-43aa-8c6f-766a02270432`의 후속 한 건. 작성 2026-10-02.
- 기준 HEAD: `30a204a7aa348a88b90bdc922862c610a7da938f`.
- 수신/첫Read/첫Edit/완료 시각: `OWNER_NEXT_20261002-receipt.json`(내 소유 ANIMVFX 디렉터리).
- **성격: 선행 고주사율 게이트 C5(감쇠 구동원 판별)의 드문표본·sp감쇠 경계 오판을 실제 원식 fixture로 재현하고, 최소 수정 + 부정회귀(sparse-update-*)를 구현·실행. 게임/브라우저 실행 0, 실제 고주사율 미측정 유지.**

## 0. 경로 충돌 주의 (총괄 확인 요청)
배정은 `OWNER_NEXT_20261002-receipt/result`를 ANIMVFX 소유로 지정했으나, 공유 `vscode-dispatch/OWNER_NEXT_20261002-receipt.json`은 이미 **SKILL팀**(terminal 6, `SKILL-OWNER-INTEGRATION-20261002`, 09:16 수신)이 점유 중이다(동일 파일명 충돌). 타팀 WIP 보존 규칙상 공유 경로를 덮어쓰지 않고, 내 receipt/result를 **내 소유 `tools/team-followup-20261001/ANIMVFX/` 아래 `OWNER_NEXT_20261002-` 접두사**로 작성했다.

## 1. 발견한 누락 (실제 원식 기준)
실제 감쇠원식 — `game.html:33148`:
```
if(e._hitFlash>0)e._hitFlash=Math.max(0,e._hitFlash-sp);  // 고정스텝 update 감쇠, slowmo/hitstop은 sp
```
감쇠는 **update 틱당 `sp`**이며 `sp`는 슬로모/히트스톱에서 1이 아니다(분수·0 가능). render(GL `5227`, 2D `51847`)는 그리기만, 사망 시 `50884`가 draw 경로에서 hf=0 리셋.

선행 C5(`animvfx_highhz_lifetime_gate.mjs:138-149`)는 에피소드 **총 감소량(decrements)**을 update/draw 카운터 **총 증가분(dU/dD)**과 **단순 일치**로 비교해 구동원을 정한다. "드문 표본 사이 여러 update가 발생"하면 이 총량 일치가 구동원을 증명하지 못해 두 방향 오판이 난다:

| 사례 | 실제 | 선행 C5 결과 | 원인 |
|---|---|---|---|
| **슬로모 sp=0.5** (update 구동) | 정상(주사율 독립) | **오FAIL** | 12틱에 6감소 → dU=12, dD=6 → `\|dU-6\|≠0`, `\|dD-6\|=0`이라 draw 구동으로 오판 |
| **draw 복귀 회귀 step2 + 30fps 드문표본** (draw 구동) | 회귀(고주사율 수명 단축) | **오PASS** | 틱2/draw라 6감소에 dU=6 → `\|dU-6\|=0`이라 update 구동으로 오판 |

→ **두 데모 모두 선행 게이트로 실제 재현**했다(§4). 즉 "단순 일치"는 PASS/FAIL 근거로 불충분.

## 2. 최소 수정 (구간 증거 기반 판별)
연속 표본 사이 **감소구간**을 분류(사망 리셋 구간 제외):
- `update-only`(dHf>0 & dU>0 & dD==0): **draw 없이 hf 감소 → update 구동 증거**
- `draw-only`(dHf>0 & dD>0 & dU==0): **update 없이 hf 감소 → draw 구동 회귀 증거**
- `둘다진행`(dU>0 & dD>0): 구동원 분리 불가(증거 아님)
- `무카운터`(dU==0 & dD==0인데 감소): trace 결함 → REJECT

판정: update-only만 → **PASS**(sp<1이어도 성립) / draw-only만 → **FAIL** / 둘 다 → **FAIL(모순)** / 둘다진행만·감소구간 없음 → **UNKNOWN(불완전·드문 표본)**. **총량 단순 일치로 PASS를 주지 않는다.**

추가 수정 2건(실데이터에서 발견):
1. `death-observed`가 `flash-start-observed`와 **같은 레코드**에 실릴 수 있어 시작 레코드에서 `sawDeath`를 포착 → 사망 리셋(bulk hf→0)을 감쇠로 오인 방지.
2. 사망을 본 에피소드의 "0으로 끝나는" 구간은 크기와 무관하게 **리셋으로 제외**(사망 전 점진 감소는 증거로 유지).

### 산출물 (ANIMVFX 소유)
| 파일 | 역할 | 실행 |
|---|---|---|
| `sparse-update-c5-gate.mjs` | 신규 C5(구간 증거) + 에피소드/구간 추출 + sparse-update-* 부정회귀 8종 + 선행 오판 데모 + 실 raw 적용 | **실행함** (node) |
| `sparse-update-c5.patch` | 선행 `animvfx_highhz_lifetime_gate.mjs`에 적용 가능한 통합 diff(최소 수정) | 패치본 `node --check` PASS·동작 검증함, **원본에는 미적용**(선행 산출 안정·소유 규칙) |

## 3. sparse-update-* 부정회귀 — 8/8 + 데모 2/2 (exit 0)
`node sparse-update-c5-gate.mjs`

| fixture | 기대 | 결과 |
|---|---|---|
| updateonly-proof (sp1,30fps,after-update) | PASS | ✅ |
| **slowmo-sp0.5** (update 구동) | PASS | ✅ (선행은 오FAIL) |
| highrefresh-updateonly (240fps) | PASS | ✅ |
| **drawstep2-falsepass** (30fps after-draw만) | UNKNOWN | ✅ (선행은 오PASS → 신규는 둘다진행만이라 분리불가=UNKNOWN) |
| drawdriven-highrefresh (240fps, draw-only 증명) | FAIL | ✅ |
| afterdraw-only-updatedriven (불완전 trace) | UNKNOWN | ✅ |
| nocounter (카운터 무진행 감소) | REJECT | ✅ |
| conflict (update-only+draw-only) | FAIL(모순) | ✅ |
| 데모: 슬로모 선행=FAIL → 신규=PASS | 오판 재현+수정 | ✅ |
| 데모: drawstep2 선행=PASS → 신규=UNKNOWN | 오판 재현+수정 | ✅ |

## 4. 실제 R raw 판정 (게임 실행 없이 — 읽기만)
`node sparse-update-c5-gate.mjs gl-revive-valid.json gl-revive-60.json gl-revive-raw.json`

| raw | 비치명 감쇠(자연) | 사망 리셋 | 부활/구울 | 전체 |
|---|---|---|---|---|
| gl-revive-valid | 4건 **PASS**(update-only 6건, draw 없이 감소 → 주사율 독립) | 4건 UNKNOWN(리셋 제외, 측정 불가) | PASS(동일 3·구울 1) | **UNKNOWN(고주사율 미측정)** |
| gl-revive-60 | 4건 PASS | UNKNOWN | PASS(동일 2·구울 2) | UNKNOWN |
| gl-revive-raw | 에피소드 0 | — | NO_VERDICT | UNKNOWN(에피소드 없음) |

핵심: 실데이터의 비치명 플래시는 **draw 없이(update-only) 감소**해 신규 C5로도 update 구동(주사율 독립)이 확인된다. 그러나 자연감쇠 drawHz ~36–38Hz라 **실제 ≥90Hz 수명은 여전히 미측정 → UNKNOWN**(PASS 승격 금지).

## 5. 경계·불변
- **실제 고주사율(≥90Hz) GL 플래시 수명 미측정** 유지. 불완전 trace는 UNKNOWN.
- **원GL프로브(`animvfx_gl_probe.js`)·생산 VFX·보호 설계 수정 0.** 선행 게이트 원본도 미수정(패치는 별도 파일).
- game.html/easy/index/server/공유마스터/타팀 **읽기 전용**(SKILL의 OWNER_NEXT 파일 미접촉).
- 게임/브라우저/서버/대형빌드/이미지생성/청취/Git/권한변경/새세션/새에이전트/타팀 메시지 **0**. `node --check`·fixture·raw 분류의 작은 검사만.
- 이미 보고한 11PASS는 반복하지 않음(이번은 C5 경계 결함·수정·sparse-update-* 신규).

## 6. 남은 잔여 게이트 (인계)
- **총괄**: `sparse-update-c5.patch`를 선행 게이트에 통합할지 결정(동작·구문 검증 완료). 경로 충돌(§0) 정리.
- **QA/총괄**: 정규 GL **고주사율(120/240Hz)** + **after-update 표본 포함** raw를 `animvfx_gl_probe.js`로 확보하면, 신규 C5가 update-only 구간으로 고주사율 수명 PASS/FAIL을 자동 판정(현재 UNKNOWN). 슬로모/히트스톱 구간 포함 캡처도 권장(sp<1 경로 실검증).
- 자연 조우·사용자 공격 입력 수명, 부활 잔상0 정규 GL 실화면, 가독성(가림) 판정은 기존 인계 유지.

# ANIMVFX-telegraph-stun-persist-clear-ts1300 — 결과 (2026-10-02)

CH1-1 playable 마일스톤 ANIMVFX 행(hit/telegraph/**lifetime** 실제 연결)의 복구 TASK 경계. **windup 중 stun 전이 때 `_telegraphT` 효과수명이 렌더 consumer에 잔존**하는 최초 경계를 실제 update/render caller로 연결해 확정하고, render-only 최소 후보 + 정상 windup/정상 cancel 대조를 만들었다. **검수 7/7 PASS, exit 0.**

- `productionApplied=false`, `runtimeAccepted=false`. **pixel/native(실제 기절 적에 링이 남아 보이는지) = QA 화면 Gate.** source-sink를 가시픽셀 PASS로 확대하지 않음.
- 저장 epoch `rolling-after-3b548b06-1300` (credits 2, maxIter 3, changes 63→, stop<100). 소유 신규 2파일: 이 폴더 `checks.mjs`·`result.md`. tr1213·6검사·bridge(03c73c72) 반복 0, 옛 결과 변경 0. 공유 source/docs/Git/사용자 save 미변경(root 소유 → 후보만 인계).

## 1. 실제 source 경계·SHA (5 앵커 전부 참)

| 앵커 | 위치(game.html) | 확인 |
|---|---|---|
| 수명 감소(stun 게이트 없음) | `37240` `updateE` 최상단 `if(e._telegraphT>0){e._telegraphT-=sp;e._telegraphR=e.r+20}` | ✅ |
| `_telegraphT=0` clear **부재** | 전체 grep 0건 (set=20·감소만) | ✅ (없어야 참) |
| prep 링 조건 | `5224` `if(e._telegraphT>0&&e._telegraphT<20)` — stunned 항 없음 | ✅ |
| 2D 링 조건 | `51839` `if(!_ensGLQueued&&e._telegraphT>0&&e._telegraphT<20)` — stunned 없음 | ✅ |
| death cull | prep/2D 렌더 루프 `!e.alive continue` | ✅ |

링 조건 expression은 **양 빌드(game/easy) 동일**(`EX-ring-cond-identical-both-builds` PASS). 실Read sha256는 evidence `sourceReadSHA`. Git 미호출.

## 2. 발견 — stun 전이 시 전조 링 잔존

실제 링 render 조건 expression + death-cull 가드를 **원문에서 추출해 실행**(손모델 아님):

| 상태 | 링 렌더 | 해석 |
|---|---|---|
| 정상 windup | **true** | 정상(공격 예고→발동) |
| **windup 중 stun** | **true** | **잔존 결함** — 공격은 AI가 stun으로 중단해 안 나가는데 빨간 경고링이 최대 ~20프레임 유지(기절 알파 0.6). 거짓 "공격 임박" 신호 |
| windup 중 death | **false** | death는 `!alive` cull로 렌더 consumer 미도달 → 이 전이는 이미 안전 |

→ "최초 경계"는 **stun 전이**. `_telegraphT`가 어디서도 clear되지 않고 렌더 조건에 stunned 항이 없어, 중단된 공격의 경고링이 자연 감소(≈20f)까지 남는다.

## 3. 최소 후보 (render-only·미적용) + 대조

```js
if(e.stunned>0)e._telegraphT=0; // windup이 stun으로 중단되면 전조 링 즉시 제거(render-only)
```
위치: `updateE`의 `if(e._telegraphT>0){e._telegraphT-=sp;...}` 인접(stun 분기). easy도 updateE 동일 위치(링 조건 양판 동일).

- **대조 실행**: 후보 적용 시 stun 링 = **false**(잔존 제거), 정상 windup 링 = **true 유지**(control, 미영향). → `CANDIDATE-stun-cleared` + `CONTROL-normal-unaffected` PASS.
- **판정/수명공식/asset 불변**: `_telegraphT`는 순수 VFX 타이머(set=20·decrement·ring·`_telegraphR`에만 사용). 공격 발동은 `e.s`/`e.st2`로 **별도** → clear는 render-only. body-skip 미채택 Gate / crop / 발앵커 UNKNOWN 보존.
- **2차 UNKNOWN(death→revive)**: 구울/보스 revive가 windup-death 직후 복귀하면 stale `_telegraphT` 가능(revive는 `stunned=0`만 리셋). revive 타이밍 대개 >20f라 실발생 UNKNOWN. revive 경로에 `e._telegraphT=0` 1줄 동반이 저비용 차단. 이번 범위에선 후보로만 명시.

## 4. 원본 stdout (요약, 재실행 없이 보존)
```
groups {"total":7,"pass":7,"fail":0}  exit 0
PASS ANCHORS-present / EX-ring-cond-identical-both-builds
PASS CURRENT-normal-renders(true) / CURRENT-stunned-persists-DEFECT(true) / CURRENT-dead-culled(false)
PASS CANDIDATE-stun-cleared(false) / CONTROL-normal-unaffected(true)
anchors {decrementNoStunGate,noClearAssign_absent,prepRingCond,twoDRingCond,deadCull} = all true
```

## 5. docs 인계 (root 순차)

| 정본 | 인계 문안 |
|---|---|
| `docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md` | `_telegraphT` 미clear → windup→stun 시 경고링 잔존(렌더 조건에 stunned 無). render-only 후보(stun 시 clear) 미적용. death=cull 안전, revive=UNKNOWN |
| `docs/5.1임펙트디자인/VFX_구현가이드.md` | 전조 수명: `_telegraphT`는 어디서도 0 clear 안 됨 → 중단 공격에도 자연 감소까지 렌더. 중단(stun/revive) 시 clear 권장(render-only, 판정 불변) |

보호 `2_3`/Q-only magic/attack-ticket 금지/LOCK·확정수치 보존.

## 6. PASS·의존성·Gate
- **PASS(source/fixture, 7/7)**: 앵커·양판 조건 동일·현행 3상태(정상 render/stun 잔존/death cull)·후보 clear·정상 control.
- **의존성**: ENEMY(stun/hurtE/`e.s`), SKILL(windup 트리거), QA(실제 화면 잔존 관측).
- **Gate**: 실제 링 잔존 가시성·완전 몸 렌더는 QA 화면 Gate(미인수). game.html/easy 적용·공유 docs·Git은 root 슬롯.
- 발앵커 UNKNOWN·corpse fade 보류·수치/에셋 변경 0.

## 재실행
```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node \
  tools/team-followup-20261002/supervisor-next/ANIMVFX/ANIMVFX-telegraph-stun-persist-clear-ts1300/checks.mjs
```
하니스는 JSON을 stdout으로 출력하고 파일을 추가하지 않는다. 링 조건·death cull은 원문 추출 실행. source-sink PASS는 가시픽셀/실게임 PASS가 아니다.

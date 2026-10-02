# ANIMVFX-telegraph-ring-gl-reachability-tr1213 — 결과 (2026-10-02)

CH1-1 playable 마일스톤 ANIMVFX 행("기존 명중/전조/효과 **수명의 실제 연결**")의 한 경계. **전조(`_telegraphT`) 윈드업 경고링의 렌더 도달성**을 실제 source 앵커 + 세 경로 게이트 모델 + 링 원문 실행으로 검증했다. **일반(비elite) 8dir GL-큐 적의 윈드업 경고링이 어느 경로에서도 렌더되지 않는 전조 누락**을 확정하고, render-only 최소 복원 patch 후보를 제출(미적용)한다. **검수 6/6 PASS, exit 0.**

- `productionApplied=false`, `runtimeAccepted=false`. **source-sink PASS ≠ 가시픽셀/완전몸 렌더/실게임 PASS**(실제 링 가시성·누락 체감은 **QA 화면 Gate**).
- 소유 신규 2파일: 이 iteration 폴더 `checks.mjs`·`result.md`(epoch `capacity-after-6a39b828-1212`, role당 1반복·최대2파일 준수). 제출 TASK/이전 산출/타인 WIP·공유 source·docs·Git·사용자 save 변경 0. game.html은 root 소유 → 후보만 인계.
- **milestone 문서 SHA 주의**: 피어 제시 `889fb16f…` ≠ 실제 `713aa80c…`. 신뢰 대상 아닌 제공 SHA를 현행으로 간주하지 않고 **실파일 내용**을 기준으로 역할 행을 적용했다.

## 1. 실제 source 경계·SHA

| 경로 | 위치(game.html) | 원문 |
|---|---|---|
| 수명 업데이트 | `37244` | `if(e._telegraphT>0){e._telegraphT-=sp;e._telegraphR=e.r+20}` — 고정스텝(`sp`) ✅ 정상 연결 |
| 8dir GL-큐 블록 | `~5195–5197` | `_drawEliteAuraTelegraph(X,e,sa,_now)` + `if(e.s==='eChargeWind'...)_drawChargeTele` → **`continue;`** (이후 링 스킵) |
| `_telegraphT` 링(레거시-atlas 경로) | `5224–5227` | `if(e._telegraphT>0&&e._telegraphT<20){...X.arc(e.x,e.y,(e._telegraphR||e.r+20)*_tgProg...)...X.stroke()...}` |
| 2D fallback 링 | `51839` | `if(!_ensGLQueued&&e._telegraphT>0&&e._telegraphT<20){...}` — GL 적 게이트아웃 |
| eliteAura early-return | `5283` | `if(!e||!(e.elite>0||e.etype>=90)...)return;` — elite/rare 전용, 일반 몹 무효 |

실Read sha256: `game.html` = evidence `sourceReadSHA`, 링 statement slice sha256 별도 기록. Git 미호출. 5개 앵커 전부 존재 확인(`ANCHORS-present` PASS).

## 2. 발견 — 8dir GL 적 윈드업 링 누락

링 렌더 경로는 두 군데(prep 레거시-atlas 5224, 2D 51839)뿐인데:
- **8dir GL-큐 적**: prep 8dir 블록이 `_drawEliteAuraTelegraph`(elite/rare 전용 → 일반 몹 no-op) + `_drawChargeTele`(돌진 예고, 정상) 후 **`continue`(5197)** → `_telegraphT` 링(5224) 도달 못 함.
- **2D 링(51839)**: `!_ensGLQueued`로 GL 적은 스킵.
- ∴ **일반 8dir GL 적의 `_telegraphT` 윈드업 경고링은 어느 경로에서도 그려지지 않음.** 수명(`_telegraphT`)은 고정스텝으로 정상 갱신되나 **렌더가 연결 안 됨**(전조 누락). CH1 주력 적이 8dir GL이라 "CH1-1 전투가 읽힘/전조 피드백"(마일스톤 우선3)에 직접 영향.
- 돌진 예고(`_drawChargeTele`)는 GL 경로에도 있어 정상. 누락은 **`_telegraphT` 윈드업 링에 한정**.

**source-sink 실행 결과** (링 원문을 canvas sink로 실행, 게이트는 원문 조건 반영):

| 입력 | 링 렌더 횟수 | 판정 |
|---|---|---|
| 일반 8dir GL 적, windup(`_telegraphT`=15) | **0** | 누락(현행) |
| 2D fallback 적, windup | 1 | 정상(제어 — 게이트가 실제 분기함 입증) |
| `_telegraphT`=20(창 밖) | 0 | 정상(제어) |
| 일반 8dir GL 적, **patched** | 1 | 복원(후보) |

## 3. 최소 patch 후보 (render-only·미적용)

`game.html` 8dir GL 블록 `continue`(≈5197) **직전** 1줄 삽입 — 그림자가 prep/2D 두 경로에 모두 있는 패턴과 동일하게 GL 경로에 전조 링을 추가:

```js
if(e._telegraphT>0&&e._telegraphT<20){const _tgP=1-e._telegraphT/20;X.globalAlpha=_tgP*.5;X.strokeStyle='#ff2200';X.lineWidth=2;X.beginPath();X.arc(e.x,e.y,(e._telegraphR||e.r+20)*_tgP,0,Math.PI*2);X.stroke();X.globalAlpha=sa;}
```

- **body-skip 가드 채택이 아니라 GL 경로 render 추가** → "queue-only/body-skip 미채택 Gate 보존".
- 수명/판정/자원/에셋/좌표 불변. 연출 1겹 복원.
- **game-easy-test.html**: `_drawEliteAuraTelegraph` 부재로 8dir 블록 구조가 달라 **패치 위치 별도 확인 필요**(이번 미확정, 과잉 일반화 안 함). 적용·공용 source 반영은 root 소유.

## 4. docs 인계 (root 순차)

| 정본 | 인계 문안 |
|---|---|
| `docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md` | 8dir GL-큐 적 `_telegraphT` 윈드업 링 누락(prep continue + 2D `!_ensGLQueued` 게이트, eliteAura는 elite 전용) 및 render-only 복원 후보(미적용) 기록. 기존 `_hitFlash` 상호배타 분석과 **별개 경계** |
| `docs/5.1임펙트디자인/VFX_구현가이드.md` | 전조 `_telegraphT`: 수명=고정스텝 update(37244), 렌더=prep 레거시(5224)/2D(51839) 2경로뿐 → 8dir GL 경로 링 부재. 후보: GL 블록에 링 추가 |

보호 `2_3`·blackBean Q-only·attack ticket 금지·LOCK/확정수치 보존.

## 5. PASS·의존성·Gate

- **PASS(source/fixture, 6/6)**: 앵커 존재, 링 원문 stroke 실행, 현행 8dir GL 누락(0), 2D 제어(1), 창밖 제어(0), 후보 복원(1).
- **의존성**: ENEMY/SKILL(windup 상태 `e.s='windup'`/`_telegraphT` 트리거), ART(에셋 불필요), QA(실제 화면에서 링 가시/누락 관측).
- **Gate**: 실제 링 가시성·완전 몸 렌더·누락 체감은 QA 화면 Gate(미인수). source-sink를 가시픽셀 PASS로 확대하지 않음. game.html 적용/easy 패치위치/공유 docs·Git은 root 슬롯.
- 발 앵커 UNKNOWN·corpse fade 보류·수치/에셋 변경 0 유지. 이번 2파일 예산 소진 후 새 epoch까지 메모리 작업으로 다음 독립 건 진행.

## 재실행
```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node \
  tools/team-followup-20261002/supervisor-next/ANIMVFX/ANIMVFX-telegraph-ring-gl-reachability-tr1213/checks.mjs
```
하니스는 JSON을 stdout으로 출력하고 파일을 추가하지 않는다. 링은 원문 statement를 canvas sink로 실행, 게이트는 원문 조건 반영이다. source-sink PASS는 가시픽셀/실게임 PASS가 아니다.

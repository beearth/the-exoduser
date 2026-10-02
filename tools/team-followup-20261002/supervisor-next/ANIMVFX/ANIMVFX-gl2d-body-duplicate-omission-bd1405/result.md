# ANIMVFX-gl2d-body-duplicate-omission-bd1405 — 결과 (2026-10-02)

CH1-1 playable 마일스톤. `_getTex` partial failure 하에서 **실제 `_queueEnemy8DirInstanced` → `_drawEnemy8DirInstanced`(bucket) + 실제 2D body caller 원문**을 함께 실행해 **동시모드 body 중복(duplicate)/누락(omission)**을 실제 성공/실패값·bucket 소비 부작용·정상 대조로 검수했다. **검수 7/7 PASS, exit 0.**

- 리뷰 정정 반영: 손작성 조건표(80e5cdc7)가 아니라 **원문 함수 실행**으로 재현. atlas-미준비 설계수용은 임의 확정하지 않음(별도 UNKNOWN). `_setBlend`/기록기는 호출·버퍼 소비이지 GPU state/pixel 아님.
- `productionApplied=false`, `runtimeAccepted=false`. GL 업로드/픽셀/실제 가시성은 **QA 화면 Gate**.
- 저장 epoch `rolling-after-ca261460-1404` (credit 2, maxFiles 3, changes 63, stop<100). 소유 신규 2파일: `checks.mjs`·`result.md`. 기존 0548/원장표 재생산 0, 제출 산출 불변. 공유 source/docs/Git·사용자 save 미변경(root 소유).

## 1. 실제 source·SHA
queue/draw/2D-body slice **양판(game/easy) 동일**(`EX-slices-identical` PASS). 실Read sha256는 evidence `sourceReadSHA`. 2D body 현재 위치: idle `game.html:52020`, walk `52022`(`if(_a8){…}` 무가드). Git 미호출.

## 2. 실제 실행 결과 (성공/실패값·bucket 소비)

실제 queue(idle+walk 용량 여유→둘 다 성공, idle bucket=1·walk bucket=1·total=2), 실제 draw(bucket별 출력), 실제 2D body(canvas sink, drawImage by id). 정책 3종.

| 시나리오 | GL idle / walk 출력 | 현행 무가드 | `!_ensGLQueued` 가드단독 | draw-feedback 후보 |
|---|---|---|---|---|
| 정상(atlas·용량·upload OK) | 1 / 1 | idle 2·walk 2 → **DUPLICATE** | idle 1·walk 1 → clean | idle 1·walk 1 → clean |
| **walk `_getTex` 실패**(draw) | 1 / **0**(bucket skip) | idle 2·walk 1 → **idle DUPLICATE** | idle 1·**walk 0 → OMISSION** | idle 1·walk 1 → **clean** |

- **현행 무가드**: 2D body가 GL-큐 성공 개체(mode=1)에도 실행 → 정상에서 idle·walk 모두 GL+2D **동시 출력(중복)**. walk 텍스처 실패 시 GL walk bucket만 skip되고 2D가 idle·walk 그려 **idle 중복**(walk는 2D가 커버).
- **가드 단독**: 정상은 clean이나 walk 실패에서 **walk 누락** → 단독 채택 금지 근거(실제 실행 재현).
- **draw-feedback 후보**: 정상·partial-fail **둘 다 중복0·누락0**. walk 실패 시 2D가 실패한 walk bucket만 커버(walkTotal=1).

## 3. 최소 후보 (draw-time per-bucket feedback·미적용)

`_drawEnemy8DirInstanced`가 **bucket별 실제 출력 여부(idle/walk)**를 개체 플래그로 남기고, 2D body가 **GL이 그린 bucket은 생략·안 그린 bucket만** 그림.
- duplicate(동시 출력)와 omission(partial-fail 누락)을 **한 메커니즘으로 동시 해소**. 가드 단독(누락 유발)·원형 폴백(의도 제거분) 아님.
- `_hitFlash`/수명/판정/자원/asset 불변 — **render 연결만**. 보호 `2_3` 무관.
- 실제 구현은 root가 공용 source에 반영(후보만 인계). easy도 slice 동일하나 적용은 root.

## 4. 경계·UNKNOWN
- **atlas-미준비**: 이전 반복에서 GL·2D가 `_ch8Atlas[1]` 공유 의존이라 둘 다 omit됨을 봤으나, 이를 "설계수용"으로 **임의 확정하지 않음** → 별도 UNKNOWN(로딩 window·의도 여부는 ART/총괄 확인 Gate). 이번 후보는 atlas-ready 상태의 duplicate/omission만 다룸.
- source/pixel Gate 분리: "출력"은 drawImage/drawArraysInstanced 호출 도달이며 실제 픽셀 아님.

## 5. docs 인계 (root 순차)
| 정본 | 문안 |
|---|---|
| `docs/8.0몬스터디자인/몬스터_스킨_렌더링_파이프라인.md` | 현행 2D body 무가드 → GL-큐 개체도 2D 그려 동시모드 duplicate; `_getTex` partial fail 시 bucket skip; guard-alone은 partial-fail에서 omission; 해법=draw-time per-bucket feedback(미적용) |
| `docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md` | body duplicate/omission은 동일 경계 양면; bucket별 GL 실제 출력 피드백으로 동시 해소. guard-alone·원형폴백 금지 |

docs 키워드(`_queueEnemy8DirInstanced|_drawEnemy8DirInstanced|_ensGLQueued|_getTex|duplicate`) 기준 위 2정본 관련. 보호 `2_3`/Q-only/attack-ticket 유지.

## 6. PASS·의존성·Gate
- **PASS(source/fixture, 7/7)**: 양판 slice 동일, 실제 queue 성공값, draw 정상 양 bucket, walkfail walk-skip, 현행 duplicate, 가드단독 omission, 후보 clean(둘 다).
- **의존성**: ENEMY(queue 소비), QA(실제 화면 중복/누락 체감), BUILD(easy/공용 적용은 root).
- **Gate**: 실제 GPU 출력·중복/누락 가시성은 QA 화면 Gate. 공유 source/docs/Git은 root 슬롯.
- credit 2 소진. changes 63→(80 미만). 이후 새 파일 없이 메모리로 다음 독립 경계(draw-feedback 플래그 저장 위치·atlas-ready 전이 window) 이어감.

## 재실행
```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node \
  tools/team-followup-20261002/supervisor-next/ANIMVFX/ANIMVFX-gl2d-body-duplicate-omission-bd1405/checks.mjs
```
하니스는 JSON을 stdout으로 출력하고 파일을 추가하지 않는다. queue/draw/2D-body는 원문 실행, `_getTex`는 ready/fail 대역이다. source/fixture PASS는 GPU/픽셀/실게임 PASS가 아니다.

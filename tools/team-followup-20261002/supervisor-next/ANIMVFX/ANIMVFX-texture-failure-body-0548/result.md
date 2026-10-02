# ANIMVFX 작업감독 후속 — texture-failure-body-0548 결과 (2026-10-02)

작업감독 피드백: continuous의 queue+draw 18그룹(count/total/prefix/sentinel)은 인수했으나 **2D body가 모형**이어서 idle 전체 이중 출력/실제 픽셀 안전성을 확정하지 못했고, draw 시 walk 텍스처 실패는 큐 후보로 미해결이었다. 이번 한 경계는 **"queue 성공 뒤 walk 텍스처 실패에서 실제 2D body fallback의 도달성"**이다.

이번엔 **실제 `_drawEnemy8DirInstanced`(GL sink)와 실제 2D body 원문 블록(canvas source-sink)을 함께 실행**했다. `mode0?draw0` 모형을 쓰지 않았고, 2D body의 `drawImage`/pose submission 구간을 실제로 돌려 source-sink로 관찰했다. **6/6 그룹 PASS, exit 0.** `productionApplied=false`, **source fixture PASS ≠ 실제 GL/픽셀/시각/패키지 PASS.**

- 실제 cwd: `/Users/fordeargamers/Projects/exoduser-migration-20261001`
- 소유 쓰기 3파일: 이 폴더 `checks.mjs`·`result.md`·`evidence.json`. TASK(감독 소유)·COMMON·이전 산출·생산·공유docs·기존test·Git 인덱스 수정 0.
- **Git 호출 0**(COMMON/TASK). 총괄 제공 원격검증 checkpoint `f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c`(game 2e45/easy 3e59/node 541ff8, 조회시점 근거)는 **독립 현재 HEAD로 쓰지 않는다**. 내 실제 Read 시점 SHA는 §1에 새로 기록.

## 0. 이전 한계와 이번 교정

- continuous의 2D body는 `idle2D=1, walk2D=1` **불린 모형**이었다 → 2D body가 GL-큐된 개체에 대해 **실제로 실행되는지**, walk 텍스처 실패를 **실제로 커버하는지**, idle이 **실제로 이중 drawImage 되는지** 확정 못 함.
- 이번에 실제 2D body 원문 블록(일반 적 경로 `const _a8=_ch8Atlas[1]; if(_a8){…}`)을 canvas sink로 실행해 `drawImage` 호출을 직접 기록했다. 기존 18/57/11 검사는 재실행·합산하지 않았다.

## 1. 실제 source 경계·Read 시점 SHA

| 항목 | game.html | game-easy-test.html |
|---|---|---|
| 파일 전체내용 sha256(내 Read 시점) | `dc71186487664…`(세션 중 재변경) | (evidence 기록) |
| 2D body 블록 slice sha256 | `a7fca5d0b0b4…` | (양쪽 동일, `EX-slices-identical` PASS) |
| `_queueEnemy8DirInstanced` / `_drawEnemy8DirInstanced` slice | 양쪽 동일 | 동일 |

- **source SHA 시점 구분(이력 보존)**: claude-native-6 때 `30ae8544…`, continuous 때 `2e45ee0e…`, 이번 `dc711864…`. 총괄의 UI minus-수명/카드수명 통합이 세션 중에도 진행 중이다. 단 queue/draw/body/`_mobFacingDir8` slice는 불변(행 이동만). 타인 변경 되돌리지 않음.
- 읽은 핵심 행: queue `5028–5041`, draw `5042–5061`, 2D 일반 적 body `≈51967–51986`(현행 `if(_a8){…}` — **`!_ensGLQueued` 가드 없음**, `EX-body-no-guard` PASS), `_mobFacingDir8` `22234–22238`, `_MOB8_COLS=8`.
- 대역/합성입력: GL은 호출·`bufferSubData` 구간·`_getTex` ready/fail만 기록. 2D body는 **실제 원문 블록**을 canvas sink(`drawImage/save/restore/translate/globalAlpha`)로 실행. `_mW.ready`(이미지 로드)는 GL `_getTex`(텍스처 업로드)와 **독립 입력**으로 명시. 셰이더/실픽셀 없음.

## 2. 두 입력 비교 (실제 GL draw + 실제 2D body, source-sink)

fixture: 단일 이동 개체 e=(340,420,r20), facing=π/2→`south`→idle bucket0/walk bucket8, col1/row3(_mIdx 25), walkDist200. idle+walk 큐 모두 성공(용량 여유). 두 입력은 **draw 시 walk 텍스처만** 다르게 둔다. `_mW.ready`는 두 입력 모두 true(이미지 로드됨).

| 입력 | GL idle | GL walk | 2D body 실행 | 2D drawImage idle | 2D drawImage walk | idle 합산 | walk 합산 |
|---|---|---|---|---|---|---|---|
| **both-ready(정상)** | 1 | 1 | 예 | 1 | 1 | **2(이중)** | **2(이중)** |
| **walk 텍스처 null(실패)** | 1 | **0**(`_getTex(walk)=null`→버킷 skip) | 예 | 1 | **1** | **2(이중)** | **1(커버)** |

## 3. 핵심 발견 — 2D body fallback 도달성

1. **2D body fallback은 현행에서 도달 가능(실행됨).** `if(_a8){…}`에 `!_ensGLQueued` 가드가 없어, GL-큐된 개체(`_ensGLMode=1`)에도 2D body 블록이 실제로 돌아 `drawImage`를 호출한다(source-sink로 확인, `bodyRan=true`).
2. **walk 텍스처 실패를 현행 2D body가 커버한다 — 보행 누락 없음.** 2D body의 walk 그리기 게이트는 `_mW.ready`(이미지 로드)이고, 이는 GL `_getTex`(텍스처 업로드) 실패와 **독립**이다. 따라서 GL walk가 빠져도 2D가 CPU `drawImage`로 walk를 그린다(walk 합산 1). → continuous에서 "큐시점 후보 미해결"로 남겼던 경계의 **실제 귀결은 '현행 코드에서는 보행 누락 아님'**이다.
3. **대신 idle이 이중 출력된다.** 정상 입력은 idle·walk 모두 이중, 실패 입력은 idle 이중. 이 idle 이중은 모든 GL-큐된 일반 몹에 적용되는 현행 동작이며, **그 실제 픽셀 안전성(같은 위치·크기·alpha 중첩이 시각적으로 안전한지)은 이번 범위에서 확정하지 않는다** — 실제 GL/시각 Gate.
4. **body skip 가드 단독 채택 금지(재확인).** 가드를 단독 적용하면 idle 이중은 사라지지만, (2)의 커버가 사라져 walk 텍스처 실패·앞선 용량 케이스에서 **보행 누락**이 재발한다.

## 4. 후보 판정 — 안전한 전파 후보 정의 가능성

| 질문 | 판정 |
|---|---|
| walk 텍스처 실패를 전파할 **안전한 큐시점 후보**가 정의되는가 | **아니오.** 실패는 큐 성공 **뒤 draw 시점**에 발생 → 큐시점 rollback/precheck가 감지 불가. 더구나 현행 무가드 2D가 이미 walk를 커버하므로 큐시점 개입은 불필요·부적절 |
| draw 시점 후보는 | **정의는 가능하나 안전하게 확정 불가.** `_drawEnemy8DirInstanced`가 버킷별 `_getTex` 성공/실패를 피드백하고 body가 그 버킷의 개체만 2D로 돌리는 구조는, **body `!_ensGLQueued` 가드 채택(단독 금지)·버킷↔개체 매핑·실제 픽셀/GL 검수**가 함께 필요하다. 실제 큐 카운트·2D body·유효 prefix·다른 개체 표시 보존을 **실픽셀 없이** 보장할 수 없다 |
| 결론 | **caller/조정 Gate + UNKNOWN 인계.** 이번엔 안전한 최소 후보를 landing하지 않는다. 현행 도달성 증거만 source-sink로 확정 |

## 5. 공유 docs 정정 인계 (총괄 순차 반영)

공유 docs 읽기 전용. rg(`_ensGLQueued|2D 폴백|이중|_getTex|텍스처 실패|walk`) 완료. 정확 문안은 `evidence.json` `docsCorrections`.

| 문서 | 요지 |
|---|---|
| `docs/8.0몬스터디자인/몬스터_스킨_렌더링_파이프라인.md` §75~80 T4 | 현행 T4 서술("Canvas 본문 전체를 생략하는 미적용 후보는 본체 소실 위험")을 **정정**: 현행은 2D body 무가드라 GL-큐 개체에도 실행되어 walk 텍스처 실패를 커버(보행 누락 없음), 대신 idle 이중. 본체 소실 위험은 **skip 가드 단독 채택 시에만** 발생 → 가드 단독 금지. idle 이중 픽셀 안전성 미확정 |
| `docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md` 백로그 | 실제 2D body source-sink 실행 결과·idle 이중·walk 커버·큐시점 후보 정의불가·draw시점 후보 조정 Gate+UNKNOWN 기록. 미적용 |

## 6. PASS/FAIL/UNKNOWN·남은 의존성

- **PASS(source-sink, 6/6)**: 양판 slice 동일, body 무가드 확인, both-ready 이중, walk-텍스처-null에서 2D가 walk 커버·idle 이중.
- **UNKNOWN/Gate 인계**: ①idle 이중의 실제 픽셀 안전성(실 GL/시각), ②draw 시점 실패 전파 후보(가드 결합·버킷↔개체·실픽셀 필요) → caller/조정 Gate.
- **남은 의존성(총괄/root)**: code+docs 통합·원격 SHA 대조·커밋은 총괄 순차. UI minus-수명/카드수명 통합과 instancing 함수 불변 재확인(이번도 slice 불변 확인).
- 발 앵커 UNKNOWN, 좌표/수치/에셋/corpse fade/죽음 판정 변경 0, 실제 GL/시각/패키지 0, `productionApplied=false`. body skip 가드 단독 제안 없음.

## 재실행

```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node \
  tools/team-followup-20261002/supervisor-next/ANIMVFX/ANIMVFX-texture-failure-body-0548/checks.mjs
```

하니스는 JSON을 stdout으로 출력하고 파일을 추가하지 않는다. GL API·텍스처·`_mW.ready`·시간은 대역/합성입력이며, 2D body는 실제 원문 블록을 canvas source-sink로 실행한다. source fixture PASS는 실제 GL/픽셀/시각 PASS가 아니다.

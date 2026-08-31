# CH1-1 START OUTER MASS — PRODUCTION SSOT

> 적용일: 2026-08-30  
> 적용 맵: **CH1-1 / si0 / `G.stage===0`**  
> 중요: `si1`은 CH1-2 실험 geometry이며 이 문서의 대상이 아니다.  
> 제작 기준: `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` GATE 2~4

## 범위와 결론

CH1-1 실제 시작맵의 LEFT / RIGHT / TOP / SOUTH 외곽에 기존 CH1 대형 환경 에셋을 겹쳐 하나의 썩은 숲·뿌리·시체 mass를 만든다. GATE 2~4 제작 당시에는 collision/route/authored를 보존했으나, 현행은 이 baked mass와 실제 이동 경계를 일치시키기 위해 canonical forest tile boundary를 적용했다.

이 패스는 **OUTER GATE 2~4 PASS**다. CH1 전체 완성 PASS가 아니며 CENTER / LANDMARK / SMALL DETAIL은 후속 패스다.

> **후속 현행 상태**: outer master와 이 문서의 GATE 2~4 시각 PASS는 locked baseline으로 보존한다. CH1-1 기본 runtime은 build-time에 outer를 포함한 `baked_start_smoothing` 완성본을 선택한다. `forestBoundary:1` tile geometry가 baked forest의 큰 경계를 담당하며 `?ch1StartPhase=outer`는 시각 baseline 비교다.

## 정확한 런타임 계약

| 항목 | 현행 값 |
|---|---|
| stage | `0` (CH1-1 / si0) |
| 현행 기본 phase | smoothing 완성 master (`CH1_1_SMOOTHING_PASS.md`) |
| outer-only baseline | `?ch1StartPhase=outer` |
| baked 전체 OFF | `?ch1StartOuter=0` |
| boss arena | `G._bossArena===true`이면 자동 OFF |
| master | `assets/map/ch1/baked_start_outer/CH1_1_START_OUTER_MASTER.png` |
| master 크기 | 8192×8192px |
| 실제 world | 200×200×40 = 8000×8000px |
| 8192 padding | 8×8 정수 chunk grid를 위한 우/하 192px 제작 여유. 실제 world 밖은 카메라에 사용하지 않음 |
| chunk | 8×8 = 64개 |
| chunk 파일 | `chunk_x_y.png`, 각 1026×1026px |
| core / bleed | 1024px / 사방 1px copy bleed |
| 로딩 | 현재 viewport + 1-neighbor만 요청, chunk별 decode/GPU warm 완료 즉시 표시 |
| QA hook | `globalThis.__ch1StartOuterQA()` |
| 제작 수량 | BACK 14 / LARGE 20 / MEDIUM 16 / GROUND_CONNECTION 1 / SMALL 0 |
| 큰 경계 | `_buildCh1StartForestRLE(200,200)` canonical tile wall; player/enemy/flow/spawn/minimap 공통 |
| north gate | `_applyCh1StartNorthGate`: bossCx100/gateY5, exits `(99..101,7)`, approach `x88..112,y2..35` 보존 |
| structural prop integration | `m_c1b*`, `m_c1cn/cs/ce/cw*` module 59개 제거; alpha `.42/.70` 경로는 현행 instance 0 |
| collision / route | prop-row collision을 tile geometry로 교체 / START→north approach 전 segment 보존 |
| authored object | 63 authored + system `boss_gate_col` 1 = runtime64; wall 뒤 `m_eye_tree(185,55)` 제거 |

## 레이어와 외곽 문법

| 구역 | 문법 | 구현 |
|---|---|---|
| LEFT | 낮고 넓은 수평 root/corpse mass | 넓게 누운 root/tree composite, dark recess, 불규칙 FRONT |
| RIGHT | 높고 뒤틀린 vertical pressure | tall cursed tree/corpse/root, LEFT보다 두꺼운 ground shadow |
| TOP | SOUTH보다 밀도 높은 exit funnel | 중앙 EXIT gap만 보존하고 양 shoulder를 dark mass로 압축 |
| SOUTH | 열린 START threshold | 중앙 START gap 보존, 좌우 낮은 root/corpse mass |

제작 순서는 BACK → LARGE → MEDIUM → GROUND_CONNECTION이다. SMALL prop은 0이다. ground pass는 inner edge를 따라 blur shadow와 soil contamination을 합성한다. 2026-08-30 최종 retouch에서 연속 보라색 edge line을 저채도 dark-brown dash로 낮추고, LEFT/RIGHT 각 3개 inward blurred root spread를 추가해 구조물 하단의 sticker 경계를 제거했다.

## 보호 좌표

| 역할 | tile | baked alpha 계약 |
|---|---:|---:|
| START | (100,185) | ≤8 |
| EXIT | (100,7) | ≤8 |
| HERO corpse tree | (102,90) | ≤8 |
| CAMP | (45,100) | ≤8 |
| ALTAR | (147,97) | ≤8 |

## 기술 검증

| 항목 | 결과 |
|---|---|
| 정적 계약 | `test/ch1StartOuterMass.test.js` 4/4 PASS |
| master outer alpha | LEFT/RIGHT/TOP/SOUTH edge opaque PASS |
| protected center alpha | START/EXIT/HERO/CAMP/ALTAR transparent PASS |
| chunk count/size | 64 / 1026×1026 PASS |
| horizontal/vertical bleed | adjacent 1px equality PASS |
| normal START viewport | cache/request/ready 15/15/15, visible/drawn 6/6 |
| normal max GPU warm/draw | 10.6ms / 0.2ms |
| full-map capture | 64/64 ready, error 0, max warm 11.4ms, max draw 0.2ms |
| boss arena guard | enabled false, additional draw 0 |
| stage1 isolation | stage0 cache request 0; 기존 stage1 baked 경로 간섭 0 |
| pageerror / 404 | 0 / 0 |
| runtime object regression | total64, hand63, structural0, collision total23/hand22, auto0 |
| runtime tiles | floor23199 / wall16495 / exit3 / gate3 / boss300 |

## 시각 검증

- BEFORE: 외곽이 분절된 block row와 빈 바닥으로 읽혔다.
- AFTER: 전체맵 축소에서 LEFT / RIGHT / TOP / SOUTH가 연속된 organic mass로 연결된다.
- 과거 collision prop row는 제거하고 baked side/top/south forest에 대응하는 continuous tile wall로 교체했다. 시각 mass 자체에 alpha collider를 붙이지 않는다.
- 중앙 corpse tree, camp, altar, toxic/cocoon 및 큰 combat void는 이 패스에서 수정하지 않았다.
- 남은 내부 block row와 center/landmark 완성도는 다음 GATE 5~6 범위다.

## 산출물

- BEFORE: `captures/ch1_1_outer_mass_recovery_20260830/BEFORE/`
- 1차 AFTER: `captures/ch1_1_outer_mass_recovery_20260830/AFTER/`
- 최종: `captures/ch1_1_outer_mass_recovery_20260830/FINAL_PASS/`
- 최종 full map: `FINAL_PASS/CH1_1_full_4000.png`
- 최종 8-camera board: `FINAL_PASS/CH1_1_8_CAMERA_BOARD.png`
- camera 검증: START / SOUTH_LEFT / SOUTH_RIGHT / MID_LEFT / MID_RIGHT / CORPSE_TREE_LEFT / CORPSE_TREE_RIGHT / NORTH_EXIT
- master overview: `captures/ch1_1_outer_mass_recovery_20260830/MASTER/CH1_1_START_OUTER_MASTER_OVERVIEW.jpg`
- backup: `captures/ch1_1_outer_mass_recovery_20260830/SOURCE_BEFORE/game_before_si0_outer.html`

## MAP PRODUCTION REPORT

```text
================= MAP PRODUCTION REPORT =================

STAGE: CH1-1 / si0 / G.stage 0

MASTER
- silhouette: four-sided rotten forest mass with START/EXIT gaps
- regions: LEFT / RIGHT / TOP / SOUTH; CENTER intentionally deferred
- main route: SOUTH → NORTH 의미 보존; forest tile boundary로 side edge 동기화
- side spaces: landmark pocket은 보존, baked forest 내부는 canonical wall

OUTER MASS
- LEFT: low-wide horizontal root/corpse mass
- RIGHT: taller twisted root/corpse/tree pressure
- TOP: dense asymmetric exit funnel
- SOUTH: lower-density open start threshold
- major holes: none on screen outer edge; START/EXIT gaps intentional

LARGE
- source assets: existing CH1 bound/corner/mega/tree assets only
- composites: 20
- overlap: varied crop/scale/flip/rotation, approximately 30~50% visual overlap
- repeated silhouette: reduced by overlap and perimeter-prop alpha integration

MEDIUM
- connections: 16 existing edge/root/corpse/rib/rootcage layers
- remaining holes: no unintended outer-edge hole

GROUND
- shadow: 1 continuous vector shadow/soil pass
- contamination: dark root-colored edge lines and recess fade
- structure integration: PASS for outer GATE; center untouched

PLAYABLE
- main arenas: landmark/combat core 보존
- travel space: canonical forest tile boundary 적용
- breathing space: START 및 중앙 개활지 보존
- threat space: side forest non-walkable
- combat readability: center remains open; no new central silhouette

LANDMARK
- primary: unchanged corpse tree
- secondary: unchanged camp/altar
- tertiary: unchanged toxic/cocoon

CAMERA QA
- START: center open, south corners connected to outer mass
- EARLY: not modified beyond outer edge
- ARENA: center open
- SIDE L: continuous low-wide mass at screen edge
- SIDE R: continuous taller twisted mass at screen edge
- LANDMARK: unchanged
- LATE: outer wall continues without chunk break
- EXIT: dense shoulders, north center readable

TECH QA
- route: START `(100.5,185.5)`→north `y23.43` 실제 WASD segment PASS; exits y7
- collision: canonical tile wall + total23/hand22 object collision
- pageerror: 0
- 404: 0
- seam: PASS
- loading: visible + neighbor progressive
- performance: warm max 10.6ms normal / draw max 0.2ms

FILES
- stage-owned: baked_start_outer master/chunks/manifest, builder, stage0 loader, test, captures, this SSOT
- concurrent touched: pre-existing game.html/docs changes preserved
- unrelated touched: none intentionally

GIT
- staged: none
- commit: none
- push: none
- deploy: none

VISUAL VERDICT:
PASS — OUTER MASS GATE 2~4 ONLY

NEXT PASS:
`CH1_1_SMOOTHING_PASS.md`에서 GATE 5~6 시각 연결 PASS. SMALL detail은 계속 미착수.
```

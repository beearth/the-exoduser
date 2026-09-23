# EXODUSER Diablo-Style Field Rebuild Plan — 2026-09-23

> 상태: IMPLEMENTATION PLAN / 기존 stage layout 폐기 승인 대기 아님 — 사용자 지시로 재구축 가능.
> 참고: Diablo IV의 구조적 레벨 디자인(넓은 필드, 연속된 외곽 지형, 전투 우선 가독성)을 분석 대상으로 삼는다. 특정 게임의 에셋·맵 데이터를 복제하지 않는다.

## 1. 목표

기존의 방/복도 중심 맵을 200×200 타일 안의 단일 연속 필드로 교체한다. 시작은 6시, 출구는 12시이며, PLAY/NAV와 시각 환경을 분리한다.

| 항목 | 기존 접근 | 재구축 목표 |
|---|---|---|
| 이동 지형 | room/corridor carving | 비대칭 대형 basin + 짧고 넓은 transition |
| 경계 | 개별 prop·타일 경계 혼합 | NAV mask 하나가 충돌/AI/스폰/미니맵의 기준 |
| 환경 | prop 중심 배치 | BACK/MID/FRONT/GROUND 연속 mass |
| 바닥 | 단일 바탕 + 세부 소품 | base texture + region mask + decals |
| 전투장 | 방 단위 | 넓은 combat void, 저대비 바닥, 외곽만 밀도 높음 |
| 랜드마크 | 독립 오브젝트 | 바닥/동선/negative space까지 변화시키는 장소 |

## 2. Runtime 계약

기존 `genFromTemplate`을 유지하고 `genGauntlet`은 폴백 전용으로 둔다.

```text
StageBlueprint
  -> NAV mask (200×200, authoritative)
  -> terrain region masks
  -> baked 8192×8192 environment master
  -> 8×8 chunk crop (1024 core + bleed)
  -> visible + neighbor chunk streaming
  -> gameplay objects / occluders / hazards
```

- `G.map`/`isW`/`canMv`/`safePt`/flow/spawn/minimap은 NAV mask만 사용한다.
- 배경 숲, 절벽, debris, ground stain은 render-only다.
- 충돌 물체는 보스 게이트·hazard·상호작용물 등 필수 항목으로만 제한한다.
- 기존 `_streamChunks`, map cache, GPU warm-up을 재사용한다.

## 3. StageBlueprint

```js
{
  id: 'ch1_01',
  route: 'south_to_north',
  regions: [
    { role:'start',   cx:100, cy:181, rx:30, ry:18 },
    { role:'combat',  cx:78,  cy:145, rx:34, ry:25 },
    { role:'travel',  cx:112, cy:108, rx:27, ry:21 },
    { role:'combat',  cx:88,  cy:70,  rx:36, ry:25 },
    { role:'pocket',  cx:151, cy:82,  rx:22, ry:18 },
    { role:'boss',    cx:100, cy:24,  rx:31, ry:20 }
  ],
  terrain: { base:'rotted_soil', rim:'corpse_root_wall' },
  landmarks: [],
  encounters: []
}
```

지역은 화면 진입 3초 내 차이를 만들도록 폭·바닥·외곽 silhouette·landmark·전투 역할 중 두 항목 이상을 바꾼다. pocket은 본선의 단순 S자 연장선이 아니라 main combat 지대에서 분기한다.

## 4. 시각 레이어

| 레이어 | 내용 | 충돌 |
|---|---|---|
| BASE | 반복 가능한 지면 재질 | 없음 |
| GROUND | 균열·진흙·눈·피·오염 mask | 없음 |
| BACK | 원경 숲/절벽/심연/안개 | 없음 |
| MID | 대형 환경 구조 연결 mass | NAV로만 반영 |
| FRONT | 플레이 공간 가장자리 silhouette | NAV로만 반영 |
| GAMEPLAY | gate, hazard, interaction, foreground occluder | 필요한 것만 |

공용 첫 베이스 텍스처는 `assets/map/shared/diablo_field_base_cold_v1.png`이다. 이는 cold battlefield prototype용이며 CH1의 rotten forest에는 동일한 material scale/contrast 규칙만 적용하고 색·재질은 별도 생성한다.

## 5. CH1-1 첫 Vertical Slice

| Region | 역할 | 시각 | 전투 |
|---|---|---|---|
| South Forecourt | START | 감염된 숲 입구·낮은 시야 | 안전/첫 인지 |
| West Basin | COMBAT | 썩은 나무 mass가 감싼 넓은 진흙 지대 | 첫 swarm |
| Broken Traverse | TRAVEL | 노출된 뿌리·좁아졌다 다시 열리는 통과 | 이동/소규모 교전 |
| Corpse-tree Clearing | COMBAT + PRIMARY | 거대 시체나무, 사방이 열린 공터 | 주 전투 |
| Altar Marsh | SIDE POCKET | 우측 제단·독성 습지 | 보상/엘리트 |
| North Gate | BOSS | 숲이 압축되며 관문 silhouette 확대 | 보스 접근 |

## 6. 제작 Gate

1. MASTER: region/route/landmark/empty-space 역할 확정
2. NAV: map polygon + top gate + side pocket, 실제 WASD 종주
3. OUTER MASS: BACK/MID/FRONT 4방향 연속 silhouette
4. GROUND: material mask와 structure 접합
5. COMBAT: swarm/projectile/loot 상태의 가독성
6. BAKE: master → 64 chunks, bleed/seam/streaming QA
7. CAMERA: START/EARLY/ARENA/SIDE/LANDMARK/LATE/EXIT

## 7. 구현 순서

1. `StageBlueprint` 기반 deterministic NAV generator와 테스트 추가
2. `genFromTemplate`가 blueprint tileRLE/room/spawn 데이터를 소비하도록 연결
3. legacy hand scatter를 blueprint별 environment composition으로 교체
4. base/ground/rim 마스크를 map cache에 베이크
5. CH1-1 camera/combat/technical QA
6. CH1 5개 stage를 biome kit만 바꿔 확장
7. CH2~CH7을 동일 문법으로 전환

## 8. 검증 기준

- START 6시 / EXIT 12시 / 상단 통로 보장
- 의도된 PLAY 공간 밖은 NAV에서 항상 막힘
- 바닥 경계가 40px 타일 계단으로 보이지 않음
- runtime random scatter 없음; layout은 blueprint-authored
- visible chunk만 draw, seam/404/page error 없음
- enemy·projectile·parry·loot가 ground보다 우선 읽힘
- 자동 테스트 PASS와 시각 PASS를 분리해 보고

## 9. 현재 상태

- hell v2 시각 시안 `assets/map/ch1/rottenwood_field_master_concept_hell_v2.png`을 추가했다. 기존 남→북 동선·서측 전투터·중앙 시체나무·동측 습지·북측 관문 구도는 유지하고, 용암 균열·타버린 뿌리·재·진홍 연무·강화 관문으로 지옥 분위기를 올린 **컨셉 원화 전용**이다. baked/runtime 타일 연결, 에셋 분해, 카메라 가독성 QA는 미완료다.
- 2026-09-23 사용자가 제공한 플레이 화면을 기준으로 전체맵 미술 방향을 **불탄 거대 뿌리 숲**으로 확정했다. 제작 시안 `assets/map/ch1/rottenwood_field_rootworld_concept_v1.png` (1254×1254)은 연속된 검은 뿌리 외곽 질량, 얇은 진홍 균열, 재 바닥, 남→북 진행축, 서측 전투 분지, 동측 습지, 북측 관문을 한 장에 제안한다. 이 파일은 **GATE 1/비주얼 컨셉 전용**이며 runtime bake·tile crop·collision·좌표 계약에는 사용하지 않았다. 다음 제작은 GATE 2 LARGE OUTER MASS로 좌/우/북/남 mass를 기존 locked NAV에 정합한다.
- `game.html`에는 **`mapqa=1&fieldrebuild=1&stage=0` 전용** 런타임 실험 경로를 연결했다. 나머지 실행 URL과 CH1-1 production map은 변경하지 않는다. `_buildDiabloField(0,200,200)`이 deterministic 200×200 tileRLE 및 south→north six-region layout을 만들고 기존 `genFromTemplate`으로 넘긴다. 시작 중심은 tile `(100,181)`, 북쪽 boss room은 `(100,24)` 부근이고 보스 접근은 engine gate generator가 잇는다. 일반 enemy wave는 map QA 설정이 비운다.
- QA 전용 시각 오브젝트: 시체나무 `assets/map/ch1/diablo_hell_corpse_tree_v1.png` 1개(메타 size 920, non-collision) + 횃불 8개(런타임 메타 size 150, non-collision). 횃불 받침은 `assets/map/ch1/diablo_field_torch_base_v1.png` (1180×1333, 고정 정지 이미지), 불꽃은 `assets/map/ch1/diablo_field_torch_flame_v1.png` (1672×944 RGBA, 4열×2행·8프레임 투명 시트)로 분리한다. `diablo_hell_torch_flame` 메타는 `interval:110ms`; 전체 루프는 880ms이며 위치 시드로 재생 위상을 분산한다. 프레임은 원본 위치의 불꽃/불티를 유기적으로 변화시키고 나무·철제 받침은 고정한다. `_drawDiabloTorchFrame`은 `G._fieldRebuildQA`일 때만 시트를 그리며, flame overlay는 map cache에 베이크하지 않는다. 타일·충돌·production 배치는 변경하지 않는다. 기존 stage composition/editor prop은 이 분기에서 제외한다. 바닥은 stage0의 기존 `gt_03`/soil floor를 재사용하고, render-only burnt fissure 9 path + blood-soil stain 5개를 full-map cache와 stream-chunk cache 양쪽에 그린다.
- QA 한정 자연 흔들림: 시체나무 `sway:0.0045rad`, 고목 3종 `0.018/0.016/0.014rad`. 밑동 pivot은 sprite size의 `0.34` 지점에 고정하고, 시간각 `now×0.00058` 및 `now×0.00107`의 느린 sin 중첩(`1.0 + 0.24` 가중)과 오브젝트 좌표 seed로 작은 바람 응답을 만든다. `G._fieldRebuildQA` 밖에서는 비활성이고 geometry, collision, production placement는 바꾸지 않는다.
- 실행: `http://127.0.0.1:3334/map/field` → `/game.html?test=1&testchar=1&stage=0&classic=1&mapqa=1&fieldrebuild=1`. 기존 `/map/0`은 본편 CH1-1 QA를 그대로 연다. 허브에는 “지옥 필드 실험맵” 링크가 추가됐다.
- 자동검증 `test/diabloFieldMap.test.js`, `test/diabloFieldRuntime.test.js`, `test/diabloFieldPreview.test.js`, blueprint/stage-plan, `test/mapTestServer.test.js`: 11/11 PASS (2026-09-23). 실제 브라우저 런타임에서 map cache/terrain/오브젝트 생성 및 URL 오류 0을 확인했고, Three.js 중복 import 경고 1건은 기존 의존성 경고다. 시작 시점 화면은 여전히 지나치게 어둡고 시체나무 landmark camera / combat readability / 8-way camera board / WASD full route QA는 미완료. 현 visual verdict는 **RETOUCH**, 자동 테스트 PASS를 시각 PASS로 간주하지 않는다.
- QA 미리보기 `map-field-preview.html`은 blueprint 지형과 비충돌 외곽 mass를 그리고, 투명 배경 `assets/map/ch1/diablo_hell_corpse_tree_v1.png`를 시체나무 landmark로 사용한다. 횃불은 `diablo_field_torch_v1.png`를 사용한다. 자동 검증 `test/diabloFieldPreview.test.js`는 랜드마크 에셋·외곽 렌더 경로 및 legacy `_CH_DECO`/`floor_objects` 미사용을 확인한다. 이 뷰어는 playable runtime이 아니다.
- 계획 문서와 공용 cold-field prototype texture 생성 완료.
- `src/diabloFieldStagePlan.js`의 순서 역할은 `start/combat/travel/combat/pocket/boss`로 blueprint와 일치한다. Blueprint/stage plan/terrain/NPC 자동 테스트 6/6 PASS.
- 기존 CH1-1 제작맵 교체는 새 경로의 시각·카메라·전투·이동 QA 및 사용자 승인을 받은 뒤 별도 결정한다. 현재는 QA-only additive branch다.
- 기존 맵 소스 백업: `game.html.bak_before_diablo4_map_20260923`, `maps_data.js.bak_before_diablo4_map_20260923`.

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

- 계획 문서와 공용 cold-field prototype texture 생성 완료.
- `src/diabloFieldStagePlan.js`의 순서 역할은 `start/combat/travel/combat/pocket/boss`로 blueprint와 일치한다. Blueprint/stage plan/terrain/NPC 자동 테스트 6/6 PASS.
- `game.html` 런타임 연결은 아직 미적용이며, 기존 CH1-1 제작맵 교체는 새 경로의 기술·카메라·전투 QA 완료 후 진행한다.
- 기존 맵 소스 백업: `game.html.bak_before_diablo4_map_20260923`, `maps_data.js.bak_before_diablo4_map_20260923`.

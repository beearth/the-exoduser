# 지옥의 틈 · 독립 정사영 2.5D 대표 구간

완료 식별: `ROOT-RIFT-2_5D-TERRAIN-SLICE-20261006`. 현재 상태는 **독립 지형 모듈 구현 / 실제 화면 인수 대기 / 생산 미채택**이다. 캐릭터·lab 소비자는 총괄 담당이며, 이 문서의 지형 제작 범위는 `tools/2_5d/rift-terrain.mjs`다. 기존 원화·씬 JSON·nav·에디터·주민 atlas·사용자 저장을 변경하지 않는다.

## 1. 정본과 보존 계약

`_MAP_SSOT_INDEX.md`와 `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` 전체를 선행했다. 제작 순서는 MASTER PLAN → LARGE OUTER MASS → MEDIUM CONNECTION → GROUND CONNECTION → PLAYABLE → LANDMARK/CENTER → SMALL DETAIL → CAMERA QA → TECH QA다. 기존 대형 덩어리·길·랜드마크를 재사용하고 새 전체 지형을 반복 생성하지 않는다. 그림의 가림 폴리곤을 충돌이나 측정된 절벽 높이로 해석하지 않는다.

| 항목 | 현행 값 |
|---|---|
| 원본 씬 | `assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json` |
| 씬 SHA256 | `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a` |
| clean plate | `assets/map/hell_rift/resident_layers_20261006/clean-plate-v1.png`, 1254×1254 |
| clean plate SHA256 | `aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673` |
| 심연 | `assets/map/hell_rift/interspace_20261005/hell-rift-abyss-v3.png`, 1920×1920 |
| 심연 SHA256 | `ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991` |
| nav SHA256 | `a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179` |
| world | 200×200 / tile40 / 8000×8000 world px |
| 전체 보행 | 기존1192칸. `MapSceneCore.canWalk` 중심+radius12 대각4점의5샘플 유지 |
| 기존 시작 / 출구 | (4020,7740) / (4020,1740), 원본 불변 |
| 대표 표시 영역 | x4300…6560, y3200…4600 / 2260×1400 |
| 좌표 원점 | canonical (5430,3900) |
| 독립 시험 spawn | (5900,3820). 원본 scene.start를 변경하지 않는다 |
| 원본 높이 | **UNKNOWN**. 실제 heightmap·물리적 cliff footprint 없음 |

1254 clean plate는 생성 파생 이미지이며 원본 픽셀의 정확 추출로 주장하지 않는다. Three 전환 자체가 해당 원화의 해상도를 복구하지 않는다. 주민 등록은 현재 공유 `residentPaintingProfile`로 검증하며 원본4주민 발·크기를 변경하지 않는다. 대표 영역 밖 주민은 이 지형 모듈에서 새로 배치하지 않는다.

## 2. API와 정사영 등록

`createRiftTerrain({THREE,angle=50,scale=400})`는 async다. Three Group/ShapeUtils, MapSceneCore, Web Crypto SHA256, 브라우저 Image 디코딩이 필요하다. HTTP 오류·핀/크기/등록 실패는 reject하며 다른 지도로 폴백하지 않는다.

| 반환 | 계약 |
|---|---|
| `object3d` | 지면·심연 후경·독립 절벽 측면·동측 뿔 메시 Group |
| `worldToScene(x,y,h=0)` | `THREE.Vector3`. 입력은 유한수, h는 world px |
| `sceneToWorld(vector)` 또는 `(x,y,z)` | fresh `{x,y,h}`. 정사영 역변환 |
| `canWalk(x,y,r=12)` | 전체 기존 nav의 코어 질의. 표시 clip으로 충돌을 잘라내지 않음 |
| `spawn` | fresh `{x:5900,y:3820}` |
| `bounds` | canonical clip, centre, width2260, height1400 |
| `occluders` | 동측 뿔 object3d·objectId·footY4320·원본 mask world polygon |
| `snapshot()` | 배율·각도·핀·nav1192·메시 수·미인수 경계 진단 |
| `dispose()` | Group 제거 및 모든 geometry/material/GPU texture 해제. 중복 호출 안전 |

각도 θ=angle, S=scale, 중심(cx,cy)=(5430,3900)일 때:

```text
X=(x-cx)/S
Y=h/S
Z=((y-cy)+h*cosθ)/(S*sinθ)
x=cx+X*S
y=cy+(Z*sinθ-Y*cosθ)*S
h=Y*S
```

각도는10…85°, scale은0초과…32000이며 기본50°/400이다. 카메라 yaw/roll0, 같은 고도각으로 ground foot를 추적해야 원화 등록이 유지된다. 바닥은 h0 수평 메시다. canonical y를 그냥 Three Z에 복사하면 sin50°만큼 축소되므로 위 보정을 유지한다. 카메라 구도 변경은 별도 검수이며 자유 orbit은 현재 계약 밖이다.

## 3. 메시·UV·가림

| 대상 | 구현 / 수치 / 한계 |
|---|---|
| 지면 | 전체8000² 사각형에서 원본 심연28점 mask를 hole로 triangulate한 뒤 대표 clip에 자른다. clean plate UV는 canonical x/8000, 1−y/8000로 정확 등록. 6crop이 같은 전체 이미지/배율을 공유하는 관계를 이용한 단일 지면 |
| 심연 | 원본 mask28점의 중심 방향90% inset 후경. 검수용 h−240worldpx, 원본 높이 의미 없음. 현재 물리적 낭떠러지/추락 판정 추가0 |
| 측면 | 원본 opening과90% inset 사이의 단일 chasm skirt. 깊이0…240worldpx, 정적 어두운 vertex color. 기존 랜드마크/길 위치를 바꾸지 않음. 큰 벽 반복 생성0 |
| 심연 시차 | sourceParallax .965. 카메라 중심 ray의 h0 교차점으로 texture offset만 이동, 메시 opening 경계 고정 |
| feather | 기존120worldpx soft mask를 새 3D hole에 재현하지 않음. `snapshot.maskFeatherApplied=false`; seam은 실제 화면에서 RETOUCH 대상 |
| 동측 뿔 | 원본11점 mask·crop 그대로. world bbox x5640…6000/y3320…4320, footY4320. foot origin 메시를 X축−angle만큼 회전한 camera-facing plane로 배치. 카메라가 fixedangle이면 quaternion 갱신 불필요 |
| 배우 가림 | 동측 뿔은 depth-writing mesh. 바닥보다 위인 배우 foot-depth와 함께 실제 depth test. 기존 footY 앞뒤가 실제 화면에서 유지되는지 총괄 QA 필요 |
| 텍스처 | 원본 PNG 수정0. SRGB/Linear mag/LinearMipmapLinear min. 기본 지면 원화색 유지, 심연 tint0x8396a7 |

동측 뿔 tile mask(×40=world): `[146,83],[149,83],[147,89],[147,94],[150,99],[149,105],[146,108],[141,108],[142,104],[143,100],[143,95]`.

바닥의 회화적 절벽 얼굴은 원래 그림에 남아 있다. 새 측면/심연은 **높이가 있는 대표 구간을 검수하기 위한 독립 geometry**이며, painted mask가 진짜 3D cliff footprint였다고 소급하지 않는다. MeshBasicMaterial로 원화색과 정적 skirt 음영을 사용하며 동적 지형 광원 완료로 계산하지 않는다. 원래 심연 opacity.38 합성을 그대로 복제한 2D 그림이 아니라 대표 opening의 독립 후경이며, GPU재질의 색/깊이/경계는 시각 인수 전이다.

## 4. 검수와 관련 문서 연결

코드 변경 후 docs 전체에서 `2.5D|정사영|심연|sourceParallax|footY|지옥의 틈`을 검색했다. 관련 상세 기준은 `HELL_RIFT_EDITOR_RESULT_20261006.md`, `MAP_SCENE_EDITOR_20261005.md`, `DEPTH_2_5D_BENCHMARK_20260930.md`, `_MAP_SSOT_INDEX.md`, 지옥의 틈 기획 및 총괄 문서다. 기존 완료 이력은 유지하고 이번 독립 지형 상태는 이 문서를 기준으로 총괄이 동기화한다.

현재 모듈 syntax 검사만 담당 범위다. 총괄이 3387 독립 lab에서 첫 화면·WASD·심연 seam·동측 뿔 앞뒤·원화 등록을 검수한다. 기존 unit/보행 종주/native6단계 PASS를 새 Three 검수로 재사용하지 않는다. 본편 연결·NPC대화·광원/높이 물리·native·사운드·A급 완료는0이다.

## 5. MAP PRODUCTION REPORT (§23)

| 항목 | 보고 |
|---|---|
| MAP NAME / TYPE | 지옥의 틈 / 독립 정사영 2.5D 대표 slice |
| MASTER PLAN | 승인 원화·기존 동측 길·뿔 가림·심연을 같은 Three 화면에서 검수 |
| LARGE OUTER MASS | 기존 clean plate 및 심연 opening 재사용. 신규 전체 지형 생성0 |
| MEDIUM / GROUND CONNECTION | 기존1192 nav 유지. 대표 clip은 표시 영역만 |
| PLAYABLE / COMBAT | 보행 질의와 독립 spawn 제공. 전투/native 인수0 |
| LANDMARK / CENTER | 동측 뿔11점/footY4320 보존 |
| SMALL DETAIL | 신규 이미지/atlas/원본 픽셀 편집0 |
| CAMERA QA | 50° 정사영 등록 구현, 실제 화면 총괄 검수 대기 |
| TECH QA | `node --check tools/2_5d/rift-terrain.mjs` 실제1회 PASS, 기존 suite 반복0 |
| SOURCE HEIGHT / LIMIT | 원본 UNKNOWN; 깊이240worldpx/inset90%는 검수용 작성값 |
| REMAINING | seam feather/색·깊이·앞뒤 가림 실제 확인, 배우 consumer 연결 |
| VISUAL VERDICT | **RETOUCH — 실제 새 Three 화면 인수 전** |

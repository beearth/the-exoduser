# CH1 OUTER MASS FIRST — LARGE SIDE STRUCTURE PASS

> **역사적 CH1-2 실험 기록:** 이 문서의 `si1`은 1-2 / stage1이며 **CH1-1 시작맵(stage0)이 아니다.** 실제 CH1-1 outer production SSOT는 `CH1_1_START_OUTER_MASS.md`다.

> 2026-08-30 현행 CH1 si1 외곽 visual composition SSOT. 이 패스는 stage geometry·collision·route·START/EXIT·authored gameplay object를 변경하지 않는다. 기본 runtime도 그대로이며 query opt-in으로 LARGE, LARGE_MEDIUM, 후속 GATE 6 LANDMARK_CENTER를 비교한다. LANDMARK/CENTER 상세는 `CH1_LANDMARK_CENTER_PASS.md`를 따른다.

## 1. 범위와 불변 계약

| 항목 | 현행 값 | 적용 위치 / 계약 |
|---|---|---|
| stage | CH1 si1, `200×200 tiles` | 다른 stage 무접촉 |
| master | `8192×8192 px` | `40 px/tile`, 전체 CH1 외곽 |
| outer scope | LEFT / RIGHT / TOP / SOUTH | CENTER는 투명 유지 |
| geometry source | `assets/map/ch1/geometry/ch1_si1_geometry.js` | SHA-256 `5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f` |
| runtime map hash | CURRENT/LARGE/LARGE_MEDIUM/LANDMARK_CENTER 공통 `a67605a94904e4cc2a564d6a6d060ab1da55bb35f185221522eef3616ef1a033` | geometry·collision·route 동일 증거 |
| authored/runtime | `12/12`, skip `0` | landmark·gameplay 좌표 불변 |
| START | `(100.5,185.5)` | 변경 없음 |
| EXIT | `(99~101,33)` | 변경 없음 |
| center | `centerTouched=false` | walkable ground alpha `0`, 신규 structure 없음 |
| small prop | `0` | `smallProps=[]` |

## 2. 제작 단계

| 단계 | query | 합성 layer | 목적 |
|---|---|---|---|
| CURRENT | `ch1BakedSpike=1` | 기존 SOUTH 20 chunk | 수정 전 비교 |
| LARGE | `ch1OuterMass=large` | BACK 18 + LARGE 21 | 대형 구조물만으로 전 외곽 mass 확정 |
| LARGE + MEDIUM | `ch1OuterMass=large_medium` | BACK 18 + LARGE 21 + MEDIUM 17 + GROUND_CONNECTION | 접합·바닥 연결만 보정 |
| GATE 6 LANDMARK/CENTER | `ch1OuterMass=landmark_center` | LARGE_MEDIUM + GROUND_LANDMARK + GROUND_TRANSITION | 5개 POI 지면 정체성, 보호 공간 유지 |

두 outer query는 기존 baked draw/cache/warm 경로를 재사용한다. 기본 query가 없으면 outer phase는 로드되지 않으며 기존 `ch1BakedSpike=1` SOUTH 동작도 보존된다. 각 phase는 동일 master에서 `8×8=64` chunk를 추출한다. 각 파일은 `1026×1026 px`, core `1024×1024 px`, copy bleed `1 px`다.

## 3. 사용 asset

| 분류 | asset | 역할 |
|---|---|---|
| LARGE boundary | `bound_n/s/w/e.png`, `corner_nw/ne/sw/se.png` | 방향별 wall face와 corner 접합 |
| LARGE corpse/bone | `mega_ribs.png`, `mega_head.png` | RIGHT/TOP 압박과 깊은 silhouette |
| LARGE vegetation | `cursed_tree_03.png`, `cursed_tree_11.png` | scale·flip·crop한 breakup |
| MEDIUM connector | `prop_g_edge.png`, `prop_g_root.png`, `prop_g_corpse.png`, `prop_rootcage.png`, `prop_rib.png` | large 접합·root spread·ground dissolve |

small bone/pod/root scatter는 사용하지 않는다. 같은 source는 scale·flip·crop·rotation·opacity·brightness와 30~50% overlap으로 전체 silhouette 노출을 피한다.

## 4. 방향별 grammar

| side | 형태 | density / depth |
|---|---|---|
| LEFT | 낮고 넓은 수평 뿌리·시체 mass | BACK recess → MID root belt → FRONT ground-reaching edge |
| RIGHT | 높고 뒤틀린 수직 corpse/root mass | LEFT보다 강한 vertical silhouette, 안쪽 돌출 포함 |
| TOP | 비대칭 natural funnel | SOUTH보다 조밀하며 boss 방향만 열림 |
| SOUTH | 낮은 root/vegetation threshold | START 진입감을 위해 TOP보다 낮은 밀도 |

검정은 asset 사이 공백으로 남기지 않고 structure 뒤 forest interior/recess로만 사용한다. 경계에는 dark shadow, root spread, corpse contamination을 겹치고 canonical walkable 경계에는 `24 px` visual blend를 둔다. 이 값은 collision feather가 아니라 baked image 경계 처리다.

## 5. 파일과 runtime 계약

| 역할 | 경로 |
|---|---|
| composition manifest | `assets/map/ch1/baked_spike/outer_mass/composition.json` |
| LARGE master | `assets/map/ch1/baked_spike/outer_mass/large/CH1_OUTER_LARGE_MASTER.png` |
| LARGE chunks | `assets/map/ch1/baked_spike/outer_mass/large/chunk_0_0.png` … `chunk_7_7.png` |
| LARGE_MEDIUM master | `assets/map/ch1/baked_spike/outer_mass/large_medium/CH1_OUTER_LARGE_MEDIUM_MASTER.png` |
| LARGE_MEDIUM chunks | `assets/map/ch1/baked_spike/outer_mass/large_medium/chunk_0_0.png` … `chunk_7_7.png` |
| LANDMARK_CENTER master | `assets/map/ch1/baked_spike/outer_mass/landmark_center/CH1_LANDMARK_CENTER_MASTER.png` |
| LANDMARK_CENTER chunks | `assets/map/ch1/baked_spike/outer_mass/landmark_center/chunk_0_0.png` … `chunk_7_7.png` |
| builder | `tools/build_ch1_outer_mass.mjs` |
| GATE 6 builder | `tools/build_ch1_landmark_center.mjs` |
| runtime capture | `tmp/capture_ch1_outer_mass.py` |
| comparison builder | `tmp/build_ch1_outer_mass_comparisons.mjs` |
| regression | `test/ch1OuterMassFirstPass.test.js` |

## 6. QA

| 검사 | LARGE | LARGE_MEDIUM |
|---|---:|---:|
| request/ready/error | `64/64/0` | `64/64/0` |
| decode/warm | `64/64` | `64/64` |
| max GPU warm | `18.4 ms` | `17.1 ms` |
| max baked draw | `0.1 ms` | `0.2 ms` |
| pageerror | `0` | `0` |
| asset 404 | `0` | `0` |
| authored/runtime | `12/12` | `12/12` |
| runtime map SHA-256 | CURRENT와 동일 | CURRENT와 동일 |

full-map 직접 검사에서 LEFT/RIGHT/TOP/SOUTH는 화면 외곽까지 끊기지 않는 하나의 organic wall로 읽히고 CENTER는 열린 채 유지된다. LARGE_MEDIUM은 대형 형태를 새 landmark로 분해하지 않고 접합부와 ground transition만 보강한다. 검정 recess는 남지만 outer edge를 끊는 빈 background hole은 없다.

최종 CURRENT/LARGE/LARGE_MEDIUM full-map, 카메라 비교, LEFT/RIGHT/TOP close-up은 `captures/ch1_outer_mass_first_20260829/FINAL_OUTPUT/`에 보존한다.

후속 GATE 6 `LANDMARK_CENTER`는 신규 vertical prop 없이 tree/camp/altar/toxic/cocoon 주변에만 ground identity를 추가했다. SOUTH combat void·central compression·tree 양쪽 bypass·boss approach는 alpha hole로 보호하며, 최종 8카메라/full-map/combat 증거는 `captures/ch1_landmark_center_20260830/`에 보존한다.

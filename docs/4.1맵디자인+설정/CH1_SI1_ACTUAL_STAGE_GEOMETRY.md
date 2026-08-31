# CH1 si1 ACTUAL STAGE GEOMETRY — RUNTIME SSOT

> 2026-08-30 outer/GATE 6 후속 상태: canonical geometry와 이 문서의 모든 좌표·폭·collision 값은 그대로다. `ch1OuterMass=large|large_medium`은 non-walkable 외곽에 `8192×8192` baked mass를 opt-in 합성하고, `ch1OuterMass=landmark_center`는 같은 base 위에서 5개 POI의 walkable ground identity만 추가한다. runtime map SHA-256은 CURRENT와 동일하다. visual phase의 asset·64-chunk·QA 계약은 `CH1_OUTER_MASS_FIRST_PASS.md`, `CH1_LANDMARK_CENTER_PASS.md`를 따른다.

> 기준일: 2026-08-29  
> 상태: **PRODUCTION CANONICAL / QA PASS**  
> 범위: stage `si1`만. CH2·CH3·다른 stage에는 적용하지 않는다.

## 1. 변경 이유와 canonical source

이전 si1은 `_cloneField11(1)`이 전용 `tileRLE` 없이 `[1,40000]`을 사용해 사실상 200×200 전체가 바닥이었다. LEFT/RIGHT baked mass와 75 authored prop은 그림과 장식만 바꿨고 실제 이동 경계·폭·우회·side pocket은 바꾸지 못했다.

현행 canonical geometry는 `assets/map/ch1/geometry/ch1_si1_geometry.js`의 `CH1_SI1_GEOMETRY`다. `game.html`의 `_cloneField11(si)`는 `si===1`일 때만 `CH1_SI1_GEOMETRY.buildRLE()`을 사용한다. editor RLE의 `1=floor`, `2=wall`이 runtime `G.map`의 `0=walkable`, `1=wall`로 변환된다. 다른 stage는 기존 `tileRLE`/fallback 경로를 그대로 사용한다.

| 항목 | 이전 CURRENT | 현행 NEW | 적용 위치 |
|---|---:|---:|---|
| map | `200×200` | `200×200` | stage 1 전용 |
| walkable | `39,964/40,000` | `13,732/40,000` | `99.91% → 34.33%` |
| 큰 경계 | 사실상 map 끝 | walkable/non-walkable mask | 개별 나무 collider 행 금지 |
| START | `(100.5,185.5)` | 동일 | 6시 |
| boss exit tiles | 북측 | `(99,33),(100,33),(101,33)` | 12시 접근 |
| 진행 | 직선·균일 폭 | 좌우 offset + 압축/해방 파동 | SOUTH→NORTH 의미 유지 |

## 2. 공간 리듬과 폭

| 순서 | region | 중심(tile) | 실제 형태/역할 |
|---:|---|---:|---|
| 1 | START THRESHOLD | `(100,185)` | 34t로 좁게 시작해 북동으로 열림 |
| 2 | SOUTH WIDE ARENA | `(115,158)` | 동쪽으로 치우친 비대칭 bowl, 89t release |
| 3 | TOXIC SIDE POCKET | `(49,151)` | 서쪽으로 실제 바닥이 확장되는 one-neck 왕복 pocket |
| 4 | COCOON BEND | `(151,136)` | arena 북동 출구에서 서쪽으로 되감기는 hook/S-curve |
| 5 | CENTRAL COMPRESSION | `(86,110)` | 43t 전투 가능 압축, tree 직접 노출 차단 |
| 6 | CORPSE TREE BASIN | `(98,80)` | 89t release, tree를 좌측에 둔 비대칭 좌/우 bypass |
| 7 | NORTH / BOSS APPROACH | `(110,38)` | 38t offset funnel, exit `(100,33)`으로 수렴 |

### width profile

| sample | tile | 실제 폭 | 목표 범위 |
|---|---:|---:|---:|
| START | `(100,185)` | `34t` | `25~35t` |
| SOUTH | `(115,160)` | `89t` | `65~90t` |
| CENTRAL | `(83,104)` | `43t` | `30~45t` |
| TREE | `(100,78)` | `89t` | `55~90t` |
| NORTH | `(113,39)` | `38t` | `25~40t` |

파동은 `34 → 89 → 43 → 89 → 38`이다. 전역 진행은 북쪽이지만 local spine은 `x=100 → 118 → 151 → 88 → 103 → 119 → 100`으로 좌우 이동한다.

## 3. 랜드마크와 navigation

| 계층 | id | 좌표(tile) | geometry 의미 |
|---|---|---:|---|
| START | start | `(100,185)` | 좁은 threshold |
| TERTIARY | toxic / `m_c1pool` | `(49,151)` | 서쪽 왕복 pocket 중심 |
| TERTIARY | cocoon / `m_c1cocoon` | `(151,136)` | 동쪽 hook bend 중심 |
| SECONDARY | camp / `m_c1camp` | `(49,122)` | central에서 갈라지는 서쪽 shelf pocket |
| SECONDARY | altar / `m_c1altar` | `(151,91)` | tree basin 동쪽 vertical alcove |
| PRIMARY | tree / `m_c1tree` | `(83,80)` | basin 좌측 offset, navigation divider |
| EXIT | gate | `(100,33)` | runtime exit row와 일치 |
| boss room | bossCenter | `(100,18)` | 북측 final cap 중심 |

tree collider를 제외한 명시적 우회선은 다음과 같다.

| bypass | waypoints | 성격 |
|---|---|---|
| LEFT | `(93,99)→(75,96)→(67,85)→(68,69)→(90,57)→(103,56)` | 짧고 좁음, tree 서쪽 |
| RIGHT | `(94,99)→(119,96)→(133,84)→(128,68)→(105,56)` | 넓고 긴 우회, altar 분기 연결 |

## 4. authored object 분류

과거 75개는 이전 full-floor/rim layout의 수치이므로 canonical 목표에서 제거했다. 현행 `_CH1S1`은 source/runtime `12/12`, skip `0`이며 모든 항목이 canonical walkable tile 위에 있어 `_nearFloor` 보정이 발생하지 않는다. 큰 경계는 map geometry가 담당한다.

| role | 수량 | id / 좌표(tile) | 적용 |
|---|---:|---|---|
| LANDMARK | 5 | `m_c1tree(83,80)`, `m_c1camp(49,122)`, `m_c1altar(151,91)`, `m_c1pool(49,151)`, `m_c1cocoon(151,136)` | A 계층, 기존 collider 유지 |
| GAMEPLAY | 7 | `m_c1sroot(91,180)`, `m_c1sbone(85,162)`, `m_c1spod(138,158)`, `m_c1sroot(129,128)`, `m_c1sbone(79,109)`, `m_c1spod(128,83)`, `m_c1sbone(116,43)` | region cue/edge breakup, 전투 core·bypass 비움 |
| COLLISION | 0 | — | 큰 경계는 tile geometry, 별도 prop wall 없음 |
| OCCLUDER | 0 | — | 직사각형 `m_c1gedge` 블록 인상 제거 |
| VISUAL_ONLY | 0 | — | ground decal은 painted layer로 흡수 |

runtime hand object에는 `role`과 `region` 메타를 전달해 QA에서 분류를 보존한다.

## 5. painted SOUTH 정합

| 항목 | 값 |
|---|---|
| master | `assets/map/ch1/baked_spike/south_visual_pass/CH1_SOUTH_MASTER.png` |
| bounds | world `(0,4096)`, `8192×4096px` |
| chunks | 기존 승인 목록 20장, 각 `1026×1026`, 1px copy bleed |
| flag | `ch1BakedSpike=1`, 기본 OFF |
| geometry source | `assets/map/ch1/geometry/ch1_si1_geometry.js` |
| walkable 처리 | alpha `0`, live runtime ground 표시 |
| non-walkable 처리 | 기존 BACK/MID/FRONT dense forest mass |
| edge integration | geometry alpha `20px` feather |

`tools/build_ch1_south_mass.mjs`는 동일 geometry source에서 alpha mask를 만들고, non-walkable에만 organic master를 남긴 뒤 기존 20 chunk를 재추출한다. 따라서 painted forest 뒤에 넓은 walkable blank floor가 남지 않는다. renderer/loader/collision architecture는 추가하지 않았다.

## 6. QA 계약과 결과

| 검사 | 결과 |
|---|---|
| geometry unit/contract | `test/ch1Si1GeometryRedesign.test.js` PASS |
| authored layout | `test/ch1Si1AuthoredLayout.test.js` PASS |
| painted alignment/seams | `test/ch1SouthCanaryVisualPass.test.js` PASS |
| loader/warm regression | `test/ch1PaintedStartSpike.test.js` PASS |
| 실제 WASD | 42 waypoint 전부 PASS; toxic/camp/altar 왕복, tree 좌/우 bypass, boss approach |
| stuck / wall mismatch | `0 / 0` |
| pageerror / asset 404 | `0 / 0` |
| painted load | request/ready/error `20/20/0`, warm `20/20` |
| combat | enemy 5, enemy projectile 3, parry state, fire/blue VFX 판독 PASS |

## 7. 산출물

| 산출물 | 경로 |
|---|---|
| CURRENT/PROPOSED/overlay mask | `captures/ch1_si1_geometry_redesign_20260829/PROTOTYPE/` |
| width/path/region diagram | 같은 `PROTOTYPE/04~05` |
| CURRENT runtime | `captures/ch1_si1_geometry_redesign_20260829/CURRENT/` |
| NEW runtime | `captures/ch1_si1_geometry_redesign_20260829/NEW/` |
| NEW + painted | `captures/ch1_si1_geometry_redesign_20260829/PAINTED/` |
| 7개 동일 camera 3-way 비교 | `captures/ch1_si1_geometry_redesign_20260829/COMPARISONS/` |
| full-map CURRENT/NEW | `COMPARISONS/08_runtime_full_map_CURRENT_NEW.jpg` |
| WASD report | `RUNTIME_QA/walk_report.json` |
| combat readability | `RUNTIME_QA/12_combat_readability.png` |

## 8. 변경 경계

- CH1-owned 변경: `game.html` stage 1 geometry load/selection, `_CH1S1`, SOUTH painted assets/build metadata.
- CH2·CH3·ICE·VFX·다른 stage의 geometry/좌표/collision은 변경하지 않는다.
- START 6시, EXIT 12시, SOUTH→NORTH 진행 의미와 corpse tree/camp/altar/toxic/cocoon 계층은 보존한다.
- commit/push/deploy는 이 작업 범위에 포함하지 않는다.

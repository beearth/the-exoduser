# CH1 si1 — LANDMARK / CENTER GATE 6 PASS

> 기준일: 2026-08-30  
> 적용 가이드: `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md`  
> 상태: **GATE 6 PASS / GATE 7 SMALL DETAIL 미착수**  
> 범위: 기존 CH1 si1 geometry와 OUTER LARGE+MEDIUM을 보존한 landmark ground integration

## 1. 진행 게이트

| GATE | 상태 | 증거 / 판정 |
|---:|---|---|
| 1 MASTER PLAN | PASS | canonical `200×200` geometry와 7-region blueprint 보존 |
| 2 OUTER LARGE | PASS | `CH1_OUTER_MASS_FIRST_PASS.md`, BACK 18 + LARGE 21 |
| 3 OUTER MEDIUM | PASS | MEDIUM 17, small prop 0, 64-chunk seam PASS |
| 4 GROUND CONNECTION | PASS | 외곽 root/shadow/corpse contamination과 24px visual blend |
| 5 PLAYABLE / COMBAT | PASS | 실제 WASD 42 segment, toxic/camp/altar 왕복, tree 양쪽 bypass, boss 접근 |
| 6 LANDMARK / CENTER | **PASS** | 본 문서의 5개 POI ground identity와 negative-space 보호 |
| 7 SMALL DETAIL | NOT STARTED | 이번 패스에서 small prop 0, 신규 gameplay asset 0 |
| 8 CAMERA QA | GATE 6 검증 PASS | 동일 8카메라 + full-map + SOUTH/tree combat 직접 검사 |

## 2. 불변 계약

| 항목 | 값 | 결과 |
|---|---|---|
| geometry source | `assets/map/ch1/geometry/ch1_si1_geometry.js` | SHA-256 `5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f`, 변경 없음 |
| runtime map | `200×200` | SHA-256 `a67605a94904e4cc2a564d6a6d060ab1da55bb35f185221522eef3616ef1a033`, 이전과 동일 |
| collision / route | canonical geometry + 기존 landmark collider | 변경 0 |
| authored/runtime | `_CH1S1 12 / MAP_OBJS hand 12` | skip 0, 좌표 변경 0 |
| START / EXIT | `(100.5,185.5)` / `(99~101,33)` | 변경 0 |
| 신규 vertical prop | `0` | 중앙 silhouette 추가 없음 |
| runtime flag | `ch1OuterMass=landmark_center` | 기본 OFF, 기존 baked loader 경로만 재사용 |

`game.html`의 production 변경은 기존 `_ch1OuterMassPhase()` whitelist에 `landmark_center`를 추가한 1줄이다. renderer, loader, collision, map system은 확대하지 않았다.

## 3. LANDMARK hierarchy와 ground identity

| 계층 | id / tile | ground 문법 | 사용 source |
|---|---|---|---|
| PRIMARY | `m_c1tree (83,80)` | 비대칭 corpse stain + root halo, 나무 양쪽 bypass 보호 | `prop_g_corpse`, `prop_g_root` |
| SECONDARY | `m_c1camp (49,122)` | 낮은 채도의 ash/warm decay | `prop_g_battle` |
| SECONDARY | `m_c1altar (151,91)` | ritual scar와 짧은 root 방향선 | `prop_g_root` |
| TERTIARY | `m_c1pool (49,151)` | toxic이 pocket 바닥으로 번지는 녹색 contamination | `prop_g_toxic` |
| TERTIARY | `m_c1cocoon (151,136)` | cocoon에서 route 쪽으로 자라는 organic root stain | `prop_g_root` |

총 5개 POI에 기존 floor source 4종을 6회 사용했다. 독립된 원형 stamp가 full-map에서 읽히지 않도록 source opacity를 `0.13~0.18`로 낮추고, 불규칙 저채도 stain/root SVG가 주형이 되게 했다. asset 수를 늘리지 않았고 small bone/pod/tiny root는 사용하지 않았다.

## 4. CENTER / negative space 보호

| 보호 공간 | sample tile | final baked alpha | 판정 |
|---|---:|---:|---|
| SOUTH combat void | `(115,158)` | `0` | OPEN |
| central compression | `(86,110)` | `0` | OPEN |
| tree left bypass | `(75,80)` | `0` | OPEN |
| tree right bypass | `(104,82)` | `0` | OPEN |
| boss approach | `(110,38)` | `0` | OPEN |
| primary tree ground | `(83,80)` | `159` | landmark identity visible |

ground layer는 canonical walkable mask 안으로만 제한하고 위 5개 공간은 별도 alpha hole로 다시 보호한다. SOUTH arena, transition, 양쪽 bypass, boss funnel에는 신규 major silhouette가 없다.

## 5. master / chunk / runtime

| 역할 | 경로 / 값 |
|---|---|
| base master | `assets/map/ch1/baked_spike/outer_mass/large_medium/CH1_OUTER_LARGE_MEDIUM_MASTER.png` |
| GATE 6 master | `assets/map/ch1/baked_spike/outer_mass/landmark_center/CH1_LANDMARK_CENTER_MASTER.png` |
| chunks | `landmark_center/chunk_0_0.png` … `chunk_7_7.png`, 64개 |
| chunk 규격 | `1026×1026`, core `1024×1024`, copy bleed `1px` |
| builder | `tools/build_ch1_landmark_center.mjs` |
| contract test | `test/ch1LandmarkCenterPass.test.js` |

## 6. 실제 QA

| 검사 | 결과 |
|---|---|
| GATE 6 + OUTER regression | `10/10 PASS` |
| camera capture | START, SOUTH L/R, MID L/R, TREE L/R, NORTH 8개 |
| full-map | CURRENT LARGE_MEDIUM vs LANDMARK_CENTER 동일 framing |
| baked request/ready/error | `64/64/0` |
| decode/warm | `64/64`, max warm `14.3ms` |
| max baked draw | `0.1ms` |
| pageerror / asset 404 | `0 / 0` |
| combat SOUTH | enemy 5, projectile 3, parry/VFX, `canMove=true`, `inWall=false` |
| combat TREE | enemy 5, projectile 3, parry/VFX, `canMove=true`, `inWall=false` |
| seam | 지정 vertical/horizontal pair exact-pixel PASS |

직접 이미지 검사 결과 START·SOUTH·central·NORTH의 빈 공간은 유지되고, tree/camp/altar/toxic/cocoon 주변에만 낮은 명도의 지면 정체성이 생겼다. player/enemy/projectile/parry 색은 두 전투 화면에서 분리된다. 외곽은 기존 연속 organic mass를 그대로 보존한다.

## 7. 산출물

| 산출물 | 경로 |
|---|---|
| GATE 6 blueprint | `captures/ch1_landmark_center_20260830/BLUEPRINT/01_GATE6_LANDMARK_CENTER_BLUEPRINT.png` |
| BEFORE 8-view/full-map | `captures/ch1_landmark_center_20260830/BEFORE/LARGE_MEDIUM/` |
| FINAL 8-view/full-map | `captures/ch1_landmark_center_20260830/RUNTIME_FINAL/LANDMARK_CENTER/` |
| camera comparisons | `captures/ch1_landmark_center_20260830/COMPARISON/01_CAMERA_COMPARISON.jpg`, `02_CAMERA_COMPARISON.jpg` |
| full-map comparison | `captures/ch1_landmark_center_20260830/COMPARISON/03_FULL_MAP_COMPARISON.jpg` |
| combat | `captures/ch1_landmark_center_20260830/GATE6_COMBAT/` |
| source backup | `captures/ch1_landmark_center_20260830/SOURCE_BEFORE/` |

## 8. MAP PRODUCTION REPORT

```text
MAP NAME = CH1 si1
MAP TYPE = OPEN-FIELD / 7-region SOUTH→NORTH
CURRENT GATE = 6 LANDMARK / CENTER

OUTER MASS
- LEFT = 기존 low/wide horizontal mass 보존
- RIGHT = 기존 high/twisted vertical mass 보존
- TOP = 기존 asymmetric natural funnel 보존
- SOUTH = 기존 open threshold 보존

STRUCTURE
- LARGE count = 21
- MEDIUM count = 17
- SMALL count = 0

GROUND
- transition = 5 POI irregular stain/root identity
- shadow = low-opacity floor source integration
- playable clarity = 5 protected negative-space sample alpha 0

LANDMARK
- primary = corpse tree (83,80)
- secondary = camp (49,122), altar (151,91)
- tertiary = toxic (49,151), cocoon (151,136)

QA
- camera views = 8/8 captured and inspected
- combat readability = PASS
- collision = unchanged / PASS
- route = unchanged / 42-segment PASS
- loading = 64/64 ready, error 0
- pageerror = 0
- 404 = 0

FINAL VERDICT
- VISUAL = PASS FOR GATE 6
- GAMEPLAY = PASS
- TECH = PASS
- NEXT = GATE 7 SMALL DETAIL (not started)
```

commit / push / deploy는 수행하지 않았다.

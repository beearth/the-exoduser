# CH1-1 흐릿한 베이크 에셋 선예도 리모델링 — 2026-09-04

> 적용 맵: CH1-1 / si0 / `G.stage===0`
> 상위 SSOT: `CH1_1_SMOOTHING_PASS.md`
> 범위: `baked_start_smoothing` 시각 합성기·마스터·64청크만 변경

## 문제와 원인

사용자 캡처에서 보인 흐릿한 갈색 대형 얼룩과 보라색 띠는 원본 ground asset 자체가 아니라 smoothing build pipeline에서 생성됐다. 약 900~1100px 원본을 최대 2200×1600px까지 `fit:'fill'`로 비율 변형한 뒤 raster blur `2~3px`, SVG Gaussian blur `48/72px`를 겹친 것이 원인이다. 대표적으로 기존 `chunk_4_3.png`는 화면 대부분이 저해상도 보라색 대각 띠와 번진 형태였다.

## 구현 계약

| id | 한글명 | 변경 전 | 현행 값 | 적용 위치/공식 |
|---|---|---:|---:|---|
| `rasterBlurPx` | 래스터 블러 | `2~3px` | `0px` | `.blur()` 호출 금지 |
| `svgGaussianBlurPx` | SVG 광역 블러 | `48/72px` | `0px` | `feGaussianBlur` 제거 |
| `stretchFit` | 종횡비 강제 변형 | `fit:'fill'` | `false` | `fit:'contain'` |
| `maxRasterUpscale` | 원본 확대 상한 | 최대 약 `2.2×` | `1.3×` | `scale > 1.3`이면 builder가 오류 종료 |
| `sharpSigma` | 합성 선예도 | 없음 | `1.15` | `sharpen(1.15,0.7,1.8)` |
| `purpleEdgeTint` | 보라색 광역 edge tint | 있음 | `false` | SVG 띠 전체 제거 |
| `masterSize` | 완성 master | `8192×8192` | `8192×8192` | 불변 |
| `chunkSize` | 청크 core/bleed | `1024/1px` | `1024/1px` | 파일 `1026×1026`, 64개 |
| `EDGE_SMOOTH` | 가장자리 연결 | `8` | `8` | source texture 8개 |
| `CORNER_VARIATION` | 코너 변주 | `4` | `4` | source texture 4개 |
| `TREE_BASIN` | 중앙 나무 분지 | `4` | `4` | footprint `1700×1500px`, alpha `0.30~0.34` |
| `SIDE_CONNECTION` | POI 연결 | `10` | `10` | scale `0.82~1.20×` |
| `OPEN_FIELD` | 열린 필드 저대비 패치 | `5` | `5` | alpha `0.16~0.17` |
| `SMALL` | 소형 scatter | `0` | `0` | 추가 없음 |
| `toxicAssetPatches` | 독지대 source patch | 광역 mass 3 + fragment 5 | `5` | 연속 chain 없음, saturation 최대 `0.34` |

재사용 source는 `prop_g_edge.png`, `prop_g_root.png`, `prop_g_corpse.png`, `prop_g_toxic.png`, `prop_g_battle.png`다. PixelLab 신규 캐릭터나 신규 vertical asset은 사용하지 않았다.

## 불변 계약

| 항목 | 검증 값 |
|---|---|
| map / hand hash | outer와 smoothing 동일 (`af4d3ead` / `5f783d64`) |
| authored / runtime | `63 / 64` |
| collision | total `23` / hand `22` |
| spawn | `(100.5,185.5)` |
| exits | `(99,7)`, `(100,7)`, `(101,7)` |
| `isW` differential | `0` |
| geometry / route / landmark / vertical | 변경 없음 |

## QA 결과

| 항목 | 결과 |
|---|---|
| builder syntax | PASS |
| smoothing regression | `17/17 PASS` |
| master/chunk seam | 64개, 1px copy bleed PASS |
| runtime pageerror / 404 | `0 / 0` |
| first-visible outer warm/draw | `10.9ms / 0.1ms` |
| first-visible smoothing warm/draw | `13.1ms / 0.1ms` |
| full-map outer warm/draw | `14.9ms / 0.3ms` |
| full-map smoothing warm/draw | `16.2ms / 0.3ms` |
| 카메라 증거 | `captures/ch1_1_smoothing_20260904/COMPARISON/CH1_1_SMOOTHING_COMPARISON_BOARD.jpg` |
| 대표 결함 비교 | 백업 `chunk_4_3.png`의 흐릿한 보라색 띠 제거, 현행 source detail 판독 가능 |

## MAP PRODUCTION REPORT

```text
================= MAP PRODUCTION REPORT =================

STAGE: CH1-1 / si0 / G.stage 0

MASTER
- silhouette: 기존 locked four-sided outer mass 유지
- regions: START / open field / tree basin / side POI / NORTH 유지
- main route: SOUTH → NORTH 변경 없음
- visual goal: 흐릿한 대형 얼룩과 보라색 띠 제거, 원본 ground detail 복구

LARGE OUTER MASS
- geometry/collision: 변경 없음
- baked source: locked outer master 그대로 사용
- unintended holes: 신규 없음

MEDIUM CONNECTION
- EDGE 8 / CORNER 4 / TREE 4 / SIDE 10 유지
- 모든 patch는 aspect-preserving source texture
- 최대 확대 1.3×, 실제 SIDE 범위 0.82~1.20×

GROUND CONNECTION
- raster blur: 0px
- SVG Gaussian blur: 0px
- purple edge tint: 없음
- low-opacity OPEN_FIELD 5로 전투 바닥 여백 유지

PLAYABLE / COMBAT
- authored/runtime: 63/64
- collision: total23/hand22
- spawn/exits/isW: outer baseline과 동일
- central combat field: 신규 vertical clutter 없음

LANDMARK / CENTER
- corpse tree, camp, altar, cocoon, pool, poison pit 좌표 불변
- TREE_BASIN: source-detail 기반 1700×1500px footprint

SMALL DETAIL
- SMALL 0
- scatter 추가 없음

CAMERA QA
- 01 CENTER TREE: ground root/bone detail 판독, 광역 smear 없음
- 02 COCOON: 중앙 POI와 어두운 바닥 분리 유지
- 03 TOXIC: 저채도 source patch 연결, 연속 보라 띠 없음
- 04 LOWER LEFT: 열린 전투 공간 유지
- 05 LOWER RIGHT PIT: wet source detail 유지
- 06 START: 6시 시작점과 북향 진행 축 유지
- 07 ALTAR: landmark hierarchy 유지
- 08 FULL MAP: 기존 silhouette·동선과 동일

TECH QA
- regression: 17/17 PASS
- seam: 64/64 PASS, core1024 + bleed1
- cache: 64/64 ready, error0
- runtime: pageerror0 / 404=0
- first-visible smoothing max warm/draw: 13.1ms/0.1ms
- full-map smoothing max warm/draw: 16.2ms/0.3ms
- map/hand hash equal: true/true
- isW differential: 0

FILES
- tools/build_ch1_start_smoothing.mjs
- assets/map/ch1/baked_start_smoothing/composition.json
- assets/map/ch1/baked_start_smoothing/CH1_1_START_SMOOTHING_MASTER.png
- assets/map/ch1/baked_start_smoothing/chunk_0_0.png ~ chunk_7_7.png
- test/ch1StartSmoothingPass.test.js
- docs/4.1맵디자인+설정/CH1_1_SMOOTHING_PASS.md
- docs/4.1맵디자인+설정/CH1_1_CRISP_SMOOTHING_REMODEL_2026-09-04.md

GIT
- code + baked master/chunks + test + docs를 동일 변경셋에 포함
- unrelated pre-existing worktree 변경은 포함하지 않음
- push/deploy 없음

VISUAL VERDICT:
PASS — 사용자 캡처와 동일한 대표 chunk에서 흐릿한 보라색 띠가 제거되고 뿌리·갈라진 흙·뼈 detail이 선명하게 복구됐다.

NEXT PASS:
신규 SMALL/vertical detail은 별도 요청 전까지 추가하지 않는다. geometry/collision/route는 재개방하지 않는다.
```

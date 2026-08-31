# CH1 PAINTED MAP — PHASE 1 START RENDER SPIKE

> 2026-08-29 | 상태: **TECH SPIKE PASS**  
> 범위: CH1 si1 START 주변 2×2 QA chunk만. 전체 CH1 bake, 75-layout 제거, collision 변경은 승인되지 않았다.

> **역사 기록:** 위 제한과 아래 75개/충돌 불변 수치는 당시 PHASE 1 계약이다. 현행 production geometry는 `CH1_SI1_ACTUAL_STAGE_GEOMETRY.md`가 supersede하며, 실제 boundary와 `_CH1S1`은 각각 stage-local mask와 12개 authored 배치다.

## 1. 목적과 활성 조건

| 항목 | 값 | 적용 위치 | 비고 |
|---|---:|---|---|
| stage | `1` | `game.html` `_CH1_BAKED_SPIKE.stage` | CH1 si1 전용 |
| query opt-in | `ch1BakedSpike=1` | `_ch1BakedSpikeEnabled()` | 기본값 OFF, 즉시 기존 renderer fallback |
| world | `8000×8000 px` | 기존 200×200, `T=40` | geometry 변경 없음 |
| START | `(4020,7420) px` | `(100.5,185.5)×T` | spawn 변경 없음 |
| chunk | `1024×1024 px` | `_CH1_BAKED_SPIKE.chunkSize` | production 전체 규격 LOCK 아님 |
| bleed | `1 px` | source crop `(1,1,1024,1024)` | destination은 정수 world 좌표 |
| 최대 등록 | `4` | START 2×2 | 9개 허용 범위보다 작음, 64개 금지 유지 |

## 2. QA manifest

| id | world origin | QA 파일 | decoded RGBA 추정 | 적용 화면 |
|---|---:|---|---:|---|
| `3,6` | `(3072,6144)` | `assets/map/ch1/baked_spike/chunk_3_6.png` | 약 4 MiB | START 북서 |
| `4,6` | `(4096,6144)` | `assets/map/ch1/baked_spike/chunk_4_6.png` | 약 4 MiB | START 북동 |
| `3,7` | `(3072,7168)` | `assets/map/ch1/baked_spike/chunk_3_7.png` | 약 4 MiB | START 남서 |
| `4,7` | `(4096,7168)` | `assets/map/ch1/baked_spike/chunk_4_7.png` | 약 4 MiB | START 남동 |

- 파일은 기존 `painted_background_4096.png` master의 동일 전역 변환에서 한 번에 crop했다.
- 파일 크기는 bleed 포함 `1026×1026`이며 renderer는 중앙 `1024×1024`만 사용한다.
- 2×2 재조립 결과와 동일 master 직접 변환 결과의 mismatch는 `0 pixel`이다.
- 네 장 decoded residency 추정은 약 `16 MiB`다. 이 spike에는 LRU가 없으며 등록 수가 네 장으로 고정된다.

## 3. 렌더·충돌 구조

| 순서 | 레이어 | 구현/유지 상태 |
|---:|---|---|
| 1 | current floor/map cache | 기존 경로 그대로 유지 |
| 2 | START baked QA chunks | `_drawCh1BakedSpike(X)` |
| 3 | CH1 high-ground/runtime floor object | 기존 `_drawCh1Hill(X)` 유지 |
| 4 | authored `MAP_OBJS` | 기존 75개 유지 |
| 5 | items / actors / monsters | 기존 경로 유지 |
| 6 | VFX / foreground | 기존 경로 유지 |

collision은 `G.map`, `isW()`, `_colObjs`를 그대로 사용한다. baked image는 collision 데이터를 만들거나 변경하지 않는다.

## 4. 로딩과 fallback

| 단계 | 상태 | 처리 |
|---|---|---|
| request | `loading` | `Image`, `decoding='async'` |
| decode 완료 | `decoded` | `decode()` Promise 완료, 아직 렌더 금지 |
| GPU warm 완료 | `warmed` | 기존 `_scheduleGpuWarm()` + `_warmImageGpu()`를 장당 1회 사용 |
| 전체 settled | `ready` | warmed chunk만 draw 허용 |
| load/decode 실패 | `error` | 해당 chunk skip, current floor 노출 |
| manifest miss | cache 없음 | 해당 chunk skip |

GPU warm을 넣은 이유는 WebGL `_getTex()`가 첫 `drawImage`에서 `texImage2D` upload를 수행하기 때문이다. cold run에서 네 장 동시 첫 draw가 `188.3 ms`였고, 기존 idle warm 경로를 장당 한 번 재사용한 뒤 warm은 `9.8~14.6 ms/chunk`, 최초 visible baked draw는 `0~0.2 ms`로 분산됐다.

`createImageBitmap`은 이 spike에서 사용하지 않는다. 기존 renderer가 `Image`를 직접 texture cache key로 사용하므로, 별도 bitmap residency와 close ownership을 추가하지 않는 것이 최소 변경이다.

## 5. Camera culling과 QA 수치

visible 범위 공식:

```text
left/right = cam.x ± VW / (2×zoom)
top/bottom = cam.y ± VH / (2×zoom)
chunk id = floor(world coordinate / 1024)
```

| 항목 | OFF | ON | 판정 |
|---|---:|---:|---|
| authored objects | 75 | 75 | 동일 |
| total `MAP_OBJS` | 76 | 76 | authored 75 + `boss_gate_col` |
| START draw chunks | 0 | 4 | 정상 culling |
| baked 영역 밖 draw chunks | 0 | 0 | fallback 정상 |
| duplicate request/decode | 0 | 0 | 각 4회 정확히 1회 |
| steady median | 0.6 ms | 0.8 ms | 절대차 0.2 ms |
| steady p95 | 1.0 ms | 1.0 ms | 동일 |
| steady max | 1.1 ms | 1.1 ms | 동일 |
| first visible baked draw | — | 0~0.2 ms | warm 후 정상 |
| first camera move max | — | 10.1 ms | 100 ms 미만 |
| pageerror | 0 | 0 | PASS |
| baked 404/load failure | 0 | 0 | PASS |

별도 fault injection에서 `chunk_3_6` 요청을 강제 abort했다. 나머지 세 장만 렌더되고 누락 영역에는 current floor가 남았으며 pageerror, black box, blank floor, spawn failure는 없었다.

## 6. Collision/WASD 비회귀

| 경로 | 실제 입력 결과 | 판정 |
|---|---|---|
| north | 650 ms, y `-155.73 px` | 정상 |
| west | 650 ms, x 약 `-155.73 px` | 정상 |
| east | 650 ms, x 약 `+155.73 px` | 정상 |
| south limit | 4200 ms, `y=7983.04`에서 world limit 정지 | 정상 |
| nearest collider | `m_c1cocoon` 방향 실제 WASD | collider 진입 전 정지 |

OFF/ON의 전체 object snapshot, collision object snapshot, START 주변 `isW` sample grid가 모두 동일했다.

## 7. 다음 단계 제한

- 이 PASS는 START baked background renderer 공존만 증명한다.
- 전체 64 chunk 생성/등록, CH1 전체 bake, 75 visual prop 제거, collision 수정은 금지 상태를 유지한다.
- 다음 작업은 별도 승인된 `PHASE 2 — SOUTH CANARY REGION`에서만 진행한다.

## 8. PHASE 2 SOUTH CANARY 후속 상태 (2026-08-29, 역사 기록)

이 절은 위 PHASE 1 기술 스파이크의 역사적 수치(START 2×2, 4 chunk)를 덮어쓰지 않는다. 승인된 SOUTH canary 후속 패스는 같은 opt-in loader/flag를 확장해 별도 20 chunk 세트를 사용하며 기본값은 계속 OFF다.

| 항목 | PHASE 1 기록 | 현행 SOUTH canary | 제약 |
|---|---:|---:|---|
| runtime flag | `ch1BakedSpike=1` | 동일 | 새 loader 없음 |
| visual A/B flag | 없음 | `ch1BakedSuppressVisual=1` | baked flag와 함께 사용할 때만 draw suppression |
| chunk | START 4장 | SOUTH 승인 목록 20장 | 전체 64 chunk 금지 유지 |
| authored layout | 75 | 75 | `_CH1S1` 불변 |
| collision | 기존 데이터 | 기존 데이터 | 추가·변경 없음 |
| 상세 SSOT | 이 문서 | `CH1_PAINTED_PHASE2_SOUTH_CANARY.md` | master·합성·A/B·QA 수치 포함 |

현행 값은 geometry `13,732/40,000` walkable(`34.33%`), authored/runtime `12/12`, runtime exit `(99~101,33)`, painted master의 walkable alpha `0`/경계 feather `20px`다. 상세는 `CH1_SI1_ACTUAL_STAGE_GEOMETRY.md`를 따른다.

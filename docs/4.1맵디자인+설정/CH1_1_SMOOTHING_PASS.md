# CH1-1 SMOOTHING PASS — PRODUCTION SSOT

> 적용일: 2026-08-30
> 적용 맵: **CH1-1 / si0 / `G.stage===0`**
> 선행 SSOT: `CH1_1_START_OUTER_MASS.md` GATE 2~4 PASS
> 제작 기준: `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` GATE 5~6 시각 연결 패스

## 범위와 결론

기본 CH1-1 smoothing master는 build 시 locked outer master 위에 smoothing overlay를 합성해 만든다. runtime은 smoothing 또는 outer-only 중 선택된 한 master의 chunk set만 그린다. 현행은 과거 직선 structural L-row를 전부 제거하고 canonical forest tile wall로 outer mass와 열린 중앙 필드를 연결한다.

이 패스의 baked 제작 자체는 **시각 smoothing 전용**이었다. 이후 현행 stage0은 baked forest와 실제 경계를 맞추는 `forestBoundary:1` geometry를 적용했으며, smoothing master/landmark/vertical 수치는 그대로다. SMALL detail은 0이며 중앙 combat field는 열린 상태를 유지한다.

## 런타임 계약

| 항목 | 현행 값 |
|---|---|
| stage | `0` (CH1-1 / si0) |
| 기본 phase | smoothing |
| outer-only 비교 | `?ch1StartPhase=outer` |
| 전체 OFF 비교 | `?ch1StartOuter=0` |
| boss arena | `G._bossArena===true`이면 outer/smoothing 모두 OFF |
| locked base | `assets/map/ch1/baked_start_outer/CH1_1_START_OUTER_MASTER.png`, 8192×8192px |
| smoothing master | `assets/map/ch1/baked_start_smoothing/CH1_1_START_SMOOTHING_MASTER.png`, 8192×8192px |
| chunk | 8×8=64개, 각 1026×1026px |
| core / bleed | 1024px / 사방 1px copy bleed |
| layer count | EDGE_SMOOTH 8 / CORNER_VARIATION 4 / TREE_BASIN 4 / SIDE_CONNECTION 10 / OPEN_FIELD 5 / SMALL 0 |
| 현행 gameplay | canonical forest tile boundary / authored63/runtime64 / collision23 total·22 hand / route·landmark·vertical 의미 보존 |

build 순서는 locked outer base → smoothing overlay → 완성 smoothing master다. runtime은 `_CH1_START_ROOT`가 선택한 한 64-chunk set을 기존 stage0 decode/GPU warm/draw 경로로 표시하며, boss arena에서는 탐험맵 전용 set을 그리지 않는다.

## smoothing 규칙

| 대상 | 현행 계약 |
|---|---|
| perimeter structural module | 현행 instance `0`; 과거 smoothing `.70` / locked outer `.42` compatibility path만 잔존 |
| interior NW band | visual alpha `.60 / .68 / .76` |
| interior SW band | visual alpha `.68 / .76 / .84` |
| interior NE band | visual alpha `.72 / .80 / .88` |
| interior SE band | visual alpha `.64 / .72 / .80` |
| landmark | visual alpha `1` |

| runtime tone 대상 | brightness | contrast | saturate |
|---|---:|---:|---:|
| `m_c1tree` | `1.24` | `1.10` | `1.06` |
| hand structural `m_c1b*`, `m_c1cn/cs/ce/cw*` | `1.18` | `1.08` | `1.08` |

alpha/tone 변화는 구조물의 **시각 판독 복구 전용**이다. 현행 structural module 59개는 제거되어 quadrant/perimeter alpha 대상 instance가 0이며, `m_c1tree` tone만 `stage0 + smoothing + baked enabled + hand object` 조건에서 실사용된다. `?ch1StartPhase=outer`, `?ch1StartOuter=0`, boss arena, stage1에는 tone을 적용하지 않는다. baked master와 landmark 좌표는 유지한다.

draw filter는 기존 metadata filter와 CH1 tone 문자열을 공백으로 이어 **한 filter 문자열**로 만든 뒤 기존 sprite FX `save()`/`restore()` 경로에서 적용·복원한다. metadata blend와 기존 filter bake 판정은 유지하며, CH1 tone 때문에 별도 중첩 save/restore나 canvas 상태 누수를 만들지 않는다.

## LANDMARK / FIELD LOCK

| 역할 | canonical 값 | smoothing 역할 |
|---|---:|---|
| corpse tree | `(102,90)`, meta `sz1450`, instance scale `1` | 3100×2200px 비대칭 basin, tree 좌표·collision 불변 |
| camp | `(45,100)` | 서쪽 low/wide ground connection |
| altar | `(147,97)` | hill edge와 유기적으로 연결 |
| altar hill | center `(147,98)`, `rx18/ry9`, west ramp `x125→135` | visual organic hill만 보강, height/collision math 불변 |
| cocoon | `(47,50)` | side organic connection |
| pool | `(167,43)` | wet ground transition, authored exact |
| poison pit | `(162,139)` | toxic wet mass 연결 |

OPEN_FIELD 5개는 START→중앙→EXIT combat readability를 보존하는 저대비 바닥 합성이다. 중앙에 신규 vertical silhouette나 small clutter를 추가하지 않는다.

## QA 결과

| 항목 | 결과 |
|---|---|
| visual | room/border 감소, structural L-row 제거, toxic S-chain 제거, corpse-tree 판독 유지, center open/no clutter — PASS |
| authored/runtime | 63 / 64 |
| collision | total 23 / authored hand 22 |
| structural | 0; 과거 module row 59 제거 |
| runtime tiles | floor `23199` / wall `16495` / exit `3` / gate `3` / boss `300` |
| chunk readiness | 64/64, error 0 |
| pageerror / 404 | 0 / 0 |
| GPU warm | max `<17ms` |
| draw | max `≤0.4ms` |
| regression | outer+smoothing tests 16/16 PASS + hill 2/2 PASS (총 18/18) |
| comparison | `captures/ch1_1_smoothing_20260830/COMPARISON/` |
| contrast retouch | smoothing 전용 16/16 PASS, pageerror/404 `0/0` |
| contrast captures | `captures/ch1_1_structure_contrast_retouch_20260830/` |

## MAP PRODUCTION REPORT

```text
================= MAP PRODUCTION REPORT =================

STAGE: CH1-1 / si0 / G.stage 0

MASTER
- silhouette: locked four-sided outer mass + smoothing-only inner transition
- regions: START / open field / tree basin / west-east side connections / NORTH
- main route: SOUTH → NORTH 진행 의미 보존, forest tile boundary 적용
- side spaces: baked mass와 canonical non-walkable edge 동기화

OUTER MASS
- LEFT: locked outer preserved, inner band softened
- RIGHT: locked outer preserved, inner band softened
- TOP: locked exit funnel preserved
- SOUTH: locked open threshold preserved
- major holes: no new unintended holes

LARGE
- source assets: no new structure
- composites: locked outer unchanged
- overlap: unchanged
- repeated silhouette: 과거 L-row structural module 59개 제거; baked mass와 tile wall이 경계를 담당

MEDIUM
- connections: SIDE_CONNECTION 10
- remaining holes: none requiring gameplay structure

GROUND
- shadow: EDGE_SMOOTH 8 + CORNER 4
- contamination: toxic wet mass 3 + fragment 5 composition
- structure integration: TREE_BASIN 4 + OPEN_FIELD 5

PLAYABLE
- main arenas: forest boundary 적용 후 center open
- travel space: START→north y23.43 실제 WASD PASS
- breathing space: central field preserved
- threat space: toxic wet zones remain local
- combat readability: PASS, no new vertical clutter

LANDMARK
- primary: corpse tree (102,90), 3100×2200 basin footprint
- secondary: camp (45,100), altar (147,97)
- tertiary: cocoon (47,50), pool (167,43), poison pit (162,139)

CAMERA QA
- START: outer-only threshold preserved
- EARLY: room-border impression reduced, hand structure no longer sinks into ground tone
- ARENA: open field maintained
- SIDE L: camp/cocoon connection과 baked forest edge 연속
- SIDE R: altar/toxic connection과 baked forest edge 연속
- LANDMARK: tree basin integrated, tree brightness/contrast hierarchy restored without alpha reduction
- LATE: structural L-row 제거, baked forest와 tile edge 연속
- EXIT: locked top funnel unchanged

TECH QA
- route: START `(100.5,185.5)`→north `y23.43`, exits y7 전 segment PASS
- collision: total23 / hand22; canonical tile wall은 player/enemy/flow/spawn/minimap 공통
- pageerror: 0
- 404: 0
- seam: 64 chunks, copy bleed PASS
- loading: 64/64 ready, error0
- performance: first-visible max warm/draw = outer 5.2ms/0.1ms, smoothing 11.7ms/0.1ms; full-map editor warm-all max 17.8ms/0.5ms
- contrast regression: smoothing 16/16 PASS, pageerror/404 0/0

FILES
- stage-owned: baked_start_smoothing master/chunks/manifest/builder/tests/captures and this SSOT; contrast retouch는 runtime draw와 문서/테스트/캡처만 변경하고 baked master는 불변
- concurrent touched: pre-existing shared work preserved
- unrelated touched: none intentionally

GIT
- staged: none
- commit: none
- push: none
- deploy: none

VISUAL VERDICT:
PASS — CH1-1 SMOOTHING / PLAYABLE-LANDMARK CONNECTION / STRUCTURE CONTRAST RETOUCH

NEXT PASS:
SMALL detail remains deferred; do not reopen geometry/collision/route in a visual-detail task.
```

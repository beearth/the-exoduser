# CH1-1 Compose — DESIGN LOCK

## 2026-08-30 START SMOOTHING — CURRENT DEFAULT VISUAL RUNTIME

CH1-1 기본 phase는 build 시 locked outer 위에 overlay를 합성한 `assets/map/ch1/baked_start_smoothing/`의 8192²/64-chunk 완성 master다. runtime은 outer/smoothing 중 한 chunk set만 선택한다. outer-only 비교는 `ch1StartPhase=outer`, 전체 OFF 비교는 `ch1StartOuter=0`이며 boss arena에서는 모두 OFF다. 현행 compose는 `forestBoundary:1`, `MAP_ALL_FLOOR=false`다. `_buildCh1StartForestRLE(200,200)`이 side/top/south baked forest와 대응하는 canonical tile wall을 만들고 player/enemy/flow/spawn/minimap이 같은 경계를 사용한다. `_applyCh1StartNorthGate`는 `bossCx=100`, `gateY=5`, exits `(99..101,7)`과 `x88..112,y2..35` north approach를 보존한다. 모든 `m_c1b*`/`m_c1cn|cs|ce|cw*` 59개와 wall 뒤 `m_eye_tree(185,55)` 1개를 제거해 authored63/runtime64, structural0, collision total23/hand22가 현행이다. tile은 floor23199/wall16495/exit3/gate3/boss300이다. baked master와 primary/secondary landmark는 유지하고 forest-mask 자동 이동 좌표는 최종 runtime 위치로 authored 고정했다. 실제 WASD는 START `(100.5,185.5)`에서 north `y23.43`까지 전 segment PASS했다. smoothing 시각 계약은 `CH1_1_SMOOTHING_PASS.md`를 따른다.

## 2026-08-30 START OUTER MASS — CURRENT VISUAL RUNTIME

실제 CH1-1은 `si0 / G.stage===0`이다. `assets/map/ch1/baked_start_outer/`의 8192² master는 1024 core + 1px bleed의 8×8/64 chunk locked baseline이다. 현행 기본 phase는 이 base를 포함한 smoothing 완성본이고, `ch1StartPhase=outer`가 outer-only baseline을 선택하며 `ch1StartOuter=0`은 baked set 전체 OFF다. boss arena에서는 자동 OFF다. outer 구성 BACK14/LARGE20/MEDIUM16/GROUND1/SMALL0과 START/EXIT 진행 의미는 유지하지만, 실제 경계는 `forestBoundary:1` tile geometry가 담당한다. authored63/runtime64, structural0, hand collision22가 현행이며 상세는 `CH1_1_START_OUTER_MASS.md`를 따른다.

## 2026-08-28 REFERENCE MINIATURE + VISUAL DEPTH PASS — CURRENT SSOT

이 절이 현행 `game.html`의 `_MAP_COMPOSE[0]`을 규정한다. 아래의 2026-08-20~24 blockout, `handProps 80 + mega 6`, 용 해골, 분지 체인 표는 이전 시안 기록이며 현행 배치 수치로 사용하지 않는다.

| 항목 | 현행 값 |
|---|---|
| 적용 범위 | CH1-1 / 내부 `G.stage===0`만 |
| 월드 | 200×200 tile, `T=40`, 8000×8000px |
| 배치 모드 | `hand:1`, authored-only |
| authored | `_MAP_COMPOSE[0].handProps` 63/63, skip 0 |
| 런타임 MAP_OBJS | 64 = authored 63 + 필수 `boss_gate_col` 1 |
| 자동 배치 | scatter 0, offPath 0, 20×20 floor carpet 0, `lm` 0, `mega` 0; outer enabled 시 procedural wall-edge/pillar fallback suppressed |
| 구조/충돌 | structural boundary object 0, authored collision object 22, system 포함 total 23; 큰 경계는 canonical tile wall |
| forest-mask authored exact | 6/6, deficit 0 |
| 카메라/캔버스 QA | 1920×1080, pageerror 0, asset 404 0 |

### 2026-08-29 RIGHT ALTAR HIGH GROUND — CURRENT RUNTIME

우중 제단은 기존 앵커를 이동하지 않고 CH1-1 전용 실제 고지대로 확장한다. 이 지형은 `MAP_OBJS`가 아니므로 현행 authored63/runtime64 및 hand collision22에는 포함되지 않는다.

| 항목 | 값 |
|---|---|
| 적용 범위 | `G.stage===0`만. 다른 stage의 height/collision은 항상 0/false |
| 중심 / 반경 | tile `(147,98)`, 타원 반경 `rx=18`, `ry=9` |
| 절벽 band | 정규화 거리 `inner=.84` 이상 `outer=1.04` 이하를 `_ch1HillBandBlocks`가 `isW`에 합성 |
| 서쪽 오르막 | `x=125→135`, `y=98`, 반폭 `1.8→3 tile`; band를 통과할 수 있는 유일한 진입부 |
| 실제 높이 | 저지대 `0`, ramp는 smoothstep `0→1`, 정상부 `1`; `_ch1HillHeightAt` 반환 |
| 시각 기반 | 기존 CH1 `m_c1gedge` / `assets/map/ch1/floor_objects/prop_g_edge.png` 1장을 offscreen 2D 합성해 뿌리 단구로 렌더. 신규 에셋·자동 scatter 없음 |
| 렌더 순서 | map floor 뒤, authored prop/entity 앞 `_drawCh1Hill(X)` |
| 동선 계약 | 메인 x100 남북축은 저지대/비충돌 유지. 제단 side POI만 선택형 고지대 |

실제 WASD 검증: START `(100.5,185.5)`에서 좌표 주입 없이 ramp low `(125.95,98.91,h=.026)` → mid `(131.14,98.10,h=.668)` → plateau `(137.99,98.10,h=1)` 진입 PASS. 북쪽 직벽 정지와 서쪽 ramp 하산도 유지된다. forest boundary 종주는 START→north `y23.43` 전 segment PASS, pageerror/404 0이다.

### Reference anchor

| 장면 | 대표 id | tile | instance scale | 역할 |
|---|---|---:|---:|---|
| START 감염 성문 | `m_cage_gate` | (103,188) | 1.2 | 스폰 (100.5,185.5) 남동쪽. 원형 충돌 반경 144px, 스폰 중심거리 약 170px, 마지막 남단 가시 culling row 유지 |
| 중앙 HERO 시체나무 | `m_c1tree` + `m_c1groot` | (102,90) + (102,86) | 1.0 | 유일 HERO, 넓은 중앙 전투공터 |
| 북쪽 EXIT | 필수 exit/gate collider | (100, 약 18) | 시스템 값 | 중앙 북상축 종점 |
| 좌상 고치 구락 | `m_c1cocoon` | (47,50) | 1.55 | 접근 제한 boundary cluster |
| 좌중 타락 야영지 | `m_c1camp` | (45,100) | 1.55 | 서쪽 secondary POI |
| 좌하 뿌리 벽 통로 | `m_bone_arch` | (35,150) | 1.0 | 좁은 side passage |
| 우중 저주 제단 | `m_c1altar` + `m_penta_circle` | (147,97) + (147,96) | 1.45 / 1.0 | 동쪽 secondary POI |
| 우상 부패 습지 | `m_c1pool` | (167,43) | 1.55 | toxic 접합 authored exact 위치 |
| 우하 가라앉은 웅덩이 | `pit_poison` | (162,139) | 1.0 | 독립 side pocket |

### Composition / gameplay lock

- START → 중앙 시체나무 → EXIT의 남북 진행축은 negative space로 유지한다. 중앙 HERO 반경 28타일에는 HERO와 국소 ground 이외의 프롭을 두지 않는다.
- 과거 외곽 40개 + 네 side POI shoulder 19개의 structural module row는 전부 제거했다. side/top/south baked mass와 맞춘 canonical tile wall이 큰 경계를 담당하며, 실제 감염 성문과 north gate approach만 열린다.
- 큰 실루엣은 각각 1회만 사용한다. 저주나무는 8개뿐이며 scale `.85/.88/.9/.95/1.08/1.1/1.12/1.15`로 반복을 끊고 START·LOWER·NORTH 화면 shoulder와 좌우 POI 바깥 실루엣에만 둔다. 자동 carpet/scatter로 빈 공간을 채우지 않는다.
- 실제 WASD 검증: START (100.5,185.5), `isW=false`, `canMove=true` → 중앙 시체나무 서쪽 우회 → EXIT (99.63,22.02) 도달. 순간이동/좌표 주입 없이 전 구간 통과, 관통/끼임/비정상 밀림 없음.
- 회귀 검사는 `test/ch1HandDecor.test.js`, depth 캡처는 `tmp/capture_ch1_si1_visual_depth.py`, 실제 입력 종주는 `tmp/verify_ch1_reference_walk.py`를 사용한다.

### Visual depth micro-setpiece

| 장면 | authored 구성 | 여백/전투 계약 | 환경 이야기 |
|---|---|---|---|
| START FORECOURT | 실제 성문 + 좌우 저주나무 + 뿌리/뼈/시체/무기 잔해 | 스폰 전면과 북상 중심선 x82~122 개방 | 무너진 진입 흔적 |
| LOWER TRANSITION | 서로 다른 scale의 저주나무 2개 + 뿌리/이끼/재 support | x82~122 개방, 양쪽 shoulder만 압축 | 성문을 벗어나 숲이 잠식하기 시작하는 구간 |
| CENTER HERO CLEARING | `m_c1tree` 1개 + 28~39타일 outer ring의 소형 support 4개 | HERO 반경 28타일 무프롭, 서쪽 우회와 대규모 전투 여백 유지 | 뿌리에 삼켜진 중앙 성소 |
| LEFT POI | camp/cocoon/root passage 각각 3~7개 사건 cluster | 메인루트와 분리, 중앙 HERO보다 낮은 위계 | 버려진 야영지와 고치 구락 |
| RIGHT POI | altar/swamp/poison pit 각각 3~7개 비대칭 cluster | LEFT와 미러링하지 않고 독립 side pocket 유지 | 저주 의식과 가라앉은 부패지 |
| NORTH APPROACH | 좌우 저주나무 + 뼈/시체/웅덩이/뿌리 support | EXIT x82~118 통로 개방 | 오래된 통로의 잔존물로 12시 방향 프레이밍 |

현행은 과거 123개에서 structural module 59개와 wall 뒤 dead prop `m_eye_tree(185,55)` 1개를 제거한 authored63이다. HERO/START/EXIT/side POI 앵커는 보존하며, 큰 경계는 authored prop row가 아니라 tile geometry가 담당한다.

forest mask에서 `_nearFloor`로 자동 이동되던 기존 5건은 최종 runtime 위치를 authored 좌표로 고정했고 toxic 접합 puddle 1개를 함께 고정했다: `corpse(124,179)`, `m_vine_pillar(29,158)`, `m_c1gtoxic(168,40)`, `m_c1pool(167,43)`, `m_meat(164,47)`, `m_puddle(164,53)`. 최신 runtime은 6개 모두 `exact=true`, deficit0이다. 총 authored 수는 63으로 유지한다.

---

## LEGACY BLOCKOUT ARCHIVE (2026-08-20~24, NOT CURRENT RUNTIME)

> 2026-08-20 DESIGN LOCK / 2026-08-24 기존 에셋 손 배치, START 첫 화면 및 주동선 메가 가시성 보정 구현.
> Option B. v2는 룩 레퍼런스. 월드 = `FIXED_MAPS[0]` 200×200, `T=40`, `tileRLE [1,40000]` 통바닥.  
> 플래그(`hand:1`, legacy keepDragon 자동분기 off, `_CH_DECO` off, 살점 scatter off)는 **si0 / CH1-1만.** 용 2종은 `mega` 데이터로 명시 배치한다. 다른 맵·장 동작 변경 금지.

좌표는 **타일**. (`empty.r`만 엔진이 px. 월드 px = 타일×40.)

방 박스·empty r는 `FIXED_MAPS[0]`에 맞춘 설계값. 구현 때 1~2타일 다듬기는 가능. 아래 **LOCK** 항목은 바꾸지 않음:

- START/EXIT 스폰 vs empty 중심 **의도적 offset**
- WEST ↔ CENTRAL+LOWER, EAST ↔ CENTRAL+UPPER, 연결 폭 ≥10
- mega_ribs **시작 900 / QA 최대 1000** (1100 기본 제외)
- 플래그 **CH1-1 국소**

---

## CH1-1 COMPOSE INTENT

문장: **남에서 북으로, 어긋난 흙 분지 세 개가 이어진 썩은 숲. 가운데는 비고, 기억할 뼈는 1~2시에 있다.**

원형 아레나 아님. 직선 복도 아님.  
`FIXED_MAPS[0]`이 이미 그 골격이다.

| 방 (데이터) | cx,cy | 이 초안에서의 역할 |
|---|---|---|
| start `s` | 100, 185 rx14 ry6 | START |
| combat `r1` | 100, 155 | LOWER |
| forge `f` | 100, 120 | CENTRAL 안 게임플레이. 랜드마크 아님 |
| combat `r2` | **80**, 85 | CENTRAL 서쪽 어긋남 |
| combat `r3` | **120**, 50 | UPPER 동쪽 어긋남 |
| boss `b` | 100, 18 rx20 ry12 | EXIT APPROACH (아레나 아님, 문 앞) |
| alcove | 35,140 / 165,110 / 50,65 | 서·동 포켓 씨앗 |
| 복도 폭 | 9~10타일 | 유지. 더 줄이지 않음 |

통바닥이라 복도는 벽이 아니다. “길”은 **empty + 림 소품이 비워 둔 띠**.

**2026-08-24 당시 계획:** legacy `keepDragon` 자동분기 off / `hand:1` / `_CH_DECO` 살포 off / 살점 scatter off를 CH1-1에만 적용하고 `mega` 6개를 배치했다. 2026-08-28 현행은 상단 CURRENT SSOT처럼 `mega:[]`이다.

---

## TILE COORDINATE PLAN

제안 박스. 기존 방 타원을 **포함**하고, 후보는 살짝 키워서 자연 경계.

| 구역 | 제안 타일 (x0–x1, y0–y1) | 기존 데이터와의 관계 |
|---|---|---|
| START | 86–114, 170–194 | start 타원 (86–114, 179–191) + SSOT 시작원 `(0.50,0.88)` r480px≈12타일 |
| LOWER | 54–136, 124–176 | r1 (82–118, 145–165) + 서쪽 치우침. 후보 60–140,130–180에서 서쪽·남쪽만 다듬음 |
| CENTRAL | 46–158, 62–146 | forge (92–108, 115–125) + r2 동쪽 가장자리. 완전 원 아님 (가로가 김) |
| UPPER | 56–140, 22–82 | r3 (104–136, 41–59)을 동쪽 덩어리로 품음. 후보는 60–145,25–85 |
| EXIT | 80–120, 4–36 | boss 방 (80–120, 6–30) + SSOT 게이트원 `(0.50,0.14)` r400px≈10타일 |
| WEST POCKET | 18–58, 90–142 | alcove (35,140). **CENTRAL+LOWER** 둘 다 폭≥10 |
| EAST POCKET | 142–188, 58–122 | alcove (165,110). **CENTRAL+UPPER** 둘 다 폭≥10 |

남북 진행축은 유지하되 중심선 x=100을 LOWER→CENTRAL→UPPER에서 **서(88) → 동(118) → 서(92)** 로 꺾는다. 데이터상 r2=80, r3=120과 같음.

주요 연결 최소 폭: **10타일** (기존 corridor width + 포켓 2연결). 줄이지 않음.

---

## EMPTY / COMBAT ZONES

엔진 `empty`는 `{x,y 정규화, r 픽셀}` **원**이다. 자연 지형은 **겹치는 원 여러 개**로 근사. 원 하나 r=1400은 아레나가 된다.

제안 `empty` (아직 코드에 안 넣음):

| id | x | y | r(px) | r(타일) | 역할 |
|---|---|---|---|---|---|
| start | 0.50 | 0.88 | 480 | 12 | SSOT 시작원. 대형 금지 |
| exit | 0.50 | 0.14 | 400 | 10 | SSOT 게이트원 |
| lower | 0.46 | 0.75 | 880 | 22 | 서쪽 치우친 하단 분지 |
| central | 0.54 | 0.51 | 1080 | 27 | 동쪽 치우침. 지름≈54타일, 원 하나가 맵을 먹지 않음 |
| upper | 0.48 | 0.26 | 820 | 20.5 | 서쪽 치우친 상단 |
| west | 0.19 | 0.58 | 520 | 13 | WEST. CENTRAL+LOWER 목 덮음 |
| east | 0.83 | 0.45 | 500 | 12.5 | EAST. CENTRAL+UPPER 목 덮음 |

`hand:1`(CH1-1만)이면 살포가 꺼지므로 empty는 **안전망 + 문서**. 손으로 올린 대형만 empty 밖·림에 둔다.

### START / EXIT vs empty 중심 offset — LOCK

스폰 좌표와 empty 원 중심을 **일부러 어긋난다.** 스폰을 원에 정중앙에 두면 여유의 절반이 맵 밖·남/북 림으로 버려진다.

| | 스폰 (FIXED_MAPS) | empty 중심 (정규화→타일) | offset | 이유 |
|---|---|---|---|---|
| START | (100, **185**) | (0.50, 0.88) → (100, **176**) | empty가 스폰보다 **9타일 북** | 시작원 r480이 남 림이 아니라 **북(LOWER로 나가는 첫 걸음)** 을 덮음. 스폰/소환 앞 안전여유 |
| EXIT | (100, **18**) | (0.50, 0.14) → (100, **28**) | empty가 문보다 **10타일 남** | 게이트원 r400이 북 끝 보이드가 아니라 **문 앞 접근로** 를 덮음. 문 앞 대형 금지 |

스폰 자체는 6시/12시 축 (x=100)에 둔다. 분지 empty(lower 0.46, central 0.54, upper 0.48)의 x 어긋남은 **루트 꺾임**이지 스폰 offset이 아님.

---

## MAIN ROUTE

```
START (100,185)
  → 북서 띠 폭≥10  (x 88~110, y 170→150)
LOWER (중심 ~88, 150)
  → 북동으로 꺾임   (x 88→118, y 150→110)
CENTRAL (중심 ~118, 105)  ※ forge 100,120은 서쪽에 스침
  → 북서           (x 118→92, y 105→55)
UPPER (중심 ~92, 52)
  → 북, 문으로     (x 92→100, y 52→18)
EXIT GATE (100, 18)
```

직선 x=100 복도 금지. 데이터 복도 `s-r1-f-r2-r3-b`가 이미 꺾인다. 시각 림이 그 꺾임을 따라가면 됨.

---

## SIDE POCKETS — LOCK

막다른 길 아님 = **출입 2곳.** CENTRAL에만 붙이면 막다른 포켓이 된다.

| | 타일 | 연결 1 (폭≥10) | 연결 2 (폭≥10) |
|---|---|---|---|
| WEST | 18–58, 90–142 | **CENTRAL** 겹침 x46–58 (12), y90–142 | **LOWER** 겹침 x48–58 (10), y124–142 |
| EAST | 142–188, 58–122 | **CENTRAL** 겹침 x142–158 (16), y62–122 | **UPPER** 겹침 x142–152 (10), y58–82 |

- WEST = CENTRAL↔LOWER 우회. 서는 LOWER 쪽에 붙음 (더 남쪽).
- EAST = CENTRAL↔UPPER 우회. 동은 UPPER 쪽에 붙음 (더 북쪽).
- 좌우 대칭 아님. 두 번째 목도 10타일 미만이면 배치 실패.

---

## RIM ZONES

밀도는 외곽 12타일 + 분지와 맵 끝 사이. 전투 박스·통로 폭 안으로 대형 금지.

| 림 | 대략 | 밀도 |
|---|---|---|
| 남 프레임 | y 194–199, x 전 | 낮음. START 12타일 스폰 코어는 비우고 첫 화면 가장자리에 비충돌 소품 7개 |
| 남서 | x 2–24, y 150–199 | 나무·시체·puddle |
| 남동 | x 176–198, y 150–199 | 나무·뼈·cage_gate |
| 서 프레임 | x 2–16, y 40–150 | 저주나무 열, 간격 ≥20타일(800px) |
| 동 프레임 | x 184–198, y 40–150 | 나무·말뚝. 랜드마크와 띄움 |
| 북서 | x 2–40, y 2–24 | 뿌리·hang_cage |
| 북 | y 0–8, EXIT empty 밖 | 문만. 대형 없음 (게이트 원) |
| 북동 | x 160–198, y 8–40 | **랜드마크 + 나무 소수** |

같은 에셋이 한 화면에 두 개 나란히 안 보이게. 대형 간격 ≥20타일.

---

## LANDMARK CHOICE + POSITION

**주 방향 앵커: `m_mega_ribs` (뿔난 거대뼈). 보조 메가 5개는 주동선 권역별 실루엣 프레임.**

| 후보 | 기각/채택 |
|---|---|
| mega_ribs | **채택.** 이미 `_MAP_COMPOSE[0].mega`. 멀리서 읽힘. 납작해서 12시 문을 가리지 않음. col 타원(가로로 김) → 림에 붙이기 좋음 |
| bone_arch | 보조 대형으로 채택. LOWER 동쪽 림 (112,142), 주동선과 스폰 코어 이격 |
| skull_altar | 기각(랜드마크로서). 작음. 림 **소품**으로는 남쪽/서쪽에 1개 가능 |

현행 위치: CENTRAL 동쪽 림, 타일 **(140,102)**. 정규화 `(0.70,0.51)`.

- CENTRAL 중심 `(118,105)`에서 동쪽 22타일에 두어 화면 오른쪽 실루엣으로 읽힌다.
- `colW=380px`의 실제 충돌 반폭은 4.75타일이라 10타일 주동선 중심을 침범하지 않는다.
- 다른 mega와 정규화 거리 0.18 이상을 유지한다.

**size LOCK:** 시작 **900**. QA에서만 **최대 1000**. **1100 기본값 제외** (1400도 제외). 메타 기본 900과 같게 시작.

### MEGA 6 — 구현값

| id | 타일 | size | 역할 |
|---|---:|---:|---|
| `m_mega_ribs` | (140,102) | 900 | CENTRAL 동쪽 뼈 앵커 |
| `m_dragon_3d` | (118,55) | 1800 | UPPER 동쪽 거대 용 실루엣 |
| `m_dragon_skeleton` | (65,148) | 1200 | LOWER 서쪽 용 해골 지형. 로드 시 루마키 `16~80`으로 원본의 광역 검은 반투명 판 제거 |
| `m_mega_statue` | (90,120) | 600 | CENTRAL 진입 석상 |
| `m_mega_chapel` | (118,181) | 650 | START 오른쪽 무너진 예배당 |
| `m_mega_head` | (82,22) | 800 | EXIT 왼쪽 거대 머리 |

6개 중심은 정규화 거리 0.18 이상이다. 각 중심은 동선 중심에서 옆으로 떨어뜨리고 실제 충돌 반경까지 주행 폭을 침범하지 않게 했다. legacy `keepDragon`은 계속 off라 자동 용 2개를 추가 생성하지 않는다.

화면 밴드 계약: START=chapel, LOWER=dragon_skeleton, CENTRAL=ribs/statue, UPPER=dragon_3d, EXIT=head. `test/ch1HandDecor.test.js`가 모든 밴드의 메가 가시성을 고정한다.

---

## RESERVED SWAMP ZONES

신규 전이 타일 없음. **자리만.** 지금 걸음은 통바닥 유지. 구현해도 통로를 줄이지 않음.

| id | 타일 | 지금 올려도 되는 것 | 나중 |
|---|---|---|---|
| SW | 2–30, 168–198 | puddle 2~3, pit_poison **최대 1** | swamp tile |
| SE | 170–198, 158–198 | puddle, pit_poison 최대 1 | swamp tile |
| NW | 2–28, 2–32 | puddle만 (pit는 시작 동선과  divers) | swamp tile |
| NE | 178–198, 2–22 | EXIT 접근과 겹치지 않게 더 구석 | swamp tile |

거대한 초록 바다 없음. 코너 4곳, 깊이 6~12타일.

---

## EXISTING ASSET PLACEMENT LIST — 구현 완료 (2026-08-24)

**ARCHIVE — 2026-08-24 당시 값:** `_MAP_COMPOSE[0].handProps` 80개 + `mega` 6개. 아래 표는 과거 배치 좌표이며 2026-08-28 런타임에는 사용하지 않는다.

| 에셋 | 현행 개수 | 정확한 타일 좌표 `(x,y)` | col / 적용 위치 |
|---|---|---|---|
| m_mega_ribs | 1 | (140,102) CENTRAL 동쪽 림, sz900 | 타원, 중앙 방향 앵커 |
| m_ctree1~12 | 12, 전종 1개 | 1:(14,176), 2:(38,190), 3:(166,188), 4:(190,174), 5:(10,148), 6:(190,144), 7:(10,112), 8:(190,108), 9:(10,76), 10:(190,72), 11:(30,36), 12:(158,18) | col, 외곽 프레임 |
| m_hang_cage | 1 | (12,20) | col, 북서 림 |
| m_cage_gate | 1 | (174,156) | col, 남동 림 |
| m_sword_pile | 1 | (22,92) | col, WEST 밖 서 림 |
| m_tree1/2/3 | 12 (각 4) | (28,172),(78,188),(142,188),(182,166),(24,146),(174,136),(24,116),(176,104),(24,72),(174,62),(48,28),(144,30) | 무충돌, 대형 사이 중거리 실루엣. (78,188)은 START 시야 가장자리 |
| m_skull_altar / m_obelisk | 2 | (82,181),(118,182) | col, START 첫 화면 좌우 대형 프레임. `m_atree1`은 원본 시트의 세로 줄무늬·광역 부분알파 배경 때문에 1-1 손 배치에서 제외 |
| m_penta_circle / m_bone_arch | 2 | (66,148),(112,142) | col, LOWER 좌우 림 |
| m_eye_tree / m_vine_pillar | 2 | (88,122),(142,112) | col, CENTRAL 좌우 림 |
| m_rotten_tree / m_skull_totem | 2 | (68,52),(120,55) | col, UPPER 좌우 림 |
| m_fbones | 10 | (78,174),(124,176),(46,150),(150,148),(42,124),(160,126),(54,98),(150,94),(56,58),(138,58) | 무, 분지 가장자리. (78,174)은 START 시야 가장자리 |
| corpse | 5 | (123,183),(166,160),(34,104),(166,86),(46,44) | 무, 림. (123,183)은 START 시야 가장자리 |
| m_meat | 4 | (178,150),(182,120),(178,92),(168,52) | 무, 동 림 |
| m_puddle | 8 | SW (8,190) / START 가장자리 (88,190) / SE (180,190),(192,180) / NW (8,10),(24,8) / NE (188,8),(194,28) | 무, 예약 늪/START 시야 |
| pit_poison | 2 | SW (14,168) / SE (186,162) | col, 통로 밖 |
| m_fblue / m_fyellow | 6 (각 3) | (36,132),(164,116),(40,84),(160,72),(112,172),(144,42) | light, 림 포인트. (112,172)은 START 시야 가장자리 |
| m_tomb | 4 | (77,181),(162,178),(28,122),(172,98) | 무, 림. (77,181)은 START 시야 가장자리 |
| m_wpile | 3 | (88,172),(154,168),(38,64) | 무, 림. (88,172)은 START 시야 가장자리 |
| m_acid | 3 | (16,194),(188,192),(16,4) | 무, 예약 늪 외곽 |
| m_dragon_3d | 1 | (118,55), sz1800 | mega, UPPER 동쪽 프레임 |
| m_dragon_skeleton | 1 | (65,148), sz1200 | mega, LOWER 서쪽 프레임 |
| m_mega_statue / chapel / head | 3 | (90,120) sz600 / (118,181) sz650 / (82,22) sz800 | mega, CENTRAL/START/EXIT 프레임 |
| flesh / tumor scatter | **0** | 금지 | — |

소환굴 9개는 데이터 좌표를 유지하되, 구현 시 START/EXIT empty·랜드마크 visR과 겹치면 분지 쪽으로만 1~2칸 이동.

---

## ESTIMATED OPEN-GROUND %

통바닥이면 타일 기준 걸음=100%. 여기서 %는 **전투에 쓰는 열린 흙**(empty 합 ∪ 분지) vs 림·예약 늪.

대략 합(겹침 감안):

| | 타일 | % /40000 |
|---|---|---|
| START+LOWER+CENTRAL+UPPER+EXIT ∪ 포켓 | ≈ 27000~29000 | **67~72%** |
| 림+예약 늪 | ≈ 11000~13000 | 28~33% |

**2026-08-24 당시 추정:** 충돌 대형 31개, 나머지 비충돌 디테일. 2026-08-28의 collision82/structural59 값도 역사 기록이며, 현행 authored collision22/structural0과 canonical forest tile boundary는 상단 CURRENT SSOT가 우선한다.

---

## RISKS

| | |
|---|---|
| keepDragon | legacy 자동분기는 CH1-1에서 계속 끈다. 용 2종은 권역별 `mega` 좌표로만 1회 생성 |
| mega_ribs 1400/1100 | 금지. 시작 900, QA 최대 1000 |
| 플래그 전역화 | `hand`/`_CH_DECO` off를 hell 0 전체에 걸면 1-2~1-4가 죽음. **si0만** |
| empty가 원 | 너무 큰 원 하나 = 아레나. 겹원 유지 |
| 통바닥+손 배치 | 림만 채우면 START 첫 화면이 공허해진다. 현행은 비충돌 7개를 첫 화면 가장자리에 두고 12타일 스폰 코어를 비운다 |
| `hand:1` 미설정 | `_CH_DECO`가 살점 스캐터를 뿌림 |
| forge (100,120) | CENTRAL 한복판 게임플레이. 시각 랜드마크로 키우지 말 것 |
| `?stage=0` PROD | 본편 200×200과 다른 맵. 이 초안은 **본편 si0** |

---

## ASCII 200×200 BLOCKOUT

1셀 ≈ 10×10타일. 위=북(y=0), 아래=남(y=199).

```
        x0        50        100       150       199
        |         |          |          |         |
 y0  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~N~~~~~~~     ~ swamp reserved
     ~~RRRRRRRRRR   XXXXXXX   RRR  M  ~~          X EXIT  M landmark (ribs)
     ~~RR    UUUUUUUUUUUU    RRRRRR~~             U UPPER
     RRR    UUUUUUUUUUUUUU     RRRR
     RR    UUUUU====UUUUUU      RR                = main route
     R     UUU  ==U==  EEEEE                      E↔UPPER
     R    WWW   ====  CCCCCCC  EEEE               W west  E east
     R   WWWWW====CCCCCCCCCCCCCC EE               W↔CENTRAL, E↔CENTRAL
     R    WW==LLLLL====CCCCCC    RR               W↔LOWER
     RR      LLLLLL====CCCCCC    RR               L LOWER
     RRR   LLLLLLLLLL====        RRR
     ~~RR LLLLLLLLLLLLL   SSSS  RR~~              S START
     ~~RRRR  LLLLLL   SSSSSSSS RRRR~~
     ~~~~~~RRRRRRRR SSSSSSS RRRR~~~~~~
 y199
```

범례: `S` START  `X` EXIT  `=` ROUTE  `C/L/U` CLEARINGS  `W/E` POCKETS  `M` RIBS  `R` RIM  `~` SWAMP RESERVED

---

## SCOPE ISOLATION — LOCK

| 플래그 | CH1-1 (si 0 본편) | 다른 맵 |
|---|---|---|
| `hand:1` | on | 1-2 기존 `hand:1` 유지. 그 외 기존 값 |
| legacy `keepDragon` | **off**. 용 2종은 `mega` 명시 배치 | 다른 스테이지는 이 플래그 없음. 건드리지 않음 |
| `_CH_DECO` 살포 | **이 맵만 끔** (`_testbed`가 아님. compose `hand`로 차단) | hell 0의 1-2~1-4, CH2~7 살포 로직 수정 금지 |
| 살점 scatter | CH1-1 배치 목록에 안 올림 | `_CH_DECO[0]` 배열에서 항목 삭제 금지 |

구현할 때 `_CH_DECO` 전역 배열을 비우거나 `initMapObjects` 공통 분기를 바꾸지 않는다. `_MAP_COMPOSE[0]`과 `G.stage===0` 본편 경로만.

---

## LEGACY VERDICT (ARCHIVE ONLY)

**2026-08-24 ARCHIVE VERDICT.** 당시 `_MAP_COMPOSE[0].handProps` 80개, mega 6개를 사용했다. 현행 판정은 문서 상단의 2026-08-28 CURRENT SSOT다.

`FIXED_MAPS[0]` 꺾인 방·10타일 복도·alcove와 맞음.  
START/EXIT empty offset은 스폰·문 앞 여유.  
포켓은 우회 2연결. ribs 900 (QA≤1000). 플래그는 si0만.

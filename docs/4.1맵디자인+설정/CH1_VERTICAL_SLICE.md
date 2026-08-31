# CH1 VERTICAL SLICE SPEC — 첫 번째 완성형 레벨

> **역할**: CH1(썩은 숲)을 기준으로 한 **첫 수직 슬라이스** 완성형 레벨 스펙. 세미 오픈월드 규칙의 실증 케이스.
> **원칙**: **CH1 전체를 새로 만들지 않는다.** 기존 DESIGN LOCK 데이터(`CH1_1_COMPOSE_초안.md`, `FIXED_MAPS[0]`, `_MAP_COMPOSE[0]`)를 **verbatim 보존**하고, 그 위에 수직 슬라이스 흐름만 얹는다.
> **상태**: 2026-08-30. `forestBoundary:1` canonical tile wall, authored63/runtime64, structural0, 우중 제단 고지대, stage0 outer + default smoothing 적용.
> **정합**: legacy keepDragon 자동분기는 OFF이며, 현행 si0에는 용 2종과 mega 배치가 없다. `CH1_MAP_KIT_OptionB.md`도 reference authored 값으로 동기화됐다.
> 아래의 LOWER/CENTRAL/UPPER 분지·옛 지그재그 표는 2026-08-24 blockout archive다. 현행 시각 배치/앵커는 `CH1_1_COMPOSE_초안.md` CURRENT SSOT가 우선한다.

---

## 2026-08-29 우중 제단 고지대

| 구분 | 런타임 값 |
|---|---|
| 위치 | 중심 `(147,98)`, 타원 반경 `18×9 tile` |
| 고도 | 저지대 0 / 서쪽 ramp smoothstep 0→1 / 정상 1 |
| 진입 | 서쪽 `x125→135`, `y98`, 반폭 `1.8→3 tile` 한 곳 |
| 차단 | 타원 band `.84≤d≤1.04`를 `isW`에 합성, ramp 내부만 예외 |
| 시각 | 기존 `m_c1gedge` 1장 기반 뿌리 단구. map floor 뒤/prop 앞 렌더 |
| 메인 흐름 | x100 START→CENTER→EXIT 저지대 축과 중앙 HERO 위치 불변 |

검증은 실제 WASD만 사용했다. ramp low `h=.026`, mid `h=.668`, plateau `h=1`, 북쪽 직벽 정지, ramp 하산 `h=0`을 확인했다. 이 지형은 stage-local authored geometry이며 `handProps`/`MAP_OBJS` 수를 늘리지 않는다.

---

## 0. 수직 슬라이스 목표 흐름

```
START (6시, 시작원)
  ↓ 좁은 진입
COMBAT A = LOWER 분지 (서쪽 치우침)
  ├ WEST POCKET (사이드, 2입구)
  ↓ 지그재그 연결로 (x 서88→동118)
COMBAT B = CENTRAL 분지 (가로로 긴 최대 전투장) — forge 게임플레이 중심
  ├ EAST POCKET (사이드, 2입구)
  ↓ 연결로 (x 동118→서92)
COMBAT C = UPPER 분지
  ↓
[EXIT APPROACH = 보스 게이트 12시] → (보스 아레나 로딩)
```
- CH1-1은 **미니보스/거대보스 존이 분지 흐름 뒤 보스게이트로 연결**되는 구조(별도 아레나). 필드보스(심연의 앵글러)는 CH1-1 한정 2500px 진행 후 `kraken_vanish` 역재생 54틱으로 등장(본체 뿅 금지).
- "남→북, 어긋난 흙 분지 3개. 가운데는 비고, 기억할 뼈는 1~2시." (COMPOSE INTENT, 초안) — **원형 아레나 아님, 직선 복도 아님.**

---

## 1. 골격 — `FIXED_MAPS[0]` (maps_data.js:6–55, 200×200 타일, T=40 → 8000×8000px)

모든 CH1 field가 이것을 클론(`_cloneField11` → base=FIXED_MAPS[0]).

### Rooms (타일 좌표) — maps_data.js:9–23
| id | type | cx,cy | shape | rx,ry | 역할 | 비고 |
|---|---|---|---|---|---|---|
| `s` | start | 100,185 | ellipse | 14,6 | START | 6시 시작 |
| `r1` | combat | 100,155 | ellipse | 18,10 | LOWER | spawns dx±6 grade0 |
| `f` | forge | 100,120 | rect | 8,5 | CENTRAL 게임플레이 | 랜드마크 아님 |
| `r2` | combat | **80**,85 | ellipse | 16,9 | CENTRAL 서쪽 어긋남 | grade1 |
| `r3` | combat | **120**,50 | ellipse | 16,9 | UPPER 동쪽 어긋남 | grade2 |
| `b` | boss | bossCx100, gateY5 | forest gate | x88..112,y2..35 | EXIT APPROACH | exits 99..101,y7 |

### Corridors — maps_data.js:24–30
체인 `s→r1(w10) → r1→f(w9) → f→r2(w10) → r2→r3(w10) → r3→b(w10)`, 전부 `style:"cave"`. 센터라인 지그재그 **100→100→100→80→120→100**.

### Features / alcoves (포켓 씨앗) — maps_data.js:31–35
`{x:35,y:140,r:5}`, `{x:165,y:110,r:4}`, `{x:50,y:65,r:4}`.

### 기타
- corridorSpawns: `{100,138,g0}`, `{100,103,g0}`.
- tileRLE: `[1,40000]` = 통바닥. spawnHoles 9개(아래). objs `{100,190,player_start}`.
- **MAP_ALL_FLOOR=false**: si0은 all-floor 우회를 사용하지 않고 `_buildCh1StartForestRLE(200,200)` canonical floor/wall geometry를 사용한다.

### spawnHoles (9개, tile) — maps_data.js:41–51
(70,170)M, (140,160)S, (55,140)M, (140,130)S, (80,105)M, (130,80)M, (60,60)S, (140,45)M, (100,25)L.

---

## 2. `_MAP_COMPOSE[0]` — si0 DESIGN LOCK (game.html:14221–14232)

```js
0:{hand:1, lm:[],
  empty:[
    {x:.50,y:.88,r:480},  // START 시작원
    {x:.50,y:.14,r:400},  // EXIT 게이트원
    {x:.46,y:.75,r:880},  // LOWER 서쪽 치우친 하단 분지
    {x:.54,y:.51,r:1080}, // CENTRAL 동쪽 치우침(가로 김)
    {x:.48,y:.26,r:820},  // UPPER 서쪽 치우친 상단
    {x:.19,y:.58,r:520},  // WEST 포켓(CENTRAL+LOWER 목)
    {x:.83,y:.45,r:500}   // EAST 포켓(CENTRAL+UPPER 목)
  ],
  handProps:[/* 기존 CH1 에셋 63개 — 정확한 앵커/수치는 CH1_1_COMPOSE_초안.md CURRENT SSOT */],
  mega:[]
}
```
- `empty.r` = **픽셀**(world px), x/y = 정규화(0~1).
- `hand:1` = auto-scatter/deco/uni/wall/scatter **OFF**. `lm:[]` = 중앙 기본 랜드마크 fall-through 차단.
- legacy **keepDragon 미설정 → 중앙/START 자동 용해골 OFF**. 현행 reference authored compose는 `mega:[]`이므로 용 해골 2종도 배치하지 않는다.
- `empty`는 `hand:1` 하에서 **안전망+문서용**. 실제 손배치는 structural boundary 0, `handProps` 63개다. START→중앙→north approach와 중앙 HERO negative space는 canonical forest RLE에서 유지한다.

---

## 3. 존 타일박스 — `CH1_1_COMPOSE_초안.md` (DESIGN LOCK, 2026-08-20)

| Zone | tiles (x0–x1, y0–y1) | 비고 |
|---|---|---|
| START | 86–114, 170–194 | |
| LOWER (COMBAT A) | 54–136, 124–176 | 서쪽 치우침 |
| CENTRAL (COMBAT B) | 46–158, 62–146 | 가로 김, 완전원 아님 |
| UPPER (COMBAT C) | 56–140, 22–82 | |
| EXIT | 80–120, 4–36 | |
| WEST POCKET | 18–58, 90–142 | CENTRAL+LOWER 2입구 |
| EAST POCKET | 142–188, 58–122 | CENTRAL+UPPER 2입구 |

- **현행 진행축 LOCK**: START x100 → 중앙 HERO 서쪽 우회 x84 → 북쪽 x100 → EXIT. 중앙 전투공터는 열어 둔다.
- **연결 최소폭 10타일 — 절대 축소 금지.**
- **START/NORTH LOCK**: START spawn(100,185)은 유지한다. 현행 north는 `_applyCh1StartNorthGate`의 bossCx100/gateY5, exits y7, approach x88..112/y2..35가 우선하며 과거 empty(100,28)는 archive다.
- **SIDE POCKET — LOCK**: 좌상 cocoon, 좌중 camp, 좌하 root passage, 우중 altar, 우상 swamp, 우하 poison pocket을 서로 분리된 비대칭 cluster로 읽히게 한다.
- **MAIN ROUTE**: START(100.5,185.5)→남쪽 개활지→중앙 시체나무 우회→north y23.43 실제 WASD PASS→exits y7.

---

## 4. 랜드마크 — 중앙 HERO 시체나무 1 + 비대칭 side POI

- 위치 tile **(102,90)**, 중앙. `m_c1tree` 하나만 HERO로 사용한다.
- **현행 size LOCK: `_OBJ_META` sz1450, instance scale1.0.** 과거 900/QA1000은 mega_ribs archive 값이며 corpse tree에 적용하지 않는다.
- EXIT empty에서 ≥30타일, 소환굴(140,45)에서 ~32타일 이격.
- bone_arch는 LOWER 동쪽 보조 대형으로 채택하고, skull_altar는 서쪽 유니크 소품으로 유지한다.

---

## 5. RIM / SWAMP / 개활도

- **RIM 8섹터**(남/남서/남동/서/동/북서/북/북동), 대형 간격 ≥20타일.
- **RESERVED SWAMP 4모서리**(SW/SE/NW/NE), depth 6–12타일, puddle+pit_poison 각 max1.
- 개활지 목표 **65~72%** (PLAY∪포켓), RIM+swamp 28~33%.
- ASCII 200×200 blockout 전문: `CH1_1_COMPOSE_초안.md §ASCII BLOCKOUT` (legend S/X/=/C/L/U/W/E/M/R/~).

---

## 6. 스코프 격리 — LOCK (초안 §265–274)

`hand:1` / legacy `keepDragon off` / `_CH_DECO off` / 살점 scatter off / floor carpet off는 **si0 전용.** 현행 si0의 `mega`는 빈 배열이며 이 설정을 다른 stage로 전역화하지 않는다.

---

## 7. 필요한 것 (구현 시)

### PLAY / 콜리전
- 기존 tileRLE 통바닥 + isW로 성립. RIM 오브젝트(절벽/뼈벽)는 **비충돌 or 충돌메타 오브젝트**로 경계 자연화(현재 미배치).

### OUTER
- 전역 패럴랙스 원경은 비활성이다. CH1-1 탐험맵은 stage0 locked outer + default smoothing 64-chunk visual phase를 렌더하며 boss arena에서는 자동 OFF다.

### Art (에셋)
- 바닥 `assets/map/ch1/ground_dark_soil.png` 1024². 데코 `_CH_DECO[0]`.
- 현행 랜드마크 `m_c1tree` 스프라이트. `m_mega_ribs`와 과거 blueprint/minimap은 2026-08-24 archive 참고 자료이며 현재 si0 배치에는 사용하지 않는다.
- **MISSING**: 전역 늪 전이 타일(auto-tile), 전경 occluder(planned only). CH1-1 local은 authored63 + baked 64-chunk + canonical forest tile boundary로 충족하며 신규 hand prop은 추가하지 않는다.

### Runtime event
- 필드보스 `_fbTick`(51878) 2500px 게이트 유지. 보스 아레나 `_enterBossArena`(25111).

### 미니맵
- 현재 G.map+spawnHoles+player만. **보스게이트/포켓 마커 없음** → PHASE 6에서 추가.

---

## 8. CH1-2 ~ CH1-4 (요약, tile-precise 미완)

`맵구성_1장.md` §3 기준(1-1만 완전 blockout, 1-2~1-4는 문단 스펙):
- **1-2 뒤틀린 숲길**(si1, 현행): `hand:1`+`vista:1`+`CH1_SI1_GEOMETRY`. 7-region 비대칭 mask, width `34→89→43→89→38t`, toxic/camp/altar 실제 pocket, corpse tree 좌/우 bypass, authored `12/12`. 상세 SSOT는 `CH1_SI1_ACTUAL_STAGE_GEOMETRY.md`.
- **1-3 눈달린 버섯 군락**(si2): clusters (.28,.35)/(.72,.38)/(.50,.62) r800–900; uniques flesh_ball/penta_circle/flesh_maw/eye_tree/skull_altar; mega_head(.28,.35,980); empty START(.50,.88 r420)/EXIT(.50,.14 r380)/mid(.50,.48 r700).
- **1-4 기생수의 둥지**(si3): edge-only 밀도, 중앙 r1100 void+왕좌(.50,.22); uniques throne/bone_arch/flesh_maw/skull_altar/penta_circle; lgMul1.25, lgDist640.

---

## 9. CH1 엔진 사실 (`CH1_MAP_KIT_OptionB.md §1–9`)
- 바닥 1024²(dark_soil). 충돌 = 맵경계/타일===1/오브젝트 원·타원(**다각형 없음, 알파콜라이더 없음**).
- **매 프레임 런타임 Y-sort 없음** → 큰 나무는 항상 플레이어 뒤에 렌더. (단 2026-08 `initMapObjects` 말미에 MAP_OBJS **빌드시 1회 Y정렬**(painter, 데코끼리 앞뒤 순서만) 추가됨 — 플레이어/엔티티는 별도 렌더 패스라 오클루전 무영향)
- 전경 occluder = **planned only, 코드 없음**("1차 구현에서 FG 제외 권장").

## 10. CODE CHANGE
**NONE.** 기존 LOCK 보존 + 슬라이스 스펙 정리 전용.

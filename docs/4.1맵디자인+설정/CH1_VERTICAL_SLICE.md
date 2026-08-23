# CH1 VERTICAL SLICE SPEC — 첫 번째 완성형 레벨

> **역할**: CH1(썩은 숲)을 기준으로 한 **첫 수직 슬라이스** 완성형 레벨 스펙. 세미 오픈월드 규칙의 실증 케이스.
> **원칙**: **CH1 전체를 새로 만들지 않는다.** 기존 DESIGN LOCK 데이터(`CH1_1_COMPOSE_초안.md`, `FIXED_MAPS[0]`, `_MAP_COMPOSE[0]`)를 **verbatim 보존**하고, 그 위에 수직 슬라이스 흐름만 얹는다.
> **상태**: 2026-08-23. 코드 변경 없음.
> ⚠ **CONFLICT**: `CH1_MAP_KIT_OptionB.md §2`는 `1-1 compose={keepDragon:1, mega sz1400}`이라 기록하나, **최신 DESIGN LOCK(`CH1_1_COMPOSE_초안.md`, 2026-08-20)은 keepDragon OFF·mega sz900**. 코드 실제값(`game.html:14221`)도 keepDragon 없음·sz900. → **초안+코드가 canonical**, OptionB의 sz1400/keepDragon 기록은 stale.

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
- CH1-1은 **미니보스/거대보스 존이 분지 흐름 뒤 보스게이트로 연결**되는 구조(별도 아레나). 필드보스(심연의 앵글러)는 CH1-1 한정 2500px 진행 후 등장.
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
| `b` | boss | 100,18 | ellipse | 20,12 | EXIT APPROACH | 12시 문, 4 pillars dx±10 dy±5 |

### Corridors — maps_data.js:24–30
체인 `s→r1(w10) → r1→f(w9) → f→r2(w10) → r2→r3(w10) → r3→b(w10)`, 전부 `style:"cave"`. 센터라인 지그재그 **100→100→100→80→120→100**.

### Features / alcoves (포켓 씨앗) — maps_data.js:31–35
`{x:35,y:140,r:5}`, `{x:165,y:110,r:4}`, `{x:50,y:65,r:4}`.

### 기타
- corridorSpawns: `{100,138,g0}`, `{100,103,g0}`.
- tileRLE: `[1,40000]` = 통바닥. spawnHoles 9개(아래). objs `{100,190,player_start}`.
- **MAP_ALL_FLOOR**(si0 전용): 내부 벽1→바닥0, 테두리만 벽 (`game.html:24589/25038`).

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
  mega:[{id:'m_mega_ribs', x:.85, y:.17, sz:900}]
}
```
- `empty.r` = **픽셀**(world px), x/y = 정규화(0~1).
- `hand:1` = auto-scatter/deco/uni/wall/scatter **OFF**. `lm:[]` = 중앙 기본 랜드마크 fall-through 차단.
- **keepDragon 미설정 → 용해골 OFF** (게이팅 `game.html:20778–20794`, `G.stage===0 && !_testbed && _cmp.keepDragon`).
- `empty`는 `hand:1` 하에서 **안전망+문서용** — 실제 손배치 props(ctree×8-12/hang_cage/cage_gate/skull_altar/독늪)는 **아직 코드 미배치**.

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

- **센터라인 지그재그 LOCK**: x=100 → 서88 → 동118 → 서92 (LOWER→CENTRAL→UPPER). r2=80/r3=120과 정합.
- **연결 최소폭 10타일 — 절대 축소 금지.**
- **START/EXIT vs empty offset — LOCK**: START spawn(100,185)이지만 empty중심(0.50,0.88)→(100,176) = spawn보다 **북쪽 9타일**(첫 걸음 커버, 남쪽 rim 아님). EXIT 문(100,18)이지만 empty(0.50,0.14)→(100,28) = **남쪽 10타일**(접근로 커버). 스폰은 x=100 축 유지, 분지 x오프셋은 경로 굴곡이지 스폰 오프셋 아님.
- **SIDE POCKET — LOCK**: 막다른 길 아님 = **각 2입구**. WEST=CENTRAL(overlap x46–58 w12)+LOWER(x48–58 w10). EAST=CENTRAL(x142–158 w16)+UPPER(x142–152 w10). 비대칭. 목 ≥10타일 아니면 배치 실패.
- **MAIN ROUTE**: START(100,185)→LOWER(~88,150)→CENTRAL(~118,105)→UPPER(~92,52)→EXIT(100,18). x=100 직선복도 없음.

---

## 4. 랜드마크 — `m_mega_ribs` (뿔난 거대뼈)

- 위치 tile **(170,34) ≈ (0.85,0.17)**, 1~2시 rim.
- **size LOCK: 시작 900, QA 최대 1000. 1100/1400 금지.**
- EXIT empty에서 ≥30타일, 소환굴(140,45)에서 ~32타일 이격.
- bone_arch/skull_altar는 랜드마크로 **기각**(ribs 채택).

---

## 5. RIM / SWAMP / 개활도

- **RIM 8섹터**(남/남서/남동/서/동/북서/북/북동), 대형 간격 ≥20타일.
- **RESERVED SWAMP 4모서리**(SW/SE/NW/NE), depth 6–12타일, puddle+pit_poison 각 max1.
- 개활지 목표 **65~72%** (PLAY∪포켓), RIM+swamp 28~33%.
- ASCII 200×200 blockout 전문: `CH1_1_COMPOSE_초안.md §ASCII BLOCKOUT` (legend S/X/=/C/L/U/W/E/M/R/~).

---

## 6. 스코프 격리 — LOCK (초안 §265–274)

`hand:1` / `keepDragon off` / `_CH_DECO off` / 살점 scatter off 는 **si0 전용.** 전역화 금지(1-2~1-4 파괴됨).

---

## 7. 필요한 것 (구현 시)

### PLAY / 콜리전
- 기존 tileRLE 통바닥 + isW로 성립. RIM 오브젝트(절벽/뼈벽)는 **비충돌 or 충돌메타 오브젝트**로 경계 자연화(현재 미배치).

### OUTER
- 썩은 숲 원경(먼 나무 실루엣/독안개 깊이). 패럴랙스 재활성 대상. **현재 미렌더.**

### Art (에셋)
- 바닥 `assets/map/ch1/ground_dark_soil.png` 1024². 데코 `_CH_DECO[0]`.
- 랜드마크 `m_mega_ribs` 스프라이트. 참조: `compose_ch1/blueprint_1-1..1-4.png`, `minimap_1-1..1-4.png`, keyart `1-1_forest_gate.jpg`.
- **MISSING**: 늪 전이 타일(auto-tile), 전경 occluder(planned only), hand-placed rim props.

### Runtime event
- 필드보스 `_fbTick`(51878) 2500px 게이트 유지. 보스 아레나 `_enterBossArena`(25111).

### 미니맵
- 현재 G.map+spawnHoles+player만. **보스게이트/포켓 마커 없음** → PHASE 6에서 추가.

---

## 8. CH1-2 ~ CH1-4 (요약, tile-precise 미완)

`맵구성_1장.md` §3 기준(1-1만 완전 blockout, 1-2~1-4는 문단 스펙):
- **1-2 뒤틀린 숲길**(si1): `hand:1`+`vista:1`, basin `{cx:100,cy:122,rx:80,ry:64}`, empty START(.50,.88 r360)/EXIT(.50,.14 r320). 랜드마크 예배당+눈나무3.
- **1-3 눈달린 버섯 군락**(si2): clusters (.28,.35)/(.72,.38)/(.50,.62) r800–900; uniques flesh_ball/penta_circle/flesh_maw/eye_tree/skull_altar; mega_head(.28,.35,980); empty START(.50,.88 r420)/EXIT(.50,.14 r380)/mid(.50,.48 r700).
- **1-4 기생수의 둥지**(si3): edge-only 밀도, 중앙 r1100 void+왕좌(.50,.22); uniques throne/bone_arch/flesh_maw/skull_altar/penta_circle; lgMul1.25, lgDist640.

---

## 9. CH1 엔진 사실 (`CH1_MAP_KIT_OptionB.md §1–9`)
- 바닥 1024²(dark_soil). 충돌 = 맵경계/타일===1/오브젝트 원·타원(**다각형 없음, 알파콜라이더 없음**).
- **런타임 Y-sort 없음** → 큰 나무는 항상 플레이어 뒤에 렌더.
- 전경 occluder = **planned only, 코드 없음**("1차 구현에서 FG 제외 권장").

## 10. CODE CHANGE
**NONE.** 기존 LOCK 보존 + 슬라이스 스펙 정리 전용.

# CH1-1 BLOCKOUT MASTER — 실 blockout 규격표 (Section F)

> **역할**: CH1-1(si0, 썩은 숲 입구)을 START→EXIT 단일 좌표/규격표로 완성. 현행은 `_MAP_COMPOSE[0].forestBoundary=1`, `handProps` 63개이며 좌표·경계는 `CH1_1_COMPOSE_초안.md` CURRENT SSOT가 우선한다.

> **2026-08-29 고지대 보충**: 우중 제단 앵커와 hill 수학은 유지한다. 이후 forest boundary에서 structural module 59개와 dead prop 1개를 제거했으므로 현행 `handProps`는 63개다.
> 아래 LOWER/CENTRAL/UPPER 번호표는 2026-08-24 gameplay blockout archive이며 현행 시각 랜드마크/프롭 배치를 뜻하지 않는다.
> **상태**: 2026-08-30. stage0 default smoothing + canonical forest tile boundary 적용. authored63/runtime64, structural0, collision23 total/22 hand.
> **맵**: 200×200 타일, T=40 → 8000×8000px. 좌표=타일(별도표기 시 px/정규화).

---

## 1. 마스터 좌표표 (START → EXIT)

| # | 요소 | 종류 | 중심(tile) | 크기 | 연결 | 근거 |
|---|---|---|---|---|---|---|
| 0 | player_start | SPAWN | 100,185 | — | →#1 | FIXED_MAPS[0] objs, spawn(100,185) |
| 1 | START 원 | START ZONE | 100,185 | empty r480px(12t) / box 86–114,170–194 | ↑#2 | _MAP_COMPOSE[0] (.50,.88) |
| 2 | s→r1 통로 | CORRIDOR | x100 | w10 | #1↔#3 | maps_data corridor |
| 3 | LOWER 분지 | COMBAT A | ~88,150 (empty .46,.75) | r880px(22t) / box 54–136,124–176 | #2,#4,#8(WEST) | r1 combat(100,155), 서쪽치우침 |
| 4 | r1→f 통로 | CORRIDOR | x100 | w9 | #3↔#5 | corridor |
| 5 | CENTRAL 분지 | COMBAT B | ~118,105 (empty .54,.51) | r1080px(27t) / box 46–158,62–146 (가로김) | #4,#6,#8,#9 | forge f(100,120) 게임플레이 중심 |
| 6 | f→r2→r3 통로 | CORRIDOR | 서88→동118→서92 | w10 | #5↔#7 | 지그재그 LOCK |
| 7 | UPPER 분지 | COMBAT C | ~92,52 (empty .48,.26) | r820px(20t) / box 56–140,22–82 | #6,#9,#10 | r2(80,85)/r3(120,50) |
| 8 | WEST POCKET | SIDE(2입구) | ~38,116 (empty .19,.58) | r520px / box 18–58,90–142 | CENTRAL(x46–58 w12)+LOWER(x48–58 w10) | 초안 LOCK 비대칭 |
| 9 | EAST POCKET | SIDE(2입구) | ~166,90 (empty .83,.45) | r500px / box 142–188,58–122 | CENTRAL(x142–158 w16)+UPPER(x142–152 w10) | 초안 LOCK |
| 10 | EXIT 접근 | GATE APPROACH | x88..112,y2..35 | 폭 25타일 funnel | #7↔#11 | `_applyCh1StartNorthGate` 보존 영역 |
| 11 | boss 게이트/exit | GATE | bossCx100, gateY5 / exits 99..101,y7 | exit 3타일 | #10→[아레나] | forest RLE 뒤 재적용 |
| L | m_c1tree | MAIN HERO | 102,90 | meta sz1450 / scale1 | 중앙 | 현행 reference focal point 1개, 3100×2200 smoothing basin |
| S1 | m_c1camp | SECONDARY | 45,100 | scale1.55 | 서쪽 | 좌표·collision 불변 |
| S2 | m_c1altar | SECONDARY | 147,97 | scale1.45 | 우중 hill | hill 중심147,98·rx18/ry9·west ramp125→135 불변 |
| T1~3 | cocoon / pool / poison pit | TERTIARY | 47,50 / 167,43 / 162,139 | 1.55 / 1.55 / 1 | side | pool은 forest-mask authored exact 위치 |

현행 `_MAP_COMPOSE[0].mega`는 빈 배열이다. 과거 dragon/mega 5개 표는 `CH1_1_COMPOSE_초안.md`의 **LEGACY BLOCKOUT ARCHIVE**에만 남기며 현재 runtime 좌표로 사용하지 않는다.

**CURRENT MAIN ROUTE**: START(100.5,185.5) → 남쪽 개활지 → 중앙 시체나무 우회 → north approach x88..112 → y23.43. 실제 WASD 전 segment PASS, exits는 y7.

---

## 2. START / EXIT 오프셋 LOCK (재확인)

- START spawn(100,185) vs empty중심(100,176) = empty가 spawn보다 **북쪽 9타일**(첫 걸음 커버, 남쪽 rim 아님).
- 과거 EXIT 문(100,18)/empty중심(100,28)은 archive다. 현행은 bossCx100/gateY5, exits y7, approach x88..112/y2..35다.
- 스폰 x=100 축 유지. 분지 x오프셋(서88/동118)은 경로 굴곡, 스폰 오프셋 아님.

---

## 3. RIM (경계, 8섹터)

| 섹터 | 위치 | 내용(초안) |
|---|---|---|
| 남/남서/남동 | START 아래 | 독늪 rim, puddle |
| 서/동 | 포켓 바깥 | 절벽·뿌리 |
| 북서/북/북동 | EXIT 위 | 열린 황폐지, EXIT x100 축. mega 없음 |
- 대형 오브젝트 간격 ≥20타일. **RESERVED SWAMP** 4모서리(SW/SE/NW/NE) depth 6–12t, puddle+pit_poison 각 max1.

현행 RIM의 큰 충돌 경계는 `_buildCh1StartForestRLE(200,200)` tile wall이다. structural prop row는 0이며 visual baked mass와 map geometry를 분리한다.

---

## 4. OUTER (외곽, footprint 0)

- **OUTER-A**: RIM 너머 독늪 심연/썩은 뿌리 하단(하층 없음 — 최하층이므로 "지옥 바닥" 암시).
- **OUTER-B**: 진행 방향(북) 원경에 **벌레굴 입구 실루엣**(다음 층 목표) + 먼 거대 나무.
- **OUTER-C**: 지옥 하늘/독안개 대기.
- 전역 패럴랙스는 비활성이다. smoothing master는 build-time에 locked outer+overlay로 완성되며 runtime은 smoothing/outer 중 한 chunk set을 선택한다. canonical forest tile wall은 두 phase에 공통이다.

---

## 5. BOSS PRESENCE (사다리)

| 단계 | CH1-1 배치 |
|---|---|
| LADDER-1 실루엣 | OUTER-B에 원경(선택, 필드보스는 근접형이라 약함) |
| LADDER-2 환경반응 | 필드보스 심연의 앵글러 접근 — 2500px 진행 후 **꿈틀 상승 54틱** 등장(`_fbTick`, si0 전용, HP=1800+lv×350). 본체 즉시 표시 없음 |
| LADDER-5 아레나 | GATE(#11) 통과 → 흑요염 파괴자 아레나(`_enterBossArena` 25217) |
- **주의**: CH1-1은 **이중보스** — 필드 로밍(심연의 앵글러) + 게이트 아레나(흑요염 파괴자). `BOSS_CANONICAL_MAPPING.md §3`.

---

## 6. BOSS ARENA (별도 맵)

- `genBossArena(si=0)`: hell0 = **원형**(`_BOSS_ARENA_TYPE[0]=0`), 128×108, 중심(64,54).
- 보스 흑요염 파괴자, `_isLargeBoss=true`, HP×8/ATK×3, 5페이즈. 3D `_b3` Vinebound Sentinel(scaleMul 0.4).

---

## 7. GATE / 진행

- GATE(#11) 개방: 처치 80%(`checkRooms` 35591, +10% 가드). 출구타일 밟기 → `_bossLoadPhase` → 아레나. 미개방 시 봉인 메시지.
- 스테이지 클리어 = 아레나 보스 처치 후 아레나 출구 도달(35626). 타임어택 90%.

---

## 8. 필요 자산 / 미구현 (구현 시)

- 바닥 `assets/map/ch1/ground_dark_soil.png` 1024². `_CH_DECO[0]` 메타는 재사용하지만 자동 살포하지 않고 `_MAP_COMPOSE[0].handProps` 63개를 고정 배치한다. `lm:[]`, `mega:[]`, uni/large/scatter/floor carpet와 outer-enabled procedural wall-edge/pillar fallback은 0개다.
- **현행 CH1-1**: stage0 기본 smoothing은 locked outer 8192² 위에 별도 8192²/64-chunk overlay를 합성한다. `ch1StartPhase=outer`는 outer-only 비교, `ch1StartOuter=0`은 전체 OFF 비교다. 전역 패럴랙스·늪 전이타일(auto-tile)·전경 occluder는 여전히 미구현이다.
- 참조 이미지: `compose_ch1/blueprint_1-1.png`, `minimap_1-1.png`, keyart `1-1_forest_gate.jpg`.

## 9. 개활도
- PLAY∪포켓 65~72%, RIM+swamp 28~33%. ASCII blockout 전문 = `CH1_1_COMPOSE_초안.md §ASCII`.

## 10. CODE CHANGE
`MAP_ALL_FLOOR=false`와 `forestBoundary:1`로 stage0 geometry가 변경됐다. baked master/landmark 좌표는 유지하며 경계·수량은 `CH1_1_COMPOSE_초안.md`, 시각 runtime은 outer/smoothing SSOT를 따른다.

# CH1-1 BLOCKOUT MASTER — 실 blockout 규격표 (Section F)

> **역할**: CH1-1(si0, 썩은 숲 입구)을 START→EXIT 단일 좌표/규격표로 완성. **기존 canonical 좌표 최대 보존**(`CH1_1_COMPOSE_초안.md`+`FIXED_MAPS[0]`+`_MAP_COMPOSE[0]`).
> **상태**: 2026-08-23. 코드 변경 없음. 신규 설계 최소, 기존 LOCK 재조립.
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
| 10 | EXIT 접근 | GATE APPROACH | 100,28 (empty .50,.14) | r400px(10t) / box 80–120,4–36 | #7↔#11 | offset LOCK(문북 10t) |
| 11 | boss 게이트 | GATE | 100,18 | ellipse rx20,ry12 · 4 pillars dx±10 dy±5 | #10→[아레나] | b room, 12시 |
| L | m_mega_ribs | LANDMARK | 170,34 (.85,.17) | sz **900**(max1000) | RIM 1~2시 | 초안 LOCK, sz1100/1400 금지 |

**MAIN ROUTE**: #0→#1 START(100,185) → #3 LOWER(~88,150) → #5 CENTRAL(~118,105) → #7 UPPER(~92,52) → #10 EXIT접근(100,28) → #11 GATE(100,18). **직선 x=100 복도 없음(지그재그).**

---

## 2. START / EXIT 오프셋 LOCK (재확인)

- START spawn(100,185) vs empty중심(100,176) = empty가 spawn보다 **북쪽 9타일**(첫 걸음 커버, 남쪽 rim 아님).
- EXIT 문(100,18) vs empty중심(100,28) = **남쪽 10타일**(접근로 커버).
- 스폰 x=100 축 유지. 분지 x오프셋(서88/동118)은 경로 굴곡, 스폰 오프셋 아님.

---

## 3. RIM (경계, 8섹터)

| 섹터 | 위치 | 내용(초안) |
|---|---|---|
| 남/남서/남동 | START 아래 | 독늪 rim, puddle |
| 서/동 | 포켓 바깥 | 절벽·뿌리 |
| 북서/북/북동 | EXIT 위 | 뼈·폐허, ribs(170,34) 북동 |
- 대형 오브젝트 간격 ≥20타일. **RESERVED SWAMP** 4모서리(SW/SE/NW/NE) depth 6–12t, puddle+pit_poison 각 max1.

---

## 4. OUTER (외곽, footprint 0)

- **OUTER-A**: RIM 너머 독늪 심연/썩은 뿌리 하단(하층 없음 — 최하층이므로 "지옥 바닥" 암시).
- **OUTER-B**: 진행 방향(북) 원경에 **벌레굴 입구 실루엣**(다음 층 목표) + 먼 거대 나무.
- **OUTER-C**: 지옥 하늘/독안개 대기.
- 현재 미렌더(패럴랙스 비활성 `43539`). → ROADMAP P2.

---

## 5. BOSS PRESENCE (사다리)

| 단계 | CH1-1 배치 |
|---|---|
| LADDER-1 실루엣 | OUTER-B에 원경(선택, 필드보스는 근접형이라 약함) |
| LADDER-2 환경반응 | 필드보스 심연의 앵글러 접근 — 2500px 진행 후 등장(`_fbTick` 51979, si0 전용, HP=1800+lv×350) |
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

- 바닥 `assets/map/ch1/ground_dark_soil.png` 1024². 데코 `_CH_DECO[0]`. 랜드마크 `m_mega_ribs` 스프라이트.
- **미구현**: hand-placed rim props(ctree×8-12/hang_cage/cage_gate/skull_altar/독늪), 늪 전이타일(auto-tile), 전경 occluder(planned), OUTER 렌더.
- 참조 이미지: `compose_ch1/blueprint_1-1.png`, `minimap_1-1.png`, keyart `1-1_forest_gate.jpg`.

## 9. 개활도
- PLAY∪포켓 65~72%, RIM+swamp 28~33%. ASCII blockout 전문 = `CH1_1_COMPOSE_초안.md §ASCII`.

## 10. CODE CHANGE
**NONE.** blockout 규격 정리 전용. 기존 LOCK 좌표 보존.

# LEVEL DESIGN RULES SSOT — EXODUSER: HELL LORD

> **역할**: 모든 맵/레벨의 공간 설계 규칙. PLAY/RIM/OUTER, 길·전투장 비율, 전투구역 요구조건, 사이드포켓, 미니보스, 보스구역, 관문, 시야 유도, 외곽 스케일, 가독성, 금지 패턴.
> **상태**: 2026-08-23 초판. 코드 변경 없음. 기존 `맵제작_SSOT.md`(§7 PLAYABLE ROAD, §18 리듬, §20 밀도)·`CH1_1_COMPOSE_초안.md`(CH1-1 실증)를 상위 규칙으로 일반화.

---

## RULE 1 — 길은 좁고 전투장은 넓다 (LOCKED 철학)

기본 플레이 리듬:
```
좁은 이동/탐험 → 넓은 전투구역 → 사이드 탐험 → 좁은 연결구간
→ 넓은 전투구역 → 미니보스/이벤트 → 거대 보스구역 → 상층 관문
```
- **좁은 길에서 계속 전투하는 게임으로 만들지 않는다.**
- 좁은 길의 역할: 이동 · 긴장 · 매복 · 탐험 · 공간 전환.
- **핵심 전투는 넓은 공간에서.** (CH1-1 중앙 HERO 반경 28타일의 negative space가 현행 예시)
- 기존 근거: `맵제작_SSOT.md §18` `ROAD → COMBAT → NARROW → LANDMARK → COMBAT → TRANSITION`.

---

## 2. 길과 전투장 비율

| 요소 | 목표 비율 | 근거 |
|---|---|---|
| PLAY(이동+전투+포켓) | **65~72%** open ground | `CH1_1_COMPOSE_초안.md` 실측 |
| ENVIRONMENT(RIM+OUTER) | 28~35% | `맵제작_SSOT.md §7` (PLAY 60~70 / ENV 30~40) |
| 연결로 최소 폭 | **10 타일(400px) 이상** — 절대 축소 금지 | CH1-1 LOCK |
| 전투 분지 지름 | 대략 1600~2240px | CH1-1 중앙 HERO 반경 28타일의 개방 공간 |

---

## 3. 월드 공간 3레이어 — PLAY / RIM / OUTER (PROPOSED)

> 기존 `맵제작_SSOT.md §7`의 **PLAY AREA vs ENVIRONMENT(2분할)**을 3레이어로 정밀화한 것. 신규 시스템이지만 기존 2분할과 연속적이다.

### PLAY — 실제 플레이 가능 공간
이동로 · 전투 분지 · 오픈 전장 · 사이드 포켓 · 이벤트 구역 · 미니보스장 · 보스장 · 출구.
- 판정 기준: `isW(px,py)===false` (걸을 수 있는 곳). `game.html:25984`.

### RIM — PLAY와 외곽을 잇는 경계
절벽 · 바위 · 뿌리 · 뼈 · 폐허 · 성벽 · 용암 균열 · 독늪 · 난간 · 잔해.
- **목적: 플레이어가 invisible wall에 막혔다고 느끼지 않게 한다.**
- 현재 구현: CH1-1은 `_MAP_COMPOSE[0].forestBoundary=1`, `MAP_ALL_FLOOR=false`이며 `_buildCh1StartForestRLE(200,200)` canonical tile wall이 baked side/top/south forest와 같은 큰 경계를 만든다. 과거 structural boundary prop 59개는 제거했고 authored63/runtime64, structural0이다. START/중앙/north approach와 landmark pocket은 열어 두며 player/enemy/flow/spawn/minimap이 같은 tile 경계를 사용한다.
- CH1-1 RIM: 8섹터(남/남서/남동/서/동/북서/북/북동), 대형 간격 ≥20타일.
- CH1-1 고지대 실증: 우중 제단 `(147,98)`만 `rx18/ry9` 정상부 height 1로 만들고 서쪽 ramp `(x125→135,y98,반폭1.8→3)`만 개방한다. 절벽 band `.84≤d≤1.04`는 실제 `isW` collision이다. 메인 x100 남북축은 height 0/비충돌이며, side POI 고저차가 주 진행로를 강제하지 않는다.

### OUTER — 보이지만 플레이하지 않는 세계
심연 · 거대 산맥 · 용암 바다 · 멀리 있는 지옥성 · 군단 · 폐허 도시 · 거대 생물 · 시체 산 · 거대 기계 · 뼈 구조물.
- **목적: 세계의 스케일을 만든다.**
- 현재 구현 상태: 전역 패럴랙스 OUTER는 여전히 **비활성**이다. 실제 CH1-1(stage0)은 locked outer를 build-time base로 포함한 default smoothing 완성 master와 `forestBoundary:1` tile geometry를 함께 사용한다. visual mass는 baked, 실제 큰 경계는 map geometry라는 가이드 §13 분리를 따른다. 상세는 `CH1_1_START_OUTER_MASS.md`, `CH1_1_SMOOTHING_PASS.md`다. CH1-2(stage1)의 `ch1OuterMass=*`는 별도 opt-in 실험 기록이다.
- Vista 맵 경로(`_isVistaMap`/`_drawVistaWorld`, `game.html:9725/43593`)가 대안 OUTER 렌더 후보.

---

## 4. 전투구역 최소 요구조건

각 COMBAT_ZONE은 다음을 만족해야 한다:
1. 최소 지름 1600px 이상의 열린 바닥(적 8~15마리 + 투사체 회피 여유).
2. 최소 2개의 진입/이탈 통로(막다른 아레나 금지 — 백트래킹/우회 가능).
3. 적이 배경(OUTER/RIM)으로 탈출 불가 (spawn/AI 경계 = PLAY 내부).
4. 시야: 전투 시작 전 공간 규모가 읽혀야 함(매복은 SIDE/EVENT에서).

---

## 5. 이동구간(CORRIDOR) 역할

- 폭 10~14타일. 완만한 곡선(직선 복도 금지 — 금지패턴 §13).
- 매복 포인트 1~2개 허용(좁은 목에서 소규모 조우), **대규모 전투 배치 금지**.
- 공간 전환 신호: 조명·색·오브젝트 밀도 변화로 "곧 넓어진다/좁아진다" 예고.

---

## 6. 사이드포켓(SIDE_ZONE)

- **막다른 길 금지 = 최소 2개 진입로.** CH1-1 side POI는 외곽 shoulder로 장면을 만들되 메인 남북축을 차단하지 않는다.
- 비대칭 배치(좌우 대칭 금지). 목 폭 ≥10타일.
- 보상: 전리품/소환굴/이벤트/랜드마크. 탐험 인센티브 제공.

---

## 7. 탐험 보상

- 사이드포켓·RIM 근처에 전리품/파괴물(breakable)/제단(altar)/소환굴(spawnHole) 배치.
- 현재 오브젝트 타입: `MAP_OBJS` = lore/breakable/altar/pick 등(`game.html:20596–20785`).
- 소환굴은 미니맵 보라점 유지(구석에 숨기지 않음 — `2_6 소환굴+리프트시스템.md §7`).

---

## 8. 미니보스 / 보스구역 & 거대보스 디자인 언어

### MINIBOSS_ZONE
- COMBAT 리듬의 정점. 전용 넓은 공간 + 탈출 통로 1개(격파 전 봉인 선택 가능).

### BOSS_ZONE (거대 보스)
- 현재는 별도 아레나(`genBossArena` 128×108, `game.html:25059`)로 로딩 진입.
- **거대 보스 디자인 언어 (LOCKED 방향):**
  > 인간 + 오크 + 용 + 뱀 + 지네 + 말 + 벌레 + 기계 + 갑옷 + 구조물 + 악마가 뒤엉킨 비정상적 융합 생명체.
- 예시: 썩은 유니콘+인간+나무뿌리+금속 / 지네+뱀+인간얼굴+기계다리 / 용+고래+기사시체+얼음 / 용+공성기계+용광로 / 오크+인간군단+말+공성장비 / 사도+천사날개+지네+촉수+의식기계 / 6지옥 생물 융합한 최종 육체.
- **의도적 비대칭.** 단순히 큰 일반 몬스터 금지.
- 기존 서사 근거: 숲의 기생수(인간얼굴 수십), 지옥 군주(6팔·왕관·원소무기 128px). 상세 `8.1보스디자인바이블/`.

---

## 9. 관문(GATE_ZONE)

- 층/스테이지 경계 = 로딩 지점. 관문 은유로 시각화(동굴/성문/거대뿌리/지하통로/승강/봉인문/절벽통로/상층문).
- 현재: 보스 게이트 스월(`_drawGateSwirl`, 봉인 red/개방 blue), 80% 처치 개방(`checkRooms`, `game.html:35591`).

---

## 10. 시야 유도

- 넓은 전투장으로 향하는 방향에 밝기/랜드마크/조명을 배치해 자연 유도(BotW식).
- CH1-1: `m_c1tree`(102,90)가 유일한 중앙 HERO다. START=`m_cage_gate`(103,188), 좌상 cocoon, 좌중 camp, 좌하 bone arch, 우중 altar, 우상 pool, 우하 poison pit가 비대칭 side POI를 이룬다.
- 미니맵에 의존하지 않는다 — "실루엣이 동선"(`맵디자인_벤치마크.md §4`).

---

## 11. 외곽 스케일 연출 (OUTER)

- 다층 패럴랙스(배속 다른 원경 레이어)로 깊이. 원색 남발 금지, 저채도 후퇴.
- 거대 실루엣(먼 지옥성/거대 생물/시체 산)으로 규모감.
- 성능 주의: OUTER draw 증가는 프레임 리스크(→ `MAP_QA_GATES.md Performance`, `MAP_IMPLEMENTATION_ROADMAP.md PHASE 2/11`).

---

## 12. 플레이 가능 공간 가독성

- 장식(RIM/OUTER) 때문에 실제 이동 공간이 안 읽히면 실패.
- 바닥 재질/명도로 PLAY와 ENV를 분리(CH1-1: 흙 바닥 vs 독늪/절벽).
- 개활지 목표 65~72% 유지.

---

## 13. 금지 패턴 (HARD)

- ❌ 긴 직선 복도 반복
- ❌ 원형 아레나만 반복 (CH1-1도 "완전원 아님, 가로 김" 명시)
- ❌ 모든 지형을 플레이 가능하게 만드는 것 (RIM/OUTER가 스케일을 만든다)
- ❌ invisible wall 의존 (경계는 RIM 오브젝트로 자연스럽게)
- ❌ 계속 좁은 길에서만 전투
- ❌ 장식 때문에 이동 공간이 안 읽히는 것
- ❌ 막다른 사이드포켓(진입로 1개)
- ❌ 좌우 대칭 레이아웃

---

## 14. CODE CHANGE
2026-08-30 CH1-1 forest boundary 적용: `_MAP_COMPOSE[0].handProps` 63개, mega/자동 filler/structural module 0. 중앙 HERO와 START→north approach, side POI landmark를 보존하고 baked forest와 canonical tile wall의 일치, north gate exits y7, authored/runtime63/64를 회귀 기준으로 고정한다.

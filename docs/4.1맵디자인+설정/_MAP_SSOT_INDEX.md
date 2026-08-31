# MAP SSOT INDEX — 세미 오픈월드 맵 기획 문서 세트

> 2026-08-30 갱신. 지옥의 길(EXODUSER) 수직 상승 세미 오픈월드 맵/레벨/보스/외곽 기획의 진실 공급원(SSOT) 묶음.
> 설계 문서와 현재 런타임·QA 구현을 함께 동기화한다. 실제 맵 구현은 승인된 PHASE만.

---

## 읽는 순서 (P-1 → P0 → P0.5)

### P-1 — 모든 맵 제작 에이전트 필수 제작 가이드

0. `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` — 전체맵 MASTER PLAN부터 OUTER MASS FIRST, LARGE→MEDIUM→SMALL, GROUND 연결, CAMERA/COMBAT/TECH QA, 8개 제작 GATE, 표준 `MAP PRODUCTION REPORT`까지 규정하는 공통 작업 순서

맵 설계·geometry·collision·outer/baked composition·오브젝트 배치·랜드마크·카메라/전투 QA 작업은 종류와 stage에 관계없이 이 문서를 먼저 완독한다. 이 가이드는 **제작 프로세스 SSOT**이며, 확정 수치·좌표·runtime 계약은 사용자 최신 지시와 아래 stage별 LOCK/SSOT가 우선한다. `v0.9 FIELD TEST`이므로 CH1/CH2 검증 결과를 반영하되 임의로 `v1.0 PRODUCTION LOCK`으로 승격하지 않는다.

실제 CH1-1(`si0/stage0`)의 GATE 2~4 locked outer는 `CH1_1_START_OUTER_MASS.md`, default smoothing 완성 master는 `CH1_1_SMOOTHING_PASS.md`, 현행 `forestBoundary:1` tile geometry와 authored63/runtime64 계약은 `CH1_1_COMPOSE_초안.md`에 기록한다. runtime은 smoothing/outer 중 선택한 chunk set 하나만 그리며 canonical tile wall은 둘 모두에 공통이다. 기존 CH1-2 opt-in 실험 기록과 혼용하지 않는다.

### P0 — 마스터 SSOT 6종
1. `WORLD_STRUCTURE_SSOT.md` — 세계 구조: 7지옥/35에리어/200×200/수직상승 S자/로딩경계/UD 해소 기록
2. `LEVEL_DESIGN_RULES_SSOT.md` — 설계 규칙: PLAY/RIM/OUTER, 길·전투장 비율, 금지 패턴
3. `MAP_RUNTIME_ARCHITECTURE.md` — 런타임 감사: G.map/isW/스폰/전환/미니맵/스트리밍 (실측 라인번호)
4. `CH1_VERTICAL_SLICE.md` — CH1 첫 완성형 슬라이스 스펙 (기존 LOCK 보존)
5. `MAP_IMPLEMENTATION_ROADMAP.md` — PHASE 0~12 + 독립 Task 규격
6. `MAP_QA_GATES.md` — 검증 게이트 (Geometry/Combat/Navigation/Minimap/Transition/Performance)

### P0.5 — 설계 완결·QA 9종
7. `BOSS_CANONICAL_MAPPING.md` — 보스 Lore↔Runtime 분리 매핑 (35 si, UD-MAP-02 해소)
8. `STAGE_SPATIAL_GRAMMAR.md` — (A) 공간 문법·권장 수치 (T40/이속2.6/뷰포트48×27t 근거)
9. `MAP_GRAMMAR_VARIANTS.md` — (B) 8 topology archetype + 챕터 배정
10. `VERTICAL_ASCENT_LANGUAGE.md` — (C) 탑뷰 수직 상승 연출 언어
11. `GIANT_BOSS_PRESENCE_LADDER.md` — (D) 거대보스 존재감 5단계 사다리
12. `OUTER_DEPTH_MODEL.md` — (E) OUTER-A/B/C 심도 모델 (구현수단 미LOCK)
13. `CH1_1_BLOCKOUT_MASTER.md` — (F) CH1-1 START→EXIT 단일 좌표 규격표
14. `MAP_DESIGN_CLOSURE.md` — (G) 반복감사 + (H) 착수게이트 + 최종감사 + READINESS 판정
15. `MAP_TEST_SERVER.md` — 35개 본편 맵 QA 서버/허브/URL/포트/검증 계약 + DPR 2에서 logical 1920×1080/HiDPI backing 3840×2160 분리
16. `CH3_1_HELL_WINTER_IMPLEMENTATION.md` — CH3-1 핏빛 황폐지 200×200 지옥 동토 전장·source authored 346/runtime 343·21 object source(+base ground 1)·crop 13종/87 instance·Final Macro 4-family silhouette + central floor detail 6·카메라/전투/이동 QA
17. `CH1_1_START_OUTER_MASS.md` — 실제 CH1-1 8192²/64-chunk outer mass와 대응 canonical forest tile boundary, BACK14/LARGE20/MEDIUM16/GROUND1/SMALL0
18. `CH1_1_SMOOTHING_PASS.md` — 실제 CH1-1 기본 smoothing 완성 master, EDGE8/CORNER4/TREE4/SIDE10/OPEN5/SMALL0, structural module instance0, authored63/runtime64/collision23, baked master 불변

---

## 확정 결정 (LOCKED)

| ID | 결정 | 근거 |
|---|---|---|
| MAP SIZE | 200×200 field LOCK (runtime 크기, 세계 크기 아님; PLAY/RIM/OUTER로 대세계 연출) | UD-MAP-01 (유저) |
| BOSS | Lore(design)↔Runtime(HELL_BOSSES) 분리 매핑, 양쪽 보존 | UD-MAP-02 (유저) |
| 수직 상승 | 썩은숲(최하)→지옥성(최상)→탈출, 기존 선형순서 재해석 | 유저 |
| 로딩 경계 | 스테이지/층 전환만, 내부 무로딩 | 벤치마크 D4 정합 |
| CH1-1 blockout | 초안 DESIGN LOCK 좌표 보존 | 기존 |
| CH3-1 HELL WINTER | 중앙 64×64 open arena, corpsefield 54, `CH3_HELLWINTER_V1` 성벽 `I36/L2/END4/GATE2`, BACK18/MID21/tower16/gate1/FRONT14/GROUND16 + 4-family crest16 + central floor detail6, 6개 비대칭 POI, source 346/runtime authored 343 | 2026-08-30 Central Detail: **WALL/GAMEPLAY/SILHOUETTE/REPETITION/DENSITY/LIGHTING/COLOR/CANONICAL COMPARISON/CENTRAL DETAIL PASS, CH3-1 VISUAL FINAL PASS**. source image 21(+base ground 1), crop 13종/87 instance, rot 81, mirror 30, filtered 40, edge-erased 4종/5 instance, composite 8, 신규 원화 0 |

## IMPLEMENTATION_READINESS = PASS (PHASE 1 한정)
- CH1 si0 **MAP-P1-PLAYABLE-BOUNDARY 적용**: `forestBoundary:1`, `MAP_ALL_FLOOR=false`, wall16495, exits y7. 다음 전역 P1/P2는 다른 stage로 확대하지 않고 별도 승인한다.
- **현재 상태: BLOCKED_BY_CONCURRENT_WIP** — game.html이 동시 세션에서 DIRTY. clean HEAD 확보 시 착수.

## 잔여 UD (P1 비차단)
- si2 명칭 통일(지옥기형↔숲의 사냥꾼) · 전역 OUTER 렌더수단 선택(P2) · runtime-only 14보스 로어 부여. 실제 CH1-1 stage0은 locked outer+default smoothing의 64-chunk local 예외, CH1-2 stage1은 별도 opt-in 예외다.

## CH2-1 몬스터 QA 계약 — 2026-08-30

- production si4는 소환굴 **11개(S4/M5/L2), 총 스폰 예산 900**과 etype 39 출구 문지기/동반 웨이브를 유지한다. 맵 허브는 si4에서 `combatqa=1`을 기본 사용해 `몬스터 ON`으로 열리며 버튼으로 무전투 관람과 전환한다. 이 옵션은 QA 전용이고 geometry·collision·route·authored/MAP_OBJS·production 밸런스를 바꾸지 않는다.

## 미완 (P1 이후)
- CH2-1(si4)은 `_CH2S4` **109-entry** mega-first 벌레굴(locked base 78 + wall-belt BACK/MID 9 + filler 12 + seam 10; backfill 9/boundary 50/landmark 18/detail 6/mask 4/filler 12/seam 10, authored runtime 109/109, skip 0; system 포함 `MAP_OBJS` 111)로 구현했다. collision/non-collision은 **51/58**이다. `w:30,authoredWidth:1` 22-point 경로가 START→알집→동측 dead end→점액→굽은 굴→깊은 굴→EXIT를 잇는 실제 S자 tile silhouette를 만든다. CH2 전용 RGBA MEGA 10종/실배치 17개와 giant carapace·giant hive·deep hive·organic EXIT frame은 고정했다. visual-only BACK/MID 9개는 사용자 제공 1254² RGBA wall skin 6종, 기존 ridge L/R 2개, 중앙 오른쪽 collision recess를 막힌 깊이로 읽히게 하는 `m_c2backHive (112,70,8°,overlap .16)` 1개이며 잠금 MEGA 뒤에 먼저 렌더한다. connector 5종/12개와 web/chitin/egg seam 3종/10개가 top 7/central bridge 8/central recess 1/east pocket 7/lower 8개 외벽 shoulder를 마감한다. backfill/filler/seam collision은 각각 0이다. legacy `m_c2edge*` authored 사용은 0, 반복 중형 세로 구조물은 runtime-visible 57→42개(-26.32%), off-path 자동 배치·random wall eye·accidental floor patch는 0을 유지한다. floor cleanup은 CH2 ground 연속 dark void base + 가변 반경 `(w+4)` render mask + render-only stain 10/vein 6/soft halo + 양쪽 3층 quadratic chitin rim(shadow `6.4T`/body `4.5T`/highlight `.34T`)으로 collision tile을 수정하지 않으면서 긴 대각 color cutoff를 벽 shoulder로 판독시킨다. reported recess runtime `(111.5,70.5)`, prop collision false, map hash `fefe09a0`, pageerror/CH2 broken sprite/asset 404 0이며 최신 비교는 `captures/ch2_reported_gap_20260830/after_recess_fix/`다. 사용자 visual 승인 전 FINAL은 미확정이다. 잔여 CH2-2~CH7 에리어 blockout · 위험타일 런타임 · 늪 전이타일/전경occluder/OUTER렌더 · hell1~6 per-boss 문서 · 미니맵 보스/게이트 마커.

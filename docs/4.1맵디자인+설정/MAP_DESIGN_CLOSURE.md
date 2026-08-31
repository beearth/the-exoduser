# MAP DESIGN CLOSURE — 반복 감사 · 착수 게이트 · 최종 판정 (Section G/H)

> **역할**: 35스테이지 확장 시 반복감 방지(G), 구현 착수 PASS 조건(H), 전체 설계 최종 감사 + IMPLEMENTATION_READINESS 판정.
> **상태**: 2026-08-23. 코드 변경 없음.

---

# G. REPETITION AUDIT — 반복감 발생 요소 & 방지 규칙

35스테이지가 전부 200×200·6시START·12시EXIT·전바닥이므로, 방치 시 "같은 맵 반복" 체감이 최대 리스크.

| # | 반복 유발 요소 | 방지 규칙 |
|---|---|---|
| R1 | 전 스테이지 200×200 동일 스케일 | archetype 8종 위상 변주(`MAP_GRAMMAR_VARIANTS`) + OUTER로 세계 규모 차별. **같은 챕터 내 동일 archetype 연속 2회 초과 금지** |
| R2 | START 6시 / EXIT 12시 고정 | 진행 축은 고정(수직상승 정합)하되 **메인 루트 지그재그 패턴·분지 개수(2~4)·랜드마크 방향**을 스테이지마다 변주 |
| R3 | 분지→통로 리듬 동일 | 분지 수/크기, 미니보스·이벤트 삽입 위치, 사이드포켓 수(0~4) 변주. archetype별 리듬 상이 |
| R4 | tileRLE 전바닥(평탄) | basin/path/col RLE 변주(`_buildBasinRLE` 등), 위험타일(archetype H, 단 런타임 미구현 선행 필요) |
| R5 | 보스 아레나 타입 재사용(hell5=원형·hell6=대성당) | 3D 모델 스왑(현재 hell0만 전용), 페이즈/무브셋 차별(_BOSS_MOVESET si별 상이) |
| R6 | `_CH_DECO` 챕터 데코 반복 | 데코 풀 로테이션, 스테이지별 유니크 랜드마크 1~2(m_mega_ribs류) |
| R7 | 챕터 색만 다른 동일감(`_MTHEME`) | OUTER 내용(하층조망/목표실루엣)·지형문법·보스정체성으로 챕터 정체성 심화 |
| R8 | 원경 정적 반복 | OUTER-B 목표 실루엣이 층 진행마다 변화(지옥성 근접), 상승 곡선(`VERTICAL_ASCENT_LANGUAGE §7`) |

**방지 메타 규칙**: ① archetype 로테이션(연속금지) ② 스테이지당 유니크 랜드마크 ③ OUTER 진행 변화 ④ 밀도 커브(`2게임디자인레벨디자인.md`) ⑤ 개활도 65~72% 밴드 내 변주.

---

# H. IMPLEMENTATION READINESS GATE — 착수 PASS 조건

"이 기획이면 코딩 시작해도 된다"의 조건. **PHASE 1(MAP-P1-PLAYABLE-BOUNDARY) 한정 판정.**

### PASS 필수 조건
- [x] MAP SIZE 확정 (200×200 LOCK, runtime field ≠ world scale) — UD-MAP-01 해소
- [x] BOSS canonical 분리 매핑 확정 (lore↔runtime, 삭제 없음) — UD-MAP-02 해소 (`BOSS_CANONICAL_MAPPING`)
- [x] CH1-1 blockout 좌표 완결 (START→EXIT 단일 규격표, canonical 보존) — `CH1_1_BLOCKOUT_MASTER`
- [x] 공간 문법 수치 근거 (T=40, 이속 2.6, 뷰포트 48×27t, 분지/통로 권장치) — `STAGE_SPATIAL_GRAMMAR`
- [x] 런타임 아키텍처 감사 (isW/collision/spawn/전환/미니맵/스트리밍) — `MAP_RUNTIME_ARCHITECTURE`
- [x] P1 스코프·NON-GOALS·PASS·ROLLBACK 정의 — `MAP_IMPLEMENTATION_ROADMAP P1`
- [x] P1 QA 게이트 (Geometry/Collision/Performance) — `MAP_QA_GATES`
- [x] 불변 보호영역 식별 (isW 프리필터, 스트리밍 임계, _enterBossArena, 실제 워밍업 18540) — RUNTIME §13

### P1을 막지 않는 미결(후속 PHASE/UD)
- PLAY/RIM/OUTER 코드 시스템 = PROPOSED (P1은 데이터+RIM 오브젝트로 착수 가능, 풀 시스템 P2/P3)
- 전역 OUTER 렌더 수단 = 미확정(후보 4종) — **P1 NON-GOAL**(전역 OUTER 렌더는 P2). 실제 CH1-1(stage0)은 locked outer+default smoothing 64-chunk local 예외이며, CH1-2(stage1)의 `ch1OuterMass=*`는 별도 opt-in 예외다. 두 경로 모두 전역 P2 선택을 확정하지 않는다.
- ZONE 데이터 시스템 = PROPOSED — P1은 CH1 좌표 직접 사용, 풀 존시스템 P3
- 위험타일 런타임 = 미구현 — archetype H/얼음·화염 던전 한정, CH1 P1 무관
- 전경 occluder / Y-sort = planned only — P1 무관
- si2 명칭 드리프트(지옥기형↔사냥꾼) = 표기 UD, P1 무관
- CH2-1(si4)은 2026-08-30 **109-entry** mega-first authored 구성(locked base 78 + BACK/MID 9 + filler 12 + seam 10; backfill 9/boundary 50/landmark 18/detail 6/mask 4/filler 12/seam 10, collision/non-collision 51/58, authored runtime 109/109, skip 0; system 포함 `MAP_OBJS` 111)으로 정리했다. 소형/중형 205-entry 조립식 벽과 authored `wall_edge_tile` 12개는 폐기 상태를 유지하고 CH2 전용 RGBA MEGA 10종/실배치 17개 및 기존 giant 구조물도 고정했다. BACK/MID 9개는 사용자 제공 1254² RGBA 연결 원화 6종, 기존 ridge L/R 2개, 중앙 오른쪽 collision recess용 `m_c2backHive (112,70,8°,overlap .16)` 1개로 구성하며 잠금 MEGA보다 먼저 렌더한다. front MID connector 5종/12개와 web/chitin/egg seam 3종/10개가 top 7/central bridge 8/central recess 1/east pocket 7/lower 8개 체인의 접합부를 마감한다. backfill/filler/seam collision은 0이다. `w:30,authoredWidth:1` 경로·중앙 gameplay core·START/EXIT·기존 collision map hash `fefe09a0`은 바꾸지 않았고 반복 중형 세로 구조물은 runtime-visible 42개를 유지한다. floor cleanup은 연속 dark void base, `(w+4)` mask, stain 10/vein 6/soft halo에 양쪽 3층 quadratic chitin rim(shadow `6.4T`/body `4.5T`/highlight `.34T`)을 더해 긴 대각 collision-only color cutoff를 연속 wall shoulder로 표시하며 off-path/random eye 차단도 유지한다. 실제 WASD 종주 기준 EXIT world `(4017.72,1355.61)`, tile `(100,33)`까지 stuck/abnormal push 0이고 reported recess runtime `(111.5,70.5)`, prop collision false, pageerror/CH2 broken sprite/asset 404 0이다. 최신 비교는 `captures/ch2_reported_gap_20260830/after_recess_fix/`이며 사용자 전체맵 캡처 승인 전 visual FINAL은 미확정이다. CH2-2~CH7은 미존재이며 이 문서의 P1 판정에는 영향 없음.

### PASS 판정 규칙
- P1 필수 조건 **전부 충족 + P1 blocker 0** → PASS.
- CH2~7 확산은 **CH1 P1~P12 통과 후 별도 게이트**(지금 판정 대상 아님).

---

# 최종 감사

## 확정된 것 (LOCKED / EXISTING)
- 7지옥 canonical 순서·이름·35에리어·200×200 field·T=40 (EXISTING)
- 수직 최하층(썩은숲)→최상층(지옥성)→탈출 상승 (USER LOCKED)
- MAP SIZE 200×200 = runtime field, 세계 크기 아님. PLAY/RIM/OUTER로 대세계 연출 (USER LOCKED)
- BOSS lore↔runtime 분리 매핑, 양쪽 보존 (USER LOCKED)
- CH1-1 blockout 좌표 (초안 DESIGN LOCK 보존)
- 공간 문법 수치·연결 규칙·개활도 65~72%
- 로딩 경계 = 스테이지/층 전환, 내부 무로딩

## 아직 PROPOSED
- PLAY/RIM/OUTER 코드 3레이어 (기존 2분할 확장)
- ZONE 데이터 태깅 시스템
- OUTER 3계층 렌더 (수단 미확정 — 후보만)
- 거대보스 존재감 사다리 1~4 (5는 기존 재사용)
- 8 topology archetype 챕터 배정
- 거대보스 융합 디자인언어 확장(runtime-only 14보스 로어 부여)

## 사용자 결정 필요 (P1 비차단, 후속)
- UD-A: si2 명칭 통일 — 지옥기형(runtime) vs 숲의 사냥꾼(lore/settings표)
- UD-B: 스테이지 크기 = 200×200 유지 재확인(현 LOCK) — 대형 존은 명시 거부됨
- UD-C: OUTER 렌더 수단 선택 시점(P2 착수 시)
- UD-D: runtime-only 14보스에 로어 부여 여부/우선순위

## 구현 전에 빠진 것 (P1 이후 필요, P1 비차단)
- CH2-1(si4) authored 벌레굴은 후속 구현 완료. CH2-2~CH7 잔여 에리어별 blockout 필요.
- 위험타일 런타임(archetype H 선행)
- 늪 전이타일 auto-tile, 전경 occluder, OUTER 렌더 재활성
- hell1~6 per-boss 문서, runtime-only 보스 로어
- 미니맵 보스/게이트/포켓 마커

---

# IMPLEMENTATION_READINESS = **PASS**

**판정**: PHASE 1 (MAP-P1-PLAYABLE-BOUNDARY, CH1 si0 PLAY/외곽 런타임 분리) 착수 조건 **전부 충족, blocker 0.**
- 근거: MAP SIZE·BOSS·CH1 blockout·공간문법·런타임감사·P1 스코프/QA 완비. 미결 항목은 전부 후속 PHASE 또는 P1 NON-GOAL이라 P1 비차단.
- 단서: CH2~7 확산·OUTER 렌더·위험타일·존 시스템은 각 PHASE 게이트에서 별도 판정. PASS는 **P1 한정**.

**FAIL 아님 → P1 착수 금지 조항 해제. 단, 이번 세션 지시대로 실제 P1 구현은 하지 않고 STOP.**

---

## CODE CHANGE
**NONE.** 감사·판정 전용.

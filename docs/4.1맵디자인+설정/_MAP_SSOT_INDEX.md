# MAP SSOT INDEX — 세미 오픈월드 맵 기획 문서 세트

> 2026-08-23 작성. 지옥의 길(EXODUSER) 수직 상승 세미 오픈월드 맵/레벨/보스/외곽 기획의 진실 공급원(SSOT) 묶음.
> **코드 변경 0.** 전 문서 조사·기획 전용. 실제 구현은 승인된 PHASE만.

---

## 읽는 순서 (P0 → P0.5)

### P0 — 마스터 SSOT 6종
1. `WORLD_STRUCTURE_SSOT.md` — 세계 구조: 7지옥/35에리어/200×200/수직상승 S자/로딩경계/UD 해소 기록
2. `LEVEL_DESIGN_RULES_SSOT.md` — 설계 규칙: PLAY/RIM/OUTER, 길·전투장 비율, 금지 패턴
3. `MAP_RUNTIME_ARCHITECTURE.md` — 런타임 감사: G.map/isW/스폰/전환/미니맵/스트리밍 (실측 라인번호)
4. `CH1_VERTICAL_SLICE.md` — CH1 첫 완성형 슬라이스 스펙 (기존 LOCK 보존)
5. `MAP_IMPLEMENTATION_ROADMAP.md` — PHASE 0~12 + 독립 Task 규격
6. `MAP_QA_GATES.md` — 검증 게이트 (Geometry/Combat/Navigation/Minimap/Transition/Performance)

### P0.5 — 설계 완결 8종
7. `BOSS_CANONICAL_MAPPING.md` — 보스 Lore↔Runtime 분리 매핑 (35 si, UD-MAP-02 해소)
8. `STAGE_SPATIAL_GRAMMAR.md` — (A) 공간 문법·권장 수치 (T40/이속2.6/뷰포트48×27t 근거)
9. `MAP_GRAMMAR_VARIANTS.md` — (B) 8 topology archetype + 챕터 배정
10. `VERTICAL_ASCENT_LANGUAGE.md` — (C) 탑뷰 수직 상승 연출 언어
11. `GIANT_BOSS_PRESENCE_LADDER.md` — (D) 거대보스 존재감 5단계 사다리
12. `OUTER_DEPTH_MODEL.md` — (E) OUTER-A/B/C 심도 모델 (구현수단 미LOCK)
13. `CH1_1_BLOCKOUT_MASTER.md` — (F) CH1-1 START→EXIT 단일 좌표 규격표
14. `MAP_DESIGN_CLOSURE.md` — (G) 반복감사 + (H) 착수게이트 + 최종감사 + READINESS 판정

---

## 확정 결정 (LOCKED)

| ID | 결정 | 근거 |
|---|---|---|
| MAP SIZE | 200×200 field LOCK (runtime 크기, 세계 크기 아님; PLAY/RIM/OUTER로 대세계 연출) | UD-MAP-01 (유저) |
| BOSS | Lore(design)↔Runtime(HELL_BOSSES) 분리 매핑, 양쪽 보존 | UD-MAP-02 (유저) |
| 수직 상승 | 썩은숲(최하)→지옥성(최상)→탈출, 기존 선형순서 재해석 | 유저 |
| 로딩 경계 | 스테이지/층 전환만, 내부 무로딩 | 벤치마크 D4 정합 |
| CH1-1 blockout | 초안 DESIGN LOCK 좌표 보존 | 기존 |

## IMPLEMENTATION_READINESS = PASS (PHASE 1 한정)
- 첫 Task = **MAP-P1-PLAYABLE-BOUNDARY** (CH1 si0 PLAY/외곽 런타임 분리, isW 불변).
- **현재 상태: BLOCKED_BY_CONCURRENT_WIP** — game.html이 동시 세션에서 DIRTY. clean HEAD 확보 시 착수.

## 잔여 UD (P1 비차단)
- si2 명칭 통일(지옥기형↔숲의 사냥꾼) · OUTER 렌더수단 선택(P2) · runtime-only 14보스 로어 부여.

## 미완 (P1 이후)
- CH2~7 에리어 blockout(35 중 CH1-1만 완결) · 위험타일 런타임 · 늪 전이타일/전경occluder/OUTER렌더 · hell1~6 per-boss 문서 · 미니맵 보스/게이트 마커.

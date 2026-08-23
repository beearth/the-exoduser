# WORLD STRUCTURE SSOT — EXODUSER: HELL LORD

> **역할**: 게임 세계의 공간적 최상위 진실. 7지옥·35스테이지·수직 상승 구조·로딩 경계·거대보스와 세계의 관계.
> **상태**: 2026-08-23 초판. 코드 변경 없음(기획 전용). 조사 근거는 실측 라인번호 병기.
> **선행 SSOT**: 이 문서는 기존 `맵유형_확장기획.md`(맵타입/에리어 배정)·`맵제작_SSOT.md`(이미지 제작)를 **대체하지 않고 상위 세계관 계층을 추가**한다. 충돌 시 §11 CONFLICT/DECISION LOG 우선.

---

## 0. 진실 공급원 우선순위 (기존 docs가 선언한 것 그대로)

`맵유형_확장기획.md §1.4` 기준:
1. 본 계열 문서의 1-1 동형 규칙 + 컨셉 배정표
2. `FIXED_MAPS[0]` 골격 (`maps_data.js:6–55`)
3. `maps_data.js`
4. game.html·에디터 `STAGES`

이 WORLD_STRUCTURE_SSOT는 위 1번의 "세계 배치/진행 방향" 층만 담당한다. 수치(크기/타입)는 여전히 `맵유형_확장기획.md`가 SSOT.

---

## 1. 세계의 공간적 개념

EXODUSER는 **지구형 평면 오픈월드가 아니다.** 세계는 **수직으로 쌓인 거대한 지옥층**이며, 각 층의 넓은 오픈 전투지역들을 연결로가 잇는다.

```
        [탈출 — 지상]        ← 최상층 (목표)
            ▲
        7. 지옥성            ← 최상부 지옥층 (최종·최고난이도)
            ▲
        6. 사도의 마굴
            ▲
        5. 지옥의 군단
            ▲
        4. 고통의 화염지대    ← 최장(7에리어)
            ▲
        3. 얼음굴
            ▲
        2. 벌레굴
            ▲
        1. 썩은 숲            ← 최하층 (시작 지점)
```

- 플레이어는 **최하층(썩은 숲)에서 시작**하여 지옥의 길을 돌파하며 **상층으로 상승**, 최상부(지옥성)를 넘어 **탈출**한다.
- 이는 기존 선형 스테이지 순서(썩은숲→…→지옥성)를 **수직 축으로 재해석**한 것이다. 순서 반전 없음.

---

## 2. S자 상승 개념

전체 진행은 멀리서 보면 느슨한 **S자 상승 구조**를 가진다. 단, **플레이어가 실제로 걷는 길 자체를 가느다란 S자 복도로 만들면 안 된다** (→ `LEVEL_DESIGN_RULES_SSOT.md` RULE 1).

- S자 = 층/스테이지들의 **거시 배치 곡선** (미니맵/월드맵 상의 흐름).
- 미시 = 각 스테이지는 넓은 전투 분지 + 좁은 연결로의 리듬 (CH1-1의 지그재그 x=100→서88→동118→서92가 이미 이 원칙의 축소판).

---

## 3. 7지옥 canonical 순서 (LOCKED — 기존 확정)

| 장 | 이름 | 코드 | 원소 | 에리어수 | si범위 | 장보스(서사) |
|---|---|---|---|---|---|---|
| 1 | 썩은 숲 | ROTTEN_FOREST | 독/물리 | 4 | 0–3 | 숲의 기생수 |
| 2 | 벌레굴 | WORM_NEST | 물리/독 | 6 | 4–9 | 여왕 구더기 |
| 3 | 얼음굴 | FROZEN_CAVERN | 빙결 | 4 | 10–13 | 얼음 속 봉인 괴물 |
| 4 | 고통의 화염지대 | FLAME_OF_AGONY | 화염 | 7 | 14–20 | 화염 감옥지기 |
| 5 | 지옥의 군단 | HELL_LEGION | 물리/암흑 | 5 | 21–25 | 군단 지휘관 |
| 6 | 사도의 마굴 | APOSTLE_LAIR | 암흑/물리 | 6 | 26–31 | 대사도 |
| 7 | 지옥성 | HELL_CASTLE | 전원소 | 3 | 32–34 | 지옥 군주 |

- 합계 **35 에리어** (4+6+4+7+5+6+3) + 7 보스방 = 42 맵 (`MASTER_BIBLE §4`).
- 코드 근거: `CHAPTER_STAGES` (`game.html:13684`), `SI_TO_HELL`/`SI_TO_FLOOR` (`game.html:13703–13709`).
- **si0 보스 주의**: 코드 아레나 보스(`HELL_BOSSES[0][0]`)는 **흑요염 파괴자**, 서사상 장보스(기생수)는 si3. → §11 CONFLICT-3.

---

## 4. 35스테이지 구조 & 크기 (LOCKED — 200×200)

- **전 35 에리어 = `type:'field'`, 200×200 타일, T=40 → 8000×8000px.** (`맵유형_확장기획.md §2`, `맵제작_SSOT.md §2`)
- 시작 6시(cx100,cy≈190), 보스게이트 12시(cx100,cy≈18). `tileRLE [1,40000]` = 전바닥.
- 특수 던전(예약, `ready:false`, 여전히 field): si11 미끄러운 얼음길 / si16 화산 심장 / si33 지옥 탑 (`_DUNGEON_SPEC`, `game.html:13715`).
- 보스 아레나(별도 맵): `genBossArena` 128×108, 중심(64,54) (`game.html:25059`).
- **바이블(v3/v2_2)의 250~400 가변 크기·vert/horiz/grid 타입은 "구 목표"로 폐기됨** → §11 CONFLICT-1.

---

## 5. 오픈월드 / 세미 오픈월드 정의 (이 프로젝트 한정)

| 용어 | 이 프로젝트에서의 정의 |
|---|---|
| **세미 오픈월드** | 200×200(8000px) 단위의 **넓은 오픈 스테이지**를, 층 경계 로딩으로 연결한 상승형 구조. 스테이지 **내부는 seamless 자유 탐험**, 층/스테이지 **사이는 로딩 경계**. |
| **오픈 전투지역** | 한 스테이지 내부의 넓은 분지(예: CH1-1 CENTRAL r1080px). 200×200 안에서 이미 성립. |
| **진짜 seamless 대형 존(>200×200)** | 현행 docs가 **명시적으로 거부**(`맵디자인_벤치마크.md §4`, QA Option C=OPEN). **미확정** → §13 UD-MAP-01. |

**핵심**: 이번 세계 구조는 기존 200×200 스테이지 락과 **호환**된다. "세미 오픈월드"는 200×200 스테이지를 수직 연결한 것이지, 200×200을 깨는 것이 아니다.

---

## 6. 지옥층 연결 방식

- 각 지옥층 = 여러 에리어(스테이지)의 수직 체인. 층 내 진행 = 스테이지 전환(로딩), 층 간 진행 = 지옥 전환(로딩).
- 현재 코드의 진행 트리거(`checkRooms`, `game.html:35606`): 보스 처치 80%→게이트 개방→출구 밟기→보스 아레나→처치→`stageCleared`→`nextStage`(`53750`).
- 세미 오픈월드에서는 이 "출구=상승 통로" 은유를 유지하되, 좁은 연결로 구간으로 시각화(→ §9 관문).

---

## 7. 로딩 경계 (LOCKED 방향)

로딩은 **자연스러운 세계 경계에서만**:
- 다음 대형 맵 / 다음 스테이지 / 다음 지옥층.
- 같은 스테이지(200×200) 내부는 **로딩 없음** (스트리밍이 청크 단위로 무중단 처리 — `_streamChunks`, `game.html:20278+`).
- 관문 은유: 동굴 / 성문 / 거대 뿌리 / 지하 통로 / 승강 구조 / 봉인문 / 절벽 통로 / 상층문.
- 현재 로드 커튼: `#stageTransition` DOM(`game.html:2869`), `showStageTransition()`(`53641`). 런타임 상세는 `MAP_RUNTIME_ARCHITECTURE.md §10`.

---

## 8. 스테이지 / 챕터 / 월드 관계

```
WORLD (지옥 전체, 수직 S자 상승)
 └ HELL LAYER ×7 (지옥층, SI_TO_HELL)
    └ STAGE/AREA ×N (에리어, 200×200 field, SI_TO_FLOOR로 층내 순번)
       └ ZONE (스테이지 내부 구역: START/COMBAT/SIDE/EVENT/MINIBOSS/BOSS/GATE — 설계 어휘, 코드 시스템 아직 없음)
          └ PLAY / RIM / OUTER (공간 3레이어 — 제안, LEVEL_DESIGN_RULES_SSOT.md §5)
    └ BOSS ARENA ×1 (장보스, 별도 128×108 맵, genBossArena)
```

- ZONE 분할 코드(`fm.zones`)는 존재하나 **미사용**(`맵유형_확장기획.md §1.3`). → ZONE 시스템은 `MAP_RUNTIME_ARCHITECTURE.md`에서 최소 확장안으로 다룸.

---

## 9. 거대보스와 세계의 관계

- 각 지옥층은 그 스케일을 대표하는 **거대 보스**를 가질 수 있다(융합 그로테스크, → `LEVEL_DESIGN_RULES_SSOT.md §8`, 보스 상세는 `8.1보스디자인바이블/`).
- 세계 스케일 관점에서 거대 보스는 **두 가지 존재 상태**를 가질 수 있다(제안):
  1. **배경 표현(background representation)**: 탐험 중 멀리 실루엣/그림자/신체 일부/소리로만 존재 → 스케일·존재감 확보, 성능 무부담.
  2. **실 엔티티(real boss)**: 보스 아레나 진입 시 `genBossArena` + `_enterBossArena`(`game.html:25111`)로 스폰.
- 현재 코드: 보스는 **오직 실 엔티티**로만 존재(별도 128×108 아레나). 배경 표현은 **미설계** → §13 UD-MAP-04, 구현안은 `MAP_IMPLEMENTATION_ROADMAP.md PHASE 7`.

---

## 10. 미니맵과 세계 (요약, 상세는 RUNTIME 문서)

- 미니맵(`drawMM`, `game.html:51400`)은 **`G.map` 타일 + `G.spawnHoles` + `ens` + 플레이어**만 그린다.
- **보스/이벤트/게이트/존 마커는 없음** → 세계 구조 가독성 갭. `MAP_RUNTIME_ARCHITECTURE.md §8`, `MAP_QA_GATES.md Navigation` 참조.

---

## 11. CONFLICT / 기존 결정 충돌 (임의 변경 금지, 기록만)

```
CONFLICT-1  맵 크기·타입
- 문서 A: EXODUSER_MAP_BIBLE_v3 / MASTER_BIBLE — 에리어별 250~400 가변, vert/horiz/grid
- 문서 B: 맵유형_확장기획.md §2 / 맵제작_SSOT.md §2 — 전 35 = field 200×200 고정, 가변타입 폐기
- 현재 코드: STAGES mw:200,mh:200 (game.html:23896) → 200×200
- 추천 canonical: 문서 B (200×200 field). 바이블 표는 미갱신 잔재.
- 사용자 결정: 불필요(문서 내 이미 해소). 단 바이블 표 stale 경고.

CONFLICT-2  CH1 크기 (구 바이블 내부 불일치)
- MAP_BIBLE v3: 1-1~1-3 200×200, 1-4 250×250
- MASTER_BIBLE §4.3: 버섯군락 350×350
- 추천: 둘 다 200×200에 의해 폐기. 바이블 유지보수 안 됨의 증거.

CONFLICT-3  si0 보스 정체성
- 서사(바이블): 1장 보스=숲의 기생수(1-4 등장)
- 코드(BOSS_BATTLE_SETTINGS §6): HELL_BOSSES[0][0]=흑요염 파괴자(si0 아레나, _isLargeBoss)
- 추천: 스코프 분리 — si0~3 각자 아레나 보스, 기생수=1장 서사 피날레.
- 사용자 결정 필요: 맵 SSOT가 코드 HELL_BOSSES(추천) vs 바이블 서사명 중 무엇 참조?

CONFLICT-4  보스 총수: 헤더 "20마리" vs 실제 열거 19. 추천 19(오타).

CONFLICT-5  CH1 보스 원소: "1-1 보스만 화염"(확장기획 §4.2) — 흑요염과 정합, 바이블 독-forest와 상충. CONFLICT-3 뿌리 동일.

CONFLICT-6  v2 PROD 이미지 사용(미해소 결정)
- QA_REPORT_INGAME §8: NEEDS_REVISION — "한 화면 ≈ 맵 전체". 3옵션(A 한화면아레나/B 오픈필드/C 중간) 오픈.
- 사용자 결정 필요: v2 룩이 어떤 월드 크기에 매핑되는가. → §13 UD-MAP-01과 연동.
```

---

## 12. 확정사항 (LOCKED / EXISTING)

- 7지옥 canonical 순서·이름·에리어수 (35) — EXISTING LOCKED.
- 전 35 에리어 200×200 field, T=40 — EXISTING LOCKED.
- 수직 최하층(썩은숲)→최상층(지옥성)→탈출 상승 구조 — 이번 세션 USER LOCKED (기존 선형순서 재해석, 무충돌).
- 로딩 경계 = 스테이지/층 전환에서만, 스테이지 내부 무로딩 — LOCKED 방향(기존 벤치마크 D4와 정합).
- CH1-1 존 배치 DESIGN LOCK 보존 — `CH1_VERTICAL_SLICE.md` 참조.

## 12b. 미확정사항 (PROPOSED / NEEDS_USER)

- PLAY/RIM/OUTER 3레이어 시스템 — PROPOSED (기존 PLAY vs ENVIRONMENT 2분할의 확장).
- ZONE 타입 시스템(코드) — PROPOSED (`fm.zones` 미사용 상태).
- 거대보스 배경 표현 — PROPOSED.
- 스테이지 200×200 초과 확대 — NEEDS_USER (docs가 거부, §13 UD-MAP-01).
- CH2~7 에리어별 레이아웃 — 미존재(얼굴만). NEEDS 후속 설계.

---

## 13. USER DECISION — 해소 기록 (2026-08-23 MAP-P0.5)

```
UD-MAP-01  스테이지 크기 → [RESOLVED: 200×200 LOCK]
  결정: 200×200 유지. 단 runtime field 크기이며 세계 크기 아님.
        PLAY/RIM/OUTER로 더 큰 세계처럼 연출(대형 존 확대 안 함).
  근거: 유저 확정(MAP-P0.5 UD1). docs 락 정합. 세미오픈=스테이지 수직연결.

UD-MAP-02  보스 canonical → [RESOLVED: Lore↔Runtime 분리 매핑]
  결정: 바이블 서사=design canonical, HELL_BOSSES=runtime canonical.
        어느 쪽도 삭제/덮어쓰지 않고 매핑 테이블로 연결.
  산출: BOSS_CANONICAL_MAPPING.md (35 si 전량 매핑).
```

### 잔여 UD (P1 비차단, 후속) — `MAP_DESIGN_CLOSURE.md` 최종감사 참조
- UD-A si2 명칭(지옥기형↔숲의 사냥꾼) · UD-C OUTER 렌더수단(P2) · UD-D runtime-only 14보스 로어 부여.

### MAP-P0.5 확장 문서 (이 세계구조 SSOT의 하위)
- `STAGE_SPATIAL_GRAMMAR.md`(A) · `MAP_GRAMMAR_VARIANTS.md`(B) · `VERTICAL_ASCENT_LANGUAGE.md`(C)
- `GIANT_BOSS_PRESENCE_LADDER.md`(D) · `OUTER_DEPTH_MODEL.md`(E) · `CH1_1_BLOCKOUT_MASTER.md`(F)
- `BOSS_CANONICAL_MAPPING.md` · `MAP_DESIGN_CLOSURE.md`(G/H + READINESS=PASS)

---

## 14. CODE CHANGE
**NONE.** 이 문서는 조사·기획 전용.

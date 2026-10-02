# BOSS 초기 인수 결과 — 보스전 설계·생산 대응 1판

작업 ID `BOSS-INITIAL-SSOT-SOURCE-20261002` · 실행 Mac Claude Code Terminal 20(BOSS/Claude) · 읽기 전용 인수
cwd `/Users/fordeargamers/Projects/exoduser-migration-20261001` · 작업창 HEAD `4cd0cb4906daee2b7953af7284f9ecc3ef96dd49`
(TASK 기재 `8fd5b7ec…`에서 착수 전 이미 `4cd0cb49`로 전진. 본 작업이 바꾸지 않았고 어느 세션이 올렸는지는 UNKNOWN. **영수증 정정 패스(2026-10-02T05:11Z)** 시점엔 HEAD `f1401551`·game.html SHA도 전진 — auto-sync/타 세션 변경으로 분류, 되돌리지 않음.)

> **2026-10-02 영수증 정정(continuous/BOSS 피드백):** ① §0 소유 밖 쓰기 1건을 evidence.json(writesOutsideOwned=1)과 일치시킴. ② `BOSS_CANONICAL_MAPPING.md` LOCKED(설계 19 ⊂ 런타임 35)에 따라 §1·§5의 “19보스→35 치환” 제안을 **취소**하고 별도 구현표로 수정. 새 검사 반복 없음. 삭제/cleanup/이동/복구/오경로 추가쓰기/Git/production/공유docs 금지 준수.

> **보고 범위 주의:** 코드·docs 정적 읽기만 수행했다. 런타임 실행·시각 PASS·테스트 재실행·FPS·팀 동시가동은 수행/추정하지 않았다. 생산 수치와 보호 전투 설계(si0/si3 다크드루이드, cageTrap 금지·idx41 예약, 무지개탄 blackBean Q전용 패링, 어택티켓 금지, `2_3` 문서)는 변경하지 않았다. 우선 제안 1건은 **코드 논리 검토**이며 실제 전투로 재현하지 않았다.

---

## 0. 먼저 — 작업 중 오류 경로 발생(총괄 보고, 삭제·복구 안 함)

본 작업 중 실수로 **잘못된 날짜 프로젝트 경로**에 placeholder 파일 1개를 생성했다. TASK의 “날짜를 바꾸거나 `exoduser-migration-20261002` 프로젝트를 만들지 않는다” 규칙 위반이다.

- **정확한 경로:** `/Users/fordeargamers/Projects/exoduser-migration-20261002/tools/team-followup-20261002/new-four/BOSS/result.md`
- **내용·크기:** `placeholder` (정확히 11바이트, 개행 없음)
- **생성 시각:** `2026-10-02T04:40:41Z` (= 13:40:41 KST, filesystem birth=mtime 동일, `stat`로 확인)
- **성격:** 실제 checkout(`-20261001`) **밖 형제 디렉터리**(잘못된 날짜 `-20261002`). git 미추적이라 `-20261001`의 `git status`·Changes 개수에 **미표시** → evidence.json의 `changesCount`에는 안 잡히나 **소유 밖 쓰기 1건은 사실**이다. evidence.json `safetyContract.writesOutsideOwned`를 0→**1**로 정정하고 `outsideWriteDetail`에 동일 기록.
- **원인:** 정식 result.md 작성 직전 Write 경로 날짜 오타(`20261001`→`20261002`).
- **조치:** “파일/폴더 삭제 금지”·“오류 경로 발견 시 삭제·복구하지 말고 총괄 보고” 규칙에 따라 **삭제/cleanup/이동/복구/추가쓰기 안 함.** 정식 산출물은 올바른 `…-20261001/…/BOSS/result.md`(이 파일)에 작성.
- **요청:** 정리가 필요하면 총괄이 소유권·안전 확인 후 처리 바람. 본 세션은 손대지 않는다.

---

## 1. 설계 숫자 vs 현행 구현 — 핵심 수치 재정렬

| 항목 | 설계/인덱스 표기 | 현행 코드 실제값 | 근거 |
|---|---|---|---|
| 보스 기술 수 | **49종** (`BOSS_BATTLE_SETTINGS.md` §6 191/204/206행, `EXODUSER_MASTER_BIBLE` 857/872행, CLAUDE/AGENTS 인덱스 “BOSS_MOVES 49종”) | **정의 59종** (`BOSS_MOVES` 배열 59항목) / **사용가능 58종** / **예약·무력화 1종(cageTrap)** | game.html 9497–9557(59항목), game-easy-test 8948–(59항목) |
| 보스 — 설계 canonical | **19종**(Lore Identity: 챕터당 장보스1+미니보스, `BOSS_CANONICAL_MAPPING.md` §0 LOCKED; CLAUDE/AGENTS 인덱스 “19보스”) | 그대로 유지(설계 정체성) | `BOSS_CANONICAL_MAPPING.md` 18행 |
| 보스 — 런타임 canonical | **35슬롯**(Runtime ID: si마다 고유 아레나 보스; 서사 **19 ⊂ 런타임 35**, 런타임이 로어無 14종+first-boss 추가) | **스테이지 슬롯 35개(si 0–34)** / **현행 표시명 34개**(다크드루이드 si0·si3 중복) / 챕터 분배 **4·6·4·7·5·6·3** | `HELL_BOSSES` game.html 15868–15876 / `_BOSS_MOVESET`[0..34] / `BOSS_CANONICAL_MAPPING.md` 19–20행 |
| 서사 보스 수(별개) | **35보스=35사연**(`WORLD_CORE.md` 133/151행, 5×7 균등) | — | WORLD_CORE §35보스 |
| 무브 idx 범위 | — | idx 0–60, **idx 30·59 결번**, cageTrap=idx41 | 9498–9556 idx 나열 |

- **설계 19종 ↔ 런타임 35슬롯은 별도 정체성(LOCKED)**이며 서로 치환·삭제 대상이 아니다(`BOSS_CANONICAL_MAPPING.md` §0: “서사 19 ⊂ 런타임 35, 매핑만 유지”). 아래 §5에서 “19→35 치환” 제안은 **취소**하고 별도 구현표로 기록한다.
- 현행 표시명은 **34개**(런타임 canonical 35슬롯 중 다크드루이드가 si0·si3 2슬롯 점유 → 고유 표시명 34). `BOSS_CANONICAL_MAPPING` 본문 테이블은 2026-08-23 기준이라 si0을 흑요염 파괴자로 적었으나 머리말 2026-09-06 주석이 si0=다크드루이드로 정정(문서 자체는 공유docs라 본 작업 미수정).
- “49”는 설계/§6 표기 수치이며 **런타임 실제 59 정의**(전원 실행 `case` 보유, §3). 단순 이름 검색 성공을 구현으로 계산하지 않았다. 구분축: **설계 canonical(보스19·무브49) / 런타임 구현(슬롯35·표시명34·무브 정의59·사용58·예약1 cageTrap)**.

---

## 2. 대응표 1판 — 19/49 설계 범위 ↔ 현행 양쪽 HTML

범례: 구현=실행 case 존재+무브셋 도달 / 예약=정의·case 있으나 전 보스 무력화 / 결함=도달경로 버그 / UNKNOWN=정적 미확정

### 2-A. 보스(스테이지) 대응 — `HELL_BOSSES` × `_BOSS_MOVESET`

| 설계 id(si) | 한글명 | chapter·si | SSOT 파일·행 | 생산 파일·행·식별자 | 정의·배정·도달 | 구현/예약/금지/미구현 | 현재 수치·조건 | 차이 | 검수 Gate |
|---|---|---|---|---|---|---|---|---|---|
| si0 | 다크드루이드 | 1장·si0 | CH1_1_DRUID_BOSS_ASSIGNMENT(현행) / BOSS_SETTINGS §6(구:흑요염) | game.html HELL_BOSSES[0][0] 15869, `_BOSS_MOVESET[0]=new Set(_BOSS_MOVESET[3])` 9644 | 배정·도달 O, 무브 23종(cageTrap 제외) | 구현(보호) | use2D, dw9.3/dh14.1, r44, EL.P, 데모 si3과 전용분기 공유 | **§6 테이블은 흑요염·18종(no summon)로 stale** | docs §6 현행화(§5-②) |
| si1 | 독버섯 거인 | 1장·si1 | BOSS_SETTINGS §6 | HELL_BOSSES[0][1] 15869, `_BOSS_MOVESET[1]` 9640 | 배정·도달 O | 구현 | +summon,mine, (cageTrap loop 제거) | 일치 | — |
| si2 | 지옥기형 | 1장·si2 | BOSS_SETTINGS §6(“사냥꾼 +cageTrap”) | HELL_BOSSES[0][2] 15869, `_BOSS_MOVESET[2]` 9641 | 배정·도달 O | 구현 | 10종(jump/charge/slashCombo/sweep/tailSwipe/spin/slam/beanStorm/fan/multiDash) | **§6 “사냥꾼+cageTrap” stale**(현행=지옥기형, cageTrap 전면금지) | docs §6 현행화 |
| si3 | 다크드루이드(1-4) | 1장·si3 | CH1_1_DRUID / DARK_DRUID_FINALE_* | HELL_BOSSES[0][3] 15869, `_BOSS_MOVESET[3]` 9642-9643 | 배정·도달 O | 구현(보호) | 24종-cageTrap=23종, +burrowStrike; 데모/bic 마지막은 피날레 예외 | 일치(피날레 v0.4 별도계약) | 피날레 Gate(§4 참고) |
| si4–9 | 벌레 수호자~여왕 구더기(6) | 2장 | BOSS_SETTINGS §6 | HELL_BOSSES[1] 15870, `_ch2Base`+점증 9646-9652 | 배정·도달 O | 구현 | ch2Base 28종 → +seekerMines/fanWave/wallPush/shieldBash2/spiralBullet 점증 | 챕터당 6보스(설계 균등5와 불일치) | docs 분배표 보강 |
| si10–13 | 얼음 망령~봉인 괴물(4) | 3장 | BOSS_SETTINGS §6 | HELL_BOSSES[2] 15871, `_ch3Base`+점증 9654-9658 | 배정·도달 O | 구현 | +laser/teleStrike/delaySlash/perilThrust/spiralBullet/gravityWell | 4보스 | docs 분배표 보강 |
| si14–20 | 화염 악마~화염 감옥지기(7) | 4장 | BOSS_SETTINGS §6 | HELL_BOSSES[3] 15872, `_ch4Base`+점증 9660-9667 | 배정·도달 O | 구현(단, burstCounter §3-A 결함) | +swordWave/pillars/burstCounter/wallPush/gravityWell/chainLightning | 7보스; **burstCounter 도달경로 결함** | §4 우선 Gate |
| si21–25 | 전쟁의 잔해~군단 지휘관(5) | 5장 | BOSS_SETTINGS §6 | HELL_BOSSES[4] 15873, `_ch5Base`+점증 9669-9674 | 배정·도달 O | 구현(burstCounter 결함 포함) | +mirrorGuard/rewindStrike/orbWeave/mirrorClone | 5보스 | §4 |
| si26–31 | 살점의 수호자~대사도(6) | 6장 | BOSS_SETTINGS §6 | HELL_BOSSES[5] 15874, `_ch6Base`+itemSteal 9676-9682 | 배정·도달 O | 구현(burstCounter 결함 포함) | si28–31 +itemSteal | 6보스 | §4 |
| si32–34 | 검은 성의 수호자/Killu/지옥 군주(3) | 7장 | BOSS_SETTINGS §6(“null 전체 49종”) | HELL_BOSSES[6] 15875, 미지정 si → `new Set(BOSS_MOVES.map)` 9685-9688 | 배정·도달 O | 구현(cageTrap만 delete) | 전체 59 정의 - cageTrap = **58 해금**(49 아님) | **§6 “전체 49종 해금” stale → 58** | docs §6 수치 정정 |
| — | 네메시아(최종) | 서사 7장 | WORLD_CORE 197/303행 | **HELL_BOSSES 미등재** | 미배정 | **미구현/UNKNOWN** | si34=“지옥 군주”, Killu=호위로 추정 | 서사 최종보스명과 코드명 불일치 | 내러티브/보스 공동 결정 필요 |

### 2-B. 무브 49→59 대응 요약 (`BOSS_MOVES` 9498–9556, 실행 switch 36358–)

- **정의 59종, 전원 실행 case 존재**(36000–37100 구간 case 라벨 59개 = 59 id 집합과 1:1). 양쪽 HTML 동일.
- **cageTrap(idx41)**: case 존재하나 전 보스(si0~34) `delete` + 강제 실행도 생성·피해·소리 없이 recover/25f 종료 → **예약(무력화)**. 플레이어 boneWall/boneStorm·공용 이미지/음향은 보존. idx41=인덱스 호환 예약.
- **burrowStrike(idx58)**: 다크드루이드 전용(비BOSS_MOVES의 `druidVolley` 보조 포함), 구현 O.
- **burstCounter(idx60)**: 정의·case·무브셋 배정 모두 O이나 **쿨다운 도달경로 결함**(§3-A). 논리상 보스당 1회만 발동 후 재선택 불가 가설.
- 설계 “49종 목록은 `9적ai패턴디자인/` 참조”(§6 206행) — 해당 폴더(`9_적AI패턴디자인.md`, `exoduser-ai-first-pipeline-v3.1.md` 등)에는 BOSS_MOVES 49/59 상세 테이블이 **없음**. 49종 원출처 테이블 자체가 docs에 부재 → 보강 대상(UNKNOWN 출처).

---

## 3. 근거 확보된 미구현/연결누락 후보

### 3-A. (우선) burstCounter 쿨다운이 영구 잠김 — idx60가 감소 루프 범위 밖

**정적 코드 사실(game.html / game-easy-test.html 공통):**
- `BOSS_MOVES` 길이 = **59**(idx 0–58이 아니라 idx **0·…·58·60**, 30·59 결번). `burstCounter` 는 `idx:60` (9529 / easy 8980).
- `_moveCDs` 할당: `ib?new Array(BOSS_MOVES.length).fill(0)` = **길이 59, 유효 index 0–58** (29938 / easy 28758).
- 쿨다운 **쓰기·읽기는 `mv.idx`** 기준: 읽기 `_moveCDs[mv.idx]>0 → return 0` (36310 / 35114), 쓰기 `_moveCDs[bestMv.idx]=…` (37083 / 35886), 콤보후속 `_moveCDs[nmv.idx]<=0 … =…` (37047/37049 / 35850/35852).
- **감소·리셋은 위치 index i**: `for(i<BOSS_MOVES.length) _moveCDs[i]-=sp` (37031 / 35834), 페이즈 전환 리셋 동일 범위 (36913 / 35716). 즉 **index 0–58만** 매 프레임 감소/리셋.

**논리 귀결(미실행 검토):** burstCounter의 CD는 `_moveCDs[60]`에 기록되지만 감소 루프(i<59)는 60을 건드리지 않는다 → 한 번 사용 후 `_moveCDs[60]`이 양수로 **영구 고정** → `_bossScore`가 항상 0 반환 + 콤보 후속 조건도 항상 거짓 → **burstCounter는 보스 생존 중 최초 1회만 발동, 이후 재선택 불가**. 페이즈 리셋도 60을 비우지 않아 광폭화에서도 복구 안 됨.
(idx 30·59는 미사용 슬롯이라 무해, 그 외 모든 무브는 idx≤58이라 정상 감소 → **결함은 burstCounter 단일.**)

**영향 범위:** burstCounter 배정 보스 = si17–20(4장), si21–25(5장), si26–31(6장), si32–34(7장) → 중후반 다수 보스의 근접 반격 패턴이 사실상 1회성.

**부수 관찰:** 디버그 CD 표시(58696 / 57033)는 위치 index로 라벨링해 실제 idx 슬롯과 어긋남(디버그 전용, 전투 무영향).

### 3-B. 기타(낮은 우선, 후속)
- WORLD_CORE 최종보스 **네메시아**가 `HELL_BOSSES`에 없음 → 서사-구현 명칭/배정 공백 (내러티브팀 공동).
- `9적ai패턴디자인/`에 **49/59 무브 마스터 테이블 부재** → 49 원출처 미확인(UNKNOWN), docs 보강 필요.

---

## 4. 우선 1건 — 입력조건→예상흐름→부족 근거→담당/Gate (논리 검토, 미실행)

**대상:** §3-A burstCounter(idx60) 쿨다운 영구 잠김.

- **입력 조건(재현 가설):** `?bosstest=17`(또는 si21~34 임의 보스) 진입 → 플레이어가 근접(range [0,150]) 유지 → burstCounter 1회 발동 유도 → 이후 동일 조건에서 burstCounter 재발동 여부 관찰.
- **예상 흐름:** 최초 1회 발동 후 `_moveCDs[60]` 양수 고정 → `_bossScore` 0 → 재선택/콤보후속 불가 → 전투 종료까지 burstCounter 미등장(디버그 CD 문자열에도 60슬롯 미표시).
- **부족한 source 근거:** (1) 실제 런타임 발동 로그(본 작업 비실행), (2) 설계 의도상 burstCounter 쿨다운이 **1회성인지 반복형인지** 명시 문서 부재 — `cd:160` 정의는 반복 재사용을 전제하는 수치로 읽히나 확정 문서 없음, (3) `BOSS_MOVES` idx가 **비연속(60)** 이 된 변경 이력·의도 기록 부재.
- **필요 담당·Gate:**
  - **ENEMY**(공용 AI `_bossScore`/`_bossNextPattern`/`_moveCDs` 소유) — 수정 주체. 본 BOSS 세션은 제안·인계만, 코드 변경 안 함.
  - **QA** — `?bosstest` 런타임 재현 및 수정 전/후 회귀(동일 빌드·조건). `test/bossRecRecovery.test.js`·`bossTelegraphReadability.test.js` 인접에 CD 재사용 회귀 추가 검토.
  - **검수 Gate:** ① 런타임에서 burstCounter 2회 이상 발동 확인(수정 후), ② 다른 58무브 CD 회귀 무변, ③ 보호 수치(피해/전조/사거리/쿨다운값) 불변, ④ game.html+game-easy-test.html 양쪽 동기, ⑤ docs 동기(§5).
  - **주의:** 수정안(idx→위치 매핑 통일 또는 `_moveCDs` 길이를 `max(idx)+1`로) 자체는 **전투 수치 변경이 아니라 도달경로 복구**지만, ENEMY/총괄 승인 전 구현 금지(본 인수는 설계·근거 제시까지).

---

## 5. 정확한 docs 동기화 제안 (미실행 — 승인 후 반영)

본 작업은 docs를 **수정하지 않았다**(읽기 전용 인수). 아래는 코드 대조로 확인된 불일치의 **정정 문안 제안**이다.

1. `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md` §6 (이 세 문구는 **런타임 동작을 서술**하므로 런타임 실제값으로만 정정 — 설계 canonical “무브 49종” 라벨 자체는 유지)
   - 191행 “`null` = 전체 49종 사용” → **“전체 58종 사용(정의 59 − cageTrap)”**, 204행 “전체 49종 해금” → **“58종 해금”**, 206행 “전체 기술 49종 목록” → **“전체 기술 정의 59종(사용 58)”** + 원출처 테이블 보강.
   - §6 무브셋 테이블 si0 행 “흑요염 파괴자 … 기본 18종(no summon)” → **현행 다크드루이드·23종**(CH1_1_DRUID 기준), si2 행 “사냥꾼 +cageTrap” → **지옥기형, cageTrap 전면금지**로 정정.
2. ~~CLAUDE.md / AGENTS.md 인덱스 “19보스 + 49종” → “스테이지 35(고유 34) + 정의 59/사용 58”로 치환~~ → **제안 취소(2026-10-02 총괄 피드백).** `BOSS_CANONICAL_MAPPING.md` §0 LOCKED에 따라 **“19보스”는 설계(Lore) canonical이므로 보존**하고 35로 치환하지 않는다. 대신 **별도 구현표를 병기**한다:

   | 축 | 값 | 출처/성격 |
   |---|---|---|
   | 설계 canonical 보스 | 19종 | Lore Identity(LOCKED, 유지) |
   | 설계 canonical 무브 | 49종 | 바이블/§6 표기(유지) |
   | 런타임 슬롯 | 35(si 0–34) | HELL_BOSSES |
   | 런타임 표시명(현행) | 34 | 다크드루이드 si0·si3 중복 |
   | 런타임 무브 정의 | 59 | BOSS_MOVES 배열 |
   | 런타임 사용가능 무브 | 58 | 정의59 − cageTrap1 |
   | 예약/무력화 | 1(cageTrap idx41) | 전 보스 delete |

   인덱스 문구는 “19보스(설계)”를 지우지 말고 괄호로 런타임 구현표를 **추가 병기**하는 방식만 제안한다(치환 아님).
3. `docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md` 857/872행 “BOSS_MOVES 49종/49패턴” → **59 정의** 주석 보강.
4. `docs/9적ai패턴디자인/`에 **BOSS_MOVES 59종 마스터 테이블**(id/idx/tele/rec/range/phase/cd/tags/실행case/무브셋배정) 신설 — §6이 가리키는 “49종 목록” 실체 부재 해소.
5. 챕터별 보스 수 **4·6·4·7·5·6·3** 분배표를 BOSS_SETTINGS 또는 WORLD_CORE에 명기(서사 균등5 vs 코드 비균등 간극 기록).

> 수치·공식·보호 설계는 **문서 표기만** 현행 코드값에 맞추는 정정이며, 코드·전투값 변경이 아니다. 반영 시 커밋에 docs 포함.

---

## 6. 미실행·미확정 항목 (정직 표기)

- burstCounter 결함은 **코드 정적 논리**로만 확인. 런타임 발동/재현 미실행.
- 59무브 각각의 실제 전투 시각·판정·밸런스 PASS는 미검수(case 존재 확인까지).
- `druidVolley`(BOSS_MOVES 외 드루이드 보조, 16308/16335) 및 피날레 5종 패턴 내부 수치는 이번에 수치 감사까지 하지 않음.
- 맵 geometry/collision/카메라/전투 시각 QA는 TASK 지시대로 **미수행**(후속 시 `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` 전문 선행).
- “49” 원출처 테이블 부재는 UNKNOWN으로 남김(§3-B).
- §0 오류 경로(`…-20261002`)는 삭제·복구하지 않고 총괄 보고로 남김.
- **영수증 정정(2026-10-02)**: evidence.json `writesOutsideOwned` 0→1, `outsideWriteDetail`(경로·11바이트·`placeholder`·2026-10-02T04:40:41Z) 추가; §1·§5의 19→35 치환 제안 취소·별도 구현표로 수정. 설계 19 ⊂ 런타임 35 LOCKED 보존. 정정 패스 HEAD/game.html SHA 전진은 타 세션으로 분류·미복원.
- 완료 후 새 작업을 독자 생성하지 않고 다음 배정을 대기한다.

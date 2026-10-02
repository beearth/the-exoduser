# BOSS — 설계 정체성 ↔ 런타임 구현 별도 대응표 (치환 없음) 한 건

taskId `BOSS-CANONICAL-IMPLEMENTATION-HANDOFF-20261002` · 실행 Mac Claude Code (BOSS/Claude) · 읽기 전용 인수
cwd `/Users/fordeargamers/Projects/exoduser-migration-20261001` · 관측 2026-10-02T05:37Z (14:37 KST)
생산 기준 commit = **총괄 제공** `7e69495046323b3120578f67635c20feb48b2a4f` (카드 수명·NW.js 실패응답 반영분). **본 세션은 git 조회를 하지 않았고 HEAD를 독립 관측하지 않았다** — 위 commit을 내가 확인한 현재 HEAD로 표시하지 않는다. 파일 현재 상태는 아래 **비-git sha256**(§evidence)로만 확인.

> **원칙(LOCKED, BOSS_CANONICAL_MAPPING §0):** 설계 canonical(Lore) 19종과 런타임 canonical 35슬롯은 **별도 축**이다. 서사 19 ⊂ 런타임 35. **어느 숫자도 하나로 합치거나 치환하지 않는다.** 이번 산출은 두 축을 분리 기록 + 이름 어긋남 행만 좁게 대조한다. `productionApplied=false`. source 확인 ≠ 전투/runtime/visual PASS. 보호(si0/3 다크드루이드·`2_3`·Q전용 blackBean 패링·어택티켓 금지·cageTrap idx41 예약)는 유지. burstCounter idx60 CD 실행검증은 **ENEMY 기배정**이라 본 작업은 담당·의존성만 명시하고 실행·수정하지 않는다.

---

## A. 별도 축 canonical 대응표 (합치지 않음)

| 축 | 값 | 성격 | 출처(현재 행) |
|---|---|---|---|
| ① 설계 보스(Lore canonical) | **19종** | 바이블 서사 — 챕터당 장보스1+미니보스. 유지·보존 | `BOSS_CANONICAL_MAPPING.md:18` |
| ② 설계 무브 | **49종** | 바이블/§6 설계 라벨. 유지 | `BOSS_BATTLE_SETTINGS.md:191,204,206` / `EXODUSER_MASTER_BIBLE_v2_2 (2).md:857,872` |
| ③ 서사 보스 수(별개 축) | **35사연=35보스**(5×7 균등) | WORLD_CORE 세계관 축. 임의 변경 금지 | `WORLD_CORE.md:133,151` |
| ④ 런타임 슬롯 | **35**(si 0–34) | HELL_BOSSES 코드 동작. 서사 19 ⊂ 런타임 35 | `game.html:15868–15876` / easy `14985–` |
| ⑤ 런타임 표시명(현행) | **34 고유** | 다크드루이드가 si0·si3 2슬롯 → 고유명 34 | `game.html:15869` |
| ⑥ 런타임 챕터 분배 | **4·6·4·7·5·6·3**(비균등) | ③의 균등5와 별개 축(불일치 아님, 축 다름) | `game.html:15869–15875` |
| ⑦ 런타임 무브 정의 | **59** | BOSS_MOVES 배열 항목 수(양판 동일) | `game.html:9497–9557`(59) / easy `8948–`(59) |
| ⑧ 런타임 사용가능 무브 | **58** | ⑦ − cageTrap(전 보스 delete) | `game.html:9687` / easy `9138` (`_BOSS_MOVESET[si].delete('cageTrap')`) |
| ⑨ 예약·무력화 | **1** cageTrap(idx41) | 정의·case 존재하나 전 보스 생성·피해·소리 없이 recover/25f. idx 호환 예약 | `game.html:9529 부근 def`, `9643·9687 delete` |

- ②(49)와 ⑦⑧(59/58)은 **다른 축**(설계 라벨 vs 런타임 구현)이다. §6의 "49종" 문구는 런타임 동작 서술이므로 그 **문구만** 58/59로 주석 보강하고 설계 라벨 49 자체는 보존(§C).
- ⑤ 34는 §6의 15868 배열 현행 내용 기준. `BOSS_CANONICAL_MAPPING` 본문(2026-08-23)은 si0=흑요염 파괴자로 35 고유명이나, 2026-09-06 머리말이 si0=다크드루이드로 정정 → **현행 배열은 다크드루이드 중복으로 고유명 34**.

---

## B. 이름 어긋남 — 좁은 대조(LOCK표·docs vs 현행 런타임 이름)

현행 런타임(`HELL_BOSSES`) 기준으로, LOCK표/문서의 보스명이 어긋나는 행만 좁게 기록. 근거·시점·UNKNOWN 명시. **되돌림/수정 없음(문서 인계만).**

| si | 현행 런타임 이름(소스) | 어긋난 문서·행 | 기록된 이름 | 상태·근거 | 시점 | 판정 |
|---|---|---|---|---|---|---|
| si0 | **다크드루이드** (`game.html:15869`) | `BOSS_CANONICAL_MAPPING.md:37`(§2표) | 흑요염 파괴자 | 본문표 stale, 같은 문서 머리말`:8`이 다크드루이드로 정정 | 표 2026-08-23 / 머리말 2026-09-06 | 확정(머리말 우선), 본문표 미반영 |
| si0 | 다크드루이드 | `BOSS_BATTLE_SETTINGS.md:195`(§6표) | 흑요염 파괴자 / 기본 18종(no summon) | stale; 현행=다크드루이드·23종(`_BOSS_MOVESET[0]=[3]`사본). 머리말`:10` 정정 | 머리말 2026-09-06 | 확정, §6표 미반영 |
| si0 | 다크드루이드, `_isLargeBoss` **미할당**(CH1_1_DRUID: si0 할당 제거) | `BOSS_BATTLE_SETTINGS.md:508` | `e._isLargeBoss si===0(흑요염 파괴자)만 true` | 이름+플래그 **이중 stale** | 2026-09-06 이후 | 확정, 미반영 |
| si0 | 다크드루이드 | `맵유형_확장기획.md:56` | `HELL_BOSSES[0][0]=흑요염 파괴자` | stale, 머리말`:12` 정정 | 2026-09-06 | 확정, 본문 미반영 |
| si2 | **지옥기형** (`game.html:15869`) | `BOSS_BATTLE_SETTINGS.md:197`(§6표) | 사냥꾼 (+cageTrap) | 명칭 드리프트 + cageTrap 전면금지(현행) | CANONICAL`:39,78`이 이미 명시 | 확정, §6표 미반영 |
| si3 | **다크드루이드**(1-4) (`game.html:15869`) | `BOSS_CANONICAL_MAPPING.md:40` / `BOSS_BATTLE_SETTINGS.md:198` | 숲의 기생수 / 기생수 | si3도 다크드루이드로 승격(CH1_1_DRUID "1-4 드루이드 유지"). LOCK표·§6 stale | 2026-09-06 | 확정, 미반영 |
| si33/si34 | Killu / 지옥 군주 (`game.html:15875`) | `WORLD_CORE.md`(네메시아=최종 서사) | 네메시아(여신) | 런타임 최종=지옥 군주, 네메시아는 컷신/인트로 여신으로만 등장(HELL_BOSSES 부재) | — | **UNKNOWN**(최종보스 명칭 통일 미정, 내러티브 공동) |
| si4·5·8·10·12·14·15·17·19·21·23·26·27·28·32 | runtime-only 14종(점액 괴수 등) | 로어 엔트리 없음 | — | 런타임이 중간층 추가(서사 19 부재). 삭제 아님 | CANONICAL`:77` | 확정(로어 보강 후보, UNKNOWN 서사) |

**이미 동기된 문서(되돌리지 않음, 참고):** `ENEMY_AI_TEAM_MASTER.md:86` = `_BOSS_MOVESET[0]` 23종 정확 + "cageTrap 전 보스 금지" 반영됨. `CH1_1_BOSS_IMPACT_AUDIT_20260927.md:5` = si0 23종 추적 반영. 자산 카탈로그(`6사운드디자인.md:161`, `pixellab_*`)의 "흑요염 파괴자/숲의 사냥꾼"은 **구 자산 보존**(CH1_1_DRUID "구 자산 보존", `_BOSS_SFX[0]` 음성 유지) — 이름 미정정이 **정상**, 분리 유지한다.

---

## C. 정확한 문서 인계 문안 (설계 라벨 보존 + 현행 구현 주석 추가)

각 문서에 **설계 라벨은 지우지 말고**, 아래 현행 구현 주석을 **병기/보강**한다. 공유docs 동기화·생산 반영은 총괄이 순차 수행(본 작업 미적용, `productionApplied=false`).

| 문서·현재 행 | 보존할 설계 라벨 | 추가할 현행 구현 주석 | 수치 출처·행 | 설계/구현 | 확정/미확정 | 마이그레이션 |
|---|---|---|---|---|---|---|
| `BOSS_BATTLE_SETTINGS.md:191` | "`null`=전체 49종 사용"(설계 라벨 유지 가능) | "(런타임 동작: 정의 59 − cageTrap = **사용 58**)" 병기 | `game.html:9497–9557,9687` | 구현 | 확정 | 문구 주석 |
| `BOSS_BATTLE_SETTINGS.md:204` | "전체 49종 해금" | "런타임 58종 해금(cageTrap 예약 제외)" 병기 | 9686–9688 | 구현 | 확정 | 문구 주석 |
| `BOSS_BATTLE_SETTINGS.md:206` | "전체 기술 49종 목록" | "현행 정의 59종. `9적ai패턴디자인/`에 59종 마스터표 신설 필요(현재 부재)" | 9498–9556 | 구현 | 확정(목록 부재=미확정) | 신규 표 작성 |
| `BOSS_BATTLE_SETTINGS.md:195`(§6 si0행) | — (설계 흑요염은 §2 legacy로 이동) | "현행 si0=**다크드루이드**, 무브 **23종**(`_BOSS_MOVESET[0]=[3]`사본, cageTrap 제외). 흑요염은 구 배정" | `game.html:15869,9642–9644` | 구현 | 확정 | 표행 현행화 |
| `BOSS_BATTLE_SETTINGS.md:197`(§6 si2행) | 설계 "숲의 사냥꾼" 유지 | "런타임 표시명=**지옥기형**(구명 사냥꾼). cageTrap **전면금지**(+cageTrap 표기 삭제)" | `game.html:15869,9687` | 구현 | 확정 | 표행 현행화 |
| `BOSS_BATTLE_SETTINGS.md:198`(§6 si3행) | 설계 "기생수" 유지 | "현행 si3=**다크드루이드**(1-4), 데모/bic 마지막은 피날레 예외" | `game.html:15869` | 구현 | 확정 | 표행 현행화 |
| `BOSS_BATTLE_SETTINGS.md:508` | — | "현행 si0 `_isLargeBoss` **미할당**(CH1_1_DRUID use2D로 3D차단). 흑요염 명칭도 구 배정" | CH1_1_DRUID "3D/거대 플래그" | 구현 | 확정 | 행 현행화 |
| `BOSS_CANONICAL_MAPPING.md:37`(§2 si0행) | **LOCK 유지**(흑요염=런타임 추가 first-boss 역사) | "2026-09-06 현행 런타임명=다크드루이드"를 NOTE로 보강(삭제 금지) | 머리말`:8` | 둘 다 | 확정 | NOTE 추가(치환 아님) |
| `BOSS_CANONICAL_MAPPING.md:40`(§2 si3행) | **LOCK 유지**(숲의 기생수=장보스 서사) | "현행 런타임 HELL_BOSSES[0][3]=다크드루이드" NOTE 보강 | `game.html:15869` | 둘 다 | 확정 | NOTE 추가 |
| `맵유형_확장기획.md:56` | — | "`HELL_BOSSES[0][0]`=현행 **다크드루이드**(구 흑요염)" | `game.html:15869` | 구현 | 확정 | 행 현행화 |
| `CLAUDE.md`/`AGENTS.md` 인덱스 "19보스 + BOSS_MOVES 49종" | **"19보스·49종" 설계 라벨 보존** | 괄호 **병기**: "(런타임: 슬롯35·표시명34·무브 정의59·사용58·cageTrap 예약1)" — **치환 아님** | A표 ④⑤⑦⑧⑨ | 둘 다 | 확정 | 병기 추가 |
| `9적ai패턴디자인/`(49종 목록 부재) | — | **신규**: BOSS_MOVES 59종 마스터표(id·idx·tele·rec·range·phase·cd·tags·실행case·무브셋배정) | `game.html:9498–9556` | 구현 | 미확정(미작성) | 신규 문서 |
| `WORLD_CORE.md:133,151`(35사연 5×7) | **서사 35·5×7 보존**(임의 변경 금지) | "런타임 챕터 분배는 4·6·4·7·5·6·3(별개 축)" NOTE만 | `game.html:15869–15875` | 둘 다 별개 축 | 확정 | NOTE 추가(서사 불변) |

---

## D. 담당·의존성 (실행 안 함)

- **burstCounter idx60 CD 영구잠김** 가설: **ENEMY 기배정**(공용 AI `_bossScore`/`_moveCDs`). 본 BOSS 작업은 재실행·수정하지 않음. 의존성: ENEMY 수정 → QA 런타임 재현(`?bosstest`) → game.html+easy 양판 동기. 근거 행은 `new-four/BOSS/result.md §3-A`(역사 근거) 참조.
- **si33/si34 ↔ 네메시아 최종보스 명칭 통일**: 내러티브팀 공동 결정 필요(UNKNOWN). 본 작업 미결.
- **runtime-only 14종 로어 보강**: 디자인/내러티브 후속(UNKNOWN 서사). 본 작업 미결.
- 공유docs 동기화·생산 반영: **총괄 순차 수행**. 총괄이 UI minus-수명 가드를 순차 통합 중이므로 타 세션 변경을 되돌리지 않았고, 파일 상태는 관측 시점 sha256로만 기록(§evidence).

---

## E. 한계·미실행 (정직 표기)

- `productionApplied=false`. docs **미수정**(인계 문안만). game.html/easy·공유docs·Git·UI·서버·삭제·새세션 **0건**.
- 초기 인수의 광범위 목록·59 case 전수 감사는 **재실행하지 않음**(본 작업은 이름 어긋남 좁은 대조 + 인계 문안 다듬기만).
- source 확인 = 정적 읽기. **전투/runtime/visual PASS 아님.** 59 정의·58 사용·cageTrap 예약은 코드 구조 기준이며 실제 전투 발동 재현은 미수행.
- 잘못된 날짜 placeholder(`…-20261002/.../new-four/BOSS/result.md`)는 **추가쓰기·정리 안 함**(역사 보고 유지).
- Changes 80 도달 시 체크포인트 필요 보고, 100 전 산출 중단 규칙 인지. 완료 후 새 작업 독자 생성 없이 다음 배정 대기.

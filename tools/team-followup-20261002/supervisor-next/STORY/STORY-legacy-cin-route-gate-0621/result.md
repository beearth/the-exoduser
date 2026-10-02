# STORY 수정 — 보존 CIN resolver의 실제 진입(reachability) 계약

작업 ID `STORY-legacy-cin-route-gate-0621` · 담당 STORY(Claude, UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`) · 한국어 · **정적 호출/진입 계약 검토만**.
소유 쓰기 = 이 폴더 `result.md`·`evidence.json` **2파일만**(checks.mjs/새 테스트/실행 fixture 미생성). 생산 코드·공유 docs·이전 산출·Git(조회 포함)·실게임/UI/세이브/서버/빌드·미디어 생성/재생·삭제/이동 0. `productionApplied=false`, native/media/subtitle Gate 미검수.

## 0. 메타·시각·SHA·checkpoint 출처

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` (TASK 경로 일치) |
| 감독 제공 checkpoint(출처) | `b72f3f0634f78829df0f227897a1e7555488f103` — 총괄 2026-10-02T06:10 전후 push·remote SHA 확인값(TASK 제공). **독립 현재 HEAD 아님**, Git 조회 0 |
| 전역 Changes(감독 관측) | 06:16:58Z 44개(감독 제공). 본인 신규 2파일만으로 80/100 여유 판단 안 함. 80부터 root checkpoint/100 전 중단 지시 준수 |
| 실제 Read/작성 시각 | 2026-10-02T06:24:18Z / 2026-10-02T15:24:18+0900 (조사·작성 구간) |

**이번 새로 읽은 source content SHA256(shasum, git 아님; 이전 pin은 역사값 보존):**

| 파일 | SHA256 |
|---|---|
| world-intro-player.js | `77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50` |
| world-intro-subtitles.js | `9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b` |
| docs/cinematic/WORLD_INTRO_INGAME_20260907.md | `c50818ce8aaf8c025c31e29618f8dada018ffe2578a723ff92dc6e6b22557d5a` |

> index.html(`38f4e0e9…`)·lobby_i18n.js(`aed031de…`)는 직전 0553 과제와 동일 해시(그 사이 변동 없음). 총괄이 source 수정 중일 수 있어 행 번호는 **이번 Read 시점 현재 source** 기준.

---

## 1. 이전 한 건(0553) 인수·정정

| 항목 | 정정 |
|---|---|
| checks.mjs 7 assertion | **손으로 복사한 resolver 식 + 발췌 fixture**로 실행한 것이지, 현재 파일에서 fragment/배열을 추출해 돌린 증명이 **아니다**. **실제 실행값** = cue13/de, cue0/de, cue0/ms (하드코딩 fixture 기반). **정적 추론(미실행)** = cue18, 16언어 일반화(checks.mjs는 cue13·'de'만 실행). |
| 식 결함 | 빈 문자열이 `\|\|`를 통과해 legacy를 택하는 식 결함은 **정적으로 인수**(수정 식 재실행 안 함). |
| 20→16 언어 | `_CIN_I18N`=**16개 언어**는 0553 정적 조사의 인수값(당시 awk로 블록 카운트). 이번에 **다시 세지 않음**. 출처=0553 evidence. |
| 시각 | 0553의 approximate `readWrite 05:56:43`는 actual 수신/Read/완료 시각을 대체하지 않음(감독 정정: 수신05:54:01.516Z/Read05:54:07.218Z/end_turn06:14:53.111Z). 기존 0553 보고서는 수정하지 않음. |
| capacity hold/resume | 본인 완료보고로 확인했으나 **감독 JSONL의 정확 peer user envelope 미관측** → 전송 증명 PASS로 확대하지 않음. |

---

## 2. 핵심 판정 — 보존 CIN_LINES→showLine→legacy resolver는 **현행 제품 정상 경로에서 도달하지 않는다**

문(door) 완료 후 현행 index.html은 **v13 영화(WorldIntroPlayer + 네이티브 TextTrack)**로 진입하고, **CIN_LINES의 showLine/updateVoiceSync 루프는 부트스트랩되지 않는다.**

- `showLine` 호출부는 index.html에 **2곳뿐**: `updateVoiceSync` 내부(`:2289`, fromSync=true)와 `onSubSkip`(`:2466`, fromSync=true). **`showLine(0, false)`(루프 최초 기동 조건, `:2297-2300`) 호출부가 소스에 존재하지 않는다** → `updateVoiceSync`가 시작되지 않음 → 자동 자막 진행 없음. (문서 "문 이후 showLine(0) 호출 중지"와 일치, `WORLD_INTRO_INGAME_20260907.md:25`.)
- `onSubSkip`(`:2449`)은 `if(_worldIntroPlayer){_worldIntroPlayer.next();return;}`(`:2451`)로 **플레이어 존재 시 영화 cut(CUTS)으로만 이동**, showLine 미도달.

### 2-1. 조건 → callee → resolver 도달? → 영화 자막 경로 → 근거 행

| 조건 | callee | CIN resolver(showLine→:2317) 도달 | 영화 자막 경로 | 근거 행 |
|---|---|---|---|---|
| 정상 문 완료 | `onVidClick`→`_vidStartTimer`(vid.ended/fail/stall)→`_cinReady=true;startWorldIntro()` | **미도달** | `WorldIntroSubtitles.attach`+`setLanguage`+`WorldIntroPlayer.create/start`(네이티브 TextTrack) | index.html:2391-2402, 2405-2427 |
| 재생 중 탭/스킵(Space/Enter/클릭/패드) | `keyHandler`(`:2476`)/overlay.onclick(`:2472`)→`onSubSkip`(`:2449`) | **미도달** (플레이어 존재→`player.next()`) | WorldIntroPlayer.CUTS 경계 이동 | index.html:2451, world-intro-player.js:51-67,82 |
| hold 전체 스킵(Space/Esc/패드, 5000ms) | `skipToGate` | 미도달(해당없음) | 영상/음악 정리→로비/로그인 | index.html hold게이지(0553 참조, 이번 재검사 안 함) |
| 영화 로딩/재생 실패 | `WorldIntroPlayer` 생성됨 → `onError`(`:2418`)만 호출(재생/재시도 버튼). `_worldIntroPlayer`는 **null 안 됨** | **미도달** (player 유지→탭은 player.next) | 재시도, movie 유지 | index.html:2418, world-intro-player.js:30,50 |
| player 미생성/중단 시 입력 | `WorldIntroPlayer.create`는 객체 **동기 반환**(throw/null 없음, `:51 return{}`). 단 그 직전 `setLanguage`(`:2412`)가 throw하면 `create` 미실행→`_worldIntroPlayer=null`인데 `_cinReady=true`(`:2400`) | **조건부 도달** (아래 §2-2) | 없음(영화 미기동) | index.html:2411-2416, world-intro-subtitles.js:16-39 |
| 재진입/언어 변경 | `_goCinematic`(`:2703`)→`_cinReady=false`→`playCinematic`→문 재생. `setUserLanguage`(`:2041`)→`_worldIntroSubtitles.setLanguage` | 미도달 | 문→영화 재진입 / TextTrack 언어 교체 | index.html:2712,2735, 2041 |

### 2-2. 유일한 조건부 도달 창(latent)

`startWorldIntro`에서 **`WorldIntroSubtitles.setLanguage`(`:2412`)가 예외를 던지면** `create`(`:2416`)가 실행되지 않아 `_worldIntroPlayer=null`로 남고, `_cinReady`는 이미 true(`:2400`). 이후 사용자 입력 → `onSubSkip`이 `_worldIntroPlayer` null이므로 `showLine(_cinIdx+1, true)` 호출 → **resolver 도달**. 다만:
- `setLanguage` throw 조건 = `WorldIntroSubtitleData`/`VTTCue`/`data.languages[code]` 부재(world-intro-subtitles.js:21-28의 `addTextTrack`/`new VTTCue`/인덱싱). `world-intro-subtitles-data.js`는 index.html:998에서 로드 → **정상 자산 로드 시 throw 없음 → create 성공 → resolver 영구 미도달**.
- 자동 진행 없음(showLine(0,false) 부재로 updateVoiceSync 미기동) → cue13/18(빈 cue)에 닿으려면 **수동 탭을 13~18회** 반복해야 함. 첫 showLine은 cue1(비어있지 않음, inline 우선, 버그 없음).
- 이 창의 실제 발생 여부는 **런타임 자산/ API 상태 의존**이라 정적으로 단정 불가 → **UNKNOWN/HOLD**(소스 밖 주입·수동 호출·브라우저 동작 필요, 이번 실행 0).

---

## 3. 식 결함 분류 (근거 기반)

| 분류 | 판정 | 근거 |
|---|---|---|
| **현행 제품 경로 결함** | **아님** (정상/탭·스킵/실패/언어변경 경로 모두 resolver 미도달) | §2-1 표, `WORLD_INTRO_INGAME_20260907.md:25`(showLine(0) 중지), 전체목록:3372(기존 문자열 재생 안 함) |
| **보존 legacy의 잠재(latent) 결함** | **맞음** (식의 `\|\|` 빈문자열 falsy → cue13/18에서 legacy 치환은 보존 코드에 실재) | 0553 식 인수(정적), resolver index.html:2316-2317 |
| **UNKNOWN/HOLD** | §2-2 조건부 창의 실제 발생 여부 | setLanguage throw는 자산/API 부재 의존, 런타임 미실행 |

즉 0553에서 보고한 "16언어 사용자 노출"은 **현행 제품 경로에서는 조건부(latent)**이며, 정상 자산 로드 시 **노출되지 않는다**. "old resolver 식 live"(식에 결함 존재)와 "현재 사용자 경로 reachable"(실제 도달)은 **다른 증거**이며, 후자는 조건부/UNKNOWN이다.

---

## 4. CANONICAL 인계 문안 — CAT-68:2202 vs CAT-96:3376 구분 (exact)

두 주석 모두 `_CIN_I18N`을 "데드/절대 참조 안 함"이라 하나, **식의 조건부 선택**과 **제품 경로 미사용**을 섞고 있다. root용 정정 문안:

| 문서·행 | 현재 문구(요지) | 정정 문안(exact 인계) |
|---|---|---|
| `번역대상_전체목록.md:2202` (CAT-68) | "`_CIN_I18N` 테이블(**20개 언어분**) … 인라인 키가 항상 우선돼 **참조되지 않는 데드 코드**" | **(a)** 실측 **16개 언어**(출처: 0553 정적 조사; 이번 미재계수). **(b)** "항상 데드"는 **비정확** — **nonempty cue에서만** 인라인 우선으로 데드이고, **빈 cue13/18에서는 inline 값 `''`이 `\|\|`에서 falsy라 `_CIN_I18N[lang][idx]`가 식상 선택됨**(식 결함, 정적). |
| `번역대상_전체목록.md:3376` (CAT-96) | "`_CIN_I18N` … `line[언어키]`가 항상 존재하므로 **절대 참조되지 않음**. 신규 인트로 미사용" | **(a)** cue13/18은 `line[언어키]`가 **존재하나 `''`** → "항상 존재"로 미참조 단정 불가(식상 참조 가능). **(b)** 단, **제품 경로에서 showLine resolver 자체가 미도달**(v13 영화·TextTrack 사용, showLine(0) 중지)이라 **사용자 미노출은 식이 아니라 "경로 미사용" 근거로 성립**한다. → 두 근거(식 조건부 선택 ≠ 제품 경로 미사용)를 분리 기재. |
| `전체목록.md:3372`, `WORLD_INTRO_INGAME_20260907.md:25-26` | 현행 v13 영화가 CIN_LINES 미재생 | **현행/역사 구분 유지** — 이 "미재생=경로 미사용"이 사용자 미노출의 1차 근거. 식 결함은 보존 legacy의 latent로 별도 표기. |

> **혼합 금지 확인:** 29×32 영화 자막 계약(네이티브 TextTrack, `WorldIntroSubtitles`/`WorldIntroSubtitleData`)과 28키 보존 CIN_LINES 계약(showLine resolver)을 섞지 않음. 한국어/비한국어 선택 규칙도 통합하지 않음.

---

## 5. root 후보 적용 Gate (새 코드 후보 확장 안 함)

0553의 "present-empty 존중" resolver 후보는 **보존 legacy 경로에만** 의미가 있다. 적용 전 Gate:

1. **경로 전제 확인:** 현행 제품에서 showLine resolver가 도달하지 않으므로(§2), 후보 수정의 **사용자 체감 효과는 §2-2 조건부 창에 한정**. root는 "식 정정"과 "경로 미사용" 중 어느 문제를 닫을지 먼저 결정.
2. **충돌 검토:** `_CIN_I18N`을 의도적으로 재사용하는 타 경로(예: `?cinematic=1` 미리보기, 향후 CIN 복원) 존재 시 후보가 그 동작을 바꿀 수 있음 → UNKNOWN/HOLD.
3. **미검수 상태:** `productionApplied=false`, 실게임·자막 렌더·영상·음향 Gate 미검수. 후보는 cue수·v/dur/img·skip·음성·BGM·로어·언어목록·DOM 불변 전제.
4. 반영(공유 docs/Git)은 root 단독.

---

## 6. docs 전체 rg 결과 (관련 경로·수정 필요 section·현행/역사)

`startWorldIntro`/`WorldIntroPlayer`/`showLine`/`world_intro_v13`/`CIN_LINES` rg(백업 제외) 주요 매칭:

| 경로 | 성격 | 인계 |
|---|---|---|
| `docs/cinematic/WORLD_INTRO_INGAME_20260907.md:18,24-27,84` | **현행 재생 계약**(door→startWorldIntro→v13, showLine(0) 중지, ended→finishCin) | 경로 미사용 1차 근거. 과거 브라우저 PASS는 이번 PASS로 쓰지 않음 |
| `docs/16번역·로컬라이제이션/번역대상_전체목록.md:2202(CAT-68),3372,3376(CAT-96)` | 현행/역사 혼재 | §4 정정 문안 |
| `docs/cinematic/WORLD_INTRO_V6_SUBTITLES_20260907.md`, `WORLD_INTRO_V13_EXODUS_20260907.md` | 영화 자막 SSOT(29×32) | 28키 CIN 계약과 분리 유지 |
| `docs/16번역·로컬라이제이션/번역_가이드.md`, `언어추가_우선순위.md` | CIN/_CIN_I18N 언급 | "데드" 표현 §4대로 정정 대상 |
| `docs/16영문화(i18n)/영문화_진행현황.md`, `docs/CHANGELOG_SYNC.md` | 진행/이력 | 현행/역사 구분 표기 |

미검수 상태: 위 문서의 **과거 브라우저 PASS는 이번 검증이 아니며**, 본 보고는 정적 소스 대조뿐이다. 공유 docs/Git 반영은 root.

---

## 7. 결과·영향·검증 한계·의존성

- **결과:** 현행 index.html 제품 경로(정상 문 완료/탭·스킵/영화 실패/재진입·언어변경)에서 **보존 CIN_LINES→showLine→legacy resolver는 도달하지 않는다**(§2-1). 유일 조건부 창은 `setLanguage` throw 시의 latent 경로이며 **UNKNOWN/HOLD**(§2-2).
- **영향:** 0553의 "16언어 legacy 노출"은 **현행 제품에서 조건부(latent)**로 재분류. 식 결함(보존 legacy)은 실재하나 사용자 미노출의 1차 근거는 "경로 미사용"(v13 영화·TextTrack). 두 근거 분리 인계(§4).
- **검증 한계:** **정적 호출/진입 대조만.** UI/DOM/미디어/타이머 실행 0, 영상·자막 렌더·음향 재생 PASS 아님, 네이티브 TextTrack 실제 표시 미확인. `setLanguage` throw 실발생·브라우저 동작은 미실행 → UNKNOWN. Git 조회 0. 제공 SHA(`b72f3f06…`)는 총괄 제공값으로만 기록.
- **의존성/HOLD:** (a) root가 "식 정정 vs 경로 미사용" 중 닫을 문제 결정, (b) `_CIN_I18N` 재사용 타 경로 충돌 검토, (c) CAT-68/CAT-96 주석 정정 공유 docs 반영=root. 완료 후 추가 업무 자율 생성 없이 대기.

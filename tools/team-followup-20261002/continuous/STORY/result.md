# STORY 후속 — 세계관 CIN_LINES 전표 + hell index 오독 정정

작업 ID `continuous-STORY-cin-lines` · 담당 STORY(Claude 실행) · 한국어 보고 · 읽기 전용.
생산 코드·공유 docs·에셋·Git·UI·서버·빌드·실게임·테스트 실행·새 fixture 0. 소유 산출은 이 폴더의 `result.md`·`evidence.json` 2개뿐(이번 TASK는 source fixture를 요구하지 않아 `checks.mjs` 미생성).

## 0. 실행 메타·시각·SHA·commit 출처

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` (TASK 경로와 대조 일치) |
| 총괄 제공 commit(출처 명시) | `7e69495046323b3120578f67635c20feb48b2a4f` — **COMMON.md/PM master §(line 792)에서 제공받은 값**(카드 수명·NW.js 실패 응답 반영). COMMON 지시대로 **Git 조회 안 함**, 독립 관측 현재 HEAD로 표시하지 않음 |
| UI 수명 가드 순차 통합 주의 | 총괄이 `_skClick` 카드 수명 guard/NW.js POST /api/mats 응답을 순차 통합 중. `index.html`·`game.html` 내용 해시가 직전 new-four 과제 시점과 다를 수 있음 → **타인 변경 되돌리지 않음**, 본 보고의 행 번호는 **이번 Read 시점 현재 source** 기준 |
| receivedAt / startedAt / completedAt | 2026-10-02T05:33Z경 / 05:37:06Z / 05:42Z경 (UTC) · KST 2026-10-02T14:37:06+0900 |
| Changes 기준 | 이번 세션 추가=소유 2파일. 80/100 임계 미만(직전 과제에서 49~64 관측) → checkpoint 불필요 |

**읽은 핵심 파일 content SHA256(shasum -a 256, git 아님 — COMMON의 "Git 조회 금지" 준수):**

| 파일 | SHA256 |
|---|---|
| index.html | `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8` |
| game.html | `2e45ee0e9ad909b378bf1a7b864818ce442a4c3e17b12360b42e363dc7d0bd94` |
| lobby_i18n.js | `aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a` |
| world-intro-subtitles.js | `9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b` |
| docs/11내러티브·로어디자인/WORLD_CORE.md | `5f29ed67a28e91251223edc14953053f407126978e58d3af0ca16fd180275a56` |
| docs/4.1맵디자인+설정/BOSS_CANONICAL_MAPPING.md | `eaf369a495ba70cefd5c9116db62f0372a57b7168383a7624a4e893be399d505` |
| docs/cinematic/SPACE_HOLD_SKIP_20260914.md | `ff1f2646e4ecaeb940e67d7ab0b5783b5b7b73d6be2a500fa9a15aee7a3c59c0` |
| localization-runtime.js(언어목록) | 미해시(읽음: `localization-runtime.js:4,57`) |

> **경로 구분:** 세계관 프롤로그 `CIN_LINES`(index.html) ≠ 전사 story v23 영상 22큐(`WARRIOR_LANGUAGE_SUBTITLES_20260922.md`, `WorldIntroSubtitles` VTT) ≠ game.html PRO/INTRO preview(`PROLOGUE_LINES`/`INTRO_CUTSCENE_LINES`, `?cutscene=1`). 셋의 hold 계약을 하나로 합치지 않음.

---

## 1. 세계관 프롤로그 `CIN_LINES` 전표 (19 line + 1 exit = 20항목)

source: `index.html:2200`(배열 시작) ~ `2221`. 각 항목 `{v:시작초, dur:지속ms, img:이미지index, (shake/exit), text(ko) + 27개 인라인 언어키}`. 자동 진행은 타이머(`_sceneStartTime`/`updateVoiceSync`, `index.html:2276-2301`), 보이스 없음.

| cue idx(0-base) | 구분 | 원문(ko) 요약 | 시작 v(초) | 지속 dur(ms) | img index | 비고 |
|---:|---|---|---:|---:|---:|---|
| 0 | text | 우주에는 셀 수 없는 세계가 있다 | 0 | 3400 | 0 | — |
| 1 | text | 끝없는 시대, 끝없는 메타우주 | 3.4 | 3000 | 1 | — |
| 2 | text | 그러나 지옥은 하나다 | 6.4 | 3600 | 2 | — |
| 3 | text | 모든 세계의 악의가 한 곳으로 흘러든다 | 10 | 3400 | 3 | WORLD_CORE 단일에너지/악의 정합 |
| 4 | text | 죽은 자의 세계와 지옥을 잇는 길은 단 하나뿐이다 | 13.4 | 3600 | 4 | — |
| 5 | text | 들어온 것은 나가지 못한다 | 17 | 3000 | 5 | 탈출 불가 |
| 6 | text | 나가지 못한 영혼은 환생하지 못한다 | 20 | 3800 | 6 | — |
| 7 | text | 그리고 억겁의 시간이 흐른다 | 23.8 | 3000 | 7 | — |
| 8 | text | 고통은 살에 스며들고 살은 제 형체를 잊는다 | 26.8 | 3600 | 8 | — |
| 9 | text | 지옥의 모든 괴물은 한때 어딘가의 누군가였다 | 30.4 | 4000 | 9 | WORLD_CORE 35사연/100몹=한때 인간 정합 |
| 10 | text | 나가는 길은 하나뿐이다 | 34.4 | 3200 | 10 | — |
| 11 | text | 찢고 나가는 것 | 37.6 | 3600 | 11 | **shake:true**(화면 떨림+패드 진동) |
| 12 | text | 지옥은 시대를 묻지 않는다 | 41.2 | 3400 | 12 | — |
| 13 | **공백** | (빈 텍스트 — 전 언어 `''`) | 44.6 | 4000 | 13 | 의도적 침묵/전환 컷 |
| 14 | text | 검을 쥔 자도, 강철의 몸을 가진 자도 | 48.6 | 3600 | 14 | — |
| 15 | text | 어느 현실에서 떨어졌든 도착지는 같다 | 52.2 | 3600 | 15 | — |
| 16 | text | 오래 머문 것은 자신이 무엇이었는지 잊는다 | 55.8 | 3800 | 16 | — |
| 17 | text | 그리고 추락은 영겁의 세월 동안 멈추지 않을 것이다... | 59.6 | 4200 | 17 | — |
| 18 | **공백** | (빈 텍스트 — 전 언어 `''`) | 63.8 | 5000 | 18 | img18=타이틀 로고 컷(주석 `index.html:2198`) |
| 19 | **exit** | (텍스트/언어키 없음) | 68.8 | — | — | `{v:68.8,exit:true}` → 종료 트리거 |

- **개수 판정:** 현재 source는 **20항목**(cue 0–18 = 19개 line 엔트리 + cue 19 = exit 1개). TASK의 "텍스트 19 + 종료 1"과 일치. 단 19개 line 중 **2개(idx 13·18)는 의도적 빈 텍스트** 컷이며, 실제 자막이 뜨는 텍스트 cue는 **17개**다.
- `img` 의미(주석 `index.html:2198`): `0~17`=p01~p17, `18`=타이틀 로고(cinImg19), `-1`=암전(`hideAll`), `undefined`=이전 유지. 본 배열엔 `-1`/`undefined` 미사용.

---

## 2. resolver / 음성 / Space / 종료 source chain

### 2-1. 자막 언어 resolver (caption 지원 ≠ 실제 번역 QA)

- 렌더 지점: `index.html:2316-2317`.
  ```
  const _cLang=_lobbyLang();            // = getCurrentLanguage()
  const _cinTxt = _cLang==='ko' ? line.text
                : ( line[_cLang]
                    || (typeof _CIN_I18N!=='undefined' && _CIN_I18N[_cLang] && _CIN_I18N[_cLang][idx])
                    || line.en || line.text );
  ```
- 해석 순서: **ko → `line.text`** / 그 외 → **인라인 `line[_cLang]`** → (**`_CIN_I18N` 보충표**) → **`line.en`** → **`line.text`**.
- **`_CIN_I18N` 정의/적용:** `lobby_i18n.js:1327`에 정의(약 20개 언어분). **그러나 데드 폴백** — CIN_LINES 각 항목에 인라인 언어키가 있어 `line[_cLang]`가 항상 먼저 단락 평가되어 `_CIN_I18N` 분기에 도달하지 않는다. (구 인트로 CAT-68 번역 잔재; 번역_가이드/전체목록 주석과 일치.)
- **지원 언어 정의/로드:** `_I18N_SUPPORTED = ExoduserI18n.languages`(`index.html:2034`), `ExoduserI18n`는 `localization-runtime.js:4,57`에서 정의. 목록 **29개**: `ko en zh zht ja es fr de ru ptbr it vi th id tr pl cs hu bg el fi sv da no nl ro uk ar ms`.
- 언어 선택 체인: `getCurrentLanguage()`(`index.html:2040`) = `?lang` 디버그 → `hellLang`(localStorage, 사용자 선택) → Steam 감지 → 브라우저 감지 → **`'en'` 최종 fallback**. 정규화는 `WorldIntroSubtitles.resolveLanguage`(`world-intro-subtitles.js:43`).
- **caption 커버리지 차이(확인된 사실):** CIN_LINES 인라인 언어키 = **ko(text)+27 = 28**. 지원 29 중 **`ms`(말레이)만 인라인 키 없음** → `_CIN_I18N`에도 `ms` 없음 → **`ms`는 세계관 프롤로그 자막이 영어(`line.en`)로 폴백**. `zht`는 인라인 존재(폴백 아님). ※이는 caption 지원 범위 확인일 뿐, 28개 언어 번역 품질 QA나 음성 지원과는 별개다.

### 2-2. `_CIN_VOICE=false` 적용 경로 / 음성 미사용 범위

- 정의: `index.html:2126` `const _CIN_VOICE=false;` (주석: 2026-07-27 인트로 스왑, 세계관 프롤로그 보이스 없음 — 전쟁 나레이션 보이스는 game.html로 이관).
- 적용: `playCinematic`의 voice-sync 시작 가드 `if(_CIN_VOICE && …)`(`index.html:2266`), 부분 스킵의 오디오 점프 가드 `if(_CIN_VOICE && nextLine.v!==undefined)`(`index.html:2459`). 둘 다 false라 **introVoice 재생/점프 미수행**.
- BGM은 별개 존재: `_CIN_BGM_TRACKS`(`index.html:2128`, 4트랙 랜덤), `startCinBgm`/`stopCinBgm`(`:2130`,`:2135`). 즉 **보이스 없음 + BGM 있음**. (음성 지원≠BGM≠실제 청취 QA — 분리.)

### 2-3. Space 입력 / hold 임계 / 취소 / media·BGM 정리 / 종료→로비 gate

| 경로 | source | 계약 |
|---|---|---|
| 탭(다음 cue) | `keyHandler`(`index.html:2476-2483`): Space/Enter(e.repeat·input/select/button 제외) → 영상 미시작 시 `onVidClick`, 아니면 `onSubSkip`. 클릭/터치도 `onSubSkip`(`:2472-2473`) | 첫 입력 = 다음 cue. `onSubSkip`(`:2449`)이 `_cinIdx+1` 진행, 다음이 `exit`거나 배열 끝이면 `finishCin`. `_worldIntroPlayer` 활성 시엔 그쪽 `next()`로 위임(세계관에선 null) |
| hold(전체 스킵) | 독립 핸들러 `_chk`/`_chu`(`index.html:2523-2533`): **Space 또는 Escape**. 게임패드 Start(9)/B(1)(`:2535-2541`) | 임계 **`_CIN_HOLD_DUR=5000`ms**(`:2521`). 게이지 1초 후 표시(`:2576`), `dt=min(50,…)` 누적(`:2546`) |
| hold 취소 | `_chu`(keyup) 및 패드 해제 → `_cinHoldKey=false,_cinHoldActive=false,_cinHoldProg=0`(`:2527-2539`) | 떼면 진행률 0 리셋 |
| 완료 | `_cinHoldProg>=1` → `setTimeout(skipToGate,100)`(`index.html:2568-2571`) | — |
| media/BGM 정리 + 종료 | `skipToGate`(`index.html:2580-2598`): `stopWorldIntro`·`stopIntroVoice`·`stopCinBgm`·`startBGM`·`stopMediaVideo`·cinVideo opacity0·cinImg1~19 show 제거·텍스트 비움·skipBtn 숨김·`_cinSeenSet()` | 자연 종료 `finishCin`(`:2338-2352`)도 동일 정리(단 `startBGM` 미호출, `_goLobby/_goLogin`이 처리) |
| 로비 gate | `skipToGate`/`finishCin` 끝: `_LOBBY_BUILD==='demo'&&_testMode → _goLogin` / `currentUser||_testMode → _goLobby` / else `_goLogin` (`:2596-2597`,`:2350-2351`) | 종료 후 로그인 또는 로비로 연결 |

> 전사 영상 hold(1200ms, `finish(true)`)·game PRO/INTRO hold(2000ms, `_cutsceneEnd`)와 **다른 계약**이며 합치지 않았다(`SPACE_HOLD_SKIP_20260914.md` 표와 일치 확인). 실제 UI 입력·영상/음성 재생 검수는 하지 않음.

---

## 3. 이전 STORY 보고 오독 정정 표

대상: `tools/team-followup-20261002/new-four/STORY/result.md`·`evidence.json`(과거 입력, **직접 편집하지 않음**).

| 과거 주장(new-four) | 근거로 든 것 | 현재 source 판정 | 남은 UNKNOWN |
|---|---|---|---|
| "킬루 = **6장** 스토리 보스" | `BOSS_CANONICAL_MAPPING.md:70` 1열 "6"을 챕터6으로 읽음 | **오독 정정**: 1열은 **`hell`(0-based)**, 2열이 챕터(지역명). `hell:6`=`game.html:15820 {hell:6,name:'지옥성'}`, UI 라벨 전부 **"7장 - 지옥성"/CH7**(`game.html:2734,6208,15858`). **0-based hell6 = 7장(지옥성)** | 로어 vs 런타임 **챕터 충돌**: WORLD_CORE `챕터6 배신의 그림자`=친구 보스전인데, 런타임 Killu는 **hell6=7장(지옥성)** si33(최종 지옥군주 직전). 챕터 6↔7 불일치 → BOSS/STORY 결정 질문 |
| "si33 `ready:false` ❌ **미구현**" | 같은 행 ❌·`ready:false` | **정정**: ❌는 **전용 per-boss 문서 없음**(§5: hell1–6 문서 미제작). `ready:false`는 **si33 스테이지/맵 '지옥 탑' 준비 플래그**(`game.html:15853 33:{name:'지옥 탑',ready:false}`). **Killu 보스 slot은 런타임에 존재**(`HELL_BOSSES` hell6=`['검은 성의 수호자','Killu','지옥 군주']`, `game.html:15868-15875`, si33) | 이름/slot 할당(존재) vs 스테이지 ready(false) vs 보스 runtime 구현(slot 존재, 무브셋 hell6=전49무브 `game.html:9683`) vs per-boss 문서(없음) vs 전투 검수(미수행) vs 로어 연결(챕터 불일치)를 각각 분리. `ready:false` 하나로 보스 전체 미구현 확정 안 함 |
| "CIN_LINES SSOT 없음(우선 제안)" | 서사 폴더 미기재 | **유지·보강**: 현행도 전용 SSOT 없음 확인. 단 번역 관리 기록은 `번역대상_전체목록.md` CAT-96(No.2974~2990), `번역_가이드.md` Phase 36에 존재 | 전표형 SSOT 부재는 사실. 아래 4절 제안 |
| "디로이=cat/핵터=crow" | PETS_DESIGN_LOCK | **유지(소스 보강)**: in-game 펫 잡담에서 cat이 "핵터…"를 부르고 crow가 응답(`game.html:9322,9474`) → **디로이=cat, 핵터=crow** 재확인 | 톤(까마귀 진지/고양이 명랑) vs PETS_LOCK 성격 결 차이는 이전 보고대로 UNKNOWN 유지 |

---

## 4. docs 전체 rg 결과 + 총괄용 제안(shared docs 생성 안 함)

**rg 매칭(메인 docs, 백업 제외):** `CIN_LINES`/`세계관 프롤로그`/`_CIN_VOICE`/`_CIN_I18N`/`skipToGate` 관련 — `docs/16번역·로컬라이제이션/번역대상_전체목록.md`(CAT-96), `번역_가이드.md`(Phase 36), `언어추가_우선순위.md`, `docs/3.1 ui hud 디자인/INTRO_FOUR_CUTS_20260914.md`, `docs/cinematic/SPACE_HOLD_SKIP_20260914.md`·`WORLD_INTRO_INGAME_20260907.md`·`WORLD_INTRO_FULL_REVIEW_20260906.md`·`PROLOGUE_STORYBOARD_v1.md`, `docs/16영문화(i18n)/영문화_진행현황.md`, `docs/CHANGELOG_SYNC.md`.

**총괄용 정확 문안 제안(보고서 내 제안만 — 파일 미생성):**

1. **신규 전표 SSOT 후보** `docs/11내러티브·로어디자인/WORLDVIEW_CINEMATIC_CIN_LINES_20261002.md`: 위 §1 20행 전표(cue idx/구분/ko원문/v/dur/img) + §2 resolver·_CIN_VOICE·Space·skipToGate 체인을 담는다. 목적 = 전사 영상(`WARRIOR_LANGUAGE_SUBTITLES_20260922.md`)처럼 세계관 프롤로그도 전표형 진실 공급원 확보.
2. **`BOSS_CANONICAL_MAPPING.md` 열 의미 주석 보강 제안**: 1열 `hell`은 0-based, "hell N = (N+1)장" 환산 1줄 명시(Killu hell6=7장). 수치·매핑 자체는 보호(변경 제안 아님).
3. **번역 커버리지 주석 제안**: `번역대상_전체목록.md` CAT-96 인근에 "지원 29언어 중 `ms`는 CIN_LINES 인라인 키 부재 → en 폴백, `_CIN_I18N`은 데드" 1줄.
4. 반영은 총괄이 순차 수행(COMMON §11). 본 담당은 생산·shared docs 미변경.

---

## 5. canonical 보호 항목(변경 금지 확인)

- **설계 19 ⊂ 런타임 35**(`BOSS_CANONICAL_MAPPING.md:18-20`, PM master line 792) 보존 — 어느 쪽도 삭제/통합 제안 안 함.
- **WORLD_CORE TBD**(친구 이름·관계, 8장/챕터, 지옥마왕 정체 등) 임의 확정 안 함. 킬루 챕터 충돌은 "정확 위치 + 결정 질문"만 인계.
- 보호문서 `2_3`·전투 수치·LOCK·Q전용 blackBean·어택티켓 금지·PixelLab 금지 유지.

---

## 6. 결과·영향·검증 한계·다음 의존성

- **결과:** CIN_LINES 20항목 전표(현재 source 근거), resolver 4단 폴백·`_CIN_I18N` 데드·지원29/인라인28(`ms`=en폴백) 확인, `_CIN_VOICE=false` 경로, Space 탭/5000ms hold/skipToGate→로비 gate 체인, **hell6=7장 오독 정정**, `ready:false`(스테이지)≠보스 미구현 분리 완료.
- **영향:** 이전 new-four 보고의 "킬루 6장"은 "7장(지옥성, hell6)"으로 정정되어 **로어(챕터6 배신)↔런타임(챕터7 배치) 충돌**이 드러남 — BOSS/STORY 결정 사안.
- **검증 한계:** source 정적 대조만. 실제 UI 입력·자막 렌더·음성/BGM 청취·영상 재생·전투·HTTP/저장/패키지 PASS 아님. 28언어 번역 품질 QA 아님. `localization-runtime.js` 언어목록은 Read만(해시 생략).
- **다음 의존성:** (a) 킬루 챕터6/7 로어 결정 → BOSS 팀 전투·STORY 로어 합의, (b) `ms` 세계관 자막 번역 추가 여부 → 번역팀, (c) §4-1 신규 SSOT 작성 승인 → 총괄. 완료 후 다음 지시 대기.

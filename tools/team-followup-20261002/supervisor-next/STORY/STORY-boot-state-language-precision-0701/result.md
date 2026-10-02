# STORY 수정 — boot 상태·언어 예외의 정확한 계약 (0635 정정)

작업 ID `STORY-boot-state-language-precision-0701` · 담당 STORY(Claude, UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`) · 한국어 · **읽기 전용 정적 정정**.
소유 쓰기 = 이 폴더 `result.md`·`evidence.json` **2파일만**. 이전 산출/TASK/checks 수정 0, 검사/Node/fixture/UI/DOM/미디어/타이머 실행 0, Git 조회 0. `productionApplied=false`, native/API·실게임·제품노출 미실행 UNKNOWN. 공유 docs/생산/Git은 root 소유.

## 0. 메타·시각·SHA (시각 혼합 금지)

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` (TASK 경로 일치) |
| 감독 제공 checkpoint(출처) | `b72f3f0634f78829df0f227897a1e7555488f103` — root 06:10 전후 push 보고값(TASK 제공). **독립 현재 HEAD 아님**, Git 조회 0 |
| 전역 Changes(감독 관측) | 직전 06:29:03Z `-uall` 54(제공값). 본인 2파일로 전역 임계 판단 안 함. 80 root checkpoint/100 전 중단 준수 |
| 본 과제 실제 Read/작성 시각 | 2026-10-02T07:04:01Z / 2026-10-02T16:04:01+0900 |
| 직전(0635) 시각(감독 대조, 혼합 금지) | peer 06:35:02.419Z / Read 06:35:08.513Z / end_turn `ef19701d-…` 06:50:19.275Z — **task Read/최종 end_turn 시각이며 본 과제 SOURCE 읽기 시각과 분리** |

**이번 Read SOURCE content SHA256(shasum, git 아님):** index.html `38f4e0e9…66c8`, world-intro-subtitles.js `9e3ac220…bc92b` (0635와 동일, 변동 없음). 전체SHA/읽기시각과 end_turn 시각은 섞지 않음.

---

## 1. 정정 ① — boot IIFE throw 시 `let` 초기화 미실행(TDZ) ≠ "false/null 유지"

- `let _worldIntroPlayer=null;` = **index.html:2156**, `let _cinIdx=0,_cinTimer=null,_cinReady=false;` = **index.html:2225**. 둘 다 boot IIFE(**2119**)보다 뒤, 같은 인라인 블록(1134–4320).
- 2119에서 throw 시 블록 실행이 그 지점에서 멈추므로 **2156/2225의 초기화문이 실행되지 않는다**. 이는 "초기 false/null 유지"가 아니라 **해당 `let` 바인딩의 초기화 미실행(TDZ)** 상태다(초기화 전 접근은 ReferenceError). **값을 직접 읽어 확인하지 않음**(정적 소스 기준).
- **함수 선언 hoisting과 구분:** `function getCurrentLanguage/playCinematic/_goCinematic/_cinSeenChk …`는 파스 시 hoist되어 정의는 존재한다. 그러나 이를 **호출·wiring하는 실행문**(진입 결정 2827/2844-2845, playCinematic 내 시네마틱 입력 등록)은 2119 이후라 **실행되지 않는다**.
- **입력 등록 한정:** 언어 select `onchange`(**2114-2117**, `langSelect/cinLang/loginLangSelect/lobbyLangSelect`)는 **2119보다 먼저 등록**된다. 따라서 "모든 입력 미등록"이 아니라 **시네마틱 전용 핸들러(keyHandler/overlay.onclick/_GP cinSub, playCinematic 내)만 미등록**으로 한정한다.

## 2. 정정 ② — getCurrentLanguage 실제 순서(= ?lang query 포함)

`getCurrentLanguage`(**index.html:2040**) 순서:
1. **query `?lang`** → `WorldIntroSubtitles.resolveLanguage(p.get('lang'))` (디버그 override)
2. 저장 **hellLang** → `getUserSelectedLanguage()`(2036)=`resolveLanguage(localStorage.getItem('hellLang'))`
3. **Steam** 감지 → `detectSteamLanguage()`(2037)
4. **browser** 감지 → `detectBrowserLanguage()`(2038)=`navigator.languages` 각 코드 `resolveLanguage(l)`
5. **`'en'` fallback**

- 0635 boot-caller 표가 **query ?lang를 누락**했던 것을 정정(1순위로 추가).
- **"첫 throw"는 실제 확인한 호출/언어 입력 조건으로 한정**한다. 2119 이전의 미확인 resolveLanguage caller 존재 여부는 **UNKNOWN 유지**.

## 3. 정정 ③ — early-return은 정규식(별칭)이며 raw `zht`/`no`는 line 13로 간다

`resolveLanguage`(world-intro-subtitles.js) 원문:

| 행 | 조건 | data 접근 | 반환 |
|---|---|---|---|
| 7 | `typeof value!=='string'` | 없음 | `null` |
| 8 | `raw=value.toLowerCase().replaceAll('_','-')` | — | — |
| 9 | `/^zh-(?:tw\|hk\|mo\|hant)(?:-\|$)/.test(raw)` | 없음 | `'zht'` |
| 10 | `raw==='ptbr' \|\| raw==='pt' \|\| raw.startsWith('pt-')` | 없음 | `'ptbr'` |
| 11 | `/^(?:nb\|nn)(?:-\|$)/.test(raw)` | 없음 | `'no'` |
| 12 | `code=raw.split('-')[0]` | — | — |
| 13 | `Object.hasOwn(data.languages,code)` | **있음(여기서 data 부재 시 throw)** | `code` or `null` |

- **raw 별칭 vs 정규화 code vs Steam 매핑 구분:**
  - **별칭 입력(early-return, data 미접근):** `zh-tw/zh-hk/zh-mo/zh-hant*` → `'zht'`(9); `ptbr`/`pt`/`pt-*` → `'ptbr'`(10); `nb`/`nn*` → `'no'`(11). (예: 원시 `'ptbr'`은 10에서 즉시 반환.)
  - **line 13으로 가는 입력(data 접근):** 위 정규식에 안 걸리는 문자열 — **원시 `'zht'`, 원시 `'no'`**, `'en'`, `'ko'`, `'zh'` 등. 즉 raw `zht`/`no`는 별칭 분기를 통과하지 못하고 **line 13 data.languages로 간다**.
  - **Steam 매핑(data 미접근):** `detectSteamLanguage`(2037)는 `_STEAM_LANG_MAP[sl]`로 **직접 매핑**하며 `resolveLanguage`를 호출하지 않는다(확인: 해당 행에 `_STEAM_LANG_MAP`만, `resolveLanguage` 없음).
- **일반화 금지:** data가 없어도 ① ?lang/hellLang이 없거나(null→line7 early) 별칭(ptbr 등)이고 ② Steam이 매핑 코드를 반환하면 boot는 **data를 접근하지 않고 통과**할 수 있다. 통과 후 더 늦은 지점(cinematic의 setLanguage/attach)에서 실패할 수 있다. 따라서 **"모든 data 누락 = (A) boot 실패"로 일반화하지 않는다.** 두 지정 누락이 **모든 언어·경로에서 반드시 반대 reachability**라고 단정하지 않는다.

## 4. 정정 ④ — setLanguage 내부 순서(addTextTrack=24, 21=normalizeLanguage)

`setLanguage(value)` 원문 순서(world-intro-subtitles.js):

| 행 | 연산 | data 접근 지점 |
|---|---|---|
| 21 | `const code=normalizeLanguage(value)` (→15 `resolveLanguage(value)\|\|'en'`) | **별칭 아니면 resolveLanguage line 13에서 data.languages** |
| 22 | `let track=tracks.get(code)` | 없음 |
| 24 | `track=video.addTextTrack('subtitles',code,tags[code]\|\|code)` | 없음(DOM API) |
| 26 | `data.timings.forEach(([start,end],i)=>…)` | **data.timings** |
| 27 | `const cue=new root.VTTCue(start,end,data.languages[code][i])` | **VTTCue API + data.languages** |

- setLanguage 인자 `getCurrentLanguage()`는 **attach(2411) 이후 2412에서 평가**된다.
- **data 부재 조건에서 첫 data 접근 지점은 인자의 별칭 여부에 따라 다르다:**
  - 비별칭 code(예 `'en'`,`'zht'`,`'no'`): **line 21**(normalize→resolveLanguage **line 13**)에서 먼저 throw.
  - 별칭 code(`'ptbr'`): normalize가 10에서 data 없이 반환 → 24(addTextTrack) → **line 26(data.timings)**에서 먼저 throw.
  - (추가로 인자 평가 `getCurrentLanguage()` 자체도 data 접근 시 setLanguage 진입 전에 throw 가능 — 조건부.)
- **VTTCue 부재(data 정상) 조건:** 21/22/24/26 정상 → **line 27 `new root.VTTCue`에서 throw**.
- 실제 native 실패(addTextTrack/VTTCue/throw)를 **재현했다고 쓰지 않는다** — 정적 조건 한정, 런타임 UNKNOWN.

## 5. 정정 ⑤ — showLine(0,false) 미기동 ↔ onSubSkip 호출 횟수 관계(물리 입력 아님)

- `showLine(0,false)` 호출부가 소스에 없어 `updateVoiceSync` 자동 진행 루프가 **기동되지 않는다**(0621 인수). 따라서 cue 진행은 `onSubSkip`의 수동 호출로만 발생.
- `onSubSkip`은 `showLine(_cinIdx+1,true)`로 **성공 호출당 cue index +1**. 초기 `_cinIdx=0`에서 빈 cue **index 13/18**에 닿으려면 **성공한 onSubSkip 호출이 각각 13회/18회** 누적돼야 한다는 **조건부 산술**이다.
- 이 수치는 **touch/click/keyboard/gamepad 물리 입력 횟수를 검수한 값이 아니다**(입력 repeat 무시·가드·포커스·플레이어 분기 등으로 물리 입력 ≠ 성공 호출). 0635의 "수동 탭 13~18회" 표현을 이 조건부 산술로 한정 정정한다.

---

## 6. root canonical 인계표 (공유 docs/Git = root)

docs rg(`getCurrentLanguage`/`resolveLanguage`/`normalizeLanguage`/`addTextTrack`/`_STEAM_LANG_MAP`/`detectBrowserLanguage`, 백업 제외) 매칭: `docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md`·`CHARACTER_STORY_TRANSLATIONS_20260909.md`, `docs/cinematic/WORLD_INTRO_V6_SUBTITLES_20260907.md`·`WARINTRO_CREATION_RUNTIME_20260910.md`, `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/UIUX-demo-scope-result.md`·`supervisor/SUPERVISOR_STATE.json`.

| 항목 | 현행 근거(행) | 정정/현행 문안 | UNKNOWN |
|---|---|---|---|
| boot throw 상태 | index.html:2119/2156/2225 | 2119 throw 시 2156/2225 `let` 초기화 미실행=**TDZ**(“false/null 유지” 아님). 함수 hoist≠wiring 실행 | 2119 이전 resolveLanguage caller 유무 |
| 입력 등록 | index.html:2114-2117 vs playCinematic | 언어 select onchange는 2119 이전 등록. **시네마틱 전용 핸들러만** 미등록 | — |
| 언어 해석 순서 | index.html:2040/2036/2037/2038 | **?lang→hellLang→Steam→browser→en**(0635에 query 누락 보정). Steam은 `_STEAM_LANG_MAP` 직접(resolveLanguage·data 미접근) | 첫 throw는 확인된 입력 조건 한정 |
| early-return | world-intro-subtitles.js:7,9-11,13 | 정규식 별칭(zh-tw…→zht / ptbr·pt·pt-*→ptbr / nb·nn…→no)만 data 미접근. **raw `zht`/`no`는 line 13 data.languages** | — |
| data 누락 일반화 | — | **모든 data 누락=boot 실패로 일반화 금지.** 별칭/Steam/미설정 입력은 boot 통과 후 더 늦게 실패 가능. 두 누락이 모든 경로에서 반대 reachability라고 단정 금지 | 입력별 실제 분기 |
| setLanguage 순서 | world-intro-subtitles.js:21,22,24,26,27 | normalize(21,→13)→track(22)→**addTextTrack(24)**→timings(26)→VTTCue(27). data 부재 첫 접근=비별칭 21(→13)/별칭 26. VTTCue 부재=27 | native 실제 throw |
| 수동 진행 산술 | index.html onSubSkip/showLine | cue13/18 = 성공 onSubSkip 호출 13/18회(초기 _cinIdx=0, +1/호출)의 **조건부 산술**. 물리 입력 횟수 아님 | 물리 입력↔성공 호출 매핑 |

---

## 7. 결과·영향·검증 한계·의존성

- **결과:** 0635의 5개 표현을 정확 계약으로 정정 — (①TDZ/시네마틱 전용 핸들러 한정, ②getCurrentLanguage에 ?lang 포함, ③정규식 별칭 vs raw zht/no line13·data 누락 비일반화, ④setLanguage 순서 addTextTrack=24·data 첫 접근 별칭 의존, ⑤onSubSkip 조건부 산술≠물리 입력).
- **영향:** data 부재와 VTTCue 부재의 reachability가 **언어·경로 조건에 따라 달라짐**(항상 반대 아님). 식 결함(보존 legacy)·현행 영화 계약 분리와 후보 HOLD는 유지.
- **검증 한계:** 원문 정적 대조만. Node/UI/DOM/미디어/타이머/검사 실행 0. native API(addTextTrack/VTTCue)·boot throw·물리 입력은 **미실행 → UNKNOWN**. 초기화 전 값 직접 읽지 않음. Git 조회 0. task Read/end_turn 시각과 SOURCE 읽기 시각 분리.
- **의존성/HOLD:** (a) root가 로드 순서 가드/식 정정/경로 미사용 중 결정, (b) native 가용성 런타임 검증(범위 밖), (c) 주석·계약 정정 공유 docs 반영=root. 29×32 영화·28키 CIN·KO/비KO·언어목록·미디어·DOM 불변. 완료 후 추가 업무 자율 생성 없이 대기.

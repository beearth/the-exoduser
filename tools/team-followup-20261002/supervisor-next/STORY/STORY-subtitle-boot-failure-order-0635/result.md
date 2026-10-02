# STORY 수정 — 자막 의존성 실패의 최초 throw 위치와 입력 등록 순서

작업 ID `STORY-subtitle-boot-failure-order-0635` · 담당 STORY(Claude, UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`) · 한국어 · **정적 초기화 순서 검토만**.
소유 쓰기 = 이 폴더 `result.md`·`evidence.json` **2파일만**. checks/fixture/새 테스트·Node 실행·UI/DOM/미디어/타이머 실행 0. 이전 0621/0553 산출·cue 전표·7assertion·경로표·hold 검사 반복 0. `productionApplied=false`, 실게임·GPU·청취·저장 미검수.

## 0. 메타·시각·SHA·checkpoint 출처

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` (TASK 경로 일치) |
| 감독 제공 checkpoint(출처) | `b72f3f0634f78829df0f227897a1e7555488f103` — root 06:10 전후 push·exact remote 보고값(TASK 제공). **독립 현재 HEAD 아님**, Git 조회 0 |
| 전역 Changes(감독 관측) | 06:29:03Z `-uall` 54개(제공값; compact44/worker47/53은 관측 이력). 본인 신규 파일 수로 80/100 판단 안 함. 80부터 root checkpoint/100 전 중단 준수 |
| 실제 Read/작성 시각 | 2026-10-02T06:38:16Z / 2026-10-02T15:38:16+0900 |

**이번 Read source content SHA256(shasum, git 아님; 이전 pin 역사값 보존):**

| 파일 | SHA256 / 상태 |
|---|---|
| world-intro-player.js | `77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50` (0621과 동일) |
| world-intro-subtitles.js | `9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b` (0621과 동일) |
| index.html | `38f4e0e9…66c8` (0553/0621과 동일, 변동 없음) |
| world-intro-subtitles-data.js | Read(해시 생략): `globalThis.WorldIntroSubtitleData={version:"v13", ...}` 존재 확인 |

> 총괄이 source 수정 중일 수 있어 행 번호는 **이번 Read 시점 현재 source** 기준.

---

## 1. 0621 인수·정정 (과도한 확정 교정)

| 0621 주장 | 정정 |
|---|---|
| "**유일한 조건 = setLanguage throw**" | **비정확.** `WorldIntroSubtitleData` 부재와 `VTTCue` 부재는 **최초 실패 지점·시점이 다르다**(§2). data 부재는 boot의 `resolveLanguage`(`data.languages` 읽기)에서 더 **이르게** throw 가능. setLanguage/VTTCue는 그보다 **늦은** 경로. |
| "**WorldIntroPlayer.create는 throw 없음**" | **비정확.** `create`는 반환 전 `listen('playing',…)`=`video.addEventListener`를 호출(world-intro-player.js:9,44-50). **`video`가 falsy면 create가 throw**한다(단, 같은 movie 요소를 쓰는 attach/setLanguage가 2411-2412에서 먼저 throw). |
| "**정상 자산 로드 시 throw 없음 / 영구 미도달**" | **조건부로 정정.** "라이브러리(VTTCue)·DOM API·데이터JS가 정상"이라는 **가정(조건) 하에서만** 영화 경로가 resolver에 닿지 않는다. 보장이 아니라 명시 조건. 새 실패 원인은 추측·증명하지 않음. |

식 결함(보존 legacy의 `||` 빈문자열)과 현행 제품 노출 분리, CAT-68·CAT-96 조건부 문안, production 후보 HOLD는 0621대로 유지.

---

## 2. 데이터JS 미로드 vs VTTCue API 부재 — 최초 실패 위치·입력 등록 구분

전제 조건(명시): 아래는 "해당 의존성만 누락, 그 외 라이브러리·DOM API·데이터는 정상"이라는 **조건부** 분석이다. 실제 native/API throw 여부는 **런타임 미실행 → 계속 UNKNOWN**.

**스크립트 로드 순서(index.html):** `localization-runtime.js`(5) → `localization-data.js`(6) → … `lobby_i18n.js`(994) → `world-intro-player.js`(997) → **`world-intro-subtitles-data.js`(998)** → `world-intro-subtitles.js`(999) → 인라인 `<script>` 블록 **1134–4320**(getCurrentLanguage 2040 · boot IIFE 2119 · playCinematic 2231 · _goCinematic 2703 · 진입 결정 2827/2844-2845가 **모두 한 블록**).

- `world-intro-subtitles.js:4` `const data=root.WorldIntroSubtitleData` — **모듈 로드 시 캡처**. 998 미로드면 `data=undefined`(캡처 자체는 throw 아님).
- `resolveLanguage`(world-intro-subtitles.js:6-13): 인자가 **비문자열이면 즉시 null**(line 7), `zht/ptbr/no`는 정규식 early-return(line 8-10, data 미접근). **그 외 문자열**만 line 13 `Object.hasOwn(data.languages,code)` 도달 → data 부재 시 **TypeError**.

### 2-A. `WorldIntroSubtitleData`(998) 미로드

| 단계 | 내용 | 행 |
|---|---|---|
| 누락 의존성 | `globalThis.WorldIntroSubtitleData` (world-intro-subtitles-data.js) | index.html:998 |
| 최초 호출될 수 있는 연산 | boot IIFE → `getCurrentLanguage()` → `getUserSelectedLanguage()`(hellLang 문자열) 또는 `detectBrowserLanguage()`(navigator 코드) → `WorldIntroSubtitles.resolveLanguage(문자열)` → `data.languages` | index.html:2119→2040→2036/2038, world-intro-subtitles.js:13 |
| 예외 전파 경계 | `data.languages` 읽기에서 TypeError → 인라인 블록 **1134–4320의 실행이 2119에서 중단** | world-intro-subtitles.js:13 (caller 2119) |
| 그 시점 상태 | 진입 결정(2827/2844-2845)·ENTER→`_goCinematic`→`playCinematic`(입력 등록)은 **2119 이후**라 **실행되지 않음**. `_cinReady`/`_worldIntroPlayer`는 초기값(false/null)에서 변화 없음 | 2827,2844-2845 (2119 이후) |
| onSubSkip resolver 도달 | **불가능** — 시네마틱 자체가 진입/등록되지 않음(cinematic 입력 핸들러 미등록) | — |
| 조건·UNKNOWN | ①해석된 언어 문자열이 line 13에 도달할 때만 throw(비문자열/zht/ptbr/no early-return이면 미발생→더 늦은 호출로 이연). ②함수 선언(playCinematic 등)은 hoist되나 **실행 wiring이 2119 이후**라 미연결. ③2119보다 이른 `resolveLanguage` caller 존재 여부는 미확정 → **UNKNOWN** | — |

### 2-B. `VTTCue` API 부재 (데이터는 정상)

| 단계 | 내용 | 행 |
|---|---|---|
| 누락 의존성 | `root.VTTCue` 생성자 | (브라우저/NW.js API) |
| 최초 호출 연산 | boot/언어 해석 정상(data 존재) → 진입·playCinematic 정상 → ENTER→문 완료→`startWorldIntro`→`WorldIntroSubtitles.attach(movie)`(VTTCue 미사용) → `setLanguage()`: `video.addTextTrack`(line 21) 후 `new root.VTTCue(start,end,…)` | index.html:2411-2412, world-intro-subtitles.js:21,27 |
| 예외 전파 경계 | `new root.VTTCue`에서 throw → `setLanguage`(2412)에서 전파 → `WorldIntroPlayer.create`(2416) **미도달** | world-intro-subtitles.js:27 (caller index.html:2412) |
| 그 시점 상태 | `_cinReady=true`(2400, startWorldIntro 직전) · `_worldIntroPlayer=null`(create 미실행) · **입력 핸들러(keyHandler 2476/overlay.onclick 2472/_GP cinSub 2486)는 playCinematic에서 이미 등록됨** | 2400,2449-2503 |
| onSubSkip resolver 도달 | **조건부 도달 가능** — 입력 시 `onSubSkip`(2449)이 `_worldIntroPlayer` null이라 `player.next` 분기를 건너뛰고 `showLine(_cinIdx+1,true)` 호출. 단 **첫 showLine=cue1**(비어있지 않음, inline 우선). 빈 cue13/18까지는 **자동진행 없음**(showLine(0,false) 부재로 updateVoiceSync 미기동) → **수동 탭 13~18회** 필요 | 2451,2466 |
| 조건·UNKNOWN | ①`addTextTrack`(line 21)가 VTTCue보다 먼저이므로 addTextTrack 미지원 환경이면 line 21에서 먼저 throw(같은 setLanguage 시점, 다른 연산). ②VTTCue 실제 부재·throw 여부는 런타임 의존 → **UNKNOWN** | — |

### 2-C. 두 경우의 **반대 reachability** (병합 금지)

- **(A) data 미로드** → boot에서 더 **일찍** 실패 → 시네마틱 미진입 → resolver **도달 불가**(입력 미등록).
- **(B) VTTCue 부재** → boot 통과 → 시네마틱 진입·입력 등록 후 setLanguage에서 실패 → resolver **조건부 도달 가능**(null-player 창).
→ 두 누락을 "같은 setLanguage 시점 실패"로 **묶을 수 없다**(0621 오류). 최초 throw 위치(world-intro-subtitles.js **:13** vs **:27**)·시점(boot vs startWorldIntro)·입력 등록 여부가 반대다.

> 계약표 비완전성: `setLanguage` 전후로 `attach`/`addTextTrack`/`getCurrentLanguage`/DOM 변수 쓰기/`create`의 `video.addEventListener` 등 **다른 precreate 연산도 throw할 수 있다**. 본 표는 두 지정 누락만 다루며 모든 API 오류를 열거하지 않는다(의도적 비완전).

---

## 3. 식 결함 vs 현행 노출 — 재확인(분리 유지)

- 보존 legacy resolver의 `||` 빈문자열 결함은 **실재**(식 기준). 0553/0621 정적 인수.
- 현행 제품 노출은 "라이브러리·DOM API·데이터 정상" **조건부**로만 미노출(정상 경로는 v13 영화·TextTrack, showLine resolver 미도달 — 0621). 의존성 결손 시 (A)는 더 일찍 죽어 미노출 강화, (B)는 null-player 창으로 조건부 노출 가능.
- 새 코드 후보(0553 present-empty 존중)는 **변경하지 않음**. 잠재 legacy / 현재 노출 UNKNOWN 분리와 root canonical 문안·Gate만 인계.

---

## 4. root canonical 인계 문안 (공유 docs/Git 반영은 root)

docs rg(`WorldIntroSubtitleData`/`VTTCue`/`data.languages`/`world-intro-subtitles-data`/`TextTrack`, 백업 제외) 주요 매칭: `docs/cinematic/WORLD_INTRO_INGAME_20260907.md`·`WORLD_INTRO_V6_SUBTITLES_20260907.md`·`WORLD_INTRO_V13_EXODUS_20260907.md`, `docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md`·`STEAM_LANGUAGE_FINISH_20260923.md`·`번역_가이드.md`·`언어추가_우선순위.md`, `docs/13출시·마케팅/STEAM_LATEST_DEPLOY_20260909.md`·`STEAM_LANGUAGE_UPLOAD_20260923.md`, `docs/CHANGELOG_SYNC.md`.

| 대상 | exact 인계 문안 | UNKNOWN |
|---|---|---|
| 0621 result/evidence(보존, 미편집) | "유일 조건=setLanguage throw"·"create throw-free"·"정상load 보장"을 **조건부로 정정**: (A) data 미로드=boot `resolveLanguage` `data.languages`(world-intro-subtitles.js:13) 최초 throw→cinematic 미진입→resolver 도달 불가; (B) VTTCue 부재=`new root.VTTCue`(world-intro-subtitles.js:27) setLanguage 내 throw→null-player 창→조건부 도달. create는 `video` falsy 시 throw(:9,44). | native/API 실제 throw 여부, 2119 이전 resolveLanguage caller 유무 |
| `번역대상_전체목록.md:2202`(CAT-68)/`:3376`(CAT-96) | 0621 문안 유지(16개·빈 cue13/18 식상 참조 / 경로 미사용 근거 분리). 본 과제는 **의존성 결손 분기**만 추가. | — |
| `WORLD_INTRO_INGAME_20260907.md:18,24-27` | 정상 경로 계약(인수만). 의존성 결손 시 진입/자막 실패 분기는 미문서화 → 보강 후보 | 실패 UI(2418 재시도) 외 데이터/VTTCue 결손 분기 |
| 로드 순서 계약 | world-intro-subtitles-data.js(998)는 world-intro-subtitles.js(999) **앞**에서 로드되어야 `data` 캡처 유효. 순서 역전/누락은 (A) boot throw 유발 | 번들/캐시 환경별 실제 로드 보장 |

---

## 5. 결과·영향·검증 한계·의존성

- **결과:** `WorldIntroSubtitleData` 미로드(A)와 `VTTCue` 부재(B)는 **최초 throw 위치(world-intro-subtitles.js:13 vs :27)·시점(boot vs startWorldIntro)·cinematic 입력 등록 여부가 반대**다. (A)=resolver **도달 불가**(입력 미등록), (B)=**조건부 도달 가능**(null-player 창, 단 cue13/18은 수동 탭 필요). 0621의 "유일/throw-free/정상load 보장"을 조건부 문안으로 정정.
- **영향:** 두 누락을 동일 실패로 묶었던 0621 전제를 분리. 식 결함은 보존 legacy latent로 유지, 현재 노출은 조건부·UNKNOWN.
- **검증 한계:** 정적 초기화 순서·호출 대조만. UI/DOM/미디어/타이머/Node 실행 0. VTTCue/addTextTrack/데이터JS의 실제 throw·브라우저 동작 **미실행 → UNKNOWN**. 함수 hoisting·2119 이전 caller 등 잔여 UNKNOWN 표기. 수동 주입/직접 호출을 도달 증거로 쓰지 않음. Git 조회 0. 과거 문서 PASS 미원용.
- **의존성/HOLD:** (a) root가 "데이터 로드 순서 가드 vs 식 정정 vs 경로 미사용" 중 닫을 문제 결정, (b) native API(VTTCue) 실제 가용성은 런타임 검증 필요(본 범위 밖), (c) 주석 정정 공유 docs 반영=root. 29×32 영화 계약·28키 CIN 계약·KO/비KO 룰·미디어·언어목록·DOM 불변. 완료 후 추가 업무 자율 생성 없이 대기.

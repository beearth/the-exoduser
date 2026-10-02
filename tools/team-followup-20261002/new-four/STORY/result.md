# STORY 초기 인수 — 세계관·챕터·대사·시네마틱 SSOT↔source 일관성표 1판

작업 ID `STORY-INITIAL-CONSISTENCY-20261002` · 담당 Mac Claude Code Terminal 21(STORY, Claude 실행) · 보고 한국어.
읽기 전용 검토만 수행했다. 생산 patch·코드/실게임/빌드/영상·테스트 재실행은 하지 않았다.

## 0. 메타·시각·보존 기준

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` (TASK 경로와 일치 확인) |
| TASK 작성 기준 HEAD | `8fd5b7ecf7bb9caebf4a1c2cadb844e0986f8c82` |
| 착수·완료 시점 실제 HEAD | `4cd0cb4906daee2b7953af7284f9ecc3ef96dd49` (branch `codex/mac-environment-20261001`) — TASK 기준과 다름, **되돌리지 않고 기록만** |
| receivedAt / startedAt / completedAt (UTC) | 2026-10-02T04:37:35Z / 2026-10-02T04:37:35Z / 2026-10-02T04:42:48Z |
| Changes 수 (start → mid/완료) | 59 → 64 (80 미만, checkpoint 불필요) |
| 소유 산출물 | 본 `result.md`, `evidence.json` 2개만. TASK·production·공유 docs·타인 WIP는 읽기 전용 |

**보존 SHA(git hash-object, 착수=완료 동일):**

| 파일 | blob SHA |
|---|---|
| game.html | `81bf3d45176ea614a4626f71a02a9253b7fbaba5` |
| game-easy-test.html | `4cf9df090f717876d00f68ebe3488f1fd7716295` |
| server.cjs | `cab33a0c6862aeb31e29be69e19f2a0ed21209b1` |
| node-main.js | `8b0fa00bc88a659976ef4f3a32f62b50fd8caba3` |
| index.html | `6b44d07cb14049da51f2accd6755ca80d3344cc8` |
| test/nodeMainMats.test.js | `179fa3032c80950cb08953c1b003ccb0377d9f9e` |

> 검토 시각 구분: Read·대조(04:37–04:42Z) → 작성(04:42Z~) → 자체 검수(작성 직후). 실플레이·시청/청취 PASS·전체 구현 수는 추정하지 않음. 줄 연결·문자열 정의만으로 "전체 컷신 재생·자막·청취 인수"를 선언하지 않음.

---

## 1. SSOT↔source 일관성표 1판

열: 서사 id / 한글명·화자 / 챕터·상황 / LOCK·SSOT 파일·행 / 현행 대사 또는 조건 / source 파일·행·식별자 / 상태 / 역사 기록과 차이 / 영향·후속 Gate.

### 1-A. 세계관 코어 로어

| 서사 id | 한글명·화자 | 챕터·상황 | LOCK·SSOT 파일·행 | 현행 대사/조건 | source 파일·행·식별자 | 상태 | 역사·차이 | 영향·후속 Gate |
|---|---|---|---|---|---|---|---|---|
| CORE-4LAW | 악의 4법칙 | 전역 설정 | `WORLD_CORE.md:16-22` | 악의=생물만, 씨앗=폭력+구속, 뿌리=균형붕괴, 운동=블랙홀 | 직접 대사 소스 없음(설계 전제) | 연결(간접) | v1.0 코어 락(`:411`) | STORY 소유. 코드 직접 노출 없음 |
| CORE-ENERGY | 단일 에너지(악의) | 전역 설정 | `WORLD_CORE.md:38-48` | "빛·열·영양·마나·신성력 전부 없다. 오직 악의 하나" | game.html 자원계 MP/ST/신성력(holy) 실존 | **UNKNOWN(긴장)** | 로어=단일에너지 vs 게임=다자원 | **자동 정정 금지**(TASK 명시). 자원 소유=BALANCE/UIUX. 로어 규칙만으로 MP/ST/신성력 삭제·모순 확정 안 함 |
| CORE-3LAYER | 3층 구조(천계/네메시아/지옥) | 세계관 | `WORLD_CORE.md:52-67` | 중층 네메시아 실체 `[TBD]` | index.html 세계관 시네마틱(악의 흘러듦·탈출 불가) `CIN_LINES` | 부분 연결 | 중층 실체 TBD 유지 | 폭로 단계=STORY 결정 대기 |
| CORE-35BOSS | 35보스=35사연, 7장×5 | 챕터 구조 | `WORLD_CORE.md:134-146,149-160` | 7장 5+5+5+5+5+5+5=35 | `BOSS_CANONICAL_MAPPING.md`(현행 보스 매핑), CLAUDE.md=19보스/BOSS_MOVES 49종 | **미연결(계획)** | 설계 35 vs 구현 보스 수 상이 | **BOSS 소유**로 인계. STORY는 사연 텍스트만 |

### 1-B. 전쟁 프롤로그(복수 서사) — 킬루

| 서사 id | 한글명·화자 | 챕터·상황 | LOCK·SSOT | 현행 대사/조건 | source 식별자 | 상태 | 역사·차이 | 영향·후속 Gate |
|---|---|---|---|---|---|---|---|---|
| WA-INTRO | 전쟁 복수 서사(내레이션) | 생성 직후 영상 | `11내러티브·로어디자인.md:2,50`, `WARINTRO_CREATION_RUNTIME_20260910.md`, `WARRIOR_LANGUAGE_SUBTITLES_20260922.md:6,26-47` | v23 공통영상 `video/warrior_story_v23_clean.mp4` + 29언어×22큐 .vtt. 96.4초/5784f. SHA256 `ce6488aa…72e` | 재생=index.html `ExoduserCharacterStory.play()`(`index.html:3298`), 진입 `&story=warrior-v21`(`index.html:4184`) | 연결 | v21고정자막→v22 BGM→v23 선택자막 이력 분리 기록됨 | 실시청/29언어 원어민 감수는 미완(문서 명시) |
| WA-PRO-FALLBACK | 캔버스 프롤로그(동일 서사 폴백) | `?cutscene=1` 미리보기 전용 | 위 동일 | `PROLOGUE_LINES` ko/en/ja/zh, wa01~wa34 | game.html `PROLOGUE_LINES`(`game.html:60539`), `_cutSeq=_forceCutscene?'PRO':'INTRO'`(`game.html:60863`) | 연결(게이트) | **일반 입장에서 PRO 미재생** — `cutscene=1`에서만. 일반 서사는 영상(.vtt) | 문자열 존재≠상시 재생. 자막 인수 선언 금지 |
| WA-KILLU | 킬루(이웃·친구, 가해자) | 프롤로그 과거 | `WARRIOR_DESIGN_LOCK.md:14`(악당 킬루, 붉은 눈·흰 모피) | wa06 "이웃이자 친구였던 킬루가 그의 가문을 짓밟았다", wa14/17/19 킬루 가문·복수 | `game.html:60546`(wa06)/`:60554`(wa14)/`:60557`(wa17)/`:60559`(wa19) | **연결·단, SSOT 불일치** | WORLD_CORE는 "친구(이름 **TBD**)"(`:300-304`)·T8(`:399`) 유지. 이미 전역 docs에 킬루 확정 | **아래 2절 우선 제안 대상**. 자동 정정 금지, BOSS/STORY 합의 Gate |
| WA-KILLU-BOSS | 킬루=6장 스토리 보스 | 챕터6 | `BOSS_CANONICAL_MAPPING.md:70`(6장 지옥성 Killu, si33, ready:false ❌) | 미구현 스토리 보스 | 해당 보스 런타임 미연결 | **미연결(계획)·UNKNOWN** | 프롤로그=킬루 이미 처단 vs 6장=킬루 보스로 재등장. WORLD_CORE 4중비극(친구 조종당함)과 복수극 표층서사 **버전 긴장** | **BOSS 소유 전투**+STORY 로어 합의 필요. 미해결로 기록 |

### 1-C. 네메시아 인트로(생성 후 게임 내 컷신)

| 서사 id | 한글명·화자 | 챕터·상황 | LOCK·SSOT | 현행 대사/조건 | source 식별자 | 상태 | 역사·차이 | 영향·후속 Gate |
|---|---|---|---|---|---|---|---|---|
| INTRO-GODDESS | 네메시아(화자 `GODDESS`) | 기상 전 INTRO | `NEMESIA_DESIGN_LOCK.md`(얼굴 LOCK), `NEMESIA_DIALOGUE_20260910.md:5-9`, `STORY_KOREAN_GRAMMAR_20260910.md:43-47` | id5 4문장 승인본 "그토록 피를 묻히고도…너무 늦기 전에" | `game.html:60687` `INTRO_CUTSCENE_LINES`, id5=`:60692`, 표시명 `CUTSCENE_SPEAKER_STYLES.GODDESS→네메시아`(`game.html:60530`) | 연결 | id3/5/12/14 문법·승인 교정 반영됨 | 1280×720 한국어만 직접 검수. 타 언어 구조검사 |
| INTRO-SAVE-TGT | "네가 구해야 할 이" | id5 | `NEMESIA_DIALOGUE_20260910.md:3`(이름·생사 추가 안 함) | id5 2행 "구해야 할 이가 누구인지…" | `game.html:60692` | **TBD(의도적 미확정)** | 프롤로그=아내 사망·아이 노예(wa08/09/11)와의 관계 미연결 | 구원 대상 정답 확정 금지(TASK). STORY 폭로 설계 Gate |
| INTRO-SEQ | 네메시스 시퀀스/주제가 | INTRO 진입 | `11내러티브·로어디자인.md:63`, `NEMESIS_THEME_V3_20260910.md` | `cutscene_nemesis`=「네메시아의 강림 V3」 | `game.html:3976` `cutscene_nemesis`, 기본 `_cutSeq='INTRO'`(`:60863`) | 연결 | 캐릭터=**네메시아**, 시퀀스·곡명=**네메시스** 혼용 | 표기 혼용은 근거 없이 일괄 변경 금지. 용어 정리 Gate(STORY) |

### 1-D. 디로이·핵터(동료/펫) 정체·표시명

| 서사 id | 한글명·화자 | 챕터·상황 | LOCK·SSOT | 현행 대사/조건 | source 식별자 | 상태 | 역사·차이 | 영향·후속 Gate |
|---|---|---|---|---|---|---|---|---|
| CAST-DIROY | 디로이(검은 고양이, 화자 `DIROY`) | INTRO + 전투 펫 | `PETS_DESIGN_LOCK.md:1-14`(디로이=cat, 보라눈), `WORLD_CORE.md:295-298`(동료·거점 NPC·충 TBD) | id11 "내가 디로이" 등 설명조 | `game.html:60531` `DIROY→디로이`, id11=`:60699` | 연결 | WORLD_CORE 충 보유 T3(`:382-386`) TBD | 펫 시스템=2_4 소유와 겹침. 충 보유 STORY Gate |
| CAST-HECTOR | 핵터(까마귀, 화자 `HECTOR`) | INTRO + 전투 펫 | `PETS_DESIGN_LOCK.md:1-14`(핵터=crow, 호박색눈) | id12 "내가 핵터" 등 | `game.html:60532` `HECTOR→핵터`, id12=`:60700` | 연결 | 동일 | 동일 |
| CAST-PET-TONE | 까마귀/고양이 말투 | 전투 펫 잡담 | `펫_대사_스크립트.md:6`(까마귀=진지/냉소, 고양이=명랑/직설) | `_petSayCD`/`_petTut` 분기 | `game.html` `_petSayCD`(64회)/`_petTut`(30회) | **부분 불일치(톤)** | 펫대사 톤 배정 vs `PETS_DESIGN_LOCK`(디로이=차분·도도, 핵터=호기심)·INTRO(디로이=설명조) 간 결 차이 | 근거 없이 일괄 변경 금지. 톤 통일 STORY/ANIMVFX·SOUND 보이스 Gate |
| CAST-PET-LINK | 펫 코드 who=crow/cat ↔ 이름 디로이/핵터 | 전투 | `PETS_DESIGN_LOCK.md`가 유일 브리지 | 코드엔 이름 미표기, who='crow'/'cat' | `game.html` `_petSayCD(id,who,…)` | 연결(문서 경유) | 로비 ravenLines별도(`index.html:4189`) | 이름-종 매핑 SSOT는 PETS_LOCK만. 보강 권장 |

### 1-E. 세계관 로비 시네마틱(지옥문·세계관 영상)

| 서사 id | 한글명·화자 | 챕터·상황 | LOCK·SSOT | 현행 대사/조건 | source 식별자 | 상태 | 역사·차이 | 영향·후속 Gate |
|---|---|---|---|---|---|---|---|---|
| CIN-WORLD | 세계관 프롤로그(내레이션, 29언어) | 로비 진입 시네마틱 | **전용 SSOT 없음** — `11내러티브·로어디자인.md:20`에 "세계관 영상 선택형 자막" 언급만, `SPACE_HOLD_SKIP_20260914.md:8` 스킵 계약 | "모든 세계의 악의가 한 곳으로…", "지옥의 모든 괴물은 한때 누군가였다", "들어온 것은 나가지 못한다" 등 | `index.html:2200` `CIN_LINES`(주석 `:2197`), 스킵 `skipToGate` | **source만 존재(SSOT 미기재)** | WORLD_CORE 로어(악의 흘러듦·35사연·탈출)와 내용 정합하나 문서 미연결 | **아래 2절 우선 제안 대상.** STORY 소유, UIUX(선택자막)·SOUND(_CIN_VOICE=false) 연계 |

### 1-F. 브랜딩·시리즈 메타

| 서사 id | 한글명·화자 | 상황 | LOCK·SSOT | 현행 값 | source | 상태 | 역사·차이 | 영향·후속 Gate |
|---|---|---|---|---|---|---|---|---|
| META-TITLE | 프로젝트명·스튜디오 | 전역 | `WORLD_CORE.md:3-5`(HELL: EXODUSER / 스튜디오 VOISUN) | 코드·운영 문서=EXODUSER/지옥의 길(Hell Road) | CLAUDE.md·AGENTS.md 제목 "지옥의 길", `img/logo_exoduser.png` | **표기 불일치** | VOISUN은 docs 전역에서 WORLD_CORE 1곳만 | 브랜딩 확정=총괄/MARKETING. 자동 정정 금지(TASK) |
| META-ASH | ASH RAIDER(DLC 주인공) | 시리즈 로드맵 | `WORLD_CORE.md:306-312` 위치 TBD | 본편 미등장 | 본편 source 없음 | TBD(차기작) | 다른 worldview 문서(`HELL_EXODUSER_WORLDVIEW_v2.md`)에도 언급 | 본편 범위 아님. 보류 |

> **복수 로어 소스 주의:** `WORLD_CORE.md` 외 `docs/HELL_EXODUSER_WORLDVIEW_v2.md`(208줄), `docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md`, `docs/최종기획서/`에도 세계관 기술이 있다. 어느 것이 최상위 SSOT인지 명시 지점을 찾지 못함 → **UNKNOWN**으로 기록, STORY 총괄 결정 Gate.

---

## 2. 우선 제안 1건 — 세계관 로비 시네마틱(CIN_LINES) SSOT 연결

**제안 ID `STORY-PROP-CIN-WORLD-SSOT`.** 신규 로어·보스 배정·타이밍 확정 없이, **이미 승인되어 source에 들어가 있는** 29언어 세계관 내레이션을 서사 SSOT에 연결해 누락을 메우는 문서화 제안이다. 생산 patch는 만들지 않는다.

### 2-1. 누락 근거(확인된 사실)

- source: `index.html:2200` `CIN_LINES` 배열 — 한국어+28개 언어, 타이머 자동 진행(`_CIN_VOICE=false`), 이미지 인덱스·`dur`·`shake` 연출 포함. 주석 `index.html:2197`에 "구 전쟁 복수 서사는 game.html PROLOGUE_LINES로 이동"이라 명기.
- 재생/스킵 계약: `SPACE_HOLD_SKIP_20260914.md:8` "지옥문·세계관 영상 — 첫 누름 다음 컷, 계속 누르면 전체 스킵, `skipToGate`, 영상/BGM 정리·로비 연결".
- SSOT 공백: 서사 폴더(`docs/11내러티브·로어디자인/`)에 세계관 내레이션 **전문·언어별 표·연출 큐를 담은 전용 문서가 없다.** `11내러티브·로어디자인.md:20`은 "선택형 자막"이라고 존재만 언급. 반면 전사 영상은 `WARRIOR_LANGUAGE_SUBTITLES_20260922.md`로 큐 전표가 관리됨 → 세계관 영상만 SSOT 누락.

### 2-2. trigger→노출→종료/스킵→진행 연결(현행 승인 자산 기준)

1. **trigger:** 로비/시작에서 지옥문·세계관 시네마틱 진입(`index.html` 시작 흐름, `ExoduserCharacterStory`와 별개의 세계관 영상).
2. **노출:** `CIN_LINES`가 `v`(초)·`dur` 기반 자동 진행, 29언어 선택 자막 표시(`img` 인덱스로 배경 전환, `shake` 등 연출).
3. **종료/스킵:** Space 첫 누름=다음 컷, 홀드 5000ms=전체 스킵→`skipToGate`(영상·BGM 정리).
4. **진행:** 로비/캐릭터 선택으로 연결 → 생성 시 전사 영상(WA-INTRO)·네메시아 INTRO로 이어짐.

### 2-3. 필요한 docs 문안(제안 초안 — 채택 시 STORY가 작성)

신규 SSOT 파일 후보: `docs/11내러티브·로어디자인/WORLDVIEW_CINEMATIC_CIN_LINES_20261002.md`.

> # 세계관 로비 시네마틱 (CIN_LINES) — SSOT
> | 항목 | 현행 계약 |
> |---|---|
> | source | `index.html` `CIN_LINES`(배열 시작 근처), `_CIN_VOICE=false` |
> | 큐 수·언어 | N큐 × 29언어(ko 기준 연출, 28개 번역 병기) |
> | 연출 | `v`(초) 시작, `dur`, `img`(0~17=p01~p17 / 18=타이틀 / -1=암전 / undefined=유지), `shake` |
> | 재생/스킵 | `SPACE_HOLD_SKIP_20260914.md` 세계관 구간 계약 준용, `skipToGate` |
> | 로어 정합 | WORLD_CORE 단일에너지(악의 흘러듦)·35사연(괴물=한때 누군가)·탈출 불가와 대응 |
> | 다음 연결 | 로비→캐릭터 선택→(생성 시) 전사 영상·네메시아 INTRO |
>
> (표 아래에 ko 전문 + 큐별 시작/`dur`/`img`를 `WARRIOR_LANGUAGE_SUBTITLES` 전표 양식으로 1:1 기재.)

### 2-4. source 적용 후보 위치(문서화만 — 코드 변경 아님)

- 참조 추가: `11내러티브·로어디자인.md:20` 인근 "세계관 영상" 문장에 신규 SSOT 링크.
- 상호 링크: `WORLD_CORE.md` 세계관/35사연 절 → 신규 SSOT, 역방향도.

### 2-5. 관련 팀·인계

- **STORY**: 세계관 내레이션 전문·로어 정합 소유(본 제안 주체).
- **UIUX**: 선택형 자막 렌더·언어 전환 UI(겹침분 인계).
- **SOUND**: `_CIN_VOICE=false`(무보이스)·세계관 BGM 처리.
- **BOSS**: "괴물=한때 누군가" ↔ 35사연 보스 배정은 BOSS 소유, STORY는 사연 텍스트만.
- 생산 patch·새 세계관 폭로 확정·미구현 챕터 출시 약속은 **보류**.

---

## 3. 관련 키워드 docs 전체 rg 결과(검토 근거)

| 키워드 | docs 매칭 요약 |
|---|---|
| `킬루`/`Killu` | 38개 파일 매칭. **단 `WORLD_CORE.md`에는 0건**(친구 이름 TBD 유지). 6사운드3·ART_TEAM_MASTER7·번역전체목록4·CHARACTER_STORY_TRANSLATIONS5·WARINTRO_STILLS_AUDIT7·MASTER_BIBLE9·`BOSS_CANONICAL_MAPPING.md:70`(6장 si33 ready:false) 등 |
| `VOISUN` | `WORLD_CORE.md` 1건뿐 → 코드/운영 브랜딩(지옥의 길/EXODUSER)과 단절 |
| `네메시스` | CHANGELOG9·6사운드5·11내러티브4·캐릭터선택리모델링3·WARINTRO_BGM_V22 등 — 시퀀스/곡명으로 통용, 캐릭터명 `네메시아`와 혼용 |
| `디로이`/`핵터` | 서사 폴더 내 WORLD_CORE6·PETS_DESIGN_LOCK4·WARRIOR_DESIGN_LOCK1·11내러티브1 |
| `ASH RAIDER` | WORLD_CORE3·HELL_EXODUSER_WORLDVIEW_v2·HELL_DIROI_종합확장전략·최종기획서 — 본편 미등장(DLC) |

(본 세션 rg는 메인 `docs/` 대상. `docs_backup_before_normalize_20260726/` 백업·타세션 WIP는 건드리지 않음.)

---

## 4. 미실행 Gate(이번 범위 밖 — 총괄 배정 대기)

1. **CORE-ENERGY**: 단일에너지 로어 vs MP/ST/신성력 다자원 — 자원 소유 BALANCE/UIUX, 로어 규칙만으로 삭제·모순 확정 안 함.
2. **WA-KILLU / WA-KILLU-BOSS**: 킬루 이름·6장 보스화 ↔ WORLD_CORE "친구 TBD"·4중비극 버전 긴장 — STORY/BOSS 합의. 자동 정정 금지.
3. **CORE-35BOSS**: 설계 35보스 vs 현행 구현 보스 수 — BOSS 소유.
4. **INTRO-SEQ**: `네메시아`(캐릭터) vs `네메시스`(시퀀스/곡) 표기 정리 — STORY 용어 Gate.
5. **CAST-PET-TONE**: 펫대사 톤 배정 vs PETS_LOCK/INTRO 결 차이 — 근거 없이 일괄 변경 금지, 보이스=SOUND 연계.
6. **복수 로어 SSOT**: WORLD_CORE vs HELL_EXODUSER_WORLDVIEW_v2 vs MASTER_BIBLE 최상위 지정 — UNKNOWN, 총괄 결정.
7. **META-TITLE**: VOISUN/HELL:EXODUSER vs 지옥의 길/EXODUSER 브랜딩 — 총괄/MARKETING.
8. **우선 제안 2-3 신규 SSOT 작성**: 채택 시에만 STORY 착수(이번엔 초안 문안만).

> 맵 배치·geometry·collision·카메라 QA는 이번 범위 아님(후속 진입 시 `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md`+MAP SSOT 선행). 보호문서 `2_3` 수정·전투 수치 변경 금지 준수. 완료 후 다음 일은 독자 생성하지 않고 총괄 배정 대기.

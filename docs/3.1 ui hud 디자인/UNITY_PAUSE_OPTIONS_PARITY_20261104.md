# Unity 일시정지·설정 웹 정본 소스 대조 — 2026-11-04

소스 기준: Unity `bea021bcf1b2d20689e9f014834456879c5a722a`, 웹 `06ac6882b550cb6373f2953ede3b2acc6f69e211`. 문서 커밋 SHA는 레인 REPORT.md 첫 줄에 기록한다.

판정: **4탭 소스 대조 완료 / 제품 동등성 FAIL / 실행·디자인 미검수**. 코드 적용·Core 변경·빌드·Player·브라우저 실행 0.

다음 일: Unity 총괄이 아래 우선순위로 실제 효과를 연결하고 Mac에서 자연 입력·저장/재시작·화면 판정을 한다.



| 탭 | 웹 / Unity 설정 행 수 | 별도 선택·동작 |
|---|---|---|
| 게임 | 12 / 11 | 언어+게임10+웹 reduceMotion1. 캐릭터2카드, 프리셋4버튼, 전체화면/로비/리셋/종료4버튼 별도 |
| 화면 | 22 / 22 | 화면효과9+그래픽13. 그래픽 프리셋5버튼·재진단1·진단4칸 별도. Electron 웹만 화면모드/해상도2행 추가 |
| 사운드 | 3 / 3 | SFX·BGM·곡 선택(73값) |
| 조작 | 2 / 2 | 커서종류1그룹(2카드)+크기1. 키보드21행(각2슬롯), 패드9행, 하위탭2·각 초기화 별도 |

차이 등록 **56건**: 웹과 다름 17 / Unity 미연결 36 / 웹에 없음 1 / 의도된 차이 2. 한 ID를 한 번만 센다. 같은 항목의 복합 증상은 묶었다. 자동 물약 등 양쪽 공통 미연결은 차이 수에서 제외한다.


## 첫인상 영향 상위 10개

| 순위 | 차이 ID | 영향 / 후속 |
|---|---|---|
| 1 | P39 | 처음부터 리셋을 눌러도 저장 진행을 다시 읽을 수 있음. 저장 보호 정책부터 총괄 확정 |
| 2 | P30 | BGM 73곡 선택을 바꿔도 음악이 바뀌는 경로 없음 |
| 3 | P18 | 그래픽 체크·프리셋은 저장만 되고 실제 렌더 효과 미연결(P12,P14~P29 함께) |
| 4 | P33 | 캐릭터 카드가 눌리지 않고 실제 선택도 반영하지 않음 |
| 5 | P34 | 프리셋에 주/보조 키와 언어가 포함되지 않음 |
| 6 | P02 | 언어를 바꿔도 재시작시 ko로 돌아갈 수 있음 |
| 7 | P01 | 움직임 줄이기를 사용자가 켤 수 없음 |
| 8 | P31 | 커서 종류·크기를 바꿔도 포인터 적용 경로 없음(P32 포함) |
| 9 | P42 | 키보드만으로 키 변경 슬롯에 도달할 수 없음 |
| 10 | P13 | 새 설정 파일이 없을 때 웹 무제한과 달리 FPS120으로 시작 |


## 범위·근거 읽는 법


- 작업 브랜치 `codex/unity-pause-options-parity-20261104`, 자기 NTFS sparse worktree에서 문서 1개만 작성. 베이스는 BRIEF 지정 SHA로 고정했다. fetch 당시 origin/unity/main은 `349a9d7db53c950482f5cc80dbc2f41d186ea013`; 핵심 메뉴/입력/저장/OptionSet/라벨 10파일은 그 SHA와 차이 0이었다. 이후 원격 변경과 NativeGame 다른 구역 전체는 최신판으로 재감사하지 않았다.

- `game.html:줄`은 웹 SHA의 `git show` 원문이며 Unity worktree의 game.html을 oracle로 쓰지 않았다. 4탭 재배치는 game.html:2659가 읽는 동일 웹 SHA의 ui-panels.js:71-164도 읽었다. 동적 DOM·외부 CSS의 실제 픽셀 순서는 실행 미검증이다.

- Unity 짧은 파일명은 모두 `unity/Assets/Exoduser/Runtime/` 아래다. `Core/`도 이 접두사를 따른다. 이름은 `Resources/Data/a15_options_web.json`의 key와 ko/en 2칸, 웹 _EN(game.html:6509 이후)을 비교했다. n.*·b.* 단일문구 불일치 0, BGM 73값의 순서·문자열 불일치 0. 이 결과를 29언어/실제 폰트 PASS로 넓히지 않는다.

- 저장 표의 예는 소스상 일반 저장 경로가 있다는 뜻이다. `QueueSettingsSave` 0.25초 지연→`FlushNativeSettings`→`NativeSettingsStore` opt/주·보조 키/프리셋 저장을 추적했다. 사용자 파일은 읽거나 쓰지 않았다. 언어는 이 경로에 없다.

- 웹 초기 HTML BGM30·ambPart checked를 실제 기본으로 세지 않았다. OPT 기본 BGM60·ambPart false가 syncSettingsUI로 덮는다. 화면 기본은 OPT 리터럴, 저장 복원, 하드웨어 진단을 구분한다. 웹 `_applyTier`는 game.html:9404-9407에서 여러 그래픽 기본을 환경에 따라 바꾼다.

- 전체 Runtime의 Options.Get/Check/Set/BgmTrack 및 개별 키 문자열 참조를 검색하고 host 소비를 읽었다. 아래 미연결은 해당 메뉴 설정에서 효과로 가는 경로가 없다는 소스 판정이며, 그 효과 자체가 엔진에 없다는 뜻은 아니다.


## 4탭 전체 설정 대조


표의 범위는 `최소..최대 / 단계 / 기본값`이다. 체크는 `0..1/1`(0끔·1켬), %는 표시 단위이며 autoPotThr는 저장 때 0.30..0.99 비율이다. 범위·단계가 같으면 Unity 칸은 같음으로 표시한다.


### 게임

| 순서·ID | 이름 ko / en(양쪽) | 웹 범위·단계·기본 / 단위 | Unity | 저장 웹 / Unity | 실제 Unity 효과 | 판정·근거 |
|---|---|---|---|---|---|---|
| 1 `optLang` | Language / Language | 29언어·ko | 같은 목록·ko | 예 / 아니오 | 세션 언어 즉시 변경 | P02; `game.html:2815,49397`; `NativeGame.cs:153`; `NativeLobby.cs:19,48` |
| 2 `optReduceMotion`(웹만) | 움직임 줄이기 / Reduce motion | 0..1/1/0 | 행 없음; 속성 ReduceMotion=false 있음 | 예 / 속성만 예 | 기존 속성은 화면 전환 감소에 사용. 설정 조작 불가 | P01; `game.html:2836,49849`; `Core/NativeOptionSet.cs:71-72`; `NativeGame.SettingsPersistence.cs:37` |
| 3 `optDiff` | 난이도 / Difficulty | 0..10 / 1 / 5; 0..10을 -5단..일반..+5단으로 표시 | 같음 | 예 / 예 | ResetRun 때 config.DifficultyIndex에 적용; 현재 판 변경 미연결 | P03 웹과 다름; `game.html:2924`; `Core/NativeOptionSet.cs:26` |
| 4 `optAutoPot` | 자동 물약 / Auto Potion | 30..99 / 1 / 99; HP 30..99% 이하 표시; 양쪽 전투는 이 값 미참조 | 같음 | 예 / 예 | 양쪽 표시·저장만. 웹 전투36343과 Unity AutoPotion.cs:105는 회복량만큼 HP가 비면 사용하며 이 값을 읽지 않음 | 소스 일치; `game.html:2925`; `Core/NativeOptionSet.cs:27` |
| 5 `optMinRar` | 최소 줍기 등급 / Min Pickup Grade | 0..4 / 1 / 0 | 같음 | 예 / 예 | Simulation.MinPickRarity→WorldDrop 줍기 필터. 웹 변경 즉시 바닥 아이템 삭제와는 다름 | P53 웹과 다름; `game.html:2926`; `Core/NativeOptionSet.cs:28` |
| 6 `optMinLv` | 최소 줍기 티어 / Min Pickup Tier | 0..7 / 1 / 0; 0끔;1..6→Lv100..600,7→Lv1000 | 같음 | 예 / 예 | Simulation.MinPickLevelTier→WorldDrop 요구레벨 필터. 웹 변경 즉시 바닥 아이템 정리와는 다름 | P54 웹과 다름; `game.html:2927`; `Core/NativeOptionSet.cs:29` |
| 7 `optCrAutoFuse` | 유물 자동합성 / Relic Auto-Fuse | -1..3 / 1 / -1; -1끔;0..3→1..4성 이하 | 같음 | 예 / 예 | 자동 합성 처리 미연결; 표시·저장만 | P04 Unity 미연결; `game.html:2928`; `Core/NativeOptionSet.cs:30` |
| 8 `optCrAutoEnh` | 유물 자동강화 / Relic Auto-Enhance | -1..4 / 1 / -1; -1끔;0..4→1..5성 이상 | 같음 | 예 / 예 | 자동 강화 처리 미연결; 표시·저장만 | P05 Unity 미연결; `game.html:2929`; `Core/NativeOptionSet.cs:31` |
| 9 `optXbowAuto` | 석궁 자동발사 (T) / Auto Crossbow (T) | 0..1 / 1 / 1 | 같음 | 예 / 예 | 체크값과 Simulation.ToggleCrossbowAuto가 서로 연결되지 않음; 표시·저장만 | P06 Unity 미연결; `game.html:2936`; `Core/NativeOptionSet.cs:32` |
| 10 `optBlPullMode` | 버스트루프 당기기 (H) / Burst Loop Pull (H) | 0..1 / 1 / 0 | 같음 | 예 / 예 | 전투 당기기 모드 미연결; 표시·저장만 | P07 Unity 미연결; `game.html:2937`; `Core/NativeOptionSet.cs:33` |
| 11 `optBladeAuto` | 기동:칼날개 AUTO / Bladewing AUTO | 0..1 / 1 / 0 | 같음 | 예 / 예 | 자동 실행 모드 미연결; 표시·저장만 | P08 Unity 미연결; `game.html:2938`; `Core/NativeOptionSet.cs:34` |
| 12 `optBossDbg` | 보스 AI 디버그 / Boss AI Debug | 0..1 / 1 / 0 | 같음 | 예 / 예 | 점수·디버그 표시 미연결; 표시·저장만 | P09 Unity 미연결; `game.html:2939`; `Core/NativeOptionSet.cs:35` |


### 화면

| 순서·ID | 이름 ko / en(양쪽) | 웹 범위·단계·기본 / 단위 | Unity | 저장 웹 / Unity | 실제 Unity 효과 | 판정·근거 |
|---|---|---|---|---|---|---|
| 1 `optShake` | 화면 흔들림 / Screen Shake | 0..100 / 1 / 80% | 같음 | 예 / 예 | 카메라/충격 ShakeScale; NativeGame.cs:401,408,415,420 | 소스 일치; `game.html:2833`; `Core/NativeOptionSet.cs:36` |
| 2 `optTextScale` | 안내 글자 크기 / Guide Text Size | 80..160 / 10 / 100% | 같음 | 예 / 예 | 안내 글꼴 배율 미연결; 표시·저장만 | P10 Unity 미연결; `game.html:2834`; `Core/NativeOptionSet.cs:37` |
| 3 `optPanelFit` | 설정 창 화면에 맞추기 / Fit Settings to Screen | 0..1 / 1 / 1 | 같음 | 예 / 예 | 고정 1920 설계축소이며 체크값을 읽지 않음; 표시·저장만 | P11 Unity 미연결; `game.html:2835`; `Core/NativeOptionSet.cs:38` |
| 4 `optParts` | 파티클 양 / Particle Amount | 5..100 / 5 / 100%; 웹 원시 기본 Electron100/그 밖80; 진단에 따라 변함 | 5..100/5/100% | 예 / 예 | 방출량 미연결. Unity 기본100, 웹 원시 기본은 Electron100/그 밖80이며 웹 진단이 추가 변경 가능; 표시·저장만 | P12 Unity 미연결; `game.html:2838`; `Core/NativeOptionSet.cs:39` |
| 5 `optFps` | FPS 제한 / FPS Limit | index0..5/1/5→30,60,120,144,244,무제한(0) | 범위 같음; 실제 신규 host120(index2) | 예 / 예 | targetFrameRate, vSyncCount=0 | P13; `game.html:2930,49584`; `NativePauseMenu.A15Web.cs:15`; `NativeGame.SettingsPersistence.cs:17`; `NativeGame.cs:724` |
| 6 `optResScale` | 해상도 스케일 / Resolution Scale | 50..100 / 10 / 100% | 같음 | 예 / 예 | 렌더 타깃·카메라 해상도 미연결; 표시·저장만 | P14 Unity 미연결; `game.html:2931`; `Core/NativeOptionSet.cs:40` |
| 7 `optIrisSz` | 유령불꽃 크기 / Ghost Flame Size | 1..100 / 1 / 20 수치 | 같음 | 예 / 예 | 유령불꽃 크기·전투 저장 irisSz와 설정값이 연결되지 않음; 표시·저장만 | P15 Unity 미연결; `game.html:2933`; `Core/NativeOptionSet.cs:41` |
| 8 `optBrightness` | 화면 명암 / Brightness | 70..130 / 1 / 100% | 같음 | 예 / 예 | 검정/흰색 덧칠; 웹 CSS 밝기와 계산·범위 차이 | P16 웹과 다름; `game.html:2934`; `Core/NativeOptionSet.cs:42` |
| 9 `optIrisGlow` | 유령 글로우 / Ghost Glow | 100..400 / 1 / 250 수치 | 같음 | 예 / 예 | 조명 반경 미연결; 표시·저장만 | P17 Unity 미연결; `game.html:2935`; `Core/NativeOptionSet.cs:43` |
| 10 `optBloom` | 블룸 효과 / Bloom Effect | 0..1 / 1 / 1 | 같음 | 예 / 예 | 블룸 켜기·끄기 미연결; 표시·저장만 | P18 Unity 미연결; `game.html:2969`; `Core/NativeOptionSet.cs:44` |
| 11 `optTrail` | 잔상 트레일 / Afterimage Trail | 0..1 / 1 / 1 | 같음 | 예 / 예 | 잔상 켜기·끄기 미연결; 표시·저장만 | P19 Unity 미연결; `game.html:2970`; `Core/NativeOptionSet.cs:45` |
| 12 `optSlash` | 슬래시 이펙트 / Slash Effect | 0..1 / 1 / 1 | 같음 | 예 / 예 | 슬래시 켜기·끄기 미연결; 표시·저장만 | P20 Unity 미연결; `game.html:2971`; `Core/NativeOptionSet.cs:46` |
| 13 `optPostfx` | 후처리 효과 / Post-Process Effect | 0..1 / 1 / 1 | 같음 | 예 / 예 | 후처리 켜기·끄기 미연결; 표시·저장만 | P21 Unity 미연결; `game.html:2972`; `Core/NativeOptionSet.cs:47` |
| 14 `optDeathFx` | 사망 이펙트 / Death Effect | 0..1 / 1 / 1 | 같음 | 예 / 예 | 사망 효과 켜기·끄기 미연결; 표시·저장만 | P22 Unity 미연결; `game.html:2973`; `Core/NativeOptionSet.cs:48` |
| 15 `optLighting` | 동적 조명 / Dynamic Lighting | 0..1 / 1 / 1 | 같음 | 예 / 예 | 동적 조명 켜기·끄기 미연결; 표시·저장만 | P23 Unity 미연결; `game.html:2974`; `Core/NativeOptionSet.cs:49` |
| 16 `optTorch` | 횃불 조명 (어둠) / Torch Lighting (Dark) | 0..1 / 1 / 1 | 같음 | 예 / 예 | 횃불 조명 켜기·끄기 미연결; 표시·저장만 | P24 Unity 미연결; `game.html:2975`; `Core/NativeOptionSet.cs:50` |
| 17 `optAtmos` | 분위기 효과 / Atmosphere | 0..2 / 1 / 2; 끔/간략/전체 = Off/Brief/All | 같음 | 예 / 예 | Off/Brief/All 값과 월드·메뉴 분위기 미연결; 표시·저장만 | P25 Unity 미연결; `game.html:2976`; `Core/NativeOptionSet.cs:51` |
| 18 `optAmbPart` | 앰비언트 파티클 / Ambient Particles | 0..1 / 1 / 0 | 같음 | 예 / 예 | 주변 파티클 켜기·끄기 미연결; 표시·저장만 | P26 Unity 미연결; `game.html:2977`; `Core/NativeOptionSet.cs:52` |
| 19 `optFog` | 안개 효과 / Fog Effect | 0..1 / 1 / 1 | 같음 | 예 / 예 | 안개 켜기·끄기 미연결; 표시·저장만 | P27 Unity 미연결; `game.html:2978`; `Core/NativeOptionSet.cs:53` |
| 20 `optGrain` | 필름 그레인 / Film Grain | 0..1 / 1 / 1 | 같음 | 예 / 예 | 그레인 효과 미연결. 상위 규칙이 그레인 금지이므로 효과를 추가하는 수리는 금지; UI 정책을 총괄이 정리할 것; 표시·저장만 | P28 Unity 미연결; `game.html:2979`; `Core/NativeOptionSet.cs:54` |
| 21 `optOutline` | 캐릭터 외곽선 / Character Outline | 0..1 / 1 / 1 | 같음 | 예 / 예 | 외곽선 켜기·끄기 미연결; 표시·저장만 | P29 Unity 미연결; `game.html:2980`; `Core/NativeOptionSet.cs:55` |
| 22 `optShowFps` | 프레임 표시 (FPS) / Show FPS | 0..1 / 1 / 0 | 같음 | 예 / 예 | DrawSettingsOverlays의 FPS 문자 켜기/끄기 | 소스 일치; `game.html:2981`; `Core/NativeOptionSet.cs:56` |
| 조건부1 `optDispMode` | 화면 모드 / Display Mode | Electron만: windowed/borderless/fullscreen; 실제 host에서 기본 읽기 | 별도행 없음; 전체화면 bool | hellcave_screen / bool만 | FullScreenWindow 또는 Windowed | P49; `game.html:2944-2947,49730-49760`; `NativeGame.SettingsPersistence.cs:63` |
| 조건부2 `optRes` | 해상도 / Resolution | Electron API 실제 목록; 현재 host에서 기본 읽기·픽셀 | 행 없음 | hellcave_screen / 없음 | 없음 | P50; `game.html:2949-2951,49733-49771`; `NativePauseMenu.A15Web.cs:152-165` |


### 사운드

| 순서·ID | 이름 ko / en(양쪽) | 웹 범위·단계·기본 / 단위 | Unity | 저장 웹 / Unity | 실제 Unity 효과 | 판정·근거 |
|---|---|---|---|---|---|---|
| 1 `optSfx` | 효과음 볼륨 / SFX Volume | 0..100 / 1 / 60% | 같음(키보드1%·마우스 정수) | 예 / 예 | sound/music/lobby SFX gain | 소스 연결; `game.html:49434-49435,49854-49855`; `NativePauseMenu.A15Web.cs:16-17,84-86,502`; `NativeGame.cs:721-722` |
| 2 `optBgm` | 음악 볼륨 / Music Volume | 0..100 / 1 / 60% | 같음(키보드1%·마우스 정수) | 예 / 예 | music/lobby 음악 gain | 소스 연결; `game.html:49434-49435,49854-49855`; `NativePauseMenu.A15Web.cs:16-17,84-86,502`; `NativeGame.cs:721-722` |
| 3 `optBgmTrack` | BGM 선택 / BGM Select | auto 기본; 73값·원문 순서 | 73값 동일, optgroup3개 표시 생략 | 예 / 예 | 선택값을 음악 호스트에 전달하지 않음 | P30; `game.html:2842-2922,49436`; `NativePauseMenu.A15Web.cs:338,346` |


### 조작

| 순서·ID | 이름 ko / en(양쪽) | 웹 범위·단계·기본 / 단위 | Unity | 저장 웹 / Unity | 실제 Unity 효과 | 판정·근거 |
|---|---|---|---|---|---|---|
| 1 `optCursor` | 마우스 커서 / Mouse Cursor | 0..1 / 1 / 0; 다크 레드/Dark Red → 다크 퍼플/Dark Purple | 같음 | 예 / 예 | 카드 선택·저장만 하고 Cursor.SetCursor 등 실제 커서 소비가 없음; 표시·저장만 | P31 Unity 미연결; `game.html:2962`; `Core/NativeOptionSet.cs:57` |
| 2 `optCursorSize` | 커서 크기 / Cursor Size | 30..200 / 5 / 50% | 같음 | 예 / 예 | 실제 커서 배율 소비가 없음; 표시·저장만 | P32 Unity 미연결; `game.html:2963`; `Core/NativeOptionSet.cs:58` |


## 탭별 부가 선택·액션·순서

| 위치·이름 ko / en | 웹 기본·순서·동작 / 저장 | Unity 실제 동작 / 저장 | 근거·차이 |
|---|---|---|---|
| 게임 캐릭터: 엑소듀서 전사/Exoduser Warrior → 실버테일/Silvertail | _charIdx(신규0)·선택시 _loadCharAtlas; 캐릭터 계통 저장은 웹 기존 경로 | 카드2개·기본 CharacterIndex0; 클릭/외부 선택 연동 없음 | P33; `game.html:49219`; `NativePauseMenu.A15Web.cs:432-460` |
| 게임 세팅1 저장/Save Preset 1 → 세팅1/Preset 1 → 세팅2 저장/Save Preset 2 → 세팅2/Preset 2 | 2슬롯, 최초비어있음. binds/binds2/opt 저장·복원 | 동일4버튼; opt·SFX·BGM·FPS 저장·복원, 키·언어 제외 | P34; `game.html:49815-49843`; `NativePauseMenu.A15Web.cs:412-425` |
| 게임 전체화면 (F11)/Fullscreen (F11) → 캐릭터 선택 (로비)/Character Select (Lobby) | 실제 host 상태; 전체화면은 런타임 플랫폼 API. 로비는 goToLobby | fullscreen bool→host 관측·저장; 로비→SaveCombatNow·ShowLobby | `game.html:3010-3011,64209`; `NativePauseMenu.A15Web.cs:401-402`; `NativeGame.SettingsPersistence.cs:59-73`; `NativeGame.cs:729`。F11 문구 자체의 기능은 이번에 실행 확인 안 함 |
| 게임 리셋 (처음부터)/Reset Game (from start) → 게임 종료/Quit Game | 리셋은 경고·확인/취소→진행삭제·로비; 종료는 플랫폼별 직접 종료 | 리셋 버튼 확인 재클릭→Restart·저장복원 가능. 종료는 별도 확인창 | P38-P40; `game.html:3015-3023,49963-49986`; `NativePauseMenu.A15Web.cs:392,405-406`; `NativeGame.cs:728` |
| 화면 그래픽 품질: 최저/Lowest → 낮음/Low → 중간/Medium → 높음/High → 울트라/Ultra | 5버튼; 11키 프리셋 일치면 선택, 그 밖 미선택(-1). 원시 parts80/100은 어느 프리셋과도 일치하지 않음 | 5버튼·11키 배열 모두 일치, DetectPreset·저장만 있고 실제 효과 없음 | P12,P18-P28; `game.html:49599-49618`; `Core/NativeOptionSet.cs:60-86`; `NativePauseMenu.A15Web.cs:408` |
| 화면 하드웨어 진단 / Hardware Diagnostics | GPU→WebGL→성능 등급/Perf Grade→벤치 FPS/Bench FPS→재진단/Re-detect. 120프레임 벤치·재검출, 저장대상 아님 | GPU→Graphics API→—→fpsShown→동작 없는 재진단. 저장대상 아님 | P35,P36,P51; `game.html:2985-2992`; `NativeGame.SettingsOptions.cs:23-30`; `NativePauseMenu.A15Web.cs:407,461-470` |
| 조작 키보드·마우스/Keyboard & Mouse → 게임패드/Gamepad | 현재 _gpActive에 따라 기본 하위탭; 선택은 세션 | 기본 Tab.Kbm; 실제 현재 입력모드 연동 없음, 선택은 세션 | P55(아래 등록); `game.html:49227-49235`; `NativeKeyBindList.cs:36,218-223` |
| 조작 키 설정 초기화 (또는 F5 키)/Reset Key Bindings (or F5) | 21행에서 19행으로 감소(irisToggle/bladeToggle 누락)·즉시 저장 | ResetAll도 동일 19행; Version 변화로 지연 저장 | 일치하는 웹 기존 결함; `game.html:49268-49279`; `Core/KeyBindings.cs:75-84`; `NativeKeyBindList.cs:67,182` |
| 조작 패드 키 초기화/Reset Pad Keys | 기본 gpKeyMap 복원·별도 localStorage 저장 | 비활성 버튼, 효과 없음 | P44; `game.html:49329-49332`; `NativeKeyBindList.cs:318` |
| 공통 닫기 [ESC]/Close [ESC] · ✓ 설정 자동 저장/Settings auto-saved | 설정닫기→전투 재개, footer 고정; 저장 동기 실행 | DirectSettings면 재개, 구형 Main 부모에서 연 설정이면 Main 복귀. 0.25초 지연 저장·실패 안내 | `game.html:3028,49394,49397`; `Core/PauseNavigation.cs:26-32,41`; `NativeGame.SettingsPersistence.cs:39-57` |


## 키보드·마우스 21행 전수

초기 순서는 양쪽 BINDS/Actions와 같다. 주 키 기본값도 전부 일치하고 보조 키는 전부 없음/None. 각 행은 키 캡처·저장 가능(ESC 취소, 반복 무시, 마우스120ms 지연, 보조삭제, 사슬/공격 충돌·구르기 마우스 금지). 실제 전투 소비는 아래와 다르다.

| 순서·동작 | 이름 ko / en(양쪽) | 기본 주 / 보조 | 실제 Unity 연결 | 근거 |
|---|---|---|---|---|
| 1 `up` | 위로 이동 / Move Up | `KeyW` / 없음 | 이동축 y | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 2 `down` | 아래로 이동 / Move Down | `KeyS` / 없음 | 이동축 y | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 3 `left` | 왼쪽 이동 / Move Left | `KeyA` / 없음 | 이동축 x | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 4 `right` | 오른쪽 이동 / Move Right | `KeyD` / 없음 | 이동축 x | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 5 `weapon` | 무기 공격 / Weapon Attack | `mouse0` / 없음 | AttackHeld | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 6 `shield` | 칼등 처내기 (탭=처내기, 홀드=연사) / Blade Parry (tap=parry, hold=rapid) | `KeyE` / 없음 | SetPlayerCombatInput 방패 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 7 `bow` | Space 분노 폭발 / Space Rage Burst | `Space` / 없음 | SetSkillInput 분노 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 8 `charge` | 사슬 이동 / Chain Dash | `ShiftLeft` / 없음 | SetPlayerCombatInput 사슬 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 9 `roll` | 구르기 (방향키 +) / Roll (Arrow Keys +) | `Space` / 없음 | SetRollInput(키보드만) | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 10 `parry` | 데빌포스 흡수 / Devilforce Absorb | `KeyQ` / 없음 | SetPlayerCombatInput 패링 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 11 `beam` | 마법 (탭=투사체, 홀드=빔) / Magic (tap=projectile, hold=beam) | `mouse2` / 없음 | SetMagicInput | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 12 `forge` | 대장간 / Forge | `KeyG` / 없음 | OnPanelHotkeyRequested 대장간 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 13 `inventory` | 인벤토리 / Inventory | `Tab` / 없음 | SetInventory/창전환 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 14 `settings` | 설정 / Settings | `Escape` / 없음 | 설정 직행/고정 ESC도 유지 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 15 `interact` | 아이템 줍기 / Pick Up Item | `KeyR` / 없음 | Simulation.Tick 상호작용 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 16 `storage` | 보관함 / Storage | `KeyN` / 없음 | P45 소비 없음 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 17 `stats` | 능력치 (스탯/패시브) / Stats (Stats/Passives) | `KeyJ` / 없음 | OnPanelHotkeyRequested 능력치 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 18 `skill` | 전투 스킬 / Combat Skills | `KeyK` / 없음 | SetSkills/창전환 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 19 `skillCycle` | 스킬 슬롯 배정 / Skill Slot Assign | `KeyL` / 없음 | P46 소비 없음 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 20 `irisToggle` | 유령불꽃 켜기/끄기 / Ghost Flame On/Off | `KeyY` / 없음 | P47 소비 없음 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |
| 21 `bladeToggle` | 기동칼날개 자동 켜기/끄기 / Bladewing Auto On/Off | `KeyU` / 없음 | P48 소비 없음 | `game.html:6322-6340,6392-6415`; `Core/KeyBindings.cs:12-17`; `NativeGame.cs:285-344,529-536,709-710` |


이동·공격 등은 NativeKeyBindInput이 주/보조 양쪽을 읽는다. 키보드만으로 목록 행에 초점을 옮기는 경로는 P42, 패드 재지정은 P43으로 별도 결함이다. 저장은 `Core/NativeSettingsStore.cs:140-144`, `NativeGame.SettingsPersistence.cs:24,50`의 Version 감시 경로이며 세션 전용이라는 예전 주석을 현재 상태로 인용하지 않았다.


## 패드 9행 전수

웹 원시 기본 `_GP_KEY_DEFAULT`는 9개다. `_gpActNames`의 14개 이름을 14행으로 잘못 세지 않는다. D-pad는 웹 고정 패널 토글이며 설정 행에 없다.

| 순서·버튼 | 이름 ko / en | 웹 기본키·편집·저장 | Unity UI·효과·저장 | 근거 |
|---|---|---|---|---|
| 1 A | 무기 공격 / Weapon Attack | `mouse0`; 고정·편집불가 | 고정 라벨; 매핑 편집 없음 | `game.html:13834-13849,49289-49332`; `Resources/Data/keybind_ui_web.json:1`; `NativeKeyBindList.cs:299-329` |
| 2 B | B슬롯 스킬 / B-Slot Skill | `Space`; 고정·편집불가 | 고정 라벨; 매핑 편집 없음 | `game.html:13834-13849,49289-49332`; `Resources/Data/keybind_ui_web.json:1`; `NativeKeyBindList.cs:299-329` |
| 3 X | 우클릭 스킬 / R-Click Skill | `KeyE`; 고정·편집불가 | 고정 라벨; 매핑 편집 없음 | `game.html:13834-13849,49289-49332`; `Resources/Data/keybind_ui_web.json:1`; `NativeKeyBindList.cs:299-329` |
| 4 Y | 패링 / Parry | `KeyQ`; 고정·편집불가 | 고정 라벨; 매핑 편집 없음 | `game.html:13834-13849,49289-49332`; `Resources/Data/keybind_ui_web.json:1`; `NativeKeyBindList.cs:299-329` |
| 5 LB | 돌진/사슬 / Dash/Chain | `ShiftLeft`; 편집가능·gpKeyMap 저장 | 미이식 라벨·비활성; 편집/저장 없음 | `game.html:13834-13849,49289-49332`; `Resources/Data/keybind_ui_web.json:1`; `NativeKeyBindList.cs:299-329` |
| 6 RB | Ctrl 스킬 / Ctrl Skill | `ControlLeft`; 편집가능·gpKeyMap 저장 | 미이식 라벨·비활성; 편집/저장 없음 | `game.html:13834-13849,49289-49332`; `Resources/Data/keybind_ui_web.json:1`; `NativeKeyBindList.cs:299-329` |
| 7 Start | 설정 / Settings | `Escape`; 편집가능·gpKeyMap 저장 | 미이식 라벨·비활성; 편집/저장 없음 | `game.html:13834-13849,49289-49332`; `Resources/Data/keybind_ui_web.json:1`; `NativeKeyBindList.cs:299-329` |
| 8 L3 | 줍기 / Pick Up | `KeyR`; 편집가능·gpKeyMap 저장 | 미이식 라벨·비활성; 편집/저장 없음 | `game.html:13834-13849,49289-49332`; `Resources/Data/keybind_ui_web.json:1`; `NativeKeyBindList.cs:299-329` |
| 9 R3 | 마법 / Magic | `mouse2`; 편집가능·gpKeyMap 저장 | 미이식 라벨·비활성; 편집/저장 없음 | `game.html:13834-13849,49289-49332`; `Resources/Data/keybind_ui_web.json:1`; `NativeKeyBindList.cs:299-329` |

Unity의 일반 패드 지원 자체와 이 화면의 사용자 매핑 지원은 별개다. `NativeKeyBindList.DrawPad`에는 재지정·초기화 경로가 없다는 판정이다.


## 차이 등록부(유일 ID 기준)

| ID | 분류 | 차이·실제 연결 | 웹·Unity 근거 |
|---|---|---|---|
| P01 | 웹과 다름 | **움직임 줄이기 항목 누락** — 웹 게임 탭에 남는 reduceMotion 체크가 Unity 목록에 없다. 저장 속성과 화면 전환 소비는 이미 있으나 사용자가 켜고 끌 수 없다. | `game.html:2836`; `Core/NativeOptionSet.cs:72`; `NativePauseMenu.A15Web.cs:131`; `NativeGame.SettingsPersistence.cs:37` |
| P02 | Unity 미연결 | **언어 재시작 보존 누락** — 선택은 lobby.SetLanguage로 즉시 반영하나 설정 저장은 lang을 직렬화하지 않는다. 로비 기본은 ko. 웹은 opt.lang과 hellLang을 저장한다. | `game.html:49397`; `NativeGame.cs:153`; `NativeLobby.cs:19`; `Core/NativeOptionSet.cs:88` |
| P03 | 웹과 다름 | **난이도 적용 시점** — Unity는 ResetRun의 config에만 diff를 읽는다. 웹은 변경 즉시 applyStats 및 이후 적 생성에서 읽는다. 현재 전투에 즉시 반영되지 않는다. | `game.html:49560`; `NativeGame.cs:229`; `NativeGame.SettingsOptions.cs:16` |
| P04 | Unity 미연결 | **유물 자동합성** — 자동 합성 처리 미연결; 값 표시와 opt 저장만 확인. | `game.html:2928`; `Core/NativeOptionSet.cs:30`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P05 | Unity 미연결 | **유물 자동강화** — 자동 강화 처리 미연결; 값 표시와 opt 저장만 확인. | `game.html:2929`; `Core/NativeOptionSet.cs:31`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P06 | Unity 미연결 | **석궁 자동발사** — 체크값과 Simulation.ToggleCrossbowAuto가 서로 연결되지 않음; 값 표시와 opt 저장만 확인. | `game.html:2936`; `Core/NativeOptionSet.cs:32`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P07 | Unity 미연결 | **버스트루프 당기기** — 전투 당기기 모드 미연결; 값 표시와 opt 저장만 확인. | `game.html:2937`; `Core/NativeOptionSet.cs:33`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P08 | Unity 미연결 | **칼날개 AUTO** — 자동 실행 모드 미연결; 값 표시와 opt 저장만 확인. | `game.html:2938`; `Core/NativeOptionSet.cs:34`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P09 | Unity 미연결 | **보스 AI 디버그** — 점수·디버그 표시 미연결; 값 표시와 opt 저장만 확인. | `game.html:2939`; `Core/NativeOptionSet.cs:35`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P10 | Unity 미연결 | **안내 글자 크기** — 안내 글꼴 배율 미연결; 값 표시와 opt 저장만 확인. | `game.html:2834`; `Core/NativeOptionSet.cs:37`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P11 | Unity 미연결 | **설정 창 화면에 맞추기** — 고정 1920 설계축소이며 체크값을 읽지 않음; 값 표시와 opt 저장만 확인. | `game.html:2835`; `Core/NativeOptionSet.cs:38`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P12 | Unity 미연결 | **파티클 양** — 방출량 미연결. Unity 기본100, 웹 원시 기본은 Electron100/그 밖80이며 웹 진단이 추가 변경 가능; 값 표시와 opt 저장만 확인. | `game.html:2838`; `Core/NativeOptionSet.cs:39`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P13 | 웹과 다름 | **새 설정 FPS 기본120** — NativeSettingsState 선언 기본0과 달리 실제 InitializeNativeSettings는 120으로 만든다. 웹 실제 OPT 기본0(제한없음). 기존 저장값이 있으면 양쪽 모두 저장값 우선. | `game.html:6449`; `NativeGame.SettingsPersistence.cs:17`; `Core/NativeSettingsState.cs:10` |
| P14 | Unity 미연결 | **해상도 스케일** — 렌더 타깃·카메라 해상도 미연결; 값 표시와 opt 저장만 확인. | `game.html:2931`; `Core/NativeOptionSet.cs:40`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P15 | Unity 미연결 | **유령불꽃 크기** — 유령불꽃 크기·전투 저장 irisSz와 설정값이 연결되지 않음; 값 표시와 opt 저장만 확인. | `game.html:2933`; `Core/NativeOptionSet.cs:41`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P16 | 웹과 다름 | **밝기 계산과 적용 범위** — 웹은 캔버스 CSS brightness(b/100); Unity는 b<100 검정 alpha, b>100 흰색 alpha (b-100)/200 덧칠. 설정 창을 그린 뒤에도 적용해 메뉴까지 바뀐다. | `game.html:49592`; `NativeGame.SettingsOptions.cs:39`; `NativeGame.cs:568` |
| P17 | Unity 미연결 | **유령 글로우** — 조명 반경 미연결; 값 표시와 opt 저장만 확인. | `game.html:2935`; `Core/NativeOptionSet.cs:43`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P18 | Unity 미연결 | **블룸 효과** — 블룸 켜기·끄기 미연결; 값 표시와 opt 저장만 확인. | `game.html:2969`; `Core/NativeOptionSet.cs:44`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P19 | Unity 미연결 | **잔상 트레일** — 잔상 켜기·끄기 미연결; 값 표시와 opt 저장만 확인. | `game.html:2970`; `Core/NativeOptionSet.cs:45`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P20 | Unity 미연결 | **슬래시 이펙트** — 슬래시 켜기·끄기 미연결; 값 표시와 opt 저장만 확인. | `game.html:2971`; `Core/NativeOptionSet.cs:46`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P21 | Unity 미연결 | **후처리 효과** — 후처리 켜기·끄기 미연결; 값 표시와 opt 저장만 확인. | `game.html:2972`; `Core/NativeOptionSet.cs:47`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P22 | Unity 미연결 | **사망 이펙트** — 사망 효과 켜기·끄기 미연결; 값 표시와 opt 저장만 확인. | `game.html:2973`; `Core/NativeOptionSet.cs:48`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P23 | Unity 미연결 | **동적 조명** — 동적 조명 켜기·끄기 미연결; 값 표시와 opt 저장만 확인. | `game.html:2974`; `Core/NativeOptionSet.cs:49`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P24 | Unity 미연결 | **횃불 조명** — 횃불 조명 켜기·끄기 미연결; 값 표시와 opt 저장만 확인. | `game.html:2975`; `Core/NativeOptionSet.cs:50`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P25 | Unity 미연결 | **분위기 효과** — Off/Brief/All 값과 월드·메뉴 분위기 미연결; 값 표시와 opt 저장만 확인. | `game.html:2976`; `Core/NativeOptionSet.cs:51`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P26 | Unity 미연결 | **앰비언트 파티클** — 주변 파티클 켜기·끄기 미연결; 값 표시와 opt 저장만 확인. | `game.html:2977`; `Core/NativeOptionSet.cs:52`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P27 | Unity 미연결 | **안개 효과** — 안개 켜기·끄기 미연결; 값 표시와 opt 저장만 확인. | `game.html:2978`; `Core/NativeOptionSet.cs:53`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P28 | Unity 미연결 | **필름 그레인** — 그레인 효과 미연결. 상위 규칙이 그레인 금지이므로 효과를 추가하는 수리는 금지; UI 정책을 총괄이 정리할 것; 값 표시와 opt 저장만 확인. | `game.html:2979`; `Core/NativeOptionSet.cs:54`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P29 | Unity 미연결 | **캐릭터 외곽선** — 외곽선 켜기·끄기 미연결; 값 표시와 opt 저장만 확인. | `game.html:2980`; `Core/NativeOptionSet.cs:55`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P30 | Unity 미연결 | **BGM 선택** — 73개 값·순서는 웹과 같지만 선택은 Options.BgmTrack 저장만 한다. 음악 호스트로 선택한 곡을 전달하는 호출이 없다. | `game.html:49436`; `NativePauseMenu.A15Web.cs:346`; `NativeGame.SettingsOptions.cs:10` |
| P31 | Unity 미연결 | **커서 종류** — 카드 선택·저장만 하고 Cursor.SetCursor 등 실제 커서 소비가 없음; 값 표시와 opt 저장만 확인. | `game.html:2962`; `Core/NativeOptionSet.cs:57`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P32 | Unity 미연결 | **커서 크기** — 실제 커서 배율 소비가 없음; 값 표시와 opt 저장만 확인. | `game.html:2963`; `Core/NativeOptionSet.cs:58`; `NativeGame.SettingsOptions.cs:10`; `NativePauseMenu.A15Web.cs:81` |
| P33 | Unity 미연결 | **설정 캐릭터 카드** — 웹은 클릭하면 _loadCharAtlas(ci). Unity DrawCard는 character일 때 클릭을 처리하지 않고 CharacterIndex 외부 대입도 없다. 기본0의 선택 표시는 실제 로비 캐릭터와 불일치 가능. | `game.html:49219`; `NativePauseMenu.A15Web.cs:432`; `NativePauseMenu.A15Web.cs:458` |
| P34 | 웹과 다름 | **프리셋 저장 범위** — 웹은 binds/binds2/opt(언어 포함), Unity는 opt/sfxVol/bgmVol/fpsCap만 저장한다. 키 변경을 프리셋으로 복구할 수 없고 빈 슬롯 피드백도 없다. | `game.html:49815`; `game.html:49827`; `NativePauseMenu.A15Web.cs:412`; `NativePauseMenu.A15Web.cs:417` |
| P35 | Unity 미연결 | **재진단 버튼** — 웹은 벤치/등급 갱신, Unity Activate의 rediag 분기가 즉시 break. 누를 수 있으나 아무 효과가 없다. | `game.html:49780`; `NativePauseMenu.A15Web.cs:407` |
| P36 | 웹과 다름 | **성능 등급·벤치 FPS** — 웹은 S/A/B/C와 120프레임 측정; Unity는 성능등급 —, 벤치 칸에는 일반 프레임 계수 fpsShown을 넣는다. 벤치마크가 아니다. | `game.html:49788`; `NativeGame.SettingsOptions.cs:28`; `NativeGame.SettingsOptions.cs:35` |
| P37 | 웹과 다름 | **설정 재진입 스크롤** — 웹은 재진입과 탭 클릭마다 본문 scrollTop=0. Unity OpenSettingsDirect/탭 전환은 a15Scroll 배열을 비우지 않아 이전 스크롤이 남는다. | `game.html:2659`; `ui-panels.js:94-98,158-162`; `NativePauseMenu.A15Web.cs:33`; `NativePauseMenu.A15Web.cs:31` |
| P38 | 웹과 다름 | **리셋 확인·취소** — 웹은 경고 문구와 확인·취소 두 버튼. Unity는 원래 버튼 글자를 확인으로 바꾸고 재클릭하면 Restart. resetNo 라벨은 있어도 취소 조작은 그리지 않는다. | `game.html:3016`; `game.html:49964`; `NativePauseMenu.A15Web.cs:392`; `NativePauseMenu.A15Web.cs:405` |
| P39 | 웹과 다름 | **게임 리셋 실제 효과** — 웹 확인은 해당 진행 데이터를 지우고 로비로 이동. Unity Restart는 ResetRun→CombatBeginRun에서 같은 캐릭터 저장을 다시 읽을 수 있다. 처음부터라는 라벨과 맞지 않는다. 삭제 구현은 이번 범위 밖. | `game.html:49972`; `NativeGame.cs:728`; `NativeGame.CombatSave.cs:36`; `NativeGame.CombatSave.cs:44` |
| P40 | 웹과 다름 | **종료 동선** — 웹 설정 종료는 NW/Electron 즉시 종료, 브라우저 닫기 실패시 로비. Unity는 Quit 확인 페이지를 거친다. 변경 의도 승인 근거가 없어 동선 차이로만 기록. | `game.html:49968`; `NativePauseMenu.A15Web.cs:406` |
| P41 | 웹과 다름 | **게임 시스템 구역 순서** — 웹의 DOM/탐색 순서는 언어→캐릭터→프리셋→전체화면·로비→리셋→종료→게임 옵션. Unity 탐색은 언어→전체화면·로비→프리셋→캐릭터→게임 옵션→리셋·종료. 시각 그리드는 별도라 DOM/탐색 차이로 한정. | `game.html:2659`; `ui-panels.js:110-122`; `NativePauseMenu.A15Web.cs:137` |
| P42 | 웹과 다름 | **키 목록 키보드 접근** — 웹 키 버튼은 실제 button이며 Tab으로 각 슬롯에 접근. Unity 조작 탭 탐색 행은 커서2개+크기1개뿐이고 Keys는 nav=false. 슬롯 클릭 후 캡처는 가능하나 키보드만으로 슬롯을 고르는 경로가 없다. | `game.html:49224`; `NativePauseMenu.A15Web.cs:34`; `NativePauseMenu.A15Web.cs:177`; `NativeKeyBindList.cs:274` |
| P43 | Unity 미연결 | **패드 재지정** — 웹 9행 중 LB/RB/Start/L3/R3 5행을 재지정·gpKeyMap 저장한다. Unity는 이 5행에 미이식을 표시하며 입력 버튼이 없다. 나머지4행은 양쪽 고정. | `game.html:13834`; `game.html:49315`; `NativeKeyBindList.cs:300`; `NativeKeyBindList.cs:314` |
| P44 | Unity 미연결 | **패드 키 초기화** — 웹은 gpKeyMap 기본값 복원·저장. Unity 초기화 버튼은 enabled=false. 일반 키 초기화(F5)와 구분. | `game.html:49332`; `NativeKeyBindList.cs:318` |
| P45 | Unity 미연결 | **보관함 키** — 행 이름·주/보조 키 변경·저장은 있으나 NativeKeyBindInput.Down/Held 등의 이 동작 소비 참조가 없다. 실제 기능이 연결됐다고 판정할 수 없다. | `game.html:6322`; `Core/KeyBindings.cs:12`; `NativeKeyBindInput.cs:41`; `Runtime 전체 storage 입력 소비 검색 0건` |
| P46 | Unity 미연결 | **스킬 슬롯 배정 키** — 행 이름·주/보조 키 변경·저장은 있으나 NativeKeyBindInput.Down/Held 등의 이 동작 소비 참조가 없다. 실제 기능이 연결됐다고 판정할 수 없다. | `game.html:6322`; `Core/KeyBindings.cs:12`; `NativeKeyBindInput.cs:41`; `Runtime 전체 skillCycle 입력 소비 검색 0건` |
| P47 | Unity 미연결 | **유령불꽃 토글 키** — 행 이름·주/보조 키 변경·저장은 있으나 NativeKeyBindInput.Down/Held 등의 이 동작 소비 참조가 없다. 실제 기능이 연결됐다고 판정할 수 없다. | `game.html:6322`; `Core/KeyBindings.cs:12`; `NativeKeyBindInput.cs:41`; `Runtime 전체 irisToggle 입력 소비 검색 0건` |
| P48 | Unity 미연결 | **칼날개 토글 키** — 행 이름·주/보조 키 변경·저장은 있으나 NativeKeyBindInput.Down/Held 등의 이 동작 소비 참조가 없다. 실제 기능이 연결됐다고 판정할 수 없다. | `game.html:6322`; `Core/KeyBindings.cs:12`; `NativeKeyBindInput.cs:41`; `Runtime 전체 bladeToggle 입력 소비 검색 0건` |
| P49 | 웹과 다름 | **화면 모드 조건부 항목** — 웹 Electron API 환경에만 windowed/borderless/fullscreen 선택 행이 보인다. Unity에는 전체화면 bool만 있으며 true는 FullScreenWindow다. 일반 브라우저/NW에는 웹 행도 숨겨져 있다. | `game.html:2945`; `game.html:49730`; `NativeGame.SettingsPersistence.cs:63` |
| P50 | 웹과 다름 | **해상도 조건부 항목** — 웹 Electron은 실제 해상도 목록·창 크기/렌더 해상도를 바꾸고 hellcave_screen에 저장한다. Unity 설정에는 해당 선택 행이 없다. resScale과 별개. | `game.html:2950`; `game.html:49762`; `NativePauseMenu.A15Web.cs:152` |
| P51 | 의도된 차이 | **그래픽 API 진단 표기** — Unity의 Graphics API는 SystemInfo.graphicsDeviceType/version을 보여준다. 웹 WebGL 표기를 억지로 복제하지 않는 엔진 차이. | `game.html:2988`; `NativeGame.SettingsOptions.cs:27` |
| P52 | 의도된 차이 | **설정 저장 매체** — 웹 localStorage 대신 Unity native-settings-v1/settings.v1.json v2에 저장하는 플랫폼 차이. 저장 성공/실패 안내와 QA 저장 차단은 유지한다. | `game.html:49397`; `NativeGame.SettingsPersistence.cs:43`; `Core/NativeSettingsStore.cs:143` |
| P53 | 웹과 다름 | **최소 줍기 등급 즉시정리** — 양쪽 줍기 필터는 연결돼 있지만 웹 oninput은 이미 떨어진 낮은 등급 worldItems를 즉시 삭제한다. Unity host는 필터값만 넣고 기존 드롭을 정리하지 않는다. | `game.html:49565`; `game.html:49566`; `NativeGame.SettingsOptions.cs:19`; `Core/WorldDrop.cs:65` |
| P54 | 웹과 다름 | **최소 줍기 티어 즉시정리** — 양쪽 요구레벨 필터는 연결되나 웹 변경 핸들러의 기존 드롭 정리 동작은 Unity host에 없다. | `game.html:49568`; `game.html:49568-49577`; `NativeGame.SettingsOptions.cs:19` |
| P55 | 웹과 다름 | **키 목록 기본 입력모드** — 웹은 현재 _gpActive를 보고 처음 하위탭을 고르지만 Unity CurrentTab은 항상 Kbm으로 생성된다. | `game.html:49228`; `NativeKeyBindList.cs:36` |
| P56 | 웹에 없음 | **키 저장 상태 보조문구** — Unity는 키 목록 아래 자동 저장/실패/QA 저장안함 문구를 추가한다. 웹 목록에는 이 줄이 없고 공통 footer만 있다. 실제 저장 상태 전달 목적이나 화면 배치·번역은 별도 검수. | `game.html:2996`; `NativePauseMenu.A15Web.cs:480`; `NativeKeyBindList.cs:200` |


## 같은 값과 공통 미연결을 오판하지 않은 항목


- 자동 물약 HP기준은 양쪽 표시·저장만 한다. 웹 전투 game.html:36341-36350과 Unity Core/AutoPotion.cs:99-110은 회복량만큼 비어야 소비한다. 이 레인에서 Core 조건을 수정하거나 웹 기준과 다르다고 결함을 추가하지 않았다.

- SFX/BGM 실제 기본60, 슬라이더/키보드 단계1, FPS목록30/60/120/144/244/무제한, 73 BGM 값의 순서, 그래픽 5프리셋 11값, 난이도/줍기/유물 성급 표시의 수치·단계는 소스 일치다. 볼륨 청취와 실제 재생 gain 동등성은 실행하지 않아 미검증이다.

- SSAA(`optSsaa`)는 웹에 핸들러만 남아 있고 현재 game.html에 입력 요소가 없다. petAuto/bossFog/hitStop/quality도 이 4탭의 활성 입력으로 세지 않았다. 잔존 코드만으로 Unity 누락 항목을 만들지 않는다.

- 실제 ESC는 양쪽 모두 설정을 직접 연다(`game.html:13525-13526`, `NativeGame.cs:314-317`, `Core/PauseNavigation.cs:13-14`). BRIEF의 “ESC→일시정지→설정”을 중간 Main 화면이 제품에 뜬다는 뜻으로 해석하지 않는다. Unity Main 4버튼은 소스에 남지만 일반 ESC 진입은 DirectSettings다.


## 적용하지 않은 제안 패치


범위가 작고 원인이 확정된 2건만 제안한다. 패치는 지정 Unity 베이스용이며 실제 작업본에 적용하지 않았다. 원문 LF는 LF로 유지했다. 그 외 효과 연결은 Core·렌더·오디오·i18n 담당의 계약이 필요해 임의 광역 패치를 만들지 않았다. 특히 리셋 저장삭제는 별도 정책 확정 대상이다.


### 01-new-settings-fps-default.patch

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeGame.SettingsPersistence.cs b/unity/Assets/Exoduser/Runtime/NativeGame.SettingsPersistence.cs
--- a/unity/Assets/Exoduser/Runtime/NativeGame.SettingsPersistence.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeGame.SettingsPersistence.cs
@@ -14,7 +14,7 @@
   bool SettingsFixtureRequested {get{return Array.IndexOf(Environment.GetCommandLineArgs(),NativeSettingsStorageScope.FixtureArgument)>=0;}}
   void InitializeNativeSettings()
   {
-   settings=new NativeSettingsState(120);cinSeen=false;var args=Environment.GetCommandLineArgs();string directory;
+   settings=new NativeSettingsState();cinSeen=false;var args=Environment.GetCommandLineArgs();string directory;
    if(SettingsFixtureRequested&&!SettingsQaIdentity){nativeSettingsStatus=NativeSettingsStoreStatus.IoError;return;}
    if(NativeSettingsStorageScope.TryResolve(args,NativeQaSandbox.Resolve(Application.persistentDataPath),Application.productName,Application.identifier,out directory,out nativeSettingsStatus)){
     nativeSettingsDirectory=directory;nativeSettingsStore=new NativeSettingsStore(directory,NativeSettingsJsonCodec.Encode,NativeSettingsJsonCodec.Decode,settings,Screen.fullScreen);
```


### 02-settings-reopen-scroll.patch

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativePauseMenu.A15Web.cs b/unity/Assets/Exoduser/Runtime/NativePauseMenu.A15Web.cs
--- a/unity/Assets/Exoduser/Runtime/NativePauseMenu.A15Web.cs
+++ b/unity/Assets/Exoduser/Runtime/NativePauseMenu.A15Web.cs
@@ -30,7 +30,7 @@
   public int A15OpenSelectIndex{get{return openSelect;}}
   public void A15SetScrollForQa(float v){a15Scroll[tab]=v;}
   public void A15OpenSelectForQa(string id){var items=Items();for(int i=0;i<items.Count;i++)if(items[i].id==id){openSelect=i;popupScroll=0;}}
-  public void OpenSettingsDirect(){navigation.Reset();openSelect=-1;resetConfirm=false;navigation.DirectSettings=true;ShowSettings();}
+  public void OpenSettingsDirect(){navigation.Reset();Array.Clear(a15Scroll,0,a15Scroll.Length);openSelect=-1;resetConfirm=false;navigation.DirectSettings=true;ShowSettings();}
   public static int[] A15NavRows(){return new[]{21,28,3,3};}
   // ---- text / fonts ----
   Font FontFor(string locale)
```


01은 저장파일이 없는 최초 부팅만 바꾸며 기존 저장 FPS는 계속 복원된다. 02는 재진입만 고치고 탭 전환시 scrollTop=0 차이는 남긴다. 코드 적용·컴파일·실게임 검증은 모두 미실시다.


## 남은 일·인계


1. Unity 총괄: P39 리셋 라벨/진행 초기화 정책, 미연결 설정의 실제 연결/숨김, P38 확인·취소를 먼저 결정한다. 브리프 금지에 따라 사용자 데이터 삭제 구현을 제안 패치에 넣지 않았다.

2. UI 소유: 캐릭터 카드·키 목록 키보드 초점·패드 매핑·순서·진단·스크롤. NativePanelTabBar 및 겹침 수리는 ui-overlap-burn 담당이 진행한다.

3. 오디오/렌더 소유: 곡 선택, 리소스 배율·그래픽 체크·커서 host. 그레인과 원근/먼 적 가독성은 상위 규칙이 우선이다.

4. i18n-code 소유: 언어 저장·복원과 새 제어 라벨. ko/en 소스 대조0불일치를 29언어 로더 정상화로 대신하지 않는다.

5. 적용 후 Mac: ESC 직행→4탭→주/보조 키 변경·취소→닫기·전투복귀→재시작 저장 복원, 실제 BGM/화면효과 변화, 1920/3840 1x·3x를 판정한다. 이 레인에서는 G4·바탕화면 실행본 SHA를 검증하지 않았다.

6. docs 전파 초안: “2026-11-04 일시정지/설정 4탭 소스 감사. 본 문서 참조, 코드 적용0·실기 미검증.” BRIEF가 새 문서 하나만 허용하므로 CHANGELOG_SYNC와 기존 A15/설정 문서는 수정하지 않았다. 총괄이 병합할 때 이 초안을 반영한다. 기존 문서의 키20행·패드9행 이력 중 키20은 현재21과 달라 새 표를 우선 참고한다.


## 검증·운영 기록


- CLAUDE.md를 지정 rules checkout의 origin/unity/main에서 먼저 읽고 작업/운영 매뉴얼·설정·일시정지·A15·A16 문서를 읽었다. LANES.md의 레인 시작과 다른 UI/i18n 소유를 확인했다.

- E: NTFS 여유 약1.26TB, I: exFAT 여유 약9.64TB. 자기 sparse worktree 신규 생성, 시작 tracked/untracked 변경0. rules checkout의 기존 tools/guard.baseline.json 수정은 읽거나 수정하지 않았다.

- 명령 셸은 지정한 절대 WindowsPowerShell 경로와 login:false(NoProfile)로 실행했다. stdin 대기 방지는 PowerShell 문법에 맞는 `$null |`와 Node 자식프로세스 stdio ignore로 처리했다(Unix의 `</dev/null` 상당). tty:true 한 번은 본문 실행 전에 WindowsApps pwsh.exe CreateProcessW 오류5로 실패했다. 문서의 터미널 대체 절차를 읽고 작동하는 비PTY 절대 PowerShell 호출로 계속했으며 실패 호출은 실행 증거로 세지 않았다.

- 검증: 제품 파일 diff 0, 패치 2개 git apply --check 드라이런 성공(미적용), 차이 ID 56개 중복0·4탭/키21행/패드9행 대조, ko/en 단일문구 불일치0·BGM 73값 동일. 문서 numstat와 ignore-cr-at-eol numstat는 모두 340추가/0삭제로 동일. 기존 CRLF 파일 수정0. git diff --check는 실행하지 않았다.

- 자기 임시 oracle 추출본·생성 스크립트는 보고와 원격 보존 확인 후 삭제한다. 기존 BRIEF.md/run.log는 보존한다.


END

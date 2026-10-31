## 2026-10-27 A05 시작 안내 4쪽 물약 문구

PC UI/QA 확정에 따라 `NativeLobby.StartupPresentation.cs`의 4쪽 하단 note만 수정했다. `GuideRows`·뒤따르는 조작 hint·4쪽 본문·영상·Core·설정 저장은 그대로다.

| 표시 ID·위치 | 언어 | 현재 문자열 | 수치·실제 동작 |
|---|---|---|---|
| Guide 4/4 하단 `note` | ko | `물약은 자동 사용` | HP% 설정값·임계값 표시 없음 |
| Guide 4/4 하단 `note` | en | `Potions activate automatically` | HP% 설정값·임계값 표시 없음 |
| B11 자동 물약 조건 | Core `AutoPotion.Tick` | 안내문이 아닌 실행 조건 | 부족 HP ≥ `HealAmount`, HP>0, 악의구슬>0, 쿨다운≤0, 패링 실습 중 아님 |

원본 웹/기존 Godot 문구는 그쪽 이력으로 남기며 이 Mac UI 변경과 동일한 구현 상태로 간주하지 않는다. Mac Game 설정 탭은 현재 전체 화면 카드만 제공하고 HP% 설정 API가 없다. 코드 한 줄 문구 변경만 소스 대조했으며 새 Player 화면·청각 검수는 하지 않았다.

## 2026-10-27 A05 세계관 재방문 진입 후속

이 문서의 캐릭터 입장 이야기·네메시스·안내와 별도로 앱 최초 FDG/제목/세계관 진입에 오프라인 `cinSeen` 완료 표식을 연결했다. 2026-10-30 PC 사용자 수정부터 일반 재시작은 완료 표식과 무관하게 FDG→타이틀 메뉴→인장 ENTER→현행 세계관 영상→로비다. 로비 직행은 명시 --unity-quick-start에서만 허용한다. 완료 표식 자체는 실제 세계관 완료/마지막 cue 또는 5초 명시 hold에서만 기록한다. 인게임 로비 복귀와 이야기 다시 보기는 기존 동선이다. [저장·완료 조건과 Editor 검증](UNITY_MAC_A05_CINSEEN_20261027.md).

# UNITY Mac — 캐릭터 입장 이야기·최초 안내 연결

2026-10-27 QA 전용 의미 프레임으로 실제 안내 초기 250ms gate, skip focus 중 A=다음, Start=즉시 건너뛰기와 4/4 물약 문구를 확인했다. [최종 18/18 영수증·격리 검토 앱](UNITY_MAC_FRONTEND_PAD_INTEGRATED_QA_20261027.md#최종-rev4--동시-입력-회귀와-패드-힌트). 실제 OS 패드 판정은 HOLD다.

같은 Rev4 앱의 별도 빈 root에서 제목→정본 세계관 자연 종료→전사 생성/영상 자연 종료→네메시스 Return 대사→안내 1~4→필드 HUD/W 이동까지 일반 키보드 동선도 [후속 화면·설정·로스터](UNITY_MAC_FRONTEND_PAD_INTEGRATED_QA_20261027.md#rev4-일반-키보드-자연-경로-후속--2026-10-27)로 확인했다. 4/4 `물약은 자동 사용` 실화면 포함. 물리 패드·마우스·공격·청음 검수는 아니다.

## 2026-10-27 기존 패드 Confirm/Start 논리 분기

전사 이야기와 공유하는 `FrontendPadPolicy`가 기존 네이티브 Confirm(버튼 0), Cancel(버튼 1), Start(기존 버튼 7/9) 읽기만 소비한다. `GuideRows`·표시 hint·키보드 Tab/Enter/Space·마우스·영상·저장은 그대로다.

| 화면·입력 ID | 적용 위치 | 실제 분기·시간 | 검수 경계 |
|---|---|---|---|
| 네메시스 Confirm Down | `UpdateStartupEntry` | 현재 대사 전문 표시/다음 컷 `Advance` | 기존 버튼 0 |
| 네메시스 Cancel Held / Start Down | `FrontendEntryFlow.Tick` / `Skip` | Cancel은 기존 2초 hold, Start는 즉시 Guide | 기존 버튼 1/7/9 |
| 안내 1~4 Confirm Down | `UpdateStartupEntry` → `Advance` | 키보드 `guideSkipFocus`와 무관하게 다음; 기존 250ms gate 유지 | 기존 버튼 0 |
| 안내 1~4 Start Down | `UpdateStartupEntry` → `Skip` | 즉시 Guide 종료; 같은 프레임 Confirm보다 우선 | 기존 버튼 7/9 |
| 진입·페이지 전환·focus | `FrontendPadPolicy` | 현재 눌린 버튼 전부 해제 후 새 edge만 수용, 프레임당 1회 | 실제 OS 패드 입력 미검수 |

순수 논리 Editor 검사 20/20과 ARM64 Settings QA 빌드 1회 오류 0을 확인했다. 이는 물리 패드·기종별 버튼 표기·전체 웹 패드 동등성 PASS가 아니다. 별도 X/Y/2/3 물리 매핑, 새 Input System package, 전투 `Simulation`/세이브 확장은 없다.

최종 Rev4에서 패드 감지 중 네메시스 하단 힌트를 ko `A 다음 / B 길게 / Start 건너뛰기`, en `A Next / Hold B / Start Skip`으로 보강했다. 일반 키보드 힌트는 그대로다. 최종 Editor 22/22·실제 로비 18/18이며 위 20/20·빌드1회는 최초 연결 후보의 당시 기록이다. [최종 앱과 시각 증거](UNITY_MAC_FRONTEND_PAD_INTEGRATED_QA_20261027.md#최종-rev4--동시-입력-회귀와-패드-힌트).

## ROOT 최종 인수 — 2026-10-25

ROOT 통합 인수(source9dd5991057da5d8db116e4fae73db6f258ca6a77): 실제 시작 이야기·4쪽 안내·게임 입장 연결의 Player 렌더와 키보드 동선을 확인했다. `Q=/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOBBY-20261025`; `Q/startup-capture-9dd5991/startup-capture.json`은20/20·ResetRun 증가1·입력 fence932→933·격리 roster를 확인한다. ROOT는 guide1~4·720/1080·네메시아 gradient·Guide 적 숨김/전환 복원 PNG를 직접 인수했다.

최종 release 앱의 별도 `--unity-frontend-review -output Q/frontend-keyboard-review-9dd5991`에서 CUA N→외형 Enter→이름 ‘수동확인’→생성 Enter→전사 이야기 hold skip→로고→네메시아 Escape→guide Enter→2쪽 Escape→입장까지 확인했다. 무입력 전투 사망 뒤 재시작·일시정지도 확인하고 검수 앱을 종료했다. 실행 경로는 `UNITY_MAC_PLAYABLE_20261025.md`를 따른다. 아래 후보 구현/시각미검수 문장은 인수 이전 이력이다. 실제27개 실습·전체 보이스/VFX·전체 언어 이식 완료를 뜻하지 않는다.

2026-10-25 구현 후보. 부모 총괄의 통합 빌드·실제 키보드/화면 검수 전이며 제품 전체 동선 또는 전체 튜토리얼 완료가 아니다. 기존 전투·캐릭터 저장 transaction/validation·일반 roster namespace는 유지한다.

## 원본과 인수 자산

| 항목 | 정확한 근거/범위 |
|---|---|
| 현행 PC game 원문 | `_out/UNITY-MAC-LOBBY-20261025/character-source-current/tutorial-source/game.html`, SHA256 `d73d691989c1cb847cb500ce02ae81430c575fb90d732a5af131742c96d2c8c5` |
| 기계 발췌 | `INTRO_CUTSCENE_LINES` literal을 Node로 JSON 변환. `startup_intro.json`: ko27 / en26 / ja26 / zh26. 원문 언어별 레코드 차이를 합성·삭제하지 않음. id는 Unity JsonUtility를 위해 string으로 표현 |
| 그림 | `origin/main:assets/cutscene/images/00.png`~`20.png`, 고유21 PNG. `Resources/Art/Startup/Nemesis`에 동일 bytes 인수 |
| 음향 | `assets/lobby/lobby_enter_sfx.mp3`, `sfx/voice/voice_wakeup.mp3`, `bgm/공통/네메시아의 강림 V3.mp3`, `bgm/1장_썩은숲/Ashes of the Fallen Gate.mp3` |
| 로딩 | `img/logo_exoduser.png` 동일 bytes, 검은 화면 object-fit contain |
| 자산 원장 | `Resources/Data/startup_source_ledger.json`: 실제 origin/main SHA, 원본 Git 경로, 목적지, bytes, SHA256. 폴더·자산·신규 C# meta GUID 포함 |
| 원본 효과음 호출 경계 | game의 `voice_cut_<id>`·goddess_laugh 등 safe 호출은 있으나 현행 sample map에 해당 등록을 확인하지 못함. 임의 음성·효과음을 추가하지 않음 |

## 구현 계약

| 접점 | 동작 |
|---|---|
| 문 ENTER | 기존 문 재생/세계관 전환 앞에 원본 enter 효과음. source volume1 + gain2 의미로 PlayOneShot gain2 |
| 일반 캐릭터 입장 | 현재 선택 이름 유지, enter 효과음 → 로고 로딩1200ms → 네메시스 |
| 새 전사 이야기 뒤 | 기존 WarriorStoryState의1200ms entering을 로고 로딩으로 표시하고 재사용. 추가1200ms 중첩 없음. 성공 roster transaction과 이야기 영상 유지 |
| 네메시스 | source data의 카메라 zoom/pan/ease·시간기반 shake·multiply 색보정·원형 비네트·대사 타이핑·화자색·자동 무대사컷·마지막1500ms fade. 대사중 클릭/Enter/Z: 전문 표시 후 다음 입력에 다음 컷. Space2000ms/패드B hold, Esc/패드Start 즉시 안내로 전환. 패드A 다음 |
| BGM | 네메시스 시작400ms 뒤 전용곡 gain.6. 안내 진입 시500ms fade-out 요청에 대응하고600ms 뒤 1장 첫곡 gain.6. 기존 BGM 설정 배율 적용. 첫곡 이후 웹 공통곡 rotation은 이식 범위 밖 |
| 4컷 안내 | source 대사·표제·키/설명순서. 250ms 다음 debounce. 클릭/Enter/Space/A 다음, Tab 다음↔건너뛰기 focus, Esc/Start 또는 skip 버튼 즉시, Space2000ms hold. 마지막 ‘시작’ → 커튼. 시작 시 voice_wakeup1회(source sample gain1×SFX master², 기본.36) |
| 안내 종료 전환 | actual DOM의 상·하 curtain은 computed display:none. 검정 커튼을 새로 그리지 않고 기존 world/barrier와 HUD를 드러내며 안내만400ms fade-out,900ms까지 Simulation·입력 차단 |
| 실제 native 진입 | 4컷 안내 진입 때 기존 ResetRun1회로 새 run을 준비하고, 커튼 종료 callback은 준비된 run을 재생한다. source 신규5마리/무적/난이도/설정 저장 로직을 추가 이식하거나 중복 실행하지 않음. 모든 입력이 해제될 때까지 Running=false, 이후 기존 native gameplay로 연결 |
| focus | focus 해제 시 타이머 진행·스킵 hold 중단, 전용 효과음 pause/resume. 원래 영상/BGM focus 수명 유지 |
| smoke | 기존 `--unity-*-smoke`는 기존 직접 preview 진입 계약 유지. 새 제품 진입 UI의 OS입력 검수로 계산하지 않음 |

## 수동 검수 전용 저장 경계

`--unity-frontend-review -output <명시한 절대경로>` 실행만 `<output>/character-roster-v1`로 분리한다. `-output`이 없거나 값이 없으면 쓰기 불가 오류로 종료하며 일반 roster로 fallback하지 않는다. `AutomatedInput=false`로 일반 FDG/title/문/세계관/로비/생성/이름/전사 이야기/로딩/네메시스/안내/커튼을 실제 키보드와 마우스로 조작한다. 기본 실행의 `Application.persistentDataPath/character-roster-v1`와 기존 smoke 분기는 유지한다. 일반 계정/웹 세이브를 읽거나 변경하지 않는다.

## 검증과 미완료

- 순수 flow fixture `unity/Tools/startup-flow`:29검사 통과. source hash·언어 레코드·1200ms gate·타이핑 완료/다음·focus hold 취소·250ms debounce·2000ms hold·1500ms exit·900ms curtain·한 번 완료·story gate 중복 방지를 검사한다. Unity 실행·실제 OS입력·시각/청각 검수와 구별한다.
- 전체 managed C# type 검사는 부모 통합의 현재 WIP와 함께 실행한다. Unity Editor/Player/GPU/build/CUA는 부모 담당이다.
- 10/26에는 실제 이동120px·좌클릭10처치+3단 충전 처치의 첫2조건을 별도 [실습 인수](UNITY_MAC_FIRST_PRACTICE_20261026.md)로 완료했다. **전투 실습12단계 전체 + 자원 실습8단계 + 시스템 안내7항목은 여전히 미완료**다. Q/E·우클릭·덫·사슬·Space·분노·회복영역의 실제 Simulation 메커닉/이벤트 접점도 별도 이식 대상이다. 클릭이나 키 입력으로 실습 성공을 위조하는 UI 모드를 만들지 않는다. 현행 native의 Q/E 미지원 안내를 보존한다.
- 모든 슬롯 입장은 현재 native가 전투 진행을 저장하지 않는 격리 새 run이므로 해당 입장 연출을 재생한다. 웹 cutsceneDone 저장 플래그를 새로 읽거나 쓰지 않는다.
- 네메시스 본문은 원문4언어·그 외 en fallback, 안내/버튼은 현행 native K(ko/en) 범위다. 전체29언어/RTL 인수는 별도 미완료다.
- 정적 원본 자산 동일성·flow 검사만으로 source screen 시각/청각 일치를 주장하지 않는다. GUI 폰트 metrics·패드 OS 매핑·캔버스 fade/후처리는 부모 동일 화면 비교 후 판정한다.

GUI depth 경계: `DrawStartupEntry`는 진입 당시 `GUI.depth`를 저장하고 `try/finally`로 복원한다. 내부 페이지의 조기 return 또는 예외에도 -100 depth를 외부 GUI에 남기지 않는다. 기존 바깥 Draw의 depth 복원도 유지한다.

## 실제 웹 physical 안내 배치 반영·좁은 runtime capture 후보

- 안내만 `GUI.matrix=identity`에서 화면 pixel로 그린 뒤 `finally`로 기존 matrix를 복원한다. 원본 `.intro-key-panel` border-box 폭은 `min(720px,100vw−96px)`, padding20px12px이므로1280폭에서 panel x280/720, content x292/696이다. key열 `max(160px,38%)`=264.48, gap20, 설명열411.52를 유지한다. 최대높이 `100vh−48px`와 필요시 scroll을 적용한다.
- font clamp는 dialogue28.8/2.6vw/41.6, title20.8/1.8vw/28, body16/1.35vw/20.8, key=body×.86, progress12, hint13.6, button16이다. CSS box·line-height·spacing 계산은 float physical pixel을 유지하고, GUIStyle의 최종 glyph 크기는 가장 가까운 정수 pixel로 표시한다. clipped scroll group 내부에서 glyph별 GUI.matrix scale을 사용하지 않는다. dialogue line-height1.25, body1.65, grid row 사이9px, hint 위20px, action 위22px, button120×45px을 사용한다. 전체720/1920 논리 배율을 가이드 글씨/버튼에 적용하지 않는다. 본문·키·표제는 원본 Nanum Myeongjo 계열로 연결한다.
- 원본1280×720 guide1 DOM 기준: progress y170.937, dialogue y198.937/h41.602, title y296.539/h31, body y341.539, hint y465.062, button y504.062. 이 값은 부모가 실제 웹에서 관측한 근거이며 Unity 화면 PASS를 뜻하지 않는다.
- 신규 `--unity-startup-capture -output <QA root>`도 review와 동일하게 명시 경로 아래 roster만 사용한다. output 누락은 failclosed. 끝이 `-smoke`가 아니므로 legacy entry 우회를 타지 않고 `BeginCharacterEntry(false)`를 실행한다. AutomatedInput을 켜지 않는다.
- `NativeGame.StartupCapture.cs`는 새 범위의 scripted runtime callback fixture다. loading, Nemesis 타이핑/전문/다음/skip, 안내4장(1·4장은720/1080), curtain, 기존 gameplay HUD720/1080을 캡처하고 실제 ResetRun 증가1회·정지상태·release fence frame·격리 roster를 JSON에 기록한다. 전용 internal 상태 API를 사용하므로 **실제 OS키보드·마우스 입력 검수와 다르다**. 전체 HUD/영상/캐릭터 저장군 검사 또는27실습 완료를 대체하지 않는다.
- 최종 gameplay capture는 Running=false로 정지하고 영상·BGM·voice·feedback을 닫은 뒤1초 drain 후 종료한다. 실행·PNG·runtime JSON 인수는 부모 담당이며 worker는 fixture 작성과 변경 C# type 검사만 수행했다. 이번 physical-guide/capture 후보 type 검사0오류, 이전 통과군 재실행0.

2026-10-25 통합 실제 PNG에서 글자만 scroll origin을 다시 scale하여 좌상단으로 이탈한 결함을 확인했다. per-character matrix 변경을 제거해 글자/구분선/버튼을 동일 physical scroll 좌표계로 통일했다. Nemesis subtitle/guide gradient는 중첩 alpha strip을 제거하고 bilinear clamp texture를 각각 한 번 그리도록 변경했다. 검정 curtain layer는 아래 actual DOM 근거에 따라 제거했다. 이 수정의 시각 판정은 총괄이 새 guide/Nemesis PNG만 재인수하며, 기존 runtime20검사를 반복하지 않는다.


### 1afffb9 실제 PNG 실패 뒤 동일 화면 보정 후보

이전 통합 `1afffb9`의 실제 startup-capture20/20·ResetRun1회·release fence·cleanquit 통과와 별개로 guide 글자 원점/배경 및 Nemesis gradient 시각 FAIL을 부모가 판정했다. 이번 보정은 해당 새 guide/Nemesis PNG만 부모가 재인수한다.

| 항목 | actual 근거·현재 presentation 경계 |
|---|---|
| 금빛 배경의 정체 | CSS gold seal이 아니라 main canvas의 화톳불 barrier. game55323–55335의 `sprites/bonfire_barrier.png` |
| 동일 자산 인수 | origin/main blob과 Mac 자산원본이 동일 SHA256 `1d5e27c507c869df1f978ac9935ab70e31f3daf43c96489d5102c82169490678`,2527752B. Resources/Art/Startup/bonfire_barrier.png로 동일 bytes+meta 인수. ledger는 전체27자산/87727845B |
| 크기/위치/음영 | 화면 중앙 physical560px 정사각형×`1+sin(now/300)*.03`, alpha.9. 그 위 source #introKeys gradient alpha.9→.68(46%)→.82. Guide에서 기존 native world를 렌더하고 HUD는 숨김 |
| 실제 curtain 표시 | 부모 actual DOM2회: inline transform translateY(0px), computed display:none. CSS 기본 display:none에 style.display=''가 적용되어 보이지 않음. 의도상800ms 검정 커튼을 추가하지 않음. 종료는 world/barrier+HUD 위 안내400ms fade만 재현 |
| 전투/저장 경계 | 새 bonfire 보호효과·반경 판정·t·무적·스폰·세이브 값 변경0. barrier는 source bitmap을 그리는 presentation에만 존재. 기존 준비된 Simulation은 전환900ms 동안 정지 |
| 좌표 보정 | clip group 안 GUI.matrix/TRS를 제거. 최종 glyph font만 GUIStyle 정수pixel로 반올림(최대.5px)하며 기존 physical box·line-height·letterspacing과 text/rule/button 좌표계를 통일 |
| gradient 보정 | 다수 translucent strip의1px 겹침 제거. subtitle256pixel/guide512pixel bilinear clamp texture 각각 단1회draw. 동적 texture는 OnDestroy에서 모두 해제 |

2026-10-25 최종 안내 표현 경계: source `_startIntro`의 적 비표시→안내 종료 후 표시를 맞추기 위해 NativeGame.StartupFlow의 LateUpdate에서 Guide 동안 enemy body/walk SpriteRenderer만 숨긴다. 각 renderer의 기존 enabled 값을 저장하고 Curtain 첫 렌더 전에 복원한다. Simulation의 기존5spawn·좌표·HP·계산·ResetRun1회·플레이어/props/HUD는 변경하지 않는다. 기존20검사 재실행 없이 총괄이 변경 guide→curtain PNG를 재인수한다.


## 2026-10-30 PC 안내 원화 반영 후보

기존4단계·문구·입장transaction은유지한다. 안내판은웹원화 `panel_frame_20261029.png`(150slice→75px/outset24),버튼은 `btn_plaque_20261029.png`(174slice→40px/outset14),본문·제목의 기존 Nanum Myeongjo는 유지하고 버튼을 Hahmlet 400으로 연결했다. 폭720상한·좌우padding52·버튼168×46. [현재계약·검수](UNITY_UI_ASSETS_20261030.md). PC실제비교진행중이며Mac반영·전체튜토리얼완료를뜻하지않는다.

# Unity 사망 대기 화면 리디자인 (2026-11-03)

브랜치 `codex/unity-death-screen-20261103` (기준 origin/unity/main 34ce305eb). Unity 전용이다. 웹 `game.html`은 손대지 않는다.
브리프: `I:\EXODUSER-Storage\codex-takeover\death-screen-brief.md` (G0·G1, 11-03 14:00 CTO 정정).

## 바꾼 이유
사용자 지적(32:9 캡처): 가운데 16:9에만 납작한 빨간 판, 좌우 슈퍼와이드는 밝은 게임 화면 그대로, 작은 상자에 "부활력 11.2%"와 "2s", 주황 막대. Hell Gothic 톤과 맞지 않는다.
원인: `NativeReviveHud.DrawFallen`이 1920x1080 디자인 좌표에서 `Fill(0,0,1920,1080)` 빨간 판·빨간 비네트·검은 상자·NotoSansKR 굵은 글자·주황/빨강 막대를 그렸다.

## 레퍼런스 공통점 (G0)
Diablo IV · Path of Exile 2 · No Rest for the Wicked · Elden Ring 사망 화면의 공통 원칙만 따른다.
1. 화면 끝(슈퍼와이드 포함)까지 채도와 밝기가 빠지고 비네트가 진해진다.
2. 가운데 큰 명조(세리프) 제목 한 줄 + 짧은 부제.
3. 부활 정보는 작고 정돈된 보조 정보.
4. 빨간 단색 판으로 화면을 덮지 않는다.

## 구현 (G1)
| 단계 | 시각(실시간) | 내용 | 코드 |
|---|---|---|---|
| ① 충격 | 0~0.4s | 비네트만 0→0.6으로 조여 든다. 시뮬레이션은 멈추지 않는다(흐름·판정 불변). | `VignetteAmount` |
| ② 필터 | 0.4~1.6s | 물리 화면 전체 채도 1→0.15(URP 전역 Volume `ColorAdjustments.saturation -85`, priority 1000, 가중치로 섞음), 명도 1→0.55(IMGUI 검은 명도 합성(비네트는 URP), Linear 색 공간은 알파 `1-0.55^2.2`로 환산), 검정 URP 카메라 비네트(19:10 변경) | `TickScreen`·`ApplyVolume`·`DrawDeathScreen` |
| ③ 제목 | 0.5~1.5s | 명조 큰 제목(한글 Hahmlet 400 74px, 라틴 Cinzel 62px, 그 밖은 지역 명조 대체), 뼈색 #dfd6c2, 자간 .34em(CJK)/.2em(라틴), 들어오며 자간이 조금 좁아짐. 양옆 금빛 헤어라인(189,169,122) 바깥으로 사라짐 + 안쪽 세로 획 | `DrawDeathTexts` |
| ④ 부활 대기 | 1.0~1.8s | 부제(Hahmlet 300 22px), 얇은 원형 게이지 Ø92(트랙 1.25px·호 2.4px, 12시부터 시계 방향, 남은 비율 = StateTicks/300), 가운데 남은 초(Cinzel 34px), "부활력 11.2%"(명조 19px + Cinzel 21px) | `Ring`·`DrawDeathTexts` |
| ⑤ 부활 불가 | 같은 시각 | 부제 "이번에는 일어설 수 없다", 게이지 호·숫자 검붉은 색, "부활 불가" + "잠시 후 재도전 또는 로비" | `lastCanRevive=false` 분기 |
| ⑥ 부활 | 0.5s | 필터·비네트·글자를 0.5s에 걸쳐 걷는다. Volume 가중치도 같이 0 | `Phase.Reviving` |
| 사망 확정 | 0.8s | 필터 유지, 글자만 빠지고 기존 사망 패널(`NativeDeathOverlay`)이 그 위로 2.5s 페이드 | `Phase.Dead` |

- 20:20 후속: URP 채도 처리 뒤에 따뜻한 RGB를 다시 더하던 IMGUI DeathBand 가로 띠를 제거했다. 화면 명도 감쇠는 무채색 검정 합성만 유지한다.
- 정보는 그대로다: 부활력 값(`FallenReviveChance`, 표기 "R" 형식), 남은 초 `ceil(StateTicks/60)`, 부활 불가 `!FallenCanRevive`, 판정 `Simulation.TickFallen`. 제거한 것: "쓰러짐..." 문구(부제로 대체), 하단 주황 막대(원형 게이지로 대체).
- 모든 절차 텍스처는 매끈한 그라데이션·해석적 안티에일리어싱이다(노이즈·디더·점 없음). 이모지·산세리프 없음.
- 문구: `Resources/Data/death_screen_labels.json` 29코드(ko + 28개 언어). ar은 IMGUI RTL 미지원이라 화면에는 en을 그린다(NativeOptionText와 같은 규칙). 번역 목록 No.3859~3864.

## 검수 (Mac)
PC는 Unity 에디터·Player를 돌리지 않았다(11-03 PC 비정상 종료 3회). PC 확인 = Unity 6000.4.8 엔진 DLL·URP 패키지 DLL을 참조한 `Exoduser.Core`·`Exoduser.Runtime` 어셈블리 csc 컴파일 0 오류.

무음 캡처: `--unity-death-screen-smoke --unity-death-revive-frames --unity-boss-direct 0 --unity-qa-sandbox <절대 QA루트> -output <절대 출력경로>` + `-screen-width/-screen-height`를 1920x1080·3840x1080·5120x1440으로 각각 실행한다. 기본 HD2D와 `--remodel3d`를 별도 실행해 비교한다. `-batchmode`는 프레임 끝 촬영과 양립하지 않으므로 Player 촬영에는 쓰지 않는다. `-mute-audio`와 fixture AudioListener 음소거를 함께 쓴다.
예정 결과: `death_01_impact`·`death_02_wait`·`death_03_last`·`death_05_revive_mid`·`death_06_revived`·`death_08_boss_wait`·`death_04_cannot`·`death_07_panel_enter`·`death_lang_{ko,en,ja,ru,th,el}` + `death-screen-capture.json`. 18:40 이전 후보는 필터0/위상None FAIL. 19:10의 1ea269a72는 필드/보스 감광·부활중간 .5·해제0 PASS였지만, 비네트/전투 문구/버튼은 FAIL. 새 후보는 Mac 미검증이다.

## 18:40 Mac FAIL 후속 — 실제 필드 진입과 Core 상태 전이

| 항목 | 교정/영수증 조건 |
|---|---|
| 로비 우회 | `NativeGame.cs`의 `legacyFixture`에 `--unity-death-screen-smoke`와 `--unity-death-ui-smoke`를 등록. 사망 촬영은 `lobby.IsBlocking=false`와 실제 필드 culling mask를 확인 |
| 필드 쓰러짐 | `HurtPlayer`로 실제 fallen 진입. AI를 끄고 `RevivePow=1`·고정 난수0을 사용해 재현 가능하게 함. Player State/Hp·StateTicks·FallenCanRevive를 직접 조작해 결과를 만들지 않음 |
| 대기 | Core `StepInput`으로 300→180→12틱 진행. 화면 연출 경과만 .25s·2s·4.8s로 고정. 2s 필터/Volume 각각 >.99 |
| 부활 | 실제 남은 Core 12틱을 진행해 idle/최대HP 확인. `Reviving` 위상·.25s 필터 .45~.55 확인, .5s 페이드 이후(.7s 대기) 위상None/필터0 확인 |
| 보스 사망 | 같은 실행에서 `--unity-boss-direct 0`으로 실제 보스 아레나를 로드. 살아 있는 보스·아레나·활성 HUD 카메라 후처리·필터/Volume >.99를 확인하고 `death_08_boss_wait` 촬영 |
| 부활 불가/사망 패널 | 첫 부활의 Core 쿨다운으로 두 번째 fallen은 부활 불가. 150→0틱을 실제 진행해 dead를 확인한 뒤 패널 진입 촬영 |
| 세이브 격리 | 두 smoke는 설정·로스터·전투 저장소 비활성. `DEATH_UI_SAVE_BINDING`에 실제 QA 루트·저장소 상태를 출력하고 `saveBinding`·`persistenceDisabled`를 JSON에 기록 |

PC 검증은 DLL 참조 Roslyn 컴파일과 소스/색 변환 회귀까지만이다. Unity 에디터/Player·GPU·Mac 실제 화면·1x 디자인은 별도 미검증이다. 실행 인자 전체와 최종 SHA는 외부 `death-screen/REPORT.md`를 따른다.

Mac 판정 항목:
1. 슈퍼와이드 좌우 끝까지 채도·명도가 빠지는가(16:9 밖 밝은 띠 0).
2. 채도 Volume이 HD2D·3D 필드·보스전 카메라 모두에 먹는가(`renderPostProcessing` 켜진 카메라).
3. 빨간 단색 판 0, 비네트가 붉은 판/타원 계단 띠로 읽히지 않는가.
4. 1x에서 제목·부제·부활력·숫자가 읽히는가, 3x 크롭에 점·계단 0.
5. 부활 0.5s 페이드, 사망 확정 시 사망 패널로 끊김 없이 넘어가는가.
6. 레퍼런스(Diablo IV·PoE2·NRftW·Elden Ring) 같은 크기 나란히 비교.

## 19:10 Mac 재검수7항 후속 (현재 계약)

| 항목 | 변경 |
|---|---|
| 비네트 | 기존256×144 IMGUI 타원 텍스처/DeathVignette 함수·그리기 제거. URP Volume priority1000의 Vignette(color=black, center=.5/.5, smoothness=.85, rounded=false, 최대intensity .48). 붉은 RGB를 더하지 않아 가장자리의 인위적 채도 증가를 없앰 |
| Volume 혼합 | weight=max(Filter,VignetteAmount). ColorAdjustments saturation=-85×Filter/weight, Vignette intensity=.48×VignetteAmount/weight. 충격 .4s 동안에도 비네트만 먼저 적용되고 채도는 유지. weight0이면 비활성. 기존 명도 .55 IMGUI 검정 합성은 유지 |
| 전투 문구 | fallen/dead/부활 페이드(None 전) 동안 CombatTextSuppressed. 기존 revive·damage 버퍼/notice를 비우고, 새 ReviveText/Toast·일반/필드보스 피해 글자 생성을 막음. floatingText/notice/레벨업/지역 제목 그리기도 생략. Core 이벤트/전투 판정은 불변 |
| 부활5프레임 | 기존 사망 smoke에 --unity-death-revive-frames 추가. 실제 Core 부활 뒤 연출 시각0/.125/.25/.375/.5s를 고정해 death_revive_000/125/250/375/500 PNG. reviveTimes/Filters/Volumes 배열 기록, 감소·시작1·끝0 검사. 연출 시각 고정 샘플이며 실제 벽시계 간격 영상이 아님 |
| 문구 억제 영수증 | 2s 대기에서 새 쉴드 파괴/Toast 입력도 거부되는지 검사해 combatTextHidden 기록 |
| 버튼/슬롯/1px | 별도 UNITY_BUTTON_PLATE_MATERIAL_20261103 문서. 색 공간 보정 폐기, 공통 스킨 배경 제거, 검정 판, 외부 붉은 번짐 제거, 물리1px |
| Mac 검사 도구 | run.cjs의 --unity-data 또는 --dotnet/--csc/--refs 및 자동 탐색. 상대 출력도 허용. 실제 Mac 실행은 아직 미검증 |

Mac에서는1920×1080·3840×1080·5120×1440의 HD2D/--remodel3d 양쪽에서 가장자리 채도≤중앙(V<.02 근흑색 제외)·타원 계단0·점/디더0·전투 문구0·5개 fade 샘플을 직접 확인한다. PC 컴파일 제한을 지켜 Windows GPU 측정은 하지 않았고, 두 플랫폼 스킨/판 측정 인자는 REPORT에 남긴다.

## 20:20~21:25 Mac 판정/현재 상태

- 4차 Mac(7e740aa, qa @adc7233e6): 감광·실제 부활5프레임·전투 문구 숨김 PASS. 기본 스킨 제거 후 판은12/12 불투명13/13/13, 원화 비침0,1px. 최종 질감은 디자인 RETOUCH다.
- URP 검정 비네트·무채색 명도 .55·따뜻한 IMGUI DeathBand 제거는 유지한다. remodel3d 오른쪽 띠는 V≈.002 근흑색 HSV 착시로 판정했으며 V<.02는 채도 비교에서 제외한다.
- 실험 --unity-death-color-probe와 NativeGame.DeathColorProbe.cs(+meta), 패치 생성/읽기·콜백·관련 영수증 필드는21:25에 폐기했다. UI smoke의 미처리와 사망 smoke의 shader/camera unavailable을 불필요한 검사 제거로 해소한다. 해당 인자는 실행 예제에서 빼며 새 후보에 전달하지 않는다.
- 현재 사망 호출: --unity-death-screen-smoke --unity-death-revive-frames --unity-boss-direct 0 + --unity-qa-sandbox/-output/-screen-width/-screen-height. 기본 UI/스킨 불투명 probe는 유지한다.
- 새 브랜치 codex/unity-ui-plate-20261103은 공통 버튼의 옅은 세로 명암·1px 음각/경사·내부 진홍만 다듬는다. 실제 질감은 Mac1920/3840 1x·3x 및 BG3/웹 정본 나란히 재검수한다. PC 컴파일은 시각 합격 근거가 아니다.

## 23:05 원화 복구 우선
공용 ActionPlate는 단색/음각 판에서 btn_primary_composed·btn_plaque_20261029의 원래9-slice로 복구했다. 밉맵OFF·밝기1.0·안쪽 호버 빛만 유지한다. 사망/부활/필터/전투 문구 숨김 규칙은 바꾸지 않는다. 최신 UI 촬영에는 lobby0/2명·character-create/name/delete와-ui-state가 추가됐으며 고정색/스킨 픽셀 probe는 원화 기준과 맞지 않아 제거했다. 현재 원화/촬영 계약은 UNITY_BUTTON_PLATE_MATERIAL_20261103.md를 따른다.

## 2026-11-04 사망 확정 패널 교체 — "안식은 없다" 결정 화면 (Mac, PC UI 총괄)

사용자 지시: "죽으면 나오는 화면 팬텀블레이드 따라해라, 우리는 뭔가 조잡한데" → "카피하라는 게 아니고, 어떻게 UX가 진행되는지 보라고", "저게 다크소울 YOU DIED 뜨는 거랑 같잖아", "우리는 there is no rest 이런 걸로", "포기할 것인가 등 여러 가지 옵션들이 있잖아". 선택(사용자 확정): 질문 + 3 선택지, 메인 문구 "안식은 없다".

**바꾼 범위**: 사망이 확정된 뒤의 패널(`NativeDeathOverlay.Draw`)만 바꿨다. 위 쓰러짐 대기 화면(부활력·원형 게이지)은 그대로다. 웹 `#death` 이식판(정지 원화·펫 초상 대사·이모지 정보 줄·피해 기록·리플레이 버튼·"미이식" 표시)은 더 이상 그리지 않는다. 데이터 쪽(대사 고르기·제목 맥동·리플레이 모양)은 기존 영수증 호환을 위해 남겼다. Unity 전용이며 웹 `game.html`은 손대지 않았다.

**팬텀 블레이드 제로에서 가져온 것은 진행 방식뿐이다**: 검은 공백 → 한 문장 → 짧은 결정. 붓글씨·"DEAD" 같은 겉모양은 쓰지 않는다(첫 시안 絶命·DEAD는 사용자 지적으로 폐기). 글꼴·색·장식은 Hell Gothic 실버 헬 규칙을 따른다.

| 시각(사망 확정 후) | 내용 |
|---|---|
| 0~0.45s | 물리 화면 전체(초광폭 좌우 포함)를 검정으로 덮는다. 아래 쓰러짐 필터는 그대로 가려진다 |
| 0.3~0.9s | 검붉은 피먹 번짐(`Art/ui/death/death_splatter`, 560→640px, 불투명도 .62)이 제목 뒤에 퍼진다 |
| 0.5~1.5s | "안식은 없다" Hahmlet 300 68px, 뼈색 #dfd6c2, 자간 .36em→.28em으로 모이며 나타남 |
| 0.9~1.6s | 진홍 헤어라인(460px, #c21a10)이 가운데에서 양옆으로 자란다 |
| 1.3~1.9s | "THERE IS NO REST" Cinzel 15px, 자간 .42em, 어두운 진홍 |
| 2.0~2.6s | 제목 묶음이 위로 130px 올라가고 "포기할 것인가?" Hahmlet 400 24px #e6e3dc |
| 2.35s~ | 선택지가 0.12s 간격으로 하나씩. Hahmlet 400 21px 자간 .16em, 평상 #a7a49d, 초점 #f2f0ec + 양옆 진홍 마름모. 초점 선택지의 결과 한 줄만 아래에 14px로 |
| 입력 | 모든 선택지가 보인 뒤부터. ↑↓/W S/Tab 이동, Enter/Space 확정, 마우스 오버·클릭. 뒤에 숨은 일시정지 페이지 대신 사망 화면이 키를 받는다 |

| 상황 | 선택지 → 동작 (기존 함수) |
|---|---|
| 보스방 | 다시 일어선다 → `RetryFromDeath`(보스방 앞 필드, 체력 전부) · 처음부터 다시 → `PauseMenuCommand.Restart`(`ResetRun`) · 포기한다 → `ReturnLobby` |
| 필드 | 다시 일어선다 → `RetryFromDeath`(필드에서는 여정 처음부터) · 포기한다 → `ReturnLobby`. 필드에는 거점 부활이 없어 "처음부터 다시"와 같은 동작이 되므로 뺐다 |

고친 결함: 기존 사망 패널의 "로비로 돌아가기"는 `OnLobby`가 연결되지 않아 눌러도 아무 일이 없었다. 키보드는 숨은 일시정지 메뉴가 받아 Enter가 `ResetRun`으로 갔다(보스방에서도 처음부터). 지금은 둘 다 위 표대로 연결된다.

색 처리: 이 Linear Player는 IMGUI 텍스처와 `GUI.color`를 sRGB 변환 없이 그린다(측정: 원본 187 → 화면 222, 진홍이 분홍으로 바뀜). 번짐 PNG는 채널값을 미리 선형화(`pow(c/255,2.2)`)해 구웠다. 단색 칠(헤어라인·마름모)은 `.linear` 값을 넘긴다. 글자는 기존 `NativeSilverHellUi.Label` 보정을 쓴다. 생성기: `unity/Tools/death-art`.

### 검수 (Mac, Unity 6000.6.7f1 ARM64)

| 항목 | 결과 |
|---|---|
| 빌드 | Succeeded·오류 0 (`_out/UNITY-DEATH-PBZ-20261104/b3-norest`) |
| `--unity-death-screen-smoke --unity-boss-direct 0` | 1920×1080·1600×900 모두 PASS. 실제 Core 사망 전이 뒤 보스방 3 선택지·초점 "다시 일어선다", 실제 키 경로(InputSystem 주입) ↓로 "처음부터 다시" 이동·동작 없음 확인 |
| `--unity-overlay-capture death` | PASS(대사 고르기·리플레이 모양 영수증 유지) |
| 눈 검수 | 전/후 1920·1600 직접 확인. 전: 원화·펫·이모지·"미이식"이 겹친 웹 이식판. 후: 검정·한 문장·결정. 진홍은 측정대로 검붉게 나온다. 개발 상태 문구 0 |
| 미검증 | 필드 사망(2 선택지)은 캡처 경로가 없어 코드로만 확인. 마우스 실클릭, 초광폭 21:9·32:9, 다국어(문구는 한국어 고정) |

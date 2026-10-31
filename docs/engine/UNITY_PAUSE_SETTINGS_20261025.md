## 2026-10-31 PC 일시정지·입력 복귀 최종 검수

2026-10-31 PC 복귀 수정: HP 0의 `fallen`은 최종 사망이 아닌 부활 대기 상태다. 기존 `Hp>0` 재개 조건이 이 상태의 계속하기와 패널 닫기를 차단했다. 직접 연 설정의 마지막 키보드 닫기도 부모 페이지가 없으면 재개하도록 보완했다. 최종 DX11 Win64 Player의 M1·입력·1x·영상 검수는 완료했으며 공통 반영과 바탕화면 전달 영수증은 아래 외부 보고서에서 확정한다.

| 복귀 경로 | 현행 코드 계약 |
|---|---|
| `PlayerDown` | `State=="dead" || (Hp<=0 && State!="fallen")` |
| `Resume` | `gameFocused && !PlayerDown`. `fallen`의 기존 300프레임 부활 대기 카운트는 재개하고 최종 `dead`는 재개하지 않는다 |
| 인벤토리·스킬·능력치·대장간 닫기 | `gameFocused && 각 패널의 WasRunning && !menu && !PlayerDown` |
| 대화·안내 입력 해제 | 키·마우스 해제 뒤 진입 fence를 해제하며 메뉴/인벤토리/스킬/능력치/대장간 또는 `PlayerDown`이면 `Running=false` 유지 |
| 직접 연 설정의 마지막 닫기 | `BackPage()` 성공이면 부모로만 복귀. 부모가 없고 최종 사망이 아니면 `Resume` 반환 |
| 실습 초기 입력 | 기존 FirstPractice Intro의 방향 입력 전 Core 틱 정지는 보존. 상태 복귀와 실제 방향키 이동·틱 재개를 구분 |
| Player 입력 검수 | Input System 가상 키→제품 Update/PollKeys, 자기 PID+UnityWndClass+제품 제목+실제1600×900 창 WM Down/Up→제품 OnGUI/버튼 |
| focus 검수 | 실제 Player 제품 OnApplicationFocus(false/true) 본문 직접호출 fixture. OS 창 전환 전달은 무창 desktop foreground=0으로 미검증 |
| 시작 검수 | 격리 신규 캐릭터 생성→제품 BeginCharacterEntry(false)→Loading/Nemesis→ESC·안내4판 Enter→키 해제→이동/틱 |
| 검수 안전 | 공식 exo-unity, 숨은 desktop, 격리 세이브. 사용자 창/포인터/AI·충돌·무적 설정 변경0 |

CPU 근거: 메뉴 원본 RED→52/52, 제품 함수 원문+실제 Core 36검사 RED13→0, 웹 closePanel 3/3. 독립 Runtime 컴파일 오류0·기존 경고435. 웹 함수는 main7dc96cd43에서도 원문 동일성을 확인했다.

| 최종 Player 영수증 | 실제 결과 |
|---|---|
| 실행 코드 | dc9ec87c5f1b83298b74f42124b4e4313f2473bf, 이후 관련 docs-only 변경은 Unity tree 동일성으로 연결 |
| 정식 빌드 | 47a8c279, Unity6000.6.7f1 Win64, 실제 Editor DX11, -remodel-scenes1, BuildReport/컴파일 오류0·정상 종료 |
| 엔진 로그 | 공식 errorLogs2(라이선스 갱신 로그 포함), compileErrors0. 런타임 M1+6입력 실행은 예외/오류0 |
| 같은 EXE M1 | a666ff75, 23/23, Direct3D11, 노출창/잔여/USER_SAVE 변경0 |
| 신규 입장·대화·안내 3D | 41759079, 21/21. 정상 캐릭터 생성·sandbox 경로 확인→BeginCharacterEntry→ESC/안내4판 Enter→진입 해제/실제 방향키 이동 |
| HP0 부활 대기 3D/2D | ad399d75/02b324c9, 각19/19. WM 클릭·Enter·ESC·TAB 닫기와 실제 카운트 진행 |
| 일반 메뉴 3D/2D | cb37e2bd/a0243719, 각40/40. ESC·직접 설정 닫기·WM 계속하기·K·TAB·로비 복귀/재진입·종료 취소/실제 Quit 정상 종료 |
| 제품 focus 콜백 3D | 608bfb4d, 10/10. OnApplicationFocus(false/true) 직접호출 fixture→자동 재개 없음→Enter 재개 |
| 입력 합계 | 6실행149/149, 모두 Runtime 8749e2670b7e50fcf6728e2a1a6c1797e25637d837178f1dd4d49306fbb39cb8·Core 31763d3a33a6b94ed6ba5b5b471a5ca7660753a9b86e1d6cf4d32ec81b5e5505 동일 |
| Player MCP 제외 | 실제212파일/160DLL, MCP 파일0·MCPForUnity 참조0 |
| 화면·영상 | 원본1600×900 1x, 비교 양쪽 픽셀 동일. pause-before-after-r4-1x.png, pause-before-sequence.mp4·pause-after-r4-sequence.mp4·pause-normal-r4-sequence.mp4·pause-startup-r4-sequence.mp4 |
| 안전·보존 | 모든 최종 실행 정상 종료. 노출창/잔여/USER_SAVE 변경0. 자동 파생519파일 사전 원본 바이트 복귀, 착수 미추적56 SHA 보존. 자기 GPU예약 정상 반환 |

산출물 루트는 I:/EXODUSER-Storage/demo-art/pause-fix/이다. 영상은 원본 연속 캡처10fps 순서 재생이며 실제 벽시계 속도와 다르다. 실제 입력 시각·상태는 각 pause-input.json의 states.time을 따른다. 초기 r3 startup18검사는 직접 Begin이 미디어 초기화를 건너뛰어 예외4회를 만든 검수 오류이므로 최종 게이트에서 제외했고, 정상 API로 보완한 r4의21검사/예외0으로 대체했다. 실패·폐기방법·원본 JSON은 그대로 보존했다.

원본14cc014d0 전체 바이너리 직접 입력 검수는 하지 못했으며 관련 제품 함수 원문이 동일한 소스의 진단 빌드에서 HP0/fallen 클릭·Enter·ESC 실패를 재현했다. 실제 OS 포커스 전환, 사용자 손조작·자연 전투 완주, Mac 반영은 미검증이다. 전환 화면만 자체 부분 PASS이며 기존 전체 맵·캐릭터·VFX RETOUCH를 승격하지 않는다. 기존 사용자 build_new PID30032 종료0xc0000005와 드루이드 처치 뒤 이동·ESC 동시 먹통은 별도 인수한 증상이고 동일원인·해결 여부를 이번 검사로 확정하지 않는다. C4 frame/tick/viewTick/XY만으로 사용자 증상의 NativeGame Update/OnGUI/FixedUpdate 진입·복귀/실제 poll을 검증했다고 쓰지 않는다.

## 2026-10-27 A15 후속 (이력)

현행 Mac 제품 소스는 게임/화면/사운드/조작 4탭에 지원된 FPS·fullscreen·SFX·BGM·키 목록을 연결한다. Game 탭의 전체 화면 버튼은 화면 탭과 동일한 실제 host 상태·설정 v2 저장을 사용한다. 이 문서 아래의 3탭/조작 안내·세션 전용 설명은 당시 구현 이력이다. 다른 게임 옵션·패드 재지정 미지원과 실제 검증 범위는 [A15 최소 연결](UNITY_MAC_A15_4TAB_20261027.md)을 따른다.

# Unity 일시정지·설정 화면 인수 — 2026-10-25

상태: 지원 담당이 화면 파일과 세션 설정 모델을 작성하고 원본 수치/상태66검사·설치된 Unity managed assembly 대상 컴파일을 마쳤다. **NativeGame·음향·실제 Player 통합은 기존 Mac 담당 인수 대상**이다. 소스 전달만으로 제품 반영·UI 실제 동작 완료를 주장하지 않는다.

## 실제 화면 구성

| 화면 | 버튼 / 내용 | 실행 계약 |
|---|---|---|
| 일시정지 | 계속하기, 설정, 로비로 돌아가기, 게임 종료 | enum command만 반환. Running/ResetRun/ShowLobby/Quit는 host 소유 |
| 사망 | 다시 시작, 설정, 로비, 종료 | 사망 상태 Resume 반환0. 기존 ResetRun이 실제 초기화를 담당 |
| 화면 설정 | FPS30/60/120/144/244/무제한, 실제 전체 화면 켜짐/꺼짐 | callback 연결이 있어야 조작 가능. 244는 원본 수치 그대로 |
| 소리 설정 | 효과음0~100%, 배경음악0~100% | 세션 모델 변경과 실제 AudioSource 소비자가 함께 연결돼야 완료 |
| 조작 안내 | WASD, 왼쪽 클릭,3타 유지 후 차지 해제,TAB,ESC | 현재 이식본에서 동작하는 입력만 표시. 키 재지정 기능을 가짜로 만들지 않음 |
| 종료 확인 | 취소 / 종료, 미리보기 진행 저장 불가 안내 | 종료 command는 확인 버튼에서만 반환 |
| 공통 | ko/en,1280×720 기준 균등fit/중앙정렬, 배경 어둡게 | caller GUI.matrix/color/enabled를 finally에서 복원. 기존 HUD·전투·저장에는 쓰기0 |

## 원본 수치·기본값

| 항목 | 원본 | 모델 / host 적용 |
|---|---|---|
| SFX | OPT.sfxVol60,0~100 | Default60 / raw sample gain과 master gain에 각각percent/100 적용 |
| SFX 식 | 현재 admitted `min(1,volume*.6)*.6` | `SampleOutputGain(rawVolume)=min(1,rawVolume×gain)×gain`. 기본60이면 기존과동일 |
| BGM | OPT.bgmVol60 | Default60 / 현재 track phase base gain×percent/60, clamp0..1. 기본60에서 기존 .6/.22/.65 보존 |
| FPS | OPT.fpsCap0 / _FPS_STEPS[30,60,120,144,244,0] | source0은 Unity targetFrameRate−1. source simulation60Hz와분리 |
| 현재 native 기본 cap | NativeGame120 | `new NativeSettingsState(120)`으로현재값을채택. 화면을연것만으로120→무제한자동변경0 |
| 기본값 복원 | SFX60/BGM60/FPS0 | 사용자 버튼에서만callback별복원. fullscreen은원본OPT기본값이없으므로임의초기화0 |
| 저장 | 원본 설정 저장과 별도 | 현재 실행 중 세션만. 기존 웹/Godotsave·계정·PlayerPrefs에접근0 |

## 인수 파일·API

`NativeSettingsState.cs` → `Runtime/Core/NativeSettingsState.cs`, `NativePauseMenu.cs` → `Runtime/NativePauseMenu.cs`. 새 meta는 제품 owner가 생성·보존한다.

`new NativePauseMenu(Font,NativeSettingsState,Action<int> sfxChanged,Action<int> bgmChanged,Action<int> frameCapChanged,Action<bool> fullscreenChanged)`.

`Draw(bool dead,bool fullscreen)`은 `PauseMenuCommand.None/Resume/Restart/ReturnLobby/Quit` 중하나를반환한다. `English`로기존ko/en메뉴언어를연결한다. `Reset()`은메뉴진입/이탈의하위페이지를초기화, `ShowSettings()`는직접설정진입, `HandleEscape()`는하위페이지를메인으로닫았을때만true를반환한다. callback이없으면해당제어는비활성이고거짓적용표시를하지않는다.

## host 연결 gate

1. NativeGame 소유자가 현재 targetFrameRate120을모델에주입하고 font/콜백으로화면을구성한다. 기존 OnGUI 개발메뉴 블록만 새 Draw로 대체한다. basicWeaponMode의명시CLI/검사경로는보존한다.
2. ESC owner는 inventory닫기→`menu && pause.HandleEscape()`→기존menu/Running토글순으로처리한다. **Draw는ESC를다시읽지않는다.** 하위설정닫기와전투재개가같은입력에서중복되지않게한다.
3. Resume는살아있는Player에서만Running=true, Restart는기존ResetRun, ReturnLobby는기존Runningfalse/sound.Reset/lobby.ShowLobby, Quit는Application.Quit로연결한다. 미리보기진행저장불가를보존한다.
4. FPScallback은targetFrameRate=cap0이면−1/그외실값으로적용한다. VSync에가려실선택이무시되지않게현재설정을확인하고, Time.fixedDeltaTime=1/60·source clock을변경하지않는다.
5. NativeFeedbackAudio의각Voice에raw sample volume을보존한다. Play와SFXsetter에서현재설정의2단계gain을적용하면mute0→다시60으로올려도원음량을복원할수있다. 이미감쇠된AudioSource.volume에비율을계속곱하지않는다.
6. NativeLobby의BGM setter는현재track phase의base volume을따로보존해percent/60을적용한다. StartMusic·WorldIntro1초duck·SetMix를같은apply함수로보내누적곱셈/duck덮어쓰기를막는다. 영상voice gain·pause/focus는보존한다.

## 검증·범위

원본 game.html의 OPT세기본값과_FPS_STEPS를직접추출한oracle, 현재admittedSFX원식으로25 gain입력, 잘못된FPS거부/상태보존·mute/최대/기본복원·메뉴ESC하위페이지만닫기를검사했다. 총66/0. 최종UI는영문Unlimited가92px버튼에들어가게별도16px스타일,사망안내,fullscreenOn/Off표시를보완하고전체화면C#을다시컴파일해0오류/0경고확인했다. 성공66검사를반복하지않고최종표시변경의compile만추가했다.

원본Game HTML은Mac migration ROOT의설정문서고정본과같은값을읽었으며,현재PC최신전체game과같은파일이라고단정하지않는다. code작성후전체docs에서sfxVol/bgmVol/fpsCap/_FPS_STEPS/일시정지/설정화면을grep하여85매칭을보존했다. source-settings-oracle.json·result.json·docs-matches.txt 동봉.

기존20/9·536/42suite, Editor/GPU/새빌드/사용자앱·공유INDEX재검사0. 실제host음량/렌더/클릭/720p·초광폭/재열기·전체설정38필드/키재지정/패드/영구저장·29언어번역은미인수이며제품owner의새좁은실검수가필요하다. 원본설정전체이식완료가아니다.


2026-10-25 실제 Mac 통합: build 오류0, Player15/15, PNG8장 확인. OS 마우스 경유 새 메뉴/전체화면 전환 미검수는 분리. 최종 근거: `docs/engine/UNITY_MAC_INVENTORY_SETTINGS_20261025.md` 및 동명JSON.


2026-10-25 Mac 키보드 후속: 메뉴 선택·FPS/음량·뒤로/재개·종료 확인과 focus 복귀를 연결했다. 새 모델33/33·Player21/21, CUA 실제 키보드와 최소화→복귀를 확인했다. 이전의 “일반 메뉴 OS 입력/전체화면 미검수”는 당시 상태이며 이번 한정 경로는 [새 검수 기록](UNITY_MAC_PAUSE_KEYS_20261025.md)을 따른다. 마우스 슬라이더 정밀 좌표·전체 UI 인수와 구분한다. 조작 안내에는 K 스킬 창을 추가했다.


<details>
<summary>2026-10-31 검수 과정과 폐기 방법 이력</summary>

- 2026-10-31 실제 Player 검수 관측 보완: PauseInputCheck는 실행 순서 -31000에서 GUI 이벤트를 제품 버튼 소비 전에 기록한다. 제품 Start 완료 뒤 준비하며 MouseDown/MouseUp 외 Layout/Repaint 횟수도 남긴다. 최초 진단은 WM 전달 성공이나 관측0으로 중단됐고, 제품 클릭 실패 증거로 올리지 않는다.

- 2026-10-31 검수 방법 전환: 숨은 Player에서 WM_MOUSE 게시 2회는 Layout/Repaint만 수신하고 MouseDown/Up=0으로 미검증이다. 같은 방식을 반복하지 않고 설치 DLL에서 존재를 확인한 UnityEngine.Event.QueueEvent 합성 이벤트를 실제 제품 OnGUI/버튼으로 전달한다. 이는 실제 OS 마우스 조작 증거가 아니다. 키보드는 Input System 가상 장치→제품 Update/PollKeys를 유지한다. window-focus는 자기 PID/현재 thread 창에 한해 SetActiveWindow/SetFocus로 실제 Unity 콜백을 검수하며 사용자 foreground나 desktop은 바꾸지 않는다.
- API 근거: https://raw.githubusercontent.com/Unity-Technologies/UnityCsReference/master/Modules/UICommon/Event.bindings.cs (QueueEvent), https://docs.unity3d.com/Packages/com.unity.inputsystem@1.14/manual/UISupport.html (IMGUI와 Input System 구분), https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setfocus 및 nf-winuser-setactivewindow (자기 thread focus). 설치6000.6 DLL 확인을 함께 적용한다.

- 마우스 관측은 별도 MonoBehaviour OnGUI 카운터만으로 판정하지 않는다. 기존 제품 NativeGame.OnGUI의 TraceA15HitRoot(before)에서 MouseDown/Up을 모두 기록하도록 진단 필터를 확장하고, 명시 QA 도구만 a15HitTrace를 켠다. 제품 입력 로그의 Down/Up과 실제 메뉴/Running/틱 상태를 함께 검사한다. 별도 helper 카운터0/GUI 큐 게시만으로 클릭 성공을 주장하지 않는다.

- GUI 큐 게시 방식은 제품 OnGUI 추적에서도 Down/Up=0으로 확인되어 폐기했다. 다음 검수는 첫 UnityWndClass를 고르지 않고 자기 PID+게임 제목+실제 클라이언트 크기가 모두 맞는 창을 선택한다. 각 후보 창의 클래스/제목/크기를 로그로 남기며 로비 AutomatedInput=false와 playback focus를 명시한다. 상태에는 Application.isFocused와 AutomatedInput도 포함한다. 자기 창의 app activation 알림도 같은 엄격한 창 선택으로 검수하며 콜백이 실제 증가하지 않으면 실패다.

- 2D 원본 진단의 실제 WM 클릭 뒤 menu=false/Running=true가 관측됐으나 별도 helper OnGUI 카운터는0이었다. 따라서 helper 카운터0은 마우스 전달 전체 실패를 뜻하지 않는다. 최종 WM 검수는 제품 NativeGame.OnGUI 추적과 실제 상태 변화를 기준으로 판정한다.

- 실제 r5 제품 로그는 raw=mouseDown/mouseUp(소문자 enum 별칭)였다. 대문자 문자열 비교 오류를 OrdinalIgnoreCase로 수정한다. 원본 JSON을 바꾸지 않고 before-r5-click-verdict.json에 실제 Down1/Up1과 HP0/fallen/menu=true/Running=false/카운트300 유지 재현을 재판독했다.
- window-focus 실제 OS 검수는 현재 thread desktop 이름이 공식 ExoDesk 접두사이고 현재 전경 창이 자기 게임 창일 때만 64x64 네이티브 검수 창을 같은 숨은 desktop/자기 PID에 만들고 전경을 왕복한다. 사용자 Default desktop, 타 PID, SwitchDesktop, AttachThreadInput은 사용하지 않는다. 생성 창은 종료/실패 모두 정리한다. 실제 Application.isFocused·Unity 콜백·제품 상태가 함께 바뀌어야 nativeFocusVerified=true이다. 별도 focus-callback 사례는 제품 OnApplicationFocus 직접호출 fixture로 명시하며 OS 검수와 구분한다.

- private desktop/네이티브 창 API 근거: https://learn.microsoft.com/en-us/windows/win32/winstation/desktops , https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setforegroundwindow , https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-createwindowexw . 전경/desktop 사전 조건 실패 시 다른 창을 시도하지 않고 검수 실패로 끝낸다.

- 네이티브 포커스 콜백 기준 횟수는 검수 창 생성 전에 저장한다. CreateWindowEx 자체가 활성 전환을 발생시키는 경우도 빠짐없이 관측한다.

- 최종 r2의 HP0 실제 클릭/Enter/ESC 재개와 틱 진행은 통과했다. 직접 SetInventory(true) 직후 같은 프레임에 TAB를 누른 검수는 Navigation.Open의 정상 입력 해제 fence에 걸렸다. 검수는 빈 입력 2프레임을 실제 Update에 보내 WaitingForRelease=false를 확인한 뒤 TAB를 누른다. 제품 fence를 강제 해제하거나 닫기 검사를 완화하지 않는다.

- 네이티브 포커스 run a8804308은 ExoDesk의 foreground=0으로 사전 조건 실패했다. 검수 창 생성/전경 변경/desktop 전환은0이다. 무창 환경에서 실제 OS 전환은 미검증으로 남기고, 미사용 전경/네이티브 창 생성 API는 QA 도구에서 제거했다. focus-callback 사례는 실제 Player 제품 OnApplicationFocus 본문→정지/복귀/Enter 재개의 기능 검수이며 실제 OS 이벤트 전달 PASS가 아니다.

- 2026-10-31 시작 fixture 재작업: startup 상태 직접 Begin 호출은 BeginCharacterEntry의 nemesisArt 초기화를 건너뛰어 DrawNemesis 예외4회를 만들었다. 기존 startup18검사는 최종 gate에서 제외한다. 격리 새 캐릭터 생성→제품 BeginCharacterEntry(false)→Loading/Nemesis→실제 ESC/Enter 경로로 변경하고 새 빌드에서 확인한다. 제품 시작 연출 코드는 변경하지 않는다.

</details>

- 신규 캐릭터 생성 전 CharacterStoreDirectory가 공식 NativeQaSandbox.Root/character-roster-v1과 같은 절대 경로인지 확인하며 불일치하면 쓰기 전에 실패한다.

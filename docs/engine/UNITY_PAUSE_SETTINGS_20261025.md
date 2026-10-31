## 2026-10-27 A15 후속

2026-10-31 PC 복귀 수정 진행: 직접 연 설정의 키보드 마지막 `닫기`는 `BackPage()`가 부모 페이지를 닫지 않을 때 살아 있는 캐릭터에 `Resume`를 반환한다. 사망 상태에는 재개를 반환하지 않는다. 원본 소스 대상 RED 실패와 수정 후 네 탭 메뉴 논리 52/52를 확인했다. 실제 Player 클릭·키·focus 회귀 및 빌드 전달은 `I:/EXODUSER-Storage/demo-art/pause-fix/`에서 별도로 검증하며 CPU 통과를 완료 영수증으로 사용하지 않는다.

| 2026-10-31 복귀 조건 | 현행 계약 |
|---|---|
| `Resume` | `gameFocused && !PlayerDown`. `fallen`은 HP 0이지만 최종 사망이 아니므로 기존 300프레임 부활 대기 카운트를 다시 진행한다. `dead`는 재개하지 않는다 |
| 인벤토리·스킬·능력치·대장간 닫기 | `gameFocused && 각 패널의 WasRunning && !menu && !PlayerDown`. 기존 실행 상태·포커스·사망 조건을 함께 보존한다 |
| 대화·안내 뒤 입력 해제 | 키·마우스 해제 시 진입 fence만 해제한다. 메뉴·인벤토리·스킬·능력치·대장간이 열려 있거나 최종 사망이면 `Running=false`를 유지한다 |
| 회귀 근거 | `unity/Tools/pause-navigation/host-resume.cjs`: 제품 함수 원문과 실제 Core 전체 소스의 36검사, 수정 전 13실패 → 수정 후 0. 화면/장치는 대역이며 실제 Player 증거와 구분한다 |
| 실제 입력 후속 | `--unity-pause-input-check`: 1600×900 자기 숨은 창 WM 클릭, Input System `Key.Enter`·ESC·TAB, 대화·안내 네 판, 부활 대기 복귀 상태/카운트 기록. 자연 손조작·OS 창 전환과 구분하며 현재 실제 Player 실행은 대기 중 |

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

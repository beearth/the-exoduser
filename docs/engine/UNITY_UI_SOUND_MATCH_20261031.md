# ENTER와 UI 사운드 웹 일치 — 2026-10-31

작업 범위는 첫 ENTER/인장, 메뉴·버튼, 패널·TAB, 캐릭터 선택/입장, 레벨업과 드랍 획득이다. 웹 기준은 origin/main fc9b6290d4167df141193d8d57533f18a29e025c의 index.html/game.html이며 웹 코드는 변경하지 않는다. Unity 시작 기준은 15c8ed3c522de317d22cdbfd185b1ceca494b56f이다.

## 동작별 기준·차이·적용

| 동작 | 웹 원본·gain·시간·겹침 | 수정 전 Unity | 현재 Unity |
|---|---|---|---|
| 타이틀 게임 시작 | index.html _buildTitleMenu → playEnterSFX; assets/lobby/lobby_enter_sfx.mp3; gain 2, 지연 0 | 원음/gain 2, 믹서 미연결 | 같은 byte, FrontendUI.mixer Master/UI, 입력/화면전환과 같은 프레임 |
| 첫 인장 ENTER | onVidClick: 인장 dissolve 시작 → hover 종료 → 같은 원음 gain 2, 지연 0; 안내 숨김은 1200ms 뒤 | 원음 즉시, 믹서 없음 | 같은 원음 즉시, 독립 UI 믹서. 인장/전환 상태는 기존 표현 유지 |
| 타이틀 메뉴 이동·인트로 재생·캐릭터 선택 | 별도 SFX 호출 없음 | 무음 | 무음 유지 |
| 입장 버튼 hover | assets/lobby/11_loop.wav; loop, 0→.7 100ms, 종료 .7→0 80ms, stop/disconnect 100ms; 재진입 시 새 루프 | 없음 | 같은 byte, 2D UI 루프·동일 gain/페이드, 포커스/화면 이탈 시 종료 |
| 캐릭터 입장 | 같은 playEnterSFX 원음 gain 2, 지연 0 | 새 캐릭터만 소리, 저장 캐릭터는 조기 return으로 누락 | 유효한 저장 캐릭터 입장도 같은 원음 1회 |
| 게임 버튼 hover | sfx/ui/button_hover.mp3 .25, 다른 버튼 진입만, 60ms gate; sample 동일 키 30ms | 없음 | 같은 byte/gain/gate, MouseMove만. Layout/Repaint와 로비에는 추가음 없음 |
| 게임 버튼 click | sfx/ui/button_confirm.mp3 .35, 80ms; 처리기 고유음이 있으면 생략; setTimeout 0 | 없음 | 같은 byte/gain/gate. 다음 engine frame LateUpdate에서 고유 UI음 발생 여부 확인 후 1회 |
| 창 열기·일시정지·TAB 최초 열기 | sfx/ui/panel_open.mp3 .22, 실제 열림 즉시, 전환 중 close는 quiet | 없음 | 확정된 열림 1회. F10/G/J/K/TAB 단축키로 다른 창을 열 때도 open이며 마우스 패널 nav 전환만 tab. lobby/practice/death/실패/이미 열린 창은 무음 |
| 창 닫기·일시정지 해제 | sfx/ui/panel_close.mp3 .22, 실제 닫힘 즉시 | 없음 | 실제 닫힘 1회. 이미 닫힘/포커스 자동정지는 무음 |
| 패널 간 탭·대장간 하위 탭 | sfx/ui/tab.mp3 .22, 실제 바뀔 때 1회; 활성 재선택 무음 | 패널 간 탭만 연결 | 패널·대장간 탭 확정 1회. div인 탭에는 일반 button hover/confirm을 얹지 않음 |
| 레벨업 | game.html SFX.levelup: 523/659/784/1047Hz를 0/95/190/285ms, 마감 화음 420ms; 파일 없음 | 없음 | 원래 playFM/playTone/playNoise/playSub 코드의 OfflineAudioContext 48kHz stereo 렌더 ui_levelup.wav. Simulation.LevelledUp당 1회, pitch 1 |
| 드랍 아이템 획득 | sfx/pickup/pickup_item.mp3 + pickup_rummage1~5.mp3 중 랜덤, gain .5, pitch _r(1,.05)×(.92~1.08), 지연 0 | 없음 | 같은 6파일을 가방 수용 성공 후 1회. 가방 실패는 재생 안 함 |
| 골드·물약·보주 획득 원음 | SFX.pickup의 합성 1400/2000Hz FM + 3200Hz tone. 파일 없음 | 해당 독립 획득 경로 미이식 | 소리 자체는 ui_pickup_chime.wav로 보존. 존재하지 않는 획득 동작을 새로 만들지 않음 |

sample의 웹 전역 playbackRate .92~1.08 변동을 UI sample에 적용한다. 기존 ui_tab의 고정 pitch 1 계약은 이 단위부터 웹 변동 범위로 갱신한다. 모든 신규 게임 UI sample은 기존 Master/SFX/UI(2D, loop false)에 연결하며 source gain=min(1,raw×SFX%), SfxVol bus에도 SFX%가 적용된다. 예: open/close/tab은 0/60/100%에서 source 0/.132/.22, bus -80/-4.436975/0dB. 웹 절차 합성은 SFX를 bus 한 번만 적용하므로 ui_levelup/ui_pickup_chime은 SFX 0%에서 source 0, 그 외 source 1이며 SfxVol bus 한 번만 따른다. 기존 전투 믹서/EQ/컴프레서 계약은 변경하지 않는다. 프런트엔드 ENTER/hover는 웹 index와 같이 게임 SFX%와 독립된 FrontendUI.mixer Master/UI를 쓴다.

## 파일·검수

웹 원본은 재가공하지 않았다. ENTER SHA256 ef42319809727dceede0cf2e709f33346510d91adf8e771772da8e8ba715eca5. 다른 원본과 합성 WAV의 경로/byte/SHA는 I:/EXODUSER-Storage/demo-art/ui-sound/web-samples.json에 있다. 합성 코드는 원격 웹에서 직접 추출해 20261031 고정 난수로 렌더했으며 유료/AI 생성은 0이다. 재현 코드와 원문은 같은 폴더 render-web-synth.cjs, web-synth.json이다.

| 게이트 | 현재 증거 |
|---|---|
| 수정 전 재현 | tests/RED.log: 생산 패널 본문 6검사 중 열기/닫기 2실패 |
| 생산본문 독립 회귀 | tests/matrix.json: 1206조합/2412검사/0실패. 선택·Running·입력 fence 등 기존 상태 일치. Unity 장치/패널 대체이므로 실제Player 증거와 구분 |
| 실제 hover/button C# | hover 10검사 + button 11검사, 실패0. 진입100ms/종료80ms/빠른 재진입·포커스·60/80ms gate·고유음 중복·Layout/Repaint·로비 무음. 장치 대체 범위 |
| 기존 ui_tab 독립 도구 | 새 UiPanelState/UiPanelChanged 보조본문·단조시간·추가 클립·피치 범위를 반영. 전체 NativeFeedbackAudio/NativeAudioMixer 실행 1176조합/2370검사/0실패. tab만 계수해 신규 open/close와 분리. synth-zero-green/실제본문_행동회귀.json |
| 독립 C# | Core/Runtime 전체 현재 C# 컴파일 오류0. 기존 경고 유지. 공식 Unity 빌드와 구분 |
| 공식 빌드·M1 | 후보 59453c1ef의 공식 빌드 b5f3eff0: UPM IPC 30초 실패/exit1, compile/exec 0ms. 컴파일 진입 전 실패이며 M1 미실행 |
| 출력 버퍼·30초 영상 | Tools/UiSoundCapture.cs의 명시적 --unity-ui-sound-capture, sandbox/output 필수. 실제 Player·출력버퍼·30초 영상 미생성 |
| 공통 병합·Desktop | 미반영. 영수증 이후 지정 통합 담당이 정상 병합하고 -remodel-scenes 1로 갱신 |

AudioRenderer.Start가 성공하기 전에는 Listener를 열지 않는다. 녹음 모드 동안 장치는 silence를 출력하고 실제 mixed PCM은 AudioRenderer.Render로 WAV에 보존한다. 종료/예외 시 Listener volume0/pause부터 적용한 뒤 녹음을 종료한다. 근거: [Unity AudioRenderer.Start](https://docs.unity.com/en-us/engine/6000.5/script-reference/unityengine/audiorenderer/start). 기존 --unity-mute, 공식 실행기, 숨은 Desktop, 세이브 격리/사용자세이브 전후 대조를 유지한다. 영상은 생산 콜백을 스크립트로 실행하는 범위이며 자연플레이/사용자 청음 PASS로 보고하지 않는다.

영상 fixture는 전투 Update를 끈 상태에서 생산 NativeGame.OnGUI를 실제 GUI 이벤트마다 호출해 패널/HUD도 그대로 그린다. 로비는 기존 NativeLobby.OnGUI를 사용한다. 검수 설명 자막 외의 화면을 대체해서 그리지 않는다.

빠른 입장 hover 재진입은 웹과 같이 이전 소스를 80ms로 내린 뒤 100ms에 정리하고 새 소스를 첫 샘플부터 100ms로 올린다. ENTER/hover PCM은 첫 클릭 전에 사전 로드한다. 영상에서 전투 Tick은 정지시키되 실제 UpdateViews와 카메라 원래 cullingMask를 적용해 UI 뒤 월드도 실제로 렌더한다.

합성음 0% 회귀: 기존 소스1/버스−80dB의 잔여값 가능성을 실제 어댑터로 RED4실패 재현 후, source도0으로 설정해 2370검사/0실패. 이미 재생 중인 합성음의 60/100→0 변경도 즉시 source0이다. 실제 30초 캡처의 28초 지점에서 같은 Source 무음·출력버퍼를 별도 검사한다. 0보다 큰 SFX%에서 단일 bus gain 동작은 유지한다.


## 2026-10-31 정식 실행 차단 — NOT_READY

- 공식 `exo-unity.ps1` 빌드 `b5f3eff0`(07:21 UTC)은 필수 영상 복구 뒤 Unity 6000.6.7f1을 시작했으나 `Upm-74280` IPC 연결이 30초에 실패해 exit1로 종료했다. 컴파일·실행 단계는 0ms이며 오류 목록이 비었다는 사실을 컴파일 성공으로 세지 않는다. 완료 JSON의 USER_SAVE 변경0·Editor 종료 확인을 보존했다.
- 프로젝트/Packages 실체는 G: NTFS, Library는 아직 없고 UPM 기본 로그는 이번 실행보다 오래된 기록뿐이었다. 제한된 Node 자식 환경에 APPDATA/ALLUSERSPROFILE/PROGRAMDATA/COMSPEC가 없음을 관측했지만 UPM 직접 원인으로 확정하지 않았다. 공식 UPM의 전역 설정 경로는 [Unity Configuration files](https://docs.unity.com/en-us/engine/6000.6/manual/packages-list/upm-config/files)를 참고한다. 전역/시스템 환경·캐시·보안·권한 변경0.
- 이어 같은 Windows PowerShell 경로의 읽기 전용 기본 폴더 진단 자체가 `spawn EPERM`으로 2회 차단됐다. 실행 경로 변경·상승·직접 UPM 실행·추가 Unity 재시도로 우회하지 않았다. 원인 수정 뒤 허용된 한 번의 정식 재검수는 아직 사용하지 않았다.
- 실패 뒤 현재 후보의 Unity 입력3279파일/1733282317bytes를 다시 SHA256 전수 대조해 차이0·누락0을 확인했다. `post-failed-build-input-check.json`에 기록했고 실제 원본 복사본도 I:에 유지한다. 공용 잠금 없음과 자기 실행기 종료 영수증을 확인한 뒤 자기 예약만 byte/SHA 보존 후 반환했다(`reservation-return.json`).
- 남은 작업: 실행 권한/정상 자식 환경 확인 → 같은 후보 공식 빌드 → 같은 EXE 무창 M1 → 실제 ui_tab 회귀/30초 출력 녹음/1x 화면 검수 → 완료 MERGE_QUEUE → 지정 통합 담당의 비강제 unity/main 반영 → `-remodel-scenes 1` Desktop 빌드 갱신. 현재 Player·청음·영상·공통·Desktop PASS는 없다.

근거: `I:/EXODUSER-Storage/unity-jobs/codex-ui-sound/done/b5f3eff0.json`, `logs/b5f3eff0.log`, `I:/EXODUSER-Storage/demo-art/ui-sound/final-exit.json`, `post-failed-build-input-check.json`, `reservation-return.json`. 코드 원격 복구점은 `59453c1ef30d237878f4f9c478225f98be72f450`이며 이 보충은 검수 상태 문서만 변경한다.

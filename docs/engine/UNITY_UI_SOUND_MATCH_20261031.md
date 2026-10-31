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
| 창 열기·일시정지·TAB 최초 열기 | sfx/ui/panel_open.mp3 .22, 실제 열림 즉시, 전환 중 close는 quiet | 없음 | 확정된 열림 1회. lobby/practice/death/실패/이미 열린 창은 무음 |
| 창 닫기·일시정지 해제 | sfx/ui/panel_close.mp3 .22, 실제 닫힘 즉시 | 없음 | 실제 닫힘 1회. 이미 닫힘/포커스 자동정지는 무음 |
| 패널 간 탭·대장간 하위 탭 | sfx/ui/tab.mp3 .22, 실제 바뀔 때 1회; 활성 재선택 무음 | 패널 간 탭만 연결 | 패널·대장간 탭 확정 1회. div인 탭에는 일반 button hover/confirm을 얹지 않음 |
| 레벨업 | game.html SFX.levelup: 523/659/784/1047Hz를 0/95/190/285ms, 마감 화음 420ms; 파일 없음 | 없음 | 원래 playFM/playTone/playNoise/playSub 코드의 OfflineAudioContext 48kHz stereo 렌더 ui_levelup.wav. Simulation.LevelledUp당 1회, pitch 1 |
| 드랍 아이템 획득 | sfx/pickup/pickup_item.mp3 + pickup_rummage1~5.mp3 중 랜덤, gain .5, pitch _r(1,.05)×(.92~1.08), 지연 0 | 없음 | 같은 6파일을 가방 수용 성공 후 1회. 가방 실패는 재생 안 함 |
| 골드·물약·보주 획득 원음 | SFX.pickup의 합성 1400/2000Hz FM + 3200Hz tone. 파일 없음 | 해당 독립 획득 경로 미이식 | 소리 자체는 ui_pickup_chime.wav로 보존. 존재하지 않는 획득 동작을 새로 만들지 않음 |

sample의 웹 전역 playbackRate .92~1.08 변동을 UI sample에 적용한다. 기존 ui_tab의 고정 pitch 1 계약은 이 단위부터 웹 변동 범위로 갱신한다. 모든 신규 게임 UI sample은 기존 Master/SFX/UI(2D, loop false)에 연결하며 source gain=min(1,raw×SFX%), SfxVol bus에도 SFX%가 적용된다. 예: open/close/tab은 0/60/100%에서 source 0/.132/.22, bus -80/-4.436975/0dB. 웹 절차 합성은 SFX를 bus 한 번만 적용하므로 ui_levelup/ui_pickup_chime은 source 1, SfxVol bus만 따른다. 기존 전투 믹서/EQ/컴프레서 계약은 변경하지 않는다. 프런트엔드 ENTER/hover는 웹 index와 같이 게임 SFX%와 독립된 FrontendUI.mixer Master/UI를 쓴다.

## 파일·검수

웹 원본은 재가공하지 않았다. ENTER SHA256 ef42319809727dceede0cf2e709f33346510d91adf8e771772da8e8ba715eca5. 다른 원본과 합성 WAV의 경로/byte/SHA는 I:/EXODUSER-Storage/demo-art/ui-sound/web-samples.json에 있다. 합성 코드는 원격 웹에서 직접 추출해 20261031 고정 난수로 렌더했으며 유료/AI 생성은 0이다. 재현 코드와 원문은 같은 폴더 render-web-synth.cjs, web-synth.json이다.

| 게이트 | 현재 증거 |
|---|---|
| 수정 전 재현 | tests/RED.log: 생산 패널 본문 6검사 중 열기/닫기 2실패 |
| 생산본문 독립 회귀 | tests/matrix.json: 1176조합/2352검사/0실패. 선택·Running·입력 fence 등 기존 상태 일치. Unity 장치/패널 대체이므로 실제Player 증거와 구분 |
| 독립 C# | Core/Runtime 전체 현재 C# 컴파일 오류0. 기존 경고 유지. 공식 Unity 빌드와 구분 |
| 공식 빌드·M1 | 순번 대기, 미검증 |
| 출력 버퍼·30초 영상 | Tools/UiSoundCapture.cs의 명시적 --unity-ui-sound-capture, sandbox/output 필수. 검수 실행 대기 |
| 공통 병합·Desktop | 미반영. 영수증 이후 지정 통합 담당이 정상 병합하고 -remodel-scenes 1로 갱신 |

AudioRenderer.Start가 성공하기 전에는 Listener를 열지 않는다. 녹음 모드 동안 장치는 silence를 출력하고 실제 mixed PCM은 AudioRenderer.Render로 WAV에 보존한다. 종료/예외 시 Listener volume0/pause부터 적용한 뒤 녹음을 종료한다. 근거: [Unity AudioRenderer.Start](https://docs.unity.com/en-us/engine/6000.5/script-reference/unityengine/audiorenderer/start). 기존 --unity-mute, 공식 실행기, 숨은 Desktop, 세이브 격리/사용자세이브 전후 대조를 유지한다. 영상은 생산 콜백을 스크립트로 실행하는 범위이며 자연플레이/사용자 청음 PASS로 보고하지 않는다.

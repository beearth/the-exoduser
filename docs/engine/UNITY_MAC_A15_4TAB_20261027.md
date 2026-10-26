# Mac A15 설정 4탭 최소 연결 — 2026-10-27

## 고정 근거와 범위

PC 전달 branch `codex/ui-resume-player-20261026` SHA `f0f882c19fd201ebcdc7a32303643143ca1991c3`의 `docs/engine/ui_handoff/a15-settings-layout-handoff.md`(blob `a27d3b14beec333d7eb2794d9655d59ee47137c7`, SHA256 `5157caf9f2a4e8845e27155737c05dd197b434ab98d93824e6f163a9f0cded96`)와 `a15-audio-tab-keyboard-oracle-20261027.md`(blob `fbcd9c6e20cbfbefcb4efa328578a197321745d6`, SHA256 `87a56142967d1a77f804d535f75a077c23597f7bf7393e488b3c674d0e863c35`)를 사용했다. 웹 원본은 main `607110d52a56a1e5622a78e2ce7d09582946920a`: `game.html` blob `85c6fc6c87308d1d4a68d9ba1b56b1a8be40ea14`, `ui-panels.js` `9ca0a4729b34f8e3babb8182d482ae11f0d08d86`, `ui-refinement.css` `bbee08d0d5a359359aeebfdec5353e3becebee7b`. Mac 출발 HEAD `a3869387d57a2367c442e07df1537771db0bda85`의 NativePauseMenu/Navigation/Keyboard blob은 PC 문서의 고정값과 일치했다.

사전 백업은 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15-4TAB-20261027/before/`. 최종 소스 patch SHA1 `21cb7a93c06a42552eec3075dc93c8a0e2b2858b`. Mac 소유 `NativePauseMenu.cs`, `NativePauseMenu.Keyboard.cs`, `Core/PauseNavigation.cs`와 Editor 검증/순수 navigation 검사만 변경했다. PC 소유 `NativeKeyBindList`·`KeyBindings`·전투 Core, 기존 설정 v2·`cinSeen` 저장/로비 경로, 19 UI patch, 웹·미디어·플레이어 빌드는 수정하지 않았다.

## 현행 동작 계약

| 탭/영역 | 현재 연결 | 제한 |
|---|---|---|
| 게임 0 | 4탭 순서와 제목, 이 빌드에서 변경 가능한 게임 설정이 없다는 안내 | 언어·캐릭터 선택·난이도·자동 물약 등 엔진/저장 owner 미연결. 활성 스위치/가짜 값 없음 |
| 화면 1 | FPS **30/60/120/144/244/무제한**, 전체 화면 **켜짐/꺼짐**; 기존 frameCapChanged/fullscreenChanged callback | 웹 해상도·borderless·화면 scale 선택 미이식 |
| 사운드 2 | SFX/BGM **0–100%**; 기존 sfxChanged/bgmChanged callback. 키보드 좌/우 한 칸 **1%**, 0·100 clamp, 변화 없으면 callback 호출 없음 | BGM 곡 선택·실제 청음은 미검증 |
| 조작 3 | 기존 `NativeKeyBindList` 인스턴스를 페이지 안에 삽입. KBM 주/보조 20동작·삭제/리셋, 기존 패드 안내, v2 저장 Version 감지는 그대로 | 실제 패드 입력 재지정은 미연결. 목록 자체의 좁은 창 내부 열 재구성은 PC 소유 목록 변경이 필요해 후속 시각 게이트 |
| 배치·입력 | 1920×1080 설계 좌표의 넓은 창 2열, 물리 폭 1100px 미만 지원 카드 1열; 페이지 내부 wheel scroll과 고정 footer/기본값/뒤로. 탭 전환/설정 재열기 때 scroll 0. Arrow 좌우 순환, Home/End는 탭에 초점이 있을 때 첫/끝 탭 | 웹 DOM ARIA/브라우저 focus 복제나 시각 PASS 주장 없음 |
| 키 지정 대기 | 전역 `KeyCaptureActive`가 내장 목록도 인식. PollKeys는 듣는 중 메뉴 TAB/K/ESC 탐색을 처리하지 않으며 OnGUI 목록이 Esc 취소/Tab 바인딩을 처리. 탭/footer 클릭은 대기 중 비활성 | 실기 OS 키 입력 검수는 후속 |

2026-10-27 후속: 설정 페이지에서 **키 지정 대기가 아닐 때** Tab은 `PauseKey.Next`로 현재 메뉴 초점을 다음 탭·지원 카드·footer로 옮긴다. 인벤토리 panel 요청은 루트 일시정지에서만 한다. 키 지정 대기 중 Tab은 위 표처럼 바인딩 캡처가 우선한다. 조작 목록의 개별 주/보조 슬롯은 기존 목록의 마우스 hit area 구현이므로 Tab 이동 대상이라고 주장하지 않는다.

기존 `NativePauseMenu.DrawSettings`의 3탭 구현과 전체화면 `keyPage`는 기존 격리 A16 test hook을 위해 남겨뒀다. 정상 `Draw`는 A15 경로로 진입한다. 기본값 버튼은 기존 SFX60/BGM60/FPS0 callback만 호출하고, fullscreen의 임의 기본값은 만들지 않는다. `NativeGame` host callback과 화면 적용/지연 저장 로직은 변경하지 않았다.

## 검증과 남은 게이트

- 순수 `PauseNavigationTests`는 Unity 6000.6.7f1 번들 .NET 8로 **40/40 PASS**: Game→Display→Audio→Controls와 좌우 순환, Home/End, FPS/전체화면·SFX/BGM action, 기본값/뒤로, ESC/focus fence를 확인했다.
- Unity 6000.6.7f1 Mac Editor `PortVerification.Verify` **1회 exit0**, receipt `passed:true`: HUD GPU·Inventory·Lobby 기존 검사와 새 `UNITY_A15_SETTINGS_NAV_SFX_CAPTURE_PASS` 로그. 새 검사는 SFX 60→61/0→1/100→100 및 변경 없는 100에서 callback 0, `NativeKeyBindList` Esc 취소/Tab 캡처 정책을 실제 Unity class로 확인한다. receipt `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15-4TAB-20261027/editor-verify.json`, 로그 같은 폴더 `editor-verify.log`. C# 오류0, 기존 UAC1001만 남았다. 검증 뒤 `Draw`의 키 이벤트 통과 조건을 듣기 상태에 한정하는 단일 조건식 정정은 재컴파일하지 않았으므로 실기 입력은 HOLD에 남긴다.
- 이전 `pause-settings` .NET 프로젝트는 Unity/키 목록 참조를 현재 소스에 맞춰 제공하지 않아 standalone 실행 불가였다. 이 프로젝트를 A15 PASS로 계상하지 않는다. Unity import가 재작성한 Resources `.meta` 411개와 새 1개는 백업 후 HEAD bytes로 복원했다.
- 새 Player build **0**, 실창 1920/좁은 화면 4탭·2열/1열·footer, 실제 SFX/BGM 청취·키 입력·재시작·미지원 패드 동선은 **HOLD**. A15 전체 완료가 아니다. 기존 사용자 앱/PID 및 개인 설정·로스터 파일 접촉0.

## 2026-10-27 최종 소스 Player 후속

위 검증/HOLD 문단은 `dc09fa14f702862b45dd6adf20991163b8c930ff` 체크포인트 시점의 기록이다. 이후 설정 페이지의 **비대기 Tab → `PauseKey.Next`** 분기를 `NativePauseMenu.Keyboard.cs`에 추가했다. 루트 일시정지의 `invPanel` 요청과 조작 목록 대기 중 `Tab` 캡처는 기존 분기로 유지했다. `PauseNavigationTests`의 설정 Tab 다음 초점·돌아오기 두 항목을 추가해 **42/42 PASS**. 이번 두 소스 파일의 변경 patch SHA256은 `800843fa523dd9de83e64a291876edd012bf065a06e2ff477cc564b5d9887a7e`이다.

Unity 6000.6.7f1 Mac ARM64 `PortVerification.Build -settingsQa true` **1회**: receipt `passed:true`, `Succeeded`, C# 오류 0, 출력 **2,176,439,102 bytes**, QA product `EXODUSER Settings QA`, bundle identifier `com.fordeargamers.exoduser.settingsqa`. 로그에 기존 UAC1001만 있다. 출력과 receipt는 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15-4TAB-PLAYER-20261027/build/` 및 `build-receipt.json`. 따라서 앞 절의 컴파일 뒤 한 줄 정정까지 포함한 현재 소스의 Player 컴파일은 확인됐다. Unity import가 만든 tracked 413파일은 `build-generated.patch`에 보존한 뒤 HEAD bytes로 복원하고, 신규 meta·ProjectSettings 2파일은 `.generated`로 따로 보존했다.

| 실제 Player 관찰 | 결과와 범위 |
|---|---|
| 실행 귀속 | 첫 `getApp(path)`가 무인자 QA 복제 PID30470을 만들었다. 그 창의 입력/화면은 격리 `-output` 증거로 사용하지 않는다. 해당 QA 전용 기본 profile에 테스트 캐릭터 `A15QA`를 생성했을 가능성이 있으며, 기존 일반 사용자 앱/profile과는 다른 bundle ID다. 이 파일은 불확실한 사전 QA 데이터 보존을 위해 삭제하지 않았다. PID30465·30470만 종료한 뒤 `open -n -a <이 빌드> --args --unity-frontend-review -output <전용 player-data>`로 재실행했고 PID30592 **단독**, 전체 argv 일치, `<player-data>/character-roster-v1/characters.v1.json` 생성으로 입력 창 귀속을 확인했다. 종료 후 QA PID0, 기존 사용자 앱 PID38141/48476/52157 유지. |
| 1280×720 실창 | 게임/화면/사운드/조작 4탭과 화면·사운드 2열, 조작 목록의 20동작 양 슬롯 상단·고정 footer를 육안 확인했다. 설정의 비대기 Tab은 인벤토리 대신 다음 탭/footer의 주황 초점 테두리로 이동; Home/End 탭 이동, SFX 60→61% 키보드 한 칸, 설정 Esc→일시정지 복귀를 확인했다. 원본 캡처 `game-720p-isolated.png`, `tab-focus-720p-isolated.png`, `display-720p-isolated.png`, `audio-720p-isolated.png`, `sfx-61-720p-isolated.png`, `controls-720p-isolated.png`가 같은 `_out` 폴더에 있다. `--unity-frontend-review`에서는 정상 설정 저장 I/O가 비활성이라 디스크 저장 성공으로 계상하지 않는다. |
| 1920×1080 Player 캡처 | 같은 빌드의 기존 `--unity-pause-smoke -pause-phase visual`은 `settings-0/1/2-1920.png`를 남겼다. 화면·사운드 2열과 footer 겹침0을 실제 1920×1080 픽셀에서 확인했다. 이 구형 visual harness는 탭 0–2만 캡처하므로 **조작 탭 1080p는 미검증**. `pause-visual.json`은 visual-only이며 입력 PASS가 아니다. |
| 남은 HOLD | 조작 목록 마우스 클릭에 대기 표시가 나타나지 않아 실제 Esc 취소·Tab 바인딩 입력의 Player PASS는 없다. 좁은 물리 폭 <1100px 1열/scroll, 목록 맨 아래, 루트 일시정지 Tab→인벤토리(첫 연습 구간에서는 panel 전환이 차단됨), SFX 0/100 실기 clamp, 청각 출력, 재시작 후 v2/`cinSeen` 보존, 패드 재지정은 실기 미검증이다. Editor fixture의 직접 key-list 정책 PASS와 구분한다. 전체 A15 인수는 HOLD. |

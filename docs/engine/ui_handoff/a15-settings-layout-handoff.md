# A15 설정 UI Mac 전달 원문 — 2026-10-27 05:45 동결

상태: **소스 대조·최소 hunk 명세만 동결. 제품 구현/Player 인수 아님.** 문서 담당은 이 파일의 고정 SHA와 아래 범위를 그대로 게시하고, Mac 변경이 뒤따르면 새 소스 SHA·실기 결과를 별도 후속 기록으로 연결한다. 전체 기획 재작성, 새 디자인/번역, Unity Runtime·설정 IO·asset 변경은 이 문서 작업에서 0.

## 고정 입력과 실제 렌더 경로

- 웹 `origin/main` `607110d52a56a1e5622a78e2ce7d09582946920a`: `game.html` blob `85c6fc6c87308d1d4a68d9ba1b56b1a8be40ea14`, `ui-panels.js` `9ca0a4729b34f8e3babb8182d482ae11f0d08d86`, `ui-refinement.css` `bbee08d0d5a359359aeebfdec5353e3becebee7b`.
- Mac `origin/codex/unity-mac-20261024` `a3869387d57a2367c442e07df1537771db0bda85`: `NativePauseMenu.cs` blob `f38a28ea1333eedaed54f40c5b2011a36236223a`, `Core/PauseNavigation.cs` `b377da44d0ae96b2e1d76f8acd31b0c78675bdde`, `NativePauseMenu.Keyboard.cs` `6157583d33cdf746256bfe0958899fe254457694`, `NativeKeyBindList.cs` `a8a4c780873322956b3084e456d9023d10f3a30a`, `Core/NativeSettingsStore.cs` `efa879ce8855b36887d6e4e61a4b79f71fd6ba45`, `NativeGame.SettingsPersistence.cs` `a438c70858ab50de8bf241480e3183d9509df567`. 이 설정 Runtime blob들은 앞선 Mac `77352295`와 동일하다.
- 웹 `game.html:2552,2558`에서 두 UI 파일을 로드한다. 정적 `#settings .pbox`/`#keyBindList`는 `game.html:2704-2719`에 있다. 실제 4탭과 control 분배는 `ui-panels.js:71-119`가 **게임→화면→사운드→조작** 순으로 DOM을 재구성한다. `:94-98,149-163`이 탭 전환·창 재열기 때 공통 `.settings-pages` scrollTop을 0으로 돌린다. 탭의 Left/Right/Home/End는 `ui-panels.js:12-39`.
- 웹 CSS `ui-refinement.css:1205-1207`은 2열 page/grid와 1100px 이하 1열이다. 조작 탭의 최종 우선 규칙은 뒤쪽 `:1324-1335`: 1200px 이상 커서 행 위, 전폭 `#keyBindList` 내부 2열/행 간격 4px·열 간격 28px. `:1231`의 앞선 2:1 조작 컬럼 선언만 따르지 않는다. `game.html:48704-48761`이 같은 조작 탭의 키보드/패드 모드, 주·보조키, 삭제, 초기화 목록을 재생성한다.

## 차이 3건과 Mac 최소 편집면

| 차이 | Mac 현재 사실 | 인수할 최소 hunk·완료 조건 |
| --- | --- | --- |
| 1. 탭 구조 | `NativePauseMenu.cs:101-109`는 화면/소리/조작 안내 **3탭**, `PauseNavigation.cs:8,15,38-44`의 Count·SelectTab·Handle도 3탭 전제다. 웹 게임 탭의 언어·캐릭터 선택·게임 난이도·자동 물약은 Mac `NativeSettingsState`의 현재 4설정에 없다. | 탭 헤더/라우팅은 `NativePauseMenu.DrawSettings`, 커서 수·좌우/Home/End는 `Core/PauseNavigation`, PollKeys 변경이 실제 필요할 때만 `NativePauseMenu.Keyboard.cs`. 4탭 시각 구조를 목표로 하되 **게임 탭은 실제 연결되는 게임 동작이 없으면 빈 활성 탭으로 완료 표시하지 않는다.** 현 구현 범위는 화면·소리·조작의 작동 가능한 항목. 게임 항목은 엔진 owner/상태/저장 계약을 별도 인수해야 한다. |
| 2. 2열·스크롤/footer | `NativePauseMenu.cs:84-87`은 1280×720 기준 680×576 panel, `:101-164`는 고정 y좌표라 페이지 공통 2열·스크롤이 없다. 하단 안내/기본값/뒤로는 `:107-109` y528/588. 별도 키 페이지에만 wheel scroll (`:165-187`)이 있다. | `NativePauseMenu.cs`의 settings content rect, clip, scroll, 지원 control의 column placement, footer 경계만 편집. 화면 FPS/전체화면과 소리 SFX/BGM의 기존 callbacks·값은 유지. 넓은 화면 2열, 좁은 화면 1열, tab/재열기 scroll=0, wheel hit area, footer 겹침 0을 컷으로 확인. 웹 CSS breakpoint 수치를 Unity 물리 px에 맹목적으로 복사하지 않는다. |
| 3. 조작 목록이 같은 탭에 없음 | `NativePauseMenu.cs:154-164`는 6개 안내와 마우스 `키 설정 변경` 버튼. `:165-187`이 전용 전체화면 keyPage에서 `NativeKeyBindList.Draw`를 호출한다. 목록 구현은 주/보조·KBM/패드·삭제·리셋/스크롤을 이미 소유한다. 메뉴 keyboard focus로 버튼을 여는 경로는 없다. | `NativePauseMenu.DrawControls`와 `DrawKeyPage`의 호출/clip/scroll 재배치만 우선. 기존 `NativeKeyBindList` 인스턴스와 `NativeKeyBindInput`·v2 store를 재사용. 조작 탭 내부에서 KBM 20 action 양 슬롯을 읽고 고치며, 패드 rebind가 미연결이면 활성 기능으로 보이지 않게 한다. 새 cursor 이동과 ESC/키 캡처 우선순위를 실제 키로 검수한다. |

## 지원된 callback 매핑과 미지원 표시

| UI control / 웹 출처 | Mac 현재 연결 | A15 허용 |
| --- | --- | --- |
| FPS 제한 `optFps` (`game.html:2823`, `ui-panels.js:111`) | `NativePauseMenu.DrawDisplay:122-131` → `frameCapChanged` → `NativeGame.SetFrameCap:404-405` → `Application.targetFrameRate`; v2 store 저장 예약 | 화면 탭 재배치 가능. 기존 **30/60/120/144/244/무제한**만 노출 |
| 전체화면 (`optDispMode` 계열 웹 `game.html:2835-2844`와 별개 native on/off) | `DrawDisplay:132-137` → `fullscreenChanged` → `NativeGame.SettingsPersistence.RequestSettingsFullscreen:59-73` → `Screen.fullScreenMode`; 적용된 host값만 저장 | 현재 **켜짐/꺼짐**만 표시. 웹 borderless/windowed/resolution 선택 parity 주장 금지 |
| 효과음 `optSfx` (`game.html:2732`) | `DrawAudio:139-143` → `NativeGame.SetSfxPercent:402` → `sound.SetVolumePercent`/로비 시작 SFX; v2 저장 예약 | 0–100 지원. 청취/재시작 검수 필요 |
| 음악 `optBgm` (`game.html:2733`) | `DrawAudio:143-145` → `NativeGame.SetBgmPercent:403` → `lobby.SetBgmPercent`; v2 저장 예약 | 0–100 지원. 곡 선택(`optBgmTrack`)은 별도 미이식 |
| 키 목록 `#keyBindList` (`ui-panels.js:114`, `game.html:48704-48761`) | `NativeKeyBindList.Draw`/`NativeKeyBindInput.Bindings`; `NativeGame.SettingsPersistence:50`이 Version 변화를 0.25초 지연 저장 예약, v2 `binds`/`binds2` 각 20 action | 기존 주/보조·삭제/리셋을 같은 조작 탭으로 연결. OS 입력과 저장/재시작은 새 Player 인수 필요 |

**미연결/지원 불가를 분리:** 웹 BGM 트랙, 해상도·스케일, Bloom/후처리·흔들림·파티클, 난이도·자동 물약·픽업·캐릭터 선택, 언어, 커서 카드의 Mac 엔진 적용/저장 callback은 위 Mac 소스에서 확인되지 않았다. 이 명세는 그런 스위치를 켜진 것처럼 그리는 범위를 포함하지 않는다. `NativeKeyBindList`의 패드 안내와 실제 패드 rebind/저장도 별도이며, GUI에 표시된다는 사실을 플레이 가능한 입력으로 취급하지 않는다. 과거 `NativeKeyBindList.cs:12-13,177` 주석의 저장 미이식 설명은 현재 Mac v2 이후 낡은 설명이다. 현행 저장 판단은 `NativePauseMenu.cs:171-174` runtime SaveNote와 `NativeGame.SettingsPersistence` 및 v2 store를 기준으로 한다.

## 보존·충돌 검수와 실기 인수

- **19 patch:** Mac `docs/engine/UNITY_MAC_PC_UI_PREFLIGHT_20261026.md`의 PC 1–19 patch 접점 통합과 C# compile PASS는 정적 기준이며 Player GUI 전체 PASS가 아니다. A15에서 다른 UI 파일 전체 덮어쓰기/branch merge를 하지 않는다. `NativePauseMenu`/`PauseNavigation`의 이 고정 blob을 출발점으로 hunk를 대조한다.
- **v2/`cinSeen`:** `NativeSettingsStore.Version=2`; 선택 상위 JSON boolean `cinSeen:true`, 4설정, `binds`/`binds2` 20 action 양 슬롯, 알 수 없는 `extra`·중첩 pad JSON, revision/backup/lock을 유지한다. `NativeGame.SettingsPersistence.cs`와 `NativeLobby` first-run 진입은 A15 비소유. Mac `docs/engine/UNITY_MAC_A05_CINSEEN_20261027.md`의 격리 Player 자연 종료→재시작 로비 진입 영수증은 기존 범위만 증명한다. A15 후속의 재실행 증거로 대체하지 않는다.
- **A16 capture/ESC/TAB:** 현재 `NativePauseMenu.Keyboard.cs:17-21`에서 keyPage listening 중 menu key 입력을 막고, 비리스닝 ESC는 keyPage를 닫으며, 그 외 TAB/K는 인벤토리/스킬 전역 요청 경로다. `NativeGame.cs:148-159,389-397`은 `HandlePanelHotkeys`를 menu `PollKeys`보다 먼저 호출하고 `KeyCaptureActive`일 때 전역 window hotkey를 차단한다. 목록을 조작 탭 안으로 옮긴 뒤에도 **대기 중 TAB을 새 바인딩으로 잡을 때 인벤토리가 열리지 않는지**, ESC는 대기 취소/일반 뒤로를 구분하는지, F5/reset·주/보조 입력이 gameplay로 새지 않는지 확인한다. 현재 keyPage 전용 guard를 지운 채 목록만 옮기면 충돌 위험이 있다.
- **실기 컷/입력:** Settings QA marker가 있는 고유 root의 Mac Player에서 1920×1080 및 작은 창 4탭/2열→1열/footer 컷; FPS/전체화면 host값, SFX/BGM 청취·값 변경; 조작 목록 첫·중간·마지막 action, wheel 맨 아래, 주/보조 리맵·삭제·F5, ESC 취소/뒤로, 대기 TAB과 비대기 TAB을 각각 기록한다. 종료·재시작 후 동일 QA 사본의 `cinSeen:true`, revision, 4설정, 양 슬롯, unknown pad JSON을 대조한다. 입력/캡처/Player 빌드가 없으면 **A15 실기 HOLD**로 보고한다.

이 문서는 기존 `frontend-screen-role-contract.md` A15 절의 전달용 발췌·정밀화이다. 참조 범위 밖 시스템 기획/번역/실행 자산을 재정의하지 않는다.
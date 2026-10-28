# Mac A15 설정 4탭 최소 연결 — 2026-10-27

## 고정 근거와 범위

PC 전달 branch `codex/ui-resume-player-20261026` SHA `f0f882c19fd201ebcdc7a32303643143ca1991c3`의 `docs/engine/ui_handoff/a15-settings-layout-handoff.md`(blob `a27d3b14beec333d7eb2794d9655d59ee47137c7`, SHA256 `5157caf9f2a4e8845e27155737c05dd197b434ab98d93824e6f163a9f0cded96`)와 `a15-audio-tab-keyboard-oracle-20261027.md`(blob `fbcd9c6e20cbfbefcb4efa328578a197321745d6`, SHA256 `87a56142967d1a77f804d535f75a077c23597f7bf7393e488b3c674d0e863c35`)를 사용했다. 웹 원본은 main `607110d52a56a1e5622a78e2ce7d09582946920a`: `game.html` blob `85c6fc6c87308d1d4a68d9ba1b56b1a8be40ea14`, `ui-panels.js` `9ca0a4729b34f8e3babb8182d482ae11f0d08d86`, `ui-refinement.css` `bbee08d0d5a359359aeebfdec5353e3becebee7b`. Mac 출발 HEAD `a3869387d57a2367c442e07df1537771db0bda85`의 NativePauseMenu/Navigation/Keyboard blob은 PC 문서의 고정값과 일치했다.

사전 백업은 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15-4TAB-20261027/before/`. 최종 소스 patch SHA1 `21cb7a93c06a42552eec3075dc93c8a0e2b2858b`. Mac 소유 `NativePauseMenu.cs`, `NativePauseMenu.Keyboard.cs`, `Core/PauseNavigation.cs`와 Editor 검증/순수 navigation 검사만 변경했다. PC 소유 `NativeKeyBindList`·`KeyBindings`·전투 Core, 기존 설정 v2·`cinSeen` 저장/로비 경로, 19 UI patch, 웹·미디어·플레이어 빌드는 수정하지 않았다.

## 현행 동작 계약

| 탭/영역 | 현재 연결 | 제한 |
|---|---|---|
| 게임 0 | 4탭 순서와 제목. 2026-10-27 후속부터 기존 전체 화면 상태/콜백을 공유하는 켜짐·꺼짐 버튼 | 언어·캐릭터 선택·난이도·자동 물약 등 나머지 엔진/저장 owner 미연결. F11 단축키 추가 없음 |
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

## 2026-10-27 조작 키 캡처·격리 저장 Player 후속


앞 표의 HOLD는 이전 빌드 시점 기록이다. 이 후속은 `--unity-a15-direct` QA 전용 진입을 추가했다. 실행에는 `--unity-cinematic-persistence-review`, Settings QA 제품명/번들 ID, `_out/UNITY-MAC-A05-IO-*` 절대 경로와 정확한 `qa-output.marker`가 모두 필요하다. `-a15-phase write`는 로비 미리보기 필드의 설정→조작에 직접 진입하고 `up` 주 키 캡처를 시작한다. `read`는 같은 페이지에 대기 없이 진입한다. 이 경로에서만 F6은 `up` 캡처 재개, F7은 사운드 탭/SFX 카드 초점이다. 일반 제품의 로비·설정 입력은 이 플래그를 쓰지 않는다.

| 항목 | 코드 계약 및 실제 증거 |
|---|---|
| OS 키 캡처 | 첫 QA Player에서 Esc 취소 직후 설정이 닫히고 Tab 지정 직후 footer로 초점이 이동하는 중복 입력을 발견했다. `NativeKeyBindList.CaptureConsumedFrame`을 캡처 키 다운에서 기록하고 `NativePauseMenu.PollKeys`가 해당 프레임과 다음 프레임의 메뉴 처리를 건너뛰도록 수정했다. 두 번째 Player의 실제 Esc는 대기만 취소하고 조작 탭을 유지했다. F6→Tab도 `up=Tab`을 표시하면서 조작 탭 초점을 유지했다. |
| 저장·재시작 | 같은 격리 루트의 `native-settings-v1/settings.v1.json` v2 revision2에 `sfxPercent:61`, `binds.up:"Tab"`가 저장됐다. 두 번째 Player의 시작 로그 `A15_QA_DIRECT phase=read ... sfx=61 up=Tab listening=False`, 조작 탭 `TAB`, 사운드 탭 `61%`가 일치했다. 기존 BGM60/FPS120 값과 캐릭터 로스터 경로는 QA 루트 안에 있었다. `cinSeen` 항목과 실제 소리 청취는 이 테스트 대상이 아니다. |
| 스크롤 | 고정 상한 `220`을 제거하고 페이지의 카드 시작 Y·높이·하단 여백에서 `max(0, contentHeight-content.height)`를 계산한다. 현재 설계 좌표의 두 카드 배치는 단열일 때 `238+190+18=446`, 그 외 `18+190+18=226`, 뷰 높이 `610`이므로 상한 0이다. 좁은 물리 폭의 실제 시각·마우스 wheel은 별도 게이트다. |
| 빌드·실행 범위 | Unity 6000.6.7f1 ARM64 Settings QA `PortVerification.Build` 첫 빌드와 입력 버그 수정 후 최종 재빌드 모두 `Succeeded`, C# 오류0. 첫 빌드 앱의 write 실행 PID31536, 최종 빌드 앱의 read 실행 PID31735, 총 Player 실행 2회. 둘 다 위 같은 명시 루트를 사용했고 종료했다. `build-receipt-final.json`, `build-final.log`, `player-write.log`, `player-read.log`는 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15-CAPTURE-20261027/`에 있다. 요구한 빌드 1회는 실제 버그 수정을 위해 2회가 되었으며 이를 1회로 계상하지 않는다. |

PC 원본 `NativeKeyBindList`의 캡처 처리에 소비 프레임 한 필드만 추가했고 게임패드 재지정·키 충돌 정책은 바꾸지 않았다. 저장은 기존 v2 직렬화 경로이며 별도 키 저장 형식을 만들지 않았다. 전용 QA 진입·사용자 데이터 분리와 OS Esc/Tab 및 SFX/키 저장 복원은 이 범위에서 PASS. 일반 경로 마우스 클릭, 좁은 창, 청각 출력, 다른 메뉴와의 충돌, 패드 입력은 여전히 HOLD다.

## 2026-10-27 A15 저장 시 A05·미지원 데이터 보존 회귀

같은 `e7fe487bfba541f01ac4033f4d4d744210e7b04e` 소스의 기존 Settings QA ARM64 Player를 재사용했다. 새 빌드·코드 변경은 0. 새 절대 루트 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A05-IO-A15-PRESERVE-20261027`에 정확한 A05 marker를 만들고, 이전 **QA 전용** A05 파일의 v2 설정을 복사해 별도 `qaSentinel`을 추가했다. 원본과 편집 전 문서 사본은 이 루트의 `seed-settings.v2.json`, `before/`에 보존했다. 기존 사용자 설정이나 로스터는 입력으로 사용하지 않았다.

| 항목 | seed → Player 저장·재시작 | 판정 |
|---|---|---|
| 지원 설정·키 | revision **3→5**, SFX **35→36%**, `binds.up` **KeyZ→Tab**. read Player 시작 로그 `sfx=36 up=Tab`, 조작 화면 `TAB`/보조 `X`, 사운드 화면 `36%` | 실제 지원 UI save/read PASS |
| A05 완료 표식 | 상위 boolean `cinSeen:true`가 저장 파일에 그대로 남음 | 값·raw token 보존 PASS; QA 직접 진입이라 자연 로비 분기는 재검증하지 않음 |
| 미지원·기존 자료 | `gpKeyMap.pad0.buttons=[1,2]`, 별도 `qaSentinel.nested.keep="A15-preserve-20261027"`와 중첩 배열, `binds2.up=KeyX` 모두 저장 전후 동일. 두 unknown JSON value와 `cinSeen:true`의 원문 token도 동일 | 저장 보존 PASS; 실제 패드 입력/적용은 HOLD |
| 기타 설정 | BGM45/FPS144/fullscreen false, schema/version 및 모든 보조 키 동일 | 저장 파일 대조 PASS |
| 1099px 요청 | write Player에 `-screen-width 1099`를 줬으나 화면 JPEG는 **1100×784**(창 chrome 포함), 사운드 카드는 2열이었다. footer는 보였지만 1열 첫·끝 카드/scroll 상한은 실제 화면에서 볼 수 없었다 | 1열·wheel·scrollmax 0 시각 판정 **HOLD**; OS 창 강제 조정 없음 |

증거는 같은 루트의 `preservation-receipt.json`, `player-write.log`, `player-read.log`, `controls-restored.jpg`, `audio-restored.jpg`, `audio-request-1099.jpg`이다. QA Player 실행은 write/read 각 1회로 종료했고 QA 프로세스는 남기지 않았다. 앞 절의 일반 경로 마우스·청각·미지원 게임 옵션 HOLD는 그대로다. 이 결과는 지원된 A15 설정 저장 경로의 보존 회귀이며 전체 A15 완료 판정은 아니다.

2026-10-27 후속 1098px 단일 실행에서는 실제 JPEG 폭 **1098px**에서 사운드 첫·끝 카드가 1열로 보이고, 휠 1회 전후 위치와 footer가 유지돼 이 폭의 `scrollmax=0` 시각 게이트를 PASS했다. 29언어 라벨 후보 PC 고정 `157e3e8f…`는 62 ID 전체 QA 미확정으로 제품 적용0이며, 현재 Mac 언어/폰트 및 PC 소유 키 목록 hook만 preflight했다. [독립 범위·증거](UNITY_MAC_A15_LABEL_PREFLIGHT_20261027.md).

후속 PC `766250b64…` 확정 후 exact 43 ID 자료와 Mac 설정 제목·4탭 5 ID를 부분 연결했다. 기존 ko/en 값 유지와 ja/es/cs 제목 실화면을 확인했으며, PC 소유 키 목록 38 ID의 실제 행은 여전히 영어다. semantic6/native-only13과 ar/RTL은 제품 번역으로 채택하지 않았다. 앞 문단의 채택0은 이전 preflight 시점 판정이다. [ID별 현재 상태](UNITY_MAC_A15_LABEL_ADAPTER_20261027.md).

PC owner의 키 목록 seam 승인 후 Mac은 `NativeKeyBindList`에 38 ID 표시 hook을 적용했다. 새 ARM64 Settings QA 빌드1회 오류0, 격리 Player1회에서 ko/en 기존 목록과 ja/es/cs 실제 목록·대표 긴 행·Esc 취소/Tab 캡처 시 조작 탭 유지가 보였다. 앞 문단의 키 목록 영어 상태는 이전 빌드 이력이다. 저장 v2·`cinSeen`·입력 처리와 19 patch는 변경하지 않았다. ar 영어 fallback은 코드/자료만 확인했고 ar GUI/RTL 및 일반 마우스는 HOLD. [상세](UNITY_MAC_A15_LABEL_ADAPTER_20261027.md#2026-10-27-pc-seam-인수allowlist-보강-후속).

A15 글꼴 후속에서는 미검수 언어 exact43의 실제 스타일 cmap을 감사했다. Mac 설정 제목/탭 `el/th/zh`의 지역 폰트 보정은 ARM64 빌드 오류0·격리 Player 3화면 및 ko 원상복귀로 확인했다. PC 키 목록의 지역 폰트·긴 행 배치는 제안 patch만 남겨 제품 연결·실기 PASS가 아니다. [누락 최소표·경계](UNITY_MAC_A15_FONT_COVERAGE_20261027.md).

추가 PC owner 인수 `97be6444b6…`의 지역 font와 clip 포함 긴 이름 최소 hunk를 `NativeKeyBindList`에 적용했다. Unity 6000.6.7f1의 `GetInstanceID()` CS0619만 font·px 튜플 cache 키로 치환한 뒤 ARM64 QA 빌드 성공/오류0. el/th/zh 실화면·ko 복귀, el 방패 두 줄, 1920 하단 스크롤과 Esc/Tab 캡처 격리를 확인했다. **OS 마우스는 오른쪽 E 표시 버튼 클릭이 왼쪽 Q 캡처로 이어져 HIT RECT FAIL**, 1280 스크롤과 전체29 언어 fit은 HOLD. 제품 입력/저장 코드는 바꾸지 않았다. [적용 범위·증거](UNITY_MAC_A15_FONT_COVERAGE_20261027.md#pc-소유-수정본-인수제품-적용--실화면--2026-10-27).

## 2026-10-27 Game 탭 전체 화면 버튼 후속

웹 `game.html:2617`은 Game 설정 영역 하단에 폭 100% `전체화면 (F11)` 버튼을 두고 `toggleFullscreen()`을 호출한다. Unity는 이 위치의 기능을 Game 탭 첫 카드로 제시하며 F11 단축키 문구와 새 단축키는 추가하지 않았다. `NativePauseMenu.DrawA15FullscreenCard`를 Game index 4와 Display index 5가 공유한다. 두 탭 모두 `Screen.fullScreen`을 받아 같은 `fullscreenChanged` → `NativeGame.SetFullscreenPreference` → `RequestSettingsFullscreen`/host 확인/지연 v2 저장 경로를 쓴다. `PauseNavigation.Count`는 Game에서 6→7(탭 0–3, 버튼 4, 기본값 5, 뒤로 6); Game index 4 Enter는 기존 `PauseAction.ToggleFullscreen`을 반환한다. Display 8, Audio 8, Controls 6과 F11/새 설정값/로비 저장 경로는 변경하지 않았다.

| 영역/ID | 현재 값·위치 | 적용 경로 |
|---|---|---|
| Game `fullscreen` | 제목 `전체 화면`/`Fullscreen`, 버튼 `켜짐·꺼짐`/`On·Off`; index 4, 카드 x=16·y=18·width=`content.width-32`·height=190 | 기존 Display 카드의 `GUI.Toggle`과 동일 host callback |
| Display `fullscreen` | 기존 index 5, 2열 카드 x=`16+cardW+28`·y=18 (좁은 창에서는 x=16·y=238) | Game과 동일 `Screen.fullScreen` 표시·v2 `fullscreen` 필드 |
| Game footer | 기본값 index 5, 뒤로 index 6 | 기존 기본값 SFX/BGM/FPS만 복원; fullscreen 기본값 신설 없음 |

순수 `PauseNavigationTests` **44/44 PASS**(Game 버튼 선택·공유 Toggle action·Home 복귀 2건 포함). Unity 6000.6.7f1 ARM64 Settings QA 빌드 **1회 Succeeded/errors0**, receipt `/Users/fordeargamers/exoduser-wt/_out/A15-GAME-FULLSCREEN-20261027/build-receipt.json`. marker `EXODUSER_MAC_A05_IO_V1`의 새 격리 루트 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A05-IO-A15-GAME-FULLSCREEN-20261027`에서 v2 revision10·`fullscreen:true`와 기존 `binds2.up=KeyX`/중첩 `gpKeyMap`/unknown `qaSentinel`/`cinSeen:true`를 seed했다. 전체 argv가 일치한 고유 QA PID42292에서 Game 탭 켜짐 → 키보드 Down×4·Return → 실제 1280×720 창 모드, Game 꺼짐, Display 꺼짐을 확인했다. 저장된 JSON은 revision11·`fullscreen:false`이며 나머지 위 보존값과 sfx36/bgm45/frameCap144가 그대로다. PID42346으로 같은 격리 루트를 재시작해 1280×720 창과 Game 꺼짐을 확인했고, QA F8 English에서 `Fullscreen`/`Off`가 카드 안에 표시됐다. 원본 PNG는 같은 `_out/A15-GAME-FULLSCREEN-20261027/`의 `game-fullscreen-before.png`, `game-windowed-after.png`, `display-windowed-sync.png`, `restart-game.png`, `restart-game-en.png`; Player 로그 `player-1.log`/`player-2.log`다. 두 QA PID는 종료했고, 기존 사용자 앱은 조작하지 않았다.

**VISUAL VERDICT: PASS**는 변경된 Game 카드의 ko/en 문구·창 전환 및 Display 표시 동기화에 한정한다. 일반 물리 마우스, 전체29언어, Game 로비 버튼, F11은 이 판정에 포함하지 않는다. Unity import의 tracked 413파일과 untracked 2파일은 `_out/A15-GAME-FULLSCREEN-20261027/`에 백업하고 원래 HEAD bytes로 복원했다.

### 2026-10-28 Linear 통합 Editor에서 발견된 SFX 키 단계 불일치

위 2026-10-27의 키보드 60→61%와 Editor 1% 검사는 당시 소스·앱의 이력이다. 현재 통합 `unity/main:444ee86fc`의 `NativePauseMenu.A15Web.A15RowKey`는 `optSfx/optBgm` `K.Range`의 좌/우 단계를 명시적으로 **5**로 설정한다. 반면 `PortVerification.VerifyA15Settings`는 여전히 60→61·0→1·100→100과 변화당 callback 1회를 기대한다. 2026-10-28 Mac Editor는 HUD Linear 검사를 통과한 뒤 첫 60→61 기대에서 종료2/receipt 없이 멈췄다. 현재 제품의 키 단계 5와 문서의 1% 계약을 A15 소유자가 대조해 한쪽을 정합해야 한다. 실제 Player 키 입력은 이 통합 HEAD에서 미검수다. [로그·범위](UNITY_MAC_A06_GPU_METAL_20261027.md#2026-10-28-linear-통합-뒤-hud-probe-정규화).

2026-10-29 `unity/main:6d920689d` 후속 대조: 웹 `main:game.html`의 `<input type="range" id="optSfx" min="0" max="100" value="60">`는 `step`을 지정하지 않아 기본 키 단계가 1이고, Unity `DefSfx`/`DefBgm`의 `OptionDef.Step`도 **1**이다. 실제 `NativePauseMenu`는 `SettingsRows=A15NavRows()`로 새 row 경로를 쓰며, `A15RowKey`의 `if(d.Id=="optSfx"||d.Id=="optBgm")step=5`만 이 두 음량을 5로 덮어쓴다. 따라서 **PC UI 소유 제품 1줄이 웹/명세/Editor 기대와 불일치**한다. 최소 수리 후보는 이 예외문의 `step=5`를 `step=d.Step`으로 바꾸는 것이다(다른 range 단계·callback/clamp 유지). Mac 담당은 제품 소유 파일을 수정하지 않았고 Editor 기대를 5로 바꾸거나 검사를 우회하지 않았다. PC UI owner의 정합·정상 병합 뒤 새 Editor gate가 필요하다. 이번 HEAD의 Editor/Player/빌드 실행 0.

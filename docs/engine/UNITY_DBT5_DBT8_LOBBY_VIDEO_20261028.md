# DBT-5 / DBT-8 — 로비 영상: 종료 중 크래시 방어, 영상 누락 시 재요청 상한 (2026-10-28)

브랜치 `claude/unity-pc-dbt5-20261028` (기준 unity/main efae9aa11). Core 무수정.

## DBT-5 — 영상 재생 중 종료 (0xC000041D, WndProc 콜백 안 Crash!!!)

| 항목 | 내용 |
|---|---|
| 방어 수정 | `NativeLobbyVideo`: `Application.wantsToQuit`에서 살아 있는 모든 VideoPlayer를 닫는다(이벤트 해제 → Stop → targetTexture null → RenderTexture Release → 컴포넌트 Destroy). 첫 종료 요청은 한 번 거절하고 `NativeVideoQuitHelper`가 3프레임 뒤 `Application.Quit()`를 다시 부른다(지연 Destroy가 플레이어 루프 안에서 끝나도록). |
| 재현 하네스 | `--unity-quit-during-video <fdg\|world> <초>` (`NativeGame.QuitDuringVideo.cs`). `lobby.Begin()`으로 인트로를 처음부터 시작하고 해당 단계 영상이 재생 중일 때 `Application.Quit()`. 진단: `--unity-skip-video-quit-cleanup`(정리 끄기 = "수정 전" 동작). |
| 결과 (배치모드, GPU, 무창·무음) | before(정리 끔)·after(정리 켬) × fdg·world 4회 모두 exit 0, `%TEMP%\ForDearGamers\*\Crashes` 새 항목 0, 로그에 `Crash!!!` 없음. 두 번 반복(3차·4차 실행) 같은 결과. |
| 판정 | **크래시는 이 경로에서 재현되지 않았다** → 수정 효과는 입증하지 못했다. 원 크래시는 창이 있는 닫기(WM_CLOSE / X 버튼)에서 났을 가능성이 크고, 창 없는 자동 실행 규칙상 재현하지 않았다. 정리 코드는 방어적 수정이다. 사람이 창에서 닫아 보는 확인이 남아 있다. |
| 하네스 오류 이력 | 1·2차 실행은 `reached:false`: 사용자 저장 설정 `cinSeen=true`라 시작이 FDG가 아니라 Lobby(NativeGame.cs 82). `Begin()` 호출로 해결. 이 인자들은 `IsQa`에 안 걸려 사용자 설정을 읽었다(읽기만, `settings.v1.json` 수정시각 10-27 13:59:50 불변). 3·4차는 `--unity-dbt-smoke`를 붙여 설정·로스터 IO 0. 전후 스냅샷 `USER_SAVE changed=4`는 모두 Unity 에디터 Analytics 파일. |

## DBT-8 — 영상 파일 누락 시 같은 파일 반복 요청

| 항목 | 내용 |
|---|---|
| 실측 | 숨긴 영상 1회 요청에서 `errorReceived`가 10초에 90번 반복 발생(VideoPlayer가 같은 url에서 오류를 계속 냄). |
| 수정 | `NativeLobbyVideo`: 오류는 요청당 한 번만 처리(반복 이벤트는 카운트만). 같은 파일이 3번(`MaxRequests`) 연속 실패하면 `Open()`이 파일을 더 건드리지 않고 즉시 오류를 돌려준다. 한 번만 `LOBBY_VIDEO_GIVE_UP` 로그. `NativeLobby.HandleVideoFailure`: 월드 인트로 오류 후 1.5초 간격으로 재시도, 상한에 닿으면 `LOBBY_STAGE_SKIP` 로그 후 `FinishIntro()`로 로비. 수동 "재생 / 재시도" 버튼은 횟수를 초기화(`RetryNow`). |
| 웹 대조 | FDG 오류 = 정적 화면 후 3.2초 뒤 진행(기존 `FdgPlaybackWatchdog`과 동일), 월드 인트로 오류 = 재생/재시도 버튼 + ESC(웹은 자동 재시도 루프 없음). Unity는 사용자 요청대로 상한 후 자동으로 로비로 건너뛴다. 완료 인정(`IntroCompletionWasEarned`)은 오류 시 false 그대로 → 영상 없이 건너뛰면 "시네마틱 완료"로 기록하지 않는다. |
| 검증 | `--unity-missing-movie-check --unity-lobby-hide-movie world_intro_v22b_steam.mp4`: 월드 영상 요청 3회(OPEN #5·#6·#7), 이후 건너뛰기, 로비 도달(`reachedLobby:true`, 12.96초), 로비 도달 뒤 6초 관찰 동안 추가 요청 0(`openCalls` 8 = FDG 2 + 타이틀 1 + 게이트 1 + 월드 3 + 로비 1). 새 Crashes 0. |
| 이식 밖 | 빌드 파이프라인에서 영상 누락 감지 = devtools 담당. |

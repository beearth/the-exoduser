# 인트로 키 입력(Enter·Space·Esc) — 웹 ↔ Unity 대조와 PC 실측 (2026-10-28)

브랜치 `claude/unity-pc-intro-skip-20261028`. 계기: 개발툴 DT-16(`I:\EXODUSER-Storage\devtools\web\RESULT.md` "인트로 넘기기") — Unity WebGL 빌드에서 타이틀 영상 중 Enter가 무시되고, 타이틀이 끝나면 문 영상이 `t=0`에서 멈춘 채 키를 기다림.

## 단계별 시각표

| 단계 | 웹 `index.html` | Unity `NativeLobby.Update` | PC 실측(무창 키 주입) |
|---|---|---|---|
| 경고 | 4초 뒤 자동, 아무 키 스킵 | (없음, FDG부터) | — |
| FDG 로고(3.2초) | 아무 키·클릭 = 스킵 (4797 `splashKey`) | 아무 키 = `AdvanceSplash` → 타이틀 스플래시 | FDG→SplashTitle ✓ |
| 타이틀 영상 | 무음 타이틀 영상 반복, 입력 전까지 유지. 메뉴(게임 시작·인트로 다시 보기·[데모] STEAM 위시리스트·[NW] 종료). Enter·Space = 선택 항목 즉시 실행, 위·아래·W·S = 이동, 다른 키 무시 | 타이틀 영상 반복(`loop`), "아무 키나 눌러 계속"(1.2초 뒤), 아무 키 = 타이틀 페이지. **메뉴 없음** | 16초 방치: 자동 진행 없음, 영상 반복(7.3초 길이, 반복 True) ✓. 4.8초에 Enter → Title 페이지 ✓ |
| 문 닫힘 대기(CLICK TO HELL / Title 페이지) | Enter·Space·클릭 = 문 영상 시작(`onVidClick`) | Enter·Space = `StartGate` | Title→Gate ✓ |
| 문 영상(8초) | Enter·Space 무시(`onSubSkip`이 `!_cinReady`면 return, 영상이 끝나야 true) | Enter·Space 처리 없음(웹과 같음) | Gate 중 Enter·Space = 변화 없음 ✓ |
| 월드 인트로 | Enter·Space·클릭 = 다음 컷(`_worldIntroPlayer.next()`), Esc·Space 5초 길게 = 전체 종료 | Enter·→·Space = `NextCut`(17컷), Esc·Space 5초 `HoldSkip` | Enter 2.1→4.77, Space 5.37→13.3, → 13.9→17.97 (컷 점프) ✓, Esc 5.3초 → Lobby ✓ |

## 결론

1. **PC 플레이어에서는 재현되지 않는다**: 위 모든 키가 웹과 같게 동작하고, 타이틀은 스스로 넘어가지 않는다. DT-16이 본 증상(타이틀 영상 중 Enter 무시, 영상이 끝나면 문 영상 정지 대기)은 WebGL 런타임 쪽 차이로 보인다. 가설: 타이틀 HD 영상 재생 중 메인 루프가 정체되어 4.8초의 Enter가 영상이 끝난 뒤에야 처리됨(그러면 "문 영상이 `t=0`에서 키를 기다림"은 Title 페이지의 정상 상태다). 확인용으로 `NativeLobby`가 스플래시 키 입력 처음 12번의 `frame / fence / accepted / t / dt`를 `Debug.Log("LOBBY_KEY ...")`로 남긴다(브라우저 콘솔 수집 가능).
2. **웹과 다른 점(코드 차이)**: Unity 타이틀 스플래시에는 메뉴가 없다("아무 키나 눌러 계속"). 웹은 메뉴 항목 + 위·아래·Enter·Space. 메뉴 이식은 UI 작업(웹 `_buildTitleMenu`, 사용자 승인 디자인 [승인-디자인-5])이라 별도 단위로 둔다.
3. 키 주입 이음매 `LobbyKeys`(평소 `UnityEngine.Input` 그대로)와 무창 하네스 `--unity-intro-keys-smoke`로 재확인할 수 있다.

## 하네스 이력(실패 기록)

1차 실행: `NativeGame.Update`가 매 프레임 `lobby.AutomatedInput = lobbySmoke`로 덮어써서 키가 전혀 전달되지 않음 → `introKeysSmoke` 플래그로 해결. 2차: 주입한 키 하나가 다음 페이지에서 한 번 더 보여 타이틀을 건너뜀(하네스 문제, 실제 입력은 한 프레임) → `AnyDown`이 소비할 때 눌림 목록을 비움. 3차 통과.

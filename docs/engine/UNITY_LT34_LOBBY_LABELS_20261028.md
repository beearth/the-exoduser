# UNITY LT-3·LT-4 + HUD 조건(영문 부제 굵기) — 2026-10-28

배정: 유니티 총괄. 근거: 최신버전 테스트 보드 `LATEST_BUILD_TEST_BOARD_20261028.md`(LT-3·LT-4), 맵 총괄 HUD(4ceb18b51) 조건부 PASS. 브랜치 `claude/unity-pc-lt34-20261028`(efae9aa11에서 분기). LT-6(산세리프)은 배정에서 빠졌다 — 글꼴 종류는 바꾸지 않는다(웹 그대로 PASS, 명조 전환은 별도 과제).

## LT-3 로비 왼쪽 위 버전 표기

| 원인 | 수정 |
|---|---|
| 로비가 같은 자리에 두 번 그렸다: `NativeLobbyBuildLabels.Draw`(웹 `#lobbyVerOverlay` 이식: 라벨 / 버전 / 모드 / 한도)와 `DrawPatchNotesLauncher`가 패치노트 첫 항목에서 만든 `vX · 날짜 / OFFLINE` 글자 | 웹의 왼쪽 위 오버레이는 하나이고 그것이 패치노트 여는 버튼도 겸한다. 런처는 글자를 그리지 않고 클릭 영역·포커스 링만 소유한다(`NativeLobby.PatchNotes.cs`) |
| 버전이 웹 v0.7.9와 다른 옛 값(v0.7.5) | `Resources/Data/release_web.json`을 main `release-version.json`(0.7.9 · 2026-10-28 · ea-full)으로, `Resources/Data/patch_notes.json`을 main `patch-notes.js`(0.7.9 · 0.7.8 · 0.7.0)로 동기화했다. 항목 구조는 같다(0.7.0 항목이 바이트 단위로 같음을 확인) |

2026-10-29 Mac 후속: LT-3의 글자 중복 제거 뒤 1280/1600에서 보존된 14,12,370×102 버튼은 역스케일된 좌상단 4줄의 실제 표시 범위와 어긋났다. `NativeLobbyBuildLabels.OverlayBounds`를 표시·hit·focus 공통 Rect로 사용하도록 좁게 수정했다. 수치·검수 근거는 [로비 문서](UNITY_LOBBY_20261024.md#2026-10-29-표시패치노트-hitfocus-범위-정합)에 둔다.

## LT-4 "이 Mac에 저장"

| 원인 | 수정 |
|---|---|
| Mac 빌드 문구가 모든 플랫폼에 고정 | 새 `NativePlatformLabel`(`ThisDevice`): macOS = 이 Mac / this Mac, Windows = 이 PC / this PC, 그 외 = 이 기기 / this device. 캐릭터 카드·캐릭터 만들기 안내·캐릭터 목록 안내(`NativeLobby.CharacterStore.cs`)와, 같은 원인의 일시정지 메뉴 저장 문구 4곳(`NativePauseMenu.cs`: 설정 저장 안내·백업 복원·키 설정 자동 저장 한/영)에 적용 |
| 번역 목록 | 새 문구는 "이 PC"/"this PC"/"이 기기"/"this device" 4개뿐이다. Unity 전용 문구라 웹 번역 목록(`번역대상_전체목록.md`)에는 올리지 않았다 — 필요하면 총괄 판단 |

## HUD 조건: 영문 부제(`NORTHEAST · LIGHTNING`, `REGION PURGED · 1/4`)

맵 총괄 판정: 웹보다 훨씬 흐려서 1x에서 정화 배너 부제가 거의 안 읽힌다. 획 두께와 명도를 웹과 같게, 늘어나는 폭은 자간과 크기로 맞추고 글꼴 종류는 바꾸지 않는다.

| 항목 | 값 |
|---|---|
| 이전 | 가변 Cinzel 400(Normal). 웹은 Cinzel 500이라 획이 얇았다. Bold로 하면 폭이 7 % 늘어서 폭을 맞추느라 Normal을 택했었다 |
| 이번 | Bold(획 두께). 웹 DOM이 실측한 폭 = Normal 글자 폭 + `.32em` 자간. 같은 폭을 유지하도록 `FitBoldLine`이 자간을 줄이고(최소 0.6px), 모자라면 글자 크기를 한 단계씩(11→8) 내린다. 색·알파는 웹 그대로 rgba(168,153,127,.72) |
| 글꼴 | 바꾸지 않음(Cinzel 가변 폰트) |

## 검증

Roslyn 컴파일 0 오류. Unity 실행 검증(로비 `--unity-lobby-smoke` 캡처, 배너 `--unity-region-hud-capture` A·B 1x 나란히)은 Unity 순번 뒤에 채운다.

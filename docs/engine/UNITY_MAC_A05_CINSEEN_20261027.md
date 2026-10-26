# Mac A05 재방문 세계관 인트로 스킵 — 2026-10-27

## 기준과 범위

PC 검토 `571a08648a31c5d409fda312bcba20671ccc0e3b`의 `docs/engine/ui_handoff/a05-revisit-skip-v2-hunk-review-20261027.md`를 Mac Unity에 좁게 적용했다. PC 웹 `_cinSeen`은 로컬 완료 표시이며 Mac에서는 기존 오프라인 `native-settings-v1/settings.v1.json` schema v2의 상위 선택 필드 `cinSeen: true`로 보존한다. 계정 API, 캐릭터 roster, 세이브 진행도, 미디어, 게임 시작 이야기에는 쓰지 않는다. 일반 사용자 파일은 열지 않았고 QA 전용 `_out`에서만 검증했다.

## 저장과 진입 계약

| 항목/조건 | 값·동작 | 적용 위치 |
|---|---|---|
| `cinSeen` | schema v2 상위 **JSON boolean `true`**. 선택 필드이며 부재 또는 `false`는 첫 방문. 문자열 `"true"`는 완료로 읽지 않음 | `NativeSettingsStore.TrySave`, `NativeGame.SettingsPersistence` |
| v1·기존 v2 | v1과 marker 없는 v2는 인트로 진입. 기존 경로, revision, backup/lock, 설정 4값, `binds`·`binds2` 각 20동작, 알 수 없는 상위 JSON(`gpKeyMap` 포함)을 유지 | `NativeSettingsStore`, 기존 codec |
| 정상 앱 시작 | 저장을 성공적으로 읽어 `cinSeen:true`면 곧바로 `ShowLobby()`; 부재·false·읽기 실패면 `Begin()`으로 FDG→제목→문→세계관 순서 | `NativeGame` 초기 진입 |
| 인게임 로비 복귀 | 기존 `ReturnLobby`가 직접 `ShowLobby()`; 완료 표식을 만들거나 지우지 않음 | `NativeGame` 일시정지 처리 |
| 로비의 다시 보기 | 기존 `ReplayIntro()`는 제목부터 재생; 이미 저장된 완료 표식은 그대로 둠 | `NativeLobby` |
| 자연 완료·마지막 컷 | `WorldIntro→Lobby`, 재생 오류 없음일 때만 완료 콜백. 마지막 cue에서 `NextCut()<0`도 동일 | `NativeLobby.FinishIntro` |
| 명시적 홀드 스킵 | Title/Gate/WorldIntro에서 Esc/Space 실제 hold **5초** 충족으로 Lobby 전환 때 완료. 재생 오류 뒤에도 명시적 hold면 완료 | `LobbyFlow.HoldSkip`, `NativeLobby.Update` |
| 완료 아님 | FDG/title 단순 넘김, gate 자동 전환, 5초 미만 hold, 비디오 오류만 발생, 일반 설정 저장은 marker를 새로 만들지 않음 | `NativeLobby`, `NativeGame.SettingsPersistence` |
| 오류/쓰기 | 잘못된 설정 파일은 기존 거부 정책대로 원본 bytes를 보존. 완료 후 설정 저장 예약 **0.25초**, 종료 시 pending flush; 저장 실패는 완료가 지속되었다고 주장하지 않음 | 기존 settings 저장 경로 |

`cinSeen`을 기존 codec의 필수 필드 목록에 넣지 않고 `extra` raw JSON으로 다루므로 v1/구 v2의 읽기 가능성과 알 수 없는 패드 데이터를 유지한다. 코드의 메모리 값은 정상 로드에서만 true가 되고, 완료 콜백은 중복 저장 예약을 하지 않는다. QA 직접 진입 플래그는 기존 우회 동선을 유지한다.

## 격리 Editor 검증

사전 백업: `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A05-CINSEEN-20261027/before/`. Unity **6000.6.7f1** Mac Editor를 `-batchmode -nographics -quit -executeMethod NativeSettingsIoVerification.Run --unity-settings-persistence-smoke -settings-io-phase cinematic`로 **1회** 실행했다. 출력/receipt는 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15A16-IO-CINSEEN-20261027`; fixture는 절대 `_out` 경로·QA marker `EXODUSER_MAC_SETTINGS_IO_V2\n`·절대 receipt를 요구한다. 이 소스 작업 diff SHA1은 `c1c04f61fa7272a8fcb8ecd015d1e35fda9f9333`이며 최종 Git commit은 별도 식별한다.

| 검사군 | 실제 결과 |
|---|---|
| 파일 부재·v1·v2 부재/false·v2 true 별도 store 재읽기 | PASS |
| 기존 4설정·20동작 리맵·알 수 없는 중첩 패드 JSON·revision7→8→9 왕복 | PASS |
| title/gate 5초 hold, 짧은 hold, 자연 WorldIntro, 마지막 cue, 오류만 발생, 오류 뒤 명시 hold | PASS |
| 잘못된 JSON 읽기/쓰기 거부 후 기존 bytes 보존 | PASS |
| 합계 | **21/21 PASS**, failures 0, Editor exit **0**, C# 오류 0 |

receipt `editor-settings-cinematic.json`의 최종 `status: NotLoaded`는 마지막 음성 검사에서 잘못된 파일을 의도적으로 거부한 상태다. Editor fixture는 실제 codec/store·`LobbyFlow`·완료 판정 함수를 실행하지만 화면/OS 입력이나 `NativeGame` Player 재기동을 실행하지 않는다. Unity import가 생성한 `.meta` churn 411개와 신규 1개는 백업 뒤 원래 bytes로 복원했다. 새 Player 빌드 0, 실제 자연 재시작·실창 입력 판정은 **HOLD**다. 기존 사용자 앱/PID와 개인 저장 파일은 건드리지 않았다.

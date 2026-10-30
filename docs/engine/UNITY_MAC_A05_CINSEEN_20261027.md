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
| 자연 완료 | `WorldIntro→Lobby`에서 영상 자연 종료와 오류 없음이 함께 확인될 때 완료 콜백 | `NativeLobby.Update` → `FinishIntro(false)` |
| 수동 마지막 cue 완료 | 사용자가 `NextCut()<0`까지 진행하면 영상 오류가 있더라도 명시적 완료로 기록. 영상 오류 callback만으로 기록하지 않음 | `NativeLobby.NextCut` → `FinishIntro(true)` |
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

## 2026-10-27 오류 뒤 수동 마지막 cue 판정·Player QA 후속

PC 최종 판정에 따라 자연 종료와 사용자 수동 마지막 cue를 별도 원인으로 구분했다. 영상 오류가 남아 있어도 사용자가 fallback 컷을 끝까지 진행해 `NextCut()<0`를 만들면 완료 표식을 기록한다. 오류 callback만 발생하거나 짧은 hold는 기록하지 않으며, 실제 5초 hold는 별도의 명시적 skip으로 기록한다. 이전 `cinSeen:true`는 뒤늦은 영상 오류로 지우지 않는다. 영상 파일/버전, `LobbyFlow.WorldCuts` 17개 시간표, 재생 전환 타이밍은 그대로다.

QA 진입 후보는 기존 **고유 Settings QA 앱**의 product `EXODUSER Settings QA`와 identifier `com.fordeargamers.exoduser.settingsqa`를 재사용한다. `--unity-cinematic-persistence-review -output <절대 root>`는 root의 부모가 `_out`, 폴더명이 `UNITY-MAC-A05-IO-*`, marker 내용이 `EXODUSER_MAC_A05_IO_V1\n`일 때만 유효하다. 이때 일반 인트로를 실행하면서 설정은 `<root>/native-settings-v1`, 로스터는 `<root>/character-roster-v1`에만 연결한다. 신원/경로/marker가 틀리면 두 저장소 모두 fail closed. 기존 `--unity-frontend-review`의 설정 I/O 금지는 유지한다. 다른 QA 플래그 혼합도 거부한다. 앱 정상 identity의 사용자 저장 경로와 개인 파일로 QA를 실행하지 않는다.

2026-10-27 CoreTests 복구에서는 이 신원값을 각 Unity 호출부가 Core scope에 인자로 전달하도록만 바꿨다. 인자 없는 기존 일반/fixture `TryResolve`는 A05 QA 플래그를 실패 폐쇄한다. 경로·marker·플래그 조건, `cinSeen` 저장/복원 값 및 codec은 그대로이며 [18/18 격리 회귀](UNITY_MAC_SETTINGS_PERSISTENCE_20261026.md#2026-10-27-coretests-독립-컴파일-복구)를 통과했다.

동일 소스의 격리 Editor fixture는 오류 뒤 수동 완료, 오류만 발생, 기존 true 보존 3검사를 추가해 **24/24 PASS**, exit0/C# 오류0. 기존 UAC1001 경고만 남았다. 전용 receipt: `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15A16-IO-CINSEEN-ERROR-20261027/editor-settings-cinematic.json`. 입력 소스 patch SHA1 `70e6a5600ac0f1e156897d73abbd44bf469fade6`. 실제 Player 결과는 아래와 같다.

고유 Settings QA ARM64 Player **1회 빌드**: Unity 6000.6.7f1, `PortVerification.Build -settingsQa true`, `Succeeded`, errors 0, 출력 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A05-ERROR-LASTCUE-20261027/player-build/EXODUSER-Unity.app`; receipt `player-build.json`. 전용 root `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A05-IO-RESTART-20261027`는 marker를 먼저 만들고 Editor fixture의 v2 `cinSeen:false`, revision2, SFX35/BGM45/FPS144/fullscreen false, `up=KeyZ`/보조 `KeyX`, 중첩 `gpKeyMap.pad0.buttons=[1,2]`를 사본으로 넣었다. 일반 사용자 설정/로스터는 입력으로 사용하지 않았다.

| Player 단계 | 실제 관찰·파일 결과 |
|---|---|
| 첫 실행 | 고유 PID26911·명시 `--unity-cinematic-persistence-review -output <전용 root>`에서 FDG→제목→문→세계관을 실창 확인. 세계관 도중 추가 입력 없이 자연 종료해 로비 진입. 영상 재생 오류 기록 없음. |
| 완료 저장 | 전용 `native-settings-v1/settings.v1.json`: `cinSeen:true`, revision **2→3**. SFX35/BGM45/FPS144/fullscreen false, `up=KeyZ`/보조 `KeyX`, 중첩 패드 JSON 보존. 전용 로스터 폴더 생성 없음. |

| 동일 앱·동일 root 재시작 | 첫 앱 종료 뒤 다시 실행해 최초 화면이 곧바로 로비임을 실창 확인. 설정 revision3·키/패드/완료 표식 유지. 재시작 때 저장 재기록 없음. |
| 경계 | 두 앱 실행 모두 전용 root와 고유 QA identity. 기존 사용자 앱 PID38141/48476/52157·개인 설정/로스터 파일을 열거나 변경하지 않음. |

2026-10-27 A15 저장 보존 회귀: 위 A05 **QA 전용** v2 파일을 새로운 marker 루트에 복사하고 중첩 unknown sentinel을 추가했다. 실제 Player 조작 키/SFX 저장으로 revision3→5가 된 뒤에도 `cinSeen:true` boolean, `gpKeyMap.pad0.buttons=[1,2]`, sentinel, 보조 `up=KeyX`가 동일했다. 재시작한 QA 직접 진입 화면에서 주 `up=Tab`과 SFX36을 확인했다. 직접 진입이므로 자연 시작→로비 분기·패드 동작을 다시 PASS로 계상하지 않는다. [실행표](UNITY_MAC_A15_4TAB_20261027.md#2026-10-27-a15-저장-시-a05미지원-데이터-보존-회귀).

따라서 **Mac Player 자연 완료→저장→동일 profile 재시작 로비 직행 PASS**. 오류 뒤 수동 마지막 cue는 격리 Editor 정책 검사 PASS이며 실제 Player에서 오류를 인위적으로 발생시키지 않았다. 다른 `--unity-frontend-review`의 설정 I/O와 일반 사용자 Player 경로 검수로 확대 해석하지 않는다. Unity 빌드가 재작성한 Resources `.meta` 411개·새 `.meta` 1개·Scene/ProjectSettings 생성물은 백업한 뒤 HEAD bytes로 복원했다.

## 2026-10-30 PC 진입 누락 재현 진행

사용자 바탕화면 빌드642e31d2e는 설정의 cinSeen:true 때문에 FDG·타이틀·인장을 모두 건너뛴다. 사용자 설정은 읽기만 하고 I:/EXODUSER-Storage/demo-art/entry-flow/before-sandbox에 복사했다. 일반 QA는 설정 I/O를 끄므로 --unity-entry-flow-capture는 명시 격리 사본을 실제 codec/store로 읽고 초기 분기 직전에 완료 표식만 공급한다. 1600×900·1초 간격90장, --entry-flow-keys에서만 10초 이후 메뉴 Enter·25초 이후 인장 Enter·65초 이후 Escape 홀드를 주입한다. OS 손조작 검수와 구분한다. 현재 커밋은 재현 수집기이며 기존 시작 분기를 유지한다. 결과·수정·전달 상태는 같은 출력의 REPORT.md로 연결한다.

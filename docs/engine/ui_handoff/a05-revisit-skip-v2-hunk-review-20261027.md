# 재방문 시네마틱 스킵 — Mac NativeSettings v2 최소 hunk 검토안

2026-10-27 04:25 총괄 승인 **설계 검토만**. E: 및 Mac 제품 파일 수정 0. Mac 현장 담당은 inventory 검사 gate를 작업 중이므로 동시 편집하지 않는다.

## 고정 소스

- 웹 `origin/main` `607110d52a56a1e5622a78e2ce7d09582946920a`, `index.html` blob `31225ee77b9cd300fc96a8414bd73f6a43db43a4`: 오프라인 `localStorage['_cinSeen']='1'`, 초회 없는 값은 미시청, `finishCin()`/`skipToGate()`에서만 기록. 웹 계정 메타데이터와 계정 캐시는 Unity 오프라인 범위 밖.
- Mac **원격 커밋 스냅샷** `origin/codex/unity-mac-20261024` `8aa637a31b0decf80cf8d56d5cb376e7ed1c1aad`. 직전 `32d50f08c…`에서 inventory Editor 검사만 갱신돼 아래 관련 blob은 동일하다. `Core/NativeSettingsStore.cs` blob `f580448ebbea8fc41e1556a0a10eba9048c51413`; `Core/NativeSettingsJsonCodec.cs` `6b9087f9800257038048070e51ac575df8b0c073`; `NativeGame.SettingsPersistence.cs` `1dc06274f154fd5bccfd620c9623775adeef906d`; `NativeGame.cs` `08952158f03403b3e7ea1ef765bc64d6a8435f9d`; `NativeLobby.cs` `79bd08648a30019f468b82c2c576f515e5e7bb51`; `Core/LobbyFlow.cs` `880ec659fc57ff63393241edf8d6082568e80d07`. Mac 현장 uncommitted 상태는 이 자료로 확인하지 못했으므로 실제 적용 전 해당 담당이 다시 HEAD/index/WORK를 확인해야 한다.
- PC E:는 설정 v1(`Version=1`)이다. Mac v2 검토안을 E:의 v1 제품 파일에 적용하지 않는다.

## 최소 hunk 위치와 의도

1. **Mac `Core/NativeSettingsStore.cs` 134–142행:** 기존 `TrySave(state,fullscreen,bindings)`가 `lastSnapshot`을 복사해 `binds`/`binds2`와 `extra`를 보존한다. `bool cinSeen`을 받는 좁은 overload를 추가해 true일 때만 `next.extra["cinSeen"]="true"`를 넣고 동일 `TrySaveSnapshot`을 호출하는 방향이다. 기존 overload는 동일 동작으로 남긴다. `Version=2`, `settings.v1.json`, `native-settings-v1`과 schema는 그대로 둔다. `NativeSettingsJsonCodec.Known`에는 넣지 않아 `extra`의 JSON boolean raw 값과 다른 미지의 최상위 필드를 그대로 보존한다. 기존 v1 문서 로드·v2 쓰기의 지원 흐름을 강제 변환하지 않는다.
2. **Mac `NativeGame.SettingsPersistence.cs` 15–24, 38–43행:** `TryLoad`가 성공한 snapshot에서 `snapshot.extra.TryGetValue("cinSeen",out raw)&&raw=="true"`만 true로 읽는다. 키 없음·`false`·읽기 실패는 false다. 완료 사건에서는 세션 bool을 true로 만들고 기존 `QueueSettingsSave()`를 부른다. `FlushNativeSettings()`는 현재 SFX/BGM/FPS/fullscreen과 `NativeKeyBindInput.Bindings`를 저장할 때 true 플래그도 같은 atomic revision 저장에 실어야 한다. 기존 250ms 지연 저장과 `OnApplicationQuit()` flush, 충돌/손상 파일 보호는 유지한다. 저장 실패 시 이번 세션은 true일 수 있으나 재시작 영구 완료는 주장하지 않는다.
3. **Mac `NativeLobby.cs` 40,47,52행:** WorldIntro에서 영상이 정상 끝나거나 마지막 cue가 끝나 `FinishIntro()`가 호출될 때, `movie.Error.Length==0`인 완료 사건만 한 번 알린다. `Flow.HoldSkip()` 이전 `LobbyPage`와 이후 `Lobby`를 대조해 **실제 5초 홀드 전이**일 때만 완료 사건을 알린다. `splash`의 키 스킵, 짧은 홀드, 영상 오류 callback, `ShowLobby()`/게임 내 복귀는 알리지 않는다. 오류가 난 뒤에도 사용자가 별도 홀드 스킵을 완료한 경우는 그 **명시적 선택**을 true로 처리한다. 단순 `WorldEndedNaturally`는 수동 마지막 cue·홀드 스킵을 표현하지 못하므로 저장 입력으로 쓰지 않는다.
4. **Mac `NativeGame.cs` 69,76,410행:** `InitializeNativeSettings()`와 완료 callback 연결 뒤 일반 실행 `if(!legacyFixture)`의 `lobby.Begin()` 호출에서만 복원된 true이면 `lobby.ShowLobby()`, false이면 `lobby.Begin()`을 고른다. `ReturnLobby`의 기존 `ShowLobby()`는 그대로 유지한다. `NativeLobby.Begin()`의 의미를 바꾸지 않으므로 기존 QA의 명시적 `Begin()`과 로비의 `ReplayIntro()`가 그대로 재생한다.

**데이터 표현:** 웹 마커명 `_cinSeen`, 실제 값은 localStorage 문자열 `'1'`. Unity 후보 필드 `cinSeen`, JSON boolean `true`; 없거나 false면 미시청. 독립된 계정 ID·영상 버전·캐릭터 슬롯을 키로 만들지 않는다. 기존 웹 플래그도 영상 버전에 묶여 있지 않다.

## 보존/검수 계약

| 검수 | 기대 결과 |
| --- | --- |
| 설정 없음, v1 기존 파일, v2 키 없음 | 초회는 FDG부터. 기존 SFX/BGM/FPS/fullscreen과 v2 키바인딩 복원 동일. 첫 실행만으로 새 파일 강제 생성하지 않음 |
| 세계관 자연 종료·마지막 cue 완료 | 완료 true 저장 성공 확인 후 앱 재시작에서 로비 직행. 중복 완료 callback/저장 없음 |
| 명시적 홀드 | Title/Gate/WorldIntro의 실제 5초 hold 완료에서만 true. FDG 아무 키·짧은 홀드·일반 Enter/Space 진행은 false |
| 영상 오류/준비 실패 | 오류 자체는 false이며 재시작 시 인트로 재시도. 오류 후 별도 명시적 hold만 true. 저장 실패/Busy/Conflict/TooLarge는 원본 파일 보존, 완료 미확정 |
| 게임 내 복귀·수동 다시 보기 | ReturnLobby는 즉시 로비, 마커 생성 없음. ReplayIntro는 저장값 true여도 정상 재생; 완료/hold 이전 중단 시 값 유지 |
| 설정 보존 | 기존 v2 `binds`/`binds2`, 알 수 없는 최상위 JSON(gamepad 포함)의 값, revision·backup·lock 계약 보존. save 후 다시 읽어 바이트 raw 값과 동작 검증 |
| QA 격리 | 일반 `--unity-*-smoke/-capture/-review`는 기존 `NativeSettingsStorageScope.IsQa()`에 따라 사용자 설정 IO 0. 전용 설정 QA는 `-output`의 격리 경로와 QA product/identifier만 사용; 실제 사용자 파일 0 |

이 문서는 코드 diff나 컴파일 PASS가 아니다. 제품 구현 시 Mac 담당은 위 원격 blob과 현장 파일 차이를 먼저 좁혀 확인하고, 관련 `docs/` 검색/업데이트와 격리 QA 후 path-scoped checkpoint를 해야 한다. 계정 서버 sync, 브라우저 cache 읽기, 새 schema 강제 마이그레이션, 캐릭터 save 변경은 범위 밖이다.

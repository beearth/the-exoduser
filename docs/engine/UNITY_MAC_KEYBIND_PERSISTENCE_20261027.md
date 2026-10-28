## 2026-10-27 A15 조작 탭 후속

기존 `NativeKeyBindList`를 Mac 설정 4번째 조작 탭 안으로 옮겼다. v2 binds/binds2 20동작·0.25초 예약 저장과 `cinSeen`은 변경하지 않았다. Editor 입력 정책 검증 PASS, Player 실기/재시작은 A15 단위에서 HOLD. [범위](UNITY_MAC_A15_4TAB_20261027.md).

2026-10-27 Player 후속: 위 HOLD는 당시 기록이다. 고유 Settings QA 앱과 marker가 있는 `_out/UNITY-MAC-A05-IO-*` 루트에서 `--unity-cinematic-persistence-review --unity-a15-direct -a15-phase write|read`를 사용해 OS Tab을 `up` 주 키로 지정하고 SFX를 **60→61%** 조정했다. v2 JSON revision2의 `binds.up="Tab"`·`sfxPercent:61`을 실제 read 재실행의 조작/사운드 화면에서 확인했다. 캡처 직후 Esc/Tab의 메뉴 중복 처리를 막는 소비 프레임 가드를 추가했다. 키 20종·보조 슬롯·0.25초 저장 공식과 스키마는 동일하다. [실행별 판정](UNITY_MAC_A15_4TAB_20261027.md#2026-10-27-조작-키-캡처격리-저장-player-후속).

별도 보존 회귀에서는 `cinSeen:true`, `gpKeyMap.pad0.buttons=[1,2]`, 중첩 `qaSentinel`, `binds2.up=KeyX`를 담은 격리 v2 seed에 실제 A15 변경을 적용했다. SFX35→36, `up=KeyZ→Tab`, revision3→5 뒤에도 네 항목이 동일하며 재시작 화면에서 주/보조 키와 SFX를 확인했다. 일반 사용자 저장이 아니라 QA marker 루트만 사용했다. [증거와 미검증 범위](UNITY_MAC_A15_4TAB_20261027.md#2026-10-27-a15-저장-시-a05미지원-데이터-보존-회귀).

A05 오류 뒤 수동 마지막 cue 검증: 독립 Editor fixture 24/24 PASS. 별도 `--unity-cinematic-persistence-review`는 고유 Settings QA identity와 marker가 붙은 `_out/UNITY-MAC-A05-IO-*` 루트에서만 설정/로스터 I/O를 허용한다. 기존 `--unity-frontend-review`의 설정 I/O 금지는 유지한다. 고유 ARM64 Player 동일 root 자연 완료→재시작 로비 직행 PASS; `up=KeyZ`/보조 `KeyX`·중첩 패드 JSON 유지. [계약](UNITY_MAC_A05_CINSEEN_20261027.md).

## A05 선택적 완료 표식 후속 — 2026-10-27

기존 schema v2 파일에 선택적 상위 JSON boolean `cinSeen:true`를 완료 때만 기록한다. 부재/false는 인트로를 시작하며 기존 4설정·20동작 양 슬롯·알 수 없는 패드 JSON을 유지한다. `NativeSettingsIoVerification.Run`의 전용 phase는 기존 `write|read`에 `cinematic`을 추가했다. 21/21 Editor PASS, Player 재시작 HOLD. [완료 판정과 격리 영수증](UNITY_MAC_A05_CINSEEN_20261027.md).

# Mac A15/A16 키바인딩 저장 schema v2 후보 — 2026-10-27

2026-10-29 입력 후속: 저장된 웹 코드 `beam=mouse2`를 Unity 실제 오른쪽 버튼(1)으로 읽고, Unity IMGUI 오른쪽 버튼(1) 캡처를 웹 코드 `mouse2`로 쓰도록 변환했다. schema v2·revision·20동작 기본값은 불변이다. 실제 기본 우클릭 공격 5/5는 확인했고 재바인딩 UI 클릭은 미검증이다. [대응표·QA](UNITY_MAC_PRACTICE_MOUSE_BRIDGE_20261029.md).

## 범위와 소유

Mac 소유 `NativeSettingsStore`, `NativeSettingsJsonCodec`, `NativeGame.SettingsPersistence`, `NativePauseMenu` 연결만 수정했다. PC 소유 `KeyBindings`, `NativeKeyBindInput`, `NativeKeyBindList`, 전투 Core는 변경하지 않았다. `NativePauseMenu`는 기존 key list의 공개 안내 문구만 저장 상태에 맞게 설정한다. 이 문서는 제품 Player/실입력 인수가 아니라 후보 코드와 격리 모델 검증의 현행 계약이다.

## 파일·형식

| 항목 | 현재 값·처리 |
|---|---|
| 경로 | `Application.persistentDataPath/native-settings-v1/settings.v1.json`; backup `settings.v1.bak`, lock `settings.lock` 유지 |
| schema/version | `exoduser.unity.settings` / **2**; revision 양의 정수, 최대 파일 **8192 bytes** |
| 기존 설정 | `sfxPercent`, `bgmPercent` 각 0–100; `frameCap` 0/30/60/120/144/244; `fullscreen` bool 보존 |
| 새 필드 | `binds`, `binds2` JSON object. 20개 action id 각각 웹 `event.code` 문자열 또는 `null`; `binds2` 기본 전부 `null` |
| v1 이주 | 같은 파일의 version 1을 읽고 키 20개 기본값 적용. 다음 명시 변경 시 revision 증가와 version 2로 원자 저장. 기존 화면·오디오·FPS 값 유지 |
| 알 수 없는 항목 | `binds`/`binds2` 내 알 수 없는 action 무시. 알려진 action의 잘못된 형식·지원하지 않는 웹 코드 기본값으로 처리. 상위 알 수 없는 JSON 항목(`gpKeyMap` 등)은 재저장 시 보존하되 Unity 패드 입력에 적용하지 않음 |
| 오류 | 필수 상위 필드·JSON 구조 오류, 미지원 미래 버전, 범위 오류는 기존 저장 실패 정책대로 거절하고 원본 bytes 보존. 잠금·backup·revision 충돌 정책 유지 |
| 저장 예약 | `KeyBindings.Version`이 변하면 0.25초 지연 저장 예약. 종료 시 pending flush. 기존 SFX/BGM/FPS/fullscreen 저장에도 현재 키 값을 함께 기록 |
| QA | 모든 기존 `--unity-*-smoke/capture/review` 저장 IO 비활성. 전용 `--unity-settings-persistence-smoke`는 QA identity와 절대 `-output` 필요, 해당 output 안에서만 저장 |

`KeyBindings.ResetAll()`의 웹 유래 18행 특례로 사라진 `irisToggle`·`bladeToggle`은 v2 파일에서 명시적 `null`이 된다. 재시작 후에도 native에서는 unbound로 남는다. 이는 웹 새로고침의 기본값 복귀와 다른 결정이며 실제 Player 인수 전까지 주의할 계약이다.

## 20개 동작 기본값

| id | 한글명 | 기본 `binds` | 기본 `binds2` | 적용 위치 |
|---|---|---|---|---|
| up | 위로 이동 | KeyW | null | NativeKeyBindInput/이동 |
| down | 아래로 이동 | KeyS | null | NativeKeyBindInput/이동 |
| left | 왼쪽 이동 | KeyA | null | NativeKeyBindInput/이동 |
| right | 오른쪽 이동 | KeyD | null | NativeKeyBindInput/이동 |
| weapon | 무기 공격 | mouse0 | null | NativeKeyBindInput/공격 |
| shield | 칼등 처내기 | KeyE | null | NativeKeyBindInput/안내 |
| bow | Space 분노 폭발 | Space | null | NativeKeyBindInput |
| charge | 사슬 이동 | ShiftLeft | null | NativeKeyBindInput |
| parry | 데빌포스 흡수 | KeyQ | null | NativeKeyBindInput/안내 |
| beam | 마법 | mouse2 | null | NativeKeyBindInput |
| forge | 대장간 | KeyG | null | NativeKeyBindInput/창 |
| inventory | 인벤토리 | Tab | null | NativeKeyBindInput/창 |
| settings | 설정 | Escape | null | NativeKeyBindInput/창 |
| interact | 아이템 줍기 | KeyR | null | NativeKeyBindInput/입력 |
| storage | 보관함 | KeyN | null | NativeKeyBindInput |
| stats | 능력치 | KeyJ | null | NativeKeyBindInput/창 |
| skill | 전투 스킬 | KeyK | null | NativeKeyBindInput/창 |
| skillCycle | 스킬 슬롯 배정 | KeyL | null | NativeKeyBindInput |
| irisToggle | 유령불꽃 | KeyY | null | NativeKeyBindInput |
| bladeToggle | 기동칼날개 | KeyU | null | NativeKeyBindInput |

## 검증과 남은 관문

별도 `/tmp/exoduser-settings-fixture-20261027*`와 `/tmp/exoduser-settings-check-20261027`만 사용했다. .NET `SettingsPersistenceTests` 기존 IO/backup/손상/QA 격리와 추가 v1→v2·20값·부분/잘못된 값·unknown/pad 보존·왕복 저장 총 **90 PASS**. 별도 프로세스 write **3 PASS**, read **2 PASS**. 일반 사용자 설정·세이브 파일은 열지 않았다. Unity Player/Editor 빌드, 실제 키 목록 표시, OS 입력, 정상 종료 후 재기동은 이 단위에서 미검증이다. 기존 19개 UI patch의 실제 GUI 검수 및 A02 최종 fit 32/32도 별도 HOLD다.

## 2026-10-27 import·compile 후속

고정 후보 `6edb0ce9d3c66d9ef80ab5dad74b97f3abbb7cf9`에서 Unity 6000.6.7f1 Mac Editor `-batchmode -nographics -quit -projectPath <이 작업트리>/unity` import·compile 1회를 수행해 exit 0, C# 오류 0을 확인했다. 새 `UAC1015`가 `NativeSettingsSnapshot.extra`에 발생해 JSON 보존용 필드에 `[NonSerialized]`를 명시했다. 수리 후 재컴파일도 exit 0/C# 오류 0, 새 `UAC1015` 0이다. 남은 `NativeCharacterPresentationPlayback.Video`의 `UAC1001`은 기존 경고다. 로그는 작업트리 밖 `_out/UNITY-MAC-A15A16-20261027/compile.log`, `compile-warning-repair.log`에 있다. Unity가 재작성한 Resources `.meta` 411개와 새 런타임 `.meta` 1개는 사전 HEAD bytes로 복원해 제품 Resources 변경 0이다.

코드 계약을 다시 대조했다. 전용 `--unity-settings-persistence-smoke`는 QA product/id가 아니면 초기화를 거부하고, 절대 `-output`이 없으면 store를 열지 않으며 저장 디렉터리는 해당 output 안의 `native-settings-v1`이다. 같은 플래그에서는 `NativeLobby.CharacterStore`가 일반 roster를 열지 않는다. 다른 `--unity-*-smoke/capture/review`에서는 설정 store가 열리지 않는다. 이는 실행 검증이 아니라 코드·경로 가드 대조다.

현재 저장 v2 write/read fixture는 `Screen.fullScreen`, 실제 AudioSource와 `WaitForEndOfFrame`/PNG 캡처를 요구한다. 이 작업에 맞는 독립 headless Player smoke가 없으므로 새 ARM64 Player 빌드·실행 0, 사용자 앱/PID·설정/캐릭터 파일 접촉 0이다. v2 실제 저장·재기동·20동작 복원, GUI/OS 입력 및 19개 UI patch 런타임 인수는 **HOLD**. 이전 격리 .NET 90+write3/read2 PASS를 Unity runtime PASS로 승격하지 않는다.

## Editor 전용 비대화형 IO fixture 계약

`NativeSettingsIoVerification.Run`은 Mac 소유 Editor 전용 진입점이다. `-executeMethod`의 독립 Editor 프로세스에서 실제 `NativeSettingsJsonCodec`·`NativeSettingsStore`·`NativeKeyBindInput.TryKey`·`KeyBindings`를 사용한다. `NativeGame`/로비/캐릭터 roster·오디오/화면/Player는 생성하지 않는다. `--unity-settings-persistence-smoke`, `-settings-io-phase write|read`, 절대 `-output`·`-receipt`, 40자리 `-sourceSha`가 필수다. 출력 폴더는 부모 `_out` 아래 `UNITY-MAC-A15A16-IO-*` 이름이며, receipt는 그 안의 `editor-settings-write.json` 또는 `editor-settings-read.json`만 허용한다. `qa-output.marker`의 정확한 내용 `EXODUSER_MAC_SETTINGS_IO_V2\n`가 없으면 파일 읽기 전 거부한다. 실제 설정 IO는 지정 출력 아래 `native-settings-v1/settings.v1.json`에만 수행한다.

write는 격리된 v1 revision7·35/45/FPS144/fullscreen=true·중첩 `gpKeyMap` fixture를 읽고 기본 20동작 양 슬롯을 확인한다. `up=KeyZ`, `up` 보조 `KeyX`, `interact` 보조 `KeyF`를 적용한 뒤 v2 revision8로 저장하고 기존 설정·패드 JSON 보존을 확인한다. read는 별도 Editor 프로세스로 v2를 다시 읽어 같은 20동작과 기존 설정·패드 JSON을 확인한다. 두 phase 모두 실제 인자·소스 SHA·Unity 버전·경로·결과를 receipt에 남긴다. 이 fixture의 통과는 Unity Editor 직렬화/IO 접점만 의미하며 일반 Player 재기동·GUI·OS 입력·19개 패치 화면 인수를 대체하지 않는다.

### 실제 격리 Editor 인수

검증 소스 SHA `1523780994d996e84a31179f2ab55deac23f5540`, Unity **6000.6.7f1**. 전용 출력은 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15A16-IO-20261027`이고 두 실행 모두 `-batchmode -nographics -quit -projectPath /Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024/unity -executeMethod NativeSettingsIoVerification.Run --unity-settings-persistence-smoke -output <전용 출력> -receipt <전용 출력>/editor-settings-<phase>.json -settings-io-phase <phase> -sourceSha <소스 SHA>`를 사용했다. 정확한 전체 인자는 각 receipt의 `args`에 기록돼 있다.

| 독립 프로세스 | 종료 코드 | 검사 | 영수증 / 로그 | 실제 설정 IO |
|---|---:|---:|---|---|
| write | 0 | 50/50 PASS | `editor-settings-write.json` / `editor-write.log` | 전용 출력의 `native-settings-v1/settings.v1.json`, `.bak`, `settings.lock` |
| read | 0 | 45/45 PASS | `editor-settings-read.json` / `editor-read.log` | 같은 전용 v2 파일 읽기와 lock |

seed v1은 **164 bytes**, write 결과 v2는 **806 bytes**, revision **7→8**이었다. 재읽은 JSON은 `binds`·`binds2` 각각 20개, `up=KeyZ`, 보조 `up=KeyX`·`interact=KeyF`, SFX35/BGM45/FPS144/fullscreen true, `gpKeyMap.pad0.buttons=[1,2]`를 유지했다. 두 Editor 프로세스에서 C# 오류는 없었다. 일반 사용자 설정·캐릭터 store·기존 실행 앱 접근 0, Player 빌드·실행 0이다. Editor import가 다시 생성한 Resources `.meta` 411개와 런타임 `.meta` 1개는 사전 HEAD bytes로 복원했다. 일반 Player v2 재시작·GUI/OS 입력·19개 UI 패치 실화면·A02 최종 fit은 계속 **HOLD**다.

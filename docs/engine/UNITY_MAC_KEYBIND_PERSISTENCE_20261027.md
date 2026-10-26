# Mac A15/A16 키바인딩 저장 schema v2 후보 — 2026-10-27

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

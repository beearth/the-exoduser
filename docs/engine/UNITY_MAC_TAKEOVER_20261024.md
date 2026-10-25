# Unity Mac 인수 — 2026-10-24

> 2026-10-24 원본 기준 정정: 이 문서의 “최신 v22b / 사용자 최신 override”는 승인 근거 미확인으로 철회한다. v22b 복사/재생 검사는 해당 후보의 결과만 뜻한다. [원본 대조](UNITY_SOURCE_BASELINE_20261024.md).

## 2026-10-25 현행 상태

사용자가 Hub 로그인·라이선스 활성화와 Apple Silicon Editor 6000.6.7f1 설치를 완료했다. `/Applications/Unity/Hub/Editor/6000.6.7f1/Unity.app`에서 격리 프로젝트 compile/verify와 ARM64 일반 빌드가 성공했다. 원본 프로젝트의 6000.4.8f1 버전은 보존한다. 아래 최초 설치·약관 대기 내용은 당시 이력이며 현재 사용자 조치 요청이 아니다.

중앙 HUD·좌우 인벤토리의 3해상도 자동 검수는 [실제 Mac 검수](UNITY_UI_COMPOSITION_20261024.md)에 기록했다. 후속 단위는 Mac 로비/인트로 자연 재생과 조작 검수다. 미디어 최신 승인본은 여전히 미확인이므로 실제 재생 성공과 최신 승인 여부를 구분한다. PC 개발·자동화는 재개하지 않는다.

Mac 로컬 heartbeat `unity`는 이 Mac 채팅 `01a0f32f-a350-7430-85a4-fb71f336d5c7` 대상으로 ACTIVE/10분 간격 설정을 확인했다. 이는 설정 확인이며 예약 실행이 실제 수행됐다는 증거는 아니다.

## 최초 인수 기록

PC에서 전달된 최신 사용자 지시 “이제 맥에서 다 해라”에 따라 Mac이 로비·v22b 인트로와 UI 도킹 작업을 인수한다. 과거 웹 11팀 작업·전투/드랍 확장을 재개하지 않는다.

| 항목 | 실제 확인 |
|---|---|
| 호스트 | Darwin arm64, Fordeargamersui-MacBookPro.local, Node v24.15.0 |
| 기존 ROOT | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. tracked INDEX/WORK 변경0, 미추적94항목 보존 |
| 인수 원격 | `codex/unity-port-20261024`, `ffa85d620c1bbd377d007adea77ee8cbefbd6c98`, tree `6068a62ab926fd6024a3678ca4bc8bb7e8492473`. 실제 fetch/ref/tree 대조 |
| 새 소유 경로 | `/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024`, 브랜치 `codex/unity-mac-20261024`. Unity·engine docs·루트 지시 파일을 sparse checkout. 다른 worktree·공용 index 무수정 |
| 미디어 | `node unity/Tools/restore-lobby-media.cjs --project /Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024/unity` 실행. 4부분과 조립본 SHA 검사 PASS. 98,177,870B, `cd9fa7486fd1cf18952605408f5b1bae416a97b2307806476bc329498413199e` |
| 설치 | 사전 Unity Editor/Hub 발견0. 공식 Apple Silicon Hub를 `~/Applications/Unity Hub.app`에 설치, DMG checksum 및 codesign 확인. 실행 시 약관 동의 화면 확인, 임의 동의0 |
| 선행조건 | Hub의 Unity 이용약관·Editor 약관에 대한 사용자 확인, 기존 계정 로그인 및 유효 라이선스. Editor 6000.4.8f1 ARM64 공식 설치 패키지 4,783,968,814B 다운로드 완료, Apple 발급 Unity Technologies SF 설치 서명 검증 PASS. Editor 설치·실행은 아직0. 동의/라이선스 우회0 |
| PC 증거 | 문서에 기록된 Windows PASS를 인수했으나 I: QA PNG/로그 접근·이송은 미확인. Mac 실행 PASS로 사용하지 않음 |

## Mac 빌드 준비 변경

`PortVerification.Build`가 활성 타깃 `StandaloneWindows64` 또는 `StandaloneOSX`를 사용하도록 수정했다. Windows는 기존 `.exe`, Mac은 `.app` 이름이며 Mac Editor에서 ARM64를 선택한다. 다른 플랫폼/다른 호스트에서 Mac 빌드는 명시적으로 거부한다. `BuildOptions.None`과 기존 로비·씬 검사는 유지한다. 영수증에 target/architecture/output을 추가했다.

Unity 라이선스 선행조건 때문에 **이 변경은 아직 Editor compile/build 미검증 후보**다. NativeGame/NativeLobby/Video/Core/HUD/Inventory 실행 소스와 원본 미디어는 수정하지 않았다. Node 도구 구문과 Git diff 검사만 실행했으며 이를 C# 컴파일 검사로 세지 않는다.

활성화 후 실제 설치된 Editor 경로에서 `-batchmode -buildTarget osxuniversal -projectPath <checkout>/unity -executeMethod PortVerification.Verify -receipt <QA>/verify.json -logFile <QA>/verify.log`를 먼저 실행한다. GPU 검사가 있으므로 `-nographics`를 추가하지 않는다. 성공 후 `PortVerification.Build -output <새 빌드 폴더> -receipt <QA>/build.json`으로 일반 `.app`을 만든다. Windows 재검수는 `-buildTarget win64`를 명시한다. [공식 CLI](https://docs.unity.com/en-us/engine/6000.0/manual/unity-editor/command-line-arguments/editor), [Mac architecture API](https://docs.unity.com/en-us/engine/6000.3/script-reference/unityeditor/osxstandalone/userbuildsettings/architecture).

## 최초 인수 시 다음 행동 (현재 상태는 위 현행 기록 우선)

1. 사용자 약관 확인·로그인·유효 라이선스 뒤 Editor 설치 및 실제 import/verify/build.
2. Mac AVFoundation의 v22b 일반 재생·113초 자연끝·소리/자막/전환, replay·pause·ENTER·5초 holdskip·focus 직접 입력을 확인한다. 자동 fixture와 OS 입력·청각 검수를 분리한다.
3. 최신 도킹의 실제 Mac 화면·가독성·클릭/스크롤/드래그를 확인하고 발견한 결함만 수정한다. PC의 기존 통과 suite를 설명 없이 반복하지 않는다.

Mac에 Windows G:/E:/I: 절대 경로나 Junction을 만들지 않는다. 현재 QA 준비/코드 수정 전 사본은 `/Users/fordeargamers/Documents/Codex/2026-10-24/unity-mac-qa`에 있다. PC heartbeat PAUSED는 인계 보고이며 Mac 로컬 automation 파일 목록에서는 기존 항목을 찾지 못했다. 중복 자동화는 만들지 않았다. 생성/저장/계정/OAuth/완전 게임 진입·조건부 효과의 기존 미이식 경계와 Godot·사용자 저장·열린 앱을 보존한다.

## 후속 상태 정정

Hub 로그인과 사용자가 시작한6000.6.7f1 Silicon 다운로드를 CUA로 확인했다. 기존6000.4.8f1 패키지/프로젝트는 유지한다. v22b는 최신 승인 기준이 아니라 복사된 후보다. 후속 UI 구조·검수 상태는 [현행 설계](UNITY_UI_COMPOSITION_20261024.md)를 따른다.

Mac 후속:6000.6.7f1 별도복사본 compile/verify 및ARM64일반앱 build오류0,HUD·인벤3해상도 자동검수 완료. 원본6.4와 기존게임은미교체. 직접마우스는CUA좌표불일치로미검수. [실제결과](UNITY_UI_COMPOSITION_20261024.md#실제-mac-검수-결과).

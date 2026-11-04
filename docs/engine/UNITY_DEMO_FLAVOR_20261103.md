> 2026-11-04 제작법 변경: 저장은 복사·가져오기를 하지 않는다. 정식판은 옛 루트에 고정하고 demo·BIC·EA는 새 루트 이름공간에서 시작한다. 아래 "저장 계약"이 현행이며, 가져오기 방식 설명은 폐기했다.

# Steam Unity 체험판 flavor — 2026-11-03 21:10 PC 수정

기준 `origin/unity/main b2dc2c98a315e2d7da16c0e395bc1f370cfb9d2f`, 작업 브랜치 `codex/unity-demo-flavor-20261103`. PC는 공용 실행기의 Editor 컴파일까지만 한다. Steam의 기존 비공개 BuildID **26404441**은 수정 이전 `9f0d00cf8` 패키지다. 이번 소스 제출은 새 Steam 업로드·공개·Desktop 교체가 아니다.

## G0 — 기존 관례와 적용

- [Steam 공식 데모 지침](https://partner.steamgames.com/doc/store/application/demos#426): 체험판 메뉴에서 본편 상점으로 연결해 위시리스트로 이어지는 흐름을 확인했다. 완료 후 자동 외부 이동 대신 사용자가 누르는 별도 버튼으로 연결한다. 결제·자동 찜 등록은 하지 않는다.
- [공식 본편 상점](https://store.steampowered.com/app/4749590/)의 제품명 **EXODUSER: HELL LORD**를 ProjectSettings와 `PortVerification.MakeScene` 제품명 설정 양쪽에 적용한다. 회사명 `ForDearGamers` 유지.
- [실버 헬](../3.1%20ui%20hud%20디자인/DESIGN_CONCEPT_SILVER_HELL_20261028.md)의 흑철 바탕·은빛 선·명조 글꼴을 새 상점 버튼에 적용한다. 기존 결과 화면 아래에 별도 56px 행을 추가한다. 다음 행동 버튼의 입력·저장 콜백과 분리한다.
- [Unity persistentDataPath 문서](https://docs.unity.com/en-us/engine/6000.0/script-reference/unityengine/application/persistentdatapath)를 확인했다. Windows는 회사/제품, Mac Editor는 회사/제품 형식이다. Mac Player의 실제 폴더는 번들 ID(`com.회사.제품`, 영숫자가 아닌 UTF-8 바이트마다 `-`)이며 `unity.회사.제품` 가정은 틀렸다(11-04 실제 경로 확인). 공식 제품명의 `:`를 Windows에서 임의 치환하지 않고 Unity가 반환한 실제 경로를 사용한다.

## 결함과 수정

| ID | 원인 → 수정 | 상태 |
|---|---|---|
| U-D3 | ProjectSettings뿐 아니라 빌드 초기화에서도 검증판 이름을 다시 대입 → 두 곳 정식명으로 변경, 저장 루트는 이름과 분리(아래 저장 계약) | 코드 수정, Mac 실제 경로·창 제목 검수 대기 |
| U-D4 | `SaveNamespace` 정의만 있고 일반 로스터·설정 IO는 persistentDataPath 직결 → 일반 IO를 flavor별 경로로 연결(full은 옛 루트 고정, demo·BIC·EA는 새 루트 이름공간), 전투 IO는 기존 로스터의 부모 경로를 따라감 | 11-04 제작법 변경(복사·가져오기 폐기), 코드·루트 계산 검사 통과, Mac 재시작 검수 대기 |
| U-D1 | 진단 종료 화면에서 bool `false` 고정, 영문 버튼 정의 null → locale API와 29언어 `stageclear_labels.json` 공유. bool 기존 API도 ko/en으로 위임 | 29언어 API 확인, Mac 글꼴·1x 검수 대기 |
| U-D5 | 체험판 완료에서 본편 링크 없음 → `steam://store/4749590` 별도 버튼, 열어도 결과 화면·다음 행동 상태 유지 | 주입 콜백·배치 검사 통과, 실제 Steam 열기 대기 |
| U-D2 | 어픽스 금지 7종·합성 허용 22종은 `NotPorted` | 지시대로 보류, 이번 규칙 변경 없음 |

**29언어 데이터와 실제 표시의 경계:** ar도 세 문구를 번역 표에 보유한다. 기존 IMGUI RTL 미지원에 따른 ar → en 표시 폴백은 유지한다. 29개 언어의 실제 원어 화면 PASS나 아랍어 RTL 지원 완료로 보고하지 않는다. 기존 화면 전체 RTL 이식은 별도 작업이다.

## 저장 계약 (11-04 제작법 변경: 옛 루트 고정, 복사·가져오기 폐기)

저장소 세 개(`character-roster-v1`·`combat-save-v1`·`native-settings-v1`)의 스키마·revision·코덱은 바꾸지 않았다. 바뀐 것은 루트 선택뿐이다(`NativeFlavorSavePaths.FullRoot`·`NamespacedRoot`, `NativeFlavorStorage.TryResolve`).

| 플랫폼 | full(정식판) | demo·BIC·EA | QA sandbox(`--unity-qa-sandbox`) |
|---|---|---|---|
| Windows Player | `%USERPROFILE%/AppData/LocalLow/ForDearGamers/EXODUSER · Unity 이식 검증판/` (persistentDataPath의 부모 + 옛 제품명 폴더) | `<persistentDataPath>/<이름공간>/` = `.../LocalLow/ForDearGamers/EXODUSER_ HELL LORD/EXODUSER-HELL-DEMO`·`-BIC`·`-EA` | `<sandbox>/<이름공간>/` (full도 `EXODUSER-HELL-FULL`) |
| Mac Player | `~/Library/Application Support/com.ForDearGamers.EXODUSER----Unity-----------------/` (번들 ID 폴더, 코드 `BundleIdentifier`가 계산) | `<persistentDataPath>/<이름공간>/` | `<sandbox>/<이름공간>/` |
| 그 밖(Editor 등) | `Application.persistentDataPath` 그대로 (QA·개발용) | `<persistentDataPath>/<이름공간>/` | `<sandbox>/<이름공간>/` |

폴더 안 구조는 옛 빌드와 같다: `character-roster-v1`·`combat-save-v1`·`native-settings-v1`이 루트 바로 아래에 있고 이름공간 하위 폴더를 만들지 않는다. 그래서 **옛 이름 빌드와 정식판이 같은 폴더를 공유한다**(같은 파일을 읽고 쓴다). 루트는 플랫폼과 flavor로만 고른다(폴더가 있는지 찾아보지 않는다). demo·BIC·EA는 옛 루트를 보지 않고 새 제품명 루트의 자기 이름공간에서 처음부터 시작하며, QA sandbox는 실제 루트를 절대 보지 않는다. 스키마·revision·코덱은 바뀌지 않았다.

이름공간: full=`EXODUSER-HELL-FULL`(QA sandbox에서만 쓴다), demo=`EXODUSER-HELL-DEMO`, 비패키지 bic/ea의 빈 namespace는 `EXODUSER-HELL-BIC/EA`로 보완한다. 해석은 파일을 만들거나 열지 않는다. 폴더는 각 저장소가 처음 저장할 때 만든다. 이 코드에서 full 루트에 쓰는 것은 기존 저장소의 정상 저장뿐이다.

**결정 근거(11-04):** "옛 폴더 → 새 폴더 복사 + 지문 재가져오기" 방식은 검증에서 2연속 FAIL이었다(롤백·부분 실패·후보 경로 여러 개·동시 실행마다 새 예외가 나왔다). CLAUDE §4.1(같은 방법 2연속 FAIL이면 방법을 바꾼다)에 따라 정식판 저장 루트를 제품명과 분리해 옛 루트에 고정하고 복사·가져오기를 없앴다. 이제 롤백·분기·재가져오기 문제가 생길 수 없다. 폴더 이름이 "이식 검증판"인 것은 사용자에게 보이지 않는 경로라 감수한다. 출시 전에 이름을 정리해야 하면 그때 이전 도구를 따로 만든다(데모 v0 범위 밖).

가져오기 방식(옛 폴더 복사·지문 표식·`.replaced`·`.abandoned`·lock 회수·staging, 안내 문구 No.4288)은 **폐기(11-04)** 했다. 코드·테스트에서 모두 걷어냈다.

## 검증과 Mac 인계

- 수정 전 회귀 계약 5/5 실패 → 수정 후 계약 6/6 통과.
- .NET 격리 동작 검사(11-04 제작법 변경 뒤 **72/72**): 실제 flavor API 29언어, 플랫폼별 루트 계산(Windows·Mac Player·그 밖), full은 옛 루트·demo/BIC/EA는 새 루트 이름공간·QA는 sandbox, 해석이 폴더를 만들지 않음, 완료 임계 stage0 유지, full 종료 영향 없음, 버튼 분리/페이드 펜스/정확한 앱 URI. (58/58은 가져오기 방식 당시 수치로 폐기)
- 1920×1080·3840×1080·960×540·640×360 수학적 배치 검사 통과. 실제 화면·폰트·마우스 동작의 검수가 아니다.
- Unity 공용 bin Editor 최종 컴파일 **7b156bb4**: ok=true, exit=0, compileErrors=0, USER_SAVE 변경0. 첫 컴파일 8a24d6a3도 오류0이었으며 이후 Mac 경로 보완을 최종 컴파일로 재확인했다. PC Player 실행·Player 빌드 없음.

재현 명령(PC PowerShell 5.1 절대 경로로 실행):

```text
C:\nvm4w\nodejs\node.exe <작업본>\unity\Tools\demo-flavor-tests\contracts.cjs
C:\Program Files\dotnet\dotnet.exe run --project <작업본>\unity\Tools\demo-flavor-tests\DemoFlavorTests.csproj -p:NoWarn=CS0649 -- <작업본>\unity\Library\demo-flavor-tests-fixture <작업본>\unity\Assets\Exoduser\Resources
```

Mac 실행 인자(해당 Mac의 공용 실행기를 사용, PC에서 실행하지 않음):

```text
--unity-build-flavor demo --unity-mute --unity-qa-sandbox <Mac의 빈 절대 격리 경로>
```

기존 완료 화면 자동 검수 장치를 같이 쓸 때:

```text
--unity-build-flavor demo --unity-mute --unity-stageclear-presentation-capture --unity-qa-sandbox <Mac의 빈 절대 격리 경로> -output <Mac의 고정 캡처 경로>
```

이 장치는 강제 QA 진입/보스 처치를 포함한다. 자연 완주 증거로 해석하지 않는다. Mac에서 확인할 것: 같은 소스 패키지 창 제목, demo/full 독립 캐릭터·전투·설정의 종료/재시작, full이 옛 루트 폴더를 그대로 읽고 쓰는지(합성 fixture, 옛 이름 빌드와 같은 폴더 공유), 1920/3840 1x의 긴 문구·누락 글꼴·버튼 겹침0, 상점 버튼이 앱4749590을 열고 결과/저장 다음 콜백을 실행하지 않는지, 기존 종료 버튼이 정상 복귀하는지. 실제 사용자 데이터로 최초 이관을 시험하지 않는다.

## 11-04 검증 FAIL 11건 수정 (브랜치 claude/unity-pc-demo-flavor-fix-20261104)

CTO 독립 검증 3명이 68684c9a1을 FAIL로 판정한 11건의 처리다. Core 수치·판정은 바뀌지 않았다. PC 컴파일·.NET 격리 테스트까지만 했고 Unity Player 실행·Mac 판정은 하지 않았다.

| # | 처리 |
|---|---|
| 1 | 최신 unity/main을 다시 병합(CHANGELOG 양쪽 절 보존). 병합 뒤 `merge-base --is-ancestor origin/unity/main HEAD`로 fast-forward 가능을 확인했다 |
| 2·9 | CHANGELOG_SYNC.md 줄마다 CR을 세어 LF 줄 0(CRLF 100%). NativeStageClearOverlay.cs의 원래 LF 줄 3개(39·146·154행)를 되돌려 906fbad35 기준 줄 끝 분포를 유지 |
| 3 | 테스트 스텁 `Application.version` 추가. 전체 회귀(`recovery.cjs --full`)가 실제로 컴파일·실행되어 위시리스트 4해상도(1920×1080·3840×1080·960×540·640×360)·QA 격리·바이트 보존까지 통과 |
| 4 | 폐기(11-04 제작법 변경): 표식 기반 재가져오기. 가져오기 자체를 없앴다 |
| 5 | 폐기(11-04): `.tmp` 제외·실패 시 새로 시작·로비 안내(No.4288). 코드·데이터에서 걷어냈고 번역 목록 No.4288은 "폐기, 미사용"으로 둔다(번호 재사용 없음) |
| 6 | 폐기(11-04): lock 회수·staging 보존. lock·staging 코드가 없다 |
| 7 | Mac Player 번들 ID 폴더는 이제 full의 저장 루트다(`BundleIdentifier` 계산 그대로, 테스트가 실제 폴더 이름과 같은지 확인). 후보를 차례로 찾는 방식은 없앴다 |
| 8 | PauseInputCheck의 기대 경로를 `NativeFlavorStorage.Namespace`(코드의 flavor 이름공간)로 계산한다 |
| 10 | 번역 목록 No.4261 문구를 병합 사실로 정정 |
| 11 | 아래 알려진 변화 |

**#11 알려진 변화(정보):** Screenmanager 레지스트리(`HKCU\Software\ForDearGamers\<제품명>`, 창 위치·모니터 선택)는 제품명 `EXODUSER: HELL LORD`를 따르므로 이름이 바뀐 뒤 한 번 초기화된다(저장과 무관). Player.log는 저장 루트가 아니라 persistentDataPath(새 제품명)에 있다: Windows `%USERPROFILE%/AppData/LocalLow/ForDearGamers/EXODUSER_ HELL LORD/Player.log`(Unity가 `:`를 `_`로 바꾼다), 옛 이름 빌드의 로그는 옛 폴더에 남아 있다. combat-stats는 이름공간 밖에서 `NativeQaSandbox.Resolve(persistentDataPath)/combat-stats`(또는 `-output`)에 쓴다.

**실행:** `C:/nvm4w/nodejs/node.exe unity/Tools/demo-flavor-tests/recovery.cjs`(= `--full`: 계약6·루트 계산·flavor 격리·위시리스트 전체 회귀), `contracts.cjs`, `retouch.cjs`. 로그는 `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/f1-tests`에 남는다. 방식 변경 이력: 같은 방법 2연속 FAIL → 제작법 변경(11-04, 이 절).

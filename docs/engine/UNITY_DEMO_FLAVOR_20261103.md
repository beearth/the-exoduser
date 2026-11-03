# Steam Unity 체험판 flavor — 2026-11-03 21:10 PC 수정

기준 `origin/unity/main b2dc2c98a315e2d7da16c0e395bc1f370cfb9d2f`, 작업 브랜치 `codex/unity-demo-flavor-20261103`. PC는 공용 실행기의 Editor 컴파일까지만 한다. Steam의 기존 비공개 BuildID **26404441**은 수정 이전 `9f0d00cf8` 패키지다. 이번 소스 제출은 새 Steam 업로드·공개·Desktop 교체가 아니다.

## G0 — 기존 관례와 적용

- [Steam 공식 데모 지침](https://partner.steamgames.com/doc/store/application/demos#426): 체험판 메뉴에서 본편 상점으로 연결해 위시리스트로 이어지는 흐름을 확인했다. 완료 후 자동 외부 이동 대신 사용자가 누르는 별도 버튼으로 연결한다. 결제·자동 찜 등록은 하지 않는다.
- [공식 본편 상점](https://store.steampowered.com/app/4749590/)의 제품명 **EXODUSER: HELL LORD**를 ProjectSettings와 `PortVerification.MakeScene` 제품명 설정 양쪽에 적용한다. 회사명 `ForDearGamers` 유지.
- [실버 헬](../3.1%20ui%20hud%20디자인/DESIGN_CONCEPT_SILVER_HELL_20261028.md)의 흑철 바탕·은빛 선·명조 글꼴을 새 상점 버튼에 적용한다. 기존 결과 화면 아래에 별도 56px 행을 추가한다. 다음 행동 버튼의 입력·저장 콜백과 분리한다.
- [Unity persistentDataPath 문서](https://docs.unity.com/en-us/engine/6000.0/script-reference/unityengine/application/persistentdatapath)를 확인했다. Windows는 회사/제품, Mac은 Editor 회사/제품 또는 Player `unity.회사.제품` 형식이다. 공식 제품명의 `:`를 Windows에서 임의 치환하지 않고 Unity가 반환한 실제 경로를 사용한다.

## 결함과 수정

| ID | 원인 → 수정 | 상태 |
|---|---|---|
| U-D3 | ProjectSettings뿐 아니라 빌드 초기화에서도 검증판 이름을 다시 대입 → 두 곳 정식명으로 변경, 이전 이름의 저장 탐색 지원 | 코드 수정, Mac 실제 경로·창 제목 검수 대기 |
| U-D4 | `SaveNamespace` 정의만 있고 일반 로스터·설정 IO는 persistentDataPath 직결 → 일반 IO를 flavor별 경로로 연결, 전투 IO는 기존 로스터의 부모 경로를 따라 분리 | 코드·격리 파일 IO 검사 통과, Mac 재시작 검수 대기 |
| U-D1 | 진단 종료 화면에서 bool `false` 고정, 영문 버튼 정의 null → locale API와 29언어 `stageclear_labels.json` 공유. bool 기존 API도 ko/en으로 위임 | 29언어 API 확인, Mac 글꼴·1x 검수 대기 |
| U-D5 | 체험판 완료에서 본편 링크 없음 → `steam://store/4749590` 별도 버튼, 열어도 결과 화면·다음 행동 상태 유지 | 주입 콜백·배치 검사 통과, 실제 Steam 열기 대기 |
| U-D2 | 어픽스 금지 7종·합성 허용 22종은 `NotPorted` | 지시대로 보류, 이번 규칙 변경 없음 |

**29언어 데이터와 실제 표시의 경계:** ar도 세 문구를 번역 표에 보유한다. 기존 IMGUI RTL 미지원에 따른 ar → en 표시 폴백은 유지한다. 29개 언어의 실제 원어 화면 PASS나 아랍어 RTL 지원 완료로 보고하지 않는다. 기존 화면 전체 RTL 이식은 별도 작업이다.

## 저장 계약·기존 데이터 보존

일반 저장 루트는 `Application.persistentDataPath/<BuildFlavor.SaveNamespace>`다. full=`EXODUSER-HELL-FULL`, demo=`EXODUSER-HELL-DEMO`. 비패키지 bic/ea의 빈 namespace는 `EXODUSER-HELL-BIC/EA`로 보완한다. 캐릭터 `character-roster-v1`, 전투 `combat-save-v1`, 설정 `native-settings-v1` 세 폴더가 같은 루트를 사용한다. 스키마·revision·코덱은 변경하지 않는다.

기존 이름은 `EXODUSER · Unity 이식 검증판`이다. Windows는 실제 persistentDataPath의 형제 폴더, Mac은 `~/Library/Application Support/ForDearGamers/<기존 이름>`와 `~/Library/Application Support/unity.ForDearGamers.<기존 이름>`를 탐색한다. Mac에서는 Editor 형식을 우선한다. 회사명은 바꾸지 않는다.

이전 우선순위: 이미 있는 목적 namespace는 그대로 사용 → 이전 제품 루트의 같은 namespace → full에 한해 현재 제품 루트의 무 namespace 저장 → full에 한해 기존 제품의 무 namespace 저장. 예전 공유 저장은 출처 flavor를 판별할 수 없으므로 demo에는 자동으로 넣지 않는다. 예전 체험판에서 만들어진 공유 저장도 원본 위치에 그대로 남는다. 명시적으로 demo namespace에 있던 데이터만 demo에 이전한다. 자동 demo→full 진행 병합은 없다.

기존 폴더의 `.json`·`.bak` 저장만 읽어 고정 `<namespace>.legacy-import`에 새 파일로 기록하고, 성공하면 디렉터리 rename으로 목적 루트를 만든다. Player.log·잠금·임시 파일은 가져오지 않는다. 원본 삭제·이동·덮어쓰기 없음, 목적 파일 덮어쓰기 없음. 읽는 원본은 전체 이전 중 read-only handle을 유지해 활성 writer를 거부한다. 이전 앱을 종료한 상태에서 이관해야 한다. 중간 실패는 저장 차단으로 반환하되 이번 호출이 만든 staging 복사본은 catch에서 정리한다. 다음 호출에서 목적 폴더 없이 구형 staging만 남았으면 허용된 flat store의 json/bak 복사본인지 확인하고 정리 후 가져오기 1회만 시도한다. 예상 밖 파일/하위 폴더·링크·활성 staging writer는 보존하고 실패로 반환한다. 기존 목적 namespace가 있으면 이를 우선하며 잔류 staging도 건드리지 않는다.

**F-1 lease 보존(11-04 02:25):** staging 파일 충돌은 lease를 만들기 전에 거부한다. lease가 없으면 `CreateNew`로 이번 호출의 소유를 확정하고 `DeleteOnClose`로 성공/실패 후 제거한다. 기존 lease는 배타 `Open`만 하며 삭제·내용 변경하지 않는다. 생성 경쟁은 실패로 반환하므로 다른 호출의 lease를 덮어쓰지 않는다. 실패 경로에서도 기존 폴더의 파일 집합/바이트를 보존하는 회귀를 포함한다. 지정30검사·전체 계약6/동작58검사를 통과했다. PC 컴파일 및 Mac 런타임 검수 상태는 [F-1 최신 기록](UNITY_DEMO_FLAVOR_F1_20261104.md)을 따른다.

명시적 `--unity-qa-sandbox`에서는 실제 사용자 저장 탐색·이전이 없다. 기존 fixture/review의 `-output` 계약과 settings IO-free QA 경로는 유지한다. **PC에서 실제 사용자 저장을 이전하거나 지우지 않았다.**

## 검증과 Mac 인계

- 수정 전 회귀 계약 5/5 실패 → 수정 후 계약 6/6 통과.
- .NET 격리 동작 검사 **58/58**: 실제 flavor API 29언어, demo/full 구분, 원본 불변·세 저장 폴더 byte 보존, 목적 저장 보존, QA 격리, 같은 namespace demo 이전, 중단·활성 writer 거부, Mac 두 경로, 완료 임계 stage0 유지, full 종료 영향 없음, 버튼 분리/페이드 펜스/정확한 앱 URI.
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

이 장치는 강제 QA 진입/보스 처치를 포함한다. 자연 완주 증거로 해석하지 않는다. Mac에서 확인할 것: 같은 소스 패키지 창 제목, demo/full 독립 캐릭터·전투·설정의 종료/재시작, 합성 legacy fixture 이전과 원본 불변, 1920/3840 1x의 긴 문구·누락 글꼴·버튼 겹침0, 상점 버튼이 앱4749590을 열고 결과/저장 다음 콜백을 실행하지 않는지, 기존 종료 버튼이 정상 복귀하는지. 실제 사용자 데이터로 최초 이관을 시험하지 않는다.

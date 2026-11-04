# Unity 체험판 업로드 직전 점검표 — 2026-11-04 (스팀 총괄)

대상: 체험판 앱 **5337590**, Depot 5337591, Windows x64. CTO가 배정했다(데모 v0 ④).

- 모든 대조는 파일을 읽기만 해서 했다. steamcmd 실행·로그인·업로드, Steamworks 설정 변경은 하지 않았다.
- 소스 기준: origin/unity/main `850dd6f6f`, flavor 브랜치 `origin/codex/unity-demo-flavor-20261103` `3f90d1b78`(**unity/main에 아직 병합되지 않음**).
- 같이 보는 문서: [패키지 준비물](STEAM_DEMO_PACKAGE_20261104.md), [체험판 업로드 기록](STEAM_UNITY_DEMO_20261103.md).

## 1. 스크립트·Depot·빌드 출력 대조

| # | 확인할 것 | 읽은 값 | 판정 |
|---|---|---|---|
| A1 | 체험판 업로드 스크립트 | `G:\exoduser-steam\scripts\app_build_5337590_unity.vdf`: appid 5337590, contentroot `G:/exoduser-steam/content/demo-unity/`, buildoutput `G:/exoduser-steam/output/demo-unity/`, `setlive ""`, preview 0 | 맞음. 업로드만 하고 브랜치에 올리지 않는다 |
| A2 | `G:\exoduser-steam\run_build_unity_beta.bat` | APPVDF가 `scripts\app_build_4749590_unity_beta.vdf`로 고정돼 있다. 본편 4749590, `setlive unity-beta` | **체험판에는 쓰면 안 된다.** 이 bat을 실행하면 본편 unity-beta 브랜치에 올라간다. 체험판은 steamcmd에 `+run_app_build G:/exoduser-steam/scripts/app_build_5337590_unity.vdf`를 직접 준다(사용자 로그인). 체험판 전용 bat이 필요하면 따로 만든다(이 점검에서는 만들지 않음) |
| A3 | Depot 스크립트 | `depot_build_5337591_unity.vdf`: DepotID 5337591, ContentRoot `demo-unity/`, 전체 재귀, 제외 `*.pdb`·`*_BackUpThisFolder_ButDontShipItWithYourGame/*`·`*.log`·`*.bak*` | 맞음. 다만 Unity가 만드는 `*_BurstDebugInformation_DoNotShip/*` 제외가 없다. 지금 콘텐츠 폴더에는 그 폴더가 없지만(복사할 때 뺌) 안전하게 제외 줄을 추가하기를 권한다 |
| A4 | exe 이름 | 빌드 코드 `PortVerification.Build`가 출력 이름을 `EXODUSER-Unity.exe`로 고정한다(unity/main·flavor 브랜치 둘 다). 콘텐츠 폴더에 `EXODUSER-Unity.exe`·`EXODUSER-Unity_Data`가 있다 | 맞음. **제품명 변경과 무관하다.** exe·Data 폴더 이름은 빌드 경로가 정하고, productName은 정하지 않는다 |
| A5 | 제품명 | unity/main `PortVerification.MakeScene`이 빌드할 때마다 productName을 "EXODUSER · Unity 이식 검증판"으로 덮어쓴다. flavor 브랜치는 "EXODUSER: HELL LORD"로 덮어쓴다. ProjectSettings 값은 빌드 때 무시된다 | **막힘.** flavor가 병합되기 전 빌드는 창 제목과 저장 폴더가 "검증판"이다 |
| A6 | 제품명 변경의 영향 | ① 창 제목 ② 저장·로그 루트 `%USERPROFILE%\AppData\LocalLow\ForDearGamers\<productName>\`. Windows는 ':'를 '_'로 바꿔 `EXODUSER_ HELL LORD`가 된다(11-03 PC 에디터 컴파일 때 이 폴더가 이미 생겼다) ③ `Player.log` 위치도 같은 폴더로 옮겨 간다 | 새 설치에는 문제없다. 옛 "검증판" 저장은 flavor 코드가 같은 이름공간 폴더에서만 복사해 온다(덮어쓰기·삭제 없음, 11-03 검토). 공용 실행기 `exo-unity.ps1`는 `LocalLow\ForDearGamers` 전체를 실행 전후로 비교한다. 새 이름으로 처음 실행하면 새 폴더가 "추가"로 잡혀 사용자 저장 변경으로 판정될 수 있다. `-logFile`과 `--unity-qa-sandbox`로 실행하는지 확인한다 |
| A7 | 빌드 기록 | `G:\exoduser-steam\content\demo-unity.build-commit.json` = `9f0d00cf8`(11-03), VDF desc도 `unity/main 9f0d00cf8` | 새 빌드를 넣을 때 둘 다 같은 SHA로 바꾼다 |
| A8 | 지금 콘텐츠 | `content\demo-unity\EXODUSER-Unity_Data`에 `level0`·`level1`이 있다. 3D 리모델 씬(RM1_Slice)이 들어 있다는 뜻이다 | 지금 것은 맞음. 새 빌드도 `-remodel-scenes 1`로 만들어야 한다(2절) |

## 2. 체험판 flavor 빌드 인자

빌드와 실행에 각각 넣는 인자가 다르다. 두 곳 모두 맞아야 체험판이 3D·체험판 저장으로 돈다.

### 2.1 빌드(공용 실행기, Editor batch)

```
I:\EXODUSER-Storage\unity-jobs\bin\exo-unity.ps1 build -Worktree <소스 작업본> -Owner <레인>
  -ArgsJson '["-output","<레인 고정 빌드 폴더>","-receipt","<…>\build-receipt.json","-remodel-scenes","1","-flavor","demo"]'
```

| 인자 | 하는 일 | 빠지면 |
|---|---|---|
| `-remodel-scenes 1` | `RM1_Slice.unity`(1-1 3D 필드)를 빌드에 넣는다 | 씬이 없어서 `--remodel3d`로 실행해도 3D가 켜지지 않는다(2D 폴백) |
| `-flavor demo` | 빌드 안의 `Data/build_flavor.json`을 `{"selected":"demo"}`로 쓰고, 빌드가 끝나면 커밋된 `full`로 되돌린다(실패해도 되돌림). unity/main에도 이미 있다 | 실행 인자가 없을 때 `full`로 돈다. 저장이 정식판 이름공간에 섞인다 |
| `-output`·`-receipt` | 출력 폴더와 영수증 위치 | — |

빌드 뒤 확인:

- 영수증 `product`가 `EXODUSER: HELL LORD`인지 본다.
- Editor 로그에 `UNITY_BUILD_FLAVOR demo`, `UNITY_BUILD Succeeded`가 있는지 본다.
- 출력 폴더에 `EXODUSER-Unity.exe`가 있고 `EXODUSER-Unity_Data\level1`이 있는지 본다.

### 2.2 실행(Steamworks 체험판 실행 옵션)

| 칸 | 값 |
|---|---|
| 실행 파일 | `EXODUSER-Unity.exe` |
| 인수 | `-force-d3d11 --remodel3d` |
| OS·CPU | Windows, 64비트 |

- **`--remodel3d`는 기본값이 아니다.** `NativeRemodel3D.Requested`는 이 인자가 있을 때만 참이다(Editor QA 예외만 따로 있음). 실행 옵션에서 빠지면 체험판이 2D로 돈다. 기본으로 켜려면 코드를 바꿔야 하고, 그 판단은 Unity 담당 총괄의 몫이다.
- **11-04 3차 변경:** 배포 빌드(개발 빌드·QA 실행이 아님)는 명령줄 `--unity-build-flavor`를 **무시**하고 내장 `build_flavor.json`만 쓴다. 실행 인수로 체험판을 만들 수 없으므로, 체험판 패키지는 반드시 `PortVerification` `-flavor demo`로 빌드한다. 실행 인수에 넣어도 효과가 없어 뺐다.
- 세이브 이름공간: flavor가 demo면 저장 루트가 `…\LocalLow\ForDearGamers\EXODUSER_ HELL LORD\EXODUSER-HELL-DEMO\`가 되고, full이면 옛 루트 `…\LocalLow\ForDearGamers\EXODUSER · Unity 이식 검증판\`(하위 이름공간 없음, 11-04 루트 고정)이다. 레벨 상한 100, 끝 화면 "정식판 위시리스트에 추가"(No.4261)도 flavor가 정한다. **셋 다 flavor 병합 뒤에만 맞다.**
- 실행 옵션 칸의 실제 값은 Steamworks 체험판 설치 화면에서 사용자가 확인한다(클릭 목록 A). 아직 화면으로 읽지 않았다.

## 3. 막힘 목록 (11-04 갱신)

| # | 막힘 | 근거 | 풀리는 조건 | 담당 |
|---|---|---|---|---|
| X1 | **제품명·저장 분리·끝 화면** | flavor `3f90d1b78` 미병합. unity/main 빌드는 productName "검증판", F-1(스테이징 폴더 잔존) 수정 포함 여부 미확인 | flavor 병합 → Mac 판정 PASS → 빌드 영수증 product 확인 | Codex flavor 레인 → CTO 병합 |
| X2 | **최장 프레임 5.2초** | 한 판 실측 `52a39f8f6`: `longestFrameMs=5176`, p99 43.7ms(캡처 부하 포함) | 원인 확정(로딩·GC·캡처 중 무엇인지) → 수정 → 다시 재서 1초 미만 | 디버깅 총괄 |
| X3 | **한 판 완주 근거 없음** | 같은 실측이 보스전에서 사망(`worldCleared=false`). 새 설치 → 1-1 → 보스 처치 → 체험판 끝 화면 → 로비 복귀를 한 번에 한 기록이 없음 | Mac에서 체험판 빌드로 자연 완주 1회, 크래시 0, `Player.log` 예외 0 | 최신버전 테스트 총괄(Mac) |
| X4 | ~~BGM 상업 이용 권리(Suno)~~ **해소(사용자 확인 11-04)** | `docs/6사운드디자인/UNITY_BGM_IMPORT_CANDIDATES_20261104.md` 1.2: 웹 BGM 79파일 중 76파일이 Suno로 만든 곡이다(계정 beearthone, 생성 2026-02-25~07-27). 사용자가 곡을 만들 당시 유료 플랜이었다고 확인했다(CTO 경유, 11-04) | 해소됨. 태그가 없는 3파일(`공통/exoduser.mp3`·`공통/intro_voice.mp3`·`1장_썩은숲/h0_explore.mp3`)은 출처를 확인하기 전까지 체험판 빌드에 넣지 않는다 | — |
| X5 | 효과음 출처 표기 | `6사운드디자인.md`: freesound #518850(equip_base), #667271(cloth-grab), #257570(rummage)은 출시 전 CC 라이선스·저작자 표기 확인이 필요하다고 적혀 있다 | Unity 빌드에 들어갔는지 확인 → CC-BY면 크레딧에 표기, 아니면 교체 | 사운드 총괄 |
| X6 | 크래시·예외 0 | `Player.log` 예외 0 배정이 디버깅 총괄 세션에서 보류됨(권한 모드 차이) | 그 세션에서 승인 → 결과 | 사용자(세션 승인)·디버깅 총괄 |
| X7 | Steamworks 체험판 설정 | 실행 옵션 인수(2.2), 비공개 브랜치 unity-test, BuildID 26404441 배정은 사용자 클릭 목록 A에 있고 아직 끝나지 않음 | 사용자 클릭 | 사용자 |
| X8 | 스크립트 정리 | VDF desc·build-commit SHA가 `9f0d00cf8`. Depot에 `*_BurstDebugInformation_DoNotShip/*` 제외 없음 | 새 빌드를 넣을 때 고친다 | 스팀 총괄 |
| X9 | 상점 그래픽·스크린샷·영상 | [패키지 준비물](STEAM_DEMO_PACKAGE_20261104.md) 0절: 지금 캡처로는 키샷이 안 된다 | 맵 드레싱·보스 재제작 뒤 R4·R5 촬영 | 맵·보스전 총괄 → 스팀 총괄 |

업로드는 X1~X3이 풀린 뒤 시작한다(X4는 11-04 해소).

플레이 시간: 11-04에 맵 크기가 ×2로 정해져서 한 판 길이가 늘어난다.

- 지금 상점 문안에는 플레이 시간 숫자가 없다. 체험판 소개 No.4263, 짧은 설명 No.4273, 본편 상세 설명 ko·en 초안 모두 그렇다. 그래서 지금 고칠 곳은 없다.
- 시간을 넣는다면 ×2 맵으로 Mac 실측이 나온 뒤에 넣는다. 번역 목록 등록도 그때 한다.

1. 빌드(2.1)
2. 콘텐츠 복사(`robocopy /MIR /XJ`)
3. build-commit·desc 갱신
4. 사용자가 steamcmd에 로그인하고 업로드(`setlive ""`)
5. 사용자가 비공개 브랜치에 배정
6. Mac 설치 실행 판정
7. 공개 여부는 사용자가 정한다

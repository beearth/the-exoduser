# Unity 도구 경로와 SDK 정책

러너 42개가 `toolpaths.cjs`를 사용한다. 소유권 금지인 oracle-sweep는 제외했다.

| 도구 | 탐색 순서 |
|---|---|
| .NET | `EXO_DOTNET` → PATH dotnet → 기존 `C:/Program Files/dotnet/dotnet.exe` |
| Python | `EXO_PYTHON` → PATH python3 → PATH python → 기존 `C:/Python314/python.exe` |

환경 변수에는 실행 파일 경로 또는 PATH 명령을 지정한다. 찾지 못한 override는 다음 후보로 넘어간다. Windows는 PATHEXT를 사용하며 테스트는 `path.win32.normalize(...).toLowerCase()`로 비교한다. 실제 선택 파일의 존재와 버전 출력도 검사한다.

기본값은 기존 SDK 정책·인자·로그·종료 코드를 유지한다. 도구/SDK/참조팩이 없으면 `건너뜀(경로 없음)`을 출력하고 종료0으로 건너뛴다. Python 미발견은 해당 호출 로그에 기록한다. 건너뜀은 검사 PASS나 결과 수가 아니다.

## 실행 예

저장소 루트의 PowerShell에서:

```powershell
$env:EXO_DOTNET = 'C:/Program Files/dotnet/dotnet.exe'
$env:EXO_PYTHON = 'C:/Python314/python.exe'
node unity/Tools/combat-impact-tests/run.cjs --pure
node --test unity/Tools/_shared/toolpaths.test.cjs
```

Mac/Linux는 예를 들어 `EXO_DOTNET=/usr/local/share/dotnet/dotnet node ...`로 지정한다. 경로는 호스트에 맞춘다. 이번 실실행 검증은 Windows에서 했다.

`combat-impact-tests/run.cjs --pure`는 C#만 실행하고 Python 아트 검사를 생략한다. 기본 실행은 기존처럼 아트 검사도 수행하므로 관련 자산이 필요하다. run-ki.cjs도 공용 .NET 경로를 사용한다. resource-oracle의 인자는 그대로이며 `--dependency-root`에는 Acorn이 설치된 기존 저장소를 지정한다.

## SDK 패치 버전 허용

`EXO_DOTNET_ROLLFORWARD=1`은 SDK 명령(build/run/test/restore/publish/msbuild) 동안만 가장 가까운 global.json의 임시 사본에 `sdk.rollForward: latestPatch`를 적용한다. 원본 global.json·프로젝트·소스는 수정하지 않는다. SDK 기능 버전대나 주버전을 올리는 옵션이 아니다.

임시 폴더에는 정책과 인접 NuGet.Config만 복사한다. 명시 프로젝트/솔루션 경로를 원래 cwd 기준 절대 경로로 바꾸고 실제 빌드는 원래 프로젝트를 가리킨다. 임시 폴더는 동기 실행의 finally에서 정리한다. DLL 실행과 직접 csc 호출은 그대로다. 상대 인자가 있는 새 사용자 정의 명령은 임시 cwd를 고려해야 한다.

새 러너는 `require('../_shared/toolpaths.cjs')` 후 `dotnet()`/`python()`과 `spawnSync()`를 함께 쓴다. SDK/참조팩은 `sdkRoot()`/`refRoot()`/`refPack()`/`csc()`를 사용한다. windowsHide·stdin·timeout·환경 변수·출력 경로는 기존 설정을 넘긴다.

Windows 기준: combat-impact **914/0**, resource-oracle **530/0**, 공용 검사 **3/0**. [K1 보고서](../../../docs/0마스터플랜/worklog/cloud-lanes/K1-tools-portable_20261105.md).

# Unity Core oracle 일괄 점검

Core를 수정하거나 Unity Editor/Player를 띄우지 않고 `Tools`의 C# 프로젝트와 `export*.cjs`·`*-oracle.cjs`를 전수 목록화한다. `resource-oracle`은 별도 레인 소유이므로 제외한다. C# 프로젝트와 추출기는 구분해서 집계한다. 추출기 성공은 Core 규칙 PASS를 뜻하지 않는다.

## 실행

자기 Unity worktree에서 실행한다. Node와 .NET 8 SDK가 필요하다.

```powershell
& 'C:/nvm4w/nodejs/node.exe' ./unity/Tools/oracle-sweep/run.cjs
```

기본 결과는 `I:/EXODUSER-Storage/debug/oracle-sweep-20261104/summary.json`과 `summary.md`다. `--repo <worktree>`, `--out <절대 경로>`, `--web-rev <웹 커밋 또는 ref>`, `--sdk <설치된 SDK 버전>`(기본 `8.0.301`), `--dotnet <dotnet 경로>`, `--dependency-root <acorn 설치 루트>`로 바꿀 수 있다. 프로젝트 폴더 이름 또는 정확한 파일 경로를 쉼표로 주는 `--only`도 지원한다.

현재 체크아웃의 Core를 읽고, 웹 원문은 `git -C <worktree> show <origin/main SHA>:game.html`로 꺼낸다. 공용 웹 working copy를 oracle 원문으로 쓰지 않는다. SHA와 실행 명령·종료 코드·진단·실패 값은 JSON에 남는다. 고정된 과거 스냅샷 해시를 요구하는 옛 추출기는 현재 웹으로 몰래 바꾸거나 검사 기대값을 느슨하게 하지 않는다.

상대 경로를 쓰는 프로젝트는 `unity/Library/OracleSweep/<프로젝트>/unity/Tools/<이름>`에서 실행한다. 하니스 소스·입력만 이 임시 경로로 옮기고, Core는 실제 체크아웃 파일을 직접 참조한다. 임시 csproj의 Include/Exclude/Exists 경로만 해석한다. sparse 범위 밖의 필요한 소스·JSON은 동일한 Git 커밋에서 읽어 임시 입력으로 꺼낸다. 소환굴 좌표와 옛 충돌 맵은 동결된 `origin/godot/main`의 Git blob을 쓰며 실제 커밋을 `inputNotes`에 기록한다. 실행식은 현재 웹이다.

모든 자식 프로세스는 `windowsHide: true`, `stdin: ignore`다. `DOTNET_CLI_HOME`은 해당 임시 폴더 아래이며 telemetry·global tools PATH 추가·공유 컴파일 서버를 끈다. 작업 트리의 Tools 폴더에 bin/obj를 만들지 않는다. 한 항목은 export와 dotnet을 합쳐 최대 10분, 전체 세션은 최대 2시간이다. 시간 초과 시 이 실행기가 만든 자식 프로세스 트리만 종료한다.

## 분류

| 분류 | 의미 |
|---|---|
| PASS | 실제 실행한 단계의 종료 코드 0, 영수증에 실패 검사 없음 |
| FAIL | 실행된 검사에서 실제 값/기대값 차이가 확인됨. 옛 fixture 또는 손 기대값의 실패도 포함하므로 곧바로 Core 결함으로 해석하지 않음 |
| BUILD-BREAK | Core API·참조 변경 때문에 하니스가 컴파일되지 않음 |
| NEEDS-INPUT | 고정 스냅샷·자산·웹 export·영수증·VM 입력이 없거나 추출 계약이 현재 원문과 맞지 않음. 타임아웃도 이유를 붙여 이 분류로 남김 |
| SKIP | UnityEngine GUI 등 실제 Editor/Player 의존으로 이 dotnet 레인에서 실행할 수 없음 |

검사 수를 영수증/로그에서 얻지 못하면 `미집계`로 표시한다. 예외로 중단된 항목의 남은 검사는 실행된 것으로 세지 않는다. PASS에는 현재 웹 원문 비교, 과거 추적 fixture 비교, 수기 기대값 기반 순수 C# 검사, 추출기 실행이 함께 있으므로 행의 종류·명령·입력을 확인해야 한다. 화면·소리·자연 플레이·Mac 판정은 이 결과로 검증하지 않는다.

## 수정 후 이어 실행

```powershell
& 'C:/nvm4w/nodejs/node.exe' ./unity/Tools/oracle-sweep/run.cjs --resume --retry-changed --only enemy-spawn-oracle
```

`--resume`은 이전 결과를 유지한다. `--retry-changed`는 실행기 또는 해당 하니스가 달라진 항목만 허용한다. 실제 FAIL은 자동 재실행하지 않는다. 준비 단계에서 파일을 꺼내지 못해 C# 검사를 시작하지 않은 경우와 검사 실패를 구별한다. 동일 검사의 실패를 수정 없이 반복하지 않으며, 실패한 검사 기대값을 PASS가 되도록 바꾸지 않는다.

2026-11-04 점검에서 보완한 하니스:

- enemy-spawn-oracle / enemy-hurt-oracle: 새 근접 전투 정책을 참조하는 Core 의존 파일 포함. Red 모드의 기존 항목은 유지한다.
- enemy-hurt-oracle: 범위 밖 화면 접점 장식 `_feelContact` API 경계를 추가했다.
- inventory-navigation: SimulationState가 요구하는 EnemySpawn 등 Core 참조를 포함했다.
- lobby-oracle/VideoIntent: 현재 영상 어댑터의 Unity 경계 API와 실제 DeferredQuitIntent 참조를 추가했다. 영상 디코딩·종료 루프의 실게임 검증은 아니다.
- player-hurt-oracle: 현재 원문의 `_playerDefTotals`와 기본 feel 표현 함수·상수를 그대로 추출한다. 기존 플래시와의 차이를 숨기지 않고 FAIL로 보존한다.
- rage-malice-oracle: 수치와 무관한 통화 HUD 연출 `_currencyOrbPickup` 경계를 추가했다.

일괄 실행기 자체 검증:

```powershell
& 'C:/nvm4w/nodejs/node.exe' --test ./unity/Tools/oracle-sweep/run.test.cjs
```

인계가 끝나면 자기 `unity/Library/OracleSweep`과 Git에 push된 자기 worktree를 제거한다. 웹 원문·개별 임시 결과·빌드를 쌓아 두지 않고 summary와 레인 REPORT만 남긴다.

# Unity Core oracle 일괄 점검

Core를 수정하거나 Unity Editor/Player를 띄우지 않고 `Tools`의 C# 프로젝트와 `export*.cjs`·`*-oracle.cjs`를 전수 목록화한다. `resource-oracle`은 별도 레인 소유이므로 제외한다. C# 프로젝트와 추출기는 구분해서 집계한다. 추출기 성공은 Core 규칙 PASS를 뜻하지 않는다.

## 실행

자기 Unity worktree에서 실행한다. Node와 설치된 .NET SDK/참조 팩이 필요하다. 이 오프라인 레인의 기본은 SDK 10.0.400 / net10.0이다.

```powershell
& 'C:/nvm4w/nodejs/node.exe' ./unity/Tools/oracle-sweep/run.cjs
```

기본 결과는 `I:/EXODUSER-Storage/debug/oracle-sweep-20261104/summary.json`과 `summary.md`다. `--repo <worktree>`, `--out <절대 경로>`, `--web-rev <웹 커밋 또는 ref>`, `--sdk <설치된 SDK 버전>`(기본 `10.0.400`), `--framework <TFM>`(기본 `net10.0`), `--library <임시 csproj/출력 폴더>`, `--dotnet <dotnet 경로>`, `--dependency-root <acorn 설치 루트>`로 바꿀 수 있다. 프로젝트 폴더 이름 또는 정확한 파일 경로를 쉼표로 주는 `--only`도 지원한다.

현재 체크아웃의 Core를 읽고, 웹 원문은 `git -C <worktree> show <origin/main SHA>:game.html`로 꺼낸다. 공용 웹 working copy를 oracle 원문으로 쓰지 않는다. SHA와 실행 명령·종료 코드·진단·실패 값은 JSON에 남는다. D-T2 대상 추출기는 명시적인 `--source` / `--head` / `--out`으로 현행 Git 원문을 읽고 SHA를 기록한다. 이전 고정 스냅샷은 기본값에서 제거했으며 `--expect-source-sha`로 명시 검증할 수 있다. 원문 함수는 그대로 실행하며, 비교·인벤토리의 seed 종류는 행의 입력 경로로 구분한다.

상대 경로를 쓰는 프로젝트는 `<--library 또는 --out/build-current>/<프로젝트>/unity/Tools/<이름>`에서 실행한다. 하니스 소스·입력만 이 임시 경로로 옮기고, Core는 실제 체크아웃 파일을 직접 참조한다. 임시 csproj의 Include/Exclude/Exists와 TargetFramework만 바꾸며, 임시 NuGet.Config의 외부 공급원을 비운다. 원래 csproj는 net8.0을 유지한다. sparse 범위 밖의 필요한 소스·JSON은 동일한 Git 커밋에서 읽어 임시 입력으로 꺼낸다. 소환굴 좌표와 옛 충돌 맵은 동결된 `origin/godot/main`의 Git blob을 쓰며 실제 커밋을 `inputNotes`에 기록한다. 실행식은 현재 웹이다.

모든 자식 프로세스는 `windowsHide: true`, `stdin: ignore`다. `DOTNET_CLI_HOME`은 해당 임시 폴더 아래이며 telemetry·global tools PATH 추가·공유 컴파일 서버를 끈다. 작업 트리의 Tools 폴더에 bin/obj를 만들지 않는다. 한 항목은 export와 dotnet을 합쳐 최대 10분, 전체 세션은 최대 2시간이다. 시간 초과 시 이 실행기가 만든 자식 프로세스 트리만 종료한다.

## 분류

| 분류 | 의미 |
|---|---|
| PASS | 실제 실행한 단계의 종료 코드 0, 영수증에 실패 검사 없음 |
| FAIL | 실행된 검사에서 실제 값/기대값 차이가 확인됨. 옛 fixture 또는 손 기대값의 실패도 포함하므로 곧바로 Core 결함으로 해석하지 않음 |
| BUILD-BREAK | Core API·참조 변경 때문에 하니스가 컴파일되지 않음 |
| NEEDS-INPUT | 고정 스냅샷·자산·웹 export·영수증·VM 입력이 없거나 추출 계약이 현재 원문과 맞지 않음. 타임아웃도 이유를 붙여 이 분류로 남김 |
| ENVIRONMENT | SDK·참조 팩·NuGet 공급원 준비 실패. 하니스 FAIL로 세지 않음 |
| RETIRED | 대체 검사를 명시해 자동 oracle 대상에서 폐기한 역사 감사/자산 이식 도구. 수동 도구 파일은 보존 |
| NOT-RUN | 선택 범위 밖이며 이번에 실행하지 않음 |
| SKIP | UnityEngine GUI 등 실제 Editor/Player 의존으로 이 dotnet 레인에서 실행할 수 없음 |

검사 수를 영수증/로그에서 얻지 못하면 `미집계`로 표시한다. 예외로 중단된 항목의 남은 검사는 실행된 것으로 세지 않는다. PASS에는 현재 웹 원문 비교, 과거 추적 fixture 비교, 수기 기대값 기반 순수 C# 검사, 추출기 실행이 함께 있으므로 행의 종류·명령·입력을 확인해야 한다. 화면·소리·자연 플레이·Mac 판정은 이 결과로 검증하지 않는다.

## 수정 후 이어 실행

```powershell
& 'C:/nvm4w/nodejs/node.exe' ./unity/Tools/oracle-sweep/run.cjs --resume --retry-changed --only enemy-spawn-oracle
```

`--resume`은 이전 결과를 유지한다. `--retry-changed`는 실행기 또는 해당 하니스가 달라진 항목만 허용한다. `scope.counts` / `scope.projectCounts` / `scope.scriptCounts`가 선택 범위 집계다. 실제 FAIL은 자동 재실행하지 않는다. 원인을 고친 첫 FAIL만 `--retry-changed --retry-failed`로 명시 재검사할 수 있고 기존 2회 상한을 유지한다. 준비 단계에서 파일을 꺼내지 못해 C# 검사를 시작하지 않은 경우와 검사 실패를 구별한다. 동일 검사의 실패를 수정 없이 반복하지 않으며, 실패한 검사 기대값을 PASS가 되도록 바꾸지 않는다.

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

인계가 끝나면 자기 `--library`와 `--out/web`의 임시 입력·프로젝트·출력을 지운다. 작업본 제거·커밋·push는 현재 사용자 지시를 따른다. 웹 원문·개별 임시 결과·빌드를 쌓아 두지 않고 summary와 레인 REPORT만 남긴다.

## 2026-11-05 D-T2 점검

기준 Core 9196a515d, 웹 b94c8fbff에서 기존 입력 대기 24개만 점검했다. C# 8 PASS / 1 BUILD-BREAK, 추출기 11 PASS / 4 RETIRED다. enemy-tick C#은 두 번의 컴파일 참조 실패 후 중단했다. MeleeAttackRules의 EnemyAi/Combat 의존은 sparse 안에 있지만 해당 csproj에 없다. Core 결함 판정이나 세 번째 실행은 하지 않았다.

자산 이식기 3개는 Runtime 쓰기·대규모 변환을 수행하므로 자동 검사에서 폐기하고, 다음 읽기 전용 대체 검사를 제공한다.

```powershell
node unity/Tools/oracle-sweep/asset-receipt-check.cjs --repo <worktree> --rev <SHA> --out <레인>/asset-receipts.json
```

추적된 Unity 자산과 Fixtures 영수증의 바이트 수·SHA를 대조한다. 직접 추적되지 않은 영상은 MediaRecovery manifest의 조각·전체 해시를 검사하며 Runtime에 복원하지 않는다. 파일 수입·영상 디코딩·그림 품질을 검증하지 않는다. 역사적인 parry-g2 classify-oracle은 현행 A안 exporter/EnemyHurtTests 및 parry-g2-tests로 대체했다. 이번 레인에서 A안 전체 스위트를 다시 돌린 것은 아니다.

상세 결과·24개 표·sparse 경로·중단 근거는 `I:/EXODUSER-Storage/codex-takeover/debug-t2-harness/REPORT.md`와 `sweep/summary.json`에 있다. Core·Runtime 수정, Unity, Python, commit·push는 0이다.

# DT-01 Unity 작업 서버 + PC 순번 큐

## Codex 실행(exo-codex.ps1)

여러 총괄이 PC의 Codex CLI 0.165를 쓸 때 워크트리·메모리·HALT·동시 실행을 확인하고 실행 기록을 I: 보관소에 남긴다. `codex exec`의 stdin은 빈 파일로 닫는다. 긴 브리프는 `prompt.md`에 복사하고 CLI에는 그 파일을 읽으라는 짧은 인수만 전달한다.

```powershell
$wt = 'E:\exoduser-wt\<작업 워크트리>'
$codex = Join-Path $wt 'unity\Tools\devtools\exo-codex.ps1'
& $codex run -Worktree $wt -Brief "$wt\brief.md" -Name 'hud-fix' -Owner 'unity-lead'
& $codex run -Worktree $wt -Brief "$wt\brief.md" -Name 'hud-check' -Owner 'unity-lead' -Background
& $codex status -Last 20
& $codex show -Run '20261028-143000_hud-fix'
```

`-Model <id>`와 `-TimeoutMin 90`, `-MinCommitFreeGB 4`를 선택할 수 있다. `-DryRun`은 입력 검사 후 `brief.md`, `prompt.md`, 실행하지 않음 표시가 든 `meta.json`까지만 만든다. 허용 경로는 `E:\exoduser-wt\` 또는 `G:\exoduser-wt\` 바로 아래의 Git 워크트리다. `G:\exoduser`는 거부한다. 기본 동시 실행 상한은 3건이며 워크트리마다 잠금 1건이다.

| 종료 코드 | 뜻 |
|---:|---|
| 0 | 성공 또는 DryRun 성공 |
| 1 | Codex 비정상 종료 또는 실행 실패 |
| 2 | 입력·메모리 검사 실패 |
| 3 | Unity HALT 존재 |
| 4 | 워크트리 잠금 또는 동시 실행 상한 |
| 5 | 실행 중 Codex가 커밋함(되돌리지 않음) |
| 6 | 시간 초과, 해당 실행기가 띄운 프로세스 트리 종료 |

실행 폴더는 `I:\EXODUSER-Storage\codex-runs\<yyyyMMdd-HHmmss>_<Name>\`이다. `brief.md`는 원본, `prompt.md`는 표준 규칙을 덧붙인 지시문, `codex.log`는 표준 출력과 오류, `result.md`는 마지막 메시지다. `meta.json`은 SHA·시각·종료 코드 등, `diff.patch`·`status.txt`·`diffstat.txt`는 실행 후 변경 근거다. 잠금은 `_locks\<워크트리 폴더명>.json`에 둔다. DryRun에는 Codex 로그와 diff 산출물이 없다.

**Codex는 커밋하지 않는다. 총괄이 diff를 검수한 뒤 필요한 파일의 경로를 지정해 직접 커밋한다.**

병합 뒤 워크트리 정리는 아래 `exo-worktree-clean.ps1`의 `scan`으로 확인하고 총괄에게 요청한다.

## 워크트리 정리(exo-worktree-clean.ps1)

`scan`은 Git에 등록된 워크트리와 E:/G:의 작업 폴더를 대조해 JSON·Markdown 보고서를 만든다. Git 미등록 폴더와 링크인 루트는 `keep`으로 기록하고 내부를 순회하지 않는다(크기 미측정). 후보는 **① Git 변경·미추적·재생성 불가 무시 파일 없음, ② HEAD와 로컬 브랜치의 모든 커밋이 원격에 보존됨, ③ 지정 시간 동안 파일 변경 없음, ④ 프로세스·Unity/Codex 잠금·예약에서 사용 중이지 않음, ⑤ 보호 목록·활성 세션·사용자 체크아웃이 아님**을 모두 만족해야 한다. 하나라도 어긋나거나 검사가 실패하면 `keep`이다. 캐시는 Unity Library/Temp/Logs/obj/UserSettings, node_modules, 빌드 출력, `.vs`, 생성된 csproj/sln으로 한정한다.

링크(junction·symlink)는 대상과 함께 보고한다. 사람이 `apply`할 때는 후보를 다시 검사한 다음 **링크 자체만 먼저 제거 → 링크 0개 재확인 → force 없는 `git worktree remove`** 순서로 처리한다. 실패한 항목은 건너뛰고 로그에 남긴다. 공통 규칙에 따라 `git worktree prune`은 실행하지 않는다. `apply`는 자동 세션에서 실행하지 않는다.

```powershell
$clean = Join-Path $wt 'unity\Tools\devtools\exo-worktree-clean.ps1'
& $clean scan -Root 'E:\exoduser-wt','G:\exoduser-wt' -RepoRoot 'G:\exoduser' -IdleHours 2 -ActiveJson 'I:\EXODUSER-Storage\worktree-clean\active.json'
# I:\EXODUSER-Storage\worktree-clean\scan-<시각>.json/.md를 사람이 검토한다.
& $clean apply -Plan 'I:\EXODUSER-Storage\worktree-clean\scan-<시각>.json' -Confirm '<보고서의 6자리 코드>' -WhatIf
# 실제 정리가 필요할 때 사람이 직접 -WhatIf 없이 같은 명령을 실행한다.
```

**각 총괄은 자기 브랜치가 병합되면 자기 워크트리를 scan으로 확인한 뒤 정리 요청한다.** 새 워크트리는 `E:\exoduser-wt\`에만 만들고, Library는 필요할 때만 복사한다. 보고서 기본 위치는 `I:\EXODUSER-Storage\worktree-clean\`이다.

Unity를 작업마다 새로 띄우면 고정 비용(라이선스·첫 Refresh·엔진 초기화/종료)이 9~10초씩 든다.
작업 서버는 워크트리당 Unity 1개를 batchmode로 계속 띄워 두고, 작업을 파일로 받아 실행한다. 컴파일 오류는 Unity를 다시 띄우지 않고 결과 json에 바로 담긴다.

## 구성
- 에디터: `unity/Assets/Exoduser/Editor/DevTools/JobServer/` (`ExoJobServer` — `-exoJobServer <queueDir>`가 있을 때만 켜짐, `ExoArgs.Get()` — 명령줄 대체)
- CLI: `unity/Tools/devtools/exo-unity.ps1` (PowerShell 5.1)
- 큐 폴더: `I:\EXODUSER-Storage\unity-jobs\<워크트리 폴더명>\` (`inbox` `running` `done` `logs` `server.json`)
- 잠금: `I:\EXODUSER-Storage\unity-jobs\_pc_lock.json` (PC 전체 Unity 1개)
- 순번 예약: `I:\EXODUSER-Storage\unity-jobs\queue\`

## 명령
```powershell
$x = 'E:\exoduser-wt\pc-unity-devtools-runner\unity\Tools\devtools\exo-unity.ps1'
$wt = 'E:\exoduser-wt\<내 워크트리>'

& $x start  -Worktree $wt                       # 서버 기동(잠금·Unity 0개·커밋 여유 20GB 확인, Library 없으면 30GB)
& $x run    -Worktree $wt -Method Exoduser.Rm1SliceBuilder.Capture -Args '-outDir','I:/x','-cuts','start'
& $x run    -Worktree $wt -Method Exoduser.Foo.Bar -NoRefresh -TimeoutSec 300 -Json
& $x status [-Worktree $wt]                      # 서버·잠금·inbox·메모리·Library 경고
& $x stop   -Worktree $wt [-Force]               # 서버 종료(종료 확인 + 잠금 정리)
& $x reap                                        # 하트비트 60초 끊긴 "이 도구가 띄운" 서버만 정리, 다른 Unity는 보고만
```
`-File` 모드(cmd/bash)에서는 `-Args '-outDir,I:/x,-cuts,start'`처럼 쉼표로 이어 쓰거나 `-ArgsJson '["-outDir","I:/x"]'`를 쓴다.
`run`의 종료 코드 = 결과의 exitCode (컴파일 실패 3, 메서드 없음 4, 리로드로 중단 5, 대기 초과 6, 서버가 job 중 사라짐 90).

- 서버가 있으면 `run`은 `inbox`에 `<UTC 타임스탬프>_<id>.json`을 넣고 `done\<id>.json`을 기다린다. 동시에 여러 `run`을 해도 파일명 순서대로 하나씩 실행된다.
- 서버가 없으면 같은 잠금 아래 `-batchmode -quit -executeMethod` 1회 실행으로 대체하고 같은 형식의 결과를 낸다(`_tickets\` 순번 포함).
- 매 실행 로그는 `logs\<id>.log`(job별) / `logs\server-<시각>.log`(서버별)로 분리된다. 종료 뒤 프로세스가 실제로 사라졌는지 확인해 출력한다.

## 순번 예약 (유니티 총괄이 운영)
```powershell
& $x reserve   -Owner unity-m1-sonnet -Note "m1-check 다음" [-TtlMin 120]   # 예약(같은 Owner는 갱신)
& $x queue                                                                    # 잠금 보유자 + 예약 순서
& $x unreserve -Owner unity-m1-sonnet
& $x start -Worktree $wt -Owner unity-m1-sonnet                               # 맨 앞 예약자만 진행(획득하면 예약 소멸)
```
예약이 하나라도 있으면 `-Owner`가 맨 앞 예약자와 같은 호출만 잠금을 잡는다. 예약은 TTL(기본 120분)이 지나면 사라진다.
다른 세션이 손으로 만든 잠금(pid 없음)은 보유 중으로 보고 기다린다(60분 지나고 Unity 0개일 때만 stale).
`-Takeover`: 다른 워크트리 서버가 잠금을 쥐고 idle 300초 이상이면 stop 요청 후 넘겨받는다. 기본은 대기(최대 `-WaitMin` 40분, `-PollSec` 30초 간격).

## 공용 실행기: 다른 세션은 이 실행기로만 Unity·브라우저를 띄운다 (창·소리 없음)
```powershell
& $x player  -Exe I:\EXODUSER-Storage\unity-latest\build\EXODUSER-Unity.exe -Args '--unity-m1-check,...' [-TimeoutSec 600] [-KillAfterSec 25]
& $x browser -Script C:\...\check.mjs [-Args ...] [-TimeoutSec 600]
& $x nw      -Exe ...                      # 항상 거부(창 없는 방식이 없음)
```
- `player`: 항상 `-batchmode`(창 없음, GPU 유지) + `--unity-mute` 를 붙인다. 로그 `_exec\logs\player-<id>.log` 에서 `Renderer:` 줄로 그래픽 장치 이름을 뽑아 결과에 넣고, `Forcing GfxDevice: Null` 이면 실패. `-KillAfterSec N` 은 N초 뒤 종료시키는 것이 정상인 점검용(자체 종료하지 않는 빌드).
- `browser`: node 를 `exo-pw-guard.cjs` 와 함께 띄운다. 가드가 Playwright `launch`/`launchPersistentContext` 에 `headless:true` + 크로미움 `--mute-audio` 를 강제하고, `headless:false`/`--headed` 는 스크립트 문구와 실행 중 호출 모두 거부한다. playwright 는 `-NodeModules`(기본 `G:\exoduser\node_modules`)에서 찾는다. 자체 점검: `selftest\pw-smoke.mjs`.
- 거부(종료 코드 2, 사유 출력): `-popupwindow`, `-screen-fullscreen`, `-nographics`, Playwright `headless:false`/`--headed`, nw.js.
- 실행 뒤 검사: 띄운 프로세스 트리와 실행 중 새로 생긴 `EXODUSER-Unity/Unity/nw` 프로세스 중 `MainWindowHandle ≠ 0` 이면 실패(종료 코드 4). 새로 생긴 `chrome/msedge` 는 우리 명령줄과 겹칠 때만 위반으로 보고, 아니면 경고만 한다(사용자가 같은 시각에 연 브라우저일 수 있음). 끝난 뒤 트리 프로세스가 사라졌는지 확인하고 남은 것은 정리해 결과에 적는다. 결과 json: `_exec\done\<id>.json`.
- `player` 는 Unity 잠금(`_pc_lock.json`)과 예약 큐를 거친다(커밋 여유 10GB). `browser` 는 잠금을 쓰지 않는다.
- 잠금의 pid 는 Unity 를 띄우고 끝까지 기다리는 이 실행기의 `$PID` 다(서버는 서버 Unity pid). 삭제는 pid·token 이 자기일 때만 한다. pid 가 죽었어도 Unity 가 돌고 있고 잠금이 15분 안쪽이면 보유 중으로 본다.
- 예약을 여러 단계에 걸쳐 쥐고 싶으면 `-Owner 이름 -KeepReservation`(획득해도 예약이 남음), 끝나면 `unreserve`.

## job json (직접 넣을 때)
`{"id":"x1","method":"Exoduser.Rm0EngineSetup.Capture","args":["-output","I:/x.png"],"refresh":true,"timeoutSec":600}`
메서드는 `static ()` 또는 `static (string[])`. `()`일 때 `Exoduser.DevTools.ExoArgs.Get()`이 job 인자를 돌려준다(앞에 자리 하나). int를 반환하면 exitCode.

## 주의
- 메서드가 `EditorApplication.Exit`를 부르면 서버가 같이 죽는다: `PortVerification`, `NativeSettingsIoVerification`, `FrontendPadVerification`은 서버로 돌리지 말고 batch(서버 없을 때 `run`)로 돌린다.
- job이 `AssetDatabase.Refresh`로 도메인 리로드를 일으키면 그 job은 exit 5로 중단 처리된다.
- 서버를 띄운 사람은 끝나면 `stop` 한다(잠금이 서버에 묶여 있다). 새 워크트리는 Library가 없어 첫 실행에 임포트 약 100초·빌드 포함 219초·커밋 약 9GB가 든다 — `robocopy ... /E /XJ`로 기존 Library를 복사해 시작한다(PowerShell에서 실행).
- Unity는 항상 batchmode(창 없음). 다른 사람이 띄운 Unity는 건드리지 않는다.

## 안전 규칙 (모든 자동 실행은 이 실행기로만)
**Unity 에디터·플레이어·Playwright 를 직접 실행하지 않는다. 직접 실행하면 사용자 실제 세이브(`LocalLow\ForDearGamers`) 오염, 창·소리, 메모리·크래시 연쇄 위험이 있다(10-28 실제 세이브 덮어쓰기 사고).**
- 세이브 보호: `player` 와 에디터 batch(`run` 서버 없음)·서버 `start` 는 항상 `--unity-qa-sandbox <I:\EXODUSER-Storage\unity-jobs\sandbox\<runId>>` 를 붙인다(런타임 지원은 DT-15). 모든 실행 전후로 `LocalLow\ForDearGamers` 를 스냅샷(경로·크기·수정 시각·SHA256)으로 비교해 바뀐 파일이 있으면 결과를 실패(종료 코드 5)로 판정하고 `USER_SAVE changed=N` 과 파일 목록을 출력하며 `unity-jobs\usersave.log` 에 남긴다. 사용자 파일은 읽기만 한다(수정·복원 안 함). 같은 시각에 사용자가 직접 플레이하면 오탐이 날 수 있다.
- HALT: `I:\EXODUSER-Storage\unity-jobs\HALT` 파일이 있으면 `start`/`run`/`player`/`browser` 는 사유를 출력하고 종료 코드 3 으로 끝난다(`queue`·`status` 에도 표시). Unity 종료 코드가 `0xC0000005`(-1073741819)이거나 로그에 `access violation`·`crash has been intercepted` 가 있으면 1회만 재시도하고, 다시 크래시하면 HALT 를 만든다(시각·원인·로그·크래시 덤프 경로). 서버가 job 도중 크래시하면 `crashes.log` 에 기록하고 60분 안에 2회면 HALT. 해제는 사람(유니티 총괄)이 파일을 지운다.
- `status`: 커밋 사용·한도·여유, Unity 프로세스, 서버 메모리, Library 불완전 경고, 최근 1시간 WHEA-Logger 건수(읽기만)를 출력한다. 실행할 때마다 `unity-jobs\memlog.csv` 에 `time,commitUsedGB,commitLimitGB,commitFreeGB,unity,claude,node` 한 줄이 쌓인다.
- player 는 NativeQaSandbox fail-closed 가 unity/main 에 병합되기 전까지 기본 거부(종료 코드 2), 병합 공지 뒤 `-AllowPlayer` 로만 실행.
- 세이브 스냅샷은 에디터 자체 상태(`Unityocal.*ditor`, Analytics 등)를 제외한다(에디터를 띄우면 항상 바뀌어 오탐).
- 시작 조건(유니티 총괄 승인 10-28, 실측 근거는 `I:\EXODUSER-Storage\devtools\dt01\RESULT.md`): 커밋 여유 에디터 Library 있음 12GB / Library 없음 20GB / 플레이어 10GB, 동시 실행 1(잠금). `status` 가 이 값과 현재 여유를 함께 출력한다. 프로세스 종료 정리는 자손 + 생성 시각이 같은 프로세스만 한다(pid 재사용으로 남의 프로세스를 건드리지 않음).
- 빌드 전 필수 영상: `run -Method PortVerification.Build` 또는 `build -Worktree <wt> -Args '-output,<dir>,-receipt,<file>'`(자동으로 `-buildTarget Win64` 추가) 는 Unity 를 띄우기 전에 `restore-lobby-media.cjs`·`restore-warrior-story.cjs` 를 실행하고, `StreamingAssets\Lobby` 필수 영상 9개(각 1MB 이상, buildloop `smoke-rules.json` 의 `requiredMedia` 가 있으면 그 목록)가 하나라도 없으면 실패한다(종료 코드 6, `필수 영상 누락`).

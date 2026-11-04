# DT-01 Unity 작업 서버 + PC 순번 큐

## 브리프에 그대로 붙일 짧은 예시 (Codex·다른 세션)
```powershell
$x = 'I:\EXODUSER-Storage\unity-jobs\bin\exo-unity.ps1'; $wt = '<내 워크트리 경로>'   # 총괄 병합·install-bin 뒤 레인은 이 공용 설치본을 부른다. 창 0 · 소리 0 · 세이브 격리
& $x run    -Worktree $wt -Method <클래스.메서드> -Args '-a,1,-b,2'                         # 에디터 job
& $x build  -Worktree $wt -Args '-output,<dir>,-receipt,<json>'                              # 빌드(PortVerification.Build)
& $x player -Worktree $wt -Exe <exe> -Args '--unity-m1-check,-output,<dir>'                  # 플레이어(숨은 데스크톱 기본)
& $x status                                                                                  # 잠금·예약·메모리·서버 상태
```

## Codex 실행(exo-codex.ps1)

여러 총괄이 PC의 Codex CLI 0.165를 쓸 때 워크트리·메모리·HALT·동시 실행을 확인하고 실행 기록을 I: 보관소에 남긴다. `codex exec`의 stdin은 빈 파일로 닫는다. 긴 브리프는 `prompt.md`에 복사하고 CLI에는 그 파일을 읽으라는 짧은 인수만 전달한다.

```powershell
$wt = 'G:\exoduser-wt\<작업 워크트리>'
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

`scan`은 Git에 등록된 워크트리와 E:/G:의 작업 폴더를 대조해 JSON·Markdown 보고서를 만든다. Git 미등록 폴더와 링크인 루트는 `keep`으로 기록하고 내부를 순회하지 않는다(크기 미측정). 접근 불가한 사용자 전역 ignore 파일 때문에 조회가 실패하지 않도록 Git 호출에서 그 ignore 파일만 비활성화한다. 그 결과 새로 드러난 미추적 파일은 보수적으로 `keep`으로 판정한다. 후보는 **① Git 변경·미추적·재생성 불가 무시 파일 없음, ② HEAD와 로컬 브랜치의 모든 커밋이 원격에 보존됨, ③ 지정 시간 동안 파일 변경 없음, ④ 프로세스·Unity/Codex 잠금·예약에서 사용 중이지 않음, ⑤ 보호 목록·활성 세션·사용자 체크아웃이 아님**을 모두 만족해야 한다. 하나라도 어긋나거나 검사가 실패하면 `keep`이다. 캐시는 Unity Library/Temp/Logs/obj/UserSettings, node_modules, 빌드 출력, `.vs`, 생성된 csproj/sln으로 한정한다.

링크(junction·symlink)는 대상과 함께 보고한다. 허용 루트는 `E:\exoduser-wt`·`G:\exoduser-wt` 두 곳이다. 사람이 `apply`할 때는 후보를 다시 검사한 다음 **링크 자체만 먼저 제거 → 링크 0개 재확인 → force 없는 `git worktree remove`** 순서로 처리한다. 제거 실패가 무시된 캐시 파일 때문이라고 확인된 경우에만 링크 없는 캐시를 정리해 한 번 재시도한다. 다른 실패는 건너뛰고 로그에 남긴다. 공통 규칙에 따라 `git worktree prune`은 실행하지 않는다. `apply`는 자동 세션에서 실행하지 않는다.

```powershell
$clean = Join-Path $wt 'unity\Tools\devtools\exo-worktree-clean.ps1'
& $clean scan -Root 'E:\exoduser-wt','G:\exoduser-wt' -RepoRoot 'G:\exoduser' -IdleHours 2 -ActiveJson 'I:\EXODUSER-Storage\worktree-clean\active.json'
# I:\EXODUSER-Storage\worktree-clean\scan-<시각>.json/.md를 사람이 검토한다.
& $clean apply -Plan 'I:\EXODUSER-Storage\worktree-clean\scan-<시각>.json' -Confirm '<보고서의 6자리 코드>' -WhatIf
# 실제 정리가 필요할 때 사람이 직접 -WhatIf 없이 같은 명령을 실행한다.
```

**각 총괄은 자기 브랜치가 병합되면 자기 워크트리를 scan으로 확인한 뒤 정리 요청한다.** 새 Unity 워크트리는 NTFS `G:\exoduser-wt\`에 `unity docs/engine tools` sparse로 만든다(브리프 기준 약 3GB, 전체 약 18GB; Library 별도). Library는 Unity가 쉴 때 PowerShell robocopy `/E /XJ /MT:8`로 복사하거나 새 임포트한다. 보고서 기본 위치는 `I:\EXODUSER-Storage\worktree-clean\`이다.

Unity를 작업마다 새로 띄우면 고정 비용(라이선스·첫 Refresh·엔진 초기화/종료)이 9~10초씩 든다.
작업 서버는 워크트리당 Unity 1개를 batchmode로 계속 띄워 두고, 작업을 파일로 받아 실행한다. 컴파일 오류는 Unity를 다시 띄우지 않고 결과 json에 바로 담긴다.

## 구성
- 에디터: `unity/Assets/Exoduser/Editor/DevTools/JobServer/` (`ExoJobServer` — `-exoJobServer <queueDir>`가 있을 때만 켜짐, `ExoArgs.Get()` — 명령줄 대체)
- CLI: `unity/Tools/devtools/exo-unity.ps1` (PowerShell 5.1)
- 큐 폴더: `I:\EXODUSER-Storage\unity-jobs\<워크트리 폴더명>\` (`inbox` `running` `done` `logs` `server.json`)
- Editor 잠금: `I:\EXODUSER-Storage\unity-jobs\_pc_lock.json` (Unity.exe 1개)
- Player 슬롯: 같은 폴더의 `_player_slot_1.json`·`_player_slot_2.json` (Editor와 독립)
- 순번 예약: `I:\EXODUSER-Storage\unity-jobs\queue\` (`kind=editor|player`, 없는 구예약은 editor)

## 명령
```powershell
$x = 'E:\exoduser-wt\pc-unity-devtools-runner\unity\Tools\devtools\exo-unity.ps1'
$wt = 'E:\exoduser-wt\<내 워크트리>'

& $x start  -Worktree $wt                       # 서버 기동(잠금·Unity 0개·최소 커밋 여유 6GB, 권장 12GB/Library 없으면 20GB는 경고만)
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
& $x reserve   -Owner unity-m1-sonnet -Kind player -Note "m1-check 다음" [-TtlMin 120]   # 같은 Owner·Kind 갱신
& $x queue                                                                    # 잠금 보유자 + 예약 순서
& $x unreserve -Owner unity-m1-sonnet -Kind player
& $x start -Worktree $wt -Owner unity-m1-sonnet                               # 맨 앞 예약자만 진행(획득하면 예약 소멸)
```
각 종류의 예약 선두 Owner만 통과한다. `-Kind` 기본은 editor이며 TTL(기본 120분)이 지난 예약은 읽기에서 제외하고 타 담당 파일을 삭제하지 않는다. Player의 실행 중 예약은 대기 FIFO에서 제외하므로 두 번째 Player도 통과한다.
다른 세션이 손으로 만든 잠금(pid 없음)은 보유 중으로 보고 기다린다(60분 지나고 Unity 0개일 때만 stale).
`-Takeover`: 다른 워크트리 서버가 잠금을 쥐고 idle 300초 이상이면 stop 요청 후 넘겨받는다. 기본은 대기(최대 `-WaitMin` 40분, `-PollSec` 30초 간격).

## 공용 실행기: 다른 세션은 이 실행기로만 Unity·브라우저를 띄운다 (창·소리 없음)
```powershell
& $x player  -Exe I:\EXODUSER-Storage\unity-latest\build\EXODUSER-Unity.exe -Args '--unity-m1-check,...' [-TimeoutSec 600] [-KillAfterSec 25]
& $x browser -Script C:\...\check.mjs [-Args ...] [-TimeoutSec 600]
& $x nw      -Exe ...                      # 항상 거부(창 없는 방식이 없음)
```
- `player`: 기본 `-Desktop hidden` — 보이지 않는 별도 Windows 데스크톱(`CreateDesktop` + `STARTUPINFO.lpDesktop`)에서 batchmode 없이 띄운다(GPU·OnGUI·HUD 캡처 가능, 사용자 화면에 창 0). 끝나면 데스크톱 핸들을 닫고 사용자 데스크톱의 `MainWindowHandle ≠ 0` 이 0건인지 검사한다(있으면 실패, 종료 코드 4). `-Desktop batch` 는 `-batchmode` 로 띄운다(사용자 데스크톱에서는 batchmode 가 아닌 플레이어를 계속 거부: `-popupwindow`·`-screen-fullscreen` 거부). hidden 은 기본 `-screen-width 1600 -screen-height 900 -screen-fullscreen 0` 을 붙이고, 자체 종료하지 않는 점검(예: `--unity-hud-smoke` 는 batchmode 또는 --unity-mute에서 종료)은 `-KillAfterSec` 로 끝낸다. 두 모드 모두 `--unity-mute`·`--unity-qa-sandbox`·USER_SAVE 비교는 그대로. 로그 `_exec\logs\player-<id>.log` 에서 `Renderer:` 줄로 그래픽 장치 이름을 뽑아 결과에 넣고, `Forcing GfxDevice: Null` 이면 실패. P/Invoke 는 공용 모듈 `HiddenDesktop.psm1`(DT-15 `buildloop\desktop-probe.ps1` 과 공용).
- `browser`: node 를 `exo-pw-guard.cjs` 와 함께 띄운다. 가드가 Playwright `launch`/`launchPersistentContext` 에 `headless:true` + 크로미움 `--mute-audio` 를 강제하고, `headless:false`/`--headed` 는 스크립트 문구와 실행 중 호출 모두 거부한다. playwright 는 `-NodeModules`(기본 `G:\exoduser\node_modules`)에서 찾는다. 자체 점검: `selftest\pw-smoke.mjs`.
- 거부(종료 코드 2, 사유 출력): `-popupwindow`, `-screen-fullscreen`, `-nographics`, Playwright `headless:false`/`--headed`, nw.js.
- 실행 뒤 검사: 띄운 프로세스 트리와 실행 중 새로 생긴 `EXODUSER-Unity/Unity/nw` 프로세스 중 `MainWindowHandle ≠ 0` 이면 실패(종료 코드 4). 새로 생긴 `chrome/msedge` 는 우리 명령줄과 겹칠 때만 위반으로 보고, 아니면 경고만 한다(사용자가 같은 시각에 연 브라우저일 수 있음). 끝난 뒤 트리 프로세스가 사라졌는지 확인하고 남은 것은 정리해 결과에 적는다. 결과 json: `_exec\done\<id>.json`.
- `player`는 `_pc_lock`을 잡지 않고 전용 슬롯 2개·player FIFO·최소 커밋 여유 10GB를 검사한다. `-Owner`가 있으면 player 예약을 자동 생성하고 종료/대기 실패 시 반환한다(`-KeepReservation`이면 유지). `browser`는 잠금을 쓰지 않는다.
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
- player 는 NativeQaSandbox fail-closed 가 unity/main 에 병합된 뒤(37f1360df)부터 기본 허용한다(`-AllowPlayer` 는 호환용으로만 남김).
- 세이브 스냅샷은 에디터 자체 상태(`Unityocal.*ditor`, Analytics 등)를 제외한다(에디터를 띄우면 항상 바뀌어 오탐).
- 시작 조건(slots1): Editor 최소 6GB(buildloop 8GB), 다른 Unity.exe 0개. Player는 Editor와 독립 2개·최소 10GB. 권장 Editor Library 있음 12GB / 없음 20GB는 경고만. 사용자 직접 실행 Player는 상한에서 제외한다. 프로세스 종료 정리는 자기 자손 + 동일 생성 시각만 처리한다.
- 빌드 전 필수 영상: `run -Method PortVerification.Build` 또는 `build -Worktree <wt> -Args '-output,<dir>,-receipt,<file>'`(자동으로 `-buildTarget Win64` 추가) 는 Unity 를 띄우기 전에 `restore-lobby-media.cjs`·`restore-warrior-story.cjs` 를 실행하고, `StreamingAssets\Lobby` 필수 영상 9개(각 1MB 이상, buildloop `smoke-rules.json` 의 `requiredMedia` 가 있으면 그 목록)가 하나라도 없으면 실패한다(종료 코드 6, `필수 영상 누락`).
- 인자 해석 점검: `-DryRun` 은 잠금·Unity·영상 복원 없이 해석된 method/args 만 출력하고 끝난다. 단위 시험: `powershell -File unity\Tools\devtools\selftest\args-test.ps1` (run·player·build × 쉼표/배열/-ArgsJson/-File 14건). `build` 는 인자를 먼저 쪼갠 뒤 `-buildTarget Win64` 를 붙인다(쉼표 형식 `-Args '-output,X,-receipt,Y'` 지원).

## 2026-10-31 예약과 batch 티켓 우선순위

editor 예약이 있으면 선두 Owner만 batch 티켓 대기를 통과하고, 없으면 살아 있는 티켓 FIFO를 따른다. Acquire-Slot은 Editor 잠금·Unity.exe·메모리·editor 예약을 다시 검사한다. 뒤 예약의 이른 티켓이 앞 예약의 새 batch를 막던 교착을 해소한다. QueueTurn.psm1 회귀는 selftest/ticket-order-test.ps1 15개다. 사용자 세이브·HALT·무창·미디어 보호는 유지한다.

예약 순번 전 batch 티켓을 먼저 만들면 구버전 FIFO 실행기의 선두를 막을 수 있으므로, 같은 Test-ExoTicketTurn 판정을 티켓 생성 전에도 적용한다. 이 단계는 예약 읽기만 하며 Lock/Unity/타인 티켓 변경0. WaitMin/PollSec 제한을 사용하고 실제 시작에는 원래 Acquire-Slot의 예약·단일잠금·실제프로세스·메모리 검사를 다시 통과해야 한다.


### 2026-10-31 Editor 그래픽 API 선택

`exo-unity.ps1 start -Worktree <자기 체크아웃> -Owner <자기 예약> -ForceD3D11`은 공식 Editor 시작에만 `-force-d3d11`을 추가한다. 생략하면 기존 프로젝트 기본 API를 유지한다. `start -DryRun`으로 실제 Unity/슬롯 획득 없이 선택 그래픽 인수만 확인할 수 있다. 기존 Acquire-Slot·예약 순서·숨김 실행·격리 세이브는 동일하다. Player는 기존 `-Args`로 `-force-d3d11`을 전달한다. 이 옵션 검증은 D3D12 장치 제거 자체의 원인 해결이나 D3D11 실실행 성공을 뜻하지 않는다.

## 레인 브리프용 Codex 실행 3줄

~~~powershell
$wt = 'G:\exoduser-wt\<내 sparse 작업본>'; $codex = Join-Path $wt 'unity\Tools\devtools\exo-codex.ps1'
& $codex run -Worktree $wt -Brief 'I:\EXODUSER-Storage\<레인>\brief.md' -Name 'lane-fix' -Owner '<담당>'
& $codex status -Last 3
~~~

Codex CLI 실행은 위 래퍼를 사용한다. 새 작업본 sparse 명령은 git sparse-checkout set unity docs/engine tools이다. 자기 브랜치 병합 후 exo-worktree-clean.ps1 scan 결과로 정리 요청하며, 삭제 apply는 사람이 직접 실행한다. 시험 생성 파일 selftest/codex-e2e.txt는 커밋하지 않는다.

## 자동 빌드 감시 켜기·끄기 (unity/main 병합 뒤 총괄 실행)

~~~powershell
# 통합된 깨끗한 소유 NTFS checkout에서 설치. lane branch/미병합 source는 거부한다.
& .\unity\Tools\devtools\buildloop\buildloop.ps1 install -Worktree '<통합 checkout>'
$task = 'I:\EXODUSER-Storage\unity-latest\loop\bin\install-task.ps1'
& $task -WhatIf       # 사용자 Limited/Interactive, 20분, 무창·NonInteractive 계획
& $task               # 켜기: 이번 작업에서는 실행하지 않음
& $task -Status       # 상태
& $task -Remove       # 끄기(등록 해제)
~~~

스모크 기본은 숨은 데스크톱 -Mode desktop이다. 교체 대상은 I:\EXODUSER-Storage\unity-latest\build 하나이며, 이전 것은 build_prev_<sha>_<시각>으로 보관한다. 바탕화면 .lnk와 인자 -force-d3d11 --remodel3d는 수정하지 않는다. 실행 중인 사용자의 build는 다음 회차로 미룬다. 세부 계약·영수증은 [buildloop README](buildloop/README.md)를 따른다.

## 2026-11-02 fix2 — idle 서버 양보와 순번 대기

| 항목 | 계약 |
|---|---|
| start -IdleYieldSec | 기본 180초(1..86400). 실제 job·컴파일·임포트가 끝난 연속 idle 시간 기준 |
| 양보 조건 | 다른 owner의 유효 editor 예약 또는 생존 editor 티켓 1건 이상 + idle 기준. kind 없음=editor, player·자기 owner·만료·죽은 티켓 제외. inbox job 우선 |
| 정상 종료 | 서버가 자기 PID·lock token을 확인하고 stop과 같은 EditorApplication.Exit(0) 경로로 종료. 타 서버 kill/stop 없음. PID가 살아 있는 동안 PC 잠금을 유지하고 다음 획득자가 종료 확인 뒤 stale 잠금을 회수 |
| 제출 경합 | admission.lock 안에서 제출/양보 marker를 직렬화. 양보 중이면 기존 run의 예약/FIFO + 1회 batch 경로 사용. 서버 자동 재시작 없음 |
| 관측 | unity-jobs/yield.log에 사건당 한 줄(UTC·owner·pid·idleSec·waiting). server.json의 idleYieldSec·waitingOthers·owner 및 status의 idle N초, 대기 M건 → 양보 예정 |
| 적용 | 병합 후 새로 뜨는 서버부터. 구버전 상주 서버는 조작하지 않고 미적용 표시 |
| buildloop | 빌드 전 reserve -Kind editor, 스모크 전 -Kind player -Owner buildloop. WaitMin 기본60분. 예약/Editor잠금/Player슬롯/티켓 시간초과는 WAIT, 실패0·lastAttemptSha 보존·회색 배지 |
| 사전 검사 | buildloop/compile-check.ps1: asmdef·이름/GUID asmref 경계별 수집, 어셈블리 참조 순서, Player/Editor 정의별 별도 출력. Library/Bee RSP는 참조용 읽기만. 결과는 참고용, 최종은 Unity 컴파일 |

Unity 없는 시험: selftest/idle-yield-test.ps1, windows-env-test.ps1, exit-code-test.ps1, shared-log-test.ps1, zombie-guard-test.ps1, user-game-test.ps1, exclusive-test.ps1, buildloop-wait-test.ps1, assembly-sources-test.cjs. 사전 검사 출력은 -Output I:/EXODUSER-Storage/...로 지정하며 기본값도 I:다.

## slots1 — Editor 1개 / Player 2개 (2026-11-03)

| 항목 | 계약 |
|---|---|
| 버전 | `$ExoUnityVersion='2026.11.04-exclusive'`, status 첫 줄·JSON runnerVersion·슬롯 JSON |
| Player 상한 | `$MaxPlayerSlots=2`. CreateNew 원자 획득, 슬롯 보유자 + 살아 있는 구버전 owner=devtools-player의 _pc_lock을 1개로 계산. 사용자 직접 연 Player는 제외 |
| 시작 경합 | _player_admission.guard의 파일 핸들로 새 실행기의 슬롯 획득→실제 자식 생성까지만 직렬화. 생성 뒤 즉시 반환해 두 Player는 병렬 실행. _pc_lock은 잡지 않음 |
| stale | pid 사망 또는 프로세스 생성 시각 > startedAt이면 동일 token·pid·startedAt 재확인 후 회수. 해제는 자기 pid+token만 |
| FIFO | reserve/unreserve -Kind editor 또는 player(기본 editor). Player -Owner는 자동 예약·완료 후 반환, -KeepReservation은 유지. 실행 중 Player 예약은 대기 FIFO 제외 |
| 대기 pid (slots3) | player 명령이 슬롯을 기다리기 시작하면 자기 player 예약에 waitPid·waitSince를 쓴다. player FIFO는 그 pid가 살아 있는(생성 시각 ≤ waitSince) 예약만 센다. waitPid 없는 '예약만'·죽은/재사용 pid 예약은 건너뛴다(파일은 지우지 않음). 갱신(reserve)은 waitPid를 보존. status는 대기 중(pid 살아 있음)/예약만/대기 pid 종료/실행 중(슬롯) 표시, JSON waiterState |
| PC Player 거부 (11-03) | `player`는 `-PcException`(buildloop·cto-swap·candidate)이 없으면 거부("Mac에서 실행" 안내, exit 2). CLAUDE.md 3.4 예외만 허용. BuildLoop 스모크·UI 겹침 check.ps1은 buildloop로 넘긴다. editor batchmode 컴파일·임포트는 그대로 |
| 무음 (11-03) | `--unity-mute`는 게임 쪽 `NativeMuteGuard`가 모든 모드에서 적용한다. 시작 즉시와 매 프레임 끝에 AudioListener.volume=0, Direct 영상 소리는 트랙별 mute. 예전에는 M1 스모크와 캡처별 EarlyMute만 따라서 UI 겹침 검사에서 로비 음악·영상 소리가 났다. Unity Player에는 -nosound 인자가 없어 쓰지 않는다 |
| Windows 기본 환경 (11-04) | Editor·run 기동 직전 `Repair-WindowsEnv`가 비어 있는 SystemRoot·windir·ComSpec·USERPROFILE·APPDATA·LOCALAPPDATA·ProgramData·ALLUSERSPROFILE·ProgramFiles(·x86·W6432)·CommonProgramFiles·HOMEDRIVE·HOMEPATH·TEMP·TMP를 Windows 알려진 폴더 값으로, `.EXE` 없는 PATHEXT는 Machine 값으로 채우고 Path에 System32가 없으면 앞에 붙인다. 이 프로세스 범위만, 있는 값은 그대로. 채운 이름은 stderr 한 줄. 원인=Codex node_repl이 이 변수들 없이 실행기를 띄워 UnityPackageManager.exe가 IPC를 못 열고 30초 뒤 exit 1(r14 03:56·r15 04:20) |
| 종료 코드 (11-04) | 숨은 데스크톱 Player 종료 코드는 uint32 비트 그대로 부호 있는 Int32로 읽는다(0xFFFFFFFF → -1). 예전 `[int]` 변환은 밖에서 강제 종료된 Player(4294967295)에서 예외를 내 정리·숨은 데스크톱 닫기·영수증을 건너뛰었다(A2R r17 2회). 종료 코드를 못 읽으면 -1과 warnings 한 줄로 기록하고 나머지 단계는 계속한다 |
| Player 로그 공유 읽기 (11-04) | Player 종료 뒤 GPU 이름 확인은 `Read-SharedText`(FileShare.ReadWrite·Delete)로 읽는다. 종료 중 커널 대기에 걸린 Player는 강제 종료 뒤에도 스레드 1개로 남아 -logFile 쓰기 핸들을 쥐고, 예전 ReadAllText는 IOException으로 영수증 전에 끝났다(UI 후보 57be03df·02ef0c30, 2회). 읽기 실패는 warnings, 강제 종료 뒤 3초에도 남은 프로세스는 '커널 대기 의심' warnings로 영수증에 남긴다 |
| 좀비 Player 가드 (11-04) | `player`는 시작 전에 스레드 1개 이하이고 1.5초 동안 CPU 시간이 그대로인 EXODUSER-* 프로세스를 찾는다. 하나라도 있으면 '재부팅 필요' 영수증(_exec/done, rejected)과 HALT를 만들고 exit 2로 거부한다. 실행 뒤 '커널 대기 의심' 프로세스가 남아도 HALT를 만든다. 원인=Quit 뒤 'Input System … Shutdown'에서 커널 드라이버(HID/GPU) 교착, 05:06 뒤 4번 더 띄워 좀비 5개(11-04 07:32 재부팅으로 해소). 해제=재부팅 뒤 HALT 파일 삭제 |
| 사용자 게임 실행 중 미룸 (11-04) | `player`는 시작 전에 부모가 explorer.exe인 EXODUSER* 프로세스(사용자가 바탕화면·바로가기로 띄운 게임)를 찾는다. 있으면 Player를 띄우지 않고 '사용자 게임 실행 중, 미룸' 영수증(ok=False, deferred=user-game)을 _exec/done과 stdout JSON 한 줄로 남기고 exit 3. BuildLoop는 이를 WAIT로 받아 다음 회차에 다시 한다. 세이브 감시는 그대로다. 원인=사용자 게임(PID 35348)이 실제 세이브에 저장해 UI 후보 촬영이 USER_SAVE changed=3으로 실패 |
| BuildLoop Player 단독 실행 (11-04) | `-PcException buildloop` 또는 `-Exclusive` Player는 다른 Player가 모두 끝날 때까지 기다리고(돌고 있는 Player는 끊지 않음), 슬롯을 얻으면 `_player_exclusive.json`을 써서 도는 동안 새 Player를 받지 않는다. 끝나면 표시를 지우고 다른 레인은 다시 동시 2개. FIFO 예약 순서는 그대로라 루프가 맨 앞이면 뒤 Player는 기다린다. 원인=QA Player 여러 개가 4K 로비 영상을 동시에 디코드해 BuildLoop M1 '로비 복귀 영상 준비 12초 초과' 33회·UI 겹침 영상 준비 실패로 바탕화면 교체가 막힘 |
| 굶주림 방지 | editor 선두 등록 후 20분 이상이고 _pc_lock이 비어 있으면 새 Player 통과를 막아 0개까지 배출. status/대기 사유에 owner 표시 |
| idle 양보 | editor 예약·티켓만 계산(kind 없음=editor). player 대기자는 서버 양보를 유발하지 않음 |
| 독립 출력 | Player별 GUID 로그·sandbox, 숨은 데스크톱은 PID+GUID. 사용자 창 0·--unity-mute·USER_SAVE 비교·크래시 HALT·자기 자손 정리 유지 |
| buildloop | 빌드는 editor 예약/8GB, 스모크는 player 예약/10GB·독립 슬롯. Player 슬롯 대기 초과도 WAIT |
| 공용 설치 | 소유 소스의 `exo-unity.ps1 install-bin`이 ps1·psm1·cjs·mjs·json·md를 unity-jobs/bin에 복사. 이전 bin은 bin_prev_<UTC시각>에 보관. 런타임 모듈은 PSScriptRoot, 게임 소스·미디어는 -Worktree로 찾음. 이번 작업은 명령 구현만, 설치 실행 없음 |

레인은 총괄 병합·설치 후 `I:\EXODUSER-Storage\unity-jobs\bin\exo-unity.ps1`을 부르고 `-Worktree`에 자기 NTFS 작업본을 전달한다. 자체 시험은 selftest/player-slots-test.ps1이며 실제 동시 M1 영수증은 I:/EXODUSER-Storage/devtools/fix-1103-slots/REPORT.md다.

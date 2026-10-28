# DT-01 Unity 작업 서버 + PC 순번 큐

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
- `player` 는 Unity 잠금(`_pc_lock.json`)과 예약 큐를 거친다(커밋 여유 8GB). `browser` 는 잠금을 쓰지 않는다.
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

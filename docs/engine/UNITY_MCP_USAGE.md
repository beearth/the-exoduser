# Unity MCP 공용 사용 안내

Coplay MCP 10.3.0(MIT), 고정 Git SHA `aa5fc638d623f56178d50329d9ad8c541a57fe66`. 패키지·Editor Player 제외 필터가 반영된 자기 소유 Unity 작업 폴더에서 사용한다. Unity 프로젝트와 Library·UPM 캐시는 NTFS, 빌드·캡처·로그는 I:다. 패키지 계약은 각 checkout의 `docs/engine/UNITY_MCP_20261030.md`를 읽는다. [실증 보고서](I:/EXODUSER-Storage/demo-art/unity-mcp/REPORT.md), [공통 병합 영수증](I:/EXODUSER-Storage/demo-art/unity-mcp/merge/REPORT.md).

## 자기 작업 폴더와 예약

자기 저장소 내부의 PowerShell에서 아래 변수를 만든다. 특정 담당 이름이나 프로젝트 경로를 재사용하지 않는다. 패키지가 없는 작업 폴더는 자기 WIP를 보존한 정상 merge로 공통 checkpoint를 인수한 뒤 사용한다. 다른 작업 폴더에 강제 pull·패키지 복사를 하지 않는다.

```powershell
$wt = (& git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0) { throw '자기 저장소 내부에서 실행해야 합니다.' }
$x = Join-Path $wt 'unity/Tools/devtools/exo-unity.ps1'
$owner = 'mcp-' + (Split-Path $wt -Leaf)
$out = Join-Path 'I:/EXODUSER-Storage/unity-mcp' (Split-Path $wt -Leaf)
New-Item -ItemType Directory -Force -Path $out | Out-Null
& $x status -Worktree $wt
& $x queue
& $x reserve -Owner $owner -Worktree $wt -Note 'Unity MCP 장면 편집' -TtlMin 120
```

PC 전체 Unity/Player는 한 개다. status의 실제 worktree·잠금 소유자·예약 앞순서·HALT를 먼저 읽는다. 자기 순번을 기다리며 타인 예약과 프로세스를 해제하지 않는다. 같은 작업자는 같은 Owner로 예약을 갱신하고, 같은 checkout의 기존 writer가 실행 중이면 중복 start하지 않는다. `-Takeover`, 강제 stop·HALT 삭제는 기본 절차가 아니다.

## 시작과 연결

UPM 캐시·DOTNET_CLI_HOME은 이미 승인된 NTFS 경로를 재사용한다. 제한된 자식 환경에서 APPDATA/ComSpec 등이 빠졌던 초기 실패가 있었으므로, 그 경우만 아래처럼 누락된 표준 값을 채운다. 전역 환경·인증·캐시·권한은 변경하지 않는다.

```powershell
if (-not $env:APPDATA) { $env:APPDATA = [Environment]::GetFolderPath('ApplicationData') }
if (-not $env:LOCALAPPDATA) { $env:LOCALAPPDATA = [Environment]::GetFolderPath('LocalApplicationData') }
if (-not $env:USERPROFILE) { $env:USERPROFILE = [Environment]::GetFolderPath('UserProfile') }
if (-not $env:COMSPEC) { $env:COMSPEC = Join-Path $env:SystemRoot 'System32/cmd.exe' }
$env:TEMP = Join-Path $wt '.qa-temp'; $env:TMP = $env:TEMP
New-Item -ItemType Directory -Force -Path $env:TEMP | Out-Null
$env:UNITY_MCP_ALLOW_BATCH = '1'
$env:UNITY_MCP_STATUS_DIR = 'I:/EXODUSER-Storage/demo-art/unity-mcp/status'
$env:UNITY_MCP_DISABLE_TELEMETRY = '1'
$env:UNITY_MCP_TELEMETRY_ENABLED = '0'
& $x start -Worktree $wt -Owner $owner -KeepReservation -WaitMin 40 -PollSec 30
if ($LASTEXITCODE -ne 0) { throw '시작 실패: 로그와 순번을 확인합니다.' }
& $x run -Worktree $wt -Owner $owner -KeepReservation -Method MCPForUnity.Editor.McpCiBoot.StartStdioForCi -NoRefresh -TimeoutSec 120 -Json
if ($LASTEXITCODE -ne 0) { throw 'MCP 연결 부팅 실패: 로그를 확인합니다.' }
```

모든 Unity 기동은 `exo-unity.ps1`를 거친다. 위 start는 batchmode·무음·격리 세이브·PC 잠금을 유지한다. 기존 전용 시험용 start-editor 스크립트를 다른 checkout에서 실행하지 않는다. 같은 실패는 원인 수정 뒤 한 번만 재시도하고, 다시 실패하면 증거를 보존해 제작/실행 방법을 바꾼다. 다른 담당의 실행이 끝나기 전에 새 Unity를 직접 띄우지 않는다.

`codex mcp get unityMCP`로 기존 stdio 등록을 확인한다. 기존 서버 소스는 `G:/exoduser-tools/unity-mcp-v10.3.0/Server`이며 프로젝트 checkout과 별도인 공용 실행 런타임이다. 서버와 Editor의 `UNITY_MCP_STATUS_DIR`가 같아야 한다. 위 경로는 현재 등록에 맞춘 공용 발견 디렉터리이고 소유자/프로젝트 고정값이 아니다. 디렉터리 안 파일명은 프로젝트별 hash로 구분한다. 기존 MCP 설정 원문을 덮어쓰거나 전역 설정을 추가로 바꾸지 않는다.

MCP 도구에서 `mcpforunity://instances`를 읽어 `projectRoot`가 `$wt/unity`인지 확인하고, 그 응답의 hash로 `set_active_instance`를 호출한다. 예전 instance hash를 복사하지 않는다. 도구 목록이 보이지 않을 때만 클라이언트 MCP 연결을 새로고침한다. 새 세션 생성 자체는 Editor 조작 성공 증거가 아니다.

## 장면·조명·배치

- 장면은 `manage_scene`의 `load/get_active/get_hierarchy`로 확인한다. 변경 전 dirty 상태·담당·미저장 변경을 확인한다. 자기 변경만 저장하거나 명시적으로 폐기한다.
- 객체는 `find_gameobjects`로 유일성을 확인하고 `manage_gameobject`의 `create/modify`를 쓴다. 숫자 ID 조회가 실패하면 고유 이름 또는 전체 경로와 `search_method=by_name/by_path`를 쓴다.
- 라이트는 `manage_components(action="set_property", component_type="Light", property="intensity", ...)`, 재질은 `manage_material`로 수정한 뒤 후상태를 다시 읽는다. 공유 원본을 임의로 덮어쓰지 않는다.
- 플레이 모드 전에 `execute_code`로 `AudioListener.volume=0f; AudioListener.pause=true;`를 지정하고 `manage_editor`의 `play/pause/stop`을 쓴다. 격리 세이브와 실제 상태를 확인한다.
- `read_console(action="get", types=["error"], format="detailed", include_stacktrace=true)`의 개수만으로 오류 판정을 하지 않는다. 정상 ExoJobServer 로그가 Exception으로 잘못 분류될 수 있으므로 메시지·스택·실제 Editor 로그를 함께 확인한다.

## 1920×1080 카메라 캡처

batch 기본 출력은 640×480이다. 기존 camera.targetTexture와 aspect를 보존하고, 자기 작업에서 임시 RenderTexture(1920,1080,24)와 aspect=1920f/1080f를 지정한 뒤 `manage_camera(action="screenshot", camera="<실제 카메라 이름>", screenshot_file_name="검수.png", output_folder="McpCaptures")`를 쓴다.

`unity/McpCaptures`는 먼저 자기 I: 출력 폴더로 연결돼 있는지 확인한다. 기존 junction을 덮어쓰거나 링크 대상 원본을 지우지 않는다. 새 연결이 필요하면 자기 checkout에만 `New-Item -ItemType Junction -Path (Join-Path $wt "unity/McpCaptures") -Target (Join-Path $out "captures")`를 사용하되 두 경로의 기존 상태를 먼저 확인한다. PNG 헤더 1920×1080·전체 화면·1x를 직접 본다. 캡처 뒤 기존 targetTexture/aspect를 복원하고 자기가 만든 임시 RT만 Release/DestroyImmediate한다. Screen Space Overlay UI는 카메라 렌더에 빠지므로 HUD/전체 제품 검수와 구분한다.

## 종료와 반환

```powershell
# 먼저 자기 변경 저장/폐기·현재 source·사용자 세이브·원격 복구 SHA를 확인한다.
& $x stop -Worktree $wt
if ($LASTEXITCODE -ne 0) { throw '자기 서버 종료 여부를 확인해야 합니다.' }
& $x unreserve -Owner $owner
& $x status -Worktree $wt
```

서버·예약을 자기 것만 반환하고 잔여 Unity/Player가 없는지 확인한다. 이미 연결돼 있는 공용 stdio 서버 프로세스를 다른 세션 것까지 종료하지 않는다. 패키지/Editor 조작 성공을 아트 PASS로 올리지 않는다.

## Player 제외 검사

공통 소스의 Editor 필터가 upstream Runtime helper를 Player 빌드 어셈블리에서 제외한다. 새 빌드마다 다음 검사와 같은 빌드 M1을 실행한다. 이 검사는 실제 EXE와 DLL을 요구하며 MCP 파일과 모든 DLL의 MCPForUnity 문자열/참조가 하나라도 있으면 실패한다.

```powershell
$check = Join-Path $wt 'unity/Tools/devtools/selftest/check-player-mcp.cjs'
& 'C:/nvm4w/nodejs/node.exe' $check '<검수한 빌드 폴더>' (Join-Path $out 'Player-MCP제외.json')
```

기존 10-30 시험 Player에는 Runtime helper가 포함됐다. 그 빌드를 에디터 전용 PASS 근거로 재사용하지 않는다. 공통 merge는 다른 checkout의 자동 갱신·Mac 검증·기존 사용자 실행본 교체를 뜻하지 않는다.

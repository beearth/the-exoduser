# exo-codex.ps1 - Codex CLI 실행·기록기 (Windows PowerShell 5.1, UTF-8 BOM)
# 명령: run | status | show
param(
    [Parameter(Position = 0)][string]$Command = 'status',
    [string]$Worktree,
    [string]$Brief,
    [string]$Name,
    [string]$Owner = $env:USERNAME,
    [string]$Model,
    [int]$TimeoutMin = 90,
    [switch]$Background,
    [switch]$DryRun,
    [double]$MinCommitFreeGB = 4,
    [int]$Last = 20,
    [string]$Run,
    [string]$InternalRunDir
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false) } catch { }
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$RunRoot = 'I:\EXODUSER-Storage\codex-runs'
$LockRoot = Join-Path $RunRoot '_locks'
$HaltPath = 'I:\EXODUSER-Storage\unity-jobs\HALT'
$MaxConcurrent = 3
$script:ExitCode = 2
$script:OwnLock = $null
$script:LockToken = [Guid]::NewGuid().ToString('N')

function Say([string]$message) { [Console]::Error.WriteLine('[exo-codex] ' + $message) }
function NowIso { [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ss.fffZ') }
function Fail([string]$message, [int]$code) { $script:ExitCode = $code; throw $message }

function Normalize-Path([string]$path) {
    return [IO.Path]::GetFullPath($path).TrimEnd([char[]]@('\', '/'))
}

function Read-Json([string]$path) {
    for ($i = 0; $i -lt 5; $i++) {
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { return $null }
        try {
            $content = [IO.File]::ReadAllText($path)
            if (-not [string]::IsNullOrWhiteSpace($content)) { return ($content | ConvertFrom-Json) }
        } catch { }
        Start-Sleep -Milliseconds 80
    }
    return $null
}

function Write-Json([string]$path, $value) {
    [IO.File]::WriteAllText($path, ($value | ConvertTo-Json -Depth 8), $Utf8NoBom)
}

function Test-Alive($processId) {
    if (-not $processId) { return $false }
    try { return (-not (Get-Process -Id ([int]$processId) -ErrorAction Stop).HasExited) }
    catch { return $false }
}

function Get-CommitFreeGB {
    # exo-unity.ps1과 같은 Win32_OperatingSystem.FreeVirtualMemory 판정(KB → GB).
    try {
        $os = Get-CimInstance Win32_OperatingSystem -ErrorAction Stop
        return [math]::Round(([double]$os.FreeVirtualMemory / 1MB), 2)
    } catch {
        try {
            $limit = (Get-Counter '\Memory\Commit Limit' -ErrorAction Stop).CounterSamples[0].CookedValue
            $used = (Get-Counter '\Memory\Committed Bytes' -ErrorAction Stop).CounterSamples[0].CookedValue
            return [math]::Round((($limit - $used) / 1GB), 2)
        } catch { Fail '커밋 여유를 읽지 못했습니다.' 2 }
    }
}

function Test-Halt {
    if (Test-Path -LiteralPath $HaltPath -PathType Leaf) { Fail "HALT 파일이 있어 실행하지 않습니다: $HaltPath" 3 }
}

function Test-Inputs {
    if ([string]::IsNullOrWhiteSpace($Worktree)) { Fail '-Worktree가 필요합니다.' 2 }
    if ([string]::IsNullOrWhiteSpace($Brief)) { Fail '-Brief가 필요합니다.' 2 }
    if ($Name -cnotmatch '^[a-z0-9-]{1,40}$') { Fail '-Name은 소문자·숫자·하이픈 1~40자여야 합니다.' 2 }
    if ($TimeoutMin -lt 1) { Fail '-TimeoutMin은 1 이상이어야 합니다.' 2 }
    if ($MinCommitFreeGB -lt 0) { Fail '-MinCommitFreeGB는 0 이상이어야 합니다.' 2 }
    if ($Model -and $Model -cnotmatch '^[A-Za-z0-9._:/-]+$') { Fail '-Model 형식이 올바르지 않습니다.' 2 }
    if ([string]::IsNullOrWhiteSpace($Owner)) { $script:Owner = '미지정' }
    else { $script:Owner = $Owner }
    if ($script:Owner -match '["\r\n]') { Fail '-Owner에 따옴표나 줄바꿈을 넣을 수 없습니다.' 2 }

    $requested = Normalize-Path $Worktree
    if ($requested -ieq 'G:\exoduser') { Fail '사용자 메인 체크아웃 G:\exoduser에서는 실행할 수 없습니다.' 2 }
    if ($requested -inotmatch '^[EG]:\\exoduser-wt\\[^\\]+$') { Fail 'E:\exoduser-wt 또는 G:\exoduser-wt 바로 아래 워크트리만 허용합니다.' 2 }
    if (-not (Test-Path -LiteralPath $requested -PathType Container)) { Fail "워크트리가 없습니다: $requested" 2 }
    if (((Get-Item -LiteralPath $requested).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        Fail '연결된 폴더를 워크트리로 사용할 수 없습니다.' 2
    }
    $script:WorktreePath = Normalize-Path (Resolve-Path -LiteralPath $requested).Path
    $gitTop = (& git -C $script:WorktreePath rev-parse --show-toplevel 2>$null)
    if ($LASTEXITCODE -ne 0 -or -not $gitTop -or (Normalize-Path ([string]$gitTop)) -ine $script:WorktreePath) {
        Fail '지정 경로가 Git 워크트리 최상위가 아닙니다.' 2
    }
    if (-not (Test-Path -LiteralPath $Brief -PathType Leaf)) { Fail "브리프 파일이 없습니다: $Brief" 2 }
    $script:BriefPath = (Resolve-Path -LiteralPath $Brief).Path
    if ([string]::IsNullOrWhiteSpace([IO.File]::ReadAllText($script:BriefPath))) { Fail '브리프가 비어 있습니다.' 2 }
    Test-Halt
    $script:FreeGB = Get-CommitFreeGB
    if ($script:FreeGB -lt $MinCommitFreeGB) {
        Fail ("커밋 여유 {0:N2}GB가 최소 {1:N2}GB보다 작습니다." -f $script:FreeGB, $MinCommitFreeGB) 2
    }
}

function Get-RunDirectory {
    if ($InternalRunDir) {
        $path = Normalize-Path $InternalRunDir
        $parent = Normalize-Path (Split-Path $path -Parent)
        if ($parent -ine (Normalize-Path $RunRoot) -or
            (Split-Path $path -Leaf) -cnotmatch ('^\d{8}-\d{6}_' + [regex]::Escape($Name) + '$')) {
            Fail '내부 실행 폴더가 허용 경로 밖입니다.' 2
        }
        return $path
    }
    for ($i = 0; $i -lt 10; $i++) {
        $path = Join-Path $RunRoot ((Get-Date).ToString('yyyyMMdd-HHmmss') + '_' + $Name)
        if (-not (Test-Path -LiteralPath $path)) { return $path }
        Start-Sleep -Seconds 1
    }
    Fail '고유 실행 폴더 이름을 만들지 못했습니다.' 2
}

function Enter-Admission {
    # 슬롯 계산과 잠금 생성을 직렬화한다. 파일은 남아도 핸들이 닫히면 다시 사용된다.
    $path = Join-Path $LockRoot '_admission.guard'
    for ($i = 0; $i -lt 50; $i++) {
        try { return [IO.File]::Open($path, 'OpenOrCreate', 'ReadWrite', 'None') }
        catch [IO.IOException] { Start-Sleep -Milliseconds 100 }
    }
    Fail '동시 실행 슬롯 판정을 위한 보호 잠금을 얻지 못했습니다.' 4
}

function Acquire-Lock([string]$runDir, [string]$startedAt) {
    [IO.Directory]::CreateDirectory($LockRoot) | Out-Null
    $gate = Enter-Admission
    try {
        $path = Join-Path $LockRoot ((Split-Path $script:WorktreePath -Leaf) + '.json')
        if (Test-Path -LiteralPath $path -PathType Leaf) {
            $previous = Read-Json $path
            if ($null -eq $previous -or -not $previous.PSObject.Properties['pid'] -or (Test-Alive $previous.pid)) {
                Fail "워크트리 잠금이 사용 중입니다: $path" 4
            }
            Remove-Item -LiteralPath $path -Force
            Say "종료된 pid의 잠금을 정리했습니다: $path"
        }
        $record = [ordered]@{
            owner = $script:Owner; pid = $PID; worktree = $script:WorktreePath
            name = $Name; startedAt = $startedAt; runDir = $runDir; token = $script:LockToken
        }
        try { $stream = [IO.File]::Open($path, 'CreateNew', 'Write', 'Read') }
        catch [IO.IOException] { Fail "워크트리 잠금 생성에 실패했습니다: $path" 4 }
        try {
            $bytes = $Utf8NoBom.GetBytes(($record | ConvertTo-Json -Depth 4))
            $stream.Write($bytes, 0, $bytes.Length)
        } finally { $stream.Dispose() }
        $script:OwnLock = $path
        $alive = 0
        foreach ($file in @(Get-ChildItem -LiteralPath $LockRoot -Filter '*.json' -File)) {
            $item = Read-Json $file.FullName
            if ($null -eq $item -or -not $item.PSObject.Properties['pid'] -or (Test-Alive $item.pid)) { $alive++ }
        }
        if ($alive -gt $MaxConcurrent) { Fail "동시 실행 상한 $MaxConcurrent 건에 도달했습니다." 4 }
    } finally { $gate.Dispose() }
}

function Release-Lock {
    if (-not $script:OwnLock) { return }
    $record = Read-Json $script:OwnLock
    if ($record -and $record.PSObject.Properties['owner'] -and $record.PSObject.Properties['pid'] -and
        $record.PSObject.Properties['token'] -and $record.owner -eq $script:Owner -and
        [int]$record.pid -eq $PID -and $record.token -eq $script:LockToken) {
        Remove-Item -LiteralPath $script:OwnLock -Force
    }
    $script:OwnLock = $null
}

function Write-Prompt([string]$runDir) {
    Copy-Item -LiteralPath $script:BriefPath -Destination (Join-Path $runDir 'brief.md')
    $original = [IO.File]::ReadAllText($script:BriefPath)
    $rules = @'


## 표준 실행 규칙
- 이 워크트리 밖 파일을 쓰거나 삭제하지 마세요. git commit, git push, git add -A, git reset, git clean, git checkout --, 브랜치 전환을 금지합니다. 파일을 영구 삭제하거나 유료 API를 호출하지 마세요.
- Unity 실행이 필요하면 unity/Tools/devtools/exo-unity.ps1만 사용하세요. 창 0·소리 0·세이브 격리를 지키고 Unity.exe 또는 플레이어를 직접 실행하지 마세요.
- 브라우저는 headless와 --mute-audio를 함께 쓸 때만 실행하고 창을 띄우지 마세요.
- stdin을 기다리는 명령을 실행하지 마세요. 큰 산출물은 I:\EXODUSER-Storage\ 아래에 두세요.
- 다른 세션 파일을 건드리지 마세요. 이 워크트리의 game.html은 수정하지 마세요.
- 마지막 메시지에 변경 파일 목록, 검증 방법, 남은 문제를 한국어로 요약하세요.
'@
    [IO.File]::WriteAllText((Join-Path $runDir 'prompt.md'), ($original + $rules), $Utf8NoBom)
}

function Get-GitText([string[]]$arguments) {
    $lines = @(& git -C $script:WorktreePath @arguments 2>$null)
    if ($LASTEXITCODE -ne 0) { throw ('Git 명령 실패: ' + ($arguments -join ' ') + ' ' + ($lines -join ' ')) }
    return (($lines -join "`r`n") + "`r`n")
}

function Write-DiffArtifacts([string]$runDir) {
    $patchPath = Join-Path $runDir 'diff.patch'
    & git -C $script:WorktreePath diff ('--output=' + $patchPath) 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'Git diff.patch 작성에 실패했습니다.' }
    [IO.File]::WriteAllText((Join-Path $runDir 'status.txt'), (Get-GitText -arguments @('status', '--porcelain=v1', '-uall')), $Utf8NoBom)
    $stat = Get-GitText -arguments @('diff', '--stat')
    $newFiles = Get-GitText -arguments @('ls-files', '--others', '--exclude-standard')
    [IO.File]::WriteAllText((Join-Path $runDir 'diffstat.txt'), ($stat + "`r`n새 파일:`r`n" + $newFiles), $Utf8NoBom)
}

function Stop-OwnedProcessTree([int]$rootId, [datetime]$startedUtc) {
    # 부모 연결과 생성 시각을 모두 확인한 자손만 종료한다.
    $all = @(Get-CimInstance Win32_Process -ErrorAction Stop)
    $owned = @($rootId)
    $depth = @{}
    $depth[$rootId] = 0
    for ($level = 1; $level -lt 30; $level++) {
        $found = @($all | Where-Object {
            ($owned -contains [int]$_.ParentProcessId) -and
            ([datetime]$_.CreationDate).ToUniversalTime() -ge $startedUtc -and
            ($owned -notcontains [int]$_.ProcessId)
        })
        if ($found.Count -eq 0) { break }
        foreach ($item in $found) { $owned += [int]$item.ProcessId; $depth[[int]$item.ProcessId] = $level }
    }
    foreach ($id in @($owned | Sort-Object { $depth[[int]$_] } -Descending)) {
        $item = $all | Where-Object { [int]$_.ProcessId -eq [int]$id } | Select-Object -First 1
        if ($null -eq $item -or ([datetime]$item.CreationDate).ToUniversalTime() -lt $startedUtc) { continue }
        try { Stop-Process -Id ([int]$id) -Force -ErrorAction Stop } catch { Say "프로세스 $id 종료 실패: $_" }
    }
}

function Merge-Logs([string]$runDir) {
    $out = Join-Path $runDir 'stdout.tmp'
    $err = Join-Path $runDir 'stderr.tmp'
    $log = Join-Path $runDir 'codex.log'
    $writer = [IO.File]::Open($log, 'Create', 'Write', 'Read')
    try {
        foreach ($path in @($out, $err)) {
            if (-not (Test-Path -LiteralPath $path)) { continue }
            $reader = [IO.File]::Open($path, 'Open', 'Read', 'ReadWrite')
            try { $reader.CopyTo($writer) } finally { $reader.Dispose() }
        }
    } finally { $writer.Dispose() }
    foreach ($path in @($out, $err, (Join-Path $runDir 'stdin-empty.tmp'))) {
        if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Force }
    }
}

function Get-CodexArguments([string]$runDir) {
    $promptPath = Join-Path $runDir 'prompt.md'
    $resultPath = Join-Path $runDir 'result.md'
    # CLI 도움말의 [PROMPT] 인수 사용. 전체 브리프는 파일에 두어 32K 명령줄 제한을 피한다.
    $shortPrompt = '먼저 이 파일을 읽고 그 내용과 끝의 표준 실행 규칙을 그대로 수행하세요: ' + $promptPath
    $arguments = 'exec -C "{0}" -s workspace-write -c notify=[] -o "{1}"' -f $script:WorktreePath, $resultPath
    if ($Model) { $arguments += ' --model "' + $Model + '"' }
    $arguments += ' "' + $shortPrompt + '"'
    return $arguments
}

function Invoke-Codex([string]$runDir, [datetime]$startedUtc) {
    $command = Get-Command 'codex.cmd' -ErrorAction SilentlyContinue
    if (-not $command) { Fail 'codex.cmd를 찾지 못했습니다.' 1 }
    $empty = Join-Path $runDir 'stdin-empty.tmp'
    [IO.File]::WriteAllText($empty, '', $Utf8NoBom)
    $arguments = Get-CodexArguments $runDir
    $process = Start-Process -FilePath $command.Source -ArgumentList $arguments -PassThru -WindowStyle Hidden `
        -RedirectStandardInput $empty -RedirectStandardOutput (Join-Path $runDir 'stdout.tmp') `
        -RedirectStandardError (Join-Path $runDir 'stderr.tmp')
    $null = $process.Handle
    $timedOut = $false
    try {
        while (-not $process.WaitForExit(1000)) {
            if (([DateTime]::UtcNow - $startedUtc).TotalMinutes -ge $TimeoutMin) {
                $timedOut = $true
                try { Stop-OwnedProcessTree $process.Id $startedUtc }
                catch { Say "자기 프로세스 트리 확인 실패: $_"; try { $process.Kill() } catch { } }
                break
            }
        }
        if ($timedOut) { try { $process.WaitForExit(10000) | Out-Null } catch { } }
        $process.Refresh()
        $code = 1
        if ($process.HasExited) { $code = $process.ExitCode }
        return [pscustomobject]@{ exitCode = $code; timedOut = $timedOut }
    } finally { Merge-Logs $runDir; $process.Dispose() }
}

function Cmd-Run {
    Test-Inputs
    $runDir = Get-RunDirectory
    if ($Background -and -not $InternalRunDir) {
        try { Acquire-Lock $runDir (NowIso) } finally { Release-Lock }
        $script:ExitCode = 1
        [IO.Directory]::CreateDirectory($runDir) | Out-Null
        $shell = Join-Path $PSHOME 'powershell.exe'
        $arguments = @('-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', ('"' + $PSCommandPath + '"'),
            'run', '-Worktree', ('"' + $script:WorktreePath + '"'), '-Brief', ('"' + $script:BriefPath + '"'),
            '-Name', $Name, '-Owner', ('"' + $script:Owner + '"'), '-TimeoutMin', $TimeoutMin,
            '-MinCommitFreeGB', $MinCommitFreeGB, '-InternalRunDir', ('"' + $runDir + '"'))
        if ($Model) { $arguments += @('-Model', ('"' + $Model + '"')) }
        if ($DryRun) { $arguments += '-DryRun' }
        $empty = Join-Path $runDir 'background-stdin.tmp'
        [IO.File]::WriteAllText($empty, '', $Utf8NoBom)
        Start-Process -FilePath $shell -ArgumentList $arguments -WindowStyle Hidden `
            -RedirectStandardInput $empty -RedirectStandardOutput (Join-Path $runDir 'background-out.tmp') `
            -RedirectStandardError (Join-Path $runDir 'background-err.tmp') | Out-Null
        Write-Host $runDir
        return 0
    }

    $startedUtc = [DateTime]::UtcNow
    $startedAt = NowIso
    $meta = $null
    try {
        Acquire-Lock $runDir $startedAt
        $script:ExitCode = 1
        Test-Halt
        [IO.Directory]::CreateDirectory($runDir) | Out-Null
        Write-Prompt $runDir
        $branch = (Get-GitText -arguments @('branch', '--show-current')).Trim()
        $headBefore = (Get-GitText -arguments @('rev-parse', 'HEAD')).Trim()
        $version = (& codex.cmd --version 2>&1 | Out-String).Trim()
        if ($LASTEXITCODE -ne 0) { $version = '조회 실패' }
        $commandLine = 'codex ' + (Get-CodexArguments $runDir)
        $meta = [ordered]@{
            owner = $script:Owner; name = $Name; worktree = $script:WorktreePath
            branch = $branch; headBefore = $headBefore; headAfter = $headBefore
            startedAt = $startedAt; endedAt = $null; durationSec = 0
            exitCode = $null; timedOut = $false; commitFreeGBBefore = $script:FreeGB
            commandLine = $commandLine; codexVersion = $version
            dryRun = [bool]$DryRun
        }
        Write-Json (Join-Path $runDir 'meta.json') $meta
        if ($DryRun) {
            $meta.endedAt = NowIso
            $meta.durationSec = [math]::Round(([DateTime]::UtcNow - $startedUtc).TotalSeconds, 1)
            $meta.exitCode = 0
            Write-Json (Join-Path $runDir 'meta.json') $meta
            Say 'DryRun: Codex를 실행하지 않았습니다.'
            Write-Host $runDir
            return 0
        }
        $result = Invoke-Codex $runDir $startedUtc
        $meta.timedOut = [bool]$result.timedOut
        $meta.headAfter = (Get-GitText -arguments @('rev-parse', 'HEAD')).Trim()
        Write-DiffArtifacts $runDir
        $code = 0
        if ($result.exitCode -ne 0) { $code = 1 }
        if ($result.timedOut) { $code = 6 }
        if ($meta.headAfter -ne $headBefore) { Say 'Codex가 커밋함 — 규칙 위반'; $code = 5 }
        $meta.exitCode = $code
        Write-Host $runDir
        return $code
    } finally {
        if ($meta -and -not $DryRun) {
            try {
                $meta.headAfter = (Get-GitText -arguments @('rev-parse', 'HEAD')).Trim()
                if ($meta.headAfter -ne $meta.headBefore) {
                    Say 'Codex가 커밋함 — 규칙 위반'
                    $meta.exitCode = 5
                    $script:ExitCode = 5
                }
            } catch { Say "최종 HEAD 확인 실패: $_" }
            if (-not (Test-Path -LiteralPath (Join-Path $runDir 'status.txt'))) {
                try { Write-DiffArtifacts $runDir } catch { Say "변경 근거 수집 실패: $_" }
            }
            $meta.endedAt = NowIso
            $meta.durationSec = [math]::Round(([DateTime]::UtcNow - $startedUtc).TotalSeconds, 1)
            if ($null -eq $meta.exitCode) { $meta.exitCode = 1 }
            Write-Json (Join-Path $runDir 'meta.json') $meta
        }
        Release-Lock
    }
}

function Cmd-Status {
    if ($Last -lt 1) { Fail '-Last는 1 이상이어야 합니다.' 2 }
    $locks = @()
    if (Test-Path -LiteralPath $LockRoot -PathType Container) {
        foreach ($file in @(Get-ChildItem -LiteralPath $LockRoot -Filter '*.json' -File)) {
            $item = Read-Json $file.FullName
            if ($item -and $item.PSObject.Properties['pid'] -and (Test-Alive $item.pid)) {
                $locks += [pscustomobject]@{ 이름 = $item.name; 소유자 = $item.owner; 시작 = $item.startedAt; PID = $item.pid; 워크트리 = $item.worktree }
            }
        }
    }
    Write-Output '살아 있는 잠금:'
    if ($locks.Count) { $locks | Format-Table -AutoSize | Out-String | Write-Output }
    else { Write-Output '없음' }
    $rows = @()
    if (Test-Path -LiteralPath $RunRoot -PathType Container) {
        foreach ($dir in @(Get-ChildItem -LiteralPath $RunRoot -Directory | Where-Object { $_.Name -match '^\d{8}-\d{6}_[a-z0-9-]{1,40}$' } | Sort-Object Name -Descending | Select-Object -First $Last)) {
            $meta = Read-Json (Join-Path $dir.FullName 'meta.json')
            $changes = 0
            $statusPath = Join-Path $dir.FullName 'status.txt'
            if (Test-Path -LiteralPath $statusPath) { $changes = @(Get-Content -LiteralPath $statusPath -Encoding UTF8 | Where-Object { $_ }).Count }
            $rows += [pscustomobject]@{
                이름 = $dir.Name; 소유자 = $(if ($meta) { $meta.owner } else { '?' })
                시작 = $(if ($meta) { $meta.startedAt } else { '?' })
                소요초 = $(if ($meta) { $meta.durationSec } else { '?' })
                종료코드 = $(if ($meta) { $meta.exitCode } else { '?' }); 변경파일 = $changes
            }
        }
    }
    Write-Output '최근 실행:'
    if ($rows.Count) { $rows | Format-Table -AutoSize | Out-String | Write-Output }
    else { Write-Output '없음' }
}

function Cmd-Show {
    if ([string]::IsNullOrWhiteSpace($Run)) { Fail '-Run이 필요합니다.' 2 }
    $path = $Run
    if (-not [IO.Path]::IsPathRooted($path)) { $path = Join-Path $RunRoot $path }
    $path = Normalize-Path $path
    if (-not $path.StartsWith(($RunRoot.TrimEnd('\') + '\'), [StringComparison]::OrdinalIgnoreCase) -or
        -not (Test-Path -LiteralPath $path -PathType Container)) { Fail '실행 폴더가 없습니다.' 2 }
    $meta = Read-Json (Join-Path $path 'meta.json')
    if (-not $meta) { Fail 'meta.json을 읽지 못했습니다.' 2 }
    $meta | Select-Object owner, name, worktree, branch, headBefore, headAfter, startedAt, endedAt, durationSec, exitCode, timedOut, dryRun | Format-List | Out-String | Write-Output
    Write-Output '결과 앞 40줄:'
    $result = Join-Path $path 'result.md'
    if (Test-Path -LiteralPath $result) { Get-Content -LiteralPath $result -Encoding UTF8 -TotalCount 40 }
    else { Write-Output '결과 파일 없음' }
    Write-Output '변경 요약:'
    $stat = Join-Path $path 'diffstat.txt'
    if (Test-Path -LiteralPath $stat) { Get-Content -LiteralPath $stat -Encoding UTF8 }
    else { Write-Output '변경 요약 없음' }
}

try {
    switch ($Command.ToLowerInvariant()) {
        'run' { $code = Cmd-Run; break }
        'status' { Cmd-Status; $code = 0; break }
        'show' { Cmd-Show; $code = 0; break }
        default { Fail "알 수 없는 명령: $Command" 2 }
    }
    exit ([int]$code)
} catch {
    Say ([string]$_)
    exit $script:ExitCode
}

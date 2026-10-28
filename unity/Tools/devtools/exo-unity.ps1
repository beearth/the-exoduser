# exo-unity.ps1 - DT-01 Unity 작업 서버 + PC 순번 큐 (PowerShell 5.1 호환, UTF-8 BOM)
# 명령: start | run | status | stop | reap | reserve | unreserve | queue
# 자세한 사용법: Tools/devtools/README.md
param(
    [Parameter(Position = 0)][string]$Command = 'status',
    [string]$Worktree,
    [string]$Method,
    [Alias('Args')][string[]]$JobArgs = @(),
    [string]$ArgsJson,
    [int]$TimeoutSec = 600,
    [switch]$NoRefresh,
    [switch]$Json,
    [switch]$Takeover,
    [int]$WaitMin = 40,
    [int]$PollSec = 30,
    [string]$Owner,
    [string]$Note = '',
    [int]$TtlMin = 120,
    [switch]$Force,
    [int]$WaitSec = 3600,
    [string]$Exe,
    [string]$Script,
    [int]$KillAfterSec = 0,
    [switch]$KeepReservation,
    [switch]$AllowPlayer,
    [ValidateSet("default", "proposed")][string]$Profile = "default",
    [string]$NodeModules = 'G:\exoduser\node_modules'
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false) } catch { }
$Root      = 'I:\EXODUSER-Storage\unity-jobs'
$LockPath  = Join-Path $Root '_pc_lock.json'
$HaltPath  = Join-Path $Root 'HALT'; if ($env:EXO_HALT_PATH) { $HaltPath = $env:EXO_HALT_PATH }   # 환경변수는 자체 점검용
$QueueRoot = Join-Path $Root 'queue'
$Tickets   = Join-Path $Root '_tickets'
$UnityExe  = 'G:\unity\Editor\6000.6.7f1\Editor\Unity.exe'
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# ------------------------------------------------------------------ 공용 함수
function Say([string]$m) { [Console]::Error.WriteLine('[exo-unity] ' + $m) }
function NowIso { [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ss.fffZ') }
function Stamp { [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfff') }

function Read-Json([string]$p) {
    for ($i = 0; $i -lt 5; $i++) {
        try {
            if (-not (Test-Path -LiteralPath $p)) { return $null }
            $t = [IO.File]::ReadAllText($p)
            if ([string]::IsNullOrWhiteSpace($t)) { Start-Sleep -Milliseconds 80; continue }
            return ($t | ConvertFrom-Json)
        } catch { Start-Sleep -Milliseconds 80 }
    }
    return $null
}

function Write-JsonAtomic([string]$p, $obj) {
    $dir = Split-Path $p -Parent
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $tmp = $p + '.' + [Guid]::NewGuid().ToString('N').Substring(0, 6) + '.tmp'
    [IO.File]::WriteAllText($tmp, ($obj | ConvertTo-Json -Depth 8), $Utf8NoBom)
    Move-Item -LiteralPath $tmp -Destination $p -Force
}

function Test-Alive($procId) {
    if (-not $procId) { return $false }
    try { $pr = Get-Process -Id ([int]$procId) -ErrorAction Stop; return (-not $pr.HasExited) } catch { return $false }
}

function Get-UnityProcs {
    @(Get-Process Unity, 'EXODUSER-Unity' -ErrorAction SilentlyContinue | Where-Object { try { -not $_.HasExited } catch { $true } })
}

function Get-CommitFreeGB {
    $os = Get-CimInstance Win32_OperatingSystem
    return [math]::Round($os.FreeVirtualMemory / 1MB, 1)
}

function Get-CommitInfo {
    $os = Get-CimInstance Win32_OperatingSystem
    $limit = [math]::Round($os.TotalVirtualMemorySize / 1MB, 1)
    $free = [math]::Round($os.FreeVirtualMemory / 1MB, 1)
    return [pscustomobject]@{ limit = $limit; free = $free; used = [math]::Round($limit - $free, 1) }
}

# memlog.csv: (시각, 커밋 사용, 한도, 여유, Unity 수, claude 수, node 수) - 실행할 때마다 한 줄. 상태판(DT-15)이 추이를 그린다.
function Write-MemLog {
    try {
        $c = Get-CommitInfo
        $u = @(Get-Process Unity, 'EXODUSER-Unity' -ErrorAction SilentlyContinue).Count
        $cl = @(Get-Process claude -ErrorAction SilentlyContinue).Count
        $nd = @(Get-Process node -ErrorAction SilentlyContinue).Count
        $p = Join-Path $Root 'memlog.csv'
        New-Item -ItemType Directory -Force -Path $Root | Out-Null
        $line = '{0},{1},{2},{3},{4},{5},{6}' -f (NowIso), $c.used, $c.limit, $c.free, $u, $cl, $nd
        for ($i = 0; $i -lt 5; $i++) {
            try {
                if (-not (Test-Path -LiteralPath $p)) { [IO.File]::AppendAllText($p, "time,commitUsedGB,commitLimitGB,commitFreeGB,unity,claude,node`r`n", $Utf8NoBom) }
                [IO.File]::AppendAllText($p, $line + "`r`n", $Utf8NoBom)
                break
            } catch { Start-Sleep -Milliseconds 100 }
        }
    } catch { }
}

function Norm-Worktree([string]$w) {
    if ([string]::IsNullOrWhiteSpace($w)) { throw '-Worktree 가 필요합니다.' }
    $full = (Resolve-Path -LiteralPath $w).Path.TrimEnd('\')
    if (-not (Test-Path -LiteralPath (Join-Path $full 'unity\ProjectSettings'))) { throw "유니티 프로젝트(unity\ProjectSettings)가 없습니다: $full" }
    return $full
}

function Get-QueueDir([string]$wt) {
    $d = Join-Path $Root (Split-Path $wt -Leaf)
    foreach ($s in 'inbox', 'running', 'done', 'logs') { New-Item -ItemType Directory -Force -Path (Join-Path $d $s) | Out-Null }
    return $d
}

function Test-LibraryIncomplete([string]$wt) {
    # Library 가 3GB 미만이거나 ScriptAssemblies 가 없으면 불완전(재임포트로 10GB 가까이 쓰고 200초 이상 걸림)
    $lib = Join-Path $wt 'unity\Library'
    if (-not (Test-Path -LiteralPath $lib)) { return 'Library 없음' }
    if (-not (Test-Path -LiteralPath (Join-Path $lib 'ScriptAssemblies'))) { return 'Library\ScriptAssemblies 없음(불완전)' }
    $sum = 0L
    foreach ($f in [IO.Directory]::EnumerateFiles($lib, '*', [IO.SearchOption]::AllDirectories)) {
        try { $sum += (New-Object IO.FileInfo $f).Length } catch { }
        if ($sum -ge 3GB) { return $null }
    }
    return ('Library 크기 {0:N2}GB < 3GB(불완전)' -f ($sum / 1GB))
}

# ------------------------------------------------------------------ 예약 큐 (queue\)
function Get-Reservations {
    New-Item -ItemType Directory -Force -Path $QueueRoot | Out-Null
    $out = @()
    foreach ($f in (Get-ChildItem -LiteralPath $QueueRoot -Filter '*.json' -ErrorAction SilentlyContinue | Sort-Object Name)) {
        $r = Read-Json $f.FullName
        if ($null -eq $r) { continue }
        $exp = $null
        try { $exp = [DateTime]::Parse($r.expiresAt).ToUniversalTime() } catch { }
        if ($exp -and $exp -lt [DateTime]::UtcNow) { Remove-Item -LiteralPath $f.FullName -Force -ErrorAction SilentlyContinue; continue }
        $r | Add-Member -NotePropertyName file -NotePropertyValue $f.FullName -Force
        $out += $r
    }
    return $out
}

function Cmd-Reserve {
    if ([string]::IsNullOrWhiteSpace($Owner)) { throw '-Owner 가 필요합니다.' }
    $mine = @(Get-Reservations | Where-Object { $_.owner -eq $Owner })
    $exp = [DateTime]::UtcNow.AddMinutes($TtlMin).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    if ($mine.Count -gt 0) {
        $r = $mine[0]
        $new = [ordered]@{ owner = $Owner; note = $Note; createdAt = $r.createdAt; expiresAt = $exp; worktree = [string]$Worktree }
        Write-JsonAtomic $r.file $new
        Say "예약 갱신: $Owner ($Note)"
    } else {
        $p = Join-Path $QueueRoot ((Stamp) + '_' + ($Owner -replace '[^\w\-]', '_') + '.json')
        Write-JsonAtomic $p ([ordered]@{ owner = $Owner; note = $Note; createdAt = (NowIso); expiresAt = $exp; worktree = [string]$Worktree })
        Say "예약 추가: $Owner ($Note)"
    }
    Cmd-Queue
}

function Cmd-Unreserve {
    if ([string]::IsNullOrWhiteSpace($Owner)) { throw '-Owner 가 필요합니다.' }
    foreach ($r in @(Get-Reservations | Where-Object { $_.owner -eq $Owner })) { Remove-Item -LiteralPath $r.file -Force -ErrorAction SilentlyContinue }
    Say "예약 해제: $Owner"
    Cmd-Queue
}

# ------------------------------------------------------------------ HALT / 크래시 재시도 (XMP 메모리 의심, 10-28)
# ------------------------------------------------------------------ 사용자 실제 세이브 보호 (10-28)
# 자동 실행은 --unity-qa-sandbox <dir> 로 격리 저장소를 쓴다. 실행 전후로 LocalLow\ForDearGamers 를 비교해
# 바뀐 파일이 있으면 실패로 판정한다. 사용자 파일은 읽기만 한다(수정·복원 금지).
function New-Sandbox([string]$runId) {
    $d = Join-Path $Root ('sandbox\' + $runId)
    New-Item -ItemType Directory -Force -Path $d | Out-Null
    return $d
}

function Get-UserSaveSnapshot {
    $h = @{}
    $root = Join-Path $env:USERPROFILE 'AppData\LocalLow\ForDearGamers'
    if (-not (Test-Path -LiteralPath $root)) { return $h }
    $sha = [Security.Cryptography.SHA256]::Create()
    foreach ($f in [IO.Directory]::EnumerateFiles($root, '*', [IO.SearchOption]::AllDirectories)) {
        if ($f -match '[\\/]Unity[\\/]local\.[0-9a-f]+[\\/]Editor[\\/]') { continue }   # editor internal state (Analytics etc.) is not a save - always touched when the editor runs
        try {
            $fi = New-Object IO.FileInfo $f
            $hash = ''
            if ($fi.Length -le 64MB) {
                $fs = New-Object IO.FileStream($f, 'Open', 'Read', 'ReadWrite, Delete')
                try { $hash = [BitConverter]::ToString($sha.ComputeHash($fs)) } finally { $fs.Dispose() }
            }
            $h[$f] = '{0}|{1}|{2}' -f $fi.Length, $fi.LastWriteTimeUtc.Ticks, $hash
        } catch { }
    }
    return $h
}

function Compare-UserSave($before) {
    if ($null -eq $before) { return @() }
    $after = Get-UserSaveSnapshot
    $out = @()
    foreach ($k in $after.Keys) {
        if (-not $before.ContainsKey($k)) { $out += ('추가 ' + $k) }
        elseif ($before[$k] -ne $after[$k]) { $out += ('변경 ' + $k + ' (' + ($before[$k].Split('|')[0]) + ' -> ' + ($after[$k].Split('|')[0]) + ' bytes)') }
    }
    foreach ($k in $before.Keys) { if (-not $after.ContainsKey($k)) { $out += ('삭제 ' + $k) } }
    if ($out.Count -gt 0) {
        try { Add-Content -LiteralPath (Join-Path $Root 'usersave.log') -Value ((NowIso) + ' USER_SAVE changed=' + $out.Count + ' ' + ($out -join ' ; ')) -Encoding UTF8 } catch { }
    }
    return $out
}

function Apply-SaveCheck($r, $before, [string]$sbx) {
    $sc = @(Compare-UserSave $before)
    if ($r -is [System.Collections.IDictionary]) {
        $r['userSaveChanged'] = $sc.Count; $r['userSaveFiles'] = @($sc); if ($sbx) { $r['sandbox'] = $sbx }
        if ($sc.Count -gt 0) { $r['ok'] = $false; $r['note'] = (([string]$r['note']) + ' USER_SAVE changed=' + $sc.Count).Trim() }
    } else {
        $r | Add-Member -NotePropertyName userSaveChanged -NotePropertyValue $sc.Count -Force
        $r | Add-Member -NotePropertyName userSaveFiles -NotePropertyValue @($sc) -Force
        if ($sbx) { $r | Add-Member -NotePropertyName sandbox -NotePropertyValue $sbx -Force }
        if ($sc.Count -gt 0) { $r.ok = $false }
    }
}

function Test-UnityCrash([string]$log, [int]$exit) {
    if ($exit -eq -1073741819) { return 'exit code 0xC0000005 (access violation)' }
    try {
        if (Test-Path -LiteralPath $log) {
            $fs = New-Object IO.FileStream($log, 'Open', 'Read', 'ReadWrite')
            $sr = New-Object IO.StreamReader($fs)
            $t = $sr.ReadToEnd(); $sr.Dispose()
            if ($t -match '(?i)access violation') { return 'log: access violation' }
            if ($t.Contains('crash has been intercepted')) { return 'log: crash has been intercepted' }
        }
    } catch { }
    return $null
}

function Find-CrashDumps([datetime]$since) {
    $r = @()
    foreach ($pat in ($env:TEMP + '\Unity\Editor\Crashes\Crash_*'), ($env:TEMP + '\*\*\Crashes\Crash_*'), ($env:LOCALAPPDATA + '\Temp\Unity\Editor\Crashes\Crash_*')) {
        $r += @(Get-ChildItem -Path $pat -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -ge $since } | ForEach-Object { $_.FullName })
    }
    return @($r | Select-Object -Unique)
}

function Record-Crash([string]$cause, [string]$what, [string]$log) {
    try { Add-Content -LiteralPath (Join-Path $Root 'crashes.log') -Value ([ordered]@{ time = (NowIso); cause = $cause; what = $what; log = $log } | ConvertTo-Json -Compress) -Encoding UTF8 } catch { }
}

function New-Halt([string]$cause, [string]$what, $logs, [datetime]$since) {
    $dumps = Find-CrashDumps $since
    $o = [ordered]@{ time = (NowIso); cause = $cause; what = $what; logs = @($logs); crashDumps = @($dumps); note = '크래시가 재시도 뒤에도 반복됨 - 해제는 이 파일을 지우는 것(유니티 총괄)' }
    try {
        $fs = [IO.File]::Open($HaltPath, 'CreateNew', 'Write', 'Read')
        $b = $Utf8NoBom.GetBytes(($o | ConvertTo-Json -Depth 5)); $fs.Write($b, 0, $b.Length); $fs.Dispose()
    } catch { }
    Say ('HALT 생성: ' + $HaltPath + ' (' + $cause + ')')
}

function Show-Halt {
    if (Test-Path -LiteralPath $HaltPath) {
        Write-Output ('HALT: ' + $HaltPath + ' 존재 - 모든 실행(start/run/player/browser) 중지')
        Write-Output ([IO.File]::ReadAllText($HaltPath))
    }
}

function Check-ServerCrash([string]$qd) {
    $l = Read-Json (Join-Path $qd 'launcher.json')
    if (-not $l -or -not $l.log) { return }
    $c = Test-UnityCrash $l.log 0
    if (-not $c) { return }
    Record-Crash $c 'server' $l.log
    $recent = 0
    try {
        foreach ($ln in (Get-Content -LiteralPath (Join-Path $Root 'crashes.log'))) {
            $o = $ln | ConvertFrom-Json
            if ([DateTime]::Parse($o.time).ToUniversalTime() -gt [DateTime]::UtcNow.AddMinutes(-60)) { $recent++ }
        }
    } catch { }
    Say ('서버 크래시 감지(' + $c + ') 최근 60분 ' + $recent + '회')
    if ($recent -ge 2) { New-Halt $c 'server' @($l.log) (Get-Date).AddHours(-1) }
}

function Test-HaltGate {
    if (($Command.ToLower() -in 'start', 'run', 'player', 'browser') -and (Test-Path -LiteralPath $HaltPath)) {
        Say 'HALT 파일이 있어 실행하지 않음'
        Show-Halt
        exit 3
    }
}

function Cmd-Queue {
    Show-Halt
    $lock = Read-Json $LockPath
    if ($lock) {
        $alive = Test-LockHolderAlive $lock
        Write-Output ('잠금: owner={0} pid={1} alive={2} worktree={3} since={4}' -f $lock.owner, $lock.pid, $alive, $lock.worktree, ($lock.startedAt + $lock.started + ' ' + $lock.note))
        if ($lock.queueDir) {
            $sv = Read-Json (Join-Path $lock.queueDir 'server.json')
            if ($sv) { Write-Output ('  서버: state={0} idleSec={1} jobsDone={2}' -f $sv.state, $sv.idleSec, $sv.jobsDone) }
        }
    } else { Write-Output '잠금: 없음(비어 있음)' }
    $rs = @(Get-Reservations)
    if ($rs.Count -eq 0) { Write-Output '예약: 없음' }
    $i = 1
    foreach ($r in $rs) { Write-Output ('예약 {0}: {1} - {2} (등록 {3}, 만료 {4})' -f $i, $r.owner, $r.note, $r.createdAt, $r.expiresAt); $i++ }
}

# ------------------------------------------------------------------ 잠금 + 슬롯
function Try-CreateLock($content) {
    try {
        $fs = [IO.File]::Open($LockPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::Read)
    } catch [IO.IOException] { return $false }
    try {
        $b = $Utf8NoBom.GetBytes(($content | ConvertTo-Json -Depth 5))
        $fs.Write($b, 0, $b.Length)
    } finally { $fs.Dispose() }
    return $true
}

function Test-LockHolderAlive($lock) {
    # 잠금의 pid = Unity 를 띄우고 끝까지 기다리는 실행기(PowerShell)의 $PID 여야 한다.
    # 그래도 pid 가 금방 끝나는 프로세스인 경우(10-28 O-1 사고)를 막는다: pid 가 죽었어도 Unity/플레이어가 돌고 있고
    # 잠금이 15분 안쪽이면 보유 중으로 본다. pid 가 없는(손으로 만든) 잠금은 60분이 지나고 Unity 가 0개일 때만 stale.
    $age = New-TimeSpan -Minutes 999
    try { $age = (Get-Date) - (Get-Item -LiteralPath $LockPath).LastWriteTime } catch { }
    if ($lock.pid) {
        if (Test-Alive $lock.pid) { return $true }
        if ($age.TotalMinutes -lt 15 -and (Get-UnityProcs).Count -gt 0) { return $true }
        return $false
    }
    if ($age.TotalMinutes -gt 60 -and (Get-UnityProcs).Count -eq 0) { return $false }
    return $true
}

# 삭제는 파일의 pid(그리고 내가 잡은 잠금이면 token)가 자기일 때만
function Release-Lock([int]$ownerPid) {
    $l = Read-Json $LockPath
    if (-not ($l -and $l.pid -and ([int]$l.pid -eq $ownerPid))) { return }
    if ($script:LockToken -and $l.token -and ([string]$l.token -ne $script:LockToken)) { return }
    Remove-Item -LiteralPath $LockPath -Force -ErrorAction SilentlyContinue
}

function Try-TakeoverFrom($lock) {
    if (-not $lock.queueDir) { return $false }
    $sv = Read-Json (Join-Path $lock.queueDir 'server.json')
    if ($null -eq $sv -or $sv.state -ne 'idle' -or [int]$sv.idleSec -lt 300) { return $false }
    Say ("-Takeover: 서버 pid={0} 가 {1}초 idle → stop 요청" -f $sv.pid, $sv.idleSec)
    [IO.File]::WriteAllText((Join-Path $lock.queueDir 'stop'), 'stop', $Utf8NoBom)
    $t0 = Get-Date
    while ((Test-Alive $sv.pid) -and ((Get-Date) - $t0).TotalSeconds -lt 90) { Start-Sleep -Milliseconds 500 }
    if (Test-Alive $sv.pid) { return $false }
    Release-Lock ([int]$sv.pid)
    return $true
}

# 잠금 획득 + Unity 0개 + 커밋 여유 확인. 예약 큐가 있으면 맨 앞 예약자(-Owner)만 진행.
function Acquire-Slot([string]$Role, [string]$wt, [int]$ownerPid, [string]$queueDir, [double]$MinFreeGB = 0) {
    $script:LockToken = [Guid]::NewGuid().ToString("N")
    New-Item -ItemType Directory -Force -Path $Root | Out-Null
    # 기본: 20GB(Library 없음 30GB). -Profile proposed: 12GB / 20GB(실측 근거 제안값, 유니티 총괄과 합의 전)
    $hasLib = Test-Path -LiteralPath (Join-Path $wt 'unity\Library')
    if ($Profile -eq 'proposed') { $needGB = 12; if (-not $hasLib) { $needGB = 20 } } else { $needGB = 20; if (-not $hasLib) { $needGB = 30 } }
    if ($MinFreeGB -gt 0) { $needGB = $MinFreeGB }
    $deadline = (Get-Date).AddMinutes($WaitMin)
    $lastMsg = ''
    while ($true) {
        $blocked = $null
        $res = @(Get-Reservations)
        if ($res.Count -gt 0) {
            $front = $res[0]
            if ([string]::IsNullOrWhiteSpace($Owner) -or $front.owner -ne $Owner) {
                $blocked = ('예약 큐 맨 앞은 {0}({1}) - 내 차례 아님' -f $front.owner, $front.note)
            }
        }
        if (-not $blocked) {
            $content = [ordered]@{ owner = $Role; pid = $ownerPid; worktree = $wt; queueDir = $queueDir; startedAt = (NowIso); reservedAs = [string]$Owner; token = $script:LockToken }
            if (Try-CreateLock $content) {
                $procs = Get-UnityProcs
                $free = Get-CommitFreeGB
                if ($procs.Count -eq 0 -and $free -ge $needGB) {
                    if ($Owner -and -not $KeepReservation) { foreach ($r in @(Get-Reservations | Where-Object { $_.owner -eq $Owner })) { Remove-Item -LiteralPath $r.file -Force -ErrorAction SilentlyContinue } }
                    return
                }
                Release-Lock $ownerPid
                if ($procs.Count -gt 0) { $blocked = ('다른 Unity 실행 중: pid ' + (($procs | ForEach-Object { $_.Id }) -join ',')) }
                else { $blocked = ('커밋 여유 {0}GB < 필요 {1}GB' -f $free, $needGB) }
            } else {
                $lock = Read-Json $LockPath
                if ($null -eq $lock) { Start-Sleep -Milliseconds 300; continue }
                if (-not (Test-LockHolderAlive $lock)) {
                    $again = Read-Json $LockPath
                    if ($again -and $again.pid -eq $lock.pid -and $again.startedAt -eq $lock.startedAt -and $again.started -eq $lock.started) {
                        Say "stale 잠금 제거(pid $($lock.pid) 없음, owner $($lock.owner))"
                        Remove-Item -LiteralPath $LockPath -Force -ErrorAction SilentlyContinue
                    }
                    continue
                }
                if ($Takeover -and (Try-TakeoverFrom $lock)) { continue }
                $blocked = ('잠금 보유: {0} pid {1} {2}' -f $lock.owner, $lock.pid, $lock.worktree)
            }
        }
        if ((Get-Date) -gt $deadline) { throw ("슬롯 대기 시간 초과({0}분): {1}" -f $WaitMin, $blocked) }
        if ($blocked -ne $lastMsg) { Say ("대기: " + $blocked + " (" + $PollSec + "초 간격)"); $lastMsg = $blocked }
        Start-Sleep -Seconds $PollSec
    }
}

# ------------------------------------------------------------------ start
function Set-DotnetEnv {
    $env:DOTNET_ADD_GLOBAL_TOOLS_TO_PATH = 'false'; $env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'
    $env:DOTNET_NOLOGO = '1'; $env:DOTNET_CLI_HOME = 'E:/exoduser-wt/_dotnet-home'
}

function Q([string]$s) { if ($s -match '\s') { return '"' + $s + '"' } return $s }

function Cmd-Start {
    $wt = Norm-Worktree $Worktree
    $qd = Get-QueueDir $wt
    $sv = Read-Json (Join-Path $qd 'server.json')
    if ($sv -and (Test-Alive $sv.pid)) { Say ("이미 실행 중: pid {0} state={1}" -f $sv.pid, $sv.state); return }
    Remove-Item -LiteralPath (Join-Path $qd 'server.json') -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath (Join-Path $qd 'stop') -Force -ErrorAction SilentlyContinue
    $t0 = Get-Date
    Acquire-Slot 'devtools-runner' $wt $PID $qd
    $started = $false
    try {
        Set-DotnetEnv
        $log = Join-Path $qd ('logs\server-' + (Stamp) + '.log')
        $a = @('-batchmode', '-projectPath', (Q (Join-Path $wt 'unity')), '-exoJobServer', (Q $qd), '-logFile', (Q $log))
        $a += @('--unity-qa-sandbox', (Q (New-Sandbox ('server-' + (Stamp)))))
        $p = Start-Process -FilePath $UnityExe -ArgumentList $a -PassThru -WindowStyle Hidden
        # 잠금 소유자를 서버로 바꾼다(이 CLI 가 끝나도 서버 pid 로 stale 판정)
        [IO.File]::WriteAllText($LockPath, ([ordered]@{ owner = 'devtools-server'; pid = $p.Id; worktree = $wt; queueDir = $qd; startedAt = (NowIso); startedBy = $PID; reservedAs = [string]$Owner; token = $script:LockToken } | ConvertTo-Json), $Utf8NoBom)
        Write-JsonAtomic (Join-Path $qd 'launcher.json') ([ordered]@{ pid = $p.Id; startedBy = $PID; startedAt = (NowIso); log = $log; worktree = $wt })
        $started = $true
        $deadline = (Get-Date).AddMinutes(15)
        $ready = $false
        while ((Get-Date) -lt $deadline) {
            if ($p.HasExited) { throw ("서버 Unity 가 시작 중 종료됨 exit=" + $p.ExitCode + " 로그: " + $log) }
            $s = Read-Json (Join-Path $qd 'server.json')
            if ($s -and [int]$s.pid -eq $p.Id) { $ready = $true; break }
            Start-Sleep -Milliseconds 300
        }
        if (-not $ready) { throw '서버 하트비트가 15분 안에 나타나지 않음' }
        Say ("서버 준비: pid {0} 기동 {1:N1}초 (대기 포함 {2:N1}초) log={3}" -f $p.Id, ((Get-Date) - $t0).TotalSeconds, ((Get-Date) - $t0).TotalSeconds, $log)
        Write-Output ("started pid={0} queueDir={1}" -f $p.Id, $qd)
    } catch {
        if (-not $started) { Release-Lock $PID }
        else {
            # 시작 실패: 우리가 띄운 프로세스만 정리
            try { if ($p -and -not $p.HasExited) { Stop-Process -Id $p.Id -Force } } catch { }
            Release-Lock $p.Id
        }
        throw
    }
}

# ------------------------------------------------------------------ run
function Resolve-JobArgs {
    $a = @()
    if ($ArgsJson) { $a = @(($ArgsJson | ConvertFrom-Json)) }
    elseif ($JobArgs.Count -eq 1 -and $JobArgs[0].StartsWith('-') -and $JobArgs[0].Contains(',')) { $a = @($JobArgs[0].Split(',')) }   # -File 모드에서 쉼표 배열 호환
    else { $a = @($JobArgs) }
    return @($a | ForEach-Object { [string]$_ })
}

function Show-Result($r, [long]$wallMs) {
    $ex = ''
    if ($r.exception -and $r.exception.type) { $ex = ' EXC=' + $r.exception.type + ': ' + $r.exception.message }
    Write-Output ('[result] ok={0} exit={1} wall={2}ms dur={3}ms refresh={4}ms compile={5}ms exec={6}ms errorLogs={7} reloads={8}{9}' -f $r.ok, $r.exitCode, $wallMs, $r.durMs, $r.refreshMs, $r.compileMs, $r.execMs, $r.errorLogs, $r.domainReloads, $ex)
    if ($r.note) { Write-Output ('  note: ' + $r.note) }
    foreach ($e in @($r.compileErrors)) { if ($e) { Write-Output ('  compileError: ' + $e) } }
    if ($r.sandbox) { Write-Output ('  sandbox: ' + $r.sandbox) }
    if ($r.userSaveChanged -gt 0) { Write-Output ('USER_SAVE changed=' + $r.userSaveChanged); foreach ($uf in @($r.userSaveFiles)) { Write-Output ('  ' + $uf) } }
    if ($r.logFile) { Write-Output ('  log: ' + $r.logFile) }
    if ($Json) { Write-Output ($r | ConvertTo-Json -Depth 6 -Compress) }
}

function Result-ExitCode($r) {
    if ($r.ok) { return 0 }
    if ([int]$r.exitCode -ne 0) { return [int]$r.exitCode }
    if ($r.userSaveChanged -gt 0) { return 5 }
    return 1
}

function Cmd-Run {
    if ([string]::IsNullOrWhiteSpace($Method)) { throw '-Method 가 필요합니다.' }
    $wt = Norm-Worktree $Worktree
    $qd = Get-QueueDir $wt
    $argList = Resolve-JobArgs
    $id = [Guid]::NewGuid().ToString('N').Substring(0, 8)
    $sw = [Diagnostics.Stopwatch]::StartNew()
    $sv = Read-Json (Join-Path $qd 'server.json')

    if ($sv -and (Test-Alive $sv.pid)) {
        # --- 서버 모드: inbox 에 제출(파일명 = UTC 타임스탬프_id → 실행 순서)
        $saveBefore = Get-UserSaveSnapshot
        $job = [ordered]@{ id = $id; method = $Method; args = @($argList); refresh = (-not $NoRefresh.IsPresent); timeoutSec = $TimeoutSec }
        $name = (Stamp) + '_' + $id
        $inbox = Join-Path $qd 'inbox'
        $tmp = Join-Path $inbox ($name + '.tmp')
        [IO.File]::WriteAllText($tmp, ($job | ConvertTo-Json -Depth 5), $Utf8NoBom)
        Move-Item -LiteralPath $tmp -Destination (Join-Path $inbox ($name + '.json')) -Force
        Say ("제출 {0} → 서버 pid {1} (state={2})" -f $id, $sv.pid, $sv.state)
        $donePath = Join-Path $qd ('done\' + $id + '.json')
        $lastCheck = Get-Date
        while ($true) {
            if (Test-Path -LiteralPath $donePath) {
                $r = Read-Json $donePath
                if ($r) { $sw.Stop(); Apply-SaveCheck $r $saveBefore $null; Show-Result $r $sw.ElapsedMilliseconds; exit (Result-ExitCode $r) }
            }
            if (((Get-Date) - $lastCheck).TotalSeconds -ge 2) {
                $lastCheck = Get-Date
                if (-not (Test-Alive $sv.pid)) {
                    Say ("서버 pid {0} 가 job 도중 사라짐(메서드가 EditorApplication.Exit/크래시 가능). 로그: logs\{1}.log" -f $sv.pid, $id)
                    Check-ServerCrash $qd
                    exit 90
                }
            }
            if ($sw.Elapsed.TotalSeconds -gt $WaitSec) { Say "대기 시간 초과 $WaitSec 초 (job $id 는 큐에 남아 있을 수 있음)"; exit 91 }
            Start-Sleep -Milliseconds 100
        }
    }

    # --- 서버 없음: 1회 batch 실행(같은 잠금 + 티켓 순번)
    New-Item -ItemType Directory -Force -Path $Tickets | Out-Null
    $ticket = Join-Path $Tickets ((Stamp) + '_' + $id + '.json')
    [IO.File]::WriteAllText($ticket, ([ordered]@{ pid = $PID; worktree = $wt; method = $Method } | ConvertTo-Json), $Utf8NoBom)
    $p = $null
    try {
        $lastMsg = ''
        while ($true) {   # 티켓 순서: 살아 있는 가장 앞 티켓이 내 것일 때만 진행
            $first = $null
            foreach ($t in (Get-ChildItem -LiteralPath $Tickets -Filter '*.json' | Sort-Object Name)) {
                $tj = Read-Json $t.FullName
                if ($tj -and (Test-Alive $tj.pid)) { $first = $t.FullName; break }
                if ($tj -or $t.LastWriteTimeUtc -lt [DateTime]::UtcNow.AddMinutes(-2)) { Remove-Item -LiteralPath $t.FullName -Force -ErrorAction SilentlyContinue }
            }
            if ($first -eq $ticket) { break }
            if ($lastMsg -ne $first) { Say ("순번 대기: 앞 티켓 " + (Split-Path $first -Leaf)); $lastMsg = $first }
            Start-Sleep -Seconds 2
        }
        Acquire-Slot 'devtools-runner' $wt $PID $qd
        try {
            Set-DotnetEnv
            $log = Join-Path $qd ('logs\' + $id + '.log')
            $a = @('-batchmode', '-quit', '-projectPath', (Q (Join-Path $wt 'unity')), '-executeMethod', $Method, '-logFile', (Q $log))
            foreach ($x in $argList) { $a += (Q $x) }
            $sbx = New-Sandbox $id; $a += @('--unity-qa-sandbox', (Q $sbx))
            $saveBefore = Get-UserSaveSnapshot
            $sw2 = [Diagnostics.Stopwatch]::StartNew()
            $crashCause = $null; $logsUsed = @($log); $t0c = Get-Date
            for ($attempt = 1; $attempt -le 2; $attempt++) {
                $p = Start-Process -FilePath $UnityExe -ArgumentList $a -PassThru -WindowStyle Hidden
                $done = $p.WaitForExit($TimeoutSec * 1000)
                if (-not $done) { try { Stop-Process -Id $p.Id -Force } catch { }; $p.WaitForExit(15000) | Out-Null }
                $crashCause = Test-UnityCrash $log $p.ExitCode
                if (-not $crashCause) { break }
                Record-Crash $crashCause $Method $log
                if ($attempt -eq 1) {
                    Say ("크래시 감지($crashCause) → 1회만 재시도")
                    Wait-Gone $p.Id 20 | Out-Null
                    $log = $log -replace '\.log$', '-retry.log'; $logsUsed += $log
                    for ($k = 0; $k -lt $a.Count - 1; $k++) { if ($a[$k] -eq '-logFile') { $a[$k + 1] = (Q $log) } }
                }
            }
            if ($crashCause) { New-Halt $crashCause $Method $logsUsed $t0c }
            $sw2.Stop()
            # 종료 확인: 프로세스가 실제로 사라졌는지
            $gone = $false
            for ($i = 0; $i -lt 30; $i++) { if (-not (Test-Alive $p.Id)) { $gone = $true; break }; Start-Sleep -Milliseconds 500 }
            if ($gone) { Say ("확인: Unity pid {0} 종료됨" -f $p.Id) } else { Say ("경고: Unity pid {0} 가 아직 살아 있음" -f $p.Id) }
            $res = Parse-BatchLog $log $id $Method $p.ExitCode $done $sw2.ElapsedMilliseconds
            Apply-SaveCheck $res $saveBefore $sbx
            Write-JsonAtomic (Join-Path $qd ('done\' + $id + '.json')) $res
            $sw.Stop()
            Show-Result $res $sw.ElapsedMilliseconds
            $rc = Result-ExitCode $res
        } finally { Release-Lock $PID }
    } finally { Remove-Item -LiteralPath $ticket -Force -ErrorAction SilentlyContinue }
    exit $rc
}

function Parse-BatchLog([string]$log, [string]$id, [string]$method, [int]$exit, [bool]$finished, [long]$durMs) {
    $refreshMs = 0; $compileMs = 0; $errs = @(); $note = ''
    $crash = $false; $failed = $false; $errLogs = 0
    if (Test-Path -LiteralPath $log) {
        $txt = [IO.File]::ReadAllText($log)
        $m = [regex]::Match($txt, 'Total: ([0-9.]+) seconds - Initiated by InitialRefreshV2')
        if ($m.Success) { $refreshMs = [long]([double]::Parse($m.Groups[1].Value, [Globalization.CultureInfo]::InvariantCulture) * 1000) }
        $m2 = [regex]::Match($txt, 'compile time=([0-9.]+)')
        if ($m2.Success) { $compileMs = [long]([double]::Parse($m2.Groups[1].Value, [Globalization.CultureInfo]::InvariantCulture)) }
        if ($txt.Contains('Scripts have compiler errors')) { $failed = $true }
        if ($txt.Contains('crash has been intercepted')) { $crash = $true }
        foreach ($mm in [regex]::Matches($txt, '(?m)^.*error CS\d+.*$')) { $errs += $mm.Value.Trim() }
        $errLogs = ([regex]::Matches($txt, '(?m)^.*(Exception|error)\b.*$')).Count
    } else { $note = '로그 파일이 없음' }
    if ($failed) { $note = '컴파일 오류(Scripts have compiler errors)' }
    if ($crash) { $note = '크래시 감지(crash has been intercepted)' }
    if (-not $finished) { $note = "시간 초과($TimeoutSec 초)로 종료시킴" }
    $ok = ($exit -eq 0) -and (-not $failed) -and (-not $crash) -and $finished
    return [ordered]@{
        id = $id; method = $method; ok = $ok; exitCode = $exit; startedAt = (NowIso); durMs = $durMs
        refreshMs = $refreshMs; compileMs = $compileMs; execMs = 0
        exception = [ordered]@{ type = ''; message = ''; stack = '' }
        compileErrors = @($errs | Select-Object -First 30); logFile = $log; errorLogs = $errLogs; domainReloads = 0; note = $note; mode = 'batch'
    }
}

# ------------------------------------------------------------------ status / stop / reap
function Get-ServerDirs {
    @(Get-ChildItem -LiteralPath $Root -Directory -ErrorAction SilentlyContinue | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'server.json') -PathType Leaf })
}

function Cmd-Status {
    Cmd-Queue
    $wts = @()
    if ($Worktree) { $wts += (Norm-Worktree $Worktree) }
    $lock = Read-Json $LockPath
    if ($lock -and $lock.worktree) { $wts += [string]$lock.worktree }
    foreach ($d in (Get-ServerDirs)) {
        $s = Read-Json (Join-Path $d.FullName 'server.json')
        if (-not $s) { continue }
        $alive = Test-Alive $s.pid
        $age = ''
        try { $age = [int]([DateTime]::UtcNow - [DateTime]::Parse($s.lastBeat).ToUniversalTime()).TotalSeconds } catch { }
        $inb = @(Get-ChildItem -LiteralPath (Join-Path $d.FullName 'inbox') -Filter '*.json' -ErrorAction SilentlyContinue).Count
        $run = @(Get-ChildItem -LiteralPath (Join-Path $d.FullName 'running') -Filter '*.json' -ErrorAction SilentlyContinue).Count
        Write-Output ('서버[{0}]: pid={1} alive={2} state={3} beatAge={4}s inbox={5} running={6} jobsDone={7} ws={8}MB(peak {9}) private={10}MB head={11}' -f $d.Name, $s.pid, $alive, $s.state, $age, $inb, $run, $s.jobsDone, $s.workingSetMB, $s.peakWorkingSetMB, $s.privateMB, ([string]$s.headSha).Substring(0, [math]::Min(9, ([string]$s.headSha).Length)))
        if ($s.projectPath) { $wts += (Split-Path $s.projectPath -Parent) }
    }
    $procs = Get-UnityProcs
    if ($procs.Count -eq 0) { Write-Output 'Unity 프로세스: 0개' }
    foreach ($pr in $procs) { Write-Output ('Unity 프로세스: pid={0} ws={1:N0}MB start={2}' -f $pr.Id, ($pr.WorkingSet64 / 1MB), $pr.StartTime) }
    $ci = Get-CommitInfo
    Write-Output ('PC 커밋: 사용 {0}GB / 한도 {1}GB / 여유 {2}GB' -f $ci.used, $ci.limit, $ci.free)
    $wh = -1
    try { $wh = @(Get-WinEvent -FilterHashtable @{ LogName = 'System'; ProviderName = 'Microsoft-Windows-WHEA-Logger'; StartTime = (Get-Date).AddHours(-1) } -ErrorAction Stop).Count } catch { if ($_.FullyQualifiedErrorId -like 'NoMatchingEventsFound*') { $wh = 0 } }
    if ($wh -ge 0) { Write-Output ('WHEA-Logger 최근 1시간: {0}건 (읽기만)' -f $wh) } else { Write-Output 'WHEA-Logger 최근 1시간: 조회 불가' }
    foreach ($w in ($wts | Select-Object -Unique)) {
        $okp = $false
        try { $okp = Test-Path -LiteralPath $w -ErrorAction Stop } catch { }
        if (-not $okp) { continue }
        $warn = Test-LibraryIncomplete $w
        if ($warn) { Write-Output ('경고: {0} - {1} → 첫 실행에 전체 임포트 약 100초(빌드 포함 219초) + 커밋 약 9GB 소모' -f $w, $warn) }
        else { Write-Output ('Library 정상: ' + $w) }
    }
}

function Wait-Gone($procId, [int]$sec) {
    $t0 = Get-Date
    while ((Test-Alive $procId) -and ((Get-Date) - $t0).TotalSeconds -lt $sec) { Start-Sleep -Milliseconds 300 }
    return (-not (Test-Alive $procId))
}

function Cmd-Stop {
    $wt = Norm-Worktree $Worktree
    $qd = Get-QueueDir $wt
    $sv = Read-Json (Join-Path $qd 'server.json')
    if (-not $sv -or -not (Test-Alive $sv.pid)) {
        Say '실행 중인 서버가 없음'
        if ($sv) { Release-Lock ([int]$sv.pid) }
        return
    }
    $spid = [int]$sv.pid
    [IO.File]::WriteAllText((Join-Path $qd 'stop'), 'stop', $Utf8NoBom)
    $gone = Wait-Gone $spid 90
    if (-not $gone -and $Force) {
        $l = Read-Json (Join-Path $qd 'launcher.json')
        if ($l -and [int]$l.pid -eq $spid) { Say '정상 종료 실패 → 우리가 띄운 서버만 강제 종료'; try { Stop-Process -Id $spid -Force } catch { }; $gone = Wait-Gone $spid 20 }
    }
    if ($gone) { Say ("확인: 서버 pid {0} 종료됨" -f $spid) } else { Say ("경고: 서버 pid {0} 가 아직 살아 있음(-Force 로 재시도)" -f $spid) }
    if ($gone) {
        Release-Lock $spid
        Remove-Item -LiteralPath (Join-Path $qd 'stop') -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath (Join-Path $qd 'server.json') -Force -ErrorAction SilentlyContinue
        $still = Get-UnityProcs
        if ($still.Count -gt 0) { Say ('참고: 다른 Unity 프로세스가 남아 있음 pid ' + (($still | ForEach-Object { $_.Id }) -join ',')) }
        if (-not (Test-Path -LiteralPath $LockPath)) { Say '확인: 잠금 파일 없음' }
    }
}

function Cmd-Reap {
    foreach ($d in (Get-ServerDirs)) {
        $l = Read-Json (Join-Path $d.FullName 'launcher.json')
        $s = Read-Json (Join-Path $d.FullName 'server.json')
        if (-not $s) { continue }
        $age = 9999
        try { $age = [int]([DateTime]::UtcNow - [DateTime]::Parse($s.lastBeat).ToUniversalTime()).TotalSeconds } catch { }
        $alive = Test-Alive $s.pid
        $mine = ($l -and [int]$l.pid -eq [int]$s.pid)
        if ($alive -and $age -ge 60) {
            if ($mine) { Say ("reap: pid {0} 하트비트 {1}초 끊김 → 강제 종료(우리가 띄움)" -f $s.pid, $age); try { Stop-Process -Id ([int]$s.pid) -Force } catch { }; Wait-Gone $s.pid 20 | Out-Null }
            else { Say ("보고만: pid {0} 하트비트 {1}초 끊김, 우리가 띄운 서버가 아님" -f $s.pid, $age) }
        }
        if (-not (Test-Alive $s.pid)) {
            Release-Lock ([int]$s.pid)
            Remove-Item -LiteralPath (Join-Path $d.FullName 'server.json') -Force -ErrorAction SilentlyContinue
            Say ("reap: 죽은 서버 정리 {0}" -f $d.Name)
        }
    }
    $lock = Read-Json $LockPath
    if ($lock -and -not (Test-LockHolderAlive $lock)) { Say ("reap: stale 잠금 제거 pid {0}" -f $lock.pid); Remove-Item -LiteralPath $LockPath -Force -ErrorAction SilentlyContinue }
    foreach ($pr in (Get-UnityProcs)) {
        $known = $false
        foreach ($d in (Get-ServerDirs)) { $s = Read-Json (Join-Path $d.FullName 'server.json'); if ($s -and [int]$s.pid -eq $pr.Id) { $known = $true } }
        if (-not $known) { Say ("보고만: Unity pid {0} 는 이 도구가 띄운 서버가 아님(건드리지 않음)" -f $pr.Id) }
    }
}

# ------------------------------------------------------------------ 공용 실행기: player / browser / nw (창·소리 금지)
# 다른 세션은 Unity 플레이어·Playwright 를 직접 띄우지 않고 이 명령으로만 띄운다.
$WatchNames = @('EXODUSER-Unity', 'Unity', 'chrome', 'msedge', 'firefox', 'nw', 'chrome-headless-shell', 'headless_shell')
$ExecDir = Join-Path $Root '_exec'

function Reject([string]$why) {
    Say ('거부: ' + $why)
    Write-Output ('[reject] ' + $why)
    exit 2
}

# pid 재사용으로 남의 프로세스를 우리 것으로 착각하지 않도록, 기록해 둔 생성 시각과 같은 프로세스일 때만 true
function Test-SameProc($procId, $created) {
    try {
        $pr = Get-Process -Id ([int]$procId) -ErrorAction Stop
        if ($pr.HasExited -or $null -eq $created) { return $false }
        $d = [math]::Abs(($pr.StartTime.ToUniversalTime() - ([datetime]$created).ToUniversalTime()).TotalSeconds)
        return ($d -lt 2)
    } catch { return $false }
}

function Get-ProcTree([int]$rootPid) {
    $all = @(Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId, Name, CommandLine, CreationDate)
    $set = @{}; $set[$rootPid] = 1
    $changed = $true
    while ($changed) {
        $changed = $false
        foreach ($p in $all) {
            if ($set.ContainsKey([int]$p.ParentProcessId) -and -not $set.ContainsKey([int]$p.ProcessId)) { $set[[int]$p.ProcessId] = 1; $changed = $true }
        }
    }
    return [pscustomobject]@{ pids = @($set.Keys); all = $all }
}

function Get-WindowHits($pids, $label) {
    $hits = @()
    foreach ($id in $pids) {
        try {
            $pr = Get-Process -Id ([int]$id) -ErrorAction Stop
            $pr.Refresh()
            if ($pr.MainWindowHandle -ne [IntPtr]::Zero) { $hits += ('{0}:{1}:pid{2}:title=[{3}]' -f $label, $pr.ProcessName, $pr.Id, $pr.MainWindowTitle) }
        } catch { }
    }
    return $hits
}

# 프로세스 1개를 띄우고 끝까지 지켜본다: 창(MainWindowHandle) 감시, 트리 정리 확인
function Invoke-Guarded([string]$File, [string[]]$ArgList, [string]$Cwd, [int]$limitSec, [int]$killAfter, [string[]]$ownTokens) {
    $pre = @{}
    foreach ($p in @(Get-Process -Name $WatchNames -ErrorAction SilentlyContinue)) { $pre[$p.Id] = 1 }
    $t0 = Get-Date
    $sp = @{ FilePath = $File; ArgumentList = $ArgList; PassThru = $true; WindowStyle = 'Hidden' }
    if ($Cwd) { $sp.WorkingDirectory = $Cwd }
    $proc = Start-Process @sp
    $tree = @{}; $violations = @(); $warnings = @(); $timedOut = $false; $expectedKill = $false
    $sw = [Diagnostics.Stopwatch]::StartNew()
    while ($true) {
        $t = Get-ProcTree $proc.Id
        foreach ($id in $t.pids) { foreach ($c in $t.all) { if ([int]$c.ProcessId -eq [int]$id) { $tree[[int]$id] = $c.CreationDate } } }
        $violations += @(Get-WindowHits $t.pids 'tree')
        foreach ($p in @(Get-Process -Name $WatchNames -ErrorAction SilentlyContinue)) {
            if ($pre.ContainsKey($p.Id) -or $tree.ContainsKey($p.Id)) { continue }
            try { if ($p.StartTime -lt $t0) { continue } } catch { continue }
            $cl = ''
            foreach ($c in $t.all) { if ([int]$c.ProcessId -eq $p.Id) { $cl = [string]$c.CommandLine } }
            $ours = $false
            foreach ($tok in $ownTokens) { if ($tok -and $cl -and $cl.Contains($tok)) { $ours = $true } }
            # 우리 자손이 아닌 새 프로세스(다른 세션의 실행·사용자 브라우저일 수 있음)는 창이 있어도 경고만 하고 절대 종료하지 않는다.
            $h = @(Get-WindowHits @($p.Id) 'new-other')
            if ($h.Count -gt 0) { $warnings += $h }
        }
        if ($proc.HasExited) { break }
        if ($killAfter -gt 0 -and $sw.Elapsed.TotalSeconds -ge $killAfter) { $expectedKill = $true; break }
        if ($sw.Elapsed.TotalSeconds -ge $limitSec) { $timedOut = $true; break }
        Start-Sleep -Milliseconds 700
    }
    $exit = 0
    if ($proc.HasExited) { $exit = $proc.ExitCode }
    else {
        & taskkill.exe /PID $proc.Id /T /F 2>&1 | Out-Null
        $proc.WaitForExit(15000) | Out-Null
        $exit = -1
    }
    # 종료 확인: 트리에 있던 프로세스가 실제로 사라졌는지
    $left = @()
    $t1 = Get-Date
    while ($true) {
        $left = @($tree.Keys | Where-Object { Test-SameProc $_ $tree[$_] })
        if ($left.Count -eq 0 -or ((Get-Date) - $t1).TotalSeconds -ge 20) { break }
        Start-Sleep -Milliseconds 500
    }
    $killed = @()
    foreach ($id in $left) { try { Stop-Process -Id ([int]$id) -Force -ErrorAction Stop; $killed += $id } catch { } }
    $sw.Stop()
    return [pscustomobject]@{
        exitCode = $exit; timedOut = $timedOut; expectedKill = $expectedKill; durMs = $sw.ElapsedMilliseconds
        windowHits = @($violations | Select-Object -Unique); warnings = @($warnings | Select-Object -Unique)
        leftovers = @($left); leftoversKilled = @($killed); treeCount = $tree.Count
    }
}

function Finish-Guarded([string]$kind, [string]$id, $g, $extra, [bool]$extraOk, [string]$failNote) {
    $ok = $extraOk -and ($g.windowHits.Count -eq 0) -and (-not $g.timedOut) -and ($g.exitCode -eq 0 -or $g.expectedKill)
    $sc = @(); if ($null -ne $script:SaveBefore) { $sc = @(Compare-UserSave $script:SaveBefore) }
    if ($sc.Count -gt 0) { $ok = $false }
    $notes = @()
    if ($failNote) { $notes += $failNote }
    if ($sc.Count -gt 0) { $notes += ('USER_SAVE changed=' + $sc.Count) }
    if ($g.timedOut) { $notes += '시간 초과로 종료시킴' }
    if ($g.windowHits.Count -gt 0) { $notes += '창 감지: ' + ($g.windowHits -join '; ') }
    if ($g.leftovers.Count -gt 0) { $notes += '종료 뒤 남은 프로세스 정리: ' + ($g.leftovers -join ',') }
    $res = [ordered]@{
        id = $id; kind = $kind; ok = $ok; exitCode = $g.exitCode; durMs = $g.durMs; expectedKill = $g.expectedKill; timedOut = $g.timedOut
        windowHandleCount = $g.windowHits.Count; windowHits = @($g.windowHits); warnings = @($g.warnings); treeProcesses = $g.treeCount
        leftovers = @($g.leftovers); note = ($notes -join ' | '); userSaveChanged = $sc.Count; userSaveFiles = @($sc)
    }
    foreach ($k in $extra.Keys) { $res[$k] = $extra[$k] }
    New-Item -ItemType Directory -Force -Path (Join-Path $ExecDir 'done') | Out-Null
    Write-JsonAtomic (Join-Path $ExecDir ('done\' + $id + '.json')) $res
    $gpuText = ''
    if ($extra.Contains('gpu')) { $gpuText = ' gpu=[' + $extra['gpu'] + ']' }
    Write-Output ('[result] kind={0} ok={1} exit={2} dur={3}ms windows={4} leftovers={5}{6}' -f $kind, $ok, $g.exitCode, $g.durMs, $g.windowHits.Count, $g.leftovers.Count, $gpuText)
    if ($res.note) { Write-Output ('  note: ' + $res.note) }
    if ($sc.Count -gt 0) { Write-Output ('USER_SAVE changed=' + $sc.Count); foreach ($uf in $sc) { Write-Output ('  ' + $uf) } }
    foreach ($w in $g.warnings) { Write-Output ('  warn: ' + $w) }
    if ($extra.Contains('log')) { Write-Output ('  log: ' + $extra['log']) }
    if ($Json) { Write-Output ($res | ConvertTo-Json -Depth 6 -Compress) }
    $script:ExitRc = 1
    if ($ok) { $script:ExitRc = 0 }
    elseif ($g.windowHits.Count -gt 0) { $script:ExitRc = 4 }
    elseif ($sc.Count -gt 0) { $script:ExitRc = 5 }
    elseif ($g.exitCode -ne 0 -and -not $g.expectedKill) { $script:ExitRc = [math]::Abs([int]$g.exitCode) }
}

function Cmd-Player {
    if (-not $AllowPlayer) { Reject 'player 실행은 NativeQaSandbox fail-closed 가 unity/main 에 병합되기 전까지 기본 거부(사용자 실제 세이브 보호). 병합 공지 뒤 -AllowPlayer 로만 실행' }
    if ([string]::IsNullOrWhiteSpace($Exe)) { throw '-Exe 가 필요합니다.' }
    if (-not (Test-Path -LiteralPath $Exe)) { throw "플레이어를 찾을 수 없음: $Exe" }
    $exeFull = (Resolve-Path -LiteralPath $Exe).Path
    $user = Resolve-JobArgs
    $lower = @($user | ForEach-Object { $_.ToLower() })
    foreach ($bad in '-popupwindow', '-screen-fullscreen') {
        if ($lower -contains $bad) { Reject "$bad 는 창을 띄우므로 허용되지 않음 (플레이어는 -batchmode 로만, 창 없이)" }
    }
    if ($lower -contains '-nographics') { Reject '-nographics 는 GPU 를 끄므로 허용되지 않음 (GPU 캡처가 목적이면 -batchmode 만 사용)' }
    $id = [Guid]::NewGuid().ToString('N').Substring(0, 8)
    New-Item -ItemType Directory -Force -Path (Join-Path $ExecDir 'logs') | Out-Null
    $log = Join-Path $ExecDir ('logs\player-' + $id + '.log')
    $ia = @('-batchmode')
    $userLog = $null
    for ($i = 0; $i -lt $user.Count; $i++) { if ($user[$i].ToLower() -eq '-logfile' -and $i + 1 -lt $user.Count) { $userLog = $user[$i + 1] } }
    if (-not $userLog) { $ia += @('-logFile', (Q $log)) } else { $log = $userLog }
    if ($lower -notcontains '--unity-mute') { $ia += '--unity-mute' }
    $sbx = New-Sandbox $id; if ($lower -notcontains '--unity-qa-sandbox') { $ia += @('--unity-qa-sandbox', (Q $sbx)) }
    foreach ($u in $user) { if ($u.ToLower() -ne '-batchmode') { $ia += (Q $u) } }
    $plGB = 8; if ($Profile -eq 'proposed') { $plGB = 10 }
    Acquire-Slot 'devtools-player' (Split-Path $exeFull -Parent) $PID $ExecDir $plGB
    $script:SaveBefore = Get-UserSaveSnapshot
    try {
        $g = $null; $crashCause = $null; $logsUsed = @($log); $t0c = Get-Date
        for ($attempt = 1; $attempt -le 2; $attempt++) {
            $g = Invoke-Guarded $exeFull $ia (Split-Path $exeFull -Parent) $TimeoutSec $KillAfterSec @($log)
            $crashCause = Test-UnityCrash $log $g.exitCode
            if (-not $crashCause) { break }
            Record-Crash $crashCause 'player' $log
            if ($attempt -eq 1) {
                Say ("크래시 감지($crashCause) → 1회만 재시도")
                $log = $log -replace '\.log$', '-retry.log'; $logsUsed += $log
                for ($k = 0; $k -lt $ia.Count - 1; $k++) { if ($ia[$k].ToLower() -eq '-logfile') { $ia[$k + 1] = (Q $log) } }
            }
        }
        if ($crashCause) { New-Halt $crashCause 'player' $logsUsed $t0c }
        $gpu = ''; $nullGfx = $false
        if (Test-Path -LiteralPath $log) {
            $txt = [IO.File]::ReadAllText($log)
            $m = [regex]::Match($txt, '(?m)^\s*Renderer:\s*(.+?)\s*(\(ID=|$)')
            if ($m.Success) { $gpu = $m.Groups[1].Value.Trim() }
            if ($txt.Contains('Forcing GfxDevice: Null')) { $nullGfx = $true }
        }
        $fail = ''
        $extraOk = $true
        if ($nullGfx) { $extraOk = $false; $fail = 'Forcing GfxDevice: Null - GPU 렌더링 아님' }
        elseif (-not $gpu) { $fail = '그래픽 장치 이름을 로그에서 찾지 못함(GPU 확인 불가)' }
        Finish-Guarded 'player' $id $g ([ordered]@{ exe = $exeFull; args = @($ia); gpu = $gpu; gfxNull = $nullGfx; log = $log }) $extraOk $fail
    } finally { Release-Lock $PID }
    if ($rejected) { $script:ExitRc = 2 }
    exit $script:ExitRc
}

function Resolve-NodeExe {
    foreach ($c in 'C:\nvm4w\nodejs\node.exe', 'G:\NODE.JS\node.exe') { if (Test-Path -LiteralPath $c) { return $c } }
    throw 'node.exe 를 찾을 수 없음'
}

function Cmd-Browser {
    if ([string]::IsNullOrWhiteSpace($Script)) { throw '-Script 가 필요합니다.' }
    if (-not (Test-Path -LiteralPath $Script)) { throw "스크립트를 찾을 수 없음: $Script" }
    $scr = (Resolve-Path -LiteralPath $Script).Path
    $user = Resolve-JobArgs
    foreach ($u in $user) { if ($u -match '^--(headed|headless=false)$') { Reject "$u 는 창을 띄우므로 허용되지 않음" } }
    $src = [IO.File]::ReadAllText($scr)
    if ($src -match 'headless\s*:\s*false' -or $src -match '--headed' -or $src -match 'headless\s*=\s*false') { Reject 'Playwright headless:false / --headed 는 허용되지 않음 (스크립트에서 제거)' }
    $guard = Join-Path $PSScriptRoot 'exo-pw-guard.cjs'
    $node = Resolve-NodeExe
    $id = [Guid]::NewGuid().ToString('N').Substring(0, 8)
    New-Item -ItemType Directory -Force -Path (Join-Path $ExecDir 'logs') | Out-Null
    $out = Join-Path $ExecDir ('logs\browser-' + $id + '.out.log'); $err = Join-Path $ExecDir ('logs\browser-' + $id + '.err.log')
    $env:EXO_NODE_MODULES = $NodeModules; $env:EXO_PW_GUARD = '1'
    $ia = @('--require', (Q $guard), (Q $scr))
    foreach ($u in $user) { $ia += (Q $u) }
    # Start-Process 는 한 프로세스의 출력만 리다이렉트하므로 cmd 로 감싸 로그 파일에 쓴다
    $cmdline = '/c ""{0}" {1} > "{2}" 2> "{3}""' -f $node, ($ia -join ' '), $out, $err
    $script:SaveBefore = Get-UserSaveSnapshot
    $g = Invoke-Guarded 'cmd.exe' @($cmdline) (Split-Path $scr -Parent) $TimeoutSec $KillAfterSec @($scr, $guard)
    $fail = ''; $extraOk = $true; $rejected = $false
    foreach ($f in @($out, $err)) { if ((Test-Path -LiteralPath $f) -and ([IO.File]::ReadAllText($f)).Contains('EXO_REJECT')) { $rejected = $true } }
    if ($rejected) { $extraOk = $false; $fail = '가드가 headless:false/--headed 를 거부함(EXO_REJECT)' }
    Finish-Guarded 'browser' $id $g ([ordered]@{ script = $scr; args = @($user); log = $out; errLog = $err; guard = $guard }) $extraOk $fail
    if ($rejected) { $script:ExitRc = 2 }
    exit $script:ExitRc
}

function Cmd-Nw {
    Reject 'nw.js 는 창 없는 실행 방식이 없어 거부됨 (웹 검증은 headless Playwright: exo-unity.ps1 browser -Script <mjs>)'
}

# ------------------------------------------------------------------ 진입
Write-MemLog
Test-HaltGate

switch ($Command.ToLower()) {
    'start'     { Cmd-Start }
    'run'       { Cmd-Run }
    'status'    { Cmd-Status }
    'stop'      { Cmd-Stop }
    'reap'      { Cmd-Reap }
    'reserve'   { Cmd-Reserve }
    'unreserve' { Cmd-Unreserve }
    'queue'     { Cmd-Queue }
    'player'    { Cmd-Player }
    'browser'   { Cmd-Browser }
    'nw'        { Cmd-Nw }
    default     { throw "알 수 없는 명령: $Command (start|run|status|stop|reap|reserve|unreserve|queue|player|browser|nw)" }
}

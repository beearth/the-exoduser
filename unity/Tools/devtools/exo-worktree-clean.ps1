# apply는 사람이 직접 실행한다(자동 세션은 scan만).
# Windows PowerShell 5.1 / UTF-8 BOM
param(
    [Parameter(Position = 0)][ValidateSet('scan', 'apply')][string]$Command = 'scan',
    [string[]]$Root = @('E:\exoduser-wt', 'G:\exoduser-wt'),
    [string]$RepoRoot = 'G:\exoduser',
    [double]$IdleHours = 2,
    [string]$KeepFile = 'I:\EXODUSER-Storage\worktree-keep.txt',
    [string]$ActiveJson,
    [string]$Plan,
    [string]$Confirm,
    [switch]$WhatIf,
    [string]$ReportRoot = 'I:\EXODUSER-Storage\worktree-clean'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false) } catch { }
$Utf8 = New-Object System.Text.UTF8Encoding($false)
$UnityJobs = 'I:\EXODUSER-Storage\unity-jobs'
$CodexLocks = 'I:\EXODUSER-Storage\codex-runs\_locks'

function Norm([string]$Value) {
    return [IO.Path]::GetFullPath($Value).TrimEnd([char[]]@('\', '/'))
}
function Same([string]$A, [string]$B) {
    return [string]::Equals((Norm $A), (Norm $B), [StringComparison]::OrdinalIgnoreCase)
}
function Under([string]$Path, [string]$Parent) {
    $p = Norm $Path; $r = Norm $Parent
    return $p.StartsWith(($r + '\'), [StringComparison]::OrdinalIgnoreCase)
}
function ReadJson([string]$Path) {
    if (-not [IO.File]::Exists($Path)) { return $null }
    return ([IO.File]::ReadAllText($Path) | ConvertFrom-Json)
}
function Git([string]$At, [string[]]$Arguments) {
    $lines = @(& git.exe -c ('safe.directory=' + $At) -c 'core.quotePath=false' -C $At @Arguments 2>$null)
    return [pscustomobject]@{ code = $LASTEXITCODE; text = (($lines | Out-String).TrimEnd()); lines = $lines }
}
function GitOk([string]$At, [string[]]$Arguments) {
    $result = Git $At $Arguments
    if ($result.code -ne 0) { throw ('Git 실패: ' + ($Arguments -join ' ') + ' @ ' + $At) }
    return $result
}
function IsCache([string]$Relative) {
    $p = $Relative.Replace('\', '/').TrimEnd('/')
    if ($p -match '^(?i:unity)/(?:Library|Temp|Logs|obj|UserSettings)(?:/|$)') { return $true }
    if ($p -match '(?i)(?:^|/)(?:node_modules|\.vs)(?:/|$)') { return $true }
    if ($p -match '(?i)(?:^|/)(?:Build|Builds|BuildOutput|build-output)(?:/|$)') { return $true }
    if ($p -match '(?i)\.(?:csproj|sln)$') { return $true }
    return $false
}
function GetIgnoreOther([string]$Path) {
    $status = GitOk $Path @('status', '--porcelain=v1', '--ignored', '-uall')
    $other = New-Object 'System.Collections.Generic.List[string]'
    foreach ($line in $status.lines) {
        $s = [string]$line
        if (-not $s.StartsWith('!! ')) { continue }
        $relative = $s.Substring(3).Trim('"')
        if (-not (IsCache $relative)) { $other.Add($relative) }
    }
    return ,$other.ToArray()
}
function GetActivePaths([string]$Path) {
    $raw = [IO.File]::ReadAllText($Path)
    try {
        $parsed = ConvertFrom-Json -InputObject $raw
        if ($parsed -isnot [array]) { throw '배열이 아닙니다.' }
        $values = @($parsed)
        foreach ($v in $values) { if ($v -isnot [string]) { throw '문자열 경로가 아닙니다.' } }
        return [pscustomobject]@{ paths = $values; fallback = $false }
    } catch {
        # 기존 active.json의 이스케이프되지 않은 Windows 경로만 엄격하게 복구한다.
        $body = $raw.Trim()
        if (-not ($body.StartsWith('[') -and $body.EndsWith(']'))) { throw 'ActiveJson이 경로 배열이 아닙니다.' }
        $body = $body.Substring(1, $body.Length - 2)
        $values = New-Object 'System.Collections.Generic.List[string]'
        foreach ($part in ($body -split ',')) {
            if ([string]::IsNullOrWhiteSpace($part)) { continue }
            $v = $part.Trim()
            if ($v -notmatch '^"([EG]:\\[^"\r\n]+)"$') { throw 'ActiveJson 경로를 안전하게 읽지 못했습니다.' }
            $values.Add($Matches[1])
        }
        return [pscustomobject]@{ paths = $values.ToArray(); fallback = $true }
    }
}
function GetProtections([string]$KeepPath, [string]$ActivePath) {
    $paths = New-Object 'System.Collections.Generic.List[string]'
    $notes = New-Object 'System.Collections.Generic.List[string]'
    if ($KeepPath) {
        if ([IO.File]::Exists($KeepPath)) {
            foreach ($line in [IO.File]::ReadAllLines($KeepPath)) {
                $v = $line.Trim()
                if ($v -and -not $v.StartsWith('#')) { $paths.Add((Norm $v)) }
            }
        } else { $notes.Add('보호 목록 파일 없음') }
    }
    if ($ActivePath) {
        if (-not [IO.File]::Exists($ActivePath)) { throw 'ActiveJson 파일이 없습니다.' }
        $active = GetActivePaths $ActivePath
        foreach ($v in $active.paths) { $paths.Add((Norm $v)) }
        if ($active.fallback) { $notes.Add('ActiveJson 백슬래시 형식 복구') }
    }
    return [pscustomobject]@{ paths = $paths.ToArray(); notes = $notes.ToArray() }
}
function GetWorktreeMap([string]$Repo) {
    $result = GitOk $Repo @('worktree', 'list', '--porcelain')
    $map = @{}
    foreach ($line in $result.lines) {
        if ([string]$line -match '^worktree (.+)$') { $map[(Norm $Matches[1]).ToLowerInvariant()] = $true }
    }
    return $map
}
function GetBusyPaths {
    $sources = New-Object 'System.Collections.Generic.List[string]'
    $raw = New-Object 'System.Collections.Generic.List[string]'
    $lock = ReadJson (Join-Path $UnityJobs '_pc_lock.json')
    if ($lock -and $lock.worktree) { $sources.Add((Norm ([string]$lock.worktree))) }
    if ([IO.Directory]::Exists($CodexLocks)) {
        foreach ($file in [IO.Directory]::EnumerateFiles($CodexLocks, '*.json')) {
            try { $item = ReadJson $file; if ($item -and $item.worktree) { $sources.Add((Norm ([string]$item.worktree))) } }
            catch { $raw.Add('잠금 읽기 실패: ' + $file) }
        }
    }
    $queue = Join-Path $UnityJobs 'queue'
    if ([IO.Directory]::Exists($queue)) {
        foreach ($file in [IO.Directory]::EnumerateFiles($queue, '*.json')) {
            try { $raw.Add([IO.File]::ReadAllText($file)) } catch { $raw.Add('예약 읽기 실패: ' + $file) }
        }
    }
    $jobs = New-Object 'System.Collections.Generic.List[object]'
    if ([IO.Directory]::Exists($UnityJobs)) {
        foreach ($dir in [IO.Directory]::EnumerateDirectories($UnityJobs)) {
            $server = Join-Path $dir 'server.json'
            if (-not [IO.File]::Exists($server)) { continue }
            try {
                $item = ReadJson $server
                if (-not $item) { continue }
                $beat = $null
                foreach ($key in @('lastBeat', 'heartbeat', 'updatedAt')) {
                    if ($item.PSObject.Properties[$key] -and $item.$key) { $beat = [datetime]::Parse([string]$item.$key); break }
                }
                if ($beat -and ([DateTime]::UtcNow - $beat.ToUniversalTime()).TotalMinutes -le 5) {
                    $jobs.Add([pscustomobject]@{ name = [IO.Path]::GetFileName($dir); path = $(if ($item.projectPath) { [string]$item.projectPath } elseif ($item.worktree) { [string]$item.worktree } else { '' }) })
                }
            } catch { $raw.Add('서버 잠금 읽기 실패: ' + $server) }
        }
    }
    $processes = @(); $processUnknown = $false
    try {
        $processes = @(Get-CimInstance Win32_Process -ErrorAction Stop | Where-Object {
            [string]$_.Name -match '^(?i:Unity|EXODUSER-Unity|node|codex|dotnet|powershell|pwsh|bash)(?:\.exe)?$'
        } | ForEach-Object { ([string]$_.CommandLine + ' ' + [string]$_.ExecutablePath) })
    } catch { $processUnknown = $true }
    return [pscustomobject]@{ sources = $sources.ToArray(); raw = $raw.ToArray(); jobs = $jobs.ToArray(); processes = $processes; processUnknown = $processUnknown }
}
function IsBusy([string]$Path, $Busy) {
    if ($Busy.processUnknown) { return $true }
    foreach ($v in $Busy.sources) { if (Same $Path $v) { return $true } }
    foreach ($j in $Busy.jobs) {
        if ($j.name -ieq [IO.Path]::GetFileName($Path)) { return $true }
        if ($j.path -and ((Same $Path $j.path) -or (Under $j.path $Path))) { return $true }
    }
    foreach ($s in (@($Busy.raw) + @($Busy.processes))) {
        if ([string]$s -match '읽기 실패') { return $true }
        if ([string]$s -and ([string]$s).IndexOf($Path, [StringComparison]::OrdinalIgnoreCase) -ge 0) { return $true }
        $slash = $Path.Replace('\', '/')
        if ([string]$s -and ([string]$s).IndexOf($slash, [StringComparison]::OrdinalIgnoreCase) -ge 0) { return $true }
    }
    return $false
}
function GetTreeFacts([string]$Path) {
    $stack = New-Object 'System.Collections.Generic.Stack[string]'
    $stack.Push($Path)
    $links = New-Object 'System.Collections.Generic.List[object]'
    [long]$total = 0; [long]$library = 0
    $latest = [datetime]::MinValue
    while ($stack.Count -gt 0) {
        $dir = $stack.Pop()
        foreach ($child in [IO.Directory]::EnumerateDirectories($dir)) {
            $item = [IO.DirectoryInfo]::new($child)
            if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
                $target = [string]((Get-Item -LiteralPath $child -Force).Target -join '; ')
                if ($target -and -not [IO.Path]::IsPathRooted($target)) { $target = Norm (Join-Path $dir $target) }
                $external = $true
                if ($target -and [IO.Path]::IsPathRooted($target)) { $external = -not ((Same $target $Path) -or (Under $target $Path)) }
                $links.Add([pscustomobject]@{ path = $child; target = $target; external = $external; kind = 'directory' })
                continue
            }
            if ($item.Name -eq '.git') { continue }
            $stack.Push($child)
        }
        foreach ($child in [IO.Directory]::EnumerateFiles($dir)) {
            $item = [IO.FileInfo]::new($child)
            if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
                $target = [string]((Get-Item -LiteralPath $child -Force).Target -join '; ')
                if ($target -and -not [IO.Path]::IsPathRooted($target)) { $target = Norm (Join-Path $dir $target) }
                $links.Add([pscustomobject]@{ path = $child; target = $target; external = -not ($target -and ((Same $target $Path) -or (Under $target $Path))); kind = 'file' })
                continue
            }
            $relative = $child.Substring($Path.Length).TrimStart([char[]]@('\', '/'))
            [long]$total += $item.Length
            if ($relative -match '^(?i:unity)[\\/](?i:Library)[\\/]') { [long]$library += $item.Length }
            if ($relative -ne '.git' -and -not (IsCache $relative) -and $item.LastWriteTimeUtc -gt $latest) { $latest = $item.LastWriteTimeUtc }
        }
    }
    return [pscustomobject]@{ bytes = $total; libraryBytes = $library; latestUtc = $latest; links = $links.ToArray() }
}
function Assess([string]$Path, $Context) {
    $reasons = New-Object 'System.Collections.Generic.List[string]'
    $ignored = @()
    $branch = ''; $head = ''
    $registered = $Context.map.ContainsKey($Path.ToLowerInvariant())
    $rootItem = Get-Item -LiteralPath $Path -Force
    $rootIsLink = (($rootItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0)
    if (Same $Path 'G:\exoduser' -or (Same $Path 'G:\exoduser-steam') -or (Under $Path 'G:\exoduser-steam')) { $reasons.Add('사용자 체크아웃 보호') }
    if ($Context.protected.paths | Where-Object { Same $Path $_ }) { $reasons.Add('보호 목록 또는 활성 세션') }
    if (-not $registered) { $reasons.Add('Git 등록 워크트리 아님(크기 미측정)') }
    $rootLinks = @()
    if ($rootIsLink) {
        $reasons.Add('워크트리 경로가 링크(내부 미순회)')
        $rootLinks = @([pscustomobject]@{ path = $Path; target = [string]($rootItem.Target -join '; '); external = $true; kind = 'directory' })
    }
    if ($registered -and -not $rootIsLink) {
        try {
            $head = (GitOk $Path @('rev-parse', 'HEAD')).text.Trim()
            $clean = GitOk $Path @('status', '--porcelain=v1', '-uall')
            if ($clean.text) { $reasons.Add('Git 변경 또는 미추적 파일') }
            $ignored = @(GetIgnoreOther $Path)
            if ($ignored.Count) { $reasons.Add('재생성 불가 무시 파일: ' + (($ignored | Select-Object -First 10) -join ', ')) }
            $remote = GitOk $Path @('branch', '-r', '--contains', $head)
            $onRemote = [bool]$remote.text
            if (-not $onRemote) {
                foreach ($ref in @('origin/unity/main', 'origin/main')) {
                    $ancestor = Git $Path @('merge-base', '--is-ancestor', $head, $ref)
                    if ($ancestor.code -eq 0) { $onRemote = $true; break }
                }
            }
            if (-not $onRemote) { $reasons.Add('HEAD 원격 미보존') }
            $branchResult = Git $Path @('symbolic-ref', '--quiet', '--short', 'HEAD')
            if ($branchResult.code -eq 0) {
                $branch = $branchResult.text.Trim()
                $localOnly = GitOk $Path @('log', $branch, '--not', '--remotes', '--format=%H')
                if ($localOnly.text) { $reasons.Add('로컬 브랜치 미푸시 커밋') }
            }
        } catch { $reasons.Add('Git 검사 실패: ' + $_.Exception.Message) }
    }
    if (IsBusy $Path $Context.busy) { $reasons.Add('프로세스 또는 작업 잠금 사용 중') }
    $facts = $null
    if ($registered -and -not $rootIsLink) {
        try {
            $facts = GetTreeFacts $Path
            if ($facts.latestUtc -gt [DateTime]::UtcNow.AddHours(-$Context.idleHours)) { $reasons.Add('최근 파일 변경') }
        } catch { $reasons.Add('파일 순회 실패: ' + $_.Exception.Message) }
    }
    return [pscustomobject]@{
        path = $Path; name = [IO.Path]::GetFileName($Path); branch = $branch; head = $head
        decision = $(if ($reasons.Count -eq 0) { 'candidate' } else { 'keep' }); reasons = $reasons.ToArray()
        ignoredOtherCount = $ignored.Count; ignoredOtherTop10 = @($ignored | Select-Object -First 10)
        latestUtc = $(if ($facts) { $facts.latestUtc.ToString('o') } else { $null })
        bytes = $(if ($facts) { $facts.bytes } else { 0L }); libraryBytes = $(if ($facts) { $facts.libraryBytes } else { 0L })
        links = $(if ($facts) { $facts.links } else { $rootLinks })
    }
}
function GetContext([string[]]$Roots, [string]$Repo, [double]$Hours, [string]$KeepPath, [string]$ActivePath) {
    $protected = GetProtections $KeepPath $ActivePath
    return [pscustomobject]@{ roots = @($Roots | ForEach-Object { Norm $_ }); repo = (Norm $Repo)
        idleHours = $Hours; protected = $protected; map = (GetWorktreeMap (Norm $Repo)); busy = (GetBusyPaths) }
}
function DriveFree([string]$Letter) {
    try { return [math]::Round(([IO.DriveInfo]::new($Letter + ':')).AvailableFreeSpace / 1GB, 2) }
    catch { return $null }
}
function Scan {
    if ($IdleHours -lt 0) { throw '-IdleHours는 0 이상이어야 합니다.' }
    $context = GetContext $Root $RepoRoot $IdleHours $KeepFile $ActiveJson
    $rows = New-Object 'System.Collections.Generic.List[object]'
    foreach ($base in $context.roots) {
        if (-not [IO.Directory]::Exists($base)) { continue }
        foreach ($dir in [IO.Directory]::EnumerateDirectories($base)) {
            Write-Output ('검사 중: ' + $dir)
            $rows.Add((Assess (Norm $dir) $context))
        }
    }
    $reasons = @{}
    foreach ($row in $rows) { foreach ($reason in $row.reasons) {
        $key = ($reason -split ':')[0]
        if (-not $reasons.ContainsKey($key)) { $reasons[$key] = 0 }
        $reasons[$key]++
    } }
    $candidates = @($rows | Where-Object { $_.decision -eq 'candidate' })
    [long]$reclaim = 0; [int]$linkCount = 0
    foreach ($row in $candidates) { $reclaim += [long]$row.bytes }
    foreach ($row in $rows) { $linkCount += @($row.links).Count }
    $stamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
    $report = [ordered]@{
        schema = 1; createdAt = [DateTime]::UtcNow.ToString('o'); confirmCode = (Get-Random -Minimum 100000 -Maximum 1000000).ToString()
        repoRoot = $context.repo; roots = $context.roots; idleHours = $IdleHours; keepFile = $KeepFile; activeJson = $ActiveJson
        notes = @($context.protected.notes) + @('원격 ref는 로컬 보유값이며 scan은 fetch하지 않았습니다.')
        summary = [ordered]@{ candidates = $candidates.Count; reclaimBytes = $reclaim; keep = ($rows.Count - $candidates.Count)
            reasons = $reasons; links = $linkCount; freeEGB = (DriveFree 'E'); freeGGB = (DriveFree 'G') }
        worktrees = $rows.ToArray()
    }
    [IO.Directory]::CreateDirectory($ReportRoot) | Out-Null
    $json = Join-Path $ReportRoot ('scan-' + $stamp + '.json')
    $md = Join-Path $ReportRoot ('scan-' + $stamp + '.md')
    [IO.File]::WriteAllText($json, ($report | ConvertTo-Json -Depth 12), $Utf8)
    $lines = New-Object 'System.Collections.Generic.List[string]'
    $lines.Add('# 워크트리 정리 scan')
    $lines.Add('')
    $lines.Add(('후보 {0}개 / 예상 {1:N2} GB / keep {2}개 / 링크 {3}개 / E 여유 {4} GB / G 여유 {5} GB' -f $report.summary.candidates, ($reclaim / 1GB), $report.summary.keep, $linkCount, $report.summary.freeEGB, $report.summary.freeGGB))
    $lines.Add('')
    $lines.Add('| 판정 | 경로 | 전체 GB | Library GB | 링크 | 이유 |')
    $lines.Add('|---|---|---:|---:|---:|---|')
    foreach ($row in $rows) {
        $why = ($row.reasons -join '; ').Replace('|', '\|')
        $lines.Add(('| {0} | {1} | {2:N2} | {3:N2} | {4} | {5} |' -f $row.decision, $row.path, ($row.bytes / 1GB), ($row.libraryBytes / 1GB), @($row.links).Count, $why))
    }
    $lines.Add(''); $lines.Add('## 링크')
    foreach ($row in $rows) { foreach ($link in $row.links) {
        $note = $(if ($link.external) { '외부 링크 — 링크만 먼저 끊어야 함' } else { '내부 링크' })
        $lines.Add(('- {0} → {1} ({2})' -f $link.path, $link.target, $note))
    } }
    [IO.File]::WriteAllLines($md, $lines.ToArray(), $Utf8)
    Write-Output ('JSON: ' + $json); Write-Output ('MD: ' + $md)
    Write-Output ('후보 {0}개, 예상 {1:N2} GB, keep {2}개, 링크 {3}개' -f $report.summary.candidates, ($reclaim / 1GB), $report.summary.keep, $linkCount)
}
function DeleteTreeNoLinks([string]$Path) {
    $stack = New-Object 'System.Collections.Generic.Stack[string]'
    $dirs = New-Object 'System.Collections.Generic.List[string]'
    $files = New-Object 'System.Collections.Generic.List[string]'
    $stack.Push($Path)
    while ($stack.Count -gt 0) {
        $dir = $stack.Pop()
        if (([IO.File]::GetAttributes($dir) -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw ('캐시 링크: ' + $dir) }
        $dirs.Add($dir)
        foreach ($child in [IO.Directory]::EnumerateDirectories($dir)) { $stack.Push($child) }
        foreach ($file in [IO.Directory]::EnumerateFiles($dir)) {
            if (([IO.File]::GetAttributes($file) -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw ('캐시 링크: ' + $file) }
            $files.Add($file)
        }
    }
    foreach ($file in $files) {
        if (([IO.File]::GetAttributes($file) -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw ('캐시 링크: ' + $file) }
        [IO.File]::Delete($file)
    }
    for ($i = $dirs.Count - 1; $i -ge 0; $i--) { [IO.Directory]::Delete($dirs[$i]) }
}
function RemoveCacheSafely([string]$Path) {
    $cache = @('unity\Library', 'unity\Temp', 'unity\Logs', 'unity\obj', 'unity\UserSettings', 'node_modules', 'unity\node_modules', '.vs', 'unity\.vs', 'unity\Build', 'unity\Builds')
    foreach ($relative in $cache) {
        $target = Join-Path $Path $relative
        if (-not [IO.Directory]::Exists($target)) { continue }
        $facts = GetTreeFacts $target
        if (@($facts.links).Count) { throw ('캐시에 링크 발견: ' + $target) }
        DeleteTreeNoLinks $target
    }
    foreach ($extension in @('*.csproj', '*.sln')) {
        foreach ($file in [IO.Directory]::EnumerateFiles((Join-Path $Path 'unity'), $extension)) {
            $item = Get-Item -LiteralPath $file -Force
            if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw ('생성 파일 링크 발견: ' + $file) }
            [IO.File]::Delete($file)
        }
    }
}
function Apply {
    if (-not $Plan -or -not [IO.File]::Exists($Plan)) { throw '-Plan scan json이 필요합니다.' }
    $data = ReadJson $Plan
    if (-not $data -or $data.schema -ne 1 -or [string]$data.confirmCode -cnotmatch '^\d{6}$' -or $Confirm -cne [string]$data.confirmCode) { throw 'scan 확인 코드가 일치하지 않습니다.' }
    $context = GetContext @($data.roots) ([string]$data.repoRoot) ([double]$data.idleHours) ([string]$data.keepFile) ([string]$data.activeJson)
    $log = New-Object 'System.Collections.Generic.List[string]'
    $stamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
    $removed = 0
    foreach ($entry in @($data.worktrees | Where-Object { $_.decision -eq 'candidate' })) {
        $path = Norm ([string]$entry.path)
        if (-not ($context.roots | Where-Object { (Split-Path $path -Parent) -ieq $_ }) -or
            -not [IO.Directory]::Exists($path) -or
            (Same $path 'G:\exoduser') -or (Same $path 'G:\exoduser-steam') -or (Under $path 'G:\exoduser-steam')) {
            $log.Add('건너뜀: 허용 워크트리 경로 아님 ' + $path); continue
        }
        $current = Assess $path $context
        if ($current.decision -ne 'candidate') { $log.Add(('건너뜀: {0}: {1}' -f $path, ($current.reasons -join '; '))); continue }
        if ($WhatIf) {
            $log.Add(('WhatIf: {0}: 링크 {1}개 자체 제거 → 링크 0 재확인 → git worktree remove (실패 시 캐시 정리 후 1회 재시도)' -f $path, @($current.links).Count))
            continue
        }
        try {
            foreach ($link in $current.links) {
                if (-not $link.target) { throw ('링크 대상 불명: ' + $link.path) }
                $targetExists = Test-Path -LiteralPath $link.target
                if (-not $targetExists) { throw ('링크 대상 존재 확인 실패: ' + $link.target) }
                if ($link.kind -eq 'directory') { [IO.Directory]::Delete([string]$link.path) }
                else { [IO.File]::Delete([string]$link.path) }
                if ($targetExists -and -not (Test-Path -LiteralPath $link.target)) { throw ('링크 대상 사라짐: ' + $link.target) }
                $log.Add('링크 자체 제거: ' + $link.path)
            }
            $after = GetTreeFacts $path
            if (@($after.links).Count) { throw '링크가 남아 있습니다.' }
            $result = Git $context.repo @('worktree', 'remove', $path)
            if ($result.code -ne 0) {
                $log.Add('worktree remove 실패, 캐시 정리 뒤 재시도: ' + $path)
                RemoveCacheSafely $path
                $result = Git $context.repo @('worktree', 'remove', $path)
            }
            if ($result.code -ne 0) { throw 'worktree remove 재시도 실패' }
            $removed++
            $log.Add('제거 완료: ' + $path)
        } catch { $log.Add(('항목 실패: {0}: {1}' -f $path, $_.Exception.Message)) }
    }
    # 공통 운영 규칙상 prune은 금지한다. worktree remove가 성공한 항목만 기록한다.
    [IO.Directory]::CreateDirectory($ReportRoot) | Out-Null
    $logPath = Join-Path $ReportRoot ('apply-' + $stamp + '.log')
    [IO.File]::WriteAllLines($logPath, $log.ToArray(), $Utf8)
    $log | Write-Output
    Write-Output ('로그: ' + $logPath)
}

try {
    if ($Command -eq 'scan') { Scan } else { Apply }
} catch {
    [Console]::Error.WriteLine('[exo-worktree-clean] ' + $_.Exception.Message + ' ' + $_.ScriptStackTrace)
    exit 2
}

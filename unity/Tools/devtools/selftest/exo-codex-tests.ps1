# exo-codex.ps1의 실행 없는 경로 검사
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$scriptPath = Join-Path (Split-Path $PSScriptRoot -Parent) 'exo-codex.ps1'
$worktree = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')).Path
$brief = Join-Path $PSScriptRoot 'brief-selftest.md'
$shell = Join-Path $PSHOME 'powershell.exe'
$bytes = [IO.File]::ReadAllBytes($scriptPath)
if ($bytes.Length -lt 3 -or $bytes[0] -ne 239 -or $bytes[1] -ne 187 -or $bytes[2] -ne 191) { throw 'UTF-8 BOM 없음' }

function Invoke-Case([string]$name, [string[]]$arguments, [int]$expected) {
    $ErrorActionPreference = 'Continue'
    & $shell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $scriptPath @arguments 2>$null | Out-Null
    $actual = $LASTEXITCODE
    if ($actual -ne $expected) { throw "$name 기대=$expected 실제=$actual" }
    Write-Output "$name=$actual"
}

$tokens = $null
$errors = $null
[System.Management.Automation.Language.Parser]::ParseFile($scriptPath, [ref]$tokens, [ref]$errors) | Out-Null
if ($errors.Count -ne 0) { throw "구문 오류=$($errors.Count)" }
Write-Output '구문=0'
Invoke-Case '메인 체크아웃 거부' @('run', '-Worktree', 'G:\exoduser', '-Brief', $brief, '-Name', 'selftest-main') 2
Invoke-Case '잘못된 이름 거부' @('run', '-Worktree', $worktree, '-Brief', $brief, '-Name', 'BAD_NAME') 2

$probeDir = Join-Path $PSScriptRoot ('_cli-probe-' + [Guid]::NewGuid().ToString('N'))
try {
    [IO.Directory]::CreateDirectory($probeDir) | Out-Null
    $empty = Join-Path $probeDir 'empty.txt'
    [IO.File]::WriteAllText($empty, '')
    $cli = (Get-Command 'codex.cmd' -ErrorAction Stop).Source
    $probe = Start-Process -FilePath $cli -ArgumentList '--version' -PassThru -Wait -WindowStyle Hidden `
        -RedirectStandardInput $empty -RedirectStandardOutput (Join-Path $probeDir 'out.txt') `
        -RedirectStandardError (Join-Path $probeDir 'err.txt')
    if ($probe.ExitCode -ne 0) { throw "Codex CLI 버전 조회 종료 코드=$($probe.ExitCode)" }
    Write-Output '숨김 실행·빈 stdin·출력 분리 버전 조회=0'
} finally {
    $safeProbe = [IO.Path]::GetFullPath($probeDir)
    $safeParent = [IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\') + '\'
    if ($safeProbe.StartsWith($safeParent, [StringComparison]::OrdinalIgnoreCase) -and
        (Test-Path -LiteralPath $safeProbe)) { Remove-Item -LiteralPath $safeProbe -Recurse -Force }
}

# I: 쓰기 권한 없는 점검에서도 실제 실행 흐름을 확인하도록 테스트 사본의 기록 경로만 바꾼다.
$localRoot = Join-Path $PSScriptRoot ('_local-runs-' + [Guid]::NewGuid().ToString('N'))
$localScript = Join-Path $PSScriptRoot '_local-exo-codex.ps1'
try {
    $source = [IO.File]::ReadAllText($scriptPath)
    $source = $source.Replace('I:\EXODUSER-Storage\codex-runs', $localRoot)
    [IO.File]::WriteAllText($localScript, $source, (New-Object System.Text.UTF8Encoding($true)))
    $ErrorActionPreference = 'Continue'
    $output = @(& $shell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $localScript run `
        -Worktree $worktree -Brief $brief -Name selftest-dryrun -DryRun 2>$null)
    $dryCode = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($dryCode -ne 0) { throw "로컬 DryRun 종료 코드=$dryCode" }
    $runDir = [string]($output | Select-Object -Last 1)
    foreach ($file in @('brief.md', 'prompt.md', 'meta.json')) {
        if (-not (Test-Path -LiteralPath (Join-Path $runDir $file) -PathType Leaf)) { throw "로컬 DryRun 파일 누락: $file" }
    }
    $prompt = [IO.File]::ReadAllText((Join-Path $runDir 'prompt.md'))
    if (-not $prompt.StartsWith([IO.File]::ReadAllText($brief))) { throw '원본 브리프 접두부 불일치' }
    if (-not $prompt.Contains('표준 실행 규칙') -or -not $prompt.Contains('game.html')) { throw '표준 규칙 블록 누락' }
    if (Test-Path -LiteralPath (Join-Path $runDir 'codex.log')) { throw 'DryRun에서 Codex 로그 생성' }
    $meta = [IO.File]::ReadAllText((Join-Path $runDir 'meta.json')) | ConvertFrom-Json
    if (-not $meta.dryRun -or $meta.exitCode -ne 0) { throw 'DryRun 메타 표시 누락' }
    Write-Output '로컬 경로 치환 DryRun=0, 필수 파일 3개 확인'

    $lockPath = Join-Path (Join-Path $localRoot '_locks') ((Split-Path $worktree -Leaf) + '.json')
    $lock = [IO.File]::Open($lockPath, 'CreateNew', 'Write', 'Read')
    try {
        $content = [Text.Encoding]::UTF8.GetBytes((@{ owner = 'selftest'; pid = $PID; worktree = $worktree } | ConvertTo-Json))
        $lock.Write($content, 0, $content.Length)
    } finally { $lock.Dispose() }
    try {
        $ErrorActionPreference = 'Continue'
        $null = & $shell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $localScript run `
            -Worktree $worktree -Brief $brief -Name selftest-locked -DryRun 2>$null
        $lockCode = $LASTEXITCODE
        $ErrorActionPreference = 'Stop'
        if ($lockCode -ne 4) { throw "잠금 거부 기대=4 실제=$lockCode" }
        Write-Output '살아 있는 잠금 거부=4'
    } finally {
        $held = [IO.File]::ReadAllText($lockPath) | ConvertFrom-Json
        if ([int]$held.pid -eq $PID -and $held.owner -eq 'selftest') { Remove-Item -LiteralPath $lockPath -Force }
    }

    $slotPaths = @()
    try {
        foreach ($slug in @('slot-a', 'slot-b', 'slot-c')) {
            $slotPath = Join-Path (Join-Path $localRoot '_locks') ($slug + '.json')
            $slotPaths += $slotPath
            $slot = [IO.File]::Open($slotPath, 'CreateNew', 'Write', 'Read')
            try {
                $content = [Text.Encoding]::UTF8.GetBytes((@{ owner = 'selftest'; pid = $PID } | ConvertTo-Json))
                $slot.Write($content, 0, $content.Length)
            } finally { $slot.Dispose() }
        }
        $ErrorActionPreference = 'Continue'
        $null = & $shell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $localScript run `
            -Worktree $worktree -Brief $brief -Name selftest-cap -DryRun 2>$null
        $capCode = $LASTEXITCODE
        $ErrorActionPreference = 'Stop'
        if ($capCode -ne 4) { throw "동시 실행 상한 기대=4 실제=$capCode" }
        Write-Output '동시 실행 상한 거부=4'
    } finally {
        foreach ($slotPath in $slotPaths) {
            if (-not (Test-Path -LiteralPath $slotPath)) { continue }
            $held = [IO.File]::ReadAllText($slotPath) | ConvertFrom-Json
            if ([int]$held.pid -eq $PID -and $held.owner -eq 'selftest') { Remove-Item -LiteralPath $slotPath -Force }
        }
    }

    $ErrorActionPreference = 'Continue'
    $backgroundOutput = @(& $shell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $localScript run `
        -Worktree $worktree -Brief $brief -Name selftest-background -DryRun -Background 2>$null)
    $backgroundCode = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($backgroundCode -ne 0) { throw "백그라운드 시작 기대=0 실제=$backgroundCode" }
    $backgroundDir = [string]($backgroundOutput | Select-Object -Last 1)
    $backgroundMeta = Join-Path $backgroundDir 'meta.json'
    $complete = $false
    for ($i = 0; $i -lt 60; $i++) {
        if (Test-Path -LiteralPath $backgroundMeta) {
            $record = [IO.File]::ReadAllText($backgroundMeta) | ConvertFrom-Json
            if ($record.dryRun -and $record.exitCode -eq 0) { $complete = $true; break }
        }
        Start-Sleep -Milliseconds 250
    }
    if (-not $complete) { throw '백그라운드 DryRun 기록 누락' }
    $closed = $false
    for ($i = 0; $i -lt 80; $i++) {
        if (-not (Test-Path -LiteralPath $lockPath)) {
            try {
                $streams = @()
                foreach ($file in @('background-stdin.tmp', 'background-out.tmp', 'background-err.tmp')) {
                    $streams += [IO.File]::Open((Join-Path $backgroundDir $file), 'Open', 'ReadWrite', 'None')
                }
                $closed = $true
            } catch { }
            finally { foreach ($stream in $streams) { $stream.Dispose() } }
            if ($closed) { break }
        }
        Start-Sleep -Milliseconds 250
    }
    if (-not $closed) { throw '백그라운드 프로세스 종료 확인 실패' }
    Write-Output '로컬 경로 치환 백그라운드 DryRun=0, meta.json 확인'
} finally {
    if (Test-Path -LiteralPath $localScript) { Remove-Item -LiteralPath $localScript -Force }
    $safeRoot = [IO.Path]::GetFullPath($localRoot)
    $safeParent = [IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\') + '\'
    if ($safeRoot.StartsWith($safeParent, [StringComparison]::OrdinalIgnoreCase) -and
        (Test-Path -LiteralPath $safeRoot)) { Remove-Item -LiteralPath $safeRoot -Recurse -Force }
}

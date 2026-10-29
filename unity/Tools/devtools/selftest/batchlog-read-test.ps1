param(
    [switch]$ExpectLegacyThrow,
    [string]$TestRoot = 'I:\EXODUSER-Storage\codex-takeover\runner-batchlog-fix-20261029\fixtures'
)

$ErrorActionPreference = 'Stop'
$source = Join-Path $PSScriptRoot '..\exo-unity.ps1'
$tokens = $null; $parseErrors = $null
$ast = [Management.Automation.Language.Parser]::ParseFile($source, [ref]$tokens, [ref]$parseErrors)
if ($parseErrors.Count) { throw "runner parse errors: $($parseErrors.Count)" }
foreach ($name in @('NowIso', 'Write-JsonAtomic', 'Get-UserSaveSnapshot', 'Compare-UserSave', 'Apply-SaveCheck', 'Parse-BatchLog', 'Result-ExitCode')) {
    $fn = $ast.Find({ param($node) $node -is [Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq $name }, $true)
    if (-not $fn) { throw "missing runner function: $name" }
    Invoke-Expression $fn.Extent.Text
}

function Assert([bool]$condition, [string]$message) { if (-not $condition) { throw $message } }

$case = Join-Path $TestRoot ([Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $case -Force | Out-Null
$log = Join-Path $case 'locked.log'
[IO.File]::WriteAllText($log, 'Total: 1.5 seconds - Initiated by InitialRefreshV2')
$lock = [IO.File]::Open($log, [IO.FileMode]::Open, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
try {
    $threw = $false
    try { $result = Parse-BatchLog $log 'locked' 'PortVerification.Build' 0 $true 100 } catch [IO.IOException] { $threw = $true }
    if ($ExpectLegacyThrow) {
        Assert $threw 'legacy lock reproduction did not throw'
        Write-Output 'PASS: old Parse-BatchLog throws IOException on FileShare.None log lock'
        return
    }
    Assert (-not $threw) 'locked log still throws'
    Assert (-not $result.ok) 'locked log was reported PASS'
    Assert ($result.note -match '로그 읽기 실패') 'locked log has no failure reason'
    Assert ((Result-ExitCode $result) -ne 0) 'locked log has zero result exit code'
} finally { $lock.Dispose() }

$missing = Parse-BatchLog (Join-Path $case 'missing.log') 'missing' 'PortVerification.Build' 0 $true 100
Assert (-not $missing.ok) 'missing log was reported PASS'
Assert ($missing.note -match '로그 파일이 없음') 'missing log has no reason'

$normalLog = Join-Path $case 'normal.log'
[IO.File]::WriteAllText($normalLog, "Total: 1.5 seconds - Initiated by InitialRefreshV2`ncompile time=42`n")
$normal = Parse-BatchLog $normalLog 'normal' 'PortVerification.Build' 0 $true 100
Assert ($normal.ok -and $normal.refreshMs -eq 1500 -and $normal.compileMs -eq 42) 'normal parse changed'

$originalProfile = $env:USERPROFILE
try {
    $env:USERPROFILE = Join-Path $case 'fake-profile'
    $Root = Join-Path $case 'runner-root'
    $Utf8NoBom = [Text.UTF8Encoding]::new($false)
    $saveDir = Join-Path $env:USERPROFILE 'AppData\LocalLow\ForDearGamers'
    New-Item -ItemType Directory -Path $saveDir -Force | Out-Null
    New-Item -ItemType Directory -Path $Root -Force | Out-Null
    $save = Join-Path $saveDir 'fixture-save.json'
    [IO.File]::WriteAllText($save, '{"fixture":1}')
    $before = Get-UserSaveSnapshot
    [IO.File]::WriteAllText($save, '{"fixture":2,"changed":true}')
    $lock = [IO.File]::Open($log, [IO.FileMode]::Open, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    try { $result = Parse-BatchLog $log 'save-check' 'PortVerification.Build' 1 $true 100 } finally { $lock.Dispose() }
    Apply-SaveCheck $result $before (Join-Path $Root 'sandbox')
    $done = Join-Path $Root 'done\save-check.json'
    Write-JsonAtomic $done $result
    $receipt = Get-Content -LiteralPath $done -Raw | ConvertFrom-Json
    Assert (-not $receipt.ok -and $receipt.userSaveChanged -eq 1) 'done JSON lost failure or save comparison'
    Assert ($receipt.userSaveFiles.Count -eq 1) 'done JSON lost changed fake save path'
    Assert ($receipt.note -match '로그 읽기 실패' -and $receipt.note -match 'USER_SAVE changed=1') 'done JSON lost reasons'
    Assert ((Result-ExitCode $result) -ne 0) 'save failure has zero exit code'
} finally { $env:USERPROFILE = $originalProfile }

Write-Output "PASS: lock failure, missing log, normal parse, fake USER_SAVE comparison and done JSON ($case)"

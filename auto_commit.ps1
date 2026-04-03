Set-Location -LiteralPath "G:\hell"

$logPath = "G:\hell\auto-push.log"
$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'

function Write-Log {
    param([string]$Message)
    Add-Content -Path $logPath -Value "[$stamp] $Message"
}

$status = git status --porcelain
if (-not $status) {
    Write-Log "no changes, skip"
    exit 0
}

git add -A

# 변경 파일 목록 → CHANGELOG_SYNC.md 자동 추가
$changed = @(git -c core.quotePath=false diff --cached --name-only --diff-filter=ACMR | Where-Object { $_ -and $_.Trim().Length -gt 0 })
if ($changed.Count -gt 0) {
    $clPath = "docs\CHANGELOG_SYNC.md"
    $header = "`n## $stamp (auto)`n"
    $body = ($changed | ForEach-Object { "- $_" }) -join "`n"
    Add-Content -Path $clPath -Value "$header$body`n"
    git add $clPath
}

$branch = (git branch --show-current).Trim()
if (-not $branch) {
    Write-Log "FAIL: could not detect current branch"
    exit 1
}

$msg = "auto: $stamp sync snapshot"
git commit -m $msg 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Log "FAIL: commit failed"
    exit 1
}

git push origin HEAD 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Log "FAIL: push failed on branch $branch"
    exit 1
}

Write-Log "OK: commit + push on $branch"

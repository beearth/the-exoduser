Set-Location -Path "G:\hell"
git add -A
$d = Get-Date -Format 'yyyy-MM-dd HH:mm'
$msg = "auto: $d auto-save"
$status = git status --porcelain
if ($status) {
    git commit -m $msg
    $pushResult = git push origin main 2>&1
    if ($LASTEXITCODE -ne 0) {
        $logMsg = "[$d] PUSH FAIL: $pushResult"
        Add-Content -Path "G:\hell\auto-push.log" -Value $logMsg
    } else {
        Add-Content -Path "G:\hell\auto-push.log" -Value "[$d] OK: commit + push"
    }
} else {
    Add-Content -Path "G:\hell\auto-push.log" -Value "[$d] no changes, skip"
}

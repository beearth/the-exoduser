Set-Location -Path "G:\hell"
git add -A
$d = Get-Date -Format 'yyyy-MM-dd HH:mm'
$msg = "auto: $d auto-save"
$status = git status --porcelain
if ($status) {
    git commit -m $msg
    git push
}

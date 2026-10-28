# exo-unity.ps1 인자 해석 단위 시험(Unity 실행 없음): run / player / build 에서 쉼표 형식·배열 형식·-ArgsJson 이 같은 결과를 내는지 확인한다.
# 사용: powershell -NoProfile -ExecutionPolicy Bypass -File args-test.ps1
$ErrorActionPreference = 'Stop'
$x = Join-Path (Split-Path $PSScriptRoot -Parent) 'exo-unity.ps1'
$wt = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')).Path
$exe = 'C:\Windows\System32\charmap.exe'   # player 인자 해석 시험용(실행하지 않음)
$want = @{
    run    = '[dryrun] run method=PortVerification.Build args=["-output","I:/x","-receipt","I:/y"]'
    build  = '[dryrun] run method=PortVerification.Build args=["-buildTarget","Win64","-output","I:/x","-receipt","I:/y"]'
    player = '[dryrun] player exe=' + $exe + ' desktop=hidden args=["--unity-hud-smoke","-output","I:/x"]'
}
$cases = New-Object System.Collections.Generic.List[object]
function Run-Case([string]$cmd, [string]$form, [scriptblock]$call, [string]$expect) {
    $out = (& $call 2>&1 | Out-String).Trim()
    $line = ($out -split "`r?`n" | Where-Object { $_ -like '[[]dryrun]*' } | Select-Object -First 1)
    $pass = ($line -eq $expect)
    $cases.Add([pscustomobject]@{ cmd = $cmd; form = $form; pass = $pass; got = $line })
    if (-not $pass) { $cases[$cases.Count - 1].got = "GOT: $line | WANT: $expect | RAW: $out" }
}
# run / build: 인자 -output I:/x -receipt I:/y
foreach ($c in 'run', 'build') {
    $exp = $want[$c]
    Run-Case $c 'comma'  { & $x $c -Worktree $wt -Method PortVerification.Build -Args '-output,I:/x,-receipt,I:/y' -DryRun } $exp
    Run-Case $c 'array'  { & $x $c -Worktree $wt -Method PortVerification.Build -Args '-output', 'I:/x', '-receipt', 'I:/y' -DryRun } $exp
    Run-Case $c 'json'   { & $x $c -Worktree $wt -Method PortVerification.Build -ArgsJson '["-output","I:/x","-receipt","I:/y"]' -DryRun } $exp
    Run-Case $c 'file-comma' { powershell -NoProfile -ExecutionPolicy Bypass -File $x $c -Worktree $wt -Method PortVerification.Build -Args '-output,I:/x,-receipt,I:/y' -DryRun } $exp
}
# build: -Method 생략, -buildTarget 을 이미 준 경우 중복 없음
Run-Case 'build' 'no-method' { & $x build -Worktree $wt -Args '-output,I:/x,-receipt,I:/y' -DryRun } $want['build']
Run-Case 'build' 'has-buildTarget' { & $x build -Worktree $wt -Method PortVerification.Build -Args '-buildTarget,Win64,-output,I:/x,-receipt,I:/y' -DryRun } $want['build']
# player: --unity-hud-smoke -output I:/x
$pexp = $want['player']
Run-Case 'player' 'comma' { & $x player -Exe $exe -Args '--unity-hud-smoke,-output,I:/x' -DryRun } $pexp
Run-Case 'player' 'array' { & $x player -Exe $exe -Args '--unity-hud-smoke', '-output', 'I:/x' -DryRun } $pexp
Run-Case 'player' 'json'  { & $x player -Exe $exe -ArgsJson '["--unity-hud-smoke","-output","I:/x"]' -DryRun } $pexp
Run-Case 'player' 'file-comma' { powershell -NoProfile -ExecutionPolicy Bypass -File $x player -Exe $exe -Args '--unity-hud-smoke,-output,I:/x' -DryRun } $pexp
$cases | ForEach-Object { '{0,-7} {1,-16} {2}' -f $_.cmd, $_.form, $(if ($_.pass) { 'PASS' } else { 'FAIL ' + $_.got }) }
$bad = @($cases | Where-Object { -not $_.pass }).Count
'total={0} fail={1}' -f $cases.Count, $bad
exit $bad

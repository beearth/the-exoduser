param([Parameter(Mandatory=$true)][string]$OutputDirectory)
$ErrorActionPreference='Stop'
if(-not [IO.Path]::IsPathRooted($OutputDirectory)){throw 'absolute output path required'}
New-Item -ItemType Directory -Path $OutputDirectory -Force|Out-Null
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$text=[IO.File]::ReadAllText($source)
$tokens=$null;$errors=$null
[void][Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw ($errors|Out-String)}
$start=$text.IndexOf("`$ErrorActionPreference = 'Stop'")
$end=$text.IndexOf('$ExoUnityVersion',$start)
$block=$text.Substring($start,$end-$start)
$shared=Join-Path $OutputDirectory 'fake-bin.ps1'
$harness=Join-Path $OutputDirectory 'harness.ps1'
$utf8=New-Object Text.UTF8Encoding($true)
$fake=@'
param([string]$Command,[string]$Worktree)
Write-Output ('delegated:'+$Command+':'+$Worktree)
exit 7
'@
[IO.File]::WriteAllText($shared,$fake,$utf8)
$local="
Write-Output 'local-body';exit 0
"
$param='param([string]$Command='+"'status'"+',[string]$Worktree)'+[Environment]::NewLine
function Save-Harness([string]$target){
    $testBlock=$block.Replace('I:/EXODUSER-Storage/unity-jobs/bin/exo-unity.ps1',$target.Replace('\','/'))
    [IO.File]::WriteAllText($harness,$param+$testBlock+$local,$utf8)
}
function Run-Case([string]$name,[string]$command,[string]$noForward,[int]$expected,[string]$marker){
    $info=New-Object Diagnostics.ProcessStartInfo
    $info.FileName='C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe'
    $info.Arguments='-NoProfile -NonInteractive -WindowStyle Hidden -Command "& '''+$harness+''' -Command '''+$command+''' -Worktree ''sentinel''; exit $LASTEXITCODE"'
    $info.UseShellExecute=$false;$info.CreateNoWindow=$true
    $info.RedirectStandardOutput=$true;$info.RedirectStandardError=$true
    $info.EnvironmentVariables['EXO_UNITY_NO_FORWARD']=$noForward
    $process=[Diagnostics.Process]::Start($info)
    $stdout=$process.StandardOutput.ReadToEnd();$stderr=$process.StandardError.ReadToEnd()
    $process.WaitForExit()
    $ok=$process.ExitCode -eq $expected -and ($stdout+$stderr).Contains($marker)
    $row=[pscustomobject]@{name=$name;exitCode=$process.ExitCode;expected=$expected;passed=$ok;stdout=$stdout;stderr=$stderr}
    $process.Dispose()
    if(-not $ok){throw ($row|ConvertTo-Json)}
    return $row
}
Save-Harness $shared
$rows=@(Run-Case 'delegate-and-return-exit' 'status' '' 7 'delegated:status:sentinel')
$rows+=Run-Case 'install-bin-local' 'install-bin' '' 0 'local-body'
$rows+=Run-Case 'explicit-no-forward-local' 'status' '1' 0 'local-body'
Save-Harness $harness
$rows+=Run-Case 'self-path-local' 'status' '' 0 'local-body'
Save-Harness (Join-Path $OutputDirectory 'missing-bin.ps1')
$rows+=Run-Case 'missing-bin-nonzero' 'status' '' 1 'Shared Unity runner missing:'
[pscustomobject]@{scope='Actual forwarding block in isolated child PowerShell; real install/Unity/shared bin untouched';sourceSha256=(Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash;cases=$rows}|ConvertTo-Json -Depth 5|Set-Content -LiteralPath (Join-Path $OutputDirectory 'receipt.json') -Encoding UTF8
Write-Output ('forwarding regression passed '+$rows.Count+'/5')

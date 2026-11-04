$ErrorActionPreference='Stop'
# 11-04 CTO (contaminated boot): a zombie HALT (what=player) lets Editor batch builds go on, makes other owners' Players wait
# (not refuse) up to -WaitMin, and the exempt A/B owner runs at most maxRuns and stops at 4 zombies. Unity launches=0.
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($f in $ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)){. ([scriptblock]::Create($f.Extent.Text))}
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
function Say($m){}
$Root=Join-Path 'I:/EXODUSER-Storage/devtools/fix-1104-zombiehalt' ('fixture-'+[guid]::NewGuid().ToString('N'))
$HaltPath=Join-Path $Root 'HALT';$Utf8NoBom=New-Object Text.UTF8Encoding($false)
function Child($owner,$cmd,$waitMin){
 $child=Join-Path $Root ('child-'+[guid]::NewGuid().ToString('N')+'.ps1')
 $body="`$ErrorActionPreference='Stop'`n`$tokens=`$null;`$errors=`$null;`$ast=[Management.Automation.Language.Parser]::ParseFile('"+$source+"',[ref]`$tokens,[ref]`$errors)`nforeach(`$f in `$ast.FindAll({param(`$x) `$x -is [Management.Automation.Language.FunctionDefinitionAst]},`$true)){. ([scriptblock]::Create(`$f.Extent.Text))}`nfunction Say(`$m){}`n`$Root='"+$Root+"';`$HaltPath='"+$HaltPath+"';`$Owner='"+$owner+"';`$Command='"+$cmd+"';`$WaitMin="+$waitMin+";`$PollSec=0`nTest-HaltGate`nAssert-HaltClear 'x'`nexit 0`n"
 [IO.File]::WriteAllText($child,$body,(New-Object Text.UTF8Encoding($true)))
 $p=Start-Process powershell -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File',$child -WindowStyle Hidden -PassThru -Wait
 return $p.ExitCode
}
try {
 New-Item -ItemType Directory -Force -Path $Root|Out-Null
 Write-JsonAtomic $HaltPath ([ordered]@{time=(NowIso);cause='재부팅 필요: 종료 못 한 Player 좀비 2개 - EXODUSER-A2R:1(스레드1)';what='player'})
 Check (Test-ZombieHalt) 'zombie HALT not recognised'
 Check ((Child 'map-lane' 'build' 0) -eq 0) 'Editor batch build refused during a zombie HALT'
 Check ((Child 'map-lane' 'player' 0) -eq 3) 'Player did not end with exit 3 after its HALT wait'
 Check ((Child 'map-lane' 'start' 0) -eq 3) 'Editor server start allowed during HALT'
 Write-JsonAtomic $HaltPath ([ordered]@{time=(NowIso);cause='exit code 0xC0000005 (access violation)';what='PortVerification.Build'})
 Check (-not (Test-ZombieHalt)) 'crash HALT treated as zombie HALT'
 Check ((Child 'map-lane' 'build' 0) -eq 3) 'build allowed during a crash HALT'
 # exempt run cap
 $ex=Join-Path $Root '_halt_exempt.json'
 Write-JsonAtomic $ex ([ordered]@{owners=@('claude-quit-fix');expiresAt=([DateTime]::UtcNow.AddHours(1).ToString('o'));maxRuns=2;used=0})
 $Owner='claude-quit-fix'
 Check (Test-HaltExempt) 'exempt owner refused under the cap'
 Add-HaltExemptRun; Add-HaltExemptRun
 Check (-not (Test-HaltExempt)) 'exempt owner allowed past maxRuns'
 $body=$ast.Extent.Text
 Check ($body.Contains("if (`$zombies.Count -ge 4 -and (Test-HaltExempt)) { Reject")) '4-zombie stop missing'
 Check ($body.Contains('if ((Test-Path -LiteralPath $HaltPath) -and (Test-HaltExempt)) { Add-HaltExemptRun }')) 'exempt run not counted at admission'
 'PASS: '+$n+' zombie-HALT decisions; Unity launches=0'
} finally {
 if((Test-Path $Root) -and [IO.Path]::GetFullPath($Root).StartsWith('I:\EXODUSER-Storage\devtools\fix-1104-zombiehalt\fixture-')){Remove-Item -LiteralPath $Root -Recurse -Force}
}

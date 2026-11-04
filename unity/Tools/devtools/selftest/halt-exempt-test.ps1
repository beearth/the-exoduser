$ErrorActionPreference='Stop'
# 11-04 CTO: HALT stays (zombie 14612 is evidence), but the quit-hang A/B owner may keep running build/player during HALT.
# Only owners listed in _halt_exempt.json before its expiry pass; everyone else is still refused. Unity launches=0.
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($f in $ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)){. ([scriptblock]::Create($f.Extent.Text))}
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
function Say($m){}
$Root=Join-Path 'I:/EXODUSER-Storage/devtools/fix-1104-haltexempt' ('fixture-'+[guid]::NewGuid().ToString('N'))
$HaltPath=Join-Path $Root 'HALT';$Utf8NoBom=New-Object Text.UTF8Encoding($false)
try {
 New-Item -ItemType Directory -Force -Path $Root|Out-Null
 [IO.File]::WriteAllText($HaltPath,'{"cause":"test zombie"}')
 $ex=Join-Path $Root '_halt_exempt.json'
 Write-JsonAtomic $ex ([ordered]@{owners=@('claude-quit-fix');expiresAt=([DateTime]::UtcNow.AddHours(1).ToString('o'));note='t'})
 $Owner='claude-quit-fix'
 Check (Test-HaltExempt) 'listed owner not exempt'
 Assert-HaltClear 'Player 슬롯'; $script:n++   # returns instead of exit 3
 $Command='player'; Test-HaltGate; $script:n++
 $Owner='codex-map-swamp'
 Check (-not (Test-HaltExempt)) 'other owner exempt'
 $Owner=''
 Check (-not (Test-HaltExempt)) 'empty owner exempt'
 Write-JsonAtomic $ex ([ordered]@{owners=@('claude-quit-fix');expiresAt=([DateTime]::UtcNow.AddMinutes(-1).ToString('o'));note='t'})
 $Owner='claude-quit-fix'
 Check (-not (Test-HaltExempt)) 'expired exemption still passes'
 Remove-Item -LiteralPath $ex -Force
 Check (-not (Test-HaltExempt)) 'missing file exempts'
 $gate=($ast.FindAll({param($x) $x -is [Management.Automation.Language.FunctionDefinitionAst] -and $x.Name -eq 'Test-HaltGate'},$true)|Select-Object -First 1).Extent.Text
 Check ($gate.Contains("-in 'build', 'player') -and (Test-Path -LiteralPath `$HaltPath) -and (Test-HaltExempt)")) 'exemption reaches commands other than build/player'
 $cp=($ast.FindAll({param($x) $x -is [Management.Automation.Language.FunctionDefinitionAst] -and $x.Name -eq 'Cmd-Player'},$true)|Select-Object -First 1).Extent.Text
 Check ($cp.Contains('elseif ($zombies.Count) { Stop-ForZombies $zombies')) 'non-exempt zombie path changed'
 # child process: a non-exempt owner is still refused with exit 3 during HALT
 $child=Join-Path $Root 'child.ps1'
 [IO.File]::WriteAllText($child,("`$ErrorActionPreference='Stop'`n`$tokens=`$null;`$errors=`$null;`$ast=[Management.Automation.Language.Parser]::ParseFile('"+$source+"',[ref]`$tokens,[ref]`$errors)`nforeach(`$f in `$ast.FindAll({param(`$x) `$x -is [Management.Automation.Language.FunctionDefinitionAst]},`$true)){. ([scriptblock]::Create(`$f.Extent.Text))}`nfunction Say(`$m){}`n`$Root='"+$Root+"';`$HaltPath='"+$HaltPath+"';`$Owner='codex-map-swamp';`$Command='player'`nTest-HaltGate`nexit 0`n"),(New-Object Text.UTF8Encoding($true)))
 $p=Start-Process powershell -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File',$child -WindowStyle Hidden -PassThru -Wait
 Check ($p.ExitCode -eq 3) ('non-exempt owner not refused during HALT: exit '+$p.ExitCode)
 'PASS: '+$n+' halt-exempt decisions; Unity launches=0'
} finally {
 if((Test-Path $Root) -and [IO.Path]::GetFullPath($Root).StartsWith('I:\EXODUSER-Storage\devtools\fix-1104-haltexempt\fixture-')){Remove-Item -LiteralPath $Root -Recurse -Force}
}

$ErrorActionPreference='Stop'
# 11-04: the user's desktop game (parent explorer.exe) saved into the real save folder while a QA Player ran, and the QA
# run failed USER_SAVE changed=3. Find-UserGames must report only EXODUSER* processes whose parent is explorer. Unity launches=0.
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
$f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq 'Find-UserGames'|Select-Object -First 1
if(-not $f){throw 'FAIL: missing Find-UserGames'}
. ([scriptblock]::Create($f.Extent.Text))
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
function P($id,$parent,$name,$exe){[pscustomobject]@{ProcessId=$id;ParentProcessId=$parent;Name=$name;ExecutablePath=$exe}}
function Get-CimInstance { param($ClassName,$ErrorAction) $script:procs }
$script:procs=@((P 100 1 'explorer.exe' 'C:\Windows\explorer.exe'),(P 35348 100 'EXODUSER-Unity.exe' 'I:\EXODUSER-Storage\unity-latest\build\EXODUSER-Unity.exe'),(P 200 1 'powershell.exe' 'x'),(P 60388 200 'EXODUSER-Unity.exe' 'I:\EXODUSER-Storage\ui-candidate\build\EXODUSER-Unity.exe'),(P 11048 100 'EXODUSER-A2R.exe' 'I:\EXODUSER-Storage\map25d\a2r-build\EXODUSER-A2R.exe'),(P 77 999 'EXODUSER-Unity.exe' 'orphan'))
$g=@(Find-UserGames)
Check ($g.Count -eq 2) ('user games count: '+$g.Count)
Check (@($g.pid) -contains 35348 -and @($g.pid) -contains 11048) 'explorer-launched games not found'
Check (@($g.pid) -notcontains 60388) 'runner-launched QA Player treated as user game'
Check (@($g.pid) -notcontains 77) 'orphan with dead parent treated as user game'
$script:procs=@((P 100 1 'explorer.exe' 'e'),(P 60388 200 'EXODUSER-Unity.exe' 'qa'))
Check (@(Find-UserGames).Count -eq 0) 'no user game expected'
'PASS: '+$n+' user-game decisions; Unity launches=0'

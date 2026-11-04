param([string]$BuildLoopPath=(Join-Path $PSScriptRoot '../buildloop/buildloop.ps1'),[string]$UiCheckPath=(Join-Path $PSScriptRoot '../../ui-overlap/check.ps1'),[string]$Output='')
$ErrorActionPreference='Stop'
$Cfg=@{Worktree='G:\exoduser-wt\codex-unity-uisound'}
$Worktree=$Cfg.Worktree
$expected='I:\EXODUSER-Storage\unity-jobs\bin\exo-unity.ps1'
$rows=New-Object System.Collections.Generic.List[object]
function Parse-Source([string]$Path){$tokens=$null;$parseErrors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile([IO.Path]::GetFullPath($Path),[ref]$tokens,[ref]$parseErrors);if($parseErrors.Count){throw $parseErrors[0]};return $ast}
$buildAst=Parse-Source $BuildLoopPath
foreach($name in 'Set-UnityReservation','Invoke-Exo'){
 $functionAst=$buildAst.FindAll({param($node) $node -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq $name|Select-Object -First 1
 if(!$functionAst){throw ('Missing actual function '+$name)}
 $assignment=$functionAst.FindAll({param($node) $node -is [Management.Automation.Language.AssignmentStatementAst] -and $node.Left.Extent.Text -eq '$launcher'},$true)|Select-Object -First 1
 if(!$assignment){throw ('Missing actual launcher '+$name)}
 $launcher=$null;Invoke-Expression $assignment.Extent.Text
 $rows.Add([pscustomobject]@{name=$name;passed=($launcher -eq $expected);actual=$launcher;source=$BuildLoopPath})
}
$uiAst=Parse-Source $UiCheckPath
$assignment=$uiAst.FindAll({param($node) $node -is [Management.Automation.Language.AssignmentStatementAst] -and $node.Left.Extent.Text -eq '$exo'},$true)|Select-Object -First 1
if(!$assignment){throw 'Missing actual UI checker runner'}
$exo=$null;Invoke-Expression $assignment.Extent.Text
$rows.Add([pscustomobject]@{name='UI overlap runner';passed=([IO.Path]::GetFullPath($exo) -eq $expected);actual=$exo;source=$UiCheckPath})
$failures=@($rows|Where-Object {-not $_.passed}).Count
$report=[ordered]@{scope='Evaluate actual launcher assignments from parsed source; no Unity, process launch or Desktop swap';checks=$rows.Count;failures=$failures;rows=@($rows.ToArray())}
$json=$report|ConvertTo-Json -Depth 5
if($Output){[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($Output)))|Out-Null;[IO.File]::WriteAllText([IO.Path]::GetFullPath($Output),$json,(New-Object Text.UTF8Encoding($false)))}
$json
if($failures){exit 1}

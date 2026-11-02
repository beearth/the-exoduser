# Real filesystem swap fixtures; never touches unity-latest or desktop links.
$ErrorActionPreference='Stop'
$root=Join-Path 'I:\EXODUSER-Storage\devtools\fix-1102' ('contract-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $root | Out-Null
$source=Join-Path $PSScriptRoot '..\buildloop\buildloop.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($name in 'Prop','WriteJson','ReadJson','Swap-Build','Cmd-Swap'){
 $f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true) | Where-Object Name -eq $name | Select-Object -First 1
 . ([scriptblock]::Create($f.Extent.Text))
}
function Log($m){Write-Host $m}
$Utf8=New-Object Text.UTF8Encoding($false)
$Cfg=@{Out=$root};$NoSwap=$false
function Get-BuildHolders { @() }
$run=Join-Path $root 'run';New-Item -ItemType Directory -Path $run | Out-Null
foreach($p in 'build','build_new','build_prev'){New-Item -ItemType Directory -Path (Join-Path $root $p) | Out-Null}
[IO.File]::WriteAllText((Join-Path $root 'build\EXODUSER-Unity.exe'),'old')
[IO.File]::WriteAllText((Join-Path $root 'build_new\EXODUSER-Unity.exe'),'new')
[IO.File]::WriteAllText((Join-Path $root 'build_prev\keep.txt'),'keep')
foreach($p in 'build-receipt.json','build.log'){[IO.File]::WriteAllText((Join-Path $run $p),'{}')}
WriteJson (Join-Path $root 'build-commit.json') @{commit='oldsha';desktopArgs='-force-d3d11 --remodel3d';custom='preserve';utc='old';exeSha256='old';m1Run='old'}
$lr=[pscustomobject]@{sha='newsha';shaFull='newsha-full';branch='unity/main';builtAt='now';verdict='PASS'}
$result=Swap-Build $null $run $lr
if(-not $result.done){throw $result.note}
if(-not(Test-Path (Join-Path $root 'build_prev\keep.txt'))){throw 'FAIL: old build_prev was deleted'}
$prev=@(Get-ChildItem $root -Directory -Filter 'build_prev_oldsha_*')
if($prev.Count -ne 1 -or [IO.File]::ReadAllText((Join-Path $prev[0].FullName 'EXODUSER-Unity.exe')) -ne 'old'){throw 'FAIL: previous build not archived with SHA/time'}
$bc=ReadJson (Join-Path $root 'build-commit.json')
foreach($field in 'utc','branch','commit','exe','exeSha256','m1Run'){if(-not $bc.$field){throw "FAIL: missing $field"}}
if($bc.commit -ne 'newsha-full' -or $bc.custom -ne 'preserve' -or $bc.desktopArgs -ne '-force-d3d11 --remodel3d'){throw 'FAIL: metadata lost or stale'}
New-Item -ItemType Directory -Path (Join-Path $root 'build_new') | Out-Null
[IO.File]::WriteAllText((Join-Path $root 'build_new\EXODUSER-Unity.exe'),'later')
function Get-BuildHolders { @([pscustomobject]@{pid=123;auto=$false}) }
$blocked=Swap-Build $null $run $lr
if($blocked.done -or [IO.File]::ReadAllText((Join-Path $root 'build\EXODUSER-Unity.exe')) -ne 'new'){throw 'FAIL: running user build replaced'}
$NoSwap=$true
function Load-State {throw 'FAIL: branch swap accessed deployment state'}
Cmd-Swap
'PASS: archive, metadata, active player deferral, branch NoSwap'

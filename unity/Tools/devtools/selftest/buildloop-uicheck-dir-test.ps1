$ErrorActionPreference='Stop'
# 11-04 20:36 CTO: the UI overlap output (~7.7 GB a run) goes to NTFS G:, only the current run is kept there, and only small
# records stay in the run folder on I:. Unity launches=0.
$source=Join-Path $PSScriptRoot '../buildloop/buildloop.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($name in 'Get-UiCheckDir','Save-UiCheckRecord'){$f=$ast.FindAll({param($x) $x -is [Management.Automation.Language.FunctionDefinitionAst] -and $x.Name -eq $name},$true)|Select-Object -First 1;. ([scriptblock]::Create($f.Extent.Text))}
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
function Log($m){}
$fx=Join-Path 'G:\exoduser-wt\_buildloop-uicheck-selftest' ('fixture-'+[guid]::NewGuid().ToString('N'))
$UiCheckRoot=Join-Path $fx 'root';$runDir=Join-Path $fx 'runs\20261104-210000000_abcdef1'
try {
 New-Item -ItemType Directory -Force -Path $runDir,(Join-Path $UiCheckRoot '20261104-195553533_e3d8d6a\overlap'),(Join-Path $UiCheckRoot 'e3d8d6a-reanalyze') | Out-Null
 $d=Get-UiCheckDir $runDir
 Check ($d -eq (Join-Path $UiCheckRoot '20261104-210000000_abcdef1')) ('wrong ui-check dir: '+$d)
 Check (-not (Test-Path (Join-Path $UiCheckRoot '20261104-195553533_e3d8d6a'))) 'previous run output not removed'
 Check (Test-Path (Join-Path $UiCheckRoot 'e3d8d6a-reanalyze')) 'non-run folder removed'
 Check ((Get-Content -LiteralPath (Join-Path $runDir 'ui-check-location.txt') -Raw) -eq $d) 'location record missing'
 New-Item -ItemType Directory -Force -Path (Join-Path $d 'overlap') | Out-Null
 '{"passed":true}' | Set-Content -LiteralPath (Join-Path $d 'overlap\overlap-summary.json') -Encoding UTF8
 'big' | Set-Content -LiteralPath (Join-Path $d 'overlap\overlap-report.json')
 Save-UiCheckRecord $d $runDir
 Check (Test-Path (Join-Path $runDir 'ui-overlap-summary.json')) 'summary not kept in the run folder'
 Check (-not (Test-Path (Join-Path $runDir 'ui-overlap-report.json'))) 'large report copied into the run folder'
 $body=$ast.Extent.Text
 Check ($body.Contains("`$UiCheckRoot = 'G:\exoduser-wt\_buildloop-uicheck'")) 'UI output root is not on G:'
 'PASS: '+$n+' ui-check location decisions; Unity launches=0'
} finally { if((Test-Path $fx) -and $fx.StartsWith('G:\exoduser-wt\_buildloop-uicheck-selftest\fixture-')){Remove-Item -LiteralPath $fx -Recurse -Force}; $p='G:\exoduser-wt\_buildloop-uicheck-selftest'; if((Test-Path $p) -and -not (Get-ChildItem $p)){Remove-Item -LiteralPath $p -Force} }

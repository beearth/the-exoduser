$ErrorActionPreference='Stop'
# 11-04 CTO: the demo is 3D. BuildLoop -Gate3D trial (default) runs one extra --remodel3d m1-check after the gate smoke and only
# records it; -Gate3D on makes the gate smoke itself --remodel3d. Checks the argument plumbing of Run-Smoke. Unity launches=0.
$source=Join-Path $PSScriptRoot '../buildloop/buildloop.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
$p=$ast.ParamBlock.Parameters|Where-Object { $_.Name.VariablePath.UserPath -eq 'Gate3D' }
Check ($null -ne $p) 'Gate3D parameter missing'
Check ($p.DefaultValue.Value -eq 'trial') ('Gate3D default is not trial: '+$p.DefaultValue)
Check ($p.Attributes.PositionalArguments.Value -join ',' -eq 'off,trial,on') 'Gate3D values are not off/trial/on'
$f=$ast.FindAll({param($x) $x -is [Management.Automation.Language.FunctionDefinitionAst] -and $x.Name -eq 'Run-Smoke'},$true)|Select-Object -First 1
. ([scriptblock]::Create($f.Extent.Text))
$script:seen=$null
function Invoke-Exo($cmd,$argv,$base,$exe,$desktop){ $script:seen=@($argv); return [pscustomobject]@{ receipt=$null; exit=0; waitReason='' } }
function Prop($o,$k,$d){ return $d }
$Mode='desktop';$dir=Join-Path $env:TEMP ('gate3d-'+[guid]::NewGuid().ToString('N'))
try {
 $null=Run-Smoke 'b' $dir
 Check (($script:seen -join ' ') -eq ('--unity-m1-check -output '+$dir+' -force-d3d11')) ('default smoke args changed: '+($script:seen -join ' '))
 $null=Run-Smoke 'b' $dir '--unity-m1-check' 'm1-check.json' @('--remodel3d')
 Check (($script:seen -join ' ') -eq ('--unity-m1-check -output '+$dir+' -force-d3d11 --remodel3d')) ('3D smoke args wrong: '+($script:seen -join ' '))
 $body=$ast.Extent.Text
 Check ($body.Contains("if (`$Gate3D -eq 'on') { `$gateExtra = @('--remodel3d') }")) 'on mode does not switch the gate smoke to 3D'
 Check ($body.Contains("if (`$Gate3D -eq 'trial' -and")) 'trial step missing'
 Check (-not ([regex]::Match($body,"trial3d[^\r\n]*Set-WaitResult")).Success) 'trial step can end the run'
 'PASS: '+$n+' gate3d decisions; Unity launches=0'
} finally { if(Test-Path $dir){Remove-Item -LiteralPath $dir -Recurse -Force} }

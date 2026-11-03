$ErrorActionPreference='Stop'
# 11-04 UI candidate 57be03df/02ef0c30: a Player stuck in shutdown kept its -logFile write handle open, and the runner's
# ReadAllText threw IOException before writing the receipt. Read-SharedText must read a log another process is writing.
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
$f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq 'Read-SharedText'|Select-Object -First 1
if(-not $f){throw 'FAIL: missing Read-SharedText'}
. ([scriptblock]::Create($f.Extent.Text))
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
$dir=Join-Path 'I:\EXODUSER-Storage\devtools\fix-1104-sharedlog' ('fixture-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $dir -Force|Out-Null
$log=Join-Path $dir 'player.log'
$w=New-Object IO.FileStream($log,[IO.FileMode]::Create,[IO.FileAccess]::Write,[IO.FileShare]::ReadWrite)
try {
 $b=[Text.Encoding]::UTF8.GetBytes("Renderer:  AMD Radeon RX 9070 XT (ID=0x7550)`nInput System module state changed to: Shutdown.`n");$w.Write($b,0,$b.Length);$w.Flush()
 $old=$null;try{[void][IO.File]::ReadAllText($log);$old='read'}catch{$old='locked'}
 Check ($old -eq 'locked') 'fixture premise: ReadAllText should fail while the writer is open'
 $t=Read-SharedText $log
 Check ($t.Contains('AMD Radeon RX 9070 XT')) 'shared read did not return the log'
 $b=[Text.Encoding]::UTF8.GetBytes("more`n");$w.Write($b,0,$b.Length);$w.Flush()
 Check ((Read-SharedText $log).EndsWith("more`n")) 'second read did not see appended text'
} finally { $w.Dispose() }
Check ((Read-SharedText $log).Contains('Shutdown')) 'read after writer closed'
if([IO.Path]::GetFullPath($dir).StartsWith('I:\EXODUSER-Storage\devtools\fix-1104-sharedlog\fixture-')){Remove-Item -LiteralPath $dir -Recurse -Force}
'PASS: '+$n+' shared log reads; Unity launches=0'

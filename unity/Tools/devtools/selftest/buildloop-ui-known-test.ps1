$ErrorActionPreference='Stop'
# 11-04 CTO ratchet: BuildLoop passes the UI overlap gate only when every collision is in known-overlaps.json (existing on the
# desktop build), and the list may never grow past the smallest size the loop has seen. Unity launches=0.
[Console]::OutputEncoding=[Text.Encoding]::UTF8
$source=Join-Path $PSScriptRoot '../buildloop/buildloop.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($name in 'Prop','Apply-UiKnownList'){$f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq $name|Select-Object -First 1;if(-not $f){throw ('FAIL: missing '+$name)};. ([scriptblock]::Create($f.Extent.Text))}
$root=Join-Path 'I:\EXODUSER-Storage\devtools\fix-1104-uiknown' ('fixture-'+[guid]::NewGuid().ToString('N'))
$tool=Join-Path $root 'unity\Tools\ui-overlap';New-Item -ItemType Directory -Force -Path $tool,(Join-Path $root 'run\ui-check') | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot '../../ui-overlap/known-filter.cjs') -Destination $tool
$Cfg=@{Worktree=$root}
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
$Utf8=New-Object Text.UTF8Encoding($false)
function Report($issues){$p=Join-Path $root 'run\ui-check\overlap-report.json';$frame=[ordered]@{schemaVersion=2;page='HUD';language='ko';width=1920;height=1080;issues=@($issues)}|ConvertTo-Json -Depth 6 -Compress;[IO.File]::WriteAllText($p,"{`n""frames"":[`n"+$frame+"`n]}`n",$Utf8);return $p}
function Issue($sa,$ta,$sb,$tb){@{type='글자-글자';a=@{source=$sa;text=$ta};b=@{source=$sb;text=$tb}}}
function Known($entries){[IO.File]::WriteAllText((Join-Path $tool 'known-overlaps.json'),(@{entries=@($entries)}|ConvertTo-Json -Depth 6),$Utf8)}
function Run($report,$count){[pscustomobject]@{uiOverlap=[ordered]@{passed=$false;valid=$true;issueCount=$count;frameCount=1;missing=@();detailReport=$report;note='UI 겹침 '+$count+'건'}}}
$hud=@{files=@('NativeHud.cs','NativeHud.cs');texts=@('A','B');page='HUD';language='ko';lines=@('NativeHud.cs:70')}
$other=@{files=@('NativeSkills.cs','NativeSkills.cs');texts=@('X','Y');page='스킬';language='ko'}
try {
 $st=[pscustomobject]@{deployed=$null}
 Known @($hud,$other)
 $r=Run (Report @(Issue 'NativeHud.cs:70' 'A' 'NativeHud.cs:71' 'B')) 1
 Apply-UiKnownList $r $st (Join-Path $root 'run')
 Check ($r.uiOverlap.passed -eq $true -and $r.uiOverlap.knownIssues -eq 1) ('known-only run not passed: '+$r.uiOverlap.note)
 Check ([int]$st.uiKnownMin -eq 2) 'ratchet minimum not recorded'
 $r=Run (Report @((Issue 'NativeHud.cs:70' 'A' 'NativeHud.cs:71' 'B'),(Issue 'NativeInventoryOssuary.cs:59' '0' 'NativeInventoryWebLayout.cs:104' '/'))) 2
 Apply-UiKnownList $r $st (Join-Path $root 'run')
 Check ($r.uiOverlap.passed -eq $false -and $r.uiOverlap.unknownIssues -eq 1) 'new collision passed'
 Known @($hud,$other,@{files=@('NativeInventoryOssuary.cs','NativeInventoryWebLayout.cs');texts=@('0','/');page='HUD';language='ko'})
 $r=Run (Report @(Issue 'NativeInventoryOssuary.cs:59' '0' 'NativeInventoryWebLayout.cs:104' '/')) 1
 Apply-UiKnownList $r $st (Join-Path $root 'run')
 Check ($r.uiOverlap.passed -eq $false -and $r.uiOverlap.note -like '*래칫 위반*') 'growing known list accepted'
 Known @($hud)
 $r=Run (Report @(Issue 'NativeHud.cs:70' 'A' 'NativeHud.cs:71' 'B')) 1
 Apply-UiKnownList $r $st (Join-Path $root 'run')
 Check ($r.uiOverlap.passed -eq $true -and [int]$st.uiKnownMin -eq 1) 'shrinking list not accepted or minimum not lowered'
 $r=Run (Report @()) 0;$r.uiOverlap.passed=$true
 Apply-UiKnownList $r $st (Join-Path $root 'run')
 Check ($r.uiOverlap.passed -eq $true -and -not $r.uiOverlap.Contains('knownIssues')) 'clean run touched'
 'PASS: '+$n+' UI known-list ratchet decisions; Unity launches=0'
} finally {
 if((Test-Path $root) -and [IO.Path]::GetFullPath($root).StartsWith('I:\EXODUSER-Storage\devtools\fix-1104-uiknown\fixture-')){Remove-Item -LiteralPath $root -Recurse -Force}
}

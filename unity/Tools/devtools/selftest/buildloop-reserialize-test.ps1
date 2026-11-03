$ErrorActionPreference='Stop'
# 11-03: build re-serialized 857 tracked Unity files and the loop aborted every cycle. Kept files must not block a
# non-overlapping fast-forward; overlap, staged changes and non-Unity files must still stop the cycle. Nothing is discarded.
[Console]::OutputEncoding=[Text.Encoding]::UTF8 # same as buildloop.ps1 line 25
$source=Join-Path $PSScriptRoot '../buildloop/buildloop.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($name in 'Get-ReserializeDirt','Get-ReserializeOverlap'){
 $f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq $name|Select-Object -First 1
 if(-not $f){throw ('FAIL: missing '+$name)}
 . ([scriptblock]::Create($f.Extent.Text))
}
$fixture=Join-Path 'I:\EXODUSER-Storage\devtools\fix-1103-reserialize' ('fixture-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path (Join-Path $fixture 'unity/Assets/아트') -Force|Out-Null
$script:GitExe=@(Get-Command git.exe -CommandType Application)[0].Source
function git.exe { & $script:GitExe -c ('safe.directory='+$fixture.Replace('\','/')) -c user.name=fixture -c user.email=fixture@local @args }
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
function W($p,$t){[IO.File]::WriteAllText((Join-Path $fixture $p),$t)}
try {
 git.exe -C $fixture init -q
 W 'unity/Assets/아트/a.png.meta' "guid: 1`n";W 'unity/Assets/m.mat' "m: 1`n";W 'unity/Assets/x.cs' "x`n";W 'unity/Assets/b.png.meta' "guid: 2`n"
 git.exe -C $fixture add -A;git.exe -C $fixture commit -qm A;$a=(git.exe -C $fixture rev-parse HEAD).Trim()
 W 'unity/Assets/b.png.meta' "guid: 2`nTextureImporter: {}`n";git.exe -C $fixture commit -qam B;$b=(git.exe -C $fixture rev-parse HEAD).Trim()
 git.exe -C $fixture switch -q --detach $a
 W 'unity/Assets/아트/a.png.meta' "guid: 1`nTextureImporter: {}`n";W 'unity/Assets/m.mat' "m: 2`n"
 $d=Get-ReserializeDirt $fixture
 Check ($d.kept.Count -eq 2 -and $d.foreign.Count -eq 0) ('re-serialized files not kept: kept='+$d.kept.Count+' foreign='+$d.foreign.Count)
 Check ($d.kept -contains 'unity/Assets/아트/a.png.meta') 'non-ASCII path quoted'
 Check (@(Get-ReserializeOverlap $fixture $d.kept $b).Count -eq 0) 'false overlap'
 git.exe -C $fixture switch -q --detach $b
 Check ($LASTEXITCODE -eq 0 -and (git.exe -C $fixture rev-parse HEAD).Trim() -eq $b) 'non-overlapping update failed'
 Check ([IO.File]::ReadAllText((Join-Path $fixture 'unity/Assets/m.mat')) -eq "m: 2`n") 'kept re-serialization discarded'
 git.exe -C $fixture switch -q --detach $a
 W 'unity/Assets/b.png.meta' "guid: 2`nlocal`n"
 $d=Get-ReserializeDirt $fixture
 Check (@(Get-ReserializeOverlap $fixture $d.kept $b) -contains 'unity/Assets/b.png.meta') 'overlap with incoming commit not detected'
 W 'unity/Assets/x.cs' "y`n"
 Check ((Get-ReserializeDirt $fixture).foreign.Count -eq 1) 'source change treated as re-serialization'
 W 'unity/Assets/x.cs' "x`n";git.exe -C $fixture add -- 'unity/Assets/m.mat'
 Check ((Get-ReserializeDirt $fixture).foreign.Count -eq 1) 'staged change treated as re-serialization'
 'PASS: '+$n+' re-serialization decisions; files discarded=0; Unity launches=0'
} finally {
 if((Test-Path $fixture) -and [IO.Path]::GetFullPath($fixture).StartsWith('I:\EXODUSER-Storage\devtools\fix-1103-reserialize\fixture-')){Remove-Item -LiteralPath $fixture -Recurse -Force}
}

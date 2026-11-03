$ErrorActionPreference='Stop'
# 11-04 user "알아서 자동으로 버려": BuildLoop discards only re-serialized Unity files that differ from HEAD by whitespace or
# that fill an empty .meta with the same guid, keeps a copy under runs\<id>\discarded, and still stops on value/guid/untracked
# differences. Also: build-commit.json written by a manual swap becomes the deployed record. Unity launches=0.
[Console]::OutputEncoding=[Text.Encoding]::UTF8
$source=Join-Path $PSScriptRoot '../buildloop/buildloop.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($name in 'Prop','WriteJson','Get-ReserializeDirt','Get-IncomingCollision','Get-AutoDiscard','Invoke-AutoDiscard','Get-ExternalDeploy'){
 $f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq $name|Select-Object -First 1
 if(-not $f){throw ('FAIL: missing '+$name)}
 . ([scriptblock]::Create($f.Extent.Text))
}
$Utf8=New-Object Text.UTF8Encoding($false)
$root='I:\EXODUSER-Storage\devtools\fix-1104-autodiscard'
$fixture=Join-Path $root ('fixture-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path (Join-Path $fixture 'unity/Assets/ui') -Force|Out-Null
$script:GitExe=@(Get-Command git.exe -CommandType Application)[0].Source
function git.exe { $ErrorActionPreference='Continue'; & $script:GitExe -c ('safe.directory='+$fixture.Replace('\','/')) -c user.name=fixture -c user.email=fixture@local -c core.autocrlf=false @args }
$Cfg=@{Repo=$fixture}
function GitR { param([Parameter(ValueFromRemainingArguments)]$a) $o = & git.exe -C $Cfg.Repo @a 2>&1; if ($LASTEXITCODE -ne 0) { throw "git $($a -join ' ') 실패: $o" }; return $o }
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
function W($p,$t){[IO.File]::WriteAllText((Join-Path $fixture $p),$t)}
function RT($p){[IO.File]::ReadAllText((Join-Path $fixture $p))}
$g1='b4b5d86fee484026b55fad8523ffa20b';$g2='0123456789abcdef0123456789abcdef'
try {
 git.exe -C $fixture init -q|Out-Null
 W 'unity/Assets/ui/space.png.meta' "fileFormatVersion: 2`nguid: $g2`nTextureImporter:`n  enableMipMap: 1`n  customData:`n"
 W 'unity/Assets/ui/stub.png.meta' "fileFormatVersion: 2`nguid: $g1`n"
 W 'unity/Assets/ui/value.png.meta' "fileFormatVersion: 2`nguid: $g2`nTextureImporter:`n  maxTextureSize: 2048`n"
 W 'unity/Assets/ui/guid.png.meta' "fileFormatVersion: 2`nguid: $g1`n"
 W 'unity/Assets/ui/m.mat' "m: 1`n"
 git.exe -C $fixture add -A|Out-Null;git.exe -C $fixture commit -qm A|Out-Null;$a=([string](GitR rev-parse HEAD)).Trim()
 # incoming commit B changes all five files (the real 7cdce2032/71b49f7c4 shapes)
 W 'unity/Assets/ui/space.png.meta' "fileFormatVersion: 2`nguid: $g2`nTextureImporter:`n  enableMipMap: 0`n  customData: `n"
 W 'unity/Assets/ui/stub.png.meta' "fileFormatVersion: 2`nguid: $g1`nTextureImporter:`n  maxTextureSize: 4096`n"
 W 'unity/Assets/ui/value.png.meta' "fileFormatVersion: 2`nguid: $g2`nTextureImporter:`n  maxTextureSize: 4096`n"
 W 'unity/Assets/ui/guid.png.meta' "fileFormatVersion: 2`nguid: $g1`nTextureImporter: {}`n"
 W 'unity/Assets/ui/m.mat' "m: 2`n"
 git.exe -C $fixture add -A|Out-Null;git.exe -C $fixture commit -qm B|Out-Null;$b=([string](GitR rev-parse HEAD)).Trim()
 git.exe -C $fixture switch -q --detach $a|Out-Null
 # worktree copies Unity wrote on A
 W 'unity/Assets/ui/space.png.meta' "fileFormatVersion: 2`nguid: $g2`nTextureImporter:`n  enableMipMap: 1`n  customData: `n"
 W 'unity/Assets/ui/stub.png.meta' "fileFormatVersion: 2`nguid: $g1`nTextureImporter:`n  maxTextureSize: 2048`n"
 $d=Get-ReserializeDirt $fixture
 $col=Get-IncomingCollision $fixture $d.kept $b
 $auto=Get-AutoDiscard $fixture $col.different $d.kept
 $why=@{};foreach($x in $auto.discard){$why[$x.path]=$x.reason}
 Check ($why['unity/Assets/ui/space.png.meta'] -eq 'whitespace') '(a) whitespace-only meta not discarded'
 Check ($why['unity/Assets/ui/stub.png.meta'] -eq 'stub-meta-filled') '(b) filled stub meta not discarded'
 Check ($auto.rest.Count -eq 0) ('unexpected rest: '+($auto.rest -join ','))
 $run=Join-Path $fixture '_run'
 Invoke-AutoDiscard $fixture $auto.discard $run
 Check ((Test-Path (Join-Path $run 'discarded/unity/Assets/ui/stub.png.meta')) -and ([IO.File]::ReadAllText((Join-Path $run 'discarded/unity/Assets/ui/stub.png.meta')).Contains('2048'))) 'original not preserved before discard'
 Check (-not (git.exe -C $fixture status --porcelain --untracked-files=no)) 'worktree not clean after discard'
 git.exe -C $fixture switch -q --detach $b|Out-Null
 Check ($LASTEXITCODE -eq 0 -and ([string](GitR rev-parse HEAD)).Trim() -eq $b) 'fast-forward after discard failed'
 Check ((RT 'unity/Assets/ui/stub.png.meta').Contains('4096')) 'incoming value not applied'
 # value difference, guid difference, untracked and staged copies must stop
 git.exe -C $fixture switch -q --detach $a|Out-Null
 W 'unity/Assets/ui/value.png.meta' "fileFormatVersion: 2`nguid: $g2`nTextureImporter:`n  maxTextureSize: 1024`n"
 W 'unity/Assets/ui/guid.png.meta' "fileFormatVersion: 2`nguid: $g2`nTextureImporter: {}`n"
 W 'unity/Assets/ui/m.mat' "m: 9`n"
 $d=Get-ReserializeDirt $fixture
 $auto=Get-AutoDiscard $fixture (Get-IncomingCollision $fixture $d.kept $b).different $d.kept
 Check ($auto.rest -contains 'unity/Assets/ui/value.png.meta') 'value difference discarded'
 Check ($auto.rest -contains 'unity/Assets/ui/guid.png.meta') 'guid change on stub meta discarded'
 Check ($auto.rest -contains 'unity/Assets/ui/m.mat') 'material value difference discarded'
 Check ($auto.discard.Count -eq 0) 'something discarded among real differences'
 Check (@((Get-AutoDiscard $fixture @('unity/Assets/ui/new.png.meta') @()).rest) -contains 'unity/Assets/ui/new.png.meta') 'untracked/non-kept path discarded'
 # build-commit.json from a manual swap becomes deployed; same or older does not
 $bc=Join-Path $fixture 'build-commit.json'
 [IO.File]::WriteAllText($bc,('{"sha":"'+$b.Substring(0,9)+'","shaFull":"'+$b+'","at":"2026-11-04T02:29:25+09:00","by":"codex-fullrun(cto-swap-3)"}'))
 $dep=[pscustomobject]@{sha=$a.Substring(0,9);shaFull=$a;at='2026-11-02 21:48';runId='cto-manual-swap';verdict='LEGACY'}
 $ext=Get-ExternalDeploy $dep $bc
 Check ($ext -and $ext.shaFull -eq $b -and $ext.verdict -eq 'EXTERNAL' -and $ext.runId -eq 'codex-fullrun(cto-swap-3)') 'newer manual swap not adopted'
 Check ($null -eq (Get-ExternalDeploy $ext $bc)) 'same commit re-adopted'
 $newer=[pscustomobject]@{sha='x';shaFull=$a;at='2026-11-05 09:00';runId='r';verdict='PASS'}
 Check ($null -eq (Get-ExternalDeploy $newer $bc)) 'older build-commit.json overrode a newer loop deploy'
 [IO.File]::WriteAllText($bc,('{"commit":"'+$b+'","utc":"2026-11-04T03:00:00.0000000Z"}'))
 Check ((Get-ExternalDeploy $dep $bc).shaFull -eq $b) 'loop-format build-commit.json not read'
 'PASS: '+$n+' auto-discard and deploy-record decisions; Unity launches=0'
} finally {
 if((Test-Path $fixture) -and [IO.Path]::GetFullPath($fixture).StartsWith($root+'\fixture-')){Remove-Item -LiteralPath $fixture -Recurse -Force}
}

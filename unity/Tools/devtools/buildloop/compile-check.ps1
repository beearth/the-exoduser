# Unity 를 띄우지 않고 Assembly-CSharp(플레이어) C# 컴파일만 검사한다(csc, 약 6초).
# 기존 빌드가 남긴 Library\Bee\...\Assembly-CSharp.rsp 를 틀로 쓰고, 소스 목록은 이 워크트리의 git 파일로 바꾼다.
# 사용: powershell -NoProfile -ExecutionPolicy Bypass -File compile-check.ps1 [-Project <...\unity>] [-Rsp <...\Assembly-CSharp.rsp>]
param(
  [string]$Project = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path,
  [string]$LibraryProject = 'E:\exoduser-wt\pc-unity-latest\unity',
  [string]$Csc = 'G:\unity\Editor\6000.6.7f1\Editor\Data\DotNetSdk\sdk\8.0.318\Roslyn\bincore\csc.dll',
  [string]$Dotnet = 'G:\unity\Editor\6000.6.7f1\Editor\Data\DotNetSdk\dotnet.exe'
)
$ErrorActionPreference = 'Stop'
$rspSrc = Get-ChildItem -LiteralPath (Join-Path $LibraryProject 'Library\Bee\artifacts') -Recurse -Filter Assembly-CSharp.rsp | Where-Object { (Get-Content -LiteralPath $_.FullName -TotalCount 5) -notmatch 'UNITY_EDITOR' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$out = Join-Path $env:TEMP 'exo_csc_check'; New-Item -ItemType Directory -Force -Path $out | Out-Null
$lib = $LibraryProject.Replace([string][char]92, '/') + '/'; $mine = $Project.Replace([string][char]92, '/') + '/'
$t = [IO.File]::ReadAllText($rspSrc.FullName)
$t = $t.Replace('"Library/', '"' + $lib + 'Library/').Replace('"Packages/', '"' + $lib + 'Packages/')
$t = [regex]::Replace($t, '-out:"[^"]*"', '-out:"' + $out.Replace([string][char]92, '/') + '/Assembly-CSharp.dll"')
$t = [regex]::Replace($t, '-refout:"[^"]*"', '-refout:"' + $out.Replace([string][char]92, '/') + '/Assembly-CSharp.ref.dll"')
$t = $t.Replace('"Assets/', '"' + $mine + 'Assets/')
$files = @(& git.exe -C $Project ls-files -co --exclude-standard 'Assets/*.cs') | Where-Object { $_ -and $_ -notmatch '/Editor/' }
$have = [Collections.Generic.HashSet[string]]::new()
foreach ($m in [regex]::Matches($t, '(?m)^"' + [regex]::Escape($mine) + '(Assets/[^"]+\.cs)"')) { [void]$have.Add($m.Groups[1].Value) }
$set = [Collections.Generic.HashSet[string]]::new([string[]]$files)
foreach ($g in @($have)) { if (-not $set.Contains($g)) { $t = $t.Replace('"' + $mine + $g + '"' + "`n", '').Replace('"' + $mine + $g + '"' + "`r`n", '') } }
$t = $t.TrimEnd() + "`n" + (($files | Where-Object { -not $have.Contains($_) } | ForEach-Object { '"' + $mine + $_ + '"' }) -join "`n") + "`n"
$rsp = Join-Path $out 'check.rsp'; [IO.File]::WriteAllText($rsp, $t, (New-Object Text.UTF8Encoding($false)))
$log = & $Dotnet $Csc -nologo "@$rsp" 2>&1
$errs = @($log | Where-Object { $_ -match 'error CS' })
$errs | Select-Object -First 30 | ForEach-Object { Write-Host $_ }
Write-Host ('compile errors: {0}' -f $errs.Count)
exit ([int]($errs.Count -gt 0))

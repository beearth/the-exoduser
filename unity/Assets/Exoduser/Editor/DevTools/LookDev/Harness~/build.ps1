$ErrorActionPreference='Stop'
$dn='C:\Program Files\dotnet\dotnet.exe'
$csc='G:\unity\Editor\6000.6.7f1\Editor\Data\DotNetSdk\sdk\8.0.318\Roslyn\bincore\csc.dll'
$rt='C:\Program Files\dotnet\shared\Microsoft.NETCore.App\8.0.6'
$here='I:\EXODUSER-Storage\devtools\dt03\harness'
$src=@('E:/exoduser-wt/pc-unity-devtools-lookdev/unity/Assets/Exoduser/Editor/DevTools/LookDev/LookDevMetrics.cs','E:/exoduser-wt/pc-unity-devtools-lookdev/unity/Assets/Exoduser/Editor/DevTools/LookDev/LookDevCompare.cs')
$refs = Get-ChildItem $rt -Filter 'System*.dll' | ? { $_.Name -notmatch 'Native' } | % { '-r:' + $_.FullName }
$refs += '-r:' + $rt + '\mscorlib.dll'; $refs += '-r:' + $rt + '\netstandard.dll'
& $dn $csc -nologo -nostdlib -target:exe -out:"$here\Harness.dll" -langversion:9 -nullable:disable @refs "$here\Harness.cs" $src
if ($LASTEXITCODE -ne 0) { throw 'csc failed' }
Set-Content "$here\Harness.runtimeconfig.json" '{"runtimeOptions":{"tfm":"net8.0","framework":{"name":"Microsoft.NETCore.App","version":"8.0.0"}}}'
Write-Output built

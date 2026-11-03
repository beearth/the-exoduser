# Advisory Roslyn check for both Player and Editor, with asmdef/asmref source ownership.
param(
  [string]$Project = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..')),
  [string]$LibraryProject = 'G:\exoduser-wt\codex-unity-parity-1102\unity',
  [string]$Output = ('I:\EXODUSER-Storage\devtools\compile-check\' + (Get-Date -Format 'yyyyMMdd-HHmmssfff')),
  [string]$Csc = 'G:\unity\Editor\6000.6.7f1\Editor\Data\DotNetSdk\sdk\8.0.318\Roslyn\bincore\csc.dll',
  [string]$Dotnet = 'G:\unity\Editor\6000.6.7f1\Editor\Data\DotNetSdk\dotnet.exe'
)
$ErrorActionPreference='Stop'
& 'C:\nvm4w\nodejs\node.exe' (Join-Path $PSScriptRoot 'assembly-compile-check.cjs') --project $Project --library $LibraryProject --output $Output --csc $Csc --dotnet $Dotnet
exit $LASTEXITCODE

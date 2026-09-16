$ErrorActionPreference = 'Stop'
$repoPath = $PSScriptRoot
$nodePath = @('C:\nvm4w\nodejs\node.exe', 'G:\NODE.JS\node.exe') | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $nodePath) { throw 'A working Node.js executable is required.' }
Set-Location -LiteralPath $repoPath
& $nodePath (Join-Path $repoPath 'tools\auto-cleanup.cjs')
exit $LASTEXITCODE

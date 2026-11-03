$ErrorActionPreference = 'Stop'
$runner = Join-Path $PSScriptRoot '..\exo-unity.ps1'
$tokens=$null;$errors=$null
$ast=[System.Management.Automation.Language.Parser]::ParseFile($runner,[ref]$tokens,[ref]$errors)
$function=$ast.Find({param($node) $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq 'Get-WindowHits'},$true)
Invoke-Expression $function.Extent.Text
function Get-Process {
    param($Id,$ErrorAction)
    $script:fake
}
function Set-Fake($exited,$handle) {
    $script:fake=[pscustomobject]@{HasExited=$exited;MainWindowHandle=$handle;ProcessName='test';Id=123;MainWindowTitle='test'}
    $script:fake | Add-Member -MemberType ScriptMethod -Name Refresh -Value { }
}
Set-Fake $true $null
if (@(Get-WindowHits @(123) 'tree').Count -ne 0) { throw 'Exited process without a handle was falsely reported as a visible window' }
Set-Fake $false ([IntPtr]::Zero)
if (@(Get-WindowHits @(123) 'tree').Count -ne 0) { throw 'Headless live process falsely reported as a window' }
Set-Fake $false ([IntPtr]123)
if (@(Get-WindowHits @(123) 'tree').Count -ne 1) { throw 'Real live window must still fail the guard' }
Set-Fake $true ([IntPtr]123)
if (@(Get-WindowHits @(123) 'tree').Count -ne 0) { throw 'Stale handle of exited process must not fail the guard' }
Write-Output 'PASS 4 exited/live window guard cases'

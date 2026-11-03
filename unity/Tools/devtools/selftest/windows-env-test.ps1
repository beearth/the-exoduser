$ErrorActionPreference='Stop'
# 11-04: Codex node_repl started the runner without ProgramData/ProgramFiles/APPDATA/ComSpec/PATHEXT, so the Editor's
# UnityPackageManager.exe never opened its IPC stream (r14 03:56, r15 04:20). Repair-WindowsEnv must fill only empty
# variables in this process and keep values that are already set. Unity launches=0.
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
$f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq 'Repair-WindowsEnv'|Select-Object -First 1
if(-not $f){throw 'FAIL: missing Repair-WindowsEnv'}
. ([scriptblock]::Create($f.Extent.Text))
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
$names='APPDATA','ProgramData','ALLUSERSPROFILE','ProgramFiles','ProgramFiles(x86)','ProgramW6432','CommonProgramFiles','ComSpec','PATHEXT','TEMP','TMP','Path','USERPROFILE','LOCALAPPDATA','HOMEDRIVE','HOMEPATH'
$saved=@{};foreach($k in $names){$saved[$k]=[Environment]::GetEnvironmentVariable($k,'Process')}
try {
 # the r15 child: these were empty and PATHEXT held only .CPL
 foreach($k in 'APPDATA','ProgramData','ALLUSERSPROFILE','ProgramFiles','ProgramFiles(x86)','ProgramW6432','CommonProgramFiles','ComSpec'){[Environment]::SetEnvironmentVariable($k,$null,'Process')}
 $env:PATHEXT='.CPL'
 $fixed=Repair-WindowsEnv
 foreach($k in 'APPDATA','ProgramData','ALLUSERSPROFILE','ProgramFiles','ProgramFiles(x86)','ComSpec'){Check ([Environment]::GetEnvironmentVariable($k,'Process')) ($k+' not filled');Check ($fixed -contains $k) ($k+' not reported')}
 Check ($env:ProgramData -eq [Environment]::GetFolderPath('CommonApplicationData')) 'ProgramData value'
 Check ($env:ComSpec -like '*\System32\cmd.exe' -and (Test-Path -LiteralPath $env:ComSpec)) 'ComSpec value'
 Check (@($env:PATHEXT -split ';') -contains '.EXE') 'PATHEXT without .EXE kept'
 # values already present stay untouched, and a complete environment reports nothing
 $env:APPDATA='X:\keep-me'
 $again=Repair-WindowsEnv
 Check ($env:APPDATA -eq 'X:\keep-me') 'existing APPDATA overwritten'
 Check ($again.Count -eq 0) ('complete environment reported fixes: '+($again -join ','))
 [Environment]::SetEnvironmentVariable('TEMP',$null,'Process')
 $t=Repair-WindowsEnv
 Check ($t -contains 'TEMP' -and $env:TEMP -like '*\Temp') 'TEMP not filled'
 'PASS: '+$n+' Windows environment checks; Unity launches=0'
} finally {
 foreach($k in $names){[Environment]::SetEnvironmentVariable($k,$saved[$k],'Process')}
}

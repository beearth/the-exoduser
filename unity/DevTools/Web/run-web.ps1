param([string]$Method='Exoduser.DevTools.WebBuild.Run',[string]$Log='unity-web3.log',[string]$Extra='-api both -compression br -keepVideos true')
$ErrorActionPreference='Stop'
$lockPath='I:\EXODUSER-Storage\unity-jobs\_pc_lock.json'
$wt='E:\exoduser-wt\pc-unity-devtools-web'
$base='I:\EXODUSER-Storage\devtools\web'
function Unity-Alive { @(Get-Process Unity,EXODUSER-Unity -ErrorAction SilentlyContinue | ?{-not $_.HasExited}).Count -gt 0 }
function Free-Commit-GB { [math]::Round((Get-CimInstance Win32_OperatingSystem).FreeVirtualMemory/1MB,1) }
$deadline=(Get-Date).AddMinutes(90); $got=$false
while((Get-Date) -lt $deadline){
  $busy=$false
  if(Test-Path $lockPath){
    try{ $l=Get-Content $lockPath -Raw | ConvertFrom-Json } catch { $l=$null }
    if($l){
      $alive = $null -ne (Get-Process -Id $l.pid -ErrorAction SilentlyContinue)
      $recent = $false; try{ $recent = ((Get-Date) - [datetime]$l.startedAt).TotalMinutes -lt 10 } catch {}
      if($alive){ $busy=$true } elseif($recent -and (Unity-Alive)){ $busy=$true }
    }
  }
  if(-not $busy -and (Unity-Alive)){ $busy=$true }
  if(-not $busy -and (Free-Commit-GB) -lt 20){ $busy=$true }
  if(-not $busy){
    try{ if(Test-Path $lockPath){ Remove-Item $lockPath -Force }
      $fs=[IO.File]::Open($lockPath,'CreateNew'); $json=(@{owner='devtools-web';pid=$PID;worktree=$wt;startedAt=(Get-Date -Format 's');note='web build'} | ConvertTo-Json)
      $b=[Text.Encoding]::UTF8.GetBytes($json); $fs.Write($b,0,$b.Length); $fs.Close(); $got=$true; break } catch { }
  }
  Start-Sleep 30
}
if(-not $got){ Write-Output 'LOCK_TIMEOUT'; exit 3 }
Write-Output ("LOCK acquired "+(Get-Date -Format s))
try{
  if(-not (Test-Path "$wt\unity\Library\ScriptAssemblies")){
    Write-Output 'robocopy Library...'
    robocopy 'E:\exoduser-wt\o1-base-c7b4\unity\Library' "$wt\unity\Library" /E /XJ /NFL /NDL /NP /R:1 /W:1 /MT:8 | Out-Null
  }
  $env:DOTNET_ADD_GLOBAL_TOOLS_TO_PATH='false'; $env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE='1'; $env:DOTNET_NOLOGO='1'; $env:DOTNET_CLI_HOME='E:/exoduser-wt/_dotnet-home'
  $a=@('-batchmode','-quit','-buildTarget','WebGL','-projectPath',"$wt/unity",'-executeMethod',$Method,'-logFile',"$base/$Log") + ($Extra -split ' ')
  # NOTE: -nographics removed below if shader compile for WebGL needs it
  $p=Start-Process -FilePath 'G:\unity\Editor\6000.6.7f1\Editor\Unity.exe' -ArgumentList $a -PassThru -WindowStyle Hidden
  $win=$false
  while(-not $p.HasExited){ $p.Refresh(); if($p.MainWindowHandle -ne 0 -and -not $win){$win=$true; Write-Output 'WINDOW_SEEN'}; if(((Get-Date)-$p.StartTime).TotalMinutes -gt 120){ Write-Output 'TIMEOUT'; break }; Start-Sleep 5 }
  if($p.HasExited){ Write-Output ('exit='+$p.ExitCode) }
} finally {
  Start-Sleep 3
  if(-not (Unity-Alive)){ try{ $l=Get-Content $lockPath -Raw | ConvertFrom-Json; if($l.owner -eq 'devtools-web' -and $l.pid -eq $PID){ Remove-Item $lockPath -Force; Write-Output 'LOCK released' } }catch{} } else { Write-Output 'Unity still alive; lock kept' }
}

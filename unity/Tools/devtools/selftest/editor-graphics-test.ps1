param([string]$Worktree=(Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path)
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false)
$cli=Join-Path $Worktree 'unity/Tools/devtools/exo-unity.ps1'
$source=[IO.File]::ReadAllText($cli)
if(-not $source.Contains('[switch]$ForceD3D11')){throw 'RED: 공식 Editor D3D11 switch 없음'}
if(-not $source.Contains('[dryrun] start graphics=')){throw 'RED: Editor 시작 dryrun 경계 없음'}
$default=(& $cli start -Worktree $Worktree -DryRun 2>&1 | Out-String).Trim()
if($default -ne '[dryrun] start graphics=[]'){throw ('기본 graphics 변경: '+$default)}
$explicit=(& $cli start -Worktree $Worktree -ForceD3D11 -DryRun 2>&1 | Out-String).Trim()
if($explicit -ne '[dryrun] start graphics=["-force-d3d11"]'){throw ('D3D11 명시 전달 실패: '+$explicit)}
Write-Output 'PASS 기본 API 불변·명시 D3D11 인수·DryRun 실제 Editor 실행0'

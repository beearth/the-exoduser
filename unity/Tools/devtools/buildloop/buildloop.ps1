# 지옥의 길 Unity 빌드 고리 (DBT-3 / DBT-4)
#   buildloop.ps1 check            origin/unity/main HEAD 와 마지막 배포 빌드 SHA 비교
#   buildloop.ps1 run [-Force]     새 커밋이 있으면 빌드 -> GPU 스모크 -> 판정 -> (통과 시) build 교체 -> 상태판
#   buildloop.ps1 status           상태판 다시 쓰기 + 요약 출력
#   buildloop.ps1 swap [-AllowKnown]  검증된 build_new 를 build 로 교체(사용자 플레이 중이라 미룬 경우 등)
#   buildloop.ps1 install          이 폴더를 I:\EXODUSER-Storage\unity-latest\loop\bin 으로 복사(워크트리 갱신에 안 지워지는 실행 위치)
# 판정 규칙: smoke-rules.json. 알려진 결함은 통과가 아니다(-AllowKnown 일 때만 교체).
param(
  [Parameter(Position = 0)][ValidateSet('check', 'run', 'status', 'swap', 'install')][string]$Command = 'status',
  [switch]$Force,
  [switch]$AllowKnown,
  [switch]$HudSmoke,           # m1-check 뒤에 hud-smoke 도 무창으로 돌려 스스로 종료하는지 기록(DBT-6)
  [switch]$KeepStage,          # 브랜치 시험 뒤에도 build_new 를 지우지 않는다(데스크톱 시험용)
  [switch]$SkipSmoke,          # 빌드까지만(스모크 생략, 판정 ABORT 로 기록)
  [switch]$NoSwap,             # build 를 교체하지 않는다(브랜치 시험용). -Ref 가 origin/unity/main 이 아니면 자동으로 켜진다
  [string]$JudgeOnly,          # 빌드 없이 로그 한 개만 판정(예: -JudgeOnly C:\x\build.log -Scope build)
  [ValidateSet('build', 'player', 'caps')][string]$Scope = 'build',
  [string]$Ref = 'origin/unity/main'
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8; $OutputEncoding = [Text.Encoding]::UTF8
Set-StrictMode -Version 2

$Cfg = @{
  Repo      = 'G:\exoduser'
  Worktree  = 'E:\exoduser-wt\pc-unity-latest'
  Out       = 'I:\EXODUSER-Storage\unity-latest'
  UnityExe  = 'E:\Unity\Editors\6000.6.7f1\Editor\Unity.exe'
  Node      = 'C:\nvm4w\nodejs\node.exe'
  LockFile  = 'I:\EXODUSER-Storage\unity-jobs\_pc_lock.json'
  DotnetHome = 'E:\exoduser-wt\_dotnet-home'
  SmokeW    = 1600       # 무창(batchmode) 스모크: 창을 띄우지 않는다. 캡처는 RenderTexture 1600x900
  SmokeH    = 900
  ExitGraceSec = 60      # m1-check.json 을 쓴 뒤 플레이어가 이만큼 안에 끝나야 한다(DBT-6)
  BuildTimeoutMin = 90
  SmokeTimeoutMin = 15
  WaitMaxMin      = 60
  KeepRuns        = 10
}
$LoopDir   = Join-Path $Cfg.Out 'loop'
$RunsDir   = Join-Path $LoopDir 'runs'
$StatusDir = Join-Path $Cfg.Out 'status'
$StateFile = Join-Path $LoopDir 'state.json'
$LogFile   = Join-Path $LoopDir 'buildloop.log'
$RulesFile = Join-Path $PSScriptRoot 'smoke-rules.json'
$HaltFile = 'I:\EXODUSER-Storage\unity-jobs\HALT'
$MemLog = 'I:\EXODUSER-Storage\unity-jobs\memlog.csv'
$MainRef = 'origin/unity/main'
if ($Ref -ne $MainRef) { $NoSwap = [switch]$true }
$Utf8 = New-Object System.Text.UTF8Encoding($false)

function Log([string]$m) {
  $line = '[{0}] {1}' -f (Get-Date -Format 'MM-dd HH:mm:ss'), $m
  Write-Host $line
  try { New-Item -ItemType Directory -Force -Path $LoopDir | Out-Null; [IO.File]::AppendAllText($LogFile, $line + "`r`n", $Utf8) } catch { }
}
function WriteJson($path, $obj, [int]$depth = 8) {
  $dir = Split-Path -Parent $path; if ($dir) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [IO.File]::WriteAllText($path, ($obj | ConvertTo-Json -Depth $depth), $Utf8)
}
function ReadJson($path) { if (Test-Path -LiteralPath $path) { return (Get-Content -LiteralPath $path -Raw -Encoding UTF8 | ConvertFrom-Json) } return $null }
function GitR { param([Parameter(ValueFromRemainingArguments)]$a) $o = & git.exe -C $Cfg.Repo @a 2>&1; if ($LASTEXITCODE -ne 0) { throw "git $($a -join ' ') 실패: $o" }; return $o }
function Prop($o, [string]$n, $default = $null) { if ($null -ne $o -and $o.PSObject.Properties.Name -contains $n) { return $o.$n } return $default }

# ---------- 상태 ----------
function Load-State {
  $s = ReadJson $StateFile
  if ($null -eq $s) {
    $s = [pscustomobject]@{ deployed = $null; pending = $null; lastAttemptSha = ''; lastAttemptVerdict = ''; history = @() }
    # 손으로 만든 기존 빌드를 시작점으로 인정. 기존 build-commit.json 은 경로의 역슬래시가 이스케이프되지 않아 JSON 으로 못 읽는다 -> 정규식으로 읽는다.
    $bcPath = Join-Path $Cfg.Out 'build-commit.json'
    if (Test-Path -LiteralPath $bcPath) {
      $raw = Get-Content -LiteralPath $bcPath -Raw -Encoding UTF8
      $mc = [regex]::Match($raw, '"commit"\s*:\s*"([^"]+)"'); $mt = [regex]::Match($raw, '"built_at"\s*:\s*"([^"]+)"')
      if ($mc.Success) {
        $full = ''
        try { $full = ([string](GitR rev-parse $mc.Groups[1].Value)).Trim() } catch { }
        $at = ''; if ($mt.Success) { $at = $mt.Groups[1].Value }
        $s.deployed = [pscustomobject]@{ sha = $mc.Groups[1].Value; shaFull = $full; at = $at; runId = 'legacy'; verdict = 'LEGACY' }
      }
    }
  }
  return $s
}
function Save-State($s) { WriteJson $StateFile $s 8 }

# ---------- 메모리 기록 (DT-01 과 같은 열: 시각, 커밋 사용, 한도, 여유, Unity 수, claude 수, node 수) ----------
function Write-MemLog {
  try {
    $os = Get-CimInstance Win32_OperatingSystem
    $limit = [math]::Round($os.TotalVirtualMemorySize / 1MB, 1); $free = [math]::Round($os.FreeVirtualMemory / 1MB, 1); $used = [math]::Round($limit - $free, 1)
    $nu = @(Get-Process Unity, EXODUSER-Unity -ErrorAction SilentlyContinue).Count; $nc = @(Get-Process claude -ErrorAction SilentlyContinue).Count; $nn = @(Get-Process node -ErrorAction SilentlyContinue).Count
    if (-not (Test-Path -LiteralPath $MemLog)) { New-Item -ItemType Directory -Force -Path (Split-Path -Parent $MemLog) | Out-Null; [IO.File]::WriteAllText($MemLog, "time,commit_used_gb,commit_limit_gb,commit_free_gb,unity,claude,node`r`n", $Utf8) }
    [IO.File]::AppendAllText($MemLog, ('{0},{1},{2},{3},{4},{5},{6}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $used, $limit, $free, $nu, $nc, $nn) + "`r`n", $Utf8)
  } catch { }
}
function Read-MemLog([int]$hours) {
  $pts = @(); if (-not (Test-Path -LiteralPath $MemLog)) { return $pts }
  $since = (Get-Date).AddHours(-$hours)
  foreach ($line in [IO.File]::ReadAllLines($MemLog)) {
    $c = $line.Split(','); if ($c.Count -lt 4) { continue }
    $t = [datetime]::MinValue; if (-not [datetime]::TryParse($c[0], [Globalization.CultureInfo]::InvariantCulture, 'None', [ref]$t)) { continue }
    $f = 0.0; if (-not [double]::TryParse($c[3], [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::InvariantCulture, [ref]$f)) { continue }
    if ($t -ge $since) { $pts += [pscustomobject]@{ t = $t; free = $f } }
  }
  return $pts
}
function Mem-Svg {
  $pts = @(Read-MemLog 24)
  $w = 1200; $h = 230; $l = 52; $r = 14; $tp = 14; $b = 28
  $now = Get-Date; $t0 = $now.AddHours(-24)
  $maxY = 40.0; foreach ($p in $pts) { if ($p.free -gt $maxY) { $maxY = $p.free } }; $maxY = [math]::Ceiling($maxY / 10) * 10
  $sx = { param($t) $l + ($w - $l - $r) * (($t - $t0).TotalSeconds / 86400.0) }
  $sy = { param($v) $tp + ($h - $tp - $b) * (1 - $v / $maxY) }
  $o = New-Object Text.StringBuilder
  [void]$o.AppendLine("<svg viewBox=`"0 0 $w $h`" width=`"100%`" role=`"img`" aria-label=`"commit free GB, last 24h`" xmlns=`"http://www.w3.org/2000/svg`">")
  for ($g = 0; $g -le $maxY; $g += 10) { $y = [math]::Round((& $sy $g), 1); [void]$o.AppendLine("<line x1=`"$l`" y1=`"$y`" x2=`"$($w - $r)`" y2=`"$y`" stroke=`"rgba(164,147,115,.18)`"/><text x=`"$($l - 8)`" y=`"$($y + 4)`" text-anchor=`"end`" fill=`"#9b9078`" font-size=`"11`" font-family=`"Consolas,monospace`">$g</text>") }
  for ($k = 0; $k -le 6; $k++) { $tt = $t0.AddHours($k * 4); $x = [math]::Round((& $sx $tt), 1); [void]$o.AppendLine("<text x=`"$x`" y=`"$($h - 8)`" text-anchor=`"middle`" fill=`"#9b9078`" font-size=`"11`" font-family=`"Consolas,monospace`">$($tt.ToString('HH:mm'))</text>") }
  foreach ($th in @(@{ v = 20; c = '#d4a24a'; n = '시작 조건 20GB' }, @{ v = 30; c = '#c0341d'; n = 'Library 없음 30GB' })) {
    if ($th.v -le $maxY) { $y = [math]::Round((& $sy $th.v), 1); [void]$o.AppendLine("<line x1=`"$l`" y1=`"$y`" x2=`"$($w - $r)`" y2=`"$y`" stroke=`"$($th.c)`" stroke-dasharray=`"6 4`"/><text x=`"$($w - $r - 4)`" y=`"$($y - 5)`" text-anchor=`"end`" fill=`"$($th.c)`" font-size=`"11`">$($th.n)</text>") }
  }
  if ($pts.Count -ge 1) {
    $poly = ($pts | ForEach-Object { '{0},{1}' -f [math]::Round((& $sx $_.t), 1), [math]::Round((& $sy $_.free), 1) }) -join ' '
    [void]$o.AppendLine("<polyline points=`"$poly`" fill=`"none`" stroke=`"#dfd6c2`" stroke-width=`"1.6`"/>")
    $last = $pts[$pts.Count - 1]; [void]$o.AppendLine("<circle cx=`"$([math]::Round((& $sx $last.t), 1))`" cy=`"$([math]::Round((& $sy $last.free), 1))`" r=`"3.5`" fill=`"#e0472a`"/>")
  } else { [void]$o.AppendLine("<text x=`"$($w / 2)`" y=`"$($h / 2)`" text-anchor=`"middle`" fill=`"#9b9078`" font-size=`"13`">기록 없음 (memlog.csv)</text>") }
  [void]$o.AppendLine('</svg>')
  return $o.ToString()
}
# 크래시 정지 규칙: 종료 코드 0xC0000005(-1073741819) 또는 로그에 access violation / crash has been intercepted -> 1회 재시도, 또 크래시면 HALT 파일을 만들고 멈춘다.
function Test-CrashRun($exitCode, [string]$logPath) {
  if ($null -ne $exitCode -and [int]$exitCode -eq -1073741819) { return $true }
  if ($logPath -and (Test-Path -LiteralPath $logPath)) { foreach ($l in [IO.File]::ReadLines($logPath)) { if ($l -match '(?i)access violation|crash has been intercepted') { return $true } } }
  return $false
}
function Set-Halt([string]$cause, [string]$log, [string]$crashDir, [string]$runId) {
  $o = [ordered]@{ time = (Get-Date).ToString('s'); cause = $cause; log = $log; crashDir = $crashDir; run = $runId; by = 'devtools-buildloop' }
  WriteJson $HaltFile $o 4
  Log ("HALT 파일 작성: $HaltFile ($cause)")
}
function Test-RequiredMedia([string]$proj, $rules) {
  $missing = @()
  foreach ($m in @($rules.requiredMedia)) {
    $f = Join-Path $proj ([string]$m.path)
    if (-not (Test-Path -LiteralPath $f)) { $missing += ([IO.Path]::GetFileName([string]$m.path) + ' (없음)'); continue }
    $len = (Get-Item -LiteralPath $f).Length
    if ($len -lt [long]$m.minBytes) { $missing += ([IO.Path]::GetFileName([string]$m.path) + " ($len 바이트 < $($m.minBytes))") }
  }
  return $missing
}
function Get-CrashInfo([datetime]$since) {
  $info = [ordered]@{ editorDir = ''; playerDir = '' }
  $ed = Join-Path $env:LOCALAPPDATA 'Temp\Unity\Editor\Crashes'
  if (Test-Path -LiteralPath $ed) { $d = Get-ChildItem -LiteralPath $ed -Directory -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1; if ($null -ne $d -and $d.LastWriteTime -ge $since) { $info.editorDir = $d.FullName } }
  $pr = Join-Path $env:LOCALAPPDATA 'Temp\ForDearGamers'
  if (Test-Path -LiteralPath $pr) { $d = Get-ChildItem -LiteralPath $pr -Directory -Recurse -Filter Crashes -ErrorAction SilentlyContinue | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Directory -ErrorAction SilentlyContinue } | Sort-Object LastWriteTime -Descending | Select-Object -First 1; if ($null -ne $d -and $d.LastWriteTime -ge $since) { $info.playerDir = $d.FullName } }
  return [pscustomobject]$info
}

# ---------- 잠금 / 대기 ----------
function Test-PidAlive([int]$p) { return [bool](Get-Process -Id $p -ErrorAction SilentlyContinue) }
function Acquire-Lock([string]$runId) {
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Cfg.LockFile) | Out-Null
  $deadline = (Get-Date).AddMinutes($Cfg.WaitMaxMin)
  while ($true) {
    # DT-01 순번 예약(queue\*.json): 예약이 있고 맨 앞이 내가 아니면 잠금을 잡지 않고 기다린다. 만료된 예약은 무시.
    $qdir = Join-Path (Split-Path -Parent $Cfg.LockFile) 'queue'; $front = $null
    if (Test-Path -LiteralPath $qdir) {
      foreach ($qf in @(Get-ChildItem -LiteralPath $qdir -Filter '*.json' -ErrorAction SilentlyContinue | Sort-Object Name)) {
        $q = $null; try { $q = ReadJson $qf.FullName } catch { }; if ($null -eq $q) { continue }
        $exp = $null; try { $exp = [DateTime]::Parse([string]$q.expiresAt).ToUniversalTime() } catch { }
        if ($exp -and $exp -lt [DateTime]::UtcNow) { continue }
        $front = $q; break
      }
    }
    if ($null -ne $front -and [string]$front.owner -ne 'devtools-buildloop') {
      if ((Get-Date) -gt $deadline) { Log "예약 대기 초과 (맨 앞: $($front.owner))"; return $false }
      Log "예약 대기: 맨 앞 예약자 $($front.owner) ($($front.note))"; Start-Sleep -Seconds 30; continue
    }
    try {
      $fs = [IO.File]::Open($Cfg.LockFile, 'CreateNew', 'Write', 'None')
      $body = @{ owner = 'devtools-buildloop'; pid = $PID; worktree = $Cfg.Worktree; startedAt = (Get-Date).ToString('s'); run = $runId } | ConvertTo-Json
      $bytes = $Utf8.GetBytes($body); $fs.Write($bytes, 0, $bytes.Length); $fs.Close()
      Log "잠금 획득 ($($Cfg.LockFile))"; return $true
    } catch [IO.IOException] {
      $holder = $null; try { $holder = ReadJson $Cfg.LockFile } catch { }
      $hp = 0; if ($null -ne $holder -and $holder.PSObject.Properties.Name -contains 'pid') { $hp = [int]$holder.pid }
      if ($hp -gt 0 -and -not (Test-PidAlive $hp)) {
        Log "죽은 pid $hp 의 잠금을 덮어쓴다"; Remove-Item -LiteralPath $Cfg.LockFile -Force -ErrorAction SilentlyContinue; continue
      }
      if ((Get-Date) -gt $deadline) { Log "잠금 대기 초과 (보유: $(Prop $holder 'owner' '?') pid $hp)"; return $false }
      Log "잠금 보유 중: $(Prop $holder 'owner' '?') pid $hp - 30초 후 재시도"; Start-Sleep -Seconds 30
    }
  }
}
function Release-Lock {
  try {
    $h = ReadJson $Cfg.LockFile
    if ($null -ne $h -and [string]$h.owner -eq 'devtools-buildloop' -and [int]$h.pid -eq $PID) { Remove-Item -LiteralPath $Cfg.LockFile -Force; Log '잠금 해제' }
  } catch { }
}
function Get-UnityProcs { return @(Get-Process Unity, EXODUSER-Unity -ErrorAction SilentlyContinue | Where-Object { -not $_.HasExited }) }
function Get-FreeCommitGB { $os = Get-CimInstance Win32_OperatingSystem; return [math]::Round($os.FreeVirtualMemory / 1MB, 1) }
function Wait-Ready([bool]$libraryExists) {
  $need = 20; if (-not $libraryExists) { $need = 30 }
  $deadline = (Get-Date).AddMinutes($Cfg.WaitMaxMin)
  while ($true) {
    $procs = @(Get-UnityProcs); $free = Get-FreeCommitGB
    if ($procs.Count -eq 0 -and $free -ge $need) { Log ("실행 조건 충족: Unity 0개, 커밋 여유 {0} GB (필요 {1})" -f $free, $need); return $true }
    if ((Get-Date) -gt $deadline) { Log ("대기 초과: Unity {0}개, 커밋 여유 {1} GB" -f $procs.Count, $free); return $false }
    Log ("대기: Unity {0}개 ({1}), 커밋 여유 {2} GB" -f $procs.Count, (($procs | ForEach-Object { "$($_.ProcessName)#$($_.Id)" }) -join ','), $free)
    Start-Sleep -Seconds 30
  }
}
# 사용자가 직접 연 바로가기 빌드(= --unity- 자동 인자가 없는 프로세스)인가
function Get-BuildHolders {
  $exe = (Join-Path $Cfg.Out 'build\EXODUSER-Unity.exe').ToLower()
  $list = @()
  foreach ($p in @(Get-CimInstance Win32_Process -Filter "Name='EXODUSER-Unity.exe'" -ErrorAction SilentlyContinue)) {
    if ($p.ExecutablePath -and $p.ExecutablePath.ToLower() -eq $exe) {
      $auto = [bool]($p.CommandLine -match '--unity-')
      $list += [pscustomobject]@{ pid = $p.ProcessId; auto = $auto }
    }
  }
  return $list
}

# ---------- 판정 ----------
function Load-Rules { return (Get-Content -LiteralPath $RulesFile -Raw -Encoding UTF8 | ConvertFrom-Json) }
function Judge-Log([string]$path, [string]$scope, $rules) {
  $res = [ordered]@{ path = $path; scope = $scope; lines = 0; fail = 0; known = 0; knownById = @{}; failById = @{}; top = @(); gfx = @(); graphicsOk = $false }
  if (-not (Test-Path -LiteralPath $path)) { $res.missing = $true; return [pscustomobject]$res }
  $ign = @($rules.ignore | ForEach-Object { New-Object Text.RegularExpressions.Regex($_) })
  $fails = @($rules.fail | Where-Object { $_.scope -contains $scope } | ForEach-Object { [pscustomobject]@{ id = $_.id; title = $_.title; rx = (New-Object Text.RegularExpressions.Regex($_.pattern)) } })
  $knowns = @($rules.knownIssues | Where-Object { $_.scope -contains $scope } | ForEach-Object { [pscustomobject]@{ id = $_.id; title = $_.title; rx = (New-Object Text.RegularExpressions.Regex($_.pattern)) } })
  $comp = @($rules.companions | ForEach-Object { New-Object Text.RegularExpressions.Regex($_) })
  $gfxRx = New-Object Text.RegularExpressions.Regex($rules.requireGraphics.pattern)
  $gfxName = New-Object Text.RegularExpressions.Regex($rules.requireGraphics.rendererPattern)
  $lines = [IO.File]::ReadAllLines($path)
  $res.lines = $lines.Length
  $samples = New-Object System.Collections.ArrayList
  $lastKnown = $null; $n = 0
  foreach ($line in $lines) {
    $n++
    if ($scope -eq 'player') {
      if ($gfxRx.IsMatch($line)) { $res.graphicsOk = $true; $res.gfx += $line.Trim() }
      elseif ($res.gfx.Count -gt 0 -and $res.gfx.Count -lt 3 -and $gfxName.IsMatch($line)) { $res.gfx += $line.Trim() }
    }
    $skip = $false; foreach ($r in $ign) { if ($r.IsMatch($line)) { $skip = $true; break } }
    if ($skip) { continue }
    $hit = $null; foreach ($f in $fails) { if ($f.rx.IsMatch($line)) { $hit = $f; break } }
    if ($null -eq $hit) { continue }
    $kid = $null
    foreach ($k in $knowns) { if ($k.rx.IsMatch($line)) { $kid = $k.id; break } }
    if ($null -eq $kid -and $null -ne $lastKnown) { foreach ($c in $comp) { if ($c.IsMatch($line)) { $kid = $lastKnown; break } } }
    if ($null -ne $kid) {
      $lastKnown = $kid; $res.known++
      if ($res.knownById.ContainsKey($kid)) { $res.knownById[$kid]++ } else { $res.knownById[$kid] = 1 }
    } else {
      $res.fail++
      if ($res.failById.ContainsKey($hit.id)) { $res.failById[$hit.id]++ } else { $res.failById[$hit.id] = 1 }
    }
    [void]$samples.Add([pscustomobject]@{ no = $n; id = $hit.id; known = $kid; text = $line.Trim() })
  }
  # 같은 문장 묶기: 오류(unknown)를 먼저, 그 다음 알려진 결함
  $grp = @($samples | Group-Object { $_.text } | ForEach-Object { $f0 = $_.Group[0]; [pscustomobject]@{ no = $f0.no; id = $f0.id; known = $f0.known; count = $_.Count; text = $f0.text } })
  $res.top = @($grp | Sort-Object @{ e = { if ($_.known) { 1 } else { 0 } } }, @{ e = { -$_.count } }, no | Select-Object -First 10)
  return [pscustomobject]$res
}
# 캡처가 전부 검은 화면이면(batchmode 에서 ScreenCapture 는 검은 PNG 를 쓴다) 스모크는 화면을 확인하지 못한 것이다.
function Measure-Caps([string]$dir) {
  $res = [ordered]@{ total = 0; black = 0; blackNames = @() }
  if (-not (Test-Path -LiteralPath $dir)) { return [pscustomobject]$res }
  Add-Type -AssemblyName System.Drawing
  foreach ($f in @(Get-ChildItem -LiteralPath $dir -Filter *.png | Sort-Object Name)) {
    $res.total++
    $bmp = $null
    try {
      $bmp = New-Object Drawing.Bitmap($f.FullName); $maxL = 0
      for ($yy = 0; $yy -lt 14; $yy++) { for ($xx = 0; $xx -lt 24; $xx++) {
        $c = $bmp.GetPixel([int](($xx + .5) * $bmp.Width / 24), [int](($yy + .5) * $bmp.Height / 14)); $l = [math]::Max($c.R, [math]::Max($c.G, $c.B)); if ($l -gt $maxL) { $maxL = $l }
      } }
      if ($maxL -lt 12) { $res.black++; $res.blackNames += $f.BaseName }
    } catch { } finally { if ($null -ne $bmp) { $bmp.Dispose() } }
  }
  return [pscustomobject]$res
}
# 사용자 실제 세이브 보호: 실행 전후 LocalLow\ForDearGamers 스냅샷을 비교한다(읽기만, 절대 수정·복원하지 않는다).
# Unity 에디터가 쓰는 Unity\local.* (Analytics) 는 세이브가 아니므로 제외한다.
function Get-UserSaveSnapshot {
  $snap = @{}
  $root = Join-Path $env:USERPROFILE 'AppData\LocalLow\ForDearGamers'
  if (-not (Test-Path -LiteralPath $root)) { return $snap }
  foreach ($f in @(Get-ChildItem -LiteralPath $root -Recurse -File -ErrorAction SilentlyContinue)) {
    if ($f.FullName -like '*\Unity\local.*') { continue }
    if ($f.FullName -like '*\qa\*') { continue }   # NativeQaSandbox 자동 격리 폴더(persistentDataPath\qa\<시각>-<pid>)
    $h = ''
    if ($f.Length -le 2097152) { try { $h = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256 -ErrorAction Stop).Hash.Substring(0, 16) } catch { $h = 'locked' } }
    $snap[$f.FullName] = ('{0}|{1}|{2}' -f $f.Length, $f.LastWriteTimeUtc.Ticks, $h)
  }
  return $snap
}
function Compare-UserSave($before, $after) {
  $ch = @()
  foreach ($k in $after.Keys) { if (-not $before.ContainsKey($k)) { $ch += ('추가 ' + $k) } elseif ($before[$k] -ne $after[$k]) { $ch += ('변경 ' + $k) } }
  foreach ($k in $before.Keys) { if (-not $after.ContainsKey($k)) { $ch += ('삭제 ' + $k) } }
  return [pscustomobject]@{ changed = $ch.Count; files = @($ch | Select-Object -First 12) }
}
function Judge-M1($path, $rules) {
  $m = ReadJson $path
  if ($null -eq $m) { return [pscustomobject]@{ present = $false; ok = 0; fail = 0; neutral = 0; stages = @(); firstBlocked = ''; device = ''; deviceType = ''; captureMode = ''; headless = $false; guiRepaints = 0; guiBridged = 0 } }
  $ok = 0; $fail = 0; $neu = 0; $stages = @()
  foreach ($s in @($m.stages)) {
    $st = [string]$s.status
    if ($rules.m1.failStatuses -contains $st) { $fail++ } elseif ($rules.m1.okStatuses -contains $st) { $ok++ } else { $neu++ }
    $stages += [pscustomobject]@{ id = [string]$s.id; name = [string]$s.name; status = $st; note = [string]$s.note; capture = [string]$s.capture; overlay = [string](Prop $s 'overlay' '') }
  }
  return [pscustomobject]@{ present = $true; ok = $ok; fail = $fail; neutral = $neu; stages = $stages; firstBlocked = [string](Prop $m 'firstBlocked' ''); device = [string](Prop $m 'device' ''); deviceType = [string](Prop $m 'deviceType' ''); captureMode = [string](Prop $m 'captureMode' ''); headless = [bool](Prop $m 'headless' $false); guiRepaints = [int](Prop $m 'guiRepaints' 0); guiBridged = [int](Prop $m 'guiBridged' 0) }
}

# ---------- 스모크(실제 GPU, 무창) ----------
# 플레이어는 -batchmode(-nographics 없음)로 띄워 GPU 장치를 유지하고 창은 만들지 않는다. 소리: --unity-mute (AudioListener.volume=0, pause=true).
# 자기가 띄운 프로세스의 MainWindowHandle 이 0 이 아니면 실패로 친다.
function Test-OwnWindow($proc) { try { $proc.Refresh(); return ($proc.MainWindowHandle -ne [IntPtr]::Zero) } catch { return $false } }
function Run-Smoke([string]$buildDir, [string]$smokeDir, [string]$flag = '--unity-m1-check', [string]$receiptName = 'm1-check.json') {
  $r = [ordered]@{ ran = $false; exit = $null; timedOut = $false; windowSeen = $false; slowExit = $false; receiptWritten = $false; exitAfterReceiptSec = $null; note = ''; seconds = 0 }
  New-Item -ItemType Directory -Force -Path $smokeDir | Out-Null
  New-Item -ItemType Directory -Force -Path (Join-Path $smokeDir 'sandbox') | Out-Null
  $sw = [Diagnostics.Stopwatch]::StartNew()
  $args2 = @('-batchmode', $flag, '--unity-mute', '--unity-qa-sandbox', (Join-Path $smokeDir 'sandbox'), '-output', $smokeDir, '-screen-width', $Cfg.SmokeW, '-screen-height', $Cfg.SmokeH, '-logFile', (Join-Path $smokeDir 'player.log'))
  $p = Start-Process -FilePath (Join-Path $buildDir 'EXODUSER-Unity.exe') -ArgumentList $args2 -PassThru
  $r.ran = $true
  $deadline = (Get-Date).AddMinutes($Cfg.SmokeTimeoutMin); $receipt = Join-Path $smokeDir $receiptName; $receiptSeen = $null
  while (-not $p.WaitForExit(2000)) {
    if (Test-OwnWindow $p) { $r.windowSeen = $true; $r.note = '플레이어가 창을 만들었다(무창 위반) - 강제 종료'; try { $p.Kill() } catch { }; break }
    if ($null -eq $receiptSeen -and (Test-Path -LiteralPath $receipt)) { $receiptSeen = Get-Date }
    if ($null -ne $receiptSeen -and ((Get-Date) - $receiptSeen).TotalSeconds -gt $Cfg.ExitGraceSec) { $r.slowExit = $true; $r.note = "$receiptName 을 쓴 뒤 $($Cfg.ExitGraceSec)초 안에 종료하지 않음(DBT-6) - 강제 종료"; try { $p.Kill() } catch { }; break }
    if ((Get-Date) -gt $deadline) { $r.timedOut = $true; $r.note = "스모크 시간 초과($($Cfg.SmokeTimeoutMin)분), 강제 종료"; try { $p.Kill() } catch { }; break }
  }
  try { $p.WaitForExit(10000) | Out-Null; $r.exit = $p.ExitCode } catch { }
  if ($null -ne $receiptSeen) { $r.receiptWritten = $true; $r.exitAfterReceiptSec = [int]((Get-Date) - $receiptSeen).TotalSeconds }
  $r.seconds = [int]$sw.Elapsed.TotalSeconds
  return [pscustomobject]$r
}

# ---------- 교체 ----------
function Swap-Build($stateObj, [string]$runDir, $loopReceipt) {
  $build = Join-Path $Cfg.Out 'build'; $prev = Join-Path $Cfg.Out 'build_prev'; $new = Join-Path $Cfg.Out 'build_new'
  $holders = @(Get-BuildHolders)
  $user = @($holders | Where-Object { -not $_.auto })
  if ($user.Count -gt 0) { return @{ done = $false; note = "사용자가 build 를 실행 중(pid $($user[0].pid)) - 교체 대기, 사용자 창은 건드리지 않음" } }
  $auto = @($holders | Where-Object { $_.auto })
  $until = (Get-Date).AddMinutes(10)
  while ($auto.Count -gt 0 -and (Get-Date) -lt $until) { Log "자동 스모크가 build 를 잡고 있음(pid $($auto[0].pid)) - 30초 대기"; Start-Sleep -Seconds 30; $auto = @(Get-BuildHolders | Where-Object { $_.auto }) }
  if ($auto.Count -gt 0) { return @{ done = $false; note = "다른 자동 스모크(pid $($auto[0].pid))가 build 를 계속 사용 - 교체 대기" } }
  try {
    if (Test-Path -LiteralPath $prev) { Remove-Item -LiteralPath $prev -Recurse -Force }
    if (Test-Path -LiteralPath $build) { Move-Item -LiteralPath $build -Destination $prev }
    Move-Item -LiteralPath $new -Destination $build
  } catch {
    # 되돌리기
    if ((-not (Test-Path -LiteralPath $build)) -and (Test-Path -LiteralPath $prev)) { try { Move-Item -LiteralPath $prev -Destination $build } catch { } }
    return @{ done = $false; note = "교체 실패, 이전 build 복구 시도: $($_.Exception.Message)" }
  }
  # 영수증 / 기존 호환 파일
  Copy-Item -LiteralPath (Join-Path $runDir 'build-receipt.json') -Destination (Join-Path $Cfg.Out 'build-receipt.json') -Force
  Copy-Item -LiteralPath (Join-Path $runDir 'build.log') -Destination (Join-Path $Cfg.Out 'build.log') -Force
  $pl = Join-Path $runDir 'smoke\player.log'; if (Test-Path -LiteralPath $pl) { Copy-Item -LiteralPath $pl -Destination (Join-Path $Cfg.Out 'smoke-player.log') -Force }
  WriteJson (Join-Path $Cfg.Out 'build-commit.json') ([ordered]@{ commit = $loopReceipt.sha; branch = $loopReceipt.branch; built_at = $loopReceipt.builtAt; exe = (Join-Path $build 'EXODUSER-Unity.exe'); receipt = 'build-receipt.json'; by = 'devtools-buildloop'; verdict = $loopReceipt.verdict })
  return @{ done = $true; note = '교체 완료(이전 빌드는 build_prev 1세대 보관)' }
}

# ---------- 상태판 ----------
function Esc($s) { return [Net.WebUtility]::HtmlEncode([string]$s) }
function Verdict-Label([string]$v) {
  switch ($v) { 'PASS' { return '통과' } 'KNOWN' { return '알려진 결함' } 'FAIL' { return '실패' } 'ABORT' { return '중단' } 'LEGACY' { return '수동 빌드' } default { return $v } }
}
function Make-Thumbs([string]$runId, [string]$capsDir) {
  $dest = Join-Path $StatusDir ("thumbs\" + $runId)
  if (-not (Test-Path -LiteralPath $capsDir)) { return @() }
  New-Item -ItemType Directory -Force -Path $dest | Out-Null
  Add-Type -AssemblyName System.Drawing
  $list = @()
  foreach ($f in @(Get-ChildItem -LiteralPath $capsDir -Filter *.png | Sort-Object Name)) {
    $t = Join-Path $dest ($f.BaseName + '.jpg')
    try {
      $img = [Drawing.Image]::FromFile($f.FullName)
      try {
        $w = 384; $h = [int]($img.Height * $w / $img.Width)
        $bmp = New-Object Drawing.Bitmap($w, $h)
        $g = [Drawing.Graphics]::FromImage($bmp); $g.InterpolationMode = 'HighQualityBicubic'; $g.DrawImage($img, 0, 0, $w, $h); $g.Dispose()
        $bmp.Save($t, [Drawing.Imaging.ImageFormat]::Jpeg); $bmp.Dispose()
      } finally { $img.Dispose() }
      $list += [pscustomobject]@{ name = $f.BaseName; thumb = ("thumbs/$runId/" + $f.BaseName + '.jpg'); full = ("../loop/runs/$runId/smoke/caps/" + $f.Name) }
    } catch { Log "썸네일 실패 $($f.Name): $($_.Exception.Message)" }
  }
  return $list
}
function Prune-Runs {
  $dirs = @(Get-ChildItem -LiteralPath $RunsDir -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending)
  if ($dirs.Count -le $Cfg.KeepRuns) { return }
  foreach ($d in ($dirs | Select-Object -Skip $Cfg.KeepRuns)) {
    Remove-Item -LiteralPath $d.FullName -Recurse -Force -ErrorAction SilentlyContinue
    $t = Join-Path $StatusDir ("thumbs\" + $d.Name); if (Test-Path -LiteralPath $t) { Remove-Item -LiteralPath $t -Recurse -Force -ErrorAction SilentlyContinue }
  }
}
function Write-Status($stateObj) {
  New-Item -ItemType Directory -Force -Path $StatusDir | Out-Null
  $rules = Load-Rules
  $hist = @($stateObj.history)
  $latest = $null
  if ($hist.Count -gt 0) { $latest = ReadJson (Join-Path $RunsDir (Join-Path $hist[0].id 'run.json')) }
  $dep = $stateObj.deployed
  $json = [ordered]@{
    generatedAt = (Get-Date).ToString('s')
    deployed = $dep
    pending = $stateObj.pending
    latest = $latest
    history = $hist
    knownIssueDefs = @($rules.knownIssues | ForEach-Object { [ordered]@{ id = $_.id; title = $_.title } })
  }
  WriteJson (Join-Path $StatusDir 'status.json') $json 10

  $sb = New-Object Text.StringBuilder
  $css = @'
:root{--bg:#0e0c0b;--panel:#16120f;--line:rgba(164,147,115,.5);--line2:rgba(164,147,115,.22);--bone:#dfd6c2;--dim:#9b9078;--red:#c0341d;--redhot:#e0472a;--ok:#9db38a;--warn:#d4a24a}
*{box-sizing:border-box}
html{background:var(--bg)}
body{margin:0;background:radial-gradient(1200px 500px at 50% -120px,#2a1410 0%,#0e0c0b 70%);color:var(--bone);font:15px/1.6 'Nanum Myeongjo','Noto Serif KR','Batang',Georgia,serif}
.wrap{max-width:1280px;margin:0 auto;padding:28px 24px 60px}
h1{font:600 28px/1.2 'Cinzel','Nanum Myeongjo',Georgia,serif;letter-spacing:.12em;margin:0 0 4px;color:var(--bone)}
h1 small{display:block;font:13px 'Nanum Myeongjo',Georgia,serif;letter-spacing:.06em;color:var(--dim);margin-top:6px}
h2{font:600 15px 'Cinzel','Nanum Myeongjo',Georgia,serif;letter-spacing:.18em;color:var(--bone);margin:34px 0 10px;padding-bottom:6px;border-bottom:1px solid var(--line)}
h2::before{content:"";display:inline-block;width:8px;height:8px;margin-right:10px;background:var(--red);transform:rotate(45deg);vertical-align:1px}
.panel{background:linear-gradient(180deg,rgba(26,20,17,.92),rgba(18,14,12,.92));border:1px solid var(--line);padding:16px 18px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}
.k{color:var(--dim);font-size:12px;letter-spacing:.08em}
.v{font-size:17px}
.badge{display:inline-block;padding:2px 12px;border:1px solid var(--line);font:600 13px 'Cinzel','Nanum Myeongjo',serif;letter-spacing:.1em}
.b-PASS{color:var(--ok);border-color:#6f8560}.b-KNOWN{color:var(--warn);border-color:#9a7a38}.b-FAIL{color:var(--redhot);border-color:var(--red)}.b-ABORT,.b-LEGACY{color:var(--dim)}
table{width:100%;border-collapse:collapse;font-size:14px}
th{font:600 12px 'Cinzel','Nanum Myeongjo',serif;letter-spacing:.12em;color:var(--dim);text-align:left;border-bottom:1px solid var(--line);padding:6px 10px}
td{padding:6px 10px;border-bottom:1px solid var(--line2);vertical-align:top}
th{white-space:nowrap}td.nm,td.mono,td.st-ok,td.st-fail,td.st-missing,td.st-pending-core{white-space:nowrap}td.mono.wrap{white-space:normal}
.mono{font-family:Consolas,'D2Coding',monospace;font-size:12.5px;color:#cfc6b2;word-break:break-all}
.st-ok{color:var(--ok)}.st-fail,.st-missing{color:var(--redhot)}.st-pending-core{color:var(--warn)}
.thumbs{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.thumbs a{display:block;border:1px solid var(--line);background:#000;color:var(--dim);text-decoration:none;font-size:11px}
.thumbs img{display:block;width:100%;height:auto}
.thumbs span{display:block;padding:3px 8px;font-family:Consolas,monospace}
.note{color:var(--dim);font-size:13px}
.warnbox{border:1px solid #9a7a38;background:rgba(154,122,56,.08);padding:10px 14px;color:var(--warn);margin-top:12px}
ul{margin:6px 0 0;padding-left:18px}
'@
  [void]$sb.AppendLine('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="60"><title>EXODUSER 빌드 상태판</title><style>' + $css + '</style></head><body><div class="wrap">')
  [void]$sb.AppendLine('<h1>EXODUSER BUILD LOOP<small>unity/main 빌드 · 실제 GPU 스모크 · 판정 · 바로가기 빌드 교체 &nbsp;·&nbsp; 갱신 ' + (Esc (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) + '</small></h1>')

  # 배포 빌드 / 최신 시도
  [void]$sb.AppendLine('<h2>BUILD</h2><div class="grid">')
  $dtxt = '아직 없음'; $dv = ''; $dat = ''
  $dunv = ''
  if ($null -ne $dep -and $dep.runId -ne 'legacy') { $drun = ReadJson (Join-Path (Join-Path $RunsDir ([string]$dep.runId)) 'run.json'); if ($null -ne $drun -and (($null -ne (Prop $drun 'capsBlack' $null) -and [int]$drun.capsBlack.total -gt 0 -and [int]$drun.capsBlack.black -eq [int]$drun.capsBlack.total) -or ($null -ne $drun.m1 -and $drun.m1.present -and [string]$drun.m1.captureMode -eq ''))) { $dunv = '<div class="note" style="margin-top:8px;color:#d4a24a">화면 미검증(구 캡처 코드)</div>' } }
  if ($null -ne $dep) { $dtxt = [string]$dep.sha; $dv = [string]$dep.verdict; $dat = [string]$dep.at }
  [void]$sb.AppendLine('<div class="panel"><div class="k">바로가기 빌드 (unity-latest\build)</div><div class="v mono">' + (Esc $dtxt) + '</div><div class="k" style="margin-top:6px">' + (Esc $dat) + ' &nbsp; <span class="badge b-' + (Esc $dv) + '">' + (Esc (Verdict-Label $dv)) + '</span></div>' + $dunv + '</div>')
  if ($null -ne $latest) {
    $lv = [string]$latest.verdict
    [void]$sb.AppendLine('<div class="panel"><div class="k">최근 시도</div><div class="v mono">' + (Esc $latest.sha) + ' <span class="badge b-' + (Esc $lv) + '">' + (Esc (Verdict-Label $lv)) + '</span></div><div class="k" style="margin-top:6px">' + (Esc $latest.startedAt) + ' · 빌드 ' + ([math]::Round([double]$latest.buildSeconds / 60, 1)) + '분 · 스모크 ' + ([math]::Round([double]$latest.smokeSeconds / 60, 1)) + '분</div><div class="note" style="margin-top:6px">' + (Esc $latest.subject) + '</div><div class="note">build 교체: ' + (Esc $(if ($latest.replaced) { '했음' } else { '안 함' })) + ' - ' + (Esc $latest.replaceNote) + '</div></div>')
  } else { [void]$sb.AppendLine('<div class="panel"><div class="k">최근 시도</div><div class="v">기록 없음</div></div>') }
  [void]$sb.AppendLine('</div>')
  if ($null -ne $stateObj.pending) { [void]$sb.AppendLine('<div class="warnbox">교체 대기: ' + (Esc $stateObj.pending.sha) + ' (' + (Esc (Verdict-Label ([string]$stateObj.pending.verdict))) + ') - ' + (Esc $stateObj.pending.reason) + '</div>') }

  if ($null -ne $latest) {
    # 바뀐 커밋
    [void]$sb.AppendLine('<h2>CHANGES</h2><div class="panel"><div class="note">직전 배포 빌드 대비 ' + (Esc $latest.changedCount) + '개 커밋(첫 부모 기준 최대 10줄)</div><ul>')
    foreach ($c in @($latest.changed)) { [void]$sb.AppendLine('<li><span class="mono">' + (Esc $c.sha) + '</span> ' + (Esc $c.subject) + '</li>') }
    [void]$sb.AppendLine('</ul></div>')

    # 판정
    [void]$sb.AppendLine('<h2>VERDICT</h2><div class="panel"><table><tr><th>대상</th><th>오류(결함)</th><th>알려진 결함</th><th>비고</th></tr>')
    $b = $latest.build; $p = $latest.player
    if ($null -ne $b) { [void]$sb.AppendLine('<tr><td>빌드 로그</td><td>' + (Esc $b.fail) + '</td><td>' + (Esc $b.known) + '</td><td class="note">종료코드 ' + (Esc $latest.buildExit) + ' · 영수증 passed=' + (Esc $latest.receiptPassed) + '</td></tr>') }
    else { [void]$sb.AppendLine('<tr><td>빌드 로그</td><td colspan="3" class="note">빌드 판정 없음(중단): ' + (Esc $latest.replaceNote) + '</td></tr>') }
    if ($null -ne $p) {
      $gtxt = 'Direct3D 확인 못함'; if ($p.graphicsOk) { $gtxt = (@($p.gfx) -join ' / ') }
      [void]$sb.AppendLine('<tr><td>플레이어 로그</td><td>' + (Esc $p.fail) + '</td><td>' + (Esc $p.known) + '</td><td class="note">' + (Esc $gtxt) + '</td></tr>')
    } else { [void]$sb.AppendLine('<tr><td>플레이어 로그</td><td colspan="3" class="note">스모크 실행 안 함: ' + (Esc $latest.smokeNote) + '</td></tr>') }
    [void]$sb.AppendLine('</table>')
    if ($null -ne $latest.m1 -and $latest.m1.present) { [void]$sb.AppendLine('<div class="note" style="margin-top:8px">그래픽 장치 ' + (Esc $latest.m1.deviceType) + ' · ' + (Esc $latest.m1.device) + ' · 캡처 방식 ' + (Esc $latest.m1.captureMode) + ' · IMGUI Repaint ' + (Esc $latest.m1.guiRepaints) + ' / 캡처에 그려진 횟수 ' + (Esc $latest.m1.guiBridged) + '</div>') }
    $hudx = Prop $latest 'hud' $null
    if ($null -ne $hudx) { [void]$sb.AppendLine('<div class="note" style="margin-top:6px">hud-smoke(무창): 종료코드 ' + (Esc $hudx.exit) + ' · 영수증 ' + (Esc $hudx.receiptWritten) + ' · 영수증 뒤 종료까지 ' + (Esc $hudx.exitAfterReceiptSec) + '초 · 시간 초과 ' + (Esc $hudx.timedOut) + '</div>') }
    $smx = Prop $latest 'smoke' $null
    if ($null -ne $smx) { [void]$sb.AppendLine('<div class="note" style="margin-top:6px">m1-check(무창): 종료코드 ' + (Esc $smx.exit) + ' · 영수증 뒤 종료까지 ' + (Esc $smx.exitAfterReceiptSec) + '초 · 창 핸들 감지 ' + (Esc $smx.windowSeen) + '</div>') }
    $mm = Prop $latest 'mediaMissing' $null
    if ($null -ne $mm -and @($mm).Count -gt 0) { [void]$sb.AppendLine('<div class="warnbox" style="border-color:#c0341d;color:#e0472a">필수 영상 누락: ' + (Esc (@($mm) -join ', ')) + '</div>') }
    $cr = Prop $latest 'crash' $null; $bcr = Prop $latest 'buildCrash' $null
    if ($null -ne $cr) { [void]$sb.AppendLine('<div class="warnbox">플레이어 크래시 의심 - 플레이어 크래시 폴더: ' + (Esc $cr.playerDir) + ' · 로그: loopuns' + (Esc $latest.id) + '\smoke\player.log</div>') }
    if ($null -ne $bcr) { [void]$sb.AppendLine('<div class="warnbox">빌드 비정상 종료 - Unity 크래시 폴더: ' + (Esc $bcr.editorDir) + ' · 로그: loopuns' + (Esc $latest.id) + 'uild.log</div>') }
    $us = Prop $latest 'userSave' $null
    if ($null -ne $us) { $ucls = 'note'; if ([int]$us.changed -gt 0) { $ucls = 'warnbox' }; [void]$sb.AppendLine('<div class="' + $ucls + '" style="margin-top:6px">USER_SAVE changed=' + (Esc $us.changed) + (Esc $(if ([int]$us.changed -gt 0) { ' - ' + (@($us.files) -join ' | ') } else { ' (LocalLow\ForDearGamers 전후 비교, Unity Analytics 제외)' })) + '</div>') }
    $cb = Prop $latest 'capsBlack' $null
    if ($null -ne $cb -and [int]$cb.total -gt 0 -and [int]$cb.black -eq [int]$cb.total) { [void]$sb.AppendLine('<div class="warnbox">화면 미검증(구 캡처 코드) - 캡처 ' + (Esc $cb.total) + '장이 전부 검은 화면. 로그·m1 단계는 정상.</div>') }
    if ($null -ne $cb) { [void]$sb.AppendLine('<div class="note" style="margin-top:6px">캡처 ' + (Esc $cb.total) + '장 중 검은 화면 ' + (Esc $cb.black) + '장' + (Esc $(if (@($cb.blackNames).Count -gt 0) { ': ' + (@($cb.blackNames) -join ', ') } else { '' })) + '</div>') }
    if ($null -ne (Prop $latest 'captureNote' $null)) { [void]$sb.AppendLine('<div class="warnbox">' + (Esc $latest.captureNote) + '</div>') }
    $kn = @{}
    foreach ($src in @($b, $p)) { if ($null -ne $src -and $null -ne $src.knownById) { foreach ($prop in $src.knownById.PSObject.Properties) { $cur = 0; if ($kn.ContainsKey($prop.Name)) { $cur = $kn[$prop.Name] }; $kn[$prop.Name] = $cur + [int]$prop.Value } } }
    $ek = Prop $latest 'extraKnown' $null
    if ($null -ne $ek) { foreach ($prop in $ek.PSObject.Properties) { $cur = 0; if ($kn.ContainsKey($prop.Name)) { $cur = $kn[$prop.Name] }; $kn[$prop.Name] = $cur + [int]$prop.Value } }
    $knownTotal = 0; foreach ($v in $kn.Values) { $knownTotal += $v }
    [void]$sb.AppendLine('<p>알려진 결함 <b>' + $knownTotal + '</b>건 - 통과로 바꾸지 않는다.</p>')
    if ($kn.Count -gt 0) {
      [void]$sb.AppendLine('<table><tr><th>id</th><th>결함</th><th>줄 수</th></tr>')
      foreach ($d in (@($rules.knownIssues) + @($rules.signalIssues))) { if ($kn.ContainsKey($d.id)) { [void]$sb.AppendLine('<tr><td class="mono">' + (Esc $d.id) + '</td><td>' + (Esc $d.title) + '</td><td>' + $kn[$d.id] + '</td></tr>') } }
      [void]$sb.AppendLine('</table>')
    }
    [void]$sb.AppendLine('</div>')

    # 스모크 단계
    [void]$sb.AppendLine('<h2>SMOKE (m1-check)</h2><div class="panel">')
    if ($null -ne $latest.m1 -and $latest.m1.present) {
      [void]$sb.AppendLine('<div class="note">ok ' + $latest.m1.ok + ' · fail ' + $latest.m1.fail + ' · 기타 ' + $latest.m1.neutral + (Esc $(if ($latest.m1.firstBlocked) { ' · 첫 막힘: ' + $latest.m1.firstBlocked } else { '' })) + '</div>')
      [void]$sb.AppendLine('<table><tr><th>단계</th><th>이름</th><th>결과</th><th>화면 위 UI</th><th>메모</th></tr>')
      foreach ($s in @($latest.m1.stages)) { $note = [string]$s.note; if ($note.Length -gt 200) { $note = $note.Substring(0, 200) + '...' }; [void]$sb.AppendLine('<tr><td class="mono">' + (Esc $s.id) + '</td><td class="nm">' + (Esc $s.name) + '</td><td class="st-' + (Esc $s.status) + '">' + (Esc $s.status) + '</td><td class="mono ' + $(if ([string]$s.overlay -match 'pause') { 'st-fail' } else { '' }) + '">' + (Esc $(if ($s.overlay) { $s.overlay } else { '-' })) + '</td><td class="note">' + (Esc $note) + '</td></tr>') }
      [void]$sb.AppendLine('</table>')
    } else { [void]$sb.AppendLine('<div class="note">m1-check.json 없음 - ' + (Esc $latest.smokeNote) + '</div>') }
    [void]$sb.AppendLine('</div>')

    # 오류 줄
    [void]$sb.AppendLine('<h2>LOG LINES (상위 10)</h2><div class="panel"><table><tr><th>로그</th><th>줄</th><th>분류</th><th>횟수</th><th>내용</th></tr>')
    $rows = @(); if ($null -ne $b) { foreach ($x in @($b.top)) { $rows += [pscustomobject]@{ log = '빌드'; x = $x } } }; if ($null -ne $p) { foreach ($x in @($p.top)) { $rows += [pscustomobject]@{ log = '플레이어'; x = $x } } }
    $rows = @($rows | Sort-Object @{ e = { if ($_.x.known) { 1 } else { 0 } } }, @{ e = { -[int]$_.x.count } } | Select-Object -First 10)
    if ($rows.Count -eq 0) { [void]$sb.AppendLine('<tr><td colspan="5" class="note">걸린 줄 없음</td></tr>') }
    foreach ($r in $rows) { $cls = [string]$r.x.id; if ($r.x.known) { $cls += ' / ' + $r.x.known }; [void]$sb.AppendLine('<tr><td>' + (Esc $r.log) + '</td><td class="mono">' + (Esc $r.x.no) + '</td><td class="mono">' + (Esc $cls) + '</td><td>' + (Esc $r.x.count) + '</td><td class="mono wrap">' + (Esc $r.x.text) + '</td></tr>') }
    [void]$sb.AppendLine('</table></div>')

    # 캡처
    [void]$sb.AppendLine('<h2>CAPTURES</h2><div class="panel">')
    if (@($latest.caps).Count -gt 0) {
      [void]$sb.AppendLine('<div class="thumbs">')
      foreach ($c in @($latest.caps)) { [void]$sb.AppendLine('<a href="' + (Esc $c.full) + '" target="_blank"><img src="' + (Esc $c.thumb) + '" alt="' + (Esc $c.name) + '" loading="lazy"><span>' + (Esc $c.name) + '</span></a>') }
      [void]$sb.AppendLine('</div>')
    } else { [void]$sb.AppendLine('<div class="note">캡처 없음</div>') }
    [void]$sb.AppendLine('</div>')
  }

  if (Test-Path -LiteralPath $HaltFile) { [void]$sb.AppendLine('<div class="warnbox" style="border-color:#c0341d;color:#e0472a">정지(HALT): ' + (Esc (Get-Content -LiteralPath $HaltFile -Raw -Encoding UTF8)) + '</div>') }
  # 메모리
  [void]$sb.AppendLine('<h2>MEMORY (커밋 여유 GB, 최근 24시간)</h2><div class="panel">' + (Mem-Svg) + '<div class="note">memlog.csv 기준. 점선 = 시작 조건(Library 있음 20GB / 없음 30GB).</div></div>')
  # 이력
  [void]$sb.AppendLine('<h2>HISTORY (최근 ' + $Cfg.KeepRuns + '회)</h2><div class="panel"><table><tr><th>시각</th><th>SHA</th><th>판정</th><th>결함</th><th>알려진</th><th>m1 ok/fail</th><th>빌드/스모크(분)</th><th>교체</th></tr>')
  foreach ($h in ($hist | Select-Object -First $Cfg.KeepRuns)) {
    [void]$sb.AppendLine('<tr><td class="mono">' + (Esc $h.startedAt) + '</td><td class="mono">' + (Esc $h.sha) + '</td><td><span class="badge b-' + (Esc $h.verdict) + '">' + (Esc (Verdict-Label ([string]$h.verdict))) + '</span></td><td>' + (Esc $h.fail) + '</td><td>' + (Esc $h.known) + '</td><td>' + (Esc $h.m1ok) + '/' + (Esc $h.m1fail) + '</td><td>' + (Esc $h.buildMin) + ' / ' + (Esc $h.smokeMin) + '</td><td>' + (Esc $(if ($h.replaced) { '예' } else { '아니오' })) + '</td></tr>')
  }
  if ($hist.Count -eq 0) { [void]$sb.AppendLine('<tr><td colspan="8" class="note">기록 없음</td></tr>') }
  [void]$sb.AppendLine('</table></div></div></body></html>')
  [IO.File]::WriteAllText((Join-Path $StatusDir 'index.html'), $sb.ToString(), $Utf8)
}

# ---------- 명령 ----------
function Get-HeadInfo {
  [void](GitR fetch -q origin unity/main)   # 브랜치 -Ref 는 로컬 브랜치를 그대로 쓴다
  $full = [string](GitR rev-parse $Ref); $short = [string](GitR rev-parse --short=9 $Ref); $subj = [string](GitR log -1 --format=%s $Ref)
  return [pscustomobject]@{ full = $full.Trim(); short = $short.Trim(); subject = $subj }
}
function Get-Changed([string]$fromFull, [string]$toFull) {
  $count = 0; $items = @()
  if ($fromFull) {
    try {
      $count = [int](GitR rev-list --count "$fromFull..$toFull")
      $items = @((GitR log --first-parent -10 --format='%h|%s' "$fromFull..$toFull") | ForEach-Object { $p = ([string]$_).Split('|', 2); [pscustomobject]@{ sha = $p[0]; subject = $p[1] } })
    } catch { }
  }
  return [pscustomobject]@{ count = $count; items = $items }
}

function Cmd-Check {
  if (Test-Path -LiteralPath $HaltFile) { Write-Host "HALT 파일 있음: $HaltFile - run 은 실행되지 않는다" }
  $st = Load-State; $head = Get-HeadInfo
  $depFull = ''; $depShort = '(없음)'
  if ($null -ne $st.deployed) { $depFull = [string]$st.deployed.shaFull; $depShort = [string]$st.deployed.sha }
  Write-Host ("origin/unity/main HEAD : {0}  {1}" -f $head.short, $head.subject)
  Write-Host ("마지막 배포 빌드       : {0}  ({1})" -f $depShort, $(if ($null -ne $st.deployed) { $st.deployed.at } else { '' }))
  $needs = ($head.full -ne $depFull)
  $ch = Get-Changed $depFull $head.full
  if ($needs) {
    Write-Host ("새 커밋 {0}개:" -f $ch.count)
    foreach ($c in $ch.items) { Write-Host ("  {0}  {1}" -f $c.sha, $c.subject) }
    if ($Ref -eq $MainRef -and $st.lastAttemptSha -eq $head.full) { Write-Host ("주의: 이 HEAD 는 이미 시도됨(판정 {0}). run 은 -Force 가 있어야 다시 돈다." -f $st.lastAttemptVerdict) }
  } else { Write-Host '새 커밋 없음' }
  Write-Host ("NEEDS_BUILD={0}" -f $needs)
}

function Cmd-Status {
  $st = Load-State; Write-Status $st
  if ($null -ne $st.deployed) { Write-Host ("배포 빌드: {0} {1} ({2})" -f $st.deployed.sha, $st.deployed.at, $st.deployed.verdict) } else { Write-Host '배포 빌드 기록 없음' }
  $h = @($st.history); if ($h.Count -gt 0) { Write-Host ("최근 시도: {0} {1} {2} 결함 {3} / 알려진 {4}" -f $h[0].startedAt, $h[0].sha, $h[0].verdict, $h[0].fail, $h[0].known) }
  if ($null -ne $st.pending) { Write-Host ("교체 대기: {0} - {1}" -f $st.pending.sha, $st.pending.reason) }
  Write-Host ("상태판: {0}" -f (Join-Path $StatusDir 'index.html'))
}

function Cmd-Install {
  $dst = Join-Path $LoopDir 'bin'; New-Item -ItemType Directory -Force -Path $dst | Out-Null
  Copy-Item -Path (Join-Path $PSScriptRoot '*') -Destination $dst -Recurse -Force
  Write-Host "설치: $dst"
}

function Cmd-Swap {
  $st = Load-State
  if ($null -eq $st.pending) { Log '교체 대기 항목 없음'; return }
  $pend = $st.pending
  if ($pend.verdict -eq 'KNOWN' -and -not $AllowKnown) { Log '대기 중인 빌드는 알려진 결함이 있다 - -AllowKnown 없이는 교체하지 않는다'; return }
  if (-not (Test-Path -LiteralPath (Join-Path $Cfg.Out 'build_new\EXODUSER-Unity.exe'))) { Log 'build_new 가 없다'; $st.pending = $null; Save-State $st; return }
  $runDir = Join-Path $RunsDir $pend.runId
  $lr = ReadJson (Join-Path $runDir 'loop-receipt.json')
  $res = Swap-Build $st $runDir $lr
  Log $res.note
  if ($res.done) {
    $st.deployed = [pscustomobject]@{ sha = [string]$pend.sha; shaFull = [string]$pend.shaFull; at = (Get-Date -Format 'yyyy-MM-dd HH:mm'); runId = [string]$pend.runId; verdict = [string]$pend.verdict }
    $st.pending = $null
    $h = @($st.history); if ($h.Count -gt 0 -and $h[0].id -eq $pend.runId) { $h[0].replaced = $true }; $st.history = $h
  } else { $st.pending.reason = $res.note }
  Save-State $st; Write-Status $st
}

function Cmd-Run {
  if (Test-Path -LiteralPath $HaltFile) { Log "HALT 파일이 있어 실행하지 않는다: $HaltFile (지우기 전까지 정지)"; return }
  $st = Load-State; $head = Get-HeadInfo
  $depFull = ''; if ($null -ne $st.deployed) { $depFull = [string]$st.deployed.shaFull }
  if ($null -ne $st.pending) { Cmd-Swap; $st = Load-State }   # 이전에 미룬 교체 먼저 시도
  if (-not $Force) {
    if ($Ref -eq $MainRef -and $head.full -eq $depFull) { Log "새 커밋 없음 (HEAD $($head.short) = 배포 빌드)"; return }
    if ($st.lastAttemptSha -eq $head.full) { Log "HEAD $($head.short) 는 이미 시도함(판정 $($st.lastAttemptVerdict)). 다시 하려면 -Force"; return }
  }
  $runId = '{0}_{1}' -f (Get-Date -Format 'yyyyMMdd-HHmm'), $head.short.Substring(0, 7)
  $runDir = Join-Path $RunsDir $runId; New-Item -ItemType Directory -Force -Path $runDir | Out-Null
  $branchName = 'unity/main'; if ($Ref -ne $MainRef) { $branchName = $Ref }
  $run = [ordered]@{ id = $runId; sha = $head.short; shaFull = $head.full; branch = $branchName; subject = $head.subject; startedAt = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'); finishedAt = ''; buildSeconds = 0; smokeSeconds = 0; buildExit = $null; receiptPassed = $null; verdict = 'ABORT'; replaced = $false; replaceNote = ''; changedCount = 0; changed = @(); smokeNote = ''; build = $null; player = $null; m1 = $null; caps = @(); hud = $null; userSave = $null; capsBlack = $null; smoke = $null; crash = $null; buildCrash = $null; restoreFailed = ''; mediaMissing = @(); extraKnown = @{}; captureNote = $null; failReasons = @(); knownTotal = 0; buildWindow = $false }
  $ch = Get-Changed $depFull $head.full; $run.changedCount = $ch.count; $run.changed = $ch.items
  $rules = Load-Rules
  $runStart = Get-Date
  $got = $false
  try {
    Log "=== run $runId  HEAD $($head.short) $($head.subject)"
    if (-not (Acquire-Lock $runId)) { $run.replaceNote = '잠금 대기 초과 - 이번 회차 중단'; return }
    $got = $true
    Write-MemLog
    $userBefore = Get-UserSaveSnapshot
    $libExists = Test-Path -LiteralPath (Join-Path $Cfg.Worktree 'unity\Library')
    if (-not (Wait-Ready $libExists)) { $run.replaceNote = 'Unity 프로세스 대기/커밋 여유 부족으로 중단'; return }

    # 1) 워크트리 -> HEAD
    Log "워크트리 $($Cfg.Worktree) -> $($head.short)"
    & git.exe -C $Cfg.Worktree checkout -q -f --detach $head.full 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw '워크트리 checkout 실패' }
    foreach ($s in 'restore-lobby-media.cjs', 'restore-warrior-story.cjs') {
      $sp = Join-Path $Cfg.Worktree "unity\Tools\$s"
      if (Test-Path -LiteralPath $sp) { & $Cfg.Node $sp --project (Join-Path $Cfg.Worktree 'unity') | Out-Null; Log "$s 종료코드 $LASTEXITCODE"; if ($LASTEXITCODE -ne 0) { $run.restoreFailed = [string]$run.restoreFailed + "$s(exit $LASTEXITCODE) " } } else { Log "$s 없음(이 커밋엔 불필요)" }
    }
    $mediaMissing = @(Test-RequiredMedia (Join-Path $Cfg.Worktree 'unity') $rules)
    if ($mediaMissing.Count -gt 0 -or $run.restoreFailed) {
      $run.mediaMissing = $mediaMissing
      $why = '필수 영상 누락: ' + ($mediaMissing -join ', '); if ($run.restoreFailed) { $why += ' / 복원 스크립트 실패: ' + $run.restoreFailed }
      $run.verdict = 'FAIL'; $run.failReasons = @($why); $run.replaceNote = $why; $run.smokeNote = '빌드 전 단계에서 중단'
      Log $why; return
    }

    # 2) 빌드 -> build_new
    $env:DOTNET_ADD_GLOBAL_TOOLS_TO_PATH = 'false'; $env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'; $env:DOTNET_NOLOGO = '1'; $env:DOTNET_CLI_HOME = $Cfg.DotnetHome
    $proj = Join-Path $Cfg.Worktree 'unity'
    if (-not (Test-Path -LiteralPath (Join-Path $proj 'Library'))) {
      Log 'Library 없음 - pc-unity-rm0 에서 복사'
      & robocopy 'E:\exoduser-wt\pc-unity-rm0\unity\Library' (Join-Path $proj 'Library') /E /XJ /MT:16 /NFL /NDL /NJH /NP | Out-Null
    }
    $stage = Join-Path $Cfg.Out 'build_new'
    for ($ba = 1; $ba -le 2; $ba++) {
    if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
    Write-MemLog
    $sw = [Diagnostics.Stopwatch]::StartNew()
    $bargs = @('-batchmode', '-quit', '-projectPath', $proj, '-buildTarget', 'Win64', '-executeMethod', 'PortVerification.Build', '-output', $stage, '-receipt', (Join-Path $runDir 'build-receipt.json'), '-logFile', (Join-Path $runDir 'build.log'))
    $bp = Start-Process -FilePath $Cfg.UnityExe -ArgumentList $bargs -PassThru
    $bdeadline = (Get-Date).AddMinutes($Cfg.BuildTimeoutMin); $run.buildExit = $null; $buildWindow = $false
    while (-not $bp.WaitForExit(3000)) {
      if (Test-OwnWindow $bp) { $buildWindow = $true; Log 'Unity 에디터가 창을 만들었다(무창 위반) - 강제 종료'; try { $bp.Kill() } catch { }; $run.buildExit = -998; break }
      if ((Get-Date) -gt $bdeadline) { try { $bp.Kill() } catch { }; Log "빌드 시간 초과($($Cfg.BuildTimeoutMin)분), 강제 종료"; $run.buildExit = -999; break }
    }
    if ($null -eq $run.buildExit) { $run.buildExit = $bp.ExitCode }
    $run.buildWindow = $buildWindow
    $run.buildSeconds = [int]$sw.Elapsed.TotalSeconds
    Log ("빌드 종료코드 {0}, {1}초" -f $run.buildExit, $run.buildSeconds)
    if ($run.buildExit -ne 0) { $run.buildCrash = Get-CrashInfo $runStart; Log ('빌드 비정상 종료: 로그 ' + (Join-Path $runDir 'build.log') + ' / Unity 크래시 폴더 ' + $run.buildCrash.editorDir) }
    $rcpt = ReadJson (Join-Path $runDir 'build-receipt.json'); if ($null -ne $rcpt) { $run.receiptPassed = [bool]$rcpt.passed }
    $bj = Judge-Log (Join-Path $runDir 'build.log') 'build' $rules
    $run.build = $bj
    if (Test-CrashRun $run.buildExit (Join-Path $runDir 'build.log')) {
      $run.buildCrash = Get-CrashInfo $runStart
      Copy-Item -LiteralPath (Join-Path $runDir 'build.log') -Destination (Join-Path $runDir "build.crash$ba.log") -Force -ErrorAction SilentlyContinue
      Log ("빌드 크래시 감지(시도 $ba/2): 종료코드 $($run.buildExit), 로그 $(Join-Path $runDir "build.crash$ba.log"), 크래시 폴더 $($run.buildCrash.editorDir)")
      if ($ba -eq 1) { Log '1회 재시도'; continue }
      Set-Halt 'Unity 에디터 빌드 크래시 2회' (Join-Path $runDir 'build.crash2.log') $run.buildCrash.editorDir $runId
      $run.verdict = 'ABORT'; $run.replaceNote = '빌드 크래시 2회 - HALT'; return
    }
    break
    }
    $exeOk = Test-Path -LiteralPath (Join-Path $stage 'EXODUSER-Unity.exe')
    $buildOk = ($run.buildExit -eq 0) -and $exeOk -and ($run.receiptPassed -eq $true)

    # 3) 스모크
    $pj = $null; $m1 = $null; $sm = $null
    if ($SkipSmoke -and $buildOk) { $run.verdict = 'ABORT'; $run.replaceNote = '빌드만(-SkipSmoke) - build_new 보관'; $run.smokeNote = '스모크 생략'; Log 'SkipSmoke: 빌드만 하고 종료'; return }
    if ($buildOk) {
      # 다른 Unity 가 끼어들지 않았는지 다시 확인(우리 빌드 프로세스는 이미 종료)
      $others = @(Get-UnityProcs)
      if ($others.Count -gt 0) { Log ("스모크 전 대기: 다른 Unity {0}개" -f $others.Count); [void](Wait-Ready $true) }
      for ($sa = 1; $sa -le 2; $sa++) {
      $smokeDir = Join-Path $runDir 'smoke'
      if ($sa -gt 1 -and (Test-Path -LiteralPath $smokeDir)) { Remove-Item -LiteralPath $smokeDir -Recurse -Force }
      $sm = Run-Smoke $stage $smokeDir
      $run.smokeSeconds = $sm.seconds; $run.smokeNote = $sm.note
      Log ("스모크: ran={0} exit={1} timedOut={2} windowSeen={3} slowExit={4} {5}" -f $sm.ran, $sm.exit, $sm.timedOut, $sm.windowSeen, $sm.slowExit, $sm.note)
      $run.smoke = $sm
      Write-MemLog
      if ($HudSmoke -and $sm.ran -and -not $sm.windowSeen) {
        $hs = Run-Smoke $stage (Join-Path $runDir 'hud') '--unity-hud-smoke' 'hud-smoke.json'
        $run.hud = $hs
        Log ("hud-smoke: ran={0} exit={1} receipt={2} exitAfterReceipt={3}s timedOut={4} windowSeen={5} {6}" -f $hs.ran, $hs.exit, $hs.receiptWritten, $hs.exitAfterReceiptSec, $hs.timedOut, $hs.windowSeen, $hs.note)
      }
      if ($sm.ran) {
        $pj = Judge-Log (Join-Path $smokeDir 'player.log') 'player' $rules
        $m1 = Judge-M1 (Join-Path $smokeDir 'm1-check.json') $rules
        $run.caps = @(Make-Thumbs $runId (Join-Path $smokeDir 'caps'))
        $run.capsBlack = Measure-Caps (Join-Path $smokeDir 'caps')
        $run.userSave = Compare-UserSave $userBefore (Get-UserSaveSnapshot)
        Log ('USER_SAVE changed=' + $run.userSave.changed + $(if ($run.userSave.changed -gt 0) { ' : ' + ($run.userSave.files -join ' | ') } else { '' }))
        $crashLogs = @($pj.failById.Keys | Where-Object { $_ -eq 'crash' })
        if (($null -ne $sm.exit -and [int]$sm.exit -ne 0) -or $crashLogs.Count -gt 0) { $run.crash = Get-CrashInfo $runStart; Log ('플레이어 크래시 의심: 로그 ' + (Join-Path $smokeDir 'player.log') + ' / 크래시 폴더 ' + $run.crash.playerDir) }
      }
      if ($sm.ran -and (Test-CrashRun $sm.exit (Join-Path $smokeDir 'player.log'))) {
        $run.crash = Get-CrashInfo $runStart
        Copy-Item -LiteralPath (Join-Path $smokeDir 'player.log') -Destination (Join-Path $runDir "player.crash$sa.log") -Force -ErrorAction SilentlyContinue
        Log ("플레이어 크래시 감지(시도 $sa/2): 종료코드 $($sm.exit), 로그 $(Join-Path $runDir "player.crash$sa.log"), 크래시 폴더 $($run.crash.playerDir)")
        if ($sa -eq 1) { Log '1회 재시도'; continue }
        Set-Halt '플레이어 스모크 크래시 2회' (Join-Path $runDir 'player.crash2.log') $run.crash.playerDir $runId
        $run.verdict = 'ABORT'; $run.replaceNote = '스모크 크래시 2회 - HALT'; return
      }
      break
      }
    } else { $run.smokeNote = '빌드 실패로 스모크 없음' }
    $run.player = $pj; $run.m1 = $m1

    # 4) 판정
    $reasons = @()
    if (-not $buildOk) { $reasons += '빌드 실패(종료코드/영수증/exe)' }
    if ($bj.fail -gt 0) { $reasons += "빌드 로그 결함 $($bj.fail)건" }
    if ($run.buildWindow) { $reasons += 'Unity 에디터가 창을 띄움(무창 위반)' }
    if ($buildOk) {
      if ($null -eq $pj) { $reasons += '스모크 미실행' }
      else {
        if ($pj.fail -gt 0) { $reasons += "플레이어 로그 결함 $($pj.fail)건" }
        if (-not $pj.graphicsOk) { $reasons += 'Direct3D 11/12 장치 확인 불가' }
        if ($sm.timedOut) { $reasons += '스모크 시간 초과' }
        if ($sm.windowSeen) { $reasons += '플레이어가 창을 띄움(무창 위반)' }
        if ($null -ne $sm.exit -and [int]$sm.exit -ne 0 -and [int]$sm.exit -ne -1073740771 -and -not $sm.slowExit -and -not $sm.timedOut -and -not $sm.windowSeen) { $reasons += ('플레이어 비정상 종료 exit={0}' -f $sm.exit) }
        if ($null -ne $m1 -and $m1.present -and $m1.deviceType -match 'Null') { $reasons += 'Null 그래픽 장치(m1-check.json)' }
        if ($null -ne $m1 -and $m1.present -and $m1.headless -and $m1.guiRepaints -eq 0) { $run.captureNote = 'batchmode 에서 IMGUI Repaint 이벤트가 오지 않음 - 캡처에는 HUD/UI 가 없음(월드만)' }
        if ($null -eq $m1 -or -not $m1.present) { $reasons += 'm1-check.json 없음' } elseif ($m1.fail -gt 0) { $reasons += "m1 단계 실패 $($m1.fail)건" }
        if ($null -ne $run.userSave -and $run.userSave.changed -gt 0) { $reasons += ('USER_SAVE changed={0} (사용자 실제 세이브/설정이 바뀜)' -f $run.userSave.changed) }
        if ($null -ne $run.capsBlack -and $run.capsBlack.total -gt 0 -and $run.capsBlack.black -gt [math]::Max(3, [math]::Floor($run.capsBlack.total * 0.2))) { $reasons += ('캡처가 검은 화면 {0}/{1}장 - 화면을 확인하지 못함' -f $run.capsBlack.black, $run.capsBlack.total) }
        if ($null -ne $m1 -and $m1.present -and @($run.caps).Count -eq 0) { $reasons += '캡처 0장(이 빌드는 무창 캡처를 지원하지 않거나 저장 실패)' }
        if ($null -ne $run.hud) { if ($run.hud.windowSeen) { $reasons += 'hud-smoke 가 창을 띄움' } elseif ($run.hud.timedOut) { $reasons += 'hud-smoke 시간 초과' } elseif (-not $run.hud.receiptWritten) { $reasons += 'hud-smoke 영수증 없음' } }
      }
    }
    $knownTotal = [int]$bj.known; if ($null -ne $pj) { $knownTotal += [int]$pj.known }
    $extra = @{}
    if ($buildOk -and $null -ne $sm) {
      if ($null -ne $sm.exit -and [int]$sm.exit -eq -1073740771) { $extra['DBT-5'] = 1 }       # 0xC000041D 종료 크래시
      if ($sm.slowExit -or ($null -ne $run.hud -and $run.hud.slowExit)) { $extra['DBT-6'] = 1 }                                               # 영수증 뒤 종료 지연
    }
    foreach ($k in $extra.Keys) { $knownTotal += $extra[$k] }
    $run.extraKnown = $extra
    if ($reasons.Count -gt 0) { $run.verdict = 'FAIL' } elseif ($knownTotal -gt 0) { $run.verdict = 'KNOWN' } else { $run.verdict = 'PASS' }
    Log ("판정 {0} (결함 사유: {1}; 알려진 결함 {2}건)" -f $run.verdict, ($reasons -join ', '), $knownTotal)
    $run.failReasons = $reasons; $run.knownTotal = $knownTotal

    # 5) 교체
    $builtAt = Get-Date -Format 'yyyy-MM-dd HH:mm'
    $loopReceipt = [ordered]@{ sha = $head.short; shaFull = $head.full; branch = $branchName; builtAt = $builtAt; verdict = $run.verdict; failReasons = $reasons; knownTotal = $knownTotal; buildSeconds = $run.buildSeconds; smokeSeconds = $run.smokeSeconds; buildExit = $run.buildExit; receiptPassed = $run.receiptPassed; gfx = $(if ($null -ne $pj) { $pj.gfx } else { @() }); m1 = $(if ($null -ne $m1) { @{ ok = $m1.ok; fail = $m1.fail; neutral = $m1.neutral } } else { $null }); exe = $(Join-Path $Cfg.Out 'build\EXODUSER-Unity.exe'); headless = $(if ($null -ne $m1) { $m1.headless } else { $null }); device = $(if ($null -ne $m1) { $m1.device } else { '' }); captureMode = $(if ($null -ne $m1) { $m1.captureMode } else { '' }); guiRepaints = $(if ($null -ne $m1) { $m1.guiRepaints } else { 0 }); windowSeen = $(if ($null -ne $sm) { $sm.windowSeen } else { $false }); extraKnown = $extra; by = 'devtools-buildloop' }
    $eligible = ($run.verdict -eq 'PASS') -or ($run.verdict -eq 'KNOWN' -and $AllowKnown)
    if ($NoSwap) {
      $run.replaceNote = '브랜치 시험 빌드/-NoSwap - build 교체 안 함'
      WriteJson (Join-Path $runDir 'loop-receipt.json') $loopReceipt
      if (-not $KeepStage -and (Test-Path -LiteralPath $stage)) { Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue }
    } elseif ($eligible -and $buildOk) {
      WriteJson (Join-Path $runDir 'loop-receipt.json') $loopReceipt
      $sr = Swap-Build $st $runDir ([pscustomobject]$loopReceipt)
      $run.replaced = $sr.done; $run.replaceNote = $sr.note
      if ($sr.done) { $st.deployed = [pscustomobject]@{ sha = $head.short; shaFull = $head.full; at = $builtAt; runId = $runId; verdict = $run.verdict }; $st.pending = $null }
      else { $st.pending = [pscustomobject]@{ runId = $runId; sha = $head.short; shaFull = $head.full; verdict = $run.verdict; reason = $sr.note } }
    } elseif ($run.verdict -eq 'KNOWN') {
      $run.replaceNote = '알려진 결함이 있어 교체하지 않음(통과 아님). -AllowKnown 으로만 교체'
      $st.pending = [pscustomobject]@{ runId = $runId; sha = $head.short; shaFull = $head.full; verdict = 'KNOWN'; reason = 'build_new 에 보관됨, 알려진 결함 때문에 교체 안 함(-AllowKnown 필요)' }
      WriteJson (Join-Path $runDir 'loop-receipt.json') $loopReceipt
    } else {
      $run.replaceNote = '실패 - 기존 build 유지'
      WriteJson (Join-Path $runDir 'loop-receipt.json') $loopReceipt
      if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue }
    }
    Copy-Item -LiteralPath (Join-Path $runDir 'loop-receipt.json') -Destination (Join-Path $Cfg.Out 'loop-receipt.json') -Force
    Log ("build 교체: {0} - {1}" -f $run.replaced, $run.replaceNote)
  } catch {
    $run.verdict = 'ABORT'; $run.replaceNote = '스크립트 오류: ' + $_.Exception.Message
    Log ('오류: ' + $_.Exception.Message + ' @ ' + $_.ScriptStackTrace)
  } finally {
    # 남은 자식 프로세스 확인(우리가 띄운 것만)
    $run.finishedAt = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    if ($got) { Write-MemLog; Release-Lock }
    if ($true) {
      WriteJson (Join-Path $runDir 'run.json') $run 10
      $m1ok = 0; $m1fail = 0; if ($null -ne $run.m1) { $m1ok = $run.m1.ok; $m1fail = $run.m1.fail }
      $fcount = 0; $kcount = 0; if ($null -ne $run.build) { $fcount += [int]$run.build.fail; $kcount += [int]$run.build.known }; if ($null -ne $run.player) { $fcount += [int]$run.player.fail; $kcount += [int]$run.player.known }
      $sum = [pscustomobject]@{ id = $runId; sha = $head.short; startedAt = $run.startedAt; verdict = $run.verdict; fail = $fcount; known = $kcount; m1ok = $m1ok; m1fail = $m1fail; buildMin = [math]::Round($run.buildSeconds / 60, 1); smokeMin = [math]::Round($run.smokeSeconds / 60, 1); replaced = $run.replaced }
      if ($run.verdict -ne 'ABORT' -and -not $NoSwap) { $st.lastAttemptSha = $head.full; $st.lastAttemptVerdict = $run.verdict }
      $st.history = @(@($sum) + @($st.history) | Select-Object -First 30)
      Save-State $st; Prune-Runs; Write-Status $st
    }
  }
  Log ("=== 끝 {0}: {1}" -f $runId, $run.verdict)
}

if ($JudgeOnly -and $Scope -eq 'caps') { Measure-Caps $JudgeOnly | ConvertTo-Json -Depth 4; return }
if ($JudgeOnly) {
  $rules = Load-Rules; $j = Judge-Log $JudgeOnly $Scope $rules
  $j | ConvertTo-Json -Depth 6
  return
}
switch ($Command) {
  'check'   { Cmd-Check }
  'run'     { Cmd-Run }
  'status'  { Cmd-Status }
  'swap'    { Cmd-Swap }
  'install' { Cmd-Install }
}

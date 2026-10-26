# Steam 클라이언트 충돌·실행 불가 런북 (개발 PC)

> 대상: 개발 PC(Windows)에서 **Steam 클라이언트 자체**가 안 켜지거나, 깜빡 뜨고 꺼지거나, 프로세스만 있고 창이 안 뜨는 문제.
> 게임(EXODUSER) 실행 문제는 §6에 따로 정리했다. 둘을 먼저 구분한다.
> 최초 작성 2026-10-26. 같은 증상이 반복되므로(2026-10 이전에도 발생, 그때도 재부팅·재설치로 일시 해결) **재발할 때마다 §5 기록표에 한 줄씩 추가**하고 §4 진단 결과를 남긴다.

## 1. 개발 PC Steam 환경 (2026-10-26 확인)

| 항목 | 값 | 비고 |
|---|---|---|
| Steam 설치 경로 | `E:\steam` | 기본 경로 `C:\Program Files (x86)\Steam` 아님. 레지스트리 `HKCU:\Software\Valve\Steam` → `SteamExe`로 확인 |
| E: 여유 공간 | 1809GB | 용량 부족은 원인 아님 |
| 웹 캐시 경로 | `%LOCALAPPDATA%\Steam\htmlcache` | 사용자 프로필 경로에 한글 사용자명 포함 (로그에서 깨져 보임) |
| Windows | 10.0.26300 | 일반 배포 빌드가 아닌 **Insider(미리보기) 빌드로 추정** — §4로 채널 확인 필요 |
| Steam 클라이언트 | buildid 1792618285, updater built Oct 21 2026 | |
| 상주 프로그램 | Razer, AMD(2종), Xbox, OneNote 등 트레이 | 오버레이/주입 후보 |
| 업로드 도구 | `steamcmd` (`G:\exoduser-steam`) | 클라이언트와 별개. 클라이언트 실행을 직접 막지 않음 |

## 2. 2026-10-26 사고 기록

### 2.1 증상 흐름

| 시각(KST) | 관찰 |
|---|---|
| 09:19~09:21 | Dota 2 실행 후 종료 (`console_log.txt` 마지막 정상 기록 09:21:53) |
| 10:03:38 | `cef_log.txt`: `GPU process exited unexpectedly: exit_code=-1` — Steam 화면 렌더러(steamwebhelper)의 GPU 프로세스 충돌 |
| 이후 | Steam 실행 시 깜빡 뜨고 꺼짐 → `package` 폴더 교체 후 클라이언트 재다운로드는 성공 |
| 09:59 / 10:04 | `bootstrap_log.txt`: `Nothing to do`, `Verification complete` — **업데이트·파일 검증 정상** |
| 10:04:32 | steamwebhelper 정상 기동(`Starting message loop`), `steamid=0`(로그인 전) |
| 10:04 이후 | `steam`·`steamservice`·`steamwebhelper` ×5 프로세스 존재, **창·트레이 아이콘 없음**. `console_log.txt`에 09:21 이후 새 기록 없음 → 클라이언트 본체가 UI 단계로 진행하지 못함 |
| 10:06 | htmlcache·appcache 이름 변경 후 재실행. 새 webhelper(10:06:11) 로그에 치명 오류 없음 |

### 2.2 로그에서 무시해도 되는 줄

| 메시지 | 판정 |
|---|---|
| `Missing value path for key Software\Google\Chrome\Extensions\...` | 무해 (CEF 공통) |
| `Desktop Identity Consistency cannot be enabled...` | 무해 |
| `EnterpriseLogoUrl fetch failed` | 무해 |
| `This is Chrome version ... (not a warning)` | 무해 |
| `Network service crashed, restarting service` (10:06:07) | 프로세스를 강제 종료한 시점의 부수 기록 |

### 2.3 의미 있는 줄

| 메시지 | 의미 |
|---|---|
| `GPU process exited unexpectedly` / `GPU process has crashed N time(s)` | Steam UI의 GPU 경로 충돌 — 그래픽 드라이버·오버레이·Insider 빌드 의심 |
| 프로세스는 있는데 `console_log.txt`가 멈춤 | 본체가 UI/로그인 단계 전에서 정지 |

## 3. 복구 사다리 (위에서부터 하나씩, 관리자 PowerShell)

> PowerShell에서는 명령 구분자 `&` 대신 `;`을 쓴다. 관리자 PowerShell에서 Steam을 직접 실행하면 관리자 권한으로 떠서 꼬일 수 있으니 `explorer.exe`를 거쳐 일반 권한으로 실행한다.

| 단계 | 명령 | 효과 / 되돌리기 |
|---|---|---|
| 0. 상태 확인 | `Get-Process steam*,steamwebhelper -EA 0 \| Select Name,Id` | 프로세스가 남아 있는지 |
| 1. 프로세스 정리 후 재실행 | `Get-Process steam*,steamwebhelper -EA 0 \| Stop-Process -Force; explorer.exe E:\steam\steam.exe` | 반쯤 죽은 steamwebhelper 정리 |
| 2. 창 불러오기 | `Start-Process "steam://open/main"` | 트레이에만 있을 때 |
| 3. 클라이언트 패키지 재다운로드 | `Get-Process steam*,steamwebhelper -EA 0 \| Stop-Process -Force; Rename-Item E:\steam\package "package_old_$(Get-Date -f yyyyMMddHHmm)"; Start-Process E:\steam\steam.exe -ArgumentList "-clearbeta"` | 업데이트 손상 시. 베타도 해제. 폴더는 이름만 바뀜 |
| 4. 캐시 초기화 | `Get-Process steam*,steamwebhelper -EA 0 \| Stop-Process -Force; $t=Get-Date -f yyyyMMddHHmm; Rename-Item "$env:LOCALAPPDATA\Steam\htmlcache" "htmlcache_old_$t"; Rename-Item E:\steam\appcache "appcache_old_$t"; explorer.exe E:\steam\steam.exe` | 프로세스는 있는데 창이 안 뜰 때 |
| 5. GPU 끄고 실행 | `Get-Process steam*,steamwebhelper -EA 0 \| Stop-Process -Force; cmd /c start "" "E:\steam\steam.exe" -cef-disable-gpu` | 이걸로 뜨면 원인은 GPU/드라이버/오버레이 쪽 확정 |
| 6. 재부팅 | — | 드라이버·서비스 상태 정리 |
| 7. 클라이언트 재설치(게임 유지, Valve 공식 방법) | `Get-Process steam*,steamwebhelper -EA 0 \| Stop-Process -Force; $b="E:\steam_backup_$(Get-Date -f yyyyMMddHHmm)"; mkdir $b; Get-ChildItem E:\steam -Force \| ? { $_.Name -notin 'steamapps','userdata','steam.exe' } \| Move-Item -Destination $b; explorer.exe E:\steam\steam.exe` | 재로그인·Steam Guard 필요. 다른 드라이브 라이브러리는 설정→저장 공간에서 재등록. 정상 확인 후 백업 폴더 삭제 |

**복구 전에 반드시 §4 진단을 먼저 실행해 결과를 남긴다.** 복구부터 하면 증거(로그·이벤트)가 덮여서 원인을 못 찾는다 — 지금까지 재발해 온 이유다.

## 4. 근본 원인 진단 (읽기 전용, 증상 발생 즉시)

바탕화면 `steam_rootcause.txt`로 저장된다. 아무것도 변경하지 않는다.

```powershell
$o="$env:USERPROFILE\Desktop\steam_rootcause.txt"; & { "=== OS"; (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' | Select ProductName,DisplayVersion,CurrentBuild,UBR | Out-String); (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\WindowsSelfHost\Applicability' -EA 0 | Select BranchName,Ring | Out-String); "=== STEAM CRASHES (90d)"; Get-WinEvent -FilterHashtable @{LogName='Application';Id=1000,1002;StartTime=(Get-Date).AddDays(-90)} -EA 0 | ? { $_.Message -match 'steam' } | % { "{0:yyyy-MM-dd HH:mm} [{1}] {2}" -f $_.TimeCreated,$_.Id,(($_.Message -split "`n")[0..4] -join ' | ') }; "=== WINDOWS UPDATES (90d)"; Get-WinEvent -FilterHashtable @{LogName='System';ProviderName='Microsoft-Windows-WindowsUpdateClient';Id=19;StartTime=(Get-Date).AddDays(-90)} -EA 0 | % { "{0:yyyy-MM-dd HH:mm} {1}" -f $_.TimeCreated,($_.Properties[0].Value) }; "=== GPU DRIVER"; Get-CimInstance Win32_VideoController | Select Name,DriverVersion,DriverDate | Out-String; "=== INJECTED DLLs in steamwebhelper"; Get-Process steamwebhelper -EA 0 | % { $_.Modules } | ? { $_.FileName -notmatch '\\steam\\|\\Windows\\' } | Select -Unique FileName | Out-String; "=== LOG TAILS"; Get-Content E:\steam\logs\bootstrap_log.txt -Tail 15; Get-Content E:\steam\logs\console_log.txt -Tail 15; Get-Content E:\steam\logs\cef_log.txt -Tail 15 } *>&1 | Out-File $o -Encoding utf8; notepad $o
```

### 4.1 판정표

| 진단 결과 | 원인 판정 | 재발 방지 |
|---|---|---|
| Steam 충돌 날짜가 Windows 업데이트 설치 직후에 몰림 + Insider 채널 | Windows Insider 빌드 | 설정 → Windows 참가자 프로그램 → 다음 정식 릴리스에서 탈퇴(또는 Beta 채널로 이동). 개발·배포 PC는 정식 빌드 유지 |
| 충돌 이벤트의 "오류 모듈"이 `amdxx64.dll`·`atidxx64.dll`·`aticfx64.dll` 등 | AMD 그래픽 드라이버 | 드라이버를 마지막 정상 버전으로 되돌리거나 안정(Recommended) 드라이버로 고정. Steam 설정 → 인터페이스 → "웹 보기에서 GPU 가속 렌더링" 끄기 |
| 주입 DLL 목록에 Razer(`Rz*`)·AMD 오버레이·녹화 도구 DLL | 오버레이 주입 | 해당 앱의 오버레이/인게임 기능 끄기, 또는 Steam 폴더를 예외로 등록 |
| `GPU process exited unexpectedly`만 반복, 위 항목 없음 | Steam UI GPU 경로 일반 | Steam GPU 가속 끄기(위와 동일) |
| bootstrap 로그에 `fail`/`error`/`corrupt` | 클라이언트 업데이트 중단 | 업데이트 중 PC 종료·절전 금지, 클라이언트 베타 "참여 안 함" |

## 5. 재발 기록표

| 날짜 | 증상 | 진단(§4) 결과 | 해결한 단계(§3) | 비고 |
|---|---|---|---|---|
| 2026-10 이전 | 깜빡 뜨고 꺼짐 | 미실시 | 재부팅/재설치 | 사용자 증언 |
| 2026-10-26 | 깜빡 → 프로세스만 있고 창·트레이 없음 | 미실시(진단 명령 배포) | 3·4 진행, 5~7 대기 | GPU 프로세스 충돌 기록. Dota 2 종료 직후 발생 |

## 6. 게임(EXODUSER) 자체가 안 뜰 때 — Steam 클라이언트 문제와 구분

| 항목 | 내용 |
|---|---|
| 실행 파일 | `EXODUSER.exe` (빌드 시 `nw.exe`를 복사 — `build-nwjs.mjs`). 프로세스 확인은 `nw.exe`가 아니라 `EXODUSER.exe`로 |
| 단일 인스턴스 | NW.js는 기본 단일 인스턴스 — 숨은 `EXODUSER.exe`가 남아 있으면 새 실행이 즉시 종료된다. `tasklist \| findstr /I "EXODUSER nw node"` → `taskkill /F /T /IM EXODUSER.exe` |
| 내부 서버 | `node-main.js`가 `127.0.0.1:3350`(정식) / 3351(데모)에 정적 서버를 띄운다. `netstat -ano \| findstr :3350`으로 점유 확인. `listen`에 `error` 핸들러가 없어 포트 점유 시 조용히 실패할 수 있음(개선 후보) |
| 서버 로그 | 설치 폴더 `oauth-debug.log` — `HTTP server listening on port 3350`이 있으면 서버는 정상 기동 |
| 웹 콘텐츠 점검 | 2026-10-26 클라우드에서 현재 코드 로비 정상 진입 확인(FDG 로고 → 타이틀). 부수 발견: 웹에서 Supabase CDN 실패로 오프라인 진입 시 `_slotScrollIdx` TDZ 오류(index.html) — 정식 NW 경로에서는 발생 안 함 |

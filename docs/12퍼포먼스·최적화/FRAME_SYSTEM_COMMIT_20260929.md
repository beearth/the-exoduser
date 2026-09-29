# Windows 커밋 고갈·페이지 파일 관리 — 2026-09-29

사용자 지시: 프레임 최적화 계속, 이후 가상 메모리를 직접 관리. 최신 게임코드를 임의로 줄이기 전에 Windows 자원 고갈 기록을 확인했다. **초기 실행에서는 관리자 프로세스 시작 실패로 미적용이었다. 09-29 08:56KST 재조회에서는 PagingFiles32768/65534MiB와 실제CommitLimit95.761414GiB를 확인했다.** 아래 초기 실행·8/16GiB표는 당시 이력이며 현행값과 구분한다.

## 최신 재조회 — Edge에서도 터미널 깜빡임·간헐 급락

| id | 현재 관측 / 한계 |
|---|---|
| PAGEFILE | c:\pagefile.sys 32768 65534. 최소32GiB·최대63.998047GiB. 준비했던65536MiB와실제65534MiB를구분. 이번진단registry변경0 |
| LIVE | 09-28T23:56:56.743~23:59:23.091UTC:commit34.879601~40.009521GiB/limit95.761414GiB. 현재커밋고갈아님 |
| BOOT / EVENT | uptime5013.437초를23:56:51.808UTC에조회,부팅약22:33:18UTC. 부팅이후2004결과0. 최근12시간4101단독조회결과0. 과거고갈/드라이버관련충돌과현재증상을구분 |
| TERMINAL | 150.518초프로세스관측에서setup8개/conhost18개신규생성. VS Code→Codex→setup→conhost경로·같은시각정상완료로그확인. 화면팝업·심한전투급락과인과관계미확정 |
| EDGE | 설정창일시정지45.003초rAF표본,최대41.7ms/34ms초과15개/포커스변화0. 실제전투drawFPS나증상해결검증으로대체하지않음 |
| USER RELOAD | 이후사용자새로고침으로회복보고. 09:04KST실제전투12초게임FPS237~239/rAF34ms초과0. JS heap213126951→81336897B회수관측. 느린상태와동일배치비교·장시간누수/급락원인검증은아님 |
| 상세 | [현재OS·콘솔부모·Edge진단](EDGE_TERMINAL_FRAME_DIAG_20260929.md). 기존미적용보고를현행상태로오인하지않음. 맵/환경수정완료아님 |

## 초기 조회 설정 / 당시 준비한 변경 이력

| id / 적용 위치 | 디스크·OS 조회 또는 준비 계약 |
|---|---|
| BEFORE / HKLM Memory Management PagingFiles | REG_MULTI_SZ: c:\pagefile.sys 8192 16384. C드라이브 최소8192MiB(8GiB)·최대16384MiB(16GiB). ExistingPageFiles는 C 하나, 임시 페이지 파일 표시 없음. CrashDumpEnabled=3 유지 |
| CAPACITY | C AvailableFreeSpace275705167872B=256.770447GiB. 현재 시스템 Commit Limit85643165696B=79.761414GiB. 페이지 파일16GiB의 상한이 제한 요소다 |
| TARGET / 미적용 | c:\pagefile.sys 32768 65536, 최소32GiB·최대64GiB. 이 PC의 반복된 약80GiB peak와 C 여유에 근거한 설정. 모든 PC의 권장 상수가 아님. 최소치 적용 후 단순 RAM+pagefile 기준 한도는 약95.76GiB, 최대 확장 시 약127.76GiB 예상. 실제 재부팅 후 카운터로 확인해야 함 |
| APPLY / 안전 조건 | 관리자 토큰·원래 PagingFiles 한 항목과8/16GiB값 일치·C여유80GiB 이상 확인→원래 값 백업→PagingFiles만32/64GiB로변경→읽기 검증. 다른 registry·드라이브·세이브·프로세스·CrashDump 설정 변경0. 자동 재부팅0 |
| EXEC STATUS | 관리 명령 실행 승인 후 exec provider가 WindowsApps pwsh 시작 전 OS -1073283067/317로 실패. 승인된 같은 조정의 시스템 PowerShell 대체 실행과 기본 reg.exe 관리자 실행도 Start-Process RunAs 단계에서0xc0000142 실패. 자동 승인 거절과 구분. 값 재조회8/16GiB 그대로, result.json 없음 |
| MANUAL APPLY | tmp/pagefile-management-20260929/Apply-Pagefile-32-64GB.reg는 PagingFiles 하나만 담은 UTF-16 REG_MULTI_SZ 적용 파일. 복원용Restore-Pagefile-8-16GB.reg와before.json·registry-backup.json 보존. 생성 파일의hex(7)을 역디코드해 각각32/64·8/16 값 검증. 사용자가 Windows에서 열고 관리자 확인·병합을 완료해야 하며 아직 병합됐다고 주장하지 않음 |
| RESTART | 설정 적용과 실제 커밋 한도 확대를 구분. 사용자 작업 저장 후 재부팅 필요. 이 세션은 재부팅을 실행하지 않음. 재부팅 후PagingFiles와Commit Limit·2004 재발을 재조회하는 단계가 남음 |

## 직접 확인한 고갈 기록

Get-WinEvent의System/Microsoft-Windows-Resource-Exhaustion-Detector/2004에서 최근2일 중최대20개를 조회했다. 출력20개는 모두2004이며 기간 전체 이벤트 개수로 확대하지 않는다. 원본XML과 추출값은 tmp/frame-continuation-20260929/system-resource-events.json·resource-events-summary.json이다. 모든 시간은 명시적으로UTC이며 KST는+9시간이다.

| UTC / KST | Commit / Limit | 남은 commit | 당시 physical free | 상위 프로세스 / 판단 |
|---|---:|---:|---:|---|
| 09-28 20:22:25.934 / 09-29 05:22:25.934 | 85561282560 /85643165696B | 약78.09MiB | 약30.15GiB | Chrome29504 commit12987342848B. 기존게임contextloss20:22:31.070Z 약5.14초전. 같은 시각대 고갈은 확인했으나 단일 원인 인과관계는 미확정 |
| 09-28 20:43:04.045 /09-29 05:43:04.045 | 79.750927 /79.761414GiB(99.9869%) |10.738281MiB |33.924553GiB | Chrome16812 commit8.184803GiB·EXODUSER6900 3.968704GiB·EXODUSER66360 4096315392B(약3.815GiB). 프로세스 합계 전체나 탭 귀속은 아님 |
| 09-28 21:31:51.409 /09-29 06:31:51.409 |79.649582 /79.761414GiB(99.8598%) |114.515625MiB |33.929214GiB | Chrome16812 commit16.584393GiB. 다른맵QA의GPU loss21:31:52.474Z 약1.06초전. 생성된Chrome42872 시각21:31:52.3108721Z도원본이벤트에 존재하나 역할=GPU라고 강제 확정하지 않음 |
| 09-28 21:53:35.815 /09-29 06:53:35.815 |79.685463 /79.761414GiB(99.9048%) |77.773438MiB |31.061020GiB | Chrome42872 commit16.325489GiB. 이번 QA 준비 중이므로 독립된 일반게임 표본으로 간주하지 않음. 부정확한 확대율·초기계측 표본 폐기 |

물리 RAM이 남아 있다는 사실만으로 커밋 고갈을 배제했던 과거 단일 카운터 판단을 보완한다. 여기서는 실제2004 사건의charge/limit를 함께 확인했다. 5074초광폭·Chrome 전체탭·맵시스템 중 어느 자원이 증가 원인인지 또는88ms한번의 지연을 직접 유발했는지는 여전히 미확정. 메모리 사용량 누적 분석은 한도 확대와 별개로 남는다.

| 추가 근거 | 실제 관측·한계 |
|---|---|
| LIVE_DURING_TIMEOUT | Committed81087610880B=75.518723GiB /Limit79.761414GiB(94.6808%);Available41083625472B=38.262108GiB |
| LIVE_END | Committed75386982400B=70.209599GiB /같은Limit79.761414GiB(88.0245%);Available42649931776B. 조회 시점별값이며 감소를 우리설정 적용의효과로 해석하지 않음 |
| APP_CRASH | Application1000: 2026-09-28T12:26:52.5796501Z(21:26:52KST),설치Steam EXODUSER.exe/exception e0000008/KERNELBASE.dll. 약1.18초전System2004. Chromium의OOM exception과 일치하는 근거이며 별도 과거실행: 현재VS Code종료와 동일사건이라고 주장하지 않음 |
| EDITOR | VS Code main.log:09-27 17:43:38 renderercrashed -1073741819(0xC0000005);09-28 21:42:09~21:43:16 unresponsive→recovered. 09-29 05:43:03 renderer longtask194ms. 로그시간은로컬. 과거충돌과현재게임원인의관계·확장 원인·RAM corruption미확정 |
| PID_BOUNDARY | Win32_Process CIM 조회는접근거부. Get-Process로Chrome42872/EXODUSER6900 등의이름·private를대조했지만 명령줄type/탭 귀속미확정. EXODUSERprivate4261363712B를그프로세스의현재renderer메모리로단정하지 않음 |
| GPU_COUNTERS | GPU Adapter DedicatedUsage8711950336B 약8.1136GiB. Chrome42872 Dedicated5054578688B,Shared383037440B. DWM프로세스Dedicated16223477760B처럼어댑터합보다큰값존재. 공유자원중복계상·프로세스counter한계가있으므로합산으로VRAM포화/누수를판정하지 않음 |

## QA / 소스 상태

| 항목 | 결과 |
|---|---|
| USER_RESOLUTION | 격리127.0.0.6 QA에서viewport/C5074×1318/DPR1/nativefocus=true/hidden=false확인. 동일OS fullscreen·Steam환경인증은아님 |
| DISCARDED | 처음 localhost의기존25%브라우저확대율에서viewport20296×5272/DPR.25·canvas12176×3162 확인후원복/격리주소사용. QA프로브의_renderRes=1이잘못된타입으로2×2캔버스를만들어해당측정폐기, null로정정. 다음설치는boot완료전이라무효·CDP/브라우저연결timeout. 이번새FPS값없음 |
| QA_GUARD | tmp/frame-continuation-20260929/probe.js는설치시G.on/boot완료/P/map/nativefocus/viewport/DPR검사. 측정시backing·CSS5074×1318/high100검사 및blur/hidden/resize중단. loop/rAF gap/longtask/GL slowcall기록은QA전용,게임원본삽입0. guard추가본브라우저재검증은연결불능으로미완료 |
| RECURRENCE | 현공유작업트리11파일77PASS:부트준비·가려진바닥·자원로딩/Three공유·텍스트/HUD·렌더설정·GPUwarm·스트리밍. game.html/easy각6실행script AcornPASS. 이결과가장시간전투·자연소실복원·새FPS를입증하지 않음 |
| SOURCE | 본편SHA25626ff1e5cf41eb3379efa4341bcb588a7a79f8b9d142e68d92279bd64f0a7d702/easyc0069847bc963f2e2e226f586d2d98100e67cff444716765634f8858804421c2. concurrentThree·맵·VFX변경보존. 이번production게임코드변경0 |
| CLEANUP | QA연결자체가응답하지않아명시적탭close/최종viewportreset미확인. unmarked소유QA탭은브라우저세션자동정리대상. 사용자Chrome/VSCode/EXODUSER강제종료0·예약작업추가0·OS재부팅0 |
| GIT | 시작170/중간176Changes. 타작업의실제에셋을숨기거나삭제하지않음. scopeddocs와로컬관리자료저장,Gitcommit·push·배포미완료. .git직접쓰기우회0 |

## MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE / MASTER / OUTER / LARGE / MEDIUM / GROUND / LANDMARK | CH1-1현행83아트·geometry·기존충돌유지,제작변경0 |
| PLAYABLE / CAMERA | 기존시작준비·underlay변경을보존. 이번전투FPS실행은무효로최종카메라/전투품질승인하지 않음 |
| TECH | OS2004고갈이력·pagefile하드캡확인. 자동회귀77PASS,inline각6PASS. 장시간전투·새영역스트리밍·Steam·GPU흰화면회복미완료 |
| FILES / GIT | game원본변경0·performance문서와QA/관리임시자료만. 커밋/푸시/배포미완료 |
| VISUAL VERDICT / NEXT PASS | RETOUCH. 실제관리자설정적용→작업저장후재부팅→CommitLimit검증·2004재발관찰→네이티브5074전투프로파일. 자원증가원인추적계속 |

## 1차 자료

- [Windows 페이지 파일·commit 설명](https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/introduction-to-the-page-file): RAM+pagefile의commitlimit와90%의system-managed확장기준. 이PC는custom16GiB상한.
- [Win32_PageFileSetting](https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-pagefilesetting): 부팅에사용하는설정과MiB단위. 적용준비와활성용량을구분.
- [Chromium 개발자의OOM분석](https://groups.google.com/a/chromium.org/g/memory-dev/c/mPeec9KEc74): 0xe0000008·commitlimit근처사건을OOM근거로분류,모든unexpectedfailure를OOM이라단정하지 않음.
- [Microsoft GPU 계상](https://devblogs.microsoft.com/directx/gpus-in-the-task-manager/) 및 [process counter 오보고사례](https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/gpu-process-memory-counters-report-wrong-value): 프로세스합산과어댑터합계구분. 후자는Windows10문서로서이PC의Windows11에서그버그가재현됐다는주장아님.

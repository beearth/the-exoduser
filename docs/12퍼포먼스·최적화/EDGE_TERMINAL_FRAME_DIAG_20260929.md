# Edge 프레임 급락·터미널 반복 생성 진단 — 2026-09-29

사용자 관측: Edge에서도 터미널이 깜빡이는 동안 갑자기 프레임이 떨어지며, 같은 환경에서 문제가 없는 때도 있다. Chrome만의 문제라는 가설을 확정하지 않는다. **Codex의 반복 콘솔 생성 경로는 현재 프로세스와 로그에서 확인했다. 화면의 실제 깜빡임 및 심한 전투 프레임 급락과의 인과관계는 아직 미확정이며, 해결 완료가 아니다.**

## 현재 OS 상태

| id / 적용 위치 | 실제 조회 / 판단 |
|---|---|
| PAGEFILE / HKLM Memory Management | `PagingFiles = c:\pagefile.sys 32768 65534`, 최소32768MiB(32GiB), 최대65534MiB(63.998047GiB). 기존 준비안65536MiB와 실제값65534MiB를 구분. 활성 파일은 C 하나. 이번 진단에서 registry 변경0 |
| BOOT / 2026-09-28T23:56:51.808Z | uptime5013.437초. 현재 부팅은 약22:33:18UTC / 09-29 07:33:18KST. 이전 자동 적용 실패 이후 상태가 달라졌음을 조회로 확인했으며 누가 적용·재부팅했는지는 추정하지 않음 |
| LIVE / 23:56:56.743~23:59:23.091UTC | 시스템commit34.879601~40.009521GiB / limit95.761414GiB. physical free43.967873~46.087261GiB. 이 관측 구간은 커밋 한도 고갈 상태가 아님 |
| RESOURCE2004 | 부팅 이후System2004 조회: exit0·결과0. 최근12시간 최대20개의 과거 기록 중 최신은22:07:37.594UTC / 07:07:37.594KST로 부팅 전. 이전 약79.76GiB 고갈은 실제 과거 사건으로 보존 |
| DISPLAY4101 | 최근12시간System4101 단독조회: exit0·결과0. 로그에 없음이 모든 GPU stall·reset 부재를 증명하지는 않음 |
| APPLICATION ERROR | 부팅 전22:25:00.684UTC `clinfo.exe / amd_comgr_3.dll / c0000409`,20:30:41.774UTC `SnippingTool.exe / amdxx64.dll / c0000005`,12:26:52.580UTC `EXODUSER.exe / KERNELBASE.dll / e0000008`. 이번 Edge 증상과 동일 사건이라고 단정하지 않음 |
| CODEX SERVICE | `CodexSandboxService.OpenAI.Codex`의1000은 service running,1001은 asked to stop 메시지. EventID만으로 Application Error 충돌로 오분류하지 않음 |

## 콘솔 생성 추적

유한150초 관측, 실제elapsed150.518초. 약150ms마다 프로세스 목록을 요청하고 시스템 카운터를 약1초마다 기록했다. 호출 소요시간 때문에 실제 관측 간격은 늘어날 수 있으며 짧게 생성·종료된 프로세스가 누락될 수 있다. 전체명령줄·환경변수·인증정보는 기록하지 않고 PID/PPID/이름/시각/역할/로컬 스크립트명만 저장했다.

| id | 관측 / 한계 |
|---|---|
| COUNTS | 시작표본474프로세스, 생성·종료91이벤트. 신규 `codex-windows-sandbox-setup.exe`8개, `conhost.exe`18개, `pwsh.exe`1개. 콘솔 호스트 생성 개수는 화면에 보이는 팝업 개수가 아님 |
| CHAIN | setup8개 중7개 PPID31780. `Code.exe → pwsh.exe → node.exe → codex.exe31504 → codex.exe31780 → setup → conhost.exe` 경로 확인. setup를 직접 부모로 갖는 conhost7개 확인 |
| EXAMPLE / UTC | setup18632:23:57:14.150540,conhost29392:23:57:14.154680. setup29652:23:58:10.288276,conhost38636:23:58:10.292206. setup7004:23:59:11.853225,conhost39980:23:59:11.858870 |
| LOG | `.codex/.sandbox/sandbox.2026-09-28.log`의 같은 시각 setup refresh·completed 확인. VS Code 경로의daemon release0.157.1과ChatGPT 경로의command runner0.158.0-alpha.2.1이 로그에 존재. 버전 차이 자체를 원인이라고 단정하지 않음 |
| SETUP RESULT | 해당 로그의setup refresh processed/errors=[]·completed는 정상 완료 표식. 반복 생성은 확인했으나 실패 후 재시도 루프라고 주장하지 않음 |
| SELF / OTHER WORK | 관측 중 이 진단 및 다른 세션의CLI·Git·브라우저 도구 실행도 존재. 모든 생성 이벤트가 독립적인 백그라운드 오류는 아님. ChatGPT의Codex14152가 만든pwsh39596/conhost39864도 별도 경로로 기록 |
| OBSERVER COST | 전체 프로세스 목록을 자주 읽는 Python 관측기4212 자체가 CPU를 사용했다. 약1초 차분에서one-core147.5% 값도 관측됐으며 표본 시각·수집 소요시간의 영향을 포함. 이 값으로 전체 CPU 포화나 다른 프로그램의 병목을 확정하지 않음. 유한 관측기는 종료됨 |
| SCHEDULED TASK | `ExoduserAutoCleanup50` 단독조회exit1, stderr는 지정된 경로를 찾을 수 없음. 삭제 상태와 일치. 전체예약목록 조회exit1로 전수검사 미완료. 재등록0 |

## Edge 기록과 판정 범위

| 항목 | 관측 |
|---|---|
| 기존 사용자 탭 | localhost:3333/game.html, Edge. viewport2537×1270,DPR1,WebGL2. 사용자가 열어 둔 설정창·`G.on=true / G.paused=true / OPT.fpsCap=0` 상태 유지. 새로고침·입력·설정 변경·세이브 조작0 |
| RAF TRACE | 23:59:04.362~23:59:49.365UTC,45.003초,간격10180개. 최대41.7ms,34ms초과15개. 대부분매초 .337~.339초 부근의37ms대. rAF 빈도는 실제게임draw FPS와 다름 |
| FOCUS | 관측 전체hidden=false/focus=true/paused=true,focus·blur·visibility·resize 이벤트0. 이 표본에서는포커스 탈취 미관측 |
| CORRELATION | 일부콘솔 생성과프레임공백 시각이 가깝지만매초반복 공백은콘솔 생성과1:1대응하지 않음. 원인을콘솔로 확정하지 않음. 시스템관측 종료후에도짧은공백 존재 |
| GAME TIMER | 게임에는1초간격 `_updateDiagUI`가존재. 설정패널 표시 중이라는 조건과주기는추가프로파일 후보이나이번관측으로함수비용·인과관계가입증된것은아님 |
| LIMIT | 일시정지 설정화면 표본이며심한급락·실제전투·장시간재발을포착하지못함. 사용자관측을부정하거나엣지정상/환경수정완료로보고하지않음 |
| CLEANUP | 임시rAF 취소·리스너제거·`__envFrameDiag0929`삭제 후undefined 확인. 사용자탭은그대로열려있음. 프로세스종료·재부팅·예약작업추가·보안정책변경0 |

## 사용자 새로고침 후 회복 — 09:04KST 재검수

사용자 보고: 새로고침하자프레임이돌아왔다. 현재페이지의performance.timeOrigin은09-29T00:01:24.113UTC. 새로고침은사용자가수행했으며진단에서추가새로고침하지않았다. 페이지실행상태·캐시·렌더링자원문제를우선조사하는근거지만,전투배치/시간진행/외부프로세스상태도달라질수있어단일원인을확정하지않는다.

| id | 실제 관측 / 의미 |
|---|---|
| BASELINE / 00:04:13.346UTC | `G.on=true,paused=false,stage=0`,nativefocus=true,hidden=false,2537×1270/DPR1,WebGL2,게임FPS235. 적47/적투사체8/플레이어투사체0. living-detail실제로드캐시20260929-86 |
| RECOVERY / 00:04:30.097~00:04:41.108UTC | 유한12.000초rAF관측2871간격,34ms초과0. 1초단위게임FPS237~239,paused=false/focus=true/hidden=false전표본. 실제게임FPS표시와rAF간격은별도로측정 |
| COUNTS | 적46→43,적투사체7→6. 사용자입력·게임옵션·세이브조작0. 이전느린전투와동일배치/스킬상태비교는아님 |
| JS HEAP | 사용량116214620→213126951→81336897B로상승후회수,끝187324184B. 짧은구간에서단조누적은아님. JS heap회수를관측했으나GPU텍스처/드라이버메모리·장시간누수부재를증명하지않음 |
| GPU LOG | Edge도구에캡처된context포함warn/error결과0. 새로고침전context상태기록없음. context loss가없었다고확대하지않음 |
| HYPOTHESIS | 페이지내렌더링상태/자원누적·반복실행또는외부환경에의해유발된페이지상태악화가후보. PC성능부족·맵디테일자체·메모리누수중하나로확정하지않음 |
| CLEANUP / EVIDENCE | 계측rAF는12초뒤취소,리스너/상주감시추가0. 원본`tmp/environment-frame-20260929/edge-after-user-reload.json`. 심한급락상태를다시포착해야원인확정가능 |

[Chrome개발자메모리진단문서](https://developer.chrome.com/docs/devtools/memory-problems)는누적되는도달가능메모리와GC상승·회수패턴을구분한다. 이번12초회복표본을장시간누수검증으로대체하지않는다.

## 다음 판단 기준

| 단계 | 기준 |
|---|---|
| 실제급락 포착 | 전투상태·nativefocus/hidden·실제draw시간·콘솔부모시각을같이기록. 과도한전수프로세스수집을줄여관측부하를통제 |
| LAPTOP / 사용자 다음검수 | 사용자가노트북에서도확인하기로함. 동일버전·맵·브라우저·그래픽설정/FPS cap과경과시간을기록하고실제viewport/DPR도명시. 같은누적저하/새로고침회복이면공통런타임·렌더링을우선추적,데스크톱만이면해당PC의GPU/브라우저/백그라운드경로를우선추적. 이는분기기준이며원인확정아님. 노트북측정은아직수행하지않음 |
| 콘솔경로 수정 | 현재근거는게임맵이아닌Codex의Windows 준비/실행경로. 생성전숨김을지원하는실제런처수정·업데이트를검토하되,외부설치파일수정·보안완화·사용자프로세스강제종료는임의실행하지않음 |
| 금지된완료판정 | 창생성후ShowWindow 숨김만으로수정완료판정하지않음. PowerShell provider시작실패와실행정책의.ps1 거부는별개로기록. ExecutionPolicy 우회0 |
| MAP FPS | pass86의맵최적화·Chrome전투검수결과는별도증거. 이번환경진단으로맵최적화완료·전체브라우저문제해결을확대선언하지않음 |

공식 [OpenAI Windows sandbox 문서](https://learn.chatgpt.com/docs/windows/windows-sandbox)는elevated모드를권장하고기본private desktop사용을설명한다. 현config는elevated. 이설명이이번setup의화면팝업차단을보장하거나해결을입증하는것은아니다. 이번진단에서는sandbox모드·권한·정책을변경하지않았다.

증거: `tmp/environment-frame-20260929/{current.json,events-registry.json,initial-processes.json,process-events.jsonl,system-samples.jsonl,summary.json,edge-frames.json,sandbox-log-excerpt.json}`. 개발용로컬파일이며외부전송0. 생산게임코드·맵아트·collision변경0. 진단시Git113Changes,타작업보존. 이기록저장만으로commit/push/배포완료를뜻하지않는다.

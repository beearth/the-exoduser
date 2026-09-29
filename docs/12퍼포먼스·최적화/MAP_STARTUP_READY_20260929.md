# 2026-09-29 시작 맵 조각별 노출 수정과 프레임 조사

사용자 보고: 최근 맵 업데이트 이후 프레임이 불안하고, 시작할 때 맵이 입혀지는 과정이 보인다. systematic-debugging으로 기존 부트·청크 경계를 확인하고 test-driven-development의 실패 검사 후 수정했다. 최근 아트 업데이트 횟수를 지속 프레임 드랍의 원인으로 단정하지 않는다.

| id / 적용 위치 | 현행 계약 |
|---|---|
| BOOT_OWNER / 두HTML | _bootLoadActive=false로 초기화. showBootLoading은 active=true/killed=false. hideBootLoading은 active=false/killed=true. _startLoop 및 loop가 active 로딩을 자동으로 닫지 않는다. 명시적 완료/에디터 초기화/부트 fatal은 종료한다. 두번째 부트에도 소유 상태 재설정 |
| FIRST_VIEW_IDS / 두HTML | _ch1StartOuterViewIds가 기존 카메라·VW/VH·줌·청크 크기로 보이는 범위+1청크 이웃을 계산하고 manifest에 존재하는 id만 반환. _preloadCh1StartOuter는 같은 목록을 요청. 본편 production은 G.mw×T/8=1000 worldpx,source core1024/bleed1/파일1026². easy-test의 기존 chunk1024 기준·줌 계약은 보존 |
| READY_GATE / 두HTML | async _prepareStartMapView. 각 HTML의7개 부트 완료 분기에서 setBootLoading(100)보다 먼저 await. stage0 기본 배경에만 준비98% 표시. 30ms마다 현재 화면 목록 재계산·프리로드 후 전부 status=ready(GPU warm 완료)인지 검사. decoded만으로 완료하지 않는다. 다른stage/보스아레나/명시적ch1StartOuter=0이면 즉시 반환 |
| FAILURE / 두HTML | 초기 목록에 error가 있거나 performance.now 기준12000ms를 넘으면 _ch1StartOuterBootFallback=true. _ch1StartOuterEnabled=false로 selected baked layer 전체를 숨기고 기존 지형·런타임 폴백으로 진행. 뒤늦은 조각 노출·무한 로딩 방지. 원화 품질을 정상 시 낮추지 않는다. 새 _prepareStartMapView 호출/페이지 재시작은 fallback=false부터 다시 준비. 플레이 중 신규 이웃 스트리밍의 실패 정책을 재설계한 변경은 아님 |
| GPU_LOCK | 기존 decode→_scheduleGpuWarm→_warmImageGpu→ready 큐 재사용. map GPU lifetime/stale batch/preserveDrawingBuffer/depth LOCK 수정 없음 |
| SAVE / GAMEPLAY | 세이브 schema·복원값·이동/충돌/몹 공격 수치 변경 없음. gate는 부트 공개 순서에만 추가. QA는 원본 스냅샷+base=/·저장쓰기/오디오 차단 사용 |

## 실제 시작 검증

Chrome의 QA 사본 CSS/render5074×1318/devicePixelRatio1/high/scale100. 이 크기는 사용자 첨부 화면의 렌더 크기다. Chrome outer2829×1447/screen5120×1440이며 명시적 viewport override를 사용했으므로 동일 OS fullscreen/Steam 실행이라고 주장하지 않는다. CDP focus emulation을 끄고 실제 focus/hidden을 기록했다.

| 표본 | 실제 관측 | 판정 |
|---|---|---|
| BEFORE | 첫 hide 시점5301.9ms,맵requests0/ready0. 첫 맵 draw12644.7ms visible16/drawn0,loading opacity0,G.on=true. 최초500 draw 중 부분 표시12회,첫 전체표시16013.4ms. 초기에24조각 요청/GPU warm최대16.7ms | 첫 draw가 비동기 요청을 시작하며 조각 준비가 플레이 뒤에 몰렸다. 실행 중 포커스/캐시/부트환경이 달라 전후 총로딩 시간 개선율을 계산하지 않음 |
| AFTER_MAIN | hide9533.3ms requests24/ready24. 첫 draw9560.6ms visible16/drawn16. 최초500 draw 부분표시0. fallback=false/active=false/on=true,첫 화면native focus=true/hidden=false | 준비 완료 후 공개 |
| AFTER_REPEAT | 로딩 실패 시험 뒤 정상 reload. 첫 draw7801.2ms visible16/drawn16,requests24/ready24,최초500부분표시0,fallback=false. 첫 draw focus=false/hidden=false | 공개 순서 검증이며 전면 FPS 표본으로 사용하지 않음 |
| AFTER_EASY | 초기 실제 hidden=true로 map-cache rAF 대기. 전면 복귀 뒤 첫 draw38002.8ms visible16/drawn16,requests24/ready24. 확인229draw 부분표시0,fallback=false,active=false,WebGL2/lost=false | 숨은 부트 대기를 성능저하로 평균하지 않음. 기존 easy-test맵 표현의 본편 아트/좌표 정합을 승인한 검사는 아님 |
| FAILURE_BROWSER | QA에서chunk_0_6 요청 하나만 CDP 차단. error1/ready23,초기fallback=true,첫drawvisible0/drawn0,loading=false/on=true. START MAP warning1. 차단 해제 후 정상reload 준비24/24복귀 | 시작을 막지 않고 selected layer가 뒤늦게 조각별로 표시되지 않음. QA 차단은 해제 |

## 준비 후 프레임과 메모리

| 항목 | 실제 관측 / 경계 |
|---|---|
| CAP60_NATIVE /10초 | 동일5074×1318/high100/WebGL2/cap60. QA 실제mkEn100 생성+기존 스폰109→134alive,플레이어 비공격·무적·rage60. draw600회=60.0FPS,mean2.421/p954.4/p996.9/max11.5ms;update600회/p951.7/max3.7ms;전체loop max13.3ms. invalid/hidden/blurred/viewportChanged 모두0 |
| MAP_COST | _drawCh1StartOuter600회 CPU mean.0367/p95.1/p99.2/max.2ms. rAF max12.5ms/34ms초과0,queue delay max8ms,long-animation-frame0. rAF약238Hz는 draw60FPS와 별도. GPU/compositor 비용 전체를 .2ms라고 보고하지 않음 |
| UNCAPPED | 최초실행 실제포커스 없음으로 즉시 거부. 전면복귀 재실행은768draw 뒤 실제blur로 중단. 완성 FPS 표본으로 사용하지 않음. 이전유효표본의87.7ms 지연 원인·장시간안정성은 여전히 미확정 |
| SYSTEM_MEMORY | 숨김 system PowerShell Get-Counter:Committed Bytes72717762560=67.7237GiB /Commit Limit82463739904=76.8003GiB,Available Bytes41388449792=38.5460GiB. 커밋점유 약88.2%,물리여유있음. Get-Process 상위Chrome private9,398,718,464B와EXODUSER4,261,363,712B를 관측했으나 Chrome PID의역할/탭 연결·프로세스별원인은 미확정. VS Code 종료나GPU loss를 OOM이라고 확정하지 않음. 사용자 프로세스 종료0 |
| CONCURRENT_ART | QA source snapshot cache81,검증 중 본편 cache82/원화 업데이트 진행. 파일의 실제 PNG는 현 디스크응답. 우리 변경으로cache/원화/숲밀도/geometry를 되돌리거나수정하지 않음. 현재소스·QA SHA는 tmp/map-startup-20260929에 기록 |

## 회귀 / 상태

| 항목 | 결과 |
|---|---|
| RED→GREEN | mapStartupReady 최초14건 모두 실패→14PASS. 로딩 재진입2건 추가 포함16PASS |
| 관련 회귀 | 부트 계측·맵 spike·viewport origin·idlebuild·GPUwarm·HUD/text/settings 등11파일54PASS. 두HTML inline script각6개 Acorn 구문PASS |
| 확대 검사 | ch1StartSmoothingPass 포함12파일69건68PASS/1FAIL. 기존 organic hill 검사에서 .ellipse 정규식이96점 현행윤곽과 충돌. 수정 전 edit-base에서도 같은1FAIL 확인. 타 작업의언덕코드·테스트는 변경하지 않음 |
| 저장 / Git | 코드2·신규테스트1·관련docs를 디스크 저장. 본편/보조QA 새페이지로 검증. .git 읽기전용·기존exec OS317로 커밋 미완료. 관련범위review checkpoint만 준비. 타 작업스테이징 보존 |
| 남음 | 이전87.7ms지연 원인,무중단장시간/스킬난사/보스/NW.js·Steam/FPS 전후비교. 이번시작버그수정을 모든프레임문제해결로승격하지 않음 |

## MAP PRODUCTION REPORT

| 항목 | 보고 |
|---|---|
| STAGE / MASTER / OUTER / LARGE / MEDIUM / GROUND / LANDMARK | CH1-1 기존 production 유지. 원화·실루엣·경로·랜드마크·충돌 제작 변경0. 신규에셋0 |
| PLAYABLE / CAMERA | START첫프레임 visible16/16 및 고정카메라 AI실행. 이동·전체8카메라·전맵 종주/전투가독성 승인 범위 아님 |
| TECH | 최초청크준비/실패/재시작/보조판확인. JS error관측0(Three중복import warning별도),유도한청크차단1회별도. 모든asset404·전청크seam/NW.js검증아님. 전투프레임표본은 위 CAP60_NATIVE한정 |
| FILES / GIT | stage-owned 아트0,공유game2/테스트1/docs. concurrent82아트/보스GLB/로비수정보존. staged수정0/commit·push·deploy미완료 |
| VISUAL VERDICT / NEXT PASS | RETOUCH. 시작의조각노출은검증했지만 전체맵/전투시각및장시간안정성미승인. 잔여지연·새영역스트리밍별도추적 |


커밋 실행 후속: 위9파일만 별도 인덱스·codex/map-startup-ready-20260929 체크포인트 브랜치에 기록하는 스크립트 실행을 승인받았다. 하지만 exec provider가 지정 system PowerShell 대신 WindowsApps pwsh.exe를 시작하다가 OS -1073283067/317로 명령 실행 전에 실패했다. Git 쓰기 실행0·커밋 미완료. tmp/map-startup-20260929/checkpoint/commit-targets는 HEAD 기반으로 이번 변경만 이식했고 신규16검사PASS를 별도 확인했다. 기존 인덱스·HEAD를 이 작업으로 변경하지 않았다. 검토 패치를 현 공유 작업트리에 무조건 적용하지 않는다.


현행 보강 — 숨은 창: _prepareStartMapView의12000ms 제한은 document.hidden=false일 때만 적용하며, visibilitychange로 다시 보이면 deadline=performance.now()+12000으로 재설정한다. 초기청크error는 숨김 여부와 관계없이 안정된폴백으로 진행한다. 성공·실패·stage변경 모든 반환에서 visibility 리스너를 finally로 제거한다. 숨은 Chrome의 타이머 제한을 실제 에셋실패로 잘못 판정하지 않는다. 두HTML 추가2검사 RED2FAIL→GREEN2PASS,신규총18PASS/관련11파일최종56PASS. 앞의16/54 및 확대69검사는 이 보강 전 기록이다.


최종 저장본 확인: visibility 보강을 포함한 QA 소스 SHA256 56ad3b4600ecfe02ce2310d2b6e479b362947031cf2bac91cab2dbb8937a8fd6에서 새로고침 후 최초500draw/부분0/visible16=drawn16/ready24/nativefocus=true/hidden=false/5074×1318/WebGL2 lost=false 확인. 최종스크린샷은 fullPage로 전체5074폭 확인. 검증 중 타 작업이 Chain Slam VFX를 계속 편집해 /game.html 전체SHA가 변했다. 본 작업의 준비함수·7개await·숨김대기보호를 디스크응답과 별도 대조하며, 새 Chain Slam VFX의 검수 결과로 확대하지 않는다. 현재실행스크립트각6개 구문PASS.


최종 정리: 서버 /game.html의 맵준비4함수SHA256 aa7e0fb9bb3fa56ead14fc9c333f8229f3ef0dab1de407a5e6c6ded5fbccf6ec는 디스크와일치. 최종HEAD기반체크포인트 신규18PASS. QA소유탭닫기·viewport override reset완료/세션잔여탭0/QANetwork차단해제. 완료검사git status163개로100미만제한은미충족(동시자산작업추가). 타작업코드·에셋을숨기거나삭제/강제커밋하지않았다. 승인된분리커밋은실행기시작실패로미완료.


### CH1_HIDDEN_UNDERLAY_20260929 — 현행 바닥 렌더 계약

완성 production_finish 화면이 전체 뷰포트를 불투명 ready청크로 덮으면 _ch1StartOuterCoversView가 가려진 _fillVoidWithFloor·20개 _oriFireflies·기존 맵캐시 분기3그룹을 렌더에서 제외한다. 매 프레임 줌/흔들림/가장자리·1026² ready를 검사하며, 로딩·오류·맵 밖 노출·다른stage/보스아레나/outer·Rootworld·초기폴백은 원래 바닥을 유지한다. ?ch1LegacyUnderlay=1은 비교용. visible 생체/언덕/소품/ATMO·19빌드레이어/이미지·충돌 삭제0. 캐시 메모리 전체해제나FPS개선율을 주장하지 않는다.

현행 공식·수치·검수는 [가려진 레이어 정리 SSOT](../4.1맵디자인+설정/CH1_HIDDEN_UNDERLAY_20260929.md)를 따른다. 앞선 날짜별 회귀·FPS·아트 수치는 당시 검수 이력이다.


### FRAME_SYSTEM_COMMIT_20260929 — Windows 가상 메모리 고갈 확인·관리 준비

| id / 적용 위치 | 현행 근거 / 상태 |
|---|---|
| SYSTEM2004 | Windows Resource-Exhaustion-Detector의SystemCommitCharge/Limit로반복고갈확인. 09-28T21:31:51.409Z=79.649582/79.761414GiB(99.8598%),GPU loss21:31:52.474Z약1.06초전. 물리여유33.929214GiB. 앞의RAM여유만으로고갈을배제하지 않음. 인과관계·탭귀속미확정 |
| PAGEFILE | 실제C custom8192/16384MiB(8/16GiB)상한. 사용자관리지시에따라32768/65536MiB(32/64GiB)조정안을준비. C여유256.770447GiB·원래값백업·관리자/설정drift/80GiBreserve검사. 자동재부팅0 |
| APPLY_STATUS | 승인된실행은exec OS317,관리자PowerShell·reg.exe RunAs는0xc0000142로시작실패. 읽기값8/16GiB그대로/아직미적용. tmp/pagefile-management-20260929의적용·복원REG_MULTI_SZ파일과백업준비. 사용자관리자적용후재부팅·활성commitlimit확인필요 |
| QA | 현재11파일77PASS/두HTML각6구문PASS. 이번새프레임표본은크기/부트조건오류및브라우저연결timeout으로폐기. 새FPS·88ms해결·VS Code원인·전체GPU수정완료를주장하지 않음. production게임코드추가변경0/타작업보존/커밋미완료 |

상세설정·실제OS이벤트·GPU카운터한계·적용파일·MAP PRODUCTION REPORT는 [Windows 커밋 고갈·페이지 파일 SSOT](FRAME_SYSTEM_COMMIT_20260929.md)를 따른다. VISUAL VERDICT RETOUCH.
